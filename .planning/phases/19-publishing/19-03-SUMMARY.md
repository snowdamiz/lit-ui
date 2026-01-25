---
phase: 19-publishing
plan: 03
subsystem: infra
tags: [github-actions, changesets, npm, ci-cd, automation]

# Dependency graph
requires:
  - phase: 13-monorepo-infrastructure
    provides: changesets configuration, fixed versioning, ci:publish script
  - phase: 19-01
    provides: npm publishing metadata in package.json files
  - phase: 19-02
    provides: package READMEs
provides:
  - GitHub Actions release workflow
  - Automated version PR creation via changesets/action
  - npm publishing on merge to main
  - GitHub Releases with changelog
affects: [19-04-final-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "changesets/action@v1 for release automation"
    - "fetch-depth: 0 for full git history"
    - "NPM_TOKEN secret for registry authentication"

key-files:
  created:
    - ".github/workflows/release.yml"
  modified:
    - "examples/astro/astro.config.mjs"

key-decisions:
  - "Use static output for Astro example to enable CI builds without adapter"
  - "Standard NPM_TOKEN approach (not OIDC trusted publishing)"

patterns-established:
  - "GitHub Actions workflow with pnpm/action-setup@v4 and actions/setup-node@v4"
  - "changesets/action with createGithubReleases: true"

# Metrics
duration: 2min
completed: 2026-01-25
---

# Phase 19 Plan 03: CI/CD Pipeline Summary

**GitHub Actions release workflow with changesets/action for automated version PRs and npm publishing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-25T07:45:20Z
- **Completed:** 2026-01-25T07:46:54Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `.github/workflows/release.yml` with changesets/action integration
- Workflow triggers on push to main, creates version PRs when changesets exist
- Merging version PR publishes all packages to npm with --access public
- GitHub Releases created automatically with changelog
- All packages build successfully in CI-compatible environment

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GitHub Actions release workflow** - `f53b00f` (feat)
2. **Task 2: Verify full build and changeset configuration** - `9743f6d` (fix)

## Files Created/Modified

- `.github/workflows/release.yml` - GitHub Actions workflow for automated npm publishing
- `examples/astro/astro.config.mjs` - Changed to static output for CI build compatibility

## Decisions Made

- **Static output for Astro example:** Changed from 'server' to 'static' to enable builds without requiring a deployment adapter. Production deployments can set 'server' with appropriate adapter.
- **Traditional NPM_TOKEN:** Used NPM_TOKEN secret approach instead of newer OIDC trusted publishing for simpler initial setup.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Astro example build failure**

- **Found during:** Task 2 (Build verification)
- **Issue:** `pnpm build` failed because Astro example had `output: 'server'` which requires an adapter
- **Fix:** Changed to `output: 'static'` with comment explaining the reason
- **Files modified:** examples/astro/astro.config.mjs
- **Verification:** `pnpm build` completes successfully
- **Committed in:** 9743f6d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to enable CI builds. Example apps are not published to npm; this only affects local/CI builds.

## Issues Encountered

None beyond the auto-fixed deviation.

## User Setup Required

**NPM_TOKEN secret must be configured before first publish:**

1. Create npm access token at npmjs.com (Profile > Access Tokens > Automation)
2. Add to GitHub repository secrets as `NPM_TOKEN`
3. Create `lit-ui` npm organization if user's username is not `lit-ui`

This is handled in Plan 19-04 (final verification).

## Next Phase Readiness

- Release workflow ready for activation
- All packages build successfully
- Ready for Plan 19-04: Final verification with NPM_TOKEN setup

---

*Phase: 19-publishing*
*Completed: 2026-01-25*
