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
