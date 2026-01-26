---
phase: 29-textarea-component
plan: 02
subsystem: form-inputs
tags: [textarea, autoresize, character-counter, input]

dependency-graph:
  requires: [29-01]
  provides: [textarea-autoresize, textarea-counter, input-counter]
  affects: [30-select-component]

tech-stack:
  added: []
  patterns: [scrollHeight-autoresize, character-counter-overlay]

key-files:
  created: []
  modified:
    - packages/textarea/src/textarea.ts
    - packages/textarea/src/jsx.d.ts
    - packages/input/src/input.ts
    - packages/input/src/jsx.d.ts

decisions:
  - id: autoresize-transition
    choice: "150ms ease-out for height transition"
    rationale: "Matches Button component transition duration from Phase 26 tokens"
  - id: counter-position-textarea
    choice: "Absolute positioned inside textarea bottom-right"
    rationale: "Standard pattern, uses background to overlay text"
  - id: counter-position-input
    choice: "Inline flex item before suffix slot"
    rationale: "Input uses flex layout, counter fits naturally in row"

metrics:
  duration: "2m 53s"
  completed: "2026-01-26"
---

# Phase 29 Plan 02: Auto-resize and Character Counter Summary

Auto-resize textarea with scrollHeight calculation and character counters for both Textarea and Input components.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add auto-resize functionality to Textarea | 9b469f9 | textarea.ts |
| 2 | Add character counter to Textarea | 4de3e75 | textarea.ts |
| 3 | Add character counter to Input and JSX types | b8e8e76 | input.ts, jsx.d.ts (both) |

## Implementation Details

### Auto-resize (Task 1)

**New Properties:**
- `autoresize`: Boolean - enables auto-growing behavior
- `maxRows`: Number - maximum rows when auto-resizing
- `maxHeight`: String - CSS max height (takes precedence over maxRows)

**Implementation:**
- `adjustHeight()` method uses `scrollHeight` for accurate content measurement
- `getMinHeight()` calculates min from rows, lineHeight, padding, border
- `getMaxHeightPx()` converts maxHeight CSS value or calculates from maxRows
- Height transitions smoothly with 150ms ease-out
- `overflow-y` toggles between `hidden` and `auto` based on content cap

**Integration Points:**
- `firstUpdated()` - sets initial height
- `handleInput()` - adjusts on each keystroke
- `formResetCallback()` - resets height via requestAnimationFrame

### Character Counter (Tasks 2-3)

**Textarea Counter:**
- Absolute positioned inside textarea at bottom-right
- Uses `--ui-input-bg` background to overlay text
- Adds `has-counter` class for extra bottom padding (1.75rem)

**Input Counter:**
- Inline flex item after clear button, before suffix slot
- Size-responsive padding matching input padding tokens
- Uses `white-space: nowrap` to prevent wrapping

**Shared Pattern:**
- Property: `showCount` with attribute `show-count`
- Display: `{value.length}/{maxlength}` format
- Conditional: only renders when both showCount and maxlength are set
- CSS part: `counter` for external styling

## Decisions Made

1. **Autoresize transition**: Used 150ms ease-out to match Button component transition duration established in Phase 26.

2. **Character counter positioning**: Textarea uses absolute positioning with background overlay; Input uses flex layout inline positioning.

3. **Max height precedence**: `maxHeight` CSS value takes precedence over `maxRows` when both are set.

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

```
packages/textarea/src/textarea.ts   +203 lines (autoresize methods, counter, CSS)
packages/textarea/src/jsx.d.ts      +4 lines (autoresize, max-rows, max-height, show-count)
packages/input/src/input.ts         +43 lines (showCount property, counter method, CSS)
packages/input/src/jsx.d.ts         +1 line (show-count)
```

## Verification Results

- Textarea build: SUCCESS (12.93 kB, gzip: 3.51 kB)
- Input build: SUCCESS (17.30 kB, gzip: 4.23 kB)
- TypeScript check (both): PASS

## Requirements Addressed

| ID | Requirement | Status |
|----|-------------|--------|
| TEXTAREA-08 | Textarea can auto-expand | COMPLETE |
| TEXTAREA-09 | Textarea auto-expand has max limit | COMPLETE |
| TEXTAREA-10 | Textarea can show character count | COMPLETE |
| INPUT-17 | Input can show character count | COMPLETE |

## Next Phase Readiness

Phase 29 is now complete. All Textarea requirements (TEXTAREA-01 through TEXTAREA-11) and the INPUT-17 requirement are implemented.

**Ready for Phase 30:** Select Component
- Core textarea functionality established
- Character counter pattern reusable for Select with search
- Form participation patterns proven
