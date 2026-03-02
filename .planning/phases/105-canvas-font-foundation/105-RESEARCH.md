# Phase 105: Canvas/Font Foundation - Research

**Researched:** 2026-03-01
**Domain:** @napi-rs/canvas, JetBrains Mono TTF bundling, two-pass layout skeleton, Node.js ESM scripts
**Confidence:** HIGH

## Summary

This phase installs `@napi-rs/canvas` at the monorepo root and validates that JetBrains Mono TTF is correctly registered and metrically confirmed as monospace — before any content rendering code is written. The goal is a single validation script (`scripts/validate-canvas.ts`) that passes all four success criteria from the roadmap: importable library, registered font, monospace invariant, and a working two-pass layout skeleton producing a real PNG file.

The project already has a prescriptive architecture decision baked into STATE.md: use `GlobalFonts.registerFromPath()` only (not the buffer variant), derive the font path from `import.meta.url`, and use a probe canvas at 1500×1 for the first pass. All of these are validated by research — the rationale for `registerFromPath` over `register(buffer)` is a confirmed memory aliasing bug (issue #1006, Feb 2025) where Skia holds a reference rather than a copy of the buffer. The two-pass pattern is standard practice in the `@napi-rs/canvas` ecosystem for dynamic-height image generation.

The project runs scripts via `node --experimental-strip-types` without a compile step (confirmed in STATE.md architecture notes and supported in Node.js ≥ 22.6). The root `package.json` has `"type": "module"` is NOT set, but the monorepo uses ESM in packages. The scripts must use `.mts` extension or the root must have `"type": "module"` for ESM `import` syntax with `import.meta.url` to work correctly.

**Primary recommendation:** Install `@napi-rs/canvas@0.1.95` as a root devDependency (`pnpm add -D -w @napi-rs/canvas`), copy `JetBrainsMono-Regular.ttf` into `scripts/fonts/`, write a single TypeScript validation script using ESM imports and `import.meta.url` path resolution, run it with `node --experimental-strip-types`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@napi-rs/canvas` | 0.1.95 | Canvas/2D rendering with Skia backend | Pre-built binaries (no Cairo/Pango system deps), zero-config CI, Skia-powered font rendering. Explicitly chosen over `node-canvas` per REQUIREMENTS.md Out of Scope table. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js built-in `node:url` | N/A | `fileURLToPath(import.meta.url)` for absolute path to font | ESM scripts — replaces `__dirname` |
| Node.js built-in `node:path` | N/A | `path.join()`, `path.dirname()` | Path construction from `import.meta.url` |
| Node.js built-in `node:fs/promises` | N/A | `writeFile()` for PNG output | Async file I/O in the validation script |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@napi-rs/canvas` | `node-canvas` (Cairo/Pango) | node-canvas requires system libraries (`libcairo`, `libpango`) absent in Alpine/minimal CI; font registration is buggy on Linux (silent "falling back to Sans" Pango warnings). REQUIREMENTS.md explicitly prohibits it. |
| Bundled TTF in `scripts/fonts/` | `@fontsource/jetbrains-mono` npm package | @fontsource ships WOFF2/WOFF (web formats), not raw TTF. `@napi-rs/canvas` requires a TTF/OTF file path for `registerFromPath`. Direct TTF is simpler. |
| Direct TTF copy | `jetbrains-mono` npm package | This npm package exists but ships web formats too. Bundling TTF directly avoids indirection through node_modules file paths. |

**Installation:**
```bash
# At monorepo root — -w flag installs to workspace root
pnpm add -D -w @napi-rs/canvas
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── fonts/
│   └── JetBrainsMono-Regular.ttf   # Bundled font — committed to git
├── validate-canvas.ts               # Phase 105: validation script
├── compile-knowledge.ts             # Phase 106 (future)
├── render-knowledge-image.ts        # Phase 107 (future)
└── install-skill.mjs                # Existing script
```

### Pattern 1: Absolute Path from import.meta.url (ESM)
**What:** Derive the absolute path to the bundled font file relative to the current script, regardless of cwd.
**When to use:** Every time a file path is needed in an ESM script. `__dirname` does not exist in ESM; `import.meta.url` is the ESM equivalent.
**Example:**
```typescript
// Source: Verified against Node.js ESM docs and existing scripts/install-skill.mjs pattern
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Absolute path to font — stable regardless of cwd when script runs
const FONT_PATH = path.join(__dirname, 'fonts', 'JetBrainsMono-Regular.ttf')
```

Note: The existing `scripts/install-skill.mjs` already uses this exact pattern (`const SCRIPT_PATH = fileURLToPath(import.meta.url)`), confirming it works in this monorepo.

### Pattern 2: Font Registration and Verification
**What:** Register font then verify it is in `GlobalFonts.families` and confirm monospace invariant.
**When to use:** Immediately after import — fonts must be registered before any canvas context is created.
**Example:**
```typescript
// Source: @napi-rs/canvas README + global-fonts.spec.ts test patterns
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

GlobalFonts.registerFromPath(FONT_PATH, 'JetBrainsMono')

// Verify registration succeeded (font appears in families list)
const registered = GlobalFonts.families.some(
  ({ family }) => family === 'JetBrainsMono'
)
if (!registered) {
  throw new Error(`Font registration failed — JetBrainsMono not in GlobalFonts.families`)
}

// Verify monospace invariant — all glyphs must have equal width
// If font silently fell back to system sans-serif, 'i' and 'W' widths will differ
const probeCanvas = createCanvas(100, 100)
const probeCtx = probeCanvas.getContext('2d')
probeCtx.font = '8px JetBrainsMono'

const narrowWidth = probeCtx.measureText('i').width
const wideWidth = probeCtx.measureText('W').width

if (narrowWidth !== wideWidth) {
  throw new Error(
    `Monospace invariant FAILED — 'i' width (${narrowWidth}) !== 'W' width (${wideWidth}). ` +
    `Font likely fell back to system sans-serif.`
  )
}
console.log(`Monospace invariant passed: all glyphs = ${narrowWidth}px`)
```

### Pattern 3: Two-Pass Layout Skeleton
**What:** Probe canvas on first pass measures total height, final canvas created at exact height on second pass.
**When to use:** Any time the output height is not known in advance — standard pattern for dynamic-height PNG generation.
**Example:**
```typescript
// Source: Architecture decision in STATE.md + canvas-constructor ecosystem patterns
import { createCanvas } from '@napi-rs/canvas'
import { promises as fs } from 'node:fs'

const CANVAS_WIDTH = 1500
const FONT_SIZE = 8
const LINE_HEIGHT = FONT_SIZE * 1.5  // 12px
const PADDING = 20

// Generate 50 sample lines
const sampleLines = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}: const x = ${i}`)

