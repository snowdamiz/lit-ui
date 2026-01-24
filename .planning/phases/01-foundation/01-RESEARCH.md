# Phase 1: Foundation - Research

**Researched:** 2026-01-23
**Domain:** Lit 3 + Tailwind CSS v4 + Shadow DOM Integration
**Confidence:** MEDIUM (known platform limitations require workarounds)

## Summary

This phase establishes the technical foundation for a Lit-based component library with Tailwind CSS v4 styling. The primary challenge is integrating Tailwind v4's CSS-first approach with Shadow DOM encapsulation. Tailwind v4 uses `@property` CSS declarations and `:root` selectors that don't work within Shadow DOM boundaries, requiring explicit workarounds.

The research reveals a well-established pattern: create a `TailwindElement` base class that extends `LitElement` and injects compiled Tailwind CSS into Shadow DOM via constructable stylesheets. Design tokens defined with Tailwind's `@theme` directive cascade into Shadow DOM as CSS custom properties because custom properties inherit through Shadow DOM boundaries (unlike other CSS rules).

**Primary recommendation:** Use the `adoptStyles` function from Lit to inject compiled Tailwind CSS into each component's shadow root via a base class mixin. Define design tokens using Tailwind v4's `@theme` directive. Add explicit `:host` declarations for Tailwind's internal `@property`-dependent variables (shadows, rings, transforms) to work around the Shadow DOM `@property` limitation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | 3.x | Web component base class and rendering | Official, lightweight (~5KB), decorator support, constructable stylesheets built-in |
| tailwindcss | 4.x | Utility-first CSS framework | CSS-first config with `@theme`, generates CSS variables by default |
| @tailwindcss/vite | 4.x | Vite plugin for Tailwind v4 | Official plugin, faster than PostCSS approach |
| typescript | 5.2+ | Type-safe development | Required for standard decorators with `accessor` keyword |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite | 6.x | Build tool and dev server | All development and builds |
| vite-plugin-dts | 4.x | TypeScript declaration generation | Library output for consumers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Build-time Tailwind | Twind (runtime) | Twind adds ~17KB but offers unlimited dynamic classes; build-time is smaller but requires recompilation |
| Tailwind v4 | Tailwind v3 | v3 has no `@property` issues but lacks CSS-first config and native CSS variable output |
| @tailwindcss/vite | @tailwindcss/postcss | PostCSS approach works but Vite plugin is faster and simpler |

**Installation:**
```bash
npm install lit tailwindcss @tailwindcss/vite typescript vite vite-plugin-dts
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── base/
│   └── tailwind-element.ts    # TailwindElement base class
├── components/
│   └── [component-name]/      # One folder per component
│       ├── [component].ts     # Component implementation
│       └── [component].test.ts
├── styles/
│   ├── tokens.css             # Design tokens via @theme
│   └── tailwind.css           # Main Tailwind import + @theme
├── index.ts                   # Public exports
└── vite-env.d.ts              # Vite TypeScript definitions
```

### Pattern 1: TailwindElement Base Class
**What:** A mixin/base class that automatically injects Tailwind CSS into every component's Shadow DOM
**When to use:** Every component in the library should extend this class
**Example:**
```typescript
// Source: Lit docs + lloydrichards/base_lit-with-tailwind pattern
import { LitElement, unsafeCSS, adoptStyles } from 'lit';
import tailwindStyles from '../styles/tailwind.css?inline';

// Create a CSSStyleSheet from the compiled Tailwind CSS
const tailwindSheet = new CSSStyleSheet();
tailwindSheet.replaceSync(tailwindStyles);

// Workaround: Extract and apply @property rules to document (they don't work in Shadow DOM)
const propertyRules = tailwindStyles.match(/@property[^}]+\{[^}]+\}/g) || [];
if (propertyRules.length > 0) {
  const propertySheet = new CSSStyleSheet();
  propertySheet.replaceSync(propertyRules.join('\n'));
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, propertySheet];
}

export class TailwindElement extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    if (this.shadowRoot) {
      adoptStyles(this.shadowRoot, [tailwindSheet]);
    }
  }
}
```

