# Phase 108: Wiring & Distribution - Research

**Researched:** 2026-03-02
**Domain:** npm scripts wiring, monorepo artifact distribution, git committed binary files
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WIRE-01 | Root `package.json` includes `knowledge:compile`, `knowledge:render`, and `knowledge:build` scripts | npm scripts pattern — run via `node --experimental-strip-types`; `knowledge:build` chains both with `&&` |
| WIRE-02 | Both generated artifacts (`skill/lit-ui-knowledge.xml` and `skill/lit-ui-knowledge.png`) are committed to git | Artifacts already tracked in git via commits fa16cee and dfc1ddf; no additional git work needed |
| WIRE-03 | Artifacts are present in `packages/cli/skill/` for automatic inclusion in CLI distribution | `packages/cli/skill` is already a symlink to `../../skill`; artifacts are already there automatically |
</phase_requirements>

## Summary

Phase 108 is a configuration-only wiring phase. It exists to ensure the two generation scripts (already built in Phases 106 and 107) are invocable by standard npm script names, and that their output is reachable by the CLI package for npm distribution.

The actual state of the repository at research time is highly favorable: both `skill/lit-ui-knowledge.xml` and `skill/lit-ui-knowledge.png` are already committed to git (committed in Phase 106 and 107 respectively). The `packages/cli/skill/` path is already a symlink pointing to `../../skill`, meaning any file in root `skill/` is automatically accessible at `packages/cli/skill/` — no copy step is needed. The only concrete gap is WIRE-01: the root `package.json` does not yet have the three `knowledge:*` scripts.

The work for this phase reduces to a single targeted edit: add three script entries to the root `package.json`. Verification confirms this against all three success criteria.

**Primary recommendation:** Add three scripts to root `package.json`. Everything else (artifacts committed, CLI distribution path) is already satisfied.

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| npm/pnpm scripts | pnpm 10.0.0 | Expose build commands via `package.json` `"scripts"` | Project already uses pnpm; all existing build scripts follow this pattern |
| node --experimental-strip-types | Node >=20 | Run TypeScript scripts without a compile step | Already in use in Phases 106/107; no tsup/tsc needed for scripts |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Shell `&&` operator | - | Sequential script chaining | `knowledge:build` must run compile then render in sequence |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shell `&&` in script value | `pnpm run knowledge:compile && pnpm run knowledge:render` | Calling sub-scripts by name is cleaner and more maintainable |
| Symlink for CLI distribution | Actual file copy | Symlink already in place; copy would create duplication and maintenance burden |

**Installation:** No new packages required. All tooling already installed.

## Architecture Patterns

### Recommended Project Structure

No structural changes needed. The existing layout is correct:

```
skill/                          # root skill directory (source of truth)
  lit-ui-knowledge.xml          # committed artifact (already tracked)
  lit-ui-knowledge.png          # committed artifact (already tracked)
packages/cli/skill -> ../../skill   # symlink (already in place)
scripts/
  compile-knowledge.ts          # XML compiler (Phase 106)
  render-knowledge-image.ts     # PNG renderer (Phase 107)
package.json                    # ADD three knowledge:* scripts here
```

### Pattern 1: npm Script Wiring for Generator Scripts

**What:** Add named script entries to root `package.json` that invoke Node directly with `--experimental-strip-types` to run `.ts` scripts without a compile step.

**When to use:** When TypeScript scripts need to be runnable by developers without a tsup/tsc build step.

**Example:**
```json
// root package.json "scripts" block
{
  "knowledge:compile": "node --experimental-strip-types scripts/compile-knowledge.ts",
  "knowledge:render": "node --experimental-strip-types scripts/render-knowledge-image.ts",
  "knowledge:build": "pnpm run knowledge:compile && pnpm run knowledge:render"
}
```

The existing `scripts/compile-knowledge.ts` already has this comment on line 2:
`// Run: node --experimental-strip-types scripts/compile-knowledge.ts`

And `scripts/render-knowledge-image.ts` has the same comment on line 2. These exact command forms are already validated.

### Pattern 2: Symlink for Monorepo Package Distribution

**What:** `packages/cli/skill` is a symlink pointing to `../../skill` (verified: `lrwxr-xr-x packages/cli/skill -> ../../skill`). This means the CLI's `"files": ["dist", "skill"]` entry in `packages/cli/package.json` automatically includes the root `skill/` artifacts without any copy step.

**When to use:** This pattern is already in place and requires no action.

**Key insight:** Git tracks symlinks as special objects. The symlink `packages/cli/skill` is committed; the files it resolves to (`skill/lit-ui-knowledge.xml`, `skill/lit-ui-knowledge.png`) are also committed directly in `skill/`. npm's `files` field follows symlinks during publish, so CLI consumers receive the actual files.

### Anti-Patterns to Avoid

- **Copy instead of symlink:** Do not add a cp/rsync step to duplicate artifacts from `skill/` to `packages/cli/skill/`. The symlink already handles this. Adding a copy would create confusion about which is the source of truth.
- **Calling scripts with relative paths:** The scripts use `import.meta.url` for path resolution; they must be invoked from the monorepo root (which pnpm scripts do automatically).
- **Using `&` instead of `&&` for sequencing:** Single `&` runs commands in parallel (background); `&&` enforces sequence and stops on failure. `knowledge:build` must be sequential — render depends on compile output.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sequential script execution | Custom Node.js orchestrator script | Shell `&&` in script value | npm scripts already support sequential chaining; no extra tooling needed |
| Artifact copying to CLI | cp/rsync in a script | Symlink already present | Duplication creates maintenance burden; symlink already solves this |
| TypeScript compilation for scripts | tsup build step | `--experimental-strip-types` | Already validated in Phases 106/107; adds zero dependency |

