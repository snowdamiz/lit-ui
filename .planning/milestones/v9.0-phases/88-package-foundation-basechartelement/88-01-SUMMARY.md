---
phase: 88-package-foundation-basechartelement
plan: 01
subsystem: infra
tags: [echarts, vite, typescript, monorepo, pnpm, lit, web-components]

# Dependency graph
requires: []
provides:
  - "@lit-ui/charts package scaffold at packages/charts/ with valid package.json, tsconfig, and vite build config"
  - "echarts ^5.6.0 and echarts-gl ^2.0.9 installed as dependencies"
  - "Working vite build producing dist/index.js and dist/index.d.ts"
affects:
  - 88-02-basechartelement
  - 88-03-exports
  - 88-04-line-chart
  - 88-05-bar-chart

# Tech tracking
tech-stack:
  added:
    - "echarts ^5.6.0 — ECharts 5.x charting library (pinned for echarts-gl compat)"
    - "echarts-gl ^2.0.9 — WebGL 3D extension for ECharts (supports ECharts 5.x only)"
  patterns:
    - "Library package pattern: package.json with dependencies for bundled libs, peerDependencies for lit/@lit-ui/core"
    - "vite-plugin-dts rollupTypes: true requires at least one export in entry file — comment-only file causes api-extractor failure"

key-files:
  created:
    - packages/charts/package.json
    - packages/charts/tsconfig.json
    - packages/charts/vite.config.ts
    - packages/charts/src/vite-env.d.ts
    - packages/charts/src/index.ts
  modified:
    - pnpm-lock.yaml

key-decisions:
  - "echarts and echarts-gl are in dependencies (not peerDependencies) — bundled implementation details, same pattern as @tanstack in data-table"
  - "Pin echarts to ^5.6.0 — echarts-gl 2.0.9 only supports ECharts 5.x with no 6.x release"
  - "index.ts must export at least one symbol — vite-plugin-dts rollupTypes uses api-extractor which fails on empty chunk"

patterns-established:
  - "New @lit-ui chart package mirrors @lit-ui/data-table package.json/tsconfig.json/vite.config.ts structure exactly"
  - "Placeholder entry exports const version to satisfy vite-plugin-dts api-extractor requirement"

requirements-completed: [INFRA-01]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 88 Plan 01: Package Foundation Summary

**@lit-ui/charts package scaffolded with echarts 5.6.0 + echarts-gl 2.0.9 installed, vite build producing dist/index.js and dist/index.d.ts**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-28T19:38:14Z
- **Completed:** 2026-02-28T19:39:42Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created packages/charts/ with full build toolchain mirroring @lit-ui/data-table structure
- Installed echarts ^5.6.0 and echarts-gl ^2.0.9 as bundled dependencies via pnpm install
- Verified pnpm build produces dist/index.js and dist/index.d.ts cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create package scaffold files** - `8342f52` (chore)
2. **Task 2: Install dependencies and verify build** - `001fb84` (chore)

**Plan metadata:** _(to be committed with SUMMARY.md)_

## Files Created/Modified

- `packages/charts/package.json` - @lit-ui/charts manifest with echarts/echarts-gl deps and standard lib exports
- `packages/charts/tsconfig.json` - Extends @lit-ui/typescript-config/library.json with outDir/rootDir/src include
- `packages/charts/vite.config.ts` - Uses createLibraryConfig({ entry: 'src/index.ts' }) from @lit-ui/vite-config
- `packages/charts/src/vite-env.d.ts` - Vite client type reference
- `packages/charts/src/index.ts` - Placeholder entry with version export (required for vite-plugin-dts)
- `pnpm-lock.yaml` - Updated with echarts and echarts-gl resolutions

## Decisions Made

- echarts and echarts-gl placed in `dependencies` (not peerDependencies) — they are bundled implementation details, same pattern as @tanstack packages in data-table
- echarts pinned to ^5.6.0 because echarts-gl 2.0.9 only supports ECharts 5.x (peerDep: "echarts": "^5.1.2")

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added minimal export to placeholder index.ts**
- **Found during:** Task 2 (Install dependencies and verify build)
- **Issue:** Plan specified a comment-only placeholder `index.ts`. When built, vite produces an empty chunk, causing `vite-plugin-dts` with `rollupTypes: true` to fail with "Unable to determine module for: dist/index.d.ts" — api-extractor requires at least one export to determine the module structure
- **Fix:** Added `export const version = '1.0.0';` to index.ts so the built chunk is non-empty and api-extractor can resolve the module
- **Files modified:** packages/charts/src/index.ts
- **Verification:** pnpm build succeeds, dist/index.js and dist/index.d.ts generated
- **Committed in:** `001fb84` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix essential for build correctness. The version export is a placeholder that will be replaced when real exports are added in Plan 03. No scope creep.

## Issues Encountered

- vite-plugin-dts with rollupTypes: true uses @microsoft/api-extractor internally, which requires at least one export in the entry module — resolved by adding a minimal version export to the placeholder index.ts

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- packages/charts/ is a fully compilable workspace package — all subsequent Phase 88 plans have a valid directory to write source files into
- Any other package can add "@lit-ui/charts": "workspace:*" to devDependencies and import from it
- Plan 02 (BaseChartElement) can immediately start writing TypeScript source files into packages/charts/src/

---
*Phase: 88-package-foundation-basechartelement*
*Completed: 2026-02-28*

## Self-Check: PASSED

All files found:
- packages/charts/package.json - FOUND
- packages/charts/tsconfig.json - FOUND
- packages/charts/vite.config.ts - FOUND
- packages/charts/src/vite-env.d.ts - FOUND
- packages/charts/src/index.ts - FOUND
- packages/charts/dist/index.js - FOUND
- .planning/phases/88-package-foundation-basechartelement/88-01-SUMMARY.md - FOUND

All commits verified:
- 8342f52 - chore(88-01): create @lit-ui/charts package scaffold
- 001fb84 - chore(88-01): install dependencies and verify build for @lit-ui/charts
