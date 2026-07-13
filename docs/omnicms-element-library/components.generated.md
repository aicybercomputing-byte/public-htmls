# OmniCMS Element Library Components

Generated from `example-elements.html`.

Use exact markup unless content changes require text/link/image substitutions. Preserve all non-demo classes.

## Hero banner

### #hero .hero__video / .hero__content — full-bleed video background, heading, arrow-link CTA. Needs a positioned .page ancestor (usf.edu's #content.page wrapper): without it .hero__video (position:absolute; inset:0) escapes to fill the whole document. The stage below carries page to contain it; real hero is min-height ~100vh, capped here for the catalog.

- id: `hero-section-hero-banner`
- source_family: `usf-v4`
- aliases: `banner`, `hero`, `hero__content`, `hero__video`, `page`, `video hero`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<div id="hero" class="hero">
<video id="hero-video" class="hero__video" poster="https://www.usf.edu/media/images/hero/usf70-homepage-notext-1920x1080.jpg" muted loop playsinline>
<source id="hero-video-source" src="https://www.usf.edu/media/videos/70th-homepage-hero.mp4" type="video/mp4">
</video>
<div id="hero-content" class="hero__content container px-4">
<h1 class="hero__heading">70 Years of Bold</h1>
<p class="hero__text">Celebrating how far we've come while building a bolder future</p>
<div class="hero__links">
<div>
<a class="arrow-link" href="#">
<span class="arrow-link__content">
<span class="arrow-link__text">Explore our story</span>
<span class="arrow-link__icon u-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
<path fill="currentColor" d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z">
</path>
</svg>
</span>
</span>
</a>
</div>
</div>
</div>
</div>
```

## Section color system

### .section.section--usfgreen.section--dark — media + text + CTA list (was "Built for Your Future")

- id: `sections-section-color-system`
- source_family: `usf-v4`
- aliases: `color system`, `dark section`, `media text`, `section`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`
- notes: Every homepage content block is a .section with a background modifier (--white, --sand, --usfgreen, --evergreen) plus --dark for light-on-dark text, laid out with .section__inner.grid.grid-col-12-sm and populated with .section__media / .section__text / .section__cta. Other modifiers seen on the real homepage: section--connected-lines-left, section--gradient-left, section--top-desc-tint, section--top/bottom-desc-solid, section--image with section--image-contain-bl / -cover-cc / -overlay.

```html
<div class="section section--usfgreen section--dark">
<div class="section__inner grid grid-col-12-sm align-ai-center-sm gap-6 gap-7-sm container">
<div class="section__media grid-col-span-8-sm">
<img loading="lazy" class="section__media-image" src="https://www.usf.edu/media/images/built-for-your-future/student.jpeg" alt="USF student smiles while sitting at a table and writing on paper.">
</div>
<div class="section__text grid-col-span-4-sm">
<h2 class="section__heading">Built for Your Future</h2>
<div class="section__description">
<p>At the University of South Florida, your goals fuel everything we do. Explore a community driven by innovation, and the power to shape what comes next.</p>
</div>
<div class="section__cta">
<ul class="link-list link-list--alt chevrons-list chevrons-list_apple" role="list">
<li>
<a href="#">Find Your Major</a>
</li>
<li>
<a href="#">Calculate Your Cost of Attendance</a>
</li>
<li>
<a href="#">Plan Your Visit</a>
</li>
</ul>
</div>
</div>
</div>
</div>
```

## Shell & stack

### .snip-shell / .snip-stack — the outer wrapper every snippet starts with

- id: `snip-shell-shell-stack`
- source_family: `snip`
- aliases: `shell`, `snip-shell`, `snip-stack`, `stack`, `wrapper`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-shell">
<div class="snip-stack">
<p style="margin:0;padding:12px;background:#fff;border:1px dashed #b2b2b2;font-size:13px;">Section A content</p>
<p style="margin:0;padding:12px;background:#fff;border:1px dashed #b2b2b2;font-size:13px;">Section B content — spacing between A and B comes from .snip-stack's `gap`, not margin.</p>
</div>
</div>
```

## Section heading

### .snip-heading

- id: `snip-heading-section-heading`
- source_family: `snip`
- aliases: `heading`, `section intro`, `snip-heading`, `snip-heading__text`, `snip-heading__title`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-heading">
<h2 class="snip-heading__title">Three Pillars. Endless Possibilities.</h2>
<p class="snip-heading__text">A one- or two-line description of the section that follows, centered and capped at a readable width.</p>
</div>
```

