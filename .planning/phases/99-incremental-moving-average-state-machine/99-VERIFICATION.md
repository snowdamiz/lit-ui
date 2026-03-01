---
phase: 99-incremental-moving-average-state-machine
verified: 2026-03-01T18:30:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Render a candlestick chart with two MA overlays, one with color omitted"
    expected: "Second MA line should be visible in a distinct color derived from --ui-chart-color-2 CSS token (default purple #8b5cf6)"
    why_human: "CSS token resolution happens in the browser; readChartToken() returns the live computed style which cannot be verified statically"
  - test: "Set showType: true on an EMA overlay and inspect the legend"
    expected: "Legend entry reads 'MA20 (EMA)' — not 'MA20'"
    why_human: "ECharts legend rendering is browser-only; series.name is set correctly in source but visual confirmation requires a running chart"
---

# Phase 99: Incremental Moving Average State Machine — Verification Report

**Phase Goal:** Replace O(n) per-flush MA recomputation with O(1) incremental MAStateMachine, add NaN gap isolation, optional color assignment from CSS tokens, and showType legend labels.
**Verified:** 2026-03-01T18:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | MAStateMachine.push() returns null during SMA warm-up (first period-1 bars) and a correct average once the window is full | VERIFIED | `SMAState.push()`: returns `null` until `_count === period` (line 49-50 of ma-state-machine.ts); O(1) ring buffer; test cases confirm [null, null, 2.0, 3.0, 4.0] for SMA(3) on [1,2,3,4,5] |
| 2  | MAStateMachine.push() returns null (not NaN) when given a NaN close, and resumes correct output after the next valid close | VERIFIED | `SMAState.push()` line 34: `if (Number.isNaN(close)) return null;` — no state mutation; `EMAState.push()` line 83: same guard; NaN gap test confirms [null,null,null,2.0,3.0] for SMA(3) on [1,2,NaN,3,4] |
| 3  | MAStateMachine reset() + replay from a full closes array produces the same values array as calling push() individually from scratch | VERIFIED | `reset()` method (lines 133-137) calls `_state.reset()` then maps closes through `_state.push()`; equivalence test in test file confirms `sm1.values === sm2.values` for push-individually vs reset+replay |
| 4  | EMA warm-up correctly ignores NaN inputs and only counts valid closes toward the period threshold | VERIFIED | `EMAState.push()` line 83: NaN returns null without appending to `_warmup`; test case [1,NaN,3,4,5,6] yields [null,null,null,2.667,3.833,4.917] |
| 5  | MAStateMachine.push() appends to .values and returns the updated array each call (O(1) per call) | VERIFIED | `push()` line 144-147: appends one element via `this._values.push(...)` and returns array reference; `trim(maxLen)` present for buffer alignment |
| 6  | MAConfig.color is now optional — an MAConfig without a color property is a valid TypeScript type with no compile error | VERIFIED | `candlestick-option-builder.ts` line 15: `color?: string;`; compiled `index.d.ts` confirms `color?: string`; build exits 0 |
| 7  | buildCandlestickOption accepts maValueArrays and resolvedMAColors in CandlestickOptionProps and uses them instead of calling _computeSMA/_computeEMA when provided | VERIFIED | `CandlestickOptionProps` has both fields (lines 41-43); `maSeries` block (line 143): `(maValueArrays && maValueArrays[i]) ?? _computeEMA/SMA(...)` — pre-computed values take priority |
| 8  | An MAConfig with showType: true and type: 'ema' produces a series named 'MA20 (EMA)' in the ECharts option object | VERIFIED | `_maLegendName()` lines 88-93: `if (!ma.showType) return base; const typeSuffix = (ma.type ?? 'sma').toUpperCase(); return \`${base} (${typeSuffix})\`` — both `maSeries.name` (line 149) and `legendData` (line 164) use this function |
| 9  | An MAConfig with showType: false (or omitted) produces a series named 'MA20' (no suffix) | VERIFIED | `_maLegendName()` line 90: `if (!ma.showType) return base;` — falsy showType short-circuits immediately |
| 10 | readChartToken(name) is a protected method on BaseChartElement that delegates to _themeBridge.readToken(name) | VERIFIED | `base-chart-element.ts` lines 146-151: method added as protected, body is `return this._themeBridge.readToken(name);`; compiled `candlestick-chart.d.ts` line 72: `protected readChartToken(name: string): string` |
| 11 | LuiCandlestickChart maintains one MAStateMachine per MAConfig entry in _maStateMachines[] | VERIFIED | `candlestick-chart.ts` line 64: `private _maStateMachines: MAStateMachine[] = [];`; line 117: `this._maStateMachines = mas.map((ma) => new MAStateMachine(ma))` |
| 12 | _applyData() rebuilds _maStateMachines from scratch and calls sm.reset(closes) | VERIFIED | Lines 117 and 122 of candlestick-chart.ts: machines rebuilt atomically then `this._maStateMachines.map((sm) => sm.reset(closes))` |
| 13 | _flushBarUpdates() calls sm.push(lastClose) O(1) per machine — does NOT call sm.reset() | VERIFIED | Lines 177-178: `const lastClose = ...ohlc[1]; const maValueArrays = this._maStateMachines.map((sm) => sm.push(lastClose))` — no reset() call present |
| 14 | _ohlcBuffer trimming at maxPoints also trims _maStateMachines[i]._values via sm.trim(maxPoints) | VERIFIED | `pushData()` lines 151-155: trim block calls `this._maStateMachines.forEach((sm) => sm.trim(this.maxPoints))` immediately after `_ohlcBuffer.slice(-maxPoints)` |

