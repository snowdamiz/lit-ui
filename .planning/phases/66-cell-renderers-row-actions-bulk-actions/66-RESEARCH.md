# Phase 66: Cell Renderers, Row Actions & Bulk Actions - Research

**Researched:** 2026-02-04
**Domain:** Data table cell customization, row-level actions, and bulk operations
**Confidence:** HIGH

## Summary

This phase adds three major feature groups to `lui-data-table`: (1) custom and built-in cell renderers, (2) row actions with kebab menu and hover-reveal, and (3) bulk actions with a floating toolbar and confirmation dialog. All three features build on top of the existing TanStack Table integration, Lit template rendering via `flexRender`, and the established column `meta` extension pattern (`LitUIColumnMeta`).

The existing architecture already supports custom cell rendering via TanStack's `cell` property in column definitions (any function returning a Lit `html` template works via `flexRender`). The main implementation work involves: (a) providing a library of built-in cell renderer factory functions, (b) creating a row actions column similar to the existing row edit actions column but generalized for arbitrary actions via a kebab/dropdown menu, and (c) building a floating bulk actions toolbar that appears when rows are selected, leveraging the existing selection infrastructure.

**Primary recommendation:** Implement cell renderers as standalone factory functions (like `createSelectionColumn`), row actions as a special column appended to the grid (like the existing row edit actions column), and bulk actions as a new section rendered between the selection banner and body that uses `position: sticky` for scroll persistence.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/lit-table` | ^8.21.3 | Headless table state, `flexRender`, column defs | Already in use; `cell` property accepts Lit `html` templates |
| `@tanstack/lit-virtual` | ^3.13.6 | Virtual scrolling | Already in use; cell renderers must work with recycled rows |
| `lit` | ^3.3.2 | Component framework, `html` tagged templates | Already in use; all renderers return `TemplateResult` |
| `@lit-ui/popover` | workspace | Kebab menu dropdown for row actions | Existing component with Floating UI positioning |
| `@lit-ui/dialog` | workspace | Confirmation dialog for bulk delete | Existing component with `showModal()` and focus trapping |
| `@lit-ui/button` | workspace | Action buttons in toolbar and row actions | Existing component for consistent styling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lit-ui/core` | workspace | `TailwindElement` base class, CSS utilities | All new modules extend this pattern |
| `lit/directives/ref.js` | (bundled with lit) | Element references for focus management | Auto-focus on edit inputs pattern already established |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom popover-based kebab menu | Dedicated `<lui-dropdown-menu>` component | No dropdown-menu component exists yet; `lui-popover` with a simple menu list inside is sufficient for row actions |
| Inline confirmation dialog in data-table | External `lui-dialog` component | Using `lui-dialog` keeps concerns separated and leverages native `<dialog>` focus trapping; no need to hand-roll modal |
| Built-in renderers as classes | Built-in renderers as factory functions | Factory functions match the `createSelectionColumn` pattern already established; classes would add unnecessary overhead for what are essentially template factories |

## Architecture Patterns

### Recommended File Structure
```
packages/data-table/src/
├── data-table.ts             # Main component (modify: add row actions column, bulk toolbar)
├── types.ts                  # Types (modify: add RowAction, BulkAction, CellRenderer types)
├── cell-renderers.ts         # NEW: Built-in cell renderer factories
├── row-actions.ts            # NEW: Row actions column factory + kebab menu template
├── bulk-actions.ts           # NEW: Bulk actions toolbar template + styles
├── inline-editing.ts         # Existing (no changes needed)
├── selection-column.ts       # Existing (reference pattern for column factories)
├── column-picker.ts          # Existing (reference pattern for toolbar rendering)
└── index.ts                  # Modify: export new modules
```

### Pattern 1: Cell Renderer Factory Functions
**What:** Standalone functions that return a `cell` function compatible with TanStack column definitions. Each factory takes configuration options and returns a function with signature `(info: CellContext<TData, TValue>) => TemplateResult`.
**When to use:** For all built-in cell renderers (CELL-03). Developers use them in column definitions.
**Why:** Matches the established `createSelectionColumn` pattern. Works naturally with `flexRender`. No wrapper component overhead.

