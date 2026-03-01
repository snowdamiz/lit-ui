/**
 * LuiLineChart — Line chart component extending BaseChartElement.
 *
 * LINE-01: Multi-series line chart via `data` prop (array of { name, data[] })
 * LINE-02: smooth, zoom, markLines props for curve interpolation, zoom/pan, threshold lines
 * LINE-03: Real-time streaming via inherited pushData() + appendData path
 *
 * CRITICAL-03 compliance: setOption is called ONLY in _applyData() which is only safe
 * before any appendData streaming has started. After pushData() begins, prop changes
 * to smooth/zoom/markLines will reset the chart (dispose + reinit).
 */

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerLineModules } from './line-registry.js';
import {
  buildLineOption,
  type LineChartSeries,
  type MarkLineSpec,
} from '../shared/line-option-builder.js';

export class LuiLineChart extends BaseChartElement {
  constructor() {
    super();
    // STRM-04: Line chart uses native appendData path for real-time streaming.
    // Base class defaults to 'buffer'; override here per REQUIREMENTS.md STRM-04.
    this._streamingMode = 'appendData';
  }

  // LINE-02: Smooth Catmull-Rom spline interpolation
  @property({ type: Boolean }) smooth = false;

  // LINE-02: DataZoom inside (mouse wheel) + slider (scrubber) — already registered in canvas-core
  @property({ type: Boolean }) zoom = false;

  // LINE-02: Threshold mark lines — { value, label?, color? }[]
  // attribute: false — prevents lossy JSON.parse; set via JS property only
  @property({ attribute: false }) markLines?: MarkLineSpec[];

  protected override async _registerModules(): Promise<void> {
    await registerLineModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option and this.loading
    if (!this._chart) return;
    const lineProps = ['data', 'smooth', 'zoom', 'markLines'] as const;
    if (lineProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  protected override _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildLineOption(
      this.data as LineChartSeries[],
      { smooth: this.smooth, zoom: this.zoom, markLines: this.markLines },
      'line'
    );
    // CRITICAL-03: Only call setOption before streaming starts (before first pushData call).
    // After appendData has run, setOption would wipe streamed data.
    this._chart.setOption(option, { notMerge: false });
  }
}

// Custom element registration — same guard pattern as all other @lit-ui packages
if (typeof customElements !== 'undefined' && !customElements.get('lui-line-chart')) {
  customElements.define('lui-line-chart', LuiLineChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-line-chart': LuiLineChart;
  }
}
