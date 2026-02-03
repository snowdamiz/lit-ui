# Phase 64: Column Customization - Research

**Researched:** 2026-02-03
**Domain:** Data table column resize, reorder, visibility, and persistence
**Confidence:** HIGH

## Summary

This phase implements column customization features for the existing `lui-data-table` component, leveraging TanStack Table's built-in column sizing, ordering, and visibility APIs. The implementation builds on the existing CSS Grid layout and TanStack Table controller pattern already established in Phase 61.

TanStack Table provides comprehensive headless state management for all required features: column sizing with min/max constraints, column ordering state, column visibility state, and column pinning for sticky columns. The primary implementation work involves creating UI controls (resize handles, column picker, drag handles) and integrating localStorage persistence.

The existing component already uses CSS Grid with `grid-template-columns` for column layout, making resize integration straightforward. The existing `selection-column.ts` pattern demonstrates how to add special columns with fixed sizing and disabled resizing - the same pattern applies for sticky first columns.

**Primary recommendation:** Use TanStack Table's built-in column sizing/ordering/visibility APIs with pointer event handlers for resize/drag, leverage existing `lui-popover` for column picker dropdown, and implement localStorage persistence with table-id-scoped keys.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | ^8.x | Column state management | Already used - provides columnSizing, columnOrder, columnVisibility, columnPinning APIs |
| lit | ^3.x | Web component framework | Already used - provides reactive properties and rendering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lui-popover | existing | Column picker dropdown | Already exists - provides click-to-toggle, positioning, focus management |
| lui-checkbox | existing | Visibility toggle checkboxes | Already exists - used in column picker for hide/show |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native drag events | dnd-kit library | dnd-kit adds ~10KB but offers better touch support; native events sufficient for header-only drag |
| Custom resize logic | colResizable jQuery | External dependency; TanStack provides all needed state management |

**Installation:**
No additional packages needed - all required APIs exist in current dependencies.

## Architecture Patterns

### Recommended Project Structure
```
packages/data-table/src/
├── data-table.ts            # Main component (add resize/ordering state)
├── types.ts                 # Add ColumnCustomizationState types
├── column-resize-handle.ts  # NEW: Resize handle component/template
├── column-picker.ts         # NEW: Column visibility picker component
├── column-preferences.ts    # NEW: localStorage persistence utilities
└── selection-column.ts      # Existing (demonstrates fixed column pattern)
```

### Pattern 1: TanStack Column Sizing State
**What:** Use TanStack's columnSizing and columnSizingInfo states for resize operations
**When to use:** All column resize operations
**Example:**
```typescript
// Source: TanStack Table Column Sizing API
// State types
type ColumnSizingState = Record<string, number>; // columnId -> width in px
type ColumnSizingInfoState = {
  startOffset: number | null;
  startSize: number | null;
  deltaOffset: number | null;
  deltaPercentage: number | null;
  isResizingColumn: string | false;
  columnSizingStart: [string, number][];
};

// Table options for resize
const table = tableController.table({
  // ...existing options
  enableColumnResizing: true,
  columnResizeMode: 'onChange', // or 'onEnd' for performance
  columnResizeDirection: 'ltr',
  state: {
    columnSizing: this.columnSizing,
    columnSizingInfo: this._columnSizingInfo,
  },
  onColumnSizingChange: (updater) => {
    const newSizing = typeof updater === 'function'
      ? updater(this.columnSizing)
      : updater;
    this.columnSizing = newSizing;
    this.dispatchColumnPreferenceChange();
  },
});
```

### Pattern 2: Resize Handle Event Handler
**What:** Use TanStack's header.getResizeHandler() for mouse/touch events
**When to use:** Rendering resize handles in column headers
**Example:**
```typescript
// Source: TanStack Table Header API
private renderResizeHandle(header: Header<TData, unknown>): TemplateResult {
  if (!header.column.getCanResize()) return html``;

  const isResizing = header.column.getIsResizing();
  // getResizeHandler returns handler for onMouseDown/onTouchStart
  const handler = header.getResizeHandler();

  return html`
    <div
      class="resize-handle ${isResizing ? 'resizing' : ''}"
      @mousedown=${handler}
      @touchstart=${handler}
      @dblclick=${() => this.autoFitColumn(header)}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
      tabindex="0"
    ></div>
  `;
}
```

