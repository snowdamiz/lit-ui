# @lit-ui/core

SSR-aware base component and utilities for Lit web components with Tailwind styling.

## Installation

```bash
npm install @lit-ui/core
```

## Quick Start

Extend `TailwindElement` for components that use Tailwind CSS in Shadow DOM:

```typescript
import { TailwindElement } from '@lit-ui/core';
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-component')
export class MyComponent extends TailwindElement {
  render() {
    return html`
      <div class="p-4 bg-primary text-primary-foreground rounded">
        Hello World
      </div>
    `;
  }
}
```

## Features

- **SSR Compatible**: Automatic inline styles for server-side rendering
- **Tailwind Integration**: Constructable stylesheets for Shadow DOM
- **Design Tokens**: Access tokens via `@lit-ui/core/tokens`
- **FOUC Prevention**: Import `@lit-ui/core/fouc.css` for flash-free loading

## Documentation

Full documentation: [https://lit-ui.dev](https://lit-ui.dev)

## License

MIT
