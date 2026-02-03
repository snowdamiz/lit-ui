# Phase 61: Core Table Shell & Virtualization - Research

**Researched:** 2026-02-03
**Domain:** Data Table, Virtual Scrolling, ARIA Grid Navigation
**Confidence:** HIGH

## Summary

This phase establishes the foundational data table component with virtual scrolling for 100K+ rows, sticky headers, loading/empty states, and full ARIA grid keyboard navigation. The research confirms that the roadmap's recommendation of **TanStack Table + TanStack Virtual** is the correct approach for this Lit-based component library.

TanStack Table (`@tanstack/lit-table`) provides a headless table state management solution with a dedicated Lit adapter using reactive controllers. TanStack Virtual (`@tanstack/lit-virtual`) provides virtualization through `VirtualizerController` that integrates seamlessly with Lit's reactive controller pattern. Both libraries are actively maintained, have official Lit adapters, and are designed to work together.

The ARIA grid pattern requires careful keyboard navigation implementation (arrow keys for cell navigation, Tab for interactive elements within cells) and proper ARIA attributes (`role="grid"`, `role="row"`, `role="gridcell"`, `aria-rowindex`, `aria-colindex`). Fixed row heights are essential for consistent virtual scroll behavior and 60fps performance.

**Primary recommendation:** Use `@tanstack/lit-table` for headless table state management and `@tanstack/lit-virtual` for row virtualization, implementing ARIA grid navigation manually following W3C APG patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | 8.21.x | Headless table state management | Official Lit adapter with TableController; supports sorting, filtering, pagination, selection out of box |
| @tanstack/lit-virtual | 3.13.x | Row virtualization | Official Lit adapter with VirtualizerController; 60fps performance with 100K+ items; works with TanStack Table |
| lit | 3.x | Web component framework | Already used by project; TanStack adapters designed for Lit 3 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/table-core | 8.21.x | Core table logic (re-exported) | Automatically included via @tanstack/lit-table |
| @tanstack/virtual-core | 3.13.x | Core virtualizer logic (re-exported) | Automatically included via @tanstack/lit-virtual |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/lit-virtual | @lit-labs/virtualizer | Official Lit team solution but still in "late prerelease"; known smooth scrolling issues in Chromium; less integration with TanStack Table |
| @tanstack/lit-table | Manual table state | Full control but requires reimplementing sorting, filtering, pagination, selection logic |

**Installation:**
```bash
pnpm add @tanstack/lit-table @tanstack/lit-virtual
```

## Architecture Patterns

### Recommended Project Structure
```
packages/data-table/
├── src/
│   ├── index.ts                    # Public exports
│   ├── data-table.ts               # Main component (lui-data-table)
│   ├── table-header.ts             # Header row with sticky positioning
│   ├── table-body.ts               # Virtualized body
│   ├── table-row.ts                # Individual row component
│   ├── table-cell.ts               # Cell component
│   ├── keyboard-navigation.ts      # ARIA grid keyboard handling
│   ├── loading-state.ts            # Skeleton loaders
│   ├── empty-state.ts              # No data / no matches states
│   └── types.ts                    # Column definitions, row data types
├── jsx.d.ts                        # JSX declarations
└── vite-env.d.ts
```

### Pattern 1: TableController with Reactive State
**What:** Use TanStack's TableController as a Lit reactive controller to manage table state
**When to use:** Always - this is the recommended integration pattern for Lit
**Example:**
```typescript
// Source: TanStack Table Lit docs
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  ColumnDef,
  getCoreRowModel,
  TableController,
  RowData,
  flexRender,
} from '@tanstack/lit-table';

@customElement('lui-data-table')
export class DataTable<TData extends RowData> extends LitElement {
  private tableController = new TableController<TData>(this);

  @property({ type: Array }) columns: ColumnDef<TData, any>[] = [];
  @property({ type: Array }) data: TData[] = [];

  protected render() {
    const table = this.tableController.table({
      columns: this.columns,
      data: this.data,
      getCoreRowModel: getCoreRowModel(),
    });

    return html`
      <div role="grid" aria-rowcount=${this.data.length}>
        ${this.renderHeader(table)}
        ${this.renderBody(table)}
      </div>
    `;
  }
}
```

