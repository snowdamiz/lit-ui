# Phase 13: Monorepo Infrastructure - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure project as pnpm monorepo with changesets for version management. This includes package organization, workspace commands, and version/release workflow. SSR implementation, component refactoring, and npm publishing are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Package structure
- Naming convention: `@lit-ui/*` scope (confirmed)
- One package per component: @lit-ui/core, @lit-ui/button, @lit-ui/dialog
- Maximum tree-shaking — users install only what they need

### Workspace commands
- `pnpm dev` watches all packages, rebuilds on change
- Tests run per-package for focused work + root command for CI
- Docs app becomes the natural testbed — remove examples/ directory
- Eventually docs app should be rewritten using the component library itself

### Changeset workflow
- Lockstep versions — all packages share same version number
- Minimal changelogs — brief "Added X, Fixed Y" style
- CI-automated releases — merging changeset PR triggers npm publish

### Migration approach
- Rename src/ to src.old/ temporarily for reference during migration
- CLI can break temporarily (fixed in Phase 18)
- Docs site must stay functional throughout migration

### Claude's Discretion
- Directory structure: flat packages/ vs grouped (Claude picks standard approach)
- Whether CLI/docs become workspace packages or stay at root level
- Build command behavior (all packages vs incremental)
- Changeset trigger workflow (manual vs PR-based)
- Big-bang vs incremental migration strategy

</decisions>

<specifics>
## Specific Ideas

- Docs app as testbed: "the docs app should act as the testbed naturally due to its documentation and component use"
- Future vision: "eventually the entire docs app should be rewritten in the component library as well"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-monorepo-infrastructure*
*Context gathered: 2026-01-24*
