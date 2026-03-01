---
phase: 104-update-code-example-blocks-for-all-chart-types-they-are-not-accurate-most-are-displaying-html-for-all-tabs
plan: "01"
subsystem: docs
tags: [docs, examples, framework-support, line-chart, area-chart, bar-chart, pie-chart]
dependency_graph:
  requires: []
  provides: [per-framework ExampleBlock code strings for Line/Area/Bar/Pie chart pages]
  affects: [apps/docs/src/pages/charts/LineChartPage.tsx, apps/docs/src/pages/charts/AreaChartPage.tsx, apps/docs/src/pages/charts/BarChartPage.tsx, apps/docs/src/pages/charts/PieChartPage.tsx]
tech_stack:
  added: []
  patterns: [per-framework code string variables (Html/React/Vue/Svelte), useRef+useEffect pattern for React, ref()+onMounted for Vue, let+onMount+bind:this for Svelte]
key_files:
  created: []
  modified:
    - apps/docs/src/pages/charts/LineChartPage.tsx
    - apps/docs/src/pages/charts/AreaChartPage.tsx
    - apps/docs/src/pages/charts/BarChartPage.tsx
    - apps/docs/src/pages/charts/PieChartPage.tsx
decisions:
  - "Renamed *HtmlCode variables to *Html (removing the 'Code' suffix) to match plan naming convention and distinguish from the React/Vue/Svelte sibling variables"
  - "React pattern uses if (ref.current) guard before setting .data — prevents null ref errors during React strict mode double-invocations"
  - "Vue pattern uses chart.value.data inside onMounted — standard Vue 3 Composition API ref unwrapping"
  - "Svelte pattern uses plain let chart with bind:this — idiomatic Svelte DOM ref binding"
metrics:
  duration: 83s
  completed_date: "2026-03-01"
  tasks_completed: 2
  files_modified: 4
---

# Phase 104 Plan 01: Fix ExampleBlock Per-Framework Code Examples (Line, Area, Bar, Pie Charts) Summary

Fixed 4 chart docs pages — each ExampleBlock now shows idiomatic per-framework code (React useRef/useEffect, Vue ref/onMounted, Svelte bind:this/onMount) instead of the same vanilla HTML string repeated across all tabs.

## What Was Built

Each of the 4 chart docs pages (Line, Area, Bar, Pie) previously had a single `*HtmlCode` variable passed identically to all 4 ExampleBlock props (`html`, `react`, `vue`, `svelte`). This meant developers visiting the React, Vue, or Svelte tabs would see vanilla HTML with a `<script>` tag — useless as a framework-specific copy-paste reference.

The fix replaced each single variable with 4 distinct variables per chart, each containing idiomatic framework code:

| Chart | HTML variable | React variable | Vue variable | Svelte variable |
|-------|--------------|----------------|--------------|-----------------|
| Line  | `lineChartHtml` | `lineChartReact` | `lineChartVue` | `lineChartSvelte` |
| Area  | `areaChartHtml` | `areaChartReact` | `areaChartVue` | `areaChartSvelte` |
| Bar   | `barChartHtml` | `barChartReact` | `barChartVue` | `barChartSvelte` |
| Pie   | `pieChartHtml` | `pieChartReact` | `pieChartVue` | `pieChartSvelte` |

## Framework Patterns Used

**React:** `useRef` + `useEffect` with `if (ref.current)` guard before setting `.data`

**Vue:** `<script setup>` with `ref(null)` + `onMounted` + `chart.value.data = [...]`

**Svelte:** `let chart;` + `onMount` + `bind:this={chart}` on the element

**HTML:** Retained existing `document.querySelector('#chart').data = [...]` pattern

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Fix Line and Area chart page code examples | b2048f8 | LineChartPage.tsx, AreaChartPage.tsx |
| 2 | Fix Bar and Pie chart page code examples | e92dab5 | BarChartPage.tsx, PieChartPage.tsx |

## Deviations from Plan

None — plan executed exactly as written. The `*HtmlCode` → `*Html` rename (dropping "Code" suffix) was specified in the plan itself.

## Verification Results

Task 1 grep count: 12 (matches requirement of >= 12)
Task 2 grep count: 12 (matches requirement of >= 12)
Old `*HtmlCode` variable names in ExampleBlock: 0 (all replaced)

## Self-Check: PASSED

- FOUND: apps/docs/src/pages/charts/LineChartPage.tsx
- FOUND: apps/docs/src/pages/charts/AreaChartPage.tsx
- FOUND: apps/docs/src/pages/charts/BarChartPage.tsx
- FOUND: apps/docs/src/pages/charts/PieChartPage.tsx
- FOUND: commit b2048f8 (Task 1)
- FOUND: commit e92dab5 (Task 2)
