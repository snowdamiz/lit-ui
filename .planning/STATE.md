# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v4.1 Select Component - Phase 37 CLI and Documentation

## Current Position

Phase: 37 - CLI and Documentation (complete)
Plan: 4 of 4
Status: Phase complete
Last activity: 2026-01-27 - Completed 37-04-PLAN.md

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 phases | v2.0 SHIPPED | v3.0 SHIPPED | v3.1 SHIPPED | v4.0 SHIPPED | v4.1 [#######] 7/7 phases

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
- Plans completed: 26
- Total execution time: 137 min

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
| ResizeObserver for tag overflow | Dynamic layout measurement without manual resize tracking | 34-03 |
| requestAnimationFrame for layout updates | Prevent layout thrashing from ResizeObserver callbacks | 34-03 |
| showSelectAll prop default false | Optional bulk actions to avoid UI clutter | 34-03 |
| Space goes to input in searchable mode | Allows filtering with spaces; toggles in multi-select | 35-01 |
| Home/End cursor movement in searchable | Ctrl/Cmd + Home/End navigate options instead | 35-01 |
| Filter cleared on dropdown close | Clean state on reopen, not on blur | 35-01 |
| Bold highlighting with CSS tokens | Theme customization for highlight appearance | 35-02 |
| findAllMatches for all occurrences | Highlights every match, not just first | 35-02 |
| Empty state aria-live=polite | Screen reader announces no results | 35-02 |
| customFilter preserves highlighting | Custom logic for inclusion, default for highlights | 35-03 |
| Create option at end of keyboard cycle | Arrow down from last option goes to create option | 35-03 |
| Exact match check is case-insensitive | Create option hidden when label/value matches exactly | 35-03 |
| Skeleton text widths vary for natural appearance | 70%, 55%, 80%, 60% rotation avoids repetitive look | 36-01 |
| Checkbox indicator in multi-select skeleton | Visual consistency with real options | 36-01 |
| Dark mode via :host-context(.dark) | Standard pattern for dark mode skeleton colors | 36-01 |
| Options prop changed to attribute: false | Promise cannot be serialized to/from attribute | 36-02 |
| Selection cleared on async error | Clean state for retry attempts | 36-02 |
| Task controller for async options | @lit/task manages Promise lifecycle | 36-02 |
| AbortController cancels previous search requests | Prevents race conditions in async search | 36-03 |
| Server-filtered results bypass local filtering | No highlighting needed for server-side filtered results | 36-03 |
| Search state cleared on dropdown close | Clean state for next open | 36-03 |
| Virtual scrolling auto-enabled for async modes | Promise options and async search always use virtualization | 36-04 |
| VirtualizerController recreated on count change | Simpler than partial options update | 36-04 |
| scrollToIndex with align:auto behavior:auto | Smooth keyboard navigation scrolling | 36-04 |
| IntersectionObserver rootMargin for 80% scroll trigger | 0px 0px 20% 0px triggers when 20% from bottom | 36-05 |
| Sentinel element for infinite scroll detection | Reliable intersection observation pattern | 36-05 |
| Observer re-established in updated() | Handle DOM changes after new options load | 36-05 |
| preview={null} for async doc examples | Interactive demos require server APIs not available in static docs | 37-02 |
| Amber color for Phase 36 badge | Distinct from blue (33), green (34), purple (35) phase badges | 37-02 |
| Minimal starter template for complex CLI components | Full select is 1500+ lines; starter provides ~200 line shell with NPM redirect | 37-03 |

### Pending Todos

None.

### Blockers/Concerns

**Tech debt from v3.0:**
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)
- Tracked in v3.0-MILESTONE-AUDIT.md (archived)

**Applied from research:**
- ARIA 1.2 combobox pattern (not 1.1) - use aria-controls, not aria-owns [APPLIED in 32-01]
- Shadow DOM click-outside requires event.composedPath() [APPLIED in 32-01]
- iOS VoiceOver has limited aria-activedescendant support [MITIGATED in 32-02 with ARIA live region]
- Multi-select FormData uses formData.append() for each value [APPLIED in 34-01]
- Case-insensitive contains matching for searchable [APPLIED in 35-01]
- Async search needs AbortController to prevent race conditions [APPLIED in 36-03]
- @tanstack/lit-virtual VirtualizerController for efficient large list rendering [APPLIED in 36-04]
- IntersectionObserver for infinite scroll pagination [APPLIED in 36-05]

## Session Continuity

Last session: 2026-01-27
Stopped at: Completed 37-04-PLAN.md
Resume file: None

## Next Steps

Phase 37 complete. All 4 plans executed.

**Phase 37 Progress:**
- Plan 01: CLI NPM mode and list update (complete)
- Plan 02: Select async documentation (complete)
- Plan 03: CLI registry select entry (complete)
- Plan 04: Select accessibility documentation (complete)

**v4.1 Status:** All 7 phases complete (31-37). v4.1 ready for milestone audit.
