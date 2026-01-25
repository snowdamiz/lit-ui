# Phase 17: Framework Integration - Research

**Researched:** 2026-01-24
**Domain:** SSR framework integration (Next.js, Astro, Node.js/Express)
**Confidence:** HIGH

## Summary

This phase creates working SSR examples for Next.js, Astro, and generic Node.js (Express) that demonstrate @lit-ui component usage with server-side rendering. Research confirmed the approach differs significantly per framework:

- **Next.js**: Requires `@lit-labs/nextjs` plugin with `'use client'` boundaries (Lit SSR doesn't work in React Server Components)
- **Astro**: Official `@astrojs/lit` deprecated in Astro 5.0; use community `@semantic-ui/astro-lit` package
- **Node.js/Express**: Direct use of `@lit-ui/ssr` with `renderToString()` or streaming via `RenderResultReadable`

All frameworks share the same hydration requirement: `@lit-ui/ssr/hydration` must be imported BEFORE any component code on the client.

**Primary recommendation:** Use TypeScript for all examples. Follow each framework's latest patterns (Next.js 15+ App Router, Astro 5+, Express 5+). Keep examples minimal but demonstrate Button (simple SSR) + Dialog (complex SSR with showModal guard).

## Standard Stack

### Core (per framework)

| Framework | Version | Key Package | Purpose |
|-----------|---------|-------------|---------|
| Next.js | 15.5+ | `@lit-labs/nextjs` | Deep SSR for Lit in React |
| Astro | 5.16+ | `@semantic-ui/astro-lit` | SSR + hydration integration |
| Express | 5.2+ | `@lit-ui/ssr` | Direct renderToString/streaming |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lit-ui/ssr` | workspace:* | SSR utilities | All examples (server-side) |
| `@lit-ui/button` | workspace:* | Button component | All examples |
| `@lit-ui/dialog` | workspace:* | Dialog component | All examples |
| `typescript` | ^5.9 | Type safety | All examples |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@semantic-ui/astro-lit` | Client-only script tags | No SSR, just client hydration |
| `@lit-labs/nextjs` | Custom wrapper component | More control, more maintenance |
| Express | Koa, Fastify | Express most familiar, widest adoption |

**Installation per example:**

```bash
# Next.js example
pnpm create next-app@latest --typescript
pnpm add @lit-labs/nextjs

# Astro example
pnpm create astro@latest
pnpm add @semantic-ui/astro-lit

# Node.js example
pnpm add express
```

## Architecture Patterns

### Recommended Project Structure

```
examples/
├── nextjs/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Server component (static content)
│   │   └── components/
│   │       └── LitDemo.tsx  # 'use client' wrapper for Lit components
│   ├── next.config.mjs      # withLitSSR plugin config
│   ├── package.json
│   └── README.md
├── astro/
│   ├── src/
│   │   ├── layouts/
│   │   │   └── Layout.astro
│   │   ├── pages/
│   │   │   └── index.astro  # SSR page with client:visible
│   │   └── components/
│   │       └── Demo.ts      # Lit component wrapper
│   ├── astro.config.mjs     # lit() integration
│   ├── package.json
│   └── README.md
└── node/
    ├── src/
    │   ├── server.ts        # Express server with SSR route
    │   ├── template.ts      # HTML template with lit-ui components
    │   └── client.ts        # Client-side hydration entry
    ├── public/
    │   └── client.js        # Bundled client code
    ├── package.json
    └── README.md
```

### Pattern 1: Next.js App Router with 'use client' Boundary

**What:** Lit components must be wrapped in client components because RSC payload serialization breaks Declarative Shadow DOM templates.

**When to use:** Any Next.js 15+ App Router project using Lit components.

**Example:**

```typescript
// app/components/LitDemo.tsx
'use client';

// CRITICAL: Hydration support MUST be imported first
import '@lit-ui/ssr/hydration';
import '@lit-ui/button';
import '@lit-ui/dialog';

export function LitDemo() {
  return (
    <>
      <lui-button variant="primary">Click Me</lui-button>
      <lui-dialog open>
        <span slot="title">Hello</span>
        <p>Dialog content</p>
      </lui-dialog>
    </>
  );
}
```

```javascript
// next.config.mjs
import withLitSSR from '@lit-labs/nextjs';

const nextConfig = {
  reactStrictMode: true,
};

export default withLitSSR()(nextConfig);
```

### Pattern 2: Astro with @semantic-ui/astro-lit

**What:** Astro integration that enables SSR and client hydration for Lit components.

**When to use:** Astro 5+ projects needing SSR'd Lit components.

**Example:**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import lit from '@semantic-ui/astro-lit';

export default defineConfig({
  integrations: [lit()],
  output: 'server', // or 'static' for SSG
});
```

```astro
---
// src/pages/index.astro
import { Button } from '@lit-ui/button';
import { Dialog } from '@lit-ui/dialog';
---
<Button client:visible variant="primary">Click Me</Button>
<Dialog client:visible>
  <span slot="title">Hello</span>
  <p>Dialog content</p>
</Dialog>
```

### Pattern 3: Express with Direct SSR

**What:** Direct use of @lit-ui/ssr for server-side rendering with Express.

**When to use:** Generic Node.js servers, custom SSR setups, any non-framework environment.

**Example:**

```typescript
// src/server.ts
import express from 'express';
import { renderToString, html } from '@lit-ui/ssr';

// Import components to register them
import '@lit-ui/button';
import '@lit-ui/dialog';

const app = express();

app.get('/', async (req, res) => {
  const htmlContent = await renderToString(html`
    <lui-button variant="primary">Click Me</lui-button>
    <lui-dialog>
      <span slot="title">Hello</span>
      <p>Dialog content</p>
    </lui-dialog>
  `);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script type="module" src="/client.js"></script>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);
});

