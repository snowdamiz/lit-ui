---
phase: 095-treemap-chart
plan: "01"
subsystem: charts
tags:
  - treemap
  - echarts
  - option-builder
  - registry
dependency_graph:
  requires:
    - packages/charts/src/registry/canvas-core.ts
  provides:
    - packages/charts/src/shared/treemap-option-builder.ts
    - packages/charts/src/treemap/treemap-registry.ts
  affects:
    - packages/charts/src/index.ts (next plan)
tech_stack:
  added: []
  patterns:
    - ECharts per-chart option builder (pure function)
    - ECharts per-chart module registry with double-registration guard
key_files:
  created:
    - packages/charts/src/shared/treemap-option-builder.ts
    - packages/charts/src/treemap/treemap-registry.ts
  modified: []
decisions:
  - "height: '90%' (not calc()) used when breadcrumb shown — ECharts layout cannot resolve CSS calc()"
  - "Only TreemapChart in use([TreemapChart]) — BreadcrumbComponent does not exist in echarts/components; breadcrumb is built into TreemapChart"
  - "levelColors uses string[][] (per-level color arrays) matching ECharts levels[n].color: string[] format"
  - "borderRadius decremented by level depth: Math.max(0, borderRadius - i) — inner levels get smaller radius"
  - "seriesItemStyle fallback applies borderRadius directly on series when levelColors is empty and borderRadius > 0"
metrics:
  duration: 2min
  completed_date: "2026-03-01"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 95 Plan 01: Treemap Option Builder + Registry Summary

**One-liner:** Treemap domain layer with hierarchical TreemapNode types, buildTreemapOption() returning ECharts treemap series config, and registerTreemapModules() with TreemapChart-only registration.

## What Was Built

Two files establishing the treemap domain layer following the identical pattern from Phases 89-94:

1. **`packages/charts/src/shared/treemap-option-builder.ts`** — Pure function + types:
   - `TreemapNode` type (name, value, children hierarchy)
   - `TreemapOptionProps` type (breadcrumb, borderRadius, levelColors)
   - `buildTreemapOption(data, props)` returning valid ECharts option with `type: 'treemap'`

2. **`packages/charts/src/treemap/treemap-registry.ts`** — ECharts module registration:
   - `registerTreemapModules()` async function
   - Double-registration guard via `_treemapRegistered` module-level boolean
   - Calls `registerCanvasCore()` first, then registers only `TreemapChart` via `use()`

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create treemap-option-builder.ts | 8c4a38f | packages/charts/src/shared/treemap-option-builder.ts |
| 2 | Create treemap-registry.ts | 2f61cb0 | packages/charts/src/treemap/treemap-registry.ts |

## Decisions Made

1. **height: '90%' not calc()** — ECharts layout engine cannot resolve CSS calc(). Used '90%' string literal to reserve space for breadcrumb bar when shown (Pitfall 1 from RESEARCH.md).

2. **No BreadcrumbComponent import** — Breadcrumb navigation is built into TreemapChart itself. There is no separate BreadcrumbComponent in echarts/components. Importing a non-existent module causes runtime errors (Pitfall 2 from RESEARCH.md).

3. **levelColors as string[][]** — Per-level colors must be arrays of arrays. Each element is a color palette for one depth level matching ECharts levels[n].color: string[] format. A flat string[] would cause the entire treemap to use a single color (Pitfall 3 from RESEARCH.md).

4. **borderRadius decrements by depth** — Inner levels get Math.max(0, borderRadius - i) to create natural visual hierarchy where outer cells have more rounding than inner cells.

5. **seriesItemStyle fallback** — When levelColors is empty but borderRadius > 0, applies borderRadius directly on the series itemStyle so single-level treemaps still get rounded cells.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Zero TypeScript errors on both files
- All three RESEARCH.md anti-patterns avoided: no BreadcrumbComponent, no calc(), no flat level-colors
- Exports match plan specification: TreemapNode, TreemapOptionProps, buildTreemapOption, registerTreemapModules
- `use([TreemapChart])` contains only TreemapChart — no BarChart, LineChart, or BreadcrumbComponent

## Self-Check: PASSED

Files verified:
- FOUND: packages/charts/src/shared/treemap-option-builder.ts
- FOUND: packages/charts/src/treemap/treemap-registry.ts

Commits verified:
- FOUND: 8c4a38f (feat(095-01): create treemap-option-builder.ts)
- FOUND: 2f61cb0 (feat(095-01): create treemap-registry.ts)
