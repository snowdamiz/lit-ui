/// <reference types="@webgpu/types" />
/**
 * WebGPU Device Singleton — WEBGPU-03
 *
 * All chart instances share one GPUDevice to stay within browser device count limits.
 * Pattern mirrors canvas-core.ts's `let _registered = false` guard.
 *
 * Lifecycle:
 * - acquireGpuDevice(): called from BaseChartElement._detectRenderer() when WebGPU is available
 * - getGpuDevice(): called by Phase 101 renderer to obtain the shared device
 * - releaseGpuDevice(): called by Phase 101 disconnectedCallback() cleanup (stub in Phase 98)
 *
 * CRITICAL: Do NOT call requestDevice() more than once on the same GPUAdapter.
 * The WebGPU spec marks an adapter as "consumed" after its first requestDevice() call.
 * This module caches the Promise<GPUDevice> — not the adapter — so subsequent
 * acquireGpuDevice() calls with different adapters safely return the cached promise.
 */

/** Active renderer tier — set on BaseChartElement.renderer after detection. */
export type RendererTier = 'webgpu' | 'webgl' | 'canvas';

declare global {
  interface HTMLElementEventMap {
    /**
     * WEBGPU-01: Fired by every chart instance during firstUpdated() once the
     * renderer tier has been determined. detail.renderer is one of RendererTier.
     * Always read renderer from this event — do not poll .renderer synchronously
     * before the event fires (the async GPU probe may not have resolved yet).
     */
    'renderer-selected': CustomEvent<{ renderer: RendererTier }>;
    /** Existing event — redeclared here for completeness alongside renderer-selected. */
    'webgl-unavailable': CustomEvent<{ reason: string }>;
  }
}

let _devicePromise: Promise<GPUDevice> | null = null;

/**
 * WEBGPU-03: Acquire or reuse the page-scoped GPUDevice singleton.
 *
 * First call: calls adapter.requestDevice() and caches the Promise.
 * Subsequent calls: ignore the adapter argument and return the cached Promise.
 *
 * The adapter argument is only used on the first call. This means:
 * - Multiple chart instances each pass their own adapter
 * - Only the first adapter is ever used to create the device
 * - Subsequent adapters are discarded (they are NOT consumed by requestDevice)
 *
 * @param adapter - GPUAdapter obtained from navigator.gpu.requestAdapter()
 */
export async function acquireGpuDevice(adapter: GPUAdapter): Promise<GPUDevice> {
  if (_devicePromise) return _devicePromise;
  // First call only — do NOT call requestDevice() again on any adapter
  _devicePromise = adapter.requestDevice();
  return _devicePromise;
}

/**
 * Returns the cached GPUDevice promise without creating one.
 * Returns null if acquireGpuDevice() has not been called yet.
 * Used by Phase 101 to access the shared device for WebGPU rendering.
 */
export function getGpuDevice(): Promise<GPUDevice> | null {
  return _devicePromise;
}

/**
 * Resets the singleton so a new GPUDevice can be acquired on the next call.
 * Called by Phase 101's disconnectedCallback() cleanup when the last chart
 * instance is removed from the DOM (device.destroy() is Phase 101's responsibility).
 * Phase 98 exposes this stub — Phase 101 wires the actual teardown.
 */
export function releaseGpuDevice(): void {
  _devicePromise = null;
}
