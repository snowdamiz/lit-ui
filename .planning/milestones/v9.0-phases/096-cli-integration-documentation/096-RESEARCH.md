# Phase 96: CLI Integration + Documentation - Research

**Researched:** 2026-02-28
**Domain:** CLI registry extension, Node.js package.json subpath exports, React/Vite docs site
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLI-01 | Developer can install any chart component via `npx lit-ui add [chart-name]` | Existing CLI `add` command + registry pattern is fully understood; just needs 8 new registry entries and templates |
| CLI-02 | Developer can import individual chart types via subpath exports (`@lit-ui/charts/line-chart`) | Vite `build.lib.entry` supports multi-entry objects; package.json `exports` field accepts multiple subpath keys |
| CLI-03 | Developer can get a working copy-source starter template for each of the 8 chart types | Templates are TypeScript strings embedded in `packages/cli/src/templates/`; same pattern needed for each chart |
| DOCS-01 | Developer can reference a complete interactive demo, API property table, and CSS token table for each chart type | Docs site is React + Vite with `ExampleBlock`/`PropsTable` components already in place; needs 8 new page TSX files |
| DOCS-02 | Developer can understand bundle size impact (Canvas vs WebGL, per-chart tree-shaking) | Requires a bundle size section in docs; actual sizes need measurement or well-informed estimates from dist/ |
</phase_requirements>

---

## Summary

Phase 96 is the final phase of the v9.0 Charts System. It connects the completed 8-chart implementation to the two developer-facing surfaces: the CLI (`npx lit-ui add <chart-name>`) and the docs site. All infrastructure already exists — the CLI `add` command, the registry JSON, the template embedding pattern, and the React docs component kit (`ExampleBlock`, `PropsTable`) are all proven and in production use for the 18 existing components.

The CLI work is purely additive: add 8 entries to `registry.json`, add 8 template files with working starter code, register them in `templates/index.ts`, and update `install-component.ts` with the `@lit-ui/charts` package name. Charts are an npm-mode component (one package, not copy-source), so the template is a "copy-source starter" — a ready-to-use component file the developer drops into their own project. No new CLI command logic is needed.

The docs work is the larger portion: create 8 TSX page files following the established `ButtonPage.tsx` pattern, add them to the React Router config in `App.tsx`, and register them in `nav.ts`. Each chart page needs an `ExampleBlock` live demo (rendering the actual `lui-*-chart` element), a `PropsTable` with all chart properties, and a CSS token table. The docs app needs `@lit-ui/charts` added as a workspace dependency. A bundle size section covering Canvas vs WebGL impact and per-chart tree-shaking numbers completes DOCS-02.

**Primary recommendation:** Treat this as two independent work streams — CLI (registry + templates + install-component.ts) and Docs (nav + routes + 8 page files + App.tsx). Both are purely additive with no changes to existing chart code.

---

## Standard Stack

### Core (already installed — no new deps needed for CLI work)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| tsup | ^8.3.6 | CLI build (bundles templates inline) | Already in `packages/cli` devDeps |
| citty | ^0.1.6 | CLI command framework | Already powers the `add` command |
| consola | ^3.4.0 | CLI logging | Already used throughout CLI |

### Core (docs site — one new dep needed)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| @lit-ui/charts | workspace:* | Import charts for live demos | Must be added to `apps/docs/package.json` |
| react-router | ^7.12.0 | Page routing | Already in docs app |
| ExampleBlock | (internal) | Live preview + code tabs | Already in `apps/docs/src/components/` |
| PropsTable | (internal) | Property API display | Already in `apps/docs/src/components/` |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| vite-plugin-dts | ^4.5.4 | Type declarations | Already handles `@lit-ui/charts` types |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single-entry vite build | Multi-entry vite build for subpath exports | Multi-entry is needed for CLI-02 tree-shaking; single-entry cannot produce per-chart subpath modules |
| Copy-source CLI mode | npm install mode | Charts are a single package (`@lit-ui/charts`), not separate packages; copy-source mode gives developers a working file to start from, npm mode installs the whole package |

**Installation (docs app only):**
```bash
# In apps/docs/package.json — add to dependencies
"@lit-ui/charts": "workspace:*"
```

---

## Architecture Patterns

