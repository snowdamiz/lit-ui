# Phase 102: Docs + Skills Update - Research

**Researched:** 2026-03-01
**Domain:** Technical documentation authoring — skill files (.md) and docs pages (.tsx) for v10.0 WebGPU Charts features
**Confidence:** HIGH

## Summary

Phase 102 is a pure documentation delivery phase. All implementation is complete (phases 98-101). The task is to propagate the v10.0 API changes into two artifact types: (1) AI skill files under `skill/skills/` and (2) the React-based docs pages under `apps/docs/src/pages/charts/`. No new code is compiled or executed; the output is human-readable Markdown and JSX.

The gap between current documentation and the v10.0 implementation is concrete and auditable. The skill files for `line-chart` and `area-chart` do not mention `enable-webgpu`, `renderer`, `renderer-selected`, or the updated `pushData(point, seriesIndex?)` multi-series signature. The `candlestick-chart` skill file does not mention `MAConfig.showType`, the optional `color` with CSS-token defaults, or the NaN-gap rule. The docs pages for line-chart and area-chart have no WebGPU browser support table, and the bundle-size callout in the line/area docs does not mention ChartGPU 0.3.2 or its dynamic-import-only loading strategy.

The docs architecture (React + Tailwind, PropsTable component, `ExampleBlock`, `PropDef` array) is fully understood from reading the existing page files. The skill architecture (plain Markdown, front-matter YAML, pipe-delimited tables) is fully understood from reading the existing skill files. There are no dependencies, no libraries to install, and no build steps required for this phase.

**Primary recommendation:** Edit four existing files directly — `skill/skills/line-chart/SKILL.md`, `skill/skills/area-chart/SKILL.md`, `skill/skills/candlestick-chart/SKILL.md`, `apps/docs/src/pages/charts/LineChartPage.tsx`, and `apps/docs/src/pages/charts/AreaChartPage.tsx` — applying the precise deltas identified below.

---

## Standard Stack

### Core

This phase has no library dependencies. The tools are the existing project files.

| Artifact | Location | Format | Pattern |
|----------|----------|--------|---------|
| Skill files | `skill/skills/<name>/SKILL.md` | Markdown with YAML front-matter | Existing skill file structure (see below) |
| Docs pages | `apps/docs/src/pages/charts/<Name>ChartPage.tsx` | TypeScript JSX (React) | `PropDef[]` array + JSX callout divs |

### Supporting Patterns

| Pattern | Used In | Example |
|---------|---------|---------|
| `PropDef[]` array fed to `<PropsTable>` | All chart docs pages | `lineChartProps: PropDef[]` |
| Warning callout div | `CandlestickChartPage.tsx` OHLC warning | `bg-amber-50 border-amber-200` div |
| Info callout div | Tree-shaking tip in all chart pages | `bg-blue-50 border-blue-200` div |
| Markdown pipe table in SKILL.md | Props tables in all skill files | `| Prop | Attribute | Type | Default | Description |` |
| Behavior Notes section | All skill files | bullet list of critical rules |

### No Installation Required

```bash
# No new dependencies — this is documentation-only
# All files edited in-place
```

---

## Architecture Patterns

### File Locations

```
skill/
└── skills/
    ├── line-chart/
    │   └── SKILL.md          # ← edit: add enable-webgpu, renderer, renderer-selected, pushData(point, seriesIndex?)
    ├── area-chart/
    │   └── SKILL.md          # ← edit: same as line-chart (identical feature set)
    └── candlestick-chart/
        └── SKILL.md          # ← edit: add MAConfig.showType, optional color, NaN-gap rule, reinit warning

apps/docs/src/pages/charts/
    ├── LineChartPage.tsx      # ← edit: add enable-webgpu prop, WebGPU browser support table, ChartGPU bundle note
    └── AreaChartPage.tsx     # ← edit: same changes as LineChartPage.tsx
```

### Pattern 1: Adding a Prop Row to a Docs Page

The docs pages define a `PropDef[]` array that is passed to `<PropsTable>`. To add a new prop, append to that array.

**Existing `PropDef` type:**
```typescript
// Source: apps/docs/src/components/PropsTable.tsx (inferred from usage)
type PropDef = {
  name: string;       // attribute name as shown to users (e.g. 'enable-webgpu')
  type: string;       // TypeScript type string
  default: string;    // default value as string
  description: string;
};
```

