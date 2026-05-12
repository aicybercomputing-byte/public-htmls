# Power Automate Setup for Jobs Dashboard JSON

This replaces `dashboard_stats_appscript.gs` with a Power Automate cloud flow that returns the same JSON payload over HTTPS.

Service account context:

- Flow ownership should be under `bellini-webmaster@usf.edu`.

## 1) Create the flow

1. Go to [https://make.powerautomate.com](https://make.powerautomate.com).
2. Create -> **Instant cloud flow** (name it `jobs-dashboard-stats-api`).
3. For trigger, select **When an HTTP request is received**.
4. Save the flow once so Power Automate generates the trigger URL.

## 2) Add response action

1. Add a new step: **Response**.
2. Set:
   - **Status code**: `200`
   - **Headers**:
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**: paste the entire contents of `dashboard_stats_power_automate_response.json`

## 3) Test the endpoint

1. Copy the HTTP POST URL from the trigger.
2. Test with:
   - Browser (may show auth/CORS depending on tenant settings), or
   - `curl`:

```bash
curl -X POST "<your-flow-url>" -H "Content-Type: application/json" -d "{}"
```

3. Confirm the response body includes keys like `stat_bar`, `prospective_spotlight`, and `current_metro`.

## 4) Wire it into the jobs page

1. Open `jobs_page/index.html`.
2. Set `DASHBOARD_STATS_JSON_URL` to the Power Automate trigger URL.
3. If your front-end currently does a GET, switch the fetch to POST:

```js
fetch(DASHBOARD_STATS_JSON_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}"
})
```

## 5) Optional hardening

- In the trigger, add a simple shared secret check via header or body value before returning the payload.
- Restrict who can call the flow (if public access is not required).
- Track request volume with flow run history.

## Notes

- The **HTTP request trigger** is a premium connector in many Microsoft 365 tenants.
- If premium is unavailable, host `dashboard_stats_power_automate_response.json` as a static file and point `DASHBOARD_STATS_JSON_URL` to that file instead.
- For minimum-permission rollout, prefer static JSON publish via approved storage instead of inbound HTTP flow trigger.
