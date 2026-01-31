---
phase: 45
plan: 03
subsystem: date-picker
tags: [inline, calendar, rendering-mode]
dependency-graph:
  requires: ["45-02"]
  provides: ["inline-mode-rendering"]
  affects: ["45-05"]
tech-stack:
  added: []
  patterns: ["conditional-render-branch", "property-guarded-listeners"]
key-files:
  created: []
  modified:
    - packages/date-picker/src/date-picker.ts
decisions:
  - id: "45-03-01"
    decision: "Inline mode skips all popup infrastructure (Floating UI, click-outside, focus trap)"
    rationale: "Inline calendar is always visible — popup lifecycle is unnecessary and adds overhead"
  - id: "45-03-02"
    decision: "validate() uses optional anchor (this.inputEl ?? undefined) for inline compatibility"
    rationale: "In inline mode there is no input element; ElementInternals setValidity anchor must be optional"
  - id: "45-03-03"
    decision: "Inline wrapper uses label as span (not label-for) since there is no input to associate"
    rationale: "HTML label element requires a form control target; inline mode has no input element"
metrics:
  duration: "2 min"
  completed: "2026-01-31"
---

# Phase 45 Plan 03: Inline Mode Summary

Inline rendering mode for always-visible calendar without popup/input wrapper, guarding all popup infrastructure when inline is true.

## What Was Done

### Task 1: Add inline property and conditional rendering

Added `inline` boolean property (reflected) and `renderInlineCalendar()` private method to provide an always-visible calendar layout that bypasses all popup infrastructure.

**Changes to `date-picker.ts`:**

1. **Added `inline` property** -- reflected boolean attribute that switches rendering mode
2. **Guarded connectedCallback/disconnectedCallback** -- document click listener only attaches when `!this.inline`
3. **Added `renderInlineCalendar()`** -- renders label, presets, lui-calendar (with `show-constraint-tooltips`), helper text, and error text in a `.inline-wrapper` div
4. **Updated `render()`** -- early return to `renderInlineCalendar()` when `this.inline` is true
5. **Guarded `handleCalendarSelect`** -- only calls `closePopup()` when `!this.inline`
6. **Guarded `openPopup` and `togglePopup`** -- early returns when `this.inline` is true
7. **Guarded `handlePresetSelect`** -- only calls `closePopup()` when `!this.inline`
8. **Updated `validate()`** -- uses `this.inputEl ?? undefined` as anchor for ElementInternals (inline mode has no input)
9. **Added inline CSS** -- `:host([inline])` sets `width: auto`, `.inline-wrapper` flexbox column layout
10. **Removed TODO comment** -- cleaned up plan 03 reference in popup calendar template

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 45-03-01 | Inline mode skips all popup infrastructure | Always-visible calendar needs no Floating UI, click-outside, or focus trap |
| 45-03-02 | validate() uses optional anchor | No input element in inline mode; ElementInternals anchor must be optional |
| 45-03-03 | Inline label rendered as span, not label-for | No form control to associate with in inline mode |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- TypeScript: `npx tsc --noEmit` -- 0 errors
- Tests: `npx vitest run` -- 25/25 passing (no regressions)

## Commits

| Hash | Message |
|------|---------|
| d22fc2e | feat(45-03): add inline mode for always-visible calendar |