// Pass 1: probe canvas — minimal height, measure all content
const probeCanvas = createCanvas(CANVAS_WIDTH, 1)
const probeCtx = probeCanvas.getContext('2d')
probeCtx.font = `${FONT_SIZE}px JetBrainsMono`

let probeY = PADDING
for (const line of sampleLines) {
  probeCtx.fillText(line, PADDING, probeY)
  probeY += LINE_HEIGHT
}
const computedHeight = probeY + PADDING

// Pass 2: final canvas at exact computed height
const finalCanvas = createCanvas(CANVAS_WIDTH, computedHeight)
const finalCtx = finalCanvas.getContext('2d')
finalCtx.font = `${FONT_SIZE}px JetBrainsMono`

// White background
finalCtx.fillStyle = '#ffffff'
finalCtx.fillRect(0, 0, CANVAS_WIDTH, computedHeight)

// Render lines
finalCtx.fillStyle = '#000000'
let y = PADDING
for (const line of sampleLines) {
  finalCtx.fillText(line, PADDING, y)
  y += LINE_HEIGHT
}

// Encode as PNG (async, runs in libuv thread pool)
const pngBuffer = await finalCanvas.encode('png')
await fs.writeFile('scripts/output-validation.png', pngBuffer)

console.log(`PNG written: ${CANVAS_WIDTH}x${computedHeight}px`)
```

### Anti-Patterns to Avoid
- **Using `GlobalFonts.register(buffer)` instead of `registerFromPath()`:** The buffer variant holds a reference to the passed-in Buffer memory (uses `SkData::MakeWithoutCopy`). If the Buffer is garbage-collected or overwritten, font rendering silently breaks. This is confirmed as issue #1006 (Feb 2025). The project STATE.md explicitly locks this decision.
- **Using a relative path for `registerFromPath()`:** If the script is run from a different cwd (e.g., `pnpm --filter scripts run ...`), a relative path like `'./scripts/fonts/JetBrainsMono-Regular.ttf'` will break. Always use `fileURLToPath(import.meta.url)` to derive an absolute path.
- **Creating the final canvas before measuring:** The whole point of two-pass is that you cannot know the final height without rendering. Skipping the probe pass and guessing height results in truncated or padded images.
- **Forgetting `"type": "module"` or using wrong file extension:** The root `package.json` currently does NOT have `"type": "module"`. Scripts using `import` syntax must either use the `.mts` extension, or a `"type": "module"` field must be added to root `package.json`. Check this before writing the script.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Canvas 2D rendering in Node.js | Custom Skia bindings, headless browser | `@napi-rs/canvas` | Pre-built Skia binaries; no compilation; works headlessly; full Canvas 2D API |
| Font path resolution in ESM | `process.cwd()` + relative path | `fileURLToPath(import.meta.url)` | `process.cwd()` is caller-dependent and breaks when run from monorepo root vs package subdirectory |
| PNG encoding | Manual pixel buffer serialization | `canvas.encode('png')` | Async, libuv thread pool, handles compression — built into the library |
| Monospace font detection | Measure all ASCII characters | `measureText('i').width === measureText('W').width` | Two measurements are sufficient for the monospace invariant; checking all ASCII would be over-engineering |

**Key insight:** `@napi-rs/canvas` is a drop-in Node.js Canvas 2D implementation with no system dependencies — treat it exactly like browser `<canvas>` except for the async `encode()` method.

## Common Pitfalls

### Pitfall 1: Root package.json Lacks "type": "module"
**What goes wrong:** `import` syntax in `.ts` files causes `SyntaxError: Cannot use import statement in a module` when run with `node --experimental-strip-types`.
**Why it happens:** The root `package.json` currently has no `"type"` field, meaning Node.js treats `.js`/`.ts` files as CommonJS by default.
**How to avoid:** Add `"type": "module"` to the root `package.json` before writing the TypeScript script, OR name the script `validate-canvas.mts` so Node.js treats it as an ES module. The monorepo's existing `scripts/install-skill.mjs` uses `.mjs` extension to force ESM treatment without touching `package.json`.
**Warning signs:** `SyntaxError: Cannot use import statement in a module` or `require is not defined in ES module scope`.

### Pitfall 2: Font Path Resolution Failure When cwd Varies
**What goes wrong:** Script runs correctly from the monorepo root but fails when invoked via a pnpm script from a package subdirectory. `registerFromPath` receives a non-existent path and font silently falls back to system sans-serif (or fails silently with no error thrown).
**Why it happens:** Relative paths are resolved from `process.cwd()`, which changes depending on where the command is run.
**How to avoid:** Always construct the font path from `fileURLToPath(import.meta.url)` + `path.dirname()` — this is cwd-independent and always points to the file next to the script.
**Warning signs:** Monospace invariant check fails (`'i'.width !== 'W'.width`) even though font file exists; `GlobalFonts.families` shows font registered but measurements are wrong.

### Pitfall 3: Silent Font Fallback (No Error Thrown)
**What goes wrong:** `registerFromPath()` appears to succeed (returns a FontKey, no exception thrown) but the font path is wrong or the file is corrupted. Canvas silently renders text in a system sans-serif font.
**Why it happens:** `@napi-rs/canvas` does not throw when font loading fails in all cases; it may silently fall back. The test suite confirms `GlobalFonts.families` is populated even when this happens.
**How to avoid:** Immediately after registration, run the monospace invariant check: `ctx.measureText('i').width === ctx.measureText('W').width`. Any fallback to a proportional font (Helvetica, Arial, system sans) will fail this check because 'i' is narrower than 'W' in proportional fonts.
**Warning signs:** PNG renders but text looks visually different from JetBrains Mono; monospace invariant assertion fails.

### Pitfall 4: @napi-rs/canvas Installed in Wrong Location
**What goes wrong:** `import { createCanvas } from '@napi-rs/canvas'` throws `Cannot find package '@napi-rs/canvas'` when the script runs from monorepo root.
**Why it happens:** In pnpm workspaces, packages installed without `-w` land in a specific workspace package's `node_modules`, not the root. Since `scripts/` is not a workspace package, it resolves from the root `node_modules`.
**How to avoid:** Install with `pnpm add -D -w @napi-rs/canvas` (the `-w` flag targets the workspace root).
**Warning signs:** `Cannot find package` error; running `ls node_modules/@napi-rs/canvas` from monorepo root shows nothing.

### Pitfall 5: Probe Canvas height=1 Not 1500x1
**What goes wrong:** Probe canvas is created with incorrect dimensions, making the first pass not representative of actual line rendering.
**Why it happens:** A common shortcut is to use a square canvas (e.g., 1500×1500) for probing, but this is wasteful. The STATE.md architecture note specifically says "probe canvas (1500x1)".
**How to avoid:** Create probe canvas as `createCanvas(1500, 1)` — width must match the final canvas width so `measureText` operates with the correct font settings; height can be 1px since we don't need pixel output from it.
**Warning signs:** Computed height from probe pass doesn't match what would actually be rendered at 1500px wide.

## Code Examples

Verified patterns from official sources:

### Complete Import Statement (ESM with @napi-rs/canvas)
```typescript
// Source: @napi-rs/canvas README (uses CJS require() in docs, but ESM import works identically)
// The library's index.js exports are CJS but can be consumed via ESM import in Node.js
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { promises as fs } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
```

### Font Registration with Verification
```typescript
// Source: @napi-rs/canvas __test__/global-fonts.spec.ts patterns (GlobalFonts.families, .has())
const FONT_PATH = path.join(__dirname, 'fonts', 'JetBrainsMono-Regular.ttf')

