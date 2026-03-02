# Pitfalls Research: v10.1 Component Knowledge Image

**Domain:** Programmatic text-to-image rendering in Node.js (canvas / sharp / skia-canvas) for condensed monospace knowledge images
**Researched:** 2026-03-01
**Confidence:** HIGH (verified against node-canvas GitHub issues, sharp/lovell issues, skia-canvas official docs, MDN Canvas API, and multiple community post-mortems)

---

## Critical Pitfalls

Mistakes that cause broken output, silent rendering failures, or unrecoverable pipeline failures.

---

### CRITICAL-01: Font Silently Falls Back to "Sans" — No Exception Thrown

**What goes wrong:**
`registerFont()` appears to succeed (no exception), but all text renders in the system fallback font ("Sans" or whatever Pango defaults to). The image looks like it has text, but in the wrong typeface — monospace spacing is broken, character widths are wrong, and line-width calculations based on the intended font are completely wrong. The resulting image may have lines that overflow the canvas width or wrap too early, with no error to diagnose from.

**Why it happens:**
`registerFont()` fails silently in multiple real-world scenarios:
1. The `family` string in `ctx.font` does not exactly match the `family` argument passed to `registerFont()`. Case differences, extra spaces, or using the font file's internal family name instead of your registered alias all cause a mismatch.
2. The font file path is wrong or uses a relative path that resolves differently at runtime than at development time.
3. The font format is unsupported: node-canvas (Cairo/Pango) only supports `.ttf` and `.otf`. `.woff` and `.woff2` fail silently.
4. On Alpine Linux, if the font file does not have an embedded family name in its metadata, Pango emits "Could not parse font file" and falls back — the error message is generic and hides the actual cause.
5. `registerFont()` is called after a canvas context is already created. The registration must happen before the first canvas/context creation.

**How to avoid:**
- Use an absolute path via `path.resolve(__dirname, './fonts/MyFont.ttf')` — never a relative path.
- After calling `registerFont('path', { family: 'MyFont' })`, use exactly `'MyFont'` in `ctx.font` — no variation.
- Test only `.ttf` or `.otf`. Do not attempt `.woff`/`.woff2`.
- Call `registerFont()` before creating any canvas instance.
- After rendering, verify by checking `ctx.font` echoes the family name correctly and compare a sample character width against expected monospace width. A monospace font at 8pt should have all characters the same width — if `measureText('i').width !== measureText('W').width`, the intended font is not active.
- On Alpine/musl: ensure the font file has internal family metadata. Test with a known-good font (e.g., JetBrains Mono or Courier New) before using a custom one.

**Warning signs:**
- Pango console warning: `"couldn't load font 'X', falling back to 'Sans', expect ugly output"`
- All characters render at variable widths when a monospace font is expected
- Line wrapping happens at wrong positions (too early or too late)
- `ctx.measureText('M').width` returns a value inconsistent with the expected size for the registered font

**Phase to address:** Phase 1 (font registration and canvas setup) — font validation must be the first thing implemented and verified before any layout logic is written.

---

### CRITICAL-02: Canvas Must Be Created After Text Height Measurement — Two-Pass Architecture Is Mandatory

**What goes wrong:**
The canvas is created with a fixed height (e.g., 10,000px) before any text is rendered. The actual rendered text either overflows the canvas (content cut off at the bottom) or there is large empty space below the content. For a "condensed text" knowledge image that should have unlimited height to fit all content, a fixed pre-allocation always either wastes space or truncates content.

The reverse mistake: the canvas is created with height `0` or `1`, text is measured, then the canvas is resized. In node-canvas, resizing a canvas (`canvas.height = newHeight`) clears all existing state and pixel data — any previous drawing is lost.

**Why it happens:**
Canvas 2D APIs require dimensions at creation time. Developers new to server-side canvas assume they can resize after drawing, or they pick an arbitrary large height and trim later. Both approaches fail: the former loses content, the latter wastes memory proportional to the worst-case size.

**How to avoid:**
Implement a strict two-pass approach:

**Pass 1 — Measure only (no rendering):**
Create a temporary canvas at a small fixed size (e.g., `1500 × 1`) to get a 2D context. Set the target font. Process the full text content, wrapping lines at the 1500px width using `ctx.measureText()`. Count total lines and calculate total height: `totalHeight = lineCount * lineHeight + topPad + bottomPad`. Do not draw anything.

