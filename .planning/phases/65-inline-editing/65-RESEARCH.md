# Phase 65: Inline Editing - Research

**Researched:** 2026-02-04
**Domain:** Data table inline cell/row editing with Lit, TanStack Table, ARIA grid
**Confidence:** HIGH

## Summary

Phase 65 adds inline editing to the data table at two levels: cell-level click-to-edit and row-level edit mode with save/cancel. The existing DataTable component already has the architectural foundation: TanStack Table state management, `LitUIColumnMeta` in `types.ts` with commented-out `editable` and `editComponent` properties, `KeyboardNavigationManager` for grid navigation, and `flexRender` for cell rendering. The editing feature builds on top of these by adding edit state tracking, input rendering within cells, validation, and custom events.

The standard approach for TanStack Table editing uses `table.options.meta` for shared state/functions (like `updateData`, `editedRows`) and `column.columnDef.meta` for per-column configuration (like `editable`, `editType`). This is a headless pattern where TanStack provides no built-in editing primitives -- all editing UI and state must be implemented by the consumer. The existing `LitUIColumnMeta` interface is the correct place to add editing configuration.

**Primary recommendation:** Implement editing as pure state management within the DataTable component (no external libraries), using `LitUIColumnMeta` for column configuration, native HTML inputs for inline editors (not `lui-input`/`lui-select` custom elements due to row height constraints), and the existing `KeyboardNavigationManager` extended with edit-mode awareness.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | ^8.21.3 | Table state management (already installed) | Headless, provides column meta, cell context, row model |
| @tanstack/lit-virtual | ^3.13.6 | Virtual row scrolling (already installed) | Editing must work within virtualized rows |
| lit | ^3.3.2 | Web component rendering (peer dep) | Template rendering for edit cells |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native HTML inputs | N/A | Inline edit controls (input, select, checkbox) | All cell editing - fits within 48px row height |
| Constraint Validation API | N/A | Input validation (required, min/max, pattern) | EDIT-05 inline validation errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native inputs | lui-input/lui-select/lui-checkbox | LitUI components have labels, padding, chrome that won't fit in 48px row. Native inputs are compact, controllable, and sufficient for inline editing |
| Custom validation | Zod/Yup | Over-engineering. Inline cell edits are single-value. Developer provides validate callback in column meta. Keep it simple |
| contenteditable | input elements | contenteditable has inconsistent behavior across browsers, no type safety, and complex selection/caret management. Input elements are predictable |

**Installation:**
```bash
# No new packages needed - all dependencies already present
```

## Architecture Patterns

### Recommended File Structure
```
packages/data-table/src/
├── data-table.ts              # Main component (add edit state + methods)
├── types.ts                   # LitUIColumnMeta (add editable props)
├── inline-editing.ts          # NEW: Edit cell renderers + state utilities
├── keyboard-navigation.ts     # Extend with edit-mode awareness
├── selection-column.ts        # Existing (reference pattern for column factories)
└── ...existing files
```

### Pattern 1: Column Meta for Edit Configuration
**What:** Use `LitUIColumnMeta` to declare columns as editable with their input type and validation.
**When to use:** Every editable column definition.
**Example:**
```typescript
// In types.ts - Extend LitUIColumnMeta
export type EditType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

export interface EditValidationResult {
  valid: boolean;
  message?: string;
}

export interface LitUIColumnMeta<TData extends RowData = RowData> {
  // ...existing filter properties...

  /** Mark column as editable. Boolean or function for conditional editability */
  editable?: boolean | ((row: TData) => boolean);

  /** Input type to render in edit mode */
  editType?: EditType;

  /** Options for select-type edit inputs */
  editOptions?: Array<{ label: string; value: string }>;

  /** Custom validation function called before commit */
  editValidate?: (value: unknown, row: TData) => EditValidationResult | boolean;
}
```

