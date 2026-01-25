# Phase 20: Documentation - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Update docs site with NPM installation and SSR guides. Developers find NPM as the primary installation path, SSR setup for Next.js/Astro, and migration guide for converting copy-source projects to npm mode.

</domain>

<decisions>
## Implementation Decisions

### Guide structure
- NPM is the primary installation path, copy-source mentioned as alternative
- All code inline in docs, no external links to examples/ folder
- SSR location: Claude's discretion (likely top-level or under Guides based on content)
- Migration docs location: Claude's discretion based on content volume

### SSR content depth
- Just the "how" — setup steps only, no theory on DSD/hydration
- Framework-specific sections for Next.js and Astro setup
- Hydration import order mentioned as part of steps (not specially highlighted)
- FOUC prevention CSS included with brief explanation of why

### Code examples
- Minimal snippets showing only relevant lines (not full copy-paste blocks)
- npm install commands, mention pnpm/yarn work too
- All examples in TypeScript
- Boilerplate in framework examples: Claude's discretion based on complexity

### Claude's Discretion
- SSR docs placement (top-level section vs nested under Guides)
- Migration docs placement (dedicated page vs section in installation)
- Framework example boilerplate level
- Migration guide structure (step-by-step vs CLI-focused)
- Whether to cover partial migration (some npm, some copy-source)
- Decision guide for npm vs copy-source trade-offs
- Whether to document rollback from npm to copy-source

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-documentation*
*Context gathered: 2026-01-25*
