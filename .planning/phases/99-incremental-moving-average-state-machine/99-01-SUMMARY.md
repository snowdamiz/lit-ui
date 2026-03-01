---
phase: 99-incremental-moving-average-state-machine
plan: 01
subsystem: charts/shared
tags: [tdd, state-machine, moving-average, O(1), NaN-handling, SMA, EMA]
dependency_graph:
  requires: []
  provides: [MAStateMachine]
  affects: [packages/charts/src/shared/candlestick-option-builder.ts]
tech_stack:
  added: []
  patterns: [ring-buffer, incremental-state-machine, type-only-import]
key_files:
  created:
    - packages/charts/src/shared/ma-state-machine.ts
    - packages/charts/src/shared/ma-state-machine.test.ts
  modified: []
decisions:
  - SMAState tracks _count (valid slot count) separately from _ptr to handle mixed NaN/valid windows correctly
  - EMAState warm-up uses number[] accumulator; NaN gate before append prevents corrupted seed SMA
  - MAStateMachine uses type-only MAConfig import to avoid any circular dependency risk
  - _values array held as internal reference; values getter returns reference (no copy) for zero-overhead ECharts wiring
metrics:
  duration: 126s
  completed_date: "2026-03-01"
  tasks_completed: 1
  files_created: 2
  files_modified: 0
---

# Phase 99 Plan 01: MAStateMachine O(1) Incremental SMA/EMA State Machine Summary

**One-liner:** O(1) incremental SMA ring buffer and EMA warm-up state machine with NaN gap isolation (MA-01 + MA-03).

## What Was Built

Created `packages/charts/src/shared/ma-state-machine.ts` containing three classes:

1. **SMAState** (unexported) — fixed-size ring buffer of `period` slots initialized with NaN. Tracks `_sum` (running total of valid entries) and `_count` (number of valid slots currently in window) separately. On `push(close)`: evicts oldest slot from sum if it was valid, inserts new value, advances pointer. Returns null until `_count === period`. `push(NaN)` returns null immediately without touching any state.

2. **EMAState** (unexported) — accumulates valid closes into `_warmup[]` until `_warmup.length >= period`, then computes seed SMA and transitions to incremental EMA formula: `ema = close * k + prevEma * (1 - k)` where `k = 2/(period+1)`. `push(NaN)` returns null without appending to `_warmup`, preserving warm-up counter correctness.

3. **MAStateMachine** (exported) — public wrapper that picks SMAState or EMAState from `MAConfig.type ?? 'sma'`. Owns `_values: (number | null)[]` array. `reset(closes)` resets internal state then maps closes through `_state.push()`. `push(close)` appends one result to `_values` and returns the array reference. `values` getter returns the reference with no copy.

## Test Coverage

TDD test file (`ma-state-machine.test.ts`) covers:
- SMA(3) warm-up: [1,2,3,4,5] → [null, null, 2.0, 3.0, 4.0]
- SMA(3) NaN gap: [1,2,NaN,3,4] → [null, null, null, 2.0, 3.0] (MA-03)
- SMA push() incremental: reset([10,20,30,40]).push(50) → length 5, index 4 = 40.0
- SMA reset+replay equals push-individually (equivalence guarantee)
- EMA(3) warm-up: [1,2,3,4,5] → [null, null, 2.0, 3.0, 4.0]
- EMA(3) NaN warm-up skip: [1,NaN,3,4,5,6] → [null, null, null, 2.667, 3.833, 4.917]
- values getter returns same array reference (no copy)

## Verification

```
pnpm --filter @lit-ui/charts run build  →  zero errors, built in 5.13s
tsc --noEmit (RED phase)                →  error TS2307 (expected, ma-state-machine.ts missing)
tsc --noEmit (GREEN phase)              →  zero errors
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| f605af5 | test | RED: add failing tests for MAStateMachine |
| 154c96f | feat | GREEN: implement MAStateMachine O(1) incremental SMA/EMA state machine |

## Deviations from Plan

None - plan executed exactly as written. Implementation follows RESEARCH.md Pattern 3 verbatim.

## Requirements Fulfilled

- **MA-01**: O(1) per-bar computation — `push()` is O(1) via ring buffer (SMA) or single multiply-add (EMA)
- **MA-03**: NaN gap isolation — `push(NaN)` returns null without corrupting SMA running sum or EMA warm-up counter

## Self-Check: PASSED

| Item | Status |
|------|--------|
| packages/charts/src/shared/ma-state-machine.ts | FOUND |
| packages/charts/src/shared/ma-state-machine.test.ts | FOUND |
| Commit f605af5 (RED: failing tests) | FOUND |
| Commit 154c96f (GREEN: implementation) | FOUND |
