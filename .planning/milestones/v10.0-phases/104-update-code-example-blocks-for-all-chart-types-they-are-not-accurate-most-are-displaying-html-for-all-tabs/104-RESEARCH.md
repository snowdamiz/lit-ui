# Phase 104: Update Code Example Blocks for All Chart Types - Research

**Researched:** 2026-03-01
**Domain:** React docs pages, ExampleBlock component, per-framework code examples
**Confidence:** HIGH

## Summary

All 8 chart documentation pages (`LineChartPage.tsx`, `AreaChartPage.tsx`, `BarChartPage.tsx`, `PieChartPage.tsx`, `ScatterChartPage.tsx`, `HeatmapChartPage.tsx`, `CandlestickChartPage.tsx`, `TreemapChartPage.tsx`) contain the same bug: the `ExampleBlock` component is invoked with identical code strings passed to all four framework props (`html`, `react`, `vue`, `svelte`). Every tab — HTML, React, Vue, Svelte — displays HTML code with a vanilla `<script>` tag, not the correct framework-specific syntax.

The fix is purely a documentation change: write 4 distinct code strings per chart (one per framework) and pass them correctly to `ExampleBlock`. No changes to the `ExampleBlock` component, `FrameworkTabs`, or chart components themselves are needed. The `ExampleBlock` contract is already correct and ready to display per-framework code; the page-level code strings just need to be differentiated.

Charts use web custom elements (`lui-line-chart`, etc.), so all frameworks can use the same tag name. The key difference is how each framework handles JavaScript property assignment on a DOM element — the `data` property and chart-specific properties cannot be set as HTML attributes and must be set programmatically. This means each framework tab needs its own idiomatic property-assignment pattern.

