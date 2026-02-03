# Project State: LitUI v7.0 Data Table

## Project Reference

**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

**Current Focus:** Building a full-featured data table for admin dashboards with 100K+ row virtualization, sorting, filtering, inline editing, selection with bulk actions, and column customization.

## Current Position

**Milestone:** v7.0 Data Table
**Phase:** 61 - Core Table Shell & Virtualization
**Plan:** 1 of 5 complete
**Status:** In progress

**Progress:**
```
Milestone: [#-------] 12.5%
Phase:     [##------] 20%
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans completed | 1 |
| Requirements satisfied | 0/76 |
| Phases completed | 0/8 |

## Accumulated Context

### Key Decisions
*Decisions made during this milestone. Updated during planning and execution.*

| Decision | Rationale | Phase |
|----------|-----------|-------|
| TanStack Table for state | Headless, Lit-native reactive controller, handles sort/filter/pagination | Research |
| TanStack Virtual for rows | Already used in Select, proven for 100K+ items | Research |
| Fixed 48px row height | Variable heights break virtual scroll performance | Research |
| Container-rendered grid | ARIA IDs work in single shadow root | Research |
| Client/server dual mode | manual=false for local, manual=true for callbacks | Research |
| Type alias for ColumnDef | TanStack's ColumnDef is union type, cannot extend with interface | 61-01 |
| LitUI extensions via meta | Column customizations (editable, filter) go in meta property | 61-01 |
| Re-export TanStack utilities | Developer convenience - single import source | 61-01 |

### Architecture Notes
*Technical context that spans multiple plans.*

- Data table follows Select pattern: hybrid API with both `columns` property and `<lui-column>` declarative children
- `lui-data-table` owns TanStack controllers (TableController + VirtualizerController)
- Row/cell rendering as templates in container shadow DOM (NOT separate custom elements)
- Scroll architecture: separate containers for header and body with synchronized scrollLeft
- Form integration via ElementInternals (for inline editing validation)
- ColumnDef<TData, TValue> is type alias (not interface) due to TanStack union type structure

### TODOs
*Items to address that emerged during work.*

*None yet.*

### Blockers
*Issues preventing progress.*

*None.*

### Tech Debt (carried forward)
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)
- CalendarMulti exported but unused by other packages
- CLI registry.json incorrect time-picker->calendar dependency

## Quick Tasks

| ID | Name | Duration | Date |
|----|------|----------|------|
| quick-001 | Cmd+K command palette with full-text search | 2m 55s | 2026-02-02 |

## Session Continuity

### Last Session
*Summary of previous session's work. Updated at session end.*

- Completed 61-01-PLAN.md: Package foundation for @lit-ui/data-table
- Installed @tanstack/lit-table@8.21.3 and @tanstack/lit-virtual@3.13.19
- Created type definitions: ColumnDef, DataTableState, LoadingState, event types
- Fixed ColumnDef type approach (type alias vs interface extension)

### Next Actions
*Clear starting point for next session.*

1. Execute 61-02-PLAN.md: DataTable component with TableController and VirtualizerController
2. Implement CSS Grid layout with ARIA grid roles
3. Add sticky header and virtual row rendering

### Open Questions
*Unresolved questions needing user input.*

*None.*

---
*State initialized: 2026-02-02*
*Last updated: 2026-02-03*
