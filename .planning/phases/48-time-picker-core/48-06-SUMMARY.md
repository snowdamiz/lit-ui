---
phase: 48-time-picker-core
plan: 06
subsystem: ui
tags: lit, time-picker, dark-mode, jsx, custom-elements, exports

# Dependency graph
requires:
  - phase: 48-05
    provides: TimePicker composition with popup, form integration, presets
provides:
  - Dark mode support for clock face via :host-context(.dark) CSS
  - Package public API exports (TimePicker, TimeValue, TimePreset, utilities)
  - Custom element registration (lui-time-picker public, internals self-registering)
  - JSX type declarations for React, Preact, Vue, Svelte
  - Complete buildable @lit-ui/time-picker package
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [":host-context(.dark) CSS dark mode", "Safe customElements.define with collision detection", "JSX type declarations for framework integration", "CSS class-based SVG styling for dark mode"]

key-files:
  created: [packages/time-picker/src/jsx.d.ts]
  modified: [packages/time-picker/src/clock-face.ts, packages/time-picker/src/time-input.ts, packages/time-picker/src/time-dropdown.ts, packages/time-picker/src/index.ts]

key-decisions:
  - "Use CSS classes on SVG elements for dark mode (attribute selectors don't match var() inline attributes)"
  - "Internal components self-register in their own files (imported by index.ts)"
  - "presets property excluded from JSX attributes (attribute: false, JS-only)"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 48 Plan 06: Dark Mode, Exports, and JSX Types Summary

**Clock face dark mode via CSS classes, package exports with safe element registration, JSX types for React/Preact/Vue/Svelte**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-01T03:37:58Z
- **Completed:** 2026-02-01T03:41:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added dark mode CSS to clock face using CSS classes (clock-bg, clock-number, clock-tick) with :host-context(.dark) overrides
- Verified all four time picker components have dark mode support
- Rewrote index.ts with proper public API exports matching date-picker pattern
- Added safe customElements.define for lui-time-picker with collision detection
- Added self-registration for internal elements (lui-time-input, lui-clock-face, lui-time-dropdown)
- Created jsx.d.ts with LuiTimePickerAttributes interface for React, Preact, Vue, Svelte
- Verified package builds successfully with vite (82.67 kB output)

## Task Commits

Each task was committed atomically:

1. **Task 1: Dark mode styles for all time picker components** - `f73dbcb` (feat)
2. **Task 2: Package exports, custom element registration, and JSX types** - `acfd5c0` (feat)

## Files Created/Modified

- `packages/time-picker/src/clock-face.ts` - Added CSS classes for SVG elements, dark mode styles, self-registration
- `packages/time-picker/src/time-input.ts` - Added self-registration for lui-time-input
- `packages/time-picker/src/time-dropdown.ts` - Added self-registration for lui-time-dropdown
- `packages/time-picker/src/index.ts` - Rewritten with public API exports and element registration
- `packages/time-picker/src/jsx.d.ts` - Created JSX type declarations

## Decisions Made

- **CSS classes for SVG dark mode:** Inline SVG `fill`/`stroke` attributes using `var()` cannot be overridden by CSS attribute selectors. Used CSS classes (clock-bg, clock-number, clock-tick) on SVG elements instead.
- **Internal component self-registration:** Each internal component (TimeInput, ClockFace, TimeDropdown) registers itself when imported, triggered by index.ts side-effect imports.
- **presets excluded from JSX:** The `presets` property uses `attribute: false` (JS-only), so it's not included in JSX HTML attribute types.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 48 (Time Picker Core) is complete
- All 6 plans executed successfully
- @lit-ui/time-picker package is fully buildable and ready for consumption
- Public API: TimePicker class, TimeValue/TimePreset types, utility functions
- Framework support: React, Preact, Vue, Svelte via JSX types and HTMLElementTagNameMap

---
*Phase: 48-time-picker-core*
*Completed: 2026-01-31*
