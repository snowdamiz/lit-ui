---
phase: 17-framework-integration
plan: 01
subsystem: examples
tags: [ssr, express, node, hydration, declarative-shadow-dom]

requires:
  - phase: 16-ssr-package
    provides: renderToString, html, hydration exports

provides:
  - Working Express SSR example at examples/node
  - Reference implementation for custom Node.js SSR setups
  - Demonstration of hydration import order requirement

affects:
  - 17-02 (Next.js example) - similar patterns
  - 17-03 (Astro example) - similar patterns

tech-stack:
  added:
    - express ^5.2.0
    - tsx (dev server)
  patterns:
    - Server imports components then renderToString
    - Client imports @lit-ui/ssr/hydration FIRST
    - Components register on both server and client

key-files:
  created:
    - examples/node/package.json
    - examples/node/tsconfig.json
    - examples/node/src/server.ts
    - examples/node/src/client.ts
    - examples/node/vite.config.ts
    - examples/node/README.md
    - examples/node/public/client.js
  modified:
    - packages/core/src/tailwind-element.ts
    - packages/core/src/index.ts
    - packages/button/src/button.ts
    - packages/button/src/index.ts
    - packages/dialog/src/dialog.ts
    - packages/dialog/src/index.ts

key-decisions:
  - "Components register on both server and client (removed isServer guard)"
  - "TailwindElement exports tailwindBaseStyles for subclass style composition"

duration: 6 min
completed: 2026-01-25
---

# Phase 17 Plan 01: Node.js/Express SSR Example Summary

**Express server with @lit-ui component SSR using Declarative Shadow DOM, client hydration via @lit-ui/ssr/hydration**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-25T06:14:42Z
- **Completed:** 2026-01-25T06:21:16Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments

- Created working Express SSR example at examples/node
- Server renders Button and Dialog with Declarative Shadow DOM templates
- Client hydrates with proper import order (@lit-ui/ssr/hydration first)
- Fixed SSR bug in TailwindElement and component registration
- Documented hydration import order requirement in README

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Express project structure** - `5974d67` (feat)
2. **Task 2: Create SSR server and client entry** - `caf5e2a` (feat)
3. **Bug fix: Enable SSR for components** - `4518623` (fix)
4. **Task 3: Create README and verify example runs** - `9303ff0` (feat)
5. **Lockfile update** - `3c313c8` (chore)

## Files Created/Modified

### Created
- `examples/node/package.json` - Express project with workspace links
- `examples/node/tsconfig.json` - TypeScript config
- `examples/node/src/server.ts` - Express server with SSR route
- `examples/node/src/client.ts` - Client hydration entry
- `examples/node/vite.config.ts` - Client bundle build config
- `examples/node/README.md` - Quick start and hydration docs
- `examples/node/public/client.js` - Built client bundle

### Modified (Bug Fixes)
- `packages/core/src/tailwind-element.ts` - Changed styles to property, exported tailwindBaseStyles
- `packages/core/src/index.ts` - Export tailwindBaseStyles
- `packages/button/src/button.ts` - Use tailwindBaseStyles in styles array
- `packages/button/src/index.ts` - Remove isServer guard from registration
- `packages/dialog/src/dialog.ts` - Use tailwindBaseStyles in styles array
- `packages/dialog/src/index.ts` - Remove isServer guard from registration

## Decisions Made

### Component Registration for SSR
- **Choice:** Remove `!isServer` guard from `customElements.define()` calls
- **Rationale:** @lit-labs/ssr provides `customElements` via ssr-dom-shim; components must register on server for SSR to render them

### TailwindElement Styles Pattern
- **Choice:** Export `tailwindBaseStyles` array for subclass composition
- **Rationale:** Original getter-only `styles` prevented subclasses from extending with `static override styles = [...]`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TailwindElement getter-only styles blocked subclass override**
- **Found during:** Task 2 (server start threw error)
- **Issue:** `TailwindElement` had `static get styles()` which is read-only; subclasses using `static override styles = css\`...\`` failed with "cannot set property which has only a getter"
- **Fix:** Changed to `static override styles = tailwindBaseStyles` property and exported `tailwindBaseStyles` for subclass composition
- **Files modified:** packages/core/src/tailwind-element.ts, packages/core/src/index.ts, packages/button/src/button.ts, packages/dialog/src/dialog.ts
- **Verification:** Build succeeds, SSR renders components
- **Committed in:** 4518623 (part of fix commit)

**2. [Rule 1 - Bug] Component registration guarded with isServer prevented SSR**
- **Found during:** Task 3 (SSR output had no shadow DOM)
- **Issue:** Components had `if (!isServer && typeof customElements !== 'undefined')` which prevented server-side registration; @lit-labs/ssr needs elements registered to render them
- **Fix:** Changed to `if (typeof customElements !== 'undefined')` - server has customElements via @lit-labs/ssr-dom-shim
- **Files modified:** packages/button/src/index.ts, packages/dialog/src/index.ts
- **Verification:** SSR output contains `<template shadowrootmode="open">`
- **Committed in:** 4518623 (part of fix commit)

---

**Total deviations:** 2 auto-fixed bugs
**Impact on plan:** Bugs blocked SSR functionality; fixes were required for correct operation

## Issues Encountered

None beyond the auto-fixed bugs documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

### For 17-02: Next.js Example
- TailwindElement and component fixes apply to all framework examples
- Same hydration import order pattern applies

### For 17-03: Astro Example
- Same fixes benefit Astro SSR

### Blockers
None.

### Notes
The bug fixes discovered during this plan (SSR registration, styles inheritance) are fundamental SSR requirements that would have affected all framework examples. Good that they were caught and fixed here.

---
*Phase: 17-framework-integration*
*Completed: 2026-01-25*