```typescript
// Source: Established pattern in selection-column.ts + TanStack cell API
import { html, type TemplateResult } from 'lit';
import type { CellContext, RowData } from '@tanstack/lit-table';

// Factory function pattern for built-in renderers
export function badgeCellRenderer<TData extends RowData>(
  options?: {
    colorMap?: Record<string, string>;
    variant?: 'solid' | 'outline';
  }
): (info: CellContext<TData, unknown>) => TemplateResult {
  return (info) => {
    const value = String(info.getValue() ?? '');
    const color = options?.colorMap?.[value] ?? 'default';
    return html`<span class="cell-badge cell-badge--${color}">${value}</span>`;
  };
}

// Usage in column definition:
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: badgeCellRenderer({ colorMap: { active: 'green', inactive: 'red' } }),
  },
];
```

### Pattern 2: Custom Cell Renderer via Column Definition (CELL-01, CELL-02)
**What:** TanStack Table already supports custom `cell` functions. The developer passes a function that receives `{ row, column, getValue, table }` context and returns a Lit `html` template.
**When to use:** Always — this is the existing TanStack mechanism. Phase 66 needs to document and potentially add helper types, but `flexRender` already handles this in `renderCell()`.
**Why:** Zero new infrastructure needed for custom renderers. `flexRender(cell.column.columnDef.cell, cell.getContext())` in the existing `renderCell` method already works.

```typescript
// Source: Existing data-table.ts line 1987 + TanStack Lit table docs
// Custom renderer - already works via existing flexRender in renderCell()
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => html`
      <div class="flex items-center gap-2">
        <img src="${info.row.original.avatar}" class="w-6 h-6 rounded-full" />
        <span>${info.getValue()}</span>
      </div>
    `,
  },
];
```

### Pattern 3: Row Actions Column (Display Column)
**What:** A display column (no data accessor) appended to the end of the grid, containing action buttons or a kebab menu. Follows the same pattern as the existing row edit actions column (72px fixed width, appended to `grid-template-columns`).
**When to use:** When `enableRowActions` is true on the data table. Actions are configured via an `actions` property or `rowActions` column definition.
**Why:** The existing `enableRowEditing` + 72px column pattern proves this architecture works. Row actions generalizes it.

```typescript
// Source: Existing renderRowEditActions pattern in inline-editing.ts
// Row actions follow the same append-to-grid pattern as row edit actions
// In getGridTemplateColumns():
const rowActionsSuffix = this.enableRowActions ? ' 72px' : '';

// In renderAllRows/renderVirtualizedBody:
${this.enableRowActions ? html`
  <div class="data-table-cell row-actions-cell" role="gridcell">
    ${this.renderRowActions(row)}
  </div>
` : nothing}
```

### Pattern 4: Hover-Reveal with Keyboard Accessibility (ACT-02)
**What:** Action buttons hidden by default, shown on row `:hover` and `:focus-within`. Buttons remain in DOM but visually hidden with `opacity: 0; visibility: hidden`.
**When to use:** When `hoverReveal` option is enabled for row actions.
**Why:** CSS-only approach using `:hover` + `:focus-within` ensures keyboard accessibility. Never use `display: none` — it prevents focus traversal.

```css
/* Source: Accessibility best practices for hover-reveal */
.row-actions-cell .row-actions-content {
  opacity: 1; /* Default: always visible */
}

/* Hover-reveal mode */
:host([hover-reveal-actions]) .row-actions-cell .row-actions-content {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}

:host([hover-reveal-actions]) .data-table-row:hover .row-actions-content,
:host([hover-reveal-actions]) .data-table-row:focus-within .row-actions-content {
  opacity: 1;
  visibility: visible;
}

/* Touch devices: always show (no hover) */
@media (hover: none) {
  :host([hover-reveal-actions]) .row-actions-cell .row-actions-content {
    opacity: 1;
    visibility: visible;
  }
}
```

### Pattern 5: Bulk Actions Floating Toolbar (BULK-01 through BULK-05)
**What:** A sticky toolbar that appears between the header and body when rows are selected. Shows selected count and configurable action buttons.
**When to use:** When `enableSelection` is true AND the developer configures `bulkActions`.
**Why:** Similar to the existing `renderSelectionBanner` but with action buttons. Position: sticky keeps it visible during scroll. Rendered in the same slot as the selection banner but replaces/augments it.

