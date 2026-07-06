# Jobs Page Styling Analysis Report

## Summary

This report documents styling issues found in `jobs_page/index.html` and the fixes applied across this branch.

---

## 1. Font Alignment Findings

**Status: Already aligned — no changes needed.**

All section headings and label elements across the four major page sections (Stats, Flow, Pathways, Events) use consistent font stacks and alignment rules:

- Headings: `'Barlow Condensed'`, `font-weight: 700`, `letter-spacing: 0.01em`
- Labels: `'Open Sans'`, `font-weight: 400–600`
- Alignment: `text-align` is consistently applied per section context

No cross-section font alignment inconsistencies were found requiring correction.

---

## 2. Clipping Issues — Root Cause

**Affected selectors:** `.stat-num`, `.fl-num`, `.pw-num`, `.ev-day`

**Root cause:** `line-height: 1.05` is too tight for the `'Barlow Condensed'` typeface at large font sizes (18–22px, `font-weight: 700`). Condensed fonts have taller cap heights relative to their em square, causing ascenders and descenders to clip against adjacent elements or the element's own bounding box when line-height is below ~1.1.

**Fix applied:** Increased `line-height` from `1.05` → `1.15` on all four selectors. This provides adequate breathing room without introducing excessive vertical spacing in the stat/metric card layouts.

| Selector   | Font size | Before | After |
|------------|-----------|--------|-------|
| `.stat-num` | 22px     | 1.05   | 1.15  |
| `.fl-num`   | 22px     | 1.05   | 1.15  |
| `.pw-num`   | 18px     | 1.05   | 1.15  |
| `.ev-day`   | 22px     | 1.05   | 1.15  |

---

## 3. Bar Rendering Issues

**Affected selectors:** `.bar-wrap`, `.bar-track`, `.bar-fill`

Two distinct rendering problems were identified in the projection table bars:

### 3a. Inconsistent bar thickness

The `.bar-wrap` container had no explicit `width`, causing bars in different table rows to render at different widths depending on the text content of adjacent cells. Result: bars appeared thicker in rows with shorter text because more space was available.

**Fix:** Added `width: 100%` to `.bar-wrap` so all bars fill their table cell uniformly.

### 3b. Vertical stretching

In table cell contexts, flex children can stretch vertically to fill the cell height. Without explicit constraints:

- `.bar-wrap` inherited the full cell height, causing the flex container to be taller than the bar visual
- `.bar-track` stretched to fill `.bar-wrap`'s height, making the 4px track render as a tall rectangle
- `.bar-fill` had no explicit `width`, relying on inline `style` width values which could be overridden

**Fixes applied:**

| Selector    | Property added            | Purpose                                      |
|-------------|---------------------------|----------------------------------------------|
| `.bar-wrap` | `justify-content: flex-start` | Prevent content from spreading horizontally |
| `.bar-wrap` | `height: auto`            | Collapse wrapper to content height, not cell |
| `.bar-track`| `align-self: center`      | Pin track to vertical center, prevent stretch |
| `.bar-fill` | `width: 100%`             | Explicit fill so inline style is not required |

---

## 4. Implementation Recommendations

1. **Add `overflow: hidden` to `.bar-track`** — if bar fill percentages ever exceed 100% due to data errors, the fill will visually overflow the track without this guard.

2. **Consider `min-height` on stat cards** — now that line-height is increased, cards with two-line labels may shift the card bottom edge. A `min-height` constraint on `.stat-card` would prevent layout reflow.

3. **Audit other Barlow Condensed usages** — search for `font-family: 'Barlow Condensed'` site-wide and verify `line-height` is ≥ 1.1 on all weight-700 instances to prevent recurrence.

4. **Table cell vertical alignment** — consider adding `vertical-align: middle` to `.occ-table td` as a belt-and-suspenders measure alongside the flex fixes, since `vertical-align` governs inline/table layout while `align-self` governs flex layout.
