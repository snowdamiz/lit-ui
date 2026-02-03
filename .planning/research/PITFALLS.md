# Domain Pitfalls: Data Table Component

**Domain:** Full-featured data table for admin dashboards (100K+ rows)
**Researched:** 2026-02-02
**Confidence:** HIGH (verified against TanStack Virtual issues, W3C APG, Shadow DOM accessibility specs)

---

## Critical Pitfalls

Mistakes that cause rewrites, major accessibility failures, or unusable performance.

---

### CRITICAL-01: Virtual Scrolling with Variable Row Heights

**What goes wrong:** Using `@tanstack/lit-virtual` with rows that have variable content heights (e.g., wrapped text, expandable rows, inline editors) causes severe scroll stuttering, content jumping, and inaccurate scroll position when scrolling upward.

**Why it happens:** The virtualizer estimates row heights before measurement. When actual measured heights differ significantly from estimates, the virtualizer must adjust positions, causing visible jumps. This is especially bad when scrolling backwards because items above the viewport push content down.

**Consequences:**
- Scrollbar thumb constantly resizes as content is measured
- Scrolling up causes content to "jump" unpredictably
- `scrollToIndex()` navigates to wrong position
- Users lose their place in data
- 60fps performance degrades to <30fps

**Warning signs:**
- Inline editing adds content (textarea grows)
- Cell content wraps across multiple lines
- Expandable row details
- Dynamic column widths affecting text wrap

**Prevention:**
1. **Use fixed row heights as default.** Set `estimateSize: () => 48` and enforce height via CSS `height: 48px; overflow: hidden`
2. **If variable heights required:** Set `estimateSize` to the LARGEST expected height, not average
3. **Disable smooth scrolling** when using `measureElement` - TanStack docs explicitly state "Attempting to use smoothScroll with dynamically measured elements will not work"
4. **Set `overflow-anchor: none`** on scroll container to disable browser scroll anchoring (virtualizer manages this internally)
5. **Firefox workaround required:** Disable `measureElement` for Firefox due to incorrect table border height measurement

**Phase impact:** Phase 1 (Core Virtual Scroll) - establish fixed-height row constraint early

