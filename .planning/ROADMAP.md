# Roadmap: LitUI

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-24)
- ✅ **v2.0 NPM + SSR** - Phases 6-20 (shipped 2026-01-25)
- ✅ **v3.0 Theme Customization** - Phases 21-24 (shipped 2026-01-25)
- ✅ **v3.1 Docs Dark Mode** - Phases 25-27 (shipped 2026-01-25)
- ✅ **v4.0 Form Inputs** - Phases 28-30 (shipped 2026-01-26)
- ✅ **v4.1 Select Component** - Phases 31-37 (shipped 2026-01-27)
- ✅ **v4.2 Form Controls** - Phases 38-41 (shipped 2026-01-27)
- ✅ **v4.3 Date/Time Components** - Phases 42-50 (shipped 2026-02-02)
- ✅ **v5.0 Overlay & Feedback** - Phases 51-55 (shipped 2026-02-02)
- ✅ **v6.0 Layout Components** - Phases 56-60 (shipped 2026-02-02)
- ✅ **v7.0 Data Table** - Phases 61-68 (shipped 2026-02-05)
- ✅ **v8.0 Design System Polish** - Phases 69-87 (shipped 2026-02-28)
- ✅ **v9.0 Charts System** - Phases 88-97 (shipped 2026-03-01)
- 🔄 **v10.0 WebGPU Charts** - Phases 98-102 (in progress)

## Phases

<details>
<summary>✅ v1.0 through v8.0 (Phases 1-87) — SHIPPED 2026-02-28</summary>

Phases 1-87 are archived. See:
- `.planning/milestones/v8.0-ROADMAP.md`
- `.planning/milestones/v7.0-ROADMAP.md` (v7.0 and earlier)

</details>

<details>
<summary>✅ v9.0 Charts System (Phases 88-97) — SHIPPED 2026-03-01</summary>

- [x] Phase 88: Package Foundation + BaseChartElement (3/3 plans) — completed 2026-02-28
- [x] Phase 89: Line Chart + Area Chart (2/2 plans) — completed 2026-02-28
- [x] Phase 90: Bar Chart (2/2 plans) — completed 2026-02-28
- [x] Phase 91: Pie + Donut Chart (2/2 plans) — completed 2026-02-28
- [x] Phase 92: Scatter + Bubble Chart with WebGL (2/2 plans) — completed 2026-02-28
- [x] Phase 93: Heatmap Chart (2/2 plans) — completed 2026-02-28
- [x] Phase 94: Candlestick Chart (2/2 plans) — completed 2026-03-01
- [x] Phase 95: Treemap Chart (2/2 plans) — completed 2026-03-01
- [x] Phase 96: CLI Integration + Documentation (4/4 plans) — completed 2026-03-01
- [x] Phase 97: Update Chart Skills (4/4 plans) — completed 2026-03-01

Full phase details archived to `.planning/milestones/v9.0-ROADMAP.md`

</details>

## v10.0 WebGPU Charts (Phases 98-102)

- [x] **Phase 98: WebGPU Detector + Renderer Infrastructure** (2 plans) (completed 2026-03-01)
- [x] **Phase 99: Incremental Moving Average State Machine** (3 plans) (completed 2026-03-01)
- [x] **Phase 100: 1M+ Streaming Infrastructure for Line/Area** (3 plans) (completed 2026-03-01)
- [ ] **Phase 101: WebGPU Two-Layer Canvas for Line/Area** (N plans)
- [ ] **Phase 102: Docs + Skills Update** (N plans)

## Phase Details

### Phase 98: WebGPU Detector + Renderer Infrastructure
**Goal**: All chart types can auto-detect WebGPU availability at runtime and expose the active renderer tier without crashing SSR or consuming resources on unsupported browsers
**Depends on**: Phase 97 (v9.0 complete)
**Requirements**: WEBGPU-01, WEBGPU-03
**Success Criteria** (what must be TRUE):
  1. Calling `document.querySelector('lui-line-chart').renderer` returns `'webgpu'`, `'webgl'`, or `'canvas'` depending on browser capability — no exceptions thrown
  2. The `renderer-selected` custom event fires on every chart instance during `firstUpdated()` with the correct renderer string in `event.detail.renderer`
  3. Opening the same page in a browser without WebGPU silently uses Canvas without console errors or visual breakage
  4. A Next.js App Router SSR build with chart components imported completes without `navigator is not defined` or `gpu is not defined` errors
  5. All chart instances on a page that support WebGPU share a single GPUDevice — the browser device count limit is not exceeded even with 10 chart instances rendered simultaneously