### Pattern 2: Design Token Layers (Primitive -> Semantic -> Component)
**What:** Three-tier token system where primitives define raw values, semantic tokens give meaning, and component tokens enable customization
**When to use:** All design tokens in the system
**Example:**
```css
/* Source: Nordhealth pattern via web.dev + Tailwind v4 @theme */
@import "tailwindcss";

@theme {
  /* Primitive tokens - raw values following Tailwind scales */
  --color-blue-50: oklch(0.97 0.01 250);
  --color-blue-500: oklch(0.62 0.18 250);
  --color-blue-900: oklch(0.28 0.08 250);

  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;

  /* Semantic tokens - inherit and cascade into Shadow DOM */
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-600);
  --color-surface: var(--color-white);
  --color-text: var(--color-gray-900);
}

/* Dark mode overrides */
.dark {
  --color-primary: var(--color-blue-400);
  --color-surface: var(--color-gray-900);
  --color-text: var(--color-gray-100);
}
```

### Pattern 3: :host Shadow DOM Variable Workaround
**What:** Explicit `:host` declarations for Tailwind's `@property`-dependent variables
**When to use:** Required in base styles to make shadows, rings, and transforms work in Shadow DOM
**Example:**
```css
/* Source: tailwindlabs/tailwindcss discussion #15556 */
:host {
  /* Shadow/ring defaults - @property doesn't work in Shadow DOM */
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-inset-shadow-color: initial;
  --tw-ring-color: initial;
  --tw-ring-shadow: 0 0 #0000;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;

  /* Transform defaults */
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-translate-z: 0;
  --tw-rotate-x: 0;
  --tw-rotate-y: 0;
  --tw-rotate-z: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-scale-z: 1;

  /* Other property-dependent utilities */
  --tw-border-style: solid;
  --tw-font-weight: initial;
  --tw-tracking: initial;
}
```

### Anti-Patterns to Avoid
- **Defining tokens inside Shadow DOM:** CSS custom properties defined in component `:host` styles can override global theme values. Define tokens globally at `:root`, consume them via `var()` in components.
- **Using `<link>` tags for styles in Shadow DOM:** Creates FOUC and performance issues. Use constructable stylesheets via `adoptStyles`.
- **Duplicating Tailwind compilation per component:** Parse CSS once, share the CSSStyleSheet instance across all component instances.
- **Using rem units without consideration:** rem is relative to root font-size which may differ between host page and component. Consider if px is needed for consistent sizing.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS injection into Shadow DOM | Manual style element insertion | Lit's `adoptStyles` + constructable stylesheets | Handles browser fallbacks, efficient sharing |
| Design token parsing | Custom CSS variable extraction | Tailwind v4's `@theme` directive | Automatic utility class generation |
| TypeScript decorator support | Babel transforms | Native TypeScript 5.2+ with `accessor` keyword | Standard decorators work out of the box |
| Style sharing between components | Copy-paste CSS | Exported `css` template literals or shared CSSStyleSheet | Parse once, reuse everywhere |

**Key insight:** Lit and Tailwind v4 have done the hard work of making Shadow DOM styling efficient. The complexity is in the integration layer (the TailwindElement base class) and working around the `@property` Shadow DOM limitation.

## Common Pitfalls

