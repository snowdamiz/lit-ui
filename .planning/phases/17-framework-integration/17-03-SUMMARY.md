---
phase: 17-framework-integration
plan: 03
subsystem: examples
tags: [astro, ssr, declarative-shadow-dom, lit, semantic-ui-astro-lit]

dependency-graph:
  requires:
    - phase: "16-ssr-package"
      provides: "@lit-ui/ssr package with hydration support"
  provides:
    - "Astro SSR example with @lit-ui components"
    - "Pattern for Astro 5+ Lit SSR integration"
    - "Documentation of hydration import order in Astro"
  affects:
    - "Documentation phases (SSR guides)"
    - "Landing/docs site examples"

tech-stack:
  added:
    - "@semantic-ui/astro-lit ^5.1.1"
    - "astro ^5.0.0"
  patterns:
    - "Astro frontmatter imports for SSR registration"
    - "Script tag hydration with @lit-ui/ssr/hydration first"
    - "Self-registering custom elements (no client:* directives)"

key-files:
  created:
    - examples/astro/package.json
    - examples/astro/tsconfig.json
    - examples/astro/astro.config.mjs
    - examples/astro/src/layouts/Layout.astro
    - examples/astro/src/pages/index.astro
    - examples/astro/README.md
  modified:
    - pnpm-workspace.yaml

key-decisions:
  - "Use @semantic-ui/astro-lit instead of deprecated @astrojs/lit"
  - "Self-registering custom elements don't use client:* directives"
  - "Hydration import goes in script tag, not separate entry file"

patterns-established:
  - "Astro SSR: import in frontmatter for SSR, import in script for hydration"
  - "Custom elements used directly as HTML tags, not wrapped components"

metrics:
  duration: 10 min
  completed: 2026-01-25
---

# Phase 17 Plan 03: Astro SSR Example Summary

**Astro 5+ SSR example demonstrating @lit-ui components with @semantic-ui/astro-lit integration and proper hydration import order**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-25T06:14:41Z
- **Completed:** 2026-01-25T06:24:19Z
- **Tasks:** 3
- **Files created:** 6

## Accomplishments

- Created examples/astro with Astro 5+ and @semantic-ui/astro-lit integration
- Demonstrated SSR of Button and Dialog components with Declarative Shadow DOM
- Documented the correct pattern for self-registering custom elements in Astro
- Verified SSR works - curl shows lui-button, lui-dialog, shadowrootmode in response

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Astro project with Lit integration** - `8e23f65` (feat)
2. **Task 2: Create Astro pages with Lit components** - `b2972da` (feat)
3. **Task 3: Create README and verify example runs** - `8de692e` (feat)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `examples/astro/package.json` - Package config with @semantic-ui/astro-lit
- `examples/astro/tsconfig.json` - TypeScript config extending astro/tsconfigs/strict
- `examples/astro/astro.config.mjs` - Astro config with lit() integration, output: 'server'
- `examples/astro/src/layouts/Layout.astro` - Base HTML layout with slot
- `examples/astro/src/pages/index.astro` - Demo page with Button/Dialog SSR
- `examples/astro/README.md` - Quick start and SSR pattern documentation
- `pnpm-workspace.yaml` - Added examples/* to workspace packages

## Decisions Made

### 17-03-01: Use @semantic-ui/astro-lit
- **Choice:** Use `@semantic-ui/astro-lit ^5.1.1` instead of `@astrojs/lit`
- **Rationale:** Official @astrojs/lit was deprecated in Astro 5.0. The community package is actively maintained.

### 17-03-02: Self-registering custom elements pattern
- **Choice:** Use custom elements directly without client:* directives
- **Rationale:** Astro's client:* directives (client:visible, client:load) are for framework components exported as classes. Self-registering custom elements like @lit-ui components don't use these - they're imported in frontmatter for SSR and in script tags for hydration.

### 17-03-03: Hydration import in script tag
- **Choice:** Place `import '@lit-ui/ssr/hydration'` as first import in page script tag
- **Rationale:** Unlike Node.js/Next.js where hydration import goes in a single entry file, Astro bundles scripts per-page. The hydration support must be imported before any component code in each page's script.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @semantic-ui/astro-lit version**
- **Found during:** Task 3 (verification)
- **Issue:** Plan specified version ^0.0.2 which doesn't exist (latest is 5.1.1)
- **Fix:** Updated to ^5.1.1
- **Files modified:** examples/astro/package.json
- **Verification:** pnpm install succeeds
- **Committed in:** 8de692e (Task 3 commit)

**2. [Rule 3 - Blocking] Fixed @lit-labs/nextjs version (from 17-02)**
- **Found during:** Task 3 (verification - pnpm install)
- **Issue:** nextjs example had ^0.3.0 which doesn't exist (latest is 0.2.4)
- **Fix:** Updated to ^0.2.4
- **Files modified:** examples/nextjs/package.json
- **Verification:** pnpm install succeeds
- **Committed in:** 8de692e (Task 3 commit)

**3. [Rule 1 - Bug] Removed client:visible from custom elements**
- **Found during:** Task 3 (verification)
- **Issue:** client:visible directive doesn't work with self-registering custom elements - they're not framework components
- **Fix:** Removed client:visible attributes, updated documentation to show correct pattern
- **Files modified:** examples/astro/src/pages/index.astro
- **Verification:** SSR still works (verified via curl)
- **Committed in:** 8de692e (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All fixes necessary for correctness. Pattern documentation updated to reflect actual Astro behavior with custom elements.

## Issues Encountered

- **pnpm workspace caching:** pnpm reported "Already up to date" even when node_modules was missing. Required deleting node_modules entirely and reinstalling to fix symlinks.
- **Port conflicts:** Astro dev server fell back to ports 4322/4323 when 4321 was in use from previous runs.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

### Astro Example Complete
- SSR works with @semantic-ui/astro-lit integration
- Components render with Declarative Shadow DOM
- Hydration pattern documented in README

### Pattern Summary
```astro
---
import '@lit-ui/button';  // SSR registration
---
<lui-button>Click</lui-button>

<script>
  import '@lit-ui/ssr/hydration';  // MUST be first
  import '@lit-ui/button';  // Client hydration
</script>
```

### Blockers
None.

---
*Phase: 17-framework-integration*
*Completed: 2026-01-25*
