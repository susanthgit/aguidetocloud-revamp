"""
Bites Thumbnail Daily Uploader
================================
Uploads thumbnails to YouTube in batches of ~45/day (staying under 50 rate limit).
Tracks which videos have been uploaded in uploaded_ids.json.
Run daily until all 731 are done.

Usage: python upload_daily.py
       python upload_daily.py --dry-run    (preview what would be uploaded)
       python upload_daily.py --limit 20   (upload only 20 this run)
"""
import json
import sys
import time
import argparse
from pathlib import Path

try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    print("ERROR: google-api-python-client required. Run: pip install google-api-python-client google-auth")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
UPLOADED_FILE = SCRIPT_DIR / "uploaded_ids.json"
CREDENTIALS_DIR = Path.home() / "AppData" / "Roaming" / "npm" / "node_modules" / "youtube-channel-mcp"

DAILY_LIMIT = 700  # all remaining
DELAY_BETWEEN = 18  # 18 seconds between uploads — realistic gap to avoid burst rate limit


def load_uploaded():
    if UPLOADED_FILE.exists():
        return set(json.loads(UPLOADED_FILE.read_text(encoding="utf-8")))
    return set()


def save_uploaded(ids):
    UPLOADED_FILE.write_text(json.dumps(sorted(ids)), encoding="utf-8")


def get_all_video_ids():
    """Collect all video IDs from all *_ids.json files + scan output folder."""
    ids = set()

    # From ID files
    for f in SCRIPT_DIR.glob("*_ids.json"):
        if f.name == "uploaded_ids.json":
            continue
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            ids.update(data)
        except Exception:
            pass

    # From output folder (any PNG named as a video ID)
    for png in OUTPUT_DIR.glob("*.png"):
        vid = png.stem
        if vid and not vid.startswith("_"):
            ids.add(vid)

    return ids


def build_youtube_service():
    """Build YouTube API service from existing OAuth tokens."""
    creds_file = CREDENTIALS_DIR / "credentials.json"
    tokens_file = CREDENTIALS_DIR / "tokens.json"

    if not tokens_file.exists():
        print("ERROR: No tokens.json found. Re-authenticate first.")
        sys.exit(1)

    creds_data = json.loads(creds_file.read_text())
    tokens = json.loads(tokens_file.read_text())
    installed = creds_data["installed"]

    creds = Credentials(
        token=tokens.get("access_token"),
        refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=installed["client_id"],
        client_secret=installed["client_secret"],
    )

    return build("youtube", "v3", credentials=creds)


def main():
    parser = argparse.ArgumentParser(description="Daily thumbnail uploader")
    parser.add_argument("--dry-run", action="store_true", help="Preview without uploading")
    parser.add_argument("--limit", type=int, default=DAILY_LIMIT, help=f"Max uploads (default {DAILY_LIMIT})")
    args = parser.parse_args()

    all_ids = get_all_video_ids()
    uploaded = load_uploaded()
    pending = [vid for vid in sorted(all_ids) if vid not in uploaded and (OUTPUT_DIR / f"{vid}.png").exists()]

    print(f"\nThumbnail Upload Status")
    print(f"   Total rendered:  {len(all_ids)}")
    print(f"   Already uploaded: {len(uploaded)}")
    print(f"   Pending:          {len(pending)}")
    print(f"   This batch:       {min(len(pending), args.limit)}")
    print()

    if not pending:
        print("All thumbnails are uploaded! Nothing to do.")
        return

    batch = pending[:args.limit]

    if args.dry_run:
        print(f"DRY RUN -- would upload {len(batch)} thumbnails:")
        for vid in batch:
            print(f"   {vid}.png")
        return

    yt = build_youtube_service()

    ok = 0
    fail = 0
    rate_limited = False

    for i, vid in enumerate(batch):
        img_path = OUTPUT_DIR / f"{vid}.png"
        try:
            media = MediaFileUpload(str(img_path), mimetype="image/png")
            yt.thumbnails().set(videoId=vid, media_body=media).execute()
            ok += 1
            uploaded.add(vid)

            if ok % 10 == 0:
                print(f"  OK {ok}/{len(batch)} uploaded...")
                save_uploaded(uploaded)  # checkpoint every 10

            time.sleep(DELAY_BETWEEN)

        except Exception as e:
            err = str(e)
            if "too many thumbnails" in err.lower():
                print(f"\nRate limit hit at {ok} uploads. Saving progress and stopping.")
                rate_limited = True
                break
            else:
                print(f"  FAIL {vid}: {err[:100]}")
                fail += 1

    # Final save
    save_uploaded(uploaded)

    remaining = len(pending) - ok
    days_left = (remaining // DAILY_LIMIT) + (1 if remaining % DAILY_LIMIT else 0)

    print(f"\n{'='*50}")
    print(f"Uploaded:    {ok}")
    print(f"Failed:      {fail}")
    print(f"Remaining:   {remaining}")
    if rate_limited:
        print(f"Rate limited -- run again later")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
