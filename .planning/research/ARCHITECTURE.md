# Architecture Research

**Domain:** XML knowledge compiler + programmatic image renderer for LitUI component skill files
**Researched:** 2026-03-01
**Confidence:** HIGH

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Source Layer (existing, untouched)            │
│                                                                   │
│  skill/SKILL.md                  (6KB router skill)              │
│  skill/skills/*/SKILL.md         (32 sub-skills, ~218KB total)   │
│                                                                   │
│  packages/cli/skill/             <- CLI-bundled mirror of skill/  │
└────────────────────────┬────────────────────────────────────────┘
                         │  read at compile time
┌────────────────────────▼────────────────────────────────────────┐
│                    Compiler (new)                                 │
│                                                                   │
│  scripts/compile-knowledge.ts                                     │
│  - Walk skill/ tree recursively (fs.readdir { recursive: true }) │
│  - Sort paths for deterministic output                           │
│  - Strip YAML frontmatter (---\n...\n---\n) from each file       │
│  - Wrap each file in <skill name="…"> … </skill>                 │
│  - Write skill/lit-ui-knowledge.xml                              │
└────────────────────────┬────────────────────────────────────────┘
                         │  read by renderer
┌────────────────────────▼────────────────────────────────────────┐
│                    Renderer (new)                                 │
│                                                                   │
│  scripts/render-knowledge-image.ts                                │
│  - Read skill/lit-ui-knowledge.xml                               │
│  - Split into lines (no word-wrap needed: monospace, condensed)  │
│  - Derive canvas height = lines.length * LINE_HEIGHT             │
│  - createCanvas(1500, height) via node-canvas                    │
│  - fillRect white, fillText each line at 8pt Courier New         │
│  - Write skill/lit-ui-knowledge.png                              │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `skill/SKILL.md` | Router skill — auto-loads for all lit-ui questions | Existing Markdown, not modified |
| `skill/skills/*/SKILL.md` | Per-component/tooling skill files (32 files) | Existing Markdown, read-only sources |
| `scripts/compile-knowledge.ts` | Aggregate all skill files into one XML document | New Node.js/TypeScript script |
| `skill/lit-ui-knowledge.xml` | Structured XML of all knowledge — intermediate artifact | New generated file, git-committed |
| `scripts/render-knowledge-image.ts` | Convert XML text to condensed PNG image | New Node.js/TypeScript script |
| `skill/lit-ui-knowledge.png` | Final output: the knowledge reference image | New generated file, git-committed |
| `package.json` (root) | Two new scripts wiring the pipeline | Modified — three new entries |

---

## Recommended Project Structure

```
lit-components/
├── skill/                          # existing — source of truth
│   ├── SKILL.md                    # router skill (existing, untouched)
│   ├── skills/                     # sub-skills (existing, untouched)
│   │   ├── button/SKILL.md
│   │   ├── charts/SKILL.md
│   │   └── ... (30 more)
│   ├── lit-ui-knowledge.xml        # NEW — generated, git-committed
│   └── lit-ui-knowledge.png        # NEW — generated, git-committed
├── scripts/
│   ├── install-skill.mjs           # existing developer tool
│   ├── compile-knowledge.ts        # NEW — XML compiler
│   └── render-knowledge-image.ts   # NEW — image renderer
└── package.json                    # MODIFIED — new scripts entries
```

### Structure Rationale

- **`scripts/` for both scripts:** The `scripts/` directory already exists and holds `install-skill.mjs`, which is a maintenance tool with the same shape: no user-facing CLI, run by developers only. Placing `compile-knowledge.ts` and `render-knowledge-image.ts` here follows that established pattern.
- **Output in `skill/`:** The milestone spec explicitly requires output saved to `skill/`. The XML intermediate also lives there to make the pipeline transparent and inspectable. Both artifacts should be git-committed so the skill installer (`scripts/install-skill.mjs`) and the CLI's `injectOverviewSkills()` automatically include them in every injected skill tree — no extra build step needed by consumers.
- **No new workspace package:** These are developer scripts, not published library code. Adding them inside `packages/cli/src/` or a new workspace package would add unnecessary build indirection. Plain TypeScript scripts in `scripts/` run directly via `node --experimental-strip-types` (available in the installed Node.js v25.3.0 without any extra flags).
- **Two separate scripts instead of one combined pipeline:** Separation makes each step independently runnable, testable, and inspectable. The XML intermediate is a meaningful artifact on its own — AI tools can read XML directly; the image is for tools that accept image context attachments.

---

## Architectural Patterns

### Pattern 1: Walk-and-Compile

**What:** The compiler walks `skill/` recursively using `fs.readdir({ recursive: true })`, collects every file ending in `SKILL.md`, sorts them for deterministic output, strips the YAML frontmatter block, and wraps each file's content in a named XML element.

**When to use:** Aggregating N independent flat files into one structured document. Avoids hardcoding the file list — new skill files added in future milestones automatically appear in the XML with zero maintenance cost.

**Trade-offs:** Recursive directory walk is slightly slower than a hardcoded list but trivially fast for 33 files. The recursive approach is the only maintenance-free option.

**Example:**
```typescript
// scripts/compile-knowledge.ts (sketch)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SKILL_DIR = join(import.meta.dirname, '..', 'skill');

