# Phase 25: Docs Site Dark Mode - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can toggle between light and dark mode on the docs site with their preference persisting across sessions. The header toggle and configurator's mode toggle stay synchronized.

</domain>

<decisions>
## Implementation Decisions

### Toggle placement & design
- Position: far right of header, after all nav items
- Icon: sun/moon swap (shows opposite of current mode — sun in dark, moon in light)
- Tooltip: shows current state ("Dark mode" / "Light mode")
- Hover/focus states: Claude's discretion, match docs style

### Dark palette approach
- Background darkness: shadcn-style neutral dark
- Reference: shadcn/ui docs — clean, neutral, professional
- Code blocks: Claude's discretion based on readability
- Accent colors: Claude adjusts for optimal contrast

### Transition behavior
- Theme switch: instant, no animation
- Flash prevention: inline script in `<head>` to set theme before render
- Default for first-time visitors (no system preference): light mode
- Toggle states: 2 states only (Light / Dark), no "system" option
- System preference: respected on first visit, then user choice takes over

### Configurator sync
- Relationship: unified — one theme state, both toggles control same thing
- Visibility: keep both toggles visible (header and configurator)
- Preview behavior: follows docs theme (no dual-mode preview)
- Storage: localStorage

### Claude's Discretion
- Toggle hover/focus treatment
- Code block styling in dark mode
- Accent color adjustments for contrast
- Exact dark palette values (shadcn-inspired)

</decisions>

<specifics>
## Specific Ideas

- "Similar to shadcn" for dark background — neutral, not too blue, not too warm
- shadcn/ui docs as visual reference for overall dark mode feel

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-docs-site-dark-mode*
*Context gathered: 2026-01-25*
