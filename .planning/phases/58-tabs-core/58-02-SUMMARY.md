---
phase: 58-tabs-core
plan: 02
subsystem: tabs
tags: [keyboard-navigation, aria, css-custom-properties, dark-mode, accessibility]
dependency-graph:
  requires: ["58-01"]
  provides: ["tabs-keyboard-nav", "tabs-theming", "tabs-aria-complete"]
  affects: ["59-tabs-docs"]
tech-stack:
  added: []
  patterns: ["roving-tabindex", "orientation-aware-keys", "automatic-manual-activation"]
key-files:
  created: []
  modified:
    - packages/tabs/src/tabs.ts
    - packages/tabs/src/tab-panel.ts
    - packages/core/src/styles/tailwind.css
decisions:
  - _focusedValue tracks keyboard focus separately from active value for manual mode
  - Container sets role=tabpanel on panel hosts (moved from tab-panel connectedCallback)
  - orientation reflects to host attribute for CSS :host([orientation]) selectors
metrics:
  duration: 2m 13s
  completed: 2026-02-03
---

# Phase 58 Plan 02: Keyboard Nav, ARIA, and Theming Summary

Full keyboard navigation with dual activation modes, complete ARIA attributes, and CSS custom property theming with dark mode for the tabs component.

## Tasks Completed

### Task 1: Keyboard navigation, activation modes, orientation, ARIA, and disabled tabs
**Commit:** a2add14

- Added `handleKeyDown` with orientation-aware arrow keys (Left/Right for horizontal, Up/Down for vertical)
- Home/End keys jump to first/last enabled tab with wrapping navigation
- Automatic mode: arrow keys move focus AND activate tab, dispatching ui-change
- Manual mode: arrow keys move focus only; Enter/Space activates focused tab
- `_focusedValue` field tracks keyboard focus independently from `value` (active tab)
- `getTabIndex()` method implements roving tabindex based on activation mode
- `focusTabButton()` queries shadow DOM for tab button by panel value
- Disabled tabs filtered from `enabledPanels` array, skipped in keyboard navigation
- Container now sets `role="tabpanel"`, `tabindex="0"` (active) on panel hosts
- Removed `role="tabpanel"` from tab-panel connectedCallback (container handles all ARIA)
- tab-panel sets `data-state="active"|"inactive"` via setAttribute with isServer guard
- `orientation` property reflects to host for CSS selector usage

### Task 2: CSS custom properties and dark mode theming
**Commit:** 94f9fcc

- Added 20 `--ui-tabs-*` tokens in `:root` block covering layout, list, button, active, panel, focus, transition
- Added 6 dark mode overrides in `.dark` block for list bg, tab text, hover, active, panel text
- Tabs styles fully consume CSS custom properties (23 references in tabs.ts)
- Vertical orientation: tablist uses flex-direction column, wrapper uses flex layout with gap
- Active tab has distinct visual: background, text color, and box-shadow
- Disabled tabs: cursor not-allowed, 0.5 opacity, hover blocked via :not([aria-disabled])
- Focus-visible: ring via `--ui-tabs-ring` with combined shadow for active+focused state
- `prefers-reduced-motion`: transition-duration set to 0ms

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `_focusedValue` as plain field, not @state() | Only needs re-render in manual mode, handled explicitly via requestUpdate |
| Container sets role=tabpanel on panel hosts | Centralizes all ARIA management in container for consistency |
| orientation reflects to host attribute | Enables CSS :host([orientation="vertical"]) selectors without JS |

## Next Phase Readiness

Phase 58 (Tabs Core) is now complete. The tabs component has:
- Full keyboard navigation with wrapping, Home/End
- Dual activation modes (automatic/manual)
- Horizontal/vertical orientation
- Complete ARIA: roles, states, labelledby, controls, selected, disabled
- CSS custom property theming with dark mode
- Reduced motion support
- Disabled tab handling at both container and individual level

Ready for Phase 59 (Tabs Documentation/Stories) if applicable.