**Plans**: 2 plans
Plans:
- [ ] 98-01-PLAN.md — Install @webgpu/types and create GPUDevice singleton module (webgpu-device.ts)
- [ ] 98-02-PLAN.md — Add WebGPU detection to BaseChartElement and export RendererTier

### Phase 99: Incremental Moving Average State Machine
**Goal**: Candlestick charts with MA overlays compute each new moving average value in O(1) time per streaming bar, with correct gap handling and readable legend labels
**Depends on**: Phase 97 (v9.0 complete); independent of Phases 98 and 100
**Requirements**: MA-01, MA-02, MA-03, MA-04
**Success Criteria** (what must be TRUE):
  1. Streaming 1000 bars/second to a candlestick chart with 3 MA overlays does not cause frame time to increase as total bar count grows — MA computation time stays constant per frame regardless of dataset size
  2. An `MAConfig` with no `color` property renders each MA line in a visually distinct color drawn from `--ui-chart-color-2` through `--ui-chart-color-5` — MA lines are not all black or all the same color
  3. A bar with `close: NaN` in the streaming data does not produce a `NaN` tooltip value or a visible spike in the MA line — the MA series shows a gap at that bar and resumes correctly on the next valid close
  4. An `MAConfig` with `showType: true` and `type: 'ema'` renders the legend label as "MA20 (EMA)" rather than "MA20"
**Plans**: 3 plans
Plans:
- [ ] 99-01-PLAN.md — TDD: MAStateMachine O(1) SMA/EMA state machine with NaN gap handling
- [ ] 99-02-PLAN.md — Update MAConfig type, option builder API, and add readChartToken() to BaseChartElement
- [ ] 99-03-PLAN.md — Wire _maStateMachines[] into LuiCandlestickChart (_applyData + _flushBarUpdates)

### Phase 100: 1M+ Streaming Infrastructure for Line/Area
**Goal**: Line and Area charts can sustain continuous point streaming well past 1M total points without tab crashes, main-thread frame drops, or data loss at zoom-out
**Depends on**: Phase 97 (v9.0 complete); independent of Phases 98 and 99
**Requirements**: STRM-01, STRM-02, STRM-03, STRM-04
**Success Criteria** (what must be TRUE):
  1. Streaming 1000 points/second to a Line chart for 20 minutes (1.2M total points) does not crash the tab or cause sustained frame drops — the chart remains interactive throughout
  2. A Line chart configured with `maxPoints: 500000` automatically clears and resets without user intervention when the point count reaches the limit — the chart continues rendering new data seamlessly after the reset
  3. `pushData({ value: [timestamp, price] }, 1)` routes the new point to the second series (`seriesIndex: 1`) — the first series is not modified
  4. Zooming out on a Line chart with 1M+ streamed points renders a smooth, representative curve — not a flat line or missing segments — because LTTB decimation supplies ECharts with a high-quality 2K-point summary
**Plans**: 3 plans
Plans:
- [ ] 100-01-PLAN.md — Make _initChart() protected + add sampling:lttb/large flags to buildLineOption()
- [ ] 100-02-PLAN.md — LuiLineChart: ring-buffer pushData override with seriesIndex routing and maxPoints truncation
- [ ] 100-03-PLAN.md — LuiAreaChart: identical ring-buffer streaming override as LuiLineChart