### Recommended File Structure for Phase 96
```
packages/charts/
├── vite.config.ts                     # Update: multi-entry for subpath exports (CLI-02)
├── package.json                       # Update: add 8 subpath export entries (CLI-02)
└── src/
    ├── line/line-chart.ts             # No change
    ├── area/area-chart.ts             # No change
    └── [...]                          # No change to any existing chart files

packages/cli/src/
├── registry/registry.json             # Update: add 8 chart entries (CLI-01)
├── templates/
│   ├── line-chart.ts                  # New: LINE_CHART_TEMPLATE (CLI-03)
│   ├── area-chart.ts                  # New: AREA_CHART_TEMPLATE (CLI-03)
│   ├── bar-chart.ts                   # New: BAR_CHART_TEMPLATE (CLI-03)
│   ├── pie-chart.ts                   # New: PIE_CHART_TEMPLATE (CLI-03)
│   ├── scatter-chart.ts               # New: SCATTER_CHART_TEMPLATE (CLI-03)
│   ├── heatmap-chart.ts               # New: HEATMAP_CHART_TEMPLATE (CLI-03)
│   ├── candlestick-chart.ts           # New: CANDLESTICK_CHART_TEMPLATE (CLI-03)
│   ├── treemap-chart.ts               # New: TREEMAP_CHART_TEMPLATE (CLI-03)
│   └── index.ts                       # Update: add 8 exports + COMPONENT_TEMPLATES entries (CLI-03)
└── utils/
    └── install-component.ts           # Update: add 8 chart names → @lit-ui/charts (CLI-01)

apps/docs/
├── package.json                       # Update: add @lit-ui/charts workspace dep (DOCS-01)
└── src/
    ├── App.tsx                        # Update: add 8 chart routes (DOCS-01)
    ├── nav.ts                         # Update: add Charts section with 8 items (DOCS-01)
    └── pages/charts/
        ├── LineChartPage.tsx          # New (DOCS-01)
        ├── AreaChartPage.tsx          # New (DOCS-01)
        ├── BarChartPage.tsx           # New (DOCS-01)
        ├── PieChartPage.tsx           # New (DOCS-01)
        ├── ScatterChartPage.tsx       # New (DOCS-01)
        ├── HeatmapChartPage.tsx       # New (DOCS-01)
        ├── CandlestickChartPage.tsx   # New (DOCS-01)
        └── TreemapChartPage.tsx       # New (DOCS-01)
```

### Pattern 1: Multi-Entry Vite Build for Subpath Exports (CLI-02)

**What:** Configure `vite.config.ts` to build one ES module output per chart type, enabling `import '@lit-ui/charts/line-chart'` as a subpath that excludes all other chart code.
**When to use:** Any library package that needs per-feature tree-shaking.

**vite.config.ts update:**
```typescript
// Source: https://vite.dev/guide/build#library-mode
import { createLibraryConfig } from '@lit-ui/vite-config/library';

// Multi-entry: one output file per chart type
export default createLibraryConfig({
  entry: {
    index: 'src/index.ts',
    'line-chart': 'src/line/line-chart.ts',
    'area-chart': 'src/area/area-chart.ts',
    'bar-chart': 'src/bar/bar-chart.ts',
    'pie-chart': 'src/pie/pie-chart.ts',
    'scatter-chart': 'src/scatter/scatter-chart.ts',
    'heatmap-chart': 'src/heatmap/heatmap-chart.ts',
    'candlestick-chart': 'src/candlestick/candlestick-chart.ts',
    'treemap-chart': 'src/treemap/treemap-chart.ts',
  }
});
```

**CRITICAL:** `createLibraryConfig` currently accepts `entry: string`. It must be updated to also accept `entry: Record<string, string>` and pass the object directly to Vite's `build.lib.entry`. Vite's lib mode natively supports an entry object — each key becomes a separate output file name.

