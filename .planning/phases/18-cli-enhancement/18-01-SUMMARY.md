---
phase: 18-cli-enhancement
plan: 01
subsystem: cli
tags: [cli, config, init, mode-selection]

# Dependency graph
requires:
  - phase: 15-component-packages
    provides: Published @lit-ui packages for npm mode
provides:
  - Mode field in LitUIConfig interface
  - Mode selection prompt in init command
  - Mode-aware base file copying
  - getOrCreateConfig helper function
affects: [18-02, 18-03, 18-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Mode-aware CLI behavior pattern (copy-source vs npm)

key-files:
  created: []
  modified:
    - packages/cli/src/utils/config.ts
    - packages/cli/src/commands/init.ts

key-decisions:
  - "Config file renamed to lit-ui.config.json for clarity"
  - "Default mode is copy-source for backward compatibility"
  - "npm mode skips base files (TailwindElement, host-defaults.css, tailwind.css)"

patterns-established:
  - "Mode branching: mode === 'copy-source' vs 'npm' pattern for CLI commands"

# Metrics
duration: 2min
completed: 2026-01-25
---

# Phase 18 Plan 01: Config Schema and Init Mode Summary

**CLI config updated with mode field ('copy-source' | 'npm'), init command prompts for mode selection**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-25T06:58:48Z
- **Completed:** 2026-01-25T07:00:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `mode: 'copy-source' | 'npm'` field to LitUIConfig interface
- Renamed config file from `lit-ui.json` to `lit-ui.config.json`
- Added mode selection prompt to init command (after environment detection)
- npm mode skips base file copying (uses @lit-ui/core package instead)
- Updated dependencies output: npm mode installs `@lit-ui/core` + `lit`
- Added `getOrCreateConfig` helper for commands that need a config to exist

## Task Commits

Each task was committed atomically:

1. **Task 1: Update config schema with mode field** - `1906edb` (feat)
2. **Task 2: Update init command with mode selection** - `e846aa1` (feat)

## Files Created/Modified

- `packages/cli/src/utils/config.ts` - Added mode field to LitUIConfig, renamed CONFIG_FILE, added getOrCreateConfig
- `packages/cli/src/commands/init.ts` - Added mode prompt, mode-aware base file copying, mode-aware dependencies

## Decisions Made

1. **Config file naming:** Renamed from `lit-ui.json` to `lit-ui.config.json` for clarity and consistency with other tools (vite.config.js, tsconfig.json, etc.)

2. **Default mode:** Set to `copy-source` to maintain backward compatibility - existing users upgrading won't have behavior changes

3. **npm mode base files:** Skipped in npm mode because these come from @lit-ui/core package. The TailwindElement base class and host-defaults.css are provided by the core package in npm mode.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Config schema ready for mode-aware add command (18-02)
- Init command tested and working with mode selection
- Foundation laid for migrate command (18-03) which will update mode field

---
*Phase: 18-cli-enhancement*
*Completed: 2026-01-25*