## Audience gateway

### .audience-gateway / .audience-gateway__select / .audience-gateway__button

- id: `gateway-audience-gateway`
- source_family: `usf-v4`
- aliases: `audience gateway`, `audience-gateway`, `audience-gateway__button`, `audience-gateway__select`, `chooser`, `select cta`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`
- notes: The "choose your next step" chooser — a <select> + button pair that updates its own href/label on change (real behavior needs usf.edu's JS; shown static here).

```html
<div class="audience-gateway">
<div class="audience-gateway--js">
<div class="audience-gateway__inner">
<div class="audience-gateway__label">
<label for="demo-audience-select">Start your journey:</label>
</div>
<div class="audience-gateway__select">
<select name="audience" id="demo-audience-select">
<option value="#" disabled selected>Choose your next step</option>
<option value="#">Undergraduate Majors</option>
<option value="#">Graduate Programs</option>
<option value="#">Future Freshman Students</option>
</select>
</div>
<div>
<a href="#" class="audience-gateway__button button" aria-live="polite">
<span class="button__content">
<span>Get Info<span class="u-hidden"> for </span>
<span class="u-hidden">About USF</span>
</span>
<span class="chevron-right u-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
<path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z">
</path>
</svg>
</span>
</span>
</a>
</div>
</div>
</div>
</div>
```

## Buttons

### .button.button--primary / .button--secondary

- id: `buttons-button-button-primary-button-secondary`
- source_family: `usf-v4`
- aliases: `apply`, `button`, `button--secondary`, `primary button`, `secondary button`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<div style="display:flex;gap:12px;flex-wrap:wrap;">
<a class="button button--primary" href="#">
<span class="button__content">
<span>Primary Button</span>
</span>
</a>
<a class="button button--secondary" href="#">
<span class="button__content">
<span>Secondary Button</span>
</span>
</a>
</div>
```

### Button with trailing icon (u-icon span + inline SVG) — was the real "Apply" button

- id: `buttons-button-with-trailing-icon-u-icon-span-inline-svg-was-the-real`
- source_family: `usf-v4`
- aliases: `apply`, `button`, `primary button`, `secondary button`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<a class="button button--primary" href="#">
<span class="button__content">
<span>Apply</span>
<span class="chevron-right u-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
<path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z">
</path>
</svg>
</span>
</span>
</a>
```

## Links & link lists

### .arrow-link — inline text link with a trailing chevron

- id: `links-arrow-link-inline-text-link-with-a-trailing-chevron`
- source_family: `usf-v4`
- aliases: `arrow link`, `arrow-link`, `chevron list`, `link list`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<a class="arrow-link" href="#">
<span class="arrow-link__content">
<span class="arrow-link__text">Explore our story</span>
<span class="arrow-link__icon u-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
<path fill="currentColor" d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z">
</path>
</svg>
</span>
</span>
</a>
```

### .link-list--alt.chevrons-list.chevrons-list_apple — used inside dark/colored sections for a CTA list

