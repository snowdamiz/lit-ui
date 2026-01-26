# Requirements: LitUI v4.1

**Defined:** 2026-01-26
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v4.1 Requirements

Requirements for Select component with single-select, multi-select, combobox, and async loading.

### Single Select

- [ ] **SELECT-01**: Select renders as dropdown trigger with current value display
- [ ] **SELECT-02**: Select opens dropdown on click, Enter, Space, or ArrowDown
- [ ] **SELECT-03**: Select supports arrow key navigation through options
- [ ] **SELECT-04**: Select supports type-ahead search (focuses matching option)
- [ ] **SELECT-05**: Select participates in native forms via ElementInternals
- [ ] **SELECT-06**: Select validates required fields (shows error when empty on submit)
- [ ] **SELECT-07**: Select supports disabled state (whole component)
- [ ] **SELECT-08**: Option supports disabled state (individual options)
- [ ] **SELECT-09**: Select shows placeholder text when no selection
- [ ] **SELECT-10**: Select shows focus ring on keyboard focus
- [ ] **SELECT-11**: Select shows error visual state when invalid
- [ ] **SELECT-12**: Select supports size variants (sm, default, lg)
- [ ] **SELECT-13**: Select supports option groups with headers (lui-option-group)
- [ ] **SELECT-14**: Option supports custom content via slots (icons, descriptions)
- [ ] **SELECT-15**: Select supports clearable prop (X button to reset value)

### Multi-Select

- [ ] **MULTI-01**: Select supports multiple prop for multi-selection
- [ ] **MULTI-02**: Multi-select shows checkbox indicators on options
- [ ] **MULTI-03**: Multi-select displays selected items as tags/chips
- [ ] **MULTI-04**: Tags have X button to remove individual selections
- [ ] **MULTI-05**: Multi-select submits array values via FormData (multiple append)
- [ ] **MULTI-06**: Multi-select supports tag overflow display ("+N more")
- [ ] **MULTI-07**: Multi-select supports select all / deselect all actions

### Combobox

- [ ] **COMBO-01**: Select supports searchable prop for text input filtering
- [ ] **COMBO-02**: Combobox filters options as user types
- [ ] **COMBO-03**: Combobox shows empty state when no options match
- [ ] **COMBO-04**: Combobox highlights matching text in option labels
- [ ] **COMBO-05**: Combobox supports custom filter function prop
- [ ] **COMBO-06**: Combobox supports creatable prop (add new option if not found)

### Async Loading

- [ ] **ASYNC-01**: Select supports options prop accepting Promise
- [ ] **ASYNC-02**: Select shows loading spinner while options load
- [ ] **ASYNC-03**: Select shows error state with retry button on load failure
- [ ] **ASYNC-04**: Combobox supports async search (debounced API calls)
- [ ] **ASYNC-05**: Select supports infinite scroll for paginated options
- [ ] **ASYNC-06**: Select supports virtual scrolling for 100+ options

### Infrastructure

- [x] **INFRA-01**: CSS tokens for select added to @lit-ui/core (--ui-select-*)
- [x] **INFRA-02**: @lit-ui/select package created with SSR support
- [x] **INFRA-03**: @floating-ui/dom added as dependency for positioning
- [ ] **INFRA-04**: @tanstack/lit-virtual added as dependency for virtual scrolling
- [ ] **INFRA-05**: CLI templates updated for select component
- [ ] **INFRA-06**: Docs page created for Select component

### Accessibility

- [ ] **A11Y-01**: Select uses ARIA 1.2 combobox pattern (input has role="combobox")
- [ ] **A11Y-02**: Select uses aria-controls to reference listbox (not aria-owns)
- [ ] **A11Y-03**: Select manages focus with aria-activedescendant
- [ ] **A11Y-04**: Options have role="option" with aria-selected state
- [ ] **A11Y-05**: Option groups use role="group" with aria-labelledby
- [ ] **A11Y-06**: Keyboard navigation follows W3C APG combobox pattern

## Future Requirements

Deferred to later milestones.

### Additional Form Components (v4.2+)

- Checkbox component
- Radio component
- Switch toggle component

### Select Enhancements (v4.2+)

- Native mobile fallback (use native `<select>` on touch devices)
- Drag-to-reorder selected tags in multi-select

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile fallback | UX decision deferred; custom select works on mobile |
| Drag-to-reorder tags | Complex, low priority for v4.1 |
| Nested option groups | Accessibility complexity, rare use case |
| Async creatable | Race condition complexity; use sync creatable |
| Server-side filtering only | Always allow client-side filter as baseline |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 31 | Complete |
| INFRA-02 | Phase 31 | Complete |
| INFRA-03 | Phase 31 | Complete |
| SELECT-01 | Phase 32 | Pending |
| SELECT-02 | Phase 32 | Pending |
| SELECT-03 | Phase 32 | Pending |
| SELECT-04 | Phase 32 | Pending |
| SELECT-05 | Phase 32 | Pending |
| SELECT-06 | Phase 32 | Pending |
| SELECT-07 | Phase 32 | Pending |
| SELECT-08 | Phase 32 | Pending |
| SELECT-09 | Phase 32 | Pending |
| SELECT-10 | Phase 32 | Pending |
| SELECT-11 | Phase 32 | Pending |
| SELECT-12 | Phase 32 | Pending |
| A11Y-01 | Phase 32 | Pending |
| A11Y-02 | Phase 32 | Pending |
| A11Y-03 | Phase 32 | Pending |
| A11Y-04 | Phase 32 | Pending |
| SELECT-13 | Phase 33 | Pending |
| SELECT-14 | Phase 33 | Pending |
| SELECT-15 | Phase 33 | Pending |
| A11Y-05 | Phase 33 | Pending |
| MULTI-01 | Phase 34 | Pending |
| MULTI-02 | Phase 34 | Pending |
| MULTI-03 | Phase 34 | Pending |
| MULTI-04 | Phase 34 | Pending |
| MULTI-05 | Phase 34 | Pending |
| MULTI-06 | Phase 34 | Pending |
| MULTI-07 | Phase 34 | Pending |
| COMBO-01 | Phase 35 | Pending |
| COMBO-02 | Phase 35 | Pending |
| COMBO-03 | Phase 35 | Pending |
| COMBO-04 | Phase 35 | Pending |
| COMBO-05 | Phase 35 | Pending |
| COMBO-06 | Phase 35 | Pending |
| A11Y-06 | Phase 35 | Pending |
| ASYNC-01 | Phase 36 | Pending |
| ASYNC-02 | Phase 36 | Pending |
| ASYNC-03 | Phase 36 | Pending |
| ASYNC-04 | Phase 36 | Pending |
| ASYNC-05 | Phase 36 | Pending |
| ASYNC-06 | Phase 36 | Pending |
| INFRA-04 | Phase 36 | Pending |
| INFRA-05 | Phase 37 | Pending |
| INFRA-06 | Phase 37 | Pending |

**Coverage:**
- v4.1 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 (Phase 31 complete)*
