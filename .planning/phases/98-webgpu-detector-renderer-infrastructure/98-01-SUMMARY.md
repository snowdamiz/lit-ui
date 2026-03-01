---
phase: 98-webgpu-detector-renderer-infrastructure
plan: 01
subsystem: ui
tags: [webgpu, typescript, lit, singleton, charts]

# Dependency graph
requires: []
provides:
  - "packages/charts/src/shared/webgpu-device.ts — GPUDevice singleton module with RendererTier type and HTMLElementEventMap augmentation"
  - "@webgpu/types 0.1.67 devDependency in packages/charts/package.json"
affects:
  - 98-02-PLAN (BaseChartElement imports acquireGpuDevice and RendererTier from webgpu-device.ts)
  - 99-PLAN and beyond (Phase 101 renderer uses getGpuDevice to access shared GPUDevice)

# Tech tracking
tech-stack:
  added:
    - "@webgpu/types 0.1.67 — official W3C TypeScript ambient types for navigator.gpu, GPUAdapter, GPUDevice"
  patterns:
    - "Module-level singleton pattern for GPUDevice (mirrors canvas-core.ts _registered flag)"
    - "Triple-slash reference directive to scope @webgpu/types to a single file without tsconfig modification"
    - "HTMLElementEventMap global augmentation for renderer-selected custom event typing"

key-files:
  created:
    - "packages/charts/src/shared/webgpu-device.ts"
  modified:
    - "packages/charts/package.json"

key-decisions:
  - "Use triple-slash directive (/// <reference types=\"@webgpu/types\" />) rather than tsconfig types array to avoid scope conflicts with base config"
  - "Cache Promise<GPUDevice> (not the GPUAdapter) in the singleton so subsequent callers skip requestDevice() entirely without consuming their adapters"
  - "releaseGpuDevice() is a Phase 98 stub — device.destroy() teardown is Phase 101's responsibility"

patterns-established:
  - "Module-level singleton variable (_devicePromise) — initialized once, shared across all imports (same as canvas-core.ts)"
  - "No navigator/window access at module top level — all browser API use deferred to function bodies for SSR safety"

requirements-completed:
  - WEBGPU-03

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 98 Plan 01: GPUDevice Singleton Module Summary

**Page-scoped GPUDevice singleton module with @webgpu/types ambient types, RendererTier type union, and HTMLElementEventMap augmentation for renderer-selected events**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T00:05:32Z
- **Completed:** 2026-03-01T00:07:17Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Installed @webgpu/types 0.1.67 as devDependency giving the charts package fully-typed navigator.gpu, GPUAdapter, and GPUDevice without tsconfig changes
- Created packages/charts/src/shared/webgpu-device.ts implementing the WEBGPU-03 GPUDevice singleton — first call acquires the device, subsequent calls return the cached Promise regardless of which adapter is passed
- Exported RendererTier type ('webgpu' | 'webgl' | 'canvas') and HTMLElementEventMap augmentation for renderer-selected — the types Plan 02 needs to wire BaseChartElement

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @webgpu/types devDependency** - `5977d95` (chore)
2. **Task 2: Create webgpu-device.ts GPUDevice singleton module** - `7332889` (feat)

## Files Created/Modified

- `packages/charts/src/shared/webgpu-device.ts` — GPUDevice singleton with acquireGpuDevice, getGpuDevice, releaseGpuDevice, RendererTier, and HTMLElementEventMap augmentation
- `packages/charts/package.json` — Added @webgpu/types 0.1.67 to devDependencies
- `pnpm-lock.yaml` — Updated lockfile for new devDependency

## Decisions Made

- Used triple-slash reference directive (`/// <reference types="@webgpu/types" />`) scoped to webgpu-device.ts rather than adding to tsconfig.json types array — avoids potential conflicts with the base @lit-ui/typescript-config type resolution
- Caches `Promise<GPUDevice>` (not the adapter itself) — this is why subsequent callers with different adapters do not accidentally consume their adapters by calling requestDevice() again
- releaseGpuDevice() is exposed as a stub to give Phase 101 a hook without requiring modification to this module

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- webgpu-device.ts is ready for Plan 02 (BaseChartElement) to import acquireGpuDevice and RendererTier
- TypeScript compilation passes — no errors introduced
- The singleton is SSR-safe: no top-level navigator/window references; browser globals only accessed inside function bodies called from firstUpdated()

---
*Phase: 98-webgpu-detector-renderer-infrastructure*
*Completed: 2026-03-01*