```typescript
// Source: Existing renderSelectionBanner pattern + bulk actions UX research
// Renders between header and body, similar to selection banner
private renderBulkActionsToolbar(table: Table<TData>): TemplateResult {
  const selectedCount = Object.keys(this.rowSelection).length;
  if (selectedCount === 0 || !this.bulkActions?.length) return html``;

  return html`
    <div class="bulk-actions-toolbar" role="toolbar" aria-label="Bulk actions">
      <span class="bulk-actions-count">${selectedCount} selected</span>
      ${this.bulkActions.map(action => html`
        <button
          type="button"
          class="bulk-action-btn ${action.variant === 'destructive' ? 'destructive' : ''}"
          @click=${() => this.handleBulkAction(action)}
        >
          ${action.label}
        </button>
      `)}
      <button type="button" class="bulk-action-clear" @click=${() => this.clearSelection()}>
        Clear selection
      </button>
    </div>
  `;
}
```

### Pattern 6: Confirmation Dialog for Destructive Bulk Actions (BULK-04)
**What:** When a destructive bulk action (like delete) is triggered, show a confirmation dialog before dispatching the event. Uses `lui-dialog` rendered in the data table's shadow DOM.
**When to use:** When a bulk action has `requiresConfirmation: true`.
**Why:** Uses existing `lui-dialog` component. The dialog is rendered within the data table component to keep it self-contained. Follows Cloudscape pattern: always use a modal, show what's being deleted, make irreversibility clear.

```typescript
// Source: Cloudscape delete confirmation pattern + existing lui-dialog API
// Dialog rendered in data-table shadow DOM
private _pendingBulkAction: BulkAction | null = null;

private handleBulkAction(action: BulkAction): void {
  if (action.requiresConfirmation) {
    this._pendingBulkAction = action;
    // Dialog visibility controlled by _pendingBulkAction != null
    return;
  }
  this.dispatchBulkAction(action);
}

// In render():
${this._pendingBulkAction ? html`
  <lui-dialog
    open
    size="sm"
    @close=${() => { this._pendingBulkAction = null; }}
  >
    <span slot="title">${this._pendingBulkAction.confirmTitle ?? 'Confirm Action'}</span>
    <p>${this._pendingBulkAction.confirmMessage ?? `Are you sure? This will affect ${selectedCount} items.`}</p>
    <div slot="footer">
      <lui-button variant="outline" @click=${() => { this._pendingBulkAction = null; }}>Cancel</lui-button>
      <lui-button variant="destructive" @click=${() => { this.dispatchBulkAction(this._pendingBulkAction!); this._pendingBulkAction = null; }}>
        ${this._pendingBulkAction.confirmLabel ?? 'Confirm'}
      </lui-button>
    </div>
  </lui-dialog>
` : nothing}
```

### Anti-Patterns to Avoid
- **Cell renderers as custom elements:** Don't create `<lui-cell-badge>`, `<lui-cell-progress>` etc. as separate custom elements. The 48px fixed row height and virtual scrolling make this problematic (registration overhead, shadow DOM nesting). Use plain `html` template functions instead.
- **Kebab menu via native `<select>` or custom dropdown:** Don't hand-roll a dropdown for the kebab menu. Use `lui-popover` with a simple list inside for positioning, focus management, and light dismiss.
- **Bulk toolbar via external slot:** Don't require developers to provide their own bulk actions toolbar via a slot. The toolbar should be built-in with a configuration API (`bulkActions` property), similar to how pagination is built-in.
- **`display: none` for hover-reveal actions:** Never use `display: none` to hide row actions. It breaks keyboard focus traversal and screen reader discovery. Use `opacity` + `visibility` instead.
- **Separate shadow DOM for row actions:** Don't render the kebab menu as a child custom element in each row. Render it as part of the container shadow DOM (consistent with row/cell rendering decision).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning for kebab menu | Custom CSS absolute positioning | `lui-popover` with Floating UI | Handles viewport collision, scroll, RTL, nested popovers |
| Confirmation modal for delete | Custom overlay div | `lui-dialog` with native `<dialog>` | Focus trapping, Escape key, backdrop click, ARIA, animations |
| Cell value formatting (date, number) | Custom formatter functions | `Intl.DateTimeFormat`, `Intl.NumberFormat` | Locale-aware, standard API, no dependencies |
| Touch device detection for hover-reveal | JavaScript user-agent sniffing | `@media (hover: none)` CSS media query | Standards-based, automatically correct, no JS needed |
| Selection count tracking | Manual state counting | `Object.keys(this.rowSelection).length` | Already available via existing selection infrastructure |

