# now-serving Notes

## SharePoint sync

Use `sharepoint-test.py` for hourly folder sync of announcement assets.

Required environment variables:

- `NOW_SERVING_SP_SITE_URL`
- `NOW_SERVING_SP_CLIENT_ID`
- `NOW_SERVING_SP_CLIENT_SECRET`
- `NOW_SERVING_SP_FOLDER_SERVER_RELATIVE_URL`

Optional:

- `NOW_SERVING_SYNC_LOCAL_DIR` (default `./synced_assets`)
- `NOW_SERVING_SYNC_INTERVAL_SEC` (default `3600`)
- `NOW_SERVING_CHECKIN_SOURCE_URL` (optional URL used by `main.py`)

## Permission model

- App-only SharePoint read using Entra app credentials.
- Prefer `Sites.Selected` with read grant to only the required Bellini folder scope.
