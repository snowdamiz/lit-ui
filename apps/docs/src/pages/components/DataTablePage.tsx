import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
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
          'enable-row-editing'?: boolean;
          'manual-sorting'?: boolean;
          'manual-filtering'?: boolean;
          'manual-pagination'?: boolean;
          'single-expand'?: boolean;
          'show-column-picker'?: boolean;
          loading?: string;
          'row-height'?: number;
          'row-id-key'?: string;
          'persistence-key'?: string;
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

// Extended dataset for server-side demo
const extendedUsers: User[] = [
  ...sampleUsers,
  { id: 9, name: 'Ivy Chen', email: 'ivy@example.com', role: 'Admin', status: 'Active', age: 27, joined: '2024-07-01' },
  { id: 10, name: 'Jack Lee', email: 'jack@example.com', role: 'Editor', status: 'Active', age: 39, joined: '2024-07-15' },
  { id: 11, name: 'Karen White', email: 'karen@example.com', role: 'Viewer', status: 'Pending', age: 31, joined: '2024-08-01' },
  { id: 12, name: 'Leo Harris', email: 'leo@example.com', role: 'Editor', status: 'Active', age: 44, joined: '2024-08-10' },
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

const resizableColumns = [
  { accessorKey: 'name', header: 'Name', size: 200 },
  { accessorKey: 'email', header: 'Email', size: 250 },
  { accessorKey: 'role', header: 'Role', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 120 },
];

const editableColumns = [
  { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'text' } },
  { accessorKey: 'email', header: 'Email', meta: { editable: true, editType: 'text' } },
  { accessorKey: 'role', header: 'Role', meta: { editable: true, editType: 'select', editOptions: [{ label: 'Admin', value: 'Admin' }, { label: 'Editor', value: 'Editor' }, { label: 'Viewer', value: 'Viewer' }] } },
  { accessorKey: 'status', header: 'Status' },
];

const expandableColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const serverColumns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

const exportColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'joined', header: 'Joined' },
];

// ---------------------------------------------------------------------------
// Row actions config
// ---------------------------------------------------------------------------

const demoRowActions = [
  { id: 'view', label: 'View', variant: 'default' as const },
  { id: 'edit', label: 'Edit', variant: 'default' as const },
  { id: 'delete', label: 'Delete', variant: 'destructive' as const },
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

/**
 * DataTableDemo variant with an external ref for imperative method calls (e.g., exportCsv).
 */
function DataTableDemoWithRef({
  columns,
  data,
  tableRef,
  ...props
}: {
  columns: any[];
  data: any[];
  tableRef: React.RefObject<HTMLElement | null>;
  [key: string]: any;
}) {
  useEffect(() => {
    if (tableRef.current) {
      (tableRef.current as any).columns = columns;
      (tableRef.current as any).data = data;
      Object.entries(props).forEach(([key, value]) => {
        if (typeof value === 'object' || typeof value === 'function') {
          (tableRef.current as any)[key] = value;
        }
      });
    }
  }, [columns, data, props, tableRef]);

  const attrs: Record<string, any> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value !== 'object' && typeof value !== 'function') {
      attrs[key] = value;
    }
  });

  return <lui-data-table ref={tableRef as React.Ref<HTMLElement>} {...attrs} />;
}

/**
 * Export demo wrapper that holds a ref and renders an export button.
 */
function ExportDemoWrapper() {
  const tableRef = useRef<HTMLElement>(null);

  const handleExport = () => {
    if (tableRef.current && typeof (tableRef.current as any).exportCsv === 'function') {
      (tableRef.current as any).exportCsv({ filename: 'users.csv' });
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>
      <DataTableDemoWithRef
        columns={exportColumns}
        data={sampleUsers}
        tableRef={tableRef}
        enable-selection
      />
    </div>
  );
}

/**
 * Server-side data demo wrapper with simulated async data callback.
 */
function ServerSideDemoWrapper() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      (ref.current as any).columns = serverColumns;
      (ref.current as any).data = [];
      (ref.current as any).dataCallback = async (
        params: { pageIndex: number; pageSize: number; sorting: any[]; columnFilters: any[]; globalFilter: string },
        _signal: AbortSignal
      ) => {
        // Simulate server delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simple client-side simulation of server-side operations
        let filtered = [...extendedUsers];

        // Apply sorting
        if (params.sorting.length > 0) {
          const sort = params.sorting[0];
          filtered.sort((a: any, b: any) => {
            const aVal = a[sort.id];
            const bVal = b[sort.id];
            if (aVal < bVal) return sort.desc ? 1 : -1;
            if (aVal > bVal) return sort.desc ? -1 : 1;
            return 0;
          });
        }

        // Apply pagination
        const start = params.pageIndex * params.pageSize;
        const paged = filtered.slice(start, start + params.pageSize);

        return {
          data: paged,
          totalRowCount: filtered.length,
        };
      };
    }
  }, []);

  return (
    <lui-data-table
      ref={ref}
      manual-sorting
      manual-filtering
      manual-pagination
      loading="idle"
    />
  );
}

// ---------------------------------------------------------------------------
// Code examples (shown in code tabs - Lit HTML usage, not React wrapper)
// ---------------------------------------------------------------------------

const basicCode = {
  html: `import '@lit-ui/data-table';
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

html\`<lui-data-table .columns=\${columns} .data=\${data}></lui-data-table>\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

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

function MyTable() {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
    }
  }, []);

  return <lui-data-table ref={tableRef} />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

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

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
});
</script>

<template>
  <lui-data-table ref="tableRef" />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  let tableEl;

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

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
  });
</script>

<lui-data-table bind:this={tableEl} />`,
};