### Pattern 3: Column Visibility with Picker Dropdown
**What:** Use VisibilityState and column.toggleVisibility() with popover UI
**When to use:** Column picker dropdown implementation
**Example:**
```typescript
// Source: TanStack Table Column Visibility API
// State type
type VisibilityState = Record<string, boolean>; // columnId -> isVisible

// Column API methods
column.getCanHide(): boolean      // Check if column allows hiding
column.getIsVisible(): boolean    // Get current visibility
column.toggleVisibility(value?: boolean) // Toggle or set
column.getToggleVisibilityHandler() // Event handler for checkbox

// Render column picker in popover
private renderColumnPicker(table: Table<TData>): TemplateResult {
  return html`
    <lui-popover placement="bottom-end">
      <button slot="trigger" class="column-picker-trigger">
        <span>Columns</span>
        <svg>...</svg>
      </button>
      <div slot="content" class="column-picker-content">
        ${table.getAllLeafColumns()
          .filter(col => col.getCanHide())
          .map(col => html`
            <label class="column-picker-item">
              <lui-checkbox
                .checked=${col.getIsVisible()}
                @ui-change=${() => col.toggleVisibility()}
              ></lui-checkbox>
              <span>${col.columnDef.header}</span>
            </label>
          `)}
      </div>
    </lui-popover>
  `;
}
```

### Pattern 4: Column Ordering State
**What:** Use ColumnOrderState and setColumnOrder for drag-and-drop reorder
**When to use:** Header drag-and-drop implementation
**Example:**
```typescript
// Source: TanStack Table Column Ordering API
type ColumnOrderState = string[]; // Array of column IDs in display order

// Table options
const table = tableController.table({
  state: {
    columnOrder: this.columnOrder, // ['name', 'email', 'status']
  },
  onColumnOrderChange: (updater) => {
    const newOrder = typeof updater === 'function'
      ? updater(this.columnOrder)
      : updater;
    this.columnOrder = newOrder;
    this.dispatchColumnPreferenceChange();
  },
});

// Reorder columns programmatically
table.setColumnOrder(['status', 'name', 'email']);

// Reset to original order
table.resetColumnOrder();
```

### Pattern 5: CSS Sticky Column (First Column Pin)
**What:** Use CSS position:sticky with left:0 for pinned first column
**When to use:** COL-04 - Fixed/sticky first column during horizontal scroll
**Example:**
```typescript
// Source: CSS-Tricks sticky column pattern
// In getGridTemplateColumns(), prepend sticky column width
private getGridTemplateColumns(): string {
  const columns = this.getEffectiveColumns();
  return columns.map((col, index) => {
    const isPinned = this.stickyFirstColumn && index === 0;
    const size = col.size ?? `minmax(${col.minSize ?? 50}px, ${col.maxSize ?? 500}px)`;
    return typeof size === 'number' ? `${size}px` : size;
  }).join(' ');
}

// CSS for sticky cells
static override styles = css`
  /* Sticky first column */
  :host([sticky-first-column]) .data-table-cell:first-child,
  :host([sticky-first-column]) .data-table-header-cell:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    background: var(--ui-data-table-row-bg);
  }
  :host([sticky-first-column]) .data-table-header-cell:first-child {
    z-index: 11; /* Above sticky rows and other sticky cells */
    background: var(--ui-data-table-header-bg);
  }
`;
```

### Pattern 6: localStorage Persistence
**What:** Persist column preferences with table-scoped keys
**When to use:** COL-07 - Persist preferences for return visits
**Example:**
```typescript
// Source: Tabulator persistence pattern, DataTables state saving
interface ColumnPreferences {
  columnSizing: ColumnSizingState;
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  version: number; // For migration
}

const STORAGE_KEY_PREFIX = 'lui-data-table-prefs';
const PREFS_VERSION = 1;

function savePreferences(tableId: string, prefs: ColumnPreferences): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}-${tableId}`;
    localStorage.setItem(key, JSON.stringify({ ...prefs, version: PREFS_VERSION }));
  } catch (e) {
    // QuotaExceededError or SecurityError - fail silently
    console.warn('Failed to save table preferences:', e);
  }
}

