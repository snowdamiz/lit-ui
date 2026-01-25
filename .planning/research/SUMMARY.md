# Project Research Summary

**Project:** LitUI v2.0 - NPM Package Distribution + SSR Support
**Domain:** Web Component Library Enhancement - Package Publishing & Server-Side Rendering
**Researched:** 2026-01-24
**Confidence:** HIGH

## Executive Summary

Adding NPM package distribution and SSR support to LitUI requires monorepo restructuring with scoped packages (@lit-ui/core, @lit-ui/button, @lit-ui/dialog) and fundamental changes to how styles are handled. The existing TailwindElement base class uses constructable stylesheets, which cannot be serialized in Declarative Shadow DOM - requiring a dual-mode approach that uses static styles for SSR and optimized constructable stylesheets client-side.

The recommended approach leverages pnpm workspaces for monorepo management, @changesets/cli for versioning, and the official @lit-labs/ssr ecosystem for server rendering. The critical architectural insight is that Lit's `isServer` flag enables conditional code paths, allowing components to work both server-side (with inlined styles) and client-side (with shared constructable stylesheets). The CLI tool remains operational in both copy-source and npm modes, giving users flexibility in distribution models.

The primary risks center around build configuration (bundling Lit causes version conflicts), hydration ordering (ssr-client must load before components), and CSS handling (constructable stylesheets break SSR, @property rules need fallbacks). These are all solvable with proper external configuration in Vite, documented module load order, and dual-mode styling approach. The existing components are largely SSR-compatible except for ElementInternals usage in Button, which needs an isServer guard.

## Key Findings

### Recommended Stack Additions

**From STACK-NPM-SSR.md** — NPM distribution and SSR require new tooling while leveraging existing Vite/TypeScript infrastructure.

**Core additions:**
- **@lit-labs/ssr (v4.0.0)** — Server-side rendering with Declarative Shadow DOM output. Only official Lit SSR solution, experimental but functional.
- **@lit-labs/ssr-client (v1.1.8)** — Client-side hydration support. Must load before Lit to adopt server-rendered shadow roots.
- **pnpm (v10.28.1)** — Monorepo workspace manager with 60-80% disk savings via content-addressable store. Industry standard over npm/yarn workspaces.
- **@changesets/cli (v2.29.8)** — Independent package versioning and changelog generation. Standard for multi-package publishing.
- **@webcomponents/template-shadowroot (v0.2.1)** — Polyfill for Declarative Shadow DOM in legacy browsers (optional - modern browsers have native support).

**Build configuration changes:**
- Expand package.json exports field for subpath imports (@lit-ui/core/ssr)
- Mark lit as external in all builds to prevent bundling
- Add isServer guards around browser-only APIs (CSSStyleSheet, ElementInternals)
- Use static styles property for SSR, constructable stylesheets for client optimization

**Integration with existing stack:**
- Lit 3.3.2 — No changes needed, import isServer for conditional logic
- Vite 7.3.1 — Adapt to per-package library builds with workspace configuration
- vite-plugin-dts 4.5.4 — Works with multiple entry points for subpath exports
- Tailwind v4 — Constructable stylesheets work client-side; static inlining for SSR

### Expected Features

**From FEATURES.md** — NPM package mode and SSR compatibility table stakes.

**Must have (table stakes):**
- ESM exports with proper exports field — Required for tree shaking and modern bundlers
- TypeScript declarations (.d.ts files) — Standard expectation for component libraries
- Subpath exports (@lit-ui/button, @lit-ui/core/ssr) — Granular imports, only load what you use
- Peer dependency on Lit (^3.0.0) — Prevent version conflicts
- Declarative Shadow DOM SSR output — Components render with styles server-side
- Hydration support documentation — Users must know to load ssr-client before components
- Semantic versioning and changelogs — Professional package management

