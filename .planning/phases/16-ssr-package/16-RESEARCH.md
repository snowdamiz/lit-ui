# Phase 16: SSR Package - Research

**Researched:** 2026-01-24
**Domain:** Lit Server-Side Rendering, Declarative Shadow DOM
**Confidence:** HIGH

## Summary

This phase creates `@lit-ui/ssr` - a convenience wrapper around `@lit-labs/ssr` that provides SSR render utilities for the Lit UI component library. The package will re-export essential SSR functionality from `@lit-labs/ssr` and `@lit-labs/ssr-client`, with a simplified API that matches the conventions of existing `@lit-ui/*` packages.

The @lit-labs/ssr package (v4.0.0) is the official Lit SSR solution, providing server-side rendering that outputs Declarative Shadow DOM (DSD) HTML. It works without full DOM emulation by leveraging Lit's declarative template format. The client-side hydration is handled by `@lit-labs/ssr-client` (v1.1.8), which includes the critical `lit-element-hydrate-support.js` module that must be loaded before the `lit` module.

**Primary recommendation:** Create a thin wrapper that re-exports `@lit-labs/ssr` essentials with clear documentation. Export `isServer` from `@lit-ui/ssr` for SSR context detection (matching the existing re-export in `@lit-ui/core`), and provide a hydration helper function that handles the correct module load order.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @lit-labs/ssr | 4.0.0 | Server-side rendering of Lit components | Official Lit SSR package |
| @lit-labs/ssr-client | 1.1.8 | Client-side hydration support | Required for hydrating SSR output |
| @lit-labs/ssr-dom-shim | 1.5.0+ | Minimal DOM APIs for Node | Auto-installed by @lit-labs/ssr |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @webcomponents/template-shadowroot | 0.2.1 | DSD polyfill for older browsers | When supporting browsers without native DSD |
| lit | ^3.1.2 | Core Lit library | Provides isServer, html, render |
| lit-html | ^3.1.2 | Template library | Used internally by SSR |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @lit-labs/ssr | Custom SSR implementation | Would require DOM emulation, much more complex |
| Server-only templates | Regular Lit templates | Server-only templates support DOCTYPE, title, script tags |

**Installation:**
```bash
pnpm add @lit-labs/ssr @lit-labs/ssr-client
```

## Architecture Patterns

### Recommended Package Structure
```
packages/ssr/
├── src/
│   ├── index.ts           # Main entry - exports render, html, isServer
│   ├── hydration.ts       # Hydration helper utilities
│   └── types.ts           # Re-exported types (RenderInfo, RenderResult)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: Re-export with Simplified API
**What:** Wrap @lit-labs/ssr with a cleaner API surface
**When to use:** Always - the goal is to provide a simplified, consistent API
**Example:**
```typescript
// Source: @lit-labs/ssr official API
// packages/ssr/src/index.ts
export { render, html } from '@lit-labs/ssr';
export { collectResult, collectResultSync } from '@lit-labs/ssr/lib/render-result.js';
export { RenderResultReadable } from '@lit-labs/ssr/lib/render-result-readable.js';
export { isServer } from 'lit';

// Re-export types
export type { RenderInfo, RenderResult } from '@lit-labs/ssr';
```

### Pattern 2: Async Render Helper
**What:** Provide a simple async function that renders to string
**When to use:** When developers want a simple one-liner
**Example:**
```typescript
// Source: Pattern based on @lit-labs/ssr documentation
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import type { TemplateResult } from 'lit';

/**
 * Render a Lit template to an HTML string.
 * Handles async rendering internally.
 */
export async function renderToString(
  template: TemplateResult,
  options?: Partial<RenderInfo>
): Promise<string> {
  const result = render(template, options);
  return collectResult(result);
}
```

### Pattern 3: Streaming Response Helper
**What:** Provide a streaming helper for frameworks that support it
**When to use:** When integrating with Koa, Express, or similar
**Example:**
```typescript
// Source: @lit-labs/ssr documentation
import { render } from '@lit-labs/ssr';
import { RenderResultReadable } from '@lit-labs/ssr/lib/render-result-readable.js';
import type { TemplateResult } from 'lit';

/**
 * Create a Node Readable stream from a Lit template.
 * Use for streaming SSR responses.
 */
export function renderToStream(
  template: TemplateResult,
  options?: Partial<RenderInfo>
): RenderResultReadable {
  const result = render(template, options);
  return new RenderResultReadable(result);
}
```

### Pattern 4: Hydration Support Module
**What:** Export a function that ensures correct module load order for hydration
**When to use:** Client-side hydration setup
**Example:**
```typescript
// packages/ssr/src/hydration.ts
// Source: @lit-labs/ssr-client documentation