**package.json exports update:**
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./line-chart": {
      "import": "./dist/line-chart.js",
      "types": "./dist/line-chart.d.ts"
    },
    "./area-chart": {
      "import": "./dist/area-chart.js",
      "types": "./dist/area-chart.d.ts"
    },
    "./bar-chart": {
      "import": "./dist/bar-chart.js",
      "types": "./dist/bar-chart.d.ts"
    },
    "./pie-chart": {
      "import": "./dist/pie-chart.js",
      "types": "./dist/pie-chart.d.ts"
    },
    "./scatter-chart": {
      "import": "./dist/scatter-chart.js",
      "types": "./dist/scatter-chart.d.ts"
    },
    "./heatmap-chart": {
      "import": "./dist/heatmap-chart.js",
      "types": "./dist/heatmap-chart.d.ts"
    },
    "./candlestick-chart": {
      "import": "./dist/candlestick-chart.js",
      "types": "./dist/candlestick-chart.d.ts"
    },
    "./treemap-chart": {
      "import": "./dist/treemap-chart.js",
      "types": "./dist/treemap-chart.d.ts"
    }
  }
}
```

### Pattern 2: CLI Registry Entry for Chart Components (CLI-01)

**What:** Each chart is a registry entry with `type: "component"`, a single file, and `"dependencies": ["@lit-ui/charts"]`. No `registryDependencies` because charts do not depend on other CLI components.
**When to use:** Every chart type needs its own registry entry.

```json
// Source: packages/cli/src/registry/registry.json pattern
{
  "name": "line-chart",
  "description": "Real-time line chart with multi-series, smooth curves, zoom/pan, and streaming via pushData()",
  "files": [
    { "path": "components/charts/line-chart.ts", "type": "component" }
  ],
  "dependencies": ["@lit-ui/charts"],
  "registryDependencies": []
}
```

**IMPORTANT:** The `files[].path` is a logical registry path, not a filesystem path. The `getTargetPath()` function in `copy-component.ts` maps it to `config.componentsPath + "/" + basename(path)`. So a file with `"path": "components/charts/line-chart.ts"` will be written to `{cwd}/{componentsPath}/line-chart.ts`.

### Pattern 3: Chart Template (CLI-03)

**What:** A TypeScript string exported from a template file. The template is a "working copy-source starter" — a Lit component file using `@lit-ui/charts` as an npm import, demonstrating key props.
**When to use:** All 8 chart types need one template file each.

```typescript
// Source: packages/cli/src/templates/button.ts pattern
export const LINE_CHART_TEMPLATE = `/**
 * line-chart - Line chart using @lit-ui/charts
 * Usage: <my-line-chart></my-line-chart>
 */
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LuiLineChart } from '@lit-ui/charts/line-chart';
// ...
`;
```

**Key decision:** Templates import from subpath `@lit-ui/charts/line-chart` (not `@lit-ui/charts`) to enable tree-shaking in user projects. This directly demonstrates CLI-02 value.

### Pattern 4: Docs Page Structure (DOCS-01)

**What:** Each chart page is a TSX file following the `ButtonPage.tsx` pattern with these sections:
1. Side-effect import: `import '@lit-ui/charts/line-chart'`
2. Props data arrays: `lineChartProps: PropDef[]`
3. CSS token data arrays: `lineChartCSSVars: CSSVarDef[]`
4. Code examples as template literal strings
5. `ExampleBlock` components with inline JSX `lui-line-chart` preview
6. `PropsTable` with props data
7. CSS token table (bespoke table or reuse PropsTable pattern)

```typescript
// Source: apps/docs/src/pages/components/ButtonPage.tsx pattern
import '@lit-ui/charts/line-chart';

const lineChartProps: PropDef[] = [
  { name: 'data', type: 'LineChartSeries[]', default: 'undefined', description: 'Chart series data.' },
  { name: 'smooth', type: 'boolean', default: 'false', description: 'Enable smooth curve interpolation.' },
  { name: 'zoom', type: 'boolean', default: 'false', description: 'Enable zoom/pan controls.' },
  { name: 'mark-lines', type: 'MarkLineSpec[]', default: 'undefined', description: 'Threshold lines.' },
  // ... inherited BaseChartElement props ...
];
```

**The `lui-*-chart` elements in the JSX preview are already declared via TypeScript's `JSX.IntrinsicElements` / `HTMLElementTagNameMap` in the chart sources. No additional JSX declarations needed.**

### Pattern 5: Bundle Size Documentation (DOCS-02)

**What:** A static "Bundle Size" section on a dedicated charts guide page (or on each chart page). Lists estimated gzipped sizes.
**Data from dist/ inspection:**
- Full `@lit-ui/charts` (all 8 charts): dist/index.js is 36KB, plus shared chunks ~1.8MB total (mostly ECharts modules). Gzipped ECharts core tree-shaken bundle is approximately 135KB (per STATE.md: "Per-chart registry files tree-shake ECharts to ~135KB gzipped vs 400KB for full import").
- Canvas mode: ~135KB gzipped for any single chart type
- WebGL mode (scatter with `enable-gl`): Canvas size + echarts-gl (~200KB gzipped additional, loaded dynamically)
- Per-chart subpath import: developer gets only the chart component file + shared ECharts modules registered by that chart's registry

**DOCS-02 content structure:**
```
## Bundle Size

