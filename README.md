<div align="center">

# lit-ui

**One component library. Every framework.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Lit](https://img.shields.io/badge/Lit-3.x-purple.svg)](https://lit.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)

</div>

---

A modern, accessible component library built on [Lit](https://lit.dev/) web components with [Tailwind CSS v4](https://tailwindcss.com/) styling. Write once, use everywhere—React, Vue, Svelte, or plain HTML.

## Features

- **Framework Agnostic** — Works seamlessly in React, Vue, Svelte, Angular, or plain HTML
- **Tailwind CSS v4** — Modern utility-first styling with CSS custom properties and design tokens
- **Accessible** — ARIA attributes, keyboard navigation, and focus management built-in
- **TypeScript** — Full type definitions included for excellent DX
- **CLI Installation** — ShadCN-inspired `npx` commands for quick setup
- **Dark Mode** — Built-in dark mode support via CSS custom properties

## Quick Start

```bash
# Initialize in your project
npx lit-ui init

# Add components
npx lit-ui add button
npx lit-ui add dialog
```

## Components

| Component | Description |
|-----------|-------------|
| **Button** | 5 variants (primary, secondary, outline, ghost, destructive), 3 sizes, loading states, icon slots |
| **Dialog** | Modal with native focus trap, enter/exit animations, backdrop click, nested dialog support |

## Usage

### React

```tsx
import 'lit-ui/button';

function App() {
  return (
    <ui-button variant="primary" onClick={() => console.log('clicked')}>
      Click me
    </ui-button>
  );
}
```

### Vue

```vue
<script setup>
import 'lit-ui/button';
</script>

<template>
  <ui-button variant="primary" @click="handleClick">
    Click me
  </ui-button>
</template>
```

### Svelte

```svelte
<script>
  import 'lit-ui/button';
</script>

<ui-button variant="primary" on:click={() => console.log('clicked')}>
  Click me
</ui-button>
```

### HTML

```html
<script type="module" src="https://unpkg.com/lit-ui/dist/button.js"></script>

<ui-button variant="primary">Click me</ui-button>

<script>
  document.querySelector('ui-button').addEventListener('click', () => {
    console.log('clicked');
  });
</script>
```

## Documentation

Visit the [documentation site](https://lit-ui.dev) for full API reference, examples, and guides.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Found a bug or have a feature request? [Open an issue](https://github.com/user/lit-ui/issues).

## License

[MIT](LICENSE)
