---
phase: 66-cell-renderers-row-actions-bulk-actions
plan: 03
subsystem: data-table-bulk-actions
tags: [bulk-actions, toolbar, confirmation-dialog, selection, events]
dependencies:
  requires: [66-01, 66-02]
  provides: [bulk-actions-toolbar, confirmation-dialog, ui-bulk-action-event]
  affects: []
tech-stack:
  added: []
  patterns: [standalone-render-module, native-html-dialog, factory-callback-pattern]
key-files:
  created:
    - packages/data-table/src/bulk-actions.ts
  modified:
    - packages/data-table/src/data-table.ts
    - packages/data-table/src/index.ts
decisions:
  - id: native-confirmation-dialog
    choice: "Native HTML elements for confirmation dialog instead of lui-dialog"
    reason: "Avoids dependency overhead, matches project pattern (native button for retry, native select for page size)"
  - id: toolbar-replaces-banner
    choice: "Bulk toolbar replaces selection banner when configured"
    reason: "Toolbar provides superset functionality (count, select-all, clear, actions)"
  - id: alertdialog-role
    choice: "role=alertdialog for confirmation with aria-modal=true"
    reason: "Correct ARIA role for confirmations requiring user response"
metrics:
  duration: "2m 39s"
  completed: 2026-02-05
  tasks: 2/2
  commits: 2
---

# Phase 66 Plan 03: Bulk Actions Summary

**Bulk actions toolbar with configurable action buttons and native confirmation dialog for destructive operations on selected rows.**

## What Was Built

### bulk-actions.ts (new module)
- `renderBulkActionsToolbar()` - Renders floating toolbar with selected count, action buttons, optional select-all link, and clear selection button
- `renderConfirmationDialog()` - Renders native HTML confirmation dialog (overlay + modal) for destructive bulk actions
- `resolveMessage()` helper - Resolves confirmation message from string or function(count)
- `bulkActionsStyles` - Complete CSS with primary-colored toolbar, button variants, dialog overlay, dark mode support, focus-visible outlines

### DataTable Integration (data-table.ts)
- `bulkActions` property - Array of BulkAction configurations
- `_pendingBulkAction` state - Tracks pending destructive action for confirmation dialog
- `clearSelection()` - Resets all row selection via TanStack table.resetRowSelection()
- `handleBulkAction()` - Routes action to confirmation dialog or immediate dispatch
- `dispatchBulkAction()` - Dispatches `ui-bulk-action` CustomEvent with selected row data
- `renderSelectionBanner()` modified - Renders bulk toolbar when bulkActions configured + rows selected, falls back to original banner otherwise
- Confirmation dialog rendered in render() after body, before sr-only announcement

### Package Exports (index.ts)
- `renderBulkActionsToolbar`, `renderConfirmationDialog`, `bulkActionsStyles` exported from package entry

## Requirements Satisfied

| Requirement | Description | Status |
|-------------|-------------|--------|
| BULK-01 | Floating toolbar appears when rows selected + bulkActions configured | Done |
| BULK-02 | Toolbar shows count of selected items | Done |
| BULK-03 | Developer configures action buttons via bulkActions property | Done |
| BULK-04 | Destructive action with requiresConfirmation shows dialog before executing | Done |
| BULK-05 | Bulk actions dispatch ui-bulk-action event with selected row data | Done |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 1006bf0 | feat | Create bulk-actions.ts module |
| bab53da | feat | Integrate bulk actions into DataTable and update exports |

## Deviations from Plan

None - plan executed exactly as written.

## API Reference

### BulkAction Configuration
```typescript
interface BulkAction {
  id: string;
  label: string;
  icon?: TemplateResult | string;
  variant?: 'default' | 'destructive';
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string | ((count: number) => string);
  confirmLabel?: string;
}
```

### ui-bulk-action Event Detail
```typescript
interface BulkActionEvent<TData> {
  actionId: string;
  selectedRows: TData[];
  rowSelection: RowSelectionState;
  selectedCount: number;
}
```

### Usage Example
```html
<lui-data-table
  .columns=${columns}
  .data=${data}
  enable-selection
  .bulkActions=${[
    { id: 'export', label: 'Export' },
    { id: 'delete', label: 'Delete', variant: 'destructive',
      requiresConfirmation: true,
      confirmMessage: (n) => `Delete ${n} items permanently?` }
  ]}
  @ui-bulk-action=${(e) => handleBulk(e.detail)}
></lui-data-table>
```

## Phase 66 Completion

This plan completes Phase 66: Cell Renderers, Row Actions & Bulk Actions.

All three plans delivered:
1. **66-01**: Cell renderer factory functions (text, number, date, boolean, badge, progress, avatar) + row actions rendering (inline/kebab) + pre-built action factories
2. **66-02**: Row actions integration into DataTable (rowActions property, hoverRevealActions, unified actions column, ui-row-action event, special 'edit' bridge)
3. **66-03**: Bulk actions toolbar + confirmation dialog + ui-bulk-action event

Requirements satisfied: CELL-01 through CELL-07, ACT-01 through ACT-05, BULK-01 through BULK-05.
