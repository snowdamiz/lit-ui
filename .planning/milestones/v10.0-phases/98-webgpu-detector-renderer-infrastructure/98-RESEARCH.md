# Phase 98: WebGPU Detector + Renderer Infrastructure - Research

**Researched:** 2026-03-01
**Domain:** WebGPU detection, GPUDevice singleton, SSR-safe browser API guards, Lit custom event dispatch
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEBGPU-01 | All chart types auto-detect WebGPU availability via `navigator.gpu` (SSR-safe, inside `firstUpdated()`) and expose a `renderer-selected` custom event and `renderer` readable property with the active renderer tier | WebGPU detection pattern verified via MDN; SSR guard pattern matches existing `isServer` + `firstUpdated()` pattern in BaseChartElement; `dispatchCustomEvent` from `@lit-ui/core` is the established event dispatch mechanism |
| WEBGPU-03 | All WebGPU chart instances on a page share a single GPUDevice singleton to stay within browser device count limits | Module-level singleton pattern confirmed by W3C WebGPU spec and MDN; `canvas-core.ts` already establishes this exact pattern for ECharts module registration (`let _registered = false`) — GPUDevice singleton mirrors it exactly |
</phase_requirements>

---

## Summary

Phase 98 adds two capabilities to `BaseChartElement` and all 8 concrete chart classes: (1) runtime detection of WebGPU/WebGL/Canvas availability with a `renderer` property and `renderer-selected` event, and (2) a page-scoped `GPUDevice` singleton so 10 simultaneous chart instances share one GPU logical device. No actual WebGPU rendering occurs in this phase — that is Phase 101. This phase only wires the detection and singleton infrastructure that Phase 101 will consume.

The existing codebase has solved the same problems for WebGL: `_maybeLoadGl()` in BaseChartElement probes WebGL with a canvas context test, `_webglUnavailable` is a protected flag on the base class, and the echarts-gl guard uses the identical `isServer` + `firstUpdated()` pattern. The WebGPU detector follows exactly the same shape, replacing the canvas WebGL probe with `navigator.gpu` + `requestAdapter()`. The GPUDevice singleton mirrors `canvas-core.ts`'s `let _registered = false` guard — a module-level variable that is initialized once and shared across all imports.

SSR safety is the main engineering constraint. `navigator` does not exist in Node.js (Next.js App Router SSR), so any reference to `navigator.gpu` at module load time or in the constructor will throw `ReferenceError: navigator is not defined`. The project already uses Lit's `isServer` from `lit` and defers all browser API access to `firstUpdated()` — the WebGPU detector must follow the identical deferral.

**Primary recommendation:** Add a `webgpu-device.ts` singleton module and a `_detectRenderer()` method to `BaseChartElement` that runs inside `firstUpdated()`, sets `this.renderer`, and fires `renderer-selected` via `dispatchCustomEvent`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@webgpu/types` | 0.1.67 | TypeScript type definitions for `navigator.gpu`, `GPUAdapter`, `GPUDevice`, `GPUAdapterInfo` | Official W3C-maintained package; 1.78M weekly downloads; required because `lib: dom` in TypeScript 5.x does not yet include WebGPU types |
| `lit` (existing) | ^3.3.2 | `isServer` SSR guard, `firstUpdated()` lifecycle, `@property()` decorator | Already a peer dep; `isServer` is the established pattern in this codebase |
| `@lit-ui/core` (existing) | ^1.0.0 | `dispatchCustomEvent()` utility | Already used in BaseChartElement for `webgl-unavailable` event |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@webgpu/types` | 0.1.67 | TypeScript ambient types only — zero runtime code | Always install as devDependency; configure in `tsconfig.json` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@webgpu/types` devDep | `lib: ["DOM", "DOM.Iterable", "WebGPU"]` in tsconfig | TypeScript 5.8+ includes WebGPU in `dom` lib but this project targets broader TS compatibility; `@webgpu/types` is the cross-version safe choice |
| Module-level singleton | Per-component `GPUDevice` | Per-component devices are fully isolated but multiply device count; spec warns against exceeding limits; singleton is the spec-recommended pattern for multi-component pages |

**Installation:**
```bash
pnpm add -D @webgpu/types --filter @lit-ui/charts
```

---

## Architecture Patterns

### Recommended Project Structure

```
packages/charts/src/
├── base/
│   ├── base-chart-element.ts      # Add: _detectRenderer(), renderer property, enable-webgpu attribute
│   └── theme-bridge.ts            # No changes
├── shared/
│   └── webgpu-device.ts           # NEW: GPUDevice singleton module
└── registry/
    └── canvas-core.ts             # No changes
