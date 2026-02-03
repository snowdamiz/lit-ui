---
phase: 63
plan: 02
subsystem: filtering
tags: [filters, text, number, date, select, global-search]

dependency-graph:
  requires: [63-01-filter-state]
  provides: [text-filter, number-filter, date-filter, select-filter, global-search]
  affects: [63-04-filter-ui-integration]

tech-stack:
  added: []
  patterns: [debounce, native-date-input, multi-select]

key-files:
  created:
    - packages/data-table/src/filters/text-filter.ts
    - packages/data-table/src/filters/number-filter.ts
    - packages/data-table/src/filters/date-filter.ts
    - packages/data-table/src/filters/select-filter.ts
    - packages/data-table/src/filters/global-search.ts
    - packages/data-table/src/filters/index.ts
  modified:
    - packages/data-table/src/index.ts

decisions:
  - id: debounce-delay
    choice: 300ms default debounce delay
    rationale: Balance between responsiveness and avoiding excessive re-renders

metrics:
  duration: 2m
  completed: 2026-02-03
---

# Phase 63 Plan 02: Per-Column Filter UI Summary

Five type-specific filter components created for the data table: text (contains), number (range), date (range), select (multi-select), and global search.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create text and number filter components | 8220dab | text-filter.ts, number-filter.ts |
| 2 | Create date and select filter components | e0cf050 | date-filter.ts, select-filter.ts |
| 3 | Create global search and export index | 81ce67c | global-search.ts, index.ts, index.ts |

## What Was Built

### Text Filter (text-filter.ts)
- `lui-column-text-filter` component
- Debounced input (300ms default, configurable)
- Uses lui-input with type="search" and clearable
- Emits `filter-change` event with `{ columnId, value }`
- Value is `undefined` when empty to clear filter

### Number Filter (number-filter.ts)
- `lui-column-number-filter` component
- Min/max range inputs using lui-input type="number"
- `NumberRangeValue` type: `[number | null, number | null]`
- Emits `filter-change` event with range value
- One-sided filtering supported (min only or max only)

### Date Filter (date-filter.ts)
- `lui-column-date-filter` component
- Native HTML date inputs for start/end dates
- `DateRangeValue` type: `[string | null, string | null]` (ISO dates)
- Dark mode support with calendar picker indicator inversion
- Emits `filter-change` event with date range

### Select Filter (select-filter.ts)
- `lui-column-select-filter` component
- Uses lui-select with multiple mode
- `SelectFilterOption` interface: `{ value, label }`
- Options passed via `.options` property
- Emits `filter-change` event with selected value array

### Global Search (global-search.ts)
- `lui-global-search` component
- Debounced search input (300ms default)
- Search icon in prefix slot
- Uses lui-input with type="search" and clearable
- Emits `global-filter-change` event with `{ value }`

### Exports (filters/index.ts)
All components and types re-exported:
- `ColumnTextFilter`
- `ColumnNumberFilter`, `NumberRangeValue`
- `ColumnDateFilter`, `DateRangeValue`
- `ColumnSelectFilter`, `SelectFilterOption`
- `GlobalSearch`

## Deviations from Plan

None - plan executed exactly as written.

## Key Implementation Details

### Event Emission Pattern
All filter components emit standardized events:
```typescript
// Column filters
this.dispatchEvent(new CustomEvent('filter-change', {
  detail: { columnId: this.columnId, value: filterValue },
  bubbles: true,
  composed: true,
}));

// Global search
this.dispatchEvent(new CustomEvent('global-filter-change', {
  detail: { value: this.value || '' },
  bubbles: true,
  composed: true,
}));
```

### Debounce Pattern
Text filter and global search use debounce to avoid excessive updates:
```typescript
private debounceTimeout?: ReturnType<typeof setTimeout>;

private handleInput(e: Event): void {
  clearTimeout(this.debounceTimeout);
  this.debounceTimeout = setTimeout(() => {
    this.dispatchEvent(...);
  }, this.debounceDelay);
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  clearTimeout(this.debounceTimeout);
}
```

## Verification Results

| Check | Status |
|-------|--------|
| Build succeeds | PASS |
| filters/ has 5 filter files + index | PASS |
| All emit filter-change or global-filter-change | PASS |
| All exported from main index.ts | PASS |
| lui-input dependency used correctly | PASS |
| lui-select dependency used correctly | PASS |

## Next Phase Readiness

**Ready for Plan 04: Filter UI Integration**
- All filter components are standalone and reusable
- Events match DataTable's expected format from Plan 01
- Components can be composed into column header dropdowns or toolbars