**Should have (competitive):**
- Scoped packages monorepo (@lit-ui/*) — Install only needed components, clean dependency tree
- Custom Elements Manifest (custom-elements.json) — Enables IDE autocomplete, Figma integration, AI tooling
- React wrappers package (@lit-ui/react) — Better DX for React users via @lit/react
- Source maps for debugging — Improves developer experience
- Bundle size CI tracking — Prevent bloat, build trust

**Defer (v2+):**
- Framework-specific SSR packages (Next.js, Nuxt adapters) — After basic SSR validated
- Streaming SSR support — Advanced optimization
- Server-only template rendering — Edge case usage

### Architecture Approach

**From ARCHITECTURE.md** — Monorepo package structure with SSR-aware TailwindElement and dual-mode CLI.

The architecture adds three new packages while keeping existing source structure for development. @lit-ui/core exports the SSR-aware TailwindElement base class plus optional /ssr utilities. Component packages (@lit-ui/button, @lit-ui/dialog) depend on core as peer dependency. The CLI tool expands to support both copy-source (existing) and npm install modes via lit-ui.json config.

**Major components:**
1. **@lit-ui/core package** — TailwindElement base class with dual-mode styling (static styles for SSR, constructable for client), SSR utilities, design token exports. Peer depends on lit.
2. **@lit-ui/button and @lit-ui/dialog packages** — Individual component packages that peer depend on @lit-ui/core. Published with proper exports field for subpath imports.
3. **Enhanced CLI with mode selection** — Detects lit-ui.json "mode" field. Copy-source mode copies embedded templates (existing behavior), npm mode runs package install and shows import instructions.
4. **TailwindElement SSR adaptation** — Uses static styles property for SSR inlining, adds isServer guards around CSSStyleSheet and adoptedStyleSheets, optimizes client-side with shared constructable stylesheets in connectedCallback.
5. **Workspace build configuration** — Root package.json with workspaces array, per-package Vite configs with external: ['lit', '@lit-ui/core', /^@lit-labs\//], pnpm-workspace.yaml for monorepo.

**Data flow:**
- NPM mode: `npm install @lit-ui/button` → import '@lit-ui/button' → bundler resolves via exports field → @lit-ui/core loaded as peer
- SSR mode: Server imports @lit-labs/ssr → renders components to DSD HTML → browser parses DSD (native shadow DOM) → hydration script loads → components interactive
- Copy-source mode: Unchanged — CLI copies source to project, local imports

### Critical Pitfalls

**Top 6 from PITFALLS.md** — NPM and SSR sections prioritized for this milestone.

1. **Bundling Lit Before Publishing (NPM-1)** — Causes multiple Lit versions, breaks conditional exports, inflates bundle size. AVOID: Configure rollupOptions.external: ['lit', /^@lit\//]. Keep lit as peerDependency only. Test with npm ls lit in consumer project.

2. **Constructable Stylesheets Break SSR (NPM-2)** — CSSStyleSheet API unavailable in Node.js, DSD cannot serialize constructable stylesheets. AVOID: Use static styles property for SSR (inlined in template), keep constructable optimization for client-side in connectedCallback with isServer guard.

3. **Hydration Module Load Order (NPM-4)** — If components load before @lit-labs/ssr-client/lit-element-hydrate-support.js, Lit creates new shadow roots instead of adopting server-rendered ones. Causes double rendering, flicker, or "Shadow root cannot be created" errors. AVOID: Document strict load order, use script tag ordering or defer, load hydration support BEFORE any Lit imports.

4. **ElementInternals Not Available During SSR (NPM-5)** — attachInternals() requires DOM, throws during server render. Button component uses this for form participation. AVOID: Guard with `if (typeof window !== 'undefined')`. Accept that form submission requires client-side JS (inherent SSR limitation).

5. **Vite ?inline Imports Break NPM Package (NPM-6)** — Current code uses `import tailwindStyles from '../styles/tailwind.css?inline'`. This Vite-specific query fails in Webpack/esbuild. AVOID: Process CSS at build time, use vite-plugin-lib-inject-css or rollup string plugin, publish pre-processed CSS.

6. **CSS @property Rules Don't Work in Shadow DOM SSR (NPM-3)** — Tailwind v4 utilities relying on @property (shadows, rings, gradients) break on server render since @property injection happens client-side in connectedCallback. AVOID: Include fallback values in CSS, document @property limitation for SSR, consider inlining @property in server HTML <head>.

## Implications for Roadmap

Based on research, suggested phase structure for v2.0:

### Phase 1: Monorepo Infrastructure
**Rationale:** Foundation must be in place before any packages can be built. Workspace setup, dependency externalization, and build configuration affect all subsequent work.

**Delivers:**
- pnpm workspace configured (pnpm-workspace.yaml, root package.json)
- Changesets initialized (.changeset directory, versioning scripts)
- Package directory structure (packages/core, packages/button, packages/dialog)

**Addresses:**
- NPM package structure recommendation from FEATURES.md
- Scalability considerations from ARCHITECTURE.md

**Avoids:**
- NPM-1 (bundling Lit) by configuring external dependencies upfront
- NPM-14 (forgetting to externalize) by establishing pattern early

**Research flag:** LOW complexity, well-documented patterns. Standard monorepo setup.

---

### Phase 2: @lit-ui/core Package
**Rationale:** Core package is a dependency for all component packages. Must adapt TailwindElement for SSR before components can use it.

**Delivers:**
- SSR-aware TailwindElement with static styles and isServer guards
- @lit-ui/core/ssr subpath with hydration utilities
- Proper package.json with exports field
- TypeScript declarations via vite-plugin-dts

**Addresses:**
- Stack additions (isServer usage, static styles pattern)
- Architecture component #4 (TailwindElement SSR adaptation)

**Avoids:**
- NPM-2 (constructable stylesheets break SSR) by implementing dual-mode styling
- NPM-6 (Vite ?inline imports) by processing CSS at build time
- NPM-11 (exports field misconfiguration) by defining complete exports map

**Research flag:** MEDIUM complexity. Clear Lit SSR documentation, but Tailwind + Shadow DOM + SSR combination is custom to this project.

---

### Phase 3: Component Packages (@lit-ui/button, @lit-ui/dialog)
**Rationale:** With core package stable, port existing components to new package structure. Validate that SSR-aware base class works for real components.

**Delivers:**
- @lit-ui/button package with ElementInternals guarded for SSR
- @lit-ui/dialog package with SSR compatibility verified
- Per-package builds with proper externals
- Custom Elements Manifest (custom-elements.json) generation

**Addresses:**
- NPM package mode from FEATURES.md
- Architecture component #2 (component packages)

**Avoids:**
- NPM-5 (ElementInternals during SSR) by adding isServer guard to Button
- NPM-9 (custom element side effects) by separating registration if needed
- NPM-13 (missing HTMLElementTagNameMap) by exporting type declarations

**Research flag:** LOW complexity. Components already exist, this is a packaging exercise with minor SSR guards.

---

### Phase 4: SSR Validation
**Rationale:** Before claiming SSR support, must verify components actually render and hydrate correctly. Test with @lit-labs/ssr directly, not just assume it works.

**Delivers:**
- SSR test harness (Node.js script using @lit-labs/ssr)
- Verification that Button and Dialog render with DSD
- Hydration test confirming interactivity after hydration
- Documentation of SSR limitations (form participation, @property rules)

**Addresses:**
- SSR compatibility from FEATURES.md
- Hydration support requirement from FEATURES.md

**Avoids:**
- NPM-4 (hydration module load order) by testing different load scenarios
- NPM-10 (CSS duplication) by measuring HTML output size
- NPM-12 (defer-hydration not removed) by validating hydration completes

**Research flag:** MEDIUM complexity. @lit-labs/ssr is experimental, may encounter edge cases. Need to test framework integrations (Next.js example).

---

### Phase 5: CLI Enhancement for Dual Mode
**Rationale:** Users need both copy-source and npm modes available. CLI must detect mode and behave accordingly. Can be done in parallel with SSR validation.

**Delivers:**
- lit-ui.json "mode" field support
- `lit-ui init` prompts for copy-source vs npm mode
- `lit-ui add <component>` npm mode (runs install, shows import instructions)
- `lit-ui migrate` command for copy-source to npm conversion
- Updated documentation for both modes

**Addresses:**
- CLI dual-mode support from ARCHITECTURE.md
- Both copy-source and npm distribution from FEATURES.md

**Avoids:**
- User confusion by providing clear mode selection
- Breaking existing copy-source users by keeping it as default

**Research flag:** LOW complexity. CLI framework (citty) already in place, this is feature addition.

---

### Phase 6: Publishing & Documentation
**Rationale:** With all packages built and tested, publish to NPM and document SSR setup for consumers. Final validation in real-world usage.

**Delivers:**
- Published @lit-ui/core, @lit-ui/button, @lit-ui/dialog to NPM
- SSR setup guide (Next.js, Astro, basic Node.js examples)
- Hydration documentation with module load order requirements
- Framework integration updates (React wrappers documentation)
- Changelog and version 2.0.0 release

**Addresses:**
- Semantic versioning from FEATURES.md
- Documentation requirement from FEATURES.md
- Framework SSR integrations from FEATURES.md (documentation level)

**Avoids:**
- NPM-15 (FOUC) by providing `:not(:defined)` CSS snippet in docs
- NPM-8 (:host-context browser support) by documenting browser matrix

**Research flag:** LOW complexity. Standard publishing workflow, @changesets/cli automates versioning.

---

### Phase Ordering Rationale

**Dependency-driven order:**
- Monorepo infrastructure enables all package work (Phase 1 → 2/3)
- Core package is dependency for component packages (Phase 2 → 3)
- SSR validation requires built components (Phase 3 → 4)
- Publishing requires complete, tested packages (Phases 1-5 → 6)

**Parallelization opportunities:**
- Phase 4 (SSR validation) and Phase 5 (CLI enhancement) can overlap after Phase 3
- Component packages (Phase 3) could be split into parallel tasks if team size permits

**Pitfall avoidance sequencing:**
- Build configuration pitfalls (NPM-1, NPM-6, NPM-11, NPM-14) addressed in Phases 1-2 before component work
- SSR pitfalls (NPM-2, NPM-3, NPM-4, NPM-5) addressed in Phases 2-4 with validation
- Documentation pitfalls (NPM-15, NPM-8) deferred to Phase 6 after implementation proven

**Architecture alignment:**
- Follows "build from foundation up" approach from ARCHITECTURE.md
- Matches suggested build order from ARCHITECTURE.md (infrastructure → core → components → SSR → CLI → publish)

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (@lit-ui/core):** Tailwind v4 + Shadow DOM + SSR combination is project-specific. May need phase-research for CSS processing strategy, @property rule handling.
- **Phase 4 (SSR Validation):** @lit-labs/ssr is experimental. Framework integration (Next.js, Astro) may have undocumented edge cases. Consider phase-research for framework-specific SSR setup.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Monorepo):** Well-documented pnpm + changesets patterns. Standard monorepo setup.
- **Phase 3 (Component Packages):** Straightforward port of existing components. Minor SSR guards based on clear Lit documentation.
- **Phase 5 (CLI):** Feature addition to existing citty CLI. No new domain knowledge needed.
- **Phase 6 (Publishing):** Standard NPM publishing workflow. Changesets automates complexity.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified via npm (versions confirmed). Official Lit SSR docs cover usage. pnpm + changesets is industry standard. |
| Features | HIGH | NPM packaging table stakes well-established. SSR requirements clear from Lit documentation. Browser support for DSD is now universal. |
| Architecture | MEDIUM | Package structure follows Shoelace/Lit patterns (HIGH confidence). TailwindElement SSR adaptation is custom logic (MEDIUM - needs testing). Dual-mode CLI is novel (MEDIUM - needs validation). |
| Pitfalls | HIGH | SSR pitfalls verified against official docs and community experience. NPM bundling pitfalls are common, well-documented. Constructable stylesheet limitation is architectural constraint. |

**Overall confidence:** HIGH

Research is based on official Lit documentation, verified package versions, and established monorepo patterns. The primary uncertainty is in the custom TailwindElement SSR adaptation (dual-mode styling), which is well-reasoned but needs implementation validation.

### Gaps to Address

**SSR CSS duplication impact:**
- Research identifies the issue (NPM-10) but doesn't quantify impact. During Phase 4 (SSR Validation), measure actual HTML size with 10-50 component instances. If problematic, investigate CSS extraction to document <head> approach.

**Framework-specific SSR integrations:**
- STACK.md mentions @lit-labs/nextjs but doesn't detail integration. During Phase 4, validate whether basic @lit-labs/ssr works in Next.js 15+ without specialized package, or if framework-specific adapters are needed.

**Custom Elements Manifest tooling:**
- FEATURES.md lists CEM as "should have" but research doesn't specify tooling (@custom-elements-manifest/analyzer). During Phase 3, verify which tool generates CEM and how to integrate with Vite build.

**React wrappers implementation:**
- FEATURES.md includes @lit-ui/react as differentiator, but ARCHITECTURE.md doesn't detail package structure. Decide during Phase 6 planning whether React wrappers ship with v2.0 or defer to v2.1.

**@property rule fallback strategy:**
- NPM-3 identifies the issue but doesn't provide complete solution. During Phase 2, audit which Tailwind v4 utilities depend on @property and add explicit fallbacks to host-defaults.css.

## Sources

### Primary (HIGH confidence)
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) — SSR architecture, DSD output, lifecycle
- [Lit SSR Authoring](https://lit.dev/docs/ssr/authoring/) — isServer guards, static styles requirement
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) — Hydration module load order
- [Lit Publishing Guide](https://lit.dev/docs/tools/publishing/) — External dependencies, file extensions
- [Node.js Package Exports](https://nodejs.org/api/packages.html) — Subpath exports specification
- [pnpm Workspaces](https://pnpm.io/workspaces) — Monorepo configuration
- [Changesets](https://github.com/changesets/changesets) — Versioning workflow
- [@lit-labs/ssr NPM](https://www.npmjs.com/package/@lit-labs/ssr) — v4.0.0 verified 2026-01-24
- [@lit-labs/ssr-client NPM](https://www.npmjs.com/package/@lit-labs/ssr-client) — v1.1.8 verified 2026-01-24
- [pnpm NPM](https://www.npmjs.com/package/pnpm) — v10.28.1 verified 2026-01-24
- [@changesets/cli NPM](https://www.npmjs.com/package/@changesets/cli) — v2.29.8 verified 2026-01-24

### Secondary (MEDIUM confidence)
- [Declarative Shadow DOM - web.dev](https://web.dev/articles/declarative-shadow-dom) — DSD browser support, usage patterns
- [Web Components Tailwind SSR - Konnor Rogers](https://www.konnorrogers.com/posts/2023/web-components-tailwind-and-ssr) — Tailwind Shadow DOM SSR challenges
- [Sharing Styles in DSD - Eisenberg](https://eisenbergeffect.medium.com/sharing-styles-in-declarative-shadow-dom-c5bf84ffd311) — CSS duplication strategies
- [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) — CEM specification
- [Building npm package ESM/CJS - Snyk](https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/) — Exports field best practices
- [Tailwind Shadow DOM Discussion #1935](https://github.com/tailwindlabs/tailwindcss/discussions/1935) — Shadow DOM integration approaches
- [Lit Tree Shaking Discussion](https://github.com/lit/lit/discussions/4772) — Side effects and tree shaking

### Tertiary (LOW confidence)
- [NPM Workspaces Guide - NPM Blog](https://blog.npmjs.org/post/186494959890/monorepos-and-npm.html) — Older but foundational monorepo patterns
- [TypeScript Mono-repo Setup](https://blog.frankdejonge.nl/setting-up-a-typescript-mono-repo-for-scoped-packages/) — Scoped package patterns
- [Tailwind @property Discussion #16772](https://github.com/tailwindlabs/tailwindcss/discussions/16772) — @property Shadow DOM issues (GitHub discussion, not official)

---
*Research completed: 2026-01-24*
*Ready for roadmap: yes*