/**
 * Initialize hydration support for LitElement components.
 * MUST be called before importing any Lit components.
 *
 * @example
 * ```typescript
 * // In your app entry point (FIRST import!)
 * import '@lit-ui/ssr/hydration';
 * // Then import components
 * import './my-components.js';
 * ```
 */
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

export { hydrate } from '@lit-labs/ssr-client';
```

### Anti-Patterns to Avoid
- **Bundling @lit-labs/ssr into the package:** Lit SSR relies on conditional exports that break when bundled. Keep it as a peer dependency.
- **Using DOM APIs during render:** No `window`, `document`, `localStorage` etc. during SSR
- **Async work in components:** Lit SSR does not wait for async operations in components
- **Loading hydration support after component modules:** The hydrate support must load before lit

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server-side template rendering | Custom DOM serialization | `render()` from @lit-labs/ssr | Handles Lit's marker comments, attribute bindings |
| DSD HTML generation | Manual template wrapper | @lit-labs/ssr's LitElementRenderer | Properly handles shadowrootmode attribute |
| Client hydration | Manual DOM reconciliation | @lit-labs/ssr-client hydrate() | Matches server-rendered markers |
| isServer detection | Environment sniffing | `isServer` from `lit` | Tree-shakes correctly, handles edge cases |
| DSD polyfill | Custom implementation | @webcomponents/template-shadowroot | Handles nested shadow roots correctly |
| Stream handling | Custom async iteration | RenderResultReadable | Handles promises, nested iterables |

**Key insight:** The SSR problem space is deceptively complex. Lit's templating system uses HTML comments as markers for dynamic parts. Hand-rolling serialization would miss these, breaking hydration.

## Common Pitfalls

### Pitfall 1: Module Load Order for Hydration
**What goes wrong:** Hydration fails silently or components don't become interactive
**Why it happens:** `lit-element-hydrate-support.js` must patch LitElement before any component class is defined
**How to avoid:** Import hydration support as the very first import in your client bundle
**Warning signs:** Components render but don't respond to interactions after hydration

### Pitfall 2: Browser APIs in Component Code
**What goes wrong:** Server crashes with `window is not defined` or similar
**Why it happens:** SSR runs in Node.js which lacks browser APIs
**How to avoid:** Guard browser APIs with `if (!isServer)` or move to `connectedCallback`/`updated`
**Warning signs:** ReferenceError mentioning DOM globals

### Pitfall 3: Async Work in Components
**What goes wrong:** Server renders empty/incomplete content
**Why it happens:** Lit SSR doesn't wait for promises in component render cycles
**How to avoid:** Fetch all data before calling `render()`, pass as attributes/properties
**Warning signs:** Missing content that appears after hydration

### Pitfall 4: Bundling Lit Dependencies
**What goes wrong:** SSR breaks with obscure errors about undefined methods
**Why it happens:** Lit uses conditional exports (node vs browser) that break when bundled
**How to avoid:** Mark `lit`, `@lit/*`, `@lit-labs/*` as external in bundler config
**Warning signs:** Errors about missing `isServer` or incorrect SSR behavior

### Pitfall 5: Missing Component Imports on Server
**What goes wrong:** Components render as empty custom elements or show tag name only
**Why it happens:** Components must be registered with `customElements` before rendering
**How to avoid:** Import component modules on the server before calling render()
**Warning signs:** HTML output shows `<my-element></my-element>` without shadow DOM content

### Pitfall 6: DSD Polyfill Loading Strategy
**What goes wrong:** Flash of unstyled/missing content (FOUC) in non-DSD browsers
**Why it happens:** Polyfill runs after initial paint
**How to avoid:** Use inline script to hide content until polyfill runs, or inline the polyfill
**Warning signs:** Content flashes or jumps during page load in Firefox/Safari (older versions)

### Pitfall 7: Property Bindings in Server Templates
**What goes wrong:** Complex objects/arrays don't serialize to HTML attributes
**Why it happens:** HTML attributes are strings; objects become `[object Object]`
**How to avoid:** Use primitive attribute values, or serialize to JSON in a data attribute
**Warning signs:** Properties show as `[object Object]` in HTML output

## Code Examples

Verified patterns from official sources:

### Basic Server Render
```typescript
// Source: https://lit.dev/docs/ssr/server-usage/
import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';

// Import components to register them
import '@lit-ui/button';
import '@lit-ui/dialog';

const template = html`
  <!DOCTYPE html>
  <html>
    <head><title>My App</title></head>
    <body>
      <lui-button variant="primary">Click Me</lui-button>
    </body>
  </html>
`;

const htmlString = await collectResult(render(template));
```

### Streaming with Koa/Express
```typescript
// Source: https://lit.dev/docs/ssr/server-usage/
import { render, html } from '@lit-labs/ssr';
import { RenderResultReadable } from '@lit-labs/ssr/lib/render-result-readable.js';
import './my-element.js';

// Koa example
app.use(async (ctx) => {
  const result = render(html`<my-element></my-element>`);
  ctx.type = 'text/html';
  ctx.body = new RenderResultReadable(result);
});
```

### Client Hydration Setup
```typescript
// Source: https://lit.dev/docs/ssr/client-usage/
// client-entry.ts - MUST be first import!
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

// NOW import components
import '@lit-ui/button';
import '@lit-ui/dialog';

// Components will automatically hydrate when they connect
```

### DSD Polyfill Pattern
```html
<!-- Source: https://lit.dev/docs/ssr/client-usage/ -->
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Hide content until DSD is ready */
    body[dsd-pending] { display: none; }
  </style>
