/**
 * Core type definitions for @lit-ui/data-table
 *
 * These types extend TanStack Table's type system with LitUI-specific
 * extensions while maintaining full compatibility with the TanStack ecosystem.
 */

import type {
  ColumnDef as TanStackColumnDef,
  RowData,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
  ColumnOrderState,
  ColumnPinningState,
  ExpandedState,
  ColumnSizingState,
  ColumnSizingInfoState,
} from '@tanstack/lit-table';

// Re-export TanStack types for convenience
export type {
  RowData,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
  ColumnOrderState,
  ColumnPinningState,
  ExpandedState,
  ColumnSizingState,
  ColumnSizingInfoState,
};

/**
 * Filter type indicator for column-specific filter UI.
 *
 * Used in column meta to specify which filter component to render:
 * - 'text': Text input with case-insensitive contains (TanStack `includesString`)
 * - 'number': Min/max range inputs (TanStack `inNumberRange`)
 * - 'date': Date range picker (custom range filter)
 * - 'select': Multi-select dropdown (TanStack `arrIncludesSome`)
 */
export type FilterType = 'text' | 'number' | 'date' | 'select';

/**
 * LitUI-specific column meta extensions.
 *
 * These will be added to TanStack's column meta for features
 * like inline editing, custom filter rendering, and column pinning UI.
 *
 * @template TData - Row data type
 */
export interface LitUIColumnMeta<TData extends RowData = RowData> {
  // Future LitUI-specific extensions:
  // - editable?: boolean | ((row: TData) => boolean)
  // - editComponent?: 'input' | 'select' | 'date' | TemplateResult
  // - filterComponent?: TemplateResult
  // - pinnedPosition?: 'left' | 'right'

  /**
   * Filter type for this column. Determines which filter UI component is rendered.
   * If not specified, filtering is determined by column's enableColumnFilter.
   */
  filterType?: FilterType;

  /**
   * Options for select-type filters (enum columns).
   * Each string represents a valid value that can be selected.
   */
  filterOptions?: string[];

  /**
   * Enable or disable filtering for this column. Defaults to true for filterable columns.
   * Set to false to explicitly disable filtering even when table has filtering enabled.
   */
  enableFiltering?: boolean;

  /** Placeholder to satisfy generic constraint */
  _litui?: TData;
}

/**
 * Column definition type alias.
 *
 * Re-exports TanStack's ColumnDef directly. LitUI-specific extensions
 * should be added via the column's `meta` property using LitUIColumnMeta.
 *
 * @template TData - Row data type
 * @template TValue - Cell value type (optional, defaults to unknown)
 *
 * @example
 * ```typescript
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: 'Name',
 *     meta: {
 *       // LitUI extensions go in meta
 *     },
 *   },
 * ];
 * ```
 */
export type ColumnDef<TData extends RowData, TValue = unknown> = TanStackColumnDef<TData, TValue>;

/**
 * Table state for controlled mode.
 *
 * When using the data table in controlled mode, this interface
 * represents the complete state that can be managed externally.
 *
 * @example
 * ```typescript
 * const [tableState, setTableState] = useState<DataTableState>({
 *   sorting: [{ id: 'name', desc: false }],
 *   pagination: { pageIndex: 0, pageSize: 25 },
 * });
 *
 * <lui-data-table
 *   .state=${tableState}
 *   @state-change=${(e) => setTableState(e.detail)}
 * />
 * ```
 */
export interface DataTableState {
  /** Current sorting configuration */
  sorting?: SortingState;
  /** Active column filters */
  columnFilters?: ColumnFiltersState;
  /** Global filter string */
  globalFilter?: string;
  /** Pagination state (page index and size) */
  pagination?: PaginationState;
  /** Row selection state (row IDs mapped to selection) */
  rowSelection?: RowSelectionState;
  /** Column visibility state */
  columnVisibility?: VisibilityState;
  /** Column order state */
  columnOrder?: ColumnOrderState;
  /** Column pinning state */
  columnPinning?: ColumnPinningState;
  /** Expanded rows state (for sub-rows) */
  expanded?: ExpandedState;
}

/**
 * Loading state indicator for the data table.
 *
 * - `idle`: No loading in progress
 * - `loading`: Initial data fetch (shows skeleton)
 * - `updating`: Data refresh/filter (shows overlay on existing content)
 *
 * @remarks
 * Distinguishing between 'loading' and 'updating' provides better UX:
 * - Initial load shows skeleton rows to indicate structure
 * - Updates preserve existing content with subtle loading indicator
 */
export type LoadingState = 'idle' | 'loading' | 'updating';

/**
 * Empty state type indicator.
 *
 * - `no-data`: No data exists (show "No data available" message)
 * - `no-matches`: Data exists but filters exclude all rows
 *
 * @remarks
 * Different empty states warrant different messaging:
 * - `no-data`: "No data available" with add/import actions
 * - `no-matches`: "No results match your filters" with clear filter action
 */
export type EmptyStateType = 'no-data' | 'no-matches';

/**
 * Row height configuration.
 *
 * Fixed row heights are essential for virtual scrolling performance.
 * The virtualizer uses this value for position calculations.
 */
export type RowHeight = number;

/**
 * Default row height in pixels.
 * Based on research: 48px provides good balance of density and readability.
 */
export const DEFAULT_ROW_HEIGHT: RowHeight = 48;

/**
 * Virtualizer overscan configuration.
 * Number of rows to render above/below the visible viewport.
 */
export const DEFAULT_OVERSCAN = 5;

/**
 * Event detail for state change events.
 *
 * Emitted when table state changes (sorting, filtering, pagination, etc.)
 */
export interface DataTableStateChangeEvent {
  /** The complete new state */
  state: DataTableState;
  /** Which specific property changed */
  changedProperty: keyof DataTableState;
}

