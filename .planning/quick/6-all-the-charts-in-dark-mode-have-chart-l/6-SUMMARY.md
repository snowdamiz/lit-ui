---
quick: 6
subsystem: ui
tags: [css, dark-mode, charts, tokens, theming]

requires:
  - phase: packages/charts/src/base/theme-bridge.ts
    provides: ThemeBridge readToken() — resolves CSS custom properties via getComputedStyle for ECharts

provides:
  - Dark mode CSS token overrides for all 16 --ui-chart-* tokens in apps/docs/src/index.css
  - Muted -400 Tailwind color variants for 8 chart series colors in dark mode
  - Gray-scale dark mode values for grid, axis, tooltip, and legend tokens

affects: [docs, charts dark mode appearance]

tech-stack:
  added: []
  patterns:
    - "Dark mode chart tokens: Add .dark { --ui-chart-color-N } overrides in index.css; ThemeBridge picks them up automatically via CSS cascade into Shadow DOM"

key-files:
  created: []
  modified:
    - apps/docs/src/index.css

key-decisions:
  - "Use Tailwind -400 shades for dark mode chart colors — one step lighter than -500 defaults, preserves hue identity while reducing blinding saturation against near-black backgrounds"
  - "All 16 tokens overridden in a second .dark {} block immediately after the existing .dark block — no modifications to existing CSS"
  - "No TypeScript changes required — CSS cascade into Shadow DOM host via getComputedStyle handles propagation automatically"

requirements-completed: []

duration: <1min
completed: 2026-03-01
---

# Quick Task 6: Dark Mode Chart Color Tokens Summary

**16 CSS custom property overrides in a .dark block mute blinding -500 chart colors to softer -400 Tailwind variants, plus appropriate gray-scale values for grid, axis, tooltip, and legend tokens**

## Performance

- **Duration:** < 1 min
- **Started:** 2026-03-01T21:32:19Z
- **Completed:** 2026-03-01T21:32:46Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments

- Added `.dark` block with 8 muted chart series color overrides (blue/violet/emerald/amber/red/cyan/orange/lime -400 variants) to replace blinding -500 Tailwind defaults on dark backgrounds
- Added dark mode grid line, axis label, axis line, tooltip background/border/text, and legend text token overrides using gray-700 through gray-50 scale
- Toggling `.dark` class on `<html>` now dynamically updates chart colors without page reload via the existing `_colorSchemeObserver` → `_applyThemeUpdate()` → `buildColorUpdate()` chain in BaseChartElement

## Task Commits

1. **Task 1: Add dark mode CSS token overrides for all chart tokens** - `8d4a621` (feat)

## Files Created/Modified

- `apps/docs/src/index.css` — Added `.dark` block with 16 `--ui-chart-*` token overrides immediately after the existing dark mode semantic color block

## Token Values Applied

### Series Colors (light -500 -> dark -400)

| Token | Light Mode (fallback) | Dark Mode override |
|-------|----------------------|-------------------|
| `--ui-chart-color-1` | `#3b82f6` blue-500 | `#60a5fa` blue-400 |
| `--ui-chart-color-2` | `#8b5cf6` violet-500 | `#a78bfa` violet-400 |
| `--ui-chart-color-3` | `#10b981` emerald-500 | `#34d399` emerald-400 |
| `--ui-chart-color-4` | `#f59e0b` amber-500 | `#fbbf24` amber-400 |
| `--ui-chart-color-5` | `#ef4444` red-500 | `#f87171` red-400 |
| `--ui-chart-color-6` | `#06b6d4` cyan-500 | `#22d3ee` cyan-400 |
| `--ui-chart-color-7` | `#f97316` orange-500 | `#fb923c` orange-400 |
| `--ui-chart-color-8` | `#84cc16` lime-500 | `#a3e635` lime-400 |

### Supporting Tokens

| Token | Light Mode (fallback) | Dark Mode override |
|-------|----------------------|-------------------|
| `--ui-chart-grid-line` | `#e5e7eb` gray-200 | `#374151` gray-700 |
| `--ui-chart-axis-label` | `#6b7280` gray-500 | `#9ca3af` gray-400 |
| `--ui-chart-axis-line` | `#d1d5db` gray-300 | `#4b5563` gray-600 |
| `--ui-chart-tooltip-bg` | `#ffffff` white | `#1f2937` gray-800 |
| `--ui-chart-tooltip-border` | `#e5e7eb` gray-200 | `#374151` gray-700 |
| `--ui-chart-tooltip-text` | `#111827` gray-900 | `#f9fafb` gray-50 |
| `--ui-chart-legend-text` | `#374151` gray-700 | `#d1d5db` gray-300 |

## Decisions Made

- Used -400 Tailwind shade variants for dark mode series colors rather than lowering opacity or desaturating — preserves full hue identity while providing sufficient contrast reduction against oklch(0.10 0 0) dark background
- Placed overrides in a second `.dark {}` block rather than merging into the existing one — keeps the semantic color block clean and chart tokens clearly scoped

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dark mode chart colors are now comfortable to view on dark backgrounds across all 8 chart types (line, area, bar, pie, scatter, heatmap, candlestick, treemap)
- ThemeBridge token resolution is automatic — no chart component changes needed
- Light mode fallbacks in theme-bridge.ts are unchanged

---
*Quick task: 6*
*Completed: 2026-03-01*