app.listen(3000);
```

```typescript
// src/client.ts
// CRITICAL: Hydration MUST be imported first
import '@lit-ui/ssr/hydration';
import '@lit-ui/button';
import '@lit-ui/dialog';
```

### Anti-Patterns to Avoid

- **Importing Lit components in React Server Components:** Results in hydration mismatch due to `<template>` elements in RSC payload. Always use `'use client'` boundary.
- **Missing hydration import order:** Importing component code before `@lit-ui/ssr/hydration` causes hydration to fail silently. Components work but flash/re-render.
- **Calling showModal() during SSR:** Dialog component already handles this with `isServer` guards, but any custom code must also check.
- **Using deprecated @astrojs/lit:** Was deprecated in Astro 5.0. Use `@semantic-ui/astro-lit` instead.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Next.js SSR integration | Custom webpack config | `@lit-labs/nextjs` | Handles DSD polyfill injection, module transformation, hydration timing |
| Astro SSR integration | Manual shim setup | `@semantic-ui/astro-lit` | Handles browser globals, client directives, polyfills |
| Declarative Shadow DOM polyfill | Inline script | Let framework handle | @lit-labs/nextjs and astro-lit include polyfills automatically |
| Client-side hydration setup | Manual hydrate() calls | `@lit-ui/ssr/hydration` side-effect import | Patches LitElement before any component loads |

**Key insight:** Each framework has specific requirements for how/when hydration support loads. The integration packages encode this knowledge.

## Common Pitfalls

### Pitfall 1: Wrong Import Order for Hydration

**What goes wrong:** Components render on server but flash or re-render incorrectly on client. Hydration mismatch errors in console.

**Why it happens:** `@lit-labs/ssr-client/lit-element-hydrate-support.js` must patch `LitElement` before any component class is defined.

**How to avoid:** Always import hydration support as the FIRST import in client entry point:
```typescript
import '@lit-ui/ssr/hydration';  // FIRST
import '@lit-ui/button';          // Then components
```

**Warning signs:** Console errors about "hydration mismatch", components briefly flash unstyled content, components render twice.

### Pitfall 2: Lit Components in React Server Components

**What goes wrong:** Build fails or hydration errors about `<template>` elements not matching.

**Why it happens:** RSC serialization includes the `<template shadowrootmode="open">` elements in the payload, causing React hydration to fail when trying to match DOM.

**How to avoid:** Always wrap Lit component usage in a file with `'use client'` directive at the top.

**Warning signs:** Error messages mentioning "template" or "hydration mismatch" in Next.js App Router.

### Pitfall 3: Missing Component Registration on Server

**What goes wrong:** Server renders empty custom element tags without shadow DOM content.

**Why it happens:** Custom elements must be imported and registered before `renderToString()` is called.

**How to avoid:** Import component modules at the top of your server file before any rendering code:
```typescript
import '@lit-ui/button';  // Registers lui-button
import '@lit-ui/dialog';  // Registers lui-dialog
// Then render...
```

**Warning signs:** HTML output contains `<lui-button></lui-button>` with no content, no Declarative Shadow DOM template.

### Pitfall 4: Dialog showModal() on Server

**What goes wrong:** Error: "showModal is not a function" or undefined errors during SSR.

**Why it happens:** `HTMLDialogElement.showModal()` is a DOM API that doesn't exist in Node.js.

**How to avoid:** The @lit-ui/dialog component already includes `isServer` guards. For custom code, use:
```typescript
import { isServer } from 'lit';
if (!isServer) {
  dialogEl.showModal();
}
```

**Warning signs:** Errors mentioning "showModal" or "document is not defined" during build or SSR.

### Pitfall 5: Using Deprecated @astrojs/lit

**What goes wrong:** Package doesn't work with Astro 5+, potential security issues with unmaintained code.

**Why it happens:** Official Astro Lit integration was deprecated in Astro 5.0 (late 2024).

**How to avoid:** Use `@semantic-ui/astro-lit` instead, which is the community-maintained continuation.

**Warning signs:** Deprecation warnings, integration errors, SSR not working in Astro 5.

## Code Examples

Verified patterns from official sources and project codebase:

### Client Entry Point (Universal Pattern)

```typescript
// client.ts - Works for any framework
// Source: Lit documentation + @lit-ui/ssr implementation

