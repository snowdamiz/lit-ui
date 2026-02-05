# Phase 68: Package, CLI & Documentation - Research

**Researched:** 2026-02-05
**Domain:** npm packaging, CLI integration, documentation site, CSS theming
**Confidence:** HIGH

## Summary

Phase 68 is the final phase of the v7.0 Data Table milestone. It covers three areas: (1) finalizing the `@lit-ui/data-table` npm package for distribution, (2) adding the data-table to the CLI registry with copy-source templates, and (3) creating a comprehensive documentation page.

The data-table package already exists (`packages/data-table/`) with a working `package.json`, `index.ts`, `jsx.d.ts`, and `vite.config.ts`. It builds to a single 182KB bundle (`dist/index.js`) with 42KB types (`dist/index.d.ts`). The package correctly externalizes `lit`, `@lit-ui/core`, `@lit-ui/popover`, and `@lit-ui/checkbox` while bundling TanStack dependencies. The main work is: fixing missing peer dependencies, updating the custom element registration pattern, creating CLI templates, and building the documentation page.

**Primary recommendation:** Follow the established patterns from prior packages (accordion, tabs, select) exactly -- package.json structure, JSX declarations, CLI registry entry, and documentation page layout are all well-established.

## Standard Stack

### Core (already in place)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/lit-table | ^8.21.3 | Headless table state management | Already used in data-table as `dependency` |
| @tanstack/lit-virtual | ^3.13.6 | Virtual row rendering | Already used in data-table as `dependency` |
| lit | ^3.3.2 | Web component framework | Project standard, `peerDependency` |
| @lit-ui/core | ^1.0.0 | TailwindElement base class | Project standard, `peerDependency` |
| vite-plugin-dts | ^4.5.4 | TypeScript declaration generation | Used by all packages via `@lit-ui/vite-config` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @lit-ui/checkbox | ^1.0.0 | Selection column + column picker | Used by createSelectionColumn and renderColumnPicker |
| @lit-ui/popover | ^1.0.0 | Column picker dropdown + kebab menu | Used by renderColumnPicker and renderRowActions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Copy-source starter template | Full component copy | Data table is 7,070 lines across 17 files; copy-source must be a simplified starter (follows Select pattern of ~200 line shell) |
| Single dist bundle | Multi-entry build | rollupTypes: true in dts plugin already rolls all types to index.d.ts; single bundle is the project pattern |

## Architecture Patterns

### Package Structure (matches existing packages)
```
packages/data-table/
  src/
    index.ts              # Exports, re-exports, element registration [EXISTS - needs update]
    jsx.d.ts              # JSX/TSX declarations [EXISTS - needs update]
    data-table.ts         # Main component [EXISTS]
    types.ts              # Type definitions [EXISTS]
    ... (17 source files) # All feature modules [EXISTS]
  dist/
    index.js              # Single ES module bundle [BUILT]
    index.d.ts            # Rolled-up declarations [BUILT]
  package.json            # Package metadata [EXISTS - needs update]
  tsconfig.json           # TypeScript config [EXISTS]
  vite.config.ts          # Build config [EXISTS]
```

### Pattern 1: Package.json Dependencies (PKG-01)

The data-table has two categories of dependencies:

**Direct dependencies (bundled into dist/index.js):**
- `@tanstack/lit-table` -- bundled, consumers do NOT install separately
- `@tanstack/lit-virtual` -- bundled, consumers do NOT install separately

**Peer dependencies (externalized, consumer must install):**
- `lit` ^3.0.0
- `@lit-ui/core` ^1.0.0

**MISSING peer dependencies (currently externalized in build but not declared):**
- `@lit-ui/checkbox` ^1.0.0 -- used by `createSelectionColumn()` and `renderColumnPicker()`
- `@lit-ui/popover` ^1.0.0 -- used by `renderColumnPicker()` and `renderRowActions()` kebab menu

These MUST be added as `peerDependencies` since the Vite library config (`/^@lit-ui\//` regex) externalizes them. Without declaring them, consumers get runtime errors.

**Decision:** Make `@lit-ui/checkbox` and `@lit-ui/popover` peer dependencies (not optional), since selection and column picker are core features. Alternatively, they could be `peerDependenciesMeta` with `optional: true` if the intent is that these features are opt-in, but the simpler approach matches the project pattern.