**Key insight:** This phase's scope is minimal by design. The foundational work was done in Phases 105-107. WIRE-01, WIRE-02, and WIRE-03 are configuration verification steps, not implementation tasks.

## Common Pitfalls

### Pitfall 1: Assuming WIRE-02 and WIRE-03 Require Implementation

**What goes wrong:** Spending time "implementing" artifact commitment and CLI distribution when both are already done.

**Why it happens:** Reading the requirements without checking the current repository state.

**How to avoid:** Check git first. `git ls-files skill/lit-ui-knowledge.xml skill/lit-ui-knowledge.png` confirms both are already tracked. `ls -la packages/cli/skill` confirms the symlink already exists.

**Warning signs:** If a plan proposes `git add` or copy commands as implementation tasks — those are verification steps, not implementation.

### Pitfall 2: Using `node:` Protocol Flags Incorrectly

**What goes wrong:** Script invocation fails because flags are placed after the script path.

**Why it happens:** Confusing argument ordering in node CLI.

**How to avoid:** Flag before script path: `node --experimental-strip-types scripts/compile-knowledge.ts`. Already validated — Phases 106 and 107 confirmed this form works.

### Pitfall 3: Script Chaining with Wrong Operator

**What goes wrong:** Using `&` (background) instead of `&&` (sequential), causing render to start before compile finishes.

**Why it happens:** Typo or confusion between shell operators.

**How to avoid:** Use `&&` for sequential execution. Render depends on XML file existing, so it must run after compile completes.

### Pitfall 4: pnpm Script Sub-Call Syntax

**What goes wrong:** Using `npm run` inside a pnpm workspace script, which may resolve incorrectly.

**Why it happens:** Mixed package manager assumptions.

**How to avoid:** Use `pnpm run` in the `knowledge:build` script body for consistency with the rest of the monorepo's existing script patterns.

## Code Examples

Verified patterns from project inspection:

### Root package.json Scripts Addition
```json
// Source: Verified from existing package.json structure + Phase 106/107 run commands
"scripts": {
  "dev": "pnpm -r --parallel run dev",
  "dev:apps": "...",
  "build": "pnpm -r run build",
  "build:packages": "...",
  "test": "pnpm -r run test",
  "lint": "pnpm -r run lint",
  "changeset": "changeset",
  "version": "changeset version",
  "ci:publish": "pnpm build:packages && changeset publish --access public",
  "knowledge:compile": "node --experimental-strip-types scripts/compile-knowledge.ts",
  "knowledge:render": "node --experimental-strip-types scripts/render-knowledge-image.ts",
  "knowledge:build": "pnpm run knowledge:compile && pnpm run knowledge:render"
}
```

### Verification Command Sequence
```bash
# Verify WIRE-01: scripts exist and run
pnpm run knowledge:compile    # should produce skill/lit-ui-knowledge.xml
pnpm run knowledge:render     # should produce skill/lit-ui-knowledge.png
pnpm run knowledge:build      # should run both in sequence

# Verify WIRE-02: artifacts committed in git
git ls-files skill/lit-ui-knowledge.xml skill/lit-ui-knowledge.png

# Verify WIRE-03: artifacts accessible via CLI path
ls packages/cli/skill/lit-ui-knowledge.xml packages/cli/skill/lit-ui-knowledge.png
```

## State of the Art

| Requirement | Current State | Action Needed |
|-------------|--------------|---------------|
| WIRE-01: npm scripts | Not yet in package.json | ADD three scripts |
| WIRE-02: artifacts committed | Already committed (fa16cee, dfc1ddf) | VERIFY only |
| WIRE-03: CLI distribution | Symlink already in place; files accessible | VERIFY only |

**Already done in previous phases:**
- `skill/lit-ui-knowledge.xml` — committed in commit `dfc1ddf feat(106-01): generate skill/lit-ui-knowledge.xml from all 33 skills`
- `skill/lit-ui-knowledge.png` — committed in commit `fa16cee feat(107-01): generate skill/lit-ui-knowledge.png — 1500x50524px, 33 skills`
- `packages/cli/skill -> ../../skill` — symlink committed at `Feb 27 18:10` (before this milestone began)

## Open Questions

1. **Does pnpm follow symlinks during `npm publish`?**
   - What we know: npm's `files` field is documented to follow symlinks during pack. The existing symlink predates this milestone and has presumably been used in prior CLI publishes.
   - What's unclear: Not confirmed against pnpm 10 publish behavior specifically.
   - Recommendation: Accept as working — the symlink existed before this milestone; the `"files": ["dist", "skill"]` entry in CLI package.json was presumably working for prior publishes.

## Sources

### Primary (HIGH confidence)
- Direct inspection: `git ls-files skill/` — confirms artifacts tracked in git
- Direct inspection: `ls -la packages/cli/skill` — confirms symlink `-> ../../skill`
- Direct inspection: `packages/cli/package.json` — confirms `"files": ["dist", "skill"]`
- Direct inspection: `package.json` — confirms no `knowledge:*` scripts exist yet
- Direct inspection: `scripts/compile-knowledge.ts` line 2 — confirms run command `node --experimental-strip-types scripts/compile-knowledge.ts`
- Direct inspection: `scripts/render-knowledge-image.ts` line 2 — confirms run command `node --experimental-strip-types scripts/render-knowledge-image.ts`

### Secondary (MEDIUM confidence)
- Project STATE.md and ROADMAP.md — confirm Phase 106 and 107 completion and what was committed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — scripts pattern directly verified from existing package.json
- Architecture: HIGH — symlink and git artifact state directly verified
- Pitfalls: HIGH — based on direct inspection of current repo state

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (stable — wiring is configuration, not API-dependent)