</head>
<body dsd-pending>
  <!-- Inline script runs immediately -->
  <script>
    if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode')) {
      document.body.removeAttribute('dsd-pending');
    }
  </script>

  <!-- SSR content here -->
  <lui-button>Click Me</lui-button>

  <!-- Polyfill for browsers without native DSD -->
  <script type="module">
    if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRootMode')) {
      const { hydrateShadowRoots } = await import(
        '@webcomponents/template-shadowroot/template-shadowroot.js'
      );
      hydrateShadowRoots(document.body);
    }
    document.body.removeAttribute('dsd-pending');
  </script>

  <!-- Hydration support BEFORE component code -->
  <script type="module" src="@lit-labs/ssr-client/lit-element-hydrate-support.js"></script>
  <script type="module" src="/app-components.js"></script>
</body>
</html>
```

### RenderInfo Options
```typescript
// Source: https://lit.dev/docs/ssr/server-usage/
import { render, html } from '@lit-labs/ssr';

const result = render(
  html`<my-element></my-element>`,
  {
    // Defer hydration - elements get defer-hydration attribute
    deferHydration: true,

    // Callback when custom elements are rendered
    customElementRendered: (tagName) => {
      console.log(`Rendered: ${tagName}`);
    }
  }
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `shadowroot` attribute | `shadowrootmode` attribute | Chrome 124 (2024) | Browsers now support streaming DSD |
| Polyfill always needed | Native in all modern browsers | Safari 16.4, Firefox 123 | Polyfill only for legacy |
| @lit-labs/ssr v3.x | @lit-labs/ssr v4.0.0 | 2024 | Improved streaming, thunked render |

**Deprecated/outdated:**
- `shadowroot` attribute (non-standard): Use `shadowrootmode` instead
- `lit-ssr` (unofficial packages): Use official @lit-labs/ssr

## Open Questions

Things that couldn't be fully resolved:

1. **VM Modules vs Global Scope**
   - What we know: VM modules provide isolation but are slower and experimental
   - What's unclear: Whether our use case needs isolation
   - Recommendation: Start with global scope (simpler), document VM option for advanced users

2. **Bundle Format for SSR Package**
   - What we know: SSR code runs only in Node, but may be used with various bundlers
   - What's unclear: Whether to provide both ESM and CJS
   - Recommendation: ESM only, matching other @lit-ui packages

## Sources

### Primary (HIGH confidence)
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) - Official Lit documentation
- [Lit SSR Server Usage](https://lit.dev/docs/ssr/server-usage/) - render() API, RenderResult handling
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) - Hydration, module load order
- [Lit SSR Authoring](https://lit.dev/docs/ssr/authoring/) - isServer usage, lifecycle methods
- [@lit-labs/ssr GitHub](https://github.com/lit/lit/tree/main/packages/labs/ssr) - Package source, RenderInfo interface

### Secondary (MEDIUM confidence)
- npm package info for @lit-labs/ssr (v4.0.0), @lit-labs/ssr-client (v1.1.8)
- [Declarative Shadow DOM web.dev](https://web.dev/articles/declarative-shadow-dom) - DSD polyfill patterns

### Tertiary (LOW confidence)
- Community discussions on GitHub issues regarding edge cases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Lit packages with clear documentation
- Architecture: HIGH - Patterns directly from Lit documentation
- Pitfalls: HIGH - Well-documented in official sources and GitHub issues

**Research date:** 2026-01-24
**Valid until:** 30 days (stable APIs, @lit-labs/ssr is mature)
