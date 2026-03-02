# Stack Research

**Domain:** Node.js programmatic image generation from XML text (v10.1 Component Knowledge Image)
**Researched:** 2026-03-01
**Confidence:** HIGH (core library choice); HIGH (integration pattern); MEDIUM (@napi-rs/canvas font bundling in pnpm workspace)

---

## Context: What Already Exists (Do Not Re-Research)

This is an additive milestone on top of the working v10.0 monorepo. These are validated and must not change:

| Technology | Version | Status |
|------------|---------|--------|
| Node.js | >=20.0.0 (running v25.3.0) | Monorepo engine requirement |
| pnpm | >=10.0.0 (10.0.0) | Workspace package manager |
| TypeScript | ^5.9.3 | ES2022 target, ESNext modules |
| tsup | ^8.3.6 | CLI build tool (already in packages/cli) |
| citty | ^0.1.6 | CLI framework (already in packages/cli) |
| fs-extra | ^11.3.0 | File system utilities (already in packages/cli) |
| pathe | ^2.0.2 | Path utilities (already in packages/cli) |

The new image generation tooling lives inside the existing `packages/cli` package or as a standalone script in `scripts/`. No new package is needed.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@napi-rs/canvas` | ^0.1.95 | Canvas 2D API in Node.js for text rendering | Zero system dependencies — uses Skia (Rust/napi-rs), not Cairo. No `node-gyp` compile step. Ships pre-built binaries for macOS arm64/x64, Windows x64, Linux x64 gnu/musl. The alternative `canvas` (node-canvas, Cairo-based) requires system-level Cairo + Pango install and has recurring `registerFont` bugs on Linux. `@napi-rs/canvas` exposes `GlobalFonts.registerFromPath()` to load font files bundled with the package — no system font installation needed. ~20MB install vs 45MB + 61 dependencies for node-canvas. HIGH confidence — verified on npm 2026-03-01, version 0.1.95 published days ago, actively maintained. |
| `fast-xml-parser` | ^4.5.1 | Parse XML knowledge file into structured text | Pure JavaScript, zero dependencies, 6M+ downloads/week, handles large files (tested to 100MB). Needed to parse the XML knowledge file and extract/flatten text content for rendering. The XML-to-image pipeline is: read XML file → parse to text → wrap lines → render on canvas. If the knowledge image just renders raw XML text verbatim (no structured parsing), this is optional — but parsing enables smart per-section layout. MEDIUM confidence — recommended based on npm download data and community adoption. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sharp` | ^0.34.5 | Optional: convert canvas PNG output or composite images | Only needed if post-processing the canvas output (adding borders, compressing, format conversion). For pure text-on-white-background PNG output via `@napi-rs/canvas`, sharp is NOT needed — `canvas.toBuffer('image/png')` writes directly to disk. Add only if the output image needs resizing or format conversion beyond PNG. |

### Development Tools (No Changes Needed)

The existing tsup + TypeScript pipeline in `packages/cli` handles compilation. The image generation script can be:
- A standalone Node.js script in `scripts/generate-knowledge-image.mjs` (like the existing `scripts/install-skill.mjs`), OR
- A new CLI command added to `packages/cli/src/commands/` (citty subcommand pattern already established)

No new dev tooling is required.

---

## Installation

```bash
# Add @napi-rs/canvas to packages/cli (where the generation script lives)
pnpm add @napi-rs/canvas --filter @lit-ui/cli

# If XML parsing of the knowledge file is needed beyond raw text passthrough:
pnpm add fast-xml-parser --filter @lit-ui/cli

# sharp is NOT needed for basic PNG output — skip unless post-processing is required
```

**Font bundling:** Bundle the monospace font file (e.g., `JetBrainsMono-Regular.ttf` or `CourierPrime-Regular.ttf`) inside `packages/cli/src/fonts/`. Register at runtime using `GlobalFonts.registerFromPath()` before any canvas draw calls. Do NOT rely on system-installed fonts — the script must be portable across developer machines, CI, and Windows.

---

## Implementation Notes

### Rendering Pipeline

The image generation script follows this sequence:

```
1. Read XML knowledge file (skill/knowledge.xml or similar)
2. Parse XML → extract text content in render order
3. Calculate canvas height dynamically:
   - Measure each line with ctx.measureText()
   - Count total lines × lineHeight → set canvas height
4. createCanvas(1500, totalHeight)
5. Fill background white
6. Set font: "8pt JetBrainsMono" (or equivalent monospace)
7. Walk lines, render with ctx.fillText() at fixed x=padding, y=lineHeight*n
8. canvas.toBuffer('image/png') → write to skill/
```

### Font Choice and Bundling

Use **JetBrains Mono** (OFL license, free) or **Courier Prime** (OFL, free) as the bundled monospace font. Both are available as `.ttf` files that can be committed to the repository.

`GlobalFonts.registerFromPath()` API (HIGH confidence — verified from @napi-rs/canvas GitHub):