```json
{
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0",
    "@lit-ui/checkbox": "^1.0.0",
    "@lit-ui/popover": "^1.0.0"
  }
}
```

### Pattern 2: Custom Element Registration (match accordion pattern)

Current data-table registration (line 3507-3510):
```typescript
// Current: client-side only
if (!isServer) {
  customElements.define('lui-data-table', DataTable);
}
```

The accordion/tabs packages use a more robust pattern with collision detection and SSR support:
```typescript
// Source: packages/accordion/src/index.ts
if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-accordion')) {
    customElements.define('lui-accordion', Accordion);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-accordion] Custom element already registered.');
  }
}
```

The data-table registration should be moved from `data-table.ts` to `index.ts` and adopt the collision detection pattern. The current registration inside the component file prevents clean re-export without side effects.

### Pattern 3: JSX Declarations (PKG-03)

Current `jsx.d.ts` exists but is incomplete:
- Missing many properties added in phases 62-67 (filtering, pagination, column customization, editing, actions, export, expandable rows)
- Missing events in Svelte section (only has 4 events, should have 13)
- Does not reference the full attribute set

The JSX declarations must match ALL public properties:
```typescript
interface LuiDataTableAttributes<TData extends RowData = RowData> {
  // Data
  columns?: ColumnDef<TData>[];
  data?: TData[];
  loading?: LoadingState;
  'aria-label'?: string;
  'max-height'?: string;
  'row-height'?: number;
  'skeleton-rows'?: number;
  'empty-state-type'?: EmptyStateType;
  'no-data-message'?: string;
  'no-matches-message'?: string;
  // Sorting
  sorting?: SortingState;
  'manual-sorting'?: boolean;
  // Selection
  'enable-selection'?: boolean;
  'row-selection'?: RowSelectionState;
  'row-id-key'?: string;
  'total-row-count'?: number;
  'preserve-selection-on-filter'?: boolean;
  // Filtering
  'column-filters'?: ColumnFiltersState;
  'global-filter'?: string;
  'manual-filtering'?: boolean;
  // Pagination
  pagination?: PaginationState;
  'manual-pagination'?: boolean;
  'page-count'?: number;
  // Column customization
  'enable-column-resizing'?: boolean;
  'column-sizing'?: ColumnSizingState;
  'column-resize-mode'?: 'onChange' | 'onEnd';
  'column-visibility'?: VisibilityState;
  'show-column-picker'?: boolean;
  'column-order'?: ColumnOrderState;
  'enable-column-reorder'?: boolean;
  'sticky-first-column'?: boolean;
  'persistence-key'?: string;
  // Editing
  'enable-row-editing'?: boolean;
  // Row actions
  rowActions?: RowAction<TData>[];
  'hover-reveal-actions'?: boolean;
  bulkActions?: BulkAction[];
  // Export
  onExport?: (params: ServerExportParams) => void | Promise<void>;
  // Expandable rows
  renderDetailContent?: DetailContentRenderer<TData>;
  expanded?: ExpandedState;
  'single-expand'?: boolean;
  // Async data
  dataCallback?: DataCallback<TData>;
  'debounce-delay'?: number;
}
```

And ALL 13 events in Svelte declarations:
```
ui-sort-change, ui-selection-change, ui-filter-change, ui-pagination-change,
ui-column-visibility-change, ui-column-order-change, ui-column-preferences-change,
ui-column-preferences-reset, ui-cell-edit, ui-row-edit, ui-row-action,
ui-bulk-action, ui-expanded-change
```

### Pattern 4: SSR Support (PKG-04)

The data-table already has SSR guards:
- Line 44: `import { isServer } from 'lit'`
- Line 804: `if (isServer || this.data.length === 0)` -- skips virtualizer initialization
- Line 3508: `if (!isServer)` -- guards element registration

The Declarative Shadow DOM pattern is inherited from `TailwindElement` in `@lit-ui/core`, which handles dual-mode styling (inline CSS for SSR, constructable stylesheets for client). No additional SSR work is needed beyond ensuring the element registration pattern matches the `typeof customElements !== 'undefined'` guard.

### Pattern 5: CSS Custom Properties (PKG-05, PKG-06)

