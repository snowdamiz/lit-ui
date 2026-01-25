# Next.js App Router SSR Example

This example demonstrates server-side rendering (SSR) of Lit UI components in Next.js 15+ using the App Router.

## Quick Start

```bash
cd examples/nextjs
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## What This Shows

- **Button component** with click counter (demonstrates hydration works)
- **Dialog component** with open/close (demonstrates complex SSR with showModal)
- **CSS custom property theming** (demonstrates customization)
- **No hydration mismatch errors** in the browser console

## Key Files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Wraps config with `withLitSSR` plugin |
| `app/components/LitDemo.tsx` | Client component wrapper for Lit components |
| `app/page.tsx` | Server Component that imports the client component |

## Important: 'use client' Boundary

Lit components **must** be used inside a Client Component (with `'use client'` directive). This is required because:

1. **React Server Components can't serialize Declarative Shadow DOM templates.** When RSC serializes component output, it includes the `<template shadowrootmode="open">` elements in the RSC payload.

2. **Hydration fails when React reconciles the DOM.** The RSC payload shape doesn't match the actual DOM structure after the DSD templates have been applied.

The pattern is:
- Create a Client Component file with `'use client'` at the top
- Import and use Lit components only in that file
- Import the Client Component into your Server Components

## Important: Hydration Import Order

In your Client Component, the hydration support **must** be imported before any Lit component code:

```tsx
'use client';

// FIRST: Import hydration support
import '@lit-ui/ssr/hydration';

// THEN: Import components
import '@lit-ui/button';
import '@lit-ui/dialog';
```

If you import components before the hydration module, hydration will fail silently - components will still render but may flash or re-render incorrectly.

## How It Works

1. **withLitSSR plugin** (`next.config.mjs`) - Enables Lit SSR in Next.js by injecting the Declarative Shadow DOM polyfill and transforming modules appropriately.

2. **Client boundary** (`LitDemo.tsx`) - Contains all Lit component usage inside a `'use client'` component to avoid RSC serialization issues.

3. **Hydration import** - The `@lit-ui/ssr/hydration` import patches LitElement before component classes load, enabling proper client-side hydration.

## Learn More

For a deep dive into Lit SSR patterns and advanced usage:
- [Lit SSR Documentation](https://lit.dev/docs/ssr/overview/)
- [@lit-labs/nextjs README](https://www.npmjs.com/package/@lit-labs/nextjs)
