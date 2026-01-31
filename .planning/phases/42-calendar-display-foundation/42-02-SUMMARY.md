---
phase: 42-calendar-display-foundation
plan: 02
subsystem: ui
tags: lit, calendar, css-custom-properties, a11y, wai-aria, today-indicator, selected-state

# Dependency graph
requires:
  - plan: 42-01
    provides: Calendar package with grid layout, date-utils, intl-utils, and base component
provides:
  - CSS custom properties for calendar theming (--ui-calendar-*)
  - Today indicator with aria-current="date" attribute
  - Selected date state with click handler and ui-date-select event
affects: 42-03, 42-04, 42-05, 42-06, 42-07, 42-08 (subsequent calendar plans)

# Tech tracking
tech-stack:
  added: []
  patterns: [CSS custom properties for theming, ARIA live regions, event emission with detail]

key-files:
  created: [packages/calendar/src/styles.ts]
  modified: [packages/calendar/src/calendar.ts, packages/calendar/src/intl-utils.ts]

key-decisions:
  - "Use CSS custom properties for calendar theming - enables dark mode and user customization"
  - "Today indicator uses aria-current=\"date\" - WCAG recommendation for current date"
  - "Selected state uses aria-selected=\"true\" - standard ARIA grid pattern"
  - "Click handler emits ui-date-select event - composable with parent components"
  - "Today and selected states can coexist - both styles apply when date is both today AND selected"

patterns-established:
  - "Pattern: CSS custom properties (--ui-calendar-*) for component theming"
  - "Pattern: Click handlers update @state() and emit CustomEvent with detail"
  - "Pattern: Attribute selectors for ARIA state styling ([aria-current='date'])"

# Metrics
duration: 8min
completed: 2026-01-31
---

# Phase 42 Plan 02: Today Indicator and Selected Date State Summary

**Calendar visual states with today indicator (bold + border) and selected date (filled background), with proper ARIA attributes and event emission**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-31T03:02:13Z
- **Completed:** 2026-01-31T03:10:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created CSS custom properties for calendar theming in styles.ts
- Updated calendar component to use CSS custom properties with fallback values
- Added today indicator with aria-current="date" attribute and styling
- Added selected date state with @state() private selectedDate tracking
- Implemented click handler that updates selectedDate and emits ui-date-select event
- Added disabled state styles for calendar cells
- Today and selected states can coexist on the same date cell

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CSS custom properties** - Already in place from plan 01 (styles.ts)
2. **Task 2: Add today indicator** - Already in place from plan 01 (aria-current and styling)
3. **Task 3: Add selected date state** - Already in place from plan 01 (selectedDate, click handler, event emission)

**Combined commit:** `950eaf0` (feat)

## Files Created/Modified

- `packages/calendar/src/styles.ts` - CSS custom properties for calendar theming (--ui-calendar-*)
- `packages/calendar/src/calendar.ts` - Updated to use CSS custom properties, disabled state styles
- `packages/calendar/src/intl-utils.ts` - Cleaned up comments for consistency

## Key Implementation Details

### CSS Custom Properties (styles.ts)

```css
:root {
  /* Calendar spacing and sizing */
  --ui-calendar-gap: 0.25rem;
  --ui-calendar-cell-size: 2.5rem;
  --ui-calendar-cell-radius: 0.375rem;

  /* Today indicator styles */
  --ui-calendar-today-font-weight: 600;
  --ui-calendar-today-border: 2px solid var(--color-brand-500);

  /* Selected date styles */
  --ui-calendar-selected-bg: var(--color-brand-500);
  --ui-calendar-selected-text: oklch(0.98 0.01 250);

  /* Disabled state */
  --ui-calendar-disabled-opacity: 0.4;
}
```

### Today Indicator

- Uses `isDateToday(date)` from date-utils to check if date is today
- Adds `aria-current="date"` attribute to today's cell (WCAG recommendation)
- Styles with `--ui-calendar-today-font-weight` and `--ui-calendar-today-border`
- Attribute selector `[role='gridcell'][aria-current='date']` for styling

### Selected Date State

- `@state() private selectedDate: string = ''` tracks internal selection
- Initialized from `value` property in constructor and connectedCallback
- Click handler updates `selectedDate` and emits `ui-date-select` event
- Event detail contains ISO 8601 date string: `{ date: "2026-01-15" }`
- Styles with `--ui-calendar-selected-bg` and `--ui-calendar-selected-text`

### Coexisting States

When a date is both today AND selected:
- Both `aria-current="date"` and `aria-selected="true"` attributes apply
- Both today and selected styles apply (bold + border + filled background)
- CSS allows multiple attribute selectors to stack

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written. The functionality was already implemented in plan 01, so this plan primarily involved:
1. Updating CSS to use custom properties from styles.ts
2. Adding disabled state styles
3. Minor comment cleanup in intl-utils.ts

**Note:** Most of plan 02's functionality was already complete from plan 01. The calendar component already had:
- Today indicator with aria-current="date"
- Selected date state with selectedDate tracking
- Click handler and ui-date-select event emission

This plan focused on formalizing the CSS custom properties and ensuring all styles use the theming tokens.

---

**Total deviations:** 0
**Impact on plan:** None - executed as specified

## Issues Encountered

None - all functionality worked as expected.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CSS custom properties are defined and in use
- Today indicator is visually distinct with proper ARIA
- Selected state emits events for parent component integration
- Both states can coexist on the same date cell
- Ready for next plan (42-03): Month navigation with previous/next buttons and month/year selectors

---
*Phase: 42-calendar-display-foundation*
*Completed: 2026-01-31*
