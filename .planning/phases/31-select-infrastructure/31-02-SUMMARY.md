---
phase: 31-select-infrastructure
plan: 02
subsystem: ui
tags: [lit, web-components, select, floating-ui, package]

# Dependency graph
requires:
  - phase: 31-01
    provides: CSS tokens (--ui-select-*) for styling
provides:
  - @lit-ui/select package with Floating UI dependency
  - Skeleton Select component with trigger rendering
  - lui-select custom element registration
  - Framework type declarations (React/Vue/Svelte)
affects: [32-select-core, 33-select-features]

# Tech tracking
tech-stack:
  added:
    - "@floating-ui/dom@^1.7.4"
  patterns:
    - TailwindElement base class extension
    - ElementInternals for form participation (client-only with isServer guard)
    - Safe custom element registration with collision detection

key-files:
  created:
    - packages/select/package.json
    - packages/select/tsconfig.json
    - packages/select/vite.config.ts
    - packages/select/src/vite-env.d.ts
    - packages/select/src/select.ts
    - packages/select/src/index.ts
    - packages/select/src/jsx.d.ts
  modified:
    - pnpm-lock.yaml

key-decisions:
  - "Floating UI in dependencies (not peerDeps) - bundled for zero-config consumer experience"
  - "Skeleton component validates CSS tokens and Floating UI before full implementation in Phase 32"
  - "positionDropdown method prepared but not called yet - Phase 32 will integrate"

patterns-established:
  - "Select extends TailwindElement with formAssociated = true"
  - "ElementInternals guarded with isServer check for SSR compatibility"
  - "Trigger-based select pattern with combobox ARIA role"

# Metrics
duration: 4min
completed: 2026-01-26
---

# Phase 31 Plan 02: Select Package Scaffolding Summary

**@lit-ui/select package with skeleton component, Floating UI integration, and build pipeline validation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-26T22:30:00Z
- **Completed:** 2026-01-26T22:34:00Z
- **Tasks:** 3
- **Files created:** 7

## Accomplishments

- Created @lit-ui/select package following @lit-ui/input pattern
- Added @floating-ui/dom as bundled dependency (not externalized)
- Built skeleton Select component with trigger rendering and CSS token usage
- Validated build pipeline produces dist/index.js (28KB) and dist/index.d.ts
- Prepared positionDropdown method for Phase 32 integration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create package structure and configuration files** - `24517c7` (feat)
2. **Task 2: Create skeleton Select component with Floating UI** - `70ab3d4` (feat)
3. **Task 3: Install dependencies and build package** - `9fa5955` (chore)

## Files Created

- `packages/select/package.json` - Package configuration with @floating-ui/dom dependency
- `packages/select/tsconfig.json` - TypeScript config extending workspace library
- `packages/select/vite.config.ts` - Vite build config using shared library preset
- `packages/select/src/vite-env.d.ts` - Vite client type references
- `packages/select/src/select.ts` - Skeleton Select component class
- `packages/select/src/index.ts` - Package entry point with element registration
- `packages/select/src/jsx.d.ts` - React/Vue/Svelte type declarations

## Component Features (Skeleton)

The skeleton Select component includes:

- **Properties:** size, placeholder, name, value, disabled, required
- **Trigger rendering:** Combobox role with placeholder and chevron icon
- **Size variants:** sm, md, lg with CSS token styling
- **Disabled state:** Visual and interactive disabled support
- **CSS tokens:** 18 var(--ui-select-*) references
- **Floating UI:** Import validated, positionDropdown method prepared
- **SSR support:** isServer guard for attachInternals()

## Decisions Made

- Floating UI bundled (not externalized) for zero-config consumer experience
- Skeleton validates infrastructure before full implementation in Phase 32
- Trigger uses div with role="combobox" per ARIA 1.2 pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Package builds successfully with pnpm --filter @lit-ui/select build
- CSS tokens from 31-01 integrate correctly
- Floating UI imported and positioned method scaffolded
- Ready for Phase 32: Select core functionality (dropdown, options, keyboard nav)

---
*Phase: 31-select-infrastructure*
*Completed: 2026-01-26*
