# Phase 36: Async Loading - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Select supports loading options from async sources with proper loading states, error handling, and performance optimization. Includes promise-based options, error/retry, async search with debounce, infinite scroll pagination, and virtual scrolling for large datasets.

</domain>

<decisions>
## Implementation Decisions

### Loading states
- Loading indicator appears inside dropdown (not on trigger)
- Skeleton option placeholders (not spinner) to mimic option shapes
- Fixed count of 3-5 skeleton rows during loading
- Claude's discretion on whether select is disabled vs openable during initial load

### Error handling
- Error message appears inside dropdown, replacing options area
- Retry action styled at Claude's discretion (text link or button)
- Error slot for full customization of error state content (default message provided)
- Selection cleared on error (not preserved)

### Async search debounce
- Debounce delay is developer configurable via prop (300ms default)
- Minimum character threshold is developer configurable via prop
- Searching shows skeleton placeholders (same as initial load)
- Clearing search input re-fetches default options (not empty state)

### Infinite scroll
- Load more triggers at 80% scroll (near bottom, not at bottom)
- "Loading more" shows skeleton rows appended to list (consistent with loading pattern)

### Virtual scrolling
- Always enabled for async selects (not threshold-based or opt-in)
- Keyboard navigation remains seamless — arrow keys navigate all options, scroll follows focus

### Claude's Discretion
- Whether select is disabled or openable during initial async load
- Retry action styling (text link vs button)
- Exact skeleton styling and animation
- Virtual scrolling implementation approach (library choice)
- Page Up/Down behavior for large lists

</decisions>

<specifics>
## Specific Ideas

- Skeleton loading pattern should be consistent across initial load, search loading, and loading more
- Research noted AbortController needed for async search race conditions — apply this

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 36-async-loading*
*Context gathered: 2026-01-27*
