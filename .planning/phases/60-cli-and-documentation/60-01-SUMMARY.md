---
phase: 60
plan: 01
subsystem: cli
tags: [cli, templates, accordion, tabs, registry]
depends_on: []
provides:
  - Accordion CLI template with CSS variable fallbacks
  - AccordionItem CLI template with self-registration
  - Tabs CLI template with 24 CSS variable fallbacks
  - TabPanel CLI template with self-registration
  - Registry entries for accordion and tabs components
affects:
  - 60-02 (documentation may reference CLI installation)
tech-stack:
  added: []
  patterns:
    - CLI template string with escaped backticks and ${} expressions
    - Namespaced COMPONENT_TEMPLATES keys (accordion/accordion-item, tabs/tab-panel)
key-files:
  created:
    - packages/cli/src/templates/accordion.ts
    - packages/cli/src/templates/accordion-item.ts
    - packages/cli/src/templates/tabs.ts
    - packages/cli/src/templates/tab-panel.ts
  modified:
    - packages/cli/src/templates/index.ts
    - packages/cli/src/registry/registry.json
decisions:
  - "--ui-tabs-border not used in source tabs.ts; omitted from template (plan listed it but source does not reference it)"
  - "Simplified --ui-tabs-indicator-color fallback chain to #3b82f6 (removed intermediate var() nesting for standalone usage)"
metrics:
  duration: "5m"
  completed: "2026-02-03"
---

# Phase 60 Plan 01: Accordion & Tabs CLI Templates Summary

CLI copy-source templates and registry entries for accordion and tabs, enabling `npx lit-ui add accordion` and `npx lit-ui add tabs` with standalone CSS variable fallbacks.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create accordion and accordion-item CLI templates | 48e9243 | accordion.ts, accordion-item.ts |
| 2 | Create tabs and tab-panel CLI templates, update index and registry | f56da84 | tabs.ts, tab-panel.ts, index.ts, registry.json |

## What Was Done

### Task 1: Accordion Templates
- Created `ACCORDION_TEMPLATE` with CSS variable fallbacks for `--ui-accordion-border` (#e5e7eb), `--ui-accordion-border-width` (1px), `--ui-accordion-radius` (0.375rem)
- Created `ACCORDION_ITEM_TEMPLATE` with all existing inline fallbacks preserved
- Both templates import from `../../lib/lit-ui/tailwind-element` (no @lit-ui/core)
- Both inline `dispatchCustomEvent` function
- Both self-register via `customElements.define` with collision guards
- Import path changed from `./accordion-item.js` to `./accordion-item` (no .js extension)

### Task 2: Tabs Templates + Registry
- Created `TABS_TEMPLATE` with 24 CSS variable fallbacks for standalone usage
- Created `TAB_PANEL_TEMPLATE` with self-registration
- Updated `templates/index.ts` with exports, imports, and COMPONENT_TEMPLATES map entries
- Updated `registry.json` with accordion (2 files) and tabs (2 files) entries
- Template keys use namespaced format matching copy-component.ts resolution chain

## Deviations from Plan

### Minor Adjustments

**1. --ui-tabs-border omitted**
- **Reason:** Plan listed `--ui-tabs-border` as a CSS variable needing fallback, but the source `tabs.ts` does not reference this variable anywhere. No border CSS property uses it. Omitting is correct.

**2. Simplified indicator color fallback**
- **Reason:** Source has `var(--ui-tabs-indicator-color, var(--color-primary, var(--ui-color-primary)))` which chains through theme variables. For standalone CLI usage, simplified to `var(--ui-tabs-indicator-color, #3b82f6)` since the intermediate variables won't exist in standalone context.

## Verification Results

- TypeScript compilation: PASS (no errors)
- Registry JSON validation: PASS
- No @lit-ui/core imports in any template: PASS
- All 4 templates have customElements.define: PASS
- COMPONENT_TEMPLATES has all 4 entries (accordion, accordion/accordion-item, tabs, tabs/tab-panel): PASS
- CSS variable fallback verification: 24/24 tabs variables present with fallbacks, 3/3 accordion-specific variables present with fallbacks

## Next Phase Readiness

No blockers. Plan 60-02 can proceed independently.
