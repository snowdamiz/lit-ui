// @lit-ui/charts — High-performance chart components with WebGL rendering,
// real-time streaming, and CSS token theming built with Lit and ECharts

// Phase 88: Infrastructure
export { BaseChartElement } from './base/base-chart-element.js';
export { ThemeBridge } from './base/theme-bridge.js';
export { registerCanvasCore } from './registry/canvas-core.js';
export type { EChartsOption } from './base/base-chart-element.js';

// Phase 89: Line Chart + Area Chart
export { LuiLineChart } from './line/line-chart.js';
export { LuiAreaChart } from './area/area-chart.js';
export type { LineChartSeries, MarkLineSpec, LineOptionProps } from './shared/line-option-builder.js';

// Phase 90: Bar Chart
export { LuiBarChart } from './bar/bar-chart.js';
export type { BarChartSeries, BarOptionProps } from './shared/bar-option-builder.js';

// Phase 91: Pie + Donut Chart
export { LuiPieChart } from './pie/pie-chart.js';
export type { PieSlice, PieOptionProps } from './shared/pie-option-builder.js';

// Phase 92: Scatter + Bubble Chart
export { LuiScatterChart } from './scatter/scatter-chart.js';
export type { ScatterPoint, ScatterOptionProps } from './shared/scatter-option-builder.js';

// Phase 93: Heatmap Chart
export { LuiHeatmapChart } from './heatmap/heatmap-chart.js';
export type { HeatmapCell, HeatmapOptionProps } from './shared/heatmap-option-builder.js';

// Phase 94: Candlestick Chart
export { LuiCandlestickChart } from './candlestick/candlestick-chart.js';
export type { OhlcBar, MAConfig, CandlestickBarPoint, CandlestickOptionProps } from './shared/candlestick-option-builder.js';

// Phase 95: Treemap Chart
export { LuiTreemapChart } from './treemap/treemap-chart.js';
export type { TreemapNode, TreemapOptionProps } from './shared/treemap-option-builder.js';