### Full import vs Subpath import
| Import Style | What's included | Approx. gzipped |
|---|---|---|
| `import '@lit-ui/charts'` | All 8 chart types + all ECharts modules | ~350KB+ |
| `import '@lit-ui/charts/line-chart'` | LineChart + line+area ECharts modules | ~135KB |
| `import '@lit-ui/charts/scatter-chart'` | ScatterChart + scatter ECharts modules | ~135KB |

### Canvas vs WebGL (Scatter chart only)
| Mode | How to enable | Additional size |
|---|---|---|
| Canvas | Default (no attribute) | 0 (included in base) |
| WebGL | `enable-gl` attribute | ~200KB gzipped (lazy loaded) |
```

### Anti-Patterns to Avoid

- **Adding chart templates as copy-source for non-copy-source mode:** Charts should be in `npm` mode (`componentToPackage` map) as well as `copy-source` mode. A user running `npx lit-ui add line-chart` in `copy-source` mode gets a starter file; in `npm` mode they get the package installed. Both paths should work.
- **Using `new CustomEvent` in chart templates:** Templates should use the `@lit-ui/charts` import API, not reimplementing ECharts.
- **Forgetting `sideEffects: true` for subpath exports:** `package.json` already has `"sideEffects": true` — do NOT change this; chart files register custom elements as side effects.
- **Forgetting DTS for subpath entries:** `vite-plugin-dts` with `rollupTypes: true` and `entryRoot: 'src'` will generate one `.d.ts` per entry. No extra configuration needed.
- **JSX type errors for `lui-*-chart` elements:** Custom elements declared in `HTMLElementTagNameMap` in source files are available in JSX as intrinsic elements when the chart package is imported. The import side-effect (`import '@lit-ui/charts/line-chart'`) is sufficient.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLI command parsing | Custom argv parser | citty (already used) | Already powers all CLI commands |
| File conflict resolution | Custom prompt | consola.prompt (already used) | copy-component.ts already handles conflicts |
| Template embedding | Runtime file reads from npm registry | Inline TypeScript string templates (already pattern) | tsup bundles them inline; no runtime file I/O needed |
| Type declarations for subpaths | Manual `.d.ts` files | vite-plugin-dts with multi-entry | Automatically generates per-entry type files |
| Bundle size measurement | Manual wc -c + gzip | Inspect dist/ sizes + knowledge from STATE.md | STATE.md states ~135KB gzipped for tree-shaken bundle |

**Key insight:** Everything in Phase 96 is additive to fully proven patterns. No new infrastructure required. The risk is in getting all 8 templates correct and all props documented accurately, not in the tooling.

---

## Common Pitfalls

### Pitfall 1: vite-config `createLibraryConfig` does not accept object entry
**What goes wrong:** `createLibraryConfig({ entry: { index: '...', 'line-chart': '...' } })` passes the object as-is to `build.lib.entry`. But the current implementation types `entry` as `string` and uses it in `fileName: 'index'`. Multi-entry builds need `fileName` removed (Vite ignores it when entry is an object).
**Why it happens:** `createLibraryConfig` was designed for single-entry packages.
**How to avoid:** Update `createLibraryConfig` to accept `entry: string | Record<string, string>`. When entry is an object, omit `fileName` from the lib config — Vite uses the entry key as the file name automatically.
**Warning signs:** Build produces only `index.js` regardless of how many entries are configured.

### Pitfall 2: Missing subpath export → TypeScript "cannot find module" error
**What goes wrong:** `import '@lit-ui/charts/line-chart'` causes TS error if `package.json` exports field doesn't include `"./line-chart"`.
**Why it happens:** TypeScript 4.7+ and Node.js 12.17+ require explicit exports map entries for subpath imports.
**How to avoid:** Every subpath entry in the vite build must have a corresponding `exports` field entry in `package.json`.
**Warning signs:** `tsc` reports `Cannot find module '@lit-ui/charts/line-chart'`.

### Pitfall 3: Chart template imports from `@lit-ui/charts` (full) instead of subpath
**What goes wrong:** Template imports `import { LuiLineChart } from '@lit-ui/charts'` — this defeats tree-shaking in user projects.
**Why it happens:** Developer writes template using the main export without thinking about subpaths.
**How to avoid:** All 8 templates MUST import from the subpath: `import '@lit-ui/charts/line-chart'`. The template demonstrates the correct tree-shaking import pattern.
**Warning signs:** Bundler analysis shows all 8 chart types in a user's bundle after adding just one chart.

### Pitfall 4: Docs live demo tries to render chart without data
**What goes wrong:** `<lui-line-chart></lui-line-chart>` renders a blank canvas with no visible output. Demo looks broken.
**Why it happens:** All chart components require a `data` property to render anything.
**How to avoid:** Every `ExampleBlock` preview must set data via a `ref` + `useEffect` (property assignment) or via a wrapper Lit element. Charts do NOT accept JSON attribute for data (per REQUIREMENTS.md Out of Scope: "`data="[...]"` attribute serialization"). Use a React `useRef` + `useEffect` to call `.data = [...]` on the element after mount.
**Warning signs:** Preview area shows empty chart skeleton.

**Verified workaround pattern for React docs:**
```typescript
// In React docs page — use useRef to set the .data property
import { useEffect, useRef } from 'react';