const sortingCode = {
  html: `import '@lit-ui/data-table';
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
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

// Click a column header to sort. Shift+click for multi-column sort.
function SortableTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.addEventListener('ui-sort-change', (e) => {
        console.log('Sort:', e.detail.sorting);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
});

function onSortChange(e) {
  console.log('Sort:', e.detail.sorting);
}
</script>

<template>
  <!-- Click a column header to sort. Shift+click for multi-column sort. -->
  <lui-data-table ref="tableRef" @ui-sort-change="onSortChange" />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    { accessorKey: 'role', header: 'Role', enableSorting: true },
    { accessorKey: 'age', header: 'Age', enableSorting: true },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
  });

  function handleSortChange(e) {
    console.log('Sort:', e.detail.sorting);
  }
</script>

<!-- Click a column header to sort. Shift+click for multi-column sort. -->
<lui-data-table bind:this={tableEl} on:ui-sort-change={handleSortChange} />`,
};

const selectionCode = {
  html: `import '@lit-ui/data-table';
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
\``,

  react: `import '@lit-ui/data-table';
import { createSelectionColumn } from '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  createSelectionColumn(),
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

function SelectableTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.addEventListener('ui-selection-change', (e) => {
        console.log('Selected:', e.detail.selectedRows);
        console.log('Count:', e.detail.selectedCount);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} enable-selection />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { createSelectionColumn } from '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  createSelectionColumn(),
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
});

function onSelectionChange(e) {
  console.log('Selected:', e.detail.selectedRows);
  console.log('Count:', e.detail.selectedCount);
}
</script>

<template>
  <lui-data-table
    ref="tableRef"
    enable-selection
    @ui-selection-change="onSelectionChange"
  />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { createSelectionColumn } from '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    createSelectionColumn(),
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'status', header: 'Status' },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
  });

  function handleSelectionChange(e) {
    console.log('Selected:', e.detail.selectedRows);
    console.log('Count:', e.detail.selectedCount);
  }
</script>

<lui-data-table
  bind:this={tableEl}
  enable-selection
  on:ui-selection-change={handleSelectionChange}
/>`,
};

const filteringCode = {
  html: `import '@lit-ui/data-table';
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
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

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

function FilterableTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.addEventListener('ui-filter-change', (e) => {
        console.log('Filters:', e.detail);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

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

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
});

function onFilterChange(e) {
  console.log('Filters:', e.detail);
}
</script>

<template>
  <lui-data-table ref="tableRef" @ui-filter-change="onFilterChange" />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

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

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
  });

  function handleFilterChange(e) {
    console.log('Filters:', e.detail);
  }
</script>

<lui-data-table bind:this={tableEl} on:ui-filter-change={handleFilterChange} />`,
};

const paginationCode = {
  html: `import '@lit-ui/data-table';
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
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

// Set pagination with initial page size of 5
function PaginatedTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.pagination = { pageIndex: 0, pageSize: 5 };
      tableRef.current.addEventListener('ui-pagination-change', (e) => {
        console.log('Page:', e.detail.pageIndex);
        console.log('Page size:', e.detail.pageSize);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

// Set pagination with initial page size of 5
onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
  tableRef.value.pagination = { pageIndex: 0, pageSize: 5 };
});

function onPaginationChange(e) {
  console.log('Page:', e.detail.pageIndex);
  console.log('Page size:', e.detail.pageSize);
}
</script>

<template>
  <lui-data-table ref="tableRef" @ui-pagination-change="onPaginationChange" />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'status', header: 'Status' },
  ];

  // Set pagination with initial page size of 5
  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
    tableEl.pagination = { pageIndex: 0, pageSize: 5 };
  });

  function handlePaginationChange(e) {
    console.log('Page:', e.detail.pageIndex);
    console.log('Page size:', e.detail.pageSize);
  }
</script>

<lui-data-table
  bind:this={tableEl}
  on:ui-pagination-change={handlePaginationChange}
/>`,
};

const columnCustomizationCode = {
  html: `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name', size: 200 },
  { accessorKey: 'email', header: 'Email', size: 250 },
  { accessorKey: 'role', header: 'Role', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 120 },
];

html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    enable-column-resizing
    show-column-picker
    enable-column-reorder
    @ui-column-visibility-change=\${(e) => console.log('Visibility:', e.detail)}
    @ui-column-order-change=\${(e) => console.log('Order:', e.detail)}
  ></lui-data-table>
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name', size: 200 },
  { accessorKey: 'email', header: 'Email', size: 250 },
  { accessorKey: 'role', header: 'Role', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 120 },
];

function CustomizableTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.addEventListener('ui-column-visibility-change', (e) => {
        console.log('Visibility:', e.detail);
      });
      tableRef.current.addEventListener('ui-column-order-change', (e) => {
        console.log('Order:', e.detail);
      });
    }
  }, [data]);

  return (
    <lui-data-table
      ref={tableRef}
      enable-column-resizing
      show-column-picker
      enable-column-reorder
    />
  );
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name', size: 200 },
  { accessorKey: 'email', header: 'Email', size: 250 },
  { accessorKey: 'role', header: 'Role', size: 120 },
  { accessorKey: 'status', header: 'Status', size: 120 },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
});

function onVisibilityChange(e) {
  console.log('Visibility:', e.detail);
}

function onOrderChange(e) {
  console.log('Order:', e.detail);
}
</script>

<template>
  <lui-data-table
    ref="tableRef"
    enable-column-resizing
    show-column-picker
    enable-column-reorder
    @ui-column-visibility-change="onVisibilityChange"
    @ui-column-order-change="onOrderChange"
  />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name', size: 200 },
    { accessorKey: 'email', header: 'Email', size: 250 },
    { accessorKey: 'role', header: 'Role', size: 120 },
    { accessorKey: 'status', header: 'Status', size: 120 },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
  });

  function handleVisibilityChange(e) {
    console.log('Visibility:', e.detail);
  }

  function handleOrderChange(e) {
    console.log('Order:', e.detail);
  }
</script>

<lui-data-table
  bind:this={tableEl}
  enable-column-resizing
  show-column-picker
  enable-column-reorder
  on:ui-column-visibility-change={handleVisibilityChange}
  on:ui-column-order-change={handleOrderChange}
/>`,
};

