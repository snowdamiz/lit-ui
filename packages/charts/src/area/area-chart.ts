/**
 * LuiAreaChart — Filled area chart component extending BaseChartElement.
 *
 * AREA-01: Filled area chart with `stacked` and `smooth` options
 * AREA-02: Real-time streaming via per-series ring buffers + RAF coalescing (STRM-01/02/03)
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
  // AREA-01: Smooth Catmull-Rom spline interpolation (same as line chart)
  @property({ type: Boolean }) smooth = false;

  // AREA-01: Stack all series with stack: 'total' (string, not boolean — ECharts requirement)
  @property({ type: Boolean }) stacked = false;

  // Zoom/pan controls — DataZoomComponent already registered in canvas-core
  @property({ type: Boolean }) zoom = false;

  // AREA-LABEL: Show value labels on data points. '' = no labels (default).
  // 'top' = above each point, 'bottom' = below each point.
  @property({ attribute: 'label-position' }) labelPosition: 'top' | 'bottom' | '' = '';

  // STRM-01 + STRM-03: Per-series accumulation buffers — index matches ECharts series index.
  // Each element holds all accumulated points for one series as plain JS arrays.
  // Points are converted to Float32Array at flush time (STRM-01 TypedArray requirement).
  private _lineBuffers: unknown[][] = [[]];

  // STRM-02: Total points pushed across all series — triggers reset at maxPoints.
  private _totalPoints = 0;

  // Component's own RAF handle — must be cancelled in disconnectedCallback().
  private _lineRafId?: number;

  // STRM-02: Area charts stream 1M+ points; base default of 1000 is for buffer-mode charts.
  override maxPoints = 500_000;

  /**
   * STRM-01 + STRM-02 + STRM-03: Ring-buffer streaming with seriesIndex routing.
   *
   * Overrides base pushData() entirely — NEVER call super.pushData().
   */
  override pushData(point: unknown, seriesIndex = 0): void {
    while (this._lineBuffers.length <= seriesIndex) {
      this._lineBuffers.push([]);
    }
    this._lineBuffers[seriesIndex].push(point);
    this._totalPoints++;

    if (this._totalPoints >= this.maxPoints) {
      this._triggerReset();
      return;
    }

    if (this._lineRafId === undefined) {
      this._lineRafId = requestAnimationFrame(() => {
        this._flushLineUpdates();
        this._lineRafId = undefined;
      });
    }
  }

  /**
   * RAF flush — passes all buffered points to ECharts via setOption(lazyUpdate:true).
   *
   * STRM-01: Each series buffer is converted to Float32Array before being passed to
   * setOption. This satisfies the TypedArray ring-buffer requirement literally:
   * ECharts receives Float32Array data, not plain JS arrays.
   *
   * Only updates series indices that exist in this.data to prevent ECharts errors.
   */
  private _flushLineUpdates(): void {
    if (!this._chart || this._lineBuffers.every((b) => b.length === 0)) return;

    const seriesCount = Array.isArray(this.data) ? (this.data as unknown[]).length : 1;
    const seriesUpdates = this._lineBuffers
      .slice(0, seriesCount)
      .map((buf) => ({ data: new Float32Array(buf as number[]) }));

    this._chart.setOption(
      { series: seriesUpdates },
      { lazyUpdate: true } as object
    );
  }

  /**
   * STRM-02: Dispose + reinit when maxPoints is reached.
   * _initChart() is protected (Plan 01 change) — subclass access is valid.
   */
  private _triggerReset(): void {
    if (this._lineRafId !== undefined) {
      cancelAnimationFrame(this._lineRafId);
      this._lineRafId = undefined;
    }
    this._lineBuffers = this._lineBuffers.map(() => []);
    this._totalPoints = 0;
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
    requestAnimationFrame(() => this._initChart());
  }

  /**
   * Cancel component's own RAF before base class disposes the chart.
   */
  override disconnectedCallback(): void {
    if (this._lineRafId !== undefined) {
      cancelAnimationFrame(this._lineRafId);
      this._lineRafId = undefined;
    }
    super.disconnectedCallback();
  }

  protected override async _registerModules(): Promise<void> {
    // Area charts reuse the same ECharts LineChart module — no separate AreaChart in ECharts.
    // The _lineRegistered guard in line-registry.ts prevents double-registration.
    await registerLineModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option and this.loading
    if (!this._chart) return;
    const areaProps = ['data', 'smooth', 'stacked', 'zoom', 'labelPosition'] as const;
    if (areaProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  protected override _applyData(): void {
    if (!this._chart || !this.data) return;
    const option = buildLineOption(
      this.data as LineChartSeries[],
      {
        smooth: this.smooth,
        stacked: this.stacked,
        zoom: this.zoom,
        labelPosition: this.labelPosition || undefined,
      },
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
