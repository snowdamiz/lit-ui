---
phase: 88-package-foundation-basechartelement
verified: 2026-02-28T15:30:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Import @lit-ui/charts in a Next.js or Astro project and verify no 'window is not defined' crash occurs during SSR"
    expected: "Package imports cleanly server-side; firstUpdated() never fires on server; no echarts value imports execute"
    why_human: "SSR safety requires a running Next.js/Astro server context — cannot verify static imports alone in a grep check"
  - test: "Set enable-gl on a chart element in a browser with WebGL disabled (chrome://flags) and verify fallback"
    expected: "webgl-unavailable CustomEvent fires on the element; chart renders with canvas renderer instead"
    why_human: "WebGL probe fallback behavior requires a real browser environment with controlled WebGL availability"
  - test: "Toggle .dark class on document.documentElement and observe chart color updates without page reload"
    expected: "Chart palette updates to dark mode colors immediately; no dispose+reinit flicker occurs"
    why_human: "Dark mode MutationObserver behavior requires a live browser rendering the chart component"
---

# Phase 88: Package Foundation + BaseChartElement — Verification Report

**Phase Goal:** Developer can install @lit-ui/charts and have every cross-cutting concern resolved — SSR safety, dark mode, CSS token theming, WebGL lifecycle, ResizeObserver, and streaming infrastructure — before any concrete chart component is built

**Verified:** 2026-02-28T15:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | @lit-ui/charts package exists with valid package.json exporting the package | VERIFIED | `packages/charts/package.json` present; `"name": "@lit-ui/charts"`, correct exports field |
| 2  | pnpm install runs without errors; echarts 5.6.0 and echarts-gl 2.0.9 installed | VERIFIED | node_modules confirm echarts@5.6.0 and echarts-gl@2.0.9 installed |
| 3  | vite build produces dist/index.js and dist/index.d.ts | VERIFIED | dist/index.js (11,597 bytes), dist/index.d.ts (8,173 bytes) present from 2026-02-28 |
| 4  | ThemeBridge reads all 16 --ui-chart-* CSS tokens via getComputedStyle (never var() strings) | VERIFIED | All 16 token defaults in `_tokenDefaults`; `readToken()` uses `getComputedStyle(this.host).getPropertyValue(name).trim()` |
| 5  | ThemeBridge.buildThemeObject() returns complete ECharts theme with color array, axis, tooltip, legend | VERIFIED | Returns object with `color[]` (8 items), `textStyle`, `grid`, `categoryAxis`, `valueAxis`, `tooltip`, `legend` |
| 6  | registerCanvasCore() registers CanvasRenderer and shared ECharts components exactly once (_registered guard) | VERIFIED | Module-level `let _registered = false`; all imports are `await import()` inside async function; no static top-level echarts imports |
| 7  | BaseChartElement can be imported in SSR context without window crash (CRITICAL-04) | VERIFIED | No static echarts value imports in base-chart-element.ts; only `import type`; `if (isServer) return` guard in firstUpdated() |
| 8  | Chart initializes ECharts after browser layout is complete (CRITICAL-01) | VERIFIED | `requestAnimationFrame(() => this._initChart())` in firstUpdated(); `:host { display: block; height: var(--ui-chart-height, 300px) }` guarantees dimensions |
| 9  | enable-gl attribute causes dynamic echarts-gl import; WebGL unavailable fires webgl-unavailable event | VERIFIED | `_maybeLoadGl()` probes WebGL, dispatches `webgl-unavailable` event on failure, falls through to canvas; `await import('echarts-gl')` on success |
| 10 | Dark mode toggle updates chart colors via MutationObserver (INFRA-04) | VERIFIED | `MutationObserver` on `document.documentElement` with `attributeFilter: ['class']` calling `_applyThemeUpdate()` |
| 11 | pushData() accumulates data and flushes once per animation frame via RAF coalescing (STRM-03) | VERIFIED | `pushData()` pushes to `_pendingData`, schedules RAF if `_rafId === undefined`; `_flushPendingData()` consumes all pending at once |
| 12 | appendData and setOption are strictly separate code paths (CRITICAL-03) | VERIFIED | `_flushPendingData()` has strict if/else: `appendData` path OR `setOption` circular-buffer path, never both |
| 13 | Charts resize automatically when container changes (ResizeObserver, not window.resize) | VERIFIED | `ResizeObserver(() => this._chart?.resize())` observing the inner `#chart` container in `_initChart()` |
| 14 | disconnectedCallback runs full disposal: loseContext → dispose → null → observers disconnected | VERIFIED | Explicit order: cancelAnimationFrame → disconnect observers → loseContext on all canvases → dispose() → `this._chart = null` |

