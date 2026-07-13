# OmniCMS Element Rules

## Component Choice

- Prefer `snip-*` components for portable OmniCMS snippets, page bodies, forms, CTA bands, bottom nav, FAQ, tables, stat bars, and interactive card groups.
- Prefer USF v4 components for homepage-style patterns copied from usf.edu: hero, section color system, audience gateway, buttons, arrow links, link lists, Trending cards, stat group, image grid, video grid, and events feed.
- Use third-party/generated patterns only when the target page already depends on that external system; do not rename or restyle those classes.

## Class Ownership

- Never rename or restyle non-owned classes: `button`, `card`, `section__*`, `hero__*`, `calendar-feed__*`, `c-calloutText`, `snippetButton`, `carousel`, `dialog`, `u-*`, and similar CMS/USF/third-party classes.
- New reusable classes must use `snip-*` and BEM shape: `snip-block`, `snip-block__element`, `snip-block--modifier`.
- Shared state classes are unprefixed: `is-active`, `is-hidden`, `is-loading`.

## OmniCMS Constraints

- Pages pasted into OmniCMS must inline CSS/JS. Do not rely on `<link rel="stylesheet">` or `<script src>` for snippet assets because OmniCMS strips them.
- Inline `snippet-template.css` when using `snip-*` components. Inline `snippet-template.js` only when using `data-snip-*` behavior.
- Wrap inline CSS and JS in CDATA comments.
- In comments inside OmniCMS HTML, do not write literal angle-bracket tag names like `<input>`; use `input`.

## Behavior Rules

- `data-snip-active-group` requires `data-snip-active-item` children; optional `data-snip-info-target` needs matching `data-info` values.
- `data-snip-panel` requires `data-snip-screen` sections and `data-snip-go` / `data-snip-reset` controls.
- `form[data-snip-validate]` must also include `novalidate`.
- Form submission/network calls are page business logic; the library only dispatches `snip:validated`.

## Replacement Planning

Before editing a target page, summarize:

- current block/selector
- chosen catalog component id
- exact dependency impact
- content to preserve
- assumptions needing user approval

Then patch one logical block at a time and re-check anchors/dependencies.
