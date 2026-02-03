# Project State: LitUI v7.0 Data Table

## Project Reference

**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

**Current Focus:** Building a full-featured data table for admin dashboards with 100K+ row virtualization, sorting, filtering, inline editing, selection with bulk actions, and column customization.

## Current Position

**Milestone:** v7.0 Data Table
**Phase:** 61 - Core Table Shell & Virtualization
**Plan:** Not started
**Status:** Phase pending

**Progress:**
```
Milestone: [--------] 0%
Phase:     [--------] 0%
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Plans completed | 0 |
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

### Architecture Notes
*Technical context that spans multiple plans.*

- Data table follows Select pattern: hybrid API with both `columns` property and `<lui-column>` declarative children
- `lui-data-table` owns TanStack controllers (TableController + VirtualizerController)
- Row/cell rendering as templates in container shadow DOM (NOT separate custom elements)
- Scroll architecture: separate containers for header and body with synchronized scrollLeft
- Form integration via ElementInternals (for inline editing validation)

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

- Roadmap created with 8 phases (61-68) covering 76 requirements
- Research summary integrated into phase structure
- Phase ordering follows research recommendation: virtualization first, editing last

### Next Actions
*Clear starting point for next session.*

1. Run `/gsd:plan-phase 61` to create plans for Core Table Shell & Virtualization
2. Begin with TanStack Table/Virtual integration spike
3. Establish CSS Grid layout and ARIA grid structure

### Open Questions
*Unresolved questions needing user input.*

*None.*

---
*State initialized: 2026-02-02*
*Last updated: 2026-02-02*
