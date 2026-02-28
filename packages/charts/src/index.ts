// @lit-ui/charts — High-performance chart components with WebGL rendering,
// real-time streaming, and CSS token theming built with Lit and ECharts

export { BaseChartElement } from './base/base-chart-element.js';
export { ThemeBridge } from './base/theme-bridge.js';
export { registerCanvasCore } from './registry/canvas-core.js';

// Re-export ECharts option type for consumers who need to type their option objects.
// EChartsCoreOption (ECBasicOption from echarts/core) covers all setOption payloads
// in tree-shaken builds that use echarts/core instead of the full echarts package.
export type { EChartsOption } from './base/base-chart-element.js';
