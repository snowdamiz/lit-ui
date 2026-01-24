# Phase 7: Getting Started - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Documentation that onboards new users: installation instructions for `npx lit-ui init`, quick start to add first component, and understanding project structure. Single page in the docs site targeting developers with existing React/Vue/Svelte projects.

</domain>

<decisions>
## Implementation Decisions

### Content structure
- Single page flow: install → quick start → project structure (scrollable, top to bottom)
- Brief tagline intro ("Get up and running in 2 minutes") then straight to content
- "What's next?" section at end with links to component docs, theming, framework guides

### Code examples
- Framework tabs: React, Vue, Svelte (the three verified frameworks)
- Copy buttons on all code blocks
- Inline live preview after quick start code (show the rendered Button on the page)

### Prerequisites & context
- Assume existing project (React/Vue/Svelte already set up)
- Don't mention Node version requirements (assume modern setup)
- npm commands with "Or use yarn/pnpm equivalents" footnote
- Detailed breakdown of what `npx lit-ui init` does (list each thing: installs X, creates Y, configures Z)

### Tone & style
- Friendly guide tone (explains why not just what, warmer prose like "Now let's add your first component")
- Callouts used sparingly (only for important gotchas or common mistakes)
- Project structure: file tree + 1-line description per file/folder (scannable)

### Claude's Discretion
- Section visual separation (headings, cards, dividers)
- Heading phrasing style (action-oriented vs noun-based)
- Exact callout placement and content
- Live preview implementation approach

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

*Phase: 07-getting-started*
*Context gathered: 2026-01-24*
