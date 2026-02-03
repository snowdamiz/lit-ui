# Project Research Summary

**Project:** LitUI v7.0 Data Table
**Domain:** Admin Dashboard Data Table Component
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

Building a high-performance data table for admin dashboards with 100K+ row support is achievable using TanStack's headless table ecosystem. The recommended approach leverages `@tanstack/lit-table` for state management (sorting, filtering, pagination, selection) combined with the already-used `@tanstack/lit-virtual` for row virtualization. This keeps the architecture consistent with existing LitUI patterns (Select uses the same virtualizer) and avoids heavy dependencies like ag-Grid. The table should be framework-agnostic with TanStack bundled as an internal implementation detail, not exposed as a peer dependency.

The critical distinction for this component: it is a data view, not a spreadsheet. Features should focus on viewing, finding, selecting, and editing records -- not computation or data transformation. This boundary eliminates significant complexity (no formulas, no cell references, no pivot tables) while delivering what admin dashboard users actually need. The architecture follows a container-rendered pattern where `<lui-data-table>` owns the entire grid structure in its shadow DOM, avoiding cross-shadow-root ARIA reference issues that plague many web component table implementations.

Key risks center on virtual scrolling with variable row heights (causes scroll jumping -- mitigate with fixed 48px rows), ARIA grid implementation complexity (requires full keyboard navigation contract), and race conditions in server-side operations (mitigate with AbortController). The phased approach should establish core virtualization and ARIA structure first, as these architectural decisions cannot be retrofitted.

## Key Findings

### Recommended Stack

The data table requires minimal new dependencies. TanStack provides the heavy lifting for both table state and virtualization, already proven in the LitUI codebase.

**Core technologies:**
- `@tanstack/lit-table` (^8.21.3): Headless table state management -- sorting, filtering, pagination, column sizing, row selection out of the box with Lit-native reactive controller pattern
- `@tanstack/lit-virtual` (upgrade to ^3.13.19): 2D grid virtualization for 100K+ rows at 60fps -- already used in Select, extend to table rows
- Native Pointer Events API: Column resize drag handles -- matches existing time-picker pattern
- Native HTML5 Drag and Drop: Column reordering -- recommended by TanStack docs, no dependency needed
- Existing LitUI components: Input, Select, Checkbox for inline editing; Popover for filter dropdowns; Floating UI for positioning

**Not recommended:**
- ag-Grid (heavyweight, commercial, not web-component native)
- @dnd-kit (unnecessary for column reordering)
- External state management (TanStack Table + Lit reactivity sufficient)

### Expected Features

**Must have (table stakes):**
- Column sorting (single + multi-column with Shift+click)
- Per-column filtering + global search
- Pagination with configurable page size
- Row selection with checkbox column, select-all (page and dataset)
- Column resizing with drag handles
- Fixed header row, optional fixed first column
- Loading and empty states
- Keyboard navigation and ARIA compliance

**Should have (competitive differentiators):**
- Virtual scrolling for 100K+ rows (enables the "massive dataset" use case)
- Async data source with server-side sort/filter/pagination
- Inline cell editing and row edit mode
- Custom cell renderers via slot API
- Column show/hide, reorder, and preference persistence
- Bulk actions toolbar (Gmail/Jira pattern)
- Row actions menu

**Defer (v2+):**
- Expandable rows with detail panels
- Column pinning (left/right sticky)
- Row pinning
- Export to CSV/clipboard
- Quick view side panel

### Architecture Approach

The architecture follows a hybrid API pattern (like Select): support both programmatic `columns` property AND declarative `<lui-column>` children. The main `<lui-data-table>` component acts as controller, owning TableController and VirtualizerController instances. Row and cell rendering happens as templates within the container's shadow DOM -- NOT as separate custom elements, which would cause thousands of element upgrades and memory explosion.

**Major components:**
1. `lui-data-table` -- Main orchestrator with TanStack controllers, state management, event dispatch, form participation
2. `lui-column` (optional) -- Declarative column configuration with slots for custom header/cell/editor templates
3. Internal HeaderRow -- Sort indicators, resize handles, column reorder drag targets
4. Internal VirtualizedBody -- VirtualizerController integration, renders only visible rows
5. Internal FooterRow -- Pagination controls, bulk action toolbar

