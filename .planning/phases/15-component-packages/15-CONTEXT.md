# Phase 15: Component Packages - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate existing Button and Dialog components to independent npm packages (@lit-ui/button, @lit-ui/dialog) with SSR compatibility. Components extend @lit-ui/core's TailwindElement. Source lives in src.old/ for reference.

</domain>

<decisions>
## Implementation Decisions

### Package Exports
- Export component class plus TypeScript types for props, events, slots
- Single entry point per package ('@lit-ui/button' only, no subpaths)
- Export named type aliases (ButtonVariant, ButtonSize, etc.) for consumer reuse
- Re-export common utilities from core (TailwindElement, tokens) for convenience

### SSR Degradation
- Button's ElementInternals setup: console.warn in development mode that form features are client-only
- Components render loading skeleton during SSR (visible before hydration)
- Per-component isServer guards (not centralized in base class)

### Element Registration
- Auto-register custom elements on import (import = ready to use)
- Fixed tag names: <lui-button>, <lui-dialog> (not configurable)
- Console warning on name collision (check customElements.get() first)
- No separate import path for class-only — always register

### Dependency Wiring
- @lit-ui/core as peer dependency
- Lit as peer dependency (consistent with core)
- Components use core tokens only (no component-specific CSS files)

### Claude's Discretion
- Dialog internal parts export (overlay, panel) — Claude decides if advanced composition is needed
- Dialog showModal()/close() SSR behavior — Claude chooses between no-op or queue approach

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

*Phase: 15-component-packages*
*Context gathered: 2026-01-25*
