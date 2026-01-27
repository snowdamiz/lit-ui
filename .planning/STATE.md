# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** Phase 41 - CLI and Documentation (v4.2 Form Controls)

## Current Position

Phase: 41 of 41 (CLI and Documentation)
Plan: 05 of 5 in current phase
Status: In progress
Last activity: 2026-01-27 — Completed 41-05-PLAN.md (Switch Documentation Page)

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 | v2.0 SHIPPED | v3.0 SHIPPED | v3.1 SHIPPED | v4.0 SHIPPED | v4.1 SHIPPED | v4.2 [########..] 3/4

## Performance Metrics

**Historical Velocity:**
- v1.0: 22 plans in ~65 min
- v1.1 (partial): 9 plans in 22 min
- v2.0: 27 plans in ~86 min
- v3.0: 16 plans in 39 min
- v3.1: 5 plans in 11 min
- v4.0: 11 plans in 30 min
- v4.1: 28 plans in 141 min

**v4.2 Velocity:**
- Total plans completed: 12
- Average duration: 2min
- Total execution time: 26min

## Accumulated Context

### Decisions

Key decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Research]: RadioGroup owns form participation, not individual radios (Shadow DOM breaks native grouping)
- [Research]: Zero new dependencies -- CSS transitions for all animation
- [Research]: Build order Switch -> Checkbox -> Radio (incremental complexity)
- [Research]: Skip aria-controls for select-all pattern (poor SR support, cross-shadow boundary issue)
- [38-02]: Use PropertyValues type (not Map) in updated() to avoid api-extractor DTS rollup crash
- [39-01]: Checkbox token naming follows --ui-checkbox-* convention; indeterminate shares checked visual weight
- [39-02]: Space-only keyboard for checkbox (W3C APG spec); click handler on wrapper for label toggle
- [39-03]: CheckboxGroup NOT form-associated; batch update flag for select-all race condition prevention
- [40-01]: Radio tokens omit radius/bg-checked/indeterminate; add dot-size tokens unique to radio
- [40-02]: Radio dispatches ui-radio-change without self-toggling; inner tabindex=-1 (group manages host tabindex)
- [40-03]: RadioGroup is form-associated with roving tabindex; arrow keys move focus+selection; ui-radio-change internal, ui-change consumer-facing
- [41-01]: Inline dispatchCustomEvent in copy-source templates (base file doesn't export it); per-file template lookup for multi-file components

### Pending Todos

None.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)

## Session Continuity

Last session: 2026-01-27
Stopped at: Completed 41-05-PLAN.md
Resume file: None