### Pitfall 1: Tailwind v4 @property Declarations Don't Work in Shadow DOM
**What goes wrong:** Shadows, rings, transforms, and other utilities that rely on `@property` CSS declarations fail silently or render incorrectly
**Why it happens:** The CSS `@property` declaration only works at the document level, not inside Shadow DOM (W3C spec issue csswg-drafts#10541)
**How to avoid:** Add explicit `:host` declarations with default values for all Tailwind internal variables that use `@property`
**Warning signs:** `box-shadow` utilities showing no shadow, `translate-y-*` not working, ring utilities failing

### Pitfall 2: Class Fields vs Reactive Properties in TypeScript
**What goes wrong:** Properties don't trigger re-renders when changed
**Why it happens:** TypeScript's `useDefineForClassFields: true` (default for ES2022+) creates instance properties that shadow Lit's prototype accessors
**How to avoid:** Set `useDefineForClassFields: false` in tsconfig.json OR use `accessor` keyword with standard decorators
**Warning signs:** Setting a property doesn't update the UI, `requestUpdate()` needs to be called manually

### Pitfall 3: CSS Custom Properties Defined in :host Override Global Tokens
**What goes wrong:** Component-level token definitions prevent theme customization from parent elements
**Why it happens:** Properties defined on `:host` take precedence over inherited values from `:root`
**How to avoid:** Only USE global tokens in `:host`, don't DEFINE their values. Use private `--_component-name-*` prefixed variables for component-internal values
**Warning signs:** Dark mode tokens not applying inside components, theme changes having no effect

### Pitfall 4: Using Static Styles with Dynamic Tailwind Classes
**What goes wrong:** Tailwind classes added dynamically don't have corresponding CSS rules
**Why it happens:** Tailwind scans source files at build time and only generates CSS for classes it finds
**How to avoid:** Use `safelist` in Tailwind config for dynamic classes, or ensure all possible classes appear somewhere in source code
**Warning signs:** Dynamic class bindings not applying styles, conditional classes showing unstyled content

### Pitfall 5: FOUC (Flash of Unstyled Content) with Shadow DOM
**What goes wrong:** Components briefly show unstyled content before styles apply
**Why it happens:** Styles load after component renders, especially with `<link>` elements
**How to avoid:** Use Lit's static `styles` property with `css` tag (styles apply synchronously) or constructable stylesheets via `adoptStyles` in `connectedCallback`
**Warning signs:** Content flashing on page load, styles appearing after a delay

## Code Examples

Verified patterns from official sources:

### Component Using TailwindElement Base Class
```typescript
// Source: Lit docs + verified patterns
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../base/tailwind-element';

@customElement('ui-button')
export class Button extends TailwindElement {
  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';

  render() {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
    const variantClasses = this.variant === 'primary'
      ? 'bg-primary text-white hover:bg-primary-hover'
      : 'bg-surface text-text border border-gray-300';

    return html`
      <button class="${baseClasses} ${variantClasses}">
        <slot></slot>
      </button>
    `;
  }
}
```

### TypeScript Configuration for Lit Decorators
```json
// Source: lit.dev/docs/components/decorators
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Vite Configuration with Tailwind v4
```typescript
// Source: tailwindcss.com/blog/tailwindcss-v4 + lloydrichards template
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tailwindcss(),
    dts({ rollupTypes: true })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit']
    }
  }
});
```

### Complete Tailwind CSS with Design Tokens
```css
/* Source: tailwindcss.com/docs/theme + verified patterns */
@import "tailwindcss";

