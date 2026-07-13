# OmniCMS Element Rules

## Component Choice

- Prefer `snip-*` components for portable OmniCMS snippets, page bodies, forms, CTA bands, bottom nav, FAQ, tables, stat bars, and interactive card groups.
- Prefer USF v4 components for homepage-style patterns copied from usf.edu: hero, section color system, audience gateway, buttons, arrow links, link lists, Trending cards, stat group, image grid, video grid, and events feed.
- Use third-party/generated patterns only when the target page already depends on that external system; do not rename or restyle those classes.

## Class Ownership

- Never rename or restyle non-owned classes: `button`, `card`, `section__*`, `hero__*`, `calendar-feed__*`, `c-calloutText`, `snippetButton`, `carousel`, `dialog`, `u-*`, and similar CMS/USF/third-party classes.
- When host CSS causes a documented collision, add a narrow page/section-scoped
  compatibility override while preserving the original class names and markup;
  never replace a CMS class with a local clone.
- New reusable classes must use `snip-*` and BEM shape: `snip-block`, `snip-block__element`, `snip-block--modifier`.
- Shared state classes are unprefixed: `is-active`, `is-hidden`, `is-loading`.

## OmniCMS Constraints

- Pages pasted into OmniCMS must inline CSS/JS. Do not rely on `<link rel="stylesheet">` or `<script src>` for snippet assets because OmniCMS strips them.
- Inline `snippet-template.css` when using `snip-*` components. Inline `snippet-template.js` only when using `data-snip-*` behavior.
- Wrap every inline CSS/JS block in CDATA. Any custom inline JS must be
  self-contained, DOM-ready safe, scoped to the snippet, and free of jQuery or
  external dependencies.
- In comments inside OmniCMS HTML, do not write literal angle-bracket tag names like `<input>`; use `input`.

## Behavior Rules

- `data-snip-active-group` requires `data-snip-active-item` children; optional `data-snip-info-target` needs matching `data-info` values.
- `data-snip-panel` requires `data-snip-screen` sections and `data-snip-go` / `data-snip-reset` controls.
- `form[data-snip-validate]` must also include `novalidate`.
- Form submission/network calls are page business logic; the library only dispatches `snip:validated`.

## Host-CSS collision patterns

- Neutralize broad host “owl” selectors such as `.content * + *` on stack
  children, section wrappers, and grid/card children. Let `gap`, padding, and
  component rules control spacing.
- Verify USF v4 grid spans and alignment utilities at the CMS breakpoint. If
  host rules collapse a media/text layout, keep the approved classes and add a
  scoped media-query override for the affected section.
- Approved link-list/chevron classes may already supply a pseudo-element arrow.
  Prevent duplicate arrows and duplicate dividers when adding fallback CSS;
  render one right-aligned arrow per link.
- USF animation classes can start hidden under `.js` until `animate-trigger` is
  added. Keep a visible no-JS/reduced-motion baseline and, if animation is
  desired, use a small inline vanilla-JS load/scroll trigger with no external
  runtime.
- Audit boundary spacing in CMS preview: breadcrumb-to-stats, nav-to-section,
  stylized-header-to-section, header-to-card, and CTA-to-sources.

## Replacement Planning

Before editing a target page, summarize:

- current block/selector
- chosen catalog component id
- exact dependency impact
- content to preserve
- assumptions needing user approval

Then patch one logical block at a time and re-check anchors/dependencies.

After each batch, also count-check style/script blocks, repeated component
instances, inline `data-snip-*` dependencies, and any animation classes so a
CMS save cannot silently hide content or duplicate host pseudo-elements.
