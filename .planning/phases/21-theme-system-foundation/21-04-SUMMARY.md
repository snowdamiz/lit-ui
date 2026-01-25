---
phase: 21-theme-system-foundation
plan: 04
subsystem: theme
tags: [css-generation, oklch, tailwind-v4, dark-mode, css-custom-properties]

# Dependency graph
requires:
  - phase: 21-01
    provides: ThemeConfig schema and type definitions
  - phase: 21-02
    provides: deriveDarkMode and deriveForeground color utilities
provides:
  - generateThemeCSS function for CSS variable generation
  - CSS output with :root, .dark, and @media blocks
  - Border radius token mapping (sm/md/lg)
affects: [21-05, 22-cli-theme, 23-configurator]

# Tech tracking
tech-stack:
  added: []
  patterns: [CSS custom property generation, template literal CSS, semantic color tokens]

key-files:
  created:
    - packages/cli/src/theme/css-generator.ts
    - packages/cli/tests/theme/css-generator.test.ts
  modified:
    - packages/cli/src/theme/index.ts

key-decisions:
  - "--lui-* prefix for CSS variables (e.g., --lui-primary, --lui-radius-sm)"
  - "Both .dark class AND @media prefers-color-scheme for dark mode"
  - ":root:not(.light) selector in media query for opt-out capability"
  - "Radius values hard-coded per scale option (no runtime calculation)"

patterns-established:
  - "CSS generation via template literals for clean output"
  - "Foreground colors derived automatically from backgrounds"
  - "Dark mode colors derived automatically from light mode"

# Metrics
duration: 2min
completed: 2026-01-25
---

# Phase 21 Plan 04: CSS Theme Generator Summary

**TDD CSS generator producing Tailwind v4-compatible CSS with --lui-* variables, auto-derived dark mode, and border radius tokens**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-25T20:32:35Z
- **Completed:** 2026-01-25T20:34:57Z
- **Tasks:** TDD cycle (RED -> GREEN)
- **Files modified:** 3

## Accomplishments

- Implemented `generateThemeCSS()` function that transforms ThemeConfig into complete CSS
- Generates :root block with all --lui-* semantic color variables
- Generates .dark block with derived dark mode colors (using deriveDarkMode)
- Generates @media (prefers-color-scheme: dark) block with :root:not(.light) selector
- Auto-derives foreground colors for each semantic color (using deriveForeground)
- Maps radius config (sm/md/lg) to appropriate rem values
- Includes documentation comments and section headers in output

## Task Commits

Each TDD phase was committed atomically:

1. **RED: Failing tests** - `613934f` (test)
2. **GREEN: Implementation** - `ddd9f04` (feat)

_Note: REFACTOR phase skipped - code was already clean and well-structured_

## Files Created/Modified

- `packages/cli/src/theme/css-generator.ts` - CSS generation function with template literal output
- `packages/cli/tests/theme/css-generator.test.ts` - 32 comprehensive tests covering structure, variables, dark mode, and validity
- `packages/cli/src/theme/index.ts` - Added generateThemeCSS export

## Decisions Made

1. **--lui-* prefix** - Matches convention from CONTEXT.md, distinct from Tailwind's --color-* and component's --ui-*
2. **Dual dark mode support** - .dark class for manual control, @media for system preference
3. **:root:not(.light) selector** - Allows users to force light mode even when system prefers dark
4. **Auto-derived colors** - Foreground and dark mode colors computed automatically, not stored in config
5. **Hardcoded radius values** - Simple lookup table rather than runtime calculation (clear, predictable)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation straightforward. Color utilities from 21-02 worked perfectly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CSS generator ready for integration with CLI commands (Phase 22)
- All --lui-* variables defined as specified in CONTEXT.md
- Theme module now exports complete public API:
  - Schema: themeConfigSchema, ThemeConfig, PartialThemeConfig
  - Defaults: defaultTheme, mergeThemeConfig
  - Colors: generateScale, deriveDarkMode, deriveForeground
  - Encoding: encodeThemeConfig, decodeThemeConfig
  - CSS: generateThemeCSS

---
*Phase: 21-theme-system-foundation*
*Completed: 2026-01-25*