```

### Pattern 1: WebGPU Detection in `firstUpdated()`

**What:** A protected async method `_detectRenderer()` runs inside `firstUpdated()` after `isServer` guard. It probes `navigator.gpu`, calls `requestAdapter()`, and sets `this.renderer` to `'webgpu'`, `'webgl'`, or `'canvas'`. Then fires `renderer-selected` custom event.

**When to use:** Always — runs unconditionally for every chart instance. Detection is cheap (async probe, no GPU work) and must happen before Phase 101's rendering path diverges.

**Example:**
```typescript
// Source: MDN navigator.gpu, Lit isServer pattern from BaseChartElement
import { isServer } from 'lit';
import { dispatchCustomEvent } from '@lit-ui/core';

export type RendererTier = 'webgpu' | 'webgl' | 'canvas';

// In BaseChartElement:
@property({ type: Boolean, attribute: 'enable-webgpu' }) enableWebGpu = false;

/** WEBGPU-01: Active renderer tier — readable after firstUpdated(). */
renderer: RendererTier = 'canvas';

override async firstUpdated(_changed: PropertyValues): Promise<void> {
  if (isServer) return;
  await this.updateComplete;
  await this._detectRenderer();    // WEBGPU-01: detect BEFORE _maybeLoadGl
  await this._maybeLoadGl();
  requestAnimationFrame(() => this._initChart());
}

protected async _detectRenderer(): Promise<void> {
  if (!this.enableWebGpu) {
    // WebGPU not opted-in — fast path to WebGL/Canvas detection
    this.renderer = this._isWebGLSupported() ? 'webgl' : 'canvas';
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
    return;
  }

  // navigator.gpu check — SSR-safe because we are inside firstUpdated()
  // which never runs on the server (Lit lifecycle guarantee)
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    this.renderer = this._isWebGLSupported() ? 'webgl' : 'canvas';
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    this.renderer = this._isWebGLSupported() ? 'webgl' : 'canvas';
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
    return;
  }

  // Successfully acquired adapter — WebGPU is available
  // Acquire or reuse the singleton GPUDevice
  await acquireGpuDevice(adapter);
  this.renderer = 'webgpu';
  dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
}
```

### Pattern 2: GPUDevice Singleton Module

**What:** A module-level variable holds the singleton `GPUDevice` promise. All chart instances import and await `acquireGpuDevice()`. The function is idempotent — first call creates, subsequent calls return the cached promise.

**When to use:** Every chart instance that detected `'webgpu'` calls `acquireGpuDevice()`. Phase 101 also calls it to get the shared device for rendering.

**Example:**
```typescript
// Source: canvas-core.ts singleton pattern (existing codebase) + MDN GPUAdapter.requestDevice()
// packages/charts/src/shared/webgpu-device.ts

let _devicePromise: Promise<GPUDevice> | null = null;

/**
 * WEBGPU-03: Acquire or reuse the page-scoped GPUDevice singleton.
 *
 * All chart instances share one GPUDevice to stay within browser device count limits.
 * The adapter argument is only used on the FIRST call; subsequent calls ignore it.
 * Pattern mirrors canvas-core.ts's `let _registered = false` guard.
 *
 * @param adapter - GPUAdapter from navigator.gpu.requestAdapter()
 */
export async function acquireGpuDevice(adapter: GPUAdapter): Promise<GPUDevice> {
  if (_devicePromise) return _devicePromise;
  _devicePromise = adapter.requestDevice();
  return _devicePromise;
}

/**
 * Returns the cached device without creating one.
 * Returns null if acquireGpuDevice() has not been called yet.
 */
