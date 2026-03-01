---
phase: 096-cli-integration-documentation
verified: 2026-03-01T13:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 9/10
  gaps_closed:
    - "Docs app has zero TypeScript errors from chart page JSX usage of lui-xxx-chart elements"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Navigate to /charts/line-chart in the running docs app"
    expected: "Live chart renders with two series (Sales, Revenue), zoom/pan toolbar visible, API props table populated, CSS token table visible, tree-shaking callout visible above demo"
    why_human: "Cannot verify ECharts canvas rendering, chart interactivity, or visual layout programmatically"
  - test: "Navigate to /charts/scatter-chart and scroll to 'Bundle Size' section"
    expected: "Comparison table shows four rows (full import, subpath import, Canvas mode, WebGL mode) with size figures. enable-gl prop description mentions ~200KB lazy-loaded cost."
    why_human: "Cannot verify rendered table layout or readability programmatically"
  - test: "Navigate to /charts/candlestick-chart"
    expected: "Amber warning box appears before or near the PropsTable explaining [open, close, low, high] order is NOT the OHLC acronym order"
    why_human: "Cannot verify visual prominence of warning box"
  - test: "Run 'npx lit-ui add line-chart' in a scratch directory"
    expected: "CLI creates a starter file importing from '@lit-ui/charts/line-chart' with a LitElement wrapper that sets .data in firstUpdated()"
    why_human: "CLI add command execution requires an interactive terminal environment"
---

# Phase 096: CLI Integration + Documentation Verification Report

**Phase Goal:** CLI registry for all 8 chart types, subpath exports, copy-source templates, docs with demos and API tables
**Verified:** 2026-03-01T13:00:00Z
**Status:** passed
**Re-verification:** Yes — after gap closure (gap now fully resolved)

## Re-verification Summary

Previous verification (2026-03-01) had one remaining gap: 3 TS2322 TypeScript errors caused by `lui-xxx-chart` JSX.IntrinsicElements declarations in `LivePreview.tsx` that were typed as bare `HTMLAttributes<HTMLElement>` without chart-specific boolean props (`smooth`, `zoom`, `stacked`, `breadcrumb`).

The fix expanded the three affected declarations to include the missing props:
- `lui-line-chart`: now includes `smooth?: boolean; zoom?: boolean`
- `lui-area-chart`: now includes `smooth?: boolean; stacked?: boolean; zoom?: boolean`
- `lui-treemap-chart`: now includes `breadcrumb?: boolean`

Verification result: `npx tsc --project apps/docs/tsconfig.json --noEmit` exits with **code 0, zero TypeScript errors**.

All previously-verified items regressed cleanly (8 chart pages, 8 routes, 8 nav items, 8 CLI templates, 8 registry entries, 9 dist outputs).

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Developer can import `@lit-ui/charts/line-chart` without TypeScript 'Cannot find module' error | VERIFIED | `packages/charts/package.json` has `./line-chart` through `./treemap-chart` exports; all 9 `dist/*.d.ts` files present |
| 2 | Developer's bundler tree-shakes unused chart modules when using subpath imports | VERIFIED | Vite multi-entry build produces 9 separate named outputs; package.json exports map declares 9 subpaths |
| 3 | All 8 subpath entries resolve to distinct dist/ output files | VERIFIED | `dist/` contains `index.js`, `line-chart.js`, `area-chart.js`, `bar-chart.js`, `pie-chart.js`, `scatter-chart.js`, `heatmap-chart.js`, `candlestick-chart.js`, `treemap-chart.js` plus 9 matching `.d.ts` files |
| 4 | Developer can run 'npx lit-ui add line-chart' (and all 7 others) and receive a working starter file | VERIFIED | 8 chart entries in `registry.json`; 8 `@lit-ui/charts` mappings in `install-component.ts`; CLI builds successfully |
| 5 | Each chart template imports from correct subpath '@lit-ui/charts/[name]' | VERIFIED | All 8 template files contain `import '@lit-ui/charts/[name]'` subpath side-effect import |
| 6 | In npm mode, all 8 chart names map to '@lit-ui/charts' (single package) | VERIFIED | `install-component.ts` has 8 entries, each mapping to `'@lit-ui/charts'` |
| 7 | Developer can navigate to /charts/line-chart (and all 7 others) and see live demo + API table + CSS token table | VERIFIED | 8 `.tsx` page files confirmed; all import subpath, use `useRef+useEffect` for `.data` binding; 8 imports + 8 `<Route>` elements in App.tsx; Charts section in nav.ts |
| 8 | Live demos render actual chart data (not blank/skeleton) using useRef + useEffect pattern | VERIFIED | Each page defines demo with `useRef<HTMLElement>(null)` + `useEffect(() => { (ref.current as any).data = [...] }, [])` |
| 9 | Each chart page shows a tree-shaking callout with correct per-chart subpath | VERIFIED | 8 of 8 pages contain blue callout box with chart-specific subpath |
| 10 | Docs app has zero TypeScript errors from chart page JSX usage of lui-xxx-chart elements | VERIFIED | `tsc --project apps/docs/tsconfig.json --noEmit` exits with code 0. `LivePreview.tsx` lines 356-363 now declare all 8 elements with full chart-specific prop types. |

