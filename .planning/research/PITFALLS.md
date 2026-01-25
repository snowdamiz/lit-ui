# Pitfalls Research

**Domain:** Lit.js Framework-Agnostic Component Library with Tailwind
**Researched:** 2026-01-23
**Confidence:** HIGH (verified against official docs and multiple sources)

## Critical Pitfalls

### Pitfall 1: Tailwind CSS Fails Inside Shadow DOM

**What goes wrong:**
Tailwind utility classes don't work inside Shadow DOM components. Styles defined in the global stylesheet (compiled Tailwind CSS) cannot penetrate the shadow boundary. Components render without any styling, appearing broken or unstyled.

**Why it happens:**
Shadow DOM encapsulation prevents external stylesheets from affecting elements inside the shadow root. Tailwind's global CSS file exists in the light DOM's document head, completely isolated from shadow roots.

**How to avoid:**
1. **Constructable Stylesheets (Recommended):** Use `adoptedStyleSheets` API to share compiled Tailwind CSS across shadow roots without re-parsing:
   ```typescript
   import styles from './tailwind.css?inline';
   const sheet = new CSSStyleSheet();
   sheet.replaceSync(styles);
   // In component: this.shadowRoot.adoptedStyleSheets = [sheet];
   ```
2. **Build-time Scoping:** Use tools like `shadow-tailwind` to compile scoped Tailwind per component
3. **Consider Light DOM:** For maximum Tailwind compatibility, use `createRenderRoot() { return this; }` to skip Shadow DOM (sacrifices encapsulation)

**Warning signs:**
- Components render with correct HTML structure but no visual styling
- Tailwind classes visible in DevTools but styles not applied
- Dark mode/theme changes don't affect shadow DOM components

**Phase to address:**
Phase 1 (Foundation) - Must solve this before any component development begins. This is architectural and affects every component.