**Key insight:** The data table already has every infrastructure piece needed (selection state, column meta system, grid-template-columns appending, banner rendering area). This phase is about wiring new features into established patterns, not building new infrastructure.

## Common Pitfalls

### Pitfall 1: Stale Cell Renderers with Virtual Scrolling (CELL-04)
**What goes wrong:** Custom cell renderers capture stale row data via closures when rows are recycled by the virtualizer. A renderer might display data from a previous row when scrolled back into view.
**Why it happens:** TanStack Virtual recycles DOM positions. If the cell renderer function captures `row.original` in a closure at render time but the DOM node is repositioned, the data can become stale.
**How to avoid:** Always use `info.getValue()` or `info.row.original` directly from the `CellContext` parameter — never capture external state. The `flexRender(cell.column.columnDef.cell, cell.getContext())` call in `renderCell()` already provides fresh context on every render cycle. Built-in renderers must never close over mutable external state.
**Warning signs:** Data in cells doesn't update when scrolling up/down rapidly through a large dataset.

### Pitfall 2: Row Actions Column Conflicting with Row Edit Actions
**What goes wrong:** Both `enableRowEditing` and `enableRowActions` add fixed-width columns to the end of the grid. If both are enabled simultaneously, the grid-template-columns calculation breaks or creates two separate action columns.
**How to avoid:** Design the row actions column as a unified column that conditionally renders either the kebab menu (view mode) or save/cancel buttons (edit mode). OR: ensure the grid-template-columns calculation accounts for both. The recommended approach is to make row actions and row edit actions mutually exclusive in the same column slot — the action column shows edit trigger + kebab in view mode, and save/cancel in edit mode.
**Warning signs:** Extra blank column, misaligned cells, or missing action buttons.

### Pitfall 3: Popover Inside Virtual Scroll Container Gets Clipped
**What goes wrong:** The kebab menu popover opens inside the scroll container and gets clipped by `overflow: hidden/auto`.
**Why it happens:** The popover's positioned element is inside the scroll container, which has `overflow: auto`.
**How to avoid:** `lui-popover` uses the native Popover API (`popover="auto"`) which renders in the top layer, above all overflow containers. On non-supporting browsers, it falls back to `position: fixed`. Both approaches avoid clipping. Verify this works by testing kebab menus on rows near the bottom of the visible viewport.
**Warning signs:** Popover content cut off at the edge of the scroll container.

### Pitfall 4: Bulk Actions Toolbar Z-Index and Scroll Interaction
**What goes wrong:** The bulk actions toolbar disappears behind the header or body content when scrolling, or doesn't stay visible during scroll.
**Why it happens:** Incorrect z-index stacking or not using `position: sticky`.
**How to avoid:** Render the bulk actions toolbar between the header and the body inside the container. Use `position: sticky; top: 0;` on the toolbar with a z-index between the header (z-index: 10) and body content. Alternatively, render it as a separate section outside the scroll container (like the existing selection banner position).
**Warning signs:** Toolbar scrolls away or overlaps with header.

### Pitfall 5: Keyboard Navigation Column Count Mismatch
**What goes wrong:** Adding row actions column breaks keyboard arrow navigation because `navManager.setBounds` doesn't account for the new column.
**Why it happens:** The existing code calculates `colCount` based on `enableSelection` and `enableRowEditing` but doesn't account for `enableRowActions`.
**How to avoid:** Update the `colCount` calculation in the `updated()` lifecycle method to include `enableRowActions`: `if (this.enableRowActions) colCount += 1;`
**Warning signs:** Arrow-right at the last data column doesn't navigate to the actions cell, or navigates beyond it to nothing.

### Pitfall 6: Confirmation Dialog Event Propagation
**What goes wrong:** The dialog's close event propagates up and triggers unintended behavior on the data table.
**Why it happens:** `lui-dialog` fires a `close` CustomEvent with `composed: true`, which crosses shadow DOM boundaries.
**How to avoid:** Use `@close=${(e: Event) => { e.stopPropagation(); this._pendingBulkAction = null; }}` on the dialog to prevent the close event from propagating to parent listeners.
**Warning signs:** Data table reacts to dialog close as if it were a table-level event.

## Code Examples

Verified patterns from the existing codebase:

