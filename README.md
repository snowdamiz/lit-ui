<div align="center">
  <img src="docs/public/logo-icon.svg" alt="lit-ui" width="100" height="100">
  <h1>lit-ui</h1>
  <p><strong>One component library. Every framework.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
  [![Lit](https://img.shields.io/badge/Lit-3.x-purple.svg)](https://lit.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)

  <br />

  Build your UI once with [Lit](https://lit.dev/) web components and use it everywhere—React, Vue, Svelte, Angular, or plain HTML. No wrappers, no adapters, no framework lock-in.

  <br />

  [Documentation](https://lit-ui.dev) · [Components](#components) · [Examples](#framework-examples)

</div>

<br />

## Why lit-ui?

Most component libraries force you to pick a framework and stick with it. If your team uses React today but migrates to Vue tomorrow, you rewrite your UI.

**lit-ui** solves this:

- **True interoperability** — Web components work natively in any framework
- **Tailwind CSS v4** — Modern styling with design tokens
- **Accessible** — ARIA, keyboard navigation, focus management
- **TypeScript** — Full type definitions included
- **Dark mode** — Built-in theme support

## Installation

```bash
npm install lit-ui lit
```

Or use the CLI:

```bash
npx lit-ui init
npx lit-ui add button dialog
```

## Quick Start

```js
import 'lit-ui/button';
```

```html
<ui-button variant="primary">Click me</ui-button>
```

Works the same in React, Vue, Svelte, or vanilla HTML.

## Components

### Button

```html
<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Delete</ui-button>
```

### Dialog

```html
<ui-dialog id="my-dialog">
  <span slot="title">Confirm</span>
  <p>Are you sure?</p>
  <div slot="footer">
    <ui-button variant="ghost">Cancel</ui-button>
    <ui-button variant="primary">Confirm</ui-button>
  </div>
</ui-dialog>
```

## Framework Examples

### React

```tsx
import 'lit-ui/button';

function App() {
  return <ui-button onClick={() => alert('Clicked!')}>Click me</ui-button>;
}
```

### Vue

```vue
<script setup>
import 'lit-ui/button';
</script>

<template>
  <ui-button @click="handleClick">Click me</ui-button>
</template>
```

### Svelte

```svelte
<script>
  import 'lit-ui/button';
</script>

<ui-button on:click={() => alert('Clicked!')}>Click me</ui-button>
```

### HTML

```html
<script type="module" src="https://unpkg.com/lit-ui/dist/button.js"></script>

<ui-button>Click me</ui-button>
```

## Theming

Customize with CSS custom properties:

```css
:root {
  --color-primary: oklch(0.55 0.2 250);
  --color-background: oklch(0.99 0.005 250);
  --radius-md: 0.5rem;
}
```

## Roadmap

- [ ] Input
- [ ] Select
- [ ] Checkbox / Radio
- [ ] Tabs
- [ ] Toast
- [ ] Tooltip
- [ ] Popover

## Contributing

```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server
pnpm build      # Build library
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
