# Stack Research

**Domain:** Framework-agnostic Web Component Library (Lit + Tailwind + CLI Distribution)
**Researched:** 2026-01-23
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Lit | ^3.3.x | Web component framework | Industry standard for web components. 5KB minified, 17% faster initial load than alternatives, supports standard decorators. Used by Adobe Photoshop web, Microsoft Store. Framework-agnostic by design. | HIGH |
| TypeScript | ^5.7.x | Type safety and decorators | Lit 3 supports standard decorators (TC39). Better IDE support, self-documenting APIs. Required for proper Custom Elements Manifest generation. | HIGH |
| Vite | ^6.x | Dev server and build tool | Official Lit template support. Fast HMR, native ESM. Vite 6 uses Rolldown for 70% faster builds. Library mode for npm packaging. | HIGH |
| Tailwind CSS | ^4.1.x | Utility-first styling | No tailwind.config.js needed in v4. Native Vite plugin (@tailwindcss/vite). 5x faster builds, 100x faster incremental. Shadow DOM requires custom injection pattern. | HIGH |

### CLI Distribution

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Commander.js | ^14.x | CLI argument parsing | Industry standard, battle-tested. Automatic help generation. Used by shadcn CLI. | HIGH |
| Inquirer.js | ^12.x | Interactive prompts | ESM-native (v9+). Rich prompt types: input, confirm, list, checkbox. Pairs with Commander for CLI UX. | HIGH |
| Chalk | ^5.x | Terminal styling | ESM-native. Colored output for better CLI DX. Lightweight, no dependencies. | HIGH |
| ora | ^8.x | Loading spinners | Visual feedback during file operations. Clean, minimal API. | MEDIUM |
| fs-extra | ^11.x | File operations | Convenient file copy/move. ensureDir, copy, outputFile for component installation. | HIGH |

### Build and Bundling

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Vite Library Mode | (via Vite) | Component bundling | Rollup-based output. ESM + UMD formats. Proper externalization of dependencies. | HIGH |
| tsup | ^8.x | CLI bundling | Zero-config TypeScript bundling. ESM + CJS dual output. esbuild under the hood for speed. Perfect for CLI tool. | HIGH |

### Testing

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| @web/test-runner | ^0.19.x | Component testing | Lit's official recommendation. Real browser testing (not JSDOM). Shadow DOM and custom elements work correctly. | HIGH |
| @web/test-runner-playwright | ^0.11.x | Browser automation | Run tests in Chromium, Firefox, WebKit. Real rendering, real clicks. | HIGH |
| @open-wc/testing | ^4.x | Testing helpers | `fixture()` for rendering. `waitUntil()` for async. Works with any test runner. | HIGH |
| @esm-bundle/chai | ^4.x | Assertions | ESM-native Chai. Works with Web Test Runner. | MEDIUM |

### Documentation and DX

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| @custom-elements-manifest/analyzer | ^0.10.x | API documentation | Generates JSON manifest of component APIs. Powers Storybook autodocs, IDE autocomplete, React wrapper generation. Community standard. | HIGH |
| Storybook | ^8.x | Component playground | @storybook/web-components-vite framework. Autodocs from Custom Elements Manifest. Visual testing, controls. | HIGH |

### Tailwind + Shadow DOM Integration

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| @tailwindcss/vite | ^4.1.x | Vite integration | Native Tailwind v4 plugin. Faster than PostCSS approach. | HIGH |
| Custom TailwindElement base class | N/A | Shadow DOM injection | Pattern: extend LitElement, inject Tailwind via unsafeCSS. Import CSS with `?inline` suffix. | HIGH |

## Installation

```bash
# Core - Component Library
npm install lit

# Core - Styling (Tailwind v4)
npm install tailwindcss @tailwindcss/vite

# CLI Tool Dependencies
npm install commander inquirer chalk ora fs-extra

# Dev - Build Tools
npm install -D vite typescript tsup

# Dev - Testing
npm install -D @web/test-runner @web/test-runner-playwright @open-wc/testing @esm-bundle/chai

# Dev - Documentation
npm install -D @custom-elements-manifest/analyzer @storybook/web-components-vite storybook
```

## Project Structure

```
lit-ui/
├── packages/
│   ├── components/          # Component source (Lit + Tailwind)
│   │   ├── src/
│   │   │   ├── button/
│   │   │   ├── dialog/
│   │   │   └── shared/
│   │   │       └── tailwind-element.ts  # Base class with Tailwind injection
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── cli/                  # CLI distribution tool
│       ├── src/
│       │   ├── commands/
│       │   ├── utils/
│       │   └── index.ts
│       ├── package.json
│       └── tsup.config.ts
├── .storybook/
├── package.json              # Workspace root
└── custom-elements-manifest.config.mjs
```

## Key Patterns

### TailwindElement Base Class

```typescript
// packages/components/src/shared/tailwind-element.ts
import { LitElement, unsafeCSS, CSSResultGroup } from 'lit';
import tailwindStyles from './tailwind.css?inline';

const tailwindSheet = unsafeCSS(tailwindStyles);

export class TailwindElement extends LitElement {
  static styles: CSSResultGroup = [tailwindSheet];
}

// For components with additional styles:
export function withTailwind(componentStyles: CSSResultGroup) {
  return [tailwindSheet, componentStyles];
}
```

### Component Structure

```typescript
// packages/components/src/button/button.ts
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement, withTailwind } from '../shared/tailwind-element.js';

@customElement('lui-button')
export class LuiButton extends TailwindElement {
  static styles = withTailwind(css`
    :host { display: inline-block; }
  `);

  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';
  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button
        class="px-4 py-2 rounded-md ${this.variant === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground'}"
        ?disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}
```

