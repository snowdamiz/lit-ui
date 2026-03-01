/**
 * Treemap chart component template
 */
export const TREEMAP_CHART_TEMPLATE = `/**
 * my-treemap-chart - Hierarchical treemap starter
 *
 * Features:
 * - Hierarchical treemap with drill-down navigation
 * - Breadcrumb trail for navigation context (enabled by default)
 * - Rounded cells for softer visual style
 * - Per-level color arrays for visual depth
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-treemap-chart></my-treemap-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-treemap-chart');
 * chart.querySelector('lui-treemap-chart').data = [
 *   {
 *     name: 'Category A',
 *     value: 500,
 *     children: [
 *       { name: 'Item A1', value: 300 },
 *       { name: 'Item A2', value: 200 },
 *     ],
 *   },
 * ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the treemap chart ECharts modules (~135 KB gzipped)
import type { LuiTreemapChart } from '@lit-ui/charts';
import '@lit-ui/charts/treemap-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiTreemapChart);

@customElement('my-treemap-chart')
export class MyTreemapChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 500px;
    }
    lui-treemap-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiTreemapChart>('lui-treemap-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    chart.data = [
      {
        name: 'Frontend',
        value: 800,
        children: [
          { name: 'React', value: 450 },
          { name: 'Vue', value: 350 },
        ],
      },
      {
        name: 'Backend',
        value: 600,
        children: [
          { name: 'Node.js', value: 380 },
          { name: 'Python', value: 220 },
        ],
      },
    ];
  }

  override render() {
    return html\`
      <lui-treemap-chart
        breadcrumb
        rounded
      ></lui-treemap-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-treemap-chart': MyTreemapChart;
  }
}
`;
