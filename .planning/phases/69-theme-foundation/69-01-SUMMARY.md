---
phase: 69-theme-foundation
plan: "01"
subsystem: design-tokens
tags: [theme, tokens, css-custom-properties, monochrome, shadcn, documentation]
dependency_graph:
  requires: []
  provides:
    - ".planning/phases/69-theme-foundation/THEME-SPEC.md"
    - "verified --ui-* token defaults in packages/core/src/styles/tailwind.css"
  affects:
    - "phases 70-87 — all component polish phases depend on THEME-SPEC.md"
tech_stack:
  added: []
  patterns:
    - "var(--color-semantic, var(--ui-color-semantic)) double-fallback pattern for Shadow DOM compatibility"
    - "oklch color space for all monochrome palette values"
key_files:
  created:
    - ".planning/phases/69-theme-foundation/THEME-SPEC.md"
  modified: []
decisions:
  - "tailwind.css :root block required no value changes — audit confirmed pre-existing alignment with shadcn monochrome aesthetic"
  - "THEME-SPEC.md organized with primitive scale first, then semantic scale, then per-component token reference"
  - "Each component section includes 'what matching means' bullets to give phase executors clear success criteria"
metrics:
  duration: "4 minutes"
  completed: "2026-02-28"
  tasks_completed: 2
  files_created: 1
  files_modified: 0
---

# Phase 69 Plan 01: Theme Foundation Summary

**One-liner:** Audited all --ui-* token defaults in tailwind.css and authored THEME-SPEC.md as the authoritative v8.0 monochrome design token reference for all 18 component polish phases.

## What Was Done

### Task 1: Audit tailwind.css Token Defaults

Performed a full audit of the `:root` block in `packages/core/src/styles/tailwind.css` against the shadcn monochrome aesthetic specification.

Audit criteria checked:
1. **Border radius consistency** — Form inputs (input, textarea, select) use `0.375rem`. Cards/overlays (dialog, popover, toast) use `0.5rem`. Fully-rounded elements (switch track, radio dot) use `9999px`. All correct.
2. **Shadow subtlety** — Dialog/toast use lg shadow (`0 10px 15px -3px ... 0.1`). Popover/time-picker/date-picker use slightly lighter (`... 0.08`). Tooltip uses xs/sm shadow. All correct.
3. **Transition timing** — All interactive components use `150ms`. Panel animations (accordion expand, tabs indicator) use `200ms`. All correct.
4. **Color token consistency** — All color tokens use the `var(--color-*, var(--ui-color-*))` double-fallback pattern. No hardcoded raw colors in semantic roles.
5. **Component completeness** — Button: all 5 variant token sets present. Checkbox: unchecked, checked, indeterminate, focus, error states all present. Radio: same. Switch: track/thumb for unchecked, checked, disabled all present.

Result: **No changes required.** The file was already aligned to the shadcn monochrome spec. Build verified clean (`vite v7.3.1, 0 errors`).

### Task 2: Write THEME-SPEC.md

Created `.planning/phases/69-theme-foundation/THEME-SPEC.md` as the canonical reference for all 18 subsequent component polish phases.

Document structure:
- **Purpose** — explains what the document is and how phases 70-87 use it
- **Design Principles** — 7 core principles of the monochrome theme
- **Primitive Token Scale** — brand/gray scale (950-50), radius scale, shadow scale
- **Semantic Color Scale** — all 14 `--ui-color-*` tokens with resolved values
- **Global System Tokens** — focus ring width/offset/color, contrast threshold
- **Component Token Reference** — 18 sections covering all components in plan order

Each component section documents:
- Layout tokens (radius, border-width, shadow, padding)
- Typography tokens (font-size, font-weight)
- Spacing tokens (padding per size)
- State color tokens (default, focus, error, disabled, checked, etc.)
- "What matching means" bullet list for phase executors

Verification: 21 `###` sections (18 component + 3 primitive scale sections).

## Artifacts Produced

| Artifact | Path | Purpose |
|----------|------|---------|
| Token reference | `.planning/phases/69-theme-foundation/THEME-SPEC.md` | Authoritative spec for phases 70-87 |
| Verified baseline | `packages/core/src/styles/tailwind.css` | Confirmed unchanged, already correct |

## Decisions Made

1. **No tailwind.css changes required** — The `:root` block was already aligned to the shadcn monochrome aesthetic before this phase began. This is expected since the v7.0 implementation already targeted this aesthetic.

2. **THEME-SPEC structure** — Organized from primitives to semantics to components, mirroring the three-layer architecture described in tailwind.css. This makes it easy to trace how component tokens resolve to raw values.

3. **"What matching means" format** — Added concrete behavior bullets to each component section rather than abstract descriptions. This gives phase executors a checklist to verify their implementation against.

## Deviations from Plan

None — plan executed exactly as written. The audit (Task 1) confirmed no value changes needed, which is a valid outcome.

## Verification Results

1. `pnpm --filter @lit-ui/core build` — PASSED (0 errors, 862ms build time)
2. THEME-SPEC.md exists with 21 `###` sections (18 component + 3 primitive) — PASSED
3. Spot-check button/checkbox/accordion values match tailwind.css — PASSED
4. No `--ui-*` token names changed (tailwind.css has zero diff vs pre-task state) — PASSED

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| THEME-SPEC.md exists | FOUND |
| 69-01-SUMMARY.md exists | FOUND |
| Commit 7f671ce exists | FOUND |
| Commit 6bc5f69 exists | FOUND |
