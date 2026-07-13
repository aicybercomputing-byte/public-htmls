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

## Edit Policy

- Default to plan-then-iterate.
- Create a mock/reference copy first only for large redesigns, risky structural changes, or when the user asks for a mock.
- Use exact copied markup from the generated component catalog when possible.
- Use `snip-*` components for portable reusable content.
- Use USF v4 classes for faithful usf.edu homepage patterns.
- Treat third-party/generated widgets as documented patterns, not editable component APIs.

## Regenerating The Catalog

Inside the repo, refresh references with:

```bash
python scripts/extract-element-library.py --source example-elements.html --out docs/omnicms-element-library
```

Package a Claude-uploadable skill zip with:

```bash
python scripts/package-omnicms-skill.py --skill skills/omnicms-element-library --dist dist
```
