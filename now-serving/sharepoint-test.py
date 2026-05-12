"""Hourly SharePoint folder sync for now-serving assets.

Required env vars:
- NOW_SERVING_SP_SITE_URL
- NOW_SERVING_SP_CLIENT_ID
- NOW_SERVING_SP_CLIENT_SECRET
- NOW_SERVING_SP_FOLDER_SERVER_RELATIVE_URL

Optional env vars:
- NOW_SERVING_SYNC_LOCAL_DIR (default: ./synced_assets)
- NOW_SERVING_SYNC_INTERVAL_SEC (default: 3600)

Permissions model:
- App-only auth via Entra app registration.
- SharePoint permission should be least privilege:
  - preferred: Sites.Selected with read grant on target site/library/folder.
  - fallback: Sites.Read.All.
"""

from __future__ import annotations

import os
import time
from pathlib import Path

from office365.runtime.auth.client_credential import ClientCredential
from office365.sharepoint.client_context import ClientContext


def get_required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def build_context() -> ClientContext:
    site_url = get_required_env("NOW_SERVING_SP_SITE_URL")
    client_id = get_required_env("NOW_SERVING_SP_CLIENT_ID")
    client_secret = get_required_env("NOW_SERVING_SP_CLIENT_SECRET")
    creds = ClientCredential(client_id, client_secret)
    return ClientContext(site_url).with_credentials(creds)


def sync_folder_recursive(
    ctx: ClientContext, server_relative_url: str, local_root: Path, base_url: str
) -> tuple[int, int]:
    folder = ctx.web.get_folder_by_server_relative_url(server_relative_url)
    folder.expand(["Files", "Folders"]).get().execute_query()

    relative = server_relative_url.replace(base_url, "", 1).lstrip("/").replace("/", os.sep)
    local_dir = local_root / relative
    local_dir.mkdir(parents=True, exist_ok=True)

    downloaded = 0
    scanned = 0
    for sp_file in folder.files:
        scanned += 1
        target = local_dir / sp_file.properties["Name"]
        with target.open("wb") as fh:
            sp_file.download(fh).execute_query()
        downloaded += 1

    for subfolder in folder.folders:
        sub_url = str(subfolder.properties.get("ServerRelativeUrl", "")).strip()
        if not sub_url:
            continue
        d, s = sync_folder_recursive(ctx, sub_url, local_root, base_url)
        downloaded += d
        scanned += s

    return downloaded, scanned


def run_once() -> None:
    folder_url = get_required_env("NOW_SERVING_SP_FOLDER_SERVER_RELATIVE_URL")
    local_dir = Path(os.getenv("NOW_SERVING_SYNC_LOCAL_DIR", "synced_assets")).resolve()
    local_dir.mkdir(parents=True, exist_ok=True)

    ctx = build_context()
    downloaded, scanned = sync_folder_recursive(ctx, folder_url, local_dir, folder_url)
    print(f"Sync complete. scanned={scanned}, downloaded={downloaded}, local_dir={local_dir}")


def main() -> int:
    interval = int(os.getenv("NOW_SERVING_SYNC_INTERVAL_SEC", "3600"))
    while True:
        try:
            run_once()
        except Exception as exc:
            print(f"sync error: {exc}")
        time.sleep(max(interval, 60))


if __name__ == "__main__":
    raise SystemExit(main())