function loadPreferences(tableId: string): ColumnPreferences | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}-${tableId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const prefs = JSON.parse(stored);
    // Version check for future migrations
    if (prefs.version !== PREFS_VERSION) {
      localStorage.removeItem(key);
      return null;
    }
    return prefs;
  } catch {
    return null;
  }
}
```

### Anti-Patterns to Avoid
- **Using column.getSize() on every cell render:** Calculate grid template once and use CSS variables for performance
- **Resizing during virtual scroll:** Can cause janky scrolling - use `columnResizeMode: 'onEnd'`
- **Persisting to localStorage on every resize delta:** Debounce persistence to reduce writes
- **Storing transient resize info:** Only persist final columnSizing state, not columnSizingInfo
- **Hard-coding column IDs:** Use column.id from definitions for persistence keys
- **Global localStorage key:** Scope by table ID to support multiple tables per page

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Column sizing state | Custom resize tracking | TanStack columnSizing/columnSizingInfo | Handles min/max, resize modes, RTL |
| Column order state | Custom array management | TanStack columnOrder + setColumnOrder | Integrates with visibility, pinning |
| Visibility state | Show/hide toggle logic | TanStack VisibilityState APIs | Handles dependent columns, groups |
| Resize event handling | Raw mouse event tracking | header.getResizeHandler() | Handles mouse + touch, delta calculation |
| Dropdown positioning | Manual positioning | lui-popover with Floating UI | Handles flip, shift, focus trap |
| Drag-and-drop | Full DnD library | Native HTML5 drag events | Headers are simple drag targets |

**Key insight:** TanStack Table's headless architecture provides all state management - the implementation work is purely UI (rendering handles, dropdowns) and persistence (localStorage integration).

## Common Pitfalls

### Pitfall 1: Performance Degradation During Column Resize
**What goes wrong:** Calling column.getSize() on every cell during resize causes layout thrashing
**Why it happens:** Each getSize() call may trigger state recalculation
**How to avoid:**
- Calculate all column widths once in getGridTemplateColumns()
- Use CSS variables to communicate widths to cells
- Use `columnResizeMode: 'onEnd'` for large tables
- Memoize grid template calculation
**Warning signs:** Janky resize preview, dropped frames during drag

### Pitfall 2: Auto-Fit Width Calculation with Virtualization
**What goes wrong:** Auto-fit only measures visible (virtualized) rows, gives wrong width
**Why it happens:** Off-screen rows aren't in DOM, can't measure their content
**How to avoid:**
- Sample visible rows + calculate based on column data statistics
- Store max measured width per column during scroll
- Accept "best effort" auto-fit based on visible content
- Provide manual resize as primary, auto-fit as convenience
**Warning signs:** Auto-fit width too narrow, content ellipsis after auto-fit

### Pitfall 3: localStorage Quota and Security Errors
**What goes wrong:** Preferences fail to save, state not restored
**Why it happens:** localStorage can be disabled, full, or blocked in private mode
**How to avoid:**
- Wrap all localStorage operations in try-catch
- Fail silently - preferences are enhancement, not requirement
- Log warnings for debugging but don't break functionality
- Consider sessionStorage fallback
**Warning signs:** Console errors about storage, preferences not restored

### Pitfall 4: Sticky Column Z-Index Stacking
**What goes wrong:** Sticky column appears behind other cells during scroll, or header overlap issues
**Why it happens:** Improper z-index layering between sticky header row and sticky column
**How to avoid:**
- Sticky header cells: z-index 10+
- Sticky first column header cell (intersection): z-index 11
- Sticky first column body cells: z-index 2
- Regular body cells: z-index auto
- Always set background-color on sticky cells
**Warning signs:** Visual overlapping, content showing through sticky cells

### Pitfall 5: Column Order vs Column Visibility Interaction
**What goes wrong:** Hidden column reappears in wrong position after toggle
**Why it happens:** columnOrder array contains hidden column IDs
**How to avoid:**
- TanStack handles this automatically when using getVisibleLeafColumns()
- Don't filter columnOrder when hiding - let TanStack manage
- Test: hide column A, reorder B and C, show column A - should restore position
**Warning signs:** Columns jump positions when toggled visible

### Pitfall 6: Drag Handle vs Click to Sort Conflict
**What goes wrong:** Clicking header to sort triggers drag operation
**Why it happens:** Both click and drag listeners on header cell
**How to avoid:**
- Use separate drag handle element (grip icon), not entire header
- Or: Track drag distance threshold before initiating drag
- Or: Disable drag-to-reorder while sorting is in progress
**Warning signs:** Sort not working, accidental reorder on click

## Code Examples

Verified patterns from official sources:

### Complete Resize Handle Component
```typescript
// Resize handle with double-click auto-fit
private renderResizeHandle(header: Header<TData, unknown>): TemplateResult {
  if (!header.column.getCanResize()) {
    return html``;
  }

  const isResizing = header.column.getIsResizing();

  return html`
    <div
      class="column-resize-handle ${isResizing ? 'is-resizing' : ''}"
      @mousedown=${header.getResizeHandler()}
      @touchstart=${header.getResizeHandler()}
      @dblclick=${(e: MouseEvent) => {
        e.stopPropagation();
        this.autoFitColumn(header.column);
      }}
      @keydown=${(e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const delta = e.key === 'ArrowLeft' ? -10 : 10;
          const newSize = Math.max(
            header.column.columnDef.minSize ?? 50,
            Math.min(
              header.column.columnDef.maxSize ?? 500,
              header.column.getSize() + delta
            )
          );
          this.columnSizing = {
            ...this.columnSizing,
            [header.column.id]: newSize,
          };
        }
      }}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow=${header.column.getSize()}
      aria-valuemin=${header.column.columnDef.minSize ?? 50}
      aria-valuemax=${header.column.columnDef.maxSize ?? 500}
      aria-label="Resize ${header.column.columnDef.header} column"
      tabindex="0"
    ></div>
  `;
}
```

### Auto-Fit Column Implementation
```typescript
// COL-02: Double-click auto-fit to content width
private autoFitColumn(column: Column<TData, unknown>): void {
  // Get all visible cells for this column
  const columnCells = this.shadowRoot?.querySelectorAll(
    `[data-column-id="${column.id}"]`
  );

  if (!columnCells || columnCells.length === 0) return;

  // Measure content width (requires temporary auto width)
  let maxWidth = 0;
  const headerCell = this.shadowRoot?.querySelector(
    `.data-table-header-cell[data-column-id="${column.id}"]`
  );

  // Measure header
  if (headerCell) {
    const headerContent = headerCell.querySelector('.header-content');
    if (headerContent) {
      maxWidth = Math.max(maxWidth, headerContent.scrollWidth + 32); // padding
    }
  }

  // Measure visible body cells (virtualized)
  columnCells.forEach((cell) => {
    maxWidth = Math.max(maxWidth, cell.scrollWidth + 32);
  });

  // Apply constraints
  const minSize = column.columnDef.minSize ?? 50;
  const maxSize = column.columnDef.maxSize ?? 500;
  const fitWidth = Math.max(minSize, Math.min(maxSize, maxWidth));

  // Update sizing state
  this.columnSizing = {
    ...this.columnSizing,
    [column.id]: fitWidth,
  };
}
```

### Column Preferences Persistence
```typescript
// COL-07, COL-08: Persistence with optional callback
export interface ColumnPreferencesChangeEvent {
  columnSizing: ColumnSizingState;
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  tableId: string;
}

