# Phase 17: Framework Integration - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Working SSR examples for Next.js, Astro, and generic Node.js that demonstrate how to use @lit-ui components with server-side rendering. These are reference implementations developers will copy from.

</domain>

<decisions>
## Implementation Decisions

### Example scope
- Minimal proof-of-concept — single page rendering components, not full apps
- Show both Button and Dialog to demonstrate simple SSR + complex SSR (showModal) patterns
- Include light theming — one custom property override to show it's possible
- Include client-side interactivity — Button click handler, Dialog open/close to prove hydration works

### Project structure
- Examples live inside monorepo at `examples/nextjs`, `examples/astro`, `examples/node`
- Use workspace links (`workspace:*`) to reference @lit-ui packages — always in sync with source
- Each example is standalone — `cd examples/nextjs && pnpm dev` (not runnable from root)
- Node.js example is a minimal Express server serving one SSR route

### Framework coverage
- Next.js: App Router only (Server Components + `use client`)
- Astro: Both static (SSG) and server (SSR) modes demonstrated
- Node.js: Express server (most familiar to developers)
- Target latest framework versions only — no backwards compatibility notes

### Documentation depth
- README with quick start + explanation of WHY (hydration order, import requirements)
- No generic "How SSR Works" section — assume developers understand SSR concepts
- Link to main lit-ui docs site for deep dives — examples are not self-contained documentation
- Claude decides on inline code comments — balance readability vs. education

### Claude's Discretion
- Exact inline comment placement and density
- File organization within each example
- Whether to use TypeScript or JavaScript in examples
- Specific CSS styling approach

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for each framework.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-framework-integration*
*Context gathered: 2026-01-25*
