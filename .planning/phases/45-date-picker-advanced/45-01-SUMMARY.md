---
phase: 45-date-picker-advanced
plan: 01
subsystem: date-picker
tags: [natural-language, date-parsing, date-fns, tdd]
dependency-graph:
  requires: [44-01]
  provides: [natural-language-date-parser, nl-parseDateInput-integration]
  affects: [45-02, 45-03]
tech-stack:
  added: [vitest]
  patterns: [dictionary-resolver, input-normalization, tdd-red-green]
key-files:
  created:
    - packages/date-picker/src/natural-language.ts
    - packages/date-picker/src/natural-language.test.ts
    - packages/date-picker/src/date-input-parser.test.ts
  modified:
    - packages/date-picker/src/date-input-parser.ts
    - packages/date-picker/package.json
decisions:
  - id: NL-RESOLVER-PATTERN
    description: "Use () => Date resolver functions called at evaluation time (not import time) for SSR safety"
  - id: NL-BEFORE-FORMAT
    description: "Natural language parsing runs before format-based parsing in parseDateInput pipeline"
  - id: VITEST-INFRA
    description: "Added vitest as devDependency for test infrastructure (first tests in date-picker package)"
metrics:
  duration: 2 min
  completed: 2026-01-31
---

# Phase 45 Plan 01: Natural Language Date Parser Summary

Dictionary-based NL date parser resolving today/tomorrow/yesterday/next week via date-fns, integrated into parseDateInput pipeline before format parsing.

## Accomplishments

- Created `parseNaturalLanguage()` function with dictionary-based resolver pattern
- Supported phrases: today, tomorrow, yesterday, next week
- Input normalization: trim, lowercase, collapse whitespace for resilient matching
- Integrated NL parsing into `parseDateInput()` as first-pass before format loop
- Full test coverage with 25 tests (13 NL unit + 4 integration + 8 regression/utility)
- All tests deterministic via `vi.useFakeTimers()` pinned to 2026-01-31

## Task Commits

| Task | Type | Commit | Description |
|------|------|--------|-------------|
| RED | test | 5b6e2ad | Failing tests for NL parser and integration |
| GREEN | feat | 81d2646 | Implementation with all 25 tests passing |

## Files Created

- `packages/date-picker/src/natural-language.ts` - NL parser with NL_PHRASES dictionary and parseNaturalLanguage export
- `packages/date-picker/src/natural-language.test.ts` - 13 tests covering all phrases, case insensitivity, whitespace, non-matches
- `packages/date-picker/src/date-input-parser.test.ts` - 12 tests covering NL integration + format regression + utility functions

## Files Modified

- `packages/date-picker/src/date-input-parser.ts` - Added NL import and early-return call before format loop
- `packages/date-picker/package.json` - Added vitest devDependency

## Decisions Made

1. **Resolver pattern** - Each NL phrase maps to `() => Date` function called at lookup time, not module load time, preventing SSR date capture issues
2. **NL-first pipeline** - parseNaturalLanguage runs before format parsing so "today" resolves to a date rather than failing all format patterns
3. **Vitest infrastructure** - Installed vitest as first test dependency in date-picker package; enables TDD for remaining plans

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed vitest devDependency**
- **Found during:** RED phase setup
- **Issue:** No test runner installed in date-picker package
- **Fix:** Added vitest as devDependency via pnpm
- **Files modified:** packages/date-picker/package.json

## Verification

- All 25 tests pass (`npx vitest run --reporter=verbose`)
- TypeScript compiles cleanly (`npx tsc --noEmit`)
- No regressions in format-based parsing