const inlineEditingCode = {
  html: `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'text' } },
  { accessorKey: 'email', header: 'Email', meta: { editable: true, editType: 'text' } },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      editable: true,
      editType: 'select',
      editOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' },
      ],
    },
  },
  { accessorKey: 'status', header: 'Status' },
];

html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    enable-row-editing
    @ui-cell-edit=\${(e) => {
      console.log('Cell edit:', e.detail.columnId, e.detail.oldValue, '->', e.detail.newValue);
    }}
    @ui-row-edit=\${(e) => {
      console.log('Row edit saved:', e.detail.newValues);
    }}
  ></lui-data-table>
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'text' } },
  { accessorKey: 'email', header: 'Email', meta: { editable: true, editType: 'text' } },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      editable: true,
      editType: 'select',
      editOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' },
      ],
    },
  },
  { accessorKey: 'status', header: 'Status' },
];

function EditableTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.addEventListener('ui-cell-edit', (e) => {
        console.log('Cell edit:', e.detail.columnId, e.detail.oldValue, '->', e.detail.newValue);
      });
      tableRef.current.addEventListener('ui-row-edit', (e) => {
        console.log('Row edit saved:', e.detail.newValues);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} enable-row-editing />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'text' } },
  { accessorKey: 'email', header: 'Email', meta: { editable: true, editType: 'text' } },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      editable: true,
      editType: 'select',
      editOptions: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' },
      ],
    },
  },
  { accessorKey: 'status', header: 'Status' },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
});

function onCellEdit(e) {
  console.log('Cell edit:', e.detail.columnId, e.detail.oldValue, '->', e.detail.newValue);
}

function onRowEdit(e) {
  console.log('Row edit saved:', e.detail.newValues);
}
</script>

<template>
  <lui-data-table
    ref="tableRef"
    enable-row-editing
    @ui-cell-edit="onCellEdit"
    @ui-row-edit="onRowEdit"
  />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'text' } },
    { accessorKey: 'email', header: 'Email', meta: { editable: true, editType: 'text' } },
    {
      accessorKey: 'role',
      header: 'Role',
      meta: {
        editable: true,
        editType: 'select',
        editOptions: [
          { label: 'Admin', value: 'Admin' },
          { label: 'Editor', value: 'Editor' },
          { label: 'Viewer', value: 'Viewer' },
        ],
      },
    },
    { accessorKey: 'status', header: 'Status' },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
  });

  function handleCellEdit(e) {
    console.log('Cell edit:', e.detail.columnId, e.detail.oldValue, '->', e.detail.newValue);
  }

  function handleRowEdit(e) {
    console.log('Row edit saved:', e.detail.newValues);
  }
</script>

<lui-data-table
  bind:this={tableEl}
  enable-row-editing
  on:ui-cell-edit={handleCellEdit}
  on:ui-row-edit={handleRowEdit}
/>`,
};

const rowActionsCode = {
  html: `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const rowActions = [
  { id: 'view', label: 'View', variant: 'default' },
  { id: 'edit', label: 'Edit', variant: 'default' },
  { id: 'delete', label: 'Delete', variant: 'destructive' },
];

html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    .rowActions=\${rowActions}
    hover-reveal-actions
    @ui-row-action=\${(e) => {
      console.log('Action:', e.detail.actionId, 'on row:', e.detail.row);
    }}
  ></lui-data-table>
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const rowActions = [
  { id: 'view', label: 'View', variant: 'default' },
  { id: 'edit', label: 'Edit', variant: 'default' },
  { id: 'delete', label: 'Delete', variant: 'destructive' },
];

function ActionTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.rowActions = rowActions;
      tableRef.current.addEventListener('ui-row-action', (e) => {
        console.log('Action:', e.detail.actionId, 'on row:', e.detail.row);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} hover-reveal-actions />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

const rowActions = [
  { id: 'view', label: 'View', variant: 'default' },
  { id: 'edit', label: 'Edit', variant: 'default' },
  { id: 'delete', label: 'Delete', variant: 'destructive' },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
  tableRef.value.rowActions = rowActions;
});

function onRowAction(e) {
  console.log('Action:', e.detail.actionId, 'on row:', e.detail.row);
}
</script>

<template>
  <lui-data-table
    ref="tableRef"
    hover-reveal-actions
    @ui-row-action="onRowAction"
  />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'status', header: 'Status' },
  ];

  const rowActions = [
    { id: 'view', label: 'View', variant: 'default' },
    { id: 'edit', label: 'Edit', variant: 'default' },
    { id: 'delete', label: 'Delete', variant: 'destructive' },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
    tableEl.rowActions = rowActions;
  });

  function handleRowAction(e) {
    console.log('Action:', e.detail.actionId, 'on row:', e.detail.row);
  }
</script>

<lui-data-table
  bind:this={tableEl}
  hover-reveal-actions
  on:ui-row-action={handleRowAction}
/>`,
};

const expandableRowsCode = {
  html: `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    single-expand
    .renderDetailContent=\${(rowData) => html\`
      <div style="padding: 1rem;">
        <h4 style="margin: 0 0 0.5rem;">\${rowData.name} Details</h4>
        <p style="margin: 0; color: #71717a;">
          Email: \${rowData.email}<br />
          Age: \${rowData.age}<br />
          Joined: \${rowData.joined}
        </p>
      </div>
    \`}
    @ui-expanded-change=\${(e) => console.log('Expanded:', e.detail)}
  ></lui-data-table>
\``,

  react: `import '@lit-ui/data-table';
import { html } from 'lit';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

function ExpandableTable({ data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      tableRef.current.renderDetailContent = (rowData) => html\`
        <div style="padding: 1rem;">
          <h4 style="margin: 0 0 0.5rem;">\${rowData.name} Details</h4>
          <p style="margin: 0; color: #71717a;">
            Email: \${rowData.email}<br />
            Age: \${rowData.age}<br />
            Joined: \${rowData.joined}
          </p>
        </div>
      \`;
      tableRef.current.addEventListener('ui-expanded-change', (e) => {
        console.log('Expanded:', e.detail);
      });
    }
  }, [data]);

  return <lui-data-table ref={tableRef} single-expand />;
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { html } from 'lit';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
  tableRef.value.renderDetailContent = (rowData) => html\`
    <div style="padding: 1rem;">
      <h4 style="margin: 0 0 0.5rem;">\${rowData.name} Details</h4>
      <p style="margin: 0; color: #71717a;">
        Email: \${rowData.email}<br />
        Age: \${rowData.age}<br />
        Joined: \${rowData.joined}
      </p>
    </div>
  \`;
});

function onExpandedChange(e) {
  console.log('Expanded:', e.detail);
}
</script>

<template>
  <lui-data-table
    ref="tableRef"
    single-expand
    @ui-expanded-change="onExpandedChange"
  />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { html } from 'lit';
  import { onMount } from 'svelte';

  export let data;
  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'status', header: 'Status' },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
    tableEl.renderDetailContent = (rowData) => html\`
      <div style="padding: 1rem;">
        <h4 style="margin: 0 0 0.5rem;">\${rowData.name} Details</h4>
        <p style="margin: 0; color: #71717a;">
          Email: \${rowData.email}<br />
          Age: \${rowData.age}<br />
          Joined: \${rowData.joined}
        </p>
      </div>
    \`;
  });

  function handleExpandedChange(e) {
    console.log('Expanded:', e.detail);
  }
</script>

<lui-data-table
  bind:this={tableEl}
  single-expand
  on:ui-expanded-change={handleExpandedChange}
/>`,
};