**Score:** 14/14 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/charts/package.json` | @lit-ui/charts package manifest | VERIFIED | name="@lit-ui/charts", echarts ^5.6.0 + echarts-gl ^2.0.9 in dependencies, correct ESM exports |
| `packages/charts/tsconfig.json` | TypeScript config extending @lit-ui/typescript-config/library.json | VERIFIED | `"extends": "@lit-ui/typescript-config/library.json"` |
| `packages/charts/vite.config.ts` | Vite build config | VERIFIED | `createLibraryConfig({ entry: 'src/index.ts' })` from `@lit-ui/vite-config/library` |
| `packages/charts/src/vite-env.d.ts` | Vite client type reference | VERIFIED | File present |
| `packages/charts/src/index.ts` | Package public API re-exports | VERIFIED | Exports BaseChartElement, ThemeBridge, registerCanvasCore, EChartsOption type |
| `packages/charts/src/base/theme-bridge.ts` | CSS token to ECharts theme bridge | VERIFIED | Exports ThemeBridge class with readToken(), buildThemeObject(), buildColorUpdate() |
| `packages/charts/src/registry/canvas-core.ts` | ECharts module registration for canvas rendering | VERIFIED | Exports registerCanvasCore() async function with _registered guard; zero static imports |
| `packages/charts/src/base/base-chart-element.ts` | Abstract Lit base class for all chart components | VERIFIED | 395-line abstract class extending TailwindElement; all 5 critical pitfalls addressed; all 14 requirements implemented |
| `packages/charts/dist/index.js` | Compiled ESM output | VERIFIED | 11,597 bytes, present |
| `packages/charts/dist/index.d.ts` | TypeScript declarations | VERIFIED | 8,173 bytes; exports BaseChartElement, ThemeBridge, registerCanvasCore, EChartsOption |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `packages/charts/tsconfig.json` | `@lit-ui/typescript-config/library.json` | extends | VERIFIED | `"extends": "@lit-ui/typescript-config/library.json"` |
| `packages/charts/vite.config.ts` | `@lit-ui/vite-config/library` | createLibraryConfig import | VERIFIED | `import { createLibraryConfig } from '@lit-ui/vite-config/library'` |
| `packages/charts/src/base/theme-bridge.ts` | `getComputedStyle(host).getPropertyValue()` | CSS token resolution | VERIFIED | `getComputedStyle(this.host).getPropertyValue(name).trim()` in readToken() |
| `packages/charts/src/registry/canvas-core.ts` | `echarts/core` | dynamic import inside async function | VERIFIED | `import('echarts/core')` only inside async registerCanvasCore() body |
| `packages/charts/src/base/base-chart-element.ts` | `packages/charts/src/base/theme-bridge.ts` | import ThemeBridge | VERIFIED | `import { ThemeBridge } from './theme-bridge.js'`; instantiated as `new ThemeBridge(this)` |
| `packages/charts/src/base/base-chart-element.ts` | `echarts/core` | dynamic import inside _initChart() | VERIFIED | `const { init, getInstanceByDom } = await import('echarts/core')` inside `_initChart()` |
| `packages/charts/src/base/base-chart-element.ts` | `@lit-ui/core` | extends TailwindElement | VERIFIED | `import { TailwindElement, tailwindBaseStyles, dispatchCustomEvent } from '@lit-ui/core'`; `extends TailwindElement` |
| `packages/charts/src/base/base-chart-element.ts` | abstract _registerModules | fulfilled by concrete charts | VERIFIED | `protected abstract _registerModules(): Promise<void>` declared; called in `_initChart()` |
| `packages/charts/src/index.ts` | `BaseChartElement` | re-export | VERIFIED | `export { BaseChartElement } from './base/base-chart-element.js'` |
| `packages/charts/src/index.ts` | `ThemeBridge` | re-export | VERIFIED | `export { ThemeBridge } from './base/theme-bridge.js'` |
| `packages/charts/src/index.ts` | `registerCanvasCore` | re-export | VERIFIED | `export { registerCanvasCore } from './registry/canvas-core.js'` |

---

## Requirements Coverage

All 14 Phase 88 requirements verified as implemented. No orphaned requirements found.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INFRA-01 | 88-01 | Opt-in package separate from other LitUI packages | SATISFIED | packages/charts/ is a standalone workspace package; package.json name="@lit-ui/charts" |
| INFRA-02 | 88-03 | SSR-safe: no window/document crash | SATISFIED | No static echarts value imports; `if (isServer) return` in firstUpdated(); `import type` only at top level |
| INFRA-03 | 88-03 | enable-gl attribute with WebGL Canvas fallback | SATISFIED | `@property({ type: Boolean, attribute: 'enable-gl' }) enableGl`; `_maybeLoadGl()` with WebGL probe and `webgl-unavailable` event |
| INFRA-04 | 88-02, 88-03 | .dark class toggle updates chart colors | SATISFIED | MutationObserver on document.documentElement watching 'class' attribute; ThemeBridge.buildColorUpdate() called on change |
| INFRA-05 | 88-02 | --ui-chart-* CSS custom properties | SATISFIED | All 16 tokens defined in ThemeBridge._tokenDefaults with fallbacks; resolved via getComputedStyle before ECharts |
| CHART-01 | 88-03 | data property on every chart component | SATISFIED | `@property({ attribute: false }) data?: unknown` on BaseChartElement |
| CHART-02 | 88-03 | raw ECharts option passthrough | SATISFIED | `@property({ attribute: false }) option?: EChartsCoreOption`; `attribute: false` prevents lossy JSON.parse |
| CHART-03 | 88-03 | getChart() escape hatch | SATISFIED | `getChart(): EChartsType \| undefined` returns `this._chart ?? undefined` |
| CHART-04 | 88-03 | loading skeleton toggle | SATISFIED | `@property({ type: Boolean }) loading = false`; `showLoading()`/`hideLoading()` in updated() and _initChart() |
| CHART-05 | 88-03 | ResizeObserver auto-resize | SATISFIED | `ResizeObserver(() => this._chart?.resize())` on inner container; not window.resize |
| STRM-01 | 88-03 | pushData(point) streaming API | SATISFIED | `pushData(point: unknown)` public method accumulates to _pendingData |
| STRM-02 | 88-03 | maxPoints circular buffer capacity | SATISFIED | `@property({ type: Number }) maxPoints = 1000`; used in `_flushPendingData()` slice logic |
| STRM-03 | 88-03 | RAF batching for pushData calls | SATISFIED | RAF scheduled once per batch; `_pendingData.splice(0)` consumes all in single flush |
| STRM-04 | 88-03 | appendData path for Line/Area; circular buffer for others | SATISFIED | `_streamingMode: 'appendData' \| 'buffer' = 'buffer'`; strict if/else in `_flushPendingData()` |

---

## Anti-Patterns Found

No blockers or warnings found.

Scanned files:
- `packages/charts/src/base/base-chart-element.ts`
- `packages/charts/src/base/theme-bridge.ts`
- `packages/charts/src/registry/canvas-core.ts`
- `packages/charts/src/index.ts`

| File | Line | Pattern | Severity | Notes |
|------|------|---------|----------|-------|
| `base-chart-element.ts` | 373 | `@ts-ignore` on echarts-gl import | Info | Intentional; echarts-gl 2.0.9 ships no subpath type declarations; documented decision, deferred to Phase 92 |

No TODO/FIXME/HACK/placeholder comments found. No empty implementations (return null/return {}) found. No console.log-only implementations found.

---

## Human Verification Required

### 1. SSR Framework Integration

**Test:** Create a minimal Next.js 14 App Router or Astro project, install @lit-ui/charts, import BaseChartElement in a server component, and run the dev server.
**Expected:** No `window is not defined` or `document is not defined` error during server-side rendering. The component renders an empty `:host { display: block; height: 300px }` placeholder on the server. ECharts initializes only after client hydration.
**Why human:** SSR safety requires a running Next.js/Astro server context. The grep check confirms no static value imports exist, but actual SSR execution could surface issues in the Lit SSR rendering pipeline not detectable statically.

### 2. WebGL Unavailable Fallback

**Test:** In Chrome, navigate to `chrome://flags`, disable WebGL, then render a chart with `enable-gl` attribute set.
**Expected:** The `webgl-unavailable` CustomEvent fires on the element (verifiable in DevTools event listener). The chart initializes with Canvas renderer and displays normally.
**Why human:** The `_isWebGLSupported()` probe logic and event dispatch can only be exercised in a browser with controlled WebGL availability. Static analysis confirms the code path exists but cannot verify it executes correctly.

