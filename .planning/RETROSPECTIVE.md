# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v8.0 — Design System Polish

**Shipped:** 2026-02-28
**Phases:** 19 (69-87) | **Plans:** 55

### What Was Built

- Authored THEME-SPEC.md — authoritative monochrome design token reference covering all `--ui-*` defaults, ensuring all 18 subsequent component phases had a concrete spec to match against
- Removed hardcoded `.dark { --ui-*: ... }` overrides from all 18 components — dark mode now cascades via semantic tokens; only true exceptions (oklch literals, white values) retained per-component
- Expanded CSS token documentation across all 18 docs pages — significant expansions: Input 7→16, Select 7→27, Switch 12→26, Time Picker 20→67, Data Table 18→35 entries; all defaults in double-fallback `var()` form
- Rewrote all 18 component skill files with complete token tables and Behavior Notes sections (8-13 entries each) covering state, keyboard nav, dark mode, accessibility, and integration patterns
- Fixed stale token names in skill files (`--lui-*` → `--ui-*`), corrected z-index values (popover 45, toast 55), updated shadow values to match `tailwind.css :root`

### What Worked

- Wave structure (01 style, 02 docs, 03 skill) gave each phase clear, independent tasks — no ambiguity about what was in scope
- THEME-SPEC.md as Phase 69's output meant every subsequent phase had a concrete reference rather than abstract direction
- Small, focused commits per plan made the git log clean and individual changes easy to reason about
- The "double-fallback var() form" pattern (discovered in Phase 72) became a consistent standard applied to all subsequent phases
- Yolo mode + parallel plan execution kept the milestone moving without confirmation bottlenecks

### What Was Inefficient

- Phase 70 confirmed the cleanup pattern; phases 71-87 were essentially mechanical repetition — could have been parallelized more aggressively from Phase 70 onward
- Some skill files had multiple issues (wrong prefix, wrong z-index, wrong shadow, missing tokens) that weren't surfaced until the phase executed — an audit phase beforehand could have batched this discovery
- The v4.0 audit file being present caused a momentary confusing pre-flight check in milestone completion (wrong audit version in directory)

### Patterns Established

- **Double-fallback var() form**: `var(--color-background, var(--ui-color-background))` — use for all color token defaults in docs tables and skill files; single `var()` breaks without `@lit-ui/core` import
- **Semantic dark mode cascade**: Hardcoded `.dark` token blocks should only contain oklch literals and white values that cannot cascade through semantic tokens
- **THEME-SPEC.md first**: Any style polish milestone should start with a token reference document before touching components
- **Behavior Notes sections**: Every skill file should include a Behavior Notes section (8-13 entries) covering the component-specific behaviors that aren't obvious from props/events tables

### Key Lessons

1. Polish milestones with a clear structural pattern (N waves × M components) are well-suited to high parallelism — the v8.0 phases were near-identical in structure and could have used more parallel execution
2. Stale documentation compounds over time — by v7.0, token tables were 3-4x smaller than actual token sets; building accuracy checks into phase execution prevents drift
3. A small "discovery" plan at milestone start (like Phase 69) that produces a spec document pays dividends across all subsequent phases — one authoritative source prevents repeated look-up

### Cost Observations

- Phases executed with sonnet (quality profile)
- 179 commits across 23 days
- Notable: mechanical nature of waves 01-03 made this an efficient milestone; most plans touched exactly 1 file

---

## Milestone: v9.0 — Charts System

**Shipped:** 2026-03-01
**Phases:** 10 (88-97) | **Plans:** 25

### What Was Built

- `@lit-ui/charts` package with `BaseChartElement` abstract class solving all 5 ECharts cross-cutting concerns before any chart was built: SSR guard, WebGL lifecycle (loseContext before dispose), ThemeBridge CSS token resolution, ResizeObserver, and circular buffer streaming
- 8 chart components (Line, Area, Bar, Pie/Donut, Scatter/Bubble with WebGL, Heatmap, Candlestick, Treemap) each with per-chart option builders, registry files for ECharts tree-shaking (~135KB gzipped vs 400KB full), and streaming via `pushData()`
- Dual streaming paths: native `appendData` for Line/Area (avoids `setOption` data-wipe trap); circular buffer + RAF batching for all others; Heatmap and Treemap override `pushData()` with cell-update and no-op semantics respectively
- CLI registry for all 8 chart types, subpath exports (`@lit-ui/charts/line-chart`) for bundler tree-shaking, copy-source starter templates; complete `@lit-ui/charts` distribution parity with all other LitUI packages
- 8 interactive docs pages with live React demos using `useRef+useEffect` for `.data` JS property assignment, PropsTable API references, CSS token tables, and bundle size guidance (DOCS-02)
- 9 AI skill files: main skill router updated (entries 24-32), charts secondary router with full BaseChartElement API + 17 CSS tokens, plus 8 chart sub-skills each with 3+ prominent gotcha warnings (OHLC order, treemap pushData no-op, heatmap JS-only props)

