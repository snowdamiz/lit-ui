---
phase: 096-cli-integration-documentation
plan: 01
subsystem: ui
tags: [vite, charts, tree-shaking, subpath-exports, echarts, lit]

# Dependency graph
requires:
  - phase: 095-treemap-chart
    provides: LuiTreemapChart + treemap-chart.ts as final per-chart entry file
provides:
  - Multi-entry Vite build producing one JS file per chart type (9 total)
  - 8 subpath export entries in @lit-ui/charts package.json for TypeScript resolution and tree-shaking
  - dist/line-chart.js through dist/treemap-chart.js and matching .d.ts files
affects: [cli-integration, docs, downstream-consumers-of-lit-ui-charts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bespoke defineConfig for multi-entry library builds instead of createLibraryConfig wrapper"
    - "Entry object keys drive output file names when fileName omitted in Vite lib builds"
    - "dts({ rollupTypes: true, entryRoot: 'src' }) generates one .d.ts per entry automatically"

key-files:
  created: []
  modified:
    - packages/charts/vite.config.ts
    - packages/charts/package.json

key-decisions:
  - "Bespoke defineConfig instead of createLibraryConfig — wrapper hardcodes fileName:'index', breaking per-entry naming"
  - "fileName field omitted from lib config — Vite automatically uses entry keys as output filenames when fileName absent"
  - "dts rollupTypes:true retained — generates one bundled .d.ts per entry without extra config"

patterns-established:
  - "Multi-entry library pattern: entry object + no fileName + formats:['es'] = one named JS+DTS per key"

requirements-completed: [CLI-02]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 96 Plan 01: Multi-Entry Build and Subpath Exports Summary

**Vite multi-entry build producing 9 named JS/DTS outputs (index + 8 chart types) with matching package.json subpath exports enabling `import '@lit-ui/charts/line-chart'` with TypeScript resolution and tree-shaking**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-01T04:39:34Z
- **Completed:** 2026-03-01T04:41:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced single-entry `createLibraryConfig` wrapper with a bespoke `defineConfig` using a 9-key entry object
- Build now produces `dist/line-chart.js`, `dist/area-chart.js`, ..., `dist/treemap-chart.js` plus matching `.d.ts` files (18 named outputs total)
- Added 8 subpath export entries (`./line-chart` through `./treemap-chart`) to `package.json` exports field

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace vite.config.ts with bespoke multi-entry build** - `86e778f` (feat)
2. **Task 2: Add 8 subpath export entries to package.json** - `2c16809` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `packages/charts/vite.config.ts` - Replaced createLibraryConfig with direct defineConfig; 9-key entry object; no fileName
- `packages/charts/package.json` - Added ./line-chart through ./treemap-chart subpath exports

## Decisions Made
- Used bespoke `defineConfig` instead of `createLibraryConfig` because the helper hardcodes `fileName: 'index'`, which overrides entry key names and collapses all outputs to a single file
- Omitted `fileName` field entirely — when absent, Vite uses entry object keys as output filenames automatically
- Retained `dts({ rollupTypes: true, entryRoot: 'src' })` without changes — it auto-generates one bundled `.d.ts` per entry

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Per-chart subpath imports are fully operational; `import '@lit-ui/charts/line-chart'` resolves both at runtime and in TypeScript
- Ready for Plan 02 (CLI integration documentation or next phase task)

---
*Phase: 096-cli-integration-documentation*
*Completed: 2026-02-28*
