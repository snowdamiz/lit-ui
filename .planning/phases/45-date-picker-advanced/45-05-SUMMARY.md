---
phase: 45
plan: 05
subsystem: date-picker-polish
tags: [dark-mode, exports, jsx-types, ssr, presets, inline]
dependency-graph:
  requires: [45-02, 45-03, 45-04]
  provides: [dark-mode-preset-inline, package-exports-complete, jsx-types-complete]
  affects: []
tech-stack:
  added: []
  patterns: [host-context-dark-mode, type-only-exports]
key-files:
  created: []
  modified:
    - packages/date-picker/src/date-picker.ts
    - packages/date-picker/src/index.ts
    - packages/date-picker/src/jsx.d.ts
decisions:
  - id: D-45-05-01
    description: "LuiDatePickerProperties interface separates JS-only props (presets, format) from HTML attributes in JSX types"
metrics:
  duration: 2 min
  completed: 2026-01-31
---

# Phase 45 Plan 05: Dark Mode, Exports, and JSX Types Summary

**Dark mode for preset buttons and inline mode, package exports for NL parser and presets, JSX type updates for inline/presets/format**

## What Was Done

### Task 1: Dark mode styles for preset buttons and inline mode
Added `:host-context(.dark)` CSS rules for:
- `.preset-buttons` border color using `--ui-date-picker-popup-border`
- `.preset-button` with dark background (#1f2937), light text (#f9fafb), and muted border (#4b5563)
- `.preset-button:hover:not(:disabled)` with lighter hover state (#374151)
- `.inline-wrapper` text color for dark mode readability

Verified SSR guards are correct: inline mode connectedCallback already checks `!isServer && !this.inline` before adding document listeners. No Floating UI calls in inline render path.

### Task 2: Package exports and JSX types
Updated `index.ts` with three new exports:
- `parseNaturalLanguage` from `./natural-language.js`
- `DatePreset` type from `./preset-types.js`
- `DEFAULT_PRESETS` from `./preset-types.js`

Updated `jsx.d.ts`:
- Added `inline?: boolean` to `LuiDatePickerAttributes`
- Created `LuiDatePickerProperties` interface with `presets?: DatePreset[] | boolean` and `format?: Intl.DateTimeFormatOptions | null`
- Updated React, Vue, and Svelte declarations to include `LuiDatePickerProperties`

Verified inline calendar already has `show-constraint-tooltips` wired (added in 45-04).

## Verification Results

- `tsc --noEmit`: Clean (0 errors)
- `vitest run`: 25/25 tests passing across 2 test files

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| # | Hash | Type | Description |
|---|------|------|-------------|
| 1 | 91d14bf | feat | Dark mode styles for preset buttons and inline mode |
| 2 | 82f872f | feat | Package exports and JSX types update |

## Phase 45 Completion

This is the final plan (05 of 05) in Phase 45 Date Picker Advanced. All plans complete:
- 45-01: Natural language date parsing
- 45-02: Preset date buttons
- 45-03: Inline calendar mode
- 45-04: Constraint tooltips on disabled dates
- 45-05: Dark mode, exports, and JSX types (this plan)
