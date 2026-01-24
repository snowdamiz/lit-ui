# Project Research Summary

**Project:** lit-components (Framework-agnostic Web Component Library)
**Domain:** CLI-distributed component library (Lit.js + Tailwind CSS)
**Researched:** 2026-01-23
**Confidence:** HIGH

## Executive Summary

This project aims to create a framework-agnostic component library using Lit.js web components with Tailwind CSS styling, distributed via a shadcn/ui-style CLI tool. The recommended approach combines the encapsulation benefits of Shadow DOM with the developer experience of Tailwind, while offering both copy-source (user owns code) and npm package distribution models. This positions the library uniquely against React-only solutions (shadcn/ui) and traditional npm-only web component libraries (Shoelace).

The core technical challenge is Shadow DOM + Tailwind CSS integration. Shadow DOM's style encapsulation prevents global Tailwind stylesheets from affecting component internals, requiring either constructable stylesheets to inject compiled CSS into each shadow root, or a light DOM approach that sacrifices encapsulation. Additionally, Tailwind v4's CSS variable architecture uses `:root` selectors that don't work in Shadow DOM (requires `:host`), necessitating build-time transformation. These architectural decisions must be locked down in Phase 1 before any component development.

Key risks include form participation (requires ElementInternals API implementation), ARIA accessibility across shadow boundaries (ID references break), event retargeting complexity, and SSR/FOUC issues. Mitigation focuses on establishing patterns early, comprehensive testing with screen readers and real browsers (not JSDOM), and clear documentation of framework integration requirements. The MVP strategy of starting with just Button + Dialog components allows validation of all critical patterns before scaling.

## Key Findings

### Recommended Stack

The stack prioritizes modern web standards, build-time performance, and developer experience. Lit 3.x provides a minimal (5KB) reactive framework with standard decorators and excellent TypeScript support. Vite 6 offers fast HMR and library mode for npm packaging. Tailwind v4 brings zero-config setup and native Vite integration, though Shadow DOM compatibility requires CSS transformation. The CLI distribution layer uses Commander.js for argument parsing, Inquirer.js for interactive prompts, and tsup for fast ESM/CJS bundling.

**Core technologies:**
- **Lit 3.x:** Web component framework — industry standard, 17% faster than alternatives, 5KB minified, supports TC39 decorators
- **TypeScript 5.x:** Type safety and tooling — required for Lit decorators, enables Custom Elements Manifest generation
- **Vite 6:** Build tool — 70% faster builds with Rolldown, official Lit template support, library mode for npm
- **Tailwind CSS 4.x:** Styling framework — 5x faster builds, no config file needed, native Vite plugin (requires Shadow DOM fixes)
- **Commander.js + Inquirer.js:** CLI framework — battle-tested, used by shadcn CLI, powers copy-source distribution
- **@web/test-runner:** Testing — Lit's official recommendation, real browsers (not JSDOM), Shadow DOM support

**Critical infrastructure:**
- **Custom Elements Manifest Analyzer:** Generates API documentation, powers Storybook autodocs
- **Storybook 8:** Component playground with web-components-vite framework
- **TailwindElement base class:** Injects compiled Tailwind into Shadow DOM via unsafeCSS

### Expected Features

Research reveals a clear three-tier feature prioritization based on component library expectations in 2026.

**Must have (table stakes):**
- **Accessibility (WCAG 2.1 AA):** Non-negotiable legal/ethical requirement, includes keyboard navigation, ARIA, focus management, screen reader support
- **TypeScript support:** Full type definitions, generic components, strict mode compatible
- **Dark/Light theme:** CSS custom properties with `prefers-color-scheme` support
- **Documentation:** Props API reference, usage examples, accessibility notes per component
- **Component variants:** Consistent variant system (primary/secondary/outline/ghost) across components
- **Size system:** T-shirt sizes (sm/md/lg) applied consistently
- **Loading/Disabled states:** Visual feedback and proper ARIA for async operations

**Should have (competitive differentiators):**
- **Framework agnosticism:** Works in React/Vue/Svelte without wrappers (core value prop vs shadcn)
- **Copy-source CLI mode:** shadcn-style "own your code" via `npx lit-ui add button`
- **NPM package mode:** Traditional install for teams wanting auto-updates
- **Tailwind compatibility:** Solve Shadow DOM + Tailwind integration challenge
- **Design token system:** CSS custom properties organized in primitive > semantic > component layers
- **Zero runtime dependencies:** Only Lit as dependency, no lodash/date-fns
- **AI-friendly open code:** Accessible source enables LLM customization assistance

