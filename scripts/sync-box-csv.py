#!/usr/bin/env python3
"""
sync-box-csv.py
Download ai-x-events.csv from a Box shared link into the local repo.

The existing hourly push script handles git commit/push — this script
only needs to get the file on disk.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETUP (one time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Create a Box OAuth app at https://usf.app.box.com/developers/console
     New App → Custom App → Standard OAuth 2.0 (User Authentication)
   Under Configuration:
     • Add redirect URI:  http://localhost:8080/callback
     • Scopes: at minimum "Read all files and folders"
   Copy the Client ID and Client Secret.

2. Create .env.box in the repo root (already git-ignored):
     BOX_CLIENT_ID=your_client_id_here
     BOX_CLIENT_SECRET=your_client_secret_here

3. Authenticate (opens a browser — USF SSO will appear):
     python3 scripts/sync-box-csv.py --auth

4. Test a download:
     python3 scripts/sync-box-csv.py

5. Add to crontab (or call from your existing push script):
     */30 * * * * cd /path/to/public-htmls && python3 scripts/sync-box-csv.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import http.server
import json
import os
import pathlib
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser

# ── Edit these to match your setup ───────────────────────────────────────
SHARED_LINK = "https://usf.box.com/s/tzqdz0s986c91ukd2qoj6f5ukm7r89d0"
DEST        = pathlib.Path(__file__).parent.parent / "ai-x" / "ai-x-events.csv"
# ─────────────────────────────────────────────────────────────────────────

REPO_ROOT    = pathlib.Path(__file__).parent.parent
ENV_FILE     = REPO_ROOT / ".env"
TOKEN_FILE   = pathlib.Path.home() / ".box_csv_sync.json"
REDIRECT_URI = "http://localhost:8080/callback"
BOX_AUTH_URL = "https://account.box.com/api/oauth2/authorize"
BOX_TOKEN_URL = "https://api.box.com/oauth2/token"
BOX_API      = "https://api.box.com/2.0"


# ── Config loading ────────────────────────────────────────────────────────

def load_config():
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    env.update(os.environ)
    client_id     = env.get("BOX_CLIENT_ID", "")
    client_secret = env.get("BOX_CLIENT_SECRET", "")
    if not client_id or not client_secret:
        sys.exit(
            "Error: BOX_CLIENT_ID and BOX_CLIENT_SECRET are required.\n"
            f"Add them to {ENV_FILE} or export them as environment variables.\n"
            "See the setup instructions at the top of this script."
        )
    return client_id, client_secret


# ── Token storage ─────────────────────────────────────────────────────────

def load_token():
    if TOKEN_FILE.exists():
        return json.loads(TOKEN_FILE.read_text())
    return {}

def save_token(data):
    TOKEN_FILE.write_text(json.dumps(data, indent=2))
    TOKEN_FILE.chmod(0o600)


# ── OAuth helpers ─────────────────────────────────────────────────────────

def post_form(url, fields):
    data = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def get_fresh_access_token(client_id, client_secret):
    tok = load_token()
    if not tok.get("refresh_token"):
        sys.exit(
            "No stored token found. Run first:\n"
            "  python3 scripts/sync-box-csv.py --auth"
        )
    try:
        result = post_form(BOX_TOKEN_URL, {
            "grant_type":    "refresh_token",
            "refresh_token": tok["refresh_token"],
            "client_id":     client_id,
            "client_secret": client_secret,
        })
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        sys.exit(f"Token refresh failed ({e.code}): {body}\nRe-run --auth to re-authenticate.")
    save_token(result)
    return result["access_token"]


# ── First-time auth via local loopback ────────────────────────────────────

def do_auth(client_id, client_secret):
    auth_url = BOX_AUTH_URL + "?" + urllib.parse.urlencode({
        "response_type": "code",
        "client_id":     client_id,
        "redirect_uri":  REDIRECT_URI,
        "state":         f"sync_{int(time.time())}",
    })

    code_holder = []

    class CallbackHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            code_holder.append(params.get("code", [""])[0])
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<p>Auth complete &mdash; you can close this tab.</p>")

        def log_message(self, *_):
            pass

    server = http.server.HTTPServer(("localhost", 8080), CallbackHandler)
    t = threading.Thread(target=server.handle_request, daemon=True)
    t.start()

    print(f"Opening browser for Box/USF login…\n{auth_url}\n")
    webbrowser.open(auth_url)

    print("Waiting for callback on http://localhost:8080/callback …")
    t.join(timeout=120)
    server.server_close()

    if not code_holder or not code_holder[0]:
        sys.exit("No auth code received. Did the browser complete the login?")

    tok = post_form(BOX_TOKEN_URL, {
        "grant_type":    "authorization_code",
        "code":          code_holder[0],
        "client_id":     client_id,
        "client_secret": client_secret,
        "redirect_uri":  REDIRECT_URI,
    })
    save_token(tok)
    print(f"Token saved to {TOKEN_FILE}")
    print("Auth complete. Run without --auth to download the CSV.")


# ── Box API download ──────────────────────────────────────────────────────

def api_get(path, access_token, shared_link=None):
    req = urllib.request.Request(f"{BOX_API}{path}")
    req.add_header("Authorization", f"Bearer {access_token}")
    if shared_link:
        req.add_header("BoxApi", f"shared_link={shared_link}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"Box API error {e.code} on {path}: {e.read().decode()}")

def download_csv(access_token):
    # Resolve shared link to file metadata
    raw = api_get("/shared_items?fields=id,name,type", access_token, SHARED_LINK)
    meta = json.loads(raw)

    if meta.get("type") != "file":
        sys.exit(
            f"Shared link points to a '{meta.get('type')}', not a file.\n"
            "Share a direct link to the CSV file, not a folder."
        )

    file_id   = meta["id"]
    file_name = meta.get("name", "?")
    print(f"Found: {file_name}  (id={file_id})")

    # Download file content (Box follows the redirect automatically)
    req = urllib.request.Request(f"{BOX_API}/files/{file_id}/content")
    req.add_header("Authorization", f"Bearer {access_token}")
    req.add_header("BoxApi", f"shared_link={SHARED_LINK}")
    try:
        with urllib.request.urlopen(req) as r:
            content = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"Download failed ({e.code}): {e.read().decode()}")

    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_bytes(content)
    print(f"Saved  → {DEST}  ({len(content):,} bytes)")


# ── Entry point ───────────────────────────────────────────────────────────

def main():
    client_id, client_secret = load_config()

    if "--auth" in sys.argv:
        do_auth(client_id, client_secret)
        return

    access_token = get_fresh_access_token(client_id, client_secret)
    download_csv(access_token)


if __name__ == "__main__":
    main()
