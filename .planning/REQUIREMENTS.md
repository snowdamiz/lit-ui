# Requirements: LitUI v10.0 WebGPU Charts

**Defined:** 2026-03-01
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v10.0 Requirements

### Streaming (Line/Area)

- [ ] **STRM-01**: User can stream 1M+ continuous points to Line/Area charts using TypedArray (Float32Array/Float64Array) ring buffers and progressive rendering config without main-thread frame drops
- [ ] **STRM-02**: Line/Area charts automatically prevent heap crashes during long streaming sessions by implementing an external clear+reset+re-append truncation cycle at `maxPoints`
- [ ] **STRM-03**: User can push data to a specific series via `pushData(point, seriesIndex?)` — not just the hardcoded first series
- [ ] **STRM-04**: Line/Area charts apply `sampling: 'lttb'` for high-quality zoom-out rendering without manual decimation

### Moving Average (Candlestick)

- [ ] **MA-01**: Moving average series update in O(1) per new streaming bar using an incremental SMA/EMA state machine instead of O(n) full recompute per RAF frame
- [ ] **MA-02**: MA series automatically assign CSS token default colors (`--ui-chart-color-2` through `--ui-chart-color-5`) when `MAConfig` omits a `color`
- [ ] **MA-03**: MA computation treats NaN closes as gaps (returns `null`, not `NaN`) to prevent NaN propagation through the SMA window and into tooltip display
- [ ] **MA-04**: `MAConfig` supports a `showType` boolean that appends the MA type to the legend label ("MA20 (EMA)" vs "MA20")

### WebGPU Renderer

- [x] **WEBGPU-01**: All chart types auto-detect WebGPU availability via `navigator.gpu` (SSR-safe, inside `firstUpdated()`) and expose a `renderer-selected` custom event and `renderer` readable property with the active renderer tier
- [ ] **WEBGPU-02**: Line and Area charts automatically render data using ChartGPU 0.3.2 (two-layer canvas: WebGPU canvas below for data pixels, ECharts canvas above for axes/tooltip) when WebGPU is available, with coordinate sync via `convertToPixel()` on every `dataZoom` and `rendered` event
- [x] **WEBGPU-03**: All WebGPU chart instances on a page share a single GPUDevice singleton to stay within browser device count limits

## Future Requirements

### Streaming

- **STRM-05**: Line/Area charts support per-series configurable `maxPoints` instead of a single global cap

### Moving Average

- **MA-05**: Full ThemeBridge integration for MA color tokens on dark mode toggle (dark mode toggling of ChartGPU color themes deferred to v10.1)

### WebGPU

- **WEBGPU-04**: WebGPU render path for Scatter/Bubble charts (currently covered by WebGL via echarts-gl; WebGPU would offer higher throughput at 10M+ points)
- **WEBGPU-05**: ECharts 6.0 upgrade + echarts-gl 3.x migration (blocked on echarts-gl publishing ECharts 6 support)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Calendar heatmap mode (PERF-02) | Deferred from v9.0; independent feature; not part of v10.0 scope |
| WMA / MACD / RSI / Bollinger Bands | Complex multi-panel indicators; `getChart()` escape hatch covers power users |
| WebGPU render path for Bar/Pie/Heatmap/Candlestick/Treemap | Bounded point counts; WebGPU overhead exceeds benefit; Canvas is optimal for these types |
| ChartGPU full ThemeBridge (dark mode toggle) | ChartGPU color config API not fully validated; accept init-time CSS token wiring for v10.0 |
| ECharts 6.0 upgrade | echarts-gl 2.x incompatible with ECharts 6.x; no echarts-gl 3.x exists as of 2026-03-01 |
| Automatic MA period detection | Arbitrary heuristics would surprise financial users; require explicit `period` in MAConfig |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRM-01 | Phase 100 | Pending |
| STRM-02 | Phase 100 | Pending |
| STRM-03 | Phase 100 | Pending |
| STRM-04 | Phase 100 | Pending |
| MA-01 | Phase 99 | Pending |
| MA-02 | Phase 99 | Pending |
| MA-03 | Phase 99 | Pending |
| MA-04 | Phase 99 | Pending |
| WEBGPU-01 | Phase 98 | Complete |
| WEBGPU-02 | Phase 101 | Pending |
| WEBGPU-03 | Phase 98 | Complete |

**Coverage:**
- v10.0 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation (v10.0 phases 98-102)*
