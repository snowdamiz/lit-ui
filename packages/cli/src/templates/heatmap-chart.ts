/**
 * Heatmap chart component template
 */
export const HEATMAP_CHART_TEMPLATE = `/**
 * my-heatmap-chart - Cartesian heatmap starter
 *
 * Features:
 * - Cartesian heatmap with configurable x/y category axes
 * - VisualMap continuous color scale
 * - Real-time cell updates via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 * x-categories and y-categories are set as HTML attributes (string arrays via JSON).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-heatmap-chart></my-heatmap-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-heatmap-chart');
 * const lui = chart.querySelector('lui-heatmap-chart');
 * lui.xCategories = ['Mon', 'Tue', 'Wed'];
 * lui.yCategories = ['Morning', 'Afternoon', 'Evening'];
 * lui.data = [
 *   { x: 0, y: 0, value: 82 }, { x: 1, y: 0, value: 45 }, { x: 2, y: 0, value: 73 },
 *   { x: 0, y: 1, value: 61 }, { x: 1, y: 1, value: 88 }, { x: 2, y: 1, value: 34 },
 *   { x: 0, y: 2, value: 29 }, { x: 1, y: 2, value: 56 }, { x: 2, y: 2, value: 91 },
 * ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the heatmap chart ECharts modules (~135 KB gzipped)
import type { LuiHeatmapChart } from '@lit-ui/charts';
import '@lit-ui/charts/heatmap-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiHeatmapChart);

@customElement('my-heatmap-chart')
export class MyHeatmapChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 400px;
    }
    lui-heatmap-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiHeatmapChart>('lui-heatmap-chart')!;

    // Categories are reactive properties — set before data
    chart.xCategories = ['Mon', 'Tue', 'Wed'];
    chart.yCategories = ['Morning', 'Afternoon', 'Evening'];

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = [
      { x: 0, y: 0, value: 82 }, { x: 1, y: 0, value: 45 }, { x: 2, y: 0, value: 73 },
      { x: 0, y: 1, value: 61 }, { x: 1, y: 1, value: 88 }, { x: 2, y: 1, value: 34 },
      { x: 0, y: 2, value: 29 }, { x: 1, y: 2, value: 56 }, { x: 2, y: 2, value: 91 },
    ];
  }

  override render() {
    return html\`
      <lui-heatmap-chart></lui-heatmap-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-heatmap-chart': MyHeatmapChart;
  }
}
`;