**Score:** 14/14 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/charts/src/shared/ma-state-machine.ts` | MAStateMachine class with O(1) SMA ring buffer and EMA incremental state | VERIFIED | 167 lines; exports `MAStateMachine`; contains `SMAState`, `EMAState`, `MAStateMachine` (with `reset`, `push`, `trim`, `values`); type-only import of MAConfig |
| `packages/charts/src/shared/ma-state-machine.test.ts` | TDD test suite for MAStateMachine behavioral correctness | VERIFIED | 153 lines; covers SMA warm-up, NaN gap, EMA NaN, reset+replay equivalence, values reference identity |
| `packages/charts/src/shared/candlestick-option-builder.ts` | Updated MAConfig type, maValueArrays/resolvedMAColors, _maLegendName() | VERIFIED | 235 lines; `color?: string`, `showType?: boolean`, `maValueArrays`, `resolvedMAColors`, `_maLegendName()` all present and wired |
| `packages/charts/src/base/base-chart-element.ts` | Protected readChartToken() method | VERIFIED | Lines 146-151; method is `protected`, delegates to `this._themeBridge.readToken(name)` |
| `packages/charts/src/candlestick/candlestick-chart.ts` | LuiCandlestickChart with _maStateMachines[], _resolveMAColors(), incremental MA flush | VERIFIED | 218 lines; all required fields, methods, and wiring present |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ma-state-machine.ts` | `candlestick-option-builder.ts` | `import type { MAConfig }` | VERIFIED | Line 11: `import type { MAConfig } from './candlestick-option-builder.js';` — type-only, no circular risk |
| `candlestick-chart.ts` | `ma-state-machine.ts` | `import { MAStateMachine }` | VERIFIED | Line 22: `import { MAStateMachine } from '../shared/ma-state-machine.js';` |
| `candlestick-chart.ts` | `candlestick-option-builder.ts` | passes `maValueArrays` and `resolvedMAColors` to `buildCandlestickOption` | VERIFIED | `_applyData()` line 125-132 and `_flushBarUpdates()` line 181-188 both include `maValueArrays` and `resolvedMAColors` in the props object |
| `_flushBarUpdates()` | `MAStateMachine.push()` | `sm.push(lastClose)` O(1) incremental | VERIFIED | Line 178: `this._maStateMachines.map((sm) => sm.push(lastClose))` — no reset() in this path |
| `_resolveMAColors()` | `BaseChartElement.readChartToken()` | CSS token resolution | VERIFIED | Line 88: `return this.readChartToken(token)` — inheritance chain confirmed via compiled `.d.ts` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| MA-01 | 99-01, 99-03 | O(1) per-bar MA computation via incremental SMA/EMA state machine | SATISFIED | `SMAState` ring buffer, `EMAState` exponential formula — each `push()` is O(1); `_flushBarUpdates()` calls only `sm.push(lastClose)` never `sm.reset()`; `_applyData()` O(n) reset is one-time-per-dataset-change |
| MA-02 | 99-02, 99-03 | CSS token default colors (`--ui-chart-color-2..5`) when MAConfig omits color | SATISFIED | `_MA_DEFAULT_COLOR_TOKENS` array in candlestick-chart.ts; `_resolveMAColors()` calls `readChartToken(token)` for colorless MA entries; `readChartToken()` on BaseChartElement delegates to ThemeBridge |
| MA-03 | 99-01 | NaN closes return null, do not corrupt SMA window or EMA warm-up counter | SATISFIED | `SMAState.push()` line 34: early return on NaN with no state mutation; `EMAState.push()` line 83: same guard, no `_warmup.push()` call; SMA ring buffer (`_sum`, `_count`, `_window`) untouched on NaN |
| MA-04 | 99-02 | `showType` boolean appends type suffix to legend label (e.g., "MA20 (EMA)") | SATISFIED | `_maLegendName()` in candlestick-option-builder.ts; used for both `maSeries[].name` and `legendData`; both `showType: true` path (with suffix) and falsy path (base name only) implemented |