**Pass 2 — Render:**
Create a new canvas with `createCanvas(1500, totalHeight)`. Draw the background. Render all pre-computed lines at their pre-computed positions.

```typescript
// Pass 1: measure
const measureCtx = createCanvas(1500, 1).getContext('2d');
measureCtx.font = '8pt "JetBrainsMono"';
const lines = wrapText(measureCtx, fullText, 1490); // 5px padding each side
const totalHeight = lines.length * 10 + 10; // 10px line height, 5px top+bottom pad

// Pass 2: render
const canvas = createCanvas(1500, totalHeight);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 1500, totalHeight);
ctx.font = '8pt "JetBrainsMono"';
ctx.fillStyle = '#000000';
lines.forEach((line, i) => {
  ctx.fillText(line, 5, 5 + i * 10 + 8); // baseline offset
});
```

**Warning signs:**
- Output image has visible blank space at the bottom (over-allocated height)
- Output image text is cut off partway through the content (under-allocated height)
- Canvas height is set to a round number (10000, 50000) rather than a computed value

**Phase to address:** Phase 1 (canvas setup and text layout) — the two-pass architecture must be the foundation before any rendering code is written.

---

### CRITICAL-03: XML/SVG Special Characters in Text Content Corrupt the SVG Pipeline

**What goes wrong:**
If the approach uses SVG text elements (e.g., passing SVG to sharp for rasterization), any unescaped special characters in the text content will break the SVG XML parser. The symptoms range from a thrown parse error to silent partial rendering where the image cuts off at the first bad character. The LitUI knowledge XML file itself contains XML — it is rich with `<`, `>`, `&`, `"`, and `'` characters throughout component API definitions, code examples, and CSS property values.

Even with direct canvas `fillText()` (not SVG), XML entity sequences like `&amp;` or `&lt;` that appear in the knowledge file text will render literally (as `&amp;`, not `&`) unless decoded before rendering.

**Why it happens:**
The knowledge XML source contains XML markup. When naively passed to SVG text nodes or when string-interpolated into an SVG template, these characters invalidate the XML document. When passed to canvas `fillText()`, they render as-is since canvas does not interpret XML — but if the goal is to render the source content faithfully, entity sequences need to be decoded from XML encoding back to their display characters.

**How to avoid:**
For canvas `fillText()` pipeline (recommended):
- Read the XML knowledge file as a string
- Decode XML entities before splitting into lines: replace `&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"`, `&apos;` → `'`
- Then split into lines for rendering

For any SVG-based approach (not recommended for this use case):
- Escape all text content: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;` before injecting into `<text>` elements
- Use a proper XML serializer — never string template interpolation for SVG text content

**Warning signs:**
- SVG-based pipeline throws: `Error: Non-whitespace before first tag` or `XMLSyntaxError`
- Output image shows `&amp;` or `&lt;` literally in the rendered text
- Image rendering stops partway through content with no error (silent truncation at first unescaped `<`)

**Phase to address:** Phase 1 (text content pipeline) — character encoding must be handled in the first pass when the knowledge XML is read and tokenized into render lines.

---

### CRITICAL-04: `registerFont()` Must Be Called Before Any Canvas Context Is Created

**What goes wrong:**
The font registration call is placed after canvas creation (or inside a function that creates a context first). All canvases created before `registerFont()` are bound to whatever fonts Pango resolved at context creation time. The later `registerFont()` call may register the font in the system catalog, but existing contexts do not pick it up. Text renders in the fallback font for all canvases created before the registration.

**Why it happens:**
Cairo/Pango resolves available font families at context initialization. `registerFont()` is a side effect that modifies the Cairo font catalog — but only for contexts created after the call. In an async setup where fonts are loaded from disk with `fs.promises.readFile` before registering, the canvas may be created on the first line and fonts registered later.

**How to avoid:**
Establish a strict initialization order:
1. Call all `registerFont()` calls synchronously at module load time (not inside async functions, not inside event handlers).
2. Only after all `registerFont()` calls complete, create any canvas.

```typescript
// CORRECT: register synchronously before any canvas creation
import { registerFont, createCanvas } from 'canvas';
import path from 'path';

registerFont(path.resolve(__dirname, '../fonts/JetBrainsMono-Regular.ttf'), {
  family: 'JetBrainsMono',
  weight: 'normal',
  style: 'normal',
});