const serverSideCode = {
  html: `import '@lit-ui/data-table';
import { html } from 'lit';

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

html\`
  <lui-data-table
    .columns=\${columns}
    manual-sorting
    manual-filtering
    manual-pagination
    .dataCallback=\${async (params, signal) => {
      const res = await fetch(\`/api/users?\${new URLSearchParams({
        page: String(params.pageIndex),
        size: String(params.pageSize),
        sort: JSON.stringify(params.sorting),
        filters: JSON.stringify(params.columnFilters),
        q: params.globalFilter,
      })}\`, { signal });

      const json = await res.json();
      return {
        data: json.rows,
        totalRowCount: json.total,
      };
    }}
  ></lui-data-table>
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

function ServerSideTable() {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = [];
      tableRef.current.dataCallback = async (params, signal) => {
        const res = await fetch(\`/api/users?\${new URLSearchParams({
          page: String(params.pageIndex),
          size: String(params.pageSize),
          sort: JSON.stringify(params.sorting),
          filters: JSON.stringify(params.columnFilters),
          q: params.globalFilter,
        })}\`, { signal });

        const json = await res.json();
        return {
          data: json.rows,
          totalRowCount: json.total,
        };
      };
    }
  }, []);

  return (
    <lui-data-table
      ref={tableRef}
      manual-sorting
      manual-filtering
      manual-pagination
    />
  );
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
];

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = [];
  tableRef.value.dataCallback = async (params, signal) => {
    const res = await fetch(\`/api/users?\${new URLSearchParams({
      page: String(params.pageIndex),
      size: String(params.pageSize),
      sort: JSON.stringify(params.sorting),
      filters: JSON.stringify(params.columnFilters),
      q: params.globalFilter,
    })}\`, { signal });

    const json = await res.json();
    return {
      data: json.rows,
      totalRowCount: json.total,
    };
  };
});
</script>

<template>
  <lui-data-table
    ref="tableRef"
    manual-sorting
    manual-filtering
    manual-pagination
  />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  let tableEl;

  const columns = [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'age', header: 'Age', enableSorting: true },
  ];

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = [];
    tableEl.dataCallback = async (params, signal) => {
      const res = await fetch(\`/api/users?\${new URLSearchParams({
        page: String(params.pageIndex),
        size: String(params.pageSize),
        sort: JSON.stringify(params.sorting),
        filters: JSON.stringify(params.columnFilters),
        q: params.globalFilter,
      })}\`, { signal });

      const json = await res.json();
      return {
        data: json.rows,
        totalRowCount: json.total,
      };
    };
  });
</script>

<lui-data-table
  bind:this={tableEl}
  manual-sorting
  manual-filtering
  manual-pagination
/>`,
};

const csvExportCode = {
  html: `import '@lit-ui/data-table';
import { html } from 'lit';

// Get a reference to the table element
const table = document.querySelector('lui-data-table');

// Export all visible data
table.exportCsv({ filename: 'users.csv' });

// Export only selected rows
table.exportCsv({ filename: 'selected-users.csv', selectedOnly: true });

// Server-side export via callback
html\`
  <lui-data-table
    .columns=\${columns}
    .data=\${data}
    .onExport=\${async (params) => {
      // params: { columnFilters, globalFilter, sorting, visibleColumnIds, selectedRowIds }
      const res = await fetch('/api/export', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const blob = await res.blob();
      // Download blob...
    }}
  ></lui-data-table>
\``,

  react: `import '@lit-ui/data-table';
import { useRef, useEffect } from 'react';

function ExportTable({ columns, data }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.columns = columns;
      tableRef.current.data = data;
      // Optional: server-side export callback
      tableRef.current.onExport = async (params) => {
        const res = await fetch('/api/export', {
          method: 'POST',
          body: JSON.stringify(params),
        });
        const blob = await res.blob();
        // Download blob...
      };
    }
  }, [columns, data]);

  const handleExport = () => {
    tableRef.current?.exportCsv({ filename: 'users.csv' });
  };

  const handleExportSelected = () => {
    tableRef.current?.exportCsv({ filename: 'selected-users.csv', selectedOnly: true });
  };

  return (
    <>
      <button onClick={handleExport}>Export CSV</button>
      <button onClick={handleExportSelected}>Export Selected</button>
      <lui-data-table ref={tableRef} enable-selection />
    </>
  );
}`,

  vue: `<script setup>
import '@lit-ui/data-table';
import { ref, onMounted } from 'vue';

const tableRef = ref(null);

onMounted(() => {
  tableRef.value.columns = columns;
  tableRef.value.data = data;
  // Optional: server-side export callback
  tableRef.value.onExport = async (params) => {
    const res = await fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const blob = await res.blob();
    // Download blob...
  };
});

function exportCsv() {
  tableRef.value.exportCsv({ filename: 'users.csv' });
}

function exportSelected() {
  tableRef.value.exportCsv({ filename: 'selected-users.csv', selectedOnly: true });
}
</script>

<template>
  <button @click="exportCsv">Export CSV</button>
  <button @click="exportSelected">Export Selected</button>
  <lui-data-table ref="tableRef" enable-selection />
</template>`,

  svelte: `<script>
  import '@lit-ui/data-table';
  import { onMount } from 'svelte';

  let tableEl;

  onMount(() => {
    tableEl.columns = columns;
    tableEl.data = data;
    // Optional: server-side export callback
    tableEl.onExport = async (params) => {
      const res = await fetch('/api/export', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const blob = await res.blob();
      // Download blob...
    };
  });

  function exportCsv() {
    tableEl.exportCsv({ filename: 'users.csv' });
  }

  function exportSelected() {
    tableEl.exportCsv({ filename: 'selected-users.csv', selectedOnly: true });
  }
</script>

<button on:click={exportCsv}>Export CSV</button>
<button on:click={exportSelected}>Export Selected</button>
<lui-data-table bind:this={tableEl} enable-selection />`,
};

