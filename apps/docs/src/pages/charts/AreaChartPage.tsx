import { useEffect, useRef } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import '@lit-ui/charts/area-chart';

function AreaChartDemo() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).data = [
        { name: 'Page Views', data: [820, 932, 901, 934, 1290, 1330, 1320] },
        { name: 'Unique Visitors', data: [380, 410, 390, 450, 600, 580, 620] },
      ];
    }
  }, []);
  return <lui-area-chart ref={ref as any} smooth stacked label-position="top" style={{ height: '300px', display: 'block' }} />;
}

const areaChartProps: PropDef[] = [
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
    default: '1000',
    description: 'Maximum number of points in the streaming buffer.',
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
    name: 'stacked',
    type: 'boolean',
    default: 'false',
    description: 'Stack multiple series on top of each other.',
  },
  {
    name: 'label-position',
    type: "'top' | 'bottom' | ''",
    default: "''",
    description: "Show value labels on data points. 'top' = above each point, 'bottom' = below. Empty string disables labels.",
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

const areaChartHtmlCode = `<!-- Set data via JavaScript property (not attribute) -->
<lui-area-chart id="chart" smooth stacked label-position="top"></lui-area-chart>
<script>
  document.querySelector('#chart').data = [
    { name: 'Page Views', data: [820, 932, 901, 934, 1290, 1330, 1320] },
    { name: 'Unique Visitors', data: [380, 410, 390, 450, 600, 580, 620] },
  ];
</script>`;

export function AreaChartPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-10 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Area Chart
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Area chart with multi-series support, optional stacking, smooth interpolation, and zoom/pan controls.
            </p>
          </div>
        </header>

        {/* Tree-shaking callout */}
        <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
          <strong>Tree-shaking tip:</strong> Import <code>@lit-ui/charts/area-chart</code> (subpath) instead of <code>@lit-ui/charts</code> to include only this chart's modules (~135KB gzipped vs 350KB+ for all charts).
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Stacked Area Chart</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Multi-series area chart with smooth curves and stacked areas. Data is set via the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">.data</code> JavaScript property.
            </p>
            <ExampleBlock
              preview={<AreaChartDemo />}
              html={areaChartHtmlCode}
              react={areaChartHtmlCode}
              vue={areaChartHtmlCode}
              svelte={areaChartHtmlCode}
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{areaChartProps.length}</span>
            </div>
            <PropsTable props={areaChartProps} />
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
          prev={{ title: 'Line Chart', href: '/charts/line-chart' }}
          next={{ title: 'Bar Chart', href: '/charts/bar-chart' }}
        />
      </div>
    </FrameworkProvider>
  );
}
