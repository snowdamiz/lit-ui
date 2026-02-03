---
phase: 64
plan: 02
subsystem: data-table
tags: [column-visibility, popover, checkbox, toolbar]
dependency-graph:
  requires: [61-02]
  provides: [column-picker, visibility-state]
  affects: [64-03, 64-04]
tech-stack:
  added: []
  patterns:
    - lui-popover for dropdown positioning
    - TanStack VisibilityState for column hide/show
    - toolbar-slots for extensibility
key-files:
  created:
    - packages/data-table/src/column-picker.ts
  modified:
    - packages/data-table/src/data-table.ts
    - packages/data-table/src/types.ts
    - packages/data-table/src/index.ts
decisions:
  - key: column-picker-as-function
    choice: Export renderColumnPicker as function, not component
    rationale: Allows flexible placement in different toolbar layouts
  - key: column-visibility-callback
    choice: onColumnVisibilityChange follows TanStack updater pattern
    rationale: Consistent with other state callbacks (sorting, filtering, etc)
  - key: toolbar-slots
    choice: toolbar-start and toolbar-end slots for extensibility
    rationale: Users can add custom controls without modifying DataTable
metrics:
  duration: 4m 30s
  completed: 2026-02-03
---

# Phase 64 Plan 02: Column Visibility Picker Summary

Column visibility picker using lui-popover for toggling column show/hide.

## One-liner

Column picker dropdown with lui-popover + lui-checkbox for visibility toggles integrated into DataTable toolbar.

## What Was Built

### Column Visibility State Integration
- Added `columnVisibility: VisibilityState` property to DataTable for external control
- Added `showColumnPicker` boolean property to enable picker button in toolbar
- Integrated `columnVisibility` into TanStack table state options
- Added `onColumnVisibilityChange` callback that dispatches `ui-column-visibility-change` event
- Added `ColumnVisibilityChangeEvent` type to types.ts

### Column Picker Component
- Created `column-picker.ts` with `renderColumnPicker<TData>` function
- Uses `lui-popover` with `placement="bottom-end"` for dropdown positioning
- Uses `lui-checkbox` for each column's visibility toggle
- Filters to only show columns where `column.getCanHide()` returns true
- Gets column label from `columnDef.header` (string) or falls back to `column.id`
- Exported `columnPickerStyles` CSS for inclusion in DataTable styles

### Toolbar Integration
- Added `renderToolbar(table)` method to DataTable
- Toolbar renders when `showColumnPicker=true`
- Provides `slot="toolbar-start"` and `slot="toolbar-end"` for custom controls
- Column picker renders in toolbar-end slot as default content
- Added toolbar CSS (flex layout, 8px gap, border-bottom)

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 2329201 | feat | Add column visibility state to DataTable |
| 9266420 | feat | Create column picker component |
| 9b010f7 | feat | Integrate column picker into DataTable toolbar |

## Key Code Snippets

### Column Visibility State
```typescript
// DataTable property
@property({ type: Object })
columnVisibility: VisibilityState = {};

// TanStack table options
state: {
  columnVisibility: this.columnVisibility,
},
onColumnVisibilityChange: (updater) => {
  const newVisibility = typeof updater === 'function'
    ? updater(this.columnVisibility)
    : updater;
  this.columnVisibility = newVisibility;
  this.dispatchColumnVisibilityChange(newVisibility);
},
```

### Column Picker Usage
```html
<lui-data-table
  .columns=${columns}
  .data=${data}
  show-column-picker
  @ui-column-visibility-change=${handleVisibilityChange}
></lui-data-table>
```

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Build succeeds: `pnpm build` completes without errors
- TypeScript compiles: Types exported correctly, no compilation errors
- Column picker component created with proper lui-popover/lui-checkbox integration
- Toolbar renders when showColumnPicker=true
- columnPickerStyles included in DataTable static styles
- ui-column-visibility-change event dispatched on visibility changes

## Next Phase Readiness

**Ready for 64-03 (Column Ordering):**
- Toolbar infrastructure in place for drag handles or reorder controls
- TanStack table state integration pattern established
- Event dispatch pattern established for state changes

**Dependencies satisfied:**
- VisibilityState re-exported from types.ts
- Column picker demonstrates TanStack column API usage (getAllLeafColumns, getCanHide, toggleVisibility)