**Example — adding `enable-webgpu` to lineChartProps:**
```typescript
// Source: apps/docs/src/pages/charts/LineChartPage.tsx (current pattern)
{
  name: 'enable-webgpu',
  type: 'boolean',
  default: 'false',
  description: 'Opt-in WebGPU rendering via ChartGPU 0.3.2. When set and WebGPU is available (Chrome/Edge, Firefox 141+, Safari 26+), the chart renders data pixels on a GPU-accelerated canvas layer beneath ECharts. Falls back to Canvas automatically on unsupported browsers.',
},
{
  name: 'renderer',
  type: "'webgpu' | 'webgl' | 'canvas'",
  default: "'canvas'",
  description: "Read-only property — active renderer tier after 'renderer-selected' event fires. Do NOT read synchronously before the event; the async GPU probe may not have resolved. Not a Lit @property() — does not trigger reactive updates.",
},
```

### Pattern 2: Adding a Warning Callout to a Docs Page

The `CandlestickChartPage.tsx` already has an amber warning callout. Mirror that pattern for the reinit warning:

```tsx
{/* Source: apps/docs/src/pages/charts/CandlestickChartPage.tsx — amber callout pattern */}
<div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
  <strong>Moving averages reinit warning:</strong> Changing <code>movingAverages</code> config
  after streaming starts requires chart reinit — reassign <code>chart.data</code> to replay
  history through the new MA config.
</div>
```

### Pattern 3: Adding a Browser Support Table to a Docs Page

Insert after the tree-shaking callout div and before the Examples section:

```tsx
{/* WebGPU browser support table — insert after tree-shaking callout */}
<div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 text-sm">
  <strong className="block mb-3 text-gray-900 dark:text-gray-100">WebGPU browser support</strong>
  <table className="w-full text-xs">
    <thead>
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <th className="text-left py-1 pr-4 text-gray-700 dark:text-gray-300">Browser</th>
        <th className="text-left py-1 pr-4 text-gray-700 dark:text-gray-300">WebGPU</th>
        <th className="text-left py-1 text-gray-700 dark:text-gray-300">Notes</th>
      </tr>
    </thead>
    <tbody className="text-gray-600 dark:text-gray-400">
      <tr><td className="py-1 pr-4">Chrome / Edge</td><td className="py-1 pr-4 text-green-600 dark:text-green-400">Yes</td><td className="py-1">Stable since Chrome 113</td></tr>
      <tr><td className="py-1 pr-4">Firefox</td><td className="py-1 pr-4 text-green-600 dark:text-green-400">Yes (141+)</td><td className="py-1">Enabled by default in Firefox 141</td></tr>
      <tr><td className="py-1 pr-4">Safari</td><td className="py-1 pr-4 text-green-600 dark:text-green-400">Yes (26+)</td><td className="py-1">Enabled by default in Safari 26</td></tr>
      <tr><td className="py-1 pr-4">Fallback</td><td className="py-1 pr-4">Canvas</td><td className="py-1">Automatic — no user action needed</td></tr>
    </tbody>
  </table>
</div>
```

### Pattern 4: Adding an Event Row to a Skill File

The `skills/charts/SKILL.md` documents `ui-webgl-unavailable`. The skill files for `line-chart` and `area-chart` reference `skills/charts` for shared events. Add `renderer-selected` to the chart-specific skill files as an override note:

```markdown
## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `renderer-selected` | `{ renderer: 'webgpu' \| 'webgl' \| 'canvas' }` | Fires during `firstUpdated()` when the active renderer tier has been determined. Always wait for this event before reading `chart.renderer`. |

See `skills/charts` for shared `ui-webgl-unavailable` event.
```

### Pattern 5: Skill File Behavior Notes (Bullet List Format)

```markdown
## Behavior Notes

- **enable-webgpu opt-in**: WebGPU is NOT auto-detected. Set `enable-webgpu` attribute to activate the GPU probe. Without it, charts use WebGL/Canvas with zero async startup overhead.
- **renderer is read-only**: Do not set `chart.renderer` — read it after the `renderer-selected` event fires.
- **pushData() multi-series**: `pushData(point, seriesIndex?)` — `seriesIndex` defaults to `0`. Pass `seriesIndex: 1` to stream to the second series without affecting others.
- **maxPoints default is 500,000**: Line/area charts override the base default of 1000. At 1000 pts/sec this is ~8 minutes before dispose+reinit reset.
- **Do NOT reassign .data after streaming starts**: Same rule as before — `setOption` wipes streamed data.
```

