# Feature Research

**Domain:** Framework-agnostic component library (Lit.js web components)
**Researched:** 2026-01-23 (v1.0), 2026-01-24 (v2.0 NPM + SSR), 2026-01-26 (v4.0 Form Inputs), 2026-01-30 (v4.3 Date/Time Components)
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

---

## v4.0 Form Inputs Feature Research

**Researched:** 2026-01-26
**Focus:** Input and Textarea components for form inputs
**Confidence:** HIGH (verified across shadcn/ui, Radix UI, MUI, Chakra UI, Headless UI documentation)

### Input Component Features

#### Table Stakes (Must Have)

Features users expect from any modern Input component. Missing these makes the component feel incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Core input types** | Basic form functionality | LOW | None | text, email, password, number, search - the five most common types |
| **Placeholder text** | Standard HTML attribute, universally expected | LOW | None | Must persist label separately (placeholder-as-label is an anti-pattern) |
| **Disabled state** | Form elements need disable capability | LOW | Existing pattern | Visual indication + `aria-disabled`, match Button's existing pattern |
| **Size variants (sm/md/lg)** | Consistent with existing Button sizing | LOW | Existing pattern | T-shirt sizes matching `--ui-input-padding-{size}` tokens |
| **Focus ring styling** | Visual feedback for keyboard navigation | LOW | Core styles | Inner glow pattern matching Button's `box-shadow: inset 0 0 0 2px` |
| **Error state visual** | Invalid input needs clear feedback | LOW | None | Red border, shake animation optional, `aria-invalid="true"` |
| **Form participation** | Native form submission via ElementInternals | MEDIUM | @lit-ui/core | `formAssociated = true`, `setValidity()`, `setFormValue()` |
| **Native validation attributes** | HTML5 validation: required, minlength, maxlength, pattern | MEDIUM | None | Expose via properties, sync to internal `<input>` element |
| **Label association** | Accessibility requirement | LOW | None | Via `aria-labelledby` or internal `<label>` with `for` attribute |
| **Value binding** | Two-way data flow | LOW | None | `value` property, `input` and `change` events |
| **Autocomplete support** | Browser autofill integration | LOW | None | Pass through `autocomplete` attribute to internal input |
| **Read-only state** | Distinct from disabled (still focusable) | LOW | None | `readonly` attribute, different visual treatment |
| **Dark mode support** | Expected in 2026 | LOW | Existing system | `:host-context(.dark)` pattern from Button/Dialog |
| **SSR compatibility** | Works with Next.js, Astro | MEDIUM | @lit-ui/ssr | `isServer` guards for `attachInternals()`, Declarative Shadow DOM |

#### Differentiators (Competitive Advantage)

Features that set LitUI Input apart from alternatives.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Password visibility toggle** | Built-in eye icon without extra component | MEDIUM | None | Accessible button with `aria-pressed`, `aria-controls` |
| **Search clear button** | "X" icon to clear search input | LOW | None | Appears when value is non-empty, keyboard accessible |
| **Prefix/suffix slots** | Icons, text, or buttons alongside input | MEDIUM | None | Named slots: `prefix`, `suffix` - similar to shadcn's InputGroup |
| **Character counter** | Visual count for maxlength fields | LOW | None | `${current}/${max}` display, `aria-describedby` for screen readers |
| **Inline validation timing** | Validate on blur, not on every keystroke | LOW | None | Follows UX best practice: validate after field completion |
| **Custom validation messages** | Override default browser messages | LOW | None | `validationMessage` property, localization-friendly |
| **OKLCH-based theming** | Consistent with existing theme system | LOW | Existing system | `--ui-input-*` CSS custom properties |
| **Auto-contrast text** | Text color adjusts based on background | LOW | Existing pattern | Copy Button's `oklch(from var(--_bg) ...)` technique |
| **Loading state** | Spinner during async validation | MEDIUM | None | `loading` property, pulsing dots matching Button |

#### Input Types to Support

Based on shadcn, MUI, and Chakra UI patterns:

| Type | Built-in Validation | Mobile Keyboard | Special Features | Priority |
|------|---------------------|-----------------|------------------|----------|
| **text** | None | Standard | Default type | P0 |
| **email** | Format validation | Email keyboard (@, .com) | `multiple` attribute support | P0 |
| **password** | None | Standard (hidden) | Visibility toggle slot | P0 |
| **number** | min/max/step | Numeric keypad | Spinner controls optional | P0 |
| **search** | None | Search keyboard | Clear button, rounded style option | P0 |
| **tel** | None (varies by country) | Phone keypad | Pattern attribute for format | P1 |
| **url** | Format validation | URL keyboard | Protocol prefix hint | P1 |

**Note:** MUI recommends against `type="number"` due to UX issues (allows e, +, -, .). Consider a separate NumberInput component later for robust number handling.