@theme {
  /* Colors - extending defaults with brand colors */
  --color-brand-50: oklch(0.97 0.02 250);
  --color-brand-100: oklch(0.94 0.04 250);
  --color-brand-200: oklch(0.88 0.08 250);
  --color-brand-300: oklch(0.79 0.12 250);
  --color-brand-400: oklch(0.70 0.15 250);
  --color-brand-500: oklch(0.62 0.18 250);
  --color-brand-600: oklch(0.54 0.16 250);
  --color-brand-700: oklch(0.46 0.13 250);
  --color-brand-800: oklch(0.38 0.10 250);
  --color-brand-900: oklch(0.28 0.08 250);

  /* Semantic tokens - these cascade into Shadow DOM */
  --color-primary: var(--color-brand-500);
  --color-primary-foreground: white;
  --color-secondary: var(--color-gray-100);
  --color-secondary-foreground: var(--color-gray-900);
  --color-destructive: var(--color-red-500);
  --color-destructive-foreground: white;
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-500);
  --color-accent: var(--color-gray-100);
  --color-accent-foreground: var(--color-gray-900);
  --color-background: white;
  --color-foreground: var(--color-gray-950);
  --color-border: var(--color-gray-200);
  --color-ring: var(--color-brand-400);

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Dark mode - class-based */
.dark {
  --color-primary: var(--color-brand-400);
  --color-primary-foreground: var(--color-gray-950);
  --color-secondary: var(--color-gray-800);
  --color-secondary-foreground: var(--color-gray-100);
  --color-muted: var(--color-gray-800);
  --color-muted-foreground: var(--color-gray-400);
  --color-accent: var(--color-gray-800);
  --color-accent-foreground: var(--color-gray-100);
  --color-background: var(--color-gray-950);
  --color-foreground: var(--color-gray-50);
  --color-border: var(--color-gray-800);
  --color-ring: var(--color-brand-600);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` | CSS `@theme` directive | Tailwind v4 (2024) | All config in CSS, simpler setup |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 (2024) | Single import line |
| PostCSS + autoprefixer | `@tailwindcss/vite` plugin | Tailwind v4 (2024) | Faster builds, less config |
| rgb color values | oklch color space | Tailwind v4 (2024) | More vivid colors on P3 displays |
| experimentalDecorators only | Standard decorators + `accessor` | TypeScript 5.2+ | Migration path to standard decorators |
| Manual ShadyCSS polyfills | Browser-native constructable stylesheets | 2023+ | All modern browsers now support adoptedStyleSheets |

**Deprecated/outdated:**
- `@tailwind base/components/utilities` directives: Use `@import "tailwindcss"` instead
- `tailwind.config.js` for tokens: Use CSS `@theme` directive
- ShadyCSS polyfills: All evergreen browsers support Shadow DOM and constructable stylesheets

## Open Questions

Things that couldn't be fully resolved:

1. **@property Shadow DOM Workaround Completeness**
   - What we know: Many Tailwind internal variables need explicit `:host` defaults
   - What's unclear: The complete list of all variables that need workarounds may evolve with Tailwind updates
   - Recommendation: Start with the documented workaround variables, add more as issues are discovered during development

2. **CSS Parts vs CSS Custom Properties for Component Customization**
   - What we know: Both approaches work for styling customization
   - What's unclear: User decided this is Claude's discretion; no clear community preference for component libraries
   - Recommendation: Use CSS custom properties for theme-level tokens, consider `::part()` for structural element styling if needed

3. **Build Output Format (ESM vs ESM+CJS)**
   - What we know: Modern bundlers prefer ESM, but some tools still need CJS
   - What's unclear: User decided this is Claude's discretion
   - Recommendation: ESM-only is simpler and covers most use cases; add CJS only if consumer demand emerges

## Sources

### Primary (HIGH confidence)
- [Lit Styles Documentation](https://lit.dev/docs/components/styles/) - Static styles, css tag, adoptStyles API
- [Lit Decorators](https://lit.dev/docs/components/decorators/) - @customElement, @property, TypeScript config
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - @theme directive, namespaces, extending defaults
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) - New features, CSS-first config, breaking changes

### Secondary (MEDIUM confidence)
- [Nordhealth Custom Properties Pattern](https://web.dev/articles/custom-properties-web-components) - Primitive/semantic/component token layers
- [Tailwind Shadow DOM Discussion #15556](https://github.com/tailwindlabs/tailwindcss/discussions/15556) - :host workaround for theme variables
- [Tailwind @property Issue #17104](https://github.com/tailwindlabs/tailwindcss/issues/17104) - Shadow DOM @property limitation, official confirmation
- [lloydrichards Lit+Tailwind Template](https://github.com/lloydrichards/base_lit-with-tailwind) - TwLitElement mixin pattern

### Tertiary (LOW confidence)
- Various blog posts on Tailwind + Shadow DOM integration patterns (approaches vary in completeness)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Lit and Tailwind documentation, stable APIs
- Architecture patterns: MEDIUM - Patterns are established but the @property workaround is community-sourced, not officially blessed
- Pitfalls: HIGH - Well-documented issues in GitHub discussions and official issues

**Research date:** 2026-01-23
**Valid until:** ~60 days (Tailwind v4 is stable, Lit 3 is stable, patterns are mature)
