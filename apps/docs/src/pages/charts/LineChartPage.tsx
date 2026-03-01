import { useEffect, useRef } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import '@lit-ui/charts/line-chart';

function LineChartDemo() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).data = [
        { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
        { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
      ];
    }
  }, []);
  return <lui-line-chart ref={ref as any} smooth zoom style={{ height: '300px', display: 'block' }} />;
}

const lineChartProps: PropDef[] = [
  {
    name: 'data',
    type: '{ name: string; data: number[] }[] | undefined',
    default: 'undefined',
    description: 'Chart data as an array of named series. JS property only — cannot be set via HTML attribute.',
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
    default: '500000',
    description: 'Maximum streaming buffer points. Line chart overrides base default from 1000 to 500,000 — at 1000 pts/sec this allows ~8 minutes before auto reset.',
  },
  {
    name: 'smooth',
    type: 'boolean',
    default: 'false',
    description: 'Enable smooth curve interpolation between data points.',
  },
  {
    name: 'zoom',
    type: 'boolean',
    default: 'false',
    description: 'Enable zoom and pan via the DataZoom slider.',
  },
  {
    name: 'mark-lines',
    type: 'MarkLineSpec[] | undefined',
    default: 'undefined',
    description: 'Threshold/reference lines drawn on the chart (e.g., targets, averages).',
  },
  {
    name: 'enable-webgpu',
    type: 'boolean',
    default: 'false',
    description: 'Opt-in WebGPU rendering via ChartGPU 0.3.2. When set and WebGPU is available (Chrome/Edge, Firefox 141+, Safari 26+), renders data pixels on a GPU-accelerated canvas layer beneath ECharts axes/tooltip. Falls back to Canvas automatically on unsupported browsers.',
  },
  {
    name: 'renderer',
    type: "'webgpu' | 'webgl' | 'canvas'",
    default: "'canvas'",
    description: "Read-only property — active renderer tier after the 'renderer-selected' event fires. Do NOT read synchronously before the event; the async GPU probe may not have resolved. Not a Lit @property() — does not trigger reactive updates.",
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

const lineChartHtmlCode = `<!-- Set data via JavaScript property (not attribute) -->
<lui-line-chart id="chart" smooth zoom></lui-line-chart>
<script>
  document.querySelector('#chart').data = [
    { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
    { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
  ];
</script>`;

export function LineChartPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-10 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Line Chart
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Real-time line chart with multi-series support, smooth interpolation, zoom/pan, and streaming via pushData().
            </p>
          </div>
        </header>

        {/* Tree-shaking callout */}
        <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
          <strong>Tree-shaking tip:</strong> Import <code>@lit-ui/charts/line-chart</code> (subpath) instead of <code>@lit-ui/charts</code> to include only this chart's modules (~135KB gzipped vs 350KB+ for all charts). ChartGPU 0.3.2 is loaded on-demand via dynamic import only when <code>enable-webgpu</code> is set AND WebGPU is available — zero additional overhead on unsupported browsers.
        </div>

        {/* WebGPU browser support */}
        <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 text-sm">
          <strong className="block mb-3 text-gray-900 dark:text-gray-100">WebGPU browser support</strong>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-1 pr-4 text-gray-700 dark:text-gray-300">Browser</th>
                <th className="text-left py-1 pr-4 text-gray-700 dark:text-gray-300">WebGPU</th>
                <th className="text-left py-1 text-gray-700 dark:text-gray-300">Notes</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-400">
              <tr><td className="py-1 pr-4">Chrome / Edge</td><td className="py-1 pr-4 text-green-600 dark:text-green-400">Yes</td><td className="py-1">Stable since Chrome 113</td></tr>
              <tr><td className="py-1 pr-4">Firefox</td><td className="py-1 pr-4 text-green-600 dark:text-green-400">Yes (141+)</td><td className="py-1">Enabled by default in Firefox 141</td></tr>
              <tr><td className="py-1 pr-4">Safari</td><td className="py-1 pr-4 text-green-600 dark:text-green-400">Yes (26+)</td><td className="py-1">Enabled by default in Safari 26</td></tr>
              <tr><td className="py-1 pr-4">Fallback</td><td className="py-1 pr-4">Canvas</td><td className="py-1">Automatic — no user action needed</td></tr>
            </tbody>
          </table>
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Line Chart</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Multi-series line chart with smooth interpolation and zoom enabled. Data is set via the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">.data</code> JavaScript property.
            </p>
            <ExampleBlock
              preview={<LineChartDemo />}
              html={lineChartHtmlCode}
              react={lineChartHtmlCode}
              vue={lineChartHtmlCode}
              svelte={lineChartHtmlCode}
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{lineChartProps.length}</span>
            </div>
            <PropsTable props={lineChartProps} />
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
          prev={{ title: 'Tooltip', href: '/components/tooltip' }}
          next={{ title: 'Area Chart', href: '/charts/area-chart' }}
        />
      </div>
    </FrameworkProvider>
  );
}
