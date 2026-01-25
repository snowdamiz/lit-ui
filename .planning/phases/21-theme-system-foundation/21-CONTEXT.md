# Phase 21: Theme System Foundation - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build-time theming infrastructure: TypeScript token schema, URL encoding/decoding utilities, and CSS generation logic that transforms configurations into Tailwind-compatible CSS. This phase creates the foundation that Phase 22 (CLI) and Phase 23 (Configurator) will consume.

</domain>

<decisions>
## Implementation Decisions

### Token schema design
- **Base + derived approach**: User picks 6 base colors, system generates scales automatically
- Base colors: primary, secondary, destructive, background, foreground, muted
- Extensible schema design — implement colors + radius now, structure supports future tokens
- **Dark mode auto-derived**: User sets light mode colors, dark mode inverted automatically

### CSS output structure
- **Variable naming**: `--lui-*` prefix (e.g., `--lui-primary`, `--lui-background`)
- **Output location**: Inject directly into user's main `tailwind.css` file
- **Dark mode**: Both `.dark` class selector AND `prefers-color-scheme` media query for maximum flexibility
- **Comments**: Include documentation comments explaining each token section

### URL encoding format
- **Balanced approach**: Base64 JSON — reasonably compact, decodable with standard tools
- **Validation**: Fail with clear, descriptive error on malformed input (no silent fallbacks)
- **Scope**: CLI internal only — encoding utilities not exported as public API

### Default values
- **Palette feel**: Neutral gray — blank slate approach, minimal color
- **Partial config handling**: Deep merge with defaults — missing tokens filled automatically
- **Radius**: Configurable scale (sm/md/lg) that affects all components

### Claude's Discretion
- Schema versioning in encoded strings (technical tradeoff decision)
- Default theme constant structure (exported vs internal)
- Specific OKLCH values for neutral gray palette
- Scale generation algorithm for deriving shades from base colors

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for the infrastructure implementation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-theme-system-foundation*
*Context gathered: 2026-01-25*