### Built-in Cell Renderers (CELL-03)

```typescript
// Source: New cell-renderers.ts module, following selection-column.ts pattern
import { html, type TemplateResult } from 'lit';
import type { CellContext, RowData } from '@tanstack/lit-table';

/** Type for a cell renderer function */
export type CellRenderer<TData extends RowData, TValue = unknown> =
  (info: CellContext<TData, TValue>) => TemplateResult;

/** Text renderer with optional truncation (default behavior, explicit version) */
export function textCellRenderer<TData extends RowData>(): CellRenderer<TData, string> {
  return (info) => {
    const value = info.getValue() ?? '';
    return html`<span class="cell-text">${value}</span>`;
  };
}

/** Number renderer with locale formatting */
export function numberCellRenderer<TData extends RowData>(
  options?: { locale?: string; decimals?: number; prefix?: string; suffix?: string }
): CellRenderer<TData, number> {
  const formatter = new Intl.NumberFormat(options?.locale, {
    minimumFractionDigits: options?.decimals ?? 0,
    maximumFractionDigits: options?.decimals ?? 2,
  });
  return (info) => {
    const value = info.getValue();
    if (value == null) return html`<span class="cell-number cell-empty">—</span>`;
    const formatted = `${options?.prefix ?? ''}${formatter.format(value)}${options?.suffix ?? ''}`;
    return html`<span class="cell-number">${formatted}</span>`;
  };
}

/** Date renderer with locale formatting */
export function dateCellRenderer<TData extends RowData>(
  options?: { locale?: string; format?: Intl.DateTimeFormatOptions }
): CellRenderer<TData, string | Date> {
  const defaultFormat: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat(options?.locale, options?.format ?? defaultFormat);
  return (info) => {
    const value = info.getValue();
    if (!value) return html`<span class="cell-date cell-empty">—</span>`;
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return html`<span class="cell-date cell-empty">—</span>`;
    return html`<span class="cell-date">${formatter.format(date)}</span>`;
  };
}

/** Boolean renderer with check/cross icon */
export function booleanCellRenderer<TData extends RowData>(
  options?: { trueLabel?: string; falseLabel?: string }
): CellRenderer<TData, boolean> {
  return (info) => {
    const value = info.getValue();
    if (value) {
      return html`
        <span class="cell-boolean cell-boolean--true" aria-label="${options?.trueLabel ?? 'Yes'}">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 8 7 12 13 4"/>
          </svg>
        </span>`;
    }
    return html`
      <span class="cell-boolean cell-boolean--false" aria-label="${options?.falseLabel ?? 'No'}">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
        </svg>
      </span>`;
  };
}

/** Badge renderer with color mapping */
export function badgeCellRenderer<TData extends RowData>(
  options?: { colorMap?: Record<string, string>; defaultColor?: string }
): CellRenderer<TData, string> {
  return (info) => {
    const value = String(info.getValue() ?? '');
    const color = options?.colorMap?.[value] ?? options?.defaultColor ?? 'default';
    return html`<span class="cell-badge cell-badge--${color}">${value}</span>`;
  };
}

/** Progress bar renderer */
export function progressCellRenderer<TData extends RowData>(
  options?: { max?: number; showLabel?: boolean; color?: string }
): CellRenderer<TData, number> {
  const max = options?.max ?? 100;
  return (info) => {
    const value = info.getValue() ?? 0;
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    return html`
      <div class="cell-progress" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}">
        <div class="cell-progress-bar" style="width: ${percent}%; ${options?.color ? `background: ${options.color}` : ''}"></div>
        ${options?.showLabel ? html`<span class="cell-progress-label">${Math.round(percent)}%</span>` : nothing}
      </div>`;
  };
}

/** Avatar renderer with initials fallback */
export function avatarCellRenderer<TData extends RowData>(
  options?: { nameKey?: string; size?: number }
): CellRenderer<TData, string> {
  const size = options?.size ?? 28;
  return (info) => {
    const src = info.getValue();
    const name = options?.nameKey ? String(info.row.original[options.nameKey as keyof typeof info.row.original] ?? '') : '';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    if (src) {
      return html`<img class="cell-avatar" src="${src}" alt="${name}" width="${size}" height="${size}" />`;
    }
    return html`<span class="cell-avatar cell-avatar--initials" style="width:${size}px;height:${size}px">${initials}</span>`;
  };
}
```

