---
phase: 25-docs-site-dark-mode
plan: 01
subsystem: ui
tags: [dark-mode, tailwindcss-v4, react-context, localStorage, css-variables, oklch]

# Dependency graph
requires: []
provides:
  - ThemeContext with ThemeProvider and useTheme hook
  - FOUC prevention inline script in index.html
  - Tailwind CSS v4 @custom-variant dark configuration
  - Dark mode CSS variables with shadcn-inspired neutral palette
affects: [25-02, 25-03, 25-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ThemeContext pattern: state from DOM class, sync to localStorage + DOM"
    - "FOUC prevention: inline script in head before React hydration"
    - "Tailwind v4 dark mode: @custom-variant dark (&:where(.dark, .dark *))"

key-files:
  created:
    - apps/docs/src/contexts/ThemeContext.tsx
  modified:
    - apps/docs/index.html
    - apps/docs/src/index.css

key-decisions:
  - "Initialize theme state from DOM class set by FOUC script, not localStorage"
  - "Use shadcn-inspired neutral dark palette with OKLCH colors"
  - "Add dark mode overrides for utility classes in CSS, not Tailwind classes"

patterns-established:
  - "ThemeContext: single source of truth for docs site theme"
  - "FOUC script sets class before React, context reads class on init"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 25 Plan 01: Theme Infrastructure Summary

**ThemeContext with localStorage persistence, FOUC prevention inline script, and Tailwind CSS v4 @custom-variant dark mode configuration with shadcn-inspired neutral dark palette**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T00:00:00Z
- **Completed:** 2026-01-25T00:03:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- ThemeContext providing global theme state with localStorage sync
- FOUC prevention script that sets dark class before React hydration
- Tailwind CSS v4 class-based dark mode via @custom-variant
- Dark mode CSS variables and utility class overrides

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ThemeContext with localStorage persistence** - `4dbf15c` (feat)
2. **Task 2: Add FOUC prevention script to index.html** - `0f96764` (feat)
3. **Task 3: Configure Tailwind CSS v4 dark mode and add dark CSS variables** - `5bc7ab0` (feat)

## Files Created/Modified
- `apps/docs/src/contexts/ThemeContext.tsx` - ThemeProvider component and useTheme hook for global theme state
- `apps/docs/index.html` - Inline FOUC prevention script in head section
- `apps/docs/src/index.css` - @custom-variant dark, .dark CSS variables, utility class dark overrides

## Decisions Made
- **Theme state initialization:** Read from document.documentElement class (set by FOUC script) rather than localStorage directly. This ensures React state matches what's already rendered.
- **Dark palette values:** Used shadcn-inspired neutral values: background oklch(0.10 0 0), foreground oklch(0.95 0 0), muted-foreground oklch(0.65 0 0), border oklch(0.25 0 0), card oklch(0.12 0 0).
- **Utility class dark overrides:** Added .dark selector overrides in CSS for grid-pattern, hero-gradient, bottom-fade, focus-ring, and ::selection rather than using Tailwind dark: prefix inline.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Theme infrastructure complete
- ThemeProvider ready to wrap App in main.tsx (Plan 02)
- ThemeToggle component can use useTheme hook (Plan 03)
- Configurator sync can use useTheme hook (Plan 04)

---
*Phase: 25-docs-site-dark-mode*
*Completed: 2026-01-25*
