---
phase: 59
plan: 01
subsystem: tabs
tags: [indicator, animation, lazy-rendering, accessibility, css-custom-properties]
depends_on:
  requires: [58]
  provides: [animated-indicator, data-state-attributes, lazy-panels, conditional-tabindex]
  affects: [59-02, 60]
tech-stack:
  added: []
  patterns: [ResizeObserver, styleMap-directive, _hasBeenExpanded-lazy-pattern, conditional-tabindex-W3C-APG]
key-files:
  created: []
  modified:
    - packages/tabs/src/tabs.ts
    - packages/tabs/src/tab-panel.ts
    - packages/tabs/src/jsx.d.ts
    - packages/core/src/styles/tailwind.css
decisions:
  - Indicator uses CSS transitions on transform/width/height (no JS animation loop)
  - Indicator starts opacity:0 until first getBoundingClientRect measurement
  - _hasBeenExpanded as plain field not @state() (avoids redundant re-render, same as accordion)
  - Lazy panels return `nothing` (not empty html``) for zero DOM footprint
  - Active panels without focusable children get tabindex="0" per W3C APG
  - Lazy panel tabindex uses requestAnimationFrame deferred re-check for slot timing
metrics:
  duration: 2m 18s
  completed: 2026-02-03
---

# Phase 59 Plan 01: Animated Indicator, Lazy Panels, and Conditional Tabindex Summary

Sliding tab indicator via CSS transitions on transform/width with ResizeObserver repositioning, data-state attributes on buttons, lazy panel rendering with _hasBeenExpanded pattern, and W3C APG conditional tabindex on active panels.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Animated active indicator with ResizeObserver and data-state | 178a7e5 | styleMap indicator, updateIndicator(), ResizeObserver, data-state on buttons, --ui-tabs-indicator-* tokens |
| 2 | Lazy panel rendering and conditional panel tabindex | 387cea6 | lazy property, _hasBeenExpanded, panelHasFocusableContent(), conditional tabindex, JSX types |

## Decisions Made

1. **Indicator animation via CSS transitions** - transform/width/height transitions with 200ms ease, no JS requestAnimationFrame loop. ResizeObserver handles repositioning on container resize.
2. **Indicator opacity guard** - Starts at opacity:0 until first getBoundingClientRect measurement completes, preventing position flash on initial render.
3. **_hasBeenExpanded as plain field** - Consistent with accordion pattern; avoids redundant re-render since the active property change already triggers update.
4. **Lazy panels return `nothing`** - Using lit `nothing` sentinel instead of `html``` for zero DOM footprint when panel has never been activated.
5. **Conditional tabindex per W3C APG** - Active panels with focusable children (links, buttons, inputs) do NOT get tabindex="0" since keyboard users can already tab into content. Only panels without focusable children get tabindex="0" for keyboard accessibility.
6. **Deferred tabindex re-check for lazy panels** - When a lazy panel activates for the first time, slot content may not be in DOM yet during syncPanelStates. A requestAnimationFrame deferred check handles this timing gap.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `pnpm --filter @lit-ui/tabs build` succeeds with zero errors
- tabs.ts contains: tab-indicator class, styleMap usage, updateIndicator method, ResizeObserver, data-state attribute, panelHasFocusableContent, conditional tabindex
- tab-panel.ts contains: lazy property, _hasBeenExpanded field, conditional render with nothing
- tailwind.css contains: --ui-tabs-indicator-color, --ui-tabs-indicator-height, --ui-tabs-indicator-radius, --ui-tabs-indicator-transition in :root and .dark
- jsx.d.ts contains: lazy in LuiTabPanelAttributes

## Next Phase Readiness

Plan 59-02 (package configuration, exports, CLI registry) can proceed. All source code changes for tabs polish are complete.