Data-table already defines CSS custom properties on `:host`:

**Light mode defaults (11 properties):**
- `--ui-data-table-header-bg`: Header background
- `--ui-data-table-row-bg`: Row background
- `--ui-data-table-row-hover-bg`: Row hover background
- `--ui-data-table-border-color`: All borders
- `--ui-data-table-text-color`: Cell text
- `--ui-data-table-header-text`: Header text
- `--ui-data-table-row-height`: Row height (48px)
- `--ui-data-table-header-height`: Header height (48px)
- `--ui-data-table-cell-padding`: Cell padding
- `--ui-data-table-font-size`: Font size
- `--ui-data-table-header-font-weight`: Header weight

**Additional contextual properties used in styles:**
- `--ui-data-table-header-hover-bg`: Sortable header hover
- `--ui-data-table-selected-bg`: Selected row background
- `--ui-data-table-selected-hover-bg`: Selected row hover
- `--ui-data-table-banner-bg`: Selection banner
- `--ui-data-table-skeleton-base`: Skeleton loading base
- `--ui-data-table-skeleton-highlight`: Skeleton highlight
- `--ui-data-table-overlay-bg`: Update loading overlay

**Dark mode via `:host-context(.dark)` -- matches project pattern.**

Total: ~18 CSS custom properties. All use `var(--color-*, fallback)` pattern matching the project's CSS variable convention.

### Pattern 6: CLI Registry Entry (CLI-01)

Add entry to `packages/cli/src/registry/registry.json`:
```json
{
  "name": "data-table",
  "description": "High-performance data table with virtual scrolling, sorting, filtering, inline editing, and selection",
  "files": [
    { "path": "components/data-table/data-table.ts", "type": "component" }
  ],
  "dependencies": ["@tanstack/lit-table", "@tanstack/lit-virtual"],
  "registryDependencies": ["checkbox", "popover"]
}
```

Key considerations:
- The copy-source template should be a **starter template** (like Select), not the full component
- TanStack dependencies must be listed since copy-source mode needs them installed
- `registryDependencies` ensures checkbox and popover copy-source templates are also installed
- The full data-table is 7,070 lines -- too large for a single template string

### Pattern 7: CLI Copy-Source Template (CLI-02)

Following the Select component pattern, the data-table copy-source template should be a **simplified starter** that:
1. Provides basic table rendering with columns and data
2. Includes sorting and basic styling
3. Notes "For full features (virtual scrolling, filtering, editing, etc.), install via NPM"
4. Is approximately 200-400 lines (manageable for customization)

The template must use CSS variable fallbacks (matching project pattern):
```css
border: 1px solid var(--ui-data-table-border-color, var(--color-border, #e4e4e7));
```

### Pattern 8: Documentation Page (CLI-03, CLI-04, CLI-05, CLI-06)

Following the established docs page pattern (AccordionPage.tsx, SelectPage.tsx):

**Required sections:**
1. **Header** -- Title, description
2. **Examples** -- Interactive demos with ExampleBlock (preview + code tabs)
3. **Accessibility** -- Keyboard navigation, screen reader behavior
4. **API Reference** -- PropsTable, SlotsTable, Events, CSS Custom Properties

**Data-table specific considerations:**
- The docs page renders live `<lui-data-table>` elements -- must add `@lit-ui/data-table` to docs `package.json`
- Also needs `@lit-ui/checkbox` and `@lit-ui/popover` in docs deps (used by data-table)
- Props are set via JavaScript properties (`.columns`, `.data`), not HTML attributes for complex types
- Interactive demos need sample data (mock user/product arrays)
- The data-table demos require a React wrapper or script blocks for property passing

**Required demo patterns (CLI-06):**
1. Basic table with columns and data
2. Sorting (single and multi-column)
3. Selection with checkboxes
4. Filtering (column filters + global search)
5. Pagination
6. Column customization (resize, reorder, visibility)
7. Inline editing (cell and row modes)
8. Row actions and bulk actions
9. Expandable rows
10. Server-side data (async callback pattern)
11. CSV export

**Required API reference content (CLI-04):**
- ~35 public properties from `@property` decorators
- 13 custom events (ui-sort-change through ui-expanded-change)
- ~18 CSS custom properties
- Slot documentation (toolbar-start, toolbar-end)
- Public methods (exportCsv, resetColumnPreferences)

