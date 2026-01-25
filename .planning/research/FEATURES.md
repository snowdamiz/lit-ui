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

## v3.0 Theme Customization Feature Research

**Researched:** 2026-01-25
**Focus:** Visual theme configurator and design token system for build-time customization
**Confidence:** HIGH (verified against shadcn, Radix, Tailwind v4 official docs)

### Context

LitUI v3.0 adds:
- Visual theme configurator page on docs site with live preview
- Full design token customization (colors, sizing, shadows, animations, typography)
- CLI accepts encoded token config via command parameters
- Generated `lit-ui-tokens.css` file with user's design token values
- Components consume shared tokens file for consistent theming

Existing token system in `packages/core/src/styles/tailwind.css` already defines:
- Primitive tokens (color scales, spacing, shadows, radii)
- Semantic tokens (primary, secondary, destructive, muted, accent, etc.)
- Component tokens (--ui-button-*, --ui-dialog-*)
- Dark mode overrides via `.dark` class

---

### Table Stakes for Theme Configurator

Features users expect from a visual theme configurator. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Live preview of changes** | Every comparable tool (shadcn themes, tweakcn, Radix themes) shows instant updates. Users expect to see changes before committing. | Medium | Docs site, component rendering | Must update preview without page reload. CSS variables enable this naturally by updating `:root` styles. |
| **Color customization (primary, secondary, destructive)** | Core of any theming system. shadcn defines ~15 semantic color tokens. Radix provides accent/gray selection. | Low | Existing token system in `tailwind.css` | Already have token structure. Need UI to modify values. |
| **Light/dark mode support** | Industry standard. shadcn, Radix, MUI all provide dual-mode themes. Users expect both modes configured together. | Low | Existing `.dark` CSS block | Already implemented. Configurator needs to edit both modes simultaneously. |
| **Copy-paste CSS output** | shadcn pattern: user copies CSS and pastes into project. Zero friction adoption. | Low | None | Output format: CSS custom properties block for `:root` and `.dark`. |
| **Border radius control** | Universal customization point. shadcn, Radix both expose radius. Small change = large visual impact. | Low | `--ui-*-radius` tokens | Single value that cascades to all components. |
| **Preset themes** | shadcn offers blue, green, orange, red, rose, violet, yellow. Users want quick starting points. | Low | Color palettes | 4-6 curated presets reduce decision fatigue. |
| **CLI accepts configuration** | User shouldn't re-copy CSS each time. CLI should accept theme config to generate tokens file. | Medium | CLI (`lit-ui` package) | Encode config in URL-safe format or accept config file path. |
| **Generated tokens file** | Output: `lit-ui-tokens.css` that user imports. Components reference these tokens. | Low | None | File generation is straightforward string templating. |

---

### Differentiators for Theme Configurator

Features that set LitUI apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **WCAG contrast validation** | Real-time accessibility feedback. Shows if color combinations meet AA/AAA standards. Competitors rarely include this. | Medium | Color math library (oklch contrast calculation) | oklch makes perceptual contrast easier to calculate. Show pass/fail badges next to color pairs. |
| **Component-specific token preview** | Show how token changes affect each component (Button, Dialog) separately. Beyond just "see a demo page." | Medium | Component registry, isolated previews | Existing docs site has component pages. Leverage that structure. |
| **Shareable theme URL** | Encode entire theme in URL. User can share link, recipient sees exact theme. Like codepen but for themes. | Medium | URL encoding/decoding, state hydration | Base64 + compression for compact URLs. Enables collaboration and showcasing. |
| **Animation/transition customization** | Control transition duration, easing. Most configurators ignore animation tokens. | Low | Add `--ui-*-transition-*` tokens | Small addition, meaningful personalization. |
| **Shadow depth customization** | Control shadow intensity/spread. Visual depth is often overlooked in configurators. | Low | `--shadow-*` tokens already exist | Expose existing tokens in UI. |
| **Typography scale preview** | Show how font size/weight changes affect hierarchy. Visualize heading vs body relationships. | Medium | Font loading, scale preview | Google Fonts integration for custom font preview. |
| **Export to multiple formats** | CSS variables (default), JSON tokens, Tailwind v4 @theme block. Different teams have different needs. | Low | Template generation | JSON export enables design tool integration. |
| **Undo/redo history** | Let users experiment freely. Reduces anxiety about "breaking" the theme. | Medium | State history stack | React/Lit state management pattern. 10-20 step history sufficient. |