- id: `links-link-list-alt-chevrons-list-chevrons-list-apple-used-inside-dark`
- source_family: `usf-v4`
- aliases: `arrow link`, `chevron list`, `link list`, `link-list--alt`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<ul class="link-list link-list--alt chevrons-list chevrons-list_apple" role="list">
<li>
<a href="#">Find Your Major</a>
</li>
<li>
<a href="#">Calculate Your Cost of Attendance</a>
</li>
<li>
<a href="#">Plan Your Visit</a>
</li>
<li>
<a href="#">Request More Information</a>
</li>
</ul>
```

### .link-list--inline.square-arrow-list.square-arrow-list_apple — the no-JS fallback list behind the audience-gateway dropdown below

- id: `links-link-list-inline-square-arrow-list-square-arrow-list-apple-the-n`
- source_family: `usf-v4`
- aliases: `arrow link`, `chevron list`, `link list`, `link-list--inline`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<ul class="link-list link-list--inline square-arrow-list square-arrow-list_apple" role="list">
<li>
<a href="#">Undergraduate Majors</a>
</li>
<li>
<a href="#">Cost Calculator</a>
</li>
<li>
<a href="#">Financial Aid</a>
</li>
</ul>
```

## CTA band

### .snip-cta / .snip-cta__inner — full-bleed, not scoped to .snip-shell's max-width

- id: `snip-cta-cta-band`
- source_family: `snip`
- aliases: `call to action`, `cta`, `snip-cta`, `snip-cta__inner`, `snip-shell`, `snippet button`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-cta">
<div class="snip-cta__inner">
<a class="snippetButton" href="#">Talk to an advisor</a>
</div>
</div>
```

## Bottom pill nav

### .snip-nav / .snip-nav__link — one non-link .is-active pill marks the current page

- id: `snip-nav-bottom-pill-nav`
- source_family: `snip`
- aliases: `bottom nav`, `is-active`, `nav`, `pill nav`, `snip-nav`, `snip-nav__link`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-nav">
<a class="snip-nav__link" href="#">Overview</a>
<span class="snip-nav__link is-active">Layers</span>
<a class="snip-nav__link" href="#">Exp. Learning</a>
<a class="snip-nav__link" href="#">FAQ</a>
</div>
```

## Cards

### Trending at USF: .section .card-group.animate-group + three .card.card--usfgreen.animate.animate--stagger.animate--slide-in. USF CSS makes this 3-across at 768px+; hover/focus scales the card image to 1.05.

- id: `cards-cards`
- source_family: `usf-v4`
- aliases: `card`, `card-group`, `cards`, `section`, `trending`, `trending at usf`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<div class="section section--white">
<div class="section__inner grid grid-col-12-sm gap-5 container">
<div class="section__text grid-col-span-8-sm">
<h2 class="section__heading">Trending at USF</h2>
</div>
<div class="section__columns grid-col-span-12-sm">
<div class="section__column">
<div class="card-group animate-group">
<div class="card card--usfgreen animate animate--stagger animate--slide-in">
<div class="card__image">
<img loading="lazy" src="https://www.usf.edu/media/images/trending/tour.jpeg" alt="Group of people taking a tour of campus">
</div>
<div class="card__content">
<h3 class="card__heading">
<a href="https://www.usf.edu/admissions/visit/index.aspx" target="_self" class="card__link">Visit USF</a>
</h3>
<div class="card__description">
<p>Take a guided tour for an up-close look at each USF campus.</p>
</div>
</div>
</div>
<div class="card card--usfgreen animate animate--stagger animate--slide-in">
<div class="card__image">
<img loading="lazy" src="https://www.usf.edu/media/images/trending/700x525-student-go-bulls.jpeg" alt="Student smiling and doing a Go Bulls hand gesture.">
</div>
<div class="card__content">
<h3 class="card__heading">
<a href="https://www.usf.edu/admissions/index.aspx" target="_self" class="card__link">Applications Open Soon</a>
</h3>
<div class="card__description">
<p>Get ready to find your place in the Herd.</p>
</div>
</div>
</div>
<div class="card card--usfgreen animate animate--stagger animate--slide-in">
<div class="card__image">
<img loading="lazy" src="https://www.usf.edu/media/images/trending/onboarding.jpg" alt="Students on computer">
</div>
<div class="card__content">
<h3 class="card__heading">
<a href="https://discover.usf.edu/apply/status" target="_self" class="card__link">Incoming Students: Finish Your Onboarding Checklist</a>
</h3>
<div class="card__description">
<p>It's time to become a Bull! Finish up your next steps.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
```

## Cards & grids

### .snip-grid--2 + .snip-card--callout

- id: `snip-cards-snip-grid-2-snip-card-callout`
- source_family: `snip`
- aliases: `callout`, `icon card`, `snip cards`, `snip-card`, `snip-card--callout`, `snip-card__body`, `snip-card__title`, `snip-grid`, `snip-grid--2`, `step card`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-grid snip-grid--2">
<div class="snip-card snip-card--callout">
<h3 class="snip-card__title">What is tCAP?</h3>
<p class="snip-card__body">A structured, multiyear career development program.</p>
</div>
<div class="snip-card snip-card--callout">
<h3 class="snip-card__title">Why tCAP matters</h3>
<p class="snip-card__body">Employers want graduates who can contribute immediately.</p>
</div>
</div>
```