### Pattern 9: Component-to-Package Mapping (for npm install mode)

Must add entry in `packages/cli/src/utils/install-component.ts`:
```typescript
export const componentToPackage: Record<string, string> = {
  // ... existing entries
  'data-table': '@lit-ui/data-table',
};
```

### Pattern 10: Docs App Integration

Must update three files:
1. `apps/docs/package.json` -- add `@lit-ui/data-table` dependency
2. `apps/docs/src/nav.ts` -- add Data Table to Components section
3. `apps/docs/src/App.tsx` -- add import and route for DataTablePage

### Anti-Patterns to Avoid

- **Copying the full 7,070-line component as CLI template** -- Follow Select's "starter template" pattern instead. The full component should only be available via npm.
- **Bundling TanStack in the CLI template string** -- The copy-source template needs TanStack as an npm dependency, not embedded. The registry entry's `dependencies` array handles this.
- **Registering custom element inside the component class file** -- Move registration to `index.ts` with collision detection pattern (matches accordion/tabs).
- **Omitting peer dependencies for @lit-ui/popover and @lit-ui/checkbox** -- The build externalizes them; they MUST be declared or consumers get runtime import errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Package build config | Custom Vite config | `@lit-ui/vite-config/library` createLibraryConfig | Handles externalization, dts generation, Tailwind integration |
| TypeScript declarations | Manual .d.ts files | `vite-plugin-dts` with `rollupTypes: true` | Auto-generates from source |
| Documentation components | Custom tables/tabs | Existing `PropsTable`, `SlotsTable`, `ExampleBlock`, `CodeBlock`, `PrevNextNav` | Consistent with all other doc pages |
| CLI component resolution | Custom logic | Existing `getComponent()` + `resolveDependencies()` from CLI utils | Handles dependency chains automatically |
| Dark mode CSS | JS-based theme switching | `:host-context(.dark)` CSS rule | Matches all existing components |

## Common Pitfalls

### Pitfall 1: Missing Peer Dependencies
**What goes wrong:** `@lit-ui/popover` and `@lit-ui/checkbox` are imported by data-table modules (column-picker.ts, selection-column.ts, row-actions.ts) but not listed in `package.json`. The Vite build externalizes them (via `/^@lit-ui\//` regex), so consumers who install only `@lit-ui/data-table` get runtime errors.
**Why it happens:** These dependencies were added during feature phases (selection, column picker, row actions) without updating package.json.
**How to avoid:** Add both as `peerDependencies` in package.json. Verify by checking the dist/index.js imports.
**Warning signs:** `import '@lit-ui/popover'` and `import '@lit-ui/checkbox'` in source without corresponding package.json entries.

### Pitfall 2: CLI Template Too Large
**What goes wrong:** Trying to embed the full 7,070-line data-table as a template string makes the CLI package bloated and the copy-source version unmaintainable.
**Why it happens:** Data table is the largest component in the library by far. Other simple components (button ~200 lines) fit as single templates.
**How to avoid:** Follow the Select pattern: create a **starter template** that provides basic table rendering (~200-400 lines) with a prominent note directing users to npm for the full-featured version.
**Warning signs:** Template string exceeding 1,000 lines.

### Pitfall 3: Docs Page Complexity
**What goes wrong:** The data-table docs page has more features to demo than any other component. Trying to fit all demos on one page creates an overwhelming, slow-loading page.
**Why it happens:** Data table has 35+ props, 13 events, 18 CSS vars, and 11+ demo patterns needed.
**How to avoid:** Organize demos into logical sections with clear headings. Consider lazy-loading demo data. The page will be long but well-structured (like Select which has ~20 demos).
**Warning signs:** Page load time exceeding 2 seconds, demo data arrays larger than needed.

### Pitfall 4: JSX Type Declarations Out of Sync
**What goes wrong:** The current `jsx.d.ts` was created in Phase 61 and is missing properties added in phases 62-67. If published as-is, React/Vue/Svelte users get TypeScript errors for attributes like `enable-selection`, `column-filters`, `bulk-actions`, etc.
**Why it happens:** JSX declarations were not updated when new properties were added.
**How to avoid:** Systematically go through ALL @property declarations (35+ found via grep) and ensure every HTML-attribute-reflected property has a JSX declaration. Properties with `attribute: false` (like `.rowActions`, `.dataCallback`) should use property notation in JSX.
**Warning signs:** JSX attribute interface has fewer than 30 entries.

