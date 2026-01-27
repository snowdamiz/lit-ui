# Phase 35: Combobox - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can type to filter options with highlighted matches and optional ability to create new options. This builds on single select foundation (Phase 32) with filtering, highlighting, and creatable capabilities. Async loading is a separate phase (36).

</domain>

<decisions>
## Implementation Decisions

### Filter behavior
- Case-insensitive matching ("app" matches "Apple")
- Contains matching, not starts-with ("ana" matches "Banana")
- Auto-open dropdown when user starts typing
- Debounce timing: Claude's discretion based on implementation tradeoffs

### Match highlighting
- Bold text for matched portions (not background or underline)
- Highlight ALL occurrences of match, not just first ("an" highlights both in "Banana")
- CSS tokens for highlight styling (--ui-select-highlight-*) for theme customization
- No dimming of non-matching text — normal text with bold matches only

### Creatable mode
- "Create new" option appears at bottom of filtered list (after matching options)
- Plus icon (+) before the create text for clear affordance
- On create: fire onCreate event, developer handles adding to options
- Create option text format: Claude's discretion (e.g., "Create 'xyz'" or "Add 'xyz'")

### Empty/loading states
- No-match message: "No results found" by default, customizable via prop
- No minimum character threshold — filtering starts immediately
- Loading state uses skeleton options (placeholder shapes that pulse)
- Initial state before typing: configurable prop (default shows all options)

### Claude's Discretion
- Debounce timing for filter (0ms vs 100-150ms)
- Create option text format
- Skeleton option count and animation
- Keyboard shortcuts for create action

</decisions>

<specifics>
## Specific Ideas

- Follow W3C APG combobox pattern for keyboard navigation
- Filtering should feel instant for local options
- Create option should be visually distinct from regular options (+ icon helps)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 35-combobox*
*Context gathered: 2026-01-27*
