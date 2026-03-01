---
phase: 91-pie-donut-chart
plan: 02
subsystem: charts
tags: [lit, echarts, pie-chart, donut-chart, web-components, streaming]
dependency_graph:
  requires: [91-01]
  provides: [LuiPieChart, lui-pie-chart custom element, Phase 91 public API]
  affects: [packages/charts/dist/index.d.ts, @lit-ui/charts public API]
tech_stack:
  added: []
  patterns: [BaseChartElement extension pattern, SSR-safe custom element registration, pie-registry dynamic import]
key_files:
  created:
    - packages/charts/src/pie/pie-chart.ts
  modified:
    - packages/charts/src/index.ts
decisions:
  - "No _streamingMode override in LuiPieChart — inherits 'buffer' default from BaseChartElement (STRM-04)"
  - "centerLabel passed as undefined when empty string — prevents ECharts layout interference from empty title key"
  - "innerRadius declared @property without type converter — HTML attribute arrives as string; buildPieOption handles string '0' as pie mode"
metrics:
  duration: 2min
  completed: 2026-02-28
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 91 Plan 02: LuiPieChart Component + Index Exports Summary

**One-liner:** LuiPieChart Lit web component wiring pie-registry and pie-option-builder into a streaming-capable, SSR-safe custom element with full Phase 91 public API exports.

## What Was Built

Created `LuiPieChart` (lui-pie-chart), a Lit custom element extending BaseChartElement. The component mirrors the Phase 90 LuiBarChart pattern exactly, replacing bar-specific props with three pie-specific reactive properties: `minPercent` (PIE-01 small-slice merging), `innerRadius` (PIE-02 donut mode), and `centerLabel` (PIE-02 donut center text). Updated `packages/charts/src/index.ts` with the Phase 91 public API section, exporting `LuiPieChart`, `PieSlice`, and `PieOptionProps` from `@lit-ui/charts`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create LuiPieChart component (pie-chart.ts) | a0a001f | packages/charts/src/pie/pie-chart.ts |
| 2 | Update index.ts exports and verify full build | 56d32dd | packages/charts/src/index.ts |

## Decisions Made

1. **No `_streamingMode` override** — LuiPieChart inherits `'buffer'` from BaseChartElement. STRM-04 compliance: appendData only works for line series; pie charts always use circular buffer + setOption.

2. **`centerLabel || undefined` pattern** — Empty string `''` is passed as `undefined` to `buildPieOption`. This prevents an empty `title` key from being injected into the ECharts option when no center label is set, avoiding layout interference.

3. **`innerRadius` without `type` converter** — The `@property({ attribute: 'inner-radius' })` declaration has no `type:` field, so the attribute value arrives as a string from HTML. `buildPieOption`'s `isDonut` guard handles `string '0'` as falsy/pie-mode, matching numeric `0`.

## Verification

Full Vite build passes with zero errors. `dist/index.d.ts` contains all three Phase 91 declarations:
- `export declare class LuiPieChart extends BaseChartElement`
- `export declare type PieSlice = { name: string; value: number; }`
- `export declare type PieOptionProps = { minPercent?: number; innerRadius?: string | number; centerLabel?: string; }`

TypeScript compilation (`tsc --noEmit`) passes with zero errors.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- FOUND: packages/charts/src/pie/pie-chart.ts
- FOUND: packages/charts/src/index.ts
- FOUND: commit a0a001f (feat(91-02): implement LuiPieChart component)
- FOUND: commit 56d32dd (feat(91-02): add LuiPieChart and pie type exports to index.ts)
