# Lit UI + Vue Example

This example demonstrates using Lit UI components with Vue 3.5 and Vite.

## Setup from Scratch (CLI Workflow)

```bash
# Create a new Vite Vue project
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app

# Initialize Lit UI (choose npm mode)
npx lit-ui init

# Add components
npx lit-ui add button dialog
```

## Quick Start (This Example)

```bash
cd examples/vue
pnpm install
pnpm dev
```

Open http://localhost:5173 to see the demo.

## What This Shows

- Button click counter (demonstrates event handling with Vue reactivity)
- Dialog open/close with `show()`/`close()` APIs
- CSS custom property theming (`--lui-button-radius`)
- Composition API with `<script setup>`
- TypeScript types provided automatically by component packages

## Key Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point with hydration import |
| `src/components/LitDemo.vue` | Demo component with button and dialog |
| `vite.config.ts` | Vite + Vue configuration with custom element handling |
| `lit-ui.config.json` | Lit UI CLI configuration |

## Important: Vite Configuration

Configure Vue to recognize Lit UI custom elements:

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat lui-* tags as custom elements
          isCustomElement: (tag) => tag.startsWith('lui-'),
        },
      },
    }),
  ],
});
```

## Important: Hydration Import Order

In your entry file, the hydration support **must** be imported before any Lit component code:

```ts
// FIRST: Import hydration support
import '@lit-ui/ssr/hydration';

// THEN: Import components
import '@lit-ui/button';
import '@lit-ui/dialog';

// THEN: Import Vue and your app
import { createApp } from 'vue';
import App from './App.vue';
```

## Template Refs for Dialog Control

Use Vue template refs with the `Dialog` type to access the dialog's `show()` and `close()` APIs:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Dialog } from '@lit-ui/dialog';

const dialogOpen = ref(false);
const dialogRef = ref<Dialog | null>(null);

watch(dialogOpen, (isOpen) => {
  const dialog = dialogRef.value;
  if (!dialog) return;
  if (isOpen) dialog.show();
  else dialog.close();
});
</script>

<template>
  <lui-dialog ref="dialogRef">...</lui-dialog>
</template>
```

## Learn More

- [Lit Documentation](https://lit.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
