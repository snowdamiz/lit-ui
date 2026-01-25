# @lit-ui/ssr

Server-side rendering utilities for @lit-ui components.

## Installation

```bash
npm install @lit-ui/ssr @lit-labs/ssr
```

## Quick Start

### Server-Side Rendering

```typescript
import { renderToString } from '@lit-ui/ssr';
import '@lit-ui/button';

const html = await renderToString('<lui-button>Click me</lui-button>');
// Returns HTML with Declarative Shadow DOM
```

### Client-Side Hydration

Import hydration support before any Lit components:

```typescript
// Must be first import!
import '@lit-ui/ssr/hydration';

// Then import components
import '@lit-ui/button';
import '@lit-ui/dialog';
```

## Server Detection

```typescript
import { isServer } from '@lit-ui/ssr';

if (isServer) {
  // Server-only code
} else {
  // Client-only code
}
```

## Framework Integration

See framework-specific examples:
- [Next.js](https://github.com/user/lit-ui/tree/main/examples/nextjs)
- [Astro](https://github.com/user/lit-ui/tree/main/examples/astro)
- [Express](https://github.com/user/lit-ui/tree/main/examples/express)

## Documentation

Full documentation: [https://lit-ui.dev](https://lit-ui.dev)

## License

MIT