**Sources:**
- [Tailwind Shadow DOM Discussion #1935](https://github.com/tailwindlabs/tailwindcss/discussions/1935)
- [Tailwind v4 CSS Variables Discussion #15556](https://github.com/tailwindlabs/tailwindcss/discussions/15556)

---

### Pitfall 2: Tailwind v4 CSS Variables Use `:root` Not `:host`

**What goes wrong:**
Tailwind v4 generates CSS variables using the `:root` selector. Shadow DOM requires `:host` for these variables to be accessible. Color tokens, spacing scales, and theme values all break inside components.

**Why it happens:**
Tailwind v4 changed its architecture to be CSS-variable-first. The `:root` selector only applies to the document root, not shadow roots. This is a fundamental incompatibility with Shadow DOM.

**How to avoid:**
1. **Post-process CSS:** Transform `:root` to `:root, :host` in your build pipeline
2. **Use CSS Parts:** Expose `::part()` selectors for external theming
3. **Inject Variables:** Programmatically set CSS custom properties on shadow roots
4. **Consider Tailwind v3:** v3 with purged CSS may be more Shadow DOM friendly (but loses v4 benefits)

**Warning signs:**
- Colors render as fallback values or transparent
- Spacing utilities produce unexpected values
- Theme switching has no effect on web components

**Phase to address:**
Phase 1 (Foundation) - Must establish CSS variable strategy before components.

**Sources:**
- [Tailwind v4 Shadow DOM Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15556)

---

### Pitfall 3: Form Elements Don't Participate in Forms

**What goes wrong:**
Input elements inside Shadow DOM are invisible to parent `<form>` elements. FormData doesn't include shadow DOM inputs. Form validation doesn't trigger. Form submission excludes component values entirely.

**Why it happens:**
HTMLFormElement only discovers input elements in its own DOM tree. Shadow DOM creates a separate DOM tree that forms cannot traverse. This is by design (encapsulation) but breaks form interactivity.

**How to avoid:**
1. **Use ElementInternals API (Required):**
   ```typescript
   static formAssociated = true;

   constructor() {
     super();
     this.internals = this.attachInternals();
   }

   // Set form value
   this.internals.setFormValue(value);

   // Set validity
   this.internals.setValidity(flags, message, anchor);
   ```
2. **Implement lifecycle hooks:** `formResetCallback()`, `formDisabledCallback()`, `formStateRestoreCallback()`
3. **Always set `name` attribute** on form-associated components

**Warning signs:**
- Form submissions missing expected fields
- `form.elements` doesn't include your components
- Validation messages don't appear
- Reset button doesn't affect custom inputs

**Phase to address:**
Phase 2 (Component Development) - Any form-related component (inputs, buttons with type="submit") must implement this. Critical for Button and future Input components.

**Sources:**
- [Form-associated custom elements - Hjorthhansen](https://www.hjorthhansen.dev/shadow-dom-form-participation/)
- [ElementInternals API - Raymond Camden](https://www.raymondcamden.com/2023/05/24/adding-form-participation-support-to-web-components)
- [Smashing Magazine - Shadow DOM](https://www.smashingmagazine.com/2025/07/web-components-working-with-shadow-dom/)

---

### Pitfall 4: ARIA ID References Break Across Shadow Boundaries

**What goes wrong:**
`aria-labelledby`, `aria-describedby`, `aria-controls`, and similar attributes reference element IDs. IDs inside shadow DOM aren't visible from outside (and vice versa). Screen readers can't establish relationships, breaking accessibility.

**Why it happens:**
Shadow DOM scopes IDs locally. An ID inside a shadow root is only unique within that shadow root. ARIA attributes expecting document-wide ID references cannot resolve cross-boundary references.

**How to avoid:**
1. **Keep ARIA pairs together:** If using `aria-labelledby`, ensure both the referencing element and the target are in the same DOM (both in shadow or both in light)
2. **Use slots for labels:** Let consumers pass labels via slots, keeping label-input relationships in light DOM
3. **Inline labels:** Use `aria-label` (string) instead of `aria-labelledby` (ID reference) when possible
4. **Wait for AOM:** The Accessibility Object Model (AOM) will eventually allow direct element references, but it's not widely implemented yet

**Warning signs:**
- Screen readers announce elements without their labels
- Accessibility audits fail on `aria-labelledby` references
- Focus management breaks between components

**Phase to address:**
Phase 2 (Component Development) - Must be considered for every component, especially Dialog which requires `aria-labelledby` for the title.

**Sources:**
- [Shadow DOM and ARIA - Nolan Lawson](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)
- [Accessibility with ID Referencing - Cory Rylan](https://coryrylan.com/blog/accessibility-with-id-referencing-and-shadow-dom)
- [Shadow DOM Accessibility Conflict - Alice Boxhall](https://alice.pages.igalia.com/blog/how-shadow-dom-and-accessibility-are-in-conflict/)

---

### Pitfall 5: Event Retargeting Breaks Event Delegation

**What goes wrong:**
Events dispatched from within shadow DOM have their `event.target` changed to the host element when they cross the shadow boundary. External code trying to identify which element was clicked/interacted with gets the wrong target.

**Why it happens:**
Shadow DOM retargets events to preserve encapsulation. The browser doesn't want external code to know about internal structure. This is intentional but breaks common patterns like event delegation.

**How to avoid:**
1. **Use `event.composedPath()[0]`:** Get the original event target from the composed path
2. **Dispatch custom events:** Create semantic events (`sl-change`, `lit-ui-select`) instead of relying on native events
3. **Cache event.target immediately:** If debouncing, capture target before the debounce delay (target changes after propagation completes)
4. **Add `composed: true` to custom events:** Ensure custom events cross shadow boundaries

```typescript
this.dispatchEvent(new CustomEvent('lit-ui-change', {
  bubbles: true,
  composed: true,  // Crosses shadow boundary
  detail: { value: this.value }
}));
```

**Warning signs:**
- Click handlers report wrong elements
- Debounced handlers lose track of what was clicked
- Parent components can't distinguish which child triggered an event

**Phase to address:**
Phase 2 (Component Development) - Establish event naming conventions and patterns before building components.

**Sources:**
- [Lit Events Documentation](https://lit.dev/docs/components/events/)
- [Shadow DOM Events Guide](https://javascript.info/shadow-dom-events)
- [Event Propagation Deep Dive](https://pm.dartus.fr/blog/a-complete-guide-on-shadow-dom-and-event-propagation/)

---

### Pitfall 6: SSR Renders Empty Components (FOUC/LCP Issues)

**What goes wrong:**
Server-side rendered pages show empty custom element tags until JavaScript loads. This causes Flash of Unstyled Content (FOUC) and kills Largest Contentful Paint (LCP) scores when critical content is inside web components.

**Why it happens:**
Web components require JavaScript to render their shadow DOM. Without JS, the browser sees `<lit-ui-button>` as an unknown element and renders nothing (or just slots). Lit SSR exists but is experimental and complex.

**How to avoid:**
1. **Avoid web components for above-fold critical content** where LCP matters
2. **Use Declarative Shadow DOM (DSD):** Include shadow DOM HTML in server response (requires framework support)
3. **Progressive enhancement:** Ensure components have meaningful light DOM fallback content
4. **Use @lit-labs/ssr:** Experimental but functional for basic cases
5. **Consider hybrid approach:** SSR wrapper with hydrating web component

**Warning signs:**
- Page loads with invisible buttons/dialogs
- LCP scores significantly worse than framework alternatives
- Content visible only after JS executes

**Phase to address:**
Phase 3 (CLI/Distribution) - Must document SSR limitations clearly. Consider if your target users need SSR (ShadCN targets Next.js users who expect SSR).

**Sources:**
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/)
- [Lit SSR Authoring Guide](https://lit.dev/docs/ssr/authoring/)
- [Shoelace LCP Discussion](https://github.com/shoelace-style/shoelace/discussions/2025)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Shadow DOM entirely | Full Tailwind compatibility | No style encapsulation, global CSS conflicts | Only if all consumers control their own CSS |
| Inline all Tailwind in each component | No build complexity | Massive bundle size, duplicate CSS | Never at scale |
| Use `setTimeout` for timing | Quick fix for race conditions | Flaky tests, unpredictable behavior | Never - use `updateComplete` |
| Reflect all properties to attributes | Easy debugging in DevTools | Performance overhead, attribute bloat | Only for string/boolean config props |
| Skip form association | Faster development | Forms don't work, accessibility broken | Never for form-related components |
| Use legacy TypeScript decorators | More examples available | Future migration pain, larger output | Acceptable for now per Lit team recommendation |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| React (pre-19) | Passing objects as attributes | Use React 19+ which handles props correctly, or wrap components |
| Vue | Not configuring custom elements | Add `app.config.compilerOptions.isCustomElement` to avoid warnings |
| Svelte | Using camelCase props | Props must use lowercase/kebab-case due to Svelte bug with web components |
| Forms | Expecting `FormData` to include shadow inputs | Implement `ElementInternals` with `formAssociated = true` |
| Tailwind dark mode | Expecting `:root.dark` to work | Manually toggle class on shadow root or use CSS variables |
| Angular | Importing in wrong module | Add `CUSTOM_ELEMENTS_SCHEMA` to module |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-parsing Tailwind CSS per instance | Long initial paint, high memory | Use `adoptedStyleSheets` to share parsed CSS | 50+ component instances |
| Reflecting all properties | Slow updates, attribute churn | Only reflect config properties, not state | Components with frequent updates |
| Large shadow DOM trees | Slow renders, memory bloat | Flatten structure, use efficient selectors | Complex components with 100+ nodes |
| Not batching updates | Multiple re-renders per change | Let Lit batch, use `updateComplete` | Rapid state changes |
| Unbounded slot content | Memory leaks from detached nodes | Clear slots properly, use `slotchange` events | Dynamic slot content |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using `innerHTML` with user content | XSS attacks | Use Lit's `html` template literal which auto-escapes |
| Exposing internal structure via parts | CSS injection, structure attacks | Limit `::part()` exposure, validate external styles |
| Trusting slot content | Malicious HTML injection | Sanitize or validate slotted content if processing it |
| Reflecting sensitive data to attributes | Data exposure in DOM | Never reflect passwords, tokens, or PII |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state while JS loads | Invisible buttons, broken page | Use DSD or meaningful fallback content |
| Flash of unstyled custom elements | Janky, unprofessional appearance | Hide with `:not(:defined)` CSS until upgraded |
| Dialog without focus trap | Keyboard users escape dialog, get lost | Implement proper focus trapping with inert |
| Missing keyboard support | Inaccessible to keyboard users | Test tab order, add key handlers for interactions |
| Inconsistent event naming | Confusing API, hard to learn | Prefix all events (`lit-ui-*`), document clearly |

---

## "Looks Done But Isn't" Checklist

- [ ] **Button:** Often missing form participation (`type="submit"` doesn't submit) - verify `formAssociated` and `ElementInternals`
- [ ] **Button:** Often missing disabled state styling and functionality - verify `formDisabledCallback` works
- [ ] **Dialog:** Often missing focus trap - verify Tab key cycles within dialog
- [ ] **Dialog:** Often missing `aria-labelledby` (or it's broken cross-boundary) - verify screen reader announces title
- [ ] **Dialog:** Often missing backdrop click-to-close - verify `::backdrop` and click handler
- [ ] **Dialog:** Often missing ESC key handler - verify keyboard dismissal
- [ ] **Any component:** Often missing `:focus-visible` styles - verify keyboard focus is visible
- [ ] **Any component:** Often missing high contrast mode support - verify in Windows High Contrast
- [ ] **Form inputs:** Often missing validation states - verify `:invalid`, `:valid` pseudo-classes work
- [ ] **Tailwind:** Often missing dark mode - verify theme switching affects shadow DOM

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong Tailwind approach | HIGH | Rebuild CSS pipeline, update all components |
| Missing form association | MEDIUM | Add `formAssociated` to class, implement callbacks |
| Broken ARIA references | MEDIUM | Restructure to keep pairs together, add inline labels |
| Event naming inconsistency | HIGH | Breaking change for consumers, major version bump |
| SSR not working | LOW | Document limitation, provide workarounds |
| Performance issues at scale | MEDIUM | Audit `adoptedStyleSheets`, reduce reflections |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Tailwind in Shadow DOM | Phase 1 (Foundation) | Build a test component with Tailwind utilities, verify styles apply |
| CSS Variables (:root vs :host) | Phase 1 (Foundation) | Verify color/spacing tokens resolve inside shadow root |
| Form participation | Phase 2 (Button component) | Submit form containing custom button, verify FormData |
| ARIA ID references | Phase 2 (Dialog component) | Run axe-core audit, test with screen reader |
| Event retargeting | Phase 2 (First interactive component) | Add click handler in React/Vue parent, verify detail accessible |
| SSR/FOUC | Phase 3 (Documentation) | Document clearly, provide `:not(:defined)` CSS snippet |
| React 18 compatibility | Phase 3 (Framework testing) | Test in React 18 app, document wrapper requirement |
| TypeScript decorators | Phase 1 (Foundation) | Choose decorator strategy, configure tsconfig properly |

---

## Sources

### Official Documentation
- [Lit Events Documentation](https://lit.dev/docs/components/events/) - HIGH confidence
- [Lit SSR Authoring Guide](https://lit.dev/docs/ssr/authoring/) - HIGH confidence
- [Lit Reactive Properties](https://lit.dev/docs/components/properties/) - HIGH confidence

### GitHub Discussions
- [Tailwind Shadow DOM Discussion #1935](https://github.com/tailwindlabs/tailwindcss/discussions/1935) - MEDIUM confidence
- [Tailwind v4 CSS Variables #15556](https://github.com/tailwindlabs/tailwindcss/discussions/15556) - MEDIUM confidence
- [Shoelace LCP Performance #2025](https://github.com/shoelace-style/shoelace/discussions/2025) - MEDIUM confidence

### Community Resources
- [Shadow DOM and ARIA - Nolan Lawson](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) - MEDIUM confidence
- [Form-associated custom elements - Hjorthhansen](https://www.hjorthhansen.dev/shadow-dom-form-participation/) - MEDIUM confidence
- [Custom Elements Everywhere](https://custom-elements-everywhere.com/) - HIGH confidence (framework compatibility scores)
- [Shadow DOM Events Guide](https://pm.dartus.fr/blog/a-complete-guide-on-shadow-dom-and-event-propagation/) - MEDIUM confidence

### Framework Integration
- [React 19 Web Components Support](https://react.dev/blog/2024/12/05/react-19) - HIGH confidence
- [ShadCN/UI Architecture](https://ui.shadcn.com/docs) - HIGH confidence (for CLI/copy-source patterns)

---

# v2.0 NPM + SSR Pitfalls

**Focus:** Adding NPM package distribution and SSR to existing Lit 3.x + Tailwind v4 library
**Researched:** 2026-01-24
**Confidence:** HIGH (verified against official Lit docs and multiple sources)

This section covers pitfalls specific to the v2.0 milestone: adding NPM package mode and SSR compatibility to the existing copy-source library.

---

## Critical Pitfalls (NPM + SSR)

Issues that cause production failures, rewrites, or significant architectural changes.

---

### NPM-1: Bundling Before Publishing Causes Duplicate Lit Versions

**What happens:** Pre-bundling components includes Lit in the published package. When users install your package, npm cannot deduplicate Lit with their existing installation. This results in multiple Lit versions loading simultaneously, causing the "Multiple versions of Lit loaded" warning and potential runtime bugs.

**Warning signs:**
- Browser console shows: `window.litElementVersions`, `window.reactiveElementVersions`, or `window.litHtmlVersions` contain multiple entries
- Users report "Multiple versions of Lit loaded" warnings
- Lit-html templates behave unexpectedly or fail to update
- Package size unexpectedly large after `npm pack`

**Prevention:**
- Configure Vite/Rollup to externalize `lit` and all `@lit/*` packages
- In `vite.config.ts` library mode: `build.rollupOptions.external: ['lit', /^lit\//, /^@lit\//]`
- Keep `lit` as `peerDependency`, not `dependency`
- Never use bundler's "standalone" or "iife" output for NPM packages
- Test with `npm ls lit` in a consuming project to verify deduplication

**Phase to address:** NPM Package Build Configuration (early phase - foundational)

**Confidence:** HIGH - [Lit Publishing Docs](https://lit.dev/docs/tools/publishing/)

---

### NPM-2: Constructable Stylesheets Break SSR

**What happens:** The current TailwindElement uses `new CSSStyleSheet()` and `adoptedStyleSheets` which require DOM APIs unavailable during server rendering. Declarative Shadow DOM has no way to serialize constructable stylesheets.

**Warning signs:**
- `ReferenceError: CSSStyleSheet is not defined` during SSR
- Server renders empty shadow roots (no styles)
- Components flash unstyled then restyle on hydration (severe FOUC)
- Styles work in dev (client-only) but fail in production (SSR)

**Prevention:**
- Detect SSR environment: `typeof document === 'undefined'` or `typeof window === 'undefined'`
- For SSR: inline styles as `<style>` elements inside declarative shadow DOM template
- For CSR: continue using constructable stylesheets for performance (shared across instances)
- Use conditional logic pattern:
  ```typescript
  if (isServer) {
    // Return lit-html template with inline <style>
  } else {
    // Use adoptedStyleSheets
  }
  ```
- Test with `@lit-labs/ssr` before claiming SSR support

**Phase to address:** SSR Infrastructure (dedicated SSR phase - cannot be retrofitted easily)

**Confidence:** HIGH - [web.dev DSD article](https://web.dev/articles/declarative-shadow-dom), [Lit SSR Docs](https://lit.dev/docs/ssr/overview/)

---

### NPM-3: CSS @property Rules Don't Work in Shadow DOM

**What happens:** The codebase already extracts `@property` rules and injects them into the document. However, with SSR, the document-level injection happens in `connectedCallback` (client-side). Server-rendered components have no `@property` registration, causing Tailwind utilities like `shadow-*` and `ring-*` to break completely on initial render.

**Warning signs:**
- Box shadows and rings render as `none` or transparent on SSR pages
- Styles work after hydration but not on initial server render
- Tailwind v4 utilities that depend on `@property` (gradients, transforms, shadows) malfunction

**Prevention:**
- Include fallback values in all CSS that uses `@property`-dependent custom properties
- In `host-defaults.css`, ensure all `--tw-*` variables have explicit fallbacks
- For SSR, consider inlining the `@property` declarations in the rendered HTML's `<head>`
- Test SSR output with JavaScript disabled to catch missing fallbacks

**Phase to address:** SSR Styling (same phase as constructable stylesheets fix)

**Confidence:** HIGH - [Tailwind Shadow DOM Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16772)

---

### NPM-4: Hydration Module Load Order Causes Double Rendering

**What happens:** If component JavaScript loads before hydration support is installed, Lit creates new shadow roots instead of adopting server-rendered declarative shadow DOM. This causes duplicate content, flash of unstyled content, or "Shadow root cannot be created on a host which already hosts a shadow tree" errors.

**Warning signs:**
- Content appears, disappears, then reappears (double render)
- Console error: "Shadow root cannot be created on a host which already hosts a shadow tree"
- SSR'd content flickers or shifts significantly on page load
- Components work fine without SSR but break when server-rendered

**Prevention:**
- Load `@lit-labs/ssr-client/lit-element-hydrate-support.js` BEFORE any Lit imports
- In HTML: place hydrate support script tag before component bundles
- Use `defer` or dynamic imports to ensure correct load order
- Document this requirement clearly for library consumers
- Example:
  ```html
  <script type="module" src="@lit-labs/ssr-client/lit-element-hydrate-support.js"></script>
  <script type="module" src="your-components.js"></script>
  ```

**Phase to address:** SSR Client Integration (late SSR phase - requires SSR infrastructure first)

**Confidence:** HIGH - [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/)

---

### NPM-5: ElementInternals Not Available During SSR

**What happens:** Form-associated custom elements use `this.attachInternals()` in the constructor. This API requires DOM and throws during server rendering. The Button component uses ElementInternals for form submission.

**Warning signs:**
- `TypeError: this.attachInternals is not a function` during SSR
- Server-side rendering crashes when processing form components
- Form participation works client-side but SSR fails

**Prevention:**
- Guard `attachInternals()` call: only execute when DOM is available
- Pattern:
  ```typescript
  constructor() {
    super();
    if (typeof window !== 'undefined') {
      this.internals = this.attachInternals();
    }
  }
  ```
- Form participation is inherently client-side; accept that form submission requires JS
- Document that SSR renders visual state only; form behavior requires hydration

**Phase to address:** SSR Component Compatibility (during component SSR adaptation)

**Confidence:** HIGH - [WebKit ElementInternals Article](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)

---

### NPM-6: Vite ?inline Imports Break NPM Package

**What happens:** The codebase uses `import tailwindStyles from '../styles/tailwind.css?inline'`. This is a Vite-specific feature. When published to NPM, consumers using other bundlers (Webpack, esbuild, Rollup without Vite) cannot resolve `?inline` queries.

**Warning signs:**
- `Module not found: Can't resolve './styles/tailwind.css?inline'`
- Package works in your Vite project but fails for users
- Build errors in non-Vite environments

**Prevention:**
- For NPM package: process CSS at build time, not import time
- Options:
  1. Use Vite library mode with CSS handling plugins (`vite-plugin-lib-inject-css`)
  2. Pre-process CSS into a JS string constant during build
  3. Use rollup's `string` plugin to inline CSS files
- Alternative: publish processed CSS as separate file with documented import pattern
- Test package in Webpack and esbuild projects before release

**Phase to address:** NPM Package Build Configuration (early - affects entire build pipeline)

**Confidence:** HIGH - Direct observation of codebase + bundler compatibility research

---

## Moderate Pitfalls (NPM + SSR)

Issues that cause delays, confusion, or technical debt but are recoverable.

---

### NPM-7: Missing File Extensions in Imports

**What happens:** TypeScript allows omitting `.js` extensions. Published packages without extensions require complex import maps or don't work in browsers/Deno without bundlers.

**Warning signs:**
- Package works with bundlers but fails with native ES modules
- Import maps grow excessively large
- Deno or browser direct import fails

**Prevention:**
- Configure TypeScript to require extensions: `"moduleResolution": "NodeNext"` or `"Bundler"`
- Use ESLint rule to enforce extensions in imports
- Add `.js` extensions to all relative imports (even for `.ts` files)
- Verify with `tsc --noEmit` and test native browser import

**Phase to address:** NPM Package Build Configuration

**Confidence:** HIGH - [Lit Publishing Docs](https://lit.dev/docs/tools/publishing/)

---

### NPM-8: :host-context(.dark) Limited Browser Support in SSR

**What happens:** Dark mode relies on `:host-context(.dark)`. While modern browsers support this, Firefox only added support recently (2023). SSR clients with older browsers may have broken dark mode.

**Warning signs:**
- Dark mode works in Chrome/Safari but not Firefox (older versions)
- SSR'd dark mode content displays incorrectly
- Users report "dark mode doesn't work" on specific browsers

**Prevention:**
- Check browser support matrix for your target audience
- Consider CSS custom properties alternative that inherits through shadow DOM
- Pattern: `color: var(--text-color)` where `--text-color` is set on `:root` or `.dark`
- Provide polyfill documentation or fallback patterns
- Alternative: use `@media (prefers-color-scheme: dark)` which has broader support

**Phase to address:** SSR Styling or Documentation (depends on target browser matrix)

**Confidence:** MEDIUM - Browser support is improving; may be non-issue for modern-only targets

---

### NPM-9: Custom Element Registration Side Effects Break Tree Shaking

**What happens:** Using `@customElement('ui-button')` decorator registers the element as a side effect of importing the module. Bundlers may tree-shake away unused components OR fail to tree-shake used components (include everything).

**Warning signs:**
- Users importing one component get entire library bundled
- OR users' builds exclude components they imported
- Package size complaints from users

**Prevention:**
- Separate registration from class definition:
  ```typescript
  // button.ts - no side effects
  export class Button extends TailwindElement { ... }

  // button.define.ts - side effect
  import { Button } from './button.js';
  customElements.define('ui-button', Button);
  ```
- In `package.json`, specify `"sideEffects": ["*.define.js"]`
- Offer both patterns: auto-registration and manual registration
- Document both import patterns for users

**Phase to address:** NPM Package Architecture (early - affects file structure)

**Confidence:** HIGH - [Lit Tree Shaking Discussion](https://github.com/lit/lit/discussions/4772)

---

### NPM-10: CSS Duplication in SSR Output

**What happens:** Declarative Shadow DOM cannot share stylesheets like constructable stylesheets can. Server-rendering 50 buttons means duplicating the entire Tailwind CSS 50 times in HTML, bloating page size.

**Warning signs:**
- SSR'd pages are unexpectedly large (megabytes)
- First Contentful Paint delayed due to HTML size
- Network tab shows huge HTML responses

**Prevention:**
- Minimize CSS per component (use CSS variables for theming)
- Consider extracting shared styles to document `<head>` for SSR
- Use `::part()` pseudo-element for external styling
- Implement CSS deduplication strategy:
  - Shared base styles in `<head>`
  - Component-specific styles only in shadow DOM
- Accept some duplication as tradeoff for encapsulation

**Phase to address:** SSR Optimization (later phase - after basic SSR works)

**Confidence:** MEDIUM - [DSD style sharing article](https://eisenbergeffect.medium.com/sharing-styles-in-declarative-shadow-dom-c5bf84ffd311)

---

### NPM-11: Package.json exports Field Misconfiguration

**What happens:** Modern Node.js and bundlers use `exports` field for module resolution. Incorrect configuration causes "Module not found" errors or wrong module loaded.

**Warning signs:**
- Package works in some projects but not others
- TypeScript types don't resolve
- Subpath imports (`@lit-ui/button`) fail
- "ERR_PACKAGE_PATH_NOT_EXPORTED" errors

**Prevention:**
- Define complete exports map including types:
  ```json
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./button": {
      "types": "./dist/button/index.d.ts",
      "import": "./dist/button/index.js"
    }
  }
  ```
- Use `arethetypeswrong` tool to validate package.json
- Test with `npm pack` and install tarball in test project
- Test with TypeScript `moduleResolution: "NodeNext"` and `"Bundler"`

**Phase to address:** NPM Package Configuration

**Confidence:** HIGH - [Snyk npm package article](https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/)

---

### NPM-12: defer-hydration Not Removed on Property-Heavy Components

**What happens:** Lit SSR adds `defer-hydration` attribute to prevent premature rendering. If not properly removed, components never hydrate. Complex property initialization can cause hydration to hang.

**Warning signs:**
- Components render but don't respond to interaction
- `defer-hydration` attribute persists in DOM
- Event handlers don't fire
- Component appears "frozen"

**Prevention:**
- Ensure hydration support module is loaded (see pitfall NPM-4)
- Avoid heavy computation in `connectedCallback` that might block hydration
- Test hydration with various property combinations
- Check that `defer-hydration` is removed after page load

**Phase to address:** SSR Testing (validation phase)

**Confidence:** MEDIUM - [Lit SSR defer-hydration docs](https://lit.dev/docs/ssr/client-usage/)

---

## Minor Pitfalls (NPM + SSR)

Issues that cause annoyance but are quickly fixable.

---

### NPM-13: Missing TypeScript HTMLElementTagNameMap Declaration

**What happens:** TypeScript users don't get type hints when using custom elements. `document.querySelector('ui-button')` returns `Element | null` instead of `Button | null`.

**Warning signs:**
- TypeScript users complain about lack of type inference
- Must manually cast: `document.querySelector('ui-button') as Button`

**Prevention:**
- Already implemented in codebase - verify it's exported in `.d.ts`
- Ensure declaration is in published types:
  ```typescript
  declare global {
    interface HTMLElementTagNameMap {
      'ui-button': Button;
    }
  }
  ```

**Phase to address:** NPM Package Build Configuration (types generation)

**Confidence:** HIGH - Codebase already has this pattern

---

### NPM-14: Forgetting to Externalize Peer Dependencies

**What happens:** `lit` is a peer dependency but gets included in bundle anyway because Vite/Rollup wasn't configured correctly.

**Warning signs:**
- Published package larger than expected
- `npm ls` shows duplicate lit in consumer projects

**Prevention:**
- Double-check `rollupOptions.external` in Vite config
- Verify bundle size before publishing
- Run `npm pack && tar -tf lit-ui-*.tgz` to inspect contents

**Phase to address:** NPM Package Build Configuration

**Confidence:** HIGH - Common oversight

---

### NPM-15: FOUC on First Page Load Without Preload

**What happens:** Users see unstyled custom element content briefly before JavaScript loads and applies styles.

**Warning signs:**
- Custom element content flashes or shifts
- `:not(:defined)` styles not applied

**Prevention:**
- Add `:not(:defined)` CSS to hide unregistered elements:
  ```css
  ui-button:not(:defined) { visibility: hidden; }
  ```
- Preload component JavaScript: `<link rel="modulepreload" href="components.js">`
- SSR with Declarative Shadow DOM includes styles inline (solves for SSR case)

**Phase to address:** Documentation or CLI Generated CSS

**Confidence:** HIGH - [FOUC in Web Components article](https://www.jacobmilhorn.com/posts/solving-fouc-in-web-components/)

---

## Phase-Specific Warnings Summary (NPM + SSR)

| Phase Topic | Likely Pitfall | Priority |
|-------------|---------------|----------|
| NPM Build Config | NPM-1 Bundling Lit, NPM-6 ?inline imports, NPM-7 Extensions, NPM-9 Side effects | HIGH |
| Package.json Setup | NPM-11 Exports field, NPM-14 Externals, NPM-13 Types | HIGH |
| SSR Infrastructure | NPM-2 Constructable stylesheets, NPM-5 ElementInternals | CRITICAL |
| SSR Styling | NPM-3 @property rules, NPM-8 :host-context, NPM-10 CSS duplication | HIGH |
| SSR Client Integration | NPM-4 Hydration order, NPM-12 defer-hydration | HIGH |
| Documentation | NPM-15 FOUC, consumer guidance | MEDIUM |

---

## Sources (NPM + SSR)

**Official Documentation:**
- [Lit Publishing Guide](https://lit.dev/docs/tools/publishing/)
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/)
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/)

**Web Standards:**
- [Declarative Shadow DOM (web.dev)](https://web.dev/articles/declarative-shadow-dom)
- [ElementInternals (WebKit)](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)

**Community Resources:**
- [Web Components Tailwind SSR (Konnor Rogers)](https://www.konnorrogers.com/posts/2023/web-components-tailwind-and-ssr)
- [Tailwind Shadow DOM @property issue](https://github.com/tailwindlabs/tailwindcss/discussions/16772)
- [Multiple Lit Versions](https://lit.dev/docs/tools/development/)
- [Sharing Styles in DSD](https://eisenbergeffect.medium.com/sharing-styles-in-declarative-shadow-dom-c5bf84ffd311)
- [Solving FOUC in Web Components](https://www.jacobmilhorn.com/posts/solving-fouc-in-web-components/)
- [NPM Package ESM/CJS (Snyk)](https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/)
- [Lit Tree Shaking Discussion](https://github.com/lit/lit/discussions/4772)

---
*Pitfalls research for: Lit.js Framework-Agnostic Component Library*
*Original research: 2026-01-23*
*NPM + SSR research added: 2026-01-24*
