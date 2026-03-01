---
phase: 095-treemap-chart
plan: "02"
subsystem: charts
tags:
  - treemap
  - echarts
  - lit-component
  - public-api
dependency_graph:
  requires:
    - packages/charts/src/shared/treemap-option-builder.ts
    - packages/charts/src/treemap/treemap-registry.ts
  provides:
    - packages/charts/src/treemap/treemap-chart.ts
    - packages/charts/src/index.ts (Phase 95 exports)
  affects:
    - @lit-ui/charts public API
tech_stack:
  added: []
  patterns:
    - Lit component extending BaseChartElement
    - ECharts setOption with notMerge: false for drill-down state preservation
    - JSON attribute parsing with array-of-arrays validation
    - Custom element registration guard pattern
key_files:
  created:
    - packages/charts/src/treemap/treemap-chart.ts
  modified:
    - packages/charts/src/index.ts
decisions:
  - "notMerge: false in _applyData() — preserves current drill-down state when props change (Pitfall 5 defense)"
  - "pushData() overridden with console.warn no-op — prevents base class circular-buffer from overwriting hierarchical data (Pitfall 4 defense)"
  - "_parseLevelColors() validates array-of-arrays with Array.isArray(entry) — rejects flat string array (Pitfall 3 defense)"
  - "No disconnectedCallback() override needed — no component-owned RAF handle unlike LuiCandlestickChart"
  - "breadcrumb default true — ECharts breadcrumb navigation enabled by default for discoverability"
  - "rounded prop maps to borderRadius: 6 when true, 0 when false — fixed value per plan spec"
metrics:
  duration: 1min
  completed_date: "2026-03-01"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 95 Plan 02: LuiTreemapChart Component + Index Exports Summary

**One-liner:** LuiTreemapChart Lit component wiring buildTreemapOption() + registerTreemapModules() with breadcrumb/rounded/level-colors props, exported from @lit-ui/charts public API alongside TreemapNode and TreemapOptionProps types.

## What Was Built

Two deliverables completing Phase 95 and the entire @lit-ui/charts chart system:

1. **`packages/charts/src/treemap/treemap-chart.ts`** — LuiTreemapChart web component:
   - Extends BaseChartElement following the candlestick-chart.ts pattern exactly
   - `breadcrumb` boolean prop (default: true) — toggles ECharts built-in navigation bar
   - `rounded` boolean prop (default: false) — maps to borderRadius: 6/0 in buildTreemapOption()
   - `level-colors` string attribute — JSON-encoded string[][] parsed by `_parseLevelColors()`
   - `_applyData()` using `notMerge: false` to preserve drill-down state (Pitfall 5)
   - `pushData()` override with console.warn no-op (Pitfall 4 defense)
   - `lui-treemap-chart` custom element registered with `customElements.get()` guard

2. **`packages/charts/src/index.ts`** — Phase 95 export block appended:
   - `export { LuiTreemapChart }` from treemap-chart.js
   - `export type { TreemapNode, TreemapOptionProps }` from treemap-option-builder.js
   - Follows Phase 89-94 pattern with `// Phase 95: Treemap Chart` comment header

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create treemap-chart.ts (LuiTreemapChart component) | d68b67e | packages/charts/src/treemap/treemap-chart.ts |
| 2 | Add Phase 95 exports to index.ts | ad68785 | packages/charts/src/index.ts |

## Decisions Made

1. **notMerge: false in _applyData()** — Preserves the user's current drill-down state when any prop changes. Using notMerge: true would reset to root view on every property update, breaking UX during interactive exploration (Pitfall 5 from RESEARCH.md).

2. **pushData() no-op with console.warn** — Treemap has no streaming requirement. Overriding without calling super prevents base class _circularBuffer from overwriting hierarchical TreemapNode[] data with a flat array (Pitfall 4 from RESEARCH.md).

3. **_parseLevelColors() validates array-of-arrays** — Uses `Array.isArray(entry)` filter to reject flat string arrays. A flat string[] would pass to buildTreemapOption() as levelColors causing silent rendering failures where all levels share a single color palette (Pitfall 3 from RESEARCH.md).

4. **No disconnectedCallback() override** — LuiTreemapChart owns no RAF handle (no _barRafId equivalent). Base class handles chart disposal. Only LuiCandlestickChart and LuiHeatmapChart needed disconnectedCallback() due to their component-owned RAF handles.

5. **breadcrumb default: true** — ECharts breadcrumb navigation enabled by default for discoverability. Users can disable with `breadcrumb="false"` or `:breadcrumb="${false}"` in frameworks.

6. **rounded maps to fixed 6px borderRadius** — Consistent with plan spec. The 0/6 mapping is simple and predictable; buildTreemapOption() handles the borderRadius decrement-by-depth logic for nested levels.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `packages/charts/src/treemap/treemap-chart.ts` exists and exports `LuiTreemapChart`
2. `packages/charts/src/index.ts` exports `LuiTreemapChart`, `TreemapNode`, `TreemapOptionProps`
3. `npx tsc --noEmit -p packages/charts/tsconfig.json` exits with zero errors
4. `lui-treemap-chart` custom element registered via `customElements.define` guard
5. `_parseLevelColors` validates array-of-arrays (Pitfall 3 defense confirmed)
6. `pushData()` override emits console.warn, does NOT call super (Pitfall 4 defense confirmed)
7. `_applyData()` uses `notMerge: false` (Pitfall 5 defense confirmed)

## Phase 95 Complete

All Phase 95 requirements delivered across both plans:
- **TREE-01**: LuiTreemapChart renders hierarchical { name, value, children[] } data as ECharts treemap
- **TREE-02**: breadcrumb, rounded, and level-colors props all implemented and wired through buildTreemapOption()
- @lit-ui/charts public API exports LuiTreemapChart, TreemapNode, TreemapOptionProps

## Self-Check: PASSED

Files verified:
- FOUND: packages/charts/src/treemap/treemap-chart.ts
- FOUND: packages/charts/src/index.ts (Phase 95 exports at lines 36-37)

Commits verified:
- FOUND: d68b67e (feat(095-02): create LuiTreemapChart component)
- FOUND: ad68785 (feat(095-02): add Phase 95 treemap exports to index.ts)
