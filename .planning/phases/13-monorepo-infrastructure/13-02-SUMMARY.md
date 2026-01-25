---
phase: 13-monorepo-infrastructure
plan: 02
subsystem: infra
tags: [typescript, vite, monorepo, config, build]

# Dependency graph
requires:
  - phase: 13-01
    provides: pnpm workspace structure
provides:
  - "@lit-ui/typescript-config internal package"
  - "@lit-ui/vite-config internal package"
  - "createLibraryConfig factory function"
affects: [13-03, 13-04, component-packages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared TypeScript config via workspace package"
    - "Vite library build factory pattern"
    - "External peer dependencies for config packages"

key-files:
  created:
    - packages/typescript-config/package.json
    - packages/typescript-config/base.json
    - packages/typescript-config/library.json
    - packages/vite-config/package.json
    - packages/vite-config/library.js
  modified: []

key-decisions:
  - "Separate base.json and library.json for different use cases"
  - "Factory function pattern for Vite config (createLibraryConfig)"
  - "Peer dependencies for vite/dts/tailwind in config package"

patterns-established:
  - "Config packages are private: true (internal, not published)"
  - "Exports field for subpath exports (./base.json, ./library)"
  - "Externalize lit and all @lit-ui packages in library builds"

# Metrics
duration: 1 min
completed: 2026-01-24
---

# Phase 13 Plan 02: Shared Config Packages Summary

**TypeScript and Vite config packages for workspace-wide build consistency with ESM exports and Lit decorator settings**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-25T02:45:14Z
- **Completed:** 2026-01-25T02:46:31Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- Created @lit-ui/typescript-config with base.json (common settings) and library.json (declaration generation)
- Created @lit-ui/vite-config with createLibraryConfig factory function
- Both packages marked private for internal workspace use only
- TypeScript config includes experimentalDecorators and useDefineForClassFields for Lit compatibility
- Vite config externalizes lit and all @lit-ui packages, uses Tailwind Vite plugin

## Task Commits

Each task was committed atomically:

1. **Task 1: Create @lit-ui/typescript-config package** - `82e2feb` (chore)
2. **Task 2: Create @lit-ui/vite-config package** - `7e453de` (chore)

## Files Created/Modified
- `packages/typescript-config/package.json` - Package manifest with subpath exports
- `packages/typescript-config/base.json` - Base TypeScript config for all packages
- `packages/typescript-config/library.json` - Extended config for publishable libraries
- `packages/vite-config/package.json` - Package manifest with peer dependencies
- `packages/vite-config/library.js` - createLibraryConfig factory function

## Decisions Made
- **Separate configs**: base.json for common settings, library.json extends for declaration output
- **Factory pattern**: createLibraryConfig takes options for entry and entryRoot customization
- **Peer dependencies**: vite, vite-plugin-dts, @tailwindcss/vite as peers (not bundled)
- **External packages**: Regex patterns externalize lit/* and @lit-ui/* for proper deduplication

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Config packages ready for component packages to consume
- Ready for 13-03: Initial component package setup (button or similar)
- Component tsconfig.json can extend @lit-ui/typescript-config/library.json
- Component vite.config.js can import createLibraryConfig from @lit-ui/vite-config/library

---
*Phase: 13-monorepo-infrastructure*
*Completed: 2026-01-24*
