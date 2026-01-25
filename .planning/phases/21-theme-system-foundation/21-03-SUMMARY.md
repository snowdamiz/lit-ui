---
phase: 21-theme-system-foundation
plan: 03
subsystem: theme
tags: [base64url, encoding, url-safe, validation, typescript]

# Dependency graph
requires:
  - phase: 21-01
    provides: ThemeConfig type and Zod schema for validation
provides:
  - encodeThemeConfig function for URL-safe base64url encoding
  - decodeThemeConfig function with 4-stage validation
  - Round-trip guarantee for theme configs
affects: [22-cli-theme, 23-playground]

# Tech tracking
tech-stack:
  added: []
  patterns: [base64url encoding, multi-stage validation]

key-files:
  created:
    - packages/cli/src/theme/encoding.ts
    - packages/cli/tests/theme/encoding.test.ts
  modified:
    - packages/cli/src/theme/index.ts

key-decisions:
  - "Base64url format validation before decode (explicit regex check)"
  - "4-stage validation: format -> decode -> JSON -> schema"
  - "Descriptive error messages for each failure mode"

patterns-established:
  - "URL-safe encoding pattern: JSON.stringify -> base64url"
  - "Validation error pattern: prefix + specific details"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Phase 21 Plan 03: Theme Config Encoding Summary

**URL-safe base64url encoding/decoding for theme configs with 4-stage validation and descriptive errors**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T20:32:32Z
- **Completed:** 2026-01-25T20:35:26Z
- **Tasks:** TDD cycle (RED -> GREEN -> REFACTOR)
- **Files modified:** 3

## Accomplishments

- Created encodeThemeConfig for URL-safe base64url encoding (no +, /, = characters)
- Implemented decodeThemeConfig with 4-stage validation pipeline
- Added explicit base64url format regex validation before decoding
- Descriptive error messages for each failure mode (base64, JSON, schema)
- Round-trip guarantee: decodeThemeConfig(encodeThemeConfig(config)) === config
- Exported utilities through theme module barrel

## Task Commits

Each TDD phase was committed atomically:

1. **RED: Failing tests** - `6bce611` (test)
2. **GREEN: Implementation** - `217933b` (feat)
3. **REFACTOR: JSDoc cleanup** - `3c08199` (refactor)

## Files Created/Modified

- `packages/cli/src/theme/encoding.ts` - encodeThemeConfig, decodeThemeConfig utilities
- `packages/cli/tests/theme/encoding.test.ts` - 14 comprehensive tests
- `packages/cli/src/theme/index.ts` - Added encoding exports

## Decisions Made

1. **Explicit base64url format validation** - Using regex check before Buffer.from() because Node's Buffer doesn't throw on invalid characters, it decodes garbage
2. **4-stage validation** - Format validation, base64 decode, JSON parse, Zod schema - each with specific error message
3. **Error message format** - Prefix indicates failure stage: "Invalid theme encoding:" for encoding issues, "Invalid theme config:" for schema issues

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation straightforward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Encoding utilities ready for CLI integration
- URL-safe strings can be passed as --theme=<encoded> parameter
- Standard base64url format allows debugging with standard tools
- Plan 21-04 (CSS generator) already complete
- Ready for Plan 21-05 (CLI integration)

---
*Phase: 21-theme-system-foundation*
*Completed: 2026-01-25*
