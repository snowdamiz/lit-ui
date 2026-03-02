---
phase: 106-xml-compiler
plan: "01"
subsystem: infra
tags: [xml, compiler, markdown, knowledge-base, node-scripts, experimental-strip-types]

# Dependency graph
requires:
  - phase: 105-canvas-font-foundation
    provides: "ESM script pattern via fileURLToPath(import.meta.url) — used identically here"
provides:
  - "scripts/compile-knowledge.ts — Node.js compiler that reads all 33 skill SKILL.md files and produces XML"
  - "skill/lit-ui-knowledge.xml — 33-skill XML knowledge document with 227 sections"
  - "XML entity encoding: all <, >, &, \" in skill content are properly escaped"
  - "Deterministic output: router skill first, sub-skills sorted alphabetically by directory name"
affects:
  - 107-png-renderer
  - 108-wiring

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "XML compiler pattern: stripFrontmatter -> extractSkillName -> extractSections -> buildSkillXml -> writeFile"
    - "xmlEscape order: & first (prevents double-encoding), then <, >, \""
    - "Section extraction via lookahead split: /^(?=## )/m keeps ## prefix for title extraction"
    - "Deterministic ordering: router skill (skill/SKILL.md) first, then (await fs.readdir(SKILLS_DIR)).sort()"

key-files:
  created:
    - scripts/compile-knowledge.ts
    - skill/lit-ui-knowledge.xml
  modified: []

key-decisions:
  - "Implemented xmlEscape with & replacement first — prevents double-encoding of sequences like &amp;lt;"
  - "Used lookahead split /^(?=## )/m — preserves ## prefix so title extraction regex works correctly"
  - "H1 heading used only for <skill name=\"...\"> attribute, never as a <section> element"
  - "Trailing \\n in stripFrontmatter regex (/^---[\\s\\S]*?---\\n/) prevents frontmatter bleed"
  - "Check 6 heuristic (description:) produced false positive on toast code examples — verified no actual frontmatter bleed by inspecting XML structure"

patterns-established:
  - "XML compiler structure: helpers (stripFrontmatter, xmlEscape, extractSkillName, extractSections, buildSkillXml) + compileKnowledge() main function"
  - "Top-level await: await compileKnowledge() at module root (no IIFE) — works with --experimental-strip-types"
  - "Skill element indentation: el.split('\\n').map(l => '  ' + l).join('\\n') for 2-space indent"

requirements-completed: [XMLC-01, XMLC-02, XMLC-03, XMLC-04, XMLC-05]

# Metrics
duration: 2min
completed: 2026-03-02
---

# Phase 106 Plan 01: XML Compiler Summary

**Pure Node.js compiler reads all 33 skill SKILL.md files, strips YAML frontmatter, parses ## headings into 227 `<section>` elements, entity-encodes all content, and writes a deterministic well-formed `skill/lit-ui-knowledge.xml`**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-02T05:22:55Z
- **Completed:** 2026-03-02T05:24:35Z
- **Tasks:** 2
- **Files modified:** 2 (scripts/compile-knowledge.ts created, skill/lit-ui-knowledge.xml generated)

## Accomplishments

- Implemented `scripts/compile-knowledge.ts` (110 lines) using only Node.js built-ins — zero new dependencies
- Generated `skill/lit-ui-knowledge.xml` with 33 `<skill>` elements and 227 `<section>` elements
- All angle brackets in skill content are entity-encoded (`&lt;lui-button&gt;`, TypeScript generics, etc.)
- Router skill (`lit-ui`) is first element; 32 sub-skills follow in alphabetical directory order
- Deterministic output confirmed: two runs produce byte-identical XML
- No YAML frontmatter bleed: `/^---[\s\S]*?---\n/` regex correctly strips all 33 frontmatter blocks

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement scripts/compile-knowledge.ts** - `2b90595` (feat)
2. **Task 2: Validate XML output correctness** - `dfc1ddf` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `scripts/compile-knowledge.ts` — XML compiler script; runs via `node --experimental-strip-types scripts/compile-knowledge.ts`; 110 lines, pure Node.js built-ins
- `skill/lit-ui-knowledge.xml` — Compiled knowledge document; 33 skills, 227 sections, ~3984 lines

## Decisions Made

- `xmlEscape` replaces `&` first — the research explicitly noted this prevents double-encoding (e.g., `&amp;lt;` from literal `&lt;` in content)
- Used lookahead split `/^(?=## )/m` for section extraction — keeps `## ` prefix in the part that follows, allowing `/^## (.+)\n([\s\S]*)/` title extraction to work
- `"` is also escaped in `xmlEscape` — section titles used in XML attribute values need `&quot;` for well-formedness
- H1 heading (`# lit-ui`) is extracted only for the skill name attribute, never turned into a section element
- Check 6 (frontmatter bleed detection via `description:`) produced a false positive — the only `description:` in the XML is in toast skill code examples (JavaScript API calls). Verified no actual frontmatter bleed by confirming first section content starts with skill body text, not YAML fields.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Check 6 in Task 2 false positive: the heuristic `xml.includes('description:')` triggered on `description: 'Your message was delivered.'` in toast skill JavaScript code examples, not frontmatter. Verified the XML structure is correct: all 33 skills start with proper `<section>` elements, no `name:` or YAML fields in content.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 107 (PNG Renderer) can now read `skill/lit-ui-knowledge.xml` to render the knowledge image
- XML structure: `<skills>` root, `<skill name="...">` per skill, `<section title="...">` per ## heading
- Content is fully entity-encoded — Phase 107 renderer must decode entities when rendering text
- File path: `skill/lit-ui-knowledge.xml` from project root
- Compiler invocation: `node --experimental-strip-types scripts/compile-knowledge.ts`

## Self-Check: PASSED

- FOUND: scripts/compile-knowledge.ts
- FOUND: skill/lit-ui-knowledge.xml
- FOUND: .planning/phases/106-xml-compiler/106-01-SUMMARY.md
- FOUND commit: 2b90595 (feat(106-01): implement XML knowledge compiler script)
- FOUND commit: dfc1ddf (feat(106-01): generate skill/lit-ui-knowledge.xml from all 33 skills)

---
*Phase: 106-xml-compiler*
*Completed: 2026-03-02*