GlobalFonts.registerFromPath(FONT_PATH, 'JetBrainsMono')

// Method 1: Check families array
const inFamilies = GlobalFonts.families.some(({ family }) => family === 'JetBrainsMono')
console.log('In families:', inFamilies)

// Method 2: Use .has() helper (cleaner)
const hasFont = GlobalFonts.has('JetBrainsMono')
console.log('Has font:', hasFont)
```

### PNG Encode (async)
```typescript
// Source: @napi-rs/canvas README — "Non-blocking encoding in libuv thread pool"
const pngData = await canvas.encode('png')
await fs.writeFile(outputPath, pngData)
```

### Monospace Invariant Check
```typescript
// Source: Phase 105 success criteria — verified against Canvas 2D measureText spec
// A monospace font assigns equal advance width to ALL glyphs
// 'i' is the narrowest glyph and 'W' the widest in proportional fonts
// If widths differ, font registration failed and fell back to proportional font
const ctx = canvas.getContext('2d')
ctx.font = '8px JetBrainsMono'
const iWidth = ctx.measureText('i').width
const WWidth = ctx.measureText('W').width

if (Math.abs(iWidth - WWidth) > 0.01) {  // floating point tolerance
  throw new Error(`Monospace invariant FAILED: 'i'=${iWidth} 'W'=${WWidth}`)
}
```

Note: A small floating-point tolerance (`0.01`) may be needed because `measureText` can return floating-point values.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `node-canvas` (Cairo/Pango) | `@napi-rs/canvas` (Skia, pre-built) | 2022–2023 | No system library install, no compilation, reliable CI |
| `GlobalFonts.register(buffer)` | `GlobalFonts.registerFromPath(path)` | Feb 2025 (issue #1006) | Avoids memory aliasing bug where buffer GC corrupts font data |
| `require()` / `__dirname` | `import` / `fileURLToPath(import.meta.url)` | Node.js 12+ ESM | ESM-compatible path resolution without compilation |
| `ts-node` / `tsx` / compile step | `node --experimental-strip-types` | Node.js 22.6 (Aug 2024) | Zero-config TypeScript execution, no extra dev tools |

**Deprecated/outdated:**
- `GlobalFonts.register(buffer)`: Uses `SkData::MakeWithoutCopy` — memory aliasing bug. Use `registerFromPath` instead. (Feb 2025, confirmed issue #1006)
- `node-canvas`: Cairo-backed, requires libcairo/libpango/libgif system packages. Explicitly excluded in REQUIREMENTS.md Out of Scope table.
- `__dirname` in ESM context: Not available. Use `fileURLToPath(import.meta.url)` + `path.dirname()`.

## Open Questions

1. **Root package.json "type": "module" — add or use .mts extension?**
   - What we know: Root `package.json` currently has no `"type"` field. Scripts use `.mjs` for ESM. `node --experimental-strip-types` supports `.mts` as ESM TypeScript.
   - What's unclear: Does adding `"type": "module"` at root break any CJS files in the monorepo? (Likely not, since packages have their own `package.json` with `"type": "module"` already set, and apps/packages would shadow the root.)
   - Recommendation: Use `.mts` extension for `validate-canvas.mts` and future scripts — this is the safest path that does not require modifying root `package.json`. The existing `install-skill.mjs` uses `.mjs` for the same reason.

2. **JetBrains Mono TTF source — commit directly or download as build step?**
   - What we know: JetBrains Mono is licensed under SIL OFL 1.1, which permits bundling and redistribution. The TTF files are at `github.com/JetBrains/JetBrainsMono/tree/master/fonts/ttf`. `JetBrainsMono-Regular.ttf` is the standard Regular weight.
   - What's unclear: Whether to commit the TTF binary to git or script a download. The project commits generated artifacts (`skill/lit-ui-knowledge.png`) to git, suggesting binary assets are acceptable.
   - Recommendation: Commit `JetBrainsMono-Regular.ttf` directly to `scripts/fonts/` — it is ~320KB, SIL OFL licensed, and eliminates a runtime download dependency. Download from `https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf`.

3. **Floating-point tolerance in monospace invariant check**
   - What we know: `measureText()` returns floating-point widths. Skia's Skia's text metrics may differ slightly from exact integer values at fractional sizes.
   - What's unclear: Whether `ctx.measureText('i').width === ctx.measureText('W').width` (strict equality) is reliable at 8pt with Skia, or whether a small epsilon is needed.
   - Recommendation: Use `Math.abs(iWidth - WWidth) < 0.01` (epsilon tolerance) to be safe. The key diagnostic is "proportional vs monospace" — a proportional fallback would give differences of multiple pixels, not sub-pixel floating-point noise.

## Sources

### Primary (HIGH confidence)
- `@napi-rs/canvas` npm — version 0.1.95 confirmed via `npm view @napi-rs/canvas version`
- `github.com/Brooooooklyn/canvas` README — `GlobalFonts.registerFromPath` API, `canvas.encode('png')` API
- `github.com/Brooooooklyn/canvas` `__test__/global-fonts.spec.ts` — `GlobalFonts.families`, `.has()`, `.registerFromPath()` patterns
- `github.com/Brooooooklyn/canvas` `__test__/text.spec.ts` — `measureText().width` patterns
- `github.com/JetBrains/JetBrainsMono/tree/master/fonts/ttf` — TTF file listing, Regular weight confirmed
- `scripts/install-skill.mjs` in this repo — confirms `fileURLToPath(import.meta.url)` / `path.dirname()` pattern is used and works

### Secondary (MEDIUM confidence)
- GitHub issue #1006 (`Brooooooklyn/canvas`) — confirmed `GlobalFonts.register(buffer)` uses `SkData::MakeWithoutCopy`, memory aliasing bug, fix is `registerFromPath`
- GitHub issue #731 (`Brooooooklyn/canvas`) — text rendering in Alpine Linux containers; workaround via bundled fonts (confirms bundling TTF with script is the right approach)
- Node.js docs / blog posts — `--experimental-strip-types` available Node.js ≥ 22.6, default in Node.js 23.6; `.mts` extension forces ESM treatment

### Tertiary (LOW confidence)
- Search results on `@fontsource/jetbrains-mono` — ships WOFF2/WOFF only, not TTF (not usable with `registerFromPath`); LOW confidence only because file format was inferred from npm page description, not verified by listing node_modules contents

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — version confirmed via npm, library choice locked in project STATE.md, GitHub source code verified
- Architecture patterns: HIGH — path resolution pattern verified in existing `scripts/install-skill.mjs`; `registerFromPath` API confirmed in official test suite; two-pass pattern confirmed in STATE.md architecture note
- Pitfalls: HIGH — memory aliasing bug confirmed via GitHub issue #1006; "type": "module" issue verified against Node.js ESM docs; font fallback pattern confirmed via `node-canvas` issues (same Skia behavior in `@napi-rs/canvas`)

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (library is stable; `--experimental-strip-types` flag status may change in future Node.js versions)