### What Worked

- Front-loading all cross-cutting concerns in Phase 88 (BaseChartElement) meant Phases 89-95 were purely additive — no re-architecting mid-milestone
- Research phase before planning surfaced 5 critical ECharts pitfalls (CRITICAL-01 through CRITICAL-05) that would have been painful to discover during implementation; `setOption` wipes appendData data is especially non-obvious
- One-phase-per-chart type structure (89: Line+Area, 90: Bar, 91: Pie, etc.) gave clean isolation and enabled parallel plan execution within each phase
- Pinning ECharts to 5.6.0 + echarts-gl 2.0.9 upfront avoided mid-milestone version compatibility issues
- Phase 97 (skill file updates) treated as a first-class phase rather than an afterthought — resulted in comprehensive skill coverage with chart-specific gotcha warnings in multiple locations

### What Was Inefficient

- Phase 96 (CLI + Docs) had 4 plans but was effectively Wave 2 (docs pages) waiting on Wave 1 (subpath exports + registry) — could have been planned as a 2-wave phase for better parallelism
- The `095-` / `096-` directory naming (with leading zero) diverged from the `88-` / `89-` convention, causing the `roadmap analyze` tool to report those phases as missing; minor but created confusing readiness output during milestone completion

### Patterns Established

- **BaseChartElement-first**: For any complex integration with a third-party library (ECharts, Three.js, etc.), always build the abstract base class with all cross-cutting concerns before any concrete implementation
- **Dual streaming paths**: `appendData` for time-series (never `setOption` after streaming starts); circular buffer + RAF for all other chart types — document this boundary prominently in skill files
- **Chart sub-skill pattern**: Defer Methods/Events/CSS tokens to a shared cross-reference skill (skills/charts/SKILL.md) rather than duplicating the 17-token table across 8 sub-skills
- **Three-location warnings**: Critical gotcha warnings (OHLC order, heatmap JS-only props, treemap pushData no-op) placed in 3 locations: file header, Props table note, and Behavior Notes — ensures visibility regardless of how the skill is accessed
- **loseContext() before dispose()**: Standard GPU cleanup pattern for any WebGL component — must be documented and enforced in the base class

### Key Lessons

1. The `setOption` vs `appendData` boundary in ECharts is a latent bug source — any time-series chart that mixes both paths will silently wipe streamed data; the correct pattern is appendData-only once streaming starts
2. echarts-gl's `ScatterGL` series ignores per-point `symbolSize` callbacks when using the GPU path — fixed symbol size is a hard GPU limitation, not a bug; document prominently to prevent repeated investigation
3. Treemap's `pushData()` no-op design (rather than attempting cell update) was the correct choice — the hierarchical tree structure has no meaningful "circular buffer" equivalent; force full reassignment instead
4. OhlcBar order `[open, close, low, high]` (not the OHLC acronym order) is a long-standing ECharts quirk that produces silent wrong output if misapplied — the multi-location warning strategy was the right call

### Cost Observations

- Phases executed with sonnet (quality profile), yolo mode
- 10 phases, 25 plans in 2 days
- Notable: BaseChartElement (Phase 88) was the highest-leverage phase — ~8 plans of cross-cutting work condensed into 3 plans; subsequent chart phases were 2 plans each

---

## Milestone: v10.0 — WebGPU Charts

**Shipped:** 2026-03-02
**Phases:** 7 (98-104) | **Plans:** 19

### What Was Built

- WebGPU detection in all 8 chart types via `_detectRenderer()` — SSR-safe (`isServer + typeof navigator`), dispatches `renderer-selected` event; refcounted `GPUDevice` singleton shared across all instances to respect browser device count limits
- O(1) incremental SMA/EMA state machine (`MAStateMachine`) for Candlestick MA overlays — ring-buffer SMA (O(1) push) with warm-up accumulator for EMA, NaN-gap returns null to prevent propagation, CSS token default colors `--ui-chart-color-2..5`, `showType` legend suffix
- 1M+ point streaming for Line/Area — Float32Array ring buffers with per-series routing, `sampling:'lttb'` for zoom-out quality, RAF coalescing via `_flushLineUpdates()`, dispose+reinit `_triggerReset()` at 500K `maxPoints`
- ChartGPU 0.3.2 two-layer canvas for Line/Area — WebGPU canvas at z-index:0 (data pixels), ECharts canvas at z-index:1 (axes/tooltip/DataZoom); percent-space `setZoomRange()` for coordinate sync; full `disconnectedCallback()` cleanup with refcount decrement
- Candlestick WebGPU — 5-tuple OHLC `appendData([index, open, close, low, high])`, `_wasWebGpu` transparent-color gate on ECharts candles, `_gpuFlushedLength` incremental tracking; reverse-init disconnect order identical to line/area
- ExampleBlock code for all 8 chart types (HTML/React/Vue/Svelte) — React uses `useRef+useEffect+if(ref.current)`, Vue uses `ref()+onMounted+chart.value.data`, Svelte uses `let chart+onMount+bind:this`
- Gap fixed post-audit: `_triggerReset()` GPU cleanup added to `line-chart.ts` and `area-chart.ts` — prevents canvas leak and stale refcount on streaming reset (STRM-02, WEBGPU-03)

