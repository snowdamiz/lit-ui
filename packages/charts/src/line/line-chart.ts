/**
 * LuiLineChart — Line chart component extending BaseChartElement.
 *
 * LINE-01: Multi-series line chart via `data` prop (array of { name, data[] })
 * LINE-02: smooth, zoom, markLines props for curve interpolation, zoom/pan, threshold lines
 * LINE-03: Real-time streaming via pushData() override with per-series ring buffers + RAF coalescing
 *
 * STRM-01: Each series buffer converted to Float32Array before setOption (TypedArray requirement).
 * STRM-02: maxPoints-triggered dispose+reinit prevents unbounded memory growth.
 * STRM-03: seriesIndex routing in pushData(point, seriesIndex?) for multi-series streaming.
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
  // LINE-02: Smooth Catmull-Rom spline interpolation
  @property({ type: Boolean }) smooth = false;

  // LINE-02: DataZoom inside (mouse wheel) + slider (scrubber) — already registered in canvas-core
  @property({ type: Boolean }) zoom = false;

  // LINE-02: Threshold mark lines — { value, label?, color? }[]
  // attribute: false — prevents lossy JSON.parse; set via JS property only
  @property({ attribute: false }) markLines?: MarkLineSpec[];

  // STRM-01 + STRM-03: Per-series accumulation buffers — index matches ECharts series index.
  // Each element holds all accumulated points for one series as plain JS arrays.
  // Points are converted to Float32Array at flush time (STRM-01 TypedArray requirement).
  private _lineBuffers: unknown[][] = [[]];

  // STRM-02: Total points pushed across all series — triggers reset at maxPoints.
  private _totalPoints = 0;

  // Component's own RAF handle — must be cancelled in disconnectedCallback().
  // Base class cancels its own _rafId but has no knowledge of _lineRafId.
  private _lineRafId?: number;

  // STRM-02: Line/Area charts stream 1M+ points; base default of 1000 is for buffer-mode charts.
  // Override to 500_000 — allows ~8 minutes of streaming at 1000 pts/sec before reset.
  override maxPoints = 500_000;

  /**
   * STRM-01 + STRM-02 + STRM-03: Ring-buffer streaming with seriesIndex routing.
   *
   * Overrides base pushData() entirely — NEVER call super.pushData().
   * super.pushData() routes to the base _pendingData accumulator which feeds the
   * appendData/buffer path — that path is bypassed entirely in Line/Area charts.
   *
   * Points are accumulated per-series and flushed once per RAF via _flushLineUpdates().
   * When _totalPoints >= maxPoints, the chart disposes and reinitializes (STRM-02).
   */
  override pushData(point: unknown, seriesIndex = 0): void {
    // Grow buffer array on demand to accommodate the requested seriesIndex.
    while (this._lineBuffers.length <= seriesIndex) {
      this._lineBuffers.push([]);
    }
    this._lineBuffers[seriesIndex].push(point);
    this._totalPoints++;

    // STRM-02: Truncation — dispose+reinit when total points reach maxPoints.
    if (this._totalPoints >= this.maxPoints) {
      this._triggerReset();
      return;
    }

    // Schedule RAF flush — coalesces multiple pushData() calls in one frame.
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
   * lazyUpdate:true batches the render and preserves DataZoom state without
   * triggering a full re-render per call.
   *
   * Only updates series indices that exist in this.data to prevent ECharts from
   * receiving a seriesIndex referencing a series that was never registered.
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
   *
   * dispose+reinit (not chart.clear()) is the officially recommended full-reset path.
   * chart.clear() leaves residue in ECharts 5.6. dispose() + _initChart() is clean.
   *
   * _initChart() is protected (Plan 01 change) — subclass access is valid.
   * The reinit is async (awaits module registration) — wrap in RAF to avoid blocking.
   */
  private _triggerReset(): void {
    // 1. Cancel pending RAF — nothing to flush into a chart that's being disposed.
    if (this._lineRafId !== undefined) {
      cancelAnimationFrame(this._lineRafId);
      this._lineRafId = undefined;
    }
    // 2. Clear all buffers and reset counter — fresh start after reinit.
    this._lineBuffers = this._lineBuffers.map(() => []);
    this._totalPoints = 0;
    // 3. Dispose current ECharts instance.
    //    Set _chart = null immediately — disconnectedCallback() guards on null.
    if (this._chart) {
      this._chart.dispose();
      this._chart = null;
    }
    // 4. Reinit in next frame — _initChart() awaits _registerModules() internally.
    requestAnimationFrame(() => this._initChart());
  }

  /**
   * Cancel component's own RAF before base class disposes the chart.
   * Base class cancels its own _rafId but has no knowledge of _lineRafId.
   * Failing to cancel causes a setOption call on a disposed chart instance.
   */
  override disconnectedCallback(): void {
    if (this._lineRafId !== undefined) {
      cancelAnimationFrame(this._lineRafId);
      this._lineRafId = undefined;
    }
    super.disconnectedCallback();
  }

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
    // CRITICAL-03: setOption is called here for initial/prop-change renders only.
    // After streaming starts (pushData calls), _flushLineUpdates() handles updates
    // via lazyUpdate:true to avoid clobbering buffered data.
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
