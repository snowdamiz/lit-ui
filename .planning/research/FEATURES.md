# Feature Research

**Domain:** Framework-agnostic component library (Lit.js web components)
**Researched:** 2026-01-23 (v1.0), 2026-01-24 (v2.0 NPM + SSR)
**Confidence:** HIGH (verified across multiple authoritative sources)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Accessibility (WCAG 2.1 AA)** | Non-negotiable in 2026; legal requirements increasing | HIGH | Keyboard navigation, ARIA labels, focus management, screen reader support. Every component must pass automated + manual a11y testing |
| **TypeScript Support** | Standard expectation for modern libraries | MEDIUM | Full type definitions, generic components, strict mode compatible |
| **Dark/Light Theme** | Users expect built-in theme variants | MEDIUM | CSS custom properties for theming; respect `prefers-color-scheme` |
| **Keyboard Navigation** | Part of accessibility; power users expect it | MEDIUM | Tab order, arrow key navigation for composite widgets, Enter/Space activation |
| **Focus Management** | Critical for modals, dropdowns, forms | HIGH | Focus trapping for dialogs, return focus on close, visible focus indicators |
| **Responsive Design** | Components must work on mobile | LOW | Fluid sizing, touch-friendly hit targets (min 44px) |
| **Documentation** | Users won't adopt without docs | MEDIUM | Props API reference, usage examples, accessibility notes per component |
| **Semantic HTML** | 2026 trend: return to native elements over ARIA hacks | LOW | Use `<button>` not `<div role="button">`, `<dialog>` for modals where supported |
| **Component Variants** | Buttons need primary/secondary/ghost/etc. | LOW | Variant prop with consistent naming across components |
| **Size System** | sm/md/lg or xs-xl sizing | LOW | T-shirt sizes, consistent across all components |
| **Disabled State** | Form elements need disable capability | LOW | Visual indication + `aria-disabled` for discoverability |
| **Loading State** | Async actions need feedback | MEDIUM | Spinner/skeleton, `aria-busy`, disable interaction during load |
| **CSS Custom Properties API** | Customization without source editing | MEDIUM | Expose meaningful tokens: `--lit-ui-button-bg`, `--lit-ui-radius-md` |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **True Framework Agnosticism** | Works in React/Vue/Svelte without wrappers | HIGH | This is the core differentiator vs. ShadCN (React-only). Web Components enable this natively. Must verify and document framework integration |
| **Copy-Source CLI Mode** | ShadCN-style "own your code" experience | MEDIUM | `npx lit-ui add button` copies source into project. Users can customize without forking |
| **NPM Package Mode** | Traditional install for those who want updates | LOW | Also offer `npm install @lit-ui/button` for convenience |
| **Tailwind-Compatible Styling** | Leverage existing Tailwind knowledge | HIGH | Shadow DOM + Tailwind is tricky; need constructable stylesheets or light DOM approach |
| **Headless/Unstyled Option** | Developers bring their own design | HIGH | Separate package: base behavior without styling. Harder to maintain two versions |
| **AI-Friendly Open Code** | LLMs can read, understand, modify | LOW | ShadCN's innovation: accessible source code means AI assistants can help customize |
| **Design Token System** | Professional theming infrastructure | MEDIUM | CSS custom properties organized in layers: primitive > semantic > component tokens |
| **Figma Kit Sync** | Design-to-code alignment | HIGH | Nice-to-have; could be a paid add-on later |
| **Form Library Agnostic** | Works with any validation approach | MEDIUM | Don't require specific form library; expose native form participation API |
| **Animation System** | Smooth micro-interactions | MEDIUM | Enter/exit transitions, reduced motion support (`prefers-reduced-motion`) |
| **Slot-Based Composition** | Flexible content injection | LOW | Web Components slots are native; use named slots for complex layouts |
| **SSR Compatibility** | Works with Next.js, Nuxt, SvelteKit | HIGH | Declarative Shadow DOM, hydration considerations. Complex but increasingly expected |
| **Zero Runtime Dependencies** | Lit is the only dependency | LOW | No lodash, no date-fns. Keep bundle minimal |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Massive Component Library (50+ components)** | "More = better" thinking | Maintenance burden explodes; quality suffers; MVP never ships | Start with 2 components (Button + Dialog), add incrementally based on demand |
| **CSS-in-JS Runtime** | Familiar to React devs | Performance overhead, SSR complexity, conflicts with Tailwind approach | Use CSS custom properties + Tailwind classes |
| **Prop-Based Styling** | `<Button color="red">` feels intuitive | Explodes API surface; conflicts with design tokens; not how Tailwind works | Use `class` attribute with Tailwind utilities (implemented); expose `variant` prop for semantic choices |
| **Global CSS Overrides** | "Just add a stylesheet" simplicity | Shadow DOM isolates styles (intentionally); users will fight encapsulation | Provide CSS custom properties API; document which properties are customizable |
| **React-Specific Features** | "Most users are React developers" | Defeats framework-agnostic value prop; fragments the codebase | Pure web components that happen to work great in React |
| **Built-in State Management** | "Components should manage their own state" | Creates coupling; conflicts with host framework's state management | Components are controlled by default; minimal internal state for UI-only concerns |
| **jQuery-Style Plugin Architecture** | Familiar extension model | Modern web components don't need plugins; composition handles extensibility | Use slots, events, CSS custom properties for customization |
| **Kitchen-Sink Data Components** | Data tables, charts, etc. requested early | Complexity explosion; better served by specialized libraries | Focus on UI primitives; recommend ag-grid, chart.js for data-heavy needs |
| **CSS Reset/Normalize** | "Consistent base styles" | Conflicts with host application's reset; Shadow DOM already isolates | Document that components work with any reset; don't impose one |
| **Automatic Form Validation** | "Built-in validation is convenient" | Every app has different validation needs; creates conflicts with form libraries | Expose validation attributes/events; let host app handle validation logic |

