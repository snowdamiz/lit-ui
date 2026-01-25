# Node.js/Express SSR Example

Server-side rendering @lit-ui components in a generic Node.js environment.

## Setup from Scratch (CLI Workflow)

```bash
# Create a new project
mkdir my-node-app && cd my-node-app
npm init -y

# Initialize Lit UI (choose npm mode)
npx lit-ui init

# Add components
npx lit-ui add button dialog

# Install Express and dev dependencies
npm install express
npm install -D typescript tsx vite
```

## Quick Start (This Example)

```bash
cd examples/node
pnpm install
pnpm build    # Build client bundle
pnpm dev      # Start server
```

Open http://localhost:3000

## What This Shows

- **Server rendering** with `@lit-ui/ssr` - components rendered to HTML with Declarative Shadow DOM
- **Client hydration** with proper import order - existing DOM becomes interactive
- **Theme customization** - CSS custom properties work in SSR

## Key Files

| File | Purpose |
|------|---------|
| `src/server.ts` | Express server, renders components with `renderToString` |
| `src/client.ts` | Client entry, hydrates server-rendered DOM |

## Hydration Import Order

**The `@lit-ui/ssr/hydration` import MUST come first.**

```typescript
// client.ts - CORRECT
import '@lit-ui/ssr/hydration';  // First!
import '@lit-ui/button';
import '@lit-ui/dialog';

// client.ts - WRONG (components won't hydrate)
import '@lit-ui/button';
import '@lit-ui/ssr/hydration';  // Too late!
```

The hydration module patches `LitElement` to recognize Declarative Shadow DOM. If components load first, they create new shadow roots instead of adopting the server-rendered ones.

## Learn More

See the [lit-ui documentation](https://lit-ui.dev) for SSR deep dives and framework-specific guides.
