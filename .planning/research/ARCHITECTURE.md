# Architecture Research: NPM + SSR Integration

**Domain:** NPM package distribution and SSR support for LitUI
**Researched:** 2026-01-24
**Confidence:** HIGH (verified via official Lit SSR documentation, NPM workspace patterns)

## Executive Summary

Adding NPM package distribution and SSR support to LitUI requires:
1. **New package structure** with scoped NPM packages (@lit-ui/core, @lit-ui/button, @lit-ui/dialog)
2. **TailwindElement SSR adaptation** to handle constructable stylesheets in DSD context
3. **CLI dual-mode support** for both copy-source and npm install workflows
4. **Build configuration** for per-package publishing with proper exports

The key architectural challenge is that **constructable stylesheets cannot be serialized in Declarative Shadow DOM**. This requires using Lit's static styles for SSR while preserving the current constructable stylesheet approach for client-side efficiency.

---

## Package Structure

### Existing (keep unchanged)

```
/
├── src/                          # Main component source (for development/demo)
│   ├── base/tailwind-element.ts
│   ├── components/button/button.ts
│   ├── components/dialog/dialog.ts
│   └── styles/tailwind.css
├── packages/
│   └── cli/                      # CLI tool (lit-ui command)
```

### New Packages (add)

```
packages/
├── cli/                          # EXISTING - enhance for dual-mode
├── core/                         # NEW - @lit-ui/core
│   ├── src/
│   │   ├── tailwind-element.ts   # SSR-aware base class
│   │   ├── ssr/                  # SSR utilities
│   │   │   ├── index.ts
│   │   │   └── hydration.ts
│   │   └── index.ts
│   ├── package.json
│   └── vite.config.ts
├── button/                       # NEW - @lit-ui/button
│   ├── src/
│   │   ├── button.ts
│   │   └── index.ts
│   ├── package.json
│   └── vite.config.ts
└── dialog/                       # NEW - @lit-ui/dialog
    ├── src/
    │   ├── dialog.ts
    │   └── index.ts
    ├── package.json
    └── vite.config.ts
```

### Package Details

#### @lit-ui/core

**Purpose:** Base infrastructure shared by all components

**Contents:**
- `TailwindElement` base class (SSR-aware version)
- SSR utilities for Declarative Shadow DOM
- Hydration support module
- CSS injection utilities
- Design token exports

**Dependencies:**
- `lit` (peer dependency)
- `@lit-labs/ssr-client` (optional peer for SSR)

**Exports:**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./ssr": {
      "types": "./dist/ssr/index.d.ts",
      "import": "./dist/ssr/index.js"
    }
  }
}
```

#### @lit-ui/button

**Purpose:** Button component for NPM consumers

**Dependencies:**
- `@lit-ui/core` (peer dependency)
- `lit` (peer dependency)

**Exports:**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

#### @lit-ui/dialog

**Purpose:** Dialog component for NPM consumers

**Dependencies:**
- `@lit-ui/core` (peer dependency)
- `lit` (peer dependency)

---

## Integration Points

### With Existing TailwindElement

**Current approach (client-only):**
```typescript
// tailwind-element.ts - CURRENT
const tailwindSheet = new CSSStyleSheet();
tailwindSheet.replaceSync(tailwindStyles);

export class TailwindElement extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [tailwindSheet, ...];
  }
}
```

**Problem:** Constructable stylesheets cannot be serialized in Declarative Shadow DOM (DSD). When server-rendering, styles must be inlined as `<style>` tags within the `<template shadowrootmode="open">`.

**Solution: Dual-mode TailwindElement**

```typescript
// tailwind-element.ts - SSR-AWARE
import { LitElement, css, unsafeCSS, isServer } from 'lit';
import type { CSSResultGroup } from 'lit';

// Compile-time: styles as string for SSR injection
import tailwindStyles from './tailwind.css?inline';
import hostDefaults from './host-defaults.css?inline';

// SSR: Use static styles (inlined in DSD template)
// Client: Use constructable stylesheets for efficiency (shared across instances)

// Client-side only: shared constructable stylesheet
let sharedTailwindSheet: CSSStyleSheet | null = null;
let sharedHostDefaultsSheet: CSSStyleSheet | null = null;