---

## v2.0 NPM + SSR Feature Research

**Researched:** 2026-01-24
**Focus:** NPM package distribution and SSR support for existing web component library

### NPM Package Features

#### Table Stakes for NPM Distribution

Features users expect from any professional component library published to NPM.

| Feature | Description | Complexity | Confidence |
|---------|-------------|------------|------------|
| **ESM exports** | Pure ES modules with `"type": "module"` - required for tree shaking | Low | HIGH |
| **TypeScript declarations** | `.d.ts` files bundled with package via `types` field | Low | HIGH |
| **Subpath exports** | Individual component imports via `@lit-ui/button` or `lit-ui/button` | Medium | HIGH |
| **`sideEffects: false`** | Enables bundler tree shaking by declaring pure modules | Low | HIGH |
| **Proper `exports` field** | Conditional exports with `import`, `types` conditions | Low | HIGH |
| **Peer dependency on Lit** | `"lit": "^3.0.0"` as peer dep to avoid version conflicts | Low | HIGH |
| **Semantic versioning** | Clear major/minor/patch versioning for breaking changes | Low | HIGH |
| **README with quick start** | Installation and basic usage in package README | Low | HIGH |
| **LICENSE file** | MIT license included in package | Low | HIGH |
| **Changelog** | CHANGELOG.md tracking version changes | Low | MEDIUM |

#### NPM Differentiators

Features that distinguish high-quality component libraries.

| Feature | Description | Why Valuable | Complexity | Confidence |
|---------|-------------|--------------|------------|------------|
| **Custom Elements Manifest** | `custom-elements.json` describing component APIs | Enables IDE autocomplete, Figma integration, AI tooling via MCP | Medium | HIGH |
| **Scoped packages** | `@lit-ui/core`, `@lit-ui/button`, `@lit-ui/dialog` monorepo | Install only what you need, cleaner dependency tree | Medium | HIGH |
| **React wrappers package** | `@lit-ui/react` using `@lit/react` for proper React integration | Better DX for React users - properties work, events work | Medium | HIGH |
| **Bundle size tracking** | CI checks via size-limit or bundlewatch | Prevents bundle bloat, builds trust | Low | MEDIUM |
| **Per-component lazy loading** | Dynamic imports work out of the box | Smaller initial bundles for apps | Low | HIGH |
| **Source maps** | `.map` files for debugging | Better DX when debugging | Low | HIGH |

