/**
 * Scatter chart component template
 */
export const SCATTER_CHART_TEMPLATE = `/**
 * my-scatter-chart - Scatter / bubble chart starter
 *
 * Features:
 * - Scatter chart for x/y correlation data
 * - Bubble mode (set bubble attribute) for 3-dimensional data with size encoding
 * - Optional WebGL rendering via enable-gl for 500K+ points at 60 fps
 * - Real-time streaming via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Note: When enable-gl is set, install echarts-gl: npm install echarts-gl
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-scatter-chart></my-scatter-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-scatter-chart');
 * chart.querySelector('lui-scatter-chart').data = [
 *   { x: 10, y: 20 }, { x: 25, y: 45 }, { x: 40, y: 30 },
 * ];
 * // For bubble mode, add a 'size' property to each point:
 * // chart.querySelector('lui-scatter-chart').data = [
 * //   { x: 10, y: 20, size: 15 }, { x: 25, y: 45, size: 30 },
 * // ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the scatter chart ECharts modules (~135 KB gzipped)
import type { LuiScatterChart } from '@lit-ui/charts';
import '@lit-ui/charts/scatter-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiScatterChart);

@customElement('my-scatter-chart')
export class MyScatterChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
    lui-scatter-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiScatterChart>('lui-scatter-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = [
      { x: 10, y: 20 }, { x: 25, y: 45 }, { x: 40, y: 30 },
      { x: 55, y: 70 }, { x: 70, y: 55 }, { x: 85, y: 80 },
      { x: 15, y: 60 }, { x: 30, y: 35 }, { x: 60, y: 90 },
      { x: 75, y: 25 },
    ];
  }

  override render() {
    return html\`
      <lui-scatter-chart
        <!-- Remove the comment below and set bubble to enable size-encoded bubble chart -->
        <!-- bubble -->
        <!-- Add enable-gl for WebGL rendering of 500K+ points (requires echarts-gl) -->
        <!-- enable-gl -->
      ></lui-scatter-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-scatter-chart': MyScatterChart;
  }
}
`;