export function getGpuDevice(): Promise<GPUDevice> | null {
  return _devicePromise;
}

/**
 * Called during disconnectedCallback() of the LAST chart instance.
 * Phase 101 responsibility — not needed in Phase 98.
 * Exposed here so Phase 101 can call it without touching this module.
 */
export function releaseGpuDevice(): void {
  _devicePromise = null;
}
```

### Pattern 3: `enable-webgpu` Attribute Gate

**What:** WebGPU detection only happens when `enable-webgpu` boolean attribute is set on the element. Without the attribute, the detector fast-paths to WebGL/Canvas. This mirrors `enable-gl` for echarts-gl.

**When to use:** Always — opt-in gating prevents WebGPU init overhead on pages that don't need it.

```html
<!-- Opt in to WebGPU rendering -->
<lui-line-chart enable-webgpu></lui-line-chart>

<!-- No WebGPU (default) — uses Canvas -->
<lui-line-chart></lui-line-chart>
```

### Anti-Patterns to Avoid

- **Accessing `navigator.gpu` at module top level or in the constructor:** Throws `ReferenceError: navigator is not defined` in Node.js/Next.js SSR. Must only be accessed inside `firstUpdated()` or a method called from it.
- **Calling `requestAdapter()` without checking `navigator.gpu` first:** `navigator.gpu` is `undefined` on unsupported browsers; calling `.requestAdapter()` on `undefined` throws instead of returning `null`.
- **Creating a `GPUDevice` per chart instance:** Each `GPUAdapter.requestDevice()` call creates a new logical device. Browsers enforce device count limits; silently returns a lost device when exceeded.
- **Calling `requestDevice()` twice on the same `GPUAdapter`:** The second call throws `OperationError` — the adapter is consumed after first use. Use the singleton pattern.
- **Treating `requestAdapter()` null as an error:** `requestAdapter()` returns `null` (not throws) when no adapter is available. Correct handling is: `if (!adapter) { fallback to canvas; return; }`.
- **Checking `isFallbackAdapter` on `GPUAdapter` directly:** This property was removed from `GPUAdapter`. Use `GPUAdapterInfo.isFallbackAdapter` via `adapter.requestAdapterInfo()`. For Phase 98, skip the fallback check entirely — just use `null` check on the adapter.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebGPU TypeScript types | Declaring `interface Navigator { gpu: GPU }` manually | `@webgpu/types` devDep | Official W3C types; updated with every spec revision; manually-declared types drift from reality |
| SSR guard for `navigator` | `typeof window !== 'undefined'` checks | Lit's `isServer` (already imported) | `isServer` is the established project pattern; consistent with existing `_maybeLoadGl()` code |
| Custom event dispatch | `new CustomEvent(...)` + `dispatchEvent()` inline | `dispatchCustomEvent()` from `@lit-ui/core` | Already used in BaseChartElement; provides `bubbles: true, composed: true` defaults; typed |

**Key insight:** The GPUDevice singleton pattern is structurally identical to `canvas-core.ts`'s `_registered` flag — one module-level variable, initialized once, shared across all consumers. No new patterns needed.

---

## Common Pitfalls

### Pitfall 1: SSR Crash on `navigator.gpu`

**What goes wrong:** `ReferenceError: navigator is not defined` during Next.js App Router build/render.
**Why it happens:** `navigator` is a browser global. Node.js does not have it. Accessing `navigator.gpu` at module evaluation time (top-level) or in the Lit constructor causes SSR to crash.
**How to avoid:** Only access `navigator.gpu` inside `firstUpdated()` (never runs on server) or behind `if (isServer) return`. The existing `_maybeLoadGl()` function uses `typeof window === 'undefined'` — the WebGPU detector should use `isServer` (the project-standard approach) AND stay inside `firstUpdated()` for belt-and-suspenders protection.
**Warning signs:** Build error mentioning `navigator is not defined`; SSR smoke test fails.

### Pitfall 2: `requestAdapter()` Returns `null` Silently

**What goes wrong:** `adapter.requestDevice()` throws `TypeError: Cannot read properties of null` because `requestAdapter()` returned `null`.
**Why it happens:** `requestAdapter()` resolves to `null` (not rejects) when no GPU adapter is available — e.g., hardware acceleration disabled, unsupported platform, GPU process crashed. Forgetting the null check causes a downstream crash.
**How to avoid:** Always check `if (!adapter)` and fall back to WebGL/Canvas.
**Warning signs:** Uncaught TypeError in production; chart broken on users with disabled GPU acceleration.

### Pitfall 3: Multiple GPUDevices From One Adapter

**What goes wrong:** Second `requestDevice()` call on the same `GPUAdapter` throws `OperationError: The adapter is consumed`.
**Why it happens:** The WebGPU spec marks an adapter as "consumed" after its first `requestDevice()` call. Multiple chart instances each calling `navigator.gpu.requestAdapter()` → `requestDevice()` independently will each get a separate adapter and could attempt to call `requestDevice()` on the same adapter if they share a reference.
**How to avoid:** The `acquireGpuDevice()` singleton caches the `Promise<GPUDevice>` — not the adapter. Multiple chart instances call `acquireGpuDevice(theirOwnAdapter)` but only the first adapter is ever used; subsequent calls return the cached promise. This avoids the double-requestDevice pitfall.
**Warning signs:** `OperationError` in console on pages with multiple WebGPU charts.

### Pitfall 4: `renderer` Property Reads Before `firstUpdated()`

**What goes wrong:** `document.querySelector('lui-line-chart').renderer` returns `'canvas'` even on a WebGPU-capable browser because the property was read before `firstUpdated()` completed.
**Why it happens:** `renderer` defaults to `'canvas'` (the safe fallback). Detection is async — it requires `requestAdapter()` which is a Promise. If caller reads `renderer` synchronously before detection resolves, they get the default.
**How to avoid:** Document that `renderer` is only valid after the `renderer-selected` event fires. Callers should listen for the event, not poll the property. The event is dispatched at the end of `_detectRenderer()`, so it reliably signals completion.
**Warning signs:** Consumers checking `.renderer` in `connectedCallback()` or directly after `document.createElement()` always see `'canvas'`.

### Pitfall 5: `@webgpu/types` Not in `tsconfig.json`

**What goes wrong:** TypeScript errors on `navigator.gpu`, `GPUAdapter`, `GPUDevice` even after installing `@webgpu/types`.
**Why it happens:** `@webgpu/types` is not under `@types/` — TypeScript doesn't auto-include it. Must be explicitly added to `compilerOptions.types`.
**How to avoid:** Add `"@webgpu/types"` to the `types` array in `packages/charts/tsconfig.json` or use a `/// <reference types="@webgpu/types" />` directive in a `.d.ts` file.
**Warning signs:** `Property 'gpu' does not exist on type 'Navigator'` TypeScript errors.

