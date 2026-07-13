# Repository Agent Instructions

## OmniCMS Element Library

When a task mentions OmniCMS, the element library, USF homepage elements, `snip-*` components, page redesigns, or replacing HTML sections with approved components:

1. Read `skills/omnicms-element-library/SKILL.md`.
2. Read `docs/omnicms-element-library/components.generated.md` for the component catalog.
3. Use `docs/omnicms-element-library/components.generated.json` when exact ids, dependencies, or markup strings matter.
4. Read `skills/omnicms-element-library/references/omnicms-rules.md` for class ownership and OmniCMS constraints.
5. For deeper `snip-*` behavior, read `tcap/omnicms-snippets/CATALOG.md` and `tcap/omnicms-snippets/NAMING-CONVENTIONS.md`.

Default workflow: inspect target HTML, propose a concise replacement plan, then patch in small batches after clarification. Preserve all USF/CMS/snippet class names exactly unless the user explicitly asks for a new local component.

CMS preview hardening:

- Neutralize host “owl” margins on stack children, section wrappers, and grid/card children; use `gap` and intentional padding for component spacing.
- Keep USF/CMS classes in the markup, but use narrow section-scoped compatibility overrides when host CSS collapses approved grid spans, alignment, or section layouts.
- Prevent duplicate host/fallback pseudo-elements in chevron link lists; keep one right-aligned arrow and one divider per link.
- If using USF animation classes, keep a visible no-JS/reduced-motion baseline and use only self-contained, CDATA-wrapped vanilla JS for progressive enhancement.
- In CMS preview, check breadcrumb-to-stats, nav-to-section, stylized-header-to-section, header-to-card, and CTA-to-sources spacing, plus anchors and inline dependency counts.
