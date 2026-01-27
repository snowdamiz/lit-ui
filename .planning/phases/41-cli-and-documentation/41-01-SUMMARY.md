# Phase 41 Plan 01: CLI Registry and Templates for Form Controls Summary

CLI registry entries, NPM mappings, list categories, and copy-source templates for checkbox, radio, and switch components.

## Completed Tasks

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Add registry entries and NPM mappings | `6c3c4fc` | registry.json, install-component.ts, list.ts |
| 2 | Add copy-source templates | `72d609d` | templates/index.ts, copy-component.ts |

## What Was Built

- **Registry**: 8 components total (button, dialog, input, textarea, select, checkbox, radio, switch)
- **NPM mappings**: checkbox -> @lit-ui/checkbox, radio -> @lit-ui/radio, switch -> @lit-ui/switch
- **List categories**: Form category now has 6 controls (input, textarea, select, checkbox, radio, switch)
- **Templates**: 5 new template constants (SWITCH_TEMPLATE, CHECKBOX_TEMPLATE, CHECKBOX_GROUP_TEMPLATE, RADIO_TEMPLATE, RADIO_GROUP_TEMPLATE)
- **Multi-file support**: Fixed copyComponentFiles to look up templates per-file by file stem, not just by component name

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed multi-file template resolution in copyComponentFiles**
- **Found during:** Task 2
- **Issue:** copyComponentFiles used a single template per component name, writing the same content for all files. Multi-file components (checkbox with checkbox-group, radio with radio-group) need different templates per file.
- **Fix:** Changed copy-component.ts to look up templates by file stem (e.g., "checkbox-group" from path "components/checkbox/checkbox-group.ts"), falling back to component name for single-file components. Added `parse` import from `pathe`.
- **Files modified:** packages/cli/src/utils/copy-component.ts
- **Commit:** `72d609d`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Inline dispatchCustomEvent in templates | Copy-source base (tailwind-element) does not export dispatchCustomEvent; inlining avoids import error |
| Use single-escape pattern (\`) for template backticks | Matches BUTTON_TEMPLATE/DIALOG_TEMPLATE pattern which produces correct TypeScript output |
| Template lookup by file stem | Enables per-file template resolution for multi-file components (checkbox+group, radio+group) |

## Verification

- [x] registry.json has 8 components
- [x] install-component.ts has checkbox, radio, switch in componentToPackage
- [x] list.ts Form category has all 6 form components
- [x] templates/index.ts has 5 new template constants in COMPONENT_TEMPLATES
- [x] All templates use local import paths (../../lib/lit-ui/tailwind-element)
- [x] TypeScript compiles: `pnpm --filter @lit-ui/cli exec tsc --noEmit` passes

## Duration

~7 minutes