---

## Code Examples

Verified patterns from official sources:

### WebGPU Feature Detection (SSR-Safe, Full Fallback Chain)

```typescript
// Source: MDN navigator.gpu + MDN GPU.requestAdapter() + existing BaseChartElement pattern
// Runs inside firstUpdated() ONLY — never at module level or in constructor

protected async _detectRenderer(): Promise<void> {
  // Belt-and-suspenders: isServer guard (Lit) + runtime typeof check
  // isServer covers Lit SSR; typeof navigator covers other Node environments
  if (isServer || typeof navigator === 'undefined' || !navigator.gpu) {
    this.renderer = this._isWebGLSupported() ? 'webgl' : 'canvas';
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
    return;
  }

  if (!this.enableWebGpu) {
    // WebGPU not requested — skip the async adapter probe entirely
    this.renderer = this._isWebGLSupported() ? 'webgl' : 'canvas';
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
    return;
  }

  // requestAdapter() resolves to null when no GPU adapter is available —
  // it NEVER rejects. Null means no WebGPU; fall back gracefully.
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    this.renderer = this._isWebGLSupported() ? 'webgl' : 'canvas';
    dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
    return;
  }

  // Acquire (or reuse) the page-scoped singleton device — WEBGPU-03
  await acquireGpuDevice(adapter);
  this.renderer = 'webgpu';
  dispatchCustomEvent(this, 'renderer-selected', { renderer: this.renderer });
}
```

