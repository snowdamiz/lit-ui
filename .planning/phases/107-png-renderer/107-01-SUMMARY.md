---
phase: 107-png-renderer
plan: "01"
subsystem: infra
tags: [canvas, png, napi-rs, xml, monospace, font, rendering, knowledge-image]

# Dependency graph
requires:
  - phase: 105-canvas-font-foundation
    provides: Two-pass canvas layout pattern, JetBrains Mono font registration, @napi-rs/canvas setup
  - phase: 106-xml-compiler
    provides: skill/lit-ui-knowledge.xml — 33 skills, 227 sections, xmlEscape encoding

provides:
  - scripts/render-knowledge-image.ts — XML parser, entity decoder, two-pass PNG renderer
  - skill/lit-ui-knowledge.png — 1500x50524px PNG of all 33 LitUI component skills

affects: [108-wiring, ai-tooling, skill-distribution, injectOverviewSkills]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-pass canvas layout — probe canvas (1500x1) measures height, final canvas renders at exact height
    - measureAndRender() shared function pattern — identical y accumulation for both probe and render passes
    - decodeEntities() reverse order — &quot;, &gt;, &lt;, &amp; (last) to prevent double-decode
    - Non-greedy XML regex — /<skill name="([^"]*)">([\s\S]*?)<\/skill>/g avoids multi-skill span

key-files:
  created:
    - scripts/render-knowledge-image.ts
    - skill/lit-ui-knowledge.png
  modified: []

key-decisions:
  - "Combined Task 1 (helper functions) and Task 2 (main function + PNG run) into a single file write since they compose the complete script — no intermediate partial state needed"
  - "SEPARATOR_HEIGHT = LINE_HEIGHT * 2 reserved but individual y advances kept explicit (LINE_HEIGHT for rule, LINE_HEIGHT for label) for clarity in measureAndRender()"
  - "decodeEntities called on skill name, section title, and section content — all three paths decode before any rendering occurs"

patterns-established:
  - "render-knowledge-image.ts pattern: ESM imports, fileURLToPath __dirname, path.join('../skill/') for artifact paths"
  - "measureAndRender(ctx, skills, render) boolean flag pattern for shared probe/final pass logic"

requirements-completed: [PNGR-01, PNGR-02, PNGR-03, PNGR-04, PNGR-05]

# Metrics
duration: 5min
completed: 2026-03-02
---

# Phase 107 Plan 01: PNG Renderer Summary

**TypeScript renderer producing a 1500x50524px monospace PNG of all 33 LitUI skills via two-pass canvas layout and XML entity decoding**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-02T05:45:34Z
- **Completed:** 2026-03-02T05:50:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Implemented `scripts/render-knowledge-image.ts` with XML parser, entity decoder, and two-pass render function
- Generated `skill/lit-ui-knowledge.png` at 1500x50524px — 8.7MB, all 33 skills with 32 separators
- Entity decoding confirmed working: 463 `&lt;` sequences in XML all decoded to `<` in PNG content
- Two-pass layout: probe canvas (1500x1) computed 50524px height; final canvas created at exact height

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement XML parser, entity decoder, and two-pass render function** - `23dddfe` (feat)
2. **Task 2: Run script to produce PNG artifact** - `fa16cee` (feat)

**Plan metadata:** (docs commit — created with SUMMARY.md)

## Files Created/Modified
- `scripts/render-knowledge-image.ts` — XML parser, entity decoder, two-pass renderer, main function; run via `node --experimental-strip-types`
- `skill/lit-ui-knowledge.png` — Generated artifact: 1500x50524px, 8.7MB, white background, JetBrains Mono 8pt, black text

## Decisions Made
- Combined Task 1 helper functions and Task 2 main function into a single complete file write — no value in creating a partial file that would immediately be extended
- Kept SEPARATOR_HEIGHT constant defined but advanced y with two explicit LINE_HEIGHT steps in measureAndRender() for readability
- decodeEntities called on all three data paths (skill name, section title, section content) before any content enters the lines array

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Script ran on first attempt:
- Font registered successfully from `scripts/fonts/JetBrainsMono-Regular.ttf`
- XML parsed: 33 skills, all entity sequences decoded
- PNG produced at 1500x50524px (50524px is within the ~30000-60000px plausible range)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `skill/lit-ui-knowledge.png` committed to git — picked up automatically by Phase 108 wiring (injectOverviewSkills, CLI `"files": ["dist", "skill"]`)
- Phase 108 can proceed immediately; no blockers

---
*Phase: 107-png-renderer*
*Completed: 2026-03-02*