**Defer (v2+):**
- **Data table/Charts:** Complex, better served by specialized libraries (ag-grid, chart.js)
- **Date picker:** Calendar logic complexity, defer to temporal libraries
- **Rich text editor:** Massive scope, not a UI primitive
- **Figma plugin:** Requires design tooling expertise, could be paid add-on
- **Headless mode:** Doubles maintenance burden, defer until PMF established

### Architecture Approach

The architecture follows a monorepo structure with two main packages: `cli/` (distribution tool) and `ui/` (component source). The CLI fetches from a JSON registry, transforms import paths and CSS variables, then writes to the user's project. Components extend a `TailwindElement` base class that injects compiled Tailwind CSS into Shadow DOM via constructable stylesheets. Design tokens are centralized as CSS custom properties that inherit across shadow boundaries. The copy-source model means users own the code and can customize freely, while the registry enables version tracking and diffing.

**Major components:**
1. **CLI Tool** — Fetches registry, transforms code (import paths, CSS variables), writes to user project
2. **TailwindElement Base Class** — Shared LitElement subclass that injects Tailwind via unsafeCSS, provides theme inheritance
3. **Registry (JSON Schema)** — Defines available components, dependencies, file mappings; consumed by CLI
4. **Design Token System** — CSS custom properties (:root tokens) that cascade into Shadow DOM via :host
5. **UI Components** — Self-contained accessible web components (Button, Dialog) with CSS custom property APIs

**Key patterns:**
- **Constructable stylesheets** for Tailwind injection (shares parsed CSS across instances, prevents re-parsing overhead)
- **CSS custom properties** for theming (crosses Shadow DOM boundaries via inheritance)
- **Registry-based distribution** (shadcn pattern: users own code, CLI manages updates)
- **Component config file** (lit-ui.json defines installation paths, aliases, style preferences)

### Critical Pitfalls

Research identified six critical pitfalls that will block progress if not addressed systematically.

1. **Tailwind CSS fails inside Shadow DOM** — Global stylesheets cannot penetrate shadow boundaries. Solution: Use constructable stylesheets with `adoptedStyleSheets` API to inject compiled Tailwind into each shadow root, or use `?inline` CSS imports with unsafeCSS. Must solve in Phase 1.

2. **Tailwind v4 CSS variables use :root not :host** — Tailwind v4 generates `:root` selectors for CSS variables, which don't work in Shadow DOM (needs `:host`). Solution: Post-process CSS to transform `:root` to `:root, :host` in build pipeline. Critical for Phase 1 foundation.

3. **Form elements don't participate in forms** — Input elements inside Shadow DOM are invisible to parent `<form>` elements. Solution: Implement ElementInternals API with `formAssociated = true`, `setFormValue()`, and lifecycle callbacks. Required for Button (type="submit") and any future form components.

4. **ARIA ID references break across shadow boundaries** — `aria-labelledby`, `aria-describedby`, `aria-controls` can't reference elements across shadow boundaries. Solution: Keep ARIA pairs together in same DOM, use slots for labels, or use `aria-label` strings instead of ID references. Affects Dialog accessibility in Phase 2.

5. **Event retargeting breaks event delegation** — Events crossing shadow boundaries have their `event.target` changed to the host element. Solution: Use `event.composedPath()[0]` for original target, dispatch custom events with `composed: true`, establish event naming conventions (`lit-ui-*` prefix). Pattern needed before first interactive component.

6. **SSR renders empty components (FOUC/LCP issues)** — Web components require JavaScript to render, causing Flash of Unstyled Content. Solution: Document limitations clearly, use Declarative Shadow DOM where supported, provide `:not(:defined)` CSS hiding strategy, consider @lit-labs/ssr for critical cases. Address in documentation phase.

## Implications for Roadmap

Based on research, a dependency-driven phase structure is recommended with foundation work before components, and CLI distribution after components are stable.

### Phase 1: Foundation & Tooling
**Rationale:** Shadow DOM + Tailwind integration is the fundamental architectural challenge. All components depend on this being solved correctly. Choosing the wrong approach here forces a complete rebuild.

**Delivers:**
- Monorepo structure (packages/ui, packages/cli)
- TailwindElement base class with working Shadow DOM + Tailwind solution
- Design token system (CSS custom properties)
- TypeScript configuration with Lit 3 decorators
- Vite build configuration (library mode + Tailwind transformation)
- Testing infrastructure (@web/test-runner with real browsers)

