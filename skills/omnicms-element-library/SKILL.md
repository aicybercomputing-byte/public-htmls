---
name: omnicms-element-library
description: Plan and edit OmniCMS HTML pages using the approved Bellini/USF element library. Use when asked to redesign, restyle, replace, prototype, or iterate on OmniCMS/page HTML with "our library", "element library", USF homepage elements, snip-* components, cards, stats, CTAs, forms, FAQ groups, image grids, event widgets, or other cataloged components.
---

# OmniCMS Element Library

Use this skill to turn user intent into safe OmniCMS HTML edits using the local element catalog.

## Source Order

1. Read `references/components.generated.md` first when available in the skill package.
2. If working inside this repo, prefer `docs/omnicms-element-library/components.generated.md` and `components.generated.json`.
3. For `snip-*` details, read `tcap/omnicms-snippets/CATALOG.md` and `NAMING-CONVENTIONS.md` only as needed.
4. For global rules and workflow, read `references/omnicms-rules.md`.

## Workflow

1. Inspect the target HTML before proposing changes.
2. Produce a short replacement plan before editing:
   - target block or selector
   - chosen library element id/title
   - why it fits
   - required CSS/JS dependencies
   - content questions or assumptions
3. After user clarification, patch in small batches.
4. Preserve all approved USF/CMS/snippet classes exactly. Do not rename or restyle them unless the user explicitly asks for a new local component.
5. Validate after each batch:
   - in-page anchors still resolve
   - no removed catalog elements are reintroduced
   - OmniCMS inline CSS/JS rules are followed
   - `data-snip-*` behavior has required JS
   - forms using `data-snip-validate` also use `novalidate`
   - CMS host-CSS collisions are neutralized without changing approved markup

## Edit Policy

- Default to plan-then-iterate.
- Create a mock/reference copy first only for large redesigns, risky structural changes, or when the user asks for a mock.
- Use exact copied markup from the generated component catalog when possible.
- Use `snip-*` components for portable reusable content.
- Use USF v4 classes for faithful usf.edu homepage patterns.
- Treat third-party/generated widgets as documented patterns, not editable component APIs.

## CMS hardening checklist

OmniCMS pages run inside a host stylesheet that may add broad margins, responsive
grid rules, pseudo-elements, and animation states. Treat the first CMS preview as
an integration test, not proof that the snippet is standalone-safe.

- **Neutralize owl spacing at component boundaries.** Host selectors such as
  `.content * + *` can move the first child of a grid or flex row. Reset top
  margins on snippet stacks, direct section wrappers, and grid/card children;
  use `gap` and component padding as the spacing source.
- **Scope compatibility CSS.** Preserve USF/CMS class names and semantics, but
  add a page or section modifier when a host rule wins. Keep overrides narrow
  (`.section--experiential .section__media`, for example) rather than globally
  restyling `.section__*`, `.card`, or `.link-list`.
- **Treat USF utility classes as host-owned.** Verify responsive grid spans and
  alignment utilities in the CMS preview. If the host changes them, use a
  scoped media-query override with the approved classes still in the markup.
- **Avoid duplicate pseudo-elements.** Approved chevron/link-list classes may
  already render an arrow. Do not add a second `::before`/`::after`; if a
  fallback is needed, explicitly disable the host pseudo-element in the same
  scoped rule and render exactly one arrow and one divider.
- **Make animation progressive.** `animate`/`animate--slide-in` classes are
  hidden by the USF stylesheet until `animate-trigger` is added. If using them
  in a pasted snippet, keep content visible by default, add a self-contained
  inline vanilla-JS trigger on load/scroll, and honor `prefers-reduced-motion`.
  Do not depend on jQuery or an external script. A stripped or blocked script
  must leave the content visible.
- **Use inline dependency checks.** OmniCMS strips external stylesheet/script
  references. Inline CSS/JS must be CDATA-wrapped; custom JS should be scoped,
  DOM-ready safe, and independent of page-global selectors. Only add
  `snippet-template.js` when the page actually uses `data-snip-*` behavior.
- **Check spacing at all boundaries.** Review breadcrumb-to-stats, nav-to-section,
  stylized-header-to-section, header-to-card, and CTA-to-sources transitions.
  Reset host margins first, then tune intentional section padding.

## Regenerating The Catalog

Inside the repo, refresh references with:

```bash
python scripts/extract-element-library.py --source example-elements.html --out docs/omnicms-element-library
```

Package a Claude-uploadable skill zip with:

```bash
python scripts/package-omnicms-skill.py --skill skills/omnicms-element-library --dist dist
```