### Pattern 2: Edit State Management via DataTable Properties
**What:** Track editing state as reactive properties within DataTable.
**When to use:** Central state for which cell/row is being edited.
**Example:**
```typescript
// In data-table.ts
interface EditingCell {
  rowId: string;
  columnId: string;
  originalValue: unknown;
}

interface EditingRow {
  rowId: string;
  originalData: Record<string, unknown>;
  pendingValues: Record<string, unknown>;
  errors: Record<string, string>;
}

// Reactive state
@state() private _editingCell: EditingCell | null = null;
@state() private _editingRow: EditingRow | null = null;
@state() private _cellValidationError: string | null = null;
```

### Pattern 3: Cell Rendering with Edit Mode (Inline Editing Module)
**What:** Separate module for edit cell rendering logic to keep DataTable manageable.
**When to use:** When rendering cells that can switch between view/edit modes.
**Example:**
```typescript
// In inline-editing.ts
import { html, nothing, type TemplateResult } from 'lit';
import type { Cell, Row, RowData } from '@tanstack/lit-table';
import type { LitUIColumnMeta, EditType } from './types.js';

export function renderEditInput(
  editType: EditType,
  value: unknown,
  options: { editOptions?: Array<{ label: string; value: string }> },
  handlers: {
    onCommit: (value: unknown) => void;
    onCancel: () => void;
    onInput: (value: unknown) => void;
  }
): TemplateResult {
  switch (editType) {
    case 'text':
      return html`
        <input
          type="text"
          class="cell-edit-input"
          .value=${String(value ?? '')}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter') handlers.onCommit((e.target as HTMLInputElement).value);
            if (e.key === 'Escape') handlers.onCancel();
            e.stopPropagation(); // Prevent grid navigation
          }}
          @blur=${(e: FocusEvent) => handlers.onCommit((e.target as HTMLInputElement).value)}
        />
      `;
    case 'number':
      return html`
        <input
          type="number"
          class="cell-edit-input"
          .value=${String(value ?? '')}
          @keydown=${/* same pattern */}
          @blur=${/* same pattern */}
        />
      `;
    case 'select':
      return html`
        <select
          class="cell-edit-select"
          @change=${(e: Event) => handlers.onCommit((e.target as HTMLSelectElement).value)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Escape') handlers.onCancel();
            e.stopPropagation();
          }}
        >
          ${options.editOptions?.map(opt => html`
            <option value=${opt.value} ?selected=${opt.value === String(value)}>
              ${opt.label}
            </option>
          `)}
        </select>
      `;
    case 'date':
      return html`<input type="date" class="cell-edit-input" .value=${String(value ?? '')} ... />`;
    case 'checkbox':
      return html`<input type="checkbox" class="cell-edit-checkbox" .checked=${Boolean(value)} ... />`;
  }
}
```

### Pattern 4: Row Edit Mode with Save/Cancel
**What:** Entire row switches to edit mode with action buttons.
**When to use:** ROWEDIT-01 through ROWEDIT-06.
**Example:**
```typescript
// Row edit state tracking
@state() private _editingRow: EditingRow | null = null;

// Activate row edit (only one row at a time - ROWEDIT-06)
private activateRowEdit(row: Row<TData>): void {
  const originalData: Record<string, unknown> = {};
  row.getVisibleCells().forEach(cell => {
    originalData[cell.column.id] = cell.getValue();
  });
  this._editingRow = {
    rowId: row.id,
    originalData,
    pendingValues: { ...originalData },
    errors: {},
  };
}

// Row renders save/cancel buttons when in edit mode
private renderRowActions(row: Row<TData>): TemplateResult {
  if (this._editingRow?.rowId === row.id) {
    return html`
      <button class="row-edit-save" @click=${() => this.saveRowEdit()}>
        <svg><!-- check icon --></svg>
      </button>
      <button class="row-edit-cancel" @click=${() => this.cancelRowEdit()}>
        <svg><!-- x icon --></svg>
      </button>
    `;
  }
  return html`
    <button class="row-edit-trigger" @click=${() => this.activateRowEdit(row)}>
      <svg><!-- pencil icon --></svg>
    </button>
  `;
}
```