### Anti-Patterns to Avoid

- **Anti-pattern — Inventing new JSX components:** The docs pages use existing components (`PropsTable`, `ExampleBlock`, `PrevNextNav`). Do not import new components. Insert raw JSX callout divs or plain table HTML for new sections.
- **Anti-pattern — Editing `skill/skills/charts/SKILL.md` for chart-specific props:** The charts overview skill delegates per-chart details to sub-skills. Only add shared behavior there (e.g., if `pushData(point, seriesIndex?)` upgrade is shared to all 8 charts — it is not; it only applies to line/area).
- **Anti-pattern — Documenting future requirements as current:** Do NOT document STRM-05 (per-series maxPoints), MA-05 (full ThemeBridge dark mode), or WEBGPU-04/05. These are deferred to future milestones.
- **Anti-pattern — Documenting `renderer` as a `@property()`:** The implementation deliberately does NOT make `renderer` a `@property()`. Document it as a plain class property that does not trigger Lit reactive updates.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser support data | Research from scratch | Facts from Phase 98 RESEARCH.md + STATE.md accumulated context | Already verified: Chrome 113+, Firefox 141+, Safari 26+ |
| API signatures | Guess from skill files | Read from actual source in `packages/charts/src/` | Ground truth is in the implementation |
| Callout component | New React component | Inline `<div className="...">` with Tailwind | All existing callouts are inline divs, no abstraction |
| MA color token names | List from memory | Read from `_MA_DEFAULT_COLOR_TOKENS` in candlestick-chart.ts | Verified: `--ui-chart-color-2` through `--ui-chart-color-5` |

**Key insight:** All factual claims in the docs must trace back to the implementation source files. The skill files are the "AI-readable API contract" — every statement must be true of the actual running code.

---

## Common Pitfalls

### Pitfall 1: Stale `pushData()` Signature in Skill Files

**What goes wrong:** The current `line-chart` and `area-chart` skill files document `pushData(Math.random() * 100)` (single-arg). The v10.0 implementation has `pushData(point, seriesIndex = 0)`.
**Why it happens:** Skills were written before STRM-03 implementation in Phase 100.
**How to avoid:** Update both the code example in `## Usage` and the `## Behavior Notes` section of both skill files. Keep single-arg examples for single-series use; add a multi-series example showing `seriesIndex`.
**Warning signs:** If the skill says "pass a number" without mentioning `seriesIndex`, it is stale.

### Pitfall 2: Documenting `enable-webgpu` as Auto-Detect

**What goes wrong:** Docs that say "when WebGPU is available, the chart uses it" imply auto-detection. The actual behavior requires explicit opt-in via `enable-webgpu` attribute.
**Why it happens:** The description might conflate detection (which is conditional on the attribute being set) with auto-upgrade.
**How to avoid:** Be explicit: "Set `enable-webgpu` to activate WebGPU detection." Without the attribute, the chart NEVER calls `navigator.gpu.requestAdapter()`.
**Warning signs:** Any description that doesn't mention the `enable-webgpu` attribute as a prerequisite.

### Pitfall 3: Documenting `maxPoints` Default as 1000 for Line/Area

**What goes wrong:** The base `BaseChartElement.maxPoints` defaults to 1000. `LuiLineChart` and `LuiAreaChart` both override this to `500_000`. The current docs pages show `default: '1000'` in the prop table — this is wrong for these two charts.
**Why it happens:** The `PropDef` array in docs pages was written before Phase 100 override.
**How to avoid:** Update the `max-points` prop entry in `lineChartProps` and `areaChartProps` to `default: '500000'`.
**Warning signs:** Any line/area docs page that says `max-points` defaults to `1000`.

### Pitfall 4: Missing the NaN-Gap Rule in Candlestick Skill

**What goes wrong:** Users stream `NaN` closes expecting them to silently pass through. The skill should explain that `NaN` produces a `null` MA value (renders as a gap in the line), preventing NaN propagation into tooltips.
**Why it happens:** It is a subtle invariant that MA-03 captures. The current candlestick skill has no mention of it.
**How to avoid:** Add a Behavior Note: "**NaN closes are gaps**: A `NaN` close value in a streaming bar returns `null` for that bar's MA value — rendered as a gap in the MA line. NaN is NOT propagated through the SMA window."