### GPUDevice Singleton (Module Pattern)

```typescript
// Source: MDN GPUAdapter.requestDevice() + canvas-core.ts singleton pattern (this codebase)
// packages/charts/src/shared/webgpu-device.ts

let _devicePromise: Promise<GPUDevice> | null = null;

export async function acquireGpuDevice(adapter: GPUAdapter): Promise<GPUDevice> {
  if (_devicePromise) return _devicePromise;
  // First call only — adapter is consumed after this; do not call requestDevice() again
  _devicePromise = adapter.requestDevice();
  return _devicePromise;
}

export function getGpuDevice(): Promise<GPUDevice> | null {
  return _devicePromise;
}

// Called by Phase 101's disconnectedCallback cleanup (not needed in Phase 98)
export function releaseGpuDevice(): void {
  _devicePromise = null;
}
```

### TypeScript Configuration for WebGPU Types

```json
// packages/charts/tsconfig.json — add to compilerOptions
{
  "compilerOptions": {
    "types": ["@webgpu/types"]
  }
}
```

### `renderer-selected` Event TypeScript Declaration

```typescript
// Source: existing pattern from dispatchCustomEvent in BaseChartElement
// Add to charts package global type augmentation

export type RendererTier = 'webgpu' | 'webgl' | 'canvas';

declare global {
  interface HTMLElementEventMap {
    'renderer-selected': CustomEvent<{ renderer: RendererTier }>;
    'webgl-unavailable': CustomEvent<{ reason: string }>;
  }
}
```

### `firstUpdated()` Integration (Updated Sequence)

```typescript
// Source: existing BaseChartElement.firstUpdated() pattern
override async firstUpdated(_changed: PropertyValues): Promise<void> {
  if (isServer) return;

  await this.updateComplete;
  await this._detectRenderer();   // WEBGPU-01 + WEBGPU-03 — runs before GL load
  await this._maybeLoadGl();      // existing WebGL path unchanged

  requestAnimationFrame(() => this._initChart());
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebGPU behind `chrome://flags/#enable-unsafe-webgpu` | Enabled by default in Chrome 113+, Edge 113+, Firefox 141+, Safari 26 | 2023–2025 | WebGPU is now a stable production API, not an experimental flag |
| `GPUAdapter.isFallbackAdapter` property | `GPUAdapterInfo.isFallbackAdapter` (via `adapter.requestAdapterInfo()`) | Late 2024 | Removed from GPUAdapter directly; access via adapterInfo instead |
| Per-component GPUDevice creation | Module-level singleton `GPUDevice` shared across components | Established best practice | Avoids device count limits; W3C spec recommends single device for multi-component pages |
| TypeScript WebGPU types in `lib: dom` | `@webgpu/types` devDep | Ongoing; TS 5.8+ beginning to include | For maximum compatibility use `@webgpu/types` — don't rely on TypeScript dom lib version |

**Deprecated/outdated:**
- `GPUAdapter.isFallbackAdapter`: Use `GPUAdapterInfo.isFallbackAdapter` from `adapter.requestAdapterInfo()` instead. Phase 98 does not need this — omit fallback adapter check entirely.
- `navigator.gpu` SSR check via `typeof window !== 'undefined'`: Project standard is Lit's `isServer` — use that.

---

## Open Questions

1. **`enable-webgpu` attribute: opt-in or always-detect?**
   - What we know: The existing `enable-gl` attribute is opt-in for echarts-gl; the WEBGPU-01 requirement says "auto-detect" which implies always-detect.
   - What's unclear: Success Criterion #1 says `.renderer` returns the correct value — but should it return `'canvas'` on a WebGPU browser when `enable-webgpu` is absent?
   - Recommendation: Implement two behaviors: without `enable-webgpu`, always report `'canvas'` (or WebGL if supported) without doing the async GPU probe; with `enable-webgpu`, do full detection. This matches the opt-in pattern of `enable-gl` and avoids async startup cost on charts that won't use WebGPU. If the requirement means "truly always detect", the `_detectRenderer()` method runs regardless but the `acquireGpuDevice()` call is guarded by `enableWebGpu`.

