---
status: awaiting_human_verify
updated: 2026-03-01T01:30:00Z
trigger: "charts-not-rendering-echarts-dom-size"
created: 2026-03-01T00:00:00Z
---

## Current Focus

hypothesis: (1) Candlestick: boundaryGap:false on category xAxis causes first/last candle to clip at edges; no right grid margin makes date label overflow. Fix: boundaryGap:true + grid right margin + barMaxWidth on series. (2) Treemap: notMerge:true on setOption does not reset the ECharts treemap internal navigation stack (currentRoot path) — so the chart retains stale drill-down state from a prior interactive session. Fix: dispatch treemapRootToNode action after setOption to always reset to root view.
test: (1) Read candlestick-option-builder.ts — confirmed boundaryGap:false at line 152 and grid with no right margin. (2) Read treemap-chart.ts — notMerge:true is in dist, but ECharts treemap series stores currentRoot in its own internal model which notMerge:true does not reset (it replaces the option object, not the renderer state). treemapRootToNode action is the ECharts-documented way to navigate to root programmatically.
expecting: After fix: (1) Last candle no longer clips; candle width is capped. (2) Treemap always opens at root view showing Electronics and Clothing tiles, regardless of prior drill-down state.
next_action: Apply both fixes, rebuild @lit-ui/charts, verify.

## Symptoms

expected: Charts render correctly in the docs app
actual: Charts are blank/invisible — nothing renders (even after width fix, ECharts initializes but shows empty canvas)
errors: |
  [ECharts] Can't get DOM width or height. Please check dom.clientWidth and dom.clientHeight. They should not be 0.
  (Resolved by ExampleBlock w-full fix. Remaining symptom: blank canvas with no data)
reproduction: Navigate to any chart page in the docs app
started: Unknown — may have never worked or broke recently

## Eliminated

- hypothesis: ECharts initialized before element is in DOM (constructor/wrong lifecycle)
  evidence: base-chart-element.ts uses firstUpdated() with await updateComplete + RAF, which correctly defers until element is painted
  timestamp: 2026-03-01T00:01:00Z

- hypothesis: ResizeObserver or missing resize observer
  evidence: ResizeObserver is wired correctly in _initChart() on the inner #chart container
  timestamp: 2026-03-01T00:01:00Z

- hypothesis: Zero-width container causing ECharts to reject initialization
  evidence: Fixed by adding w-full to ExampleBlock.tsx inner wrapper. ECharts no longer emits DOM size warnings. But charts still blank — different root cause.
  timestamp: 2026-03-01T00:04:00Z

- hypothesis: _applyData() fix applied to source was already in built dist
  evidence: dist/base-chart-element-C-qcWMJe.js (built Feb 28 23:40) had zero references to _applyData. Source was modified Mar 1 00:27 — after the old dist was built. Grep confirmed no _applyData in old dist.
  timestamp: 2026-03-01T00:30:00Z

## Evidence

- timestamp: 2026-03-01T00:00:30Z
  checked: packages/charts/src/base/base-chart-element.ts
  found: :host has `display: block; width: 100%; height: var(--ui-chart-height, 300px)`. init() called inside RAF in firstUpdated() after updateComplete. Initialization targets inner `#chart` div (position: absolute; inset: 0; width: 100%; height: 100%).
  implication: The component itself is correctly implemented. The width/height issue must come from how the host element's parent is sized.

- timestamp: 2026-03-01T00:01:00Z
  checked: apps/docs/src/components/ExampleBlock.tsx lines 47-48
  found: Preview container is `<div className="relative p-8 flex items-center justify-center min-h-[120px] ...">`. Inner wrapper is `<div className="relative w-full">{preview}</div>` — already has w-full.
  implication: Width fix was already applied correctly. Container has full width.

- timestamp: 2026-03-01T00:01:30Z
  checked: All 8 chart page components (LineChartPage, BarChartPage, AreaChartPage, PieChartPage, etc.)
  found: All use same pattern: `<ExampleBlock preview={<XxxChartDemo />} .../>`. Every chart demo element has `style={{ height: '300px', display: 'block' }}` but NO explicit width.
  implication: All 8 charts are affected by the same root cause in ExampleBlock.tsx.

- timestamp: 2026-03-01T00:04:00Z
  checked: LineChartPage.tsx (LineChartDemo) + base-chart-element.ts _initChart() + all 8 chart subclasses
  found: React useEffect sets ref.current.data after DOM mount. At that point, _initChart() RAF has NOT fired yet (this._chart = null). Lit's updated() guard `if (!this._chart) return` prevents _applyData() from running. When _initChart() finally runs and sets this._chart, it only applies this.option (line 304) and this.loading (line 305) — it NEVER calls _applyData(). All 8 subclasses have private _applyData() only reachable via updated(), which is too early.
  implication: this.data is set with real data, but ECharts setOption() is never called with that data. Chart renders an empty canvas. This is the root cause for ALL 8 chart types.