### Row Actions Configuration Types

```typescript
// Source: New types in types.ts
/** Configuration for a single row action */
export interface RowAction<TData extends RowData = RowData> {
  /** Unique action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon (SVG template or string) */
  icon?: TemplateResult | string;
  /** Action variant for styling */
  variant?: 'default' | 'destructive';
  /** Whether this action is disabled for a given row */
  disabled?: boolean | ((row: TData) => boolean);
  /** Whether to hide this action for a given row */
  hidden?: boolean | ((row: TData) => boolean);
}

/** Event detail for row action events */
export interface RowActionEvent<TData extends RowData = RowData> {
  /** Action ID that was triggered */
  actionId: string;
  /** Row data */
  row: TData;
  /** Row ID */
  rowId: string;
}

/** Configuration for a bulk action */
export interface BulkAction {
  /** Unique action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: TemplateResult | string;
  /** Action variant */
  variant?: 'default' | 'destructive';
  /** Whether this action requires confirmation dialog */
  requiresConfirmation?: boolean;
  /** Custom confirmation dialog title */
  confirmTitle?: string;
  /** Custom confirmation dialog message (receives selected count) */
  confirmMessage?: string | ((count: number) => string);
  /** Custom confirmation button label */
  confirmLabel?: string;
}

/** Event detail for bulk action events */
export interface BulkActionEvent<TData extends RowData = RowData> {
  /** Action ID that was triggered */
  actionId: string;
  /** Array of selected row data */
  selectedRows: TData[];
  /** Row selection state */
  rowSelection: RowSelectionState;
  /** Number of selected rows */
  selectedCount: number;
}
```

### Row Actions Kebab Menu Template

```typescript
// Source: New row-actions.ts module, pattern from inline-editing.ts renderRowEditActions
import { html, css, nothing, type TemplateResult } from 'lit';
import type { RowData, Row } from '@tanstack/lit-table';
import type { RowAction } from './types.js';

/** SVG icon for the kebab (three dots) menu trigger */
const kebabIcon = html`
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
    <circle cx="8" cy="3" r="1.5"/>
    <circle cx="8" cy="8" r="1.5"/>
    <circle cx="8" cy="13" r="1.5"/>
  </svg>
`;

/**
 * Render row action buttons.
 * For 1-2 actions: render inline icon buttons.
 * For 3+ actions: render a kebab menu trigger that opens a popover dropdown.
 */
export function renderRowActions<TData extends RowData>(
  row: Row<TData>,
  actions: RowAction<TData>[],
  onAction: (actionId: string, row: Row<TData>) => void
): TemplateResult {
  // Filter out hidden actions
  const visibleActions = actions.filter(a => {
    if (typeof a.hidden === 'function') return !a.hidden(row.original);
    return !a.hidden;
  });

  if (visibleActions.length === 0) return html``;

  // For few actions: render inline buttons
  if (visibleActions.length <= 2) {
    return html`
      <div class="row-actions-inline">
        ${visibleActions.map(action => {
          const isDisabled = typeof action.disabled === 'function'
            ? action.disabled(row.original)
            : action.disabled;
          return html`
            <button
              type="button"
              class="row-action-btn ${action.variant === 'destructive' ? 'destructive' : ''}"
              ?disabled=${isDisabled}
              @click=${(e: MouseEvent) => { e.stopPropagation(); onAction(action.id, row); }}
              aria-label="${action.label}"
              title="${action.label}"
            >
              ${action.icon ?? action.label}
            </button>
          `;
        })}
      </div>
    `;
  }

  // For many actions: render kebab menu with popover
  const menuId = `row-actions-menu-${row.id}`;
  return html`
    <lui-popover placement="bottom-end" .offset=${4}>
      <button
        slot="trigger"
        type="button"
        class="row-action-kebab"
        @click=${(e: MouseEvent) => e.stopPropagation()}
        aria-label="Row actions"
        aria-haspopup="menu"
      >
        ${kebabIcon}
      </button>
      <div role="menu" id="${menuId}" class="row-actions-menu">
        ${visibleActions.map(action => {
          const isDisabled = typeof action.disabled === 'function'
            ? action.disabled(row.original)
            : action.disabled;
          return html`
            <button
              type="button"
              role="menuitem"
              class="row-actions-menu-item ${action.variant === 'destructive' ? 'destructive' : ''}"
              ?disabled=${isDisabled}
              @click=${(e: MouseEvent) => {
                e.stopPropagation();
                onAction(action.id, row);
                // Close popover after action
                const popover = (e.target as HTMLElement).closest('lui-popover');
                if (popover && 'open' in popover) (popover as any).open = false;
              }}
            >
              ${action.icon ? html`<span class="menu-item-icon">${action.icon}</span>` : nothing}
              <span class="menu-item-label">${action.label}</span>
            </button>
          `;
        })}
      </div>
    </lui-popover>
  `;
}
```

