# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v2.0 NPM + SSR - Phase 19 in progress

## Current Position

Phase: 19 of 20 (Publishing)
Plan: 04 of 04
Status: Phase complete
Last activity: 2026-01-25 - Completed 19-04-PLAN.md (Final Verification)

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 phases | v2.0 [########################] 24/40 plans

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 22
- Average duration: 2.9 min
- Total execution time: ~65 min

**v1.1 Velocity:**
- Plans completed: 9
- Total execution time: 22 min

**v2.0 Velocity:**
- Plans completed: 24
- Total execution time: 65 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 4 | 14.0 min | 3.5 min |
| 02-button-component | 4 | 8.3 min | 2.1 min |
| 03-dialog-component | 4 | 5.9 min | 1.5 min |
| 04-cli | 6 | 20.5 min | 3.4 min |
| 05-framework-verification | 4 | 16 min | 4.0 min |
| 06-docs-foundation | 3 | 5 min | 1.7 min |
| 07-getting-started | 2 | 4 min | 2.0 min |
| 08-component-documentation | 4 | 10 min | 2.5 min |
| 13-monorepo-infrastructure | 5 | 11 min | 2.2 min |
| 14-core-package | 3 | 5 min | 1.7 min |
| 15-component-packages | 3 | 10 min | 3.3 min |
| 16-ssr-package | 2 | 4 min | 2.0 min |
| 17-framework-integration | 3 | 20 min | 6.7 min |
| 18-cli-enhancement | 4 | 10 min | 2.5 min |
| 19-publishing | 4 | 7 min | 1.8 min |

## Accumulated Context

### Decisions

Key decisions are logged in PROJECT.md Key Decisions table.

**v1.1 Decisions carried forward:**
- react-router v7 single package import
- Landing page theme variables for docs consistency
- nightOwl theme for syntax highlighting
- Tables use simple HTML with Tailwind styling

**v2.0 Research findings (from research/SUMMARY.md):**
- pnpm workspaces for monorepo (not npm/yarn)
- @changesets/cli for versioning
- @lit-labs/ssr v4.0.0 for SSR
- Dual-mode styling: static styles for SSR, constructable stylesheets for client
- isServer guards for ElementInternals and DOM APIs
- Lit must be external (peer dependency), not bundled

**v2.0 Plan 13-01 Decisions:**
- Fixed mode versioning for all @lit-ui packages (lockstep releases)
- Ignore internal config packages and apps from changeset versioning

**v2.0 Plan 13-02 Decisions:**
- Separate base.json and library.json for different TypeScript use cases
- Factory function pattern for Vite config (createLibraryConfig)
- Peer dependencies for vite/dts/tailwind in config package

**v2.0 Plan 13-03 Decisions:**
- Peer dependency on lit ^3.0.0 for all component packages
- sideEffects: false enables tree shaking
- Stub index.ts exports VERSION constant for valid module structure

**v2.0 Plan 13-04 Decisions:**
- Docs app serves as component testbed (examples/ removed)
- Apps remain private workspace packages (not published)

**v2.0 Plan 13-05 Decisions:**
- Use privatePackages config instead of ignore for private workspace deps
- Keep src.old/ for Phase 14-15 migration reference

**v2.0 Plan 14-01 Decisions:**
- SSR uses inline CSS via static styles getter (isServer === true)
- Constructable stylesheets guarded with !isServer check
- vite-env.d.ts added for CSS module type declarations

**v2.0 Plan 14-02 Decisions:**
- Multi-entry Vite config over createLibraryConfig for subpath support
- Tailwind token names (--color-primary) not custom --lui- namespace
- Type helpers exported for token path validation

**v2.0 Plan 14-03 Decisions:**
- fouc.css shipped as source file for direct CSS import
- Skeleton placeholder styles commented as optional pattern

**v2.0 Plan 15-01 Decisions:**
- Use import.meta.env?.DEV instead of process.env.NODE_ENV (Vite pattern)
- vite-env.d.ts required for Vite client types in component packages

**v2.0 Plan 15-02 Decisions:**
- Remove rollupTypes from vite-plugin-dts (api-extractor Map bug)
- Remove process.env.NODE_ENV check (requires @types/node)
- Simple no-op SSR approach for showModal/close (per CONTEXT.md)

**v2.0 Plan 15-03 Decisions:**
- FOUC CSS remains as source file export, not built to dist (per 14-03)
- CSS custom property names (--ui-button-radius) kept for API stability
- lui-* tag names for all @lit-ui components

**v2.0 Plan 16-01 Decisions:**
- All Lit packages (@lit-labs/*) marked external in vite.config.ts
- renderToString helper wraps render() + collectResult()

**v2.0 Plan 16-02 Decisions:**
- Hydration import order: @lit-ui/ssr/hydration must be first import (before any Lit components)
- Lockfile committed during verification (was missed in 16-01)

**v2.0 Plan 17-01 Decisions:**
- Components register on both server and client (removed isServer guard from customElements.define)
- TailwindElement exports tailwindBaseStyles for subclass style composition

**v2.0 Plan 17-02 Decisions:**
- JSX type declarations for custom elements in client component file
- 'use client' boundary pattern for Lit in Next.js App Router

**v2.0 Plan 17-03 Decisions:**
- Use @semantic-ui/astro-lit instead of deprecated @astrojs/lit
- Self-registering custom elements don't use client:* directives
- Hydration import goes in page script tag, not separate entry file

**v2.0 Plan 18-01 Decisions:**
- Config file renamed to lit-ui.config.json for clarity
- Default mode is copy-source for backward compatibility
- npm mode skips base files (TailwindElement, host-defaults.css, tailwind.css)

**v2.0 Plan 18-02 Decisions:**
- Install @lit-ui/core peer dependency automatically before component
- npm mode shows import and usage instructions after install
- lui-* prefix for component tag names in usage hints
- Flag overrides config: --npm or --copy takes precedence over config mode

**v2.0 Plan 18-03 Decisions:**
- diff package provides built-in types (@types/diff not needed)
- Show only added/removed lines in diff output for brevity
- Require confirmation only for modified files (unmodified migrate silently)

**v2.0 Plan 18-04 Decisions:**
- List command shows package names in npm mode for clarity
- Mode displayed in list header for user awareness

**v2.0 Plan 19-01 Decisions:**
- Empty author field (placeholder for user to fill)
- Placeholder 'user' in repository URL (updated when actual repo created)
- CLI remains independent versioning (tooling, not runtime dependency)

**v2.0 Plan 19-03 Decisions:**
- Static output for Astro example (CI build compatibility)
- Standard NPM_TOKEN secret approach (not OIDC trusted publishing)

**v2.0 Plan 19-04 Decisions:**
- npm organization 'lit-ui' created for @lit-ui scoped packages
- Automation token (not granular) for CI publishing
- NPM_TOKEN stored as GitHub repository secret

### Pending Todos

None.

### Blockers/Concerns

**v1.1 incomplete:** Phases 9-12 (Framework Guides, Theming, Accessibility, Polish) not yet done.
Consider completing v1.1 before or in parallel with v2.0.

## Session Continuity

Last session: 2026-01-25
Stopped at: Completed 19-04-PLAN.md (Final Verification)
Resume file: None

## Next Steps

Phase 19 (Publishing) COMPLETE. All 4 plans finished.

### Publishing Phase Complete

**19-01 (Complete):**
- npm publishing metadata added to all 5 publishable packages
- @lit-ui/ssr added to changeset fixed array for lockstep versioning
- Repository URLs use placeholder (update when repo created)

**19-02 (Complete):**
- Package READMEs added

**19-03 (Complete):**
- GitHub Actions release workflow created
- Uses changesets/action for automated version PRs and npm publishing
- Requires NPM_TOKEN secret in repository settings

**19-04 (Complete):**
- npm organization 'lit-ui' created
- NPM_TOKEN secret added to GitHub repository
- All 5 packages verified ready for publishing

### Ready for First Release

To publish first version:
1. Create changeset: `pnpm changeset`
2. Commit and push
3. Merge "Version Packages" PR
4. GitHub Actions publishes to npm

### Remaining v2.0 Work

Phase 20 (Documentation Updates) is the final phase.
