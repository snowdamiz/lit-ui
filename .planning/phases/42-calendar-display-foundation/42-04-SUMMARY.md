---
phase: 42-calendar-display-foundation
plan: 04
subsystem: ui
tags: lit, keyboard-navigation, accessibility, wai-aria, roving-tabindex, wcag-2.1

# Dependency graph
requires:
  - phase: 42-01
    provides: Calendar grid layout and date utilities
  - phase: 42-02
    provides: Date cell rendering with today indicator and selected state
provides:
  - KeyboardNavigationManager class for roving tabindex
  - Keyboard navigation on calendar grid (arrow keys, Home/End, Page Up/Down)
  - Enter/Space key activation for date selection
  - Focus visible styling for keyboard users
affects: 42-05, 42-06, 42-07, 42-08 (subsequent calendar plans)

# Tech tracking
tech-stack:
  added: []
  patterns: [WAI-ARIA Grid Pattern keyboard navigation, Roving tabindex pattern, KeyboardNavigationManager class, Client-side initialization with isServer guards]

key-files:
  created: [packages/calendar/src/keyboard-nav.ts]
  modified: [packages/calendar/src/calendar.ts]

key-decisions:
  - "Create dedicated KeyboardNavigationManager class for roving tabindex - separates concerns, reusable pattern"
  - "Roving tabindex ensures only one cell has tabindex='0' at a time - WCAG 2.1 Level AA requirement"
  - "Arrow keys navigate grid (up/down/left/right) - standard WAI-ARIA Grid pattern"
  - "Home/End keys move to first/last cell in row - common keyboard navigation convention"
  - "Page Up/Down keys change months - intuitive keyboard navigation for calendar"
  - "Enter/Space keys select focused date - follows WAI-ARIA activation pattern"
  - "Focus visible styling required for keyboard users - accessibility best practice"
  - "isServer guards prevent SSR crashes - client-only keyboard functionality"

patterns-established:
  - "Pattern: KeyboardNavigationManager class encapsulates roving tabindex logic"
  - "Pattern: Grid navigation math (columns=7) for calendar week rows"
  - "Pattern: Boundary checks prevent focus moving outside grid"
  - "Pattern: updated() lifecycle reinitializes nav manager on month changes"
  - "Pattern: Focus visible outline with brand color for keyboard users"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 42 Plan 04: Keyboard Navigation with Roving Tabindex Summary

**Roving tabindex keyboard navigation for calendar grid with WAI-ARIA Grid Pattern compliance**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T03:09:46Z
- **Completed:** 2026-01-31T03:12:32Z
- **Tasks:** 3 (Task 3 was implemented as part of Task 2)
- **Files modified:** 2

## Accomplishments

- Created KeyboardNavigationManager class with roving tabindex utilities (201 lines)
- Implemented grid navigation math for arrow keys (up/down/left/right with 7-column grid)
- Implemented Home/End key navigation for row start/end movement
- Added Page Up/Down key handlers for month navigation
- Added Enter/Space key handlers for date selection activation
- Integrated keyboard navigation into Calendar component with handleKeyDown
- Added initializeNavigationManager() for client-side keyboard nav setup
- Added updated() lifecycle to reinitialize nav on month changes
- Updated renderDayCell() to use roving tabindex (only focused cell gets tabindex="0")
- Added focus-visible CSS styling for keyboard focus indicator
- Followed WAI-ARIA Grid Pattern for keyboard interactions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create roving tabindex utility module** - `ead2ca2` (feat)
   - Created keyboard-nav.ts with KeyboardNavigationManager class
   - Implemented setInitialFocus(), moveFocus(), getElement() methods
   - Grid navigation math for arrow keys and Home/End with boundary checks
   - Helper functions for row start/end calculations

2. **Task 2: Add keyboard event handler to calendar** - `7a96cb1` (feat)
   - Added @query('[role="gridcell"]') gridCells for element references
   - Added @state focusedIndex and navigationManager for roving tabindex
   - Added initializeNavigationManager() for client-side keyboard nav setup
   - Added updated() lifecycle to reinitialize nav on month changes
   - Added handleKeyDown() with arrow keys, Home/End, Page Up/Down, Enter/Space
   - Added handlePreviousMonth() and handleNextMonth() for month navigation
   - Added emitMonthChange() to emit ui-month-change events
   - Updated renderDayCell() to use roving tabindex (only focused cell gets 0)
   - Attached @keydown handler to grid element
   - Added focus-visible CSS for keyboard focus indicator

