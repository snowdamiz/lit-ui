# Feature Research

**Domain:** Framework-agnostic component library (Lit.js web components)
**Researched:** 2026-01-23 (v1.0), 2026-01-24 (v2.0 NPM + SSR), 2026-01-26 (v4.0 Form Inputs)
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
- [Cleanest Trick for Autogrowing Textareas (CSS-Tricks)](https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/)
- [Auto-Growing Inputs and Textareas (CSS-Tricks)](https://css-tricks.com/auto-growing-inputs-textareas/)