if (!isServer) {
  sharedTailwindSheet = new CSSStyleSheet();
  sharedTailwindSheet.replaceSync(tailwindStyles);
  sharedHostDefaultsSheet = new CSSStyleSheet();
  sharedHostDefaultsSheet.replaceSync(hostDefaults);
}

export class TailwindElement extends LitElement {
  // Static styles for SSR - these get inlined in the DSD template
  static styles: CSSResultGroup = [
    unsafeCSS(tailwindStyles),
    unsafeCSS(hostDefaults)
  ];

  connectedCallback() {
    super.connectedCallback();

    // Client-side optimization: replace static styles with shared
    // constructable stylesheets for better memory efficiency
    if (!isServer && this.shadowRoot && sharedTailwindSheet && sharedHostDefaultsSheet) {
      // Get component-specific styles (from subclass)
      const componentStyles = this.shadowRoot.adoptedStyleSheets.slice(2);

      // Use shared stylesheets instead of per-instance copies
      this.shadowRoot.adoptedStyleSheets = [
        sharedTailwindSheet,
        sharedHostDefaultsSheet,
        ...componentStyles
      ];
    }
  }
}
```

**Key insight:** Lit's `isServer` export (from `lit`) enables conditional code paths. Static styles work for SSR (inlined in DSD), while client-side uses efficient constructable stylesheets.

**SSR Lifecycle Considerations:**
- `constructor()` - Runs on server
- `connectedCallback()` - Does NOT run on server
- `render()` - Runs on server
- `updated()`, `firstUpdated()` - Do NOT run on server

This means the constructable stylesheet optimization only runs in browsers after hydration.

### With Existing CLI

**Current CLI behavior:**
- `lit-ui init` - creates lit-ui.json, copies base files
- `lit-ui add <component>` - copies component source to user's project
- Uses embedded templates for portable distribution

**Enhanced CLI for dual-mode:**

Add `mode` to lit-ui.json config:
```json
{
  "$schema": "https://lit-ui.dev/schema.json",
  "mode": "copy-source",
  "componentsPath": "src/components/ui",
  "tailwind": { "css": "src/styles/tailwind.css" },
  "aliases": {
    "components": "@/components/ui",
    "base": "@/lib/lit-ui"
  }
}
```

**Mode options:**
- `"copy-source"` (default): Current behavior - copies component source files
- `"npm"`: Installs @lit-ui/* packages from NPM

**CLI changes:**

1. **`lit-ui init`** prompts for mode selection:
   - copy-source: current behavior (copies TailwindElement, styles)
   - npm: installs @lit-ui/core, configures imports

2. **`lit-ui add <component>`** behavior by mode:
   - **copy-source:** copies embedded template (current behavior)
   - **npm:** runs `npm install @lit-ui/<component>`, shows import instructions

3. **New `lit-ui migrate` command:**
   - Converts copy-source project to npm mode
   - Updates imports from local paths to @lit-ui/* packages
   - Removes copied source files (with confirmation)

### With Existing Build (Vite)

**Current vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [tailwindcss(), dts({ rollupTypes: true })],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: { external: ['lit'] }
  }
});
```

**New workspace configuration:**

Root package.json:
```json
{
  "name": "lit-ui-monorepo",
  "private": true,
  "workspaces": ["packages/*"]
}
```

Per-package vite.config.ts pattern:
```typescript
// packages/core/vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tailwindcss(),
    dts({ rollupTypes: true })
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'ssr/index': 'src/ssr/index.ts'
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit', /^@lit-labs\//]
    }
  }
});
```

```typescript
// packages/button/vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // Mark all dependencies as external
      external: ['lit', '@lit-ui/core', /^@lit-labs\//]
    }
  }
});
```

**Tailwind handling:**
- @lit-ui/core compiles and embeds Tailwind CSS at build time
- Component packages (button, dialog) import TailwindElement which includes styles
- No Tailwind plugin needed in component packages

---

## SSR Architecture

### How Lit SSR Works

1. **Server:** @lit-labs/ssr renders components to HTML with Declarative Shadow DOM
2. **HTML Output:** Shadow DOM contents wrapped in `<template shadowrootmode="open">`
3. **Browser:** DSD automatically attaches shadow roots on parse
4. **Hydration:** @lit-labs/ssr-client enables component rehydration