- timestamp: 2026-03-01T00:30:00Z
  checked: packages/charts/dist/base-chart-element-C-qcWMJe.js (old stale dist)
  found: grep for _applyData returned zero results. File timestamp Feb 28 23:40, source modified Mar 1 00:27. The source fix existed but dist was never rebuilt.
  implication: The docs app imports from dist/ (package.json exports -> dist/). The stale dist never had the fix. All previous human testing was running the unfixed code despite source being correct.

- timestamp: 2026-03-01T00:30:00Z
  checked: pnpm --filter @lit-ui/charts build output
  found: Build succeeded. New dist/base-chart-element-Cwz5ZtxM.js (11.42KB, built Mar 1 00:30). grep confirmed _applyData at line 103 (method definition) and line 191 (call in _initChart). line-chart.js also confirmed with _applyData override and call in updated().
  implication: The fix is now compiled into dist. Docs dev server needs to pick up the new files (restart or HMR).

- timestamp: 2026-03-01T01:00:00Z
  checked: ScatterChartPage.tsx demo data vs scatter-option-builder.ts ScatterPoint type
  found: Demo passes `{ x: 10, y: 20 }` objects. ScatterPoint is `[number, number] | [number, number, number]`. ECharts scatter series requires array tuples, not objects. buildScatterOption passes data directly to series.data — ECharts sees objects and renders nothing.
  implication: Fix demo data to pass `[x, y]` arrays instead of `{x, y}` objects.

- timestamp: 2026-03-01T01:00:00Z
  checked: HeatmapChartPage.tsx demo data vs heatmap-option-builder.ts HeatmapCell type
  found: Demo passes `{ x: 0, y: 0, value: 85 }` objects. HeatmapCell is `[number, number, number]`. ECharts heatmap needs `[xIdx, yIdx, value]` arrays. buildHeatmapOption passes data directly — ECharts sees objects. The cells with x=0 (Mon) and x=4 (Fri) can't render because the data format is wrong, causing partial/missing render.
  implication: Fix demo data to pass `[x, y, value]` arrays instead of `{x, y, value}` objects.

- timestamp: 2026-03-01T01:00:00Z
  checked: CandlestickChartPage.tsx demo data vs CandlestickBarPoint type in candlestick-option-builder.ts
  found: Demo passes `{ date: '2024-01-01', ohlc: [...] }`. CandlestickBarPoint expects `{ label: string, ohlc: OhlcBar }`. Field name is `label`, not `date`. In buildCandlestickOption: `const labels = bars.map((b) => b.label)` — every b.label is undefined because the demo uses `date`. xAxis.data becomes `[undefined, undefined, undefined, undefined, undefined]`, which ECharts renders as "undefined" text. Also: with only 5 candles and no zoom start, the candles spread across full width with boundaryGap: false.
  implication: Fix demo data: rename `date` key to `label` in all 5 bar objects.

- timestamp: 2026-03-01T01:00:00Z
  checked: TreemapChartPage.tsx demo + treemap-chart.ts _applyData() + treemap-option-builder.ts
  found: Demo data is correctly shaped `TreemapNode[]` with parent+children hierarchy. buildTreemapOption passes data directly to series[0].data. The bug is in treemap-chart.ts _applyData(): `this._chart.setOption(option, { notMerge: false })`. On initial render, notMerge: false causes ECharts to merge with the empty chart state. ECharts treemap internal navigation stack is not reset — it retains a stale drill-down position, so the initial render shows child nodes as root. Fix: use `notMerge: true` in _applyData() for treemap so the full option replaces state cleanly on each data assignment.
  implication: Fix treemap-chart.ts _applyData() to use notMerge: true.

- timestamp: 2026-03-01T01:30:00Z
  checked: candlestick-option-builder.ts single-grid layout (lines 146-159)
  found: boundaryGap: false on category xAxis. This removes the half-interval padding normally added at the start and end of a category axis, causing the first candle to sit at x=0 and the last candle at x=max. With wide date labels like "2024-01-05", the label overflows the chart container and is clipped. Additionally grid has no right margin. The 5-candle spread across full width is correct ECharts behavior (not a bug), but the clipping was caused by these two settings.
  implication: Fix: boundaryGap:true (restores default category axis padding), grid.right:'8%' (reserves space for edge labels), barMaxWidth:40 (caps candle body width on small datasets).

- timestamp: 2026-03-01T01:30:00Z
  checked: treemap-chart.ts _applyData() post-checkpoint — notMerge:true already applied in dist. Investigated why drill-down still showed stale state.
  found: notMerge:true in setOption replaces the ECharts option object but does NOT flush the treemap renderer model's "currentRoot" path. The treemap navigation state is maintained inside the ECharts series model object (which is not part of the option schema and is not reset by notMerge). When a user drills down to "Electronics > Laptops" and then data is reassigned (e.g. after React HMR or page revisit), notMerge:true replaces the data but ECharts treemap re-renders from the last-known root path. Fix: dispatch treemapRootToNode action (seriesIndex:0, no targetNode) after setOption — this instructs ECharts treemap renderer to navigate to root programmatically, correctly resetting the breadcrumb and tile layout.
  implication: dispatchAction treemapRootToNode is the only reliable way to reset treemap navigation state without destroying and recreating the ECharts instance.

