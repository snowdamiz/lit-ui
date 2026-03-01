import { useEffect, useRef } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import '@lit-ui/charts/candlestick-chart';

function CandlestickChartDemo() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      // IMPORTANT: ohlc array order is [open, close, low, high] — NOT the standard OHLC acronym order
      (ref.current as any).data = [
        { date: '2024-01-01', ohlc: [100, 110, 95, 115] },
        { date: '2024-01-02', ohlc: [110, 105, 102, 118] },
        { date: '2024-01-03', ohlc: [105, 120, 103, 125] },
        { date: '2024-01-04', ohlc: [120, 115, 112, 128] },
        { date: '2024-01-05', ohlc: [115, 130, 113, 135] },
      ];
    }
  }, []);
  return <lui-candlestick-chart ref={ref as any} style={{ height: '300px', display: 'block' }} />;
}

const candlestickChartProps: PropDef[] = [
  {
    name: 'data',
    type: 'OhlcBar[] | undefined',
    default: 'undefined',
    description: "OhlcBar[] — each bar is { date: string, ohlc: [open, close, low, high] }. WARNING: ohlc array order is [open, close, low, high], NOT the standard OHLC acronym order. JS property only — cannot be set via HTML attribute.",
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
    description: 'Maximum number of candles in the streaming buffer.',
  },
  {
    name: 'bull-color',
    type: 'string',
    default: "'#26a69a'",
    description: 'Color for bullish candles (close > open).',
  },
  {
    name: 'bear-color',
    type: 'string',
    default: "'#ef5350'",
    description: 'Color for bearish candles (close < open).',
  },
  {
    name: 'show-volume',
    type: 'boolean',
    default: 'false',
    description: 'Show a volume panel below the candlestick chart. Both panels share the DataZoom slider.',
  },
  {
    name: 'moving-averages',
    type: 'MAConfig[] | undefined',
    default: 'undefined',
    description: 'Array of moving average overlays (e.g. SMA-20, EMA-50). Each MAConfig specifies type, period, and optional color.',
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

const candlestickChartHtmlCode = `<!-- Set data via JavaScript property (not attribute) -->
<!-- IMPORTANT: ohlc order is [open, close, low, high] — NOT OHLC acronym order -->
<lui-candlestick-chart id="chart"></lui-candlestick-chart>
<script>
  document.querySelector('#chart').data = [
    { date: '2024-01-01', ohlc: [100, 110, 95, 115] },
    { date: '2024-01-02', ohlc: [110, 105, 102, 118] },
    { date: '2024-01-03', ohlc: [105, 120, 103, 125] },
    { date: '2024-01-04', ohlc: [120, 115, 112, 128] },
    { date: '2024-01-05', ohlc: [115, 130, 113, 135] },
  ];
</script>`;

export function CandlestickChartPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-10 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Candlestick Chart
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              OHLC candlestick chart with volume panel, SMA/EMA moving averages, and streaming.
            </p>
          </div>
        </header>

        {/* Tree-shaking callout */}
        <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
          <strong>Tree-shaking tip:</strong> Import <code>@lit-ui/charts/candlestick-chart</code> (subpath) instead of <code>@lit-ui/charts</code> to include only this chart's modules (~135KB gzipped vs 350KB+ for all charts).
        </div>

        {/* OHLC order warning */}
        <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
          <strong>Data order warning:</strong> The <code>ohlc</code> array uses <strong>[open, close, low, high]</strong> order — this is NOT the standard OHLC acronym order (open, high, low, close). Swapping high/low will produce incorrect wick rendering.
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">5-Day OHLC Candlestick</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Basic candlestick chart with 5 daily bars. Note the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ohlc</code> array order is <strong>[open, close, low, high]</strong>. Data is set via the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">.data</code> JavaScript property.
            </p>
            <ExampleBlock
              preview={<CandlestickChartDemo />}
              html={candlestickChartHtmlCode}
              react={candlestickChartHtmlCode}
              vue={candlestickChartHtmlCode}
              svelte={candlestickChartHtmlCode}
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{candlestickChartProps.length}</span>
            </div>
            <PropsTable props={candlestickChartProps} />
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
      </div>
    </FrameworkProvider>
  );
}
