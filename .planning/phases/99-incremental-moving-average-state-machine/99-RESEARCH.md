# Phase 99: Incremental Moving Average State Machine - Research

**Researched:** 2026-03-01
**Domain:** Financial indicator algorithms, TypeScript state machines, ECharts series configuration
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MA-01 | Moving average series update in O(1) per new streaming bar using an incremental SMA/EMA state machine instead of O(n) full recompute per RAF frame | State machine algorithm section; `MAStateMachine` class design |
| MA-02 | MA series automatically assign CSS token default colors (`--ui-chart-color-2` through `--ui-chart-color-5`) when `MAConfig` omits a `color` | ThemeBridge token audit; `MAConfig` type change; color assignment pattern |
| MA-03 | MA computation treats NaN closes as gaps (returns `null`, not `NaN`) to prevent NaN propagation through the SMA window and into tooltip display | Gap handling algorithm; NaN isolation pattern for incremental state |
| MA-04 | `MAConfig` supports a `showType` boolean that appends the MA type to the legend label ("MA20 (EMA)" vs "MA20") | Legend name derivation logic in `buildCandlestickOption` |
</phase_requirements>

---

## Summary

Phase 99 replaces the current O(n) MA computation in `candlestick-option-builder.ts` with an O(1) incremental state machine. The existing `_computeSMA` and `_computeEMA` functions iterate the full closes array on every RAF flush — when a chart streams 1000 bars/second with three MA overlays, computation time grows linearly with dataset size, causing frame time to increase indefinitely.

The solution is a `MAStateMachine` class (new file: `packages/charts/src/shared/ma-state-machine.ts`) that maintains ring-buffer state for SMA and exponential smoothing state for EMA. Each new close value produces a new MA value in O(1) time. The state machine is owned by `LuiCandlestickChart` (one instance per `MAConfig`) and is reset when the full dataset changes via `_applyData()`, then updated incrementally in `_flushBarUpdates()`.

Three additional changes are required alongside the state machine. First, `MAConfig.color` must become optional — `LuiCandlestickChart` needs to assign colors from the ThemeBridge token sequence `--ui-chart-color-2` through `--ui-chart-color-5` when a config omits color, requiring access to `this._themeBridge` or a resolved fallback array. Second, NaN close values must produce `null` MA output rather than propagating through the sliding window — the state machine must skip (not consume) NaN inputs and return `null` for that slot. Third, `MAConfig.showType` controls whether the legend name is `MA20` or `MA20 (EMA)`.

**Primary recommendation:** Create `ma-state-machine.ts` with a single exported `MAStateMachine` class; update `MAConfig` type in `candlestick-option-builder.ts`; wire the state machine into `LuiCandlestickChart` with a `_maStateMachines: MAStateMachine[]` field managed at `_applyData()` / `_flushBarUpdates()` boundaries.

---

## Standard Stack

### Core (no new dependencies needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.3 | State machine class, type updates | Already in project |
| ECharts | 5.6.0 (pinned) | Line series for MA overlays | Already in project; pinned for echarts-gl 2.0.9 compat |
| Lit | 3.3.2 | Component lifecycle integration | BaseChartElement base class |

No new npm packages are needed. The state machine is pure TypeScript math — no library handles O(1) incremental SMA/EMA more simply than a hand-written ring buffer.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled ring buffer SMA | `technicalindicators` npm package | Package is 180KB+, designed for batch computation, no incremental API; overkill |
| Hand-rolled EMA | `ta-lib` WASM | WASM adds 300KB+ bundle overhead; not justified for two indicator types |
| State machine in option builder | State machine in component | Option builder is stateless by design; state belongs in component |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended File Structure Change

```
packages/charts/src/
├── shared/
│   ├── candlestick-option-builder.ts   # MODIFY: MAConfig type, legend name, color fallback
│   ├── ma-state-machine.ts             # NEW: MAStateMachine class (O(1) SMA + EMA)
│   └── webgpu-device.ts               # (untouched)
└── candlestick/
    └── candlestick-chart.ts           # MODIFY: wire _maStateMachines[], incremental flush
```

### Pattern 1: Incremental SMA via Ring Buffer (O(1) amortized)

**What:** Maintain a fixed-size circular buffer of the last `period` closes and a running sum. On each new value: subtract the oldest slot, add the new value, advance the pointer.
**When to use:** Every new streaming bar appended via `pushData()`.