### Pitfall 5: Element Registration Inconsistency
**What goes wrong:** The data-table currently registers via `if (!isServer)` guard in the component file, while accordion/tabs use a more robust pattern with collision detection in index.ts.
**Why it happens:** Data table was developed across 7 phases; the registration pattern was established in Phase 61 before the v6.0 pattern was finalized.
**How to avoid:** Move registration to index.ts, use `typeof customElements !== 'undefined'` guard with `customElements.get()` collision detection.
**Warning signs:** Registration code in the component file rather than index.ts.

### Pitfall 6: Copy-Source Template CSS Variables Without Fallbacks
**What goes wrong:** If the copy-source template uses CSS variables without fallbacks, users who don't set up the token system get an unstyled component.
**Why it happens:** The npm package assumes `--color-*` tokens exist from the theme system.
**How to avoid:** Every CSS variable usage in the copy-source template must have a fallback: `var(--ui-data-table-border-color, var(--color-border, #e4e4e7))`.
**Warning signs:** CSS var() calls without fallback values.

## Code Examples

### CLI Registry Entry
```json
// Source: Derived from packages/cli/src/registry/registry.json pattern
{
  "name": "data-table",
  "description": "High-performance data table with virtual scrolling, sorting, filtering, inline editing, and selection",
  "files": [
    { "path": "components/data-table/data-table.ts", "type": "component" }
  ],
  "dependencies": ["@tanstack/lit-table", "@tanstack/lit-virtual"],
  "registryDependencies": ["checkbox", "popover"]
}
```

### Element Registration (index.ts update)
```typescript
// Source: Derived from packages/accordion/src/index.ts pattern
import { isServer } from 'lit';
import { DataTable } from './data-table.js';

// Safe custom element registration with collision detection
if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-data-table')) {
    customElements.define('lui-data-table', DataTable);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-data-table] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-data-table': DataTable;
  }
}
```

### Docs Page Structure
```tsx
// Source: Derived from apps/docs/src/pages/components/AccordionPage.tsx pattern
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements
import '@lit-ui/data-table';

// Sample data for demos
const sampleData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  // ...
];

export function DataTablePage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* ... */}
          <h1>Data Table</h1>
          <p>A high-performance data table for admin dashboards...</p>
        </header>

        {/* Examples Section */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          {/* Basic Table */}
          {/* Sorting */}
          {/* Selection */}
          {/* Filtering */}
          {/* Pagination */}
          {/* Column Customization */}
          {/* Inline Editing */}
          {/* Row Actions */}
          {/* Expandable Rows */}
          {/* Server-Side Data */}
          {/* CSV Export */}
        </div>

        {/* Accessibility Section */}
        {/* API Reference */}
        {/* CSS Custom Properties */}
        {/* Events */}
      </div>
    </FrameworkProvider>
  );
}
```

### Starter Template Pattern (copy-source)
```typescript
// Source: Derived from packages/cli/src/templates/select.ts pattern
export const DATA_TABLE_TEMPLATE = `/**
 * lui-data-table -- Starter template.
 * For full features (virtual scrolling, filtering, inline editing, bulk actions),
 * install via NPM: npm install @lit-ui/data-table
 *
 * This starter provides a basic data table with:
 * - Column definitions with header and accessor
 * - Row rendering with data binding
 * - Single-column sorting (click headers)
 * - Striped rows and hover highlighting
 * - CSS custom properties for theming
 * - Responsive overflow scrolling
 *
 * @example
 * \\\`\\\`\\\`html
 * <lui-data-table
 *   .columns=\${columns}
 *   .data=\${data}
 *   aria-label="Users table"
 * ></lui-data-table>
 * \\\`\\\`\\\`
 */
import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TailwindElement } from '../../lib/lit-ui/tailwind-element';
// ... ~200-400 lines of basic table rendering
`;
```

