---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Component Knowledge Image
status: unknown
last_updated: "2026-03-02T05:11:52.643Z"
progress:
  total_phases: 65
  completed_phases: 65
  total_plans: 234
  completed_plans: 234
---

# Project State: LitUI

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v10.1 — Component Knowledge Image (Phase 107: PNG Renderer, next)

## Current Position

Phase: 106 of 108 (XML Compiler) — COMPLETE
Plan: 01/01 complete
Status: Phase 106 done — ready for Phase 107
Last activity: 2026-03-02 — Phase 106 plan 01 executed; scripts/compile-knowledge.ts written, skill/lit-ui-knowledge.xml generated (33 skills, 227 sections)

Progress: [███████████████████████████░░░] ~98%

## Accumulated Context

### Key Decisions
*Full log in PROJECT.md.*

- v10.0 (104-02): Candlestick code examples omit enable-webgpu — kept clean for basic usage; WebGPU feature documented separately
- v10.0 (104-02): All 4 candlestick framework variants include the OHLC order warning comment inline
- v10.0 (104-02): Heatmap: all 4 framework variants assign all 3 properties (xCategories, yCategories, data)
- v10.1 (roadmap): Phase 105 is a zero-requirement foundation phase — its sole purpose is de-risking PNGR-02 and all renderer work by validating font registration and two-pass layout before any content code is written
- v10.1 (roadmap): Use `GlobalFonts.registerFromPath()` only — NOT `GlobalFonts.register(buffer)` (confirmed memory aliasing bug #1006 Feb 2025)
- v10.1 (roadmap): Phase 106 (XML compiler) is independent of canvas — can execute in parallel with Phase 105 or before it; pure Node.js fs/promises
- v10.1 (105-01): Font registered as 'JetBrainsMono' (no space) — consistent naming for Phase 107 renderer's ctx.font strings
- v10.1 (105-01): Monospace invariant confirmed at exact 0.0 diff (i=W=4.8px) — font not falling back to system sans-serif
- v10.1 (106-01): xmlEscape replaces & first — prevents double-encoding sequences like &amp;lt; from content that already has &lt;
- v10.1 (106-01): Section extraction uses lookahead split /^(?=## )/m — preserves ## prefix so title extraction works
- v10.1 (106-01): Check 6 heuristic (description:) false positive on toast code examples — actual frontmatter stripping confirmed correct

### Architecture Notes

- v10.1: Two new scripts in `scripts/` — `compile-knowledge.ts` and `render-knowledge-image.ts`; both run via `node --experimental-strip-types` without a compile step
- v10.1: `@napi-rs/canvas` (Skia, pre-built binaries) — NOT `node-canvas` (Cairo, system dependencies, font registration bugs on Linux)
- v10.1: Generated artifacts (`skill/lit-ui-knowledge.xml`, `skill/lit-ui-knowledge.png`) committed to git; picked up automatically by existing `injectOverviewSkills()` and CLI `"files": ["dist", "skill"]`
- v10.1: Two-pass render — probe canvas (1500x1) measures total line count → compute height → create final canvas at exact height
- v10.1 (105-01): ESM font path pattern: `const __filename = fileURLToPath(import.meta.url); path.join(path.dirname(__filename), 'fonts', 'JetBrainsMono-Regular.ttf')`
- v10.1 (105-01): Canvas font string format: `'8px JetBrainsMono'` (size + family name, no quotes around family)

### Roadmap Evolution

- v10.0 complete: 7 phases (98-104) archived to .planning/milestones/v10.0-ROADMAP.md
- v10.1 roadmap created 2026-03-01: 4 phases (105-108) — canvas foundation, XML compiler, PNG renderer, wiring
- v10.1 Phase 105 complete 2026-03-02: canvas/font foundation validated
- v10.1 Phase 106 complete 2026-03-02: XML compiler written; skill/lit-ui-knowledge.xml generated (33 skills, 227 sections)

### Blockers/Concerns

None — Phase 105 font path resolution concern resolved: `fileURLToPath(import.meta.url)` works correctly.

### TODOs
*None.*

### Tech Debt (carried forward)
- 30 CLI tests need update for CSS variable naming change (--lui-* -> --ui-*)
- CalendarMulti exported but unused by other packages
- CLI registry.json incorrect time-picker->calendar dependency

## Quick Tasks

| ID | Name | Duration | Date |
|----|------|----------|------|
| quick-001 | Cmd+K command palette with full-text search | 2m 55s | 2026-02-02 |
| quick-002 | Agents skill with progressive disclosure router + global installer | 5m 25s | 2026-02-27 |
| quick-003 | Split components skill into 18 individual per-component skills based on docs pages | - | 2026-02-27 |
| quick-004 | Deploy latest changes to npm — publish @lit-ui/charts@1.0.0 | 2m 54s | 2026-03-01 |
| quick-005 | Publish @lit-ui/charts with README to npm — @lit-ui/charts@1.0.1 | ~4m | 2026-03-01 |
| quick-006 | Dark mode chart color tokens — muted -400 Tailwind variants for all 8 series colors + grid/axis/tooltip/legend | <1m | 2026-03-01 |

---
*State initialized: 2026-02-02*
*Last updated: 2026-03-02 — Phase 106-01 complete. scripts/compile-knowledge.ts written, skill/lit-ui-knowledge.xml generated with 33 skills and 227 sections. Ready for Phase 107 (PNG renderer).*
