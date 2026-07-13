# Snippet component naming convention

Every `*.snippet.html` file in this folder (`overview`, `stages`, `faq`,
`experiential-learning`) currently reimplements the same handful of visual
patterns — a bordered card, a badge-and-label icon tile, a bottom pill nav —
under a different class name each time (`pillar-card` vs `timeline-card` vs
`stage-card` vs `journey-step` are all the same component). That made every
new page a copy-paste-and-rename job instead of a copy-paste job.

This doc defines one small, namespaced component library (`.snip-*`) that
replaces all of those one-off names. It's deliberately CMS- and
project-agnostic — the same `snippet-template.css` file can be dropped into
any OmniCMS snippet folder, on this site or another, and re-themed by
overriding a handful of CSS custom properties.

See [style-guide.html](style-guide.html) for a live, visual reference of
every component below, with copy-pasteable markup. [snippet-template.css](snippet-template.css)
is the stylesheet that drives it, [snippet-template.js](snippet-template.js)
the behaviors. [CATALOG.md](CATALOG.md) is the dense, copy-paste-first
version of this same system — point an LLM at that file to generate a new
snippet quickly.

**Scope note:** `jobs.html` has been partially migrated — its stat bar,
employer grid, recruiting grid and bottom nav now use `.snip-stat-bar`,
`.snip-grid--2`/`--3` and `.snip-nav` (with `--snip-stat-height: 175px` set
inline on that page's stat bar, since its cards are shorter than the
225px default used elsewhere). `.employer-card`/`.employer-tag` and
`.recruiting-card`/`.recruiting-link` stay local/unprefixed on purpose —
they're page-specific styling layered on the CMS theme's own
`c-calloutText`, not generic components.

Everything else in `jobs.html` / `jobs-source-context.html` is
deliberately untouched: filters, tabs, the results list, the spinner, the
live projections table with its bar chart, the events calendar, and the
job/internship match forms are all tightly coupled to page-specific JS
(`switchPanel`, `filterEvents`, `renderResults`, `updateProjections`,
`renderEventCards`, etc.) reading exact class/id names. `spotlight-grid`,
`career-grid` and `metro-grid` are static content but use bespoke
per-breakpoint responsive tuning (auto-fit columns, an asymmetric 3-over-2
span layout) that doesn't yet have a matching generic `snip-grid` variant
— folding those in is a reasonable phase 2, not attempted here.

**Sources this system is drawn from**, beyond the four original snippets:

- [more-info/more-info-snippet.html](../../more-info/more-info-snippet.html)
  — the Bellini "request info" widget (`#bellini-info-request`, `bi-*`
  classes). Contributed the panel/form/choice/success component families.
