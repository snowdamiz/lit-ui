---
phase: 51-shared-infrastructure
plan: 01
subsystem: floating-ui
tags: [floating-ui, shadow-dom, positioning, composed-offset-position]
depends_on: []
provides: ["@lit-ui/core/floating export with Shadow DOM-safe positioning"]
affects: [52-tooltip, 53-popover]
tech-stack:
  added: ["@floating-ui/dom@^1.7.4", "composed-offset-position@^0.0.6"]
  patterns: ["Shadow DOM platform override via composed-offset-position"]
key-files:
  created:
    - packages/core/src/floating/index.ts
  modified:
    - packages/core/package.json
    - packages/core/vite.config.ts
decisions:
  - id: "51-01-bundle"
    summary: "Bundle @floating-ui/dom into floating entry (not external)"
    rationale: "Simplifies DX -- consumers just import from @lit-ui/core/floating without extra installs"
metrics:
  duration: "1m 18s"
  completed: "2026-02-02"
---

# Phase 51 Plan 01: Floating UI Wrapper Summary

Shadow DOM-safe Floating UI wrapper using composed-offset-position ponyfill, exported as `@lit-ui/core/floating` with computePosition, autoUpdatePosition, and all standard middleware.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install deps and create floating module | 4be7d38 | floating/index.ts, package.json |
| 2 | Add export map and vite build entry | 9ce2763 | package.json, vite.config.ts |

## What Was Built

### Floating UI Wrapper (`packages/core/src/floating/index.ts`)

A thin wrapper around `@floating-ui/dom` that:

1. Creates a `shadowDomPlatform` that overrides `getOffsetParent` with `composed-offset-position` ponyfill -- fixes incorrect positioning inside nested Shadow DOM
2. Exports `computePosition()` that injects the Shadow DOM platform automatically
3. Exports `autoUpdatePosition()` returning a cleanup function for `disconnectedCallback`
4. Re-exports middleware: `flip`, `shift`, `offset`, `arrow`, `size`
5. Re-exports types: `Placement`, `MiddlewareData`

### Build Configuration

- `packages/core/package.json`: Added `./floating` to exports map with types and import paths
- `packages/core/vite.config.ts`: Added `floating/index` to lib.entry
- `@floating-ui/dom` and `composed-offset-position` are bundled into the output (not externalized), producing `dist/floating/index.js` at 28KB (8.7KB gzipped)

## Decisions Made

1. **Bundle floating-ui deps (not external):** `@floating-ui/dom` and `composed-offset-position` are bundled into `dist/floating/index.js` rather than externalized. This means consumers only need to import from `@lit-ui/core/floating` without installing Floating UI separately. The 8.7KB gzipped cost is acceptable for the DX simplification.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- Build passes without errors
- `dist/floating/index.js` exists and contains `computePosition`
- `dist/floating/index.d.ts` exports all types correctly
- `package.json` exports map includes `./floating`
- Dependencies bundled (not external) in floating output

## Next Phase Readiness

Downstream phases 52 (Tooltip) and 53 (Popover) can now:
```typescript
import { computePosition, autoUpdatePosition, flip, shift, offset, arrow } from '@lit-ui/core/floating';
```

No blockers for downstream consumption.