#### NPM Package Structure Recommendation

Based on research, the recommended package structure for v2.0:

```
Monorepo packages:
  @lit-ui/core        - Base classes (TailwindElement), utilities, types
  @lit-ui/button      - Button component (depends on @lit-ui/core)
  @lit-ui/dialog      - Dialog component (depends on @lit-ui/core)
  @lit-ui/react       - React wrappers (optional, for enhanced React DX)
  lit-ui              - CLI tool (existing, enhanced for npm mode)

package.json exports pattern:
  {
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js"
      }
    },
    "sideEffects": false,
    "peerDependencies": {
      "lit": "^3.0.0"
    }
  }
```

**Rationale:** Scoped packages allow granular installation. Users can `npm install @lit-ui/button` without pulling in Dialog. The monorepo structure mirrors successful libraries like Shoelace and maintains the "install only what you use" philosophy.

---

### SSR Features

#### Table Stakes for SSR Compatibility

Features required for SSR compatibility with Lit web components.

| Feature | Description | Complexity | Confidence |
|---------|-------------|------------|------------|
| **Declarative Shadow DOM output** | Components render `<template shadowrootmode="open">` server-side | Medium | HIGH |
| **Hydration support** | Load `@lit-labs/ssr-client/lit-element-hydrate-support.js` before components | Low | HIGH |
| **DSD polyfill guidance** | Document polyfill for older browsers (Firefox had it, now universal) | Low | HIGH |
| **No DOM access in constructors** | Components must not access `document` or `window` on initialization | Low | HIGH |
| **Static rendering fallback** | Components display meaningful content even without JS | Medium | MEDIUM |

#### SSR Implementation Requirements

Based on Lit's official SSR documentation:

| Requirement | Description | Complexity | Confidence |
|-------------|-------------|------------|------------|
| **`@lit-labs/ssr` package** | Server-side rendering for Lit templates and components | Medium | HIGH |
| **`@lit-labs/ssr-client` package** | Client-side hydration support | Low | HIGH |
| **`@lit-labs/ssr-dom-shim`** | Minimal DOM API shims for Node.js environment | Low | HIGH |
| **Component module ordering** | Hydration support must load BEFORE `lit` module | Medium | HIGH |
| **Shadow-only components** | Only shadow DOM components supported (LitUI already uses this) | N/A | HIGH |

#### SSR Differentiators

Features that provide enhanced SSR experience.

| Feature | Description | Why Valuable | Complexity | Confidence |
|---------|-------------|--------------|------------|------------|
| **Framework SSR integrations** | Support for Next.js (`@lit-labs/nextjs`), Nuxt, Astro | Wider adoption in framework ecosystems | High | HIGH |
| **React SSR deep rendering** | `@lit-labs/ssr-react` for enhanced React SSR | Lit components render fully in React SSR | High | HIGH |
| **Streaming support** | Lit SSR supports streaming HTML | Faster TTFB on large pages | Medium | MEDIUM |
| **Server-only templates** | `html` from `@lit-labs/ssr` for doc-level rendering | Full HTML document rendering capability | Medium | MEDIUM |

#### SSR Browser Support Status (2026)

| Browser | Declarative Shadow DOM | Notes |
|---------|------------------------|-------|
| Chrome | 90+ (shadowroot), 124+ (shadowrootmode) | Full support |
| Edge | 91+ (shadowroot), 124+ (shadowrootmode) | Full support |
| Firefox | Supported (as of 2024) | No longer needs polyfill |
| Safari | Supported | Via WebKit |

**Polyfill recommendation:** Include `@webcomponents/template-shadowroot` for legacy browser support, but document that modern browsers (2024+) have native support.

---

