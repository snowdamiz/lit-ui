---
phase: 04-cli
plan: 05
subsystem: cli
tags: [cli, component-installation, file-copy, embedded-templates]

# Dependency graph
requires:
  - phase: 04-02
    provides: Utility layer (config, build tool detection, package manager)
  - phase: 04-03
    provides: Registry system with component metadata and dependency resolution
provides:
  - Add command for installing components to user projects
  - Component file copying with conflict handling
  - Embedded component templates (button, dialog)
affects: [04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Embedded templates for component source (MVP approach)"
    - "File conflict handling with overwrite/skip prompt"

key-files:
  created:
    - packages/cli/src/commands/add.ts
    - packages/cli/src/utils/copy-component.ts
    - packages/cli/src/templates/index.ts
  modified:
    - packages/cli/src/index.ts
    - packages/cli/tsup.config.ts

key-decisions:
  - "Embedded templates for MVP - component source as template strings"
  - "fsExtra default import pattern for ESM compatibility"
  - "Copy registry.json to dist via tsup onSuccess hook"

patterns-established:
  - "Add command flow: check init -> lookup registry -> resolve deps -> copy files"
  - "Template module exports getComponentTemplate for component source lookup"
  - "copyComponent handles directory creation and conflict prompts"

# Metrics
duration: 7.5min
completed: 2026-01-24
---

# Phase 4 Plan 5: Add Command Summary

**Component add command with embedded templates, dependency resolution, and file conflict handling**

## Performance

- **Duration:** 7.5 min
- **Started:** 2026-01-24T08:54:19Z
- **Completed:** 2026-01-24T09:01:51Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Add command copies component source to user's configured componentsPath
- Embedded templates for button and dialog components (MVP approach)
- File conflict handling with overwrite/skip prompts
- Proper error when lit-ui.json not found

## Task Commits

Each task was committed atomically:

1. **Task 1: Create copy-component utility** - `3b5c37c` (feat)
2. **Task 2: Create add command** - `7efb71a` (feat)
3. **Task 3: Wire add command and test** - `254e25f` (feat)

## Files Created/Modified
- `packages/cli/src/commands/add.ts` - Add command implementation with full workflow
- `packages/cli/src/utils/copy-component.ts` - File copy with conflict handling
- `packages/cli/src/templates/index.ts` - Embedded button and dialog component templates
- `packages/cli/src/index.ts` - Added add subcommand
- `packages/cli/tsup.config.ts` - Added registry.json copy to dist

## Decisions Made
- **Embedded templates for MVP:** Component source is embedded as template strings in CLI rather than reading from filesystem. This ensures the CLI works when published to npm without needing access to monorepo src/.
- **fsExtra default import:** Used default import pattern (`import fsExtra from 'fs-extra'`) for ESM compatibility, consistent with init command.
- **Registry copy via onSuccess:** Added tsup onSuccess hook to copy registry.json to dist/registry/ for createRequire runtime loading.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed fs-extra import for ESM**
- **Found during:** Task 3 (testing add command)
- **Issue:** Named imports from fs-extra failed at runtime in ESM
- **Fix:** Changed to default import pattern (`import fsExtra from 'fs-extra'`)
- **Files modified:** packages/cli/src/utils/copy-component.ts
- **Verification:** Build succeeds, add command works
- **Committed in:** 254e25f (Task 3 commit)

**2. [Rule 3 - Blocking] Fixed source file path resolution**
- **Found during:** Task 3 (testing add command)
- **Issue:** Original plan used filesystem reads from monorepo src/ which doesn't work when CLI is bundled
- **Fix:** Switched to embedded templates approach (Option C from plan), consistent with init command
- **Files modified:** packages/cli/src/utils/copy-component.ts, packages/cli/src/templates/index.ts
- **Verification:** add button and add dialog work correctly
- **Committed in:** 254e25f (Task 3 commit)

**3. [Rule 3 - Blocking] Fixed registry.json not bundled**
- **Found during:** Task 3 (testing add command)
- **Issue:** createRequire couldn't find registry.json at runtime (not copied to dist/)
- **Fix:** Added onSuccess hook in tsup.config.ts to copy registry.json to dist/registry/
- **Files modified:** packages/cli/tsup.config.ts
- **Verification:** Registry loads correctly, components found
- **Committed in:** 254e25f (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All fixes necessary for CLI to work when bundled. Embedded templates approach is more robust for npm publishing.

## Issues Encountered
- Original plan assumed filesystem access to monorepo src/ which doesn't work when CLI is bundled and published to npm. Switched to embedded templates approach which is more portable.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Add command complete and working
- Ready for 04-06 (list command or additional CLI features)
- Both button and dialog components can be added to user projects

---
*Phase: 04-cli*
*Completed: 2026-01-24*