// In DataTable class
@property({ type: String, attribute: 'persistence-key' })
persistenceKey = '';

@property({ attribute: false })
onColumnPreferencesChange?: (prefs: ColumnPreferencesChangeEvent) => void;

private debounceTimer?: ReturnType<typeof setTimeout>;

private dispatchColumnPreferenceChange(): void {
  const prefs: ColumnPreferencesChangeEvent = {
    columnSizing: this.columnSizing,
    columnOrder: this.columnOrder,
    columnVisibility: this.columnVisibility,
    tableId: this.persistenceKey,
  };

  // Debounce localStorage writes
  clearTimeout(this.debounceTimer);
  this.debounceTimer = setTimeout(() => {
    // Save to localStorage if persistence key provided
    if (this.persistenceKey) {
      savePreferences(this.persistenceKey, prefs);
    }

    // Call optional callback for server-side persistence (COL-08)
    this.onColumnPreferencesChange?.(prefs);

    // Also dispatch event for declarative usage
    this.dispatchEvent(new CustomEvent('ui-column-preferences-change', {
      detail: prefs,
      bubbles: true,
      composed: true,
    }));
  }, 300);
}

override connectedCallback(): void {
  super.connectedCallback();

  // Load persisted preferences
  if (this.persistenceKey) {
    const stored = loadPreferences(this.persistenceKey);
    if (stored) {
      this.columnSizing = stored.columnSizing ?? {};
      this.columnOrder = stored.columnOrder ?? [];
      this.columnVisibility = stored.columnVisibility ?? {};
    }
  }
}
```

### CSS for Resize Handle and Sticky Column
```css
/* Resize handle styles */
.column-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 4px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  background: transparent;
  z-index: 1;
}

.column-resize-handle:hover,
.column-resize-handle.is-resizing {
  background: var(--color-primary, #3b82f6);
}

.column-resize-handle:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: -2px;
}

/* Prevent text selection during resize */
:host([data-resizing]) {
  user-select: none;
  cursor: col-resize;
}

