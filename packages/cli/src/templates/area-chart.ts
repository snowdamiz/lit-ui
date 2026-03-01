/**
 * Area chart component template
 */
export const AREA_CHART_TEMPLATE = `/**
 * my-area-chart - Filled area chart starter
 *
 * Features:
 * - Multi-series filled area chart with smooth curves
 * - Stacked mode for cumulative area visualization
 * - Real-time streaming via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-area-chart></my-area-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-area-chart');
 * chart.querySelector('lui-area-chart').data = [
 *   { name: 'Downloads', data: [120, 200, 150, 300, 250, 400, 350] },
 *   { name: 'Uploads', data: [60, 100, 75, 150, 125, 200, 175] },
 * ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the area chart ECharts modules (~135 KB gzipped)
import type { LuiAreaChart } from '@lit-ui/charts';
import '@lit-ui/charts/area-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiAreaChart);

@customElement('my-area-chart')
export class MyAreaChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
    lui-area-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiAreaChart>('lui-area-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = [
      { name: 'Downloads', data: [120, 200, 150, 300, 250, 400, 350] },
      { name: 'Uploads', data: [60, 100, 75, 150, 125, 200, 175] },
    ];
  }

  override render() {
    return html\`
      <lui-area-chart
        smooth
        stacked
      ></lui-area-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-area-chart': MyAreaChart;
  }
}
`;
