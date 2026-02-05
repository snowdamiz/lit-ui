---
phase: 68-package-cli-documentation
plan: 04
subsystem: docs
tags: [docs, data-table, api-reference, accessibility, advanced-demos, css-vars, events]

# Dependency graph
requires:
  - phase: 68-03
    provides: DataTablePage.tsx with 5 core demos, DataTableDemo wrapper, JSX declarations
affects:
  - none (final plan in phase 68)
provides:
  - Complete DataTablePage.tsx with 11 interactive demos covering all features
  - Full API reference with 44 properties, 13 events, 2 slots, 18 CSS custom properties
  - Comprehensive accessibility documentation (ARIA roles, keyboard navigation, screen reader)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - DataTableDemoWithRef wrapper for imperative method calls via external ref
    - ServerSideDemoWrapper for async dataCallback simulation
    - ExportDemoWrapper combining button + table ref for CSV export demo

# File tracking
key-files:
  modified:
    - apps/docs/src/pages/components/DataTablePage.tsx

# Decisions
decisions:
  - id: demo-wrapper-variants
    decision: Created DataTableDemoWithRef and ServerSideDemoWrapper for demos needing external refs or custom lifecycle
    rationale: Export demo needs imperative exportCsv() call; server-side demo needs one-time dataCallback setup in useEffect
  - id: ref-type-cast
    decision: Cast tableRef to React.Ref<HTMLElement> to satisfy stricter TypeScript ref typing
    rationale: RefObject<HTMLElement | null> not assignable to Ref<HTMLElement> in JSX intrinsic elements

# Metrics
metrics:
  duration: 5m 58s
  completed: 2026-02-05
---

# Phase 68 Plan 04: Advanced Demos, API Reference & Accessibility Summary

Complete DataTablePage.tsx with all advanced feature demos, full API reference, and accessibility documentation for the data table component.

## What Was Done

### Task 1: Advanced Feature Demos

Added 6 interactive demo sections covering all major advanced data table features:

1. **Column Customization** - Demo with `enable-column-resizing`, `show-column-picker`, `enable-column-reorder` attributes. Resizable columns with initial `size` values.

2. **Inline Editing** - Demo with columns having `meta: { editable: true, editType: 'text'|'select' }` and `enable-row-editing` attribute. Includes select-type edit options for the Role column.

3. **Row Actions** - Demo with `rowActions` property (view, edit, delete) and `hover-reveal-actions`. 3 actions trigger kebab dropdown rendering.

4. **Expandable Rows** - Demo with `single-expand` attribute. Preview only (renderDetailContent requires Lit template, not React JSX).

5. **Server-Side Data** - Demo with `ServerSideDemoWrapper` that simulates async data fetch with 500ms delay, sorting, and pagination via `dataCallback`.

6. **CSV Export** - Demo with `ExportDemoWrapper` that renders an Export CSV button calling `exportCsv({ filename: 'users.csv' })` via ref.

Supporting components added:
- `DataTableDemoWithRef`: variant accepting external `tableRef` for imperative method calls
- `ServerSideDemoWrapper`: self-contained wrapper with useEffect for dataCallback setup
- `ExportDemoWrapper`: combines export button + DataTableDemoWithRef

### Task 2: API Reference, Events, CSS Properties, Slots & Accessibility

**Properties (44 total):**
- Core (10): columns, data, loading, aria-label, max-height, row-height, skeleton-rows, empty-state-type, no-data-message, no-matches-message
- Sorting (2): sorting, manual-sorting
- Selection (5): enable-selection, rowSelection, row-id-key, total-row-count, preserve-selection-on-filter
- Filtering (3): columnFilters, global-filter, manual-filtering
- Pagination (4): pagination, manual-pagination, page-count, pageSizeOptions
- Column Customization (10): enable-column-resizing, columnSizing, column-resize-mode, columnVisibility, show-column-picker, columnOrder, enable-column-reorder, sticky-first-column, persistence-key, onColumnPreferencesChange
- Editing (1): enable-row-editing
- Actions (3): rowActions, hover-reveal-actions, bulkActions
- Export (1): onExport
- Expandable (3): renderDetailContent, expanded, single-expand
- Async (2): dataCallback, debounce-delay

**Events (13):**
ui-sort-change, ui-selection-change, ui-filter-change, ui-pagination-change, ui-column-visibility-change, ui-column-order-change, ui-column-preferences-change, ui-column-preferences-reset, ui-cell-edit, ui-row-edit, ui-row-action, ui-bulk-action, ui-expanded-change

**Slots (2):** toolbar-start, toolbar-end

**CSS Custom Properties (18):** Full theming surface from --ui-data-table-header-bg through --ui-data-table-skeleton-highlight

**Accessibility:**
- ARIA Roles table: grid, row, columnheader, gridcell, region, status
- Keyboard Navigation table: Arrow keys, Home/End, Ctrl+Home/End, Page Up/Down, Enter/F2, Escape, Space, Tab
- Screen Reader Support: cell announcements, sort announcements, selection state, loading state
- W3C APG Compliance: grid pattern with roving tabindex

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript ref type error**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `RefObject<HTMLElement | null>` not assignable to `Ref<HTMLElement>` in JSX IntrinsicElements
- **Fix:** Cast `tableRef as React.Ref<HTMLElement>` in DataTableDemoWithRef
- **Files modified:** DataTablePage.tsx (line 222)
- **Commit:** 169e030

## Verification

- [x] 11+ ExampleBlock demos (counted 12 including code-only examples)
- [x] PropsTable renders 44 properties with types and defaults
- [x] Events table lists all 13 custom events with detail types
- [x] CSS custom properties table lists 18 theming variables with defaults
- [x] Slots table lists toolbar-start and toolbar-end
- [x] Accessibility section covers ARIA roles, keyboard navigation, and screen reader support
- [x] PrevNextNav has correct prev (Date Range Picker) and next (Dialog) links
- [x] Page total is 1395 lines (above 800 minimum)
- [x] TypeScript compilation passes cleanly

## Next Phase Readiness

Phase 68 is complete. All 4 plans executed:
- 68-01: Package finalization (peer deps, element registration, JSX declarations)
- 68-02: CLI integration (registry, starter template, npm mapping)
- 68-03: Documentation page with 5 core demos
- 68-04: Advanced demos + full API reference + accessibility docs

The data table component is fully packaged, CLI-installable, and comprehensively documented.