async function collectSkillFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true });
  return (entries as string[])
    .filter((e) => e.endsWith('SKILL.md'))
    .map((e) => join(dir, e))
    .sort(); // sort for deterministic XML output
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toSkillName(filePath: string): string {
  const rel = relative(SKILL_DIR, filePath);
  if (rel === 'SKILL.md') return 'root';
  // "skills/button/SKILL.md" => "button"
  return rel.split('/')[1];
}

const files = await collectSkillFiles(SKILL_DIR);
const blocks = await Promise.all(
  files.map(async (f) => {
    const raw = await readFile(f, 'utf8');
    const content = xmlEscape(stripFrontmatter(raw));
    const name = toSkillName(f);
    return `<skill name="${name}">\n${content}\n</skill>`;
  })
);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<lit-ui-knowledge>',
  ...blocks,
  '</lit-ui-knowledge>',
].join('\n') + '\n';

await writeFile(join(SKILL_DIR, 'lit-ui-knowledge.xml'), xml, 'utf8');
console.log(`Wrote ${files.length} skill files to skill/lit-ui-knowledge.xml`);
```

### Pattern 2: Fixed-Width Canvas Text Rendering

**What:** The renderer creates a `node-canvas` Canvas with a fixed width of 1500px and a computed height based on line count. It renders every line of the XML using `fillText()` at 8pt Courier New, producing a white-background PNG.

**When to use:** When text layout is known at render time and no word-wrap is required (monospace condensed output). This avoids complex text-flow engines and keeps the renderer dependency-free except for `canvas`.

**Trade-offs:** No word-wrap means lines that exceed 1500px are clipped at the right edge. The compiler should include a truncation/splitting step for any line exceeding ~220 characters (approximately the 1500px budget at 8pt Courier New, ~6.8px/char). For current skill file content (mostly Markdown prose and code), lines rarely exceed this limit.

**Example:**
```typescript
// scripts/render-knowledge-image.ts (sketch)
import { createCanvas } from 'canvas';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const FONT_SIZE_PT = 8;
const LINE_HEIGHT_PX = 10;  // tight: no extra leading for condensed output
const MAX_WIDTH = 1500;
const PADDING = 4;           // px top and left margin

const SKILL_DIR = join(import.meta.dirname, '..', 'skill');
const xml = await readFile(join(SKILL_DIR, 'lit-ui-knowledge.xml'), 'utf8');
const lines = xml.split('\n');

const height = lines.length * LINE_HEIGHT_PX + PADDING * 2;
const canvas = createCanvas(MAX_WIDTH, height);
const ctx = canvas.getContext('2d');

// White background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, MAX_WIDTH, height);

