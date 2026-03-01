import { useEffect, useRef } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import '@lit-ui/charts/heatmap-chart';

function HeatmapChartDemo() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      const el = ref.current as any;
      el.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      el.yCategories = ['Morning', 'Afternoon', 'Evening'];
      el.data = [
        [0, 0, 85],
        [1, 0, 72],
        [2, 0, 90],
        [3, 0, 68],
        [4, 0, 55],
        [0, 1, 42],
        [1, 1, 60],
        [2, 1, 78],
        [3, 1, 95],
        [4, 1, 33],
        [0, 2, 20],
        [1, 2, 45],
        [2, 2, 62],
        [3, 2, 38],
        [4, 2, 80],
      ];
    }
  }, []);
  return <lui-heatmap-chart ref={ref as any} style={{ height: '300px', display: 'block' }} />;
}

const heatmapChartProps: PropDef[] = [
  {
    name: 'data',
    type: '[number, number, number][] | undefined',
    default: 'undefined',
    description: 'Heatmap cells as an array of [xIdx, yIdx, value] tuples where xIdx/yIdx are integer indices into xCategories/yCategories arrays. JS property only — cannot be set via HTML attribute.',
  },
  {
    name: 'x-categories',
    type: 'string[]',
    default: '[]',
    description: 'Labels for the x-axis categories. Set via JS property (xCategories) or JSON string attribute.',
  },
  {
    name: 'y-categories',
    type: 'string[]',
    default: '[]',
    description: 'Labels for the y-axis categories. Set via JS property (yCategories) or JSON string attribute.',
  },
  {
    name: 'color-range',
    type: '[string, string]',
    default: "['#313695', '#a50026']",
    description: 'Two-color gradient range for the VisualMap color scale. First color maps to the minimum value, second to the maximum.',
  },
  {
    name: 'option',
    type: 'EChartsOption | undefined',
    default: 'undefined',
    description: 'Raw ECharts option passthrough for advanced customization.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Show a loading skeleton while data is being fetched.',
  },
  {
    name: 'enable-gl',
    type: 'boolean',
    default: 'false',
    description: 'Enable WebGL rendering via echarts-gl (scatter chart only).',
  },
  {
    name: 'max-points',
    type: 'number',
    default: '1000',
    description: 'Maximum number of points in the streaming buffer.',
  },
];

type CSSVarDef = { name: string; default: string; description: string };
const chartCSSVars: CSSVarDef[] = [
  { name: '--ui-chart-height', default: '300px', description: 'Default chart height.' },
  { name: '--ui-chart-color-1', default: 'oklch series color', description: 'First series color.' },
  { name: '--ui-chart-color-2', default: 'oklch series color', description: 'Second series color.' },
  { name: '--ui-chart-color-3', default: 'oklch series color', description: 'Third series color.' },
  { name: '--ui-chart-color-4', default: 'oklch series color', description: 'Fourth series color.' },
  { name: '--ui-chart-color-5', default: 'oklch series color', description: 'Fifth series color.' },
  { name: '--ui-chart-color-6', default: 'oklch series color', description: 'Sixth series color.' },
  { name: '--ui-chart-color-7', default: 'oklch series color', description: 'Seventh series color.' },
  { name: '--ui-chart-color-8', default: 'oklch series color', description: 'Eighth series color.' },
  { name: '--ui-chart-grid-line', default: '#e5e7eb', description: 'Grid line color.' },
  { name: '--ui-chart-axis-label', default: '#6b7280', description: 'Axis label text color.' },
  { name: '--ui-chart-axis-line', default: '#d1d5db', description: 'Axis line color.' },
  { name: '--ui-chart-tooltip-bg', default: '#ffffff', description: 'Tooltip background color.' },
  { name: '--ui-chart-tooltip-border', default: '#e5e7eb', description: 'Tooltip border color.' },
  { name: '--ui-chart-tooltip-text', default: '#111827', description: 'Tooltip text color.' },
  { name: '--ui-chart-legend-text', default: '#374151', description: 'Legend text color.' },
  { name: '--ui-chart-font-family', default: 'system-ui, sans-serif', description: 'Font family for labels and tooltips.' },
];

const heatmapChartHtml = `<!-- Set xCategories, yCategories, and data via JavaScript properties -->
<lui-heatmap-chart id="chart"></lui-heatmap-chart>
<script>
  const chart = document.querySelector('#chart');
  chart.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  chart.yCategories = ['Morning', 'Afternoon', 'Evening'];
  chart.data = [
    [0, 0, 85],
    [1, 1, 42],
    [2, 2, 62],
  ];
</script>`;

const heatmapChartReact = `import { useEffect, useRef } from 'react';
import '@lit-ui/charts/heatmap-chart';

export function MyHeatmapChart() {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      ref.current.yCategories = ['Morning', 'Afternoon', 'Evening'];
      ref.current.data = [
        [0, 0, 85],
        [1, 1, 42],
        [2, 2, 62],
      ];
    }
  }, []);
  return <lui-heatmap-chart ref={ref} style={{ height: '300px', display: 'block' }} />;
}`;

const heatmapChartVue = `<template>
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
    [0, 0, 85],
    [1, 1, 42],
    [2, 2, 62],
  ];
});
</script>`;

const heatmapChartSvelte = `<script>
  import { onMount } from 'svelte';
  import '@lit-ui/charts/heatmap-chart';

  let chart;
  onMount(() => {
    chart.xCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    chart.yCategories = ['Morning', 'Afternoon', 'Evening'];
    chart.data = [
      [0, 0, 85],
      [1, 1, 42],
      [2, 2, 62],
    ];
  });
</script>

<lui-heatmap-chart bind:this={chart} style="height: 300px; display: block" />`;

export function HeatmapChartPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-10 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Heatmap Chart
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Cartesian heatmap with configurable x/y category axes and VisualMap color scale.
            </p>
          </div>
        </header>

        {/* Tree-shaking callout */}
        <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
          <strong>Tree-shaking tip:</strong> Import <code>@lit-ui/charts/heatmap-chart</code> (subpath) instead of <code>@lit-ui/charts</code> to include only this chart's modules (~135KB gzipped vs 350KB+ for all charts).
        </div>

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
              <p className="text-sm text-gray-500 dark:text-gray-400">Interactive demonstrations of common use cases</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Live demo */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Weekly Activity Heatmap</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              5x3 heatmap (Mon–Fri by time of day). Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">xCategories</code>, <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">yCategories</code>, and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">data</code> as separate JS properties.
            </p>
            <ExampleBlock
              preview={<HeatmapChartDemo />}
              html={heatmapChartHtml}
              react={heatmapChartReact}
              vue={heatmapChartVue}
              svelte={heatmapChartSvelte}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Props and CSS custom properties</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{heatmapChartProps.length}</span>
            </div>
            <PropsTable props={heatmapChartProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{chartCSSVars.length}</span>
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
                  {chartCSSVars.map((cssVar) => (
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

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Scatter Chart', href: '/charts/scatter-chart' }}
          next={{ title: 'Candlestick Chart', href: '/charts/candlestick-chart' }}
        />
      </div>
    </FrameworkProvider>
  );
}