function LineChartDemo() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).data = [
        { name: 'Series A', data: [120, 200, 150, 80, 70, 110, 130] }
      ];
    }
  }, []);
  return <lui-line-chart ref={ref} style={{ height: '300px' }} />;
}
```

### Pitfall 5: Chart element not registered when docs page loads
**What goes wrong:** The `lui-line-chart` custom element is used in JSX before the chart package has registered it.
**Why it happens:** Custom element registration happens as a side effect of the import. If the import is not present, the element renders as `HTMLUnknownElement`.
**How to avoid:** Every chart page MUST have a side-effect import at the top: `import '@lit-ui/charts/line-chart'`.
**Warning signs:** Browser console shows `lui-line-chart is not a registered element`.

### Pitfall 6: install-component.ts charts all map to same package
**What goes wrong:** Each of the 8 chart names (`line-chart`, `area-chart`, etc.) maps to `@lit-ui/charts` (singular package). The CLI must NOT try to install `@lit-ui/line-chart` (doesn't exist).
**Why it happens:** Other CLI components like button map to their own package (`@lit-ui/button`). Developers might follow that pattern for charts.
**How to avoid:** In `install-component.ts`, add all 8 chart names mapping to `@lit-ui/charts`. When any chart is installed in npm mode, only `@lit-ui/charts` is installed (once, idempotently).

---

## Code Examples

### Multi-entry vite config (Pattern for vite-config/library.js update)
```typescript
// Source: vite.dev/guide/build#library-mode + current library.js inspection
export function createLibraryConfig(options = {}) {
  const entry = options.entry || 'src/index.ts';
  const entryRoot = options.entryRoot || 'src';

  return defineConfig({
    plugins: [tailwindcss(), dts({ rollupTypes: true, entryRoot })],
    build: {
      lib: {
        entry,
        formats: ['es'],
        // fileName is only used for single-entry (string) builds.
        // When entry is an object, Vite uses object keys as file names — omit fileName.
        ...(typeof entry === 'string' ? { fileName: 'index' } : {}),
      },
      rollupOptions: {
        external: ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//]
      }
    }
  });
}
```

### Registry entry for charts (Pattern for registry.json additions)
```json
{
  "name": "line-chart",
  "description": "Real-time line chart with multi-series, smooth curves, zoom/pan, and streaming via pushData(). Powered by ECharts via @lit-ui/charts.",
  "files": [
    { "path": "components/charts/line-chart.ts", "type": "component" }
  ],
  "dependencies": ["@lit-ui/charts"],
  "registryDependencies": []
}
```

### Chart template structure (Pattern for all 8 templates)
```typescript
// Source: packages/cli/src/templates/button.ts pattern + chart API from source files
export const LINE_CHART_TEMPLATE = `/**
 * my-line-chart — starter line chart using @lit-ui/charts
 *
 * Usage:
 *   <my-line-chart></my-line-chart>
 *
 * Set data via JavaScript property (not attribute):
 *   document.querySelector('my-line-chart').data = [
 *     { name: 'Series A', data: [120, 200, 150, 80] }
 *   ];
 */
import { html, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LuiLineChart } from '@lit-ui/charts/line-chart';
import type { LineChartSeries } from '@lit-ui/charts';

// Ensure LuiLineChart is imported (registers custom element)
void LuiLineChart;

@customElement('my-line-chart')
export class MyLineChart extends LitElement {
  static override styles = css\`
    :host { display: block; }
    lui-line-chart { --ui-chart-height: 300px; }
  \`;

  render() {
    return html\`
      <lui-line-chart
        .data=\${[
          { name: 'Sales', data: [120, 200, 150, 80, 70, 110, 130] },
          { name: 'Revenue', data: [60, 100, 80, 40, 50, 75, 90] },
        ] satisfies LineChartSeries[]}
        smooth
        zoom
      ></lui-line-chart>
    \`;
  }
}
`;
```

### install-component.ts additions (Pattern for CLI-01 npm mode)
```typescript
// Source: packages/cli/src/utils/install-component.ts — add to componentToPackage
export const componentToPackage: Record<string, string> = {
  // ... existing entries ...
  'line-chart': '@lit-ui/charts',
  'area-chart': '@lit-ui/charts',
  'bar-chart': '@lit-ui/charts',
  'pie-chart': '@lit-ui/charts',
  'scatter-chart': '@lit-ui/charts',
  'heatmap-chart': '@lit-ui/charts',
  'candlestick-chart': '@lit-ui/charts',
  'treemap-chart': '@lit-ui/charts',
};
```

### Docs chart page props reference (all 8 charts' props)

**BaseChartElement shared props (appears in all chart prop tables):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | chart-specific | `undefined` | Chart data (set via JS property) |
| `option` | `EChartsOption` | `undefined` | Raw ECharts option passthrough |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `enable-gl` | `boolean` | `false` | WebGL rendering (scatter only, other charts ignore) |
| `max-points` | `number` | `1000` | Streaming buffer capacity |

**LuiLineChart props:**
| Prop | Type | Default |
|------|------|---------|
| `smooth` | `boolean` | `false` |
| `zoom` | `boolean` | `false` |
| `mark-lines` | `MarkLineSpec[]` | `undefined` |

**LuiAreaChart props:** Same as LuiLineChart plus `stacked: boolean` (default `false`).

**LuiBarChart props:**
| Prop | Type | Default |
|------|------|---------|
| `stacked` | `boolean` | `false` |
| `horizontal` | `boolean` | `false` |
| `show-labels` | `boolean` | `false` |
| `color-by-data` | `boolean` | `false` |

**LuiPieChart props:**
| Prop | Type | Default |
|------|------|---------|
| `min-percent` | `number` | `0` |
| `inner-radius` | `string\|number` | `''` |
| `center-label` | `string` | `''` |

**LuiScatterChart props:**
| Prop | Type | Default |
|------|------|---------|
| `bubble` | `boolean` | `false` |

**LuiHeatmapChart props:**
| Prop | Type | Default |
|------|------|---------|
| `x-categories` | `string[]` | `[]` |
| `y-categories` | `string[]` | `[]` |
| `color-range` | `[string,string]` | `['#313695','#a50026']` |

**LuiCandlestickChart props:**
| Prop | Type | Default |
|------|------|---------|
| `bull-color` | `string` | `'#26a69a'` |
| `bear-color` | `string` | `'#ef5350'` |
| `show-volume` | `boolean` | `false` |
| `moving-averages` | `MAConfig[]` (JSON attr) | `undefined` |

**LuiTreemapChart props:**
| Prop | Type | Default |
|------|------|---------|
| `breadcrumb` | `boolean` | `true` |
| `rounded` | `boolean` | `false` |
| `level-colors` | `string[][]` (JSON attr) | `null` |

### CSS token table (all charts share these from ThemeBridge)
| Token | Default | Description |
|-------|---------|-------------|
| `--ui-chart-height` | `300px` | Chart element height |
| `--ui-chart-color-1` through `--ui-chart-color-8` | `#3b82f6`, etc. | Series palette colors |
| `--ui-chart-grid-line` | `#e5e7eb` | Grid line color |
| `--ui-chart-axis-label` | `#6b7280` | Axis label text color |
| `--ui-chart-axis-line` | `#d1d5db` | Axis line color |
| `--ui-chart-tooltip-bg` | `#ffffff` | Tooltip background |
| `--ui-chart-tooltip-border` | `#e5e7eb` | Tooltip border |
| `--ui-chart-tooltip-text` | `#111827` | Tooltip text color |
| `--ui-chart-legend-text` | `#374151` | Legend text color |
| `--ui-chart-font-family` | `system-ui, sans-serif` | Chart font |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `exports: "."` in package.json | `exports` map with named subpaths | Node.js 12.17 / Node.js 16 LTS | Enables tree-shaking at per-chart granularity |
| `main` field only | `exports` field takes precedence | Node.js 12+ / bundlers since 2020 | Both fields present; modern tooling uses `exports` |
| Runtime template file reads | Bundled inline TypeScript strings | This project's established pattern | No filesystem access needed at CLI runtime |

