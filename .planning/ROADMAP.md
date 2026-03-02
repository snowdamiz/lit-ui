# Roadmap: LitUI

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-01-24)
- ✅ **v2.0 NPM + SSR** — Phases 6-20 (shipped 2026-01-25)
- ✅ **v3.0 Theme Customization** — Phases 21-24 (shipped 2026-01-25)
- ✅ **v3.1 Docs Dark Mode** — Phases 25-27 (shipped 2026-01-25)
- ✅ **v4.0 Form Inputs** — Phases 28-30 (shipped 2026-01-26)
- ✅ **v4.1 Select Component** — Phases 31-37 (shipped 2026-01-27)
- ✅ **v4.2 Form Controls** — Phases 38-41 (shipped 2026-01-27)
- ✅ **v4.3 Date/Time Components** — Phases 42-50 (shipped 2026-02-02)
- ✅ **v5.0 Overlay & Feedback** — Phases 51-55 (shipped 2026-02-02)
- ✅ **v6.0 Layout Components** — Phases 56-60 (shipped 2026-02-02)
- ✅ **v7.0 Data Table** — Phases 61-68 (shipped 2026-02-05)
- ✅ **v8.0 Design System Polish** — Phases 69-87 (shipped 2026-02-28)
- ✅ **v9.0 Charts System** — Phases 88-97 (shipped 2026-03-01)
- ✅ **v10.0 WebGPU Charts** — Phases 98-104 (shipped 2026-03-02)
- 🚧 **v10.1 Component Knowledge Image** — Phases 105-108 (in progress)

## Phases

<details>
<summary>✅ v1.0 through v9.0 (Phases 1-97) — SHIPPED 2026-03-01</summary>

Phases 1-97 are archived. See:
- `.planning/milestones/v9.0-ROADMAP.md`
- `.planning/milestones/v8.0-ROADMAP.md`
- `.planning/milestones/v7.0-ROADMAP.md` (v7.0 and earlier)

</details>

<details>
<summary>✅ v10.0 WebGPU Charts (Phases 98-104) — SHIPPED 2026-03-02</summary>

- [x] Phase 98: WebGPU Detector + Renderer Infrastructure (2/2 plans) — completed 2026-03-01
- [x] Phase 99: Incremental Moving Average State Machine (3/3 plans) — completed 2026-03-01
- [x] Phase 100: 1M+ Streaming Infrastructure for Line/Area (3/3 plans) — completed 2026-03-01
- [x] Phase 101: WebGPU Two-Layer Canvas for Line/Area (3/3 plans) — completed 2026-03-01
- [x] Phase 102: Docs + Skills Update (3/3 plans) — completed 2026-03-01
- [x] Phase 103: Candlestick WebGPU + Docs + Skills (3/3 plans) — completed 2026-03-01
- [x] Phase 104: Update Code Example Blocks for All Chart Types (2/2 plans) — completed 2026-03-01

Full phase details archived to `.planning/milestones/v10.0-ROADMAP.md`

</details>

### v10.1 Component Knowledge Image (In Progress)

**Milestone Goal:** Compile all LitUI component knowledge into a single XML file and programmatically render it as a condensed reference image for AI tooling.

- [x] **Phase 105: Canvas/Font Foundation** - Install @napi-rs/canvas, register JetBrains Mono TTF, validate font metrics, build two-pass layout skeleton (completed 2026-03-02)
- [ ] **Phase 106: XML Compiler** - Build scripts/compile-knowledge.ts producing skill/lit-ui-knowledge.xml from all skill files
- [ ] **Phase 107: PNG Renderer** - Build scripts/render-knowledge-image.ts producing skill/lit-ui-knowledge.png from compiled XML
- [ ] **Phase 108: Wiring & Distribution** - Wire package.json scripts, commit artifacts, sync to CLI

## Phase Details

### Phase 105: Canvas/Font Foundation
**Goal**: Canvas and font setup is validated so all downstream rendering work is built on correct metrics
**Depends on**: Nothing (first phase of v10.1)
**Requirements**: None (foundation phase — de-risks PNGR-02 and all of Phase 107)
**Success Criteria** (what must be TRUE):
  1. `@napi-rs/canvas` is installed and importable in a Node.js script run from the monorepo root
  2. JetBrains Mono TTF is bundled in `scripts/fonts/` and registered via `GlobalFonts.registerFromPath()` using an absolute path derived from `import.meta.url`
  3. Monospace invariant check passes: `ctx.measureText('i').width === ctx.measureText('W').width` confirms font loaded correctly (not silently falling back to system sans-serif)
  4. Two-pass layout skeleton renders a 50-line sample PNG with correct dimensions — probe canvas measures height, final canvas is created at exact computed height