### Pattern 5: Event Dispatch for Developer Handling
**What:** Emit custom events with old/new values so developers can persist changes.
**When to use:** EDIT-06 and ROWEDIT-05.
**Example:**
```typescript
// Cell edit commit event
export interface CellEditEvent<TData extends RowData = RowData> {
  row: TData;
  rowId: string;
  columnId: string;
  oldValue: unknown;
  newValue: unknown;
}

// Row edit save event
export interface RowEditEvent<TData extends RowData = RowData> {
  row: TData;
  rowId: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
}

// Dispatch from data-table.ts
private commitCellEdit(newValue: unknown): void {
  if (!this._editingCell) return;
  const { rowId, columnId, originalValue } = this._editingCell;

  // Validate if validator provided
  const column = /* get column by ID */;
  const meta = column.columnDef.meta as LitUIColumnMeta;
  if (meta?.editValidate) {
    const result = meta.editValidate(newValue, /* row data */);
    if (result === false || (typeof result === 'object' && !result.valid)) {
      this._cellValidationError = typeof result === 'object' ? result.message ?? 'Invalid' : 'Invalid';
      return; // Stay in edit mode
    }
  }

  this.dispatchEvent(new CustomEvent('ui-cell-edit', {
    detail: { rowId, columnId, oldValue: originalValue, newValue },
    bubbles: true,
    composed: true,
  }));
  this._editingCell = null;
  this._cellValidationError = null;
}
```

### Anti-Patterns to Avoid
- **Using contenteditable:** Inconsistent across browsers, no type safety, painful caret management. Use input elements instead.
- **Embedding full LitUI form components in cells:** `lui-input` has label, padding, and chrome that exceeds the 48px row height. Use compact native inputs styled specifically for inline editing.
- **Mutating data directly:** Never modify the `data` array in the table. Always dispatch events and let the developer update data externally (unidirectional data flow).
- **Multiple cells in edit mode simultaneously:** For cell-level editing, only one cell should be editable at a time. Exit current edit before entering new one.
- **Forgetting to stop event propagation:** Edit inputs must call `e.stopPropagation()` on keyboard events to prevent the grid's `handleKeyDown` from intercepting arrow/enter/escape keys.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input type rendering | Custom input components for each type | Native HTML `<input>` with type attribute + `<select>` | Browser handles validation, date pickers, number spinners. Compact enough for 48px rows |
| Cell focus management | Custom focus tracking for edit mode | Extend existing `KeyboardNavigationManager` with `isEditing` flag | Already handles grid position, roving tabindex, and cell focus. Just needs edit-mode bypass |
| Validation display | Custom tooltip/popover for errors | CSS `::after` pseudo-element or adjacent `<span>` below input | Inline with cell, no z-index/positioning complexity |
| Column editability check | Repeated conditional logic | Helper function `isColumnEditable(column, row)` that checks meta | Centralizes the `boolean | function` pattern |

**Key insight:** Inline editing is fundamentally UI state management, not a library problem. The complexity is in managing transitions between view/edit modes, keyboard interactions, validation flow, and event dispatch. No external library helps with this -- it's all component architecture.

## Common Pitfalls

### Pitfall 1: Keyboard Event Conflicts
**What goes wrong:** Arrow keys, Enter, and Escape are handled by both the grid's `KeyboardNavigationManager` and the inline edit inputs, causing double-handling.
**Why it happens:** The grid's `handleKeyDown` fires on the container, and edit inputs are inside that container.
**How to avoid:** Two strategies (use both):
1. The existing `isInteractiveElement()` check in `handleKeyDown` already returns true for INPUT/SELECT/TEXTAREA -- this prevents grid navigation when focus is on an edit input.
2. Edit input event handlers should call `e.stopPropagation()` to prevent bubbling to the grid container.
**Warning signs:** Pressing arrow keys while typing moves the grid focus instead of moving the cursor in the input.

