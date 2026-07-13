# Component catalog

Reference for generating new OmniCMS snippets from the `snip-` component
system. Written for an LLM to read once and then compose new pages by
copy-pasting and recombining the blocks below — not prose to summarize.

Full rules: [NAMING-CONVENTIONS.md](NAMING-CONVENTIONS.md). Live, clickable
version of everything here: [style-guide.html](style-guide.html) (open it
and use "View markup" on any example — that markup is auto-extracted from
the live DOM, so it's always exactly correct; treat it as more
authoritative than this file if the two ever disagree).

## Quick start

**Never use `<link rel="stylesheet">`/`<script src>` to pull in
`snippet-template.css`/`.js` on a page that gets pasted into OmniCMS** — the
CMS strips external `<link>`/`<script src>` tags on save, silently leaving
every `.snip-*` class unstyled and every `data-snip-*` behavior dead. Copy
the full contents of `snippet-template.css` (and `snippet-template.js`, if
you use any `data-snip-*` behavior) inline instead, once each, near the top
of the page, each wrapped in a CDATA section (required — see
`NAMING-CONVENTIONS.md` → "OmniCMS XML-parsing gotchas" for why):

```html
<style>
/*<![CDATA[*/
...paste the full contents of snippet-template.css here...
/*]]>*/
</style>
<script>
//<![CDATA[
...paste the full contents of snippet-template.js here, only if this page uses data-snip-* behaviors...
//]]>
</script>
```

When you copy an example from `style-guide.html` or this file into a new
page's inlined comment block, never leave a bare `<tagname>` in a comment
(e.g. `` `<input>` ``) — OmniCMS's parser reads it as unclosed markup. Use
backticks without angle brackets instead (`` `input` ``).

Then compose a page from the blocks below inside a shell:

```html
<div class="snip-shell">
  <div class="snip-stack">
    <!-- one block per section, in source order -->
  </div>
</div>
```

`.snip-cta`, `.snip-panel`, `.snip-event`/`.snip-flip-btn` are the exceptions
— render those *outside* `.snip-shell` (see their entries below for why).

## Rules an LLM generating markup must follow

1. Every reusable class is prefixed `snip-`. Never invent an unprefixed
   class for something structural — find the matching component below, or
   compose one from `.snip-card` + modifiers first.
2. Never rename or restyle a class you didn't invent — anything not
   prefixed `snip-` (`c-calloutText`, `stylized-header`, `header__*`,
   `snippetButton`, `carousel`, …) belongs to the CMS theme or a
   third-party library. Use it as-is, don't touch its CSS.
3. State is communicated with unprefixed classes toggled by JS:
   `is-active`, `is-hidden`, `is-loading`. Don't add a new
   `snip-` modifier where a state class already does the job.
4. Any `<form data-snip-validate>` MUST also have `novalidate` on it, or
   the browser's own validation UI intercepts the submit before
   `snippet-template.js` ever sees it.
5. Theme colors/fonts are CSS custom properties on `:root` (see table
   below) — reference `var(--snip-brand)` etc., never hardcode a hex value
   that already has a token.
6. If nothing below fits, don't force it — a genuinely new one-off is
   fine, but name it with the `snip-` prefix and BEM (`snip-thing__part`),
   and consider whether it should be proposed back into this catalog.

## CMS preview hardening

The OmniCMS host page may add broad owl margins, override USF responsive grid
utilities, or render link-list pseudo-elements and animation states of its own.
Keep the approved classes and markup, but use narrow section-scoped compatibility
rules when needed:

- reset wrapper/child top margins and use `gap` for intentional spacing;
- verify media/text grid spans at the actual CMS breakpoint;
- keep one right-aligned chevron and one divider per link;
- keep animated content visible without JS or when reduced motion is requested;
- use only self-contained, CDATA-wrapped vanilla JS for optional progressive
  enhancement; never depend on jQuery or external script URLs;
- recheck breadcrumb/stats, nav/section, stylized-header/card, and CTA/sources
  boundaries after each CMS preview.

## Theme tokens (`:root`, override to reskin)

