# @lit-ui/ssr

Server-side rendering utilities for @lit-ui components. Provides render-to-string, Declarative Shadow DOM output, and client-side hydration support.

## Installation

```bash
npm install @lit-ui/ssr @lit-labs/ssr @lit-labs/ssr-client lit
```

## Quick Start

### Server-Side Rendering

```typescript
import { renderToString, html } from '@lit-ui/ssr';
import '@lit-ui/button';
import '@lit-ui/input';

const markup = await renderToString(html`
  <lui-button variant="primary">Click Me</lui-button>
  <lui-input type="email" label="Email" placeholder="you@example.com"></lui-input>
`);

// Returns HTML string with Declarative Shadow DOM templates
```

### Client-Side Hydration

Hydration support **must be the first import** in your client entry point:

```typescript
// Must be first import!
import '@lit-ui/ssr/hydration';

// Then import components
import '@lit-ui/button';
import '@lit-ui/dialog';
import '@lit-ui/input';
```

## Exports

### Main (`@lit-ui/ssr`)

| Export | Type | Description |
|--------|------|-------------|
| `render(template, options?)` | Function | Render Lit template to stream |
| `html` | Tagged template | Create SSR-compatible templates |
| `collectResult(result)` | `Promise<string>` | Collect render stream to string |
| `collectResultSync(result)` | `string` | Synchronous stream collection |
| `RenderResultReadable` | Class | Node.js Readable stream for responses |
| `renderToString(template, options?)` | `Promise<string>` | Convenience: render + collect |

### Hydration (`@lit-ui/ssr/hydration`)

| Export | Description |
|--------|-------------|
| `hydrate()` | Manual hydration function |

Importing this module auto-registers `@lit-labs/ssr-client` support.

### Types (`@lit-ui/ssr`)

| Export | Description |
|--------|-------------|
| `RenderInfo` | Render configuration options |
| `RenderResult` | Iterable result from `render()` |

## Framework Integration

### Express / Node.js

```typescript
import express from 'express';
import { renderToString, html } from '@lit-ui/ssr';
import '@lit-ui/button';

const app = express();

app.get('/', async (req, res) => {
  const content = await renderToString(html`
    <lui-button variant="primary">Server Rendered</lui-button>
  `);
  res.send(`<!DOCTYPE html>
    <html>
      <body>${content}</body>
      <script type="module">
        import '@lit-ui/ssr/hydration';
        import '@lit-ui/button';
      </script>
    </html>
  `);
});
```

### Next.js (App Router)

```typescript
// app/layout.tsx
import '@lit-ui/ssr/hydration';
import '@lit-ui/button';
```

### Astro

```astro
---
import '@lit-ui/button';
---
<lui-button client:load variant="primary">Astro Button</lui-button>
```

## SSR Behavior

All @lit-ui components detect server vs client environment:

- **Server**: Generates inline `<style>` tags inside `<template shadowrootmode="open">` (Declarative Shadow DOM)
- **Client**: Uses constructable stylesheets (parsed once, shared across instances)
- **DOM APIs**: Components guard `showModal()`, `ElementInternals`, and other client-only APIs with `isServer` checks

## Server Detection

```typescript
import { isServer } from '@lit-ui/core';

if (isServer) {
  // Server-side only
} else {
  // Client-side only
}
```

## Peer Dependencies

- `lit` ^3.0.0
- `@lit-labs/ssr` ^4.0.0
- `@lit-labs/ssr-client` ^1.1.0

## License

MIT
