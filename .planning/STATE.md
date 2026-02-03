# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 59 - Tabs Polish & Package

## Current Position

Phase: 59 of 60 (Tabs Polish & Package)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-03 — Completed 59-01-PLAN.md

Progress: ████████████████░░░░░░░░░░░░░░░░ 60% (v6.0)

## Performance Metrics

**Velocity (v5.0):**
- Plans completed: 13
- Total execution time: ~36 min

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- CSS Grid `grid-template-rows: 0fr/1fr` for accordion height animation (cross-browser, no JS measurement)
- Parent-child container pattern from RadioGroup/CheckboxGroup reused for both components
- ARIA ID references must stay within shadow DOM boundary (shadow-internal IDs, slotted content)
- SSR slotchange workaround: manually dispatch slotchange in firstUpdated() after hydration
- Private getExpandedSet() instead of public getter to avoid api-extractor crash on Set<string> in DTS rollup
- Roving tabindex pattern reused from RadioGroup for accordion keyboard nav
- Disabled items use cursor:not-allowed + opacity instead of pointer-events:none to remain focusable
- aria-disabled uses lit `nothing` sentinel to omit attribute when not disabled
- _hasBeenExpanded as plain field, not @state() (avoids redundant re-render)
- data-state set via this.setAttribute in lifecycle (host-level, read-only, client-only via isServer guard)
- Container-rendered tablist: tab buttons in shadow DOM, panels slotted in light DOM (ARIA cross-boundary best-effort)
- Container sets role=tabpanel on panel hosts (moved from tab-panel connectedCallback for centralized ARIA)
- _focusedValue tracks keyboard focus separately from active value for manual activation mode
- orientation reflects to host attribute for CSS :host([orientation]) selectors
- Tab indicator uses CSS transitions on transform/width (no JS animation loop), opacity guard until first measurement
- Lazy panels return `nothing` for zero DOM footprint, _hasBeenExpanded as plain field
- Conditional tabindex per W3C APG: active panels with focusable children skip tabindex="0"

### Pending Todos

None.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)

**Minor v4.3 tech debt:**
- CalendarMulti exported but unused by other packages
- CLI registry.json incorrect time-picker->calendar dependency

## Quick Tasks

| ID | Name | Duration | Date |
|----|------|----------|------|
| quick-001 | Cmd+K command palette with full-text search | 2m 55s | 2026-02-02 |

## Session Continuity

Last session: 2026-02-03
Stopped at: Completed 59-01-PLAN.md
Resume file: None
