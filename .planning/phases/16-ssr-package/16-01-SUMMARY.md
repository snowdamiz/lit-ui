---
phase: 16-ssr-package
plan: 01
subsystem: ssr
tags: [ssr, lit-labs, render, hydration]

dependency-graph:
  requires:
    - "15-component-packages (SSR-aware components)"
  provides:
    - "render, html, renderToString exports for server rendering"
    - "isServer export for conditional logic"
    - "hydration entry point for client hydration"
  affects:
    - "16-02 (SSR integration examples)"
    - "17-XX (framework SSR integration)"

tech-stack:
  added:
    - "@lit-labs/ssr@^4.0.0 (peer dependency)"
    - "@lit-labs/ssr-client@^1.1.0 (peer dependency)"
  patterns:
    - "Re-export pattern: wrap @lit-labs/ssr with simplified API"
    - "External dependencies: all Lit packages marked external (critical for SSR)"
    - "Dual entry points: index (server) and hydration (client)"

key-files:
  created:
    - packages/ssr/package.json
    - packages/ssr/tsconfig.json
    - packages/ssr/vite.config.ts
    - packages/ssr/src/index.ts
    - packages/ssr/src/types.ts
    - packages/ssr/src/hydration.ts
    - packages/ssr/src/vite-env.d.ts
  modified: []

decisions:
  - id: "16-01-01"
    title: "Lit packages external"
    choice: "Mark all @lit-labs/* as external in vite.config.ts"
    rationale: "Lit SSR uses conditional exports (node vs browser) that break when bundled"

metrics:
  duration: "3 min"
  completed: "2026-01-25"
---

# Phase 16 Plan 01: SSR Package Structure Summary

Thin @lit-ui/ssr wrapper around @lit-labs/ssr with renderToString helper and hydration entry point.

## What Was Done

### Task 1: Create SSR Package Structure
- Created package.json with peer dependencies on lit, @lit-labs/ssr, @lit-labs/ssr-client
- Created tsconfig.json extending @lit-ui/typescript-config/library.json
- Created vite.config.ts with all Lit packages marked external (CRITICAL for SSR)
- Configured dual entry points: index and hydration

### Task 2: Create SSR Render Utilities
- Created src/index.ts with:
  - Re-exports: render, html from @lit-labs/ssr
  - Re-exports: collectResult, collectResultSync from @lit-labs/ssr/lib/render-result.js
  - Re-exports: RenderResultReadable from @lit-labs/ssr/lib/render-result-readable.js
  - Re-exports: isServer from lit
  - Convenience helper: renderToString(template, options) -> Promise<string>
- Created src/types.ts with RenderInfo, RenderResult type re-exports
- Created src/hydration.ts with:
  - Side-effect import of @lit-labs/ssr-client/lit-element-hydrate-support.js
  - Re-export of hydrate function
- Created src/vite-env.d.ts for Vite client types

### Task 3: Install Dependencies and Verify Build
- Ran pnpm install to add @lit-labs/ssr packages
- Built package successfully with pnpm --filter @lit-ui/ssr build
- Verified dist/index.js contains all exports (render, html, isServer, renderToString)
- Verified dist/index.d.ts contains proper RenderInfo typing

## Decisions Made

### 16-01-01: Lit Packages External
- **Choice:** Mark all @lit-labs/* packages as external in vite.config.ts
- **Rationale:** Lit SSR relies on conditional exports (node vs browser paths) that break when bundled into a single output

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 442b820 | feat(16-01): create @lit-ui/ssr package structure |
| 2 | 9d03ad3 | feat(16-01): add SSR render utilities and hydration support |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All success criteria verified:
- [x] @lit-ui/ssr package builds without errors
- [x] render, html, renderToString, isServer, collectResult exported from main entry
- [x] Types (RenderInfo, RenderResult) exported correctly
- [x] Lit SSR packages marked as external (not bundled)

## Next Phase Readiness

### For 16-02: SSR Integration
- Package ready for integration examples
- All core exports available for use in example apps

### Blockers
None.

### Dependencies Verified
- @lit-labs/ssr@4.0.0 installed and working
- @lit-labs/ssr-client@1.1.8 installed and working
- Peer dependency on lit@^3.0.0 declared