### Pitfall 5: Not Including the "Looks Done But Isn't" MA Reinit Warning

**What goes wrong:** A developer changes `movingAverages` config after streaming 10,000 bars. The new MA config takes effect but the `_maStateMachines` are rebuilt from the CURRENT `_ohlcBuffer` only — which may have been trimmed. Streamed history before the trim is lost. The MA lines will appear correct for new bars but the historical MA will be truncated.
**Why it happens:** `_applyData()` rebuilds state machines atomically. This is correct behavior but surprising.
**How to avoid:** Add a "Looks Done But Isn't" callout in the candlestick skill: changing `movingAverages` after streaming starts requires calling `chart.data = []` first (full reinit) to replay all history through the new config.

### Pitfall 6: Using Wrong TSX Prop Name for `enable-webgpu`

**What goes wrong:** In the docs page PropsTable, the `name` field must match the HTML attribute name (kebab-case), not the JS property name. `enable-webgpu` (not `enableWebGpu`).
**Why it happens:** The `PropDef.name` field is used for display and must be the attribute, not the property.
**How to avoid:** Verify by checking `lineChartProps` — all other entries use attribute names (`enable-gl`, `max-points`, `mark-lines`), not JS property names.

### Pitfall 7: Inaccurate Bundle Size Claim

**What goes wrong:** The current docs say "~135KB gzipped vs 350KB+ for all charts". After Phase 101 added ChartGPU 0.3.2 as a runtime dependency, the line/area chart subpath bundles are larger. However, ChartGPU is dynamically imported — it only loads when WebGPU is available and `enable-webgpu` is set. The static bundle size is unchanged.
**Why it happens:** The dynamic import of `chartgpu` means it is not included in the initial parse-time bundle.
**How to avoid:** Keep the existing size guidance AND add a clarifying note: "ChartGPU 0.3.2 is loaded on-demand via dynamic import only when `enable-webgpu` is set AND WebGPU is available — zero additional overhead on unsupported browsers."

---

## Code Examples

Verified from source files — all signatures confirmed against implementation.

### Updated `pushData()` Multi-Series Signature (line + area charts)

```typescript
// Source: packages/charts/src/line/line-chart.ts — override pushData(point, seriesIndex = 0)
// Single-series streaming (unchanged)
chart.data = [{ name: 'Live', data: [] }];
setInterval(() => chart.pushData(Math.random() * 100), 100);

// Multi-series streaming (new in v10.0 — STRM-03)
chart.data = [
  { name: 'CPU', data: [] },
  { name: 'Memory', data: [] },
];
// Stream to series 0 (CPU)
chart.pushData(cpuValue);
// Stream to series 1 (Memory)
chart.pushData(memoryValue, 1);
// Both are batched in the same RAF frame automatically
```

### WebGPU Opt-In Pattern

```html
<!-- Source: packages/charts/src/base/base-chart-element.ts — enableWebGpu @property() -->
<!-- enable-webgpu attribute activates GPU probe in firstUpdated() -->
<lui-line-chart id="chart" smooth zoom enable-webgpu></lui-line-chart>
<script>
  const chart = document.querySelector('#chart');
  chart.data = [{ name: 'Live', data: [] }];

  // Always wait for renderer-selected before reading chart.renderer
  chart.addEventListener('renderer-selected', (e) => {
    console.log('Renderer:', e.detail.renderer); // 'webgpu' | 'webgl' | 'canvas'
  });

  setInterval(() => chart.pushData(Math.random() * 100), 10);
</script>
```

### MAConfig Full Type (candlestick)

```typescript
// Source: packages/charts/src/shared/candlestick-option-builder.ts
type MAConfig = {
  period: number;       // number of bars in MA window
  color?: string;       // optional hex color — omit to use CSS token defaults
  type?: 'sma' | 'ema'; // default: 'sma'
  showType?: boolean;   // when true: legend shows "MA20 (EMA)" instead of "MA20"
};

// CSS token default color assignment order (when color is omitted):
// MA overlay 1 → --ui-chart-color-2 (first MA avoids --ui-chart-color-1 reserved for data)
// MA overlay 2 → --ui-chart-color-3
// MA overlay 3 → --ui-chart-color-4
// MA overlay 4 → --ui-chart-color-5
// MA overlay 5+ → cycles back to --ui-chart-color-2
```

