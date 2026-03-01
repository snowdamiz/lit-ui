/**
 * Line chart component template
 */
export const LINE_CHART_TEMPLATE = `/**
 * my-line-chart - Real-time line chart starter
 *
 * Features:
 * - Multi-series line chart with smooth curves
 * - Zoom/pan via DataZoom component
 * - Real-time streaming via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-line-chart></my-line-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-line-chart');
 * chart.querySelector('lui-line-chart').data = [
 *   { name: 'Sales', data: [100, 200, 150, 300, 250, 400, 350] },
 *   { name: 'Revenue', data: [80, 160, 120, 240, 200, 320, 280] },
 * ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the line chart ECharts modules (~135 KB gzipped)
import type { LuiLineChart } from '@lit-ui/charts';
import '@lit-ui/charts/line-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiLineChart);

@customElement('my-line-chart')
export class MyLineChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
    lui-line-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiLineChart>('lui-line-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = [
      { name: 'Sales', data: [100, 200, 150, 300, 250, 400, 350] },
      { name: 'Revenue', data: [80, 160, 120, 240, 200, 320, 280] },
    ];
  }

  override render() {
    return html\`
      <lui-line-chart
        smooth
        zoom
      ></lui-line-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-line-chart': MyLineChart;
  }
}
`;