### NPM + SSR Anti-Features (Do NOT Build)

Features to deliberately avoid - common mistakes or over-engineering.

| Anti-Feature | Why to Avoid | What to Do Instead |
|--------------|--------------|-------------------|
| **CommonJS dual package** | Web components are modern JS - CJS adds complexity, maintenance burden, potential dual-package hazard | ESM-only with clear documentation |
| **React-specific component variants** | Defeats framework-agnostic value proposition | Use `@lit/react` wrappers that wrap existing components |
| **Built-in state management** | Conflicts with host framework's state (React, Vue, Svelte all have their own) | Components accept props, emit events |
| **CSS-in-JS runtime** | Conflicts with Tailwind approach, adds bundle size | Continue constructable stylesheets pattern |
| **Automatic framework detection** | Adds complexity, magic behavior | Clear documentation per framework |
| **Single mega-package** | Forces users to install everything | Scoped packages for granular deps |
| **Private/proprietary registry** | Reduces adoption | Public NPM registry |
| **Webpack-specific optimizations** | Bundler lock-in | Use standard ESM, let bundlers optimize |
| **Heavy polyfill bundling** | Most modern browsers don't need it | Document polyfill for users who need it |
| **Auto-update mechanism in package** | Security risk, complexity | Document update process clearly |

#### SSR-Specific Anti-Features

| Anti-Feature | Why to Avoid | What to Do Instead |
|--------------|--------------|-------------------|
| **DOM manipulation in constructors** | Breaks SSR - no DOM available server-side | Use `connectedCallback()` or `firstUpdated()` |
| **`window`/`document` direct access** | Undefined in Node.js SSR environment | Guard with `typeof window !== 'undefined'` |
| **Synchronous async data fetching** | SSR cannot wait for async operations | Accept data as properties from parent |
| **Custom SSR implementation** | Reinventing the wheel, maintenance burden | Use `@lit-labs/ssr` ecosystem |
| **Forced hydration** | Some pages don't need interactivity | Support static-only rendering option |

---

## Feature Dependencies

```
[Accessibility]
    |-- requires --> [Keyboard Navigation]
    |-- requires --> [Focus Management]
    |-- requires --> [ARIA Attributes]

[Dialog Component]
    |-- requires --> [Focus Management] (focus trap)
    |-- requires --> [Portal/Overlay System]
    |-- requires --> [Keyboard Navigation] (Escape to close)

[Button Component]
    |-- requires --> [Variant System]
    |-- requires --> [Size System]
    |-- requires --> [Loading State]
    |-- requires --> [Disabled State]

[Tailwind Integration]
    |-- requires --> [CSS Custom Properties API]
    |-- conflicts --> [Deep Shadow DOM] (style isolation breaks Tailwind)

[Copy-Source CLI]
    |-- requires --> [Flat File Structure]
    |-- requires --> [Minimal Dependencies]
    |-- enhances --> [AI-Friendly Code]

[NPM Package Mode]
    |-- parallel to --> [Copy-Source CLI] (both can coexist)

[Dark/Light Theme]
    |-- requires --> [CSS Custom Properties API]
    |-- requires --> [prefers-color-scheme Support]

[SSR Compatibility]
    |-- requires --> [Declarative Shadow DOM]
    |-- requires --> [Hydration Strategy]
```

### v2.0 NPM + SSR Dependencies on v1.0

How v2.0 features relate to existing v1.0 implementation:

```
Existing v1.0 features:
  [TailwindElement base class]
  [Button component]
  [Dialog component]
  [CLI tool]

NPM features build on:
  TailwindElement  -->  @lit-ui/core package
  Button           -->  @lit-ui/button package (depends on core)
  Dialog           -->  @lit-ui/dialog package (depends on core)
  CLI              -->  Enhanced to support npm install mode

SSR features require:
  Components       -->  Review for SSR compatibility (no DOM in constructors)
  TailwindElement  -->  Ensure constructable stylesheets work in SSR
  Button           -->  Should work (no DOM manipulation)
  Dialog           -->  May need review (uses native <dialog>, showModal())
```

