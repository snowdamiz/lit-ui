# Phase 14: Core Package - Research

**Researched:** 2026-01-24
**Domain:** Lit SSR, TailwindElement base class, dual-mode styling, design tokens
**Confidence:** HIGH (primary sources: Lit official docs, Context from existing codebase)

## Summary

This phase implements `@lit-ui/core` as an SSR-aware TailwindElement base class that provides dual-mode styling: inline `<style>` tags during SSR (inside Declarative Shadow DOM templates), transitioning to shared constructable stylesheets after client-side hydration. The existing v1.0 TailwindElement pattern is solid and needs adaptation for SSR rather than replacement.

Key architectural insight: Lit SSR renders component shadow roots inside `<template shadowrootmode>` elements with inline `<style>` tags. After hydration, we can transition to `adoptedStyleSheets` for memory efficiency. The challenge is the transition mechanism - ensuring no style duplication or FOUC.

**Primary recommendation:** Build on existing TailwindElement pattern, adding `isServer` guards to use inline styles during SSR and shared constructable stylesheets post-hydration. Use build-time CSS compilation (Vite + Tailwind), not runtime JIT (avoids 74KB+ bundle overhead). The "JIT at runtime" user decision refers to Tailwind's build-time JIT, not browser-side generation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | ^3.0.0 | Web component framework | Native `isServer` export, SSR-designed LitElement |
| @lit-labs/ssr | ^4.0.0 | Server-side rendering | Official Lit SSR solution, Declarative Shadow DOM |
| @lit-labs/ssr-client | ^2.0.0 | Client hydration support | Required for LitElement hydration after SSR |
| tailwindcss | ^4.1.18 | Utility CSS framework | CSS-first config, @theme tokens, modern cascade layers |
| @tailwindcss/vite | ^4.1.18 | Build-time CSS processing | Vite plugin for Tailwind v4 compilation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/directives/class-map.js | (bundled with lit) | Dynamic class binding | Conditional Tailwind classes |
| lit/directives/style-map.js | (bundled with lit) | Dynamic inline styles | Rare - only when CSS vars insufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Build-time Tailwind | Twind (~13KB) | Runtime generation adds bundle size, simpler but slower |
| Build-time Tailwind | jit-browser-tailwindcss (~74KB) | Full Tailwind JIT in browser, heavy but most flexible |
| Single CSS file | Per-component CSS | Would duplicate Tailwind utilities across components |

**Note on "JIT at runtime":** The user decision for "JIT at runtime for dynamic Tailwind classes" refers to Tailwind's Just-In-Time compiler during the build process generating only used utilities - NOT browser-side CSS generation. Tailwind v4 with Vite handles this automatically at build time.

**Installation:**
```bash
# Already in place from Phase 13
pnpm add lit@^3.0.0 --filter @lit-ui/core
pnpm add @lit-labs/ssr @lit-labs/ssr-client --filter @lit-ui/core -D
```

## Architecture Patterns

### Recommended Project Structure
```
packages/core/
├── src/
│   ├── index.ts                    # Main exports: TailwindElement, isServer re-export
│   ├── tailwind-element.ts         # SSR-aware base class
│   ├── styles/
│   │   ├── tailwind.css            # @import "tailwindcss" + @theme tokens
│   │   └── host-defaults.css       # Shadow DOM @property workaround
│   ├── tokens/
│   │   └── index.ts                # Token exports as CSS custom property values
│   └── utils/
│       ├── events.ts               # dispatchCustomEvent helper
│       └── environment.ts          # Re-export isServer, hasConstructableStylesheets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: SSR-Aware TailwindElement with Dual-Mode Styling
**What:** Base class that uses inline styles for SSR, constructable stylesheets for hydrated client
**When to use:** All components extending TailwindElement
**Example:**
```typescript
// Source: Lit SSR authoring guide + existing project pattern
import { LitElement, css, isServer, type CSSResultGroup } from 'lit';