### .snip-grid--3 + .snip-card--callout.snip-card--center (link card)

- id: `snip-cards-snip-grid-3-snip-card-callout-snip-card-center-link-card`
- source_family: `snip`
- aliases: `callout`, `icon card`, `snip cards`, `snip-card`, `snip-card--callout`, `snip-card--center`, `snip-card__body`, `snip-card__title`, `snip-grid`, `snip-grid--3`, `step card`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-grid snip-grid--3">
<a class="snip-card snip-card--callout snip-card--center" href="#">
<p class="snip-card__title">Readiness</p>
<p class="snip-card__body">Build the foundation with self-awareness and goal setting.</p>
</a>
<a class="snip-card snip-card--callout snip-card--center" href="#">
<p class="snip-card__title">Experience</p>
<p class="snip-card__body">Learn by doing through applied projects.</p>
</a>
<a class="snip-card snip-card--callout snip-card--center" href="#">
<p class="snip-card__title">Connection</p>
<p class="snip-card__body">Grow your network with mentors and employers.</p>
</a>
</div>
```

### .snip-grid--1 + .snip-card--step (numbered process, e.g. program stages) — hover a card, it's driven by data-snip-active-group

- id: `snip-cards-snip-grid-1-snip-card-step-numbered-process-e-g-program-sta`
- source_family: `snip`
- aliases: `callout`, `icon card`, `snip cards`, `snip-card`, `snip-card--interactive`, `snip-card--step`, `snip-card__badge`, `snip-card__body`, `snip-card__title`, `snip-grid`, `snip-grid--1`, `step card`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`, `tcap/omnicms-snippets/snippet-template.js`

```html
<div class="snip-grid snip-grid--1" data-snip-active-group>
<div class="snip-card snip-card--step snip-card--interactive" data-snip-active-item>
<div class="snip-card__badge">1</div>
<div>
<h3 class="snip-card__title">Targeting Fundamentals</h3>
<p class="snip-card__body">Onboarding, resume building, GitHub setup and goal setting.</p>
</div>
</div>
<div class="snip-card snip-card--step snip-card--interactive" data-snip-active-item>
<div class="snip-card__badge">2</div>
<div>
<h3 class="snip-card__title">Core Application</h3>
<p class="snip-card__body">Mentorship, leadership development and networking.</p>
</div>
</div>
</div>
```

### .snip-grid--4 + .snip-card--icon — hover/tap a tile to flip its .is-active state and update linked status text via data-snip-info-target