### Pre-built Common Row Actions (ACT-04)

```typescript
// Source: New factory functions in row-actions.ts
/** Create a pre-built "View" action */
export function createViewAction<TData extends RowData>(
  options?: { label?: string; icon?: TemplateResult }
): RowAction<TData> {
  return {
    id: 'view',
    label: options?.label ?? 'View',
    icon: options?.icon ?? html`<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 3C4.5 3 1.7 5.1.3 8c1.4 2.9 4.2 5 7.7 5s6.3-2.1 7.7-5C14.3 5.1 11.5 3 8 3zm0 8.3A3.3 3.3 0 1 1 8 4.7a3.3 3.3 0 0 1 0 6.6zM8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>`,
  };
}

/** Create a pre-built "Edit" action */
export function createEditAction<TData extends RowData>(
  options?: { label?: string; icon?: TemplateResult }
): RowAction<TData> {
  return {
    id: 'edit',
    label: options?.label ?? 'Edit',
    icon: options?.icon ?? html`<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M12.1 1.9a1.5 1.5 0 0 1 2.1 2.1L5.6 12.6l-3.2.8.8-3.2L12.1 1.9z"/></svg>`,
  };
}

/** Create a pre-built "Delete" action (destructive variant) */
export function createDeleteAction<TData extends RowData>(
  options?: { label?: string; icon?: TemplateResult }
): RowAction<TData> {
  return {
    id: 'delete',
    label: options?.label ?? 'Delete',
    variant: 'destructive',
    icon: options?.icon ?? html`<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`,
  };
}
```

### Integration in data-table.ts renderCell (how custom renderers work with existing code)

```typescript
// Source: Existing data-table.ts renderCell method — NO CHANGES NEEDED for CELL-01/CELL-02
// flexRender already handles custom cell functions:
// Line 1987: const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
//
// Custom Lit templates in column.cell work out of the box:
// { accessorKey: 'name', cell: (info) => html`<b>${info.getValue()}</b>` }
// flexRender returns the TemplateResult directly.
//
// For CELL-04 (virtual scrolling compatibility):
// flexRender is called fresh on every render cycle inside virtualItems.map(),
// so cell context is always current. No stale data risk as long as renderers
// read from info (CellContext) and not from closed-over external state.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom element per cell renderer | Template function per cell renderer | TanStack Table v8 (2022) | Massive perf improvement — no element registration overhead per cell |
| `display: none` for hover actions | `opacity` + `visibility` with `:focus-within` | WCAG 2.1 (2018) | Required for keyboard accessibility |
| Custom dropdown overlay | Native Popover API (`popover="auto"`) | Chrome 114, Firefox 125, Safari 17 (2023-2024) | Top-layer rendering, no overflow clipping, built-in light dismiss |
| Custom modal for confirmations | Native `<dialog>` with `showModal()` | Wide browser support (2022+) | Built-in focus trapping, backdrop, top-layer stacking |
| Action buttons always visible | Hover-reveal + `:focus-within` + `@media (hover: none)` | Progressive enhancement | Cleaner UI on desktop, always-visible on touch devices |

**Deprecated/outdated:**
- `role="application"` on tables: Not needed; ARIA grid role is sufficient
- Custom focus trapping libraries for dialogs: `<dialog>` native element handles this

## Open Questions

1. **Row Actions + Row Edit Actions coexistence**
   - What we know: Both features append a fixed-width column. Currently `enableRowEditing` adds 72px.
   - What's unclear: Should they share a single action column or have separate columns? When editing is active, should the kebab menu be hidden?
   - Recommendation: Merge into a single actions column. In view mode: show kebab menu (or inline actions). When the row enters edit mode (if row editing is also enabled): show save/cancel buttons. This avoids two action columns and keeps the grid width stable. The column width may need to increase to ~96px if both edit trigger and kebab are shown simultaneously.

