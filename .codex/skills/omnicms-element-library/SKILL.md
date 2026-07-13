---
name: omnicms-element-library
description: Plan and edit OmniCMS HTML pages using the approved Bellini/USF element library. Use when asked to redesign, restyle, replace, prototype, or iterate on OmniCMS/page HTML with "our library", "element library", USF homepage elements, snip-* components, cards, stats, CTAs, forms, FAQ groups, image grids, event widgets, or other cataloged components.
---

# OmniCMS Element Library

This repo-local Codex adapter points to the canonical skill and generated catalog.

1. Read `../../../skills/omnicms-element-library/SKILL.md`.
2. Read `../../../docs/omnicms-element-library/components.generated.md`.
3. Use `../../../docs/omnicms-element-library/components.generated.json` for exact component ids, dependencies, and markup.
4. Read `../../../skills/omnicms-element-library/references/omnicms-rules.md` for class ownership, OmniCMS inline CSS/JS rules, and replacement workflow.

Default workflow: inspect target HTML, propose a short replacement plan, then patch in small batches after user clarification.

CMS hardening reminders: neutralize host “owl” margins with scoped resets and
`gap`; preserve approved USF/CMS classes while using narrow section-scoped
compatibility overrides for host grid/spacing collisions; prevent duplicate
chevron pseudo-elements; and make USF animation classes progressive with a
visible no-JS/reduced-motion fallback plus self-contained CDATA-wrapped vanilla
JS when animation is desired. Recheck boundary spacing, anchors, repeated
components, inline CSS/JS, and `data-snip-*` dependencies after each batch.
