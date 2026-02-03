# Requirements: LitUI v6.0

**Defined:** 2026-02-02
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v6.0 Requirements

Requirements for the Layout Components milestone. Each maps to roadmap phases.

### Accordion — Core

- [x] **ACRD-01**: Accordion container manages single-expand mode (opening one panel closes others)
- [x] **ACRD-02**: Accordion container supports multi-expand mode (multiple panels open simultaneously)
- [x] **ACRD-03**: Accordion supports collapsible behavior (all panels can be closed in single mode)
- [x] **ACRD-04**: Accordion item expands/collapses with smooth CSS Grid animation (grid-template-rows 0fr/1fr)
- [x] **ACRD-05**: Accordion respects prefers-reduced-motion by disabling transitions
- [x] **ACRD-06**: Accordion item header button toggles panel on Enter/Space
- [x] **ACRD-07**: Arrow keys navigate between accordion headers with wrapping
- [x] **ACRD-08**: Home/End keys jump to first/last accordion header
- [x] **ACRD-09**: Accordion item has aria-expanded, aria-controls, and heading wrapper with configurable aria-level
- [x] **ACRD-10**: Accordion panel has role="region" with aria-labelledby pointing to header
- [x] **ACRD-11**: Individual accordion items can be disabled (focusable but not activatable)
- [x] **ACRD-12**: Accordion supports controlled mode (value attribute) and uncontrolled mode (default-value)
- [x] **ACRD-13**: Accordion dispatches ui-change event on expand/collapse
- [x] **ACRD-14**: Accordion items discovered via slotchange, handles dynamic add/remove
- [x] **ACRD-15**: Parent disabled state propagates to all child items

### Accordion — Polish

- [x] **ACRD-16**: Built-in chevron indicator with CSS rotation animation on expand/collapse
- [x] **ACRD-17**: data-state attribute ("open"/"closed") on items for CSS-only styling
- [x] **ACRD-18**: Lazy mounting of panel content (DOM created on first expand, preserved after)
- [x] **ACRD-19**: SSR compatible via Declarative Shadow DOM with slotchange hydration workaround

### Accordion — Theming

- [x] **ACRD-20**: CSS custom properties for accordion theming (--ui-accordion-*)
- [x] **ACRD-21**: Dark mode support via :host-context(.dark)

### Tabs — Core

- [x] **TABS-01**: Tabs container renders tablist with tab buttons from slotted TabPanel metadata
- [x] **TABS-02**: Tab panels show/hide based on active tab selection
- [x] **TABS-03**: Automatic activation mode (arrow key focus change immediately activates tab)
- [x] **TABS-04**: Manual activation mode (arrow keys move focus, Enter/Space activates)
- [x] **TABS-05**: Horizontal orientation with Left/Right arrow key navigation
- [x] **TABS-06**: Vertical orientation with Up/Down arrow key navigation
- [x] **TABS-07**: Arrow key navigation wraps from last to first and vice versa
- [x] **TABS-08**: Home/End keys jump to first/last non-disabled tab
- [x] **TABS-09**: Tab from tablist moves focus to active panel content
- [x] **TABS-10**: Tabs have role="tablist", role="tab", role="tabpanel" with aria-selected, aria-controls, aria-labelledby
- [x] **TABS-11**: aria-orientation set correctly based on orientation property
- [x] **TABS-12**: Individual tabs can be disabled (skipped in keyboard navigation)
- [x] **TABS-13**: Tabs support controlled mode (value attribute) and uncontrolled mode (default-value)
- [x] **TABS-14**: Tabs dispatch ui-change event on tab switch
- [x] **TABS-15**: Tab panels discovered via slotchange, handles dynamic add/remove

### Tabs — Polish

- [ ] **TABS-16**: Animated active indicator (sliding underline) that transitions between tabs
- [ ] **TABS-17**: Active indicator repositions on window resize via ResizeObserver
- [ ] **TABS-18**: Lazy rendering of tab panels (content rendered on first activation, preserved after)
- [ ] **TABS-19**: Overflow scroll with navigation buttons when tabs exceed container width
- [ ] **TABS-20**: data-state attribute ("active"/"inactive") on tabs and panels for CSS-only styling
- [ ] **TABS-21**: SSR compatible via Declarative Shadow DOM with slotchange hydration workaround
- [ ] **TABS-22**: Tab panel sets tabindex="0" when it contains no focusable elements

### Tabs — Theming

- [x] **TABS-23**: CSS custom properties for tabs theming (--ui-tabs-*)
- [x] **TABS-24**: Dark mode support via :host-context(.dark)

### Integration

