/**
 * Bar chart component template
 */
export const BAR_CHART_TEMPLATE = `/**
 * my-bar-chart - Grouped/stacked bar chart starter
 *
 * Features:
 * - Grouped, stacked, and horizontal bar chart
 * - Value labels displayed on bars
 * - Color-by-data mode for per-bar colors
 * - Real-time streaming via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-bar-chart></my-bar-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-bar-chart');
 * chart.querySelector('lui-bar-chart').data = {
 *   categories: ['Q1', 'Q2', 'Q3', 'Q4'],
 *   series: [
 *     { name: 'Product A', data: [120, 200, 150, 300] },
 *     { name: 'Product B', data: [80, 160, 100, 220] },
 *   ],
 * };
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the bar chart ECharts modules (~135 KB gzipped)
import type { LuiBarChart } from '@lit-ui/charts';
import '@lit-ui/charts/bar-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiBarChart);

@customElement('my-bar-chart')
export class MyBarChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
    lui-bar-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiBarChart>('lui-bar-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = {
      categories: ['Q1', 'Q2', 'Q3', 'Q4'],
      series: [
        { name: 'Product A', data: [120, 200, 150, 300] },
        { name: 'Product B', data: [80, 160, 100, 220] },
      ],
    };
  }

  override render() {
    return html\`
      <lui-bar-chart
        show-labels
      ></lui-bar-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-bar-chart': MyBarChart;
  }
}
`;
