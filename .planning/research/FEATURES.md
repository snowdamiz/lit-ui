# Feature Research: v10.1 Component Knowledge Image

**Domain:** Documentation compilation and programmatic reference image generation
**Project:** LitUI v10.1 (subsequent milestone — adds XML knowledge file + PNG render to existing library)
**Researched:** 2026-03-01
**Confidence:** HIGH for XML compilation (straightforward Node.js fs pipeline); HIGH for image generation approach (node-canvas is the de-facto standard; skia-canvas is the modern alternative — both well-documented); MEDIUM for image layout/rendering details (page dimensions vs. text height tradeoffs require empirical testing)

---

## Context: What Already Exists

The v10.0 library already ships 34 skill files:

- `skill/SKILL.md` — top-level router (88 lines / ~6.4KB)
- `skill/skills/*/SKILL.md` — 33 sub-skill files covering all 22 components, 5 tooling topics (cli, authoring, theming, framework-usage, ssr), and chart routing
- **Total volume:** ~224KB across 34 files, ~4,408 lines

The skill files are Markdown with YAML frontmatter. They contain structured sections: Usage code blocks, Props tables, Slots, Events, Behavior Notes, CSS Custom Properties tables. Each file was designed for AI context loading — they are already condensed, factual, and machine-readable.

The milestone has two distinct sub-problems:

