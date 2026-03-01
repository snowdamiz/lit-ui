/**
 * Candlestick chart component template
 */
export const CANDLESTICK_CHART_TEMPLATE = `/**
 * my-candlestick-chart - OHLC candlestick chart starter
 *
 * Features:
 * - Candlestick chart with optional volume panel
 * - SMA/EMA moving average overlays via moving-averages prop
 * - Configurable bull/bear colors
 * - Real-time bar streaming via pushData()
 * - CSS token theming (inherits from @lit-ui/core theme)
 *
 * IMPORTANT: OhlcBar data order is [open, close, low, high] — NOT the OHLC acronym order.
 * This is the order ECharts expects internally.
 *
 * Data is set via the .data JS property (NOT an HTML attribute).
 *
 * @example
 * \\\`\\\`\\\`html
 * <my-candlestick-chart></my-candlestick-chart>
 * \\\`\\\`\\\`
 * \\\`\\\`\\\`js
 * const chart = document.querySelector('my-candlestick-chart');
 * chart.querySelector('lui-candlestick-chart').data = [
 *   // Each bar: [open, close, low, high] — NOT OHLC acronym order!
 *   { date: '2024-01-01', bar: [100, 110, 95, 115] },
 *   { date: '2024-01-02', bar: [110, 105, 98, 118] },
 * ];
 * \\\`\\\`\\\`
 */

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Subpath import — tree-shakes to only the candlestick chart ECharts modules (~135 KB gzipped)
import type { LuiCandlestickChart } from '@lit-ui/charts';
import '@lit-ui/charts/candlestick-chart';
// Ensure the side effect (custom element registration) is retained by bundlers
void (null as unknown as typeof LuiCandlestickChart);

@customElement('my-candlestick-chart')
export class MyCandlestickChart extends LitElement {
  static override styles = css\`
    :host {
      display: block;
      width: 100%;
      height: 500px;
    }
    lui-candlestick-chart {
      width: 100%;
      height: 100%;
    }
  \`;

  override firstUpdated() {
    const chart = this.shadowRoot!.querySelector<LuiCandlestickChart>('lui-candlestick-chart')!;

    // Set data via JS property — HTML attributes cannot carry complex objects
    // Bar array order: [open, close, low, high] — NOT OHLC acronym order!
    chart.data = [
      { date: '2024-01-01', bar: [100.00, 110.50, 95.00, 115.00] },
      { date: '2024-01-02', bar: [110.50, 105.25, 98.00, 118.00] },
      { date: '2024-01-03', bar: [105.25, 115.75, 102.00, 120.00] },
      { date: '2024-01-04', bar: [115.75, 108.00, 104.00, 119.00] },
      { date: '2024-01-05', bar: [108.00, 122.50, 106.00, 125.00] },
    ];
  }

  override render() {
    return html\`
      <lui-candlestick-chart
        bull-color="#26a69a"
        bear-color="#ef5350"
        show-volume
      ></lui-candlestick-chart>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-candlestick-chart': MyCandlestickChart;
  }
}
`;
