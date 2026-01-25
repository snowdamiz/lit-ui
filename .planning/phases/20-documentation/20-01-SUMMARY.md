---
phase: 20-documentation
plan: 01
subsystem: docs-site
tags: [documentation, installation, npm, copy-source, navigation]

dependency_graph:
  requires: [19-publishing]
  provides: [installation-page, guides-navigation]
  affects: [20-02, 20-03]

tech_stack:
  added: []
  patterns: [trade-offs-table, section-linking]

key_files:
  created:
    - apps/docs/src/pages/Installation.tsx
  modified:
    - apps/docs/src/nav.ts
    - apps/docs/src/App.tsx
    - apps/docs/src/pages/GettingStarted.tsx

decisions:
  - id: DOC-INSTALL-01
    choice: NPM as primary path with trade-offs table
    reason: Per CONTEXT.md guidance for npm-first approach

metrics:
  duration: 3 min
  completed: 2026-01-25
---

# Phase 20 Plan 01: Installation Documentation Summary

NPM installation docs with copy-source alternative and trade-offs comparison table.

## What Was Done

### Task 1: Installation Page (ad680ac)
Created `apps/docs/src/pages/Installation.tsx` (186 lines) with:
- **NPM Installation section**: Primary path with `npm install @lit-ui/core @lit-ui/button @lit-ui/dialog`
- **Copy-Source section**: Alternative with `npx lit-ui init` and link to Getting Started
- **Trade-offs table**: Updates, customization, bundle size, best-for comparison
- **PrevNextNav**: Links to Getting Started (prev) and SSR Setup (next)

### Task 2: Navigation and Routing (ec9804b)
Updated navigation structure:
- Added Installation to Overview section in `nav.ts`
- Added new Guides section with SSR Setup and Migration items
- Added `/installation` route in `App.tsx`
- Added placeholder routes for `/guides/ssr` and `/guides/migration`

### Task 3: GettingStarted Updates (fe500c3)
Updated `GettingStarted.tsx` to link to Installation:
- Replaced yarn/pnpm tip box with link to Installation guide
- Updated PrevNextNav next link from Button to Installation
- Added Link import from react-router

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All checks passed:
- `pnpm --filter lit-ui-docs build` succeeds without errors
- Installation.tsx renders NPM section first, copy-source second
- GettingStarted links to Installation guide
- Sidebar shows: Overview (Getting Started, Installation), Guides (SSR Setup, Migration), Components
- Guide routes show Placeholder until 20-02 and 20-03 complete

## Commits

| Hash | Message |
|------|---------|
| ad680ac | feat(20-01): create Installation documentation page |
| ec9804b | feat(20-01): add Installation and Guides navigation/routing |
| fe500c3 | feat(20-01): update GettingStarted to link to Installation |

## Next Phase Readiness

Ready for plan 20-02 (SSR Setup Guide):
- `/guides/ssr` route exists with Placeholder
- Navigation includes SSR Setup link
- Installation page links to SSR Setup as next step