### Pitfall 2: Virtualized Row Destruction During Edit
**What goes wrong:** User starts editing a cell, scrolls away, the virtual row is destroyed, and edit state is lost.
**Why it happens:** `VirtualizerController` only renders visible rows + overscan buffer. Scrolling far enough removes the editing row from the DOM.
**How to avoid:** When a cell/row is in edit mode, ensure the virtualizer keeps that row in view (scroll to keep it visible), OR store pending edit values in component state (not in the DOM input). The `_editingCell` / `_editingRow` state objects already solve this for value persistence. When the row re-enters the viewport, re-render it in edit mode using the stored state.
**Warning signs:** Edit state disappears after scrolling and coming back.

### Pitfall 3: Edit Mode and Row Height (48px Constraint)
**What goes wrong:** Edit inputs with labels, validation messages, and borders overflow the fixed 48px row height, breaking virtual scroll.
**Why it happens:** Full-featured form components like `lui-input` include labels, helper text, and error messages that add height.
**How to avoid:** Use compact native inputs styled to fit within the cell. Validation errors should use a tooltip or a small text below that doesn't change row height (use `overflow: visible` on the cell, or absolute positioning for error text).
**Warning signs:** Virtual scroll stutters or shows gaps when cells enter edit mode.

### Pitfall 4: Blur-on-Commit Race Condition
**What goes wrong:** User clicks Enter to commit, then blur also fires trying to commit again. Or user clicks another cell, triggering both blur-commit on old cell and click-to-edit on new cell.
**Why it happens:** Multiple events fire in sequence: keydown (Enter) -> blur -> click.
**How to avoid:** Use a flag or `requestAnimationFrame` to debounce commit. After committing via Enter, set `_editingCell = null` immediately so the blur handler finds no active edit. Use `_isCommitting` guard flag.
**Warning signs:** Double event dispatch, flashing edit state, or stale values committed.

### Pitfall 5: Select/Dropdown in Editable Cell
**What goes wrong:** Native `<select>` dropdown opens but clicks on options close the cell edit or are intercepted by the grid.
**Why it happens:** Click events on the select's dropdown options bubble up through the grid.
**How to avoid:** Stop propagation on the select element's click event. Use `@change` instead of `@click` for value capture. The native select's dropdown is browser-managed and works correctly as long as we don't interfere.
**Warning signs:** Selecting a dropdown option immediately exits edit mode without capturing the value.

### Pitfall 6: Row Edit Mode Interaction with Cell Edit Mode
**What goes wrong:** Both cell-level and row-level editing can be active simultaneously, leading to conflicting state.
**Why it happens:** No mutual exclusion between the two modes.
**How to avoid:** When activating cell edit, cancel any active row edit (and vice versa). Add a guard: `if (this._editingRow) return;` in cell edit activation and `if (this._editingCell) this.cancelCellEdit();` in row edit activation.
**Warning signs:** Two different editing UIs visible simultaneously.

## Code Examples

### Example 1: Column Definition with Edit Configuration
```typescript
// Developer-facing API for editable columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      editable: true,
      editType: 'text',
      editValidate: (value) => {
        if (!value || String(value).trim() === '') {
          return { valid: false, message: 'Name is required' };
        }
        return { valid: true };
      },
    },
  },
  {
    accessorKey: 'age',
    header: 'Age',
    meta: {
      editable: true,
      editType: 'number',
      editValidate: (value) => Number(value) >= 0 && Number(value) <= 150,
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      editable: true,
      editType: 'select',
      editOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
  },
  {
    accessorKey: 'verified',
    header: 'Verified',
    meta: {
      editable: true,
      editType: 'checkbox',
    },
  },
  {
    accessorKey: 'joinDate',
    header: 'Join Date',
    meta: {
      editable: (row) => row.status === 'active', // Conditional editability
      editType: 'date',
    },
  },
];
```

