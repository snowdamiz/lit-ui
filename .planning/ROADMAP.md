# Roadmap: LitUI v5.0 Overlay & Feedback Components

## Overview

This milestone adds three overlay/feedback primitives -- Toast, Tooltip, and Popover -- built on a shared Floating UI positioning utility in `@lit-ui/core`. The build order follows dependency chains: shared infrastructure first, then Tooltip (simplest overlay, establishes patterns), Popover (adds focus management and click triggers), Toast (most complex, independent architecture), and finally documentation for all three components.

## Milestones

- v1.0 through v4.3: See .planning/MILESTONES.md (Phases 1-50, shipped)
- **v5.0 Overlay & Feedback Components** - Phases 51-55 (in progress)

## Phases

**Phase Numbering:**
- Continues from v4.3 which ended at Phase 50
- Integer phases (51, 52, 53): Planned milestone work
- Decimal phases (52.1, 52.2): Urgent insertions if needed

- [ ] **Phase 51: Shared Infrastructure** - Floating UI positioning utility and shared overlay foundations
- [ ] **Phase 52: Tooltip** - Hover/focus tooltip with accessible positioning and delay groups
- [ ] **Phase 53: Popover** - Click-triggered interactive overlay with focus management
- [ ] **Phase 54: Toast** - Notification system with imperative API, queue management, and swipe-to-dismiss
- [ ] **Phase 55: Documentation** - Docs pages, API references, and CLI registry for all three components

## Phase Details

### Phase 51: Shared Infrastructure
**Goal**: Developers have a reliable positioning foundation that handles Shadow DOM correctly, so Tooltip and Popover can build on proven utilities
**Depends on**: Nothing (first phase of milestone)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. A `@lit-ui/core/floating` export exists that wraps Floating UI with `computePosition`, `flip`, `shift`, `offset`, `arrow`, and `autoUpdate`
  2. Floating UI positioning works correctly inside nested Shadow DOM trees (composed-offset-position integration verified)
  3. CSS custom property token namespaces are defined for toast, tooltip, and popover (`--ui-toast-*`, `--ui-tooltip-*`, `--ui-popover-*`)
  4. A shared CSS animation pattern using `@starting-style` + `transition-behavior: allow-discrete` is available and follows Dialog's established approach
**Plans**: 2 plans

Plans:
- [ ] 51-01-PLAN.md — Floating UI wrapper with Shadow DOM platform fix (`@lit-ui/core/floating` entry point)
- [ ] 51-02-PLAN.md — CSS design tokens for tooltip/popover/toast and overlay animation pattern

### Phase 52: Tooltip
**Goal**: Users can wrap any element with `<lui-tooltip>` to display accessible, well-positioned hint text on hover and keyboard focus
**Depends on**: Phase 51
**Requirements**: TIP-01, TIP-02, TIP-03, TIP-04, TIP-05, TIP-06, TIP-07, TIP-08, TIP-09, TIP-10, TIP-11, TIP-12, TIP-13, TIP-14, TIP-15, TIP-16, TIP-17
**Success Criteria** (what must be TRUE):
  1. Hovering over a trigger element shows a tooltip after a configurable delay, and the tooltip positions itself with collision avoidance and an arrow indicator
  2. Keyboard-focusing the trigger shows the tooltip, and pressing Escape dismisses it -- screen readers announce tooltip content via `aria-describedby`
  3. Moving between adjacent tooltips skips the show delay (delay group behavior), and touch devices do not trigger tooltips
  4. The tooltip component ships as `@lit-ui/tooltip` with CSS custom properties for theming, SSR safety, and proper listener cleanup via AbortController
  5. CLI registry entry exists with a copy-source template for the tooltip package
**Plans**: TBD

Plans:
- [ ] 52-01: TBD
- [ ] 52-02: TBD
- [ ] 52-03: TBD

