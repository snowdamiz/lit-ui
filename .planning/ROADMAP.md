# Roadmap: LitUI

## Milestones

- v1.0 MVP - Phases 1-5 (shipped 2026-01-24)
- v1.1 Documentation Site - Phases 6-12 (in progress)
- **v2.0 NPM + SSR** - Phases 13-20 (planned)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-5) - SHIPPED 2026-01-24</summary>

### Phase 1: Foundation
**Goal**: Project scaffolding with Lit, Tailwind v4, TypeScript, Vite
**Plans**: 4 plans (complete)

### Phase 2: Button Component
**Goal**: Polished button with variants, sizes, form participation, loading states
**Plans**: 4 plans (complete)

### Phase 3: Dialog Component
**Goal**: Accessible modal with focus trap, ARIA, animations, nested support
**Plans**: 4 plans (complete)

### Phase 4: CLI
**Goal**: npx lit-ui commands for init, add, list with build tool detection
**Plans**: 6 plans (complete)

### Phase 5: Framework Verification
**Goal**: Verify components work in React 19, Vue 3, Svelte 5
**Plans**: 4 plans (complete)

</details>

<details>
<summary>v1.1 Documentation Site (Phases 6-12) - IN PROGRESS</summary>

### Phase 6: Docs Foundation
**Goal**: Standalone docs app with navigation and responsive layout
**Plans**: 3 plans (complete)

### Phase 7: Getting Started
**Goal**: New users can install and use their first component
**Plans**: 2 plans (complete)

### Phase 8: Component Documentation
**Goal**: Complete API reference and examples for Button and Dialog
**Plans**: 4 plans (complete)

### Phase 9: Framework Guides
**Goal**: Developers know how to use components in their framework
**Plans**: TBD

### Phase 10: Theming Documentation
**Goal**: Developers can customize component appearance
**Plans**: TBD

### Phase 11: Accessibility Documentation
**Goal**: Developers understand accessibility patterns in components
**Plans**: TBD

### Phase 12: Polish
**Goal**: Docs are discoverable and searchable
**Plans**: TBD

</details>

---

## v2.0 NPM + SSR (Phases 13-20)

**Milestone Goal:** Enable NPM package distribution and SSR compatibility, giving developers the choice between copy-source ownership and traditional npm install.

### Phase 13: Monorepo Infrastructure
**Goal**: Project restructured as pnpm monorepo with changesets for version management
**Depends on**: v1.0 complete
**Requirements**: MONO-01, MONO-02, MONO-03, MONO-04
**Success Criteria** (what must be TRUE):
  1. Developer runs `pnpm install` at root and all packages install correctly
  2. Developer can build any package independently with `pnpm --filter @lit-ui/X build`
  3. Changeset version bump updates all affected packages with changelog
  4. TypeScript errors in one package are caught at compile time across workspace
**Plans**: 5 plans

Plans:
- [x] 13-01-PLAN.md - Workspace foundation (pnpm-workspace.yaml, root package.json, changesets)
- [x] 13-02-PLAN.md - Shared configs (@lit-ui/typescript-config, @lit-ui/vite-config)
- [x] 13-03-PLAN.md - Package scaffolding (core, button, dialog stubs)
- [x] 13-04-PLAN.md - Apps migration (docs, landing to apps/)
- [x] 13-05-PLAN.md - Verification and cleanup (install, build, changeset test)

### Phase 14: Core Package
**Goal**: @lit-ui/core exports SSR-aware TailwindElement with dual-mode styling
**Depends on**: Phase 13
**Requirements**: CORE-01, CORE-02, CORE-03, CORE-04, CORE-05, CORE-06, CORE-07
**Success Criteria** (what must be TRUE):
  1. Consumer imports `import { TailwindElement } from '@lit-ui/core'` successfully
  2. TailwindElement renders with inline styles during SSR (no constructable stylesheets)
  3. After hydration, component uses shared constructable stylesheets (memory optimization)
  4. Design tokens available via CSS custom properties from @lit-ui/core/tokens
  5. Tree shaking removes unused exports when bundling consumer app
**Plans**: 3 plans

Plans:
- [x] 14-01-PLAN.md - SSR-aware TailwindElement with dual-mode styling
- [x] 14-02-PLAN.md - Design tokens module and utility helpers
- [x] 14-03-PLAN.md - Build verification and FOUC prevention

### Phase 15: Component Packages
**Goal**: Button and Dialog published as independent packages with SSR compatibility
**Depends on**: Phase 14
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07
**Success Criteria** (what must be TRUE):
  1. Consumer installs `@lit-ui/button` and imports Button component
  2. Consumer installs `@lit-ui/dialog` and imports Dialog component
  3. Button form participation works client-side (gracefully skipped during SSR)
  4. Dialog showModal() works client-side (gracefully skipped during SSR)
  5. TypeScript autocomplete shows component props and events
**Plans**: 3 plans

Plans:
- [x] 15-01-PLAN.md - Button package migration with SSR guards
- [x] 15-02-PLAN.md - Dialog package migration with SSR guards
- [x] 15-03-PLAN.md - Build verification and FOUC CSS update

