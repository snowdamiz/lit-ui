/**
 * JSX type declarations for lui-data-table custom element.
 * Provides type support for React, Vue, and Svelte.
 *
 * Note: DataTable component will be added in Plan 02.
 * This file is a placeholder for JSX integration.
 */

import type { RowData } from '@tanstack/lit-table';
import type { ColumnDef, DataTableState, LoadingState } from './types.js';

// Common attributes for lui-data-table
interface LuiDataTableAttributes<TData extends RowData = RowData> {
  /** Column definitions */
  columns?: ColumnDef<TData>[];
  /** Row data array */
  data?: TData[];
  /** Controlled state object */
  state?: DataTableState;
  /** Loading state indicator */
  loading?: LoadingState;
  /** Enable row selection */
  selectable?: boolean;
  /** Enable multi-row selection */
  multiselect?: boolean;
  /** Fixed row height in pixels (required for virtual scrolling) */
  'row-height'?: number;
  /** Number of rows to overscan above/below viewport */
  overscan?: number;
  /** Accessible label for the table */
  'aria-label'?: string;
  /** Enable server-side mode */
  manual?: boolean;
  /** Total row count for server-side pagination */
  'row-count'?: number;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-data-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & LuiDataTableAttributes,
        HTMLElement
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-data-table': import('vue').DefineComponent<LuiDataTableAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-data-table': LuiDataTableAttributes & {
      'on:ui-state-change'?: (e: CustomEvent) => void;
      'on:ui-row-click'?: (e: CustomEvent) => void;
      'on:ui-cell-click'?: (e: CustomEvent) => void;
      'on:ui-selection-change'?: (e: CustomEvent) => void;
    };
  }
}

export {};