### Package Dependency Flow

```
@lit-ui/core (TailwindElement, design tokens, types)
    ^
    |
    +-- @lit-ui/button (Button component)
    |
    +-- @lit-ui/dialog (Dialog component)
    |
    +-- @lit-ui/react (React wrappers - optional)
```

---

## MVP Definition

### Launch With (v1) - SHIPPED

Minimum viable product to validate the concept.

- [x] **Button Component** - most basic UI primitive; validates the architecture
  - Variants: primary, secondary, outline, ghost, destructive
  - Sizes: sm, md, lg
  - States: default, hover, focus, active, disabled, loading
  - Accessibility: keyboard activation, focus ring, aria-disabled support

- [x] **Dialog Component** - validates complex patterns (portals, focus trap, a11y)
  - Open/close control (controlled component)
  - Focus trap implementation
  - Escape to close
  - Click-outside to close (optional)
  - Title + description with aria-labelledby/describedby
  - Animations (enter/exit with reduced-motion support)

- [x] **CLI Tool** - validates distribution model
  - `npx lit-ui init` - setup project config
  - `npx lit-ui add button` - copy source mode
  - Config file for paths, styling preferences

- [x] **Documentation Site** - validates that people can use it
  - Installation guide (all frameworks)
  - Component API reference
  - Live examples
  - Accessibility notes

- [x] **Tailwind Integration** - validates styling approach
  - Working solution for Shadow DOM + Tailwind
  - CSS custom properties for theming
  - Example with Tailwind v4

### v2.0 MVP: NPM + SSR

Features to add for v2.0 milestone.

#### Phase 1: NPM Packages (Priority: HIGH)

Must-have features:
1. Monorepo setup with workspace packages
2. `@lit-ui/core` with TailwindElement and types
3. `@lit-ui/button` and `@lit-ui/dialog` packages
4. Proper `exports`, `types`, `sideEffects` in package.json
5. TypeScript declarations generated
6. Custom Elements Manifest (`custom-elements.json`)

#### Phase 2: SSR Support (Priority: HIGH)

Must-have features:
1. Verify components work in Node.js (no DOM in constructors)
2. Add `@lit-labs/ssr` as optional peer dependency
3. Document hydration setup requirements
4. Provide example integrations (Next.js, basic Node)

#### Phase 3: Enhanced DX (Priority: MEDIUM)

Nice-to-have features:
1. `@lit-ui/react` wrappers package
2. Bundle size CI checks
3. Framework-specific SSR integration packages

### Add After Validation (v1.x / v2.x)

Features to add once core is working.

- [ ] **Input Component** - trigger: feedback that forms are common use case
- [ ] **Select/Dropdown** - trigger: composite keyboard navigation validated in Dialog
- [ ] **Tooltip** - trigger: low complexity, high demand
- [ ] **Checkbox/Radio** - trigger: form use cases validated
- [ ] **Card Component** - trigger: layout primitive requests
- [ ] **More Themes** - trigger: customization requests beyond light/dark

### Future Consideration (v3+)

Features to defer until product-market fit is established.

- [ ] **Data Table** - defer: complex, specialized libraries do it better
- [ ] **Date Picker** - defer: calendar logic is complex; use temporal libraries
- [ ] **File Upload** - defer: highly app-specific
- [ ] **Rich Text Editor** - defer: massive complexity
- [ ] **Charts** - defer: Chart.js, D3 exist
- [ ] **Figma Plugin** - defer: requires design tooling expertise
- [ ] **Headless Mode** - defer: doubles maintenance burden
- [ ] **Animation Library** - defer: CSS transitions sufficient for v1

---

## v2.0 Complexity Summary

| Category | Low Complexity | Medium Complexity | High Complexity |
|----------|----------------|-------------------|-----------------|
| NPM | ESM exports, types, sideEffects, peer deps | Subpath exports, CEM, monorepo | - |
| SSR | Hydration docs, polyfill guidance | DSD output, component review | Framework integrations |

