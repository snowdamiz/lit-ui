/**
 * JSX type declarations for lui-data-table custom element.
 * Provides type support for React, Vue, and Svelte.
 *
 * Covers all 44 @property attributes and 14 custom events
 * added across phases 61-67.
 */

import type { RowData, ColumnDef as TanStackColumnDef } from '@tanstack/lit-table';
import type {
  ColumnDef,
  DataTableState,
  LoadingState,
  EmptyStateType,
  SortingState,
  RowSelectionState,
  ColumnFiltersState,
  PaginationState,
  VisibilityState,
  ColumnOrderState,
  ColumnSizingState,
  ExpandedState,
  DataCallback,
  RowAction,
  BulkAction,
  DetailContentRenderer,
  ColumnPreferencesChangeEvent,
  ServerExportParams,
  SortChangeEvent,
  SelectionChangeEvent,
  FilterChangeEvent,
  PaginationChangeEvent,
  ColumnVisibilityChangeEvent,
  ColumnOrderChangeEvent,
  ColumnPreferences,
  CellEditEvent,
  RowEditEvent,
  RowActionEvent,
  BulkActionEvent,
  ExpandedChangeEvent,
} from './types.js';

import type { DataTable } from './data-table.js';

// =============================================================================
// Attribute Interface
// =============================================================================

/**
 * All public properties for lui-data-table.
 *
 * Properties with HTML attributes use kebab-case attribute names.
 * Properties with `attribute: false` use camelCase (JS-only, no HTML attribute).
 */
interface LuiDataTableAttributes {
  // ---------------------------------------------------------------------------
  // Core (Phase 61)
  // ---------------------------------------------------------------------------

  /** Column definitions array (JS property only) */
  columns?: ColumnDef<any>[];
  /** Row data array (JS property only) */
  data?: any[];
  /** Loading state: 'idle' | 'loading' | 'updating' */
  loading?: LoadingState;

  // ---------------------------------------------------------------------------
  // Layout & Appearance
  // ---------------------------------------------------------------------------

  /** Fixed row height in pixels for virtualization @default 48 */
  'row-height'?: number;
  /** Number of skeleton rows during initial loading @default 5 */
  'skeleton-rows'?: number;
  /** Maximum height of the table body scroll container @default '400px' */
  'max-height'?: string;
  /** Empty state type: 'no-data' | 'no-matches' */
  'empty-state-type'?: EmptyStateType;
  /** Custom message for no-data empty state */
  'no-data-message'?: string;
  /** Custom message for no-matches empty state */
  'no-matches-message'?: string;
  /** Accessible label for the grid @default 'Data table' */
  'aria-label'?: string;

  // ---------------------------------------------------------------------------
  // Sorting (Phase 62)
  // ---------------------------------------------------------------------------

  /** Current sorting state array (JS property only) */
  sorting?: SortingState;
  /** Enable manual/server-side sorting mode */
  'manual-sorting'?: boolean;

  // ---------------------------------------------------------------------------
  // Selection (Phase 62)
  // ---------------------------------------------------------------------------

  /** Enable row selection with checkbox column */
  'enable-selection'?: boolean;
  /** Current row selection state (JS property only) */
  rowSelection?: RowSelectionState;
  /** Property key to use as row ID for selection tracking @default 'id' */
  'row-id-key'?: string;
  /** Total number of rows across all pages for "Select all X" display */
  'total-row-count'?: number;
  /** Preserve selection when filters change @default false */
  'preserve-selection-on-filter'?: boolean;

  // ---------------------------------------------------------------------------
  // Filtering (Phase 63)
  // ---------------------------------------------------------------------------

  /** Column filters state array (JS property only) */
  columnFilters?: ColumnFiltersState;
  /** Global filter string */
  'global-filter'?: string;
  /** Enable manual/server-side filtering mode */
  'manual-filtering'?: boolean;

  // ---------------------------------------------------------------------------
  // Pagination (Phase 63)
  // ---------------------------------------------------------------------------