// ---------------------------------------------------------------------------
// API Reference data
// ---------------------------------------------------------------------------

// -- Properties --

const dataTableProps: PropDef[] = [
  // Core
  { name: 'columns', type: 'ColumnDef<TData>[]', default: '[]', description: 'Column definitions array. Each column maps to a row property via accessorKey.' },
  { name: 'data', type: 'TData[]', default: '[]', description: 'Row data array. Each object represents a row in the table.' },
  { name: 'loading', type: '"idle" | "loading" | "updating"', default: '"idle"', description: 'Loading state. "loading" shows skeleton rows; "updating" shows overlay on existing data.' },
  { name: 'aria-label', type: 'string', default: '"Data table"', description: 'Accessible label for the data table grid.' },
  { name: 'max-height', type: 'string', default: '"400px"', description: 'Maximum height of the table body. Enables virtual scrolling when content overflows.' },
  { name: 'row-height', type: 'number', default: '48', description: 'Fixed row height in pixels. Used by the virtualizer for scroll calculations.' },
  { name: 'skeleton-rows', type: 'number', default: '5', description: 'Number of skeleton rows to display during loading state.' },
  { name: 'empty-state-type', type: '"no-data" | "no-matches"', default: '"no-data"', description: 'Type of empty state to display. "no-matches" shows filter-related messaging.' },
  { name: 'no-data-message', type: 'string', default: '"No data available"', description: 'Message shown when the table has no data.' },
  { name: 'no-matches-message', type: 'string', default: '"No results match your filters"', description: 'Message shown when filters exclude all rows.' },

  // Sorting
  { name: 'sorting', type: 'SortingState', default: '[]', description: 'Current sorting state. Array of { id, desc } objects for multi-column sort.' },
  { name: 'manual-sorting', type: 'boolean', default: 'false', description: 'Enable server-side sorting. When true, sorting is handled externally via ui-sort-change events.' },

  // Selection
  { name: 'enable-selection', type: 'boolean', default: 'false', description: 'Enable row selection with checkboxes.' },
  { name: 'rowSelection', type: 'RowSelectionState', default: '{}', description: 'Current row selection state. Object mapping row IDs to selection boolean.' },
  { name: 'row-id-key', type: 'string', default: '"id"', description: 'Property name used as unique row identifier for selection tracking.' },
  { name: 'total-row-count', type: 'number', default: 'undefined', description: 'Total row count for server-side "select all" calculations.' },
  { name: 'preserve-selection-on-filter', type: 'boolean', default: 'false', description: 'Keep selected rows when filters change, instead of clearing selection.' },

  // Filtering
  { name: 'columnFilters', type: 'ColumnFiltersState', default: '[]', description: 'Current column filter state. Array of { id, value } objects.' },
  { name: 'global-filter', type: 'string', default: '""', description: 'Global filter string applied across all columns.' },
  { name: 'manual-filtering', type: 'boolean', default: 'false', description: 'Enable server-side filtering. When true, filtering is handled externally via ui-filter-change events.' },

  // Pagination
  { name: 'pagination', type: 'PaginationState', default: '{ pageIndex: 0, pageSize: 25 }', description: 'Current pagination state with pageIndex (0-based) and pageSize.' },
  { name: 'manual-pagination', type: 'boolean', default: 'false', description: 'Enable server-side pagination. When true, pagination is handled externally via ui-pagination-change events.' },
  { name: 'page-count', type: 'number', default: 'undefined', description: 'Total page count for server-side pagination. Calculated from data length if not set.' },
  { name: 'pageSizeOptions', type: 'number[]', default: '[10, 25, 50, 100]', description: 'Available page size options in the pagination dropdown.' },

  // Column Customization
  { name: 'enable-column-resizing', type: 'boolean', default: 'true', description: 'Enable column resizing by dragging header borders.' },
  { name: 'columnSizing', type: 'ColumnSizingState', default: '{}', description: 'Current column widths keyed by column ID.' },
  { name: 'column-resize-mode', type: '"onChange" | "onEnd"', default: '"onChange"', description: 'When to apply resize. "onChange" provides live preview; "onEnd" applies after drag ends.' },
  { name: 'columnVisibility', type: 'VisibilityState', default: '{}', description: 'Column visibility state. Object mapping column IDs to visibility boolean.' },
  { name: 'show-column-picker', type: 'boolean', default: 'false', description: 'Show the column picker toggle in the toolbar for hiding/showing columns.' },
  { name: 'columnOrder', type: 'ColumnOrderState', default: '[]', description: 'Column display order as array of column IDs.' },
  { name: 'enable-column-reorder', type: 'boolean', default: 'false', description: 'Enable column reordering by dragging column headers.' },
  { name: 'sticky-first-column', type: 'boolean', default: 'false', description: 'Pin the first column so it stays visible during horizontal scroll.' },
  { name: 'persistence-key', type: 'string', default: '""', description: 'LocalStorage key for persisting column preferences (sizing, order, visibility).' },
  { name: 'onColumnPreferencesChange', type: '(prefs: ColumnPreferencesChangeEvent) => void', default: 'undefined', description: 'Callback invoked when column preferences change. Use for server-side persistence.' },

  // Editing
  { name: 'enable-row-editing', type: 'boolean', default: 'false', description: 'Enable row-level edit mode with save/cancel controls.' },

  // Row Actions
  { name: 'rowActions', type: 'RowAction[]', default: '[]', description: 'Row action definitions. 1-2 actions render inline; 3+ use a kebab dropdown.' },
  { name: 'hover-reveal-actions', type: 'boolean', default: 'false', description: 'Show row action buttons only on hover for a cleaner appearance.' },

  // Bulk Actions
  { name: 'bulkActions', type: 'BulkAction[]', default: '[]', description: 'Bulk action definitions shown in toolbar when rows are selected.' },

  // Export
  { name: 'onExport', type: '(params: ServerExportParams) => void | Promise<void>', default: 'undefined', description: 'Server-side export callback. When set, exportCsv() delegates to this instead of client-side CSV generation.' },

  // Expandable Rows
  { name: 'renderDetailContent', type: '(rowData, row) => TemplateResult', default: 'undefined', description: 'Function that returns detail content for expanded rows. Enables the expand toggle column.' },
  { name: 'expanded', type: 'ExpandedState', default: '{}', description: 'Expanded row state. Object mapping row IDs to expansion boolean, or true for all expanded.' },
  { name: 'single-expand', type: 'boolean', default: 'false', description: 'Only allow one row expanded at a time (accordion mode).' },

  // Async Data
  { name: 'dataCallback', type: '(params, signal) => Promise<DataCallbackResult>', default: 'undefined', description: 'Async data fetch callback for server-side data. Receives table state params and an AbortSignal.' },
  { name: 'debounce-delay', type: 'number', default: '300', description: 'Debounce delay in milliseconds for filter changes when using dataCallback.' },
];

