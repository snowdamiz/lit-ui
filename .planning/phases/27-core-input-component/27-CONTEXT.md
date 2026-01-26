# Phase 27: Core Input Component - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Developers can add a fully functional text input to any form with native validation and form participation. Supports text, email, password, number, and search input types. Password toggle, clear button, prefix/suffix slots, and character count are Phase 28 (Input Differentiators).

</domain>

<decisions>
## Implementation Decisions

### Visual States
- Focus: border color changes to primary color, no outer ring
- Disabled: lighter background, muted text, not-allowed cursor
- Readonly: distinct from disabled — selectable text, normal cursor, slightly different background
- Error: border changes to error color (red)

### Label and Helpers
- Optional built-in label support via `label` prop (renders `<label>` with proper for/id association)
- Works with or without label prop — developers can use external labels or aria-label
- Helper text appears below label, between label and input (description style)
- Required indicator: default asterisk (*), optional `requiredIndicator="text"` prop for "(required)" text
- Label position: top only (above input)

### Size Variants
- Three sizes matching Button: sm, md, lg
- Default size: md (medium)
- Intrinsic width by default (developers set width explicitly, no auto full-width)
- Label and helper text scale proportionally with input size

### Validation Feedback
- Error messages appear below input
- No icon with error messages — text only in error color
- Validation triggers on blur (not just on submit)
- No success/valid state visual — only error states shown, valid fields look normal

### Claude's Discretion
- Exact pixel values for sizes (padding, height, font-size)
- Transition timing for state changes
- Placeholder text styling
- Internal implementation of for/id association

</decisions>

<specifics>
## Specific Ideas

- Match Button component's size proportions so inputs and buttons pair well in forms
- Follow existing theme system patterns from v3.0 (use CSS tokens from Phase 26)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-core-input-component*
*Context gathered: 2026-01-26*
