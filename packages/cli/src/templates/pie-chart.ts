/**
 * Pie chart component template
 */
export const PIE_CHART_TEMPLATE = `/**
 * my-pie-chart - Pie / donut chart starter
 *
 * Features:
 * - Pie and donut chart with configurable inner radius
 * - Small-slice merging via min-percent (slices below threshold are grouped into "Other")
 * - Center label for total display in donut mode
 * - Real-time streaming via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-pie-chart></my-pie-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-pie-chart');
 * chart.querySelector('lui-pie-chart').data = [
 *   { name: 'Direct', value: 335 },
 *   { name: 'Email', value: 310 },
 *   { name: 'Social', value: 234 },
 *   { name: 'Search', value: 135 },
 *   { name: 'Other', value: 48 },
 * ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the pie chart ECharts modules (~135 KB gzipped)
import type { LuiPieChart } from '@lit-ui/charts';
import '@lit-ui/charts/pie-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiPieChart);

@customElement('my-pie-chart')
export class MyPieChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
    lui-pie-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiPieChart>('lui-pie-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = [
      { name: 'Direct', value: 335 },
      { name: 'Email', value: 310 },
      { name: 'Social', value: 234 },
      { name: 'Search', value: 135 },
      { name: 'Other', value: 48 },
    ];
  }

  override render() {
    return html\`
      <lui-pie-chart
        min-percent="2"
        inner-radius="40%"
        center-label="Total"
      ></lui-pie-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-pie-chart': MyPieChart;
  }
}
`;