---

### Textarea Component Features

#### Table Stakes (Must Have)

Features users expect from any modern Textarea component.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Multi-line text input** | Core purpose of textarea | LOW | None | Native `<textarea>` internally |
| **Rows/cols control** | Standard HTML attributes | LOW | None | `rows` property with sensible default (3-4) |
| **Resize control** | Users expect to resize | LOW | None | `resize` property: 'none', 'vertical', 'horizontal', 'both' |
| **Placeholder text** | Standard expectation | LOW | None | Same handling as Input |
| **Disabled state** | Form elements need disable capability | LOW | Existing pattern | Match Input's disabled styling |
| **Size variants** | Consistent sizing system | LOW | Existing pattern | sm/md/lg matching Input |
| **Focus ring styling** | Visual feedback | LOW | Core styles | Match Input's focus ring |
| **Error state visual** | Invalid input feedback | LOW | None | Match Input's error styling |
| **Form participation** | Native form submission | MEDIUM | @lit-ui/core | `setFormValue()` with textarea value |
| **Native validation** | required, minlength, maxlength | MEDIUM | None | Standard HTML5 validation |
| **Label association** | Accessibility | LOW | None | Same pattern as Input |
| **Value binding** | Two-way data flow | LOW | None | `value` property, events |
| **Dark mode support** | Expected in 2026 | LOW | Existing system | `:host-context(.dark)` |
| **SSR compatibility** | Framework support | MEDIUM | @lit-ui/ssr | Same pattern as Input |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Auto-resize** | Textarea grows with content | MEDIUM | None | CSS `field-sizing: content` with fallback for Safari/Firefox |
| **Character counter** | Visual count with limit | LOW | None | `${current}/${max}` display, `aria-describedby` |
| **Min/max rows** | Auto-resize with bounds | MEDIUM | None | `minRows`, `maxRows` properties for controlled growth |
| **Submission on Enter** | Optional behavior for chat-like UIs | LOW | None | `submitOnEnter` property, Shift+Enter for newline |

---

### Validation System Features

#### Table Stakes (Must Have)

Features for the validation system shared by Input and Textarea.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| **Required validation** | Field must have value | LOW | `valueMissing` validity state |
| **Pattern validation** | Regex pattern matching | LOW | `patternMismatch` validity state |
| **Length validation** | min/max character limits | LOW | `tooShort`, `tooLong` validity states |
| **Email format validation** | Built-in for email type | LOW | `typeMismatch` validity state |
| **ValidityState exposure** | Access to validation state | LOW | `validity` property returning ValidityState |
| **Validation message** | Accessible error text | LOW | `validationMessage` property |
| **checkValidity()** | Programmatic validation check | LOW | Returns boolean, doesn't show UI |
| **reportValidity()** | Show validation UI | LOW | Returns boolean, shows browser UI |
| **setCustomValidity()** | Custom error messages | LOW | Allows localization, custom rules |
| **Form-level validation** | Works with form's `novalidate` | LOW | Respects form's validation settings |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Async validation** | Server-side validation support | MEDIUM | Return Promise from custom validator |
| **Validation timing control** | Choose when to validate | LOW | `validateOn`: 'blur', 'input', 'submit' |
| **Custom validators** | User-defined validation functions | MEDIUM | `validator` property accepting function |

---

### Visual States Feature Matrix

Comprehensive visual states for Input and Textarea:

| State | Border | Background | Text | Icon | Notes |
|-------|--------|------------|------|------|-------|
| **Default** | `--ui-input-border` | `--ui-input-bg` | `--ui-input-text` | None | Resting state |
| **Focus** | Ring inset | Same | Same | None | Inner glow matching Button |
| **Hover** | Slightly darker | Same | Same | None | Subtle feedback |
| **Disabled** | Muted | Muted | Muted | None | `opacity: 0.5`, `cursor: not-allowed` |
| **Read-only** | Same | Slightly muted | Same | None | Focusable but not editable |
| **Error** | `--ui-color-destructive` | Same | Same | Error icon optional | `aria-invalid="true"` |
| **Success** | `--ui-color-success` | Same | Same | Check icon optional | Post-validation success |
| **Loading** | Same | Same | Same | Spinner | During async validation |

---

### Form Inputs Anti-Features (Do NOT Build)

Features to deliberately avoid for Input and Textarea.

