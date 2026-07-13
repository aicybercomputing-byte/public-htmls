# Repository Agent Instructions

## OmniCMS Element Library

When a task mentions OmniCMS, the element library, USF homepage elements, `snip-*` components, page redesigns, or replacing HTML sections with approved components:

1. Read `skills/omnicms-element-library/SKILL.md`.
2. Read `docs/omnicms-element-library/components.generated.md` for the component catalog.
3. Use `docs/omnicms-element-library/components.generated.json` when exact ids, dependencies, or markup strings matter.
4. Read `skills/omnicms-element-library/references/omnicms-rules.md` for class ownership and OmniCMS constraints.
5. For deeper `snip-*` behavior, read `tcap/omnicms-snippets/CATALOG.md` and `tcap/omnicms-snippets/NAMING-CONVENTIONS.md`.

Default workflow: inspect target HTML, propose a concise replacement plan, then patch in small batches after clarification. Preserve all USF/CMS/snippet class names exactly unless the user explicitly asks for a new local component.