### Phase 101: WebGPU Two-Layer Canvas for Line/Area
**Goal**: Line and Area charts on WebGPU-capable browsers render their data series via a ChartGPU 0.3.2 canvas layer beneath the ECharts axes canvas, with coordinate systems kept in sync across DataZoom interactions
**Depends on**: Phase 98 (GPUDevice singleton, renderer detection), Phase 100 (ring buffer infrastructure, LTTB utility)
**Requirements**: WEBGPU-02
**Success Criteria** (what must be TRUE):
  1. A Line chart on a Chrome/Edge browser with WebGPU enabled renders 1M+ streaming points at a stable 60fps without ECharts' appendData performance ceiling — the CPU-side JS time per frame is measurably lower than the Canvas fallback path at the same point count
  2. After dragging the DataZoom slider on a WebGPU-rendered Line chart, the data series pixels align correctly with the ECharts axis tick marks — there is no horizontal or vertical offset between the WebGPU canvas layer and the ECharts canvas layer
  3. On a browser without WebGPU, the same Line chart renders correctly using the ECharts Canvas path with no visual difference to the user and no JavaScript errors in the console
  4. Destroying a chart component (removing it from the DOM) releases the GPUDevice resources — `device.destroy()` is called and the WebGPU canvas is removed — with no memory leak detectable in Chrome DevTools over 10 create/destroy cycles
**Plans**: 3 plans
Plans:
- [ ] 101-01-PLAN.md — Install chartgpu@0.3.2 and upgrade webgpu-device.ts to refcounted lifecycle with GPUAdapter storage
- [ ] 101-02-PLAN.md — LuiLineChart: ChartGPU two-layer canvas with DataZoom sync and full disconnectedCallback() cleanup
- [ ] 101-03-PLAN.md — LuiAreaChart: identical ChartGPU two-layer canvas pattern as LuiLineChart

### Phase 102: Docs + Skills Update
**Goal**: All v10.0 capabilities are documented in the chart skill files and docs pages so that users and AI agents working with the library have accurate, complete references for the new streaming, MA, and WebGPU features
**Depends on**: Phases 98, 99, 100, 101 (all implementation complete)
**Requirements**: (delivery phase — consolidates v10.0 implementation into documentation; no dedicated requirement IDs)
**Success Criteria** (what must be TRUE):
  1. The `line-chart` and `area-chart` skill files include the `enable-webgpu` attribute, `renderer` property, `renderer-selected` event, `maxPoints` property, and `pushData(point, seriesIndex?)` signature — an AI agent reading only the skill file can correctly configure streaming with WebGPU
  2. The `candlestick-chart` skill file documents `MAConfig.showType`, `MAConfig.color` default token behavior, and the NaN-gap rule — including a "Looks Done But Isn't" warning that changing `movingAverages` config after streaming starts requires chart reinit
  3. The WebGPU browser support table (Chrome/Edge: yes, Firefox 141+: yes, Safari 26+: yes, fallback: Canvas) appears in the line-chart and area-chart docs pages so users can set accurate compatibility expectations
  4. The `@lit-ui/charts` bundle size guidance in docs reflects the ChartGPU 0.3.2 addition and clarifies that ChartGPU is only loaded when WebGPU is detected (dynamic import — zero overhead on unsupported browsers)
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 88. Package Foundation + BaseChartElement | v9.0 | 3/3 | Complete | 2026-02-28 |
| 89. Line Chart + Area Chart | v9.0 | 2/2 | Complete | 2026-02-28 |
| 90. Bar Chart | v9.0 | 2/2 | Complete | 2026-02-28 |
| 91. Pie + Donut Chart | v9.0 | 2/2 | Complete | 2026-02-28 |
| 92. Scatter + Bubble Chart with WebGL | v9.0 | 2/2 | Complete | 2026-02-28 |
| 93. Heatmap Chart | v9.0 | 2/2 | Complete | 2026-02-28 |
| 94. Candlestick Chart | v9.0 | 2/2 | Complete | 2026-03-01 |
| 95. Treemap Chart | v9.0 | 2/2 | Complete | 2026-03-01 |
| 96. CLI Integration + Documentation | v9.0 | 4/4 | Complete | 2026-03-01 |
| 97. Update Chart Skills | v9.0 | 4/4 | Complete | 2026-03-01 |
| 98. WebGPU Detector + Renderer Infrastructure | 2/2 | Complete    | 2026-03-01 | — |
| 99. Incremental Moving Average State Machine | 3/3 | Complete    | 2026-03-01 | — |
| 100. 1M+ Streaming Infrastructure for Line/Area | 3/3 | Complete    | 2026-03-01 | — |
| 101. WebGPU Two-Layer Canvas for Line/Area | 2/3 | In Progress|  | — |
| 102. Docs + Skills Update | v10.0 | 0/? | Pending | — |
