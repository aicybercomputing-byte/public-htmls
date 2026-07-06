# Bellini College External Website Assets

Static HTML assets for Bellini College web content.

## Live site

**[Asset index](https://aicybercomputing-byte.github.io/public-htmls/index.html)** · [GitHub Pages](https://aicybercomputing-byte.github.io/public-htmls/)

## Quick links

| Section | Entry point |
|---------|-------------|
| tCAP | [overview.html](tcap/overview.html) |
| Jobs Page | [index.html](jobs_page/index.html) |
| AI+X Events | [community-events.html](ai-x/community-events.html) |
| News carousel | [website_story.html](carosels/news/2026/website_story.html) |
| USF CMS reference | [reference/usf-cms/](reference/usf-cms/) |

## Browse locally

**[Asset index](index.html)** — expandable sections with live HTML previews.

```bash
node scripts/install-git-hooks.js   # once per clone
node scripts/generate-index.js      # manual regen
```

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
tcap/           tCAP pages (HTML)
```

## GitHub Pages

Deploys from `main` via [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Enable **Settings → Pages → GitHub Actions** once per repo.