**Data flow supports dual modes:**
- Client-side (manual=false): In-memory sort/filter/pagination, full data passed in
- Server-side (manual=true): Callbacks for sort/filter/page changes, component receives current page only

### Critical Pitfalls

1. **Variable row heights with virtual scroll** -- Causes severe scroll jumping and stuttering. Enforce fixed 48px row height via CSS. If variable heights absolutely required, estimate LARGEST expected height, not average.

2. **Shadow DOM ARIA ID references** -- `aria-labelledby` and `aria-describedby` fail silently across shadow boundaries. Use container-rendered pattern where all grid structure lives in same shadow root. Set `aria-label` directly on cells rather than ID references.

3. **ARIA grid vs table role confusion** -- Interactive tables with cell editing MUST use `role="grid"` with full keyboard navigation contract (arrow keys, Enter/Escape, Home/End). Using `role="table"` breaks screen reader interaction. Partial grid implementations are worse than tables.

4. **Race conditions in server operations** -- User sorts column A, then column B; request A returns after B. Use AbortController to cancel pending requests on new operations. Track request sequence numbers as backup.

5. **Sticky header with virtual scroll** -- CSS `position: sticky` breaks in virtualized containers. Use separate scroll containers for header and body with synchronized scrollLeft. Header uses sticky within its own container.

6. **Inline editing focus trap** -- Tables need two modes: navigation mode (arrow keys between cells) and edit mode (arrow keys in input). Escape exits edit mode; Enter/F2 enters edit mode. Missing this traps keyboard users.

7. **Column resize state loss** -- Use resize guides (not live resize) to avoid jittery redraws. Debounce persistence (500ms after resize end). Enforce 50px minimum width to prevent unrecoverable state.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Table Shell & Virtualization
**Rationale:** Foundation must establish fixed row height constraint, ARIA grid structure, and scroll architecture before any features can build on it. These decisions cannot be retrofitted.
**Delivers:** Basic table rendering with virtualized rows, fixed header, CSS Grid layout
**Addresses:** Virtual scrolling (differentiator), fixed header (table stake)
**Avoids:** CRITICAL-01 (variable heights), CRITICAL-02 (ARIA structure), CRITICAL-03 (Shadow DOM ARIA), HIGH-05 (sticky scroll)

### Phase 2: Sorting & Selection
**Rationale:** Sorting establishes the data transformation pipeline (client vs server mode). Selection is prerequisite for bulk actions and often couples with sorting (clear selection on sort?).
**Delivers:** Click-to-sort headers, sort indicators, multi-column sort; checkbox selection with select-all
**Uses:** TanStack Table sorting/selection state; lui-checkbox component
**Implements:** Event dispatch pattern (ui-sort-change, ui-selection-change)
**Avoids:** HIGH-04 (range selection edge cases)

### Phase 3: Filtering & Pagination
**Rationale:** Filtering builds on sorting pipeline. Pagination/virtual scroll are alternative navigation modes that share page-size concepts.
**Delivers:** Per-column filters, global search, pagination controls, server-side mode
**Uses:** lui-input, lui-select, lui-popover; Floating UI for filter dropdowns; @lit/task for async
**Avoids:** CRITICAL-04 (race conditions with AbortController)

### Phase 4: Column Customization
**Rationale:** Resize/reorder/hide features are independent of data operations but require solid header implementation from Phase 1-2.
**Delivers:** Drag-to-resize, drag-to-reorder, column visibility toggle, localStorage persistence
**Uses:** Native pointer events (resize), native HTML5 DnD (reorder)
**Avoids:** HIGH-03 (state persistence), MEDIUM-03 (minimum width)

