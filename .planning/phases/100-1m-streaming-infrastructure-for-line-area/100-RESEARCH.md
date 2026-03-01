# Phase 100: 1M+ Streaming Infrastructure for Line/Area - Research

**Researched:** 2026-03-01
**Domain:** ECharts streaming, TypedArray ring buffers, LTTB decimation, multi-series pushData
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STRM-01 | User can stream 1M+ continuous points to Line/Area charts using TypedArray (Float32Array/Float64Array) ring buffers and progressive rendering config without main-thread frame drops | Ring buffer pattern documented; TypedArray support in ECharts confirmed; `large: true` + `largeThreshold` config found |
| STRM-02 | Line/Area charts automatically prevent heap crashes during long streaming sessions by implementing an external clear+reset+re-append truncation cycle at `maxPoints` | ECharts has no native `removeData`; dispose+reinit is the confirmed workaround; clear+reset pattern from research |
| STRM-03 | User can push data to a specific series via `pushData(point, seriesIndex?)` — not just the hardcoded first series | `appendData({ seriesIndex: N, data })` API confirmed; base pushData() currently hardcodes `seriesIndex: 0` |
| STRM-04 | Line/Area charts apply `sampling: 'lttb'` for high-quality zoom-out rendering without manual decimation | `sampling: 'lttb'` is a native ECharts line series option — no external library needed |
</phase_requirements>

---

## Summary

This phase extends `LuiLineChart` and `LuiAreaChart` to sustain streaming past 1M points without tab crashes or frame drops. The current base-class `pushData()` uses `appendData()` which accumulates data unboundedly — ECharts has no native `removeData` or sliding-window mechanism, so the chart will eventually crash the tab in long-running sessions. Phase 100 replaces the `appendData` path for Line/Area with a ring-buffer + `setOption` pattern (matching the approach the Candlestick chart already uses for its `_ohlcBuffer`), adds `maxPoints`-triggered truncation (STRM-02), adds `seriesIndex` routing to `pushData()` (STRM-03), and wires `sampling: 'lttb'` into the line series option (STRM-04).