- [x] **INTG-01**: @lit-ui/accordion package with peer deps on lit and @lit-ui/core
- [ ] **INTG-02**: @lit-ui/tabs package with peer deps on lit and @lit-ui/core
- [ ] **INTG-03**: CLI copy-source templates for accordion (namespaced: accordion/accordion, accordion/accordion-item)
- [ ] **INTG-04**: CLI copy-source templates for tabs (namespaced: tabs/tabs, tabs/tab-panel)
- [ ] **INTG-05**: CLI registry entries for accordion and tabs with correct dependencies
- [ ] **INTG-06**: CSS variable fallbacks in copy-source templates for standalone usage
- [ ] **INTG-07**: Documentation page for Accordion with interactive demos and API reference
- [ ] **INTG-08**: Documentation page for Tabs with interactive demos and API reference

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Layout Components

- **ACRD-F01**: Horizontal orientation visual layout for accordion
- **TABS-F01**: Closable/removable tabs with close button and Delete key support
- **TABS-F02**: Tab panel crossfade/slide transition animations
- **TABS-F03**: Tab placement variants (top/bottom/start/end)
- **TABS-F04**: Progressive enhancement with interpolate-size for Chromium accordion animation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native `<details>`/`<summary>` for accordion | Shadow DOM complicates name grouping, limited animation, breaks WAI-ARIA APG pattern |
| Nested accordion keyboard management | Massive complexity, ambiguous keyboard ownership, no major library does this |
| Drag-to-reorder tabs/accordion items | Complex DnD in Shadow DOM, not expected behavior |
| Tab-as-router-link | Violates WAI-ARIA semantics; tabs control panels, not pages |
| Built-in tab content fetching | Application concern, not component concern |
| Editable tab labels | Niche feature, users can compose input in slot |
| Icon-only tabs without labels | Accessibility concern; support icons alongside text instead |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACRD-01 | Phase 56 | Complete |
| ACRD-02 | Phase 56 | Complete |
| ACRD-03 | Phase 56 | Complete |
| ACRD-04 | Phase 56 | Complete |
| ACRD-05 | Phase 56 | Complete |
| ACRD-06 | Phase 56 | Complete |
| ACRD-07 | Phase 56 | Complete |
| ACRD-08 | Phase 56 | Complete |
| ACRD-09 | Phase 56 | Complete |
| ACRD-10 | Phase 56 | Complete |
| ACRD-11 | Phase 56 | Complete |
| ACRD-12 | Phase 56 | Complete |
| ACRD-13 | Phase 56 | Complete |
| ACRD-14 | Phase 56 | Complete |
| ACRD-15 | Phase 56 | Complete |
| ACRD-16 | Phase 57 | Complete |
| ACRD-17 | Phase 57 | Complete |
| ACRD-18 | Phase 57 | Complete |
| ACRD-19 | Phase 57 | Complete |
| ACRD-20 | Phase 56 | Complete |
| ACRD-21 | Phase 56 | Complete |
| TABS-01 | Phase 58 | Complete |
| TABS-02 | Phase 58 | Complete |
| TABS-03 | Phase 58 | Complete |
| TABS-04 | Phase 58 | Complete |
| TABS-05 | Phase 58 | Complete |
| TABS-06 | Phase 58 | Complete |
| TABS-07 | Phase 58 | Complete |
| TABS-08 | Phase 58 | Complete |
| TABS-09 | Phase 58 | Complete |
| TABS-10 | Phase 58 | Complete |
| TABS-11 | Phase 58 | Complete |
| TABS-12 | Phase 58 | Complete |
| TABS-13 | Phase 58 | Complete |
| TABS-14 | Phase 58 | Complete |
| TABS-15 | Phase 58 | Complete |
| TABS-16 | Phase 59 | Pending |
| TABS-17 | Phase 59 | Pending |
| TABS-18 | Phase 59 | Pending |
| TABS-19 | Phase 59 | Pending |
| TABS-20 | Phase 59 | Pending |
| TABS-21 | Phase 59 | Pending |
| TABS-22 | Phase 59 | Pending |
| TABS-23 | Phase 58 | Complete |
| TABS-24 | Phase 58 | Complete |
| INTG-01 | Phase 57 | Complete |
| INTG-02 | Phase 59 | Pending |
| INTG-03 | Phase 60 | Pending |
| INTG-04 | Phase 60 | Pending |
| INTG-05 | Phase 60 | Pending |
| INTG-06 | Phase 60 | Pending |
| INTG-07 | Phase 60 | Pending |
| INTG-08 | Phase 60 | Pending |

**Coverage:**
- v6.0 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-03 after Phase 58 completion*