/* Sticky first column */
:host([sticky-first-column]) .data-table-cell:first-child,
:host([sticky-first-column]) .data-table-header-cell:first-child {
  position: sticky;
  left: 0;
  background: inherit;
}

:host([sticky-first-column]) .data-table-cell:first-child {
  z-index: 2;
  background: var(--ui-data-table-row-bg);
}

:host([sticky-first-column]) .data-table-row:hover .data-table-cell:first-child {
  background: var(--ui-data-table-row-hover-bg);
}

:host([sticky-first-column]) .data-table-row.selected .data-table-cell:first-child {
  background: var(--ui-data-table-selected-bg);
}

:host([sticky-first-column]) .data-table-header-cell:first-child {
  z-index: 11;
  background: var(--ui-data-table-header-bg);
}

/* Shadow hint for sticky column */
:host([sticky-first-column]) .data-table-cell:first-child::after,
:host([sticky-first-column]) .data-table-header-cell:first-child::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  bottom: 0;
  width: 8px;
  pointer-events: none;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.06),
    transparent
  );
}

:host-context(.dark):host([sticky-first-column]) .data-table-cell:first-child::after,
:host-context(.dark):host([sticky-first-column]) .data-table-header-cell:first-child::after {
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.2),
    transparent
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery column resize plugins | Headless state management (TanStack) | 2022+ | No DOM manipulation, framework-agnostic |
| Table colgroup for widths | CSS Grid with grid-template-columns | 2020+ | More flexible, better resize support |
| Column width inline styles | CSS custom properties | 2023+ | Better performance, single style update |
| Cookie-based persistence | localStorage with structured data | 2018+ | More storage, better API |

**Deprecated/outdated:**
- jQuery colResizable: Still works but unnecessary dependency
- HTML `<col>` elements for sizing: Poor resize support
- CSS table-layout: fixed: Less flexible than CSS Grid

## Open Questions

Things that couldn't be fully resolved:

1. **Auto-fit accuracy with virtualization**
   - What we know: Only visible rows can be measured; AG Grid, MUI warn about this
   - What's unclear: Whether to sample across virtual rows or accept visible-only measurement
   - Recommendation: Accept visible-only measurement, document limitation, provide manual resize

2. **Drag-and-drop library for touch devices**
   - What we know: Native drag events work for desktop; touch support varies
   - What's unclear: Whether native HTML5 drag works well enough on mobile
   - Recommendation: Start with native drag events; add pointer events if touch issues arise

3. **Column order with grouped headers**
   - What we know: TanStack supports header groups; column order may interact
   - What's unclear: Behavior when dragging columns within/across groups
   - Recommendation: Defer grouped header reorder to future phase if not in requirements

## Sources

### Primary (HIGH confidence)
- [TanStack Table Column Sizing API](https://github.com/TanStack/table/blob/main/docs/api/features/column-sizing.md) - ColumnSizing state, resize handlers, min/max
- [TanStack Table Column Ordering API](https://github.com/TanStack/table/blob/main/docs/api/features/column-ordering.md) - ColumnOrderState, setColumnOrder
- [TanStack Table Column Visibility API](https://github.com/TanStack/table/blob/main/docs/api/features/column-visibility.md) - VisibilityState, toggle methods
- [TanStack Table Column Pinning API](https://github.com/TanStack/table/blob/main/docs/api/features/column-pinning.md) - ColumnPinningState for sticky columns
- Existing lui-data-table implementation (packages/data-table/src/data-table.ts)
- Existing lui-popover implementation (packages/popover/src/popover.ts)

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Sticky header and column](https://css-tricks.com/a-table-with-both-a-sticky-header-and-a-sticky-first-column/) - Z-index layering pattern
- [Tabulator Persistence](https://tabulator.info/docs/6.3/persist) - localStorage persistence pattern
- [AG Grid Column Sizing](https://www.ag-grid.com/javascript-data-grid/column-sizing/) - Auto-fit with virtualization warnings
- [MUI Data Grid Column Dimensions](https://mui.com/x/react-data-grid/column-dimensions/) - Autosizing with virtualization

### Tertiary (LOW confidence)
- [snap-dnd library](https://www.cssscript.com/snap-dnd/) - Potential alternative for touch drag-drop if needed
- Various Medium articles on localStorage best practices - General guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing TanStack APIs, no new dependencies
- Architecture: HIGH - Follows existing component patterns in codebase
- Pitfalls: HIGH - Well-documented issues from multiple data grid libraries

**Research date:** 2026-02-03
**Valid until:** 60 days (stable patterns, TanStack Table v8 is mature)
