---
phase: 49-time-picker-advanced
plan: 02
subsystem: time-picker
tags: [timezone, intl, lit, internal-component]
dependency-graph:
  requires: [48-01]
  provides: [timezone-display-component]
  affects: [49-06]
tech-stack:
  added: []
  patterns: [Intl.DateTimeFormat timezone conversion, formatToParts abbreviation extraction]
key-files:
  created:
    - packages/time-picker/src/timezone-display.ts
  modified: []
decisions:
  - Use Intl.DateTimeFormat exclusively for timezone conversion (no hardcoded offsets)
  - Primary timezone defaults to browser local via resolvedOptions().timeZone
  - role="status" for screen reader updates when time changes
  - CSS custom properties --ui-time-picker-timezone-* for theming
metrics:
  duration: ~1 min
  completed: 2026-02-02
---

# Phase 49 Plan 02: Timezone Display Summary

**Multi-timezone display component using Intl.DateTimeFormat with IANA identifiers and formatToParts for abbreviation extraction.**

## What Was Done

### Task 1: Create TimezoneDisplay internal component

Created `lui-timezone-display` internal component following the same patterns as TimeInput, ClockFace, and TimeDropdown.

**Key implementation details:**

- `formatTimeInTimezone()` uses two Intl.DateTimeFormat instances: one for time formatting, one with `formatToParts()` to extract the timezone abbreviation
- `timezoneEntries` getter builds display array from primary + additional timezones
- Primary timezone resolves empty string to browser local via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Error handling wraps Intl API calls in try/catch, returning `{ time: '?', tzName: timezone }` for invalid IANA IDs
- Pipe-separated layout with `role="status"` for accessibility
- Dark mode via `:host-context(.dark)` selectors
- Tabular nums for consistent time alignment

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| a5ed8bb | feat(49-02): create TimezoneDisplay internal component |

## Verification

- TypeScript compilation: PASS (no errors)
- Intl.DateTimeFormat usage: Confirmed (formatToParts, timeZone option)
- Timezone properties: primaryTimezone, additionalTimezones present
- Dark mode styles: :host-context(.dark) selectors present
- Registration pattern: Safe customElements.define with existence check

## Next Phase Readiness

TimezoneDisplay is ready to be composed by the parent TimePicker in Plan 06 (wiring plan). It accepts `value`, `locale`, `hour12`, `primaryTimezone`, and `additionalTimezones` properties.