**Plans**: 1 plan

Plans:
- [ ] 105-01-PLAN.md — Install @napi-rs/canvas, bundle JetBrains Mono TTF, write and run four-assertion validation script

### Phase 106: XML Compiler
**Goal**: Developer can compile all skill files into a single, well-structured XML knowledge document
**Depends on**: Nothing (pure Node.js fs — independent of canvas)
**Requirements**: XMLC-01, XMLC-02, XMLC-03, XMLC-04, XMLC-05
**Success Criteria** (what must be TRUE):
  1. Running `node --experimental-strip-types scripts/compile-knowledge.ts` produces `skill/lit-ui-knowledge.xml` with no errors
  2. XML output contains one `<skill name="...">` element per skill file, with YAML frontmatter stripped from the content
  3. All TypeScript generics, HTML element names, and comparison operators in skill file content are entity-encoded (`<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`) so the XML file is well-formed
  4. Router skill appears first in document order; all sub-skills follow in deterministic alphabetical order — running the compiler twice produces byte-identical output
  5. Each skill element contains `<section title="...">` sub-elements matching the skill file's markdown heading structure
**Plans**: 1 plan

Plans:
- [ ] 106-01-PLAN.md — Implement compile-knowledge.ts and validate XML output (33 skills, entity-encoded, deterministic)

### Phase 107: PNG Renderer
**Goal**: Developer can render the compiled XML knowledge document as a condensed monospace PNG image
**Depends on**: Phase 105 (validated canvas/font setup), Phase 106 (XML artifact to read)
**Requirements**: PNGR-01, PNGR-02, PNGR-03, PNGR-04, PNGR-05
**Success Criteria** (what must be TRUE):
  1. Running `node --experimental-strip-types scripts/render-knowledge-image.ts` produces `skill/lit-ui-knowledge.png` with no errors
  2. PNG renders with a white background (`#ffffff`), black text (`#000000`), JetBrains Mono 8pt font, and a canvas width of exactly 1500px
  3. PNG height is the exact height needed to contain all content — no truncation, no excess whitespace — confirmed by the two-pass measurement approach
  4. All entity sequences from the XML source (`&amp;`, `&lt;`, `&gt;`) are decoded to their display characters before rendering, so TypeScript code in the image shows `<T>` not `&lt;T&gt;`
  5. A thin horizontal rule and component name label appear between each skill section in the PNG, making sections visually navigable
**Plans**: TBD

Plans:
- [ ] 107-01: TBD

### Phase 108: Wiring & Distribution
**Goal**: Both generated artifacts are producible by a single command and permanently available to CLI consumers
**Depends on**: Phase 106 (XML compiler working), Phase 107 (PNG renderer working)
**Requirements**: WIRE-01, WIRE-02, WIRE-03
**Success Criteria** (what must be TRUE):
  1. Root `package.json` has three script entries: `knowledge:compile` runs the XML compiler, `knowledge:render` runs the PNG renderer, and `knowledge:build` runs both in sequence
  2. Both `skill/lit-ui-knowledge.xml` and `skill/lit-ui-knowledge.png` are committed to git and appear in the repository at the `skill/` path
  3. Both artifacts are present in `packages/cli/skill/` so they are automatically included in CLI npm publishes via the existing `"files": ["dist", "skill"]` entry
**Plans**: TBD

Plans:
- [ ] 108-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-87. Various | v1.0–v8.0 | archived | Complete | 2026-02-28 |
| 88-97. Charts System | v9.0 | 25/25 | Complete | 2026-03-01 |
| 98. WebGPU Detector + Renderer Infrastructure | v10.0 | 2/2 | Complete | 2026-03-01 |
| 99. Incremental Moving Average State Machine | v10.0 | 3/3 | Complete | 2026-03-01 |
| 100. 1M+ Streaming Infrastructure for Line/Area | v10.0 | 3/3 | Complete | 2026-03-01 |
| 101. WebGPU Two-Layer Canvas for Line/Area | v10.0 | 3/3 | Complete | 2026-03-01 |
| 102. Docs + Skills Update | v10.0 | 3/3 | Complete | 2026-03-01 |
| 103. Candlestick WebGPU + Docs + Skills | v10.0 | 3/3 | Complete | 2026-03-01 |
| 104. Update Code Example Blocks | v10.0 | 2/2 | Complete | 2026-03-01 |
| 105. Canvas/Font Foundation | v10.1 | 1/1 | Complete | 2026-03-02 |
| 106. XML Compiler | v10.1 | 0/1 | Not started | - |
| 107. PNG Renderer | v10.1 | 0/TBD | Not started | - |
| 108. Wiring & Distribution | v10.1 | 0/TBD | Not started | - |
