---
phase: 44-date-picker-core
plan: 01
subsystem: date-picker
tags: [date-picker, date-fns, parsing, intl, scaffolding]
dependency-graph:
  requires: [42-calendar-display]
  provides: [date-picker-package, date-input-parser]
  affects: [44-02, 44-03, 44-04, 44-05]
tech-stack:
  added: ["@floating-ui/dom"]
  patterns: [locale-aware-parsing, intl-date-formatting]
key-files:
  created:
    - packages/date-picker/package.json
    - packages/date-picker/tsconfig.json
    - packages/date-picker/vite.config.ts
    - packages/date-picker/src/vite-env.d.ts
    - packages/date-picker/src/date-input-parser.ts
    - packages/date-picker/src/index.ts
  modified: []
decisions:
  - id: "44-01-01"
    decision: "Use Intl.DateTimeFormat for display formatting instead of date-fns format()"
    rationale: "Zero bundle cost — Intl is native browser API"
  - id: "44-01-02"
    decision: "en-US and en-CA use MM/dd ordering; all other locales use dd/MM"
    rationale: "Matches real-world locale conventions for date input"
metrics:
  duration: "2 min"
  completed: "2026-01-31"
---

# Phase 44 Plan 01: Package Scaffolding and Date Input Parser Summary

Multi-format date input parser with locale-aware MM/dd vs dd/MM resolution using date-fns parse() and Intl.DateTimeFormat for display.

## Performance

- Duration: ~2 minutes
- Build output: 46.42 kB (9.14 kB gzip) — includes date-fns tree-shaken imports

## Accomplishments

1. **Package scaffolding** — Created @lit-ui/date-picker with @floating-ui/dom direct dep, date-fns/calendar/lit peer deps, and workspace-linked dev deps
2. **Date input parser** — `parseDateInput()` tries ISO first, then locale-ordered formats (9 variations with slash/dash/dot separators)
3. **Display formatter** — `formatDateForDisplay()` uses Intl.DateTimeFormat with `month: 'long'` for zero-bundle-cost locale formatting
4. **Placeholder utility** — `getPlaceholderText()` returns MM/DD/YYYY or DD/MM/YYYY based on locale

## Task Commits

| Task | Name | Commit | Type |
|------|------|--------|------|
| 1 | Package scaffolding | 28eb2af | chore |
| 2 | Date input parser implementation | ce01f0e | feat |

## Files Created

- `packages/date-picker/package.json` — Package config with peer deps and @floating-ui/dom
- `packages/date-picker/tsconfig.json` — Extends shared library config
- `packages/date-picker/vite.config.ts` — Uses createLibraryConfig
- `packages/date-picker/src/vite-env.d.ts` — Vite type reference
- `packages/date-picker/src/date-input-parser.ts` — Three exported functions for date parsing/formatting
- `packages/date-picker/src/index.ts` — Package barrel export

## Decisions Made

1. **Intl.DateTimeFormat over date-fns format()** — Display formatting uses native Intl API for zero bundle cost. date-fns is only imported for `parse` and `isValid`.
2. **Locale ordering: en-US/en-CA = MM/dd, others = dd/MM** — Simple heuristic that covers the vast majority of real-world use cases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added index.ts barrel export**
- **Found during:** Task 2
- **Issue:** vite.config.ts references `src/index.ts` as entry point but plan only specified `date-input-parser.ts`
- **Fix:** Created `src/index.ts` re-exporting all three functions from `date-input-parser.ts`
- **Files created:** `packages/date-picker/src/index.ts`
- **Commit:** ce01f0e

## Issues Encountered

None.

## User Setup Required

None — workspace dependencies auto-linked via pnpm.

## Next Phase Readiness

- Package builds successfully via `pnpm --filter @lit-ui/date-picker build`
- date-input-parser ready for import by date-picker component (44-02)
- @floating-ui/dom available for popup positioning (44-03)
