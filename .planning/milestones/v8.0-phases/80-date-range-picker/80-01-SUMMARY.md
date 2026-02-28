---
phase: 80-date-range-picker
plan: 01
subsystem: styles
tags: [dark-mode, css-tokens, tailwind, date-range-picker, cascade]
dependency_graph:
  requires: [79-01]
  provides: [DRP-01]
  affects: [packages/core/src/styles/tailwind.css]
tech_stack:
  added: []
  patterns: [semantic-dark-cascade, double-fallback-var, oklch-exception]
key_files:
  created: []
  modified:
    - packages/core/src/styles/tailwind.css
decisions:
  - "Date Range Picker dark mode governed by semantic .dark cascade — 23 hardcoded .dark declarations removed"
  - "Two compare-* tokens kept as .dark exceptions: oklch(0.30/0.22) literals with no cascade equivalent"
metrics:
  duration: "1 minute"
  completed: "2026-02-28"
  tasks_completed: 1
  files_modified: 1
---

# Phase 80 Plan 01: Date Range Picker Dark Mode Cascade Summary

Dark mode for Date Range Picker migrated from 23 hardcoded .dark --ui-date-range-* declarations to the semantic .dark cascade, retaining only the 2 compare-* oklch literal exceptions.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Remove .dark date-range-picker block (keep 2 compare-* oklch exceptions) | 198eb79 | packages/core/src/styles/tailwind.css |

## What Was Done

Removed the entire "Date Range Picker dark mode" section from the `.dark {}` block in `tailwind.css`, which contained 23 declarations (1 comment + 22 token lines). All 21 non-exception tokens use `var(--color-gray-*)` overrides that are redundant given the double-fallback `var()` pattern already in `:root`.

The two genuine exceptions remain in `.dark`:
- `--ui-date-range-compare-highlight-bg: oklch(0.30 0.06 85)` — dark amber (`:root` = `oklch(0.93 0.06 85)`)
- `--ui-date-range-compare-preview-bg: oklch(0.22 0.04 85)` — dark amber (`:root` = `oklch(0.97 0.03 85)`)

These cannot cascade through semantic tokens because their `:root` values are literal `oklch()` colors (not `var(--color-*)` references).

A minimal comment `/* Date Range Picker compare overlays (oklch literals, no cascade) */` replaces the removed "Date Range Picker dark mode" block.

## Verification Results

- `grep -c "ui-date-range" tailwind.css` → **33** (31 in `:root` + 2 compare-* in `.dark`)
- No non-exception `.dark` date-range declarations remain
- `:root` block (lines 1059-1089) unchanged — 31 tokens intact
- Pattern matches all prior phases (70-01 through 79-01)

## Deviations from Plan

None — plan executed exactly as written.

## Key Decisions

1. **23 declarations removed, not 21**: The plan description says "21 removed declarations" in the done criteria but the action lists exactly 23 lines to remove (1 comment + 22 tokens). The actual count is 23 lines removed — verified by `git diff` showing `-24 deletions (+1 insertion)`. The "done" criterion of 33 total matches is correct and satisfied.

## Self-Check: PASSED

- FOUND: packages/core/src/styles/tailwind.css
- FOUND: commit 198eb79