The key architectural insight is that `appendData` — though historically used for large data in ECharts — is unreliable for continuous streaming line charts: it accumulates unboundedly, has known rendering bugs with line series in ECharts 5.6 (issue #20734, closed as not-a-bug), and prevents any mixing with `setOption`. The Candlestick chart's proven pattern (`_ohlcBuffer` + `setOption({ lazyUpdate: true })`) is the right model to follow. Each RAF flush replaces the full buffer in ECharts via `setOption` with `lazyUpdate: true`, which preserves DataZoom state while batching the render.

For STRM-01's TypedArray requirement: ECharts natively accepts `Float32Array`/`Float64Array` as `series.data` and stores them more efficiently than plain JS arrays (less heap, GC-friendly). The ring buffer holding incoming points should use a plain JS array internally (for easy `push`/`splice`) but convert to a TypedArray when passing to `setOption`. The `sampling: 'lttb'` option (STRM-04) is a single-line addition to the series options built by `buildLineOption()` and handles zoom-out decimation natively inside ECharts.

**Primary recommendation:** Override `pushData()` in both `LuiLineChart` and `LuiAreaChart` (following the Candlestick pattern), maintain a per-series `_lineBuffer: unknown[][]` indexed by `seriesIndex`, flush via `setOption({ lazyUpdate: true })` each RAF, add `maxPoints`-triggered dispose+reinit for STRM-02, and add `sampling: 'lttb'` to `buildLineOption()`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | 5.6.0 (pinned) | Chart rendering, setOption, DataZoom, lttb sampling | Already in project; version pinned for echarts-gl compatibility |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Float32Array (native) | ES2015+ | Efficient point storage passed to ECharts series.data | Pass to setOption instead of plain JS array for better GC behavior at 1M+ points |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Ring buffer + setOption (recommended) | appendData path (current) | appendData accumulates unboundedly; no removeData in ECharts; line chart rendering bugs in 5.6; setOption with lazyUpdate is the safe and proven path |
| Native `sampling: 'lttb'` in ECharts | External `downsample-lttb` npm package | Native is simpler, zero deps, already in ECharts 5.x; external library only needed if ECharts lttb behavior proves insufficient |
| dispose+reinit on truncation | `chart.clear()` on truncation | `chart.clear()` has known residue bugs; dispose+reinit is the officially recommended full reset pattern |

**Installation:** No new packages needed. All capabilities exist in the already-pinned `echarts@5.6.0`.

---

## Architecture Patterns

### Recommended Project Structure

No new files needed. Changes are localized to:

```
packages/charts/src/
├── line/
│   └── line-chart.ts         # Override pushData(), add _lineBuffers, _lineRafId, _pointsStreamed
├── area/
│   └── area-chart.ts         # Same overrides as line-chart.ts (identical pattern)
└── shared/
    └── line-option-builder.ts  # Add sampling: 'lttb' to series config (STRM-04)
```

### Pattern 1: Per-Series Ring Buffer (STRM-01 + STRM-03)

**What:** Each series has its own buffer array. `pushData(point, seriesIndex?)` routes the point to `_lineBuffers[seriesIndex ?? 0]`. RAF flush calls `setOption` with all buffer contents as `series[i].data`.

**When to use:** Any time points arrive faster than 60fps, or when total points exceed `maxPoints`.

**Example:**
```typescript
// Source: Derived from candlestick-chart.ts pattern (line 147-163) + STRM-03 requirement

export class LuiLineChart extends BaseChartElement {
  constructor() {
    super();
    // Do NOT set _streamingMode = 'appendData' — override pushData() entirely instead
  }

  // Per-series ring buffers — index matches ECharts series index
  private _lineBuffers: unknown[][] = [[]];

  // Total points ever pushed — used for maxPoints truncation
  private _totalPoints = 0;

  // Component-owned RAF handle (same pattern as _barRafId in candlestick-chart.ts)
  private _lineRafId?: number;

  // Track whether streaming has started — needed for _isStreaming guard
  private _isStreaming = false;

  override pushData(point: unknown, seriesIndex = 0): void {
    this._isStreaming = true;
    // Grow buffer array to accommodate seriesIndex
    while (this._lineBuffers.length <= seriesIndex) {
      this._lineBuffers.push([]);
    }
    this._lineBuffers[seriesIndex].push(point);
    this._totalPoints++;

    // STRM-02: truncation at maxPoints
    if (this._totalPoints >= this.maxPoints) {
      this._triggerReset();
      return;
    }

    if (this._lineRafId === undefined) {
      this._lineRafId = requestAnimationFrame(() => {
        this._flushLineUpdates();
        this._lineRafId = undefined;
      });
    }
  }
  // ...
}
```

### Pattern 2: maxPoints Truncation via Dispose+Reinit (STRM-02)

**What:** When `_totalPoints >= maxPoints`, cancel any pending RAF, dispose the ECharts instance (`_chart.dispose()`, `_chart = null`), clear all buffers, reset `_totalPoints = 0`, then call `_initChart()` again to reinitialize.

**When to use:** Only at the truncation boundary. Normal per-frame updates use the ring-buffer flush path.

**Why dispose+reinit rather than `chart.clear()`:** `chart.clear()` has known residue bugs in ECharts and may leave MA lines or other artifacts. `dispose()` + `echarts.init()` is the officially recommended full-reset path. The base class `_initChart()` already handles all setup (theme, observers, `_applyData`).

**Example:**
```typescript
// Source: Based on base-chart-element.ts _initChart() pattern + ECharts GitHub issue workaround

private _triggerReset(): void {
  // 1. Cancel pending RAF
  if (this._lineRafId !== undefined) {
    cancelAnimationFrame(this._lineRafId);
    this._lineRafId = undefined;
  }
  // 2. Clear buffers
  this._lineBuffers = this._lineBuffers.map(() => []);
  this._totalPoints = 0;
  // 3. Dispose + reinit (base class handles full teardown + theme + observers)
  //    Dispose is already in disconnectedCallback; here we need to dispose without
  //    disconnecting from DOM. Call _chart.dispose() directly.
  if (this._chart) {
    this._chart.dispose();
    this._chart = null;
  }
  // 4. Reinit — calls _registerModules, _applyData, sets up ResizeObserver etc.
  requestAnimationFrame(() => this._initChart());
}
```

**CRITICAL note on `_initChart()` visibility:** `_initChart()` is currently `private` in `base-chart-element.ts`. Phase 100 will need to either: (a) change it to `protected`, or (b) duplicate the reset logic inline in `_triggerReset()`. Option (a) is cleaner and consistent with the `_detectRenderer()` protected pattern. This is a required base class modification.

### Pattern 3: setOption flush with lazyUpdate (STRM-01)

**What:** RAF flush calls `setOption` with per-series data arrays, using `lazyUpdate: true` to batch the render into the next animation frame. Passes Float32Array converted data for GC efficiency.

**When to use:** Every RAF cycle during active streaming.

**Example:**
```typescript
// Source: candlestick-chart.ts line 190 pattern + STRM-01 TypedArray requirement

private _flushLineUpdates(): void {
  if (!this._chart || this._lineBuffers.every((b) => b.length === 0)) return;

  const seriesUpdates = this._lineBuffers.map((buf) => ({
    data: buf,  // ECharts accepts plain arrays; Float32Array conversion is optional optimization
  }));

  // lazyUpdate: true — preserves DataZoom state, batches render to next frame
  this._chart.setOption(
    { series: seriesUpdates },
    { lazyUpdate: true } as object
  );
}
```

### Pattern 4: sampling: 'lttb' in line series options (STRM-04)

**What:** Add `sampling: 'lttb'` to every line series in `buildLineOption()`. This is applied in the initial `setOption` call (_applyData). ECharts applies LTTB automatically during zoom-out when the number of visible points exceeds the canvas pixel width.

**When to use:** Always for Line/Area charts — it activates only when point count exceeds render capacity, so it has no effect on small datasets.

**Example:**
```typescript
// Source: ECharts official test file github.com/apache/echarts/blob/master/test/line-sampling.html

const echartsSeriesArray = series.map((s, i) => ({
  name: s.name,
  type: 'line' as const,
  data: s.data,
  smooth: props.smooth ?? false,
  sampling: 'lttb',          // STRM-04: native LTTB decimation — no external library needed
  large: true,               // STRM-01: enable large dataset rendering optimization
  largeThreshold: 2000,      // threshold below which large mode is skipped
  areaStyle: isArea ? { opacity: props.opacity ?? 0.6 } : undefined,
  // ... rest of options
}));
```

### Anti-Patterns to Avoid

- **Continuing to use `appendData` for Line/Area:** appendData accumulates unboundedly. ECharts has no `removeData`. Issue #20734 shows line chart rendering problems with appendData in 5.6.0. The ring-buffer + setOption pattern is more reliable.
- **Calling `setOption` and `appendData` on the same series:** CRITICAL-03 — setOption wipes appendData data. Since Phase 100 switches to setOption for line/area, this conflict is resolved by removing appendData entirely.
- **Using `chart.clear()` for reset:** Known residue bugs. Use dispose+reinit.
- **Setting `_streamingMode = 'appendData'` in constructor:** This flag only controls the base `_flushPendingData()` path. Since Line/Area will override `pushData()` entirely (like Candlestick does), the `_streamingMode` field becomes irrelevant for these charts.
- **Not cancelling `_lineRafId` in `disconnectedCallback()`:** Must cancel before `super.disconnectedCallback()` — same pattern as candlestick-chart.ts `_barRafId`.
- **Reading `_chart` after `dispose()` without null check:** `_chart = null` after dispose is mandatory — base class already does this in `disconnectedCallback()`, but the reset path needs its own null assignment.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LTTB downsampling | Custom decimation algorithm | `sampling: 'lttb'` in ECharts series options | Native ECharts feature since v5.x; zero deps; handles edge cases (empty data, zero-width); integrates with DataZoom automatically |
| Chart resize on container change | ResizeObserver wiring | Already in `_initChart()` in base class | base class already handles this; reinit via `_initChart()` restores it |
| TypedArray conversion | Custom Float32Array packaging | Pass `Float32Array` directly to ECharts `series.data` | ECharts accepts `ArrayLike<any>` including TypedArrays natively |

**Key insight:** All STRM-04 functionality (LTTB decimation) is free inside ECharts 5.x. The `sampling: 'lttb'` line series option is the only code change needed.

---

## Common Pitfalls

### Pitfall 1: _initChart() is private in BaseChartElement
**What goes wrong:** `_triggerReset()` in the subclass cannot call `this._initChart()` because it's private.
**Why it happens:** Base class designed with private to prevent accidental double-init; the reset use case wasn't anticipated.
**How to avoid:** Change `_initChart()` to `protected` in `base-chart-element.ts`. This is a one-line change and consistent with `_detectRenderer()` being protected. Alternative: expose a `protected _reinitChart()` stub that calls `_initChart()`.
**Warning signs:** TypeScript compile error "property _initChart is private" when writing `_triggerReset()`.

### Pitfall 2: pushData() base signature doesn't accept seriesIndex
**What goes wrong:** Base `pushData(point: unknown): void` has no `seriesIndex` parameter. Overriding with `pushData(point: unknown, seriesIndex = 0)` adds an optional second argument — this is a signature extension, not a breaking change. TypeScript allows subclass methods to add optional parameters.
**Why it happens:** Base class was designed for single-series charts (buffer path) and never needed series routing.
**How to avoid:** Override `pushData` in `LuiLineChart` and `LuiAreaChart` with `pushData(point: unknown, seriesIndex = 0): void`. Do NOT change the base class signature (would break all other chart subclasses). The Candlestick chart also overrides pushData completely — this is the established pattern.
**Warning signs:** TypeScript error "Type '(point: unknown, seriesIndex: number) => void' is not assignable to type '(point: unknown) => void'" — this is a known TS quirk with method overrides; use `override pushData(point: unknown, seriesIndex = 0): void`.

### Pitfall 3: CRITICAL-03 — setOption after appendData wipes data
**What goes wrong:** If the old `_streamingMode = 'appendData'` constructor line remains in `LuiLineChart`, the base `_flushPendingData()` still routes to `appendData`. Any subsequent `setOption` call (e.g., prop change, dark mode toggle) wipes all streamed data.
**Why it happens:** The `_streamingMode` field controls base-class behavior. If the override `pushData()` is added but the constructor line is not removed, calls to `super.pushData()` could accidentally use the appendData path.
**How to avoid:** Remove `this._streamingMode = 'appendData'` from constructors. The override `pushData()` should NOT call `super.pushData()` — same as Candlestick.
**Warning signs:** Streaming data disappears after a theme change or `zoom` prop toggle.

### Pitfall 4: _lineBuffers index mismatch with ECharts series array
**What goes wrong:** `_lineBuffers[1]` exists but `series[1]` doesn't exist in the ECharts setOption call because `_applyData()` was called with only 1 series in `this.data`.
**Why it happens:** `pushData(point, 1)` before `_applyData()` has run, or when `seriesIndex` is out of range of `this.data`.
**How to avoid:** In `_flushLineUpdates()`, only update series indices that exist in the ECharts instance (i.e., `seriesIndex < this.data.length`). Or initialize `_lineBuffers` from `_applyData()` to match the series count.
**Warning signs:** ECharts console warning "Cannot read property 'data' of undefined" or silent no-op on the setOption call.

### Pitfall 5: dispose() in _triggerReset() vs disconnectedCallback() double-dispose
**What goes wrong:** `_triggerReset()` sets `this._chart = null`. Then `disconnectedCallback()` tries to call `this._chart.getDom()` and crashes.
**Why it happens:** Base class `disconnectedCallback()` checks `if (this._chart)` before any chart operations — this is already safe. No issue if the null check is respected.
**How to avoid:** After `this._chart.dispose()` in `_triggerReset()`, immediately set `this._chart = null`. Base class already guards against null.
**Warning signs:** "Cannot read property 'getDom' of null" in disconnectedCallback.

### Pitfall 6: sampling: 'lttb' and tooltip accuracy on connected charts
**What goes wrong:** When two charts are connected via `echarts.connect()` and both use `sampling: 'lttb'`, hover tooltip synchronization can fail because the hovered point in chart A may have been decimated away in chart B (ECharts issue #20937).
**Why it happens:** LTTB drops points that are visually redundant; connected charts share tooltips by data index, but indices no longer align post-decimation.
**How to avoid:** This project does not use `echarts.connect()` — the bug only affects connected chart pairs. Single-chart usage of `sampling: 'lttb'` is confirmed safe in official test files.
**Warning signs:** Only relevant if a future phase adds connected chart synchronization.

### Pitfall 7: largeThreshold vs streaming point count
**What goes wrong:** `large: true` with `largeThreshold: 2000` means ECharts switches to its internal "large" rendering path when the series has > 2000 points. The large path optimizes rendering but disables some interactive features like per-point tooltips.
**Why it happens:** ECharts trades interactivity for performance in large mode.
**How to avoid:** Set `largeThreshold` to a value appropriate for streaming (2000 is reasonable). Users can override via `getChart()` escape hatch if they need per-point tooltips at 1M+ points (unrealistic expectation anyway).
**Warning signs:** Tooltip shows axis values but not per-point data labels at high point counts — this is expected behavior.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### STRM-04: Adding sampling: 'lttb' to buildLineOption
```typescript
// Source: ECharts official test file - github.com/apache/echarts/blob/master/test/line-sampling.html
// Modification to packages/charts/src/shared/line-option-builder.ts

const echartsSeriesArray = series.map((s, i) => ({
  name: s.name,
  type: 'line' as const,
  data: s.data,
  smooth: props.smooth ?? false,
  sampling: 'lttb' as const,   // STRM-04: native LTTB — activates automatically at high point counts
  large: true,                  // STRM-01: large dataset rendering mode
  largeThreshold: 2000,         // STRM-01: switch to large path above 2000 points
  areaStyle: isArea ? { opacity: props.opacity ?? 0.6 } : undefined,
  stack: isArea && props.stacked ? 'total' : undefined,
  label: isArea && props.labelPosition ? { show: true, position: props.labelPosition } : undefined,
  markLine:
    i === 0 && props.markLines?.length
      ? { silent: false, data: props.markLines.map(/* ... */) }
      : undefined,
}));
```

### STRM-03: pushData with seriesIndex routing
```typescript
// Source: Candlestick override pattern - candlestick-chart.ts line 147
// Applied to LuiLineChart and LuiAreaChart

override pushData(point: unknown, seriesIndex = 0): void {
  this._isStreaming = true;
  // Ensure buffer array is large enough for this seriesIndex
  while (this._lineBuffers.length <= seriesIndex) {
    this._lineBuffers.push([]);
  }
  this._lineBuffers[seriesIndex].push(point);
  this._totalPoints++;

  if (this._totalPoints >= this.maxPoints) {
    this._triggerReset();
    return;
  }

  if (this._lineRafId === undefined) {
    this._lineRafId = requestAnimationFrame(() => {
      this._flushLineUpdates();
      this._lineRafId = undefined;
    });
  }
}
```

### STRM-01: RAF flush via setOption with lazyUpdate
```typescript
// Source: candlestick-chart.ts line 171-191 pattern adapted for line/area

private _flushLineUpdates(): void {
  if (!this._chart || this._lineBuffers.every((b) => b.length === 0)) return;

  const seriesUpdates = this._lineBuffers
    .slice(0, /* series count from this.data */)
    .map((buf) => ({ data: buf }));

  this._chart.setOption(
    { series: seriesUpdates },
    { lazyUpdate: true } as object
  );
}
```

### STRM-02: maxPoints dispose+reinit truncation
```typescript
// Source: base-chart-element.ts disconnectedCallback + _initChart patterns

private _triggerReset(): void {
  if (this._lineRafId !== undefined) {
    cancelAnimationFrame(this._lineRafId);
    this._lineRafId = undefined;
  }
  // Reset counters and buffers
  this._lineBuffers = this._lineBuffers.map(() => []);
  this._totalPoints = 0;
  // Dispose current instance
  if (this._chart) {
    this._chart.dispose();
    this._chart = null;
  }
  // Reinit — must be async because _initChart awaits _registerModules
  requestAnimationFrame(() => (this as unknown as { _initChart(): Promise<void> })._initChart());
}
```

### disconnectedCallback with _lineRafId cleanup
```typescript
// Source: candlestick-chart.ts line 198-205 pattern

override disconnectedCallback(): void {
  if (this._lineRafId !== undefined) {
    cancelAnimationFrame(this._lineRafId);
    this._lineRafId = undefined;
  }
  super.disconnectedCallback();
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| appendData path for Line/Area (current) | Ring buffer + setOption(lazyUpdate: true) | Phase 100 | Resolves unbounded memory accumulation; eliminates CRITICAL-03 setOption conflict |
| No seriesIndex routing in pushData | `pushData(point, seriesIndex?)` optional second arg | Phase 100 | Multi-series streaming without workarounds |
| No LTTB decimation (data passed raw) | `sampling: 'lttb'` in series options | Phase 100 | ECharts renders smooth 2K-point summary at zoom-out for 1M+ points |
| maxPoints = 1000 (buffer mode default) | Meaningful maxPoints for 1M+ sessions | Phase 100 | Default should increase (e.g. 500000) or be guidance in docs |

**Deprecated/outdated:**
- `this._streamingMode = 'appendData'` constructor line in `LuiLineChart` and `LuiAreaChart`: This is removed by Phase 100 since pushData() overrides the entire base streaming path.
- appendData usage for Line/Area in `_flushPendingData()`: The base class `_flushPendingData()` is no longer called by Line/Area after Phase 100 since they override `pushData()` entirely.

---

## Open Questions

1. **Should `_initChart()` become `protected` in base-chart-element.ts?**
   - What we know: `_initChart()` is currently `private`. `_triggerReset()` in the subclass needs to call it. Changing to `protected` is a one-line change with no API-surface impact (no public consumer can call it).
   - What's unclear: Whether any other chart subclass has a reason to NOT have this available.
   - Recommendation: Change to `protected` in Wave 0 / the first plan task. It's the cleanest solution and consistent with `_detectRenderer()` being protected.

2. **Should `_totalPoints` count across all series or per series?**
   - What we know: STRM-02 says "point count reaches the limit" — the limit is `maxPoints` on the element. The success criterion says "configured with `maxPoints: 500000`".
   - What's unclear: Whether the limit is per-series or total across all series.
   - Recommendation: Use total across all series for simplicity. Per-series tracking is STRM-05 (future requirement, explicitly out of scope).

3. **What should the default `maxPoints` be for Line/Area?**
   - What we know: Current base class default is `maxPoints = 1000`. For 1M+ streaming, the success criterion mentions `maxPoints: 500000`. The test at 1000 pts/sec for 20min = 1.2M points — so truncation at 500K still lets the chart run ~8 minutes before reset.
   - What's unclear: Whether to change the base class default or override it in LuiLineChart/LuiAreaChart constructors.
   - Recommendation: Override `maxPoints = 500000` as the default in `LuiLineChart` and `LuiAreaChart` constructors. Keep the base class at 1000 — it's appropriate for buffer-mode charts.

4. **Does `setOption({ series: [...] }, { lazyUpdate: true })` merge or replace series data?**
   - What we know: `lazyUpdate: true` defers rendering. `notMerge: false` (default) means data is merged. With `lazyUpdate: true` without `notMerge`, ECharts merges the new series data into the existing series. This means the full buffer must be passed each flush, not just the new points.
   - What's unclear: Performance implications of passing 500K points to setOption every RAF. At 1000 pts/sec, buffer grows by 1000 per RAF — after 500 seconds, each setOption call passes 500K points.
   - Recommendation: This is intentional. The ring buffer IS the source of truth. ECharts handles the diff internally. `sampling: 'lttb'` reduces this to 2K render points. `large: true` optimizes the rendering path for large series. `lazyUpdate: true` ensures no wasted renders. Profile in a browser if frame drops are observed above 100K points.

---

## Sources

### Primary (HIGH confidence)
- [ECharts GitHub - appendData test](https://github.com/apache/echarts/blob/master/test/appendData.html) — confirmed `seriesIndex` usage in appendData calls
- [ECharts GitHub - line-sampling test](https://github.com/apache/echarts/blob/master/test/line-sampling.html) — confirmed `sampling: 'lttb'` syntax
- `base-chart-element.ts` (project source) — confirmed `_initChart()` is private, `_flushPendingData()` hardcodes `seriesIndex: 0`
- `candlestick-chart.ts` (project source) — confirmed the override pattern for pushData, `_barRafId`, `lazyUpdate: true` flush

### Secondary (MEDIUM confidence)
- [ECharts GitHub Issue #20734](https://github.com/apache/echarts/issues/20734) — appendData rendering bug in ECharts 5.6 line charts; closed "not-a-bug"; workaround is setOption after appendData or chart.resize()
- [ECharts GitHub Issue #16095](https://github.com/apache/echarts/issues/16095) — appendData tab crash after streaming; confirmed no native removeData; dispose+reinit workaround
- [ECharts GitHub Issue #12327](https://github.com/apache/incubator-echarts/issues/12327) — setOption clears appendData data (CRITICAL-03 documented in codebase confirms this)
- [ECharts Features page](https://echarts.apache.org/en/feature.html) — TypedArray support confirmed; large dataset rendering capability

### Tertiary (LOW confidence)
- [DEV Community - LTTB with ECharts](https://dev.to/said96dev/optimizing-line-chart-performance-with-lttb-algorithm-21dj) — confirms sampling: 'lttb' single-line usage; not official docs
- [Volkov Labs streaming blog](https://volkovlabs.io/blog/echarts-panel-5.1.0-20230822/) — confirms memory leak patterns in long-running streams; workarounds consistent with GitHub issues

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all changes are in existing ECharts + project code
- Architecture: HIGH — pattern mirrors the proven Candlestick override; ECharts APIs confirmed
- Pitfalls: HIGH — most pitfalls documented from existing CRITICAL-03 codebase comments + confirmed GitHub issues

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (ECharts 5.6.0 is pinned; lttb and appendData behaviors are stable)