**Deprecated/outdated:**
- `module` field in package.json: Redundant when `exports` is present with `"import"` condition. Still harmless to keep.
- `lib.fileName` in vite build config: Only applies to single-entry builds. Must be conditionally omitted for multi-entry object.

---

## Open Questions

1. **Does `createLibraryConfig` in `packages/vite-config/library.js` need updating, or should charts have its own `vite.config.ts`?**
   - What we know: `createLibraryConfig` accepts `entry: string` today; charts currently passes a string. Multi-entry requires an object.
   - What's unclear: Whether to modify the shared helper (affecting all packages) or just replace charts' `vite.config.ts` with a bespoke config.
   - Recommendation: Give `@lit-ui/charts` a bespoke `vite.config.ts` that extends the shared config pattern but with its own multi-entry. This avoids risk to other packages. The shared `createLibraryConfig` is still available as an import but charts writes its own `defineConfig` directly.

2. **Should chart templates be in `copy-source` mode, `npm` mode, or both?**
   - What we know: The CLI supports both modes. Charts exist as a single npm package. The `copy-source` mode copies a template file; the `npm` mode installs the package.
   - What's unclear: Whether a developer running `npx lit-ui add line-chart` would expect a template file or a package install.
   - Recommendation: Support both modes. Add to both `registry.json` (enables copy-source) AND `install-component.ts` (enables npm mode). The user's `lit-ui.config.json` mode determines which path runs. A user in copy-source mode gets a useful starter wrapper component; a user in npm mode gets `@lit-ui/charts` installed.