1. **XML compilation** — Aggregate all skill files into one structured XML document
2. **Image rendering** — Convert the XML document to a condensed PNG reference image

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that make the tool functional. Missing any of these = the output is unusable as a knowledge image.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Read all 34 skill files from `skill/` tree | Compilation must be complete, not partial | LOW | `fs.readdirSync` + recursive walk; filenames and paths are well-structured (`skills/{component}/SKILL.md`) |
| Wrap each skill in an XML element with a name attribute | Structure the XML so AI tooling can navigate by component | LOW | `<component name="button">...</component>` or `<skill name="lit-ui-button">`. Frontmatter `name` field is the canonical identifier |
| Strip YAML frontmatter from each file before embedding | Frontmatter is metadata, not content; embedding `---\nname: ...\n---` verbatim is noisy | LOW | Standard frontmatter boundary detection: slice between first and second `---` |
| Produce well-formed, valid XML output | XML parsers will reject malformed documents; AI tooling expects valid structure | MEDIUM | Must escape `<`, `>`, `&` in code blocks within the Markdown content (significant: code examples contain TypeScript generics, HTML elements, template literals) |
| Save XML file to `skill/` directory | Collocated with the source skill files | LOW | Single `fs.writeFileSync` call |
| White background in PNG output | Specified in PROJECT.md requirements | LOW | `ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)` before text |
| 8pt monospace font rendering | Specified in PROJECT.md requirements; critical for density | LOW | Register font before canvas creation; use `ctx.font = '8px "JetBrains Mono"'` (or system monospace fallback) |
| Max 1500px wide output | Specified in PROJECT.md requirements | LOW | Canvas width = 1500; calculate wrapping characters per line from font metrics |
| Unlimited height (canvas grows with content) | Specified in PROJECT.md requirements; text content determines height | MEDIUM | Two-pass render: first measure all text to compute total height, then create canvas at that height and render. node-canvas supports dynamic height at creation time |
| Save PNG to `skill/` directory | Collocated with source and XML | LOW | `canvas.toBuffer('image/png')` + `fs.writeFileSync` |
| Condensed output (no extra whitespace) | Specified in PROJECT.md; reduces PNG dimensions | LOW | Strip blank lines between paragraphs; collapse multiple spaces; remove Markdown decorators (##, **, \`, ---) for text rendering |
| Correct line wrapping at 1500px boundary | Lines that exceed canvas width must wrap | MEDIUM | Compute max chars per line from font metrics at 8pt: approximately 200–220 chars for monospace at 8px given padding. Use `ctx.measureText()` per token group or pre-split at known character width |
| Script runnable as standalone Node.js without build step | Must be usable as a simple `node generate-knowledge-image.mjs` invocation | LOW | ESM script using only Node.js built-ins (`fs`, `path`) plus canvas package; no TypeScript compilation needed |

### Differentiators (Competitive Advantage)

Features that make the output more useful than naive text concatenation.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Frontmatter `name` field as XML element identifier | Enables structured navigation — AI tooling can `grep` for `<skill name="lui-button">` | LOW | Frontmatter is already machine-readable; parse with simple regex or `gray-matter` (0-dep approach: manual slice) |
| Section headers preserved as XML sub-elements | `<section title="Props">`, `<section title="CSS Custom Properties">` etc. — AI can address specific sections | MEDIUM | Requires Markdown AST parsing or header-boundary splitting. Adds significant structure for cross-component API lookups |
| Condensed text normalization for image | Remove Markdown syntax (`**bold**` → `bold`, `# Heading` → `HEADING:`, ` ```code``` ` → preserve as-is) before rendering to PNG | LOW | Improves visual readability; removes clutter from asterisks and hash symbols |
| Router skill appears first in XML | Top-level `skill/SKILL.md` is the index; embedding it first mirrors how AI tooling should load context | LOW | Explicit ordering: router file, then component sub-skills alphabetically, then chart sub-skills, then tooling sub-skills |
| XML as separate artifact from PNG | XML is useful independently for programmatic querying; PNG is for visual reference | LOW | Already implied by PROJECT.md (`XML knowledge file` + `image`) — keep them as two distinct output files |
| Line numbers or component separators in PNG | Visual breaks between component sections make the image scannable | LOW | Draw a thin gray horizontal rule (`ctx.fillStyle = '#e0e0e0'; ctx.fillRect(...)`) between components; print component name in slightly bolder treatment |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Syntax highlighting in PNG | "Code blocks look better with colors" | Color rendering at 8pt font requires accurate glyph-level token classification; adds a tokenizer dependency (e.g., shiki) and significantly increases render complexity and script size; at 8pt the color benefit is marginal | Render all text in a single dark color (`#1a1a1a`) on white; use a slightly lighter shade for comments (`#6b7280`) if needed — simple threshold, no tokenizer |
| PDF output instead of PNG | "PDFs are searchable" | The requirement is explicitly PNG; PDF generation requires a different rendering pipeline (PDFKit or similar); the downstream consumer is AI tooling that reads images, not PDF text | Stay with PNG; the XML file serves the machine-searchable purpose |
| Automatic re-generation on skill file changes | "Keep the image current automatically" | Watcher adds runtime complexity; in a monorepo, it risks spurious regeneration during development; the image is a build-time artifact | Document as a manual script run (`pnpm run generate:knowledge-image`) or add to the monorepo build pipeline as a post-build step |
| Rendering Markdown tables as visual HTML tables | "Tables are clearer than raw pipes" | At 8pt, a formatted HTML-style table would require sub-pixel column alignment that node-canvas cannot reliably compute without a full layout engine | Render table rows as pipe-separated text; the raw Markdown table format (`| Prop | Type |...`) is already readable at this scale |
| Vector/SVG output instead of PNG | "SVG scales without pixelation" | SVG is a DOM format; AI image tooling expects raster images; the PROJECT.md spec says PNG | PNG at 1500px wide with 8pt font at 1x density produces ~7000–12000px tall images that are detailed enough for AI reading |
| Embedding the XML inside the PNG as metadata (XMP) | "Single file carries both formats" | XMP metadata in PNG is non-standard and not widely read by AI vision tools; adds tooling complexity for no practical gain | Two separate files: `knowledge.xml` and `knowledge.png` in `skill/` |
| Interactive HTML reference instead of PNG | "HTML is more navigable" | A separate HTML reference is a different product (docs site already exists); this milestone's goal is a self-contained image for AI context windows | Scope is PNG only; HTML docs are already built by the docs app |

---

## Feature Dependencies

```
[XML Compilation]
    └──requires──> [Skill file reader with frontmatter stripping]
    └──requires──> [XML escape of Markdown content]
    └──produces──> [knowledge.xml in skill/]

[PNG Image Rendering]
    └──requires──> [XML Compilation output] (reads the compiled XML or the source Markdown directly)
    └──requires──> [Canvas library (node-canvas or skia-canvas)]
    └──requires──> [Monospace font file (JetBrains Mono, Fira Code, or system fallback)]
    └──requires──> [Two-pass height measurement]
    └──produces──> [knowledge.png in skill/]

[Two-pass height measurement]
    └──requires──> [Text normalization / whitespace stripping]
    └──requires──> [Line-wrap computation from font metrics]

[Monospace font file]
    └──note──> Font must be bundled with the script or reliably available; system monospace
               fallback works on macOS/Linux but produces inconsistent results across platforms.
               Bundling a .ttf (e.g., JetBrains Mono, MIT license) eliminates the variable.

[Standalone Node.js script]
    └──conflicts──> [TypeScript monorepo build pipeline]
                    The script should be executable without tsc compilation.
                    Options: (1) plain .mjs with dynamic require of canvas,
                    (2) add as a devDependency in a workspace package.
```

### Dependency Notes

- **PNG rendering does not strictly require a prior XML compilation pass.** The renderer can read the raw Markdown skill files directly and produce the PNG. However, producing XML as an intermediate format is valuable independently. Recommended approach: compile XML first, then render XML content to PNG.
- **Font registration must happen before canvas creation** in node-canvas. This is a known ordering constraint (confirmed from GitHub issues and documentation).
- **Two-pass render is required** because node-canvas canvas height is set at creation time (`createCanvas(width, height)`) and cannot change afterwards. Measuring all content first, then creating the canvas at the correct height, is the standard pattern.
- **XML escaping is the highest-risk step** in compilation: Markdown skill files contain `<lui-button>` tag examples, TypeScript generics like `Array<string>`, and template literals with backtick content. All `<`, `>`, and `&` in text content must be escaped as `&lt;`, `&gt;`, `&amp;` before embedding in XML.

---

## MVP Definition for v10.1

### Launch With (v1 — Both features required per PROJECT.md)

- [ ] **XML compilation script** — reads all 34 skill files from `skill/`, strips YAML frontmatter, wraps each in `<skill name="...">` XML element, escapes Markdown content, writes `skill/knowledge.xml`
- [ ] **PNG renderer** — reads compiled XML (or raw skill text), normalizes whitespace, word-wraps at 1500px, renders at 8pt monospace, white background, writes `skill/knowledge.png`
- [ ] **Monospace font bundled** — embed a permissively-licensed monospace TTF (JetBrains Mono is OFL-licensed) so output is consistent across environments
- [ ] **Standalone script** — runnable as `node scripts/generate-knowledge-image.mjs` without compilation; add as npm script to monorepo root `package.json`

### Add After Validation (v1.x)

- [ ] **Section-level XML structure** — parse Markdown headers (`## Props`, `## Behavior Notes`) into `<section title="...">` sub-elements for structured querying — useful if AI tooling needs component-scoped lookups
- [ ] **Component separators in PNG** — thin rule + component name label between skill sections for visual navigation
- [ ] **Integrate into CI** — add `pnpm generate:knowledge-image` as a post-build step to keep image current

### Future Consideration (v2+)

- [ ] **Incremental re-generation** — only re-render sections whose source skill file has changed (use mtime); reduces full regeneration from ~5–10 seconds to near-instant for single-component updates
- [ ] **Multi-page PDF output** — for use cases where the consumer prefers paginated reference rather than a single tall image

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| XML compilation (all 34 files, frontmatter strip, escape) | HIGH — the XML is the canonical knowledge artifact | LOW — fs walk + string ops | P1 |
| PNG render (white bg, 8pt mono, 1500px, dynamic height) | HIGH — the image is the deliverable | MEDIUM — two-pass render, font metrics | P1 |
| Bundled monospace TTF font | HIGH — consistent output across OS | LOW — copy a .ttf file, call registerFont() | P1 |
| Standalone runnable script (no build required) | HIGH — devex | LOW — .mjs with top-level await | P1 |
| Condensed text normalization (strip Markdown syntax) | MEDIUM — cleaner PNG output | LOW — regex replacements | P1 |
| Router skill file ordered first in XML | MEDIUM — correct structural order | LOW — explicit file list ordering | P1 |
| Section-level XML `<section>` sub-elements | MEDIUM — enables structured queries | MEDIUM — Markdown header parsing | P2 |
| Component separator lines in PNG | LOW — visual navigation aid | LOW — `fillRect` between sections | P2 |
| Syntax highlight differentiation (comment vs. code color) | LOW — marginal at 8pt | LOW if two-tone only | P3 |
| Automatic CI integration | MEDIUM — keeps artifact current | LOW — one npm script addition | P2 |

**Priority key:**
- P1: Must have for launch (core functionality)
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

There is no direct competitor for this specific tool (LitUI-specific knowledge image generation). The relevant reference points are general-purpose documentation-to-image tools and knowledge compilation approaches:

| Feature | text-to-image (npm) | skia-canvas | node-canvas | Our Approach |
|---------|---------------------|-------------|-------------|--------------|
| Custom font support | Via node-canvas | Native | registerFont() with known ordering bug risk | Bundle JetBrains Mono TTF; call registerFont() before createCanvas() |
| Dynamic height | Not supported | Supported | Supported (set at createCanvas time) | Two-pass: measure all lines first, then create canvas |
| Line wrapping | Auto (limited) | Manual via measureText | Manual via measureText | Manual wrap loop using ctx.measureText() character width |
| No system deps | No (needs cairo) | Yes (Skia, precompiled) | No (needs Cairo/libpango) | Prefer skia-canvas for zero-system-dep install; fallback to node-canvas |
| Monorepo DevDep scope | N/A | devDependency in scripts/ workspace | devDependency in scripts/ workspace | Add as devDependency to a new `scripts/` workspace package or to monorepo root |

---

## Technical Notes on Image Sizing

**At 8pt monospace (8px at 1x density):**

- Line height: ~11–12px (8px cap height + 3–4px leading)
- Characters per line at 1500px: monospace character width at 8px is approximately 4.8–5.2px. At 1500px canvas with 20px padding each side (1460px usable): ~280–300 characters per line
- Total line count: ~4,408 source lines. After normalization (collapsing blank lines, stripping headers into inline labels), estimate ~3,500 rendered lines.
- Estimated PNG height: 3,500 lines × 12px = ~42,000px. This is a tall but valid PNG; most image viewers and AI vision APIs handle it without issue.
- File size estimate: 1500 × 42,000 px at 8-bit grayscale-equivalent (mostly white pixels) compresses to ~1–3MB PNG with zlib compression.

**Practical implication:** The "unlimited height" requirement means height is computed, not bounded. The output is expected to be tall (10,000–50,000px) and this is intentional — it's a reference image, not a display image.

---

## Sources

### High Confidence (Official Documentation)

- [node-canvas GitHub (Automattic)](https://github.com/Automattic/node-canvas) — Cairo-based Canvas API for Node.js; `registerFont()` ordering constraints, `createCanvas()` API
- [skia-canvas GitHub (samizdatco)](https://github.com/samizdatco/skia-canvas) — Skia-based; zero system dependencies, prebuilt binaries for arm64/x64; v3.0.8 adds Sharp integration
- [node-canvas font issue #2285](https://github.com/Automattic/node-canvas/issues/2285) — confirmed registerFont() ordering: must call before createCanvas()
- [JetBrains Mono](https://www.jetbrains.com/legalnotice/fonts/) — OFL (SIL Open Font License); safe to bundle

### Medium Confidence (Multiple Sources Agree)

- node-canvas `toBuffer('image/png')` + `fs.writeFileSync()` — standard pattern confirmed across LogRocket, sebhastian, kindacode tutorials
- Two-pass render pattern (measure height first) — confirmed as required by node-canvas API constraint (height set at createCanvas time)
- skia-canvas zero-system-dep prebuilt downloads at install time — confirmed from skia-canvas README and Vercel/Lambda deployment notes

### Low Confidence (Directional Only)

- Estimated PNG file size (~1–3MB) — calculated from pixel dimensions and typical monochromatic PNG compression ratios; not empirically measured
- Character count per line at 8px monospace — varies by font; JetBrains Mono at 8px exact width requires empirical measurement with `ctx.measureText('M')` at runtime

---

*Feature research for: LitUI v10.1 Component Knowledge Image milestone*
*Researched: 2026-03-01*
