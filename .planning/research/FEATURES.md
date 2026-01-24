# Feature Research

**Domain:** Framework-agnostic component library (Lit.js web components)
**Researched:** 2026-01-23
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

### Dependency Notes

- **Accessibility requires Keyboard + Focus:** Cannot have a11y without proper keyboard nav and focus management. These are foundational.
- **Dialog requires Focus Trap:** Modal dialogs MUST trap focus; this is a WCAG requirement, not optional.
- **Tailwind conflicts with Deep Shadow DOM:** This is a critical architecture decision. Options: (1) Use light DOM, (2) Inject styles via constructable stylesheets, (3) Use `::part()` for limited styling. Research suggests approach (2) with Twind or similar runtime generation.
- **Copy-Source and NPM can coexist:** ShadCN model; CLI copies source, or users install package for convenience.

## MVP Definition

### Launch With (v1)

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

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Input Component** - trigger: feedback that forms are common use case
- [ ] **Select/Dropdown** - trigger: composite keyboard navigation validated in Dialog
- [ ] **Tooltip** - trigger: low complexity, high demand
- [ ] **Checkbox/Radio** - trigger: form use cases validated
- [ ] **Card Component** - trigger: layout primitive requests
- [ ] **NPM Package Distribution** - trigger: users want auto-updates
- [ ] **More Themes** - trigger: customization requests beyond light/dark

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Data Table** - defer: complex, specialized libraries do it better
- [ ] **Date Picker** - defer: calendar logic is complex; use temporal libraries
- [ ] **File Upload** - defer: highly app-specific
- [ ] **Rich Text Editor** - defer: massive complexity
- [ ] **Charts** - defer: Chart.js, D3 exist
- [ ] **Figma Plugin** - defer: requires design tooling expertise
- [ ] **Headless Mode** - defer: doubles maintenance burden
- [ ] **Animation Library** - defer: CSS transitions sufficient for v1

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Button Component | HIGH | LOW | P1 |
| Dialog Component | HIGH | MEDIUM | P1 |
| Accessibility (WCAG 2.1 AA) | HIGH | HIGH | P1 |
| CLI Copy-Source Mode | HIGH | MEDIUM | P1 |
| Tailwind Integration | HIGH | HIGH | P1 |
| TypeScript Support | HIGH | LOW | P1 |
| Dark/Light Theme | MEDIUM | LOW | P1 |
| Documentation | HIGH | MEDIUM | P1 |
| Framework Agnostic Verification | HIGH | MEDIUM | P1 |
| Input Component | HIGH | LOW | P2 |
| Select/Dropdown | HIGH | HIGH | P2 |
| Loading States | MEDIUM | LOW | P2 |
| Animation System | MEDIUM | MEDIUM | P2 |
| NPM Package Mode | MEDIUM | LOW | P2 |
| SSR Compatibility | MEDIUM | HIGH | P3 |
| Figma Kit | LOW | HIGH | P3 |
| Headless Mode | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

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
| **SSR** | Next.js focused | Requires setup | React-focused | Declarative Shadow DOM (planned) |
| **Dark Mode** | Built-in | Built-in | User handles | Built-in with prefers-color-scheme |
| **Bundle Size** | Zero runtime (copy-paste) | ~60KB for all | Small per-component | Minimal (Lit ~5KB + component) |

### Competitive Positioning

**vs. ShadCN:** We offer framework agnosticism. ShadCN is excellent but React-only. Teams using Vue, Svelte, or multiple frameworks need our solution.

**vs. Shoelace/Web Awesome:** We offer the copy-source model. Shoelace is NPM-only; users can't easily customize. We offer both modes.

**vs. Radix:** We offer styled defaults. Radix is headless-only; great for design teams but requires significant styling work. We provide styled components with customization escape hatches.

**Unique Value Proposition:** Framework-agnostic components with ShadCN-style copy-source distribution and Tailwind compatibility.

## Sources

### Component Library Research
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

---
*Feature research for: lit-ui framework-agnostic component library*
*Researched: 2026-01-23*
