---
phase: 14-core-package
plan: 02
subsystem: ui
tags: [design-tokens, custom-events, lit, tailwind, css-custom-properties]

# Dependency graph
requires:
  - phase: 13-monorepo-infrastructure
    provides: pnpm workspace structure and vite-config
provides:
  - Design tokens module with CSS custom property references
  - Type-safe dispatchCustomEvent helper for Shadow DOM events
  - Subpath exports for @lit-ui/core/tokens and @lit-ui/core/utils
affects: [15-button-component, 16-dialog-component]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Multi-entry Vite build for subpath exports
    - CSS custom property tokens as const object
    - Type helpers for token path validation

key-files:
  created:
    - packages/core/src/tokens/index.ts
    - packages/core/src/utils/events.ts
    - packages/core/src/utils/environment.ts
    - packages/core/src/utils/index.ts
  modified:
    - packages/core/package.json
    - packages/core/vite.config.ts
    - packages/core/src/index.ts

key-decisions:
  - "Multi-entry Vite config over createLibraryConfig for subpath support"
  - "Tailwind token names (--color-primary) not custom --lui- namespace"
  - "Type helpers exported for token path validation"

patterns-established:
  - "Subpath exports: types first, then import in exports field"
  - "Token structure: category.name = 'var(--name)' pattern"
  - "Event helper: composed:true default for Shadow DOM traversal"

# Metrics
duration: 2min
completed: 2026-01-25
---

# Phase 14 Plan 02: Design Tokens and Utilities Summary

**CSS custom property token references for colors/spacing/radius/shadow/fontFamily/zIndex, plus type-safe dispatchCustomEvent helper with Shadow DOM defaults**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-25T04:06:55Z
- **Completed:** 2026-01-25T04:08:44Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Design tokens module with 92 lines covering 6 token categories
- Type-safe custom event dispatch helper with composed:true for Shadow DOM
- SSR-safe environment detection (isServer re-export, hasConstructableStylesheets)
- Package.json exports with /tokens and /utils subpaths
- Multi-entry Vite build configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Design Tokens Module** - `2752889` (feat)
2. **Task 2: Create Utility Helpers** - `98898fd` (feat)
3. **Task 3: Update Package Exports and Main Index** - `39834bb` (feat)

## Files Created/Modified

- `packages/core/src/tokens/index.ts` - Design tokens as CSS custom property references
- `packages/core/src/utils/events.ts` - dispatchCustomEvent helper
- `packages/core/src/utils/environment.ts` - isServer re-export, hasConstructableStylesheets
- `packages/core/src/utils/index.ts` - Barrel export for utils
- `packages/core/package.json` - Added ./tokens and ./utils subpath exports
- `packages/core/vite.config.ts` - Multi-entry build with object-style entry points
- `packages/core/src/index.ts` - Export utils from main entry

## Decisions Made

- **Multi-entry Vite config:** createLibraryConfig only supports single entry, so inline defineConfig used for object-style entry points
- **Tailwind token names:** Used Tailwind's native names (--color-primary) rather than custom --lui- namespace since tokens are already defined in @theme
- **Type exports:** Added FontFamilyToken and ZIndexToken type helpers beyond what plan specified

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- CSS warning about :host-context pseudo-class during build - this is from tailwind-element.ts which is not yet fully implemented and is unrelated to this plan

## Next Phase Readiness

- Tokens and utilities ready for component consumption
- Build produces separate entry points for subpath imports
- TailwindElement implementation needed before full component authoring

---
*Phase: 14-core-package*
*Completed: 2026-01-25*
