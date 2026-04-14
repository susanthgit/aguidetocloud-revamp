import json, time, sys
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials

SD = Path(__file__).parent
OUTPUT = SD / "output"
UPLOADED_FILE = SD / "uploaded_ids.json"
CREDS_DIR = Path.home() / "AppData" / "Roaming" / "npm" / "node_modules" / "youtube-channel-mcp"

DELAY = 60
RETRY_WAIT = 600
MAX_RETRIES = 10


def load_uploaded():
    if UPLOADED_FILE.exists():
        return set(json.loads(UPLOADED_FILE.read_text(encoding="utf-8")))
    return set()


def save_uploaded(ids):
    UPLOADED_FILE.write_text(json.dumps(sorted(ids)), encoding="utf-8")


def build_yt():
    creds_data = json.loads((CREDS_DIR / "credentials.json").read_text())
    tokens = json.loads((CREDS_DIR / "tokens.json").read_text())
    inst = creds_data["installed"]
    creds = Credentials(
        token=tokens.get("access_token"), refresh_token=tokens.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=inst["client_id"], client_secret=inst["client_secret"],
    )
    return build("youtube", "v3", credentials=creds)


def main():
    pending, uploaded = get_pending()
    hours = len(pending) * DELAY / 3600
    print(f"Pending: {len(pending)} | Uploaded: {len(uploaded)} | Delay: {DELAY}s | ETA: {hours:.1f}h")
    sys.stdout.flush()

    yt = build_yt()
    ok = 0
    fail = 0
    retries = 0

    i = 0
    while i < len(pending):
        vid = pending[i]
        img = OUTPUT / f"{vid}.png"
        try:
            media = MediaFileUpload(str(img), mimetype="image/png")
            yt.thumbnails().set(videoId=vid, media_body=media).execute()
            ok += 1
            uploaded.add(vid)
            retries = 0
            if ok % 10 == 0:
                save_uploaded(uploaded)
                print(f"  OK {ok}/{len(pending)} ({len(pending)-ok} left)")
                sys.stdout.flush()
            i += 1
            time.sleep(DELAY)
        except Exception as e:
            err = str(e)
            if "too many" in err.lower() or "quota" in err.lower():
                retries += 1
                if retries > MAX_RETRIES:
                    print(f"Max retries at {ok}. Stopping.")
                    break
                wait = RETRY_WAIT if "too many" in err.lower() else 3600
                reason = "rate limit" if "too many" in err.lower() else "API quota"
                print(f"{reason} at {ok}. Retry {retries}/{MAX_RETRIES} in {wait//60}m...")
                sys.stdout.flush()
                save_uploaded(uploaded)
                time.sleep(wait)
                yt = build_yt()
            else:
                print(f"  FAIL {vid}: {err[:100]}")
                sys.stdout.flush()
                fail += 1
                i += 1

    save_uploaded(uploaded)
    print(f"\nDone: {ok} uploaded, {fail} failed, {len(pending)-ok-fail} remaining")
    print(f"Total: {len(uploaded)}")
    sys.stdout.flush()


def get_pending():
    uploaded = load_uploaded()
    all_pngs = {p.stem for p in OUTPUT.glob("*.png") if not p.stem.startswith("_")}
    return sorted(all_pngs - uploaded), uploaded


if __name__ == "__main__":
    main()
