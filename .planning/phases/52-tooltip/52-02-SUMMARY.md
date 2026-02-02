---
phase: 52-tooltip
plan: 02
subsystem: ui
tags: [tooltip, cli, copy-source, floating-ui, registry]

# Dependency graph
requires:
  - phase: 52-01
    provides: "Tooltip component package with Floating UI positioning, delay groups, and arrow indicators"
  - phase: 51-01
    provides: "Floating UI wrapper in @lit-ui/core/floating"
provides:
  - "CLI registry entry for tooltip component"
  - "Copy-source templates (tooltip + delay-group) for npx lit-ui add tooltip"
  - "Verified workspace build with tooltip package integrated"
affects: [53-popover, 54-toast]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline Floating UI shadow DOM platform in copy-source templates (no @lit-ui/core/floating dependency)"

key-files:
  created: []
  modified:
    - "packages/cli/src/registry/registry.json"
    - "packages/cli/src/templates/index.ts"

key-decisions:
  - "Copy-source template inlines shadowDomPlatform from @lit-ui/core/floating rather than importing it"
  - "Template uses composed-offset-position as direct dependency for Shadow DOM offsetParent fix"

patterns-established:
  - "Floating UI copy-source pattern: inline platform config + direct @floating-ui/dom imports + composed-offset-position"

# Metrics
duration: 5min
completed: 2026-02-02
---

# Phase 52 Plan 02: CLI Registry and Copy-Source Templates Summary

**CLI registry entry and copy-source templates for tooltip with inline Floating UI shadow DOM platform**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-02T18:58:58Z
- **Completed:** 2026-02-02T19:04:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added tooltip component entry to CLI registry with delay-group file and @floating-ui/dom + composed-offset-position dependencies
- Created TOOLTIP_DELAY_GROUP_TEMPLATE as standalone module-level singleton (no external imports)
- Created TOOLTIP_TEMPLATE with inline shadow DOM-safe Floating UI platform, @customElement decorator, and local delay-group import
- Verified full workspace build passes (all packages except pre-existing docs app TS errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CLI registry entry and copy-source template for tooltip** - `26e43bd` (feat)
2. **Task 2: Verify full workspace build and integration** - verification only, no code changes

## Files Created/Modified
- `packages/cli/src/registry/registry.json` - Added tooltip component entry with files and dependencies
- `packages/cli/src/templates/index.ts` - Added TOOLTIP_DELAY_GROUP_TEMPLATE, TOOLTIP_TEMPLATE, and COMPONENT_TEMPLATES map entries

## Decisions Made
- Inlined the shadowDomPlatform configuration from @lit-ui/core/floating directly into the copy-source template, since copy-source mode cannot depend on @lit-ui/core
- Used composed-offset-position as a direct dependency in the registry entry (required for Shadow DOM positioning fix)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed template string escaping in tooltip template**
- **Found during:** Task 1
- **Issue:** Initial template used triple-backslash escaping (`\\\``) for backticks and template interpolations instead of single-backslash (`\``) matching existing template patterns
- **Fix:** Corrected all backtick and `${` escaping to match the established pattern used by button, dialog, and other templates
- **Files modified:** packages/cli/src/templates/index.ts
- **Verification:** CLI package builds successfully with tsup
- **Committed in:** 26e43bd (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Escaping fix was necessary for template correctness. No scope creep.

## Issues Encountered
- Docs app (apps/docs) has pre-existing TypeScript errors for @lit-ui/date-picker, @lit-ui/date-range-picker, and @lit-ui/time-picker module declarations. These are unrelated to tooltip work and exist on the base branch.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TIP-17 (CLI registry with copy-source template and npm package) is complete
- Tooltip component is fully installable via both `npx lit-ui add tooltip` and `npm install @lit-ui/tooltip`
- Phase 52 (Tooltip) is complete -- all plans executed
- Ready for Phase 53 (Popover) which can build on the Floating UI patterns established here

---
*Phase: 52-tooltip*
*Completed: 2026-02-02*