---

### Anti-Features for Theme Configurator

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Runtime theme switching** | v3.0 is explicitly build-time customization. Runtime adds JS overhead, SSR complexity, and conflicts with Tailwind's build-time approach. | Generate static CSS file. Runtime switching is v3.1+ if ever. Project explicitly deferred this. |
| **Hundreds of individual component tokens** | Creates overwhelming UI. IBM Carbon's approach (hundreds of variables) makes theming "tedious" and "encyclopedic." Users don't want to configure 50 button properties individually. | Use semantic layering: primitives -> semantic -> component. Expose semantic layer (10-20 tokens), components inherit automatically. |
| **Color picker for every shade** | Generating full 11-step color palettes manually is error-prone. Users pick wrong shades, break consistency. | Accept 1-2 reference colors, auto-generate palette algorithmically. Like Radix's custom color tool. |
| **Server-side theme storage** | Project constraint explicitly rules this out. Adds backend complexity, auth requirements, storage costs. | URL-encoded params for sharing. LocalStorage for persistence. CLI parameter for installation. |
| **CSS-in-JS output** | Project constraint: conflicts with Tailwind approach. Runtime overhead, SSR complications. | CSS custom properties only. Works everywhere, zero runtime. |
| **Real-time font loading from arbitrary URLs** | Security risk (XSS via font injection), performance unpredictability, licensing issues. | Curated Google Fonts list. Validate font names server-side. |
| **Design token file format (W3C DTCG)** | Adds complexity for interoperability that most users won't need. Over-engineering for current scope. | Simple CSS output. JSON as secondary export. DTCG format can be added later if demand exists. |
| **Full Figma/design tool sync** | Massive scope creep. Requires Figma plugin development, token sync infrastructure. | One-way export (configurator -> CSS/JSON). Users can manually import into Figma if needed. |
| **AI-generated themes** | Trendy but unreliable. AI themes often lack coherence, accessibility issues. Adds API dependency. | Curated presets by humans. User customization with guardrails (contrast warnings). |

---

### Theme Configurator Feature Dependencies

```
Existing Features (v1-v2)
    |
    v
Token System (tailwind.css)  <--- Components already consume these
    |
    +---> Visual Configurator Page (new)
    |         |
    |         +---> Live Preview (requires component rendering)
    |         |
    |         +---> Export UI (generates CSS/JSON)
    |         |
    |         +---> Shareable URL (encodes config)
    |
    +---> CLI Token Parameter (new)
              |
              +---> Token CSS Generation (string templating)
              |
              +---> lit-ui-tokens.css output

Dependencies Flow:
1. Token system exists (done)
2. Configurator UI built on docs site
3. CLI extended to accept token config
4. Components already work (no changes needed if tokens structured correctly)
```

---

### v3.0 MVP Recommendation

For MVP (v3.0), prioritize:

#### Must Ship
1. **Live preview** - Non-negotiable for a visual configurator
2. **Color customization** (primary, secondary, destructive, background, foreground) - Core use case
3. **Light/dark mode editing** - Expected behavior
4. **Border radius control** - High visual impact, low effort
5. **Copy-paste CSS output** - Zero-friction adoption
6. **3-4 preset themes** - Quick starting points
7. **CLI `--tokens` parameter** - Accepts encoded config string
8. **`lit-ui-tokens.css` generation** - The deliverable