// NOW create canvas — font is available
export async function generateImage(): Promise<Buffer> {
  const canvas = createCanvas(1500, 100);
  // ...
}
```

**Warning signs:**
- Font renders correctly on first run but fails when the module is loaded in certain import orders
- Font works in tests (which load fonts first) but fails in the actual build script

**Phase to address:** Phase 1 (font registration) — must be enforced in the module structure from the start.

---

## High-Severity Pitfalls

Mistakes that produce wrong output, degraded quality, or memory failures.

---

### HIGH-01: `measureText()` Width Is Inaccurate in node-canvas — Canvas Engine Diverges From Browser

**What goes wrong:**
Line wrapping logic uses `ctx.measureText(segment).width` to decide when to break a line. The measurements from node-canvas's Cairo/Pango backend diverge from browser Canvas by 2–4px per character at small font sizes. For an 8pt monospace font at 1500px width, this means line breaks occur at different points than expected. At worst, a word that should fit on one line overflows by a few pixels, causing visual clipping against the canvas right edge.

For monospace fonts specifically, `actualBoundingBoxLeft` and `actualBoundingBoxRight` from `TextMetrics` are unreliable in node-canvas — they may return `0` and `width` respectively regardless of actual glyph extents.

**Why it happens:**
node-canvas uses Cairo + Pango for text layout. Pango's shaping engine handles kerning, ligatures, and glyph metrics differently from browser engines (which use platform-native text APIs — CoreText on macOS, DirectWrite on Windows, FreeType/HarfBuzz on Linux). The `measureText()` results are approximations via Pango's font metrics, not pixel-perfect browser measurements.

**How to avoid:**
For a monospace font, compute character width once and use it for all layout calculations — do not use `measureText()` per word. For a monospace font at a given size:
- Measure a reference character: `const charWidth = ctx.measureText('M').width`
- Character count per line = `Math.floor(maxLineWidth / charWidth)`
- Wrap at character count, not measured pixel width

This eliminates `measureText()` error accumulation for monospace text. For any non-monospace text in the knowledge image (unlikely but possible for headers), add a 10px right-margin buffer to absorb measurement error.

**Warning signs:**
- Some lines extend beyond the canvas right edge (visible clipping in output)
- Line wrapping positions differ between local machine (macOS) and CI (Linux/Ubuntu)
- `measureText('i').width === measureText('W').width` — confirms monospace font is active and equal-width assumption is valid

**Phase to address:** Phase 1 (text layout and line wrapping) — use character-count-based wrapping for monospace fonts from the start; do not rely on `measureText()` for layout decisions.

---

### HIGH-02: node-canvas Native Dependency Build Failure in CI/Docker/Serverless

**What goes wrong:**
The project installs `node-canvas` (the Cairo-backed package). CI (or the deployment environment) does not have the required native system libraries: `libcairo2`, `libpango1.0`, `libjpeg`, `libgif`, `librsvg2`, and `build-essential` for compilation. The npm install fails with a native module build error, or installs but throws at runtime: `Error: Cannot find module '../build/Release/canvas.node'`. On Alpine Linux, the musl C library causes additional compatibility issues.

**Why it happens:**
`node-canvas` requires native compilation via `node-gyp` and depends on system-level graphics libraries that are not present in minimal CI or serverless environments. Pre-built binaries exist for common platforms but may not match the exact Node.js version + OS + architecture combination in CI.

**How to avoid:**
Two mitigation strategies:

**Option A (Recommended): Use `skia-canvas` instead of `node-canvas`.**
`skia-canvas` ships prebuilt binaries for all major platforms (x64 and arm64, including Alpine/musl, macOS, Windows) via an automated post-install download script. No system dependencies are required. Statically linked fontconfig means no `libfontconfig` apt install needed. AWS Lambda layer ZIPs are provided by the project. For this project's one-time image generation script (not a hot-path web server), `skia-canvas`'s slightly lower raw throughput vs `node-canvas` is irrelevant.

**Option B: Pin exact prebuilt binary for node-canvas.**
If staying with `node-canvas`, add the required system packages to the Dockerfile or CI configuration:
```dockerfile
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```
And verify the prebuilt binary is available for the exact Node.js version used by running `node -e "require('canvas')"` in CI before the build step.

**Warning signs:**
- `npm install` fails with `gyp ERR! build error` in CI
- Module loads locally (macOS with Homebrew) but fails in Docker/Ubuntu
- `Error: libjpeg.so.8: cannot open shared object file` at runtime

**Phase to address:** Phase 1 (dependency selection) — choose the library before writing any rendering code, since the API surface differs.

---

### HIGH-03: Large Canvas Memory Exhaustion — No Streaming for Tall Images

**What goes wrong:**
A knowledge image covering 22 component packages, 9+ chart skill files, all CSS tokens, and full API tables could easily require 20,000–80,000+ lines of text at 8pt with 10px line height. At 1500px wide × 60,000px tall, the raw pixel buffer is `1500 × 60000 × 4 bytes = 360MB`. Node.js's default V8 heap limit (1.5GB on 64-bit) may not accommodate a canvas of this size alongside the text content already loaded in memory, especially if intermediate buffers are created during PNG encoding.

The PNG encoding step (`canvas.toBuffer('image/png')`) is synchronous and blocks the event loop for several seconds on large canvases, consuming additional working memory for zlib compression buffers.

**Why it happens:**
Canvas pixel buffers are allocated as a contiguous block of RGBA bytes. At large sizes, this single allocation dominates the heap. The two-pass measurement approach (CRITICAL-02) requires the full text to be in memory during measurement, and the final canvas pixel buffer adds on top of that.

**How to avoid:**
- Run the script with `node --max-old-space-size=4096 generate-image.mjs` to increase the heap limit for this one-time build-time script.
- For PNG encoding, use `createPNGStream()` instead of `toBuffer()` to avoid holding the full encoded PNG in memory simultaneously with the pixel buffer:
  ```typescript
  const stream = canvas.createPNGStream({ compressionLevel: 6 });
  const out = fs.createWriteStream('./skill/knowledge.png');
  stream.pipe(out);
  await new Promise(resolve => out.on('finish', resolve));
  ```
- If the image exceeds practical limits (~100,000px height), consider breaking it into sections: multiple images, or a PDF output (node-canvas PDF mode scales without raster pixel limits).
- Use compression level 6 (default) for PNG. Level 9 produces slightly smaller files but is significantly slower for large images; level 3 is faster but larger. For a build-time artifact, level 6 is the best balance.

**Warning signs:**
- `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory` during canvas creation
- Script takes more than 30 seconds (probable OOM thrashing before crash)
- `canvas.toBuffer()` takes more than 10 seconds (large canvas, blocking main thread)

**Phase to address:** Phase 1 (canvas creation) — determine image size from measurement, then validate it fits within reasonable memory limits before committing to the rasterization approach.

---

### HIGH-04: Async `toBuffer()` Has a Known Memory Leak — Use Sync or Stream

**What goes wrong:**
The callback-based async `canvas.toBuffer(callback)` form in node-canvas has a documented memory leak (GitHub issue #1296). In a one-time generation script, a small leak is not a production concern — but in a batch loop or if the image generation is called multiple times in the same process, the leak accumulates and the process may run out of memory before completing all images.

**Why it happens:**
A longstanding bug in the async PNG encoding path in node-canvas causes internal Cairo surface data to not be fully freed after the callback fires.

**How to avoid:**
Use one of these two alternatives:
1. **Sync `toBuffer()` with no callback:** `const buf = canvas.toBuffer('image/png', { compressionLevel: 6 })`. Blocks the event loop but has no leak. Acceptable for a build-time script.
2. **Stream via `createPNGStream()`:** Non-blocking and no leak (see HIGH-03 above).

Do not use `canvas.toBuffer((err, buf) => { ... })` — the callback async form.

**Warning signs:**
- Process memory grows on each call to the async `toBuffer` callback in a loop
- Node.js heap snapshot shows retained canvas internal objects after encoding is complete

**Phase to address:** Phase 1 (PNG encoding) — use the sync form from the start; the async callback form should not be used at all.

---

### HIGH-05: Subpixel Rendering at 8pt — Anti-Aliasing Produces Blurry Output

**What goes wrong:**
At 8pt font size, Cairo's default anti-aliasing (grayscale) blurs character edges, making very small text appear fuzzy in the output PNG. For a knowledge image intended to be read at 1:1 zoom, this produces unreadable text below 10pt.

The wrong fix: setting `ctx.antialias = 'none'` eliminates blurring but produces jagged, aliased character edges that are also hard to read.

**Why it happens:**
node-canvas exposes `ctx.antialias` as a non-standard Cairo property. The default `'default'` mode is grayscale anti-aliasing. For small monospace text, subpixel anti-aliasing (`'subpixel'`) produces sharper results because it uses RGB sub-pixel layout — but this is monitor-dependent and may produce color fringing on some displays. For a screen-viewed PNG, subpixel or grayscale at `'default'` is appropriate. For printing or AI tool consumption (machine-read text), the choice matters less.

**How to avoid:**
For the LitUI knowledge image (intended for AI tool consumption, not human reading at small sizes):
- Use `ctx.antialias = 'default'` (grayscale) — readable at normal zoom levels, clean enough for AI processing
- Use at least `8pt` — do not go below this with any anti-aliasing mode
- Render at `10px` actual line height for `8pt` font (adding 2px leading) so characters do not touch adjacent lines
- If the image must be human-readable at 1:1, use `10pt` font size instead of `8pt`
- Set `ctx.textBaseline = 'top'` and use integer Y coordinates to avoid half-pixel baseline positioning

```typescript
ctx.antialias = 'default'; // grayscale — best balance for small text
ctx.textBaseline = 'top';  // draw from top, not baseline (avoids baseline guessing)
ctx.font = '8pt "JetBrainsMono"';
ctx.fillText(line, 5, Math.round(5 + i * lineHeight)); // integer Y coordinate
```

**Warning signs:**
- Characters appear blurry at 100% zoom in the output PNG
- Adjacent lines touch or bleed into each other
- Text is sharp on macOS preview but blurry when viewed in a browser at 1:1

**Phase to address:** Phase 1 (rendering setup) — anti-aliasing mode and line height must be validated before content generation begins. Test with a 50-line sample before generating the full image.

---

## Medium-Severity Pitfalls

Mistakes that cause technical debt, DX problems, or non-obvious failures.

---

### MEDIUM-01: FontConfig Environment Not Isolated — CI Renders Differently Than Local

**What goes wrong:**
The image script registers a bundled `.ttf` font file. On the developer's macOS machine, the font renders correctly. In CI (Ubuntu, Docker, or GitHub Actions), the `FONTCONFIG_PATH` is not set to point to the bundled fonts directory, so Pango falls back to a system font that happens to match by name. The output differs: character widths are different, line breaking positions shift, and the image content is subtly wrong without triggering any error.

**Why it happens:**
Pango uses FontConfig to resolve font names. Without explicit `FONTCONFIG_PATH` configuration, FontConfig searches system directories. If a system font exists with the same family name as the registered font but a different metrics file (e.g., system `Courier New` vs. bundled `JetBrains Mono` both registered as `'Monospace'`), Pango may select the system one on some platforms and the bundled one on others.

**How to avoid:**
Set `FONTCONFIG_PATH` in the script itself (not relying on shell environment):
```typescript
import path from 'path';
process.env.FONTCONFIG_PATH = path.resolve(__dirname, '../fonts');
```
Create a `fonts.conf` in the fonts directory that explicitly lists only the bundled fonts:
```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/path/to/bundled/fonts</dir>
  <cachedir>/tmp/font-cache</cachedir>