### Phase 5: Inline Editing
**Rationale:** Most complex feature, requires stable row identity from virtualization and solid keyboard navigation from ARIA work. Builds on existing LitUI form components.
**Delivers:** Cell edit mode, row edit mode, validation integration, edit lifecycle events
**Uses:** lui-input, lui-select, lui-checkbox, lui-textarea for editors; ElementInternals for form integration
**Avoids:** HIGH-01 (focus trap), HIGH-02 (optimistic rollback), MEDIUM-01 (validation timing)

### Phase 6: Declarative API & Polish
**Rationale:** `<lui-column>` declarative syntax is DX improvement, not functional requirement. Add after core features proven.
**Delivers:** Slotted column definitions, custom cell templates, custom editors
**Uses:** Slot pattern from Accordion/Tabs/Select

### Phase Ordering Rationale

- **Virtualization before features:** All features operate on virtualized rows, so the scroll architecture must be solid first
- **Sorting before filtering:** Sorting is simpler, establishes the transformation pipeline pattern that filtering extends
- **Selection early:** Many features need selection (bulk actions, edit guards), and it's medium complexity
- **Column customization before editing:** Both require pointer event handling, but customization is less state-complex
- **Editing last:** Highest complexity, most state management, benefits from stable foundation

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Inline Editing):** Complex focus management across edit modes; validation integration with ElementInternals; optimistic update patterns vary by use case

Phases with standard patterns (skip research-phase):
- **Phase 1 (Core):** TanStack Virtual well-documented; ARIA grid pattern specified by W3C APG
- **Phase 2-3 (Sort/Filter/Pagination):** TanStack Table provides complete implementation guides
- **Phase 4 (Column Customization):** Pointer events pattern proven in time-picker; native DnD well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | TanStack official Lit adapters verified, versions current, matches existing project patterns |
| Features | HIGH | Cross-referenced AG Grid, MUI X, PatternFly; clear table-vs-spreadsheet boundary |
| Architecture | HIGH | Pattern mirrors existing Select/Accordion; VirtualizerController proven; container-rendered solves Shadow DOM ARIA |
| Pitfalls | HIGH | Issues verified via TanStack GitHub issues, W3C APG, accessibility expert blogs (Sarah Higley, Nolan Lawson) |

**Overall confidence:** HIGH

### Gaps to Address

- **2D virtualization (row + column):** Research covered row virtualization thoroughly. Column virtualization for 50+ column tables is documented but not deeply explored. Likely not needed for typical admin tables (10-30 columns).
- **Cross-page selection with server-side pagination:** Gmail pattern ("Select all 3,200 items") requires tracking selection by ID separate from current page data. Implementation details need refinement during Phase 2 planning.
- **Optimistic update rollback:** Two approaches identified (snapshot-based vs row-level save buffer). Decision should be made during Phase 5 planning based on actual editing use cases.

## Sources

### Primary (HIGH confidence)
- [TanStack Table v8 Docs](https://tanstack.com/table/v8/docs) -- sorting, filtering, pagination, virtualization guides
- [TanStack Virtual v3 Docs](https://tanstack.com/virtual/latest) -- virtualizer API, 2D virtualization
- [TanStack GitHub Releases](https://github.com/TanStack/table/releases) -- version verification (v8.21.3, April 2025)
- [W3C ARIA APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) -- full keyboard/ARIA contract
- [AG Grid Features](https://www.ag-grid.com/javascript-data-grid/grid-features/) -- enterprise feature benchmark
- [MUI X Data Grid](https://mui.com/x/react-data-grid/) -- server-side patterns

### Secondary (MEDIUM confidence)
- [Sarah Higley - Grids Part 1 & 2](https://sarahmhigley.com/writing/grids-part1/) -- grid vs table role decision
- [Nolan Lawson - Shadow DOM ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) -- ID reference issues
- [PatternFly Bulk Selection](https://www.patternfly.org/patterns/bulk-selection/) -- enterprise UX patterns
- [Tabulator Layout Docs](https://tabulator.info/docs/6.3/layout) -- column resize guides, frozen columns
- [TanStack Virtual GitHub Issues #659, #832](https://github.com/TanStack/virtual/issues) -- variable height problems

### Tertiary (LOW confidence)
- Various Medium/DEV.to articles on data table implementation -- general patterns only

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