- id: `snip-cards-snip-grid-4-snip-card-icon-hover-tap-a-tile-to-flip-its-is`
- source_family: `snip`
- aliases: `callout`, `icon card`, `is-active`, `snip cards`, `snip-card`, `snip-card--icon`, `snip-card--interactive`, `snip-card__badge`, `snip-card__title`, `snip-grid`, `snip-grid--4`, `step card`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`, `tcap/omnicms-snippets/snippet-template.js`

```html
<div class="snip-grid snip-grid--4" data-snip-active-group data-snip-info-target="#demo-pathway-info">
<div class="snip-card snip-card--icon snip-card--interactive" data-snip-active-item data-info="Internships.">
<span class="snip-card__badge">IN</span>
<div class="snip-card__title">Internships</div>
</div>
<div class="snip-card snip-card--icon snip-card--interactive" data-snip-active-item data-info="Undergraduate research.">
<span class="snip-card__badge">UR</span>
<div class="snip-card__title">Undergrad Research</div>
</div>
<div class="snip-card snip-card--icon snip-card--interactive" data-snip-active-item data-info="Capstone projects.">
<span class="snip-card__badge">CP</span>
<div class="snip-card__title">Capstone Projects</div>
</div>
<div class="snip-card snip-card--icon snip-card--interactive" data-snip-active-item data-info="Cybersecurity support services.">
<span class="snip-card__badge">CS</span>
<div class="snip-card__title">Cyber Support</div>
</div>
</div>
```

### .snip-grid--4.snip-grid--tight + .snip-card--icon.snip-card--solid (always-on link strip)

- id: `snip-cards-snip-grid-4-snip-grid-tight-snip-card-icon-snip-card-solid`
- source_family: `snip`
- aliases: `callout`, `icon card`, `snip cards`, `snip-card`, `snip-card--icon`, `snip-card--solid`, `snip-card__num`, `snip-card__title`, `snip-grid`, `snip-grid--4`, `snip-grid--tight`, `step card`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-grid snip-grid--4 snip-grid--tight">
<a class="snip-card snip-card--icon snip-card--solid" href="#">
<span class="snip-card__num">01</span>
<span class="snip-card__title">Targeting Fundamentals</span>
</a>
<a class="snip-card snip-card--icon snip-card--solid" href="#">
<span class="snip-card__num">02</span>
<span class="snip-card__title">Core Application</span>
</a>
<a class="snip-card snip-card--icon snip-card--solid" href="#">
<span class="snip-card__num">03</span>
<span class="snip-card__title">Advanced Practice</span>
</a>
<a class="snip-card snip-card--icon snip-card--solid" href="#">
<span class="snip-card__num">04</span>
<span class="snip-card__title">Professional Mastery</span>
</a>
</div>
```

## Stat group

### .stat-group.stat-group--4 + .stat / .stat__value / .stat__text

- id: `stats-stat-group`
- source_family: `usf-v4`
- aliases: `rankings`, `stat`, `stat group`, `stat-group`, `stat__text`, `stat__value`, `stats`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<div class="stat-group stat-group--4">
<div class="stat">
<span class="stat__value">#43</span>
<span class="stat__text">Among all Public Universities</span>
</div>
<div class="stat">
<span class="stat__value">Top 16</span>
<span class="stat__text">Medical School in the Nation</span>
</div>
<div class="stat">
<span class="stat__value">#12</span>
<span class="stat__text">Best Value Among all Public Universities</span>
</div>
<div class="stat">
<span class="stat__value">$750M</span>
<span class="stat__text">in Research Funding (2025)</span>
</div>
</div>
```

## Stat bar

### .snip-stat-bar — wraps the CMS theme's own c-calloutText component

- id: `snip-stat-bar-stat-bar`
- source_family: `snip`
- aliases: `callout text`, `snip-source`, `snip-source__text`, `snip-stat-bar`, `stat bar`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-stat-bar">
<div class="c-calloutText c-calloutText--gray" style="height: 200px !important;">
<h3 class="c-calloutText_heading">+17.9%</h3>
<div class="c-calloutText_text">Software developer growth 2023&ndash;2033
<section class="snip-source">
<p class="snip-source__text">BLS / MLR 2025.</p>
</section>
</div>
</div>
<div class="c-calloutText c-calloutText--gray" style="height: 200px !important;">
<h3 class="c-calloutText_heading">546K</h3>
<div class="c-calloutText_text">Tech workers in Florida
<section class="snip-source">
<p class="snip-source__text">CompTIA 2025.</p>
</section>
</div>
</div>
</div>
```

## Comparison table

### .snip-table / .snip-table__row / .snip-table__cell

