---
phase: 54-toast
plan: "02"
subsystem: cli
tags: [toast, cli, copy-source, templates, registry]
requires:
  - phase: 54-01
    provides: "@lit-ui/toast package with all source files"
  - phase: 53-02
    provides: "CLI registry and copy-source template pattern for popover"
provides:
  - CLI registry entry for toast component
  - 6 copy-source templates for standalone toast usage (no @lit-ui/core dependency)
  - COMPONENT_TEMPLATES map entries for all toast files
affects: [55]
tech-stack:
  added: []
  patterns:
    - "Namespaced template keys (toast/types, toast/icons, etc.) for multi-file components"
    - "Inline CSS fallback values in copy-source templates (no Tailwind dependency)"
key-files:
  created: []
  modified:
    - packages/cli/src/registry/registry.json
    - packages/cli/src/templates/index.ts
    - packages/cli/src/utils/copy-component.ts
key-decisions:
  - id: 54-02-namespaced-keys
    decision: "Toast template keys use componentName/fileStem pattern (toast/types, toast/icons, etc.) instead of bare fileStem to avoid collisions"
    rationale: "Bare stems like 'types' and 'icons' are too generic; namespaced keys prevent future multi-file component conflicts"
  - id: 54-02-inline-css-fallbacks
    decision: "Copy-source templates include CSS fallback values in var() declarations (e.g., var(--ui-toast-bg, #fff))"
    rationale: "Standalone templates have no Tailwind/token system; fallbacks ensure visual correctness without token setup"
  - id: 54-02-isServer-inline
    decision: "Toaster template uses inline `const isServer = typeof document === 'undefined'` instead of importing from lit"
    rationale: "Avoids dependency on lit's isServer export which may not be available in all lit versions"
duration: "2m 10s"
completed: "2026-02-02"
---

# Phase 54 Plan 02: CLI Registry & Copy-Source Templates Summary

**CLI registry entry and 6 standalone toast templates with LitElement, CSS fallback values, and namespaced COMPONENT_TEMPLATES keys**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~2m 10s |
| Tasks | 2/2 |
| Files modified | 3 |
| Templates created | 6 |

## Accomplishments

### Task 1: Add CLI registry entry and copy-source templates for toast
- Added toast entry to CLI registry with `lit` as only dependency (no floating-ui needed)
- Created 6 copy-source templates: TOAST_TYPES_TEMPLATE, TOAST_ICONS_TEMPLATE, TOAST_STATE_TEMPLATE, TOAST_API_TEMPLATE, TOAST_ELEMENT_TEMPLATE, TOAST_TOASTER_TEMPLATE
- Templates use LitElement directly instead of TailwindElement, with inline CSS fallback values
- Fixed copy-component.ts lookup to support `componentName/fileStem` namespaced keys
- All 6 templates registered in COMPONENT_TEMPLATES map

### Task 2: Verify full workspace build and integration
- Full workspace builds successfully (only pre-existing docs app TS errors)
- packages/toast/dist/index.js exists (21.23 kB)
- packages/cli/dist/index.js exists with updated registry and templates

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add CLI registry entry and copy-source templates | 319e4a1 | registry.json, templates/index.ts, copy-component.ts |
| 2 | Verify full workspace build | - | verification only, no file changes |

## Files Modified

| File | Purpose | Changes |
|------|---------|---------|
| packages/cli/src/registry/registry.json | Added toast component entry | +16 lines |
| packages/cli/src/templates/index.ts | Added 6 toast template constants + COMPONENT_TEMPLATES entries | +978 lines |
| packages/cli/src/utils/copy-component.ts | Fixed template lookup for namespaced keys | +2 lines |

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 54-02-namespaced-keys | Template keys use componentName/fileStem pattern | Bare stems too generic for multi-file components |
| 54-02-inline-css-fallbacks | Copy-source templates include CSS var() fallbacks | Standalone usage without token system needs visual defaults |
| 54-02-isServer-inline | Toaster uses inline isServer check | Avoids lit version compatibility concerns |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed copy-component template lookup for namespaced keys**
- **Found during:** Task 1
- **Issue:** The `copyComponentFiles` function only tried `fileStem` then `componentName` for template lookup, but toast needs namespaced keys (`toast/types`, `toast/icons`, etc.) to avoid collisions with generic filenames
- **Fix:** Added `componentName/fileStem` as second lookup attempt in the chain
- **Files modified:** packages/cli/src/utils/copy-component.ts
- **Commit:** 319e4a1
- **Note:** This also fixes the pre-existing `tooltip/delay-group` template key which previously could not be looked up correctly

## Issues Encountered

None.

## Next Phase Readiness

**Phase 54 (Toast) is complete: TOAST-20 delivered**
- @lit-ui/toast ships as npm package with CLI registry entry and copy-source templates
- All v5.0 overlay & feedback components (tooltip + popover + toast) now have full CLI support
- Ready for Phase 55 if applicable
