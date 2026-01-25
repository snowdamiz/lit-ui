---
phase: 20-documentation
plan: 02
subsystem: docs
tags: [ssr, nextjs, astro, hydration, fouc, documentation]

# Dependency graph
requires:
  - phase: 20-01
    provides: Guides section in navigation, docs routing pattern
  - phase: 16-02
    provides: SSR hydration pattern to document
  - phase: 17-02
    provides: Next.js SSR example
  - phase: 17-03
    provides: Astro SSR example
provides:
  - SSR setup guide for Next.js
  - SSR setup guide for Astro
  - Hydration import order documentation
  - FOUC prevention CSS documentation
affects: [20-03]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - apps/docs/src/pages/SSRGuide.tsx
  modified:
    - apps/docs/src/App.tsx

key-decisions:
  - "Four-section structure: hydration, Next.js, Astro, FOUC"
  - "Navigation flow: Installation <- SSR -> Migration"

patterns-established:
  - "Doc page section pattern: numbered steps with icon header"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 20 Plan 02: SSR Guide Summary

**SSR setup documentation with framework-specific instructions for Next.js and Astro including hydration import order and FOUC prevention CSS**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25
- **Completed:** 2026-01-25
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created SSRGuide.tsx with four focused sections
- Documented hydration import order requirement with explanation
- Provided minimal, relevant code examples for Next.js and Astro
- Documented FOUC prevention CSS with quick import option

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SSR Guide page** - `9aa4be3` (feat)
2. **Task 2: Update routing for SSR Guide** - `adf1e4c` (feat)

## Files Created/Modified
- `apps/docs/src/pages/SSRGuide.tsx` - SSR setup guide with 4 sections (210 lines)
- `apps/docs/src/App.tsx` - Route /guides/ssr to SSRGuide component

## Decisions Made
- Four-section structure: hydration import order, Next.js setup, Astro setup, FOUC prevention
- Navigation: prev=Installation, next=Migration (follows plan 20-01 guide ordering)
- Followed "how-to" focus per CONTEXT.md - setup steps, not theory

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- SSR guide complete and routed
- Ready for 20-03 Migration guide (final documentation plan)
- prev/next navigation links to Migration placeholder

---
*Phase: 20-documentation*
*Completed: 2026-01-25*
