# Bellini College External Website Assets

Static HTML, PCF wireframes, and reference captures for Bellini College web content.

<!-- pages-deploy-start -->
**Live site:** [https://aicybercomputing-byte.github.io/public-htmls/index.html](https://aicybercomputing-byte.github.io/public-htmls/index.html)

**GitHub Pages base:** [https://aicybercomputing-byte.github.io/public-htmls/](https://aicybercomputing-byte.github.io/public-htmls/)

**Last deployed:** 2026-07-06T16:38:05.668Z · commit `044db48`
<!-- pages-deploy-end -->

## Browse locally

**[Asset index](index.html)** — expandable sections with previews. Git hooks skip `index.html` and `README.md` so deploy/readme updates do not loop.

```bash
node scripts/install-git-hooks.js   # once per clone
node scripts/generate-index.js      # manual regen
```

## Quick links

| Section | Entry point |
|---------|-------------|
| tCAP | [overview.pcf](preview.html?f=tcap%2Foverview.pcf) |
| Jobs Page | [index.html](jobs_page/index.html) |
| AI+X Events | [community-events.html](ai-x/community-events.html) |
| News carousel | [website_story.html](carosels/news/2026/website_story.html) |
| USF CMS reference | [reference/usf-cms/](reference/usf-cms/) |

## Repo layout

```
ai-x/           Event widgets and feeds
carosels/       News carousel assets
docs/           Internal reports and notes
jobs_page/      Jobs page source and automation
main-page/      Main page snippets and images
more-info/      Shared snippets
reference/      USF CMS snapshots and live page captures
scripts/        Index generator, git hooks, utilities
tcap/           tCAP wireframe pages (.pcf)
```

## GitHub Pages

Deploys from `main` via [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

1. Repo **Settings → Pages → Build and deployment → GitHub Actions**
2. Push to `main` (README-only pushes are ignored by the deploy workflow)
3. Actions updates the deploy link block in this README after each successful deploy
