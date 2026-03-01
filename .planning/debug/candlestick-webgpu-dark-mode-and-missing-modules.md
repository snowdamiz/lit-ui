---
status: resolved
trigger: "Candlestick chart is stuck in dark mode (wrong styling) and throws two errors: 1. ChartGPU: Candlestick series rendering is not yet implemented. 2. TypeError: Cannot destructure property 'ScatterGLChart' of undefined."
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:10:00Z
---

## Current Focus

hypothesis: All root causes identified and fixed. Resolution confirmed by successful build.
next_action: Human verify in docs app (dev server rebuild required)

## Symptoms

expected: Candlestick chart renders correctly respecting the current theme (light/dark), with no console errors.
actual:
  1. Chart is stuck in a dark mode appearance that is not even the correct neutral dark mode styling.
  2. Console error: "ChartGPU: Candlestick series rendering is not yet implemented. Series will be skipped."
  3. Console error: "Uncaught (in promise) TypeError: Cannot destructure property 'ScatterGLChart' of 'undefined' as it is undefined." thrown at _registerModules -> _initChart.
errors: |
  index-BdTB-cGM-BVMj8r-g.js:1260 ChartGPU: Candlestick series rendering is not yet implemented. Series will be skipped.
  index-B796vSkM.js:12326 Uncaught (in promise) TypeError: Cannot destructure property 'ScatterGLChart' of 'undefined' as it is undefined.
    at Yre (index-B796vSkM.js:12326:6716)
    at async s8._registerModules (index-B796vSkM.js:12326:7721)
    at async s8._initChart (index-B796vSkM.js:12104:11727)
reproduction: Navigate to the candlestick chart page in the docs app.
timeline: Recent — likely introduced with WebGPU/WebGL chart infrastructure work.

## Eliminated

- hypothesis: ScatterGLChart is missing from echarts-gl/charts module
  evidence: echarts-gl 2.0.9 lib/export/charts.js line 8 exports ScatterGLChart. File exists at echarts-gl/charts.js -> echarts-gl/lib/export/charts.js
  timestamp: 2026-03-01

- hypothesis: ChartGPU 0.3.2 doesn't have a candlestick renderer
  evidence: OptionResolver-R_gJDRSD.js line 6648 calls Re[L].render(Pt) for candlestick type. Source map includes createCandlestickRenderer.ts. The series IS rendered - warning is misleading stale code.
  timestamp: 2026-03-01

- hypothesis: ScatterGLChart error from scatter chart page being rendered on candlestick URL
  evidence: React Router <Routes> only renders matched route; CandlestickChartPage is matched, not ScatterChartPage. Error is from Vite build artifact double-transformation.
  timestamp: 2026-03-01

## Evidence

- timestamp: 2026-03-01
  checked: ChartGPU defaultOptions in node_modules/.pnpm/chartgpu@0.3.2/.../dist/types/config/defaults.d.ts
  found: defaultOptions.theme = "dark" — no explicit light default
  implication: Any ChartGPU.create() call without theme property defaults to dark rendering

- timestamp: 2026-03-01
  checked: candlestick-chart.ts _initWebGpuLayer() method
  found: ChartGPU.create(gpuHost, gpuSeries, { device, adapter }) — no theme property in gpuSeries
  implication: ChartGPU always initializes with dark theme, ignoring the page's actual light/dark mode

- timestamp: 2026-03-01
  checked: OptionResolver-R_gJDRSD.js line 6957-6962 (ChartGPU 0.3.2 source)
  found: Fu() function emits console.warn("ChartGPU: Candlestick series rendering is not yet implemented. Series will be skipped.") but rendering DOES proceed after the warning
  implication: The warning is a false alarm / leftover from earlier dev phase. Cannot fix without patching library.

- timestamp: 2026-03-01
  checked: apps/docs/dist/assets/index-B796vSkM.js line 12326 (bundled docs app, old build)
  found: const{ScatterGLChart:o}=await at(async()=>{...return{ScatterGLChart:n}},deps).then(n=>n.x)
  implication: Vite's docs app bundler wraps the preload with at() which returns {ScatterGLChart:n} object; then .then(n=>n.x) accesses .x on that object (undefined), causing the TypeError

- timestamp: 2026-03-01
  checked: packages/charts/dist/scatter-chart.js line 14 (old dist)
  found: import("./charts-Cq5qOhYE.js").then((s) => s.x) — charts package Vite creates namespace accessor for echarts-gl/charts
  implication: When docs app Vite reprocesses this, the namespace accessor pattern is corrupted because at() returns the named export object, then .then(s=>s.x) gets undefined

- timestamp: 2026-03-01
  checked: packages/charts/vite.config.ts rollupOptions.external (before fix)
  found: Only ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//] are external; echarts-gl is NOT external
  implication: echarts-gl gets bundled into charts-Cq5qOhYE.js with namespace export 'x'; when docs app Vite reimports this, the double-transform creates the undefined error

- timestamp: 2026-03-01
  checked: New docs build (index-01UjovME.js) after fix
  found: ScatterGLChart now resolved via import("./charts-CriyPH6T.js").then(i=>i._) inside the at() closure — no outer .then(n=>n.x), ScatterGLChart properly destructured
  implication: ScatterGLChart TypeError is fixed

- timestamp: 2026-03-01
  checked: New docs build (index-01UjovME.js) after fix
  found: theme:document.documentElement.classList.contains("dark")?"dark":"light" in gpuSeries; _gpuColorSchemeObserver with setOption({theme}) on class change
  implication: Dark mode fix is applied in dist

## Resolution

root_cause: |
  FOUR separate root causes:
  1. DARK MODE (prior): _initWebGpuLayer() created ChartGPU without a theme property; ChartGPU 0.3.2 defaulted to theme:'dark'. Fixed in prior session by passing theme:'dark'|'light'.
  2. STALE WARNING: ChartGPU 0.3.2 OptionResolver has a stale console.warn in the 'candlestick' switch branch. Cannot fix without patching library.
  3. SCATTERGL IMPORT (prior): echarts-gl bundled into namespace chunk. Fixed by marking echarts-gl external in vite.config.ts.
  4. WRONG BG COLOR (new): Even with theme:'dark'|'light', ChartGPU's built-in themes use hardcoded hex backgrounds (#1a1a2e dark-navy / #ffffff white) that don't match the docs palette (oklch(0.10 0 0) dark / oklch(1 0 0) light). ChartGPU's WebGPU canvas uses alphaMode:"opaque" (hardcoded in index.js:268), so true transparency is impossible. The canvas always clears to its backgroundColor before rendering.
fix: |
  4. BG COLOR FIX — packages/charts/src/candlestick/candlestick-chart.ts:
     - Added _GpuThemeConfig interface (mirrors chartgpu ThemeConfig without importing the type)
     - Updated _GpuCandlestickInstance.setOption() to accept theme: 'dark'|'light'|_GpuThemeConfig
     - Added _buildGpuTheme(isDark) private method:
       * Reads document.body computed backgroundColor (getComputedStyle returns resolved rgb() string)
       * Returns full ThemeConfig with page bg + correct dark/light axis/text colors
       * All fields explicit because ChartGPU's resolver falls back to dark theme for missing fields
     - _initWebGpuLayer() now calls _buildGpuTheme(isDark) instead of passing string 'dark'|'light'
     - _gpuColorSchemeObserver callback now calls _buildGpuTheme(isDarkNow) on theme change
verification: |
  - charts package rebuilt successfully (5.26s, no TypeScript errors)
  - docs app rebuilt successfully (3.65s)
files_changed:
  - packages/charts/src/candlestick/candlestick-chart.ts