| Anti-Feature | Why Requested | Why Problematic | What to Do Instead |
|--------------|---------------|-----------------|-------------------|
| **Integrated label component** | "Convenience" | Breaks composition, forces specific layout | Use separate Label component or slot, let users compose |
| **Built-in form library integration** | "Works with React Hook Form / Formik" | Framework-specific, maintenance burden | Expose standard events and validity API; works with any library |
| **Automatic error message display** | "Show errors automatically" | Opinionated about placement, styling | Emit validation events; let users place error messages |
| **Input masking built-in** | "Format phone numbers, dates" | Complex, many edge cases, better as separate utility | Recommend use-mask-input or similar; keep component simple |
| **Debounced validation** | "Don't validate on every keystroke" | Over-engineering; blur validation is simpler | Validate on blur by default; users can debounce in their handlers |
| **Rich text / markdown support** | "Textarea should support formatting" | Completely different component; massive scope creep | Build separate RichTextEditor component if needed |
| **File input styling** | "Style file inputs consistently" | File inputs are notoriously hard to style consistently | Keep `type="file"` as-is or build separate FileUpload component |
| **Date/time input types** | "Support date, time, datetime-local" | Browser support varies wildly; better as DatePicker component | Defer to dedicated DatePicker component with consistent UX |
| **Color input type** | "Support color picker" | Very different UX; better as ColorPicker component | Defer to dedicated ColorPicker component |
| **Range input type** | "Support sliders" | Different component entirely | Build separate Slider component |
| **Floating labels** | "Material Design style" | Animation complexity, accessibility concerns, placeholder disappears | Use fixed labels above input; clearer for users |
| **Input icons library** | "Built-in icons" | Bundle size, icon preference varies | Users provide icons via slots; document common patterns |

---

### Feature Dependencies on Existing Code

| New Feature | Depends On | Already Exists? | Notes |
|-------------|------------|-----------------|-------|
| ElementInternals pattern | Button implementation | YES | Copy `attachInternals()` pattern with `isServer` guard |
| Size variants (sm/md/lg) | Core design tokens | YES | Use existing `--ui-*-padding-*` pattern |
| Focus ring styling | Button focus style | YES | Copy `box-shadow: inset 0 0 0 2px` pattern |
| Dark mode | `:host-context(.dark)` pattern | YES | Copy from Button/Dialog |
| Error state colors | Theme system | YES | Use existing `--ui-color-destructive` |
| Loading spinner | Button spinner | YES | Copy `.spinner` CSS from Button |
| Tailwind integration | TailwindElement base class | YES | Extend `TailwindElement` from @lit-ui/core |
| SSR support | `isServer` guard pattern | YES | Same pattern as Button's `attachInternals()` |
| CSS custom properties | Theme system | YES | Follow `--ui-input-*` naming convention |

---

### MVP Feature Scope for v4.0

Based on research, prioritized features for v4.0 MVP:

#### Phase 1: Core Input

| Feature | Complexity | Status |
|---------|------------|--------|
| Input component with text, email, password, number, search types | MEDIUM | To build |
| Size variants (sm/md/lg) | LOW | To build |
| Disabled, read-only states | LOW | To build |
| Focus ring, error state visuals | LOW | To build |
| Form participation (ElementInternals) | MEDIUM | To build |
| Native validation (required, minlength, maxlength, pattern) | MEDIUM | To build |
| Value binding, events | LOW | To build |
| Dark mode, SSR support | LOW | To build |

#### Phase 2: Core Textarea

| Feature | Complexity | Status |
|---------|------------|--------|
| Textarea component | MEDIUM | To build |
| Rows control, resize property | LOW | To build |
| Same states as Input | LOW | To build |
| Form participation | MEDIUM | To build |
| Native validation | MEDIUM | To build |

#### Phase 3: Differentiators (Optional for MVP)

| Feature | Complexity | Status |
|---------|------------|--------|
| Password visibility toggle | MEDIUM | Optional |
| Search clear button | LOW | Optional |
| Prefix/suffix slots | MEDIUM | Optional |
| Character counter | LOW | Optional |
| Auto-resize textarea | MEDIUM | Optional |

---

### Sources

