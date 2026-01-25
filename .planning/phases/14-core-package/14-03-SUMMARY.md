---
phase: 14-core-package
plan: 03
subsystem: ui
tags: [fouc, ssr, tailwind, lit, tree-shaking, build]

# Dependency graph
requires:
  - phase: 14-01
    provides: TailwindElement base class with SSR-aware styling
  - phase: 14-02
    provides: Design tokens and utility exports
provides:
  - FOUC prevention CSS for consumers
  - Verified complete build output
  - Tree shaking validation
affects: [15-button-package, 16-dialog-package, consumer-apps]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ":not(:defined) selector for FOUC prevention"
    - "sideEffects: false for tree shaking"

key-files:
  created:
    - packages/core/src/fouc.css
  modified:
    - packages/core/package.json

key-decisions:
  - "fouc.css shipped as source (not built) for direct CSS import"
  - "Skeleton placeholder styles commented as optional pattern"

patterns-established:
  - "FOUC prevention via opacity:0 + visibility:hidden on :not(:defined)"
  - "Source CSS files in files array for direct consumer import"

# Metrics
duration: 1min
completed: 2026-01-25
---

# Phase 14 Plan 03: Build Verification and FOUC Prevention Summary

**FOUC prevention CSS with :not(:defined) selectors, validated tree-shaking via sideEffects:false, and verified multi-entry build with 66KB index.js**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-25T04:11:24Z
- **Completed:** 2026-01-25T04:12:34Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Created FOUC prevention CSS snippet for consumer apps
- Validated all dist/ outputs exist (index.js, tokens/, utils/)
- Confirmed tree-shaking setup with sideEffects: false
- Verified lit is externalized (not bundled)
- Confirmed all exports work (TailwindElement, isServer, dispatchCustomEvent, hasConstructableStylesheets, VERSION)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FOUC Prevention CSS** - `575bc43` (feat)
2. **Task 2: Verify Full Build and Exports** - No commit (verification only)
3. **Task 3: Validate Tree Shaking and Side Effects** - No commit (verification only)

## Files Created/Modified

- `packages/core/src/fouc.css` - FOUC prevention CSS with :not(:defined) selectors for ui-button and ui-dialog
- `packages/core/package.json` - Added ./fouc.css export and src/fouc.css to files array

## Build Verification Results

**Build outputs verified:**
- `dist/index.js` - 66,705 bytes (65 lines), main entry with all exports
- `dist/index.d.ts` - TypeScript declarations
- `dist/tokens/index.js` - 1,993 bytes, design token exports
- `dist/tokens/index.d.ts` - Token type definitions
- `dist/utils/index.js` - 465 bytes, utility function exports
- `dist/utils/index.d.ts` - Utility type definitions

**Exports confirmed in dist/index.js:**
- TailwindElement class
- isServer (re-exported from lit)
- dispatchCustomEvent
- hasConstructableStylesheets
- VERSION constant ("0.0.1")

**Tree-shaking validated:**
- sideEffects: false in package.json
- All module-level code properly guarded (!isServer, typeof document !== 'undefined')
- lit imports externalized (not bundled)

## Decisions Made

- **fouc.css as source file:** Shipped in src/ rather than dist/ since it's plain CSS that consumers import directly
- **Optional skeleton pattern:** Included commented skeleton placeholder styles as documentation/example

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Build warning about `:host-context` pseudo-class not recognized - this is a Lightning CSS warning that doesn't affect functionality (host-context is valid CSS for Shadow DOM)

## Success Criteria Verification

1. All dist/ files exist as expected - PASS
2. TailwindElement, isServer, dispatchCustomEvent exported - PASS
3. tokens/index.js and utils/index.js exist - PASS
4. fouc.css exists and is in package exports - PASS
5. sideEffects: false in package.json - PASS
6. lit is external (not bundled) - PASS

## Next Phase Readiness

- @lit-ui/core package is fully verified and ready for consumption
- Phase 14 can be completed with plan 04 (final integration tests)
- Button and Dialog packages (Phase 15, 16) can now extend TailwindElement

---
*Phase: 14-core-package*
*Completed: 2026-01-25*