**Sources:**
- [TanStack Virtual Issue #659](https://github.com/TanStack/virtual/issues/659) - Scrolling up stutters/jumps
- [TanStack Virtual Issue #832](https://github.com/TanStack/virtual/issues/832) - Dynamic height lag
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest/docs/api/virtualizer) - `shouldAdjustScrollPositionOnItemSizeChange`

---

### CRITICAL-02: ARIA Grid vs Table Role Selection

**What goes wrong:** Using `role="table"` for an interactive data table, or using `role="grid"` for a read-only data display. Screen readers provide completely different navigation and announcement patterns for each.

**Why it happens:** Tables and grids look identical visually. Developers choose based on appearance, not interaction model. ARIA grid requires specific keyboard interaction contract.

**Consequences:**
- `role="table"` with interactive cells: Screen reader users cannot navigate to/interact with cell contents
- `role="grid"` without full keyboard implementation: Violates ARIA contract, screen readers expect arrow key navigation
- Partial implementations break assistive technology entirely
- WCAG 2.1 AA compliance failure

**Warning signs:**
- Interactive elements in cells (buttons, links, inputs)
- Cell-level selection or editing
- Keyboard navigation requirements beyond Tab

**Prevention:**
1. **Use `role="grid"` ONLY if:**
   - Users need to navigate individual cells (not just rows)
   - Cells contain interactive content
   - Arrow key navigation is implemented
   - Full ARIA grid contract is satisfied

2. **Use `role="table"` when:**
   - Data is read-only presentation
   - Interaction is row-level only (click row to select)
   - No cell-level keyboard navigation needed

3. **For LitUI Data Table (interactive):** Use `role="grid"` with:
   - `role="row"` on each row
   - `role="gridcell"` on each cell
   - `role="columnheader"` on header cells
   - `aria-rowindex` and `aria-colindex` (1-based)
   - `aria-rowcount` and `aria-colcount` on grid element
   - Full arrow key navigation (up/down/left/right between cells)
   - `aria-activedescendant` for roving focus (recommended for Shadow DOM)

**Phase impact:** Phase 1 (Core) - ARIA structure must be correct from start; cannot retrofit

**Sources:**
- [Sarah Higley - Grids Part 1](https://sarahmhigley.com/writing/grids-part1/) - When to use grid vs table
- [W3C APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) - Full ARIA grid contract
- [MDN ARIA table role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/table_role) - Table semantics

---

### CRITICAL-03: Shadow DOM ARIA ID References

**What goes wrong:** Using `aria-labelledby`, `aria-describedby`, or `aria-controls` to reference elements across Shadow DOM boundaries. The reference silently fails because IDs are scoped to their shadow root.

**Why it happens:** ARIA ID references (IDRef) work only within the same DOM tree. Shadow DOM creates separate trees. A header cell ID in the shadow DOM cannot be referenced by a body cell's `aria-labelledby`.

**Consequences:**
- Screen readers don't announce column headers when navigating cells
- `aria-describedby` for error messages doesn't work
- `aria-labelledby` for accessible names fails silently
- No browser errors - silent accessibility failure
- WCAG failure difficult to detect in testing

**Warning signs:**
- Column headers in different shadow root than body cells
- Error messages rendered outside cell's shadow root
- Tooltip/popover content referenced via ARIA

**Prevention:**
1. **Keep ARIA relationships within same shadow root:**
   - Render column headers AND body cells in same shadow root
   - Container component pattern (like RadioGroup) where parent owns entire structure

2. **Use `aria-label` instead of `aria-labelledby`:**
   - Set `aria-label` directly on each cell with column name
   - More verbose but works across shadow boundaries

3. **Wait for Reference Target spec (experimental):**
   - Chrome/Safari have origin trial for `shadowRootReferenceTarget`
   - Not production-ready as of 2026-02

4. **For LitUI Data Table:** Use container-rendered pattern:
   - `<lui-data-table>` renders entire grid structure in its shadow DOM
   - Row/cell data passed as properties, not slotted elements
   - All ARIA IDs stay within single shadow root

**Phase impact:** Phase 1 (Core) - architectural decision that affects all subsequent features

**Sources:**
- [Nolan Lawson - Shadow DOM ARIA trouble](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)
- [Alice Boxhall - Shadow DOM/Accessibility conflict](https://alice.pages.igalia.com/blog/how-shadow-dom-and-accessibility-are-in-conflict/)
- [Cory Rylan - ID Referencing in Shadow DOM](https://coryrylan.com/blog/accessibility-with-id-referencing-and-shadow-dom)

---

### CRITICAL-04: Race Conditions in Server-Side Operations

**What goes wrong:** User sorts column A, then quickly sorts column B. Request for A returns after request for B. Table displays stale data from request A, but UI shows sort indicator on column B.

**Why it happens:** Network requests complete in unpredictable order. Without cancellation, the most recent response wins regardless of which request started first.

**Consequences:**
- Displayed data doesn't match UI sort/filter indicators
- Users make decisions based on wrong data
- Bulk actions operate on wrong selection
- Data corruption in edit scenarios

**Warning signs:**
- Server-side sorting enabled
- Server-side filtering/search
- Server-side pagination
- Any async data operation

**Prevention:**
1. **Use AbortController for all server requests:**
   ```typescript
   private _abortController?: AbortController;

   async fetchData(params: DataParams) {
     // Cancel any pending request
     this._abortController?.abort();
     this._abortController = new AbortController();

     try {
       const response = await fetch(url, {
         signal: this._abortController.signal
       });
       // Process response
     } catch (e) {
       if (e.name === 'AbortError') return; // Ignored - superseded
       throw e;
     }
   }
   ```

2. **Track request sequence numbers:**
   ```typescript
   private _requestId = 0;

   async fetchData(params: DataParams) {
     const myRequestId = ++this._requestId;
     const data = await this.dataSource(params);

     // Only apply if still the latest request
     if (myRequestId !== this._requestId) return;
     this.data = data;
   }
   ```

3. **Debounce rapid inputs** (search, filter) - 200-300ms delay
4. **Disable UI during fetch** (optional but clear UX)

**Phase impact:** Phase 2 (Sorting/Filtering) - implement AbortController pattern from first server interaction

**Sources:**
- [TkDodo - Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
- [Dejan Vasic - Optimistic Update Race Conditions](https://dejan.vasic.com.au/blog/2025/11/solving-optimistic-update-race-conditions-in-sveltekit)

---

## High-Severity Pitfalls

Mistakes that cause significant bugs, poor UX, or accessibility issues.

---

### HIGH-01: Inline Editing Focus Trap

**What goes wrong:** User tabs into an editable cell. Focus gets trapped - Tab key moves to next cell input instead of allowing escape from table. Or: Tab escapes table entirely, skipping other editable cells.

**Why it happens:** Data grids require two navigation modes:
1. **Grid navigation:** Arrow keys between cells, Tab to leave grid
2. **Edit mode:** Arrow keys for text editing, Tab to next form field

Mixing these modes or not clearly transitioning causes focus chaos.

**Consequences:**
- Keyboard-only users cannot edit data
- Screen reader users cannot navigate edited content
- Tab order unpredictable
- Form submission may skip cells

**Warning signs:**
- Cells become editable on click/Enter
- Multiple editable cells visible simultaneously
- Form controls (input, select) rendered in cells

**Prevention:**
1. **Use two distinct modes with clear entry/exit:**
   - **Navigation mode:** Arrow keys move between cells, Enter/F2 enters edit mode
   - **Edit mode:** Arrow keys work in input, Escape exits edit mode, Tab can optionally move to next editable cell within row

2. **AG Grid pattern:**
   - Single `tabindex="0"` on the grid
   - `aria-activedescendant` points to current cell
   - `suppressKeyboardEvent` callback for custom behavior in edit mode

3. **Clear visual indicator of current mode:**
   - Navigation: Cell outline focus ring
   - Edit: Input focus ring within cell

4. **Roving tabindex for cells:** Only one cell has `tabindex="0"`, others have `tabindex="-1"`

**Phase impact:** Phase 3 (Inline Editing) - establish navigation mode state machine early

**Sources:**
- [AG Grid Keyboard Interaction](https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/)
- [UXPin Keyboard Navigation Patterns](https://www.uxpin.com/studio/blog/keyboard-navigation-patterns-complex-widgets/)
- [Telerik Grid Keyboard Navigation](https://demos.telerik.com/blazor-ui/grid/keyboard-navigation)

---

### HIGH-02: Optimistic Update Rollback Failure

**What goes wrong:** User edits cell, sees immediate update, server rejects edit, but UI doesn't revert. Or: UI reverts but selection state corrupted. Or: Undo conflicts with server state.

**Why it happens:** Optimistic updates require:
1. Snapshot of previous state
2. Immediate UI update
3. Server confirmation OR rollback
4. Correct handling of concurrent edits

Any gap in this chain causes state corruption.

**Consequences:**
- User sees data that doesn't exist on server
- Subsequent operations fail mysteriously
- Save/cancel flow breaks
- Bulk operations partial-commit

**Warning signs:**
- Inline cell editing
- Optimistic row updates
- Concurrent user editing scenarios

**Prevention:**
1. **Snapshot before mutation:**
   ```typescript
   async updateCell(rowId: string, field: string, newValue: any) {
     const previousValue = this.getCell(rowId, field);

     // Optimistic update
     this.setCell(rowId, field, newValue);

     try {
       await this.saveCell(rowId, field, newValue);
     } catch (e) {
       // Rollback on failure
       this.setCell(rowId, field, previousValue);
       this.showError(e);
     }
   }
   ```

2. **Row-level editing mode (simpler):**
   - Enter edit mode on row
   - Changes buffered locally
   - Save or Cancel button commits/reverts entire row
   - No optimistic updates - explicit save action

3. **Version/ETag conflict detection:**
   - Track row version from server
   - Reject stale updates with "edited by another user" message

4. **Disable other rows during edit** (simplest approach)

**Phase impact:** Phase 3 (Inline Editing) - decide on optimistic vs explicit save pattern

**Sources:**
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates)
- [DEV Community - Data Table Optimistic Updates](https://dev.to/enyelsequeira/building-a-data-table-with-optimistic-updates-4j9a)

---

### HIGH-03: Column Resize/Reorder State Persistence

**What goes wrong:** User resizes column, scrolls down, resizes another column - first column resets to original width. Or: Column order persists but widths lost on page reload. Or: Drag ghost doesn't match actual column.

**Why it happens:** Column customization requires coordinating:
1. Drag/resize DOM events
2. Internal state updates
3. Style recalculation
4. Virtual scroll recalculation (widths affect total width)
5. Persistence to localStorage/server

Failure at any step causes state inconsistency.

**Consequences:**
- Users lose customization work
- Jarring visual resets during interaction
- Saved preferences not restored
- Export doesn't match visible columns

**Warning signs:**
- Column resize handles
- Column drag-to-reorder
- Column show/hide toggles
- Preference persistence

**Prevention:**
1. **Use resize guides (not live resize):**
   - On drag start: Show vertical guide line
   - On drag: Move guide only
   - On drag end: Apply width change once
   - Avoids jittery redraws during drag

2. **Separate concerns:**
   ```typescript
   // Column definition (immutable per session)
   interface ColumnDef {
     field: string;
     header: string;
     defaultWidth: number;
   }

   // Column state (mutable, persisted)
   interface ColumnState {
     field: string;
     width: number;
     order: number;
     visible: boolean;
   }
   ```

3. **Debounce persistence** - don't save on every resize pixel, save 500ms after resize end

4. **Frozen columns cannot be reordered** - Tabulator pattern, explicit constraint

5. **CSS Grid for column widths:**
   - `grid-template-columns` from state
   - Single source of truth for widths
   - Virtual scroll header and body share same template

**Phase impact:** Phase 4 (Column Customization) - column state model must support all operations

**Sources:**
- [Tabulator Layout Docs](https://tabulator.info/docs/6.3/layout) - Resize guides, frozen columns
- [Let's Build UI - Resizable Tables](https://www.letsbuildui.dev/articles/resizable-tables-with-react-and-css-grid/)

---

### HIGH-04: Shift+Click Range Selection Edge Cases

**What goes wrong:** User selects row 5, filters list, shift+clicks row 10 (which was row 20 before filter). Range includes invisible rows. Or: shift+click across page boundary selects nothing.

**Why it happens:** Range selection must track:
1. Anchor row (first selection)
2. Current row (shift+click target)
3. Whether range is over filtered/visible data or underlying data
4. Whether range crosses pagination boundaries

**Consequences:**
- Bulk delete removes wrong rows
- Export includes unintended data
- User expectation mismatch

**Warning signs:**
- Shift+click range selection
- Filtering with selection active
- Pagination with selection active

**Prevention:**
1. **Clear selection on filter/sort change** (simplest, safest)

2. **If preserving selection across filter:**
   - Store selection by row ID, not index
   - Shift+click selects only VISIBLE rows in range
   - Show count: "5 selected (3 hidden by filter)"

3. **Cross-page selection:**
   - Either: disable shift+click across pages
   - Or: "Select all 3,200 matching items" explicit action (Gmail pattern)

4. **Track anchor by ID:**
   ```typescript
   private _anchorRowId: string | null = null;
   private _selectedIds = new Set<string>();

   handleClick(rowId: string, event: MouseEvent) {
     if (event.shiftKey && this._anchorRowId) {
       // Select range of VISIBLE rows between anchor and target
       this.selectVisibleRange(this._anchorRowId, rowId);
     } else {
       this._anchorRowId = rowId;
       this.toggleSelection(rowId);
     }
   }
   ```

**Phase impact:** Phase 3 (Selection) - define selection behavior before implementing bulk actions

**Sources:**
- [TanStack Table Discussion #3068](https://github.com/TanStack/table/discussions/3068) - Shift+click implementation
- [Eleken - Bulk Action UX Guidelines](https://www.eleken.co/blog-posts/bulk-actions-ux)

---

### HIGH-05: Sticky Header/Column with Virtual Scroll

**What goes wrong:** Sticky header disappears when scrolling in virtualized table. Or: Sticky column and header don't stay synchronized during scroll. Or: Sticky elements scroll at different speeds.

**Why it happens:** Virtual scrolling transforms row positions dynamically. CSS `position: sticky` relies on containing block relationships that get disrupted by virtualizer's absolute positioning.

**Consequences:**
- Users lose context (which column is this data?)
- Visual glitches during scroll
- Header/column offset misalignment

**Warning signs:**
- `position: sticky` on header
- Virtual scrolling enabled
- Horizontal scrolling with frozen columns

**Prevention:**
1. **Use dedicated sticky containers (TanStack pattern):**
   ```css
   .sticky-header-container {
     position: sticky;
     top: 0;
     z-index: 10;
   }

   .virtual-scroll-container {
     height: calc(100% - header-height);
     overflow: auto;
   }
   ```

2. **Separate scroll containers:**
   - Header: Fixed position, synced via `scrollLeft` on body scroll
   - Body: Virtual scrolled
   - Left frozen columns: Separate container, synced via `scrollTop`

3. **Single scroll ref pattern (TanStack recommendation):**
   - One ref for both horizontal and vertical scrolling
   - Header and frozen column use `position: sticky` within that container
   - Add `stickyHeight` and `stickyWidth` to virtual container sizing

4. **Z-index layering:**
   - Header cells: `z-index: 2`
   - Frozen column cells: `z-index: 5`
   - Frozen header corner: `z-index: 6`

**Phase impact:** Phase 1 (Core) - scroll architecture must support sticky from start

**Sources:**
- [TanStack Virtualizer Sticky Headers](https://mashuktamim.medium.com/building-sticky-headers-and-columns-with-tanstack-virtualizer-react-a-complete-guide-12123ef75334)
- [CSS-Tricks - Position Sticky and Tables](https://css-tricks.com/position-sticky-and-table-headers/)
- [TanStack Virtual Issue #640](https://github.com/TanStack/virtual/issues/640) - Sticky header disappears

---

## Medium-Severity Pitfalls

Mistakes that cause bugs, confusion, or technical debt.

---

### MEDIUM-01: Form-Associated Cell Validation Timing

**What goes wrong:** Cell shows valid state, user submits form, validation runs late, form submits with invalid data. Or: Validation message appears in wrong position relative to cell.

**Why it happens:** ElementInternals validation is separate from native form validation timing. Shadow DOM boundary complicates error message positioning.

**Consequences:**
- Invalid data submitted
- Error messages hidden or misplaced
- Validation state flickers

**Prevention:**
1. **Validate on blur AND before submit:**
   ```typescript
   setValidity(flags: ValidityStateFlags, message: string) {
     this.internals?.setValidity(flags, message, this.inputElement);
   }

   handleBlur() {
     this.validate();
   }

   formAssociatedCallback(form: HTMLFormElement) {
     form.addEventListener('submit', () => this.validate());
   }
   ```

2. **Error messages inside cell** (same shadow root as validation anchor)

3. **Use `reportValidity()` for immediate feedback**

**Phase impact:** Phase 3 (Inline Editing) - validation architecture

**Sources:**
- [WebKit - ElementInternals](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)
- [CSS-Tricks - ElementInternals](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/)

---

### MEDIUM-02: Memory Leaks from Event Listeners

**What goes wrong:** Table with 100K rows adds resize observer per row. Component disconnected but observers still running. Memory grows on navigation.

**Why it happens:**
- Event listeners on rows not cleaned up on disconnect
- ResizeObserver/IntersectionObserver not disconnected
- VirtualizerController not cleaned up

**Consequences:**
- Memory grows over time
- CPU usage increases
- Browser tab slows/crashes

**Prevention:**
1. **Single observer pattern:**
   - One ResizeObserver for entire table
   - One IntersectionObserver for infinite scroll sentinel
   - Never per-row observers

2. **Clean up in disconnectedCallback:**
   ```typescript
   disconnectedCallback() {
     super.disconnectedCallback();
     this._virtualizer = undefined;
     this._resizeObserver?.disconnect();
     this._abortController?.abort();
   }
   ```

3. **Remove global listeners:**
   ```typescript
   connectedCallback() {
     window.addEventListener('resize', this._handleResize);
   }

   disconnectedCallback() {
     window.removeEventListener('resize', this._handleResize);
   }
   ```

**Phase impact:** All phases - establish cleanup pattern in Phase 1

**Sources:**
- [Lit GitHub Issue #3935](https://github.com/lit/lit/issues/3935) - Detached HTMLTemplateElement leak
- [TanStack Virtual Issue #196](https://github.com/TanStack/virtual/issues/196) - Memory leak with react-table

---

### MEDIUM-03: Minimum Column Width Below Usable

**What goes wrong:** User drags column resize handle all the way left. Column becomes 0px or 10px. Content invisible. No way to resize back (handle too small to click).

**Why it happens:** No minimum width constraint during resize drag.

**Consequences:**
- Column content invisible
- Cannot undo resize
- Table unusable without reset

**Prevention:**
1. **Enforce minimum width (50px recommended):**
   ```typescript
   handleResize(newWidth: number) {
     const clampedWidth = Math.max(newWidth, 50);
     this.setColumnWidth(columnId, clampedWidth);
   }
   ```

2. **Reset button in column header menu**

3. **Double-click to auto-fit content**

**Phase impact:** Phase 4 (Column Customization)

**Sources:**
- [Tabulator Docs](https://tabulator.info/docs/6.3/layout) - Minimum column width

---

### MEDIUM-04: CSS Display Grid Breaking Table Semantics

**What goes wrong:** Using `display: grid` on table element removes native table semantics from accessibility tree. Screen readers no longer treat it as a table.

**Why it happens:** CSS display property overrides HTML semantics in some browsers.

**Consequences:**
- Screen readers don't announce "table with X rows, Y columns"
- Table navigation shortcuts don't work
- ARIA roles become required to restore semantics

**Prevention:**
1. **Use ARIA roles explicitly when using CSS Grid:**
   ```html
   <div role="grid" aria-rowcount="100" aria-colcount="5">
     <div role="row">
       <div role="columnheader">Name</div>
     </div>
   </div>
   ```

2. **Or use CSS `display: contents` carefully** (has its own issues)

3. **Test with screen readers** - JAWS + Chrome recommended

**Phase impact:** Phase 1 (Core) - HTML structure decision

**Sources:**
- [Adrian Roselli - Tables and CSS Display](https://adrianroselli.com/2018/02/tables-css-display-properties-and-aria.html)
- [Sarah Higley - Grids Part 2](https://sarahmhigley.com/writing/grids-part2/)

---

## Low-Severity Pitfalls

Annoyances or minor issues that are easily fixable.

---

### LOW-01: Column Header Text Truncation Without Tooltip

**What goes wrong:** Long column header text truncated with ellipsis. Users can't see full header name.

**Prevention:** Add `title` attribute or show tooltip on truncated headers.

**Phase impact:** Phase 1 (Core)

---

### LOW-02: Empty State Not Showing During Load

**What goes wrong:** Table shows "No data" briefly while loading, then data appears. Confusing flicker.

**Prevention:** Show skeleton/loading state, not empty state, during initial load. Only show "No data" when load completes with zero results.

**Phase impact:** Phase 2 (Filtering) - empty vs loading distinction

---

### LOW-03: Export Includes Hidden Columns

**What goes wrong:** User hides columns for viewing, exports data, hidden columns appear in export.

**Prevention:** Add export option: "Export visible columns only" vs "Export all columns"

**Phase impact:** Phase 4 (Column Customization) + Export feature

---

## Phase-Specific Warning Summary

| Phase | Primary Pitfall Risk | Mitigation |
|-------|---------------------|------------|
| Phase 1: Core Virtual Scroll | CRITICAL-01 (Variable heights), CRITICAL-03 (Shadow DOM ARIA), HIGH-05 (Sticky scroll) | Fixed row height, container-rendered pattern, separate sticky containers |
| Phase 2: Sorting/Filtering | CRITICAL-04 (Race conditions), HIGH-04 (Range selection with filter) | AbortController, clear selection on filter |
| Phase 3: Inline Editing | HIGH-01 (Focus trap), HIGH-02 (Optimistic rollback), MEDIUM-01 (Validation) | Two-mode navigation, explicit save pattern |
| Phase 4: Column Customization | HIGH-03 (State persistence), MEDIUM-03 (Min width) | Resize guides, debounced persistence, 50px minimum |
| Phase 5: Selection & Bulk Actions | HIGH-04 (Shift+click edge cases) | ID-based selection, visible-only range |

---

## Quick Reference: Do/Don't

| Category | Do | Don't |
|----------|-----|-------|
| Row heights | Use fixed heights (48px) | Dynamic heights without estimation |
| ARIA | Use `role="grid"` with full contract | Use `role="table"` for interactive cells |
| Shadow DOM | Keep all ARIA IDs in same shadow root | Reference IDs across shadow boundaries |
| Server operations | Cancel pending requests on new operation | Ignore stale responses |
| Keyboard | Implement grid navigation + edit mode | Trap focus in edit mode |
| Column resize | Use resize guides, enforce 50px min | Live resize every pixel |
| Selection | Track by row ID, not index | Assume filter/sort preserves selection |
| Sticky elements | Separate sticky container | position: sticky in virtual scroll |
| Memory | Clean up observers in disconnectedCallback | Per-row observers |

---

## Sources Summary

**Virtual Scrolling:**
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest/docs/api/virtualizer)
- [TanStack Virtual GitHub Issues](https://github.com/TanStack/virtual/issues)
- [DEV Community - Virtual Scrolling](https://dev.to/lalitkhu/rendering-massive-tables-at-lightning-speed-virtualization-with-virtual-scrolling-2dpp)

**Accessibility:**
- [W3C APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [Sarah Higley - Grids](https://sarahmhigley.com/writing/grids-part1/)
- [Nolan Lawson - Shadow DOM ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)
- [MDN ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/)

**State Management:**
- [TkDodo - Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
- [TanStack Query Docs](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates)

**Keyboard/Focus:**
- [AG Grid Keyboard Navigation](https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/)
- [UXPin Keyboard Patterns](https://www.uxpin.com/studio/blog/keyboard-navigation-patterns-complex-widgets/)

**Column Operations:**
- [Tabulator Layout](https://tabulator.info/docs/6.3/layout)
- [DataTables ColReorder](https://datatables.net/extensions/colreorder/)

**Form Integration:**
- [WebKit ElementInternals](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)
- [CSS-Tricks ElementInternals](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/)
