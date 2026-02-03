// @lit-ui/data-table - High-performance data table with virtual scrolling
/// <reference path="./jsx.d.ts" />

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
