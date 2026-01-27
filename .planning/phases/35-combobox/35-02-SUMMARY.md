---
phase: 35-combobox
plan: 02
subsystem: ui
tags: [lit, select, combobox, highlight, match, filter, accessibility]

# Dependency graph
requires:
  - phase: 35-01
    provides: Searchable mode with filterQuery and filteredOptions
provides:
  - Match highlighting with findAllMatches() and renderHighlightedLabel()
  - FilterMatch interface for option + match indices
  - Customizable empty state via noResultsMessage prop
  - CSS tokens for highlight theming
affects: [36-async-loading, 37-cli-docs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - FilterMatch pattern for carrying match metadata through render
    - Segment-based highlight rendering (split text, wrap matches)

key-files:
  created: []
  modified:
    - packages/select/src/select.ts
    - packages/core/src/styles/tailwind.css
    - packages/core/src/tokens/index.ts

key-decisions:
  - "Bold highlighting (font-weight: 600) for matched text"
  - "CSS tokens allow theme customization of highlight appearance"
  - "findAllMatches returns ALL occurrences, not just first"
  - "Empty state uses role=status aria-live=polite for screen readers"

patterns-established:
  - "FilterMatch pattern: {option, originalIndex, matchIndices} bundles match data"
  - "Segment-based rendering: split text into highlighted/non-highlighted segments"

# Metrics
duration: 8min
completed: 2026-01-27
---

# Phase 35 Plan 02: Match Highlighting and Empty State Summary

**Bold match highlighting for ALL occurrences in filtered options, plus customizable empty state with ARIA live announcement**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-27T16:00:00Z
- **Completed:** 2026-01-27T16:08:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- CSS tokens for highlight styling (--ui-select-highlight-weight, --ui-select-highlight-text)
- FilterMatch interface bundles option with match indices for efficient rendering
- findAllMatches() finds ALL occurrences (e.g., "an" in "Banana" highlights both)
- renderHighlightedLabel() wraps matches in `<strong class="highlight">` tags
- noResultsMessage property for customizable empty state text
- Empty state has role="status" aria-live="polite" for screen reader announcement

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CSS tokens for highlight styling** - `595b02e` (feat)
2. **Task 2: Implement match highlighting in options** - `dca9f1f` (feat)
3. **Task 3: Add empty state when no options match** - `6f5e2fb` (feat)

## Files Created/Modified

- `packages/core/src/styles/tailwind.css` - Added --ui-select-highlight-weight and --ui-select-highlight-text tokens
- `packages/core/src/tokens/index.ts` - Added highlightWeight and highlightText to select tokens
- `packages/select/src/select.ts` - FilterMatch interface, findAllMatches(), renderHighlightedLabel(), noResultsMessage prop, renderEmptyState()

## Decisions Made

- Bold styling (font-weight: 600) for highlights per CONTEXT.md
- CSS tokens allow theme customization of both weight and color
- findAllMatches allows overlapping matches (startIndex = foundIndex + 1)
- Empty state styled with font-style: italic for visual distinction

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Match highlighting complete and ready for use
- Empty state messaging customizable via prop
- FilterMatch pattern established for future features (async loading can add loading state)
- Plan 03 (Creatable mode) work detected in git history - appears to be in progress

---
*Phase: 35-combobox*
*Completed: 2026-01-27*