#### Should Ship (if time permits)
1. **Shareable theme URL** - Competitive advantage
2. **WCAG contrast indicators** - Accessibility credibility
3. **JSON export** - Enables design tool workflows

#### Defer to v3.1+
- Typography customization (font family, scale)
- Animation tokens
- Shadow customization
- Undo/redo history
- Component-specific previews

---

### Theme Configurator Complexity Notes

#### Low Complexity (1-2 days each)
- **Preset themes**: Curated CSS blocks, button to apply
- **Border radius slider**: Single value, immediate preview
- **Copy button**: Clipboard API, straightforward
- **CSS output generation**: String template with current values
- **JSON export**: Object serialization

#### Medium Complexity (3-5 days each)
- **Live preview system**: React/Lit state management, CSS variable updates on root
- **Color picker with oklch**: Requires oklch <-> hex conversion, color space math
- **CLI token parameter**: URL encoding/decoding, parameter parsing, file generation
- **WCAG contrast validation**: Color contrast ratio calculation, AA/AAA thresholds
- **Shareable URL**: Compression, encoding, URL length limits, hydration on load

#### High Complexity (1+ week)
- **Full typography preview with custom fonts**: Google Fonts API integration, font loading states, fallback handling
- **Undo/redo system**: State history management, serialization of theme states

---

### Competitive Analysis: Theme Configurators

| Tool | Strengths | Weaknesses | LitUI Opportunity |
|------|-----------|------------|-------------------|
| **shadcn/ui Themes** | Clean UI, preset themes, copy-paste | Limited customization (presets only), no live editing | Full live configurator with same simplicity |
| **tweakcn** | Live editing, Tailwind v4 support, real-time code | Third-party (not official), complex UI | First-party experience, CLI integration |
| **Radix Themes** | Theme component props, token access | React-only, not visual configurator | Framework-agnostic, visual approach |
| **Designsystemet** | CLI token generation, comprehensive | Complex setup, Norwegian-focused | Simpler CLI, broader audience |
| **Material Theme Builder** | Figma integration, comprehensive tokens | Google ecosystem lock-in, complexity | Lightweight, framework-agnostic |

---

### Token Structure Recommendation

The existing token structure in `tailwind.css` follows best practices. Validate and maintain:

```css
/* Primitives - raw values (don't expose in configurator) */
--color-brand-500: oklch(0.62 0.18 250);

/* Semantic - meaningful names (EXPOSE in configurator) */
--color-primary: var(--color-brand-500);
--color-primary-foreground: white;

/* Component - specific usage (auto-derived, don't expose) */
--ui-button-primary-bg: var(--color-primary);
```

#### Tokens to Expose in Configurator
- `--color-primary` / `--color-primary-foreground`
- `--color-secondary` / `--color-secondary-foreground`
- `--color-destructive` / `--color-destructive-foreground`
- `--color-background` / `--color-foreground`
- `--color-muted` / `--color-muted-foreground`
- `--color-accent` / `--color-accent-foreground`
- `--color-border` / `--color-input` / `--color-ring`
- `--radius-*` (single control, applies to all)

#### URL Encoding Strategy
```
Base config object:
{
  primary: "oklch(0.62 0.18 250)",
  primaryFg: "white",
  ...
}

Encode: JSON.stringify -> gzip -> base64url
Result: ?theme=H4sIAAAAA...

CLI accepts: npx lit-ui add button --tokens=H4sIAAAAA...
```

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

### v2.0 MVP: NPM + SSR - SHIPPED

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

### v3.0 MVP: Theme Customization - ACTIVE

Features to add for v3.0 milestone.

#### Phase 1: Visual Configurator (Priority: HIGH)

Must-have features:
1. Configurator page on docs site
2. Live preview of token changes
3. Color pickers for semantic tokens (primary, secondary, destructive)
4. Light/dark mode simultaneous editing
5. Border radius control
6. Copy-paste CSS output
7. 3-4 preset themes