3. **How to handle data property binding in React docs demos?**
   - What we know: Charts cannot accept JSON data via HTML attributes (per REQUIREMENTS.md Out of Scope). JSX cannot set `.data = [...]` directly.
   - What's unclear: Best pattern for docs demos that need data.
   - Recommendation: Use a React wrapper component with `useRef` + `useEffect` for each demo. This is already established as the correct pattern for Web Components in React. The wrapper can be co-located inline in the page file.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection of `packages/cli/src/` — CLI architecture, registry.json format, template pattern, add command logic
- Direct file inspection of `packages/charts/src/` — all 8 chart components' props, types, and CSS tokens
- Direct file inspection of `apps/docs/src/` — page structure, ExampleBlock, PropsTable, nav.ts, App.tsx routing
- Direct file inspection of `packages/vite-config/library.js` — current `createLibraryConfig` signature
- Vite library mode docs (vite.dev/guide/build#library-mode) — multi-entry object support verified

### Secondary (MEDIUM confidence)
- STATE.md architecture notes: "Per-chart registry files tree-shake ECharts to ~135KB gzipped vs 400KB for full import" — bundle size numbers for DOCS-02
- `dist/` directory inspection: total file sizes for bundle size documentation

### Tertiary (LOW confidence)
- echarts-gl gzipped size estimate (~200KB additional) — based on general knowledge of the library; not directly measured from dist/

---

## Metadata

**Confidence breakdown:**
- CLI work (CLI-01, CLI-03): HIGH — codebase fully understood, patterns identical to existing 18 components
- Subpath exports (CLI-02): HIGH — Vite multi-entry and package.json exports map are well-documented
- Docs page structure (DOCS-01): HIGH — React docs app fully understood, existing page patterns clear
- Bundle size numbers (DOCS-02): MEDIUM — Canvas sizes confirmed from STATE.md; WebGL size is an estimate
- vite-config update risk: MEDIUM — multi-entry is standard Vite feature but requires care to not break other packages

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (stable tooling ecosystem)
