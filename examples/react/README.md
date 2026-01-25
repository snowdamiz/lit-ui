# Lit UI + React Example

This example demonstrates using Lit UI components with React 19 and Vite.

## Setup from Scratch (CLI Workflow)

```bash
# Create a new Vite React project
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app

# Initialize Lit UI (choose npm mode)
npx lit-ui init

# Add components
npx lit-ui add button dialog
```

## Quick Start (This Example)

```bash
cd examples/react
pnpm install
pnpm dev
```

Open http://localhost:5173 to see the demo.

## What This Shows

- Button click counter (demonstrates event handling)
- Dialog open/close with `show()`/`close()` APIs
- CSS custom property theming (`--lui-button-radius`)
- TypeScript types provided automatically by component packages

## Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Entry point with hydration import |
| `src/components/LitDemo.tsx` | Demo component with button and dialog |
| `vite.config.ts` | Vite + React configuration |
| `lit-ui.config.json` | Lit UI CLI configuration |

## Important: Hydration Import Order

In your entry file, the hydration support **must** be imported before any Lit component code:

```tsx
// FIRST: Import hydration support
import '@lit-ui/ssr/hydration';

// THEN: Import components
import '@lit-ui/button';
import '@lit-ui/dialog';

// THEN: Import React and your app
import { createRoot } from 'react-dom/client';
import App from './App';
```

## TypeScript Support

TypeScript types for custom elements are automatically provided when you import the component packages. No manual type declarations needed:

```tsx
import '@lit-ui/button';
import '@lit-ui/dialog';
import type { Dialog } from '@lit-ui/dialog';

// JSX types work automatically
<lui-button variant="primary">Click me</lui-button>

// Use Dialog type for refs
const dialogRef = useRef<Dialog>(null);
```

## Learn More

- [Lit Documentation](https://lit.dev/)
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