### What Worked

- Research-first approach for Phase 101 surfaced the ChartGPU `appendData(seriesIndex, pairs)` 2-tuple signature mismatch before implementation committed to the wrong API — saved significant rework
- Making `_detectRenderer()` and `_initChart()` protected in the base class gave Phase 101/103 subclasses clean extensibility without duplicating detection logic
- Keeping all WebGPU state fields (`_gpuChart`, `_gpuResizeObserver`, `_wasWebGpu`, `_gpuFlushedLengths`) in the concrete chart classes (not BaseChartElement) kept the base class clean and phase-isolated
- Triple-slash directive for `@webgpu/types` in `webgpu-device.ts` scoped ambient WebGPU types to one file without polluting the base tsconfig — elegant minimal approach

### What Was Inefficient

- The `_triggerReset()` GPU cleanup gap slipped through phase verification and was only caught by the cross-phase integration audit — the integration checker was valuable; running it before milestone completion rather than after would have prevented the gap reaching archive stage
- Phase 104 (ExampleBlock code) was added late and could have been planned as part of Phase 102 (Docs) since both touched docs pages — the split created minor context duplication

### Patterns Established

- **GPU cleanup order**: For any component with both ECharts and a GPU canvas layer, reverse-init cleanup order must be: RAF cancel → GPU resize observer disconnect → GPU chart dispose → releaseGpuDevice → super — and this same order must be applied in both `disconnectedCallback()` and any `_triggerReset()` path
- **`_wasWebGpu` gate pattern**: When WebGPU renders pixels, ECharts must be told to use transparent colors for those data series — use a `_wasWebGpu` boolean set in `_initWebGpuLayer()` and reset in `_triggerReset()` to gate both `_applyData()` and `_flush*()` paths
- **Percent-space DataZoom sync**: Use ECharts `getOption().dataZoom[0].start/end` + ChartGPU `setZoomRange(start, end)` for GPU/ECharts coordinate alignment — avoids `convertToPixel()` Shadow DOM offsetParent issues
- **Cross-phase integration audit is mandatory**: Phase-level verification passes are not sufficient to catch gaps that span two phases (e.g. a disposal path added in Phase 100 that doesn't account for GPU state added in Phase 101) — run the integration checker before milestone completion

### Key Lessons

1. The `GPUDevice` browser count limit (typically 4-8) is a hard constraint that shapes the entire architecture — singleton with refcounting is not optional; any implementation that acquires devices per-chart-instance will silently fail at 5+ charts
2. ChartGPU's `appendData` signature must be validated against the actual installed version's TypeScript types before planning — the method signature changed between 0.3.x patch versions
3. ECharts `sampling:'lttb'` is zero-config for 1M+ streaming quality — add it to every Line/Area chart option builder from day one; `large:true` + `largeThreshold:2000` pairs with it to control when the WebGL path activates
4. The O(1) vs O(n) MA computation framing was correct — but the real performance win was avoiding the rebuild on every RAF tick, not just per-bar; the `_flushBarUpdates()` incremental path was the key design decision

### Cost Observations

- Phases executed with sonnet (quality profile), yolo mode
- 7 phases, 19 plans in 1 day
- Notable: Phase 98 (WebGPU detection) and Phase 99 (MAStateMachine) were independent of each other and Phase 100 — true parallel execution opportunity; executed sequentially here but could have parallelized in future similar milestones

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 5 | 22 | Initial project setup; manual planning |
| v2.0 | 8 | 27 | Monorepo, SSR — architectural milestone |
| v7.0 | 8 | 28 | TanStack integration, complex component |
| v8.0 | 19 | 55 | Polish pass — high phase count, mechanical pattern |
| v9.0 | 10 | 25 | Third-party integration (ECharts) — BaseChartElement-first architecture |
| v10.0 | 7 | 19 | WebGPU two-layer canvas — GPU singleton, refcounted lifecycle, cross-phase integration audit caught critical gap |

### Cumulative State

| Milestone | LOC | Packages | Components |
|-----------|-----|----------|------------|
| v1.0 | ~4,000 | 1 | 2 |
| v7.0 | ~91,000 | 21 | 21 |
| v8.0 | ~110,000 | 21 | 21 (all polished) |
| v9.0 | ~116,000 | 22 | 27 (21 UI + 8 charts) |
| v10.0 | ~117,000 | 22 | 27 (WebGPU + 1M+ streaming added to 3 charts) |