- id: `snip-table-comparison-table`
- source_family: `snip`
- aliases: `comparison`, `snip-table`, `snip-table__cell`, `snip-table__row`, `snip-table__row--head`, `table`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-table">
<div class="snip-table__row snip-table__row--head">
<div class="snip-table__cell">Requirement</div>
<div class="snip-table__cell">What it means</div>
<div class="snip-table__cell">Student output</div>
</div>
<div class="snip-table__row">
<div class="snip-table__cell">135 verified hours</div>
<div class="snip-table__cell">Minimum threshold of verified hours</div>
<div class="snip-table__cell">Tracked hours</div>
</div>
<div class="snip-table__row">
<div class="snip-table__cell">Pre-approval</div>
<div class="snip-table__cell">Plan of work approved by a mentor</div>
<div class="snip-table__cell">Approved plan</div>
</div>
</div>
```

## FAQ group

### .snip-faq / .snip-faq__title / .snip-faq__list

- id: `snip-faq-faq-group`
- source_family: `snip`
- aliases: `accordion`, `details`, `faq`, `snip-faq`, `snip-faq__list`, `snip-faq__title`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`

```html
<div class="snip-faq">
<h3 class="snip-faq__title">Program basics</h3>
<div class="snip-faq__list">
<details>
<summary>What is tCAP?</summary>
<p>A structured, multiyear career development program integrated into the college experience.</p>
</details>
<details>
<summary>When do students start?</summary>
<p>Students begin during their first semester.</p>
</details>
</div>
</div>
```

## Events feed

### .calendar-feed / __item / __date / __details / __title

- id: `events-events-feed`
- source_family: `usf-v4`
- aliases: `calendar feed`, `calendar-feed`, `events`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<ol class="calendar-feed" role="list" style="max-width:360px;">
<li class="calendar-feed__item">
<a class="calendar-feed__link" href="#">
<div class="calendar-feed__date">Aug 8</div>
<p class="calendar-feed__details">
<span class="calendar-feed__title">Summer Commencement</span>
</p>
</a>
</li>
<li class="calendar-feed__item">
<a class="calendar-feed__link" href="#">
<div class="calendar-feed__date">Aug 20</div>
<p class="calendar-feed__details">
<span class="calendar-feed__title">Week of Welcome</span>
<br>
<span class="calendar-feed__date-span">Aug. 20 - Aug. 30</span>
</p>
</a>
</li>
</ol>
```

## Image grid

### .image-grid.grid + .image-grid__item — was "We Are One USF"

- id: `media-grid-image-grid`
- source_family: `usf-v4`
- aliases: `campus grid`, `image grid`, `image-grid`, `image-grid__item`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`

```html
<div class="image-grid grid" style="max-width:520px;">
<div class="image-grid__item">
<img loading="lazy" src="https://www.usf.edu/media/images/one-usf/usftpa.jpeg" alt="University of South Florida Tampa campus.">
</div>
<div class="image-grid__item">
<img loading="lazy" src="https://www.usf.edu/media/images/one-usf/usfsp-campus.jpeg" alt="University of South Florida St. Petersburg campus.">
</div>
<div class="image-grid__item">
<img loading="lazy" src="https://www.usf.edu/media/images/one-usf/one-usf-3.jpg" alt="University of South Florida sign with palm trees">
</div>
<div class="image-grid__item">
<img loading="lazy" src="https://www.usf.edu/media/images/one-usf/one-usf-health.jpg" alt="USF Health">
</div>
</div>
```

## Video dialog grid

### .video-grid / .video-grid__item / .dialog

- id: `video-video-dialog-grid`
- source_family: `usf-v4`
- aliases: `dialog`, `video`, `video-grid`, `video-grid__item`, `youtube`
- dependencies: `reference/usf-cms/css/v4/tokens.css`, `reference/usf-cms/css/v4/base-utilities.css`, `reference/usf-cms/css/v4/ui-components.css`, `reference/usf-cms/css/v4/styles.css`, `a11y-dialog runtime on real usf.edu pages`
- notes: .video-grid__item opens an a11y-dialog-powered modal with a YouTube embed on click — that library isn't loaded on this page, so the button below is inert (real markup/classes still shown, and the dialog's own markup is nested inside for reference).