- timestamp: 2026-03-01T01:31:00Z
  checked: packages/charts/dist/candlestick-chart.js and dist/treemap-chart.js after rebuild
  found: candlestick-chart.js line 35: barMaxWidth:40. line 64: right:"8%". lines 65/95/102: boundaryGap:!0 (true). treemap-chart.js line 76: setOption(r,{notMerge:!0}),this._chart.dispatchAction({type:"treemapRootToNode",seriesIndex:0}).
  implication: Both fixes are confirmed in the production build. No TypeScript errors.

## Resolution

root_cause: |
  Four-layer failure (all now fixed):
  1. Timing race (FIXED PREV): React useEffect sets .data before _initChart() RAF fires; _initChart() never called _applyData(). Fixed by adding _applyData() call to _initChart() and rebuilding dist.
  2. Data format mismatches in docs demos (FIXED PREV):
     - Scatter demo passed {x,y} objects; ScatterPoint requires [x,y] arrays.
     - Heatmap demo passed {x,y,value} objects; HeatmapCell requires [xIdx,yIdx,value] arrays.
     - Candlestick demo used field name `date`; CandlestickBarPoint.label is `label`.
  3. Candlestick clipping (FIXED NOW): xAxis had boundaryGap:false on category axis, causing first/last candles to sit flush at the axis edges — last candle label "2024-01-05" was clipped. No right grid margin compounded the issue. Fix: boundaryGap:true + grid.right:'8%' + barMaxWidth:40 on series (caps wide candles on small datasets). Same fix applied to both single-grid and two-grid (volume) layouts.
  4. Treemap navigation state persistence (FIXED NOW): notMerge:true on setOption replaces the option object but does NOT reset the ECharts treemap internal navigation stack (currentRoot path stored in the renderer model outside the option). A stale drill-down from a prior interactive session (e.g. "Electronics > Laptops") persisted across subsequent setOption calls. Fix: dispatch treemapRootToNode action (seriesIndex:0) immediately after setOption to programmatically navigate back to root on every data assignment.
fix: |
  (Previous fixes unchanged)
  NOW — Candlestick (packages/charts/src/shared/candlestick-option-builder.ts):
    - candlestickSeries: added barMaxWidth: 40
    - Single-grid: grid[0] changed from {} to { containLabel: true, right: '8%' }
    - Single-grid: xAxis[0] boundaryGap: false -> true
    - Two-grid: xAxis[0] and xAxis[1] boundaryGap: false -> true
  NOW — Treemap (packages/charts/src/treemap/treemap-chart.ts):
    - _applyData(): after setOption(option, { notMerge: true }), added:
      this._chart.dispatchAction({ type: 'treemapRootToNode', seriesIndex: 0 })
  Rebuilt @lit-ui/charts: build succeeded zero TS errors.
  Confirmed in dist: candlestick-chart.js line 35 (barMaxWidth:40), line 64 (right:"8%"), lines 65/95/102 (boundaryGap:!0).
  Confirmed in dist: treemap-chart.js line 76 (dispatchAction treemapRootToNode after setOption).
verification: Build confirmed. Awaiting human verification of both remaining bugs.
files_changed:
  - apps/docs/src/components/ExampleBlock.tsx (previous — w-full on preview wrapper)
  - packages/charts/src/base/base-chart-element.ts (previous — _applyData no-op + call in _initChart)
  - packages/charts/src/line/line-chart.ts (previous — protected override _applyData)
  - packages/charts/src/area/area-chart.ts (previous — protected override _applyData)
  - packages/charts/src/bar/bar-chart.ts (previous — protected override _applyData)
  - packages/charts/src/pie/pie-chart.ts (previous — protected override _applyData)
  - packages/charts/src/scatter/scatter-chart.ts (previous — protected override _applyData)
  - packages/charts/src/heatmap/heatmap-chart.ts (previous — protected override _applyData)
  - packages/charts/src/candlestick/candlestick-chart.ts (previous — protected override _applyData)
  - packages/charts/src/treemap/treemap-chart.ts (NOW: dispatchAction treemapRootToNode in _applyData)
  - packages/charts/src/shared/candlestick-option-builder.ts (NOW: boundaryGap:true + right:'8%' + barMaxWidth:40)
  - apps/docs/src/pages/charts/ScatterChartPage.tsx (previous — data format fix)
  - apps/docs/src/pages/charts/HeatmapChartPage.tsx (previous — data format fix)
  - apps/docs/src/pages/charts/CandlestickChartPage.tsx (previous — date->label field rename)
  - packages/charts/dist/ (rebuilt — both fixes in candlestick-chart.js and treemap-chart.js)
