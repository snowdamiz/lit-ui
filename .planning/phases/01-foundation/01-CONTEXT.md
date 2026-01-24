# Phase 1: Foundation - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the technical foundation that all components depend on — Shadow DOM + Tailwind integration works, TypeScript is configured, design tokens are defined. This phase delivers the TailwindElement base class, token system, and dev environment.

</domain>

<decisions>
## Implementation Decisions

### Design Token Structure
- Full token system: colors, spacing, typography, shadows, borders, radii, z-index
- Scale-based naming convention (--color-blue-500, --spacing-4) like Tailwind's numeric scales
- Extend Tailwind defaults rather than replace them (keep blue-500, add brand-500)
- Define tokens in Tailwind v4 CSS using @theme — native v4 approach

### TailwindElement API
- Auto-inject compiled Tailwind CSS into every component's Shadow DOM automatically
- Full toolkit of utilities: theme access, responsive helpers, animation utilities, variant helpers, classNames merging
- Tailwind utilities plus component-scoped CSS when needed (animations, complex states)

### Token Theming Approach
- Light and dark mode support from the start
- Class-based theme switching (.dark class on html/body)
- No toggle mechanism provided — user adds/removes .dark class themselves, components respond

### Build/Dev Setup
- Vite as the build tool for development
- Full docs site with live examples for component development
- Defer testing setup to a later phase

### Claude's Discretion
- Style customization approach (CSS parts vs variables vs both vs source-only)
- Theme token file organization (single file vs separate vs Tailwind v4 native dark mode)
- Build output format (ESM only vs ESM+CJS)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-01-23*