// -- Slots --

const dataTableSlots: SlotDef[] = [
  { name: 'toolbar-start', description: 'Content rendered at the start (left side) of the table toolbar.' },
  { name: 'toolbar-end', description: 'Content rendered at the end (right side) of the table toolbar.' },
];

// -- CSS Custom Properties --

type CSSVarDef = { name: string; default: string; description: string };

const dataTableCSSVars: CSSVarDef[] = [
  // Color tokens — match tailwind.css :root exactly
  { name: '--ui-data-table-header-bg', default: 'var(--color-muted, var(--ui-color-muted))', description: 'Header row background color.' },
  { name: '--ui-data-table-row-bg', default: 'var(--color-background, white)', description: 'Data row background color.' },
  { name: '--ui-data-table-row-hover-bg', default: 'var(--color-muted, var(--ui-color-muted))', description: 'Data row background on hover.' },
  { name: '--ui-data-table-border-color', default: 'var(--color-border, var(--ui-color-border))', description: 'Border color for table, rows, and cells.' },
  { name: '--ui-data-table-text-color', default: 'var(--color-foreground, var(--ui-color-foreground))', description: 'Primary text color for cell content.' },
  { name: '--ui-data-table-header-text', default: 'var(--color-muted-foreground, var(--ui-color-muted-foreground))', description: 'Header cell text color.' },
  { name: '--ui-data-table-selected-bg', default: 'oklch(0.97 0.01 250)', description: 'Background color for selected rows.' },
  { name: '--ui-data-table-selected-hover-bg', default: 'oklch(0.94 0.02 250)', description: 'Selected row background on hover.' },
  { name: '--ui-data-table-skeleton-base', default: 'var(--color-border, var(--ui-color-border))', description: 'Skeleton loading animation base color.' },
  { name: '--ui-data-table-skeleton-highlight', default: 'var(--color-muted, var(--ui-color-muted))', description: 'Skeleton loading animation highlight color.' },
  { name: '--ui-data-table-header-hover-bg', default: 'rgba(0, 0, 0, 0.05)', description: 'Sortable header background on hover.' },
  { name: '--ui-data-table-sticky-shadow', default: 'rgba(0, 0, 0, 0.06)', description: 'Box shadow for sticky first column during horizontal scroll.' },
  { name: '--ui-data-table-menu-bg', default: 'var(--color-card, var(--ui-color-card))', description: 'Background color for dropdown menus (column picker, row actions).' },
  { name: '--ui-data-table-menu-shadow', default: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)', description: 'Box shadow for dropdown menus.' },
  { name: '--ui-data-table-overlay-bg', default: 'rgba(255, 255, 255, 0.6)', description: 'Background overlay during "updating" loading state.' },
  { name: '--ui-data-table-editable-hover-bg', default: 'rgba(0, 0, 0, 0.03)', description: 'Background on hover for editable cells.' },
  { name: '--ui-data-table-editing-bg', default: 'color-mix(in oklch, var(--color-primary, var(--ui-color-primary)) 5%, var(--color-background, white))', description: 'Background for a cell currently being edited.' },
  { name: '--ui-data-table-banner-bg', default: 'color-mix(in oklch, var(--color-primary, var(--ui-color-primary)) 8%, var(--color-background, white))', description: 'Selection banner / bulk actions toolbar background.' },
  // Structural tokens — set in component CSS, not tailwind.css :root
  { name: '--ui-data-table-row-height', default: '48px', description: 'Minimum row height for data rows.' },
  { name: '--ui-data-table-header-height', default: '48px', description: 'Header row height.' },
  { name: '--ui-data-table-cell-padding', default: '0.75rem 1rem', description: 'Padding inside data and header cells.' },
  { name: '--ui-data-table-font-size', default: '0.875rem', description: 'Font size for cell content.' },
  { name: '--ui-data-table-header-font-weight', default: '500', description: 'Font weight for header cells.' },
  // Badge color tokens — all in tailwind.css :root
  { name: '--ui-data-table-badge-default-bg', default: 'var(--color-muted, var(--ui-color-muted))', description: 'Background for default/neutral badge cells.' },
  { name: '--ui-data-table-badge-default-text', default: 'var(--color-foreground, var(--ui-color-foreground))', description: 'Text color for default/neutral badge cells.' },
  { name: '--ui-data-table-badge-green-bg', default: 'oklch(0.93 0.06 150)', description: 'Background for green badge cells.' },
  { name: '--ui-data-table-badge-green-text', default: 'oklch(0.35 0.10 150)', description: 'Text color for green badge cells.' },
  { name: '--ui-data-table-badge-blue-bg', default: 'oklch(0.93 0.06 250)', description: 'Background for blue badge cells.' },
  { name: '--ui-data-table-badge-blue-text', default: 'oklch(0.35 0.10 250)', description: 'Text color for blue badge cells.' },
  { name: '--ui-data-table-badge-red-bg', default: 'oklch(0.93 0.06 25)', description: 'Background for red/danger badge cells.' },
  { name: '--ui-data-table-badge-red-text', default: 'oklch(0.35 0.10 25)', description: 'Text color for red/danger badge cells.' },
  { name: '--ui-data-table-badge-yellow-bg', default: 'oklch(0.93 0.06 85)', description: 'Background for yellow/warning badge cells.' },
  { name: '--ui-data-table-badge-yellow-text', default: 'oklch(0.40 0.12 85)', description: 'Text color for yellow/warning badge cells.' },
  { name: '--ui-data-table-badge-purple-bg', default: 'oklch(0.93 0.06 310)', description: 'Background for purple badge cells.' },
  { name: '--ui-data-table-badge-purple-text', default: 'oklch(0.35 0.10 310)', description: 'Text color for purple badge cells.' },
];

