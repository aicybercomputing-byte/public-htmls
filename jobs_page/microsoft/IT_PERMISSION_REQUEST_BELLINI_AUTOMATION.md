# IT Permission Request: Bellini Automation (Minimum Required)

Purpose: request only the permissions required to launch:

- Jobs/events/dashboard automation (web API + flow pipeline), and
- now-serving app SharePoint file read integration.

## Minimum required (launch only)

## 1) Identity and environment

- Service account:
  - `bellini-webmaster@usf.edu` (or IT-approved equivalent)
- One dedicated Power Platform environment:
  - `Bellini-Automation-Prod`
- One dedicated Azure resource group:
  - `rg-bellini-automation-prod`

## 2) Power Automate permissions (minimum)

For `bellini-webmaster` in that environment:

- Role: `Environment Maker`
- Allowed connectors (same DLP group):
  - `HTTP` (outbound calls only)
  - `Azure Blob Storage`

Only confirm these two items:

- HTTP action can call public HTTPS APIs
- Azure Blob Storage connector can write blobs

## 2.1) now-serving SharePoint integration (minimum)

Observed dependency from `now-serving/sharepoint-test.py`:

- app-only SharePoint file download via client credential auth.
- now-serving requirement: download an entire SharePoint folder (including images + announcements JSON) every hour.

Minimum permissions needed:

- One Entra app registration for now-serving (non-user/service principal auth).
- SharePoint app permission with least privilege:
  - preferred: `Sites.Selected` + grant read access to only required Bellini site/library.
  - fallback (if `Sites.Selected` workflow unavailable): `Sites.Read.All`.
- Admin consent for the approved permission scope.
- Access scope for `Sites.Selected` grant should cover:
  - target document library
  - target folder path used for announcement assets (images + JSON)
  - recursive read/list/download for files in subfolders

No write permission requested for now-serving.

Implementation reference:

- `jobs_page/microsoft/NOW_SERVING_SHAREPOINT_SYNC.md`
- `now-serving/sharepoint-test.py`

## 3) Azure resources and minimum RBAC

Resources to create:

- Function App (public API)
- Storage Account (blob snapshots)

RBAC (least privilege):

- Function managed identity:
  - `Storage Blob Data Reader` on storage account
- Power Automate connection identity:
  - `Storage Blob Data Contributor` on storage account
- Bellini human operators:
  - `Reader` on resource group

No broader roles requested.

## 4) Network/security minimum

- Allow outbound HTTPS to:
  - `https://data.usajobs.gov`
  - `https://raw.githubusercontent.com`
  - `https://api.calendar.moderncampus.net`
  - `https://bullsconnect.usf.edu`
  - `https://login.microsoftonline.com`
  - `https://*.sharepoint.com` (or tenant-specific SharePoint host)
- Allow public GET/POST to Function routes:
  - `/api/health`
  - `/api/job-search`
- Allow CORS for Bellini origin:
  - `https://www.usf.edu`
  - (requested page path: `/ai-cybersecurity-computing`)

## 4.1) Outbound allowlist change permissions (minimum)

Please provide one of these operational models for future allowlist updates:

- Preferred: NetSec/CloudOps performs outbound allowlist changes from Bellini tickets
- Alternative: grant scoped permission to designated Bellini operator(s) to edit only the Bellini egress allowlist policy objects

Policy scope should be limited to the actual control plane in use:

- Azure Firewall policy rules, or
- NSG outbound rules, or
- enterprise proxy / secure web gateway policy

## 5) Required operational control

- Confirm service account can own production flows (not tied to an individual employee account).

---

## Not requested in minimum phase (add later only if needed)

- Redis
- Key Vault
- APIM/Front Door
- Entra app registration / OAuth scopes
- Custom domain (`api.bellini.usf.edu`)
- Teams/Outlook alerting integrations
- Extra operator admin roles

---

## Copy/paste IT request (minimum only)

Subject: Minimum Access Request - Bellini Automation Service Account and Environment

Hello IT Team,

Please provision the minimum required access for Bellini website automation.

1) Service account
- `bellini-webmaster@usf.edu` (or approved equivalent)

2) Power Platform
- Dedicated environment: `Bellini-Webmaster-Prod`
- Assign service account role: `Environment Maker`
- DLP policy in that environment allowing only:
  - HTTP connector (outbound calls)
  - Azure Blob Storage connector (blob write)

2.1) now-serving SharePoint app-only read
- Create Entra app registration for now-serving SharePoint access
- Grant least-privilege SharePoint read:
  - preferred: `Sites.Selected` and grant read to required Bellini site/library only
  - fallback: `Sites.Read.All`
- Provide admin consent
- Approve hourly folder sync use case:
  - now-serving reads and downloads all files from one approved SharePoint folder, including subfolders and their files:
  - `https://usfedu.sharepoint.com/teams/CAICC6thFloorTeamMemberUpdatesGRP/Shared Documents/General/power-automate`

3) Azure
- Resource group: `rg-bellini-webmaster-prod`
- Function App (public read API)
- Storage account for blob snapshots

RBAC:
- Function managed identity -> `Storage Blob Data Reader` on storage account
- Power Automate writer identity -> `Storage Blob Data Contributor` on storage account
- Bellini operators -> `Reader` on resource group

4) Network/security
- Outbound allowlist:
  - `data.usajobs.gov`
  - `raw.githubusercontent.com`
  - `api.calendar.moderncampus.net`
  - `bullsconnect.usf.edu`
  - `login.microsoftonline.com`
  - `<tenant>.sharepoint.com` (or equivalent USF SharePoint host)
- Outbound allowlist operations:
  - please perform allowlist updates for Bellini egress on approved tickets, or grant scoped permissions to designated Bellini operator(s) for that policy scope only
- Approve public access to:
  - `/api/health`
  - `/api/job-search`
- Configure CORS for:
  - `https://www.usf.edu`
  - (Bellini page path: `/ai-cybersecurity-computing`)

5) Ownership
- Confirm service account may own production flows.

Thank you.
