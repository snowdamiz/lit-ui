---
phase: 13-monorepo-infrastructure
plan: 04
subsystem: infra
tags: [pnpm, workspace, monorepo, apps]

# Dependency graph
requires:
  - phase: 13-01
    provides: pnpm workspace configuration with apps/* glob
provides:
  - apps/docs/ workspace package for documentation site
  - apps/landing/ workspace package for marketing site
  - Removal of obsolete examples/ directory
affects: [14-cli-migration, 15-component-migration, 17-ssr]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Private apps as workspace packages (not published)
    - Root pnpm manages all app dependencies

key-files:
  created: []
  modified:
    - apps/docs/package.json
    - apps/docs/vite.config.ts
    - apps/landing/package.json
    - apps/landing/vite.config.ts

key-decisions:
  - "Docs app becomes primary testbed for components (replaces examples/)"
  - "Both apps remain private workspace packages (private: true)"

patterns-established:
  - "Apps in apps/ directory are private, non-published workspace packages"
  - "Apps use root pnpm workspace for dependency management"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 13 Plan 04: App Migration Summary

**Migrated docs and landing sites to apps/ workspace directory, removed obsolete examples**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T02:50:45Z
- **Completed:** 2026-01-25T02:53:35Z
- **Tasks:** 3 (1 already done by previous plan)
- **Files modified:** ~60 moved/deleted

## Accomplishments

- Landing site moved to apps/landing/ as workspace package
- Examples directory removed (docs becomes testbed)
- Both apps now managed by root pnpm workspace
- No nested node_modules or package-lock.json in app directories

## Task Commits

Each task was committed atomically:

1. **Task 1: Move docs/ to apps/docs/** - `5782c11` (already done in 13-03)
2. **Task 2: Move landing/ to apps/landing/** - `b76c560` (refactor)
3. **Task 3: Remove examples/ directory** - `c1aab18` (chore)

**Plan metadata:** (pending)

_Note: Task 1 was completed as part of plan 13-03's commit 5782c11 which included docs migration alongside button package scaffolding._

## Files Created/Modified

- `apps/docs/` - Docs site (moved from docs/)
- `apps/docs/vite.config.ts` - Updated path aliases for new location
- `apps/landing/` - Landing site (moved from landing/)
- `examples/` - Removed entirely

## Decisions Made

- **Docs as testbed:** The docs app serves as the natural testbed for component packages, making separate examples/ unnecessary
- **Private packages:** Both apps remain private (not published to npm)
- **Root dependency management:** Apps use root pnpm workspace, no local node_modules

## Deviations from Plan

### Overlap with Previous Plan

**1. [Observation] Task 1 already completed in plan 13-03**
- **Found during:** Task 1 execution
- **Situation:** Plan 13-03 commit 5782c11 already moved docs/ to apps/docs/ and updated vite.config.ts
- **Action:** Skipped Task 1 (already done), proceeded with Tasks 2 and 3
- **Impact:** None - work was complete

---

**Total deviations:** 1 overlap observation
**Impact on plan:** Minor - previous plan had done extra work. No duplicate commits created.

## Issues Encountered

None - migration was straightforward filesystem moves.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both apps integrated into pnpm workspace
- Ready for `pnpm install` from root to install all dependencies
- Apps can be built/run via workspace commands: `pnpm --filter lit-ui-docs dev`
- Phase 13-05 (pnpm scripts) can now add workspace-aware npm scripts

---
*Phase: 13-monorepo-infrastructure*
*Completed: 2026-01-25*