```typescript
// Source: first-principles algorithm — standard finance textbook
class SMAState {
  private _window: number[];
  private _sum = 0;
  private _count = 0;    // valid (non-NaN) elements in window
  private _ptr = 0;
  private _ready = false; // true once window is full for the first time

  constructor(private readonly period: number) {
    this._window = new Array(period).fill(NaN);
  }

  /** Push one close; returns null if window not yet full or input is NaN. */
  push(close: number): number | null {
    if (Number.isNaN(close)) return null; // MA-03: NaN produces gap, not NaN output

    const evicted = this._window[this._ptr];
    this._window[this._ptr] = close;
    this._ptr = (this._ptr + 1) % this.period;

    // Subtract evicted value only if it was valid
    if (!Number.isNaN(evicted)) {
      this._sum -= evicted;
      this._count--;
    }
    this._sum += close;
    this._count++;

    if (this._count === this.period) this._ready = true;
    return this._ready ? this._sum / this.period : null;
  }

  reset(): void {
    this._window.fill(NaN);
    this._sum = 0;
    this._count = 0;
    this._ptr = 0;
    this._ready = false;
  }
}
```

### Pattern 2: Incremental EMA (O(1))

**What:** Maintain a single `prevEma` value and warm-up counter. During warm-up, accumulate closes to compute the seed SMA. After warm-up, apply `ema = close * k + prevEma * (1 - k)`.
**When to use:** Every new streaming bar for EMA configs.

```typescript
// Source: standard EMA formula — k = 2 / (period + 1)
class EMAState {
  private _k: number;
  private _prevEma: number | null = null;
  private _warmup: number[] = [];

  constructor(private readonly period: number) {
    this._k = 2 / (period + 1);
  }

  push(close: number): number | null {
    if (Number.isNaN(close)) return null; // MA-03: gap on NaN input

    if (this._prevEma === null) {
      // Warm-up: accumulate until we have `period` valid closes
      this._warmup.push(close);
      if (this._warmup.length < this.period) return null;
      // Seed: SMA of warm-up window
      this._prevEma = this._warmup.reduce((a, b) => a + b, 0) / this.period;
      return this._prevEma;
    }

    const ema = close * this._k + this._prevEma * (1 - this._k);
    this._prevEma = ema;
    return ema;
  }

  reset(): void {
    this._prevEma = null;
    this._warmup = [];
  }
}
```

### Pattern 3: MAStateMachine — Public Class

**What:** Single exported class that wraps `SMAState` or `EMAState` based on `MAConfig.type`, and owns the full historical output array (for `_applyData()` full-compute path) plus the incremental state.

```typescript
// Source: project pattern
export class MAStateMachine {
  private _state: SMAState | EMAState;
  private _values: (number | null)[] = [];

  constructor(private readonly config: MAConfig) {
    this._state = (config.type ?? 'sma') === 'ema'
      ? new EMAState(config.period)
      : new SMAState(config.period);
  }

  /** Full reset + replay — called from _applyData() when this.data changes. */
  reset(closes: number[]): (number | null)[] {
    this._state.reset();
    this._values = closes.map((c) => this._state.push(c));
    return this._values;
  }

  /** Incremental update — called from _flushBarUpdates() for each new bar. */
  push(close: number): (number | null)[] {
    this._values.push(this._state.push(close));
    return this._values;
  }

  /** Current computed values array — for passing directly to ECharts series.data. */
  get values(): (number | null)[] {
    return this._values;
  }
}
```

### Pattern 4: Component Wiring — State Machine Lifecycle

**What:** `LuiCandlestickChart` creates one `MAStateMachine` per `MAConfig` entry. On `_applyData()` (full dataset change), all machines are reset and replayed. On `_flushBarUpdates()` (incremental push), only `.push(close)` is called.

```typescript
// Source: project pattern — mirrors _ohlcBuffer lifecycle in candlestick-chart.ts
private _maStateMachines: MAStateMachine[] = [];

protected override _applyData(): void {
  if (!this._chart) return;
  this._ohlcBuffer = this.data ? [...(this.data as CandlestickBarPoint[])] : [];
  const mas = _parseMovingAverages(this.movingAverages);

  // Rebuild state machines when MA configs change
  this._maStateMachines = mas.map((ma) => new MAStateMachine(ma));

  const closes = this._ohlcBuffer.map((b) => b.ohlc[1]);
  const maValueArrays = this._maStateMachines.map((sm) => sm.reset(closes));

  const option = buildCandlestickOption(this._ohlcBuffer, {
    /* ... */
    movingAverages: mas,
    maValueArrays,   // pre-computed arrays, builder skips recomputation
  });
  this._chart.setOption(option, { notMerge: false });
}

private _flushBarUpdates(): void {
  if (!this._chart || this._ohlcBuffer.length === 0) return;
  const mas = _parseMovingAverages(this.movingAverages);
  const lastBar = this._ohlcBuffer[this._ohlcBuffer.length - 1];
  const lastClose = lastBar.ohlc[1];

  const maValueArrays = this._maStateMachines.map((sm) => sm.push(lastClose));

  const option = buildCandlestickOption(this._ohlcBuffer, {
    /* ... */
    movingAverages: mas,
    maValueArrays,
  });
  this._chart.setOption(option, { lazyUpdate: true } as object);
}
```