### NaN Gap Rule (candlestick)

```typescript
// Source: packages/charts/src/shared/ma-state-machine.ts — SMAState.push() + EMAState.push()
// NaN close → returns null (gap in MA line) — does NOT corrupt running SMA sum
chart.pushData({ label: '2024-01-03', ohlc: [105, NaN, 103, 122] });
// This bar's MA value will be null → ECharts renders it as a gap in the MA line
// The SMA window's running sum is NOT modified — next valid close picks up cleanly
```

### MA Default Colors (candlestick)

```typescript
// Source: packages/charts/src/candlestick/candlestick-chart.ts — _MA_DEFAULT_COLOR_TOKENS
// Omit 'color' in MAConfig to use CSS token defaults:
chart.setAttribute('moving-averages', JSON.stringify([
  { period: 20 },              // uses --ui-chart-color-2 resolved value
  { period: 50, type: 'ema' }, // uses --ui-chart-color-3 resolved value
  { period: 20, showType: true }, // uses --ui-chart-color-4; legend: "MA20 (SMA)"
]));
```

---

## Exact Gaps to Fill (Audit of Current vs Required)

This section replaces the "State of the Art" section since this is a documentation phase.

### Gap 1: line-chart SKILL.md — missing v10.0 props and methods

| Missing Item | Where in Skill | Correct Value |
|---|---|---|
| `enable-webgpu` attribute | Props table | `boolean`, default `false`, WebGPU opt-in |
| `renderer` property | Props table (read-only note) | `'webgpu' \| 'webgl' \| 'canvas'`, not a `@property()` |
| `renderer-selected` event | Events section | `{ renderer: RendererTier }`, fires async after GPU probe |
| `pushData(point, seriesIndex?)` | Methods + Usage example | `seriesIndex` defaults to `0`, multi-series support |
| `maxPoints` default | Props table | `500000` (not `1000` — overridden by LuiLineChart) |
| WebGPU streaming note | Behavior Notes | Do not reassign `.data` after `pushData()` regardless of renderer |

### Gap 2: area-chart SKILL.md — identical gaps to line-chart

Area chart has the same feature set as line chart for all v10.0 items. The same six gaps apply verbatim.

### Gap 3: candlestick-chart SKILL.md — missing MA v10.0 features

| Missing Item | Where in Skill | Correct Value |
|---|---|---|
| `MAConfig.showType` | MAConfig type definition | `showType?: boolean` — appends "(SMA)"/"(EMA)" to legend label |
| `MAConfig.color` as optional | MAConfig type definition | `color?: string` — omit for CSS-token default |
| Default color token sequence | Behavior Notes | color-2 through color-5, cycling for >4 MAs |
| NaN-gap rule | Behavior Notes | NaN close → null MA, no window corruption |
| "Looks Done But Isn't" warning | Behavior Notes | Changing `movingAverages` after streaming requires full reinit |
| `MAConfig.color` in JSON attribute example | Usage code block | Show example with and without `color` |

### Gap 4: LineChartPage.tsx — missing WebGPU entries

| Missing Item | Where in Page | Correct Value |
|---|---|---|
| `enable-webgpu` in `lineChartProps[]` | Props table | `boolean`, default `false` |
| `renderer` in `lineChartProps[]` | Props table | read-only, `'webgpu' \| 'webgl' \| 'canvas'` |
| `renderer-selected` event section | After Props table | JSX section with event name + detail |
| WebGPU browser support table | After tree-shaking callout | Chrome/Edge yes, Firefox 141+, Safari 26+, fallback Canvas |
| ChartGPU dynamic-import note | Tree-shaking callout (extend) | "ChartGPU 0.3.2 loaded on-demand — zero overhead on unsupported browsers" |
| `max-points` default | `lineChartProps[4]` | Change `'1000'` → `'500000'` |

### Gap 5: AreaChartPage.tsx — identical gaps to LineChartPage.tsx

The area chart page needs the same five additions as LineChartPage.tsx. Area charts share the full WebGPU implementation (identical `_initWebGpuLayer`, `_syncCoordinates`, `_gpuFlushedLengths` pattern from Phase 101).