### Example 2: DataTable Usage with Inline Editing Events
```html
<lui-data-table
  .columns=${columns}
  .data=${users}
  @ui-cell-edit=${(e: CustomEvent) => {
    const { rowId, columnId, oldValue, newValue } = e.detail;
    // Update data source
    updateUser(rowId, columnId, newValue);
  }}
  @ui-row-edit=${(e: CustomEvent) => {
    const { rowId, oldValues, newValues } = e.detail;
    // Batch update
    updateUserRow(rowId, newValues);
  }}
></lui-data-table>
```

### Example 3: Inline Edit Input Styling (CSS)
```css
/* Compact input that fits within 48px row height */
.cell-edit-input,
.cell-edit-select {
  width: 100%;
  height: 32px;
  padding: 4px 8px;
  font-size: var(--ui-data-table-font-size);
  border: 1px solid var(--color-primary, #3b82f6);
  border-radius: 4px;
  background: var(--ui-data-table-row-bg);
  color: var(--ui-data-table-text-color);
  outline: none;
  box-sizing: border-box;
}

.cell-edit-input:focus,
.cell-edit-select:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.cell-edit-input.has-error {
  border-color: var(--color-destructive, #ef4444);
}

/* Validation error text - positioned to not affect row height */
.cell-edit-error {
  position: absolute;
  bottom: -16px;
  left: 0;
  font-size: 11px;
  color: var(--color-destructive, #ef4444);
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

/* Editable cell hover indicator (EDIT-01) */
.data-table-cell.editable:hover {
  cursor: pointer;
  background: var(--ui-data-table-editable-hover-bg, rgba(59, 130, 246, 0.04));
}

.data-table-cell.editable:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: -2px;
}

/* Pencil icon for editable indicator */
.editable-indicator {
  opacity: 0;
  transition: opacity 0.15s;
  margin-left: 4px;
  color: var(--color-muted-foreground);
}

.data-table-cell.editable:hover .editable-indicator,
.data-table-cell.editable:focus .editable-indicator {
  opacity: 1;
}
```