| Token | Default | Use |
|---|---|---|
| `--snip-brand` | `#006747` | primary brand color (buttons, links, headings) |
| `--snip-brand-dark` | `#004c35` | hover/focus state of brand color |
| `--snip-gold` | `#cfc493` | accent border (panel band, event badge back) |
| `--snip-heading` | `#3f565e` | `.snip-heading__title` color |
| `--snip-text` | `#3f3f3f` | body copy |
| `--snip-text-muted` | `#333333` | captions/citations |
| `--snip-ink` | `#1c211f` | high-contrast text in forms/panels |
| `--snip-muted` | `#5b6661` | secondary text in forms/panels |
| `--snip-surface` | `#efeff0` | card/panel-band-adjacent fill |
| `--snip-surface-alt` | `#ffffff` | white surfaces (inputs, panel body) |
| `--snip-surface-hover` | `#d9e8e4` | interactive card hover fill |
| `--snip-border` | `#b2b2b2` | default border |
| `--snip-border-soft` | `#d8d6cd` | nav top rule |
| `--snip-border-dashed` | `#8a8a82` | `.snip-note--soft` border |
| `--snip-focus` | `#005432` | focus outline |
| `--snip-danger` / `-bg` / `-border` / `-text` | `#b3261e` / `#fdeceb` / `#f3c4c0` / `#8c1d18` | error states |
| `--snip-success` / `-bg` | `#1e7a52` / `#e8f5ee` | success states |
| `--snip-font-display` | `"Barlow Condensed", sans-serif` | headings/labels |
| `--snip-max-width` | `900px` | `.snip-shell` content width |

## Behaviors quick reference

See `NAMING-CONVENTIONS.md` → "Behaviors" for the full contract. In short:
`data-snip-active-group` + `data-snip-active-item` (roving hover state,
optionally `data-snip-info-target` + `data-info` for a linked info panel);
`data-snip-panel` + `data-snip-screen` + `data-snip-go` + `data-snip-reset`
(multi-screen flow); `data-snip-validate novalidate` + native `required`
etc. (form validation, emits `snip:validated` — submission itself is your
code, via `Snip.setBanner`/`Snip.setSubmitting`).

---

## Layout primitives

### Shell + stack — every snippet's outer wrapper
```html
<div class="snip-shell">
  <div class="snip-stack">
    <!-- sections here, spacing comes from gap, not margin -->
  </div>
</div>
```

### Section heading — centered intro above a section
```html
<div class="snip-heading">
  <h2 class="snip-heading__title">Section Title</h2>
  <p class="snip-heading__text">One or two sentences describing this section.</p>
</div>
```

### Grid — pick a column count, or `--tight` for a hairline-gap strip
```html
<div class="snip-grid snip-grid--2">...</div>   <!-- also --1, --3, --4 -->
<div class="snip-grid snip-grid--4 snip-grid--tight">...</div>
```

---

## Cards

### Callout card — bordered box, left-aligned title + body
```html
<div class="snip-card snip-card--callout">
  <h3 class="snip-card__title">Title</h3>
  <p class="snip-card__body">Body copy.</p>
</div>
```
Centered/link variant (add `snip-card--center`, wrap in `<a>`):
```html
<a class="snip-card snip-card--callout snip-card--center" href="#">
  <p class="snip-card__title">Title</p>
  <p class="snip-card__body">Body copy.</p>
</a>
```

### Step card — numbered badge beside content, for ordered processes
Wrap a group in `.snip-grid.snip-grid--1` with `data-snip-active-group` for
roving hover-highlight (each card needs `data-snip-active-item`):
```html
<div class="snip-grid snip-grid--1" data-snip-active-group>
  <div class="snip-card snip-card--step snip-card--interactive" data-snip-active-item>
    <div class="snip-card__badge">1</div>
    <div>
      <h3 class="snip-card__title">Step title</h3>
      <p class="snip-card__body">Step description.</p>
    </div>
  </div>
  <!-- repeat, badge 2, 3, ... -->
</div>
```

### Icon card — centered badge/label tile, for a grid of options
Optionally drives a linked info panel — add `data-snip-info-target="#id"`
to the group and `data-info="…"` to each item:
```html
<div class="snip-grid snip-grid--4" data-snip-active-group data-snip-info-target="#info-box">
  <div class="snip-card snip-card--icon snip-card--interactive" data-snip-active-item data-info="Longer detail text.">
    <span class="snip-card__badge">IN</span>
    <div class="snip-card__title">Label</div>
  </div>
  <!-- repeat -->
</div>
<p class="snip-note" id="info-box">Hover to see more info</p>
```
Always-on solid variant (no group/JS needed, just a link strip):
```html
<div class="snip-grid snip-grid--4 snip-grid--tight">
  <a class="snip-card snip-card--icon snip-card--solid" href="#">
    <span class="snip-card__num">01</span>
    <span class="snip-card__title">Label</span>
  </a>
  <!-- repeat -->
</div>
```

### Media card — image-topped article/news card, in a `.snip-grid--3`
```html
<div class="snip-grid snip-grid--3">
  <article class="snip-card snip-card--media">
    <a class="snip-card__media" href="#" aria-label="Headline">
      <img src="photo.jpg" alt="">
    </a>
    <h3 class="snip-card__title"><a href="#">Headline goes here</a></h3>
    <p class="snip-card__body">One or two sentences of summary copy.</p>
    <p class="snip-card__meta">
      <span class="snip-card__meta-date">July 9, 2026</span>
      <a class="snip-link" href="#">Category</a>, <a class="snip-link" href="#">Second category</a>
    </p>
  </article>
  <!-- repeat -->
</div>
```