- [ai-x/community-events.html](../../ai-x/community-events.html) — an
  AI+X events list (`ce-*` classes, inside a generated `dc-runtime`
  bundle — don't hand-edit the JS, only the `<style>`/template block).
  Contributed the flip-card interaction pattern.
- `ai-x/all-events.html` and `ai-x/ai-x-past-events.html` — large,
  self-contained JS widgets that build their DOM with inline `style.cssText`
  rather than CSS classes. There's no class-based API to standardize
  against, so these are left as-is (documented, not templated) — same
  treatment as the `jobs.html` phase-2 items above.
- `carosels/news/2026/website_story.html` — a Bootstrap 3 image carousel
  embed. Every class in it (`carousel`, `item`, `carousel-control`, …) is
  owned by Bootstrap, not us — same "don't rename the CMS theme's classes"
  rule applies. Documented in the style guide as a recognized embed
  pattern, not part of the `snip-` system.
- [main-page/news-feed.html](../../main-page/news-feed.html) — the Bellini
  news widget (`.news-*`/`.bellini-*` classes). Contributed the media-card
  (image + title + summary + byline) and text-link component families.

## Rules

1. **Namespace prefix.** Every reusable class starts with `snip-`. This
   avoids collisions with the host site's own global CSS (which uses its
   own `c-`, `u-`, `header__`, etc. prefixes — don't rename or touch those,
   they're owned by the CMS theme, not this snippet system).
2. **BEM.** `snip-block`, `snip-block__element`, `snip-block--modifier`.
   One underscore-pair for elements, one double-dash for modifiers. No
   nesting past one level (`snip-card__title`, not `snip-card__body__title`).
3. **State classes are unprefixed and shared.** `is-active`, `is-hidden`,
   `is-loading` toggle behavior/appearance and are added by JS or by the
   "current page" markup. They're intentionally outside the `snip-`
   namespace because they're a generic state hook, not a component — this
   matches the convention the CMS theme itself already uses (`is-active` is
   standard BEM-adjacent state naming). `is-source` was the pre-migration
   marker the old bespoke per-page scripts used to find hoverable cards;
   `snippet-template.js` uses `data-snip-active-item` for that instead, so
   `is-source` no longer appears in migrated markup.
4. **Root scoping uses a class, not an ID.** Old snippets scoped every rule
   under a unique `#tcap-omni-{page}-root` ID, which meant the CSS had to be
   hand-edited (every selector re-prefixed) for each new page. The new
   `.snip-shell` class is the scoping boundary instead — copy the CSS
   file as-is, no find/replace needed. Give the wrapper a page-specific ID
   *in addition* to the class only if you need it as a JS/anchor target:
   `<div id="tcap-stages-root" class="snip-shell">`.
5. **Theme via custom properties, not overrides.** Colors, fonts, and the
   max content width are CSS custom properties defined once on `:root`
   (`--snip-brand`, `--snip-font-display`, etc.) — not on `.snip-shell`,
   because several components (`.snip-cta`, `.snip-panel`, `.snip-event`)
   are deliberately rendered outside any `.snip-shell`. A new project
   reskins by redeclaring these on `:root`, not by rewriting component
   rules. Redeclare them on a narrower ancestor instead if you need one
   section of a page themed differently.
6. **One component, one name — vary with a modifier, not a rename.** If two
   things are visually the same shape (a centered icon tile, a bordered
   card), they get the same base class. Don't invent `pathway-card` where
   `snip-card--icon` already exists.
7. **Components can live outside `.snip-shell` freely.** `.snip-cta` (needs
   a full-bleed background), `.snip-panel` (a standalone widget, not page
   content) and `.snip-event`/`.snip-flip-btn` (embedded widgets) are all
   rendered without a `.snip-shell` ancestor. This works because the theme
   custom properties live on `:root` (see rule 5), not on `.snip-shell` —
   so don't move them back to `.snip-shell` only, or every component that
   isn't nested inside one will silently lose its colors.

## Component inventory

| Component | Class(es) | Replaces (old ad-hoc names) |
|---|---|---|
| Shell / scope root | `.snip-shell` | `#tcap-omni-{page}-root` |
| Vertical stack | `.snip-stack` | `.wf` |
| Section heading | `.snip-heading`, `__title`, `__text` | `.section-header` |
| Grid | `.snip-grid`, `--1/--2/--3/--4`, `--tight` | `.intro-grid`, `.pillars-grid`, `.journey-grid`, `.pathway-grid`, `.timeline-grid`, `.stage-list` |
| Card (base) | `.snip-card` | — |
| Card — text callout | `.snip-card--callout` | `.callout`, `.pillar-card` |
| Card — numbered step | `.snip-card--step` | `.stage-card` |
| Card — icon tile | `.snip-card--icon`, `--solid`, `--interactive` | `.timeline-card`, `.pathway-card`, `.journey-step` |
| Card — media tile | `.snip-card--media`, `__media`, `__meta`, `__meta-date` | `.news-card`, `.news-image*`, `.bellini_newsItem_*` |
| Card badge (circle) | `.snip-card__badge` | `.stage-num`, `.pathway-badge`, `.journey-num`, `.timeline-num` |
| Card bare number | `.snip-card__num` | (journey-step's inline number) |
| Card title | `.snip-card__title` | `.pillar-title`, `.pathway-label`, `.journey-title`, `.news-title` |
| Card body text | `.snip-card__body` | (bare `<p>` in callout/stage cards), `.news-summary` |
| Text link | `.snip-link` | `.bellini-news-link` |
| Stat bar | `.snip-stat-bar` | `.stat-bar` (wraps the CMS's own `c-calloutText`) |
| Source citation (inline, per-stat) | `.snip-source`, `__text` | `.all-sources`, `.all-sources-text` |
| Sources & disclaimers panel (end-of-page, aggregated) | `.snip-sources`, `__title`, `__list`, `__text` | `.all-sources` (heading+list+text variant) |
| CTA band | `.snip-cta`, `__inner` | `.cta-band`, `.cta-band-inner` |
| Bottom pill nav | `.snip-nav`, `__link` | `.wf-nav` |
| FAQ group | `.snip-faq`, `__title`, `__list` | `.faq-category`, `.faq-list` |
| Comparison table | `.snip-table`, `__row`, `--head`, `__cell` | `.req-table`, `.req-row`, `.head` |
| Note / aside | `.snip-note`, `--soft` | `.info-box`, `.soft-note` |
| Panel (standalone widget shell) | `.snip-panel`, `__pad`, `__band`, `__body`, `__title`, `__subtitle` | `.bi-shell`, `.bi-header`/`.bi-form-header`, `.bi-title`/`.bi-form-title`, `.bi-subtitle` |
| Eyebrow label (on dark band) | `.snip-kicker` | `.bi-kicker` |
| Section label (on light body) | `.snip-section-label` | `.bi-section-label` |
| Back link | `.snip-back` | `.bi-back` |
| Choice row | `.snip-choice-stack`, `.snip-choice`, `__title`, `__desc`, `__arrow` | `.bi-choice-stack`, `.bi-choice-button`, `.bi-choice-title`, `.bi-choice-desc`, `.bi-choice-arrow` |
| Form field | `.snip-field`, `--tight`, `.snip-label`, `.snip-required`, `.snip-input`, `--invalid`, `__error` | `.bi-field`/`.bi-field-tight`, bare `label`, `.bi-required`, bare `input`/`select`, `.bi-invalid`, `.bi-error` |
| Address grid (2fr/1fr/1fr) | `.snip-grid--address` | `.bi-grid-address` |
| Error banner | `.snip-banner--error` | `.bi-submit-error` |
| Divider | `.snip-divider` | `.bi-divider` |
| Visually hidden (honeypot etc.) | `.snip-visually-hidden` | `.bi-your-website-here` |
| Consent row | `.snip-consent-row` | `.bi-consent-row` |
| Form button | `.snip-btn`, `--primary`, `--secondary` | `.bi-submit`, `.bi-again` |
| Success state | `.snip-success`, `__icon`, `__title`, `__text` | `.bi-thanks-body`, `.bi-check`, `.bi-thanks-title`, `.bi-thanks-text` |
| Event row w/ flip badge | `.snip-event`, `__badge`, `__badge-inner`, `__face--front/back`, `__title` | `.ce-event`, `.ce-flip`, `.ce-flip-inner`, `.ce-face-front/back`, `.ce-title` |
| Flip button | `.snip-flip-btn`, `__inner`, `__face--front/back` | `.ce-btn`, `.ce-btn-inner`, `.ce-btn-face-front/back` |

State classes (unprefixed, unchanged): `is-active`, `is-hidden`, `is-loading`.
(`is-source` is legacy — see rule 3 above.)

## Behaviors (snippet-template.js)

Interactions are opt-in and driven entirely by `data-snip-*` attributes —
include the script once, add the attributes to your markup, and there's no
per-page JS to write for the common cases below. Full contract in
`snippet-template.js`'s own header comments; summary here:

| Behavior | Attributes | What it does |
|---|---|---|
| Active group | `data-snip-active-group` (container), `data-snip-active-item` (each child) | Hover/tap/click marks one item `.is-active` at a time; clears on mouseleave. Powers `.snip-card--step`/`--icon` hover states. |
| + info panel | add `data-snip-info-target="#id"` to the container, `data-info="…"` to each item | Also writes the active item's `data-info` into the target element; restores its original text when nothing's active. |
| Panel flow | `data-snip-panel` (root), `data-snip-screen="name"` (each screen), `data-snip-go="name"` (nav buttons), `data-snip-reset` (reset buttons), optional `data-snip-initial="name"` on the root | Shows one screen at a time via `.is-hidden`; reset re-shows the initial screen and calls `form.reset()` on every form inside. |
| Form validation | `<form data-snip-validate novalidate>`, native `required`/`type=email` etc. on each `.snip-input`, optional `data-snip-error-for="fieldName"` on a `.snip-field__error` to target it explicitly (else the nearest one in the same `.snip-field` is used), `data-snip-honeypot` on a bot-trap field | Uses the browser's built-in constraint validation — no hand-rolled regex. On submit: blocks and shows inline errors if anything's invalid; otherwise dispatches a `snip:validated` CustomEvent (`detail: { data, honeypot }`) on the form and does **not** submit anywhere itself. |

**`novalidate` is required on every `data-snip-validate` form.** Without it,
the browser's own validation UI intercepts the submit before this script's
listener runs — fields still get focused, but you get none of this
library's inline `.snip-field__error` text or the `snip:validated` event.
(Caught by testing the style guide's own demo — it was missing at first.)

**Submission is deliberately not this library's job.** The actual network
call (endpoint, payload shape, success/redirect behavior) is business logic
that differs per form — listen for `snip:validated` and do it yourself:

```js
form.addEventListener('snip:validated', function (e) {
  if (e.detail.honeypot) return; // bot trap tripped — treat as success, don't submit
  Snip.setSubmitting(form, true);
  fetch(yourEndpoint, { method: 'POST', body: JSON.stringify(e.detail.data) })
    .then(function () { /* show your thanks screen */ })
    .catch(function () { Snip.setBanner(form, 'Something went wrong — try again.'); })
    .finally(function () { Snip.setSubmitting(form, false); });
});
```

`window.Snip` exposes two helpers for that listener: `setBanner(form, message)`
(shows/hides the form's `.snip-banner--error`, empty string hides it) and
`setSubmitting(form, bool)` (disables the submit button and toggles `.is-loading`
on the form while a request is in flight).

Note: the form/panel components deliberately use explicit classes
(`.snip-label`, `.snip-input`) instead of the original's bare-tag selectors
(`label`, `input[type="text"]`). Bare tag selectors aren't safe to reuse on
an arbitrary host page — the next project's own `<label>` styling would
collide with them silently. This is the one intentional behavior change
from the source widget, not just a rename.

## Adopting this in a new snippet

1. **Inline `snippet-template.css` (and `snippet-template.js` if you use any
   `data-snip-*` behaviors) in a `<style>`/`<script>` block — do not use
   `<link>`/`<script src>`.** OmniCMS strips external `<link>` and
   `<script src>` tags on save, so a linked stylesheet works in local/GitHub
   Pages preview but silently disappears once pasted into the CMS, leaving
   every `.snip-*` class unstyled. `jobs.html` and the four `*.snippet.html`
   files each carry their own inlined copy for exactly this reason — when you
   change `snippet-template.css`/`.js`, copy the change into each file's
   inlined block too, using the exact template below.
2. Wrap your content in `<div class="snip-shell"><div class="snip-stack">…</div></div>`.
3. Build sections out of the table above. Copy markup straight from
   `style-guide.html` rather than writing new CSS.
4. Only reach for a one-off class when nothing above fits — and if you do,
   consider whether it should become a new `.snip-*` component instead.
5. **Every page ends with a `.snip-sources` panel, placed after `.snip-nav`,
   even if it has nothing to cite yet.** This is the one place a reader
   looks for "where did these numbers/claims come from" — don't scatter
   `<ol class="snip-sources__list">`/`__text` citations or disclaimers
   mid-page instead. If a page cites the same stat-bar numbers as another
   page, list them there too (each `.snip-sources` panel should cover
   everything displayed on *that* page, not just what's unique to it). An
   empty panel (heading only, no `__list`/`__text`) is fine for a page with
   nothing to disclose yet — keep the section so the page shape stays
   consistent and there's an obvious place to add a citation later.

### OmniCMS XML-parsing gotchas (read before touching any inlined `<style>`/`<script>`)

OmniCMS runs pasted page content through a strict SAX/XML transform, **not**
an HTML5 parser. It does not treat `<style>`/`<script>` content as CDATA the
way browsers do, so it re-parses whatever text is inside them as if it were
markup. Two consequences, both of which have caused real
`TRANSFORM_ERROR: The element type "…" must be terminated by the matching
end-tag` failures on save:

- **Any bare `<word>` inside a CSS/JS comment is read as an unclosed tag.**
  A doc comment like `` /* styles its own <label>/<input> */ `` breaks the
  parser exactly like real unclosed markup would. Don't write bare
  `<tagname>` in comments inside an inlined `<style>`/`<script>` block — use
  backticks without angle brackets instead (`` `label`/`input` ``, not
  `` `<label>`/`<input>` ``), or a placeholder like `{fieldName}` instead of
  `<name>`.
- **Always wrap the whole inlined block in a CDATA section**, hidden from
  the CSS/JS engine behind a comment so it doesn't affect actual styling or
  behavior:
  ```html
  <style>
  /*<![CDATA[*/
  ...css...
  /*]]>*/
  </style>
  <script>
  //<![CDATA[
  ...js...
  //]]>
  </script>
  ```
  This is the standard XHTML trick for embedding code containing `<`/`&`
  inside a strict XML document — it tells the parser to stop looking for
  markup until the matching `]]>`, so future edits that introduce a stray
  `<`/`&` (in an example, a comment, a `[data-foo="<bar>"]` selector, etc.)
  fail safe instead of breaking the next CMS save. `jobs.html`'s own
  pre-existing script was already using this pattern before the four
  snippet files were — that's independent confirmation OmniCMS needs it.
  Every inlined block in this folder must have it; don't remove it "to
  simplify."

## Migrating the existing four snippets

Not done as part of this pass (risk of visual regression on published
pages without a review cycle). The mapping table above is what a future
migration would follow 1:1 — each old class has exactly one new-system
equivalent.