### Example 4: Keyboard Navigation Extension for Edit Mode
```typescript
// Extend handleKeyDown in data-table.ts
private handleKeyDown(e: KeyboardEvent): void {
  // If a cell is in edit mode, only handle Escape (handled by input itself)
  // The existing isInteractiveElement check already handles this:
  const target = e.target as HTMLElement;
  if (this.isInteractiveElement(target)) {
    return; // Let input handle its own keys
  }

  // Enter key on a cell activates edit mode (EDIT-02)
  if (e.key === 'Enter' && !this._editingCell && !this._editingRow) {
    const pos = this.navManager.getPosition();
    this.activateCellEdit(pos);
    e.preventDefault();
    return;
  }

  // F2 also activates edit (common spreadsheet convention)
  if (e.key === 'F2' && !this._editingCell && !this._editingRow) {
    const pos = this.navManager.getPosition();
    this.activateCellEdit(pos);
    e.preventDefault();
    return;
  }

  // Existing arrow key navigation
  const newPos = this.navManager.handleKeyDown(e);
  if (newPos) {
    e.preventDefault();
    this._focusedCell = newPos;
    this.focusCell(newPos);
    this.announcePosition(newPos);
    if (this.virtualizer) {
      this.virtualizer.getVirtualizer().scrollToIndex(newPos.row, { align: 'auto' });
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| contenteditable for cell editing | Input-based editing with type-specific controls | ~2020 | Better cross-browser consistency, validation, accessibility |
| Full form component embedding | Compact native inputs in cells | Current standard in MUI, AG Grid, Kendo | Fits fixed row heights, avoids visual overflow |
| Direct data mutation in table | Event-driven edit dispatch (developer handles persistence) | TanStack v8+ paradigm | Unidirectional data flow, works with any backend |
| Row-only edit mode | Cell + Row dual edit modes | Modern grid standard | Cell edit for quick fixes, row edit for multi-field changes |

**Deprecated/outdated:**
- contenteditable: Unpredictable behavior, poor accessibility, no built-in validation
- TanStack Table built-in editing: TanStack is intentionally headless -- there is no built-in editing. The old react-table v6 had `editable` flag but v8 removed it in favor of meta-based patterns

## Open Questions

1. **Edit mode activation: single-click vs double-click?**
   - What we know: Requirements say "Click on editable cell activates inline edit mode" (EDIT-02), implying single click. MUI defaults to double-click but supports single-click via configuration.
   - What's unclear: Single click conflicts with cell focus/selection. Double-click is more intentional.
   - Recommendation: Use single click on an already-focused cell (click-to-focus, then click-to-edit) OR Enter key. This avoids conflicts with the first click that sets grid focus. Alternative: use a small edit icon that appears on hover.

2. **Validation error display within 48px row constraint**
   - What we know: Errors must display inline with the cell (EDIT-05). But row height is fixed at 48px for virtualization.
   - What's unclear: How to show error text without changing row height.
   - Recommendation: Use absolute positioning for error text below the cell (overflow visible), with a small red border on the input as primary indicator. The error text overlaps the row below but doesn't affect layout.

3. **Row edit mode row height**
   - What we know: Row edit adds save/cancel buttons (ROWEDIT-03). All cells become inputs (ROWEDIT-02).
   - What's unclear: Whether the row height should expand during edit mode, or buttons fit within 48px.
   - Recommendation: Keep 48px height. Save/cancel buttons are compact icon buttons (24x24px) in the last cell. Inputs are compact (32px height within 48px cell padding).

## Sources

### Primary (HIGH confidence)
- **Codebase analysis:** `packages/data-table/src/data-table.ts` - Complete DataTable component with rendering, state, keyboard nav
- **Codebase analysis:** `packages/data-table/src/types.ts` - LitUIColumnMeta with commented editable properties
- **Codebase analysis:** `packages/data-table/src/keyboard-navigation.ts` - KeyboardNavigationManager
- **Codebase analysis:** `packages/data-table/src/selection-column.ts` - Column factory pattern for reference
- **Codebase analysis:** `packages/input/src/input.ts` - LitUI Input with ElementInternals pattern
- **W3C APG Grid Pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/grid/ - ARIA grid keyboard interaction spec

### Secondary (MEDIUM confidence)
- **TanStack Table editable example:** https://tanstack.com/table/v8/docs/framework/react/examples/editable-data - Official editable pattern
- **TanStack Table column meta pattern:** https://muhimasri.com/blogs/react-editable-table/ - Comprehensive tutorial on editable tables with meta, editedRows, updateData
- **MUI X Data Grid editing:** https://mui.com/x/react-data-grid/editing/ - Industry-standard editing patterns (cell modes, validation, click-to-edit)
- **Infragistics Web Components Data Grid:** https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/grids/data-grid/cell-editing - Web component grid editing patterns

### Tertiary (LOW confidence)
- **DEV Community TanStack demo:** https://dev.to/abhirup99/tanstack-table-v8-complete-interactive-data-grid-demo-1eo0 - Comprehensive demo (July 2025), inline editing with validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed. All infrastructure exists in the codebase
- Architecture: HIGH - Patterns established by selection column, filter components, and keyboard nav. Meta-based configuration is proven in TanStack ecosystem
- Pitfalls: HIGH - Well-documented across MUI, Kendo, AG Grid, and our own codebase constraints (48px rows, virtualization, keyboard nav)

**Research date:** 2026-02-04
**Valid until:** 2026-03-06 (30 days - stable domain, no fast-moving dependencies)
