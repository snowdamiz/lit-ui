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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 5 | 22 | Initial project setup; manual planning |
| v2.0 | 8 | 27 | Monorepo, SSR — architectural milestone |
| v7.0 | 8 | 28 | TanStack integration, complex component |
| v8.0 | 19 | 55 | Polish pass — high phase count, mechanical pattern |

### Cumulative State

| Milestone | LOC | Packages | Components |
|-----------|-----|----------|------------|
| v1.0 | ~4,000 | 1 | 2 |
| v7.0 | ~91,000 | 21 | 21 |
| v8.0 | ~110,000 | 21 | 21 (all polished) |