### Pattern 2: VirtualizerController for Row Virtualization
**What:** Use TanStack Virtual's VirtualizerController integrated with the table body
**When to use:** Always for large datasets; configure with fixed row height for predictable performance
**Example:**
```typescript
// Source: TanStack Virtual Lit docs
import { VirtualizerController } from '@tanstack/lit-virtual';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

class TableBody extends LitElement {
  private scrollRef: Ref<HTMLDivElement> = createRef();
  private virtualizerController: VirtualizerController<HTMLDivElement, Element>;

  constructor() {
    super();
    this.virtualizerController = new VirtualizerController(this, {
      getScrollElement: () => this.scrollRef.value,
      count: 0, // Updated via property
      estimateSize: () => 40, // Fixed row height in pixels
      overscan: 5, // Buffer rows above/below viewport
    });
  }

  render() {
    const virtualizer = this.virtualizerController.getVirtualizer();
    const virtualRows = virtualizer.getVirtualItems();
    const totalHeight = virtualizer.getTotalSize();

    return html`
      <div ${ref(this.scrollRef)} style="height: 500px; overflow-y: auto;">
        <div style="height: ${totalHeight}px; position: relative;">
          ${virtualRows.map(virtualRow => html`
            <div
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: ${virtualRow.size}px;
                transform: translateY(${virtualRow.start}px);
              "
            >
              ${this.renderRow(virtualRow.index)}
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
```

### Pattern 3: Sticky Header with CSS
**What:** Use CSS `position: sticky` on `<th>` elements for fixed header during scroll
**When to use:** Always - required for CORE-02
**Example:**
```css
/* Source: CSS-Tricks - Position Sticky and Table Headers */
/* Can't sticky <thead> or <tr>, but CAN sticky <th> */

.table-container {
  height: 500px;
  overflow-y: auto;
  position: relative;
}

.table-header th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--ui-data-table-header-bg);
}
```

### Pattern 4: ARIA Grid Keyboard Navigation
**What:** Implement arrow key navigation between cells following W3C APG grid pattern
**When to use:** Always - required for CORE-07, CORE-08, CORE-09
**Example:**
```typescript
// Source: W3C WAI-ARIA APG Grid Pattern
private handleKeyDown(e: KeyboardEvent) {
  const { key } = e;

  switch (key) {
    case 'ArrowRight':
      e.preventDefault();
      this.moveFocus(0, 1); // Move to next cell
      break;
    case 'ArrowLeft':
      e.preventDefault();
      this.moveFocus(0, -1); // Move to previous cell
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.moveFocus(1, 0); // Move to cell below
      break;
    case 'ArrowUp':
      e.preventDefault();
      this.moveFocus(-1, 0); // Move to cell above
      break;
    case 'Home':
      e.preventDefault();
      if (e.ctrlKey) {
        this.moveFocusTo(0, 0); // First cell of first row
      } else {
        this.moveFocusToRowStart(); // First cell of current row
      }
      break;
    case 'End':
      e.preventDefault();
      if (e.ctrlKey) {
        this.moveFocusToLastCell(); // Last cell of last row
      } else {
        this.moveFocusToRowEnd(); // Last cell of current row
      }
      break;
    case 'PageDown':
      e.preventDefault();
      this.moveFocus(this.visibleRowCount, 0);
      break;
    case 'PageUp':
      e.preventDefault();
      this.moveFocus(-this.visibleRowCount, 0);
      break;
  }
}
```

### Anti-Patterns to Avoid
- **Rendering all rows to DOM:** Never render 100K+ rows directly; always use virtualization
- **Dynamic row heights with virtualization:** Variable heights cause scroll position instability and layout thrashing; use fixed heights
- **Using `<table>` with virtualization:** HTML tables can't work with virtual scrolling; use `div`-based grid layout with ARIA roles
- **Sticky header on `<thead>`:** CSS sticky doesn't work on `<thead>` or `<tr>`, only on `<th>` elements
- **Tab navigation between cells:** ARIA grid pattern requires arrow keys for cell navigation; Tab should only move between interactive elements within cells or out of the grid

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table state management | Custom row model, sorting state, etc. | @tanstack/lit-table | Handles row models, sorting, filtering, pagination, selection with proven edge case handling |
| Virtual scrolling | Custom scroll position calculation | @tanstack/lit-virtual | Handles scroll position preservation, overscan, resize observer, 60fps optimization |
| Column definitions | Custom column config system | TanStack Table ColumnDef | Standard API with accessor functions, header/cell templates, meta fields |
| Row virtualization positioning | Manual transform calculations | VirtualizerController.getVirtualItems() | Returns pre-calculated start positions, handles edge cases |
| Skeleton loaders | Custom shimmer/pulse animation | CSS keyframe animation with aria-busy | Standard pattern, simple CSS, accessible |

**Key insight:** TanStack's headless approach provides the complex state management and virtualization logic while letting you fully control the DOM structure and styling - perfect for a web component library that needs to maintain consistent patterns with existing components.

## Common Pitfalls

### Pitfall 1: Using Native HTML Table Elements with Virtual Scrolling
**What goes wrong:** Attempting to use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` with virtual scrolling
**Why it happens:** Developers expect tables to work like normal, but virtual scrolling requires absolute positioning and dynamic DOM manipulation incompatible with table layout
**How to avoid:** Use `div`-based layout with ARIA roles: `role="grid"`, `role="row"`, `role="columnheader"`, `role="gridcell"`
**Warning signs:** Layout breaking when scrolling, rows overlapping, sticky header not working

### Pitfall 2: Variable Row Heights Breaking Scroll Position
**What goes wrong:** Scroll jumps, stuttering, incorrect scroll position after data updates
**Why it happens:** Virtualizer estimates row positions; variable heights cause estimation errors that compound during scrolling
**How to avoid:** Use fixed row heights (`estimateSize` returns constant); if variable heights needed, measure and cache them, accept some scroll instability
**Warning signs:** Scrollbar jumping when fast scrolling, content flickering, scroll position not preserving after sort/filter

### Pitfall 3: Tab Navigation Instead of Arrow Keys
**What goes wrong:** Accessibility testing fails; screen reader users confused by navigation
**Why it happens:** Developers implement table navigation like form fields (Tab between cells)
**How to avoid:** Implement W3C APG grid pattern: arrow keys navigate cells, Tab moves to interactive elements within cells or exits grid
**Warning signs:** Screen reader announcing incorrect navigation, tabindex on every cell instead of roving tabindex

### Pitfall 4: Missing ARIA Attributes for Dynamic Content
**What goes wrong:** Screen readers announce wrong row/column counts, can't navigate virtualized content
**Why it happens:** Only rendered rows have ARIA attributes; total counts not provided
**How to avoid:** Set `aria-rowcount` to total data length (not DOM row count); set `aria-rowindex` on each row relative to full dataset
**Warning signs:** Screen reader says "row 5 of 20" when there are 100K rows

### Pitfall 5: Scroll Position Lost on Data Updates
**What goes wrong:** User sorts or filters, loses scroll position, has to scroll back
**Why it happens:** Virtualizer recalculates on data change without preserving scroll offset
**How to avoid:** Store scroll position before update, restore after; TanStack Virtual handles this when you maintain the same virtualizer instance
**Warning signs:** Users complain about UX after sorting/filtering large datasets

### Pitfall 6: Loading State Not Distinguishing Initial vs Update
**What goes wrong:** Full skeleton shown during minor updates; or no feedback during initial load
**Why it happens:** Single loading state doesn't differentiate between states
**How to avoid:** Implement two states: `isInitialLoading` (skeleton rows) and `isUpdating` (overlay on existing content)
**Warning signs:** Content flashes between skeleton and data on every sort/filter

## Code Examples

Verified patterns from official sources:

### Column Definition with TanStack Table
```typescript
// Source: TanStack Table docs
import { ColumnDef, createColumnHelper } from '@tanstack/lit-table';

type Person = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
};

const columnHelper = createColumnHelper<Person>();

const columns: ColumnDef<Person>[] = [
  columnHelper.accessor('name', {
    header: () => 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: () => 'Email',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => html`
      <span class="badge badge-${info.getValue()}">
        ${info.getValue()}
      </span>
    `,
  }),
];
```

### Skeleton Loading State
```typescript
// Source: Carbon Design System loading patterns
private renderSkeletonRows(count: number) {
  return html`
    <div class="skeleton-container" aria-busy="true" aria-label="Loading data">
      ${Array.from({ length: count }).map(() => html`
        <div role="row" class="skeleton-row">
          ${this.columns.map(() => html`
            <div role="gridcell" class="skeleton-cell">
              <div class="skeleton-pulse"></div>
            </div>
          `)}
        </div>
      `)}
    </div>
  `;
}
```

```css
/* Skeleton pulse animation */
.skeleton-pulse {
  height: 1em;
  background: linear-gradient(
    90deg,
    var(--ui-skeleton-base) 25%,
    var(--ui-skeleton-highlight) 50%,
    var(--ui-skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty State Component
```typescript
// Source: Common UI pattern
private renderEmptyState(hasFilters: boolean) {
  const message = hasFilters
    ? 'No results match your filters'
    : 'No data available';
  const description = hasFilters
    ? 'Try adjusting your search or filter criteria'
    : 'Data will appear here once available';

  return html`
    <div role="row" aria-rowindex="1">
      <div
        role="gridcell"
        aria-colspan=${this.columns.length}
        class="empty-state"
      >
        <div class="empty-state-icon">
          ${hasFilters ? this.renderSearchIcon() : this.renderEmptyIcon()}
        </div>
        <p class="empty-state-message">${message}</p>
        <p class="empty-state-description">${description}</p>
      </div>
    </div>
  `;
}
```

### Virtualizer Configuration for Tables
```typescript
// Source: TanStack Virtual docs + table integration
private setupVirtualizer() {
  this.virtualizerController = new VirtualizerController(this, {
    getScrollElement: () => this.scrollContainerRef.value,
    count: this.data.length,
    estimateSize: () => this.rowHeight, // Fixed height, e.g., 40
    overscan: 5, // Render 5 extra rows above/below viewport
  });
}

// Update count when data changes
updated(changedProperties: Map<string, unknown>) {
  if (changedProperties.has('data')) {
    // VirtualizerController auto-notifies on count change (v3.13.14+)
    this.virtualizerController.setOptions({
      count: this.data.length,
    });
  }
}
```

### ARIA Grid Structure
```typescript
// Source: W3C WAI-ARIA APG Grid Pattern
render() {
  return html`
    <div
      role="grid"
      aria-label=${this.ariaLabel || 'Data table'}
      aria-rowcount=${this.data.length + 1} <!-- +1 for header -->
      aria-colcount=${this.columns.length}
      aria-busy=${this.loading}
      @keydown=${this.handleKeyDown}
    >
      <div role="rowgroup">
        <div role="row" aria-rowindex="1">
          ${this.columns.map((col, idx) => html`
            <div
              role="columnheader"
              aria-colindex=${idx + 1}
              aria-sort=${this.getSortDirection(col)}
              tabindex=${this.focusedCell.row === 0 && this.focusedCell.col === idx ? 0 : -1}
            >
              ${col.header}
            </div>
          `)}
        </div>
      </div>
      <div role="rowgroup">
        ${this.renderVirtualRows()}
      </div>
    </div>
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Render all rows | Virtual scrolling | ~2018 | 100K+ rows now feasible |
| `<table>` elements | div + ARIA roles | With virtualization | Enables absolute positioning for virtualization |
| Page-based tables | Infinite scroll + virtual | ~2020 | Better UX for large datasets |
| Custom virtualizers | TanStack Virtual | 2022 (v3) | Framework-agnostic, battle-tested |
| React Table v7 | TanStack Table v8 | 2022 | Headless, framework-agnostic |

**Deprecated/outdated:**
- `react-virtualized`: Replaced by TanStack Virtual; not framework-agnostic
- `react-window`: Limited features compared to TanStack Virtual
- TanStack Table v7: Superseded by v8 with framework-agnostic core

## Open Questions

Things that couldn't be fully resolved:

1. **Horizontal virtualization for many columns**
   - What we know: TanStack Virtual supports horizontal virtualization
   - What's unclear: Best integration pattern when table has 50+ columns
   - Recommendation: Start with row virtualization only; add column virtualization in future phase if needed

2. **@lit-labs/virtualizer vs @tanstack/lit-virtual**
   - What we know: Both work with Lit; @lit-labs is official but prerelease; @tanstack has better Table integration
   - What's unclear: Whether @lit-labs/virtualizer will graduate from labs
   - Recommendation: Use @tanstack/lit-virtual for TanStack Table integration; consistent ecosystem

3. **Fixed vs dynamic row heights**
   - What we know: Fixed heights are strongly recommended for scroll stability
   - What's unclear: Exact threshold where dynamic heights become problematic
   - Recommendation: Implement with fixed heights (VIRT-03 requirement); defer dynamic height support

## Sources

### Primary (HIGH confidence)
- [TanStack Table Lit Docs](https://tanstack.com/table/v8/docs/framework/lit/lit-table) - TableController API, column definitions
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest/docs/api/virtualizer) - Virtualizer API, overscan, scroll handling
- [W3C WAI-ARIA APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) - Complete keyboard navigation spec, ARIA attributes
- [MDN ARIA Grid Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/grid_role) - Role requirements, focus management

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Position Sticky and Table Headers](https://css-tricks.com/position-sticky-and-table-headers/) - Sticky `<th>` pattern
- [Carbon Design System Loading Patterns](https://carbondesignsystem.com/patterns/loading-pattern/) - Skeleton loader guidance
- [@lit-labs/virtualizer README](https://github.com/lit/lit/blob/main/packages/labs/virtualizer/README.md) - Alternative virtualizer API
- [TanStack GitHub Releases](https://github.com/TanStack/table/releases) - Recent Lit adapter fixes

### Tertiary (LOW confidence)
- [Medium: Lit + TanStack Table + Twind](https://medium.com/@morkadosh/build-beautiful-accessible-tables-that-work-everywhere-with-lit-tanstack-table-and-twind-1275049d53a1) - Community integration example (could not fetch full content)
- [NN/g: Saving Scroll Position](https://www.nngroup.com/articles/saving-scroll-position/) - UX research on scroll preservation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TanStack has official Lit adapters, actively maintained, well-documented
- Architecture: HIGH - Patterns verified against official docs and existing project patterns
- Pitfalls: MEDIUM - Based on GitHub issues, community discussions, and general virtualization best practices

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - TanStack ecosystem is stable)