### Key Packages

| Package | Purpose | Required For |
|---------|---------|--------------|
| `@lit-labs/ssr` | Server-side rendering | Node.js server |
| `@lit-labs/ssr-client` | Client hydration support | Browser hydration |
| `lit` | Core library with isServer | Both |

### LitUI SSR Integration

**TailwindElement already has SSR-compatible guards:**
```typescript
// Already in current code - won't run server-side
if (typeof document !== 'undefined') {
  const documentSheet = new CSSStyleSheet();
  // ...
}
```

**Changes needed for full SSR support:**

1. **Use `isServer` import** from lit for cleaner conditional logic
2. **Move styles to static property** so they're included in SSR output
3. **Export SSR utilities** from @lit-ui/core/ssr

### SSR Output Example

Server renders this HTML:
```html
<ui-button variant="primary">
  <template shadowrootmode="open">
    <style>
      /* Tailwind CSS (inlined from static styles) */
      .bg-primary { ... }
      .px-4 { ... }
    </style>
    <button class="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground">
      <slot></slot>
    </button>
  </template>
  Click me
</ui-button>
```

Browser parses this, DSD automatically attaches shadow root, then hydration makes it interactive.

### Hydration Setup

For SSR-rendered components to become interactive:

```typescript
// Entry point - MUST load before lit
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

// Then import components
import '@lit-ui/button';
```

**@lit-ui/core/ssr convenience export:**
```typescript
// packages/core/src/ssr/index.ts
export async function setupHydration() {
  if (typeof window !== 'undefined') {
    await import('@lit-labs/ssr-client/lit-element-hydrate-support.js');
  }
}

// Re-export for type support
export type { SSRResult } from '@lit-labs/ssr';
```

---

## Data Flow

### NPM Mode Flow

```
Developer                         NPM                          Browser
    |                              |                              |
    | npm install @lit-ui/button   |                              |
    |----------------------------->|                              |
    |                              |                              |
    | import '@lit-ui/button'      |                              |
    | (in app code)                |                              |
    |                              |                              |
    | Build (Vite/Webpack)         |                              |
    | ----------------------------------------------------------->|
    |                              |                              |
    |                              |      <ui-button> works       |
    |                              |<------------------------------|
```

**Import chain:**
```
@lit-ui/button
  |-- depends on @lit-ui/core (peer)
        |-- depends on lit (peer)
```

### Copy-Source Mode Flow (existing, unchanged)

```
Developer                         CLI                           Project
    |                              |                              |
    | npx lit-ui add button        |                              |
    |----------------------------->|                              |
    |                              |                              |
    |                              | Copy button.ts to            |
    |                              | src/components/ui/           |
    |                              |----------------------------->|
    |                              |                              |
    | import './components/ui/button'                             |
    | (local file)                 |                              |
```

### SSR Mode Flow

```
Server (Node.js)                                          Browser
    |                                                        |
    | import { render } from '@lit-labs/ssr'                 |
    | import '@lit-ui/button'                                |
    |                                                        |
    | const html = render(html`<ui-button>Click</ui-button>`)|
    |                                                        |
    | Output:                                                |
    | <ui-button>                                            |
    |   <template shadowrootmode="open">                     |
    |     <style>/* Tailwind CSS */</style>                  |
    |     <button class="..."><slot></slot></button>         |
    |   </template>                                          |
    |   Click                                                |
    | </ui-button>                                           |
    |                                                        |
    | HTML sent to browser --------------------------------->|
    |                                                        |
    |                               DSD auto-attaches shadow |
    |                               Hydration script loads   |
    |                               Components interactive   |
```

---

## Suggested Build Order

Based on dependencies and integration points:

### Phase 1: Package Infrastructure (Week 1)

1. **Configure npm workspaces** in root package.json
2. **Create packages/core** directory structure
3. **Adapt TailwindElement for SSR** - add static styles, isServer guards
4. **Configure @lit-ui/core build** - Vite, TypeScript, exports
5. **Test @lit-ui/core** builds and exports correctly

### Phase 2: Component Packages (Week 1-2)

