import json, time, sys
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials

SD = Path(__file__).parent
OUTPUT = SD / "output"
UPLOADED_FILE = SD / "uploaded_ids.json"
CREDS_DIR = Path.home() / "AppData" / "Roaming" / "npm" / "node_modules" / "youtube-channel-mcp"

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

def load_uploaded():
    if UPLOADED_FILE.exists():
        return set(json.loads(UPLOADED_FILE.read_text(encoding="utf-8")))
    return set()

def save_uploaded(ids):
    UPLOADED_FILE.write_text(json.dumps(sorted(ids)), encoding="utf-8")

def get_pending():
    uploaded = load_uploaded()
    all_pngs = {p.stem for p in OUTPUT.glob("*.png") if not p.stem.startswith("_")}
    return sorted(all_pngs - uploaded), uploaded

# Main loop — check hourly, upload when possible
while True:
    pending, uploaded = get_pending()
    if not pending:
        print(f"ALL DONE! {len(uploaded)} uploaded total.")
        sys.stdout.flush()
        break

    yt = build_yt()
    
    # Test with one upload
    vid = pending[0]
    img = OUTPUT / f"{vid}.png"
    try:
        media = MediaFileUpload(str(img), mimetype="image/png")
        yt.thumbnails.set(videoId=vid, media_body=media).execute()
        uploaded.add(vid)
        save_uploaded(uploaded)
        print(f"Quota available! Starting upload run... ({len(pending)} pending)")
        sys.stdout.flush()
    except Exception as e:
        if "quota" in str(e).lower():
            print(f"Quota still limited. {len(uploaded)} done, {len(pending)} pending. Checking again in 1h...")
            sys.stdout.flush()
            time.sleep(3600)
            continue
        elif "too many" in str(e).lower():
            print(f"Rate limited. Waiting 10 min...")
            sys.stdout.flush()
            time.sleep(600)
            continue

    # Quota is available — blast through
    ok = 1  # already did one above
    for vid in pending[1:]:
        img = OUTPUT / f"{vid}.png"
        try:
            media = MediaFileUpload(str(img), mimetype="image/png")
            yt.thumbnails().set(videoId=vid, media_body=media).execute()
            ok += 1
            uploaded.add(vid)
            if ok % 10 == 0:
                save_uploaded(uploaded)
                print(f"  OK {ok} this run ({len(pending)-ok} left)")
                sys.stdout.flush()
            time.sleep(60)
        except Exception as e:
            err = str(e)
            if "quota" in err.lower():
                print(f"Quota hit after {ok} uploads. Total: {len(uploaded)}. Waiting 1h...")
                sys.stdout.flush()
                save_uploaded(uploaded)
                time.sleep(3600)
                break
            elif "too many" in err.lower():
                print(f"Rate limit at {ok}. Waiting 10 min...")
                sys.stdout.flush()
                save_uploaded(uploaded)
                time.sleep(600)
            else:
                print(f"  FAIL {vid}: {err[:80]}")
                sys.stdout.flush()
                ok += 1  # skip this one

    save_uploaded(uploaded)
    total = len(load_uploaded())
    print(f"Run complete: {ok} uploaded this run. Total: {total}/731")
    sys.stdout.flush()
