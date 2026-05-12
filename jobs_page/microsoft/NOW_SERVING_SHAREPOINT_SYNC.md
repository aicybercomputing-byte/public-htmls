# now-serving SharePoint Sync (Permissions-Aligned)

This documents the now-serving asset sync model used by:

- `now-serving/sharepoint-test.py`

## Sync behavior

- App-only SharePoint authentication.
- Recursively downloads one approved SharePoint folder (images + announcements JSON).
- Runs on an hourly interval by default.

## Required environment variables

- `NOW_SERVING_SP_SITE_URL`
- `NOW_SERVING_SP_CLIENT_ID`
- `NOW_SERVING_SP_CLIENT_SECRET`
- `NOW_SERVING_SP_FOLDER_SERVER_RELATIVE_URL`

## Optional environment variables

- `NOW_SERVING_SYNC_LOCAL_DIR` (default: `./synced_assets`)
- `NOW_SERVING_SYNC_INTERVAL_SEC` (default: `3600`)

## Required permissions (minimum)

- Entra app registration for now-serving service principal.
- SharePoint app permission:
  - preferred: `Sites.Selected` + read grant on required site/library/folder.
  - fallback: `Sites.Read.All`.
- Admin consent for granted permission scope.

## Network requirements

- Outbound HTTPS to:
  - `login.microsoftonline.com`
  - `<tenant>.sharepoint.com`
