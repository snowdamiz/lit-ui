# Phase 16: SSR Package - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-side rendering utilities for Lit components. Developers import these to render components on the server and hydrate on the client. Outputs Declarative Shadow DOM HTML. Framework-specific integration examples are Phase 17.

</domain>

<decisions>
## Implementation Decisions

### Render API Design
- Claude's discretion on function signature (element instance, tag+props, or html template)
- Claude's discretion on sync vs async behavior
- Claude's discretion on options object design
- Claude's discretion on single vs multiple element rendering

### Output Format
- Claude's discretion on DSD vs configurable output modes
- Claude's discretion on document wrapper handling
- Claude's discretion on pretty-print vs minified output
- Claude's discretion on inline styles inclusion

### Error Behavior
- Claude's discretion on throw vs fallback vs partial rendering
- Claude's discretion on SSR compatibility validation
- Claude's discretion on unregistered element handling
- Claude's discretion on error message detail level

### isServer Utility
- Claude's discretion on export location (@lit-ui/ssr vs @lit-ui/core)
- Claude's discretion on implementation approach (runtime vs Lit built-in vs build-time)
- Claude's discretion on companion utilities (isBrowser, isHydrating)
- Claude's discretion on constant vs function API

### Claude's Discretion
All implementation decisions for this phase are delegated to Claude. The user trusts Claude to make practical choices based on:
- Lit SSR best practices and @lit-labs/ssr patterns
- Tree-shaking and bundle size considerations
- Developer experience and debugging needs
- Consistency with existing @lit-ui/core patterns

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Follow Lit's official SSR patterns where applicable.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-ssr-package*
*Context gathered: 2026-01-25*
