import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PrevNextNav } from '../../components/PrevNextNav';
import { useEffect, useRef } from 'react';

// Side-effect import to register custom elements from built library
import '@lit-ui/data-table';

// JSX type declaration for lui-data-table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-data-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'enable-selection'?: boolean;
          'sticky-first-column'?: boolean;
          'enable-column-resizing'?: boolean;
          'enable-column-reorder'?: boolean;
          'hover-reveal-actions'?: boolean;
          loading?: string;
          'row-height'?: number;
          'row-id-key'?: string;
          'persistence-key'?: string;
          'show-column-picker'?: boolean;
          'single-expand'?: boolean;
          ref?: React.Ref<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  age: number;
  joined: string;
}

const sampleUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', age: 32, joined: '2024-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active', age: 28, joined: '2024-02-20' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Viewer', status: 'Inactive', age: 45, joined: '2023-11-05' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'Active', age: 35, joined: '2024-03-10' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active', age: 29, joined: '2024-04-01' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', status: 'Pending', age: 41, joined: '2024-05-12' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', role: 'Editor', status: 'Active', age: 33, joined: '2024-06-18' },
  { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'Viewer', status: 'Inactive', age: 52, joined: '2023-09-22' },
];

// ---------------------------------------------------------------------------
// Column definitions for each demo
// ---------------------------------------------------------------------------

const basicColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const sortableColumns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

const filterableColumns = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'text' } },
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'text' } },
  { accessorKey: 'role', header: 'Role', meta: { filterType: 'select', filterOptions: ['Admin', 'Editor', 'Viewer'] } },
  { accessorKey: 'status', header: 'Status', meta: { filterType: 'select', filterOptions: ['Active', 'Inactive', 'Pending'] } },
];

// ---------------------------------------------------------------------------
// DataTableDemo wrapper
// ---------------------------------------------------------------------------

/**
 * React wrapper for lui-data-table that sets complex JS properties via refs.
 * Custom elements require object/array properties to be set imperatively.
 */
function DataTableDemo({
  columns,
  data,
  ...props
}: {
  columns: any[];
  data: any[];
  [key: string]: any;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      (ref.current as any).columns = columns;
      (ref.current as any).data = data;
      // Set additional complex properties (objects, arrays, functions)
      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'object' || typeof value === 'function') {
          (ref.current as any)[key] = value;
        }
      });
    }
  }, [columns, data, props]);

  // Build simple attribute props (strings, booleans, numbers)
  const attrs: Record<string, any> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value !== 'object' && typeof value !== 'function') {
      attrs[key] = value;
    }
  });

  return <lui-data-table ref={ref} {...attrs} />;
}

// ---------------------------------------------------------------------------
// Code examples (shown in code tabs - Lit HTML usage, not React wrapper)
// ---------------------------------------------------------------------------

const basicCode = `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const data = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  // ...
];

html\`<lui-data-table .columns=\${columns} .data=\${data}></lui-data-table>\``;

const sortingCode = `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

// Click a column header to sort. Shift+click for multi-column sort.
html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    @ui-sort-change=\${(e) => console.log('Sort:', e.detail.sorting)}
  ></lui-data-table>
\``;

const selectionCode = `import '@lit-ui/data-table';
import { createSelectionColumn } from '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  createSelectionColumn(),
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    enable-selection
    @ui-selection-change=\${(e) => {
      console.log('Selected:', e.detail.selectedRows);
      console.log('Count:', e.detail.selectedCount);
    }}
  ></lui-data-table>
\``;

const filteringCode = `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name', meta: { filterType: 'text' } },
  { accessorKey: 'email', header: 'Email', meta: { filterType: 'text' } },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      filterType: 'select',
      filterOptions: ['Admin', 'Editor', 'Viewer'],
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      filterType: 'select',
      filterOptions: ['Active', 'Inactive', 'Pending'],
    },
  },
];

html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    @ui-filter-change=\${(e) => console.log('Filters:', e.detail)}
  ></lui-data-table>
\``;

const paginationCode = `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

// Set pagination with initial page size of 5
html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    .pagination=\${{ pageIndex: 0, pageSize: 5 }}
    @ui-pagination-change=\${(e) => {
      console.log('Page:', e.detail.pageIndex);
      console.log('Page size:', e.detail.pageSize);
    }}
  ></lui-data-table>
\``;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTablePage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Data Table
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              A high-performance data table for admin dashboards with virtual scrolling for 100K+ rows,
              sorting, filtering, pagination, inline editing, selection with bulk actions, column
              customization, and CSV export.
            </p>

            {/* Install badges */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <code className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                npm install @lit-ui/data-table
              </code>
              <code className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                npx lui add data-table
              </code>
            </div>
          </div>
        </header>

        {/* Examples Section */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Examples</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Interactive demonstrations of core data table features</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* 1. Basic Table */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Table</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Render a table by providing column definitions and a data array. Each column maps
              to a property in the row objects via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">accessorKey</code>.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo columns={basicColumns} data={sampleUsers} />
                </div>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Sorting */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Sorting</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Click column headers to sort. Click again to reverse. Shift+click to add multi-column sorting.
              Columns with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">enableSorting: true</code> show
              sort indicators and respond to header clicks.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo columns={sortableColumns} data={sampleUsers} />
                </div>
              }
              html={sortingCode}
              react={sortingCode}
              vue={sortingCode}
              svelte={sortingCode}
            />
          </section>

          {/* 3. Row Selection */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Row Selection</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable row selection with the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">enable-selection</code> attribute.
              Rows gain checkboxes for individual or bulk selection. Use Shift+click for range selection.
              Listen to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-selection-change</code> for
              selected row updates.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo
                    columns={basicColumns}
                    data={sampleUsers}
                    enable-selection
                  />
                </div>
              }
              html={selectionCode}
              react={selectionCode}
              vue={selectionCode}
              svelte={selectionCode}
            />
          </section>

          {/* 4. Filtering */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Filtering</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Filter data per-column by specifying a <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">filterType</code> in
              column meta. Supported types: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">text</code>,{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">number</code>,{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">date</code>, and{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">select</code>.
              Select filters accept a <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">filterOptions</code> array.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo columns={filterableColumns} data={sampleUsers} />
                </div>
              }
              html={filteringCode}
              react={filteringCode}
              vue={filteringCode}
              svelte={filteringCode}
            />
          </section>

          {/* 5. Pagination */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Pagination</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Paginate through large datasets by setting the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">pagination</code> property.
              Users can navigate between pages and change the page size. Listen
              to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-pagination-change</code> for page updates.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo
                    columns={basicColumns}
                    data={sampleUsers}
                    pagination={{ pageIndex: 0, pageSize: 5 }}
                  />
                </div>
              }
              html={paginationCode}
              react={paginationCode}
              vue={paginationCode}
              svelte={paginationCode}
            />
          </section>
        </div>

        {/* API Reference, Accessibility, and Advanced Demos - continued in Plan 04 */}

        {/* Navigation */}
        <div className="divider-fade mb-8 mt-20" />
        <PrevNextNav
          prev={{ title: 'Date Range Picker', href: '/components/date-range-picker' }}
          next={{ title: 'Dialog', href: '/components/dialog' }}
        />
      </div>
    </FrameworkProvider>
  );
}