**Score:** 10/10 truths verified

---

## Required Artifacts

### Plan 01 — Subpath Exports (CLI-02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/charts/vite.config.ts` | Multi-entry Vite build (9 keys) | VERIFIED | Bespoke defineConfig with 9-key entry object, formats: ['es'], rollupOptions.external intact |
| `packages/charts/package.json` | 8 subpath export entries | VERIFIED | `./line-chart` through `./treemap-chart` all present with `import` and `types` conditions |
| `packages/charts/dist/line-chart.js` | Named per-chart output | VERIFIED | All 9 `.js` files present in `dist/` |
| `packages/charts/dist/line-chart.d.ts` | Per-chart type file | VERIFIED | All 9 `.d.ts` files present in `dist/` |

### Plan 02 — CLI Integration (CLI-01, CLI-03)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/cli/src/registry/registry.json` | 8 chart entries with `@lit-ui/charts` dep | VERIFIED | 8 entries; each has `"dependencies": ["@lit-ui/charts"]` |
| `packages/cli/src/utils/install-component.ts` | 8 chart-name -> `@lit-ui/charts` mappings | VERIFIED | All 8 entries present, all map to `'@lit-ui/charts'` |
| `packages/cli/src/templates/line-chart.ts` | `LINE_CHART_TEMPLATE` with subpath import | VERIFIED | Template with subpath import and firstUpdated() data binding |
| `packages/cli/src/templates/[area/bar/pie/scatter/heatmap/candlestick/treemap]-chart.ts` | 7 remaining templates | VERIFIED | All 7 files present with correct subpath imports |
| `packages/cli/src/templates/index.ts` | 8 chart exports + `COMPONENT_TEMPLATES` entries | VERIFIED | All 8 exports, imports, and COMPONENT_TEMPLATES entries confirmed |

### Plan 03 — Docs Pages 1-4 (DOCS-01, DOCS-02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/docs/package.json` | `@lit-ui/charts: workspace:*` | VERIFIED | Present |
| `apps/docs/src/pages/charts/LineChartPage.tsx` | Live demo, PropsTable, CSS tokens, callout | VERIFIED | All 4 elements present; subpath import; useRef+useEffect demo; tree-shaking callout |
| `apps/docs/src/pages/charts/AreaChartPage.tsx` | Same as above | VERIFIED | Pattern confirmed |
| `apps/docs/src/pages/charts/BarChartPage.tsx` | Same as above | VERIFIED | Pattern confirmed |
| `apps/docs/src/pages/charts/PieChartPage.tsx` | Same as above | VERIFIED | Pattern confirmed |

### Plan 04 — Docs Pages 5-8 + Routing (DOCS-01, DOCS-02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/docs/src/pages/charts/ScatterChartPage.tsx` | Demo, PropsTable, CSS tokens, bundle size section | VERIFIED | All present; Bundle Size section confirmed |
| `apps/docs/src/pages/charts/HeatmapChartPage.tsx` | Demo with 3 property assignments, PropsTable | VERIFIED | `el.xCategories`, `el.yCategories`, `el.data` set separately in useEffect |
| `apps/docs/src/pages/charts/CandlestickChartPage.tsx` | OHLC order warning, PropsTable | VERIFIED | Amber warning box + PropsTable data description both warn `[open, close, low, high]` order |
| `apps/docs/src/pages/charts/TreemapChartPage.tsx` | Hierarchical demo, PropsTable | VERIFIED | 2-node tree demo; breadcrumb/rounded/level-colors props documented |
| `apps/docs/src/App.tsx` | 8 chart routes under `charts/[name]` | VERIFIED | 8 imports (lines 33-40) + 8 Route elements confirmed |
| `apps/docs/src/nav.ts` | Charts NavSection with 8 items | VERIFIED | Charts section with 8 href items confirmed |
| `apps/docs/src/components/LivePreview.tsx` | 8 lui-xxx-chart JSX.IntrinsicElements declarations with full prop types | VERIFIED | Lines 356-363: all 8 declarations include chart-specific props (smooth, zoom, stacked, breadcrumb, etc.); `tsc --noEmit` exits 0 |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `vite.config.ts` entry object | `dist/line-chart.js` | Vite multi-entry build | WIRED | 9-key entry object drives 9 named outputs |
| `package.json ./line-chart` | `dist/line-chart.js` | Node.js exports field | WIRED | Import condition `./dist/line-chart.js` maps to verified dist file |
| `registry.json` chart entries | `install-component.ts` componentToPackage | CLI add command | WIRED | Both have all 8 chart names; registry uses `@lit-ui/charts` dep |
| `templates/index.ts` COMPONENT_TEMPLATES | `line-chart.ts` (and 7 others) | `getComponentTemplate()` lookup | WIRED | All 8 entries in COMPONENT_TEMPLATES; all 8 templates exported and imported |
| `LineChartPage.tsx` | `@lit-ui/charts/line-chart` | side-effect import | WIRED | `import '@lit-ui/charts/line-chart'` confirmed |
| `LineChartDemo` component | `lui-line-chart .data` | `useRef + useEffect` | WIRED | `useRef<HTMLElement>(null)` + `useEffect` data binding confirmed |
| `App.tsx` imports | 8 chart page components | React Router `<Route>` elements | WIRED | 8 imports + 8 Route elements confirmed |
| `nav.ts` Chart section | chart route paths `/charts/...` | NavSection `href` field | WIRED | 8 href entries confirmed |
| `LivePreview.tsx` IntrinsicElements | `lui-xxx-chart` JSX usage in chart pages | TypeScript global augmentation | WIRED | 8 typed declarations; tsc exits 0 with no errors |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| CLI-01 | Plan 02 | Developer can install any chart via `npx lit-ui add [chart-name]` | SATISFIED | 8 entries in registry.json; 8 mappings in install-component.ts; CLI builds cleanly |
| CLI-02 | Plan 01 | Subpath exports for per-chart tree-shaking | SATISFIED | 9 subpaths in package.json; 9 named dist outputs; vite multi-entry config verified |
| CLI-03 | Plan 02 | Working copy-source starter template for each of 8 chart types | SATISFIED | 8 template files with subpath imports, firstUpdated() data binding, working Lit component bodies |
| DOCS-01 | Plans 03, 04 | Interactive demo, API table, CSS token table for each chart type | SATISFIED | 8 pages with demos, PropsTable, CSSVarDef tables; 8 routes in App.tsx; 8 nav items; tsc exits 0 |
| DOCS-02 | Plans 03, 04 | Bundle size documentation (Canvas vs WebGL, per-chart tree-shaking) | SATISFIED | ScatterChartPage has full bundle size table; all 8 pages have tree-shaking callout with per-chart subpath |

