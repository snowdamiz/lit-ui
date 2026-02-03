---
phase: 57-accordion-polish-package
plan: 02
subsystem: accordion
tags: [ssr, package, isServer, declarative-shadow-dom, npm]
dependency-graph:
  requires: [57-01]
  provides: [ssr-safe-accordion, publishable-accordion-package]
  affects: [58, 59, 60]
tech-stack:
  added: []
  patterns: [isServer-guard-pattern]
key-files:
  created: []
  modified:
    - packages/accordion/src/accordion-item.ts
    - packages/accordion/package.json
decisions:
  - id: data-state-client-only
    decision: "data-state attribute set only client-side via isServer guards to avoid SSR mismatches"
    rationale: "Convenience attribute not needed in DSD output; client-side only avoids hydration issues"
metrics:
  duration: 59s
  completed: 2026-02-03
---

# Phase 57 Plan 02: SSR Verification & Package Publishability Summary

**One-liner:** isServer guards on data-state setAttribute for SSR safety, "accordion" keyword added, build and publishability verified

## What Was Done

### Task 1: SSR compatibility verification and fixes (6e9d353)

**Changes to `packages/accordion/src/accordion-item.ts`:**

1. **Imported `isServer`** from `lit` (added to existing import line)
2. **Guarded `connectedCallback()` data-state setAttribute** with `if (!isServer)` -- prevents setAttribute during server rendering
3. **Guarded `updated()` data-state setAttribute** with `if (!isServer)` -- same protection in reactive update lifecycle

**Verified without changes needed:**
- Chevron SVG: inline in `render()` template, serializes correctly in Declarative Shadow DOM
- Lazy mounting: `nothing` sentinel omits slot correctly in SSR; no browser API usage
- Parent `accordion.ts`: confirmed `isServer` import, `firstUpdated()` slotchange workaround, no unguarded `document`/`window` references

**Verification results:**
- `npx tsc --noEmit` -- zero errors
- `isServer` appears at lines 17, 168, 175 in accordion-item.ts
- No unguarded `document`/`window` references in accordion src (only a JSDoc comment mentions "document outline")

### Task 2: Package publishability audit and build verification (b2c4623)

**Package.json audit (all fields present and correct):**

| Field | Value | Status |
|-------|-------|--------|
| name | @lit-ui/accordion | correct |
| version | 1.0.0 | correct |
| type | module | correct |
| main | dist/index.js | correct |
| module | dist/index.js | correct |
| types | dist/index.d.ts | correct |
| exports | "." with import + types | correct |
| files | ["dist"] | correct |
| sideEffects | true | correct |
| peerDependencies | lit ^3.0.0, @lit-ui/core ^1.0.0 | correct |
| keywords | added "accordion" | fixed |

**Build output:**
- `pnpm build` succeeds in 724ms
- `dist/index.js` -- 10.71 KB (gzip: 3.40 KB)
- `dist/index.d.ts` -- 5.3 KB (rolled up declarations)

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **data-state is client-only** -- setAttribute calls guarded with `isServer` to prevent SSR mismatches. The attribute is a convenience for CSS selectors and is not needed in server-rendered output.

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 6e9d353 | fix(57-02): add isServer guards for SSR-safe data-state attribute |
| 2 | b2c4623 | chore(57-02): add accordion keyword and verify package publishability |

## Success Criteria Verification

- [x] Accordion SSR: chevron renders in DSD output, data-state is client-only (isServer guarded), lazy mounting omits slot correctly
- [x] Package: builds successfully, dist contains JS and DTS, package.json has all publishable fields
- [x] Zero TypeScript errors

## Next Phase Readiness

Phase 57 is now complete. The @lit-ui/accordion package is:
- Feature-complete (chevron, data-state, lazy mounting from 57-01)
- SSR-verified (isServer guards from 57-02)
- Publishable (all npm fields verified, build produces correct output)