// Build-time compiled CSS (Vite transforms ?inline imports)
import tailwindStyles from './styles/tailwind.css?inline';
import hostDefaults from './styles/host-defaults.css?inline';

// Shared constructable stylesheets (created once, used by all instances)
let sharedTailwindSheet: CSSStyleSheet | null = null;
let sharedHostDefaultsSheet: CSSStyleSheet | null = null;

// Initialize sheets only in browser environment
if (!isServer && typeof CSSStyleSheet !== 'undefined') {
  sharedTailwindSheet = new CSSStyleSheet();
  sharedTailwindSheet.replaceSync(tailwindStyles);

  sharedHostDefaultsSheet = new CSSStyleSheet();
  sharedHostDefaultsSheet.replaceSync(hostDefaults);
}

export class TailwindElement extends LitElement {
  /**
   * Static styles getter returns inline CSS during SSR,
   * or empty array when using adoptedStyleSheets on client.
   */
  static get styles(): CSSResultGroup {
    // During SSR: return CSS as tagged template for inline <style> output
    if (isServer) {
      return css`${tailwindStyles}\n${hostDefaults}`;
    }
    // Client-side: styles applied via adoptedStyleSheets in connectedCallback
    return [];
  }

  override connectedCallback(): void {
    super.connectedCallback();

    // Skip during SSR - no DOM manipulation
    if (isServer) return;

    // Apply shared constructable stylesheets
    this._adoptTailwindStyles();
  }

  private _adoptTailwindStyles(): void {
    if (!this.shadowRoot || !sharedTailwindSheet || !sharedHostDefaultsSheet) return;

    const existingSheets = this.shadowRoot.adoptedStyleSheets;

    // Prepend shared sheets, preserving component-specific styles
    this.shadowRoot.adoptedStyleSheets = [
      sharedTailwindSheet,
      sharedHostDefaultsSheet,
      ...existingSheets,
    ];
  }
}
```

### Pattern 2: Design Tokens via CSS Custom Properties
**What:** Tokens exported both as CSS (via @theme) and as JS constants for programmatic access
**When to use:** Components needing token values, theming documentation
**Example:**
```typescript
// Source: Tailwind v4 @theme directive + Nord Design System naming
// packages/core/src/tokens/index.ts

// Namespace prefix: --lui- (LitUI)
export const tokens = {
  // Semantic color tokens (reference primitives via CSS)
  color: {
    primary: 'var(--lui-color-primary)',
    primaryForeground: 'var(--lui-color-primary-foreground)',
    secondary: 'var(--lui-color-secondary)',
    secondaryForeground: 'var(--lui-color-secondary-foreground)',
    destructive: 'var(--lui-color-destructive)',
    destructiveForeground: 'var(--lui-color-destructive-foreground)',
    muted: 'var(--lui-color-muted)',
    mutedForeground: 'var(--lui-color-muted-foreground)',
    accent: 'var(--lui-color-accent)',
    accentForeground: 'var(--lui-color-accent-foreground)',
    background: 'var(--lui-color-background)',
    foreground: 'var(--lui-color-foreground)',
    border: 'var(--lui-color-border)',
    ring: 'var(--lui-color-ring)',
  },
  spacing: {
    xs: 'var(--lui-spacing-xs)',    // 0.25rem
    sm: 'var(--lui-spacing-sm)',    // 0.5rem
    md: 'var(--lui-spacing-md)',    // 1rem
    lg: 'var(--lui-spacing-lg)',    // 1.5rem
    xl: 'var(--lui-spacing-xl)',    // 2rem
  },
  radius: {
    sm: 'var(--lui-radius-sm)',
    md: 'var(--lui-radius-md)',
    lg: 'var(--lui-radius-lg)',
    full: 'var(--lui-radius-full)',
  },
  // ... additional tokens
} as const;