// -- Events --

interface EventDef {
  name: string;
  detailType: string;
  description: string;
}

const dataTableEvents: EventDef[] = [
  { name: 'ui-sort-change', detailType: 'SortChangeEvent', description: 'Fired when sort state changes via column header clicks.' },
  { name: 'ui-selection-change', detailType: 'SelectionChangeEvent', description: 'Fired when row selection changes. Includes selectedRows array and count.' },
  { name: 'ui-filter-change', detailType: 'FilterChangeEvent', description: 'Fired when column filters or global filter changes.' },
  { name: 'ui-pagination-change', detailType: 'PaginationChangeEvent', description: 'Fired when page index or page size changes.' },
  { name: 'ui-column-visibility-change', detailType: 'ColumnVisibilityChangeEvent', description: 'Fired when column visibility changes via the column picker.' },
  { name: 'ui-column-order-change', detailType: 'ColumnOrderChangeEvent', description: 'Fired when column order changes via drag-and-drop reordering.' },
  { name: 'ui-column-preferences-change', detailType: 'ColumnPreferencesChangeEvent', description: 'Fired when any column preference changes (sizing, order, or visibility).' },
  { name: 'ui-column-preferences-reset', detailType: '{ tableId: string }', description: 'Fired when column preferences are reset via resetColumnPreferences().' },
  { name: 'ui-cell-edit', detailType: 'CellEditEvent', description: 'Fired when a cell edit is committed. Includes columnId, oldValue, and newValue.' },
  { name: 'ui-row-edit', detailType: 'RowEditEvent', description: 'Fired when a row edit is saved. Includes oldValues and newValues for all changed fields.' },
  { name: 'ui-row-action', detailType: 'RowActionEvent', description: 'Fired when a row action button is clicked. Includes actionId and row data.' },
  { name: 'ui-bulk-action', detailType: 'BulkActionEvent', description: 'Fired when a bulk action is executed. Includes actionId and selectedRows.' },
  { name: 'ui-expanded-change', detailType: 'ExpandedChangeEvent', description: 'Fired when expanded row state changes via toggle clicks.' },
];

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
              html={basicCode.html}
              react={basicCode.react}
              vue={basicCode.vue}
              svelte={basicCode.svelte}
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
              html={sortingCode.html}
              react={sortingCode.react}
              vue={sortingCode.vue}
              svelte={sortingCode.svelte}
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
              html={selectionCode.html}
              react={selectionCode.react}
              vue={selectionCode.vue}
              svelte={selectionCode.svelte}
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
              html={filteringCode.html}
              react={filteringCode.react}
              vue={filteringCode.vue}
              svelte={filteringCode.svelte}
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
              html={paginationCode.html}
              react={paginationCode.react}
              vue={paginationCode.vue}
              svelte={paginationCode.svelte}
            />
          </section>

          {/* Advanced Features Section Header */}
          <div className="mt-16 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Advanced Features</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Column customization, inline editing, row actions, expandable rows, and more</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
          </div>

          {/* 6. Column Customization */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Column Customization</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Resize columns by dragging header borders. Toggle column visibility with the column picker.
              Drag headers to reorder columns. Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">persistence-key</code> to
              save preferences to localStorage.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo
                    columns={resizableColumns}
                    data={sampleUsers}
                    enable-column-resizing
                    show-column-picker
                    enable-column-reorder
                  />
                </div>
              }
              html={columnCustomizationCode.html}
              react={columnCustomizationCode.react}
              vue={columnCustomizationCode.vue}
              svelte={columnCustomizationCode.svelte}
            />
          </section>

          {/* 7. Inline Editing */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Inline Editing</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Click editable cells to edit values inline. Enable row editing mode for multi-cell
              edits with save/cancel. Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">editable: true</code> and{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">editType</code> in
              column meta. Listen to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-cell-edit</code> and{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-row-edit</code> events.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo
                    columns={editableColumns}
                    data={sampleUsers}
                    enable-row-editing
                  />
                </div>
              }
              html={inlineEditingCode.html}
              react={inlineEditingCode.react}
              vue={inlineEditingCode.vue}
              svelte={inlineEditingCode.svelte}
            />
          </section>

          {/* 8. Row Actions */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Row Actions</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add action buttons or a kebab menu to each row. Use{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">hover-reveal-actions</code> to
              show actions only on hover. With 1-2 actions, buttons render inline. With 3 or more, a kebab
              dropdown menu is used.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo
                    columns={basicColumns}
                    data={sampleUsers}
                    rowActions={demoRowActions}
                    hover-reveal-actions
                  />
                </div>
              }
              html={rowActionsCode.html}
              react={rowActionsCode.react}
              vue={rowActionsCode.vue}
              svelte={rowActionsCode.svelte}
            />
          </section>

          {/* 9. Expandable Rows */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Expandable Rows</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Expand rows to reveal detail content below. Use{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">single-expand</code> for
              accordion behavior where only one row is expanded at a time. The{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">renderDetailContent</code> function
              receives the row data and returns Lit HTML.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <DataTableDemo
                    columns={expandableColumns}
                    data={sampleUsers}
                    single-expand
                  />
                </div>
              }
              html={expandableRowsCode.html}
              react={expandableRowsCode.react}
              vue={expandableRowsCode.vue}
              svelte={expandableRowsCode.svelte}
            />
          </section>

          {/* 10. Server-Side Data */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Server-Side Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Connect to a server-side data source with async callbacks. Set{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">manual-sorting</code>,{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">manual-filtering</code>, and{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">manual-pagination</code> to
              delegate data operations to the server. The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">dataCallback</code> receives
              an AbortSignal for request cancellation.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <ServerSideDemoWrapper />
                </div>
              }
              html={serverSideCode.html}
              react={serverSideCode.react}
              vue={serverSideCode.vue}
              svelte={serverSideCode.svelte}
            />
          </section>

          {/* 11. CSV Export */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">CSV Export</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Export visible or selected data to CSV. Call the component's{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">exportCsv()</code> method
              programmatically. Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">onExport</code> callback
              for server-side export handling.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full overflow-auto">
                  <ExportDemoWrapper />
                </div>
              }
              html={csvExportCode.html}
              react={csvExportCode.react}
              vue={csvExportCode.vue}
              svelte={csvExportCode.svelte}
            />
          </section>
        </div>

        {/* API Reference */}
        <section className="mt-20 mb-14 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">API Reference</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of properties, events, slots, and CSS custom properties</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dataTableProps.length}</span>
            </div>
            <PropsTable props={dataTableProps} />
          </div>

          {/* Events */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dataTableEvents.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Event</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Detail Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dataTableEvents.map((evt) => (
                    <tr key={evt.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{evt.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{evt.detailType}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{evt.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dataTableSlots.length}</span>
            </div>
            <SlotsTable slots={dataTableSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dataTableCSSVars.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dataTableCSSVars.map((cssVar) => (
                    <tr key={cssVar.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{cssVar.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{cssVar.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cssVar.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mb-14 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Accessibility</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">ARIA roles, keyboard navigation, and screen reader behavior</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* ARIA Roles */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">ARIA Roles</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The data table implements the W3C ARIA grid pattern with semantic roles for assistive technology support.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Element</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Table container</td>
                    <td className="px-4 py-3"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">grid</code></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Identifies the element as an interactive data grid with 2D navigation</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Each row (header + data)</td>
                    <td className="px-4 py-3"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">row</code></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Groups cells into a row. Annotated with <code className="text-xs font-mono">aria-rowindex</code> (1-based, header is row 1)</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Header cells</td>
                    <td className="px-4 py-3"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">columnheader</code></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Identifies column headers. Sorted columns include <code className="text-xs font-mono">aria-sort="ascending"</code> or <code className="text-xs font-mono">"descending"</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Data cells</td>
                    <td className="px-4 py-3"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">gridcell</code></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Each data cell. Annotated with <code className="text-xs font-mono">aria-colindex</code> for position tracking</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Expand detail panel</td>
                    <td className="px-4 py-3"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">region</code></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Landmark for expanded row detail content</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Live announcements</td>
                    <td className="px-4 py-3"><code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">status</code></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Announces cell content, sort changes, and selection state via <code className="text-xs font-mono">aria-live="polite"</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Keyboard Navigation */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Keyboard Navigation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Full keyboard navigation following the W3C ARIA grid pattern. Focus is tracked per-cell with visual focus indicators.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Key</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Up</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Down</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Move focus to the cell above or below in the same column</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Left</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Right</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Move focus to the previous or next cell in the same row</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Home</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">End</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Move focus to the first or last cell in the current row</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Home</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">End</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Move focus to the first cell in the first row / last cell in the last row</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Page Up</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Page Down</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Move focus up or down by the number of visible rows (viewport height)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Enter</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">F2</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Activate cell editing on an editable cell. Enter also commits the edit.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Escape</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Cancel cell or row editing, restoring the original value</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Space</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Toggle row selection when selection is enabled</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Tab</kbd>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Move to the next interactive element within a cell (e.g., action buttons, links)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Screen Reader Support */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Screen Reader Support</h3>
            <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong className="text-gray-900 dark:text-gray-100">Cell announcements:</strong> As focus moves between cells, the live
                    region announces the cell content in the format "Row X of Y, ColumnHeader, Column X of Y". This provides full spatial
                    context for screen reader users navigating the grid.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong className="text-gray-900 dark:text-gray-100">Sort announcements:</strong> When a column sort changes, the screen
                    reader announces the new sort direction (e.g., "Name, sorted ascending"). Only the primary sort column
                    receives <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-sort</code> to avoid confusion with multi-column sorting.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong className="text-gray-900 dark:text-gray-100">Selection state:</strong> Selected rows are communicated
                    via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-selected</code> on the row element. The selection banner
                    announces the count of selected rows.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong className="text-gray-900 dark:text-gray-100">Loading state:</strong> When data is loading, the skeleton state is
                    communicated via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-busy="true"</code> on the grid element.
                    The updating overlay also sets <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-busy</code> to inform
                    screen readers that content is refreshing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* W3C APG Compliance */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">W3C APG Compliance</h3>
            <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    This component follows the{' '}
                    <a href="https://www.w3.org/WAI/ARIA/apg/patterns/grid/" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-gray-100 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2 hover:decoration-gray-500 dark:hover:decoration-gray-400 transition-colors">
                      W3C ARIA Authoring Practices Guide (APG) grid pattern
                    </a>.
                    Focus management uses a roving tabindex approach: only one cell in the grid is in the tab order at a time.
                    Arrow keys move focus between cells while keeping the grid as a single tab stop. Interactive elements within cells
                    (checkboxes, buttons, links) are reachable via Tab after entering the cell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