**Addresses pitfalls:**
- Tailwind in Shadow DOM (#1)
- CSS variable :root/:host transformation (#2)
- Establishes event naming conventions (#5)

**Research flags:** STANDARD PATTERNS — Lit and Vite setup is well-documented, no additional research needed. The Tailwind + Shadow DOM integration has community solutions to evaluate.

### Phase 2: Core Components (MVP)
**Rationale:** Button and Dialog validate the full architecture. Button tests form participation and basic styling. Dialog tests focus management, ARIA across boundaries, keyboard navigation, and complex accessibility patterns. These two components expose every critical pattern needed for future components.

**Delivers:**
- Button component (variants: primary/secondary/outline/ghost/destructive, sizes: sm/md/lg, states: disabled/loading)
- Dialog component (controlled open/close, focus trap, Escape to close, backdrop click-to-close, ARIA labels)
- Component testing patterns with @web/test-runner
- Accessibility testing with axe-core
- Custom Elements Manifest generation

**Addresses features:**
- Component variants (FEATURES.md table stakes)
- Size system (FEATURES.md table stakes)
- Accessibility (FEATURES.md table stakes)
- Keyboard navigation (FEATURES.md table stakes)

**Addresses pitfalls:**
- Form participation via ElementInternals (#3) — Button with type="submit"
- ARIA ID references (#4) — Dialog title/description with aria-labelledby
- Event retargeting (#5) — Custom events for button clicks, dialog close

**Research flags:** NEEDS RESEARCH — Dialog focus trap implementation and ARIA best practices may need deeper investigation during planning. Consider `/gsd:research-phase "Dialog accessibility patterns"`.

### Phase 3: CLI Distribution
**Rationale:** Components must be stable before building distribution tooling. The CLI transforms and copies component source, so the component API and file structure must be locked. Registry schema depends on knowing component dependencies and file layouts.

**Delivers:**
- CLI tool with commands: init, add, diff
- Registry JSON schema (registry.json, registry-item.json)
- Code transformer (import path rewriting, CSS variable mapping)
- Component config (lit-ui.json) with aliases, paths, style preferences
- Installation docs for all frameworks (React, Vue, Svelte, Angular)

**Addresses features:**
- Copy-source CLI mode (FEATURES.md differentiator)
- Framework agnostic verification (FEATURES.md differentiator)

**Uses stack:**
- Commander.js for CLI argument parsing
- Inquirer.js for interactive prompts
- Chalk for terminal styling
- fs-extra for file operations
- tsup for CLI bundling (ESM + CJS)

**Research flags:** STANDARD PATTERNS — shadcn/ui CLI architecture is well-documented. Commander + Inquirer patterns are established.

### Phase 4: Documentation & Polish
**Rationale:** Documentation is critical for adoption but requires working components and CLI to document. Storybook setup depends on Custom Elements Manifest from components. Framework integration examples need stable component APIs.

**Delivers:**
- Storybook 8 documentation site with autodocs
- Installation guides per framework
- Component API reference from Custom Elements Manifest
- Accessibility documentation per component
- Example projects (React, Vue, Svelte integration)
- `:not(:defined)` CSS hiding strategy docs

**Addresses pitfalls:**
- SSR/FOUC documentation (#6)
- Framework integration gotchas (React 18 props, Vue custom elements config, Svelte kebab-case)

**Research flags:** STANDARD PATTERNS — Storybook setup is documented. Framework integration examples exist.

### Phase 5: NPM Distribution (Optional)
**Rationale:** Copy-source is the primary distribution model. NPM package mode is convenience for teams wanting auto-updates. This can be deferred if CLI proves sufficient.

**Delivers:**
- @lit-ui/button, @lit-ui/dialog as publishable npm packages
- Dual ESM + CJS builds via Vite library mode
- Proper dependency externalization
- Package versioning strategy

**Addresses features:**
- NPM package mode (FEATURES.md differentiator)

**Research flags:** STANDARD PATTERNS — Vite library mode is well-documented.

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** Components cannot be built without solving Shadow DOM + Tailwind integration. This is an architectural decision that affects every component. Build it wrong and you rebuild everything.

- **Phase 2 before Phase 3:** The CLI copies component source. You cannot build a distribution system until the thing being distributed is stable. Component file structure, dependencies, and APIs must be locked.

- **Phase 3 before Phase 4:** Documentation includes CLI usage instructions, installation commands, and framework integration. You cannot document what doesn't exist.

- **Phase 5 deferred:** NPM distribution is optional. Copy-source model is the primary value proposition (vs shadcn's React-only approach). Add NPM mode only if users request it.

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 2 (Dialog component):** Focus trap implementation has multiple approaches (inert attribute, focus sentinel elements, tabbable element detection). ARIA patterns for modal dialogs have nuances. Recommend `/gsd:research-phase "Dialog focus trap and ARIA"` before implementation.

- **Phase 2 (Framework testing):** React 18 vs React 19 web component support differs significantly. Vue's `compilerOptions.isCustomElement` config is easy to miss. Recommend shallow research during integration testing.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Lit + Vite + TypeScript setup is well-documented in official Lit docs. Tailwind v4 Vite plugin is documented. Community has solved Shadow DOM + Tailwind (multiple approaches to evaluate, but not research-worthy).

- **Phase 3 (CLI):** shadcn/ui CLI architecture is open source and well-documented. Commander + Inquirer patterns are established in npm ecosystem.

- **Phase 4 (Documentation):** Storybook web-components-vite framework is documented. Custom Elements Manifest analyzer has examples.

- **Phase 5 (NPM):** Vite library mode is standard and well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations from official docs or verified implementations (Lit docs, Tailwind docs, shadcn source). Version compatibility confirmed. |
| Features | HIGH | Based on analysis of competitive libraries (shadcn, Radix, Shoelace) and WCAG 2.1 AA requirements. Feature tiers validated against Builder.io research. |
| Architecture | HIGH | Lit patterns from official docs, shadcn CLI architecture from source code analysis, Shadow DOM patterns from MDN/specs. |
| Pitfalls | HIGH | All six critical pitfalls verified across multiple sources (GitHub discussions, official docs, experienced developer blogs). Shadow DOM gotchas are well-documented. |

**Overall confidence:** HIGH

All research findings are grounded in official documentation, verified implementations, or community consensus across multiple sources. The Shadow DOM + Tailwind integration challenge is well-documented with known solutions. The shadcn CLI pattern is battle-tested with open source reference implementation. Lit is mature (v3.x) with stable APIs. WCAG 2.1 AA requirements are standardized.

### Gaps to Address

While overall confidence is high, several areas need validation during implementation:

- **Tailwind v4 Shadow DOM fix:** Multiple community approaches exist (constructable stylesheets, postcss-lit, light DOM). Need to evaluate performance/DX trade-offs during Phase 1 and pick one. This is evaluation, not research.

- **Focus trap library vs custom:** Dialog focus trap can be implemented from scratch or use a library (focus-trap, a11y-dialog-component). Need to evaluate bundle size and browser compatibility during Phase 2 planning.

- **React 19 adoption timeline:** React 19 has native web component support, but adoption is gradual. Documentation must cover both React 18 (requires wrapper) and React 19 (native) approaches. Monitor ecosystem during Phase 4.

- **SSR priority:** Research shows SSR is possible (Declarative Shadow DOM, @lit-labs/ssr) but complex. Need to validate whether target users actually need SSR. If targeting SPA frameworks (Vue, Svelte), SSR may not be critical. Gather user feedback during MVP.

- **TypeScript decorators:** Lit 3 supports TC39 standard decorators, but some examples still use legacy decorators. Need to confirm tsconfig settings (`experimentalDecorators: true`, `useDefineForClassFields: false`) during Phase 1 setup.

## Sources

### Primary (HIGH confidence)
- [Lit Official Documentation](https://lit.dev/docs/) — Component structure, decorators, styling patterns, events, SSR
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/blog/tailwindcss-v4) — v4 features, Vite plugin, CSS variables
- [shadcn/ui Official Docs](https://ui.shadcn.com/docs) — CLI architecture, registry schema, components.json config
- [Vite Documentation](https://vite.dev/guide/) — Library mode, build configuration
- [W3C ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — Modal dialog accessibility patterns
- [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) — Shadow DOM, custom elements, ElementInternals

### Secondary (MEDIUM confidence)
- [Shoelace GitHub](https://github.com/shoelace-style/shoelace) — Lit-based component library reference implementation
- [Material Components Web Architecture](https://github.com/material-components/material-components-web/blob/master/docs/code/architecture.md) — Component patterns
- [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/) — Analyzer setup, plugin configuration
- [Tailwind + Shadow DOM Discussion #1935](https://github.com/tailwindlabs/tailwindcss/discussions/1935) — Integration challenges
- [Web Components Tailwind Starter Kit](https://github.com/butopen/web-components-tailwind-starter-kit) — TailwindElement pattern
- [Shadow DOM and ARIA - Nolan Lawson](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) — Accessibility pitfalls
- [Form-associated custom elements - Hjorthhansen](https://www.hjorthhansen.dev/shadow-dom-form-participation/) — ElementInternals API

### Tertiary (verification during implementation)
- [Custom Elements Everywhere](https://custom-elements-everywhere.com/) — Framework compatibility scores
- [React 19 Web Components Support](https://react.dev/blog/2024/12/05/react-19) — React 19 changes
- [Builder.io: React UI Libraries 2026](https://www.builder.io/blog/react-component-libraries-2026) — Industry expectations
- [AgnosticUI](https://www.agnosticui.com/) — Multi-framework approach patterns

---
*Research completed: 2026-01-23*
*Ready for roadmap: yes*