### Tailwind v4 Shadow DOM Fix

Tailwind v4 uses `@property` rules that don't work in Shadow DOM. Apply this PostCSS plugin or vite transform:

```typescript
// vite.config.ts plugin to fix @property for Shadow DOM
function tailwindShadowDomFix() {
  return {
    name: 'tailwind-shadow-dom-fix',
    transform(code: string, id: string) {
      if (id.endsWith('.css')) {
        // Convert :root to :root, :host for Shadow DOM
        return code.replace(/:root\s*\{/g, ':root, :host {');
      }
    }
  };
}
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Lit | Stencil | If you need JSX syntax or prefer Angular-style DI. Stencil is heavier (6.2MB vs 4.3MB memory). |
| Lit | Vanilla Web Components | Only for very simple components. Lit's reactive properties save significant boilerplate. |
| Vite | Rollup directly | Only if you need maximum control over bundling. Vite abstracts Rollup well for library mode. |
| @web/test-runner | Vitest Browser Mode | Vitest is more popular but Web Test Runner is Lit's official recommendation. Vitest requires more setup for Shadow DOM. |
| @web/test-runner | Playwright CT | Experimental for web components. Use playwright-ct-web community package if needed. |
| Commander.js | yargs | If you prefer chained API. Commander is more widely used for CLIs like shadcn. |
| tsup | unbuild | If you want unjs ecosystem integration. tsup is simpler for CLI bundling. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| JSDOM for testing | Shadow DOM and custom elements don't work correctly. Missing matchMedia, IntersectionObserver, ResizeObserver. | @web/test-runner with real browsers |
| Jest with web components | JSDOM limitations. Even JSDOM 16.2+ has incomplete Shadow DOM support. | @web/test-runner or Vitest Browser Mode |
| Tailwind v3 with Shadow DOM hacks | v4 has native Vite plugin, simpler setup, no tailwind.config.js. Worth the :root/:host fix. | Tailwind v4 with @tailwindcss/vite |
| postcss-lit for Tailwind | Adds complexity. Vite's `?inline` CSS imports are cleaner. | Native Vite CSS handling with ?inline |
| Disabling Shadow DOM for Tailwind | Defeats web component encapsulation. Components become non-portable. | TailwindElement pattern with unsafeCSS |
| Webpack | Slower builds, more configuration. Vite is the modern standard for Lit. | Vite |
| Rollup directly for dev | No HMR, no dev server. Vite wraps Rollup for better DX. | Vite (uses Rollup for production) |
| npm link for CLI testing | Fragile, symlink issues. Use npm pack or direct execution. | `npx tsx ./packages/cli/src/index.ts` |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| lit@3.x | TypeScript 5.x | Requires `useDefineForClassFields: false` in tsconfig for decorators |
| lit@3.x | Vite 5.x/6.x | Official template: `npm create vite@latest -- --template lit-ts` |
| tailwindcss@4.x | @tailwindcss/vite@4.x | Must match major versions |
| @storybook/web-components-vite@8.x | Lit 3.x | Updated for Lit 3 support |
| @custom-elements-manifest/analyzer@0.10.x | Lit 3.x | Has built-in Lit plugin |

## TypeScript Configuration

```json
// tsconfig.json for Lit 3 + decorators
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "declaration": true,
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## CLI Distribution Model (shadcn-style)

Two modes for component installation:

### Mode 1: Copy Source (Default)
```bash
npx lit-ui add button
# Copies button.ts to user's components/ui/ directory
# User owns the code, can customize freely
```

### Mode 2: npm Package
```bash
npm install @lit-ui/button
# Traditional dependency, no source copying
# Updates via npm, less customization
```

The CLI should support both, with copy-source as default (shadcn model).

## Sources

### HIGH Confidence (Context7/Official Docs)
- [Lit Official Documentation](https://lit.dev/docs/) - v3 features, TypeScript config
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) - v4 features, Vite plugin
- [Vite Documentation](https://vite.dev/guide/) - Library mode, build configuration
- [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org/) - Analyzer setup, plugins

### HIGH Confidence (GitHub/npm)
- [Lit GitHub Repository](https://github.com/lit/lit) - lit-element@4.2.1 (July 2025)
- [@tailwindcss/vite npm](https://www.npmjs.com/package/@tailwindcss/vite) - v4.1.18
- [shadcn/ui Architecture](https://deepwiki.com/shadcn-ui/ui/2-architecture) - CLI registry pattern

### MEDIUM Confidence (Verified WebSearch)
- [Modern 2025 Web Components Tech Stack](https://dev.to/matsuuu/the-modern-2025-web-components-tech-stack-1l00) - Stack recommendations
- [Web Components Tailwind Starter Kit](https://github.com/butopen/web-components-tailwind-starter-kit) - TailwindElement pattern
- [Lit + Tailwind Integration](https://dev.to/43081j/using-tailwind-at-build-time-with-web-components-1bhm) - Build-time Tailwind approach

### MEDIUM Confidence (Community)
- [Storybook Web Components Docs](https://storybook.js.org/docs/get-started/frameworks/web-components-vite) - Storybook 8 setup
- [tsup Documentation](https://tsup.egoist.dev/) - CLI bundling patterns
- [Commander.js Guide](https://betterstack.com/community/guides/scaling-nodejs/commander-explained/) - CLI patterns

---
*Stack research for: lit-ui (Lit + Tailwind + CLI component library)*
*Researched: 2026-01-23*
