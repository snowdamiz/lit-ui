/**
 * LuiAreaChart — Filled area chart component extending BaseChartElement.
 *
 * AREA-01: Filled area chart with `stacked` and `smooth` options
 * AREA-02: Real-time streaming via inherited pushData() + appendData path
 *
 * ECharts design: Area charts are NOT a separate chart type.
 * They are line charts with `areaStyle: {}` on each series.
 * This component reuses registerLineModules() from line-registry.ts
 * and passes mode: 'area' to buildLineOption() for areaStyle injection.
 *
 * CRITICAL-03: same constraint as LuiLineChart — setOption only before streaming.
 */

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerLineModules } from '../line/line-registry.js';
import {
  buildLineOption,
  type LineChartSeries,
} from '../shared/line-option-builder.js';

export class LuiAreaChart extends BaseChartElement {
  constructor() {
    super();
    // STRM-04: Area chart uses native appendData path — same as line chart.
    this._streamingMode = 'appendData';
  }

  // AREA-01: Smooth Catmull-Rom spline interpolation (same as line chart)
  @property({ type: Boolean }) smooth = false;

  // AREA-01: Stack all series with stack: 'total' (string, not boolean — ECharts requirement)
  @property({ type: Boolean }) stacked = false;

  // Zoom/pan controls — DataZoomComponent already registered in canvas-core
  @property({ type: Boolean }) zoom = false;

  protected override async _registerModules(): Promise<void> {
    // Area charts reuse the same ECharts LineChart module — no separate AreaChart in ECharts.
    // The _lineRegistered guard in line-registry.ts prevents double-registration.
    await registerLineModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option and this.loading
    if (!this._chart) return;
    const areaProps = ['data', 'smooth', 'stacked', 'zoom'] as const;
    if (areaProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildLineOption(
      this.data as LineChartSeries[],
      { smooth: this.smooth, stacked: this.stacked, zoom: this.zoom },
      'area'   // triggers areaStyle + opacity 0.6 default in buildLineOption
    );
    // CRITICAL-03: Only safe before streaming starts
    this._chart.setOption(option, { notMerge: false });
  }
}

// Custom element registration — same guard pattern as all other @lit-ui packages
if (typeof customElements !== 'undefined' && !customElements.get('lui-area-chart')) {
  customElements.define('lui-area-chart', LuiAreaChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-area-chart': LuiAreaChart;
  }
}
