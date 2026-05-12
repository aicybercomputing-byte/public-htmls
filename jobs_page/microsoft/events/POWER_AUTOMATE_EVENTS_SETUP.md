# Power Automate Conversion: `calandar_web_app.gs` + `events_feed.gs`

This replaces:
- `jobs_page/events/calandar_web_app.gs`
- `jobs_page/events/events_feed.gs`

with Power Automate using a publish-and-serve pattern.

Service account context:

- Flow ownership should be under `bellini-webmaster@usf.edu`.

## Recommended architecture

Because HTTP trigger/response is often blocked by DLP, split into two flows:

1. **Refresh flow (internal):** fetch RSS + iCal feeds and write `events_feed.json` to SharePoint.
2. **Serve layer (public):** your website reads the static `events_feed.json` URL.

If your new environment allows HTTP trigger/response, you can optionally add a third flow to serve health/events from a single endpoint.

---

## Flow A: Refresh events JSON (scheduled)

### Trigger
- **Recurrence** every 15 minutes (match old cache TTL ~900 sec).

### Actions
1. **Initialize variable** `all_events` (Array) = `[]`
2. **Initialize variable** `fetch_errors` (Array) = `[]`
3. **HTTP** (GET) for RSS URL
4. **Transform RSS XML to event objects**
   - Use `Compose` + `xpath()` expressions, or
   - Use an Office Script/Azure Function if easier for XML mapping.
5. **Apply to each** iCal URL
   - **HTTP** (GET) each `.ics`
   - Parse VEVENT blocks to objects (id/title/start_iso/end_iso/location/link/source/ev_type/badge_label/meta_line)
   - Append to `all_events`
   - On failure append error object to `fetch_errors`
6. **Deduplicate + sort + trim**
   - Keep only future/near-future events.
   - Sort by `start_iso`.
   - Limit to 120.
7. **Compose payload**:
   - `ok: true`
   - `events: <array>`
   - `fetch_errors: <array>`
8. **SharePoint - Create file** (first run) then **Update file** (subsequent runs)
   - Path example: `/Shared Documents/bellini-api/events_feed.json`
   - Content: stringified payload JSON

### Output format reference
- `jobs_page/microsoft/events/power_automate_events_response_schema.json`

---

## Optional Flow B: HTTP endpoint router (if allowed)

### Trigger
- **When an HTTP request is received**

### Logic
1. Read query param `action`.
2. If `action == "health"` return:
```json
{"ok": true, "service": "bellini-calendar-feed"}
```
3. If `action == "events"`:
   - Read `events_feed.json` from SharePoint
   - Return file content as `application/json`
4. Else return:
```json
{"error":"Not found"}
```

---

## Front-end wiring

Replace old Apps Script URL with the hosted JSON file URL:

`https://<tenant>.sharepoint.com/sites/<site>/Shared%20Documents/bellini-api/events_feed.json`

If your page expects query action routing, update it to read this direct JSON source.