/**
 * Event detail for row selection events.
 */
export interface DataTableSelectionEvent<TData extends RowData> {
  /** Currently selected rows */
  selectedRows: TData[];
  /** Row selection state (row IDs) */
  rowSelection: RowSelectionState;
}

/**
 * Event detail for row click events.
 */
export interface DataTableRowClickEvent<TData extends RowData> {
  /** The clicked row data */
  row: TData;
  /** Row index in the current view */
  rowIndex: number;
  /** Original mouse event */
  originalEvent: MouseEvent;
}

/**
 * Event detail for cell click events.
 */
export interface DataTableCellClickEvent<TData extends RowData, TValue = unknown> {
  /** The clicked row data */
  row: TData;
  /** Row index in the current view */
  rowIndex: number;
  /** Column ID */
  columnId: string;
  /** Cell value */
  value: TValue;
  /** Original mouse event */
  originalEvent: MouseEvent;
}

/**
 * Configuration for server-side data handling.
 *
 * When `manual` is true, the table operates in server-side mode:
 * - Sorting, filtering, pagination are handled externally
 * - Table emits events for state changes
 * - Parent component fetches data and provides updated rows
 */
export interface ServerSideConfig {
  /** Enable server-side mode */
  manual: boolean;
  /** Total row count (for pagination calculations) */
  rowCount?: number;
  /** Total page count (alternative to rowCount) */
  pageCount?: number;
}

/**
 * Event detail for sort change events.
 *
 * Emitted when sorting state changes via column header clicks.
 * Includes both TanStack format and REST API helper format.
 */
export interface SortChangeEvent {
  /** Current sorting state array (TanStack format) */
  sorting: SortingState;
  /** Helper format for REST APIs */
  sortParams: Array<{ column: string; direction: 'asc' | 'desc' }>;
}

/**
 * Event detail for selection change events.
 *
 * Emitted when row selection state changes via checkbox interactions.
 * Provides both the raw selection state and convenience arrays.
 */
export interface SelectionChangeEvent<TData extends RowData = RowData> {
  /** Row selection state (row IDs mapped to boolean) */
  rowSelection: RowSelectionState;
  /** Array of currently selected row objects */
  selectedRows: TData[];
  /** Number of selected rows */
  selectedCount: number;
  /** Reason for the change */
  reason?: 'user' | 'select-all' | 'clear' | 'filter-changed';
}

/**
 * Event detail for pagination change events.
 *
 * Emitted when pagination state changes via navigation or page size selection.
 * Used for both client-side and server-side pagination modes.
 */
export interface PaginationChangeEvent {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Current page size */
  pageSize: number;
  /** Total page count (if known) */
  pageCount?: number;
}

/**
 * Event detail for filter change events.
 *
 * Emitted when column filters or global filter changes.
 * Provides both TanStack state and change context for handlers.
 */
export interface FilterChangeEvent {
  /** Current column filters state (TanStack format) */
  columnFilters: ColumnFiltersState;
  /** Current global filter string */
  globalFilter: string;
  /** Column ID that changed (undefined if global filter changed) */
  changedColumn?: string;
  /** True if the global filter changed, false if a column filter changed */
  isGlobalFilter: boolean;
}

/**
 * Event detail for column visibility change events.
 *
 * Emitted when column visibility changes via the column picker.
 */
export interface ColumnVisibilityChangeEvent {
  /** Current column visibility state (column ID -> isVisible) */
  columnVisibility: VisibilityState;
}

/**
 * Event detail for column order change events.
 *
 * Emitted when column order changes via drag-and-drop reordering.
 */
export interface ColumnOrderChangeEvent {
  /** Current column order state (array of column IDs in display order) */
  columnOrder: ColumnOrderState;
}

// =============================================================================
// Async Data Callback Types
// =============================================================================

/**
 * Parameters passed to the async data callback.
 * Contains current table state for server-side operations.
 */
export interface DataCallbackParams {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Current page size */
  pageSize: number;
  /** Current sorting state */
  sorting: SortingState;
  /** Current column filters */
  columnFilters: ColumnFiltersState;
  /** Current global filter string */
  globalFilter: string;
}

/**
 * Result returned from the async data callback.
 */
export interface DataCallbackResult<TData> {
  /** Row data for current page */
  data: TData[];
  /** Total row count across all pages */
  totalRowCount: number;
  /** Optional page count (calculated from totalRowCount/pageSize if not provided) */
  pageCount?: number;
}

/**
 * Async data callback function type.
 * @param params - Current table state
 * @param signal - AbortSignal for request cancellation
 * @returns Promise resolving to data result
 */
export type DataCallback<TData> = (
  params: DataCallbackParams,
  signal: AbortSignal
) => Promise<DataCallbackResult<TData>>;

/**
 * Error state for async data fetching.
 */
export interface DataTableErrorState {
  /** Error message to display */
  message: string;
  /** Whether retry is possible */
  canRetry: boolean;
}

// =============================================================================
// Column Preferences Types (COL-07, COL-08)
// =============================================================================

/**
 * Column preferences for persistence.
 * Stores column sizing, order, and visibility state.
 */
export interface ColumnPreferences {
  /** Column widths keyed by column ID */
  columnSizing: ColumnSizingState;
  /** Column display order (array of column IDs) */
  columnOrder: ColumnOrderState;
  /** Column visibility keyed by column ID (false = hidden) */
  columnVisibility: VisibilityState;
}

/**
 * Event detail for column preferences change.
 * Emitted when any column customization changes.
 */
export interface ColumnPreferencesChangeEvent extends ColumnPreferences {
  /** Table persistence key for identification */
  tableId: string;
}
