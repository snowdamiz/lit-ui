# Requirements: LitUI

**Defined:** 2026-03-01
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v10.1 Requirements

Requirements for v10.1 — Component Knowledge Image milestone.

### XML Compiler

- [x] **XMLC-01**: Developer can run `pnpm knowledge:compile` to produce `skill/lit-ui-knowledge.xml` from all skill files
- [x] **XMLC-02**: XML output includes all skill files with YAML frontmatter stripped and each file wrapped in `<skill name="...">` element
- [x] **XMLC-03**: XML content is properly escaped — TypeScript generics, element names, and comparison operators (`<`, `>`, `&`) are entity-encoded
- [x] **XMLC-04**: XML uses section-level `<section title="...">` sub-elements for structured AI querying
- [x] **XMLC-05**: XML ordering is deterministic — router skill first, sub-skills sorted alphabetically

### PNG Renderer

- [x] **PNGR-01**: Developer can run `pnpm knowledge:render` to produce `skill/lit-ui-knowledge.png` from the compiled XML file
- [x] **PNGR-02**: PNG renders with white background, black text, bundled JetBrains Mono 8pt monospace font, ≤1500px wide
- [x] **PNGR-03**: PNG height is dynamically calculated via two-pass measurement — probe canvas first, create final canvas at exact computed height
- [x] **PNGR-04**: XML entity sequences (`&amp;`, `&lt;`, `&gt;`) are decoded to display characters before `fillText()` rendering
- [x] **PNGR-05**: Component separator lines (thin horizontal rule + component name label) appear between each skill section

### Wiring & Distribution

- [ ] **WIRE-01**: Root `package.json` includes `knowledge:compile`, `knowledge:render`, and `knowledge:build` scripts
- [ ] **WIRE-02**: Both generated artifacts (`skill/lit-ui-knowledge.xml` and `skill/lit-ui-knowledge.png`) are committed to git
- [ ] **WIRE-03**: Artifacts are present in `packages/cli/skill/` for automatic inclusion in CLI distribution

## Future Requirements

### Enhancements

- **XMLC-F01**: Incremental re-generation — only re-compile skill files changed since last run (mtime-based)
- **PNGR-F01**: Multi-page PDF output for paginated reference consumers
- **PNGR-F02**: CI integration — `pnpm knowledge:build` as post-build step to keep artifacts current

## Out of Scope

| Feature | Reason |
|---------|--------|
| Syntax highlighting in PNG | Requires tokenizer dependency (e.g. shiki); marginal benefit at 8pt; all text rendered single color |
| PDF output | Wrong format for AI image context tools; XML file serves machine-searchable purpose |
| File-watcher auto-regeneration | Runtime complexity inappropriate for a build-time artifact |
| SVG + sharp pipeline | sharp/librsvg cannot reliably embed custom fonts in CI without system font installation |
| Headless browser rendering | 300MB+ dependency; canvas renders 8pt text in 25 lines without a browser |
| `node-canvas` (Cairo-backed) | Requires system libraries absent in minimal CI; use `@napi-rs/canvas` (Skia, pre-built) instead |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| XMLC-01 | Phase 106 | Complete |
| XMLC-02 | Phase 106 | Complete |
| XMLC-03 | Phase 106 | Complete |
| XMLC-04 | Phase 106 | Complete |
| XMLC-05 | Phase 106 | Complete |
| PNGR-01 | Phase 107 | Complete |
| PNGR-02 | Phase 107 | Complete |
| PNGR-03 | Phase 107 | Complete |
| PNGR-04 | Phase 107 | Complete |
| PNGR-05 | Phase 107 | Complete |
| WIRE-01 | Phase 108 | Pending |
| WIRE-02 | Phase 108 | Pending |
| WIRE-03 | Phase 108 | Pending |

**Coverage:**
- v10.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

**Phase 105 note:** No requirements are directly assigned to Phase 105 (Canvas/Font Foundation). This phase is a de-risking foundation that validates `@napi-rs/canvas` install and JetBrains Mono font registration before renderer implementation. PNGR-02 depends on work done in Phase 105 but is delivered and verified in Phase 107.

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 — Traceability confirmed after roadmap creation. All 13 requirements mapped.*