### Phase 16: SSR Package
**Goal**: @lit-ui/ssr provides utilities for server-rendering components
**Depends on**: Phase 15
**Requirements**: SSR-01, SSR-02, SSR-03, SSR-04, SSR-05
**Success Criteria** (what must be TRUE):
  1. Developer imports `import { render } from '@lit-ui/ssr'` and renders component to DSD HTML
  2. Rendered HTML contains `<template shadowrootmode="open">` with component markup
  3. Developer follows hydration guide and components become interactive after page load
  4. Component author uses `import { isServer } from '@lit-ui/ssr'` for conditional logic
**Plans**: 2 plans

Plans:
- [x] 16-01-PLAN.md - SSR package structure and render utilities
- [x] 16-02-PLAN.md - Hydration support and build verification

### Phase 17: Framework Integration
**Goal**: Working SSR examples for Next.js, Astro, and generic Node.js
**Depends on**: Phase 16
**Requirements**: FRAME-01, FRAME-02, FRAME-03
**Success Criteria** (what must be TRUE):
  1. Next.js example repo demonstrates SSR with lit-ui components
  2. Astro example repo demonstrates SSR with lit-ui components
  3. Generic Node.js example shows how to SSR in any framework
**Plans**: 3 plans

Plans:
- [x] 17-01-PLAN.md - Node.js/Express SSR example (direct @lit-ui/ssr usage)
- [x] 17-02-PLAN.md - Next.js App Router SSR example (withLitSSR + 'use client')
- [x] 17-03-PLAN.md - Astro SSR example (@semantic-ui/astro-lit + client:visible)

### Phase 18: CLI Enhancement
**Goal**: CLI supports both copy-source and npm installation modes
**Depends on**: Phase 15
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05
**Success Criteria** (what must be TRUE):
  1. User runs `lit-ui init` and chooses between copy-source and npm mode
  2. In npm mode, `lit-ui add button` runs `npm install @lit-ui/button`
  3. In copy-source mode, `lit-ui add button` copies source files (existing behavior)
  4. User can migrate existing copy-source project to npm with `lit-ui migrate`
**Plans**: 4 plans

Plans:
- [x] 18-01-PLAN.md - Config schema update and init mode prompt
- [x] 18-02-PLAN.md - Add command mode branching with npm install
- [x] 18-03-PLAN.md - Migrate command with diff detection
- [x] 18-04-PLAN.md - List command update and verification

### Phase 19: Publishing
**Goal**: All packages published to npm under @lit-ui scope
**Depends on**: Phase 16, Phase 17, Phase 18
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04
**Success Criteria** (what must be TRUE):
  1. `npm install @lit-ui/core @lit-ui/button @lit-ui/dialog` succeeds from npm registry
  2. Published packages show proper README on npm package page
  3. Version numbers follow semver (major.minor.patch)
  4. Changelog published with each release via changesets
**Plans**: 4 plans

Plans:
- [x] 19-01-PLAN.md — Package metadata (repository, description, license, changeset config)
- [x] 19-02-PLAN.md — README files for all publishable packages
- [x] 19-03-PLAN.md — GitHub Actions release workflow
- [x] 19-04-PLAN.md — npm organization setup and verification (checkpoint)

### Phase 20: Documentation
**Goal**: Docs site updated with NPM and SSR guides
**Depends on**: Phase 19
**Requirements**: DOC-01, DOC-02, DOC-03
**Success Criteria** (what must be TRUE):
  1. User finds NPM installation guide as alternative to copy-source
  2. User finds SSR setup guide with hydration instructions and module load order
  3. User finds migration guide for converting copy-source projects to npm mode
**Plans**: TBD

---

## Progress

**Execution Order:**
- v1.0: Phases 1-5 (complete)
- v1.1: Phases 6-12 (6->7->8->9->10->11->12)
- v2.0: Phases 13-20 (13->14->15->16->17->18->19->20, with 17/18 parallelizable after 16/15)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-01-24 |
| 2. Button | v1.0 | 4/4 | Complete | 2026-01-24 |
| 3. Dialog | v1.0 | 4/4 | Complete | 2026-01-24 |
| 4. CLI | v1.0 | 6/6 | Complete | 2026-01-24 |
| 5. Verification | v1.0 | 4/4 | Complete | 2026-01-24 |
| 6. Docs Foundation | v1.1 | 3/3 | Complete | 2026-01-24 |
| 7. Getting Started | v1.1 | 2/2 | Complete | 2026-01-24 |
| 8. Component Docs | v1.1 | 4/4 | Complete | 2026-01-24 |
| 9. Framework Guides | v1.1 | 0/? | Not started | - |
| 10. Theming Docs | v1.1 | 0/? | Not started | - |
| 11. Accessibility Docs | v1.1 | 0/? | Not started | - |
| 12. Polish | v1.1 | 0/? | Not started | - |
| 13. Monorepo Infrastructure | v2.0 | 5/5 | Complete | 2026-01-25 |
| 14. Core Package | v2.0 | 3/3 | Complete | 2026-01-25 |
| 15. Component Packages | v2.0 | 3/3 | Complete | 2026-01-25 |
| 16. SSR Package | v2.0 | 2/2 | Complete | 2026-01-25 |
| 17. Framework Integration | v2.0 | 3/3 | Complete | 2026-01-25 |
| 18. CLI Enhancement | v2.0 | 4/4 | Complete | 2026-01-25 |
| 19. Publishing | v2.0 | 4/4 | Complete | 2026-01-25 |
| 20. Documentation | v2.0 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-25 (Phase 19 complete)*