#### Phase 2: CLI Integration (Priority: HIGH)

Must-have features:
1. `--tokens` parameter accepting encoded config
2. Token decoding and validation
3. `lit-ui-tokens.css` file generation
4. Integration with both `init` and `add` commands

#### Phase 3: Enhanced Features (Priority: MEDIUM)

Nice-to-have features:
1. Shareable theme URL
2. WCAG contrast validation
3. JSON export format

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
| NPM Package Distribution | HIGH | MEDIUM | P1 - v2.0 DONE |
| SSR Compatibility | HIGH | MEDIUM | P1 - v2.0 DONE |
| Custom Elements Manifest | MEDIUM | LOW | P1 - v2.0 |
| **Visual Theme Configurator** | HIGH | MEDIUM | **P1 - v3.0** |
| **CLI Token Parameter** | HIGH | MEDIUM | **P1 - v3.0** |
| **Token CSS Generation** | HIGH | LOW | **P1 - v3.0** |
| **Preset Themes** | MEDIUM | LOW | **P1 - v3.0** |
| **Shareable Theme URL** | MEDIUM | MEDIUM | **P2 - v3.0** |
| **WCAG Contrast Validation** | MEDIUM | MEDIUM | **P2 - v3.0** |
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
| **Theme Configurator** | Preset picker, copy CSS | None | Theme component props | Visual configurator + CLI integration (v3.0) |

### Competitive Positioning

**vs. ShadCN:** We offer framework agnosticism. ShadCN is excellent but React-only. Teams using Vue, Svelte, or multiple frameworks need our solution.

**vs. Shoelace/Web Awesome:** We offer the copy-source model. Shoelace is NPM-only; users can't easily customize. We offer both modes.

**vs. Radix:** We offer styled defaults. Radix is headless-only; great for design teams but requires significant styling work. We provide styled components with customization escape hatches.

**v3.0 Theme Configurator Positioning:** We offer a first-party visual configurator with CLI integration. shadcn has only preset themes (no live editing). Third-party tools like tweakcn exist but aren't integrated with the CLI. Our approach combines visual configuration with seamless CLI workflow.

**Unique Value Proposition:** Framework-agnostic components with ShadCN-style copy-source distribution, Tailwind compatibility, AND NPM package mode with SSR support, AND integrated theme configurator with CLI.

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

### v3.0 Theme Configurator Research

#### Official Documentation
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variable structure, oklch color format
- [shadcn/ui Themes Page](https://ui.shadcn.com/themes) - Preset themes, copy-paste pattern
- [Radix Themes Overview](https://www.radix-ui.com/themes/docs/theme/overview) - Theme component props, token access
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - @theme directive, CSS-first configuration

#### Third-Party Tools (Competitive Reference)
- [tweakcn](https://tweakcn.com/) - Live theme editor for shadcn/ui
- [Shadcn Studio](https://shadcnstudio.com/theme-generator) - Advanced theme editor
- [DesignRift](https://designrift.vercel.app/) - Radix Colors theme builder

#### Design Token Best Practices
- [The Problem with Design Tokens](https://andretorgal.com/posts/2025-01/the-problem-with-design-tokens) - Anti-patterns, complexity issues
- [Design Tokens & Theming Scalable UI 2025](https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025) - Layering approach
- [W3C Design Tokens Specification](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) - Stable spec reference

#### Accessibility
- [WCAG Color Contrast Accessibility Guide 2025](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025) - Contrast ratios, validation
- [Design.dev Contrast Checker](https://design.dev/tools/color-contrast-checker/) - WCAG 2.2 and APCA support

---
*Feature research for: lit-ui framework-agnostic component library*
*v1.0 researched: 2026-01-23*
*v2.0 NPM + SSR researched: 2026-01-24*
*v3.0 Theme Customization researched: 2026-01-25*
