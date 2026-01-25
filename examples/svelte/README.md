# Lit UI + Svelte Example

This example demonstrates using Lit UI components with SvelteKit and Svelte 5.

## Setup from Scratch (CLI Workflow)

```bash
# Create a new SvelteKit project
npx sv create my-svelte-app
cd my-svelte-app

# Initialize Lit UI (choose npm mode)
npx lit-ui init

# Add components
npx lit-ui add button dialog
```

## Quick Start (This Example)

```bash
cd examples/svelte
pnpm install
pnpm dev
```

Open http://localhost:5173 to see the demo.

## What This Shows

- Button click counter (demonstrates event handling with Svelte 5 runes)
- Dialog open/close with `show()`/`close()` APIs
- CSS custom property theming (`--lui-button-radius`)
- Svelte 5 `$state()` and `$effect()` runes
- TypeScript types provided automatically by component packages

## Key Files

| File | Purpose |
|------|---------|
| `src/routes/+layout.svelte` | Hydration imports (client-side only) |
| `src/lib/components/LitDemo.svelte` | Demo component with button and dialog |
| `svelte.config.js` | SvelteKit configuration |
| `lit-ui.config.json` | Lit UI CLI configuration |

## Important: Client-Side Hydration

In SvelteKit, imports need to happen client-side only. Use the `browser` check:

```svelte
<script lang="ts">
  import { browser } from '$app/environment';

  if (browser) {
    import('@lit-ui/ssr/hydration').then(() => {
      import('@lit-ui/button');
      import('@lit-ui/dialog');
    });
  }
</script>
```

## Svelte 5 Runes for State

Use `$state()` for reactive state, `bind:this` for element refs, and import the `Dialog` type:

```svelte
<script lang="ts">
  import type { Dialog } from '@lit-ui/dialog';

  let count = $state(0);
  let dialogRef: Dialog | undefined = $state();

  $effect(() => {
    if (dialogRef) {
      // Access dialog APIs with full type support
      dialogRef.show();
      dialogRef.close();
    }
  });
</script>

<lui-button onclick={() => count++}>
  Clicked {count} times
</lui-button>

<lui-dialog bind:this={dialogRef}>...</lui-dialog>
```

TypeScript types for custom elements are automatically provided when you import the component packages. No manual type declarations needed.

## Learn More

- [Lit Documentation](https://lit.dev/)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
