# Phase 2: Button Component - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

A production-ready button component with five variants (primary, secondary, outline, ghost, destructive), three sizes (sm, md, lg), loading/disabled states, form participation via ElementInternals, and keyboard accessibility. Icons via named slots.

</domain>

<decisions>
## Implementation Decisions

### Visual styling
- Focus ring style: inner glow (inset shadow rather than external ring)
- Color intensity, outline vs ghost distinction, disabled appearance: Claude's discretion based on design tokens

### Loading state
- Spinner replaces text (not shown alongside)
- Button maintains fixed width during loading (no layout shift)
- Spinner style: pulsing dots (three dots animating in sequence)
- Loading button clickability: Claude's discretion based on a11y best practices

### Icon handling
- Icon sizing scales with button size (sm button = smaller icon, lg = larger)
- Icons default to currentColor but allow custom color override
- Icon-only button shape and icon-text gap: Claude's discretion based on size variant

### Interaction feel
- Press/active state, transition timing, hover elevation, destructive emphasis: Claude's discretion for polished feel

### Claude's Discretion
- Primary button color intensity (use design tokens)
- Outline vs ghost visual distinction
- Disabled state appearance (faded vs muted)
- Loading button interaction behavior
- Icon-only button aspect ratio
- Icon-text gap sizing
- Press/active visual feedback
- Transition durations
- Hover shadow/elevation
- Destructive variant emphasis level

</decisions>

<specifics>
## Specific Ideas

- Inner glow focus ring rather than offset ring (like Tailwind default) or tight border ring
- Pulsing dots spinner rather than rotating ring — feels more modern
- No layout shift during loading — button width stays constant

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-button-component*
*Context gathered: 2026-01-23*