### Package.json Update
```json
{
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0",
    "@lit-ui/checkbox": "^1.0.0",
    "@lit-ui/popover": "^1.0.0"
  }
}
```

### install-component.ts Update
```typescript
// Add to componentToPackage map
'data-table': '@lit-ui/data-table',
```

### templates/index.ts Update
```typescript
// Add to template exports and COMPONENT_TEMPLATES map
export { DATA_TABLE_TEMPLATE } from './data-table.js';
import { DATA_TABLE_TEMPLATE } from './data-table.js';

// In COMPONENT_TEMPLATES:
'data-table': DATA_TABLE_TEMPLATE,
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Register in component file | Register in index.ts with collision detection | v6.0 (accordion/tabs) | Data-table still uses old pattern, needs update |
| `if (!isServer)` guard | `typeof customElements !== 'undefined'` guard | v6.0 | More robust, handles edge cases |
| Full copy-source for complex components | Starter template + npm recommendation | v4.1 (Select) | Data-table should follow Select pattern |
| Minimal JSX declarations | Comprehensive attribute + event types | v4.1+ | Data-table jsx.d.ts needs full update |

**Deprecated/outdated:**
- `--lui-*` CSS variable prefix: Renamed to `--ui-*` in v3.0. Data-table correctly uses `--ui-*`. (30 CLI tests still use old prefix -- existing tech debt, not data-table specific)

## Open Questions

1. **Copy-source template scope**
   - What we know: Select pattern is ~200 lines starter with "use npm for full features" note
   - What's unclear: Exact feature set for the data-table starter (basic rendering + sorting? Include pagination?)
   - Recommendation: Starter should include column rendering, basic sorting, and simple styling. Pagination/filtering/editing should be npm-only features. Keep it under 400 lines.

2. **@lit-ui/checkbox and @lit-ui/popover as peer vs optional peer**
   - What we know: Both are used by core features (selection column, column picker, row actions kebab)
   - What's unclear: Should they be required peers or optional with `peerDependenciesMeta`?
   - Recommendation: Make them required peers since selection and column picker are primary features users expect. The npm CLI already installs `@lit-ui/core` automatically; it can install checkbox and popover too.

3. **Docs page interactive demo complexity**
   - What we know: Data table demos need JavaScript for column definitions and data arrays
   - What's unclear: How to make demos interactive in the React docs app when the component expects Lit template properties
   - Recommendation: Use React refs or useEffect to set properties imperatively on the `<lui-data-table>` element, or create a React wrapper component for demos. The ExampleBlock code tabs show the Lit/HTML usage pattern.

## Sources

### Primary (HIGH confidence)
- `packages/data-table/src/` -- All 17 source files examined for current state
- `packages/data-table/package.json` -- Current dependency structure
- `packages/data-table/dist/index.js` -- Verified externalized imports
- `packages/accordion/src/index.ts` -- Element registration pattern (v6.0)
- `packages/accordion/package.json` -- Package structure pattern
- `packages/tabs/package.json` -- Package structure pattern
- `packages/select/package.json` -- Package with direct dependencies pattern
- `packages/cli/src/registry/registry.json` -- Registry schema and entries
- `packages/cli/src/templates/index.ts` -- Template mapping pattern
- `packages/cli/src/templates/select.ts` -- Starter template pattern
- `packages/cli/src/utils/install-component.ts` -- npm mode mapping
- `apps/docs/src/pages/components/AccordionPage.tsx` -- Full doc page pattern
- `apps/docs/src/pages/components/SelectPage.tsx` -- Complex component doc pattern
- `apps/docs/src/nav.ts` -- Navigation configuration
- `apps/docs/src/App.tsx` -- Route configuration
- `apps/docs/package.json` -- Docs dependencies
- `packages/vite-config/library.js` -- Build externalization regex
- `packages/ssr/src/index.ts` -- SSR utility pattern
- `packages/core/package.json` -- Core package with sub-exports pattern

### Secondary (MEDIUM confidence)
- None needed -- all findings are from direct codebase analysis

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already in use, versions verified from package.json
- Architecture: HIGH -- All patterns derived from existing codebase with exact file references
- Pitfalls: HIGH -- Identified from direct code analysis (missing deps, stale JSX, registration pattern)

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (stable -- all patterns are established project conventions)