### 3. Dark Mode MutationObserver Live Update

**Test:** In a browser with a rendered chart component, run `document.documentElement.classList.toggle('dark')` in the DevTools console.
**Expected:** Chart palette updates immediately to dark mode colors (buildColorUpdate() applies updated CSS token values). No dispose+reinit flicker. Page reload not required.
**Why human:** MutationObserver behavior requires a live browser rendering the component. The CSS token resolution via getComputedStyle requires actual CSS to be loaded.

---

## Commit Verification

All commits documented in SUMMARY files verified as present in git history:

| Commit | Description |
|--------|-------------|
| 8342f52 | chore(88-01): create @lit-ui/charts package scaffold |
| 001fb84 | chore(88-01): install dependencies and verify build for @lit-ui/charts |
| 10ee3bc | feat(88-02): create ThemeBridge CSS token resolver |
| 7737316 | feat(88-02): create canvas-core ECharts module registry |
| 48c41d5 | feat(88-03): implement BaseChartElement abstract base class |
| 5234f7b | feat(88-03): wire index.ts exports and verify build |

---

## Summary

Phase 88 goal is fully achieved. All 14 requirements (INFRA-01 through STRM-04) have concrete, substantive implementations wired correctly:

- The @lit-ui/charts package scaffolds correctly as a monorepo workspace package with echarts 5.6.0 and echarts-gl 2.0.9 installed and the vite build producing correct dist output.
- ThemeBridge resolves all 16 CSS tokens via getComputedStyle before any value reaches the ECharts Canvas 2D API (CRITICAL-05 solved).
- registerCanvasCore() uses zero static imports and a module-level guard, solving SSR safety and double-registration (CRITICAL-04 solved).
- BaseChartElement is a 395-line substantive abstract class — not a stub — implementing all 5 critical ECharts pitfalls, every lifecycle concern, and all streaming paths. Every truth derived from the ROADMAP success criteria is verifiable in the actual codebase.
- The only items requiring human verification are runtime behaviors (SSR execution, WebGL fallback, dark mode live update) that cannot be verified by static code analysis alone. These are expected for a browser component library.

Phases 89-95 can extend BaseChartElement and implement only `_registerModules()` without re-solving any cross-cutting concern.

---

_Verified: 2026-02-28T15:30:00Z_
_Verifier: Claude (gsd-verifier)_
