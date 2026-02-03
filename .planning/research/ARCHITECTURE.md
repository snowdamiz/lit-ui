# Architecture Patterns: LitUI Data Table

**Domain:** Data Table Component for Admin Dashboards
**Researched:** 2026-02-02
**Focus:** Integration with existing LitUI architecture for 100K+ rows

## Recommended Architecture

### Component Structure Overview

```
lui-data-table (Container/Controller)
    |
    +-- <lui-column> (Declarative column definitions - OPTIONAL slotted)
    |
    +-- Internal Components (Shadow DOM)
        +-- HeaderRow (column headers, sort indicators, resize handles)
        +-- VirtualizedBody (virtualized row container)
        |       +-- Row[] (only visible rows rendered)
        |               +-- Cell[] (using existing LitUI components for editing)
        +-- FooterRow (pagination, bulk actions)
```

**Hybrid API approach:** Support both programmatic `columns` property AND declarative `<lui-column>` children (like Select supports both `options` property and slotted `<lui-option>`).

### Integration Points with Existing LitUI

| LitUI Component | Integration Point | Usage in Data Table |
|-----------------|-------------------|---------------------|
| `TailwindElement` | Base class | All table components extend this for dual-mode styling |
| `@tanstack/lit-virtual` | Row virtualization | Reuse pattern from Select for virtualized row rendering |
| `VirtualizerController` | Controller pattern | Same approach as Select, manages visible row window |
| `Floating UI` | Column menus/filters | Dropdown filters, column visibility picker |
| `lui-checkbox` | Row selection | Bulk selection checkboxes in each row |
| `lui-input` | Inline cell editing | Text/number cell editors |
| `lui-select` | Inline cell editing | Dropdown cell editors |
| `lui-popover` | Filter dropdowns | Column filter UI |
| `dispatchCustomEvent` | Event pattern | `ui-sort`, `ui-filter`, `ui-select`, `ui-edit` events |
| `ElementInternals` | Form participation | Table value as JSON/FormData for form submission |

### Data Flow Architecture

```
                    +-------------------+
                    |   External Data   |
                    |   (rows[], page)  |
                    +---------+---------+
                              |
                              v
+--------------------+   +----------+   +--------------------+
| Server-Side Mode   |<--|  Table   |-->| Client-Side Mode   |
| (manual=true)      |   | State    |   | (manual=false)     |
| - API pagination   |   |          |   | - In-memory sort   |
| - API sorting      |   |          |   | - In-memory filter |
| - API filtering    |   |          |   | - In-memory page   |
+--------------------+   +----------+   +--------------------+
                              |
                              v
                    +---------+---------+
                    |  VirtualizerCtrl  |
                    |  (visible rows)   |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |   Rendered DOM    |
                    | (20-50 rows only) |
                    +-------------------+
```

### State Management Pattern

Follow existing LitUI controlled/uncontrolled pattern:

```typescript
// Controlled mode (external state management)
<lui-data-table
  .rows=${serverData}
  .sortState=${sortState}
  .filterState=${filterState}
  .pagination=${pagination}
  manual
  @ui-sort-change=${handleSort}
  @ui-filter-change=${handleFilter}
  @ui-page-change=${handlePage}
>

// Uncontrolled mode (internal state management)
<lui-data-table
  .rows=${allData}
  default-sort="name:asc"
  default-page-size="25"
>
```

## Component Boundaries

### lui-data-table (Main Component)

**Responsibilities:**
- Column configuration management (from props or slotted children)
- Virtualization orchestration via VirtualizerController
- State management (sort, filter, selection, pagination)
- Event dispatch to consumers
- Form participation via ElementInternals
- Keyboard navigation coordination

**Properties:**
```typescript
// Data
rows: T[] | Promise<T[]>           // Data source
columns: ColumnDef<T>[]            // Column definitions (alt to slotted)
rowKey: keyof T | ((row: T) => string)  // Row identity

// State (controlled)
sortState?: SortState[]
filterState?: FilterState[]
selectedRows?: Set<string>
pagination?: PaginationState

// State (uncontrolled defaults)
defaultSort?: string               // "field:asc,field2:desc"
defaultPageSize?: number
defaultPage?: number

// Modes
manual?: boolean                   // Server-side mode
selectable?: boolean | 'single' | 'multiple'
editable?: boolean | 'cell' | 'row'

// Virtual scrolling
rowHeight?: number                 // Default: 48
overscan?: number                  // Default: 10
```

