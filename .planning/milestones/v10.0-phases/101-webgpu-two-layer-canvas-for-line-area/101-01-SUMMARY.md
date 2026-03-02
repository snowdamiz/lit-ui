---
phase: 101-webgpu-two-layer-canvas-for-line-area
plan: 01
subsystem: ui
tags: [webgpu, chartgpu, gpu-device, refcounting, singleton, charts]

# Dependency graph
requires:
  - phase: 98-webgpu-detector-renderer-infrastructure
    provides: Phase 98 webgpu-device.ts stub (releaseGpuDevice no-op) that this plan replaces with real teardown

provides:
  - chartgpu@0.3.2 runtime dependency installed in @lit-ui/charts
  - Refcounted GPUDevice singleton with adapter storage and real device.destroy() teardown
  - getGpuAdapter() export for passing { adapter, device } to ChartGPU.create() in Plans 02/03

affects:
  - 101-02
  - 101-03

# Tech tracking
tech-stack:
  added: [chartgpu@0.3.2]
  patterns:
    - "Refcounted GPUDevice singleton — acquireGpuDevice() increments _refCount, releaseGpuDevice() decrements and destroys at zero"
    - "Adapter stored on first acquireGpuDevice() call; getGpuAdapter() exposes it for ChartGPU.create() context"
    - "releaseGpuDevice() is async; callers use void releaseGpuDevice() fire-and-forget from disconnectedCallback()"

key-files:
  created: []
  modified:
    - packages/charts/package.json
    - packages/charts/src/shared/webgpu-device.ts

key-decisions:
  - "chartgpu@0.3.2 added to dependencies (not devDependencies) — it is a runtime dep, dynamically imported in Plans 02/03"
  - "_refCount starts at 0 module-level; acquireGpuDevice() sets to 1 on first call, increments on subsequent calls"
  - "releaseGpuDevice() changed from sync void stub to async Promise<void> — enables await device in teardown path"
  - "getGpuAdapter() returns stored GPUAdapter | null — Plans 02/03 pass { adapter, device } to ChartGPU.create() for shared device context"
  - "_adapter nulled alongside _devicePromise in releaseGpuDevice() teardown to prevent stale adapter reference after device.destroy()"

patterns-established:
  - "Refcount guard: acquireGpuDevice increments on EVERY call (not just first), so N chart instances require N release calls"
  - "Fire-and-forget async teardown: void releaseGpuDevice() from synchronous disconnectedCallback() is the correct pattern"

requirements-completed: [WEBGPU-02]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 101 Plan 01: ChartGPU Install + Refcounted GPUDevice Singleton Summary

**chartgpu@0.3.2 installed as runtime dep; webgpu-device.ts upgraded from Phase 98 no-op stub to full refcounted lifecycle with getGpuAdapter() for ChartGPU.create() shared-device context**

## Performance

- **Duration:** 1m 53s
- **Started:** 2026-03-01T19:11:45Z
- **Completed:** 2026-03-01T19:13:38Z
- **Tasks:** 1
- **Files modified:** 3 (package.json, webgpu-device.ts, pnpm-lock.yaml)

## Accomplishments
- Installed chartgpu@0.3.2 as a runtime dependency in packages/charts/package.json (pnpm add --filter @lit-ui/charts)
- Upgraded webgpu-device.ts: added `_refCount` and `_adapter` module-level state; `acquireGpuDevice()` now stores the GPUAdapter on first call and increments `_refCount` on every call
- `releaseGpuDevice()` changed from sync void stub to async `Promise<void>` — decrements `_refCount`; when it reaches zero, awaits the device and calls `device.destroy()` then nulls both `_devicePromise` and `_adapter`
- Added `getGpuAdapter()` export returning `GPUAdapter | null` — Plans 02 and 03 use this to pass `{ adapter, device }` to `ChartGPU.create()`
- Zero TypeScript errors; base-chart-element.ts `await acquireGpuDevice(adapter)` call site backward-compatible

## Task Commits

Each task was committed atomically:

1. **Task 1: Install chartgpu@0.3.2 and upgrade webgpu-device.ts** - `d24ef77` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `packages/charts/package.json` - Added `"chartgpu": "0.3.2"` under dependencies
- `packages/charts/src/shared/webgpu-device.ts` - Full rewrite: _refCount + _adapter state; refcounted acquireGpuDevice/releaseGpuDevice; new getGpuAdapter() export
- `pnpm-lock.yaml` - Lock file updated by pnpm add

## Decisions Made
- `chartgpu@0.3.2` goes into `dependencies` not `devDependencies` — it ships as a runtime dep (dynamically imported in Plans 02/03, but still required at runtime in the browser)
- `releaseGpuDevice()` made `async` (changed from `void` to `Promise<void>`) — required because `device.destroy()` requires awaiting the device promise first; callers use `void releaseGpuDevice()` fire-and-forget from `disconnectedCallback()`
- `_adapter` nulled alongside `_devicePromise` after `device.destroy()` — prevents stale GPUAdapter reference from being returned by `getGpuAdapter()` after teardown
- `_refCount` guard `if (_refCount <= 0) return` — defensive floor prevents underflow if `releaseGpuDevice()` is called without a matching `acquireGpuDevice()`

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Plans 02 and 03 can now `import { getGpuDevice, getGpuAdapter } from '../shared/webgpu-device.js'` and call `ChartGPU.create(container, options, { adapter: getGpuAdapter()!, device: await getGpuDevice()! })`
- `void releaseGpuDevice()` pattern ready for `disconnectedCallback()` cleanup in Plans 02 and 03
- No blockers for Phase 101 Plan 02

---
*Phase: 101-webgpu-two-layer-canvas-for-line-area*
*Completed: 2026-03-01*

## Self-Check: PASSED
- packages/charts/package.json: FOUND
- packages/charts/src/shared/webgpu-device.ts: FOUND
- 101-01-SUMMARY.md: FOUND
- Commit d24ef77: FOUND