### Pattern 5: MAConfig Type Change

**What:** `color` becomes optional in `MAConfig`. `buildCandlestickOption` receives a resolved `resolvedColors: string[]` array computed by the caller (the chart component, which has access to ThemeBridge), OR the component resolves colors before passing them.

**Recommended approach:** Resolve colors in `LuiCandlestickChart` using `this._themeBridge.readToken(...)` and pass pre-resolved colors down. This keeps `buildCandlestickOption` stateless. The component owns the resolution since ThemeBridge requires a live DOM element.

```typescript
// In candlestick-option-builder.ts — updated MAConfig type
export type MAConfig = {
  period: number;
  color?: string;           // MA-02: optional — component assigns default if omitted
  type?: 'sma' | 'ema';
  showType?: boolean;       // MA-04: appends "(EMA)" or "(SMA)" to legend label
};

// Legend name derivation — MA-04
function _maLegendName(ma: MAConfig): string {
  const base = `MA${ma.period}`;
  if (!ma.showType) return base;
  const typeSuffix = (ma.type ?? 'sma').toUpperCase();
  return `${base} (${typeSuffix})`;
}
```

### Pattern 6: Default Color Assignment — MA-02

**What:** The component resolves the default color sequence from ThemeBridge. MA configs with no `color` are assigned `--ui-chart-color-2` through `--ui-chart-color-5` cyclically.

```typescript
// In LuiCandlestickChart — color resolution before buildCandlestickOption
const MA_DEFAULT_COLOR_TOKENS = [
  '--ui-chart-color-2',
  '--ui-chart-color-3',
  '--ui-chart-color-4',
  '--ui-chart-color-5',
];

private _resolveMAColors(mas: MAConfig[]): string[] {
  let defaultIndex = 0;
  return mas.map((ma) => {
    if (ma.color) return ma.color;
    const token = MA_DEFAULT_COLOR_TOKENS[defaultIndex % MA_DEFAULT_COLOR_TOKENS.length];
    defaultIndex++;
    return this._themeBridge.readToken(token);
  });
}
```

Note: `_themeBridge` is currently `private` in `BaseChartElement`. It must be changed to `protected` to allow `LuiCandlestickChart` access, or a `protected readChartToken(name: string): string` helper method must be added to `BaseChartElement`.

### Anti-Patterns to Avoid

- **Putting state machine inside `buildCandlestickOption`:** The option builder is called with all bars every time; it cannot be stateful without becoming a singleton. State belongs in the component.
- **Resetting state machines on every `_flushBarUpdates()` call:** This makes MA computation O(n) again. Only reset on `_applyData()` (full data change), not on incremental push.
- **Passing `MAConfig[]` as the sole input to `buildCandlestickOption` for MA values:** The builder must accept pre-computed `maValueArrays` when the component already has them. Avoid double-computing.
- **Mutating `_ohlcBuffer` and forgetting to push the close to MA state machines:** The push to `_maStateMachines` must happen in the same code path as `_ohlcBuffer.push(bar)`.
- **NaN close values entering `SMAState._sum`:** Any valid-to-NaN transition corrupts the running sum for subsequent valid bars. The `push()` method must guard with `Number.isNaN(close)` and return `null` without touching state.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS token resolution | Custom `getComputedStyle` calls | `ThemeBridge.readToken()` | Already centralizes all token reads with correct fallbacks |
| ECharts legend label formatting | Custom HTML string | Return `name` string in series config | ECharts handles legend rendering; just set the `name` field |
| MA color palette management | Hard-coded hex fallbacks | `ThemeBridge.readToken('--ui-chart-color-N')` | Token defaults already set: color-2=#8b5cf6, color-3=#10b981, color-4=#f59e0b, color-5=#ef4444 |

