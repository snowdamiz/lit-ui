---
phase: 45-date-picker-advanced
plan: "02"
subsystem: date-picker
tags: [presets, format, intl, date-picker]

dependency-graph:
  requires: ["45-01"]
  provides: ["preset-types", "presets-property", "format-property"]
  affects: ["45-03", "45-05"]

tech-stack:
  added: []
  patterns: ["Intl.DateTimeFormatOptions passthrough", "resolve-at-call-time presets"]

key-files:
  created:
    - packages/date-picker/src/preset-types.ts
  modified:
    - packages/date-picker/src/date-input-parser.ts
    - packages/date-picker/src/date-picker.ts

decisions:
  - id: "45-02-01"
    decision: "Presets property accepts boolean | DatePreset[] — true uses DEFAULT_PRESETS, array uses custom, false hides"
    rationale: "Simple API: boolean for common case, array for customization"
  - id: "45-02-02"
    decision: "Format property is JS-only (attribute: false) since Intl.DateTimeFormatOptions is an object"
    rationale: "Cannot meaningfully serialize complex options object to HTML attribute"
  - id: "45-02-03"
    decision: "Preset resolver functions called at click time, not at render time for resolve"
    rationale: "Consistent with natural-language.ts pattern — SSR safe, always current"

metrics:
  duration: "2 min"
  completed: "2026-01-31"
---

# Phase 45 Plan 02: Presets and Format Summary

Preset buttons (Today, Tomorrow, Next Week) and custom Intl.DateTimeFormatOptions format property for date picker display customization.

## Performance

- **Duration:** 2 min
- **Tasks:** 2/2 complete
- **TypeScript:** Clean compilation
- **Tests:** 25/25 passing (no regressions)

## Accomplishments

1. **Created `preset-types.ts`** with `DatePreset` interface and `DEFAULT_PRESETS` array containing Today, Tomorrow, and Next Week presets using date-fns utilities
2. **Updated `formatDateForDisplay`** with optional third parameter for `Intl.DateTimeFormatOptions` — backward compatible, existing callers unchanged
3. **Added `presets` property** to DatePicker accepting `boolean | DatePreset[]` with `effectivePresets` computed getter
4. **Added `format` property** accepting `Intl.DateTimeFormatOptions | null` passed through all `formatDateForDisplay` call sites (updated, handleInputBlur, handleCalendarSelect, handlePresetSelect)
5. **Implemented preset rendering** with `renderPresets()` inserting buttons above calendar in popup
6. **Added constraint awareness** — presets disabled when resolved date falls outside min/max range via `isPresetDisabled()`
7. **Added preset CSS** with flexbox layout, hover/focus-visible states, disabled opacity, and CSS custom properties for theming

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create preset types and update formatDateForDisplay | 933ce11 | preset-types.ts, date-input-parser.ts |
| 2 | Add presets and format properties to DatePicker | d3dd4ba | date-picker.ts |

## Files Changed

### Created
- `packages/date-picker/src/preset-types.ts` — DatePreset interface, DEFAULT_PRESETS array

### Modified
- `packages/date-picker/src/date-input-parser.ts` — Added optional options parameter to formatDateForDisplay
- `packages/date-picker/src/date-picker.ts` — Added presets/format properties, preset rendering, preset CSS

## Decisions Made

1. **Presets property type:** `boolean | DatePreset[]` — simple boolean for defaults, array for custom
2. **Format property:** JS-only (`attribute: false`) since Intl.DateTimeFormatOptions is a complex object
3. **Preset resolve timing:** Called at click time for SSR safety and accuracy

## Deviations from Plan

None — plan executed exactly as written.

## Next Phase Readiness

- Preset types are exported and available for Plan 03 (inline mode) and Plan 05 (exports)
- Format property flows through all display formatting paths
- No blockers for subsequent plans