2. **GPUDevice cleanup: when does the singleton get destroyed?**
   - What we know: `releaseGpuDevice()` is stubbed in the design. Phase 101's success criteria mention `device.destroy()` on component teardown. WEBGPU-03 only covers creation.
   - What's unclear: Phase 98 success criteria don't mention cleanup. Should `disconnectedCallback()` in Phase 98 handle cleanup, or defer entirely to Phase 101?
   - Recommendation: Phase 98 does NOT implement `device.destroy()`. The singleton module exposes `releaseGpuDevice()` as a future hook, but Phase 98 only wires creation. Phase 101 owns the full lifecycle.

3. **`@webgpu/types` `tsconfig.json` scope**
   - What we know: The charts package has its own `tsconfig.json` extending `@lit-ui/typescript-config/library.json`. The base config specifies `lib` settings.
   - What's unclear: Whether adding `"types": ["@webgpu/types"]` to the charts tsconfig conflicts with the base config's type resolution.
   - Recommendation: Add `/// <reference types="@webgpu/types" />` to a new `src/shared/webgpu-device.ts` file as a targeted directive rather than modifying tsconfig — avoids any risk of scope conflicts. Install `@webgpu/types` as `devDependencies` only.

---

## Validation Architecture

> `workflow.nyquist_validation` is not set in `.planning/config.json` (key absent, treated as false). Skip full validation section.

The `.planning/config.json` does not contain `workflow.nyquist_validation`. No automated test infrastructure exists for `@lit-ui/charts` (only the CLI package has a vitest config). Phase 98 success criteria are verified manually/by SSR build smoke test.

---

## Sources

### Primary (HIGH confidence)
- [MDN: Navigator.gpu](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/gpu) — WebGPU availability check, return values, browser support
- [MDN: GPU.requestAdapter()](https://developer.mozilla.org/en-US/docs/Web/API/GPU/requestAdapter) — null return value, options, no-reject contract
- [MDN: GPUDevice](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice) — interface overview, device lifecycle
- [gpuweb/types GitHub README](https://github.com/gpuweb/types/blob/main/README.md) — @webgpu/types tsconfig configuration
- `packages/charts/src/base/base-chart-element.ts` (this codebase) — `isServer`, `firstUpdated()`, `_maybeLoadGl()`, `dispatchCustomEvent` patterns
- `packages/charts/src/registry/canvas-core.ts` (this codebase) — module-level singleton pattern (`_registered` flag)
- `packages/core/src/utils/events.ts` (this codebase) — `dispatchCustomEvent` signature and defaults

### Secondary (MEDIUM confidence)
- [WebGPU Hits Critical Mass: All Major Browsers Now Ship It](https://www.webgpu.com/news/webgpu-hits-critical-mass-all-major-browsers/) — browser support table 2025–2026
- [MDN: WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — multi-component device sharing guidance
- [WebGPU Explainer](https://gpuweb.github.io/gpuweb/explainer/) — singleton/multi-component device architecture

### Tertiary (LOW confidence)
- [HackMD: Multiple components cannot effectively share a GPUDevice](https://hackmd.io/@webgpu/SkRjVIcjc) — working group proposal notes on error scope state challenges with shared devices (relevant background; implementation in post-V1 spec; not yet standardized)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@webgpu/types` is the W3C official package; no alternatives needed; Lit/`@lit-ui/core` already present
- Architecture: HIGH — `_detectRenderer()` + `webgpu-device.ts` singleton directly mirrors established codebase patterns (`_maybeLoadGl()` and `canvas-core.ts`); no novel patterns required
- Pitfalls: HIGH — SSR crash, null adapter, multi-device, and double-requestDevice pitfalls verified via MDN and WebGPU spec
- GPUDevice singleton: MEDIUM — the "shared device" recommendation is confirmed by spec and MDN; exact device count limits per browser are not publicly documented but the singleton approach is spec-recommended

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (WebGPU spec is stable; browser support table may shift as Firefox Android and Linux support matures)