### Text link — inline brand-colored link, underlines on hover/focus only
```html
<a class="snip-link" href="#">Link text</a>
```

---

## Stat bar — 4-up stat callouts (wraps the CMS theme's own `c-calloutText`)
```html
<div class="snip-stat-bar">
  <div class="c-calloutText c-calloutText--gray" style="height: 200px !important;">
    <h3 class="c-calloutText_heading">+17.9%</h3>
    <div class="c-calloutText_text">Stat description
      <section class="snip-source">
        <p class="snip-source__text">Source citation.</p>
      </section>
    </div>
  </div>
  <!-- repeat, up to 4 -->
</div>
```

## CTA band — full-bleed background band (render OUTSIDE `.snip-shell`)
```html
<div class="snip-cta">
  <div class="snip-cta__inner">
    <a class="snippetButton" href="#">Call to action</a>
  </div>
</div>
```

## Bottom pill nav — equal-width page-to-page nav, one current-page pill
```html
<div class="snip-nav">
  <a class="snip-nav__link" href="page-a.html">Page A</a>
  <span class="snip-nav__link is-active">Page B</span>
  <a class="snip-nav__link" href="page-c.html">Page C</a>
</div>
```

## Sources & disclaimers panel — end-of-page aggregate, always placed AFTER `.snip-nav`
Every page gets one, even if empty. It must list every citation/disclaimer
for whatever the page actually displays — not just what's unique to that
page (e.g. two pages sharing the same stat bar both list the same sources).
`__list`/`__text` are each optional (omit whichever doesn't apply); leave
both out entirely for a page with nothing to disclose yet.
```html
<section class="snip-sources" aria-labelledby="page-sources-heading">
  <h4 id="page-sources-heading" class="snip-sources__title">Sources</h4>
  <ol class="snip-sources__list">
    <li>Citation one.</li>
    <li>Citation two.</li>
  </ol>
  <p class="snip-sources__text">Disclaimer paragraph.</p>
</section>
```

## FAQ group — labeled category of native `<details>`
```html
<div class="snip-faq">
  <h3 class="snip-faq__title">Category name</h3>
  <div class="snip-faq__list">
    <details>
      <summary>Question?</summary>
      <p>Answer.</p>
    </details>
    <!-- repeat -->
  </div>
</div>
```

## Comparison table — CSS-grid rows, no `<table>` markup
```html
<div class="snip-table">
  <div class="snip-table__row snip-table__row--head">
    <div class="snip-table__cell">Col A</div>
    <div class="snip-table__cell">Col B</div>
    <div class="snip-table__cell">Col C</div>
  </div>
  <div class="snip-table__row">
    <div class="snip-table__cell">…</div>
    <div class="snip-table__cell">…</div>
    <div class="snip-table__cell">…</div>
  </div>
</div>
```

## Note / aside
```html
<div class="snip-note">Plain note.</div>
<div class="snip-note snip-note--soft">Provisional/in-progress note (dashed border).</div>
```

---

## Panel & form (render OUTSIDE `.snip-shell` — it's a standalone widget)

Full multi-screen widget (choose → form → success). Copy the whole block
and edit copy/fields; the `data-snip-*` attributes are what make it work —
see `style-guide.html` → "Panel & form" for the exact, tested markup this
block is drawn from.

```html
<div class="snip-panel" data-snip-panel data-snip-initial="choose">

  <section data-snip-screen="choose">
    <div class="snip-panel__band snip-panel__pad">
      <p class="snip-kicker">Eyebrow label</p>
      <h2 class="snip-panel__title">Panel title</h2>
      <p class="snip-panel__subtitle">One-line description.</p>
    </div>
    <div class="snip-panel__body snip-panel__pad">
      <p class="snip-section-label">Choose one</p>
      <div class="snip-choice-stack">
        <button class="snip-choice" type="button" data-snip-go="form">
          <span>
            <span class="snip-choice__title">Option title</span>
            <span class="snip-choice__desc">Option description</span>
          </span>
          <span class="snip-choice__arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  </section>

  <section data-snip-screen="form" class="is-hidden">
    <form data-snip-validate novalidate id="my-form">
      <div class="snip-panel__band snip-panel__pad">
        <button class="snip-back" type="button" data-snip-go="choose">&larr; Back</button>
        <p class="snip-kicker">Eyebrow label</p>
        <h2 class="snip-panel__title">Tell us about you</h2>
      </div>
      <div class="snip-panel__body snip-panel__pad">
        <div class="snip-banner--error" style="display:none;"></div>
        <div class="snip-grid snip-grid--2">
          <div class="snip-field">
            <label class="snip-label" for="f-first">First name<span class="snip-required"> *</span></label>
            <input class="snip-input" id="f-first" name="first_name" type="text" required>
            <div class="snip-field__error" data-snip-error-for="first_name"></div>
          </div>
          <div class="snip-field">
            <label class="snip-label" for="f-last">Last name<span class="snip-required"> *</span></label>
            <input class="snip-input" id="f-last" name="last_name" type="text" required>
            <div class="snip-field__error" data-snip-error-for="last_name"></div>
          </div>
        </div>
        <!-- honeypot: keep name generic, never surface it visually -->
        <div class="snip-visually-hidden">
          <label for="f-website">Website</label>
          <input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off" data-snip-honeypot>
        </div>
        <div class="snip-consent-row">
          <input id="f-consent" name="consent" type="checkbox" required>
          <label for="f-consent">Consent copy with a <a href="#">privacy notice</a> link.*</label>
        </div>
        <button class="snip-btn snip-btn--primary" type="submit">Submit</button>
        <p class="snip-required-note">Fields marked * are required.</p>
      </div>
    </form>
  </section>

  <section data-snip-screen="thanks" class="is-hidden">
    <div class="snip-panel__band snip-panel__pad">
      <p class="snip-kicker">Eyebrow label</p>
    </div>
    <div class="snip-success snip-panel__pad">
      <div class="snip-success__icon" aria-hidden="true"><span>&#10003;</span></div>
      <h2 class="snip-success__title">Thank you!</h2>
      <p class="snip-success__text">Confirmation copy.</p>
      <button class="snip-btn snip-btn--secondary" type="button" data-snip-reset>Start over</button>
    </div>
  </section>

</div>
```

Wire the actual submission (this library only validates, it never sends
anything):
```html
<script>
document.getElementById('my-form').addEventListener('snip:validated', function (e) {
  if (e.detail.honeypot) return; // bot trap — pretend it worked, don't submit
  Snip.setSubmitting(e.target, true);
  fetch('YOUR_ENDPOINT', { method: 'POST', body: JSON.stringify(e.detail.data) })
    .then(function () {
      document.querySelectorAll('[data-snip-screen]').forEach(function (s) {
        s.classList.toggle('is-hidden', s.getAttribute('data-snip-screen') !== 'thanks');
      });
    })
    .catch(function () { Snip.setBanner(e.target, 'Something went wrong — try again.'); })
    .finally(function () { Snip.setSubmitting(e.target, false); });
});
</script>
```

Address-row variant (2fr/1fr/1fr): swap a `.snip-grid.snip-grid--2` for
`.snip-grid--address` with 3 fields (city/state/zip). Optional-fields
section: wrap in `.snip-divider` with a `.snip-section-label` heading.

---

## Flip card (render OUTSIDE `.snip-shell`)

### Event row — hover anywhere in the row flips the date badge
```html
<a class="snip-event" href="#">
  <div class="snip-event__badge">
    <div class="snip-event__badge-inner">
      <div class="snip-event__face snip-event__face--front">
        <span>MAR</span><span>14</span>
      </div>
      <div class="snip-event__face snip-event__face--back">
        <span>MAR</span><span>14</span>
      </div>
    </div>
  </div>
  <p class="snip-event__title">Event title</p>
</a>
```

### Flip button — flips itself on hover
```html
<a class="snip-flip-btn" href="#">
  <div class="snip-flip-btn__inner">
    <div class="snip-flip-btn__face snip-flip-btn__face--front">Label</div>
    <div class="snip-flip-btn__face snip-flip-btn__face--back">Label</div>
  </div>
</a>
```

---

## Out of scope — don't template these, use verbatim if copying from source

- **`jobs.html` bespoke pieces** (filters, results list, tabs, spinner, bar
  chart) — not yet folded into `snip-`, treat as its own system.
- **Bootstrap carousels** (`carosels/news/…/website_story.html`) — every
  class belongs to Bootstrap; embed via its CDN as-is.
- **JS-generated widgets with no class API** (`ai-x/all-events.html`,
  `ai-x/ai-x-past-events.html`) — built from inline `style.cssText`, nothing
  to standardize against.
- **CMS theme classes** (`c-calloutText`, `stylized-header*`, `header__*`,
  `footer__*`, `snippetButton`, `u-*`) — used *inside* several components
  above (stat bar, CTA), but owned by the CMS theme. Never restyle them.
- **`main-page/news-feed.html`'s data-driven templating itself** — the page
  is regenerated from a news feed by another process; only its rendered
  card/grid *shape* was folded in as `.snip-card--media`, not the page.