```typescript
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Register bundled font — no system install needed
GlobalFonts.registerFromPath(
  join(__dirname, 'fonts', 'JetBrainsMono-Regular.ttf'),
  'JetBrainsMono'
);

const canvas = createCanvas(1500, totalHeight);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 1500, totalHeight);
ctx.fillStyle = '#000000';
ctx.font = '11px JetBrainsMono';  // "8pt" = ~11px at 96dpi
```

**Unit conversion:** CSS pt to px — 1pt = 1.333px at 96 DPI. 8pt = 10.67px ≈ 11px. Use `11px` in `ctx.font` for 8pt at screen resolution.

### Dynamic Height Calculation

Canvas height is computed before creating the canvas — two-pass approach:

```typescript
// Pass 1: count total rendered lines
const lines = computeWrappedLines(xmlText, ctx, maxWidth=1460); // 1500 - 2*20px padding
const lineHeight = 14; // px — 11px font + 3px leading
const totalHeight = lines.length * lineHeight + 40; // top+bottom padding

// Pass 2: render to canvas of that height
const canvas = createCanvas(1500, totalHeight);
```

For the first pass, you need a temporary canvas to measure text. Create a small probe canvas (`createCanvas(1, 1)`) with the same font settings for `measureText()` calls before creating the full-size canvas.

### XML Text Extraction

The simplest approach is to read the XML file as raw text and render it verbatim (monospace font, no HTML entity decoding needed for display). If structured rendering is required (section headers bold, etc.), use `fast-xml-parser` to walk the tree and reconstruct the text with formatting markers.

For a condensed reference image where the goal is maximum information density, rendering the raw XML text verbatim (with line wrapping at 1500px) is the correct default approach — it preserves the structure visually without any parsing complexity.

### Canvas Height Limit