// Render text
ctx.fillStyle = '#000000';
ctx.font = `${FONT_SIZE_PT}pt "Courier New"`;
for (let i = 0; i < lines.length; i++) {
  const y = PADDING + (i + 1) * LINE_HEIGHT_PX;
  ctx.fillText(lines[i], PADDING, y);
}

const buffer = canvas.toBuffer('image/png');
await writeFile(join(SKILL_DIR, 'lit-ui-knowledge.png'), buffer);
console.log(`Rendered ${lines.length} lines to skill/lit-ui-knowledge.png`);
```

### Pattern 3: Root package.json Script Wiring

**What:** Three new script entries in the root `package.json` connect the pipeline. They use `node --experimental-strip-types` to run TypeScript files directly — no `tsx` installation needed, since Node.js v25.3.0 supports TypeScript type stripping natively.

**When to use:** Developer-facing scripts that need to run once to regenerate artifacts. Wire as named `scripts` entries for discoverability. Do NOT wire into the `build` script — image generation is a maintainer operation, not part of package compilation.

**Example:**
```json
{
  "scripts": {
    "knowledge:compile": "node --experimental-strip-types scripts/compile-knowledge.ts",
    "knowledge:render": "node --experimental-strip-types scripts/render-knowledge-image.ts",
    "knowledge:build": "pnpm knowledge:compile && pnpm knowledge:render"
  }
}
```

---

## Data Flow

### End-to-End Pipeline

```
skill/SKILL.md                    (6KB)
skill/skills/accordion/SKILL.md   (6.5KB)
skill/skills/area-chart/SKILL.md  (5.5KB)
  ... (30 more sub-skills)
skill/skills/treemap-chart/SKILL.md (4.6KB)
        |
        |  pnpm knowledge:compile
        |  - fs.readdir({ recursive: true })
        |  - filter *.SKILL.md, sort paths
        |  - strip YAML frontmatter
        |  - XML-escape content
        |  - wrap in <skill name="…"> blocks
        v
skill/lit-ui-knowledge.xml        (~225KB estimated)
        |
        |  pnpm knowledge:render
        |  - readFile → split('\n')
        |  - derive canvas height (lines × 10px)
        |  - createCanvas(1500, height)
        |  - fillRect white → fillText each line at 8pt Courier New
        |  - canvas.toBuffer('image/png') → writeFile
        v
