# Phase 14: Core Package - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

@lit-ui/core exports SSR-aware TailwindElement with dual-mode styling. Consumers import the base class to build components. Design tokens available via CSS custom properties. Tree-shakeable exports. This phase does NOT include the component implementations (Button, Dialog) — those are Phase 15.

</domain>

<decisions>
## Implementation Decisions

### TailwindElement API
- Styling via Tailwind classes in render template only (no static styles property pattern)
- Claude's discretion on: CSS compilation approach (build-time vs runtime), utility methods to include, and enforcement patterns

### Styling Mode Behavior
- Multiple component instances share one constructable stylesheet per component type (memory optimization)
- JIT at runtime for dynamic Tailwind classes — generate styles for dynamic classes on demand
- Claude's discretion on: SSR-to-client transition mechanism, FOUC prevention approach (optimize for best UX)

### Token Export Structure
- Full design system tokens: colors, spacing, typography, shadows, animations, breakpoints
- Semantic tokens that change based on theme context (light/dark mode support)
- Claude's discretion on: access method (CSS vars vs JS object), namespace prefix

### Error Boundaries
- Warn in development mode when browser-only APIs are used during SSR, silently skip in production
- Throw errors and let framework handle — don't catch SSR errors internally
- Minimal logging — only actual errors, no extra dev-time warnings
- Claude's discretion on: isServer exposure pattern (instance property vs static import)

### Claude's Discretion
- CSS compilation approach for TailwindElement (build-time vs runtime import)
- Utility methods to include beyond styling (classMap, dispatchCustomEvent, etc.)
- Enforcement patterns for component authors
- SSR-to-client style transition mechanism
- FOUC prevention strategy
- Token access method and namespace prefix
- isServer exposure pattern

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User deferred most implementation details to Claude's best judgment, with key constraints:
- Prioritize best UX for styling transitions
- Use shared stylesheets for memory efficiency
- Support runtime JIT for dynamic classes
- Full design system with semantic theming tokens

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-core-package*
*Context gathered: 2026-01-25*
