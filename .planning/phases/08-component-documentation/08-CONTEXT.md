# Phase 8: Component Documentation - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete API reference and examples for Button and Dialog components. Each component gets a dedicated documentation page with overview, live examples, and API reference. Does not include additional components or full framework integration guides (those are separate phases).

</domain>

<decisions>
## Implementation Decisions

### Page structure
- Section order: Overview → Examples → API Reference
- Separate pages for each component: /components/button and /components/dialog
- Navigation: Sidebar listing plus prev/next links at bottom of each page
- Hero example at top: Claude's discretion based on component type

### Live examples
- Static demos — interactive components, but code is read-only
- Layout: Side by side (demo left, code right on desktop; stacked on mobile)
- **Button examples to include:**
  - All variants grid (primary, secondary, destructive, etc.)
  - Sizes showcase (sm, md, lg)
  - Loading states
  - Icon buttons (leading/trailing icons, icon-only)
- **Dialog examples to include:**
  - Basic modal (title, content, close button)
  - Confirmation dialog (cancel/confirm buttons)

### API reference format
- Props/slots/events display format: Claude's discretion
- Detail level per prop: Claude's discretion (appropriate depth per prop)
- Slots and events organization: Claude's discretion (separate sections or combined)
- TypeScript types display: Claude's discretion (inline vs linked based on complexity)

### Code snippets
- Framework tabs: Show HTML, React, Vue, Svelte versions
- Tab selection persists across all examples on the page
- Show template/JSX only — assume imports are understood
- Live preview renders actual Lit web component, code tabs show framework-specific syntax

### Claude's Discretion
- Hero example presence and design
- Props table vs definition list format
- Appropriate detail level per prop
- How to organize slots/events (separate or combined with props)
- TypeScript type display (inline vs linked)

</decisions>

<specifics>
## Specific Ideas

- Live preview should use the actual Lit component regardless of which framework tab is selected — this emphasizes that it's the same component everywhere
- Framework tab persistence means user picks their framework once and sees relevant code throughout

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-component-documentation*
*Context gathered: 2026-01-24*
