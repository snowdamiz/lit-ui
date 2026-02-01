---
phase: 48-time-picker-core
plan: 03
subsystem: ui
tags: lit, time-picker, clock-face, svg, pointer-events

# Dependency graph
requires:
  - phase: 48-01
    provides: TimeValue interface, time-utils
provides:
  - "ClockFace SVG component with hour/minute visual selection"
  - "Pointer event drag interaction for clock value selection"
  - "Inner/outer ring pattern for 24-hour mode"
affects: 48-04, 48-05, 48-06 (time picker popup composition, form integration)

# Tech tracking
tech-stack:
  added: []
  patterns: [SVG clock face rendering, Pointer Events API for unified touch/mouse, inner/outer ring 24h pattern, CSS custom properties for clock theming]

# File tracking
key-files:
  created:
    - packages/time-picker/src/clock-face.ts
  modified: []

# Decisions
decisions:
  - id: 48-03-01
    decision: "Use SVG viewBox 240x240 with center at (120,120) for clock rendering"
    reason: "Clean coordinate math with outer radius 100, inner radius 55"
  - id: 48-03-02
    decision: "Inner/outer ring threshold at 70% of outer radius for 24h ring detection"
    reason: "Clear separation between rings at distance ~70px in SVG coordinates"
  - id: 48-03-03
    decision: "Clock hand and marker rendered before numbers so text appears on top"
    reason: "SVG paint order ensures number legibility over the hand line"

# Metrics
metrics:
  duration: 2 min
  completed: 2026-01-31
---

# Phase 48 Plan 03: Clock Face SVG Component Summary

SVG clock face with 12h/24h hour rendering, minute indicators, pointer event drag selection, and inner/outer ring detection for 24-hour mode.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Clock face SVG rendering with hour/minute markers | a9e94ee | ClockFace component with 12h, 24h inner/outer ring, minute mode, clock hand |
| 2 | Pointer events interaction for clock face selection | (included in a9e94ee) | pointerdown/move/up handlers, value calculation, inner/outer ring detection, ui-clock-select event |

## Key Implementation Details

### SVG Clock Face Layout
- **ViewBox:** 0 0 240 240, center at (120, 120)
- **Outer number radius:** 85px for hour labels and minute labels
- **Inner number radius:** 55px for 24-hour inner ring (0, 13-23)
- **Selection marker:** Circle r=16 behind selected number with primary color fill

### Hour Mode
- **12-hour:** Numbers 1-12 on outer ring at 30-degree intervals; 12 at top
- **24-hour:** Outer ring 1-12, inner ring 0 + 13-23 with smaller font (12px vs 14px)
- Angle formula: `x = center + radius * cos((i * 30 - 90) * PI / 180)`

### Minute Mode
- 60 positions at 6-degree intervals
- Major labels (00, 05, 10, ..., 55) with full text at every 5 minutes
- Minor ticks: small dots (r=1) for non-labeled minutes

### Pointer Events
- Unified touch/mouse via Pointer Events API with setPointerCapture
- Value calculation from pointer position using atan2 with 90-degree rotation
- Inner/outer ring detection via distance from center (threshold at 70px)
- `touch-action: none` and `user-select: none` prevent scroll/selection during drag
- Dispatches `ui-clock-select` CustomEvent with `{ value, mode }` detail

### CSS Custom Properties
- `--ui-time-picker-clock-bg` (default: #f9fafb)
- `--ui-time-picker-clock-border` (default: #e5e7eb)
- `--ui-time-picker-clock-text` (default: #374151)
- `--ui-time-picker-primary` (fallback to --ui-primary, default: #3b82f6)

## Deviations from Plan

None - plan executed exactly as written. Task 2's pointer event logic was implemented together with Task 1 as the rendering and interaction are tightly coupled in the same component.

## Verification

- [x] `npx tsc --noEmit -p packages/time-picker/tsconfig.json` -- no type errors
- [x] ClockFace class exported from clock-face.ts
- [x] SVG rendering includes hour markers (12h and 24h modes) and minute indicators
- [x] Pointer event handlers calculate correct values from position
- [x] Inner/outer ring detection works for 24-hour mode
- [x] ui-clock-select event dispatched with value and mode
- [x] File is 424 lines (minimum 200)

## Next Phase Readiness

ClockFace is ready for composition in the time-picker popup (Plan 04/05). It needs to be imported and wired to the spinbutton inputs with bidirectional value sync.
