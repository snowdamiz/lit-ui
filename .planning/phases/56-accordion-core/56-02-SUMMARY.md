---
phase: 56-accordion-core
plan: 02
subsystem: accordion
tags: [lit, web-components, accordion, keyboard-navigation, aria, css-custom-properties, dark-mode, roving-tabindex]
requires:
  - "56-01 (accordion package scaffold, Accordion and AccordionItem elements)"
provides:
  - "Full keyboard navigation with ArrowUp/Down wrapping, Home/End"
  - "Roving tabindex pattern for single tab stop"
  - "Complete ARIA attributes (aria-expanded, aria-controls, aria-labelledby, aria-disabled, role=heading, role=region)"
  - "Disabled state handling: focusable but not activatable, parent propagation"
  - "CSS custom property theming with --ui-accordion-* tokens"
  - "Dark mode support via .dark overrides in tailwind.css"
affects: []
tech-stack:
  added: []
  patterns:
    - "Roving tabindex keyboard navigation (same as RadioGroup)"
    - "CSS custom property theming with :root and .dark blocks"
key-files:
  created: []
  modified:
    - "packages/accordion/src/accordion.ts"
    - "packages/accordion/src/accordion-item.ts"
    - "packages/core/src/styles/tailwind.css"
decisions:
  - id: "56-02-D1"
    summary: "Roving tabindex pattern reused from RadioGroup for accordion keyboard nav"
  - id: "56-02-D2"
    summary: "Disabled items use cursor:not-allowed + opacity instead of pointer-events:none to remain focusable"
  - id: "56-02-D3"
    summary: "aria-disabled uses lit nothing sentinel to omit attribute when not disabled"
metrics:
  duration: "1m 53s"
  completed: "2026-02-03"
---

# Phase 56 Plan 02: Keyboard Navigation, ARIA, Disabled States, and CSS Theming Summary

Roving tabindex keyboard nav with ArrowUp/Down/Home/End, complete ARIA attributes, disabled-but-focusable states, and --ui-accordion-* CSS custom property theming with dark mode.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Keyboard navigation and disabled states | 449a3ba | handleKeyDown, updateRovingTabindex, focusHeader, aria-disabled, disabled styling |
| 2 | CSS custom properties for accordion theming | ad03667 | --ui-accordion-* tokens in :root, dark mode in .dark, border wrapper + item separators |

## Key Implementation Details

### Keyboard Navigation (Task 1)
- `handleKeyDown()` on the wrapper div handles ArrowDown/ArrowUp (wrapping) and Home/End
- Arrow keys ONLY move focus; they do NOT toggle panels (Enter/Space trigger native button click)
- `updateRovingTabindex()` ensures exactly one enabled item has tabindex=0 (priority: first expanded, then first enabled)
- Called from `handleSlotChange()`, `updated()` on value change, and `updated()` on disabled change

### Disabled States (Task 1)
- Removed `pointer-events: none` from `:host([disabled])` so disabled items remain focusable
- Added `cursor: not-allowed; opacity: 0.5` on `.header-button` within disabled host
- `aria-disabled="true"` added to button when disabled (using `nothing` sentinel when not disabled)
- `handleToggle()` guards with `if (this.disabled) return`

### CSS Custom Properties (Task 2)
- 14 tokens added to `:root` block: layout (border, radius, gap), header (padding, font, colors), panel (padding, text), animation, focus
- 4 dark mode overrides in `.dark` block: header-text, header-hover-bg, border, panel-text
- Accordion container: border + border-radius wrapper with overflow:hidden
- Item separators: border-bottom on each item, removed on :last-of-type

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @lit-ui/accordion build` compiles without errors
- `pnpm --filter @lit-ui/core build` compiles with new accordion tokens
- All ARIA attributes present: aria-expanded, aria-controls, aria-labelledby, aria-disabled, role="heading", role="region"
- Keyboard: ArrowUp/Down with wrapping, Home/End, Enter/Space toggle
- Disabled items: focusable but not activatable, reduced opacity, cursor:not-allowed
- CSS tokens in both :root and .dark blocks
- Visual: border, border-radius, item separators

## Next Phase Readiness

Phase 56 is complete. Both plans delivered:
- Plan 01: Package scaffold, Accordion + AccordionItem elements, CSS Grid animation, expand/collapse state management
- Plan 02: Keyboard navigation, full ARIA, disabled states, CSS theming with dark mode

All Phase 56 success criteria are met. The accordion is ready for documentation and integration testing.