### lui-column (Optional Declarative Definition)

**Responsibilities:**
- Declare column configuration as markup
- Support slotted header/cell templates

**Properties:**
```typescript
field: string                      // Data field path
header?: string                    // Header text
width?: string | number            // Column width
minWidth?: number
maxWidth?: number
sortable?: boolean
filterable?: boolean | 'text' | 'select' | 'date' | 'number'
editable?: boolean
resizable?: boolean
hidden?: boolean
pinned?: 'left' | 'right'
```

**Slots:**
- `header` - Custom header content
- `cell` - Custom cell template (receives row data)
- `editor` - Custom editor component
- `filter` - Custom filter UI

### Internal: HeaderRow

**Responsibilities:**
- Render column headers with sort indicators
- Handle click-to-sort
- Resize handles via drag events
- Column reorder via drag-and-drop (using native drag events)

### Internal: VirtualizedBody

**Responsibilities:**
- Use VirtualizerController (same as Select)
- Calculate visible row range
- Render only visible rows with transform positioning
- Handle scroll events

### Internal: Cell

**Responsibilities:**
- Display mode: Render cell value
- Edit mode: Switch to appropriate editor component
- Handle edit lifecycle (enter/exit edit mode, save/cancel)

## Virtualization Strategy

### Row-Only Virtualization (Recommended for v1)

**Rationale:**
- Matches existing Select implementation pattern
- Sufficient for 100K+ rows with < 50 columns
- Column virtualization adds significant complexity
- Most admin dashboards have 10-30 columns

**Implementation:**
```typescript
private _virtualizer?: VirtualizerController<HTMLDivElement, Element>;

private updateVirtualizer(): void {
  const scrollElement = this._bodyRef.value;
  if (!scrollElement) return;

  this._virtualizer = new VirtualizerController(this, {
    getScrollElement: () => this._bodyRef.value ?? null,
    count: this.filteredRows.length,
    estimateSize: () => this.rowHeight,
    overscan: this.overscan,
  });
}

private renderVirtualizedRows(): TemplateResult {
  const virtualizer = this._virtualizer.getVirtualizer();
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return html`
    <div class="virtual-rows" style="height: ${totalSize}px; position: relative;">
      ${virtualItems.map((item) => html`
        <div
          class="table-row"
          style="transform: translateY(${item.start}px); height: ${item.size}px; position: absolute; width: 100%;"
        >
          ${this.renderRow(this.filteredRows[item.index], item.index)}
        </div>
      `)}
    </div>
  `;
}
```

### Column Virtualization (Future Enhancement)

For tables with 50+ columns, add horizontal virtualization:

```typescript
// Future: 2D virtualization
private _rowVirtualizer: VirtualizerController;
private _colVirtualizer: VirtualizerController;

// Only render visible columns
const visibleColumns = this._colVirtualizer
  .getVirtualizer()
  .getVirtualItems()
  .map(item => this.columns[item.index]);
```

## Event Patterns

Following existing LitUI event naming convention (`ui-*`):

| Event | Payload | When |
|-------|---------|------|
| `ui-sort-change` | `{ field, direction, multiSort[] }` | User clicks sortable header |
| `ui-filter-change` | `{ field, operator, value, filters[] }` | Filter value changes |
| `ui-page-change` | `{ page, pageSize, offset }` | Pagination change |
| `ui-selection-change` | `{ selected: Set<string>, row?, all? }` | Row selection change |
| `ui-row-click` | `{ row, index }` | Row clicked |
| `ui-cell-edit-start` | `{ row, field, value }` | Cell enters edit mode |
| `ui-cell-edit-end` | `{ row, field, oldValue, newValue, cancelled }` | Cell exits edit mode |
| `ui-row-edit-start` | `{ row }` | Row enters edit mode |
| `ui-row-edit-end` | `{ row, changes, cancelled }` | Row exits edit mode |
| `ui-column-resize` | `{ field, width }` | Column resized |
| `ui-column-reorder` | `{ columns[] }` | Columns reordered |