**Overall Assessment:** NPM packaging is largely straightforward with established patterns. SSR support has clear Lit ecosystem tools but requires careful component review and documentation.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Button Component | HIGH | LOW | P1 - DONE |
| Dialog Component | HIGH | MEDIUM | P1 - DONE |
| Accessibility (WCAG 2.1 AA) | HIGH | HIGH | P1 - DONE |
| CLI Copy-Source Mode | HIGH | MEDIUM | P1 - DONE |
| Tailwind Integration | HIGH | HIGH | P1 - DONE |
| TypeScript Support | HIGH | LOW | P1 - DONE |
| Dark/Light Theme | MEDIUM | LOW | P1 - DONE |
| Documentation | HIGH | MEDIUM | P1 - DONE |
| Framework Agnostic Verification | HIGH | MEDIUM | P1 - DONE |
| **NPM Package Distribution** | HIGH | MEDIUM | **P1 - v2.0** |
| **SSR Compatibility** | HIGH | MEDIUM | **P1 - v2.0** |
| Custom Elements Manifest | MEDIUM | LOW | P1 - v2.0 |
| Input Component | HIGH | LOW | P2 |
| Select/Dropdown | HIGH | HIGH | P2 |
| Loading States | MEDIUM | LOW | P2 |
| Animation System | MEDIUM | MEDIUM | P2 |
| React Wrappers Package | MEDIUM | MEDIUM | P2 |
| Figma Kit | LOW | HIGH | P3 |
| Headless Mode | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch / current milestone
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | ShadCN/UI | Shoelace/Web Awesome | Radix UI | Our Approach (lit-ui) |
|---------|-----------|----------------------|----------|----------------------|
| **Framework Support** | React only | Framework agnostic (Web Components) | React only | Framework agnostic (Web Components + Lit) |
| **Distribution** | Copy-paste + CLI | NPM package | NPM package | Copy-paste CLI + NPM (both) |
| **Styling** | Tailwind + CSS vars | CSS vars + ::part() | Unstyled (headless) | Tailwind-compatible + CSS vars |
| **Accessibility** | Radix primitives (excellent) | Built-in (good) | Excellent (core focus) | Built-in WCAG 2.1 AA |
| **Component Count** | 50+ | 60+ | 30+ primitives | Start with 2, grow based on demand |
| **Customization** | Full source ownership | CSS custom properties | Full control (unstyled) | Source ownership OR CSS vars |
| **TypeScript** | Full support | Full support | Full support | Full support |
| **SSR** | Next.js focused | Requires setup | React-focused | Declarative Shadow DOM (v2.0) |
| **Dark Mode** | Built-in | Built-in | User handles | Built-in with prefers-color-scheme |
| **Bundle Size** | Zero runtime (copy-paste) | ~60KB for all | Small per-component | Minimal (Lit ~5KB + component) |
| **NPM Packages** | Single package (copy-paste focus) | Monorepo scoped packages | Single package | Monorepo scoped packages (v2.0) |

### Competitive Positioning

**vs. ShadCN:** We offer framework agnosticism. ShadCN is excellent but React-only. Teams using Vue, Svelte, or multiple frameworks need our solution.

**vs. Shoelace/Web Awesome:** We offer the copy-source model. Shoelace is NPM-only; users can't easily customize. We offer both modes.

**vs. Radix:** We offer styled defaults. Radix is headless-only; great for design teams but requires significant styling work. We provide styled components with customization escape hatches.

**Unique Value Proposition:** Framework-agnostic components with ShadCN-style copy-source distribution, Tailwind compatibility, AND NPM package mode with SSR support.

---

## Sources