  /** Current pagination state (JS property only) */
  pagination?: PaginationState;
  /** Enable manual/server-side pagination mode */
  'manual-pagination'?: boolean;
  /** Total page count for server-side pagination */
  'page-count'?: number;
  /** Available page size options (JS property only) @default [10, 25, 50, 100] */
  pageSizeOptions?: number[];

  // ---------------------------------------------------------------------------
  // Column Resizing (Phase 64)
  // ---------------------------------------------------------------------------

  /** Enable column resizing with drag handles @default true */
  'enable-column-resizing'?: boolean;
  /** Column sizing state (JS property only) */
  columnSizing?: ColumnSizingState;
  /** Column resize mode: 'onChange' | 'onEnd' @default 'onChange' */
  'column-resize-mode'?: 'onChange' | 'onEnd';

  // ---------------------------------------------------------------------------
  // Column Visibility (Phase 64)
  // ---------------------------------------------------------------------------

  /** Column visibility state (JS property only) */
  columnVisibility?: VisibilityState;
  /** Show column picker button in toolbar */
  'show-column-picker'?: boolean;

  // ---------------------------------------------------------------------------
  // Column Ordering (Phase 64)
  // ---------------------------------------------------------------------------

  /** Column order state array (JS property only) */
  columnOrder?: ColumnOrderState;
  /** Enable column reordering via drag-and-drop @default false */
  'enable-column-reorder'?: boolean;

  // ---------------------------------------------------------------------------
  // Sticky Column (Phase 64)
  // ---------------------------------------------------------------------------

  /** Enable sticky first column during horizontal scroll @default false */
  'sticky-first-column'?: boolean;

  // ---------------------------------------------------------------------------
  // Column Preferences Persistence (Phase 64)
  // ---------------------------------------------------------------------------

  /** Unique key for localStorage persistence */
  'persistence-key'?: string;
  /** Callback for server-side preference persistence (JS property only) */
  onColumnPreferencesChange?: (prefs: ColumnPreferencesChangeEvent) => void;

  // ---------------------------------------------------------------------------
  // Async Data (Phase 63)
  // ---------------------------------------------------------------------------

  /** Async data callback for server-side data fetching (JS property only) */
  dataCallback?: DataCallback<any>;
  /** Debounce delay in ms for filter-triggered fetches @default 300 */
  'debounce-delay'?: number;

  // ---------------------------------------------------------------------------
  // Inline Editing (Phase 65)
  // ---------------------------------------------------------------------------

  /** Enable row-level edit mode with save/cancel buttons */
  'enable-row-editing'?: boolean;

  // ---------------------------------------------------------------------------
  // Row Actions (Phase 66)
  // ---------------------------------------------------------------------------

  /** Array of row actions for the actions column (JS property only) */
  rowActions?: RowAction<any>[];
  /** Hide row action buttons until row is hovered or focused */
  'hover-reveal-actions'?: boolean;

  // ---------------------------------------------------------------------------
  // Bulk Actions (Phase 66)
  // ---------------------------------------------------------------------------

  /** Array of bulk actions for the toolbar (JS property only) */
  bulkActions?: BulkAction[];

  // ---------------------------------------------------------------------------
  // Export (Phase 67)
  // ---------------------------------------------------------------------------

  /** Server-side export callback (JS property only) */
  onExport?: (params: ServerExportParams) => void | Promise<void>;

  // ---------------------------------------------------------------------------
  // Expandable Rows (Phase 67)
  // ---------------------------------------------------------------------------

  /** Function to render detail content for expanded rows (JS property only) */
  renderDetailContent?: DetailContentRenderer<any>;
  /** Current expanded state (JS property only) */
  expanded?: ExpandedState;
  /** Only one row can be expanded at a time @default false */
  'single-expand'?: boolean;
}

// =============================================================================
// Event Interface
// =============================================================================

/**
 * Custom events emitted by lui-data-table.
 * All events bubble and are composed (cross shadow DOM boundaries).
 */
