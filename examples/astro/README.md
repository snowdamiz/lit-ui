# Astro SSR Example

This example demonstrates how to use @lit-ui components with Astro 5+ and server-side rendering.

## Quick Start

```bash
cd examples/astro
pnpm install
pnpm dev
```

Open http://localhost:4321 to see the demo.

## What This Shows

- Lit components server-rendered with Declarative Shadow DOM
- Client-side hydration via script tag imports
- Button click handlers working after hydration
- Dialog open/close functionality after hydration
- CSS custom property theming

## Key Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro config with `@semantic-ui/astro-lit` integration |
| `src/pages/index.astro` | Demo page with Button and Dialog components |
| `src/layouts/Layout.astro` | Base HTML layout |

## How SSR Works with Astro

For self-registering custom elements like @lit-ui components:

1. **Import in frontmatter** - Registers components for SSR
2. **Use custom element tags** - Just like regular HTML
3. **Import in script tag** - Hydrates on the client

```astro
---
// 1. Import for SSR (registers custom elements)
import '@lit-ui/button';
import '@lit-ui/dialog';
---

<!-- 2. Use as regular HTML elements -->
<lui-button variant="primary">Click Me</lui-button>
<lui-dialog>...</lui-dialog>

<script>
  // 3. Import for client hydration
  import '@lit-ui/ssr/hydration'; // MUST be first!
  import '@lit-ui/button';
  import '@lit-ui/dialog';
</script>
```

## Hydration Import Order

In the client-side `<script>` tag, `@lit-ui/ssr/hydration` **must be the first import**:

```astro
<script>
  // FIRST: Patches LitElement for hydration
  import '@lit-ui/ssr/hydration';

  // THEN: Import components
  import '@lit-ui/button';
  import '@lit-ui/dialog';
</script>
```

This is the same requirement as in Node.js and Next.js - the hydration support must patch `LitElement` before any component classes are defined.

**Note:** Unlike Node.js/Next.js where this goes in a single entry file, Astro bundles scripts per-page, so the hydration import goes in each page's `<script>` tag.

## @astrojs/lit Deprecation

The official `@astrojs/lit` package was deprecated in Astro 5.0. This example uses `@semantic-ui/astro-lit`, the community-maintained continuation that supports Astro 5+ with full SSR.

```js
// astro.config.mjs
import lit from '@semantic-ui/astro-lit';

export default defineConfig({
  integrations: [lit()],
  output: 'server', // or 'static' for SSG
});
```

## Output Modes

Astro supports two output modes that both work with Lit components:

- **`server`** (SSR): Renders pages on each request
- **`static`** (SSG): Pre-renders pages at build time

This example uses `server` mode to demonstrate SSR, but you can change to `static` for static site generation.

## Learn More

- [Lit SSR Documentation](https://lit.dev/docs/ssr/overview/)
- [Astro Integration Guide](https://docs.astro.build/en/guides/integrations-guide/)
- [@semantic-ui/astro-lit](https://github.com/Semantic-Org/Astro-Lit)
