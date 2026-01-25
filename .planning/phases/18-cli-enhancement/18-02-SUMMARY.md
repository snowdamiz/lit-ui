---
phase: 18-cli-enhancement
plan: 02
subsystem: cli
tags: [cli, npm, package-manager, execa]

# Dependency graph
requires:
  - phase: 18-01
    provides: Config mode field, getOrCreateConfig helper
provides:
  - installComponent utility for npm mode installations
  - isNpmComponent check for package availability
  - componentToPackage mapping for @lit-ui packages
  - Mode branching in add command with flag overrides
affects: [18-03-update, 18-04-publish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Package manager detection with install command branching
    - Flag overrides for config mode

key-files:
  created:
    - packages/cli/src/utils/install-component.ts
  modified:
    - packages/cli/src/commands/add.ts

key-decisions:
  - "Install @lit-ui/core peer dependency automatically before component"
  - "npm mode shows import and usage instructions after install"
  - "lui-* prefix for component tag names in usage hints"

patterns-established:
  - "Flag overrides config: --npm or --copy takes precedence over lit-ui.config.json mode"
  - "componentToPackage mapping defines npm-available components"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 18 Plan 02: Add Command Mode Branching Summary

**Add command now branches on mode (npm vs copy-source) with --npm and --copy flag overrides, installComponent utility runs package manager installs**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T07:15:00Z
- **Completed:** 2026-01-25T07:18:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created installComponent utility that maps component names to @lit-ui package names
- Auto-detects package manager (npm/yarn/pnpm/bun) and uses correct install syntax
- Add command branches on mode - npm mode installs packages, copy-source copies files
- Flag overrides (--npm, --copy) take precedence over config mode
- npm mode prints import and usage instructions after successful install

## Task Commits

Each task was committed atomically:

1. **Task 1: Create install-component utility for npm mode** - `edb7ff8` (feat)
2. **Task 2: Update add command with mode branching and flags** - `ed10080` (feat)

## Files Created/Modified

- `packages/cli/src/utils/install-component.ts` - npm mode component installation with componentToPackage mapping
- `packages/cli/src/commands/add.ts` - Mode branching with --npm and --copy flags, uses getOrCreateConfig

## Decisions Made

- Install @lit-ui/core peer dependency automatically before each component package
- npm mode shows import snippet (`import '@lit-ui/button'`) and usage (`<lui-button>`) after install
- Use `lui-` prefix for tag names in usage hints (matches @lit-ui component naming)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- npm mode add command functional with package manager detection
- Ready for 18-03 (Update command) which will use similar mode branching
- componentToPackage mapping can be extended as more packages are published

---
*Phase: 18-cli-enhancement*
*Completed: 2026-01-25*
