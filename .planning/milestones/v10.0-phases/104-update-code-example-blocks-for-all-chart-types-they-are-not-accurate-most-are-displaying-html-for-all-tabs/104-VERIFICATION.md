---
phase: 104-update-code-example-blocks-for-all-chart-types-they-are-not-accurate-most-are-displaying-html-for-all-tabs
verified: 2026-03-01T21:30:00Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 104: Update Code Example Blocks Verification Report

**Phase Goal:** Fix the ExampleBlock code examples in all 8 chart doc pages so each framework tab (HTML, React, Vue, Svelte) shows idiomatic per-framework code instead of the same HTML string repeated.
**Verified:** 2026-03-01T21:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                    | Status     | Evidence                                                                                                          |
|----|----------------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------|
| 1  | The React tab in LineChartPage shows useRef+useEffect code, not HTML with a script tag                  | VERIFIED   | `lineChartReact` at lines 114-128 of LineChartPage.tsx — useRef(null), useEffect, if (ref.current) guard         |
| 2  | The Vue tab in LineChartPage shows a template+script setup+onMounted pattern                            | VERIFIED   | `lineChartVue` at lines 130-145 — `<template>`, `<script setup>`, `ref(null)`, `onMounted`, `chart.value.data`   |
| 3  | The Svelte tab in LineChartPage shows a bind:this+onMount pattern                                       | VERIFIED   | `lineChartSvelte` at lines 147-160 — `let chart`, `onMount`, `bind:this={chart}`                                 |
| 4  | All 4 framework tabs in AreaChartPage show idiomatic per-framework code                                 | VERIFIED   | 4 distinct variables (areaChartHtml/React/Vue/Svelte) each with correct framework idiom, wired at lines 231-237  |
| 5  | All 4 framework tabs in BarChartPage show idiomatic per-framework code                                  | VERIFIED   | 4 distinct variables (barChartHtml/React/Vue/Svelte), wired to ExampleBlock at lines 205-211                     |
| 6  | All 4 framework tabs in PieChartPage show idiomatic per-framework code                                  | VERIFIED   | 4 distinct variables (pieChartHtml/React/Vue/Svelte), wired to ExampleBlock at lines 222-228                     |
| 7  | The React tab in ScatterChartPage shows useRef+useEffect code with [x, y] tuple data                   | VERIFIED   | `scatterChartReact` lines 101-118 — useRef, useEffect, data as [x,y] tuples (no { name, data } wrapper)         |
| 8  | The Vue tab in HeatmapChartPage sets xCategories, yCategories, and data via chart.value.* in onMounted | VERIFIED   | `heatmapChartVue` lines 141-158 — all 3 assignments: chart.value.xCategories, chart.value.yCategories, chart.value.data |
| 9  | The Svelte tab in CandlestickChartPage includes the OHLC order warning comment                          | VERIFIED   | `candlestickChartSvelte` line 175 — `// IMPORTANT: ohlc order is [open, close, low, high] — NOT OHLC acronym order` |
| 10 | All 4 framework tabs in TreemapChartPage show hierarchical data with children property                  | VERIFIED   | All 4 treemap variables include `children: [...]` nodes; wired to ExampleBlock at lines 263-268                  |
| 11 | The candlestick HTML example does NOT include enable-webgpu                                             | VERIFIED   | `candlestickChartHtml` line 117: `<lui-candlestick-chart id="chart"></lui-candlestick-chart>` — no enable-webgpu |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact                                                         | Expected                                          | Status     | Details                                                                                     |
|------------------------------------------------------------------|---------------------------------------------------|------------|---------------------------------------------------------------------------------------------|
| `apps/docs/src/pages/charts/LineChartPage.tsx`                   | 4 separate per-framework code strings             | VERIFIED   | Contains lineChartHtml, lineChartReact, lineChartVue, lineChartSvelte — all substantive      |
| `apps/docs/src/pages/charts/AreaChartPage.tsx`                   | 4 separate per-framework code strings             | VERIFIED   | Contains areaChartHtml, areaChartReact, areaChartVue, areaChartSvelte                        |
| `apps/docs/src/pages/charts/BarChartPage.tsx`                    | 4 separate per-framework code strings             | VERIFIED   | Contains barChartHtml, barChartReact, barChartVue, barChartSvelte                            |
| `apps/docs/src/pages/charts/PieChartPage.tsx`                    | 4 separate per-framework code strings             | VERIFIED   | Contains pieChartHtml, pieChartReact, pieChartVue, pieChartSvelte; { name, value } data shape |
| `apps/docs/src/pages/charts/ScatterChartPage.tsx`                | 4 separate per-framework code strings             | VERIFIED   | Contains scatterChartHtml, scatterChartReact, scatterChartVue, scatterChartSvelte             |
| `apps/docs/src/pages/charts/HeatmapChartPage.tsx`                | 4 separate per-framework code strings, 3 props    | VERIFIED   | All 4 variants assign xCategories, yCategories, and data                                     |
| `apps/docs/src/pages/charts/CandlestickChartPage.tsx`            | 4 per-framework strings with OHLC warning, no webgpu | VERIFIED | OHLC warning in all 4 strings; HTML, React, Vue, Svelte strings confirmed; no enable-webgpu  |
| `apps/docs/src/pages/charts/TreemapChartPage.tsx`                | 4 per-framework strings with hierarchical data    | VERIFIED   | All 4 strings contain children array; breadcrumb attribute present                           |

