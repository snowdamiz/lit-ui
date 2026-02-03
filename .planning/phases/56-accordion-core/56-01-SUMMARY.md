---
phase: 56-accordion-core
plan: 01
subsystem: accordion
tags: [lit, web-components, accordion, css-grid-animation, parent-child-pattern]
requires: []
provides:
  - "@lit-ui/accordion package with Accordion and AccordionItem elements"
  - "CSS Grid height animation pattern (0fr/1fr three-layer)"
  - "Parent-child container pattern with slotchange discovery"
affects:
  - "56-02 (ARIA, keyboard nav, disabled states, CSS theming)"
tech-stack:
  added: []
  patterns:
    - "CSS Grid grid-template-rows 0fr/1fr for smooth height animation"
    - "Parent-managed state via internal events (ui-accordion-toggle)"
    - "SSR slotchange workaround in firstUpdated"
key-files:
  created:
    - packages/accordion/package.json
    - packages/accordion/tsconfig.json
    - packages/accordion/vite.config.ts
    - packages/accordion/src/vite-env.d.ts
    - packages/accordion/src/accordion.ts
    - packages/accordion/src/accordion-item.ts
    - packages/accordion/src/index.ts
    - packages/accordion/src/jsx.d.ts
  modified: []
key-decisions:
  - "Made getExpandedSet() private method instead of public getter to avoid api-extractor crash on Set<string> in DTS rollup"
patterns-established:
  - "CSS Grid three-layer animation: wrapper(0fr/1fr) > content(min-height:0, overflow:clip) > inner(padding)"
duration: "2m 45s"
completed: "2026-02-03"
---

# Phase 56 Plan 01: Package Scaffold and Core Elements Summary

Accordion package with CSS Grid animation, parent-child state management via slotchange discovery, and single/multi-expand modes.

## What Was Built

### AccordionItem (`lui-accordion-item`)
- Three-layer CSS Grid height animation: `.panel-wrapper` (grid-template-rows 0fr/1fr), `.panel-content` (min-height:0, overflow:clip), `.panel-inner` (padding)
- Header button with `aria-expanded` and `aria-controls` for accessibility
- Dispatches `ui-accordion-toggle` internal event on click (never self-toggles)
- CSS custom properties for full theming: `--ui-accordion-header-*`, `--ui-accordion-panel-*`, `--ui-accordion-ring`, `--ui-accordion-transition`
- `prefers-reduced-motion` support (transition-duration: 0ms)
- Properties: `value`, `expanded` (reflected), `disabled` (reflected), `heading-level`

### Accordion (`lui-accordion`)
- Parent container managing expand/collapse state for child items
- Single-expand mode (default): opening one panel auto-collapses others
- Multi-expand mode (`multiple` attribute): multiple panels open simultaneously
- Collapsible flag: controls whether last panel can close in single-expand mode
- Controlled (`value`) and uncontrolled (`default-value`) modes
- Child discovery via `slotchange` with SSR hydration workaround in `firstUpdated`
- Dispatches `ui-change` event with `value` and `expandedItems` array
- Disabled propagation to all child items

### Package Infrastructure
- Package scaffold matching existing packages (radio, checkbox, etc.)
- Custom element registration with collision detection
- JSX type declarations for React, Vue, and Svelte
- Builds successfully with vite + vite-plugin-dts

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Private `getExpandedSet()` instead of public `expandedItems` getter | api-extractor crashes on `Set<string>` return type in DTS rollup; private methods are excluded from bundled declarations |
| tabindex="-1" on header buttons by default | Plan 02 will implement roving tabindex; items are still clickable |
| No ARIA disabled attribute on items yet | Plan 02 handles full ARIA attribute management |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] api-extractor crash on Set<string> in public API**
- **Found during:** Task 2 build verification
- **Issue:** `get expandedItems(): Set<string>` caused api-extractor internal error "Unable to follow symbol for Set"
- **Fix:** Changed to `private getExpandedSet(): Set<string>` method, keeping Set internal. Public event still includes `expandedItems` array.
- **Files modified:** `packages/accordion/src/accordion.ts`
- **Commit:** 3d1368f

## Commits

| Hash | Type | Description |
|------|------|-------------|
| d8bd5e4 | feat | Package scaffold and accordion-item element |
| 3d1368f | feat | Accordion container and index/JSX registration |

## Next Phase Readiness

Plan 02 can proceed immediately. The following are ready for layering:
- Header buttons have `tabindex="-1"` ready for roving tabindex
- CSS custom properties established for theming
- Parent-child communication pattern established via internal events
- `disabled` property exists on both elements for Plan 02 ARIA integration
