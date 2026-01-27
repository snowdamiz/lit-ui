# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v4.1 Select Component - Phase 34 in progress

## Current Position

Phase: 34 - Multi-Select (in progress)
Plan: 02 of 4 complete
Status: In progress
Last activity: 2026-01-27 - Completed 34-02-PLAN.md (Tag Display)

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 phases | v2.0 SHIPPED | v3.0 SHIPPED | v3.1 SHIPPED | v4.0 SHIPPED | v4.1 [######..] 6/7 phases

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
- Plans completed: 12
- Total execution time: 41 min

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
| Use slot + property fallback for options | Slot always rendered, property options only when slot empty | 33-02 |
| Register lui-option as custom element | Required for slot-based usage with groups | 33-02 |
| MutationObserver for group content | Detect dynamic option changes inside groups | 33-02 |
| Options property takes precedence | Backwards compatibility with existing property-based usage | 33-01 |
| Option.getLabel() priority | label prop > textContent > value for flexible label resolution | 33-01 |
| data-active attribute for active state | CSS ::slotted() selector can target attribute-based states | 33-01 |
| Clear button tabindex=-1 | Trigger handles all keyboard interaction, following combobox pattern | 33-03 |
| Delete/Backspace for keyboard clear | Keyboard accessible clear without adding button to tab order | 33-03 |
| Dropdown minWidth instead of fixed width | Allows dropdown content to size naturally beyond trigger width | 33-04 |
| display:none for unselected check icon | Removes padding from unselected options vs visibility:hidden | 33-04 |
| Value returns string[] in multi-select | Type-safe distinction between modes | 34-01 |
| FormData.append() for multi-select | Supports native getAll() for form submission | 34-01 |
| Space toggles, Enter closes in multi-select | W3C APG pattern for listbox multi-select | 34-01 |
| Checkbox indicator for multi-select options | Visual distinction from single-select checkmark | 34-01 |
| Show up to 3 labels then "N selected" | Prevents trigger overflow with many selections | 34-01 |
| Tag background uses secondary color | Consistent with typical chip/tag styling patterns | 34-02 |
| Tag remove button tabindex=-1 | Trigger handles keyboard interaction, not individual tag buttons | 34-02 |

### Pending Todos

None.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)
- Tracked in v3.0-MILESTONE-AUDIT.md (archived)

**Research findings to apply:**
- Async search needs AbortController to prevent race conditions

**Applied from research:**
- ARIA 1.2 combobox pattern (not 1.1) - use aria-controls, not aria-owns [APPLIED in 32-01]
- Shadow DOM click-outside requires event.composedPath() [APPLIED in 32-01]
- iOS VoiceOver has limited aria-activedescendant support [MITIGATED in 32-02 with ARIA live region]
- Multi-select FormData uses formData.append() for each value [APPLIED in 34-01]

## Session Continuity

Last session: 2026-01-27 01:51Z
Stopped at: Completed 34-02-PLAN.md (Tag Display)
Resume file: None

## Next Steps

Phase 34 Plan 02 complete. Continue with remaining plans.

**Phase 34 Plan 02 Delivered:**
- CSS tokens for tag styling (--ui-select-tag-*)
- CSS tokens for checkbox styling (--ui-select-checkbox-*)
- Pill-shaped tags with remove button
- Tag truncation with ellipsis and title tooltip
- Focus management after tag removal

**Remaining plans in Phase 34:**
- Plan 03: Overflow Handling
- Plan 04: Final Verification
