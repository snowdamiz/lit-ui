---
phase: 14-core-package
plan: 01
subsystem: ui
tags: [lit, tailwind, ssr, web-components, shadow-dom]

# Dependency graph
requires:
  - phase: 13-monorepo-infrastructure
    provides: Package structure with @lit-ui/core skeleton
provides:
  - SSR-aware TailwindElement base class with dual-mode styling
  - Tailwind v4 CSS configuration with design tokens
  - Shadow DOM @property workaround via host-defaults.css
  - Safelist utilities for class passthrough
affects: [15-button-migration, 16-dialog-migration, component-packages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "isServer guard for SSR-safe code"
    - "CSS ?inline imports for build-time processing"
    - "Shared constructable stylesheets for memory optimization"
    - "Static styles getter for SSR inline CSS"

key-files:
  created:
    - packages/core/src/tailwind-element.ts
    - packages/core/src/styles/tailwind.css
    - packages/core/src/styles/host-defaults.css
    - packages/core/src/styles/safelist.css
    - packages/core/src/vite-env.d.ts
  modified:
    - packages/core/src/index.ts

key-decisions:
  - "SSR returns inline CSS via static styles getter, client uses adoptedStyleSheets"
  - "Guard constructable stylesheet creation with !isServer check"
  - "Add vite-env.d.ts for CSS module type declarations"

patterns-established:
  - "isServer guard pattern for SSR-safe DOM operations"
  - "CSS with ?inline suffix for Vite build-time processing"
  - "Shared stylesheet variables at module level for memory efficiency"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Phase 14 Plan 01: TailwindElement Base Class Summary

**SSR-aware TailwindElement with isServer guards, dual-mode styling (inline SSR vs shared constructable stylesheets), and Tailwind v4 CSS tokens**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24T20:06:00Z
- **Completed:** 2026-01-24T20:09:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Created TailwindElement base class with full SSR support via isServer guards
- Dual-mode styling: inline CSS during SSR, shared adoptedStyleSheets on client
- Copied CSS files with design tokens, @property workarounds, and safelist utilities
- Added TypeScript declarations for CSS module imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SSR-Aware TailwindElement Base Class** - `6ce9587` (feat)
2. **Task 2: Copy and Adapt CSS Files** - `dab4f76` (feat)
3. **Task 3: Update Index Exports** - `266ed58` (feat)

## Files Created/Modified
- `packages/core/src/tailwind-element.ts` - SSR-aware base class (189 lines)
- `packages/core/src/styles/tailwind.css` - Tailwind v4 config with design tokens
- `packages/core/src/styles/host-defaults.css` - Shadow DOM @property workaround
- `packages/core/src/styles/safelist.css` - Utility classes for passthrough
- `packages/core/src/vite-env.d.ts` - CSS module type declarations
- `packages/core/src/index.ts` - Added TailwindElement export

## Decisions Made
- **SSR uses inline CSS via static styles getter** - During SSR (isServer === true), the static styles getter returns inline CSS via unsafeCSS for Declarative Shadow DOM. On client, returns empty array since styles are applied via adoptedStyleSheets.
- **Constructable stylesheets guarded with !isServer** - Module-level stylesheet creation wrapped in `if (!isServer && typeof CSSStyleSheet !== 'undefined')` to prevent SSR errors.
- **Added vite-env.d.ts for CSS types** - TypeScript declarations needed for `*.css?inline` imports to resolve without errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added vite-env.d.ts for CSS module type declarations**
- **Found during:** Task 3 (Build verification)
- **Issue:** TypeScript emitted errors for CSS imports: "Cannot find module './styles/tailwind.css?inline'"
- **Fix:** Created vite-env.d.ts with `declare module '*.css?inline'` type declaration
- **Files modified:** packages/core/src/vite-env.d.ts
- **Verification:** Build succeeds without TypeScript errors
- **Committed in:** `266ed58` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for clean TypeScript build. No scope creep.

## Issues Encountered
- CSS validator warning about `:host-context(.dark)` pseudo-class - this is a valid Shadow DOM selector that some validators don't recognize yet. Ignored as expected behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TailwindElement base class ready for component migration
- Button and Dialog components can now extend TailwindElement
- Build verified working with correct exports

---
*Phase: 14-core-package*
*Completed: 2026-01-24*