**No orphaned requirements detected.** REQUIREMENTS.md traceability table maps MA-01..MA-04 exclusively to Phase 99. All four are marked complete in REQUIREMENTS.md and are covered by at least one plan.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No anti-patterns found in phase-modified files |

Checked files:
- `packages/charts/src/shared/ma-state-machine.ts` — no TODO/FIXME/placeholder
- `packages/charts/src/shared/candlestick-option-builder.ts` — no TODO/FIXME/placeholder
- `packages/charts/src/candlestick/candlestick-chart.ts` — no TODO/FIXME/placeholder
- `packages/charts/src/base/base-chart-element.ts` — no TODO/FIXME/placeholder

The two `return [];` occurrences in `candlestick-chart.ts` are correct error-path returns from `_parseMovingAverages()` (invalid JSON or empty input), not implementation stubs.

---

### Human Verification Required

#### 1. CSS Token Color Resolution

**Test:** Render `<lui-candlestick-chart>` with `moving-averages='[{"period":20},{"period":50}]'` (no color on either) and inspect the chart visually.
**Expected:** Two MA lines rendered in distinct colors — first line in `#8b5cf6` (purple, `--ui-chart-color-2`), second in `#10b981` (green, `--ui-chart-color-3`).
**Why human:** `readChartToken()` delegates to `ThemeBridge.readToken()` which reads live CSS custom properties via `getComputedStyle`. The actual token values depend on the page stylesheet at runtime.

#### 2. showType Legend Label Rendering

**Test:** Render a chart with `moving-averages='[{"period":20,"type":"ema","showType":true}]'` and inspect the ECharts legend.
**Expected:** Legend entry shows "MA20 (EMA)", not "MA20".
**Why human:** ECharts renders the legend from `series.name` — the value is correctly set in source but visual confirmation requires a live browser render. No programmatic API to assert rendered legend text.

---

### Build Verification

```
pnpm --filter @lit-ui/charts run build  →  "built in 5.47s" — zero errors
```

All 6 phase commits verified present:

| Hash | Description |
|------|-------------|
| `f605af5` | test(99-01): add failing tests for MAStateMachine (RED phase) |
| `eb9346c` | feat(99-02): update MAConfig type and option builder |
| `e250639` | feat(99-02): add protected readChartToken() to BaseChartElement |
| `154c96f` | feat(99-01): implement MAStateMachine O(1) incremental SMA/EMA state machine |
| `bbeccc5` | feat(99-03): add _maStateMachines field and _resolveMAColors() |
| `98c1b4e` | feat(99-03): wire incremental MA state machines into _applyData(), _flushBarUpdates(), pushData() |

---

### Gaps Summary

No gaps. All 14 must-have truths verified, all 4 MA requirements (MA-01..MA-04) satisfied, build passes clean, no anti-patterns detected.

Two items require human browser verification (CSS token color rendering and legend label visual), but these do not block the phase goal — the code logic is correct and the type contracts are enforced by the TypeScript compiler.

---

_Verified: 2026-03-01T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
