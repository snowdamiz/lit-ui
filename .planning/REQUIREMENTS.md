# Requirements: LitUI

**Defined:** 2026-01-24
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v2.0 Requirements

Requirements for NPM package distribution and SSR compatibility.

### Monorepo Infrastructure

- [ ] **MONO-01**: Project uses pnpm workspaces for package management
- [ ] **MONO-02**: Changesets configured for version management and changelogs
- [ ] **MONO-03**: Shared TypeScript config across packages
- [ ] **MONO-04**: Shared Vite build config for library mode

### Core Package (@lit-ui/core)

- [ ] **CORE-01**: @lit-ui/core package exports TailwindElement base class
- [ ] **CORE-02**: TailwindElement supports SSR with static styles (no constructable stylesheets)
- [ ] **CORE-03**: TailwindElement optimizes to constructable stylesheets on client after hydration
- [ ] **CORE-04**: Design tokens exported as CSS custom properties
- [ ] **CORE-05**: Package has proper exports field with conditional exports
- [ ] **CORE-06**: Package marked sideEffects: false for tree shaking
- [ ] **CORE-07**: Lit declared as peer dependency ^3.0.0

### Component Packages

- [ ] **COMP-01**: @lit-ui/button package exports Button component
- [ ] **COMP-02**: @lit-ui/dialog package exports Dialog component
- [ ] **COMP-03**: Components use isServer guards for ElementInternals
- [ ] **COMP-04**: Components use isServer guards for DOM APIs (showModal, etc.)
- [ ] **COMP-05**: Both packages depend on @lit-ui/core as peer dependency
- [ ] **COMP-06**: TypeScript declarations generated and exported
- [ ] **COMP-07**: ESM-only output (no CJS)

### SSR Package (@lit-ui/ssr)

- [ ] **SSR-01**: @lit-ui/ssr package provides SSR render utilities
- [ ] **SSR-02**: Render function outputs Declarative Shadow DOM HTML
- [ ] **SSR-03**: Hydration helper ensures correct module load order
- [ ] **SSR-04**: isServer utility exported for component authors
- [ ] **SSR-05**: SSR package re-exports @lit-labs/ssr essentials

### SSR Framework Integration

- [ ] **FRAME-01**: Next.js integration guide with working example
- [ ] **FRAME-02**: Astro integration guide with working example
- [ ] **FRAME-03**: Generic Node.js SSR example for other frameworks

### CLI Enhancement

- [ ] **CLI-01**: lit-ui.json supports mode: "copy-source" | "npm"
- [ ] **CLI-02**: `lit-ui init` prompts for distribution mode
- [ ] **CLI-03**: `lit-ui add` in npm mode runs npm/pnpm/yarn install
- [ ] **CLI-04**: `lit-ui add` in copy-source mode works as before
- [ ] **CLI-05**: `lit-ui migrate` converts copy-source to npm mode

### Publishing

- [ ] **PUB-01**: All packages published to npm under @lit-ui scope
- [ ] **PUB-02**: Package versions follow semver
- [ ] **PUB-03**: README included in each published package
- [ ] **PUB-04**: Changelog generated via changesets

### Documentation

- [ ] **DOC-01**: NPM installation guide in docs site
- [ ] **DOC-02**: SSR setup guide with hydration instructions
- [ ] **DOC-03**: Migration guide from copy-source to npm mode

## v2.1+ Requirements

Deferred to future milestone.

### Enhanced DX

- **DX-01**: Custom Elements Manifest generated for IDE integration
- **DX-02**: @lit-ui/react package with React wrappers via @lit/react
- **DX-03**: Auto-update mechanism for copy-source installations

## Out of Scope

| Feature | Reason |
|---------|--------|
| CJS output | Modern bundlers handle ESM; CJS adds complexity |
| Vue/Svelte wrapper packages | Native web component support is sufficient |
| Full SSR polyfill | Browser DSD support is universal (2024+) |
| Headless mode | Doubles maintenance; not core value prop |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MONO-01 | Phase 13 | Pending |
| MONO-02 | Phase 13 | Pending |
| MONO-03 | Phase 13 | Pending |
| MONO-04 | Phase 13 | Pending |
| CORE-01 | Phase 14 | Pending |
| CORE-02 | Phase 14 | Pending |
| CORE-03 | Phase 14 | Pending |
| CORE-04 | Phase 14 | Pending |
| CORE-05 | Phase 14 | Pending |
| CORE-06 | Phase 14 | Pending |
| CORE-07 | Phase 14 | Pending |
| COMP-01 | Phase 15 | Pending |
| COMP-02 | Phase 15 | Pending |
| COMP-03 | Phase 15 | Pending |
| COMP-04 | Phase 15 | Pending |
| COMP-05 | Phase 15 | Pending |
| COMP-06 | Phase 15 | Pending |
| COMP-07 | Phase 15 | Pending |
| SSR-01 | Phase 16 | Pending |
| SSR-02 | Phase 16 | Pending |
| SSR-03 | Phase 16 | Pending |
| SSR-04 | Phase 16 | Pending |
| SSR-05 | Phase 16 | Pending |
| FRAME-01 | Phase 17 | Pending |
| FRAME-02 | Phase 17 | Pending |
| FRAME-03 | Phase 17 | Pending |
| CLI-01 | Phase 18 | Pending |
| CLI-02 | Phase 18 | Pending |
| CLI-03 | Phase 18 | Pending |
| CLI-04 | Phase 18 | Pending |
| CLI-05 | Phase 18 | Pending |
| PUB-01 | Phase 19 | Pending |
| PUB-02 | Phase 19 | Pending |
| PUB-03 | Phase 19 | Pending |
| PUB-04 | Phase 19 | Pending |
| DOC-01 | Phase 20 | Pending |
| DOC-02 | Phase 20 | Pending |
| DOC-03 | Phase 20 | Pending |

**Coverage:**
- v2.0 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-01-24*
*Last updated: 2026-01-24 after v2.0 roadmap creation*