**Primary recommendation:** In each chart page file, replace the single shared code string with 4 separate strings (html, react, vue, svelte) and pass them individually to `ExampleBlock`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | (project's version) | Docs app framework | All chart pages are `.tsx` React components |
| TypeScript | (project's version) | Language | All page files use `.tsx` |

No new libraries needed. This phase is pure doc string authoring.

**Installation:** No new packages required.

## Architecture Patterns

### Affected Files (8 chart pages)

```
apps/docs/src/pages/charts/
├── LineChartPage.tsx        — uses lineChartHtmlCode for all 4 tabs
├── AreaChartPage.tsx        — uses areaChartHtmlCode for all 4 tabs
├── BarChartPage.tsx         — uses barChartHtmlCode for all 4 tabs
├── PieChartPage.tsx         — uses pieChartHtmlCode for all 4 tabs
├── ScatterChartPage.tsx     — uses scatterChartHtmlCode for all 4 tabs
├── HeatmapChartPage.tsx     — uses heatmapChartHtmlCode for all 4 tabs
├── CandlestickChartPage.tsx — uses candlestickChartHtmlCode for all 4 tabs
└── TreemapChartPage.tsx     — uses treemapChartHtmlCode for all 4 tabs
```

### Pattern 1: Rename and Split Single String into 4 Strings

**What:** Each chart page currently has one variable (e.g., `lineChartHtmlCode`). Replace with four variables — one per framework — each containing the idiomatic code for that framework.

**When to use:** Every chart page.

**Example (Line Chart):**

```typescript
// HTML tab — vanilla JS, document.querySelector with <script> block
const lineChartHtml = `<!-- Import from CDN or bundler -->
<lui-line-chart id="chart" smooth zoom></lui-line-chart>
<script>
  document.querySelector('#chart').data = [
    { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
    { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
  ];
</script>`;

// React tab — useRef + useEffect to assign .data after mount
const lineChartReact = `import { useEffect, useRef } from 'react';
import '@lit-ui/charts/line-chart';

export function MyChart() {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.data = [
        { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
        { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
      ];
    }
  }, []);
  return <lui-line-chart ref={ref} smooth zoom style={{ height: '300px', display: 'block' }} />;
}`;

// Vue tab — ref() + onMounted to assign .data after mount
const lineChartVue = `<template>
  <lui-line-chart ref="chart" smooth zoom style="height: 300px; display: block" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@lit-ui/charts/line-chart';

const chart = ref(null);
onMounted(() => {
  chart.value.data = [
    { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
    { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
  ];
});
</script>`;

// Svelte tab — bind:this + onMount to assign .data after mount
const lineChartSvelte = `<script>
  import { onMount } from 'svelte';
  import '@lit-ui/charts/line-chart';

  let chart;
  onMount(() => {
    chart.data = [
      { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
      { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
    ];
  });
</script>

<lui-line-chart bind:this={chart} smooth zoom style="height: 300px; display: block" />`;
```

**ExampleBlock call becomes:**

```typescript
<ExampleBlock
  preview={<LineChartDemo />}
  html={lineChartHtml}
  react={lineChartReact}
  vue={lineChartVue}
  svelte={lineChartSvelte}
/>
```

### Pattern 2: Heatmap — Multiple Property Assignments

Heatmap sets 3 properties (`xCategories`, `yCategories`, `data`). Each framework variant must set all three using the same idiomatic lifecycle/ref approach.

```typescript
// Vue example for heatmap (multiple props)
const heatmapVue = `<template>
  <lui-heatmap-chart ref="chart" style="height: 300px; display: block" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@lit-ui/charts/heatmap-chart';

const chart = ref(null);
onMounted(() => {
  chart.value.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  chart.value.yCategories = ['Morning', 'Afternoon', 'Evening'];
  chart.value.data = [
    [0, 0, 85], [1, 1, 42], [2, 2, 62],
  ];
});
</script>`;
```

### Anti-Patterns to Avoid

- **Sharing the same string for all tabs:** The current bug. Don't keep `react={htmlCode}`.
- **Using `v-bind` for JS-only properties in Vue:** Vue's `v-bind` works for DOM attributes; JS object properties must be set in `onMounted`.
- **Using Svelte stores or reactive declarations for property init:** `onMount` with a simple assignment is the correct pattern for one-time DOM element property init in Svelte.
- **TypeScript strict typing in examples:** Keep examples simple; the docs audience is setting up quickly. Use plain `let chart;` in Svelte, not typed refs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab switching UI | Custom tab component | Existing `FrameworkTabs` + `ExampleBlock` | Already implemented; just pass correct strings |
| Syntax highlighting | Custom code renderer | Existing `CodeBlock` (used by `FrameworkTabs`) | Already handles tsx, html highlighting |

**Key insight:** The `ExampleBlock` and `FrameworkTabs` components are already correct and complete. Zero component changes needed — only the page-level code string constants need updating.

## Common Pitfalls

### Pitfall 1: Vue Reactivity Trap with DOM Properties
**What goes wrong:** Writing `chart.value.data = reactive(...)` and expecting the chart to update reactively. ECharts custom elements are not reactive Vue components.
**Why it happens:** Vue developers expect `ref` objects to automatically re-render children.
**How to avoid:** Use `onMounted` with a plain JS assignment. The chart component observes the property internally.
**Warning signs:** Chart doesn't render initial data.

### Pitfall 2: Svelte Bind:This Timing
**What goes wrong:** Accessing `chart` in a reactive statement (`$:`) before `onMount` completes.
**Why it happens:** `bind:this` is populated after the element is mounted, same lifecycle as `onMount`.
**How to avoid:** Only use `chart` inside `onMount(() => { ... })`.
**Warning signs:** `chart` is null/undefined when trying to set `.data`.

### Pitfall 3: React Ref Null Check
**What goes wrong:** Omitting the `if (ref.current)` guard in `useEffect`.
**Why it happens:** In SSR/strict-mode, effects can fire before mount.
**How to avoid:** Always guard with `if (ref.current)` before setting properties.
**Warning signs:** TypeScript error `Cannot set properties of null`.

### Pitfall 4: HTML Tab Showing Wrong Tag Usage
**What goes wrong:** HTML tab shows `import` statement (ES module syntax), which confuses vanilla HTML users.
**Why it happens:** Copying React code to HTML tab.
**How to avoid:** HTML tab uses either CDN script tag or a minimal `<script>` comment noting the import, then plain `document.querySelector`.

### Pitfall 5: Missing the `enable-webgpu` Attribute in Candlestick Demo
**What goes wrong:** The demo component uses `enable-webgpu` (line 22 of CandlestickChartPage.tsx), but the code examples don't include it.
**Why it happens:** The HTML code string was written before WebGPU was added.
**How to avoid:** Ensure the HTML/React/Vue/Svelte examples reflect the actual demo markup — include `enable-webgpu` if the live demo uses it, or drop it from the demo if it shouldn't be the default example.

## Code Examples

### Chart-Specific Data Shapes

Each chart type has a distinct data shape. These must be correct in all 4 framework variants:

**Line / Area:** `{ name: string; data: number[] }[]`
```typescript
data = [
  { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
  { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
];
```

**Bar:** `{ name: string; data: number[]; categories?: string[] }[]`
```typescript
data = [
  { name: 'Product A', data: [120, 200, 150, 80], categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
  { name: 'Product B', data: [60, 100, 80, 140], categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
];
```

**Pie / Donut:** `{ name: string; value: number }[]`
```typescript
data = [
  { name: 'Electronics', value: 42 },
  { name: 'Clothing', value: 25 },
  { name: 'Food', value: 18 },
];
```

**Scatter:** `[number, number][]`
```typescript
data = [[10, 20], [30, 50], [15, 35], [50, 80]];
```

**Heatmap:** Multiple properties — `xCategories`, `yCategories`, `data: [number, number, number][]`
```typescript
chart.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
chart.yCategories = ['Morning', 'Afternoon', 'Evening'];
chart.data = [[0, 0, 85], [1, 1, 42], [2, 2, 62]];
```

**Candlestick:** `{ label: string; ohlc: [open, close, low, high]; volume?: number }[]`
```typescript
// WARNING: ohlc order is [open, close, low, high] — NOT the OHLC acronym order
data = [
  { label: '2024-01-01', ohlc: [100, 110, 95, 115] },
  { label: '2024-01-02', ohlc: [110, 105, 102, 118] },
];
```

**Treemap:** `{ name: string; value: number; children?: TreemapNode[] }[]`
```typescript
data = [
  { name: 'Electronics', value: 42, children: [
    { name: 'Phones', value: 25 },
    { name: 'Laptops', value: 17 },
  ]},
];
```

### Framework Template Skeletons

#### React (all charts follow this pattern)
```tsx
// Source: ExistingDemo components in each chart page
import { useEffect, useRef } from 'react';
import '@lit-ui/charts/{chart-type}';

export function MyChart() {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.data = /* chart-specific data */;
    }
  }, []);
  return <lui-{chart-tag} ref={ref} style={{ height: '300px', display: 'block' }} />;
}
```

#### Vue (all charts follow this pattern)
```vue
<template>
  <lui-{chart-tag} ref="chart" style="height: 300px; display: block" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@lit-ui/charts/{chart-type}';

const chart = ref(null);
onMounted(() => {
  chart.value.data = /* chart-specific data */;
});
</script>
```

#### Svelte (all charts follow this pattern)
```svelte
<script>
  import { onMount } from 'svelte';
  import '@lit-ui/charts/{chart-type}';

  let chart;
  onMount(() => {
    chart.data = /* chart-specific data */;
  });
</script>

<lui-{chart-tag} bind:this={chart} style="height: 300px; display: block" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single HTML code string for all tabs | 4 separate per-framework strings | Phase 104 (now) | Each framework tab shows runnable, idiomatic code |

**Current broken state:**
- All 8 chart pages: Single `*HtmlCode` string variable passed identically to `html`, `react`, `vue`, `svelte` props.
- Result: React, Vue, and Svelte tabs display raw HTML with `<script>` tags — not usable by framework developers.

## Open Questions

1. **Should examples include the import statement?**
   - What we know: HTML tab cannot use `import` (it's a CDN/bundler concern). React/Vue/Svelte examples should show the import.
   - What's unclear: Whether the team prefers CDN-style HTML or bundler-style.
   - Recommendation: HTML tab shows `<script>` with `document.querySelector` + a comment about the import path. React/Vue/Svelte show the `import '@lit-ui/charts/...'` statement.

2. **Should the Candlestick demo's `enable-webgpu` attribute appear in the examples?**
   - What we know: The live demo (`CandlestickChartDemo`) renders with `enable-webgpu` set. The HTML code string does NOT include it.
   - What's unclear: Is this intentional (keep examples simpler) or an oversight?
   - Recommendation: Drop `enable-webgpu` from the live demo OR add it to all 4 framework examples for consistency. Recommend dropping from demo and keeping examples clean — WebGPU is documented in the props table and callout box.

3. **How many ExampleBlocks per chart page?**
   - What we know: Currently each chart page has exactly 1 ExampleBlock.
   - What's unclear: Phase may or may not want to add more example blocks (e.g., a streaming `pushData` example for Line/Area).
   - Recommendation: Fix the 1 existing ExampleBlock per page only. Adding new examples is out of scope for Phase 104.

## Plan Breakdown Recommendation

The 8 charts naturally group into logical units. Suggested plan split:

**Plan 1 — Line + Area chart pages** (similar data shape, both have WebGPU props)
- `LineChartPage.tsx`: 4 strings (html/react/vue/svelte)
- `AreaChartPage.tsx`: 4 strings

**Plan 2 — Bar + Pie chart pages** (simple data shapes)
- `BarChartPage.tsx`: 4 strings
- `PieChartPage.tsx`: 4 strings

**Plan 3 — Scatter + Heatmap + Candlestick + Treemap chart pages** (complex/unique data shapes)
- `ScatterChartPage.tsx`: 4 strings
- `HeatmapChartPage.tsx`: 4 strings (multiple property assignments)
- `CandlestickChartPage.tsx`: 4 strings (OHLC warning must stay in HTML comment)
- `TreemapChartPage.tsx`: 4 strings (hierarchical data)

Alternatively, all 8 can be a single plan since the change is mechanical and low-risk.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of all 8 chart page files in `apps/docs/src/pages/charts/`
- `apps/docs/src/components/ExampleBlock.tsx` — confirmed component signature
- `apps/docs/src/components/FrameworkTabs.tsx` — confirmed tab rendering logic

### Secondary (MEDIUM confidence)
- Vue 3 `onMounted` + `ref` pattern for custom element property assignment — standard Vue 3 lifecycle
- Svelte `onMount` + `bind:this` pattern for custom element property assignment — standard Svelte lifecycle
- React `useEffect` + `useRef` pattern — already used in all existing demo components on the same pages

## Metadata

**Confidence breakdown:**
- Bug identification: HIGH — read all 8 files, confirmed the bug exists in every chart page
- Fix pattern: HIGH — ExampleBlock interface is clear, no component changes needed
- Framework code patterns: HIGH — React pattern already used in existing demo components; Vue/Svelte are well-established lifecycle patterns
- Scope: HIGH — no new components, no new packages, no architectural changes

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable — docs-only change, no framework API dependency)
