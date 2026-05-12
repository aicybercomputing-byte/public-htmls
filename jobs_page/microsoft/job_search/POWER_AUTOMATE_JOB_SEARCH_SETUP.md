# Full-Parity Microsoft Blueprint: Job Search API

Goal: match current Google Apps Script behavior with Microsoft services while keeping write paths private and API reads public.

Service account context:

- Primary automation owner: `bellini-webmaster@usf.edu`

Source parity target:

- `jobs_page/job_search/google_apps_script/appsscript.json`
- `jobs_page/job_search/google_apps_script/*.gs`

Response schema reference:

- `jobs_page/microsoft/job_search/power_automate_job_search_response_schema.json`

## 1) Recommended architecture (full parity)

Use a hybrid architecture:

1. **Power Automate** (private orchestration)
   - Scheduled ingestion and data refresh.
   - Operational notifications / retries.
2. **Azure Function HTTP API** (public read endpoint)
   - Implements `health` + `job-search` API behavior.
   - Handles validation, provider fan-out, dedupe/ranking, JSONP (optional).
3. **Azure Cache for Redis** (private cache + rate limit counters)
   - Query cache (equivalent to Apps Script CacheService).
   - Per-key hourly throttling.
4. **Azure Blob Storage** (private write, public read optional)
   - Stores snapshots and normalized provider data.
   - Function reads from blob and returns query-time filtered results.

This gives the closest parity with Apps Script semantics while remaining DLP-friendly.

## 2) Feature parity mapping (GAS -> Microsoft)

- `doGet` / `doPost` routing -> Azure Function route + method handlers.
- `action=health` -> `GET/POST /health`.
- `action=job-search` -> `GET/POST /job-search`.
- `validateJobSearchRequest` -> shared validation module in Function app.
- `assertApiKey` -> Entra app setting secret comparison or APIM subscription key.
- `checkRateLimit_` -> Redis `INCR` with 1-hour TTL.
- `CacheService` query cache -> Redis value cache (query hash key).
- Provider fan-out (`USAJOBS` + `Simplify`) -> Function service layer.
- `dedupeAndRankJobs_` + `rankAndCapResults` -> Function ranking module.
- Optional JSONP callback -> response formatter (`callback(payload);`) with strict callback regex.

## 3) Endpoint contract

## Health

- `GET /api/health`
- `POST /api/health`

Response:

```json
{"ok": true, "service": "jobs-api-azure"}
```

## Job search

- `GET /api/job-search` (query params)
- `POST /api/job-search` (JSON body)

Request shape (same as GAS):

```json
{
  "query_text": "cybersecurity",
  "location_text": "Florida",
  "min_pay": 70000,
  "employment_type": "full-time",
  "remote_mode": "hybrid",
  "limit_per_provider": 8,
  "notes": "",
  "authorization": "",
  "api_key": "OPTIONAL_KEY",
  "callback": "optionalJsonpCallback"
}
```

Response shape:

- `request_id`
- `cache_hit`
- `results[]`
- `provider_status[]`

Match `jobs_page/microsoft/job_search/power_automate_job_search_response_schema.json`.

## 4) Power Automate responsibilities

Flow: `job-search-provider-refresh`

1. Trigger: **Recurrence** (every 30 to 60 min).
2. Fetch providers:
   - USAJOBS
   - Simplify JSON feeds
3. Normalize records to common row shape.
4. Write snapshots to Blob:
   - `job-search/providers/usajobs/latest.json`
   - `job-search/providers/simplify/latest.json`
   - optional merged `job-search/snapshots/latest.json`
5. Alert on failures (Teams/email).

Flow does not serve public API traffic directly; Function does.

## 5) Security model

- Store secrets in Key Vault or Function app settings:
  - `USAJOBS_API_KEY`
  - `USAJOBS_USER_AGENT`
  - `WEBAPP_API_KEY` (if parity mode enabled)
- Restrict write access to storage and Redis via managed identity.
- If public endpoint needed, keep reads on Function only; avoid exposing write credentials.

## 6) Migration phases

## Phase A: parity scaffold

1. Create Function endpoints (`health`, `job-search`) with stub payloads.
2. Implement request validation and API key gate.
3. Add Redis-based rate limit + query cache.

## Phase B: provider parity

1. Implement USAJOBS fetch/mapping.
2. Implement Simplify feed fetch/mapping.
3. Implement dedupe/ranking/cap logic matching GAS behavior.

## Phase C: production hardening

1. Add telemetry (Application Insights).
2. Add fallback when one provider fails (partial success + provider_status error).
3. Add integration tests for key parity scenarios.

## 7) Testing parity checklist

- Health endpoint returns expected JSON.
- GET and POST search both work.
- Validation failures match current error behavior (`Bad request`, `Unauthorized`, rate-limit response).
- Cache hit toggles correctly.
- Provider failure still returns results from other provider.
- `limit_per_provider` cap behavior matches.
- JSONP callback works only for safe callback names (if enabled).

## 8) What Power Automate alone cannot fully replace

- High-fidelity request-time ranking/validation orchestration.
- Low-latency cache-aware API behavior.
- Clean JSONP support and strict callback validation.

For full parity, keep Power Automate for ingestion + operations, and use Azure Function for API runtime logic.
