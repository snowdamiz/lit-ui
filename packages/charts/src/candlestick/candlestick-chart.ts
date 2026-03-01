/**
 * LuiCandlestickChart — Candlestick chart component extending BaseChartElement.
 *
 * CNDL-01: Bull/bear colors set via bull-color and bear-color HTML attributes
 * CNDL-02: Volume panel shown via show-volume boolean attribute
 * CNDL-03: Moving average overlays configured via moving-averages JSON attribute
 * CNDL-04: Real-time bar streaming via pushData({ label, ohlc, volume })
 *
 * STRM-04 compliance: pushData() is fully overridden — base streaming path is bypassed entirely.
 * The base _streamingMode = 'buffer' default is irrelevant because pushData() never calls super.pushData().
 */

import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { BaseChartElement } from '../base/base-chart-element.js';
import { registerCandlestickModules } from './candlestick-registry.js';
import {
  buildCandlestickOption,
  type CandlestickBarPoint,
  type MAConfig,
} from '../shared/candlestick-option-builder.js';

/**
 * Module-level helper — NOT exported.
 * Parses the raw 'moving-averages' attribute JSON string into MAConfig[].
 * Returns [] if input is null/empty or JSON parse fails.
 */
function _parseMovingAverages(raw: string | null): MAConfig[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export class LuiCandlestickChart extends BaseChartElement {
  // NO constructor override — base _streamingMode = 'buffer' is irrelevant;
  // pushData() is overridden entirely so the base streaming path is never reached.

  // CNDL-01: Bull (rising) candle color — arrives as raw string from HTML (e.g., '#26a69a').
  // No type converter — use bullColor ?? '#default' at call site.
  @property({ attribute: 'bull-color' }) bullColor: string | null = null;

  // CNDL-01: Bear (falling) candle color — arrives as raw string from HTML (e.g., '#ef5350').
  // No type converter — use bearColor ?? '#default' at call site.
  @property({ attribute: 'bear-color' }) bearColor: string | null = null;

  // CNDL-02: Show volume panel below main candlestick grid.
  @property({ type: Boolean, attribute: 'show-volume' }) showVolume = false;

  // CNDL-03: Moving average overlay configs — arrives as JSON string from HTML attribute.
  // No type converter — parsed in _applyData() / _flushBarUpdates() via _parseMovingAverages().
  @property({ attribute: 'moving-averages' }) movingAverages: string | null = null;

  // CNDL-04: Authoritative OHLC bar store — synced from this.data in _applyData();
  // appended to by pushData() for real-time streaming.
  private _ohlcBuffer: CandlestickBarPoint[] = [];

  // Component's own RAF handle — must be cancelled in disconnectedCallback() before super.disconnectedCallback().
  // The BASE CLASS cancels its own _rafId but has no knowledge of _barRafId.
  private _barRafId?: number;

  protected override async _registerModules(): Promise<void> {
    await registerCandlestickModules();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed); // base handles this.option passthrough and this.loading state
    if (!this._chart) return;
    const candlestickProps = ['data', 'bullColor', 'bearColor', 'showVolume', 'movingAverages'] as const;
    if (candlestickProps.some((k) => changed.has(k))) {
      this._applyData();
    }
  }

  private _applyData(): void {
    if (!this._chart) return;
    // Sync _ohlcBuffer from this.data so pushData() starts from current authoritative state.
    this._ohlcBuffer = this.data ? [...(this.data as CandlestickBarPoint[])] : [];
    const option = buildCandlestickOption(this._ohlcBuffer, {
      bullColor: this.bullColor ?? undefined,
      bearColor: this.bearColor ?? undefined,
      showVolume: this.showVolume,
      movingAverages: _parseMovingAverages(this.movingAverages),
    });
    // notMerge: false — merge with any option prop overrides from the base class.
    this._chart.setOption(option, { notMerge: false });
  }

  /**
   * CNDL-04: Real-time bar streaming — overrides base pushData() entirely.
   *
   * Override base implementation — candlestick uses append semantics (new bars), not rolling buffer.
   * NEVER call super.pushData() — it would add the raw point to _circularBuffer and call
   * setOption({ series: [{ data: circularBuffer }] }) on RAF flush, overwriting _ohlcBuffer.
   *
   * Trims _ohlcBuffer to this.maxPoints to prevent unbounded memory growth.
   * Coalesces rapid pushData() calls within the same animation frame via _barRafId RAF handle.
   */
  override pushData(point: unknown): void {
    const bar = point as CandlestickBarPoint;
    this._ohlcBuffer.push(bar);
    // Trim to maxPoints — prevents unbounded memory growth during long streaming sessions.
    if (this._ohlcBuffer.length > this.maxPoints) {
      this._ohlcBuffer = this._ohlcBuffer.slice(-this.maxPoints);
    }
    // Schedule flush — coalesces multiple pushData() calls in the same RAF frame.
    if (this._barRafId === undefined) {
      this._barRafId = requestAnimationFrame(() => {
        this._flushBarUpdates();
        this._barRafId = undefined;
      });
    }
  }

  /**
   * Flush buffered bar updates to ECharts in a single setOption call.
   *
   * Uses lazyUpdate: true (not notMerge: false) for streaming flush — preserves DataZoom state
   * while batching the update to the next render cycle.
   */
  private _flushBarUpdates(): void {
    if (!this._chart || this._ohlcBuffer.length === 0) return;
    const option = buildCandlestickOption(this._ohlcBuffer, {
      bullColor: this.bullColor ?? undefined,
      bearColor: this.bearColor ?? undefined,
      showVolume: this.showVolume,
      movingAverages: _parseMovingAverages(this.movingAverages),
    });
    // lazyUpdate: true — preserves DataZoom state while batching update to next render cycle.
    this._chart.setOption(option, { lazyUpdate: true } as object);
  }

  /**
   * Cancel component's own RAF before base class disposes the chart.
   * Base class cancels its own _rafId but has no knowledge of _barRafId.
   * Failing to cancel causes post-disposal setOption errors.
   */
  override disconnectedCallback(): void {
    // Cancel component's own RAF before base class disposes the chart.
    if (this._barRafId !== undefined) {
      cancelAnimationFrame(this._barRafId);
      this._barRafId = undefined;
    }
    super.disconnectedCallback();
  }
}

// Custom element registration — same guard pattern as all other chart components.
if (typeof customElements !== 'undefined' && !customElements.get('lui-candlestick-chart')) {
  customElements.define('lui-candlestick-chart', LuiCandlestickChart);
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-candlestick-chart': LuiCandlestickChart;
  }
}