skill/lit-ui-knowledge.png        (~800KB–2MB estimated)
```

### Key Data Flows

1. **Skill files to XML:** Pure string transformation — no Markdown parsing, no AST. The XML wrapper is minimal (`<skill name>` tags). Content is XML-escaped (`&`, `<`, `>`) to prevent malformed XML from embedded code examples that use `<` in TypeScript generics or Markdown code blocks.

2. **XML to PNG:** The XML is treated as plain text for rendering. No XML parsing in the renderer — just `split('\n')` and `fillText`. This keeps the renderer simple and eliminates an XML-parser dependency.

3. **CLI skill injection (existing, no changes):** `injectOverviewSkills()` and `injectComponentSkills()` in `packages/cli/src/utils/inject-skills.ts` call `fs.cp(sourceDir, targetDir, { recursive: true })`. Since `lit-ui-knowledge.xml` and `lit-ui-knowledge.png` live inside `skill/`, they are automatically included in every future `lit-ui init` skill installation — no changes to `inject-skills.ts` are needed.

4. **CLI npm publish (existing, minimal change):** `packages/cli/package.json` declares `"files": ["dist", "skill"]`. The `skill/` directory inside the CLI package is a maintained copy of the root `skill/` tree. Maintainers must copy the generated XML and PNG into `packages/cli/skill/` before publishing a new CLI version, the same process as updating skill files today.

---

## Integration Points

### Existing Code That Is NOT Modified

| Component | Why Untouched |
|-----------|---------------|
| `skill/SKILL.md` | Source file — compiler reads it, does not write it |
| `skill/skills/*/SKILL.md` | Source files — compiler reads them, does not write them |
| `packages/cli/src/utils/inject-skills.ts` | Already copies full `skill/` tree recursively — new files automatically included |
| `packages/cli/src/utils/detect-ai-platform.ts` | No connection to this pipeline |
| `packages/cli/tsup.config.ts` | `"files": ["dist", "skill"]` already covers new artifacts in the CLI package |
| All `packages/*/` component packages | No connection |
| `apps/docs/` | No connection |

### New Files

| File | Status | Purpose |
|------|--------|---------|
| `scripts/compile-knowledge.ts` | NEW | Walk `skill/` tree, emit `lit-ui-knowledge.xml` |
| `scripts/render-knowledge-image.ts` | NEW | Read XML, emit `lit-ui-knowledge.png` via node-canvas |
| `skill/lit-ui-knowledge.xml` | NEW (generated) | Intermediate artifact, git-committed |
| `skill/lit-ui-knowledge.png` | NEW (generated) | Final output image, git-committed |

### Modified Files

| File | Change |
|------|--------|
| `package.json` (root) | Add `knowledge:compile`, `knowledge:render`, `knowledge:build` scripts |
| `packages/cli/skill/` directory | Copy new XML and PNG artifacts here before CLI publish (same process as updating other skill files) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Compiler → Renderer | File system (XML artifact at `skill/lit-ui-knowledge.xml`) | No direct code dependency between the two scripts |
| Skill files → Compiler | `fs.readFile()` — read-only | Compiler treats skill files as immutable text sources |
| Renderer → node-canvas | Canvas 2D API (`createCanvas`, `fillText`, `toBuffer`) | Renderer depends on `canvas` npm package (Cairo native dependency) |
| Renderer → `skill/` | `fs.writeFile()` — write-only output | Output lands directly in the canonical `skill/` directory |

---

## Renderer Library Decision

**Recommended: `canvas` (node-canvas, Automattic/node-canvas) — HIGH confidence.**

`node-canvas` is a Cairo-backed Canvas 2D API implementation for Node.js. It is the most widely adopted headless canvas library, with prebuilt binaries for macOS/Linux/Windows shipped via npm (no manual Cairo installation needed for common platforms).

**Why node-canvas over alternatives:**

| Option | Verdict | Reason |
|--------|---------|--------|
| `canvas` (node-canvas) | RECOMMENDED | Full Canvas 2D API, `registerFont()` for bundled fonts, `canvas.toBuffer('image/png')` for synchronous PNG output, prebuilt binaries on all major platforms. |
| `pureimage` | ACCEPTABLE fallback | Pure JS (no Cairo), TypeScript, actively maintained (0.4.x). Self-documented as "not fast." For infrequent one-off generation that doesn't matter. The output quality for text may be lower due to software rasterization. |
| `@napi-rs/canvas` | Overkill | Adds emoji support, not needed here. Heavier fork of node-canvas. |
| `text-to-image` / `ultimate-text-to-image` | Too simple | Built on node-canvas but hide the Canvas 2D API behind limited option objects. Less control over line-by-line rendering layout. |
| Puppeteer / Playwright | Wrong tool | Browser automation for HTML-to-image is ~10x the complexity and ships ~1GB of Chromium. Never appropriate for rendering XML text to a PNG. |
| `sharp` | Not for text | Image transformation library (resize, crop, format). No text-drawing API. |

**Font strategy:** Use `registerFont()` with a bundled `.ttf` monospace font stored in `scripts/assets/` (e.g., `Courier_New.ttf` or JetBrains Mono). This guarantees consistent output across macOS, Linux CI, and Windows regardless of system fonts installed. The font file is a one-time addition and does not affect any published package.

As a simpler fallback if bundling a font file is undesirable for v10.1 scope: `ctx.font = '8pt "Courier New"'` relies on the system having Courier New (standard on macOS and Windows; available on most Ubuntu CI images via the `ttf-mscorefonts-installer` package). This is acceptable for maintainer-only tooling.

**Installation (root dev dependency only):**
```bash
pnpm add canvas --save-dev
# node-canvas requires Cairo at compile time on Linux:
# Ubuntu CI: sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev
# macOS: brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
# Windows: prebuilt binary ships with npm — no extra steps required
```

`canvas` is a root `devDependency` only. It is NOT added to any published package (`packages/cli`, `@lit-ui/*`). This keeps the published CLI zero-native-dependency for end users.

---

## Build Order

The correct sequence for this milestone implementation:

1. **Write `scripts/compile-knowledge.ts`** — the XML compiler. No new npm dependencies required (uses Node.js built-in `fs/promises`). Test by running it and opening `skill/lit-ui-knowledge.xml` to verify structure and content. Verify that all 33 skill files appear, frontmatter is stripped, and XML is valid.

2. **Install `canvas` as root dev dependency** — required only for the renderer script. Run: `pnpm add canvas --save-dev`.

3. **Write `scripts/render-knowledge-image.ts`** — the image renderer. Depends on `canvas` npm package and the XML file produced by step 1. Test by running it and inspecting `skill/lit-ui-knowledge.png` for readability, line density, and correct dimensions.

4. **Wire `package.json` scripts** — add `knowledge:compile`, `knowledge:render`, `knowledge:build` to the root `package.json`.

5. **Run `pnpm knowledge:build`** — generates both `skill/lit-ui-knowledge.xml` and `skill/lit-ui-knowledge.png`. Verify the PNG opens correctly, text is readable at 8pt, width is 1500px, height is unbounded.

6. **Commit generated artifacts** — both XML and PNG are committed to `skill/`. They must be in git so they are available immediately after `git clone` and are picked up by `injectOverviewSkills()` without a build step by the consumer.

7. **Sync `packages/cli/skill/`** — copy the two new files into `packages/cli/skill/` alongside the existing skill files. This mirrors the existing process maintainers use when updating skill files before a CLI publish.

---

## Anti-Patterns

### Anti-Pattern 1: Hardcoding the Skill File List in the Compiler

**What people do:** List all 33 skill file paths explicitly in `compile-knowledge.ts`.
**Why it's wrong:** Every new component added in a future milestone (v11.0, v12.0, ...) requires a manual update to the compiler. This creates the same class of maintenance debt as registry.json becoming stale — it will eventually be missed.
**Do this instead:** Use `fs.readdir({ recursive: true })` filtered to `SKILL.md` files. Sort for deterministic output. The compiler automatically picks up new skills with zero maintenance cost.

### Anti-Pattern 2: Building the Pipeline into the CLI Package

**What people do:** Add compiler and renderer as new commands in `packages/cli/src/commands/`, shipping them in the published CLI binary.
**Why it's wrong:** Image generation is a maintainer operation, not a consumer operation. Shipping it in the CLI binary adds `canvas` (a native Cairo dependency) to every user's `npx lit-ui` invocation — breaking it on systems without Cairo. The `scripts/` directory has the right precedent.
**Do this instead:** Standalone scripts in `scripts/`. Wire via root `package.json` scripts. Only maintainers run `pnpm knowledge:build`.

### Anti-Pattern 3: Adding `canvas` to Any Published Package

**What people do:** Add `canvas` to `packages/cli/dependencies` or `packages/cli/devDependencies`.
**Why it's wrong:** Cairo is a native system dependency. Any consumer who runs `npx lit-ui` or installs `@lit-ui/cli` would need Cairo installed, which breaks the "zero system dependencies" DX the CLI currently provides.
**Do this instead:** `canvas` is a root-level `devDependency` only. It never appears in any published package's `dependencies` or `devDependencies`.

### Anti-Pattern 4: Not Committing Generated Artifacts

**What people do:** Add `skill/lit-ui-knowledge.xml` and `skill/lit-ui-knowledge.png` to `.gitignore` because they are generated files.
**Why it's wrong:** The skill installer and CLI publish pipeline copy the `skill/` directory as-is. If the generated files are not committed, consumers who run `lit-ui init` would not receive them, and the CI would need to run `pnpm knowledge:build` as a mandatory pre-publish step — complexity that does not currently exist.
**Do this instead:** Commit the generated artifacts. Treat them the same as compiled `dist/` files that are committed for direct use. Document in `CONTRIBUTING.md` that running `pnpm knowledge:build` is required after modifying any skill file.

### Anti-Pattern 5: Using Puppeteer/Playwright for Image Rendering

**What people do:** Render the XML as styled HTML in a headless browser, then screenshot it to PNG.
**Why it's wrong:** Puppeteer/Playwright binaries are 300MB–1GB. They require a display server or virtual framebuffer in Linux CI. Browser version mismatches cause flaky output across developer machines. The output spec (white bg, 8pt monospace, condensed, 1500px wide) is achievable with `node-canvas` in ~50 lines.
**Do this instead:** `node-canvas` with direct `fillText()` rendering. No browser needed.

### Anti-Pattern 6: Rendering Without XML Escaping

**What people do:** Insert skill file content directly into XML tags without escaping.
**Why it's wrong:** Skill files contain TypeScript generics (`Array<string>`), JSX/Markdown (`<lui-button>`), and comparisons (`a < b`). These `<` and `>` characters will produce malformed XML, breaking any XML parser that later reads the output.
**Do this instead:** Run the skill file content through an XML escape function (`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`) before wrapping in `<skill>` tags. The renderer then reads the escaped XML as plain text — it does not need to unescape because it renders the raw file content line by line.

---

## Scaling Considerations

This is a maintainer-only tool, not a user-facing service. The only relevant scale concern is generation time and output file size.

| Concern | Current (~224KB XML, ~4,400 lines) | At 2x Content (~450KB) |
|---------|-----------------------------------|-------------------------|
| Compile time (walk + XML emit) | Under 100ms | Under 200ms |
| Canvas height at 10px/line | ~44,400px for 4,440 lines | ~88,000px |
| node-canvas render time | Under 5 seconds | Under 10 seconds |
| PNG file size | Estimated 800KB–2MB | Estimated 2–4MB |
| JS heap for canvas buffer | ~67MB for 1500×44400 canvas | ~134MB for 1500×88000 |

The 44,000px canvas height at current content volume is large but within `node-canvas` and Cairo limits (both support canvases taller than 32,767px). If skill content ever exceeds ~10,000 lines, split the output into multiple PNG pages — but this is not a v10.1 concern.

---

## Sources

- [Automattic/node-canvas GitHub](https://github.com/Automattic/node-canvas) — Canvas 2D API, `registerFont()`, `toBuffer('image/png')` (HIGH confidence — official repository)
- [canvas npm page](https://www.npmjs.com/package/canvas) — install instructions, Cairo system dependency, prebuilt binary availability (HIGH confidence — official npm)
- [pureimage npm page](https://www.npmjs.com/package/pureimage) — pure JS fallback, 0.4.x TypeScript rewrite, "not meant to be fast" documented limitation (MEDIUM confidence — npm page)
- Existing `packages/cli/src/utils/inject-skills.ts` — source-verified: copies full `skill/` tree recursively, new files are automatically included (HIGH confidence — direct code inspection)
- Existing `packages/cli/package.json` `"files": ["dist", "skill"]` — source-verified: CLI bundles `skill/` directory, covering new artifacts without changes (HIGH confidence — direct code inspection)
- Existing `scripts/install-skill.mjs` — source-verified: establishes the pattern for standalone developer scripts in `scripts/` directory (HIGH confidence — direct code inspection)
- Node.js v25.3.0 TypeScript stripping — confirmed installed version via `node --version`; `--experimental-strip-types` available since Node 22.6+ (HIGH confidence — direct verification)

---

*Architecture research for: LitUI v10.1 Component Knowledge Image Generation*
*Researched: 2026-03-01*