3. **Task 3: Add Enter/Space key handling for date selection** - Implemented in Task 2
   - Enter/Space cases in handleKeyDown() select the focused date
   - Calls handleDateClick() to trigger date selection and emit ui-date-select event
   - preventDefault() prevents page scroll on Space key

**Deviations:** None

**Plan metadata:** (to be created after SUMMARY.md)

## Files Created/Modified

### Created
- `packages/calendar/src/keyboard-nav.ts` - Roving tabindex utilities (201 lines)
  - KeyboardNavigationManager class
  - setInitialFocus(), moveFocus(), getElement(), updateElements() methods
  - getRowStartIndex(), getRowEndIndex() helper functions

### Modified
- `packages/calendar/src/calendar.ts` - Added keyboard navigation
  - Import KeyboardNavigationManager and @query decorator
  - Added focusedIndex, navigationManager state, gridCells query
  - Added initializeNavigationManager(), handleKeyDown(), handlePreviousMonth(), handleNextMonth(), emitMonthChange() methods
  - Updated renderDayCell() to accept index parameter and use roving tabindex
  - Updated render() to pass index to renderDayCell() and attach @keydown handler
  - Added updated() lifecycle for reinitializing nav on month changes
  - Added focus-visible CSS styling

## Decisions Made

- Create dedicated KeyboardNavigationManager class for roving tabindex - separates concerns from calendar component, reusable pattern for other grid components
- Roving tabindex ensures only one cell has tabindex='0' at a time - WCAG 2.1 Level AA requirement for keyboard navigation
- Arrow keys navigate grid (up/down/left/right) - standard WAI-ARIA Grid pattern, expected behavior for keyboard users
- Home/End keys move to first/last cell in row - common keyboard navigation convention (matches spreadsheet behavior)
- Page Up/Down keys change months - intuitive keyboard navigation for calendar (matches date picker conventions)
- Enter/Space keys select focused date - follows WAI-ARIA activation pattern for grid cells
- Focus visible styling required for keyboard users - accessibility best practice, shows which cell has focus
- isServer guards prevent SSR crashes - keyboard functionality is client-only

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

---

**Total deviations:** 0
**Impact on plan:** No deviations

## Issues Encountered

None - all tasks completed as specified.

## User Setup Required

None - no external service configuration required.

## Verification

All success criteria met:

1. **Arrow keys move focus between grid cells** ✓
   - ArrowRight/Left move horizontally (with boundary checks)
   - ArrowUp/Down move vertically by one week (7 cells)

2. **Home/End move to row start/end** ✓
   - Home moves to first cell in current row
   - End moves to last cell in current row

3. **Page Up/Down change months** ✓
   - PageUp calls handlePreviousMonth()
   - PageDown calls handleNextMonth()

4. **Enter/Space select focused date** ✓
   - Both keys call handleDateClick() on focused date
   - Emits ui-date-select event with selected date

5. **Only one cell has tabindex="0" at a time** ✓
   - renderDayCell() uses dynamic tabindex based on isFocused
   - KeyboardNavigationManager.setInitialFocus() sets initial tabindex
   - moveFocus() updates tabindex on navigation

6. **Focus moves visibly between cells** ✓
   - focus-visible CSS adds 2px outline with brand color
   - outline-offset: 2px for visibility

Additional verification:
- SSR safety: All keyboard handlers use isServer guards
- Reinitialization: updated() lifecycle reinitializes nav manager when month changes
- Boundary checks: moveFocus() prevents index going outside valid range

## Next Phase Readiness

- Keyboard navigation foundation is complete and WCAG 2.1 Level AA compliant
- Roving tabindex pattern established for future grid components
- Ready for next plan (42-05): Month navigation controls (Previous/Next buttons, month/year dropdowns)

---
*Phase: 42-calendar-display-foundation*
*Completed: 2026-01-31*