**shadcn/ui Documentation:**
- [Input Component](https://ui.shadcn.com/docs/components/input)
- [Textarea Component](https://ui.shadcn.com/docs/components/textarea)
- [Form Integration](https://ui.shadcn.com/docs/components/form)

**Radix UI Primitives:**
- [Form Component](https://www.radix-ui.com/primitives/docs/components/form)

**MUI (Material UI):**
- [TextField Component](https://mui.com/material-ui/react-text-field/)
- [TextField API](https://mui.com/material-ui/api/text-field/)

**Chakra UI:**
- [Input Component](https://chakra-ui.com/docs/components/input)

**Headless UI:**
- [Input Component](https://headlessui.com/react/input)

**MDN Web Docs:**
- [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [ElementInternals.setValidity()](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity)
- [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
- [HTML Input Types](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input)

**Web Component Form Participation:**
- [Custom Forms with Web Components and ElementInternals (DEV)](https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj)
- [ElementInternals and Form-Associated Custom Elements (WebKit)](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)
- [Creating Custom Form Controls with ElementInternals (CSS-Tricks)](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/)
- [More Capable Form Controls (web.dev)](https://web.dev/articles/more-capable-form-controls)

**UX Best Practices:**
- [Form Validation UX (Smashing Magazine)](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)
- [Inline Form Validation (Baymard Institute)](https://baymard.com/blog/inline-form-validation)
- [Sign-in Form Best Practices (web.dev)](https://web.dev/articles/sign-in-form-best-practices)
- [12 Form UI/UX Design Best Practices 2026](https://www.designstudiouiux.com/blog/form-ux-design-best-practices/)

**Accessibility:**
- [Accessible Password Reveal Input (Make Things Accessible)](https://www.makethingsaccessible.com/guides/make-an-accessible-password-reveal-input/)
- [Password Forms Accessibility (Medium)](https://medium.com/kiipco/password-creation-3-ways-to-make-it-accessible-bc8f2b53b7ee)

**Auto-resize Textarea:**
- [Cleanest Trick for Autogrowing Textareas (CSS-Tricks)](https://www.css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/)
- [Auto-Growing Inputs and Textareas (CSS-Tricks)](https://css-tricks.com/auto-growing-inputs-textareas/)

---

## v4.3 Date/Time Components Feature Research

**Researched:** 2026-01-30
**Focus:** Calendar, Date Picker, Date Range Picker, and Time Picker components
**Confidence:** MEDIUM (WebSearch verified with official sources)

### Calendar Display Features

#### Table Stakes (Must Have)

Features users expect from any calendar component. Missing these makes the component feel incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Month grid view** | Users expect calendar layout to see days of week | LOW | None | Standard 7-column grid with weekday headers |
| **Today indicator** | Users need to know current date for reference | LOW | None | Visual highlight on today's date with `aria-current="date"` |
| **Selected date highlight** | Users must see which date is selected | LOW | None | Distinct visual style (filled circle, bold, different background) |
| **Month navigation** | Users need to move between months | LOW | None | Previous/next buttons with descriptive labels |
| **Year navigation** | Users selecting dates far from today need year jumps | MEDIUM | None | Month/year dropdowns or decade view |
| **Weekday headers** | Users need day-of-week context | LOW | None | Abbreviated names (Mon, Tue, Wed) |
| **Keyboard navigation** | WCAG 2.1 Level A requirement | MEDIUM | None | Arrow keys, Home/End, Page Up/Down, `role="application"` |
| **Screen reader announcements** | Accessibility requirement | HIGH | None | Live region feedback for month changes, selections |
| **Minimum/maximum date constraints** | Prevent invalid selections (e.g., past dates, booking cutoffs) | LOW | None | Visual disabled state + keyboard skip |
| **Disabled dates** | Business logic (weekends, holidays, unavailable slots) | MEDIUM | None | Grayed out, not interactive, with reason in aria-label |
| **First day of week localization** | International users expect local conventions | MEDIUM | None | Sunday (US) vs Monday (EU) based on locale |
| **Month/day names localization** | International users need native language | LOW | None | `Intl.DateTimeFormat` for localized names |
| **Dark mode support** | Expected in 2026 | LOW | Existing system | `:host-context(.dark)` pattern from other components |
| **SSR compatibility** | Works with Next.js, Astro | MEDIUM | @lit-ui/ssr | `isServer` guards, Declarative Shadow DOM |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Multiple month display** | Power users see wider date range | MEDIUM | None | 2-3 month grid for booking systems |
| **Decade/century view** | Faster year navigation for distant dates | MEDIUM | None | Year grid for selecting birth years |
| **Custom date cell rendering** | Developers can add badges, indicators, icons | HIGH | None | Slot API for date cells |
| **Animation on month change** | Polished feel | MEDIUM | None | Slide or fade transitions, respect `prefers-reduced-motion` |
| **Week row selection** | Select entire week at once | MEDIUM | None | Click week number to select all days |
| **Keyboard shortcuts** | Power user efficiency | MEDIUM | None | "T" for today, "D" for this week |
| **Touch gesture support** | Swipe to change months on mobile | MEDIUM | None | Natural mobile interaction |
| **Week numbers (optional)** | Some regions (EU) require week numbers | MEDIUM | None | ISO 8601 week numbers, locale-dependent |
| **Responsive layout** | Adapts to screen size | LOW | None | Full grid on desktop, compact on mobile |

#### Calendar Anti-Features (Do NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **HTML table for calendar grid** | Screen readers announce "column 2 row 2" noise, requires `role="presentation"` workaround | Use CSS Grid or Flexbox (as 24a11y recommends) |
| **Single-letter keyboard shortcuts** | Conflicts with screen reader navigation (e.g., "B" for buttons) | Use multi-key shortcuts or none at all |
| **Auto-popup on page load** | Disruptive, users may not be ready to select | Open on user action (click, focus, Enter key) |
| **Year dropdown only** | Scrolling through 100 years for birthdate is terrible | Allow year typing or decade view |
| **Fixed MM/DD/YYYY format for international** | Ambiguity causes errors (10/11 = Nov 10 or Oct 11?) | Use locale formats or spell month names |

---

### Date Picker Features

#### Table Stakes (Must Have)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Input field with formatted display** | Users see selected date in familiar format | LOW | None | Supports typing and parsing |
| **Calendar popup trigger** | Visual indicator that picker is available | LOW | Dialog component | Calendar icon or field focus |
| **Text input support** | Fastest way to enter known dates | MEDIUM | None | Parse multiple formats (dashes, slashes, dots) |
| **Date format clarity** | MM/DD/YYYY vs DD/MM/YYYY ambiguity causes errors | MEDIUM | None | Spell month name or use labeled fields for international audiences |
| **Form integration** | Must work with existing form system | LOW | @lit-ui/core | `ElementInternals` like existing Input component |
| **Validation feedback** | Users need error messages for invalid dates | LOW | None | Inline error, aria-invalid |
| **Placeholder or helper text** | Users need to know expected format | LOW | None | "YYYY-MM-DD" or localized format |
| **Clear button** | Users need way to reset selection | LOW | None | X icon or clear button |
| **Focus management** | Accessibility requirement | MEDIUM | Dialog component | Trap focus in popup, return to input on close |
| **Escape key closes** | Standard keyboard pattern | LOW | Dialog component | Expected behavior for popups |
| **Click outside closes** | Standard UI pattern | LOW | Dialog component | Backdrop click detection |
| **Calendar popup** | Visual date selection | LOW | Calendar component | Uses Calendar component in popover |
| **Dark mode support** | Expected in 2026 | LOW | Existing system | `:host-context(.dark)` pattern |
| **SSR compatibility** | Framework support | MEDIUM | @lit-ui/ssr | Same pattern as Input |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Natural language parsing** | "tomorrow", "next week" parsing | HIGH | None | Date-fns or similar library |
| **Quick presets** | One-click common dates (Today, Tomorrow, Next Week) | LOW | None | Buttons above calendar |
| **Date format auto-detection** | Accept any format user types | MEDIUM | None | Parse and validate on input |
| **Inline calendar mode** | Always-visible calendar (no popup) | LOW | None | For dashboard/filter contexts |
| **Custom date formatting** | Display as "Jan 15", "15 Jan", etc. | MEDIUM | None | Format prop with `Intl.DateTimeFormat` |
| **Min/max date indicators** | Show users why dates are disabled | LOW | None | Tooltip or subtitle on disabled dates |
| **Date range presets** | "Last 7 days", "This month" buttons | LOW | None | For filter contexts |
| **Custom validation** | Developer-defined business rules | HIGH | None | Validator function prop |

#### Date Picker Anti-Features (Do NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Strict format enforcement** | Priceline rejects "9-3-17" but accepts "09/08/17" - confusing | Accept dashes, slashes, dots, parse intelligently |
| **Shift date ranges in two-calendar view** | NNG: Southwest shifts return month when selecting departure - confusing | Keep both calendars showing same range |
| **Required special characters** | Users shouldn't have to type "/" or "-" | Auto-format after user types numbers |
| **Calendar-only without text input** | NNG: "typing is fastest" for distant dates | Always support both input methods |
| **Infinite scroll for dates** | Todoist-style scrolling is tedious for distant dates | Calendar picker + text input combo |
| **Hidden format requirements** | Priceline error: no format hints before submit | Show expected format in placeholder or helper text |

---

### Date Range Picker Features

#### Table Stakes (Must Have)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Start/end date selection** | Core purpose of range picker | LOW | Date Picker | First click sets start, second sets end |
| **Range highlighting** | Users need visual feedback for selected range | MEDIUM | None | Background color between start and end dates |
| **Two calendar display** | Best for ranges spanning months | MEDIUM | None | Side-by-side months (NNG recommends) |
| **Hover preview** | Users see potential range before selecting end date | MEDIUM | None | Highlight from start date to hovered date |
| **Start date visual distinction** | Users need to know which end is which | LOW | None | Different style than end date |
| **End date visual distinction** | Users need to know which end is which | LOW | None | Different style than start date |
| **Swap start/end if out of order** | Users might click end date first | MEDIUM | None | Auto-correct or show error |
| **Minimum range duration** | Business logic (e.g., 3-night minimum) | LOW | None | Validation on selection |
| **Maximum range duration** | Business logic (e.g., max 30-day range) | LOW | None | Validation on selection |
| **Range constraints** | Start must be before end, no past dates | LOW | None | Disable invalid dates, validate on blur |
| **Clear range button** | Users need way to reset both dates | LOW | None | Clear both fields |
| **Form integration** | Must work with existing form system | LOW | @lit-ui/core | `ElementInternals` for range values |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Defined range presets** | "Last 30 days", "This quarter" one-click | LOW | None | Common in analytics dashboards |
| **Drag to select range** | More intuitive than click-click | HIGH | None | Mouse down, drag, mouse up |
| **Range comparison mode** | Compare two date ranges | VERY HIGH | None | "Compare to previous period" |
| **Exclusion zones** | Block out holidays within range | MEDIUM | None | Visual indicators for excluded dates |
| **Range duration display** | "5 days selected" feedback | LOW | None | Helps users verify selection |
| **Split view with sticky calendars** | Large ranges remain visible | MEDIUM | None | Calendars stay visible while scrolling |

#### Date Range Picker Anti-Features (Do NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Separate date pickers for start/end** | Harder to see relationship between dates | Single unified component with two calendars |
| **Auto-advance both calendars** | Confusing when month shifts unexpectedly | Keep view stable until user navigates |
| **No range preview before selection** | Users can't see what they're selecting | Hover state showing potential range |
| **Allow end date before start date** | Invalid business logic, requires validation | Prevent selection, show error, or auto-swap |

---

### Time Picker Features

#### Table Stakes (Must Have)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Hour input** | Core time component | LOW | None | 12-hour or 24-hour based on locale |
| **Minute input** | Core time component | LOW | None | Typically 15 or 30-minute intervals for bookings |
| **AM/PM indicator (12-hour)** | Required for 12-hour format | LOW | None | Clear toggle, not subtle dropdown |
| **24-hour format support** | International audiences expect it | MEDIUM | None | Toggle or locale-based |
| **Clock face or dropdown** | Visual time selection | MEDIUM | None | Clock face (mobile) vs dropdowns (desktop) |
| **Time zone awareness** | Users booking across time zones need clarity | HIGH | None | Show local time, optionally show timezone |
| **Time validation** | Prevent impossible times | LOW | None | End time after start time |
| **Quick time presets** | Efficiency for common times | LOW | None | "Morning", "Afternoon", "Evening" buttons |
| **"Now" button** | Users expect current time option | LOW | None | Quickly select current time |
| **Keyboard navigation** | Arrow keys to adjust hours/minutes | MEDIUM | None | Up/down arrows, Enter to confirm |
| **Form integration** | Must work with existing form system | LOW | @lit-ui/core | `ElementInternals` for time values |

#### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Time range slider** | Visual duration selection | MEDIUM | None | Drag handles for start/end times |
| **Business hours highlighting** | Show 9-5 differently from evenings | LOW | None | Visual distinction for availability |
| **Time zone conversion** | Show "2 PM EST (11 AM PST)" | HIGH | None | Multi-timezone display |
| **Smart time suggestions** | Suggest available slots based on context | HIGH | None | Integration with booking systems |
| **Recurring time selection** | "Every Monday at 2 PM" | VERY HIGH | None | Complex recurrence rules |
| **Voice input support** | "Schedule for 3 PM tomorrow" | VERY HIGH | None | Web Speech API integration |
| **Time precision control** | 15, 30, 60-minute intervals | LOW | None | Prop for granular control |
| **Mobile scrolling wheels** | iOS/Android native pattern | HIGH | None | Platform-specific patterns |

#### Time Picker Anti-Features (Do NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Ambiguous AM/PM toggle** | Reddit: Designs that flip midnight/noon are confusing | Use 24-hour format or very clear AM/PM labels |
| **Hidden time zone context** | Users assume local time, confusion when not | Explicitly show timezone if different from local |
| **Arbitrary time precision (seconds)** | Most use cases don't need seconds | Default to 15-minute intervals, optional precision |
| **Tiny tap targets on mobile** | Reddit: "mobile date/time UIs are notoriously bad" | Minimum 44px touch targets |
| **Clock face without AM/PM clarity** | Users confuse morning/evening times | Clear AM/PM indicator or 24-hour format |
| **Time picker scrolling wheels on desktop** | Unnatural with mouse, clunky interaction | Dropdowns or text input on desktop |

---

### Feature Dependencies on Existing Code

| New Feature | Depends On | Already Exists? | Notes |
|-------------|------------|-----------------|-------|
| ElementInternals pattern | Input/Textarea implementation | YES | Copy `attachInternals()` pattern with `isServer` guard |
| Focus management | Dialog focus trap | YES | Copy focus trap pattern for calendar popup |
| Dark mode | `:host-context(.dark)` pattern | YES | Copy from Button/Dialog/Input |
| Error state colors | Theme system | YES | Use existing `--ui-color-destructive` |
| Tailwind integration | TailwindElement base class | YES | Extend `TailwindElement` from @lit-ui/core |
| SSR support | `isServer` guard pattern | YES | Same pattern as Input's `attachInternals()` |
| CSS custom properties | Theme system | YES | Follow `--ui-calendar-*` naming convention |
| Form validation | Input/Textarea validation | YES | Use same ValidityState pattern |
| Size variants | Core design tokens | YES | Use existing `--ui-*-padding-*` pattern |

---

### MVP Feature Scope for v4.3

Based on research, prioritized features for v4.3 MVP:

#### Phase 1: Calendar Display

| Feature | Complexity | Status |
|---------|------------|--------|
| Month grid view with weekday headers | LOW | To build |
| Today indicator with `aria-current="date"` | LOW | To build |
| Selected date highlight | LOW | To build |
| Month navigation (previous/next) | LOW | To build |
| Year navigation (month/year dropdowns) | MEDIUM | To build |
| Keyboard navigation (arrows, Home/End, Page Up/Down) | MEDIUM | To build |
| Screen reader announcements (live region) | HIGH | To build |
| Min/max date constraints | LOW | To build |
| Disabled dates (weekends, holidays) | MEDIUM | To build |
| First day of week localization | MEDIUM | To build |
| Month/day names localization | LOW | To build |
| Dark mode, SSR support | LOW | To build |

#### Phase 2: Date Picker

| Feature | Complexity | Status |
|---------|------------|--------|
| Input field with formatted display | LOW | To build |
| Calendar popup trigger | LOW | To build |
| Text input support (parse multiple formats) | MEDIUM | To build |
| Date format clarity (spell month or labels) | MEDIUM | To build |
| Form integration (ElementInternals) | LOW | To build |
| Validation feedback | LOW | To build |
| Placeholder/helper text | LOW | To build |
| Clear button | LOW | To build |
| Focus management (trap in popup) | MEDIUM | To build |
| Escape key closes, click outside closes | LOW | To build |
| Calendar popup (uses Calendar component) | LOW | To build |

#### Phase 3: Date Range Picker

| Feature | Complexity | Status |
|---------|------------|--------|
| Start/end date selection | LOW | To build |
| Range highlighting | MEDIUM | To build |
| Two calendar display | MEDIUM | To build |
| Hover preview | MEDIUM | To build |
| Start/end visual distinction | LOW | To build |
| Swap start/end if out of order | MEDIUM | To build |
| Min/max range duration | LOW | To build |
| Range constraints | LOW | To build |
| Clear range button | LOW | To build |
| Form integration | LOW | To build |

#### Phase 4: Time Picker

| Feature | Complexity | Status |
|---------|------------|--------|
| Hour/minute inputs | LOW | To build |
| AM/PM indicator (12-hour) | LOW | To build |
| 24-hour format support | MEDIUM | To build |
| Clock face or dropdown | MEDIUM | To build |
| Time zone awareness | HIGH | To build |
| Time validation | LOW | To build |
| Quick time presets | LOW | To build |
| "Now" button | LOW | To build |
| Keyboard navigation | MEDIUM | To build |
| Form integration | LOW | To build |

#### Phase 5: Differentiators (Optional for MVP)

| Feature | Complexity | Status |
|---------|------------|--------|
| Quick presets (Today, Tomorrow, Next Week) | LOW | Optional |
| Natural language parsing | HIGH | Optional |
| Week numbers | MEDIUM | Optional |
| Decade/century view | MEDIUM | Optional |
| Custom date cell rendering | HIGH | Optional |
| Animation on month change | MEDIUM | Optional |
| Time zone conversion | HIGH | Optional |
| Voice input support | VERY HIGH | Optional |

---

### Mobile vs Desktop Patterns

#### Mobile Considerations

- **Tap targets**: Minimum 44px for all interactive elements
- **Scrolling pickers**: iOS-style wheels are native, users expect them
- **Single calendar**: Screen too small for two-calendar range view
- **Gestures**: Swipe to change months is expected
- **Native pickers**: Consider using `<input type="date">` and `<input type="time">` on mobile

#### Desktop Considerations

- **Keyboard shortcuts**: Power users expect arrow key navigation
- **Hover states**: Can show more information (tooltips, hover previews)
- **Two calendars**: Screen space allows side-by-side months
- **Text input**: Faster than clicking for precise dates

---

### Form Validation Behaviors

#### Shared Validation Patterns

- **Min/max dates**: Disable visually, prevent keyboard selection
- **Disabled dates**: Gray out, include reason in aria-label
- **Required field**: Show error on blur if empty
- **Invalid format**: Show inline error, suggest correct format
- **End before start**: Auto-swap or show error for range pickers
- **Future dates only**: Disable past dates for booking contexts
- **Past dates only**: Disable future dates for birthdate contexts

#### Validation Timing

- **On selection**: Prevent invalid clicks (disabled dates)
- **On blur**: Validate text input, show errors
- **On change**: Update form validity state
- **On submit**: Final validation before form submission

---

### Complexity Assessment Summary

| Component | Low Complexity | Medium Complexity | High Complexity |
|-----------|----------------|-------------------|------------------|
| **Calendar Display** | Month grid, today indicator, navigation | Keyboard nav, localization, disabled dates | Custom cell rendering, decade view |
| **Date Picker** | Input field, popup trigger, format display | Text parsing, validation, focus management | Natural language parsing |
| **Date Range Picker** | Start/end selection, basic highlighting | Two-calendar display, range constraints | Drag selection, comparison mode |
| **Time Picker** | Hour/minute inputs, AM/PM toggle | 24-hour format, intervals, time zones | Voice input, recurring selection |

---

### Sources

**Authoritative UX Research:**
- [Date-Input Form Fields: UX Design Guidelines - Nielsen Norman Group](https://www.nngroup.com/articles/date-input/) - HIGH confidence, authoritative UX research
- [A New Day: Making a Better Calendar - 24 Accessibility](https://www.24a11y.com/2018/a-new-day-making-a-better-calendar/) - HIGH confidence, accessibility expert
- [Time Picker UX: Best Practices, Patterns & Trends for 2025 - Eleken](https://www.eleken.co/blog-posts/time-picker-ux) - MEDIUM confidence, current UX patterns

**Accessibility Standards:**
- [Understanding SC 2.1.1: Keyboard - W3C WAI](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) - HIGH confidence, official WCAG guidelines
- [Date Picker Accessibility - USWDS](https://designsystem.digital.gov/components/date-picker/accessibility-tests/) - HIGH confidence, government design system
- [Understanding Guideline 2.1: Keyboard Accessible - W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-accessible.html) - HIGH confidence, official WCAG guidelines

**Design Systems:**
- [Material Design Date Pickers](https://m2.material.io/components/date-pickers) - HIGH confidence, official design system
- [Ant Design DatePicker](https://ant.design/components/date-picker/) - MEDIUM confidence, component library reference
- [AWS Cloudscape Date Range Picker](https://cloudscape.design/components/date-range-picker/) - MEDIUM confidence, component library reference

**Implementation References:**
- [React DayPicker - Disabling Dates](https://daypicker.dev/selections/disabling-dates) - MEDIUM confidence, implementation reference
- [ng-bootstrap Datepicker with i18n](https://ng-bootstrap.github.io/#/components/datepicker/overview#i18n) - MEDIUM confidence, internationalization patterns
- [Shadcn UI Date Picker](https://ui.shadcn.com/docs/components/date-picker) - MEDIUM confidence, implementation patterns
- [Shadcn UI Calendar](https://ui.shadcn.com/docs/components/radix/calendar) - MEDIUM confidence, component library reference

**Localization:**
- [VCalendar i18n Documentation](https://v2.vcalendar.io/i18n.html) - MEDIUM confidence, locale configuration
- [Date and Time Localization Guide - Lokalise](https://lokalise.com/blog/date-time-localization/) - MEDIUM confidence, localization best practices

**Mobile Patterns:**
- [Design Guidelines for Mobile Date-Pickers - UXDesign.cc](https://uxdesign.cc/design-guidelines-for-mobile-date-pickers-8e8d87026215) - MEDIUM confidence, mobile UX patterns

**Community Discussions:**
- [Date range picker visual feedback - daterangepicker.com](https://www.daterangepicker.com/) - LOW confidence, commercial examples only
- [jQuery DatePicker Disabled Dates - Telerik](https://www.telerik.com/kendo-jquery-ui/documentation/controls/datepicker/disabled-dates) - MEDIUM confidence, implementation patterns

---

### Open Questions for Implementation

1. **Date library**: Should we use date-fns, Day.js, or native `Intl` API for date manipulation?
2. **Calendar math**: How to handle month overflow, leap years, ISO week numbers?
3. **Time zones**: Should Time Picker support time zones or just local time?
4. **Mobile native inputs**: Should we use `<input type="date">` on mobile or custom picker everywhere?
5. **Form integration**: How do date/time components integrate with existing form validation system?
6. **SSR considerations**: Calendar rendering on server vs client, initial state hydration?

---

### Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table stakes features | HIGH | Verified against NNG, WAI-ARIA, Material Design |
| Accessibility requirements | HIGH | Official WCAG sources, 24a11y expert guidance |
| Anti-features | HIGH | NNG research, common pitfalls documented |
| Mobile patterns | MEDIUM | Some sources, but platform-specific guidance varies |
| Localization features | MEDIUM | WebSearch sources, but implementation patterns vary |
| Differentiator features | LOW-MEDIUM | Mostly WebSearch, limited official sources |

---

**Next steps:** This FEATURES.md should inform requirements definition for v4.3 milestone. Stack research (date libraries) and architecture research (component structure) should follow.
