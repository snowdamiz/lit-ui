# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v4.1 Select Component - Phase 32 (Core Single Select)

## Current Position

Phase: 32 - Core Single Select
Plan: Pending (needs planning)
Status: Ready to plan
Last activity: 2026-01-26 - Phase 31 complete (verified)

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 phases | v2.0 SHIPPED | v3.0 SHIPPED | v3.1 SHIPPED | v4.0 SHIPPED | v4.1 [#.......] 1/7 phases

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
- Plans completed: 2
- Total execution time: 7 min

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

### Pending Todos

None.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* → --ui-*)
- Tracked in v3.0-MILESTONE-AUDIT.md (archived)

**Research findings to apply:**
- ARIA 1.2 combobox pattern (not 1.1) - use aria-controls, not aria-owns
- Shadow DOM click-outside requires event.composedPath()
- Multi-select FormData uses formData.append() for each value
- iOS VoiceOver has limited aria-activedescendant support - test on real devices
- Async search needs AbortController to prevent race conditions

## Session Continuity

Last session: 2026-01-26
Stopped at: Phase 31 complete and verified
Resume file: None

## Next Steps

Phase 32: Core Single Select is pending.

**Requirements for Phase 32:**
- SELECT-01 through SELECT-12: Core select functionality
- A11Y-01 through A11Y-04: Accessibility requirements

**Success criteria (from ROADMAP.md):**
1. User clicks select trigger and dropdown opens with options; user clicks option and selection is displayed in trigger
2. User navigates options with arrow keys, selects with Enter, and closes with Escape without using mouse
3. User types characters and focus moves to first option starting with those characters (type-ahead)
4. Developer wraps lui-select in native form, submits form, and receives selected value in FormData
5. Screen reader user hears current selection, available options count, and navigation instructions via ARIA

**Next action:** Run `/gsd:plan-phase 32` to create implementation plans
