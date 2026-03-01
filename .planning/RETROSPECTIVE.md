# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v8.0 — Design System Polish

**Shipped:** 2026-02-28
**Phases:** 19 (69-87) | **Plans:** 55

### What Was Built

- Authored THEME-SPEC.md — authoritative monochrome design token reference covering all `--ui-*` defaults, ensuring all 18 subsequent component phases had a concrete spec to match against
- Removed hardcoded `.dark { --ui-*: ... }` overrides from all 18 components — dark mode now cascades via semantic tokens; only true exceptions (oklch literals, white values) retained per-component
- Expanded CSS token documentation across all 18 docs pages — significant expansions: Input 7→16, Select 7→27, Switch 12→26, Time Picker 20→67, Data Table 18→35 entries; all defaults in double-fallback `var()` form
- Rewrote all 18 component skill files with complete token tables and Behavior Notes sections (8-13 entries each) covering state, keyboard nav, dark mode, accessibility, and integration patterns
- Fixed stale token names in skill files (`--lui-*` → `--ui-*`), corrected z-index values (popover 45, toast 55), updated shadow values to match `tailwind.css :root`

### What Worked

- Wave structure (01 style, 02 docs, 03 skill) gave each phase clear, independent tasks — no ambiguity about what was in scope
- THEME-SPEC.md as Phase 69's output meant every subsequent phase had a concrete reference rather than abstract direction
- Small, focused commits per plan made the git log clean and individual changes easy to reason about
- The "double-fallback var() form" pattern (discovered in Phase 72) became a consistent standard applied to all subsequent phases
- Yolo mode + parallel plan execution kept the milestone moving without confirmation bottlenecks

### What Was Inefficient

- Phase 70 confirmed the cleanup pattern; phases 71-87 were essentially mechanical repetition — could have been parallelized more aggressively from Phase 70 onward
- Some skill files had multiple issues (wrong prefix, wrong z-index, wrong shadow, missing tokens) that weren't surfaced until the phase executed — an audit phase beforehand could have batched this discovery
- The v4.0 audit file being present caused a momentary confusing pre-flight check in milestone completion (wrong audit version in directory)

### Patterns Established

- **Double-fallback var() form**: `var(--color-background, var(--ui-color-background))` — use for all color token defaults in docs tables and skill files; single `var()` breaks without `@lit-ui/core` import
- **Semantic dark mode cascade**: Hardcoded `.dark` token blocks should only contain oklch literals and white values that cannot cascade through semantic tokens
- **THEME-SPEC.md first**: Any style polish milestone should start with a token reference document before touching components
- **Behavior Notes sections**: Every skill file should include a Behavior Notes section (8-13 entries) covering the component-specific behaviors that aren't obvious from props/events tables

### Key Lessons

1. Polish milestones with a clear structural pattern (N waves × M components) are well-suited to high parallelism — the v8.0 phases were near-identical in structure and could have used more parallel execution
2. Stale documentation compounds over time — by v7.0, token tables were 3-4x smaller than actual token sets; building accuracy checks into phase execution prevents drift
3. A small "discovery" plan at milestone start (like Phase 69) that produces a spec document pays dividends across all subsequent phases — one authoritative source prevents repeated look-up

### Cost Observations

- Phases executed with sonnet (quality profile)
- 179 commits across 23 days
- Notable: mechanical nature of waves 01-03 made this an efficient milestone; most plans touched exactly 1 file

---

## Milestone: v9.0 — Charts System

**Shipped:** 2026-03-01
**Phases:** 10 (88-97) | **Plans:** 25

### What Was Built

- `@lit-ui/charts` package with `BaseChartElement` abstract class solving all 5 ECharts cross-cutting concerns before any chart was built: SSR guard, WebGL lifecycle (loseContext before dispose), ThemeBridge CSS token resolution, ResizeObserver, and circular buffer streaming
- 8 chart components (Line, Area, Bar, Pie/Donut, Scatter/Bubble with WebGL, Heatmap, Candlestick, Treemap) each with per-chart option builders, registry files for ECharts tree-shaking (~135KB gzipped vs 400KB full), and streaming via `pushData()`
- Dual streaming paths: native `appendData` for Line/Area (avoids `setOption` data-wipe trap); circular buffer + RAF batching for all others; Heatmap and Treemap override `pushData()` with cell-update and no-op semantics respectively
- CLI registry for all 8 chart types, subpath exports (`@lit-ui/charts/line-chart`) for bundler tree-shaking, copy-source starter templates; complete `@lit-ui/charts` distribution parity with all other LitUI packages
- 8 interactive docs pages with live React demos using `useRef+useEffect` for `.data` JS property assignment, PropsTable API references, CSS token tables, and bundle size guidance (DOCS-02)
- 9 AI skill files: main skill router updated (entries 24-32), charts secondary router with full BaseChartElement API + 17 CSS tokens, plus 8 chart sub-skills each with 3+ prominent gotcha warnings (OHLC order, treemap pushData no-op, heatmap JS-only props)