### Phase 53: Popover
**Goal**: Users can create interactive overlay content that opens on click, manages focus correctly, and supports nesting -- serving as the foundation for menus, dropdowns, and custom overlays
**Depends on**: Phase 51
**Requirements**: POP-01, POP-02, POP-03, POP-04, POP-05, POP-06, POP-07, POP-08, POP-09, POP-10, POP-11, POP-12, POP-13, POP-14, POP-15, POP-16, POP-17, POP-18
**Success Criteria** (what must be TRUE):
  1. Clicking a trigger toggles the popover open/closed, with Escape and click-outside dismissing it -- focus moves to popover content on open and returns to trigger on close
  2. The popover positions itself with Floating UI collision avoidance, supports an optional arrow, repositions on scroll/resize, and renders in the top layer via native Popover API
  3. Nested popovers work correctly -- opening a child keeps the parent open, and closing a parent closes all children
  4. Both controlled (`open` property + `open-changed` event) and uncontrolled modes work, with an optional modal mode that traps focus
  5. The component ships as `@lit-ui/popover` with CSS custom properties, SSR safety, AbortController cleanup, and CLI registry entry
**Plans**: TBD

Plans:
- [ ] 53-01: TBD
- [ ] 53-02: TBD
- [ ] 53-03: TBD

### Phase 54: Toast
**Goal**: Developers can trigger toast notifications from any framework using a simple imperative API, with queuing, auto-dismiss, swipe gestures, and full accessibility
**Depends on**: Phase 51 (for CSS tokens and animation patterns; no Floating UI dependency)
**Requirements**: TOAST-01, TOAST-02, TOAST-03, TOAST-04, TOAST-05, TOAST-06, TOAST-07, TOAST-08, TOAST-09, TOAST-10, TOAST-11, TOAST-12, TOAST-13, TOAST-14, TOAST-15, TOAST-16, TOAST-17, TOAST-18, TOAST-19, TOAST-20
**Success Criteria** (what must be TRUE):
  1. Calling `toast.success('Saved')` from vanilla JS, React, Vue, or Svelte creates a toast notification that auto-dismisses after 5 seconds -- the `<lui-toaster>` container auto-creates if not already in the DOM
  2. Toasts stack with a configurable maximum visible count, queue excess toasts, support 6 position options, and render in the top layer above dialogs via `popover="manual"`
  3. Each toast supports variants (success/error/warning/info), title + description, an optional action button with callback, and a promise mode that transitions through loading/success/error states
  4. Toasts are accessible -- `role="status"` with `aria-live="polite"` for info toasts and `role="alert"` with `aria-live="assertive"` for errors -- and pause auto-dismiss on hover/focus
  5. Swipe-to-dismiss works via Pointer Events, enter/exit animations respect `prefers-reduced-motion`, and the component ships as `@lit-ui/toast` with CSS custom properties, SSR safety, and CLI registry entry
**Plans**: TBD

Plans:
- [ ] 54-01: TBD
- [ ] 54-02: TBD
- [ ] 54-03: TBD
- [ ] 54-04: TBD

### Phase 55: Documentation
**Goal**: All three overlay components have complete documentation pages with usage examples, API references, and accessibility notes, and the CLI registry is updated to 15 total components
**Depends on**: Phase 52, Phase 53, Phase 54
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):
  1. Toast, Tooltip, and Popover each have a documentation page on the docs site with interactive usage examples, full API reference (properties, events, CSS custom properties), and accessibility notes
  2. The CLI registry includes all 3 new components (15 total), and `npx lit-ui add tooltip`, `npx lit-ui add popover`, and `npx lit-ui add toast` work in both copy-source and npm modes
**Plans**: TBD

Plans:
- [ ] 55-01: TBD
- [ ] 55-02: TBD
- [ ] 55-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 51 -> 52 -> 53 -> 54 -> 55
(Phases 52 and 53 both depend on 51 but not each other; Phase 54 depends only on 51)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 51. Shared Infrastructure | v5.0 | 0/2 | Planned | - |
| 52. Tooltip | v5.0 | 0/TBD | Not started | - |
| 53. Popover | v5.0 | 0/TBD | Not started | - |
| 54. Toast | v5.0 | 0/TBD | Not started | - |
| 55. Documentation | v5.0 | 0/TBD | Not started | - |