**Key insight:** The state machine is the only genuinely new logic. Everything else (color resolution, legend names, ECharts series wiring) uses existing project infrastructure.

---

## Common Pitfalls

### Pitfall 1: NaN Window Corruption in SMA Ring Buffer

**What goes wrong:** A bar with `close: NaN` enters the ring buffer. `_sum -= NaN` makes `_sum` permanently `NaN`. All subsequent SMA values are `NaN`, causing a spike in the chart line and `NaN` tooltip values.
**Why it happens:** JavaScript arithmetic with `NaN` is sticky — any operation involving `NaN` returns `NaN`.
**How to avoid:** Gate `push()` with `if (Number.isNaN(close)) return null` before touching `_sum` or `_window`. Track how many valid values are in the window with `_count` rather than assuming all slots are valid.
**Warning signs:** MA line goes flat after a NaN bar; tooltip shows "NaN" instead of a number.

### Pitfall 2: State Machine Desync After `_applyData()`

**What goes wrong:** `_applyData()` resets `_ohlcBuffer` from `this.data` but does not rebuild `_maStateMachines`. Subsequent `pushData()` calls invoke `_maStateMachines[i].push()` on state machines seeded with old data. MA values are computed from the wrong baseline.
**Why it happens:** `_maStateMachines` lifetime is tied to both the MA config and the base dataset — both must be reset together.
**How to avoid:** Always rebuild `_maStateMachines` at the start of `_applyData()`. The `_applyData()` method resets both `_ohlcBuffer` and `_maStateMachines` atomically.
**Warning signs:** MA lines show wrong values after calling `.data = newBars`.

### Pitfall 3: MA Config Change Not Detected — Wrong Machine Count

**What goes wrong:** User changes the `moving-averages` attribute at runtime (e.g., from 2 MA configs to 3). `_maStateMachines` still has 2 entries; the third MA has no state machine.
**Why it happens:** `updated()` triggers `_applyData()` when `movingAverages` changes, but if `_maStateMachines` is only built on first `_applyData()` call, the count is stale.
**How to avoid:** `_applyData()` always rebuilds `_maStateMachines` from scratch using the current parsed MA configs — not from the previous `_maStateMachines` array. This is already the pattern in the code design above.
**Warning signs:** Chart renders fewer MA lines than configured after a runtime attribute change.

### Pitfall 4: `_themeBridge` Visibility

**What goes wrong:** `_themeBridge` is `private` in `BaseChartElement`. `LuiCandlestickChart` cannot call `this._themeBridge.readToken()` directly and TypeScript refuses to compile.
**Why it happens:** Standard encapsulation — `private` fields are not accessible in subclasses in TypeScript.
**How to avoid:** Two options: (A) Change `_themeBridge` from `private` to `protected` in `BaseChartElement`. (B) Add a `protected readChartToken(name: string): string` method to `BaseChartElement` that delegates to `this._themeBridge.readToken(name)`. Option B is less invasive — the ThemeBridge instance remains private, only token reading is exposed. Option B is preferred to maintain encapsulation.
**Warning signs:** TypeScript error `Property '_themeBridge' is private and only accessible within class 'BaseChartElement'`.

### Pitfall 5: `buildCandlestickOption` API Break

**What goes wrong:** `MAConfig.color` changed from `string` (required) to `string | undefined` (optional). `buildCandlestickOption` passes `ma.color` directly to `lineStyle.color`. If `ma.color` is undefined, ECharts uses its own default color (black or theme color-1), not the project's intended defaults.
**Why it happens:** The builder is called with raw configs; color resolution must happen before the builder is called.
**How to avoid:** The component resolves colors into a parallel `resolvedColors: string[]` array before calling `buildCandlestickOption`. The builder uses `resolvedColors[index]` instead of `ma.color` directly. The `CandlestickOptionProps` type gains a `resolvedMAColors?: string[]` field.
**Warning signs:** MA lines all render in black or in ECharts theme color-1 instead of the project's CSS token colors.

### Pitfall 6: EMA Warm-up with NaN Inputs

**What goes wrong:** NaN closes arrive during the EMA warm-up accumulation phase. They are appended to `_warmup[]`. The seed SMA is computed from a mix of valid and NaN values, producing a NaN seed. All subsequent EMA values are NaN.
**Why it happens:** EMA warm-up must collect exactly `period` valid closes. NaN inputs must not count toward the warm-up target.
**How to avoid:** In `EMAState.push()`, filter NaN before appending to `_warmup`. Only count non-NaN inputs toward the warm-up threshold.
**Warning signs:** EMA line never appears (stays null permanently) when early bars have NaN closes.

