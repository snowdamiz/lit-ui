---
phase: 98-webgpu-detector-renderer-infrastructure
plan: 02
subsystem: ui
tags: [webgpu, lit, typescript, charts, renderer-detection, ssr]

# Dependency graph
requires:
  - phase: 98-01
    provides: acquireGpuDevice singleton, RendererTier type, webgpu-device.ts module
provides:
  - BaseChartElement with enableWebGpu attribute and renderer field
  - _detectRenderer() protected async method with SSR-safe GPU probe
  - renderer-selected custom event dispatched from every chart firstUpdated()
  - RendererTier public type export from @lit-ui/charts package index
affects:
  - 99-moving-average-state-machine
  - 100-streaming-infrastructure
  - 101-webgpu-canvas-layer
  - 102-documentation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "opt-in GPU detection — enableWebGpu mirrors enableGl to avoid adapter probe overhead on non-WebGPU charts"
    - "protected method for WebGPU detection so Phase 101 subclasses can override _detectRenderer()"
    - "non-reactive renderer field — plain class field avoids Lit reactive update cycle for GPU state"
    - "belt-and-suspenders SSR guard — isServer + typeof navigator === 'undefined' in _detectRenderer()"

key-files:
  created: []
  modified:
    - packages/charts/src/base/base-chart-element.ts
    - packages/charts/src/index.ts

key-decisions:
  - "renderer field is NOT decorated with @property() — GPU tier is not user-settable and should not trigger Lit reactive updates"
  - "_detectRenderer() is protected (not private) — Phase 101 subclasses can override if needed"
  - "requestAdapter() null check is mandatory — the WebGPU spec guarantees null (not rejection) when no adapter available"
  - "Only RendererTier exported from index.ts — acquireGpuDevice/getGpuDevice/releaseGpuDevice are internal Phase 101 infrastructure"

patterns-established:
  - "WebGPU detection order: SSR guard → enableWebGpu opt-in check → adapter probe → acquireGpuDevice singleton"
  - "Every _detectRenderer() code path dispatches renderer-selected before returning"

requirements-completed: [WEBGPU-01, WEBGPU-03]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 98 Plan 02: WebGPU Detector in BaseChartElement Summary

**WebGPU renderer auto-detection wired into BaseChartElement via enableWebGpu opt-in attribute, _detectRenderer() protected async method, and renderer-selected event dispatch, with RendererTier exported from @lit-ui/charts**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T08:29:01Z
- **Completed:** 2026-03-01T08:31:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `enableWebGpu` boolean attribute (maps to `enable-webgpu`) to BaseChartElement — opt-in pattern mirrors `enableGl`
- Added `renderer: RendererTier = 'canvas'` plain field (not reactive) — safe default, updated by detection
- Added protected `_detectRenderer()` async method — SSR-safe (isServer + typeof navigator guard), probes navigator.gpu only when `enableWebGpu` is set, calls `acquireGpuDevice()` for singleton reuse, dispatches `renderer-selected` in every code path
- Updated `firstUpdated()` to `await this._detectRenderer()` before `_maybeLoadGl()`
- Exported `RendererTier` as type-only from `packages/charts/src/index.ts` under Phase 98 block

## Task Commits

Each task was committed atomically:

1. **Task 1: Add WebGPU detection to BaseChartElement** - `04a16fc` (feat)
2. **Task 2: Export RendererTier from package index** - `c3e5c27` (feat)

**Plan metadata:** `ce3fd2c` (docs: complete plan)

## Files Created/Modified
- `packages/charts/src/base/base-chart-element.ts` - Added import, enableWebGpu property, renderer field, _detectRenderer() method, updated firstUpdated()
- `packages/charts/src/index.ts` - Added Phase 98 export block with RendererTier type export

## Decisions Made
- `renderer` field is NOT decorated with `@property()` — GPU tier is infrastructure state, not user-settable, and must not trigger reactive Lit update cycles
- `_detectRenderer()` is `protected` not `private` — Phase 101 WebGPU canvas layer subclasses may need to override detection behavior
- The `requestAdapter()` null check is mandatory per WebGPU spec: `requestAdapter()` resolves to null (never rejects) when no GPU adapter is available
- Only `RendererTier` is exported from `index.ts` — `acquireGpuDevice`, `getGpuDevice`, and `releaseGpuDevice` remain internal infrastructure for Phase 101

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation succeeded immediately; build succeeded without errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BaseChartElement now exposes `renderer` property and fires `renderer-selected` event on every chart instance
- Phase 101 can access the shared GPUDevice via `getGpuDevice()` from `webgpu-device.ts`
- Phase 101's WebGPU canvas layer can override `_detectRenderer()` to customize detection behavior
- All 8 concrete chart classes inherit the detection automatically without modification
- `RendererTier` is publicly consumable via `import type { RendererTier } from '@lit-ui/charts'`

## Self-Check: PASSED

- FOUND: packages/charts/src/base/base-chart-element.ts
- FOUND: packages/charts/src/index.ts
- FOUND: .planning/phases/98-webgpu-detector-renderer-infrastructure/98-02-SUMMARY.md
- FOUND: commit 04a16fc (Task 1 — WebGPU detection in BaseChartElement)
- FOUND: commit c3e5c27 (Task 2 — RendererTier export)
- FOUND: commit ce3fd2c (docs — metadata commit)

---
*Phase: 98-webgpu-detector-renderer-infrastructure*
*Completed: 2026-03-01*