2. **Bulk actions toolbar position relative to selection banner**
   - What we know: The selection banner (`renderSelectionBanner`) shows "X items on this page selected. Select all Y items." The bulk actions toolbar needs to show action buttons.
   - What's unclear: Should they be separate UI elements or combined?
   - Recommendation: Replace the selection banner with the bulk actions toolbar when bulk actions are configured. The toolbar includes the selected count, action buttons, AND the "select all" link if applicable. When no bulk actions are configured, fall back to the existing selection banner.

3. **Cell renderer styles scope**
   - What we know: All rendering happens in the data table's shadow DOM. CSS for cell renderers must be in the data table's static styles.
   - What's unclear: How to allow developers to customize built-in renderer styles without deep shadow DOM styling.
   - Recommendation: Use CSS custom properties (e.g., `--cell-badge-bg-green`, `--cell-progress-color`) on the `lui-data-table` host element. This follows the existing theming pattern with `--ui-data-table-*` variables. Also consider accepting class strings or style objects in renderer options.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/data-table/src/data-table.ts` — current rendering architecture, `renderCell()`, `renderAllRows()`, `renderVirtualizedBody()`, `getGridTemplateColumns()`, `renderSelectionBanner()`
- Existing codebase: `packages/data-table/src/types.ts` — `LitUIColumnMeta`, `ColumnDef`, event types
- Existing codebase: `packages/data-table/src/inline-editing.ts` — `renderRowEditActions()` pattern, `renderEditInput()` pattern, CSS styles
- Existing codebase: `packages/data-table/src/selection-column.ts` — `createSelectionColumn()` factory pattern
- Existing codebase: `packages/popover/src/popover.ts` — Popover API with Floating UI positioning
- Existing codebase: `packages/dialog/src/dialog.ts` — Dialog with native `<dialog>`, `showModal()`, focus trapping
- [TanStack Table Column Defs Guide](https://tanstack.com/table/v8/docs/guide/column-defs) — `cell` property, `flexRender`, `meta`
- [TanStack Table Cell API](https://tanstack.com/table/v8/docs/api/core/cell) — `getContext()`, `getValue()`, `renderValue()`
- [TanStack Table Lit Adapter](https://tanstack.com/table/v8/docs/framework/lit/lit-table) — Lit-specific `flexRender` usage

### Secondary (MEDIUM confidence)
- [Carbon Design System — Data Table](https://carbondesignsystem.com/components/data-table/usage/) — Overflow menu on hover + focus, batch action bar pattern
- [Cloudscape Design System — Delete with Confirmation](https://cloudscape.design/patterns/resource-management/delete/delete-with-additional-confirmation/) — Modal confirmation pattern for destructive actions
- [PatternFly — Bulk Selection Pattern](https://www.patternfly.org/patterns/bulk-selection/) — Bulk selector in toolbar, split button pattern
- [CSS `:focus-within`](https://www.scottohara.me/blog/2017/05/14/focus-within.html) — Keyboard-accessible hover-reveal pattern
- [BOIA — Hover Actions Accessibility](https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation) — WCAG compliance for hover-reveal patterns

### Tertiary (LOW confidence)
- [UX Movement — Better UX for Bulk Actions](https://uxmovement.substack.com/p/a-better-ux-approach-to-bulk-actions) — UX patterns for floating toolbar placement
- [Eleken — Bulk Action UX Guidelines](https://www.eleken.co/blog-posts/bulk-actions-ux) — General UX patterns
- [shadcn/ui Data Table Docs](https://ui.shadcn.com/docs/components/data-table) — React reference for row actions dropdown pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries already in use; no new dependencies needed
- Architecture: HIGH — Follows established patterns (factory functions, grid column appending, banner positioning)
- Cell renderers: HIGH — `flexRender` + custom `cell` function is the canonical TanStack approach
- Row actions: HIGH — Mirrors existing `renderRowEditActions` pattern exactly
- Bulk actions: MEDIUM — Toolbar positioning and selection banner integration need validation
- Pitfalls: HIGH — Virtual scrolling, overflow clipping, and accessibility patterns well-documented

**Research date:** 2026-02-04
**Valid until:** 2026-03-06 (30 days — stable domain, all based on existing codebase patterns)