## Keyboard Navigation

Following W3C APG Grid pattern:

| Key | Action |
|-----|--------|
| Arrow Keys | Move cell focus |
| Page Up/Down | Jump 10 rows |
| Home/End | First/last column in row |
| Ctrl+Home/End | First/last cell in table |
| Enter | Enter edit mode / confirm edit |
| Escape | Cancel edit / exit cell focus |
| Tab | Move to next focusable (exit grid or next editable) |
| Space | Toggle row selection |
| Ctrl+A | Select all rows |

## Styling Architecture

Use CSS Grid for column layout (matches existing Tabs pattern):

```css
.table-grid {
  display: grid;
  grid-template-columns: var(--lui-table-columns);
  /* Dynamic: repeat(6, minmax(100px, 1fr)) */
}

.table-row {
  display: contents; /* Children participate in parent grid */
}

.table-cell {
  /* Inherits grid positioning from parent */
  padding: var(--ui-table-cell-padding);
  border-bottom: 1px solid var(--ui-table-border);
}

/* Pinned columns use sticky positioning */
.cell-pinned-left {
  position: sticky;
  left: 0;
  z-index: 1;
  background: var(--ui-table-bg);
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Rendering All Rows

**What:** Rendering full DOM for all 100K rows
**Why bad:** Browser crashes, multi-second render times
**Instead:** Use VirtualizerController (already proven in Select)

### Anti-Pattern 2: Deep Component Nesting for Cells

**What:** `<lui-table-row><lui-table-cell>` for every cell
**Why bad:** Thousands of custom element upgrades, memory explosion
**Instead:** Rows are templates, not components. Only the table container is a custom element.

### Anti-Pattern 3: Two-Way Binding for Server Data

**What:** Modifying row data directly in the table
**Why bad:** Server data should be immutable; edits should go through API
**Instead:** Dispatch edit events, let consumer update data and re-pass to table

### Anti-Pattern 4: Global Event Listeners for Resize

**What:** Attaching global mouse listeners for column resize
**Why bad:** Memory leaks, conflicts with other components
**Instead:** Use pointer capture API on resize handles

## Suggested Build Order

Based on dependency analysis and existing component patterns:

### Phase 1: Core Table Shell (Foundation)
**Build:**
- `lui-data-table` base class extending TailwindElement
- Column configuration via `columns` property
- Static row rendering (no virtualization)
- Basic CSS Grid layout

**Dependencies:** TailwindElement, CSS tokens
**Reuse:** Pattern from Accordion container

### Phase 2: Row Virtualization (Critical Path)
**Build:**
- VirtualizerController integration
- Virtualized body rendering
- Scroll handling

**Dependencies:** Phase 1
**Reuse:** VirtualizerController pattern from Select

### Phase 3: Sorting (User Interaction)
**Build:**
- Click-to-sort on headers
- Multi-column sort (shift+click)
- Sort indicators
- Client-side sort implementation
- `manual` mode for server-side sort

**Dependencies:** Phase 2
**Reuse:** Icon patterns from existing components

### Phase 4: Row Selection (User Interaction)
**Build:**
- Checkbox column
- Single/multiple selection modes
- Bulk selection (header checkbox)
- Keyboard selection (Space)
- Selection state management

**Dependencies:** Phase 2
**Reuse:** lui-checkbox component

### Phase 5: Pagination (Navigation)
**Build:**
- Pagination controls (footer)
- Page size selector
- Page navigation
- Client-side pagination
- `manual` mode for server-side pagination

**Dependencies:** Phase 3 (sorting affects page content)
**Reuse:** lui-select for page size dropdown

### Phase 6: Column Filtering (Search)
**Build:**
- Filter UI per column (in header or dropdown)
- Text, select, number, date filter types
- Client-side filtering
- `manual` mode for server-side filtering
- Filter state management

**Dependencies:** Phase 5
**Reuse:** lui-input, lui-select, lui-popover, Floating UI

### Phase 7: Column Customization (Advanced)
**Build:**
- Column resize (drag handles)
- Column reorder (drag-and-drop)
- Column visibility toggle
- Column pinning (left/right sticky)
- State persistence (localStorage)

**Dependencies:** Phase 3 (headers must be built)
**Reuse:** Native drag events pattern

### Phase 8: Inline Editing (Advanced)
**Build:**
- Cell edit mode
- Row edit mode
- Edit lifecycle events
- Form validation integration
- Editor component integration

**Dependencies:** Phase 4 (selection often related to editing)
**Reuse:** lui-input, lui-select, lui-checkbox for editors

### Phase 9: Declarative API (DX)
**Build:**
- `<lui-column>` element
- Slotchange discovery (same as Accordion)
- Template slots for custom cells
- Merge with programmatic columns

**Dependencies:** Phase 1-6 complete
**Reuse:** Slot pattern from Accordion, Tabs, Select

### Phase 10: Server-Side Integration (Production)
**Build:**
- Async data loading (`rows` as Promise)
- Loading states and skeletons
- Error handling and retry
- Infinite scroll (optional)

**Dependencies:** All previous phases
**Reuse:** @lit/task pattern from Select

## New vs Modified Components

### New Components (to be created)

| Component | Status | Notes |
|-----------|--------|-------|
| `lui-data-table` | NEW | Main table container |
| `lui-column` | NEW | Optional declarative column definition |

### Existing Components (reuse unchanged)

| Component | Usage |
|-----------|-------|
| `lui-checkbox` | Row selection |
| `lui-input` | Text cell editing, text filter |
| `lui-select` | Dropdown cell editing, enum filter, page size |
| `lui-popover` | Filter dropdowns, column menu |
| `lui-tooltip` | Truncated cell content |

### Shared Infrastructure (reuse)

| Infrastructure | Source | Usage |
|----------------|--------|-------|
| `TailwindElement` | @lit-ui/core | Base class |
| `VirtualizerController` | @tanstack/lit-virtual | Row virtualization |
| `computePosition` | @lit-ui/core/floating | Dropdown positioning |
| `@lit/task` | @lit/task | Async data loading |
| `dispatchCustomEvent` | @lit-ui/core | Event dispatch |

## Performance Architecture for 100K+ Rows

### Memory Budget

| Item | Target | Strategy |
|------|--------|----------|
| DOM nodes | < 2,000 | Virtualize rows (overscan: 10) |
| Event listeners | < 100 | Delegate to container |
| Re-renders | Partial | Use `requestUpdate()` only for changed state |

### Rendering Optimization

1. **Row recycling:** Virtualized rows reuse DOM via transforms
2. **Memoized templates:** Cache cell templates by column type
3. **Deferred sort/filter:** Debounce operations, show loading
4. **Pagination fallback:** Offer pagination for lower-end devices

### Scroll Performance

- Use CSS `will-change: transform` on virtual container
- Use `contain: strict` on rows
- Passive scroll listeners
- `requestAnimationFrame` for scroll-linked updates

## Sources

- [TanStack Virtual - Lit Support](https://tanstack.com/virtual/latest)
- [TanStack Table Virtualization Guide](https://tanstack.com/table/latest/docs/guide/virtualization)
- [AG Grid DOM Virtualization](https://www.ag-grid.com/javascript-data-grid/dom-virtualisation/)
- [Scaling Data Grid Rows with Cell-Based Virtualization](https://www.coditation.com/blog/scaling-thousands-of-concurrent-data-grid-rows-with-cell-based-virtualization-in-react)
- [TanStack Table Server-Side Pagination](https://tanstack.com/table/latest/docs/guide/pagination)
- [Inline Editing Best Practices](https://uxdworld.com/inline-editing-in-tables-design/)
- [Column Ordering DnD Guide](https://www.material-react-table.com/docs/guides/column-ordering-dnd)
