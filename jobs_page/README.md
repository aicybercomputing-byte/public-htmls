# Jobs Page Folder Map

Feature-based layout:

- `jobs_page/dashboard/`
  - Dashboard stats Apps Script legacy source

- `jobs_page/events/`
  - Calendar/events Apps Script legacy source

- `jobs_page/job_search/`
  - `google_apps_script/` extracted legacy job-search `.gs` files

- `jobs_page/microsoft/`
  - `dashboard/` Power Automate dashboard setup + payload
  - `events/` Power Automate events setup + schema
  - `job_search/` parity blueprint + schema + Azure Function spec

- `jobs_page/scripts/`
  - Build/generation Python scripts for page/content workflows

- `jobs_page/index.html`
  - Main jobs page
