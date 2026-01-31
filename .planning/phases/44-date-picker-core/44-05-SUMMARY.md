---
phase: 44-date-picker-core
plan: 05
subsystem: date-picker
tags: [custom-element, jsx, typescript, exports, registration]

dependency-graph:
  requires: [44-01, 44-02, 44-03, 44-04]
  provides: [package-entry-point, custom-element-registration, jsx-types, public-api]
  affects: [future-consumers, react-integration, vue-integration, svelte-integration]

tech-stack:
  patterns: [safe-custom-element-registration, barrel-exports, jsx-intrinsic-elements]

file-tracking:
  key-files:
    modified:
      - packages/date-picker/src/index.ts
    created:
      - packages/date-picker/src/jsx.d.ts

decisions:
  - id: dec-44-05-01
    description: "HTMLElementTagNameMap declaration kept in date-picker.ts (not duplicated in index.ts) to avoid TS duplicate identifier error"
    rationale: "date-picker.ts already declares the global type; duplicating causes compilation error"

metrics:
  duration: 2 min
  completed: 2026-01-31
---

# Phase 44 Plan 05: Package Exports and JSX Types Summary

**One-liner:** Safe custom element registration with collision detection, barrel exports for DatePicker and parser utilities, and React/Vue/Svelte JSX type declarations.

## What Was Done

### Task 1: Update index.ts with exports and custom element registration
- Updated index.ts to follow the established @lit-ui/calendar pattern
- Added triple-slash reference to jsx.d.ts
- Exported DatePicker class from date-picker.js
- Exported parseDateInput, formatDateForDisplay, getPlaceholderText from date-input-parser.js
- Re-exported TailwindElement and isServer from @lit-ui/core
- Added safe custom element registration with `customElements.get` guard
- Added DEV-only console.warn for duplicate registration detection
- Imported @lit-ui/calendar side-effect to ensure calendar is registered
- **Commit:** 5956cc6

### Task 2: Create React JSX type declarations
- Created jsx.d.ts following the calendar package pattern
- Defined LuiDatePickerAttributes with all props: value, name, locale, placeholder, helper-text, min-date, max-date, label, error, required, disabled
- Added onChange event handler with `CustomEvent<{ date: Date | null; isoString: string }>`
- Registered lui-date-picker in global JSX.IntrinsicElements for React
- Added Vue GlobalComponents declaration
- Added Svelte IntrinsicElements declaration
- **Commit:** 6d06ca5

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Omitted duplicate HTMLElementTagNameMap declaration from index.ts**
- **Found during:** Task 1
- **Issue:** date-picker.ts already declares `HTMLElementTagNameMap` for lui-date-picker (line 950-954). Duplicating it in index.ts would cause TypeScript error TS2300 (duplicate identifier).
- **Fix:** Kept the declaration only in date-picker.ts, omitted from index.ts
- **Files affected:** packages/date-picker/src/index.ts

## Verification

- `customElements.define` present in index.ts
- `lui-date-picker` referenced in both index.ts and jsx.d.ts
- `parseDateInput` exported from index.ts
- `onChange` event handler declared in jsx.d.ts
- `min-date` attribute declared in jsx.d.ts
- `pnpm --filter @lit-ui/date-picker build` succeeds with no errors

## Success Criteria Met

1. lui-date-picker custom element registered via customElements.define
2. DatePicker class exported for programmatic use
3. Parser utilities exported for consumer reuse
4. React JSX types include all props and onChange event
5. HTMLElementTagNameMap includes lui-date-picker (in date-picker.ts)
6. Package builds without errors

## Phase Completion

This was the final plan (05 of 05) in Phase 44 (Date Picker Core). The date picker component is now complete with:
- Core component with input, popup, and calendar composition (44-01, 44-02)
- Floating UI popup positioning (44-03)
- Focus management, keyboard trapping, and form validation (44-04)
- Package entry point with registration and JSX types (44-05)
