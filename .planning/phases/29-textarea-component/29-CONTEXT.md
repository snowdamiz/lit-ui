# Phase 29: Textarea Component - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-line text input with form participation, validation, and auto-resize. Uses the same validation and form participation patterns established in the Input component. Character count display and resize control are in scope. Prefix/suffix slots are NOT in scope (those are Input-specific differentiators).

</domain>

<decisions>
## Implementation Decisions

### Auto-resize behavior
- Opt-in via `autoresize` attribute (not enabled by default)
- Smooth 150ms transition when height changes (matches Button transition duration)
- Configurable max height via `maxRows` or `maxHeight` attribute
- Never shrinks below the initial `rows` value — that's the minimum height
- When content is deleted, shrinks back down but respects initial rows

### Character count display
- Opt-in — only shows when developer enables it (attribute TBD)
- Position: inside textarea, bottom-right corner (overlaid)
- No color change as user approaches limit — consistent subtle styling throughout
- Claude's discretion on format (x/max vs remaining)

### Resize handle control
- Default: vertical only (user can make taller/shorter, not wider)
- Expose `resize` attribute mirroring CSS values: none | vertical | horizontal | both
- Use browser's native resize handle (no custom styling)
- Claude's discretion on whether resize handle is hidden when autoresize is enabled

### Visual consistency with Input
- Same size variants: sm, md, lg with matching padding, font-size, border-radius
- Own CSS token set: `--ui-textarea-*` for independent customization
- Identical disabled and readonly visual treatment (reduced opacity, cursor changes)
- Claude's discretion on whether label/helper/error patterns are identical or adapted

### Claude's Discretion
- Character count format (x/max vs remaining)
- Whether resize handle is hidden when autoresize is enabled
- Whether label/helper/error patterns are identical to Input or adapted for multi-line
- How to handle maxRows vs maxHeight attribute naming

</decisions>

<specifics>
## Specific Ideas

- Smooth 150ms transition matches the Button component's existing animation timing
- Character count inside the textarea corner is a common pattern in modern text editors (Twitter, Slack)
- Vertical-only resize as default prevents layout-breaking horizontal stretching

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 29-textarea-component*
*Context gathered: 2026-01-26*
