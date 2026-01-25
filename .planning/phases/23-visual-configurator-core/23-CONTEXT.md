# Phase 23: Visual Configurator Core - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual configurator page on the docs site where users can customize theme colors and see live preview of components. Users can customize primary, secondary, destructive, background, foreground, muted, and accent colors plus border radius. Light and dark modes are editable with automatic derivation.

</domain>

<decisions>
## Implementation Decisions

### Layout & Organization
- Sidebar + preview layout (like Figma/design tools)
- Controls in sidebar, large preview area on right
- Colors grouped by semantic role: Primary/Secondary/Destructive, then Background/Foreground, then Muted/Accent
- CLI command output via modal on "Get Command" button click (not always visible)

### Color Picker Interaction
- Hue slider + saturation square picker style (classic picker)
- Display hex values only (#FF5733 format) — no OKLCH shown to users
- Include Tailwind palette swatches for quick selection
- Editable hex input — users can type values directly, picker updates to match

### Preview Experience
- Show Button and Dialog components (the two existing components)
- Toggle switch between light/dark mode (one mode visible at a time)
- Live updates — changes reflect instantly as user adjusts values
- Fully interactive preview — buttons click, dialogs open

### Mode Editing Workflow
- User picks light OR dark colors first
- Non-selected mode auto-derives from chosen mode
- User can manually override any derived color if they choose
- Per-color reset icon to restore derived value for overridden colors
- Derivation algorithm works bidirectionally (light→dark and dark→light use same logic in reverse)

### Claude's Discretion
- Sidebar collapsibility (fixed vs collapsible)
- Visual indicator style for custom vs derived colors
- Exact spacing and typography
- Color derivation algorithm implementation details

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-visual-configurator-core*
*Context gathered: 2026-01-25*
