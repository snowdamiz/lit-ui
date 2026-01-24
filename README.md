<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/public/logo-icon.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/public/logo-icon.svg">
  <img alt="lit-ui logo" src="docs/public/logo-icon.svg" width="80" height="80">
</picture>

# lit-ui

**One component library. Every framework.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.x-purple.svg)](https://lit.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)

---

Build your UI once with [Lit](https://lit.dev/) web components and use it everywhere—React, Vue, Svelte, Angular, or plain HTML. No wrappers, no adapters, no framework lock-in.

## Why lit-ui?

Most component libraries force you to pick a framework and stick with it. If your team uses React today but migrates to Vue tomorrow, you rewrite your UI. If you maintain multiple apps in different frameworks, you maintain multiple component sets.

**lit-ui** is different:

- **True interoperability** — Web components work natively in any framework without wrappers
- **Tailwind CSS v4** — Modern styling with design tokens and CSS custom properties
- **Accessibility built-in** — ARIA, keyboard navigation, focus management, screen reader support
- **Shadow DOM encapsulation** — Styles never leak or conflict with your app
- **Form integration** — Components participate in native form submission via ElementInternals

## Installation

```bash
# npm
npm install lit-ui lit

# pnpm
pnpm add lit-ui lit

# yarn
yarn add lit-ui lit
```

Or use the CLI for a guided setup:

```bash
npx lit-ui init
npx lit-ui add button dialog
```

## Quick Start

Import a component and use it:

```js
import 'lit-ui/button';
```

```html
<ui-button variant="primary">Click me</ui-button>
```

That's it. Works the same in React, Vue, Svelte, or vanilla HTML.

## Components

### Button

Versatile button with multiple variants, sizes, loading states, and icon support.

```html
<!-- Variants -->
<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Destructive</ui-button>

<!-- Sizes -->
<ui-button size="sm">Small</ui-button>
<ui-button size="md">Medium</ui-button>
<ui-button size="lg">Large</ui-button>

<!-- States -->
<ui-button loading>Loading...</ui-button>
<ui-button disabled>Disabled</ui-button>

<!-- With icons -->
<ui-button>
  <svg slot="icon-start">...</svg>
  Save
</ui-button>
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable interaction |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Form button type |

### Dialog

Accessible modal dialog with focus trapping, animations, and backdrop handling.

```html
<ui-dialog id="my-dialog">
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to continue?</p>
  <div slot="footer">
    <ui-button variant="ghost" onclick="this.closest('ui-dialog').close()">
      Cancel
    </ui-button>
    <ui-button variant="primary">Confirm</ui-button>
  </div>
</ui-dialog>

<ui-button onclick="document.getElementById('my-dialog').open = true">
  Open Dialog
</ui-button>
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `open` | `boolean` | `false` | Dialog visibility |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Max width of dialog |
| `showClose` | `boolean` | `true` | Show close button |
| `closeOnBackdrop` | `boolean` | `true` | Close when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |

| Slot | Description |
|------|-------------|
| `title` | Dialog header content |
| (default) | Main dialog content |
| `footer` | Footer with action buttons |

## Framework Examples

### React

```tsx
import 'lit-ui/button';
import 'lit-ui/dialog';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <ui-button variant="primary" onClick={() => setDialogOpen(true)}>
        Open Dialog
      </ui-button>

      <ui-dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <span slot="title">Hello from React</span>
        <p>This dialog works natively in React.</p>
      </ui-dialog>
    </>
  );
}
```

### Vue

```vue
<script setup>
import { ref } from 'vue';
import 'lit-ui/button';
import 'lit-ui/dialog';

const dialogOpen = ref(false);
</script>

<template>
  <ui-button variant="primary" @click="dialogOpen = true">
    Open Dialog
  </ui-button>

  <ui-dialog
    :open="dialogOpen"
    @close="dialogOpen = false"
  >
    <span slot="title">Hello from Vue</span>
    <p>This dialog works natively in Vue.</p>
  </ui-dialog>
</template>
```

### Svelte

```svelte
<script>
  import 'lit-ui/button';
  import 'lit-ui/dialog';

  let dialogOpen = false;
</script>

<ui-button variant="primary" on:click={() => dialogOpen = true}>
  Open Dialog
</ui-button>

<ui-dialog
  open={dialogOpen}
  on:close={() => dialogOpen = false}
>
  <span slot="title">Hello from Svelte</span>
  <p>This dialog works natively in Svelte.</p>
</ui-dialog>
```

### Vanilla HTML

```html
<script type="module">
  import 'https://unpkg.com/lit-ui/dist/button.js';
  import 'https://unpkg.com/lit-ui/dist/dialog.js';
</script>

<ui-button variant="primary" id="open-btn">Open Dialog</ui-button>

<ui-dialog id="my-dialog">
  <span slot="title">Hello</span>
  <p>This dialog works in plain HTML.</p>
</ui-dialog>

<script>
  const btn = document.getElementById('open-btn');
  const dialog = document.getElementById('my-dialog');

  btn.addEventListener('click', () => dialog.open = true);
  dialog.addEventListener('close', () => console.log('Dialog closed'));
</script>
```

## Theming

lit-ui uses CSS custom properties for theming. Override them in your stylesheet:

```css
:root {
  /* Colors */
  --color-primary: oklch(0.55 0.2 250);
  --color-primary-foreground: oklch(0.98 0.01 250);
  --color-background: oklch(0.99 0.005 250);
  --color-foreground: oklch(0.15 0.02 250);

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* Dark mode */
[data-theme="dark"] {
  --color-background: oklch(0.15 0.02 250);
  --color-foreground: oklch(0.95 0.01 250);
}
```

## Browser Support

lit-ui works in all modern browsers that support:

- Custom Elements v1
- Shadow DOM v1
- CSS Custom Properties
- ES Modules

This includes Chrome, Firefox, Safari, and Edge (Chromium).

## Documentation

Full API reference, interactive examples, and guides available at **[lit-ui.dev](https://lit-ui.dev)**

## Roadmap

Upcoming components:

- [ ] Input / TextField
- [ ] Select / Dropdown
- [ ] Checkbox / Radio
- [ ] Tabs
- [ ] Toast / Notification
- [ ] Tooltip
- [ ] Popover
- [ ] Card
- [ ] Avatar

## Contributing

Contributions welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-component`
3. Make your changes with tests
4. Commit: `git commit -m 'feat: add new component'`
5. Push: `git push origin feature/new-component`
6. Open a Pull Request

### Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build library
pnpm build

# Run docs site
pnpm --filter docs dev
```

Found a bug? Have a feature request? [Open an issue](https://github.com/user/lit-ui/issues).

## License

[MIT](LICENSE) — use it however you want.