6. **Create packages/button** - port button.ts with @lit-ui/core import
7. **Create packages/dialog** - port dialog.ts with @lit-ui/core import
8. **Test component packages** build and work in isolation

### Phase 3: SSR Support (Week 2)

9. **Add @lit-ui/core/ssr** subpath with hydration utilities
10. **Test SSR rendering** with @lit-labs/ssr directly
11. **Document SSR setup** for Next.js, Astro, etc.

### Phase 4: CLI Enhancement (Week 2-3)

12. **Add mode config** to lit-ui.json schema
13. **Update init command** for mode selection
14. **Update add command** for npm mode behavior
15. **Add migrate command** for copy-to-npm conversion

### Phase 5: Publishing (Week 3)

16. **Set up npm publishing** workflow (GitHub Actions)
17. **Configure scoped packages** (@lit-ui/* on npm)
18. **Publish initial versions** to npm

---

## Anti-Patterns to Avoid

### Do Not: Bundle Lit into packages

```typescript
// BAD: packages/button/vite.config.ts
rollupOptions: {
  // Missing external - bundles lit
}

// GOOD: packages/button/vite.config.ts
rollupOptions: {
  external: ['lit', '@lit-ui/core', /^@lit-labs\//]
}
```

Lit must be external/peer dependency. Bundling causes version conflicts and breaks SSR conditional exports.

### Do Not: Use dynamic imports for styles in SSR

```typescript
// BAD: Won't work in SSR
async connectedCallback() {
  const styles = await import('./styles.css');
  this.shadowRoot.adoptedStyleSheets = [styles];
}

// GOOD: Static styles work in SSR
static styles = [unsafeCSS(tailwindStyles)];
```

Styles must be statically analyzable for SSR to inline them.

### Do Not: Access DOM in constructor or property initializers

```typescript
// BAD: Breaks SSR
class MyEl extends LitElement {
  width = document.body.clientWidth; // Error on server
}

// GOOD: Guard with isServer or defer to connectedCallback
import { isServer } from 'lit';
class MyEl extends LitElement {
  width = isServer ? 0 : document.body.clientWidth;
}
```

### Do Not: Rely solely on constructable stylesheets

```typescript
// BAD: Won't render styles in SSR
static styles = []; // Empty
connectedCallback() {
  this.shadowRoot.adoptedStyleSheets = [sheet]; // Only client
}

// GOOD: Static styles for SSR, optimize in connectedCallback
static styles = [unsafeCSS(tailwindStyles)];
connectedCallback() {
  if (!isServer) {
    // Optimization: use shared stylesheet
  }
}
```

---

## Scalability Considerations

| Concern | 2 Components | 10 Components | 50+ Components |
|---------|--------------|---------------|----------------|
| Package count | 3 (@lit-ui/core + 2) | 11 | 51+ |
| Build time | ~5s | ~30s | Consider turborepo |
| Tailwind CSS size | ~50KB | ~80KB | Per-component CSS builds |
| Version management | Manual | Changesets | Changesets + automated |

**Recommendation for v2.0:** Start with manual version management for 3 packages. Add Changesets if/when expanding to more components.

---

## Sources

### Official Documentation (HIGH confidence)
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) - SSR architecture and DSD
- [Lit SSR Authoring](https://lit.dev/docs/ssr/authoring/) - Component SSR requirements
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) - Hydration setup
- [@lit-labs/ssr NPM](https://www.npmjs.com/package/@lit-labs/ssr) - Package details
- [Node.js Package Exports](https://nodejs.org/api/packages.html) - Subpath exports spec

### Community Resources (MEDIUM confidence)
- [Constructable Stylesheets Discussion](https://github.com/lit/lit/discussions/2220) - DSD limitation
- [Web Components, Tailwind, and SSR](https://www.konnorrogers.com/posts/2023/web-components-tailwind-and-ssr) - Tailwind SSR approaches
- [NPM Workspaces Guide](https://blog.npmjs.org/post/186494959890/monorepos-and-npm.html) - Monorepo best practices
- [TypeScript Mono-repo Setup](https://blog.frankdejonge.nl/setting-up-a-typescript-mono-repo-for-scoped-packages/) - Scoped package patterns

---

*Architecture research for: LitUI v2.0 NPM + SSR*
*Researched: 2026-01-24*