---

## Code Examples

### buildCandlestickOption — Updated Signature

```typescript
// Source: project — candlestick-option-builder.ts (updated for Phase 99)
export type CandlestickOptionProps = {
  bullColor?: string;
  bearColor?: string;
  showVolume?: boolean;
  movingAverages?: MAConfig[];
  // NEW: pre-computed MA value arrays (one per MAConfig entry) — avoids O(n) recompute
  maValueArrays?: (number | null)[][];
  // NEW: pre-resolved colors (one per MAConfig entry) — caller owns token resolution
  resolvedMAColors?: string[];
};

// Inside buildCandlestickOption — MA series construction
const maSeries = (movingAverages ?? []).map((ma, i) => {
  // Use pre-computed values if provided; otherwise fall back to O(n) (for non-streaming use)
  const computed = (maValueArrays && maValueArrays[i]) ?? _computeFromScratch(ma, closes);
  const color = (resolvedMAColors && resolvedMAColors[i]) ?? ma.color ?? '#888';
  const name = _maLegendName(ma); // MA-04

  return {
    name,
    type: 'line',
    xAxisIndex: 0,
    yAxisIndex: 0,
    data: computed,
    smooth: true,
    lineStyle: { color, width: 1.5, opacity: 0.85 },
    symbol: 'none',
    tooltip: { show: true },
  };
});
```

### Legend Name Derivation — MA-04

```typescript
// Source: project — candlestick-option-builder.ts
function _maLegendName(ma: MAConfig): string {
  const base = `MA${ma.period}`;
  if (!ma.showType) return base;
  const typeSuffix = (ma.type ?? 'sma').toUpperCase();
  return `${base} (${typeSuffix})`;
}
```

### Full MAStateMachine Class (Target)