---

## Open Questions

1. **`renderer-selected` event in `skills/charts/SKILL.md` (shared events table)**
   - What we know: The `renderer-selected` event is defined in `webgpu-device.ts` as an `HTMLElementEventMap` entry. It fires on ALL charts that use `enable-webgpu`, but currently only line/area use WebGPU rendering. All 8 charts inherit `_detectRenderer()` from `BaseChartElement`.
   - What's unclear: Should `renderer-selected` be added to the shared `skills/charts/SKILL.md` (since it applies to all 8 charts) or only to line/area skill files?
   - Recommendation: Add it to `skills/charts/SKILL.md` as a shared event (since all charts fire it when `enable-webgpu` is set), AND add a specific note in line/area skills that those charts are the ONLY ones where WebGPU rendering actually activates ChartGPU. Other charts fire the event but fall through to Canvas.

2. **`pushData(point, seriesIndex?)` — applies to line/area only or all charts?**
   - What we know: The `seriesIndex` parameter is only in `LuiLineChart.pushData()` and `LuiAreaChart.pushData()`. The base `BaseChartElement.pushData()` takes `(point: unknown)` — one arg. `LuiCandlestickChart.pushData()` takes `(point: unknown)` — one arg.
   - What's unclear: Should `skills/charts/SKILL.md` shared method table be updated?
   - Recommendation: Do NOT change `skills/charts/SKILL.md` shared method table signature — it shows the base signature `(point: unknown)`. Add a note in line/area skill files that their `pushData` extends the base with an optional `seriesIndex` param.

---

## Sources

### Primary (HIGH confidence)

- `packages/charts/src/line/line-chart.ts` — LuiLineChart implementation, `pushData(point, seriesIndex?)`, `_initWebGpuLayer()`, `renderer` field, `enable-webgpu` attribute, `maxPoints = 500_000`
- `packages/charts/src/area/area-chart.ts` — LuiAreaChart implementation — confirmed identical WebGPU pattern to line chart
- `packages/charts/src/base/base-chart-element.ts` — BaseChartElement, `_detectRenderer()`, `enableWebGpu @property()`, `renderer: RendererTier = 'canvas'`, `renderer-selected` event dispatch
- `packages/charts/src/shared/webgpu-device.ts` — `RendererTier` type, `acquireGpuDevice`, GPUDevice singleton
- `packages/charts/src/candlestick/candlestick-chart.ts` — `_MA_DEFAULT_COLOR_TOKENS`, `_resolveMAColors()`, `_maStateMachines` rebuild in `_applyData()`
- `packages/charts/src/shared/ma-state-machine.ts` — NaN guard in `SMAState.push()` + `EMAState.push()`, `MAStateMachine.trim()`
- `packages/charts/src/shared/candlestick-option-builder.ts` — `MAConfig` type with `showType?`, optional `color?`, `_maLegendName()`
- `packages/charts/package.json` — `chartgpu: 0.3.2` in `dependencies` (confirmed runtime dep, dynamic import)
- `skill/skills/line-chart/SKILL.md` — current state, confirms gaps
- `skill/skills/area-chart/SKILL.md` — current state, confirms gaps
- `skill/skills/candlestick-chart/SKILL.md` — current state, confirms gaps
- `apps/docs/src/pages/charts/LineChartPage.tsx` — current state, confirms gaps
- `apps/docs/src/pages/charts/AreaChartPage.tsx` — current state, confirms gaps
- `apps/docs/src/pages/charts/CandlestickChartPage.tsx` — amber callout pattern reference

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — accumulated decisions: Firefox 141+ and Safari 26+ support, two-layer canvas architecture, dynamic import strategy
- `.planning/REQUIREMENTS.md` — requirement IDs and status confirming all implementation is complete

### Tertiary (LOW confidence)

- None — all claims verified against implementation source.

---

## Metadata

**Confidence breakdown:**
- Exact gaps to fill: HIGH — verified by reading source + current skill/docs files side by side
- Code examples: HIGH — all signatures confirmed from implementation source
- Pitfalls: HIGH — derived from implementation decisions in STATE.md and source code
- Browser support table: HIGH — confirmed from Phase 98 research + STATE.md accumulated context (Firefox 141+, Safari 26+, Chrome 113+)

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (documentation phase — no external dependencies; valid until implementation changes)