</fontconfig>
```
Do not use `..` in the path — resolve to absolute with `path.resolve()` first.

**Warning signs:**
- CI-generated image has different line wrapping than local-generated image
- Font metrics differ between platforms (character widths disagree by 1–2px)
- No error is thrown — only visual inspection reveals the difference

**Phase to address:** Phase 1 (environment setup) — add FontConfig isolation to the script before committing the first generated image.

---

### MEDIUM-02: Line Wrapping Algorithm Does Not Account for Leading/Trailing Whitespace — Condensed Output Has Alignment Issues

**What goes wrong:**
The line-wrapping function splits text on whitespace boundaries and measures word widths. Leading/trailing spaces in source lines, tab characters, and zero-width characters in the XML knowledge file are not stripped or normalized before measurement. Tab characters in code examples (which are common in XML `<code>` elements) render with variable widths depending on the tab stop, causing misalignment in the knowledge image. Leading spaces from XML indentation show up in the image as extra left padding on some lines.

**Why it happens:**
The knowledge XML file contains indented XML structure. When extracting text content for image rendering, the raw text includes leading whitespace from XML indentation. Without normalization, these spaces appear in the image as inconsistent indentation.

**How to avoid:**
- Normalize all input text before line wrapping: strip leading/trailing whitespace per line, replace tab characters with 2-space equivalents, collapse multiple internal spaces to single spaces (since the image is "condensed")
- Process XML content to extract just the text nodes, not the raw serialized XML with indentation
- For code blocks where indentation is meaningful, use a fixed character-per-indent convention (e.g., 2 spaces = 1 indent level)

**Warning signs:**
- Some lines in the output image start with unexpected blank space
- Code examples have inconsistent indentation
- Lines with tab characters appear much longer than expected (tab counted as N characters but renders wider)

**Phase to address:** Phase 1 (text content extraction and normalization) — normalize before passing to the layout engine.

---

### MEDIUM-03: sharp SVG Approach Cannot Embed Fonts — Do Not Use for This Use Case

**What goes wrong:**
A sharp-based approach (generate SVG text → rasterize with sharp/librsvg) is attempted because sharp is already used elsewhere in the project. The font does not render correctly in CI or Docker — sharp uses librsvg which uses FontConfig, and the font must be installed at the OS level or configured via `FONTCONFIG_FILE` environment variable. Empty rectangles appear in place of characters when the font is not found by librsvg. The fix requires bundling fonts and a `fonts.conf` — at which point the approach has all the complexity of node-canvas/skia-canvas with none of the control.

Additionally, sharp's SVG pipeline cannot handle SVG files with dynamic/long text content efficiently — SVG `<text>` elements do not reflow, so line wrapping must still be done in Node.js before generating the SVG, negating any simplification.

**Why it happens:**
Developers familiar with sharp for image processing assume it can also handle text rendering without additional setup. The font resolution chain (sharp → libvips → librsvg → fontconfig → OS) is opaque and breaks silently in constrained environments.

**How to avoid:**
Use canvas-based rendering (node-canvas or skia-canvas) directly for text-to-image generation. sharp is not the right tool for this use case. If sharp is already a dependency for other image processing in the project, it can still be used for post-processing the canvas output (e.g., additional compression or format conversion), but the text rendering step must use canvas.

**Warning signs:**
- Characters render as empty boxes in sharp/librsvg output
- Pango warning: `"All font fallbacks failed!!!!"`
- Output is correct locally (macOS has all fonts) but broken in CI/Docker

**Phase to address:** Phase 1 (dependency selection) — decision must be made before implementation begins.

---

## Performance Traps

Patterns that work at small scale but fail as content grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Calling `measureText()` on every character for monospace | Measurement takes > 5 seconds for large text files | For monospace fonts, measure one character and use fixed char width for all layout | When input text exceeds ~5,000 lines |
| Synchronous `toBuffer()` blocking event loop | Script appears hung for 10–30 seconds for large images | Acceptable for build-time script; use `createPNGStream()` if concurrent generation needed | Canvas height > 20,000px |
| Creating a new canvas for every section of text | Memory spikes as multiple large canvases coexist | Single canvas for full output; measure in pass 1, render in pass 2 on one canvas | > 3 simultaneous canvases > 5000px tall |
| PNG compression level 9 for very large images | Encoding takes 2–3× longer with minimal size benefit | Use level 6 (default); level 9 only if final file size is a hard constraint | Canvas height > 30,000px |
| Loading full XML knowledge file into `String.split('\n')` before processing | Memory spike from string duplication | Stream-process or use line-by-line reading with `readline` | XML file > 10MB |

---

## Integration Gotchas

Common mistakes specific to adding text-to-image to this project.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `registerFont` + pnpm workspace | Font path resolves to wrong location when called from monorepo root vs. package root | Always use `path.resolve(__dirname, ...)` with `fileURLToPath(import.meta.url)` for ESM scripts |
| Knowledge XML as source | Rendering raw serialized XML including tags and indentation | Parse XML to extract text nodes; normalize whitespace before rendering |
| Font family name | Using font file's display name (e.g., `"JetBrains Mono"`) when file's internal family is different | Verify with `fc-query font.ttf` on Linux; use the registered alias consistently |
| ESM build script | `__dirname` is not defined in ESM modules | Use `const __dirname = path.dirname(fileURLToPath(import.meta.url))` |
| CI environment | Font renders on macOS but fails on Ubuntu CI runner | Set `FONTCONFIG_PATH` in script; bundle font file in repo under `scripts/fonts/` |
| node-canvas install on arm64 | Prebuilt binaries may be missing for arm64 Linux in some node-canvas versions | Prefer skia-canvas which ships arm64 binaries reliably |

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Fixed canvas height (e.g., 100,000px) instead of two-pass measurement | No measurement code needed | Wasted memory; image may still cut off if content grows; PNG file larger than necessary | Never — compute exact height |
| Using system-installed font instead of bundled `.ttf` | No font file to manage | Renders differently on different machines/CI; breaks on minimal Docker images | Never for reproducible builds |
| `measureText()` for monospace layout | Familiar API | 2–4px measurement error causes line overflow or wrong wrapping; cross-platform inconsistency | Never for layout decisions with monospace fonts |
| sharp SVG pipeline for text rendering | Reuse existing sharp dependency | Silent font failures in CI; complex FontConfig setup; no layout control | Never for primary text rendering |
| Skipping XML entity decoding | Less preprocessing code | Raw `&amp;`, `&lt;` appear verbatim in output image | Never |
| Async `toBuffer()` callback form | Non-blocking | Known memory leak in node-canvas | Never |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Font registration:** Verify `ctx.measureText('i').width === ctx.measureText('W').width` — confirms monospace font is active (not system fallback Sans)
- [ ] **Line wrapping:** Verify no line extends beyond the right edge of the canvas at 100% zoom in the output PNG (pixel-inspect right edge)
- [ ] **XML entities:** Verify `&amp;`, `&lt;`, `&gt;` in the source XML are decoded to `&`, `<`, `>` in the rendered image, not rendered literally
- [ ] **Canvas height:** Verify the output image height exactly matches `lineCount * lineHeight + padding` — no blank rows at bottom
- [ ] **CI parity:** Verify the image generated on CI is byte-identical (or visually identical) to the one generated on developer macOS
- [ ] **Memory:** Verify the generation script exits cleanly without OOM on the full knowledge file (not just a sample)
- [ ] **File output:** Verify the PNG is written to `skill/` directory and is readable (not a 0-byte file from a stream that was not awaited)
- [ ] **Font path:** Verify the script can be run from any working directory (monorepo root, package root) and still finds the font file

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CRITICAL-01: Font falls back to Sans | LOW | Check Pango console warning; verify `registerFont` family arg matches `ctx.font` family exactly; validate font file format is `.ttf`/`.otf` |
| CRITICAL-02: Wrong canvas height (content cut off) | LOW | Add pass-1 measurement, recompute height from line count, regenerate |
| CRITICAL-03: XML special chars in output | LOW | Add entity decode step before text extraction; re-run generation |
| CRITICAL-04: Font registered after canvas creation | LOW | Restructure initialization order; move all `registerFont` calls to module top-level |
| HIGH-01: measureText layout error | MEDIUM | Switch to character-count-based wrapping for monospace; re-measure with reference character width |
| HIGH-02: Native build failure in CI | MEDIUM | Switch from `node-canvas` to `skia-canvas` (API-compatible for this use case); update install step |
| HIGH-03: Memory exhaustion | MEDIUM | Increase `--max-old-space-size`; switch from `toBuffer()` to `createPNGStream()` |
| HIGH-04: Async toBuffer leak | LOW | Replace async `toBuffer(callback)` with sync `toBuffer()` or streaming form |
| MEDIUM-01: FontConfig not isolated | LOW | Add `process.env.FONTCONFIG_PATH` and `fonts.conf` to the script; re-run in CI to verify |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CRITICAL-01: Font fallback to Sans | Phase 1 (font setup) | Test: `measureText('i').width === measureText('W').width` with registered monospace font |
| CRITICAL-02: Fixed canvas height | Phase 1 (layout engine) | Test: output image height equals computed `lineCount * lineHeight + padding` exactly |
| CRITICAL-03: XML entity encoding | Phase 1 (content extraction) | Test: render `&amp; &lt; &gt;` source and verify `& < >` appear in output |
| CRITICAL-04: registerFont ordering | Phase 1 (initialization) | Code review: `registerFont` calls precede all `createCanvas` calls at module top-level |
| HIGH-01: measureText inaccuracy | Phase 1 (line wrapping) | Test: no line visually extends past right edge of 1500px canvas at 100% zoom |
| HIGH-02: Native build failure | Phase 1 (dependency selection) | CI: `npm install && node generate-image.mjs` passes on Ubuntu runner without apt installs |
| HIGH-03: Memory exhaustion | Phase 1 (canvas creation) | Test: generation script completes on full knowledge file without OOM flag |
| HIGH-04: Async toBuffer leak | Phase 1 (PNG encoding) | Code review: async callback form of `toBuffer` must not appear |
| HIGH-05: Anti-aliasing blurriness | Phase 1 (rendering quality) | Visual: output sample at 100% zoom shows readable 8pt text with no visible blurring |
| MEDIUM-01: FontConfig isolation | Phase 1 (environment setup) | CI image is visually identical to local image; font metrics match across platforms |
| MEDIUM-02: Whitespace normalization | Phase 1 (content extraction) | Test: XML-indented source has no leading spaces in rendered output lines |
| MEDIUM-03: sharp pipeline rejection | Phase 1 (dependency selection) | Decision: canvas-based pipeline only; sharp not used for text rendering |

---

## Sources

- [Automattic/node-canvas — registerFont not working (Issue #2285)](https://github.com/Automattic/node-canvas/issues/2285) — silent fallback to Sans, font family mismatch
- [Automattic/node-canvas — registerFont can't load font (Issue #2097)](https://github.com/Automattic/node-canvas/issues/2097) — font path resolution failures
- [Automattic/node-canvas — registerFont doesn't detect family on Alpine (Issue #1164)](https://github.com/Automattic/node-canvas/issues/1164) — Alpine/musl font parsing failure
- [Automattic/node-canvas — measureText differs from browser (Issue #331)](https://github.com/Automattic/node-canvas/issues/331) — measurement divergence from browser
- [Automattic/node-canvas — measureText actualBoundingBox inaccurate (Issue #1703)](https://github.com/Automattic/node-canvas/issues/1703) — bounding box fields unreliable
- [Automattic/node-canvas — Memory leaks in async toBuffer (Issue #1296)](https://github.com/Automattic/node-canvas/issues/1296) — async encoding memory leak
- [Automattic/node-canvas — Max image size (Issue #1082)](https://github.com/Automattic/node-canvas/issues/1082) — large canvas practical limits
- [lovell/sharp — Font issues rendering SVG to PNG (Issue #1220)](https://github.com/lovell/sharp/issues/1220) — sharp librsvg font resolution failures
- [lovell/sharp — Unicode text rendering bug on Lambda (Issue #3109)](https://github.com/lovell/sharp/issues/3109) — production font failures in serverless
- [lovell/sharp — Pango threading issue on Windows (Issue #1277)](https://github.com/lovell/sharp/issues/1277) — concurrency font failures
- [samizdatco/skia-canvas — GitHub](https://github.com/samizdatco/skia-canvas) — prebuilt binaries, statically linked fontconfig, Lambda layer
- [skia-canvas.org — Release Notes](https://skia-canvas.org/releases) — v3.0.0 August 2025 typography improvements, static fontconfig on Linux
- [Adam Hooper — Fonts in node-canvas (Medium)](https://adamhooper.medium.com/fonts-in-node-canvas-bbf0b6b0cabf) — FONTCONFIG_PATH isolation, font registration best practices
- [Constant Solutions — Custom fonts on Node.js with fontconfig](https://constantsolutions.dk/2022/11/how-to-install-custom-fonts-on-a-nodejs-image/) — fonts.conf setup for Docker environments
- [MDN — CanvasRenderingContext2D.fontStretch](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fontStretch) — condensed font rendering via canvas API
- [MDN — Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) — sub-pixel rendering, integer coordinate best practices
- [gregberge/svgr — Escaped characters in text (Issue #516)](https://github.com/gregberge/svgr/issues/516) — XML entity handling in SVG text pipelines
- [erikonarheim.com — Understanding Canvas Text Metrics](https://erikonarheim.com/posts/canvas-text-metrics/) — actualBoundingBoxAscent/Descent usage

---
*Pitfalls research for: Programmatic condensed text image generation in Node.js (v10.1 Component Knowledge Image milestone)*
*Researched: 2026-03-01*