```html
<div class="video-grid" style="max-width:220px;">
<div class="video-grid__item">
<button type="button" class="dialog-button" data-a11y-dialog-show="demo-video-1">
<img loading="lazy" src="https://www.usf.edu/media/images/live-the-bulls-life/bullslife-homecoming.jpg" alt="Watch Homecoming at USF">
<span class="video-grid-icon u-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
<path fill="currentColor" d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z">
</path>
</svg>
</span>
</button>
<div class="dialog" data-a11y-dialog="demo-video-1" aria-label="Homecoming at USF" aria-hidden="true" aria-modal="true" tabindex="-1" role="dialog">
<div class="dialog__overlay" data-a11y-dialog-hide>
</div>
<div class="dialog__container" role="document">
<button type="button" class="dialog-button-close" data-a11y-dialog-hide aria-label="Close overlay">
<span class="dialog-button-close-icon u-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
<path fill="currentColor" d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z">
</path>
</svg>
</span>
</button>
<div class="dialog__content">
<div class="dialog__embed--yt-shorts">
<iframe src="https://www.youtube.com/embed/sm09sdAIeFc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="yes">
</iframe>
</div>
</div>
</div>
</div>
</div>
</div>
```

## Panel & form

### data-snip-panel + data-snip-screen + data-snip-go + data-snip-validate + data-snip-reset — live flow

- id: `snip-panel-panel-form`
- source_family: `snip`
- aliases: `form`, `panel`, `request info`, `snip-back`, `snip-banner--error`, `snip-btn`, `snip-btn--primary`, `snip-btn--secondary`, `snip-choice`, `snip-choice-stack`, `snip-choice__arrow`, `snip-choice__desc`, `snip-choice__title`, `snip-consent-row`, `snip-field`, `snip-field__error`, `snip-grid`, `snip-grid--2`, `snip-input`, `snip-kicker`, `snip-label`, `snip-panel`, `snip-panel__band`, `snip-panel__body`, `snip-panel__pad`, `snip-panel__subtitle`, `snip-panel__title`, `snip-required`, `snip-required-note`, `snip-section-label`, `snip-success`, `snip-success__icon`, `snip-success__text`, `snip-success__title`, `snip-visually-hidden`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`, `tcap/omnicms-snippets/snippet-template.js`
- notes: From the Bellini "request info" widget — a self-contained panel with its own screens, not scoped to .snip-shell. This one is fully wired to snippet-template.js: click a choice, try submitting empty, then fill it in. The submission itself (the network call) isn't this library's job — see the demo-only glue script below the panel and CATALOG.md for the contract.

```html
<div class="snip-panel" data-snip-panel data-snip-initial="choose">
<section data-snip-screen="choose">
<div class="snip-panel__band snip-panel__pad">
<p class="snip-kicker">Bellini College of Artificial Intelligence, Cybersecurity and Computing</p>
<h2 class="snip-panel__title">Request program information</h2>
<p class="snip-panel__subtitle">Tell us a little about you and which program you're exploring.</p>
</div>
<div class="snip-panel__body snip-panel__pad">
<p class="snip-section-label">Who is filling this out?</p>
<div class="snip-choice-stack">
<button class="snip-choice" type="button" data-snip-go="student">
<span>
<span class="snip-choice__title">I'm a future student</span>
<span class="snip-choice__desc">Exploring a program for yourself</span>
</span>
<span class="snip-choice__arrow" aria-hidden="true">&rarr;</span>
</button>
</div>
</div>
</section>
<section data-snip-screen="student" class="is-hidden">
<form data-snip-validate novalidate id="demo-student-form">
<div class="snip-panel__band snip-panel__pad">
<button class="snip-back" type="button" data-snip-go="choose">&larr; Back</button>
<p class="snip-kicker">Future student</p>
<h2 class="snip-panel__title">Tell us about you</h2>
</div>
<div class="snip-panel__body snip-panel__pad">
<div class="snip-banner--error" style="display:none;">
</div>
<div class="snip-grid snip-grid--2">
<div class="snip-field">
<label class="snip-label" for="demo-first">First name<span class="snip-required"> *</span>
</label>
<input class="snip-input" id="demo-first" name="first_name" type="text" required>
<div class="snip-field__error" data-snip-error-for="first_name">
</div>
</div>
<div class="snip-field">
<label class="snip-label" for="demo-last">Last name<span class="snip-required"> *</span>
</label>
<input class="snip-input" id="demo-last" name="last_name" type="text" required>
<div class="snip-field__error" data-snip-error-for="last_name">
</div>
</div>
</div>
<div class="snip-field">
<label class="snip-label" for="demo-email">Email<span class="snip-required"> *</span>
</label>
<input class="snip-input" id="demo-email" name="email" type="email" required>
<div class="snip-field__error" data-snip-error-for="email">
</div>
</div>
<div class="snip-visually-hidden">
<label for="demo-website">Website</label>
<input id="demo-website" name="website" type="text" tabindex="-1" autocomplete="off" data-snip-honeypot>
</div>
<div class="snip-consent-row">
<input id="demo-consent" name="consent" type="checkbox" required>
<label for="demo-consent">I agree to receive communications about this program.*</label>
</div>
<button class="snip-btn snip-btn--primary" type="submit">Request information</button>
<p class="snip-required-note">Fields marked * are required — try submitting empty first.</p>
</div>
</form>
</section>
<section data-snip-screen="thanks" class="is-hidden">
<div class="snip-panel__band snip-panel__pad">
<p class="snip-kicker">Bellini College of AI, Cybersecurity and Computing</p>
</div>
<div class="snip-success snip-panel__pad">
<div class="snip-success__icon" aria-hidden="true">
<span>&#10003;</span>
</div>
<h2 class="snip-success__title">Thank you!</h2>
<p class="snip-success__text">Your request is in. Someone from the team will reach out soon.</p>
<button class="snip-btn snip-btn--secondary" type="button" data-snip-reset>Submit another request</button>
</div>
</section>
</div>
```

## Flip card

### .snip-event — hover the row to flip the date badge

- id: `snip-flip-snip-event-hover-the-row-to-flip-the-date-badge`
- source_family: `snip`
- aliases: `event badge`, `flip`, `flip button`, `snip-event`, `snip-event__badge`, `snip-event__badge-inner`, `snip-event__face`, `snip-event__face--back`, `snip-event__face--front`, `snip-event__title`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`
- notes: From the AI+X community events widget — a 3D flip on hover. .snip-event flips its badge when you hover anywhere in the row; .snip-flip-btn flips itself.