### v1.0 Component Library Research
- [ShadCN/UI Official Documentation](https://ui.shadcn.com/docs) - Copy-paste model, CLI architecture
- [Radix UI Primitives](https://www.radix-ui.com/primitives) - Accessibility patterns, headless approach
- [Shoelace/Web Awesome](https://shoelace.style/) - Web Components with Lit, framework agnosticism
- [Builder.io: React UI Libraries 2026](https://www.builder.io/blog/react-component-libraries-2026) - Industry expectations

### Accessibility Research
- [W3C ARIA APG: Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/) - Dialog accessibility requirements
- [MDN: ARIA Dialog Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/dialog_role) - ARIA implementation
- [A11Y Collective: Modal Accessibility](https://www.a11y-collective.com/blog/modal-accessibility/) - Focus trap requirements
- [MDN: aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled) - Disabled state patterns

### Framework Agnostic Research
- [AgnosticUI](https://www.agnosticui.com/) - Multi-framework component approach
- [Zag.js](https://zagjs.com/) - Framework-agnostic state machines for UI
- [Web Awesome Blog](https://blog.openreplay.com/framework-agnostic-ui-web-awesome/) - Web Components for framework agnosticism

### Tailwind + Web Components
- [Tailwind + Shadow DOM Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/1935) - Integration challenges
- [Web Components Tailwind Starter Kit](https://github.com/butopen/web-components-tailwind-starter-kit) - Lit + Tailwind approach
- [DEV: Using Tailwind at runtime with web components](https://dev.to/43081j/using-tailwind-at-run-time-with-web-components-47c) - Twind approach

### Design Tokens & Theming
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Token organization
- [USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/) - Government standard approach
- [The Design System Guide](https://thedesignsystem.guide/design-tokens) - Token naming conventions

### v2.0 NPM Packaging
- [Guide to package.json exports](https://hirok.io/posts/package-json-exports)
- [Node.js Packages Documentation](https://nodejs.org/api/packages.html)
- [Tree Shaking Guide - Webpack](https://webpack.js.org/guides/tree-shaking/)
- [Complete Monorepo Guide 2025](https://jsdev.space/complete-monorepo-guide/)
- [Building npm library with Web Components](https://bjerkek.medium.com/building-a-npm-library-with-web-components-using-lerna-rollup-and-jest-9f76f59348ba)
- [How to Make Tree Shakeable Libraries](https://blog.theodo.com/2021/04/library-tree-shaking/)
- [Creating tree-shakable library with tsup](https://dorshinar.me/posts/treeshaking-with-tsup)

### v2.0 SSR and Declarative Shadow DOM
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/)
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/)
- [@lit-labs/ssr NPM](https://www.npmjs.com/package/@lit-labs/ssr)
- [@lit-labs/ssr-client NPM](https://www.npmjs.com/package/@lit-labs/ssr-client)
- [@lit-labs/ssr-react NPM](https://www.npmjs.com/package/@lit-labs/ssr-react)
- [Declarative Shadow DOM - web.dev](https://web.dev/articles/declarative-shadow-dom)
- [Declarative Shadow DOM - Can I Use](https://caniuse.com/declarative-shadow-dom)

### Custom Elements Manifest
- [Custom Elements Manifest GitHub](https://github.com/webcomponents/custom-elements-manifest)
- [Custom Elements Manifest - Open WC](https://custom-elements-manifest.open-wc.org/)
- [The killer feature of Web Components](https://daverupert.com/2025/10/custom-elements-manifest-killer-feature/)

### React Integration
- [Lit React Documentation](https://lit.dev/docs/frameworks/react/)
- [@lit/react NPM](https://www.npmjs.com/package/@lit/react)

### TypeScript
- [TypeScript Type Declarations](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html)
- [Building a TypeScript Library in 2025](https://dev.to/arshadyaseen/building-a-typescript-library-in-2025-2h0i)

### Bundle Optimization
- [How to Reduce JavaScript Bundle Size in 2025](https://dev.to/frontendtoolstech/how-to-reduce-javascript-bundle-size-in-2025-2n77)
- [8 Ways to Optimize JavaScript Bundle Size](https://about.codecov.io/blog/8-ways-to-optimize-your-javascript-bundle-size/)

---
*Feature research for: lit-ui framework-agnostic component library*
*v1.0 researched: 2026-01-23*
*v2.0 NPM + SSR researched: 2026-01-24*
