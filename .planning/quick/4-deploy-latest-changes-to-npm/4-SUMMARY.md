---
phase: quick-4
plan: 01
subsystem: publishing
tags: [npm, publish, charts, changeset]
dependency_graph:
  requires: []
  provides: ["@lit-ui/charts@1.0.0 on npm registry"]
  affects: ["npm registry"]
tech_stack:
  added: []
  patterns: ["changeset publish --access public"]
key_files:
  created: []
  modified: []
decisions:
  - "Used `pnpm changeset publish --access public` (not ci:publish) to avoid rebuilding unnecessarily after manual build verification"
  - "Confirmed publish success via 403 on re-publish attempt and dist-tags endpoint returning 1.0.0"
metrics:
  duration: "2m 54s"
  completed_date: "2026-03-01"
  tasks_completed: 2
  files_changed: 0
---

# Quick Task 4: Deploy Latest Changes to npm - Summary

One-liner: Published @lit-ui/charts@1.0.0 to npm for the first time via changeset, making the v10.0 WebGPU charts package publicly installable.

## What Was Done

### Task 1: Build all packages

Ran `pnpm build:packages` across all 24 packages in the monorepo. All packages built successfully with no TypeScript errors. The charts package (`@lit-ui/charts`) emitted its full dist output including `dist/index.js` and `dist/index.d.ts`.

Note: The dialog package emitted a TypeScript warning about `TS2717: Subsequent property declarations must have the same type` — this is a pre-existing issue in `packages/dialog/src/dialog.ts` not introduced by this task. The build still succeeded (exit 0).

### Task 2: Publish via changeset

Ran `pnpm changeset publish --access public`. Changeset queried all 22 non-private packages against the registry:

- 21 packages already published at their current versions — skipped
- `@lit-ui/charts@1.0.0` — not on npm — published

Changeset output: "success packages published successfully: @lit-ui/charts@1.0.0"

Git tag created: `@lit-ui/charts@1.0.0`

**Publish verified** via two signals:
1. Re-publish attempt returned `403 Forbidden: You cannot publish over the previously published versions: 1.0.0`
2. `https://registry.npmjs.org/-/package/@lit-ui%2Fcharts/dist-tags` returns `{"latest":"1.0.0"}`

## npm Package

- Package: `@lit-ui/charts`
- Version: `1.0.0`
- npm URL: https://www.npmjs.com/package/@lit-ui/charts
- Install: `npm install @lit-ui/charts`

## Deviations from Plan

None - plan executed exactly as written. The checkpoint task (human-verify) is the final step requiring manual confirmation that the npm package page is visible.

## Self-Check

- [x] Build completed with exit 0
- [x] `packages/charts/dist/index.js` exists
- [x] `packages/charts/dist/index.d.ts` exists
- [x] Changeset reported publish success
- [x] Git tag `@lit-ui/charts@1.0.0` created
- [x] 403 on re-publish confirms version is live
- [x] dist-tags endpoint confirms `latest: 1.0.0`

## Self-Check: PASSED