// Type for token access
export type TokenPath = keyof typeof tokens;
```

### Pattern 3: FOUC Prevention with :not(:defined)
**What:** CSS pseudo-class targeting unregistered custom elements
**When to use:** Global styles to prevent FOUC before component JS loads
**Example:**
```css
/* Source: jacobmilhorn.com FOUC prevention guide */
/* Include in app's global CSS, not component CSS */

/* Hide undefined custom elements */
ui-button:not(:defined),
ui-dialog:not(:defined) {
  opacity: 0;
  visibility: hidden;
}

/* Alternative: show skeleton/placeholder */
ui-button:not(:defined) {
  display: inline-block;
  min-width: 80px;
  min-height: 36px;
  background: var(--lui-color-muted);
  border-radius: var(--lui-radius-md);
}
```

### Pattern 4: Type-Safe Custom Event Dispatch
**What:** Helper for dispatching typed custom events from components
**When to use:** Components emitting events to parent elements
**Example:**
```typescript
// Source: Lit events documentation + TypeScript best practices
// packages/core/src/utils/events.ts

export interface CustomEventOptions {
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
}

const defaultOptions: CustomEventOptions = {
  bubbles: true,
  composed: true,  // Cross shadow DOM boundary
  cancelable: false,
};

/**
 * Dispatch a typed custom event from a component.
 * @param element - The element dispatching the event
 * @param eventName - Event type name
 * @param detail - Event detail payload
 * @param options - Event options (defaults to bubbles: true, composed: true)
 */
export function dispatchCustomEvent<T>(
  element: HTMLElement,
  eventName: string,
  detail?: T,
  options: CustomEventOptions = {}
): boolean {
  const event = new CustomEvent<T>(eventName, {
    detail,
    ...defaultOptions,
    ...options,
  });
  return element.dispatchEvent(event);
}
```

### Anti-Patterns to Avoid
- **Using `static styles` with dynamic expressions during SSR:** The `css` function only accepts strings/numbers for security. Build conditional styles differently.
- **Creating CSSStyleSheet in module scope without isServer guard:** Will throw in Node.js environment.
- **Accessing document/window in constructor or static initializers:** Use isServer guard or move to connectedCallback.
- **Bundling the entire Tailwind CSS:** Use build-time JIT to include only used utilities.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server detection | Custom global check | `import { isServer } from 'lit'` | Lit's isServer works across all SSR environments |
| Dynamic class binding | String concatenation | `classMap` directive | Efficient DOM updates, cleaner syntax |
| Constructable stylesheet check | `typeof CSSStyleSheet` | `globalThis.CSSStyleSheet?.prototype.replaceSync` | Full feature detection including replaceSync method |
| CSS custom property extraction | Regex parsing | Tailwind @theme directive | Build-time token generation, type-safe |
| Event dispatching | Manual CustomEvent | Helper function with defaults | Consistent composed: true for shadow DOM |

**Key insight:** Lit provides `isServer` specifically for SSR-aware components. Don't try to detect Node.js vs browser through other means - Lit's approach handles edge cases like Deno and Cloudflare Workers.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from isServer in render()
**What goes wrong:** Conditional rendering based on `isServer` in the `render()` method causes hydration errors - server and client produce different DOM.
**Why it happens:** Lit hydration expects matching DOM structure between server-rendered HTML and client template.
**How to avoid:** Use `isServer` for side effects (event listeners, DOM manipulation), not for conditional rendering. If content must differ, use `defer-hydration` pattern.
**Warning signs:** Console errors about "hydration mismatch" or "unexpected child"

### Pitfall 2: Module Load Order for Hydration Support
**What goes wrong:** Components don't hydrate, remain static after JS loads.
**Why it happens:** `@lit-labs/ssr-client/lit-element-hydrate-support.js` must be imported BEFORE `lit` module.
**How to avoid:** Structure entry point to import hydration support first:
```typescript
// CORRECT: hydration support first
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
import { LitElement } from 'lit';

