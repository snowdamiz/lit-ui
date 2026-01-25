---
phase: 22-cli-theme-integration
plan: 01
subsystem: cli
tags: [theme, css, utility, tailwind, import-injection]

# Dependency graph
requires:
  - phase: 21-theme-system-foundation
    provides: decodeThemeConfig, generateThemeCSS, defaultTheme exports
provides:
  - detectCssEntry - find Tailwind CSS entry files
  - injectThemeImport - add theme import to CSS
  - applyTheme - complete theme application pipeline
affects: [22-02 init-command, 22-03 theme-command]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS entry detection with content verification
    - Import injection with idempotency and relative paths
    - TTY detection for interactive vs non-interactive modes

key-files:
  created:
    - packages/cli/src/utils/detect-css-entry.ts
    - packages/cli/src/utils/inject-import.ts
    - packages/cli/src/utils/apply-theme.ts
  modified: []

key-decisions:
  - "Check 10 CSS file locations covering Next.js, Vite, and common structures"
  - "Verify Tailwind content before accepting CSS file as entry"
  - "Calculate relative paths from CSS file to theme file for portability"
  - "Insert imports after @charset/@import but before content"

patterns-established:
  - "Idempotent operations: check before modifying"
  - "Graceful degradation: warn with manual instructions if detection fails"
  - "TTY awareness: prompt in interactive, skip in CI/scripts"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 22 Plan 01: Shared Theme Utilities Summary

**CSS entry detection, import injection, and theme application utilities for CLI commands**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T21:43:00Z
- **Completed:** 2026-01-25T21:46:00Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- detectCssEntry finds Tailwind CSS files in 10 common project locations
- injectThemeImport adds theme imports idempotently with correct relative paths
- applyTheme provides complete pipeline: decode, generate CSS, write file, inject import

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CSS entry file detection utility** - `2c01a47` (feat)
2. **Task 2: Create CSS import injection utility** - `edac088` (feat)
3. **Task 3: Create shared theme application utility** - `5ad49ee` (feat)

## Files Created

- `packages/cli/src/utils/detect-css-entry.ts` - Finds Tailwind CSS entry files in common project locations
- `packages/cli/src/utils/inject-import.ts` - Injects theme import into CSS files with idempotency
- `packages/cli/src/utils/apply-theme.ts` - Complete theme application with prompts and error handling

## Decisions Made

- **CSS candidates order**: Ordered by likelihood (Next.js App Router first, then Vite, then general)
- **Tailwind verification**: Check for `@import "tailwindcss"` or `@tailwind base` to avoid false positives
- **Relative path calculation**: Use pathe.relative from CSS file directory to theme file
- **Import insertion**: After @charset/@import lines but before actual CSS content
- **TTY handling**: Prompt for replacement in interactive mode, skip in CI/non-TTY

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Utilities ready for consumption by init command (22-02)
- Utilities ready for consumption by theme command (22-03)
- No blockers

---
*Phase: 22-cli-theme-integration*
*Completed: 2026-01-25*
