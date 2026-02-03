# Roadmap: LitUI v6.0 Layout Components

## Overview

Deliver Accordion and Tabs layout components following the established parent-child container pattern from RadioGroup/CheckboxGroup. Accordion ships first as the simpler pattern (no activation modes, no indicator animation), validating CSS Grid height animation and slot discovery. Tabs builds on those patterns, adding orientation variants, activation modes, and a sliding active indicator. Integration phase bundles CLI templates, documentation, and SSR verification for both components.

## Milestones

- v1.0 through v5.0: Shipped (see MILESTONES.md)
- v6.0 Layout Components: Phases 56-60 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (56, 57, ...): Planned milestone work
- Decimal phases (57.1, 57.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 56: Accordion Core** - Fully accessible accordion with single/multi-expand, keyboard navigation, and CSS Grid animation
- [x] **Phase 57: Accordion Polish & Package** - Visual refinements, lazy mounting, SSR compatibility, and publishable package
- [x] **Phase 58: Tabs Core** - Fully accessible tabs with automatic/manual activation, horizontal/vertical orientation, and keyboard navigation
- [x] **Phase 59: Tabs Polish & Package** - Active indicator animation, lazy rendering, overflow scroll, SSR compatibility, and publishable package
- [ ] **Phase 60: CLI & Documentation** - CLI templates, registry entries, and documentation pages for both components

## Phase Details

### Phase 56: Accordion Core
**Goal**: Users can expand and collapse accordion panels with full keyboard and screen reader support
**Depends on**: Nothing (first phase of milestone)
**Requirements**: ACRD-01, ACRD-02, ACRD-03, ACRD-04, ACRD-05, ACRD-06, ACRD-07, ACRD-08, ACRD-09, ACRD-10, ACRD-11, ACRD-12, ACRD-13, ACRD-14, ACRD-15, ACRD-20, ACRD-21
**Success Criteria** (what must be TRUE):
  1. User can click an accordion header to expand its panel, and in single-expand mode the previously open panel collapses automatically
  2. User can open multiple panels simultaneously when the accordion is in multi-expand mode
  3. User can navigate between accordion headers using arrow keys (with wrapping) and Home/End, and toggle panels with Enter/Space
  4. Screen reader announces aria-expanded state, heading level, and panel association (aria-controls/aria-labelledby) correctly
  5. Accordion renders with project-consistent CSS custom properties (--ui-accordion-*) and responds to dark mode
**Plans**: 2 plans

Plans:
- [x] 56-01-PLAN.md — Package scaffold, AccordionItem element, Accordion container with single/multi-expand state management
- [x] 56-02-PLAN.md — Keyboard navigation, ARIA attributes, disabled states, and CSS custom property theming with dark mode

### Phase 57: Accordion Polish & Package
**Goal**: Accordion has visual polish, SSR compatibility, and ships as a publishable @lit-ui/accordion package
**Depends on**: Phase 56
**Requirements**: ACRD-16, ACRD-17, ACRD-18, ACRD-19, INTG-01
**Success Criteria** (what must be TRUE):
  1. Accordion items display an animated chevron indicator that rotates on expand/collapse
  2. Accordion items expose data-state="open"/"closed" for CSS-only consumer styling
  3. Accordion panel content with the lazy attribute is not mounted until first expand, then preserved
  4. Accordion renders correctly via Declarative Shadow DOM on the server and hydrates on the client
**Plans**: 2 plans

Plans:
- [x] 57-01-PLAN.md -- Chevron indicator with CSS rotation, data-state attribute reflection, lazy mounting
- [x] 57-02-PLAN.md -- SSR compatibility verification and @lit-ui/accordion package publishability audit

### Phase 58: Tabs Core
**Goal**: Users can switch between tab panels with full keyboard, screen reader, and orientation support
**Depends on**: Phase 56 (reuses parent-child discovery and keyboard navigation patterns)
**Requirements**: TABS-01, TABS-02, TABS-03, TABS-04, TABS-05, TABS-06, TABS-07, TABS-08, TABS-09, TABS-10, TABS-11, TABS-12, TABS-13, TABS-14, TABS-15, TABS-23, TABS-24
**Success Criteria** (what must be TRUE):
  1. User can click a tab to show its corresponding panel, hiding all other panels
  2. In automatic mode, arrow keys immediately activate the focused tab; in manual mode, arrow keys move focus and Enter/Space activates
  3. User can navigate tabs with Left/Right arrows (horizontal) or Up/Down arrows (vertical), with wrapping and Home/End support
  4. Screen reader identifies tablist, tab, and tabpanel roles with correct aria-selected, aria-controls, aria-labelledby, and aria-orientation
  5. Tabs render with project-consistent CSS custom properties (--ui-tabs-*) and respond to dark mode
**Plans**: 2 plans

Plans:
- [x] 58-01-PLAN.md — Package scaffold, TabPanel element, Tabs container with tablist rendering and active tab state
- [x] 58-02-PLAN.md — Keyboard navigation, activation modes, orientation, ARIA, disabled tabs, and CSS theming

### Phase 59: Tabs Polish & Package
**Goal**: Tabs have animated indicator, lazy rendering, overflow handling, SSR compatibility, and ship as a publishable @lit-ui/tabs package
**Depends on**: Phase 58
**Requirements**: TABS-16, TABS-17, TABS-18, TABS-19, TABS-20, TABS-21, TABS-22, INTG-02
**Success Criteria** (what must be TRUE):
  1. Active tab indicator slides smoothly between tabs when selection changes, and repositions on window resize
  2. Tab panels with the lazy attribute render content only on first activation and preserve it after
  3. When tabs overflow the container, scroll navigation buttons appear and allow horizontal scrolling
  4. Tab panels without focusable content receive tabindex="0" so keyboard users can reach panel content
  5. Tabs render correctly via Declarative Shadow DOM on the server and hydrate on the client
**Plans**: 2 plans

Plans:
- [x] 59-01-PLAN.md — Animated active indicator, data-state on tab buttons, lazy panel rendering, conditional panel tabindex
- [x] 59-02-PLAN.md — Overflow scroll with navigation buttons, SSR compatibility verification, package publishability audit

### Phase 60: CLI & Documentation
**Goal**: Both components are installable via CLI and documented with interactive demos
**Depends on**: Phase 57, Phase 59
**Requirements**: INTG-03, INTG-04, INTG-05, INTG-06, INTG-07, INTG-08
**Success Criteria** (what must be TRUE):
  1. Running `npx lit-ui add accordion` and `npx lit-ui add tabs` installs correct files with CSS variable fallbacks
  2. CLI registry lists accordion and tabs with correct dependency information
  3. Documentation pages for Accordion and Tabs show interactive demos, full API reference, and accessibility notes
**Plans**: 2 plans

Plans:
- [ ] 60-01-PLAN.md — CLI copy-source templates and registry entries for accordion and tabs
- [ ] 60-02-PLAN.md — Documentation pages with interactive demos and API references

## Progress

**Execution Order:**
Phases execute in numeric order: 56 -> 57 -> 58 -> 59 -> 60

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 56. Accordion Core | 2/2 | ✓ Complete | 2026-02-03 |
| 57. Accordion Polish & Package | 2/2 | ✓ Complete | 2026-02-03 |
| 58. Tabs Core | 2/2 | ✓ Complete | 2026-02-03 |
| 59. Tabs Polish & Package | 2/2 | ✓ Complete | 2026-02-03 |
| 60. CLI & Documentation | 0/2 | Not started | - |
