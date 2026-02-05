// @lit-ui/data-table - High-performance data table with virtual scrolling
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export types
export * from './types.js';

// Re-export useful TanStack utilities for column definitions
export {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
} from '@tanstack/lit-table';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// DataTable component
export { DataTable } from './data-table.js';

// Keyboard navigation utilities
export {
  KeyboardNavigationManager,
  type GridPosition,
  type GridBounds,
} from './keyboard-navigation.js';

// Selection column factory
export { createSelectionColumn } from './selection-column.js';

// Column picker for visibility toggle
export { renderColumnPicker, columnPickerStyles } from './column-picker.js';

// Column preferences persistence
export { savePreferences, loadPreferences, clearPreferences } from './column-preferences.js';

// Pagination components
export * from './pagination/index.js';

// Inline editing utilities
export { renderEditInput, isColumnEditable, renderEditableIndicator, renderRowEditActions, inlineEditingStyles } from './inline-editing.js';

// Cell renderers (built-in + type)
export {
  type CellRenderer,
  textCellRenderer,
  numberCellRenderer,
  dateCellRenderer,
  booleanCellRenderer,
  badgeCellRenderer,
  progressCellRenderer,
  avatarCellRenderer,
  cellRendererStyles,
} from './cell-renderers.js';

// Row actions (rendering + pre-built factories)
export {
  renderRowActions,
  createViewAction,
  createEditAction,
  createDeleteAction,
  rowActionsStyles,
  kebabIcon,
} from './row-actions.js';

// Bulk actions (toolbar + confirmation dialog templates)
export { renderBulkActionsToolbar, renderConfirmationDialog, bulkActionsStyles } from './bulk-actions.js';

// CSV export utility
export { exportToCsv, escapeCsvField, triggerDownload } from './export-csv.js';

// Expandable rows (column factory + styles + detail panel helper)
export { createExpandColumn, expandColumnStyles, renderDetailPanel } from './expandable-rows.js';

// Filter components
export * from './filters/index.js';

// Safe custom element registration with collision detection
import { DataTable } from './data-table.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-data-table')) {
    customElements.define('lui-data-table', DataTable);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-data-table] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-data-table': DataTable;
  }
}
