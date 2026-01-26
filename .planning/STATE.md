# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v4.1 Select Component - Phase 32 (Core Single Select)

## Current Position

Phase: 32 - Core Single Select
Plan: 03 of 4 complete
Status: In progress
Last activity: 2026-01-26 - Completed 32-03-PLAN.md (Form Participation)

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 phases | v2.0 SHIPPED | v3.0 SHIPPED | v3.1 SHIPPED | v4.0 SHIPPED | v4.1 [###.....] 3/7 phases

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 22
- Average duration: 2.9 min
- Total execution time: ~65 min

**v1.1 Velocity (partial):**
- Plans completed: 9
- Total execution time: 22 min

**v2.0 Velocity:**
- Plans completed: 27
- Total execution time: ~86 min

**v3.0 Velocity:**
- Plans completed: 16
- Total execution time: 39 min

**v3.1 Velocity (complete):**
- Plans completed: 5
- Total execution time: 11 min

**v4.0 Velocity (complete):**
- Plans completed: 11
- Total execution time: 30 min

**v4.1 Velocity (in progress):**
- Plans completed: 5
- Total execution time: 12 min

## Accumulated Context

### Decisions

Key decisions are logged in PROJECT.md Key Decisions table.
v3.0, v3.1, v4.0 decisions validated and archived.

**v4.1 Decisions:**
| Decision | Rationale | Phase |
|----------|-----------|-------|
| Follow input/textarea token pattern | Consistency across form components | 31-01 |
| Include dropdown-specific tokens | Floating dropdown needs shadow, z-index, max-height | 31-01 |
| Include option-specific tokens | Listbox items need hover, active, check styling | 31-01 |
| Floating UI in dependencies (bundled) | Zero-config consumer experience | 31-02 |
| Skeleton component validates infrastructure | Verify tokens and build before full implementation | 31-02 |
| Options via property, not slots | Simpler implementation for Phase 32; slot-based extensible later | 32-01 |
| Option component created but not registered | Future slot-based usage potential | 32-01 |
| ARIA live region + aria-activedescendant | VoiceOver on iOS has limited aria-activedescendant support | 32-02 |
| Type-ahead 500ms reset timeout | Matches native select behavior | 32-02 |
| Validation on blur follows input pattern | Consistent UX across form components | 32-03 |
| Error message from internals.validationMessage | Native integration for form participation | 32-03 |

### Pending Todos

None.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* → --ui-*)
- Tracked in v3.0-MILESTONE-AUDIT.md (archived)

**Research findings to apply:**
- ARIA 1.2 combobox pattern (not 1.1) - use aria-controls, not aria-owns [APPLIED in 32-01]
- Shadow DOM click-outside requires event.composedPath() [APPLIED in 32-01]
- Multi-select FormData uses formData.append() for each value
- iOS VoiceOver has limited aria-activedescendant support [MITIGATED in 32-02 with ARIA live region]
- Async search needs AbortController to prevent race conditions

## Session Continuity

Last session: 2026-01-26 23:05Z
Stopped at: Completed 32-03-PLAN.md (Form Participation)
Resume file: None

## Next Steps

Phase 32 Plan 04: Type-ahead Search is next.

**Remaining plans in Phase 32:**
- 32-04: Type-ahead search

**Success criteria progress:**
1. [DONE] User clicks select trigger and dropdown opens with options; user clicks option and selection is displayed in trigger
2. [DONE] User navigates options with arrow keys, selects with Enter, and closes with Escape without using mouse
3. [NEXT] User types characters and focus moves to first option starting with those characters (type-ahead)
4. [DONE] Developer wraps lui-select in native form, submits form, and receives selected value in FormData
5. [DONE] Screen reader user hears current selection, available options count, and navigation instructions via ARIA