```html
<a class="snip-event" href="#" style="max-width:360px;">
<div class="snip-event__badge">
<div class="snip-event__badge-inner">
<div class="snip-event__face snip-event__face--front">
<span style="font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">Mar</span>
<span style="font-size:27px;font-weight:600;line-height:1;">14</span>
</div>
<div class="snip-event__face snip-event__face--back">
<span style="font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">Mar</span>
<span style="font-size:27px;font-weight:600;line-height:1;">14</span>
</div>
</div>
</div>
<div>
<p class="snip-event__title">AI+X Speaker Series: Applied Robotics</p>
</div>
</a>
```

### .snip-flip-btn — hover the button itself to flip

- id: `snip-flip-snip-flip-btn-hover-the-button-itself-to-flip`
- source_family: `snip`
- aliases: `event badge`, `flip`, `flip button`, `snip-flip-btn`, `snip-flip-btn__face`, `snip-flip-btn__face--back`, `snip-flip-btn__face--front`, `snip-flip-btn__inner`
- dependencies: `tcap/omnicms-snippets/snippet-template.css`
- notes: From the AI+X community events widget — a 3D flip on hover. .snip-event flips its badge when you hover anywhere in the row; .snip-flip-btn flips itself.

```html
<a class="snip-flip-btn" href="#">
<div class="snip-flip-btn__inner">
<div class="snip-flip-btn__face snip-flip-btn__face--front">All Events</div>
<div class="snip-flip-btn__face snip-flip-btn__face--back">All Events</div>
</div>
</a>
```
