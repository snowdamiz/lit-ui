# @lit-ui/core

SSR-aware base component and utilities for building Lit web components with Tailwind CSS styling in Shadow DOM.

## Installation

```bash
npm install @lit-ui/core lit
```

## Quick Start

Extend `TailwindElement` to create components that use Tailwind CSS inside Shadow DOM:

```typescript
import { TailwindElement } from '@lit-ui/core';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-card')
export class MyCard extends TailwindElement {
  @property() heading = '';

  render() {
    return html`
      <div class="p-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h2 class="text-lg font-semibold">${this.heading}</h2>
        <slot></slot>
      </div>
    `;
  }
}
```

## Exports

### Main (`@lit-ui/core`)

| Export | Type | Description |
|--------|------|-------------|
| `TailwindElement` | Class | Base class extending `LitElement` with Tailwind Shadow DOM support |
| `tailwindBaseStyles` | `CSSResultGroup` | CSS array for subclass static styles |
| `isServer` | `boolean` | SSR detection flag (re-exported from Lit) |
| `dispatchCustomEvent()` | Function | Typed custom event dispatch helper |
| `hasConstructableStylesheets` | `boolean` | Feature detection for constructable stylesheets |

### Tokens (`@lit-ui/core/tokens`)

| Export | Type | Description |
|--------|------|-------------|
| `tokens` | Object | Design token references for CSS custom properties |

### Utils (`@lit-ui/core/utils`)

| Export | Type | Description |
|--------|------|-------------|
| `dispatchCustomEvent()` | Function | Type-safe custom event dispatcher |
| `isServer` | `boolean` | SSR environment detection |
| `hasConstructableStylesheets` | `boolean` | Browser feature detection |

### FOUC Prevention (`@lit-ui/core/fouc.css`)

CSS import that prevents Flash of Unstyled Content while components hydrate.

```css
@import '@lit-ui/core/fouc.css';
```

## TailwindElement

The base class handles:

- **Constructable stylesheets**: Parses Tailwind CSS once, shares across all component instances
- **SSR dual-mode styling**: Inline CSS for server-side rendering, constructable stylesheets for client
- **@property workaround**: Extracts CSS `@property` rules from Tailwind and applies them at document level (required because Shadow DOM cannot declare `@property`)
- **:root extraction**: Pulls `:root` and `.dark` rules from Tailwind CSS and applies them globally so component tokens work
- **Host defaults**: Provides fallback values for Tailwind CSS custom properties inside Shadow DOM

## Design Tokens

Access design tokens programmatically:

```typescript
import { tokens } from '@lit-ui/core/tokens';

// Color tokens
tokens.color.primary        // 'var(--color-primary)'
tokens.color.background     // 'var(--color-background)'
tokens.color.destructive    // 'var(--color-destructive)'

// Spacing tokens
tokens.spacing[4]           // 'var(--spacing-4)'

// Radius tokens
tokens.radius.md            // 'var(--radius-md)'
tokens.radius.full          // 'var(--radius-full)'

// Shadow tokens
tokens.shadow.md            // 'var(--shadow-md)'

// Component-specific tokens
tokens.input.bg             // 'var(--ui-input-bg)'
tokens.input.borderFocus    // 'var(--ui-input-border-focus)'
tokens.select.dropdownBg    // 'var(--ui-select-dropdown-bg)'
```

### Available Token Categories

| Category | Examples | CSS Variable Pattern |
|----------|----------|---------------------|
| `color` | primary, secondary, destructive, muted, accent, background, foreground, border, input, ring, card | `--color-*` |
| `spacing` | 0, px, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 | `--spacing-*` |
| `radius` | none, sm, md, lg, xl, 2xl, 3xl, full | `--radius-*` |
| `shadow` | xs, sm, md, lg, xl, 2xl | `--shadow-*` |
| `fontFamily` | sans, mono | `--font-*` |
| `zIndex` | 0, 10, 20, 30, 40, 50 | `--z-*` |
| `input` | 27 properties for input/textarea sizing, colors, states | `--ui-input-*` |
| `textarea` | Mirrors input token structure | `--ui-input-*` (shared) |
| `select` | 40+ properties for dropdown styling | `--ui-select-*` |

## SSR Support

TailwindElement automatically detects server vs client rendering:

- **Server**: Generates inline `<style>` tags inside Declarative Shadow DOM
- **Client**: Uses constructable stylesheets (parsed once, shared across instances)

```typescript
import { isServer } from '@lit-ui/core';

if (isServer) {
  // Server-only logic
}
```

Components should guard DOM API calls:

```typescript
if (!isServer) {
  this.shadowRoot?.querySelector('dialog')?.showModal();
}
```

## Dark Mode

Components respond to a `.dark` class on any ancestor element:

```html
<html class="dark">
  <body>
    <lui-button variant="primary">Dark mode button</lui-button>
  </body>
</html>
```

The core package extracts `.dark` rules from Tailwind CSS and applies them at document level using `:host-context(.dark)` for Shadow DOM compatibility.

## Peer Dependencies

- `lit` ^3.0.0

## License

MIT