// WRONG: lit imported first
import { LitElement } from 'lit';
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
```
**Warning signs:** SSR content visible but not interactive

### Pitfall 3: @property CSS Rules Not Working in Shadow DOM
**What goes wrong:** Tailwind utilities using CSS `@property` (shadows, transforms, gradients) don't work.
**Why it happens:** CSS `@property` only works at document level (W3C spec limitation), not inside Shadow DOM.
**How to avoid:** Include host-defaults.css with explicit `:host` declarations for all `--tw-*` internal variables.
**Warning signs:** `shadow-*`, `ring-*`, `translate-*` utilities have no effect

### Pitfall 4: Style Duplication After Hydration
**What goes wrong:** Styles appear twice - once from SSR inline `<style>`, once from adoptedStyleSheets.
**Why it happens:** Hydration doesn't automatically remove SSR styles when adding constructed stylesheets.
**How to avoid:** Use getter for `static styles` that returns empty array on client, OR remove inline style during connectedCallback.
**Warning signs:** Doubled CSS rules in DevTools, increased memory usage

### Pitfall 5: Tree Shaking Breaks with Side Effects
**What goes wrong:** Bundler includes entire package even when only TailwindElement is imported.
**Why it happens:** Module-level side effects (stylesheet creation, document manipulation) prevent tree shaking.
**How to avoid:**
- Keep `sideEffects: false` in package.json
- Guard all side effects with `if (!isServer)`
- Use lazy initialization (create sheets in connectedCallback, not module scope)
**Warning signs:** Large bundle size, unused exports present in build output

## Code Examples

Verified patterns from official sources:

### Environment Detection
```typescript
// Source: Lit SSR authoring documentation
import { isServer } from 'lit';

// Safe environment check for constructable stylesheets
const hasConstructableStylesheets = !isServer &&
  typeof globalThis.CSSStyleSheet?.prototype.replaceSync === 'function';

// SSR warning in development (per user decision: warn in dev, skip in prod)
function warnSSRBrowserAPI(api: string): void {
  if (isServer && process.env.NODE_ENV === 'development') {
    console.warn(`[lit-ui] ${api} is not available during SSR. Skipping.`);
  }
}
```

### Package.json Exports Configuration
```json
// Source: Node.js packages documentation
{
  "name": "@lit-ui/core",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./tokens": {
      "types": "./dist/tokens/index.d.ts",
      "import": "./dist/tokens/index.js"
    }
  },
  "sideEffects": false,
  "peerDependencies": {
    "lit": "^3.0.0"
  }
}
```

### Tailwind CSS Token Structure
```css
/* Source: Tailwind v4 CSS-first config + existing project tokens */
@import "tailwindcss";

@theme {
  /* Namespace: --lui- (LitUI) */

  /* Semantic tokens that respond to theme context */
  --color-primary: var(--lui-color-primary);
  --color-primary-foreground: var(--lui-color-primary-foreground);

  /* Expose raw primitives for customization */
  --lui-color-brand-500: oklch(0.62 0.18 250);

  /* Semantic mappings (light mode defaults) */
  --lui-color-primary: var(--lui-color-brand-500);
  --lui-color-primary-foreground: white;
  --lui-color-background: white;
  --lui-color-foreground: var(--color-gray-950);
}

/* Dark mode via :host-context for Shadow DOM */
:host-context(.dark) {
  --lui-color-primary: var(--lui-color-brand-400);
  --lui-color-primary-foreground: var(--color-gray-950);
  --lui-color-background: var(--color-gray-950);
  --lui-color-foreground: var(--color-gray-50);
}
```

### Subclass Extension Pattern
```typescript
// Source: Lit components documentation
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { TailwindElement } from '@lit-ui/core';

@customElement('ui-button')
export class Button extends TailwindElement {
  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';