### Key Link Verification

| From                                           | To                              | Via                                          | Status   | Details                                                                                |
|------------------------------------------------|---------------------------------|----------------------------------------------|----------|----------------------------------------------------------------------------------------|
| lineChartHtml / lineChartReact / lineChartVue / lineChartSvelte | ExampleBlock props          | html={lineChartHtml} react={...} vue={...} svelte={...} | WIRED | Lines 225-231 of LineChartPage.tsx — 4 distinct variables each passed to matching prop |
| areaChartHtml / areaChartReact / areaChartVue / areaChartSvelte | ExampleBlock props          | distinct variable per prop                   | WIRED    | Lines 231-237 of AreaChartPage.tsx                                                     |
| barChartHtml / barChartReact / barChartVue / barChartSvelte     | ExampleBlock props          | distinct variable per prop                   | WIRED    | Lines 205-211 of BarChartPage.tsx                                                      |
| pieChartHtml / pieChartReact / pieChartVue / pieChartSvelte     | ExampleBlock props          | distinct variable per prop                   | WIRED    | Lines 222-228 of PieChartPage.tsx                                                      |
| scatterChartHtml / scatterChartReact / scatterChartVue / scatterChartSvelte | ExampleBlock props | distinct variable per prop              | WIRED    | Lines 201-207 of ScatterChartPage.tsx                                                  |
| heatmapChartReact / heatmapChartVue / heatmapChartSvelte — xCategories assignment | ExampleBlock react/vue/svelte props | all 3 vars assign xCategories, yCategories, data | WIRED | React: ref.current.xCategories; Vue: chart.value.xCategories; Svelte: chart.xCategories |
| candlestickChartHtml / React / Vue / Svelte — OHLC warning      | all 4 ExampleBlock tab strings  | inline comment in each string                | WIRED    | HTML: HTML comment; React/Vue/Svelte: JS comment — all 4 confirmed                    |
| treemapChartHtml / React / Vue / Svelte — children property      | ExampleBlock props              | distinct variable per prop                   | WIRED    | Lines 263-268 of TreemapChartPage.tsx; all strings contain `children: [...]`           |

### Requirements Coverage

No dedicated requirement IDs were declared for this phase (docs fix). Both plans had `requirements: []`. No entries in REQUIREMENTS.md map to phase 104. Nothing to cross-reference — no orphaned requirements.

### Anti-Patterns Found

No anti-patterns detected across any of the 8 modified files:

- No `TODO`, `FIXME`, `XXX`, `HACK`, or `PLACEHOLDER` comments
- No `return null`, `return {}`, `return []`, or stub implementations
- No old `*HtmlCode` variable names remaining — confirmed via grep (zero matches)
- All framework code strings are substantive (React strings: 10+ lines each; Vue: 15+ lines; Svelte: 15+ lines)
- All ExampleBlock calls pass 4 distinct named variables — no prop receives the same variable as another

### Human Verification Required

The following cannot be verified programmatically:

#### 1. Framework Tab Switching

**Test:** Visit `/charts/line-chart` in a browser. Click each of the 4 code tabs (HTML, React, Vue, Svelte).
**Expected:** Each tab shows distinct code appropriate to that framework. React tab shows `useRef`/`useEffect`. Vue tab shows `<template>` + `<script setup>`. Svelte tab shows `bind:this`. HTML tab shows `document.querySelector`.
**Why human:** Tab switching behavior depends on `FrameworkContext` and `ExampleBlock` runtime rendering — cannot verify tab selection state from static code analysis.

#### 2. Heatmap Example Completeness

**Test:** Visit `/charts/heatmap-chart`, open each code tab, and confirm the displayed code assigns all three properties.
**Expected:** All 4 tabs show `xCategories`, `yCategories`, and `data` assignments. The chart would not render with any of the three missing.
**Why human:** The string content is correct in source but visual rendering in the code block must be confirmed.

#### 3. Candlestick OHLC Warning Visibility

**Test:** Visit `/charts/candlestick-chart` and open each of the 4 code tabs.
**Expected:** The OHLC order warning comment (`// IMPORTANT: ohlc order is [open, close, low, high] — NOT OHLC acronym order`) is visible in the displayed code for React, Vue, and Svelte tabs; the HTML comment is visible in the HTML tab.
**Why human:** Comment display depends on syntax highlighting behavior in the rendered code block component.

### Gaps Summary

No gaps. All 11 must-have truths verified. All 8 artifacts exist, contain substantive idiomatic per-framework code, and are correctly wired to ExampleBlock props with distinct variables. No old `*HtmlCode` variable names remain anywhere in the codebase. The phase goal is fully achieved.

---

_Verified: 2026-03-01T21:30:00Z_
_Verifier: Claude (gsd-verifier)_
