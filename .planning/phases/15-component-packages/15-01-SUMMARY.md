---
phase: 15-component-packages
plan: 01
subsystem: components
tags: [button, ssr, custom-elements, peer-dependencies]

dependency_graph:
  requires: [14-core-package]
  provides: [@lit-ui/button-package, lui-button-element]
  affects: [15-02-dialog, framework-integration]

tech_stack:
  added: []
  patterns: [isServer-guard, safe-custom-element-registration, peer-dependencies]

key_files:
  created:
    - packages/button/src/button.ts
    - packages/button/src/vite-env.d.ts
  modified:
    - packages/button/src/index.ts
    - packages/button/package.json

decisions:
  - id: import-meta-env
    choice: "Use import.meta.env?.DEV instead of process.env.NODE_ENV"
    reason: "Vite's standard pattern, avoids @types/node dependency"

metrics:
  duration: 3m
  completed: 2026-01-25
---

# Phase 15 Plan 01: Button Package Migration Summary

**One-liner:** Migrated Button component to @lit-ui/button with isServer guards for SSR-safe ElementInternals

## What Was Done

### Task 1: Create Button Component with SSR Guards
- Migrated button.ts from src.old with import path updates
- Changed TailwindElement import to @lit-ui/core
- Added isServer guard for attachInternals() call
- Made internals property nullable (null during SSR)
- Guarded form actions with optional chaining (this.internals?.form)
- Removed @customElement decorator (registration moved to index.ts)
- Updated HTMLElementTagNameMap to use 'lui-button' tag name
- Commit: 5cc0523

### Task 2: Create Package Entry Point with Safe Registration
- Exported Button class and type aliases (ButtonVariant, ButtonSize, ButtonType)
- Re-exported TailwindElement and isServer for consumer convenience
- Added safe custom element registration with isServer guard
- Added collision detection using customElements.get() before define()
- Added development-only warning for duplicate registrations
- Commit: 34a9eef

### Task 3: Update Package.json Peer Dependencies
- Moved @lit-ui/core from dependencies to peerDependencies
- Added @lit-ui/core to devDependencies as workspace:* for local development
- Prevents duplicate copies of core package for consumers
- Commit: 0414468

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript build errors**
- **Found during:** Post-task verification (build step)
- **Issue:** process.env.NODE_ENV caused TS2580 (Cannot find name 'process')
- **Fix:** Changed to import.meta.env?.DEV (Vite's standard pattern)
- **Additional fix:** Added vite-env.d.ts for Vite client types
- **Files modified:** packages/button/src/index.ts, packages/button/src/vite-env.d.ts
- **Commit:** f805b21

## Verification Results

All verification criteria passed:
- `pnpm --filter @lit-ui/button build` succeeds without errors
- `ls packages/button/dist/` shows index.js, index.d.ts
- `grep -l "isServer" packages/button/src/*.ts` shows button.ts and index.ts
- `grep "lui-button" packages/button/src/index.ts` shows registration code

## Key Technical Patterns

### SSR-Safe ElementInternals
```typescript
private internals: ElementInternals | null = null;

constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

### Safe Custom Element Registration
```typescript
if (!isServer && typeof customElements !== 'undefined') {
  if (!customElements.get('lui-button')) {
    customElements.define('lui-button', Button);
  } else if (import.meta.env?.DEV) {
    console.warn('[lui-button] Custom element already registered.');
  }
}
```

### Peer Dependency Pattern
```json
{
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^0.0.1"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*"
  }
}
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 5cc0523 | feat | migrate Button component with SSR guards |
| 34a9eef | feat | create package entry point with safe registration |
| 0414468 | chore | update package.json peer dependencies |
| f805b21 | fix | fix TypeScript build errors |

## Next Phase Readiness

**Ready for:** Plan 15-02 (Dialog package migration)
**Pattern established:** Same isServer guard and registration pattern applies
**No blockers identified**