---

## Anti-Patterns Found

No blocker anti-patterns found. No stub implementations, empty handlers, or placeholder returns in any phase 96 files. All chart templates contain real Lit component code. All docs pages contain real demo data and complete JSX. TypeScript compiles cleanly with no errors.

---

## Human Verification Required

### 1. Live Chart Rendering

**Test:** Start the docs dev server and navigate to `/charts/line-chart`.
**Expected:** A live ECharts line chart renders with two series (Sales, Revenue), zoom/pan toolbar is interactive, the blue tree-shaking callout appears above the chart, the Props table shows all entries, and the CSS token table is visible below.
**Why human:** ECharts renders to a `<canvas>` element — verifying actual chart output, axis labels, legend, and tooltip behavior requires a browser.

### 2. Bundle Size Section

**Test:** Navigate to `/charts/scatter-chart` and scroll past the demo and props table.
**Expected:** A "Bundle Size" section with a comparison table: full import (~350KB+), subpath import (~135KB), Canvas mode (0 extra), WebGL mode (+~200KB lazy). Recommendation paragraph appears below the table.
**Why human:** Visual layout and table readability cannot be verified programmatically.

### 3. CandlestickChartPage OHLC Warning

**Test:** Navigate to `/charts/candlestick-chart`.
**Expected:** An amber/yellow callout box is visible before or near the props table, warning that `ohlc` array order is `[open, close, low, high]` and NOT the standard OHLC acronym order.
**Why human:** Visual prominence of the warning requires human judgment.

### 4. CLI Copy-Source End-to-End

**Test:** In a temporary directory, run `npx lit-ui add line-chart`. Inspect the generated file.
**Expected:** A `.ts` file is created containing a LitElement that imports from `@lit-ui/charts/line-chart` (subpath, not root), wraps `lui-line-chart`, and sets `.data` in `firstUpdated()` with example data.
**Why human:** CLI add command execution requires an interactive terminal with npm/npx available.

---

## Summary

All 10 must-have truths are now verified. The one remaining gap from the previous verification — TypeScript errors from chart-specific boolean props in JSX — has been fully resolved. The three affected `JSX.IntrinsicElements` declarations in `apps/docs/src/components/LivePreview.tsx` (lines 356-363) now include the missing props:

- `lui-line-chart`: `smooth?: boolean; zoom?: boolean`
- `lui-area-chart`: `smooth?: boolean; stacked?: boolean; zoom?: boolean`
- `lui-treemap-chart`: `breadcrumb?: boolean`

`tsc --project apps/docs/tsconfig.json --noEmit` exits with code 0. No regressions detected across all previously-verified items (9 dist outputs, 8 chart pages, 8 routes, 8 nav items, 8 CLI templates, 8 registry entries).

Phase 096 goal is achieved. Four items remain for human verification (visual rendering, bundle size table layout, OHLC warning prominence, CLI end-to-end).

---

_Verified: 2026-03-01T13:00:00Z_
_Verifier: Claude (gsd-verifier)_
