# Phase 26: CSS Tokens Foundation - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Add CSS variables for Input and Textarea styling to the existing theme system. These tokens will be consumed by the Input component (Phase 27) and Textarea component (Phase 29). This phase is infrastructure only — no components are built.

</domain>

<decisions>
## Implementation Decisions

### Token Granularity
- Separate token sets: `--ui-input-*` for Input, `--ui-textarea-*` for Textarea
- Full state tokens: each state (focus, error, disabled) gets border, background, and text tokens
- Core states only: default, focus, error, disabled
- Include placeholder token: `--ui-input-placeholder` for placeholder text color
- Size variant tokens: sm, md, lg for padding and font-size

### Naming Convention
- State-last pattern: `--ui-input-border-focus`, `--ui-input-bg-error` (groups by property)
- Implicit base: `--ui-input-border` is default state, no `-default` suffix
- Component-specific radius: `--ui-input-radius`, `--ui-textarea-radius`

### Default Values
- Border style: Subtle — light gray border, darker on focus
- Focus color: Use `--ui-primary` for focus border (matches button primary)
- Error color: Use existing semantic token (--ui-danger or similar)
- Disabled style: Different background (slightly grayed), maintains border visibility

### Claude's Discretion
- Exact color values for light/dark mode
- Border width tokens (if needed)
- Transition duration for state changes

</decisions>

<specifics>
## Specific Ideas

- Follow existing theme system patterns from v3.0
- Error styling should reference existing semantic colors rather than hardcoding red

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 26-css-tokens-foundation*
*Context gathered: 2026-01-26*