`@napi-rs/canvas` (Skia-backed) has no hard-coded height limit in its API. Height is limited only by available system memory. For reference, the entire LitUI skill corpus is approximately 117,000+ lines of source — the rendered XML knowledge file will be far smaller (XML is a subset of that). Expect the rendered image to be 5,000–30,000px tall. At 1500px wide × 20,000px tall × 4 bytes/pixel = ~120MB in-memory pixel buffer — well within Node.js defaults. No `--max-old-space-size` flag is needed for this use case.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `@napi-rs/canvas` (Skia, pre-built binaries) | `canvas` npm package (node-canvas, Cairo) | node-canvas requires system Cairo + Pango (no pre-built binaries without `node-gyp`). `registerFont()` has known broken behavior on Linux (issue #2285, #2255). `@napi-rs/canvas` ships pre-built binaries for all CI/dev targets. |
| `@napi-rs/canvas` | Puppeteer / headless Chrome | Puppeteer is 300MB+ Chrome download, spawns a browser process, requires network access for first run. Massively overkill for rendering static monospace text on white background. Downstream consumer explicitly said no headless browsers. |
| `@napi-rs/canvas` | SVG + `sharp` (librsvg path) | sharp's SVG rendering via librsvg has limited custom font support — fonts must be installed on the system, or converted to outlines. Cannot reliably embed a bundled font. Fails in CI without system font installation. |
| `@napi-rs/canvas` | `text-to-image` npm | Wrapper around node-canvas (Cairo), inherits all its system dependency and registerFont bugs. No benefit over using @napi-rs/canvas directly. |
| `@napi-rs/canvas` | `ultimate-text-to-image` npm | Also wraps node-canvas. Same system dependency problem. The auto-wrap feature is not needed — custom measureText-based wrapping is ~25 lines. |
| `fast-xml-parser` | `xml2js` | xml2js uses SAX internally, callback-based API, heavier. fast-xml-parser is simpler, zero-deps, faster. |
| `fast-xml-parser` | Built-in XML parsing via regex | XML is not parseable safely with regex. But for simple verbatim text rendering, no parsing is needed at all — render the raw XML string directly. |
| Bundled `.ttf` font file (committed to repo) | System monospace font (`Courier`, `Monaco`, `Monospace`) | System font names are not portable — macOS has "Courier New", Linux CI may have only "FreeMono" or nothing. Bundling a TTF ensures identical output everywhere. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Puppeteer / Playwright | 300MB+ browser binary, overkill for text rendering, banned by downstream consumer | `@napi-rs/canvas` — 20MB, no browser, same output |
| `canvas` npm (node-canvas, Cairo) | Requires system Cairo/Pango, registerFont is broken on Linux (issues #2255, #2285, #2097), 61 dependencies, node-gyp compile step | `@napi-rs/canvas` — pre-built Skia binaries, `GlobalFonts.registerFromPath()` works reliably |
| `GlobalFonts.register(buffer)` (Buffer overload) | Known bug in @napi-rs/canvas (issue #1006, Feb 2025): register takes a reference to the Buffer's memory, not a copy — Buffer GC invalidates the font silently | Use `GlobalFonts.registerFromPath(pathString, familyName)` — reads from disk, no memory aliasing issue |
| System fonts (Courier, Monospace, etc.) | Not portable across macOS/Linux/Windows CI — renders to different glyphs or falls back to sans-serif silently | Bundle a `.ttf` file, register with `GlobalFonts.registerFromPath()` |
| SVG intermediate + sharp | sharp's librsvg requires system fonts for text; custom font embedding fails in CI | Direct canvas text rendering with @napi-rs/canvas |
| Top-level `import '@napi-rs/canvas'` in Lit component code | @napi-rs/canvas is Node.js only — importing in a browser/SSR context would crash | Keep the generation script as a standalone Node.js script in `scripts/` or a CLI command that is only invoked in Node.js context |

---

## Stack Patterns by Variant

**If the knowledge file is rendered verbatim (raw XML text, no parsing):**
- Skip `fast-xml-parser` entirely
- Read the XML file with `fs.readFile()` → split on `\n` → wrap each line at 1500px with `measureText()` loop
- Simpler, fewer dependencies, output preserves original XML structure visually

**If the knowledge file needs structured rendering (section headers, indentation emphasis):**
- Add `fast-xml-parser` to parse the XML tree
- Walk nodes to produce `[text, indent, isHeader]` tuples
- Vary `ctx.font` for headers vs body (bold variant of the same font family)
- Register both Regular and Bold `.ttf` variants with `GlobalFonts.registerFromPath()`

**If output needs to be PNG and exactly ≤1500px wide with unlimited height:**
- `createCanvas(1500, dynamicHeight)` — this is the default pattern, no constraints
- No `sharp` needed — `canvas.toBuffer('image/png')` output is directly usable

**If output needs JPEG compression (smaller file):**
- `canvas.toBuffer('image/jpeg', { quality: 90 })` — built into @napi-rs/canvas
- For monospace text on white background, PNG is preferred (lossless, no JPEG artifacts on thin strokes)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@napi-rs/canvas@0.1.95` | Node.js >=18 | Pre-built for Node.js >=18; this monorepo requires Node.js >=20, fully compatible |
| `@napi-rs/canvas@0.1.95` | pnpm workspaces | Standard npm package, no workspace-specific config needed |
| `@napi-rs/canvas@0.1.95` | macOS arm64 (M-series) | Pre-built binary: `@napi-rs/canvas-darwin-arm64@0.1.93` |
| `@napi-rs/canvas@0.1.95` | macOS x64 | Pre-built binary: `@napi-rs/canvas-darwin-x64@0.1.88` |
| `@napi-rs/canvas@0.1.95` | Linux x64 (CI/GitHub Actions) | Pre-built binary: `@napi-rs/canvas-linux-x64-gnu@0.1.88` |
| `@napi-rs/canvas@0.1.95` | Linux x64 Alpine/musl | Pre-built binary: `@napi-rs/canvas-linux-x64-musl@0.1.93` |
| `fast-xml-parser@4.5.1` | Node.js >=12 | Pure JS, no native bindings, no compatibility concerns |
| `@napi-rs/canvas` | tsup bundler | Exclude from tsup bundle — native binary package must NOT be bundled. Add to `tsup.config.ts` `external: ['@napi-rs/canvas']`. |

**tsup external note:** If the image generation script is compiled through tsup (e.g., added as a CLI command), `@napi-rs/canvas` must be listed in `external` in `tsup.config.ts`. Native binary packages cannot be bundled by esbuild/tsup — they must remain as runtime `node_modules` dependencies.

---

## Sources

- [@napi-rs/canvas npm page](https://www.npmjs.com/package/@napi-rs/canvas) — version 0.1.95, published 2026-02-26 (HIGH confidence — npm official)
- [@napi-rs/canvas GitHub](https://github.com/Brooooooklyn/canvas) — `GlobalFonts.registerFromPath()` API, font registration example (HIGH confidence — official repo)
- [@napi-rs/canvas issue #1006](https://github.com/Brooooooklyn/canvas/issues/1006) — `GlobalFonts.register(buffer)` memory aliasing bug, Feb 2025 (HIGH confidence — official issue tracker)
- [@napi-rs/canvas issue #731](https://github.com/Brooooooklyn/canvas/issues/731) — Alpine/minimal Docker text rendering issue (MEDIUM confidence — user report, confirmed by maintainer)
- [node-canvas registerFont issues #2285, #2255, #2097](https://github.com/Automattic/node-canvas/issues/) — broken registerFont on Linux, justifying the switch to @napi-rs/canvas (HIGH confidence — official issue tracker, multiple reports)
- [fast-xml-parser npm](https://www.npmjs.com/package/fast-xml-parser) — 6M+ weekly downloads, zero dependencies, version 4.5.x (HIGH confidence — npm official)
- [sharp npm](https://www.npmjs.com/package/sharp) — version 0.34.5, libvips, SVG font limitation (HIGH confidence — npm official + sharp docs)
- [sharp SVG text limitation](https://techsparx.com/nodejs/graphics/svg-to-png.html) — sharp cannot embed custom fonts in SVG→PNG conversion without system install (MEDIUM confidence — third-party article, consistent with sharp docs)
- [npm-compare @napi-rs/canvas vs canvas vs sharp](https://npm-compare.com/@napi-rs/canvas,canvas,jimp,p5,sharp) — performance benchmarks, size comparison (MEDIUM confidence — community comparison tool)

---

*Stack research for: LitUI v10.1 Component Knowledge Image — Node.js text-to-image generation*
*Researched: 2026-03-01*