// CRITICAL: This MUST be the first import
import '@lit-ui/ssr/hydration';

// Then import components
import '@lit-ui/button';
import '@lit-ui/dialog';

// Optional: Any client-side initialization
console.log('Lit components hydrated');
```

### Server Rendering with @lit-ui/ssr

```typescript
// server.ts
// Source: @lit-ui/ssr package API

import { renderToString, html } from '@lit-ui/ssr';

// Register custom elements before rendering
import '@lit-ui/button';
import '@lit-ui/dialog';

async function render() {
  const result = await renderToString(html`
    <lui-button variant="primary">
      <svg slot="icon-start">...</svg>
      Submit
    </lui-button>
  `);
  return result; // Returns HTML string with Declarative Shadow DOM
}
```

### Next.js withLitSSR Configuration

```javascript
// next.config.mjs
// Source: @lit-labs/nextjs documentation

import withLitSSR from '@lit-labs/nextjs';

const nextConfig = {
  reactStrictMode: true,
  // Other Next.js config...
};

// Plugin options (all optional):
// - addDeclarativeShadowDomPolyfill: true (default)
// - webpackModuleRulesTest: RegExp for files to transform
// - exclude: Array of RegExp patterns to skip

export default withLitSSR()(nextConfig);
```

### Astro Component Usage

```astro
---
// src/pages/index.astro
// Source: @semantic-ui/astro-lit documentation

import { Button } from '@lit-ui/button';
import { Dialog } from '@lit-ui/dialog';

// Props passed to components
const buttonVariant = 'primary';
---

<html>
<body>
  <!-- client:visible - hydrates when entering viewport -->
  <Button client:visible variant={buttonVariant}>
    Click Me
  </Button>

  <!-- client:load - hydrates immediately -->
  <Dialog client:load>
    <span slot="title">Modal Title</span>
    <p>Content here</p>
    <div slot="footer">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </div>
  </Dialog>
</body>
</html>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @astrojs/lit | @semantic-ui/astro-lit | Astro 5.0 (late 2024) | Must switch packages for Astro 5+ |
| Pages Router | App Router (Next.js) | Next.js 13+ | Must use 'use client' boundary for Lit |
| render() + collectResult() | renderThunked() | @lit-labs/ssr recent | Lower overhead, but render() still works |
| Express 4.x | Express 5.x | Sept 2024 | Promise support, removed deprecated APIs |
| shadowroot attribute | shadowrootmode attribute | 2023 | Firefox 123 completed browser support |

**Deprecated/outdated:**
- **@astrojs/lit**: Deprecated in Astro 5.0, use @semantic-ui/astro-lit
- **Next.js Pages Router**: Still works but App Router is the modern pattern
- **Express 4.x**: 5.x is now default on npm, 4.x entering LTS

## Open Questions

Things that couldn't be fully resolved:

1. **Streaming vs String rendering in examples**
   - What we know: @lit-ui/ssr supports both `renderToString()` and `RenderResultReadable` for streaming
   - What's unclear: For minimal examples, is streaming complexity worth demonstrating?
   - Recommendation: Use `renderToString()` for simplicity; mention streaming in README for advanced use cases

2. **Astro SSG vs SSR mode in example**
   - What we know: Astro supports both static (SSG) and server (SSR) output modes
   - What's unclear: Should example show both or pick one?
   - Recommendation: Default to `output: 'server'` (SSR) with note that SSG works similarly

3. **TypeScript strictness level**
   - What we know: All frameworks support TypeScript
   - What's unclear: How strict should example tsconfig be?
   - Recommendation: Use moderate strictness (match existing monorepo packages config)

## Sources

### Primary (HIGH confidence)
- [Lit SSR Server Usage](https://lit.dev/docs/ssr/server-usage/) - Core SSR API documentation
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) - SSR concepts and hydration
- [@lit-labs/nextjs GitHub](https://github.com/lit/lit/tree/main/packages/labs/nextjs) - Next.js integration source
- [@semantic-ui/astro-lit GitHub](https://github.com/Semantic-Org/Astro-Lit) - Astro 5+ integration
- [Next.js App Router Docs](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Server/Client component patterns
- [Astro Lit Integration Docs](https://docs.astro.build/en/guides/integrations-guide/lit/) - Deprecation notice and alternatives

### Secondary (MEDIUM confidence)
- [Express 5.1.0 Release](https://expressjs.com/2025/03/31/v5-1-latest-release.html) - Express 5 official announcement
- [Web Components SSR with Next.js (DEV.to)](https://dev.to/hasanirogers/web-components-and-ssr-with-nextjs-13b4) - Community patterns verified against official docs
- [Declarative Shadow DOM (web.dev)](https://web.dev/articles/declarative-shadow-dom) - DSD specification and polyfill info

### Tertiary (LOW confidence)
- GitHub issues/discussions about hydration edge cases - specific issues vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation and working packages confirmed
- Architecture: HIGH - Patterns verified against official examples and project codebase
- Pitfalls: HIGH - Documented in official sources and issue trackers

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - frameworks stable, minor version updates expected)