```typescript
// Source: project — ma-state-machine.ts (new file)
import type { MAConfig } from './candlestick-option-builder.js';

class SMAState {
  private _window: number[];
  private _sum = 0;
  private _count = 0;
  private _ptr = 0;
  private _ready = false;

  constructor(private readonly period: number) {
    this._window = new Array(period).fill(NaN);
  }

  push(close: number): number | null {
    if (Number.isNaN(close)) return null;
    const evicted = this._window[this._ptr];
    this._window[this._ptr] = close;
    this._ptr = (this._ptr + 1) % this.period;
    if (!Number.isNaN(evicted)) { this._sum -= evicted; this._count--; }
    this._sum += close;
    this._count++;
    if (this._count === this.period) this._ready = true;
    return this._ready ? this._sum / this.period : null;
  }

  reset(): void {
    this._window.fill(NaN);
    this._sum = 0; this._count = 0; this._ptr = 0; this._ready = false;
  }
}

class EMAState {
  private readonly _k: number;
  private _prevEma: number | null = null;
  private _warmup: number[] = [];

  constructor(private readonly period: number) {
    this._k = 2 / (period + 1);
  }

  push(close: number): number | null {
    if (Number.isNaN(close)) return null;
    if (this._prevEma === null) {
      this._warmup.push(close);
      if (this._warmup.length < this.period) return null;
      this._prevEma = this._warmup.reduce((a, b) => a + b, 0) / this.period;
      return this._prevEma;
    }
    const ema = close * this._k + this._prevEma * (1 - this._k);
    this._prevEma = ema;
    return ema;
  }

  reset(): void { this._prevEma = null; this._warmup = []; }
}

export class MAStateMachine {
  private readonly _state: SMAState | EMAState;
  private _values: (number | null)[] = [];

  constructor(config: MAConfig) {
    this._state = (config.type ?? 'sma') === 'ema'
      ? new EMAState(config.period)
      : new SMAState(config.period);
  }

  /** Full reset and replay from a complete closes array. O(n) — call only from _applyData(). */
  reset(closes: number[]): (number | null)[] {
    this._state.reset();
    this._values = closes.map((c) => this._state.push(c));
    return this._values;
  }

  /** Incremental push — O(1). Call from _flushBarUpdates() for each new bar. */
  push(close: number): (number | null)[] {
    this._values.push(this._state.push(close));
    return this._values;
  }

  get values(): (number | null)[] { return this._values; }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full O(n) `_computeSMA()` / `_computeEMA()` called every RAF | O(1) incremental push via ring buffer | Phase 99 | MA computation time stays constant regardless of bar count |
| `MAConfig.color: string` (required) | `MAConfig.color?: string` (optional) | Phase 99 | MA lines get distinct colors without manual config |
| No NaN handling — NaN propagates through SMA window | NaN inputs return `null`, skip window | Phase 99 | No spikes or corrupted tooltips on bad data |
| Legend always `MA${period}` | Legend optionally `MA${period} (EMA)` via `showType` | Phase 99 | Better readability for mixed SMA/EMA charts |

**Deprecated/outdated:**
- `_computeSMA(closes, period)` — full-array function: replaced by `SMAState.push()` for streaming; kept as optional internal fallback for static (non-streaming) use if needed.
- `_computeEMA(closes, period)` — full-array function: same as above.

---

## Open Questions

1. **Should `_computeSMA` / `_computeEMA` be removed or kept as fallback?**
   - What we know: They are used in the current `buildCandlestickOption` and not called from anywhere else in the codebase. No tests reference them.
   - What's unclear: If a consumer calls `buildCandlestickOption` directly (not through the component), `maValueArrays` will be undefined, and the builder needs a fallback.
   - Recommendation: Keep `_computeSMA` and `_computeEMA` as private helper functions inside `candlestick-option-builder.ts`, used only when `maValueArrays` is not provided. Do not export them.

2. **`_themeBridge` visibility — `protected` field vs `protected readChartToken()` method?**
   - What we know: `_themeBridge` is `private` in `BaseChartElement`. MA-02 requires color token resolution in `LuiCandlestickChart`.
   - What's unclear: Which approach is more aligned with the project's encapsulation style.
   - Recommendation: Add `protected readChartToken(name: string): string` to `BaseChartElement`. This keeps ThemeBridge instance private and exposes only the minimum necessary surface. The method name matches the `readToken` pattern already on ThemeBridge.

3. **Should `_maStateMachines` trim entries when `_ohlcBuffer` is trimmed at `maxPoints`?**
   - What we know: `_ohlcBuffer` slices to `-maxPoints` entries when it exceeds `maxPoints`. `_maStateMachines[i]._values` grows unbounded alongside `_ohlcBuffer`.
   - What's unclear: Whether value array trimming is needed for memory correctness or if ECharts handles mismatched array lengths gracefully.
   - Recommendation: Trim `_values` in `MAStateMachine` in parallel with `_ohlcBuffer` trimming. Add a `trim(maxLen: number): void` method on `MAStateMachine`. Call it immediately after `_ohlcBuffer = _ohlcBuffer.slice(-this.maxPoints)`.

---

## Sources

### Primary (HIGH confidence)

- Codebase — `packages/charts/src/shared/candlestick-option-builder.ts` — Current O(n) SMA/EMA implementation, `MAConfig` type, `buildCandlestickOption` signature
- Codebase — `packages/charts/src/candlestick/candlestick-chart.ts` — `pushData()` / `_flushBarUpdates()` / `_applyData()` lifecycle
- Codebase — `packages/charts/src/base/base-chart-element.ts` — `_themeBridge` visibility, `_ohlcBuffer` patterns, RAF coalescing
- Codebase — `packages/charts/src/base/theme-bridge.ts` — `--ui-chart-color-2` through `--ui-chart-color-5` token defaults confirmed

### Secondary (MEDIUM confidence)

- Standard SMA ring buffer algorithm — well-established O(1) technique; confirmed by cross-referencing multiple financial algorithm textbooks and implementation guides
- Standard EMA incremental formula — `ema = close * k + prev * (1-k)` where `k = 2/(period+1)` — same formula used in current `_computeEMA` implementation (HIGH confidence from existing code)

### Tertiary (LOW confidence)

- ECharts behavior when `series.data[i] = null` — produces a gap in the line (no spike). Based on known ECharts behavior from training data; not verified against ECharts 5.6.0 docs for this specific use case. Low risk — `null` is the standard ECharts gap sentinel for line series.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — No new libraries; all technology is already in the project
- Architecture: HIGH — Patterns derived directly from reading the actual source files; no guesswork
- Algorithms: HIGH — SMA ring buffer and EMA incremental formula are mathematically well-established; identical to the existing batch implementations but made incremental
- Pitfalls: HIGH — Derived from direct code analysis (NaN in JS arithmetic, TypeScript private visibility, EMA warm-up logic)
- ECharts `null` gap behavior: MEDIUM — Expected behavior consistent with ECharts line series design

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable domain — no external library changes; all logic is internal)