interface LuiDataTableEvents {
  /** Sorting state changed via column header click */
  'onui-sort-change'?: (e: CustomEvent<SortChangeEvent>) => void;
  /** Row selection changed via checkbox interaction */
  'onui-selection-change'?: (e: CustomEvent<SelectionChangeEvent>) => void;
  /** Column or global filter changed */
  'onui-filter-change'?: (e: CustomEvent<FilterChangeEvent>) => void;
  /** Pagination state changed via navigation or page size */
  'onui-pagination-change'?: (e: CustomEvent<PaginationChangeEvent>) => void;
  /** Column visibility changed via column picker */
  'onui-column-visibility-change'?: (e: CustomEvent<ColumnVisibilityChangeEvent>) => void;
  /** Column order changed via drag-and-drop */
  'onui-column-order-change'?: (e: CustomEvent<ColumnOrderChangeEvent>) => void;
  /** Column sizing/order/visibility preferences changed */
  'onui-column-preferences-change'?: (e: CustomEvent<ColumnPreferencesChangeEvent>) => void;
  /** Column preferences reset via resetColumnPreferences() */
  'onui-column-preferences-reset'?: (e: CustomEvent) => void;
  /** Cell edit committed with old/new values */
  'onui-cell-edit'?: (e: CustomEvent<CellEditEvent>) => void;
  /** Row edit saved with all changed field values */
  'onui-row-edit'?: (e: CustomEvent<RowEditEvent>) => void;
  /** Row action button clicked */
  'onui-row-action'?: (e: CustomEvent<RowActionEvent>) => void;
  /** Bulk action executed on selected rows */
  'onui-bulk-action'?: (e: CustomEvent<BulkActionEvent>) => void;
  /** Expanded row state changed */
  'onui-expanded-change'?: (e: CustomEvent<ExpandedChangeEvent>) => void;
  /** Select-all requested in server-side pagination mode */
  'onui-select-all-requested'?: (e: CustomEvent<{ totalCount: number }>) => void;
}

// =============================================================================
// React JSX Support
// =============================================================================

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-data-table': React.DetailedHTMLProps<
        React.HTMLAttributes<DataTable> & LuiDataTableAttributes & LuiDataTableEvents,
        DataTable
      >;
    }
  }
}

// =============================================================================
// Vue Support
// =============================================================================

declare module 'vue' {
  export interface GlobalComponents {
    'lui-data-table': import('vue').DefineComponent<
      LuiDataTableAttributes & LuiDataTableEvents
    >;
  }
}

// =============================================================================
// Svelte Support
// =============================================================================

declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-data-table': LuiDataTableAttributes & {
      // Sorting
      'on:ui-sort-change'?: (e: CustomEvent<SortChangeEvent>) => void;
      // Selection
      'on:ui-selection-change'?: (e: CustomEvent<SelectionChangeEvent>) => void;
      'on:ui-select-all-requested'?: (e: CustomEvent<{ totalCount: number }>) => void;
      // Filtering
      'on:ui-filter-change'?: (e: CustomEvent<FilterChangeEvent>) => void;
      // Pagination
      'on:ui-pagination-change'?: (e: CustomEvent<PaginationChangeEvent>) => void;
      // Column customization
      'on:ui-column-visibility-change'?: (e: CustomEvent<ColumnVisibilityChangeEvent>) => void;
      'on:ui-column-order-change'?: (e: CustomEvent<ColumnOrderChangeEvent>) => void;
      'on:ui-column-preferences-change'?: (e: CustomEvent<ColumnPreferencesChangeEvent>) => void;
      'on:ui-column-preferences-reset'?: (e: CustomEvent) => void;
      // Inline editing
      'on:ui-cell-edit'?: (e: CustomEvent<CellEditEvent>) => void;
      'on:ui-row-edit'?: (e: CustomEvent<RowEditEvent>) => void;
      // Row actions
      'on:ui-row-action'?: (e: CustomEvent<RowActionEvent>) => void;
      // Bulk actions
      'on:ui-bulk-action'?: (e: CustomEvent<BulkActionEvent>) => void;
      // Expandable rows
      'on:ui-expanded-change'?: (e: CustomEvent<ExpandedChangeEvent>) => void;
    };
  }
}

export {};
