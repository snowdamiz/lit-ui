# Phase 19: Publishing - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Publish all @lit-ui packages to npm registry. Packages include: @lit-ui/core, @lit-ui/button, @lit-ui/dialog, @lit-ui/ssr. CI automation for future releases. Documentation updates are a separate phase.

</domain>

<decisions>
## Implementation Decisions

### Initial Version
- Start at 0.0.1 (signals experimental/early)
- Use -alpha.N prereleases for testing (0.0.1-alpha.1, etc.)
- All packages share same version (lockstep releases)

### Release Process
- GitHub Actions for CI/CD publishing
- No approval gate — merge to main auto-publishes if changesets exist
- Build + tests must pass before publish (block on failure)
- Create GitHub Releases with changelog from changesets

### Scope & Access
- Public packages (free tier)
- Publish under currently logged-in user's npm account (not an org)
- NPM_TOKEN secret in GitHub for CI authentication

### Package Metadata
- README: Quick start format (brief intro, install, basic example, link to docs)
- License: MIT
- Link to existing docs site (apps/docs deployment)
- Include keywords for npm search (lit, web-components, ui, tailwind, etc.)

### Claude's Discretion
- Stability policy for 0.x versions (breaking changes allowed vs deprecate-first)
- Exact keywords per package
- GitHub Actions workflow structure
- README template format

</decisions>

<specifics>
## Specific Ideas

- User will use their personal npm account, not create an @lit-ui org
- Changesets already configured from Phase 13 (just needs publish workflow)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-publishing*
*Context gathered: 2026-01-25*