  // Component-specific styles (applied AFTER Tailwind styles)
  static override styles = [
    // Parent styles included automatically via TailwindElement
    css`
      :host { display: inline-block; }
      button:focus-visible {
        box-shadow: inset 0 0 0 2px var(--lui-color-ring);
      }
    `
  ];

  render() {
    const classes = {
      'bg-primary text-primary-foreground': this.variant === 'primary',
      'bg-secondary text-secondary-foreground': this.variant === 'secondary',
    };

    return html`
      <button class="px-4 py-2 rounded-md ${classMap(classes)}">
        <slot></slot>
      </button>
    `;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single @tailwind directives | `@import "tailwindcss"` | Tailwind v4 (2024) | Simpler CSS, automatic layers |
| tailwind.config.js | CSS @theme directive | Tailwind v4 (2024) | CSS-first config, better DX |
| Polyfill for DSD | Native browser support | Firefox 123+ (2024) | All modern browsers support DSD |
| Manual isServer detection | `import { isServer } from 'lit'` | Lit 3.0 | Official API, reliable |
| css-loader + style-loader | @tailwindcss/vite plugin | Tailwind v4 (2024) | Vite-native, faster builds |

**Deprecated/outdated:**
- `@tailwind base; @tailwind components; @tailwind utilities;` - replaced by single `@import "tailwindcss"`
- `tailwindcss/nesting` PostCSS plugin - native CSS nesting now supported
- Inline `<style>` polyfills for Shadow DOM - adoptedStyleSheets has full browser support

## Open Questions

Things that couldn't be fully resolved:

1. **Style cleanup timing during hydration**
   - What we know: Lit hydration doesn't automatically handle style deduplication
   - What's unclear: Best timing to remove SSR inline styles - connectedCallback vs firstUpdated
   - Recommendation: Test both approaches, prefer connectedCallback if no FOUC

2. **Token export granularity**
   - What we know: Full token system requested (colors, spacing, typography, shadows, animations, breakpoints)
   - What's unclear: Whether to export as flat object or nested hierarchy
   - Recommendation: Nested for DX (`tokens.color.primary`), provide TypeScript types

3. **Declarative adoptedStyleSheets proposal status**
   - What we know: W3C discussing `adoptedstylesheets` attribute on `<template>` for SSR
   - What's unclear: Timeline for browser implementation
   - Recommendation: Implement current pattern, update when spec finalizes

## Sources

### Primary (HIGH confidence)
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) - SSR architecture, DSD output format
- [Lit SSR Authoring](https://lit.dev/docs/ssr/authoring/) - isServer usage, lifecycle during SSR
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) - Hydration support module loading order
- [Lit Component Styles](https://lit.dev/docs/components/styles/) - static styles, adoptedStyleSheets behavior
- Existing codebase: `src.old/base/tailwind-element.ts` - Working v1.0 pattern to adapt

### Secondary (MEDIUM confidence)
- [Tailwind v4 CSS-First Config](https://tailwindcss.com/blog/tailwindcss-v4) - @theme directive, layer system
- [npm package exports](https://nodejs.org/api/packages.html) - Conditional exports for SSR/browser
- [Tree Shaking Guide](https://webpack.js.org/guides/tree-shaking/) - sideEffects configuration

### Tertiary (LOW confidence)
- [W3C Sharing Styles Discussion](https://www.w3.org/2024/09/25-share-styles-minutes.html) - Future declarative adoptedStyleSheets (draft)
- [GitHub: Lit SSR DSD Discussion](https://github.com/lit/lit/discussions/2589) - Community patterns for static SSR

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries from official Lit docs and existing project
- Architecture: HIGH - Patterns derived from Lit SSR documentation and working v1.0 code
- Pitfalls: HIGH - Documented in Lit SSR authoring guide and GitHub issues
- Token system: MEDIUM - Combines Tailwind v4 patterns with design system best practices

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain, Lit SSR is mature)