### What Worked

- Front-loading all cross-cutting concerns in Phase 88 (BaseChartElement) meant Phases 89-95 were purely additive — no re-architecting mid-milestone
- Research phase before planning surfaced 5 critical ECharts pitfalls (CRITICAL-01 through CRITICAL-05) that would have been painful to discover during implementation; `setOption` wipes appendData data is especially non-obvious
- One-phase-per-chart type structure (89: Line+Area, 90: Bar, 91: Pie, etc.) gave clean isolation and enabled parallel plan execution within each phase
- Pinning ECharts to 5.6.0 + echarts-gl 2.0.9 upfront avoided mid-milestone version compatibility issues
- Phase 97 (skill file updates) treated as a first-class phase rather than an afterthought — resulted in comprehensive skill coverage with chart-specific gotcha warnings in multiple locations

### What Was Inefficient

- Phase 96 (CLI + Docs) had 4 plans but was effectively Wave 2 (docs pages) waiting on Wave 1 (subpath exports + registry) — could have been planned as a 2-wave phase for better parallelism
- The `095-` / `096-` directory naming (with leading zero) diverged from the `88-` / `89-` convention, causing the `roadmap analyze` tool to report those phases as missing; minor but created confusing readiness output during milestone completion

### Patterns Established

- **BaseChartElement-first**: For any complex integration with a third-party library (ECharts, Three.js, etc.), always build the abstract base class with all cross-cutting concerns before any concrete implementation
- **Dual streaming paths**: `appendData` for time-series (never `setOption` after streaming starts); circular buffer + RAF for all other chart types — document this boundary prominently in skill files
- **Chart sub-skill pattern**: Defer Methods/Events/CSS tokens to a shared cross-reference skill (skills/charts/SKILL.md) rather than duplicating the 17-token table across 8 sub-skills
- **Three-location warnings**: Critical gotcha warnings (OHLC order, heatmap JS-only props, treemap pushData no-op) placed in 3 locations: file header, Props table note, and Behavior Notes — ensures visibility regardless of how the skill is accessed
- **loseContext() before dispose()**: Standard GPU cleanup pattern for any WebGL component — must be documented and enforced in the base class

### Key Lessons

1. The `setOption` vs `appendData` boundary in ECharts is a latent bug source — any time-series chart that mixes both paths will silently wipe streamed data; the correct pattern is appendData-only once streaming starts
2. echarts-gl's `ScatterGL` series ignores per-point `symbolSize` callbacks when using the GPU path — fixed symbol size is a hard GPU limitation, not a bug; document prominently to prevent repeated investigation
3. Treemap's `pushData()` no-op design (rather than attempting cell update) was the correct choice — the hierarchical tree structure has no meaningful "circular buffer" equivalent; force full reassignment instead
4. OhlcBar order `[open, close, low, high]` (not the OHLC acronym order) is a long-standing ECharts quirk that produces silent wrong output if misapplied — the multi-location warning strategy was the right call

### Cost Observations

- Phases executed with sonnet (quality profile), yolo mode
- 10 phases, 25 plans in 2 days
- Notable: BaseChartElement (Phase 88) was the highest-leverage phase — ~8 plans of cross-cutting work condensed into 3 plans; subsequent chart phases were 2 plans each

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 5 | 22 | Initial project setup; manual planning |
| v2.0 | 8 | 27 | Monorepo, SSR — architectural milestone |
| v7.0 | 8 | 28 | TanStack integration, complex component |
| v8.0 | 19 | 55 | Polish pass — high phase count, mechanical pattern |
| v9.0 | 10 | 25 | Third-party integration (ECharts) — BaseChartElement-first architecture |

### Cumulative State

| Milestone | LOC | Packages | Components |
|-----------|-----|----------|------------|
| v1.0 | ~4,000 | 1 | 2 |
| v7.0 | ~91,000 | 21 | 21 |
| v8.0 | ~110,000 | 21 | 21 (all polished) |
| v9.0 | ~116,000 | 22 | 27 (21 UI + 8 charts) |
