# Architecture Research

**Domain:** CLI-distributed Lit.js component library (ShadCN-style)
**Researched:** 2026-01-23
**Confidence:** HIGH (verified via official Lit documentation, shadcn/ui docs, and established patterns from MWC/Shoelace)

## Standard Architecture

### System Overview

```
                           lit-ui Architecture
============================================================================

  DISTRIBUTION LAYER (CLI)
  -------------------------------------------------------------------------
  |  +-------------+    +--------------+    +----------------+            |
  |  | CLI Tool    |    | Registry     |    | Transformer    |            |
  |  | (commander/ |<-->| (JSON Schema)|<-->| (Code Rewrite) |            |
  |  |  oclif)     |    |              |    |                |            |
  |  +-------------+    +--------------+    +----------------+            |
  -------------------------------------------------------------------------
                              |
                              | fetches/copies
                              v
  COMPONENT LIBRARY (Source)
  -------------------------------------------------------------------------
  |  +---------------+  +---------------+  +---------------+              |
  |  | Components    |  | Primitives    |  | Utilities     |              |
  |  | (button,      |  | (base-element |  | (cn(), tokens,|              |
  |  |  dialog, etc) |  |  tailwind-el) |  |  types)       |              |
  |  +-------+-------+  +-------+-------+  +-------+-------+              |
  |          |                  |                  |                      |
  |          +------------------+------------------+                      |
  |                             |                                         |
  |                             v                                         |
  |  +----------------------------------------------------------+        |
  |  |              Shared Design Tokens (CSS Variables)         |        |
  |  +----------------------------------------------------------+        |
  -------------------------------------------------------------------------
                              |
                              | consumed by
                              v
  USER'S PROJECT
  -------------------------------------------------------------------------
  |  +---------------+  +---------------+  +---------------+              |
  |  | components/   |  | lib/          |  | styles/       |              |
  |  |   ui/         |  |   utils.ts    |  |   tokens.css  |              |
  |  |   button.ts   |  |               |  |               |              |
  |  +---------------+  +---------------+  +---------------+              |
  -------------------------------------------------------------------------
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **CLI Tool** | Fetches, transforms, and writes component source to user project | Node.js with commander/oclif, prompts via inquirer |
| **Registry** | Defines available components, dependencies, file mappings | JSON schema (registry.json + registry-item.json) |
| **Transformer** | Rewrites imports, applies CSS variable mappings, adjusts paths | AST manipulation or string transforms |
| **Base Element** | Provides shared Tailwind styles, theme inheritance, common behaviors | LitElement subclass with unsafeCSS for Tailwind |
| **UI Components** | Self-contained, accessible web components (Button, Dialog, etc.) | LitElement with CSS custom properties |
| **Design Tokens** | Centralized CSS variables for colors, spacing, typography | CSS file with :root tokens + component overrides |
| **Utilities** | Helper functions (cn for class merging, type definitions) | TypeScript modules |

## Recommended Project Structure

```
lit-ui/
├── packages/                    # Monorepo packages
│   ├── cli/                     # CLI distribution tool
│   │   ├── src/
│   │   │   ├── commands/        # CLI commands (init, add, diff)
│   │   │   │   ├── init.ts      # Project initialization
│   │   │   │   ├── add.ts       # Add component to project
│   │   │   │   └── diff.ts      # Show changes from upstream
│   │   │   ├── utils/
│   │   │   │   ├── registry.ts  # Registry fetching/parsing
│   │   │   │   ├── transform.ts # Code transformation logic
│   │   │   │   └── config.ts    # Project config handling
│   │   │   └── index.ts         # CLI entry point
│   │   └── package.json
│   │
│   └── ui/                      # Component source library
│       ├── src/
│       │   ├── components/      # UI components
│       │   │   ├── button/
│       │   │   │   ├── button.ts
│       │   │   │   ├── button.styles.ts
│       │   │   │   └── index.ts
│       │   │   └── dialog/
│       │   │       ├── dialog.ts
│       │   │       ├── dialog.styles.ts
│       │   │       └── index.ts
│       │   ├── primitives/      # Base classes and building blocks
│       │   │   ├── tailwind-element.ts
│       │   │   └── base-element.ts
│       │   ├── styles/          # Shared styles
│       │   │   ├── tokens.css   # Design tokens
│       │   │   └── tailwind.css # Tailwind base + utilities
│       │   └── lib/             # Utilities
│       │       ├── utils.ts     # cn(), etc.
│       │       └── types.ts     # Shared types
│       ├── registry.json        # Component registry definition
│       └── package.json
│
├── apps/                        # Demo/docs applications
│   └── docs/                    # Documentation site
│       └── ...
│
├── pnpm-workspace.yaml          # Monorepo workspace config
├── turbo.json                   # Build orchestration (optional)
└── package.json                 # Root package
```

### Structure Rationale

- **packages/cli/:** Separate package for the CLI tool, published to npm. Users install globally or use npx. Decoupled from component source.
- **packages/ui/:** Contains all component source code. This is the "registry" - the CLI fetches from here. Components organized by feature (button/, dialog/) with co-located styles.
- **primitives/:** Base classes that all components extend. TailwindElement handles Tailwind CSS integration. Provides shared behaviors.
- **styles/:** Design tokens as CSS custom properties. Centralized so components reference tokens, not hard-coded values.
- **registry.json:** The manifest file that defines what components exist, their dependencies, and file mappings.
- **apps/docs/:** Documentation site for showcasing components. Uses Storybook or custom solution.

## Architectural Patterns

### Pattern 1: TailwindElement Base Class

**What:** A shared LitElement subclass that injects Tailwind CSS into the Shadow DOM at build time.
**When to use:** Every component that needs Tailwind styling.
**Trade-offs:**
- PRO: Consistent Tailwind access across all components
- PRO: Single place to update Tailwind configuration
- CON: Adds base styles to every component (mitigated by Tailwind JIT)

**Example:**
```typescript
// primitives/tailwind-element.ts
import { LitElement, unsafeCSS } from 'lit';
import tailwindStyles from '../styles/tailwind.css?inline';

export class TailwindElement extends LitElement {
  static styles = [unsafeCSS(tailwindStyles)];
}

// components/button/button.ts
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../primitives/tailwind-element.js';

@customElement('ui-button')
export class Button extends TailwindElement {
  @property() variant: 'primary' | 'secondary' = 'primary';

  static styles = [
    ...TailwindElement.styles,
    css`
      :host {
        display: inline-block;
      }
    `
  ];

  render() {
    return html`
      <button class="px-4 py-2 rounded-md ${this.variant === 'primary'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground'}">
        <slot></slot>
      </button>
    `;
  }
}
```

### Pattern 2: CSS Custom Properties for Theming

**What:** Use CSS variables for all themable values. Components define defaults that users can override.
**When to use:** Any value that should be customizable (colors, spacing, radii, etc.).
**Trade-offs:**
- PRO: Works across Shadow DOM boundaries via CSS inheritance
- PRO: Enables per-instance and tree-based theming
- CON: Requires discipline to use tokens everywhere

**Example:**
```typescript
// components/button/button.styles.ts
import { css } from 'lit';

export const buttonStyles = css`
  :host {
    --button-bg: var(--primary);
    --button-text: var(--primary-foreground);
    --button-radius: var(--radius);
    --button-padding-x: var(--spacing-4);
    --button-padding-y: var(--spacing-2);
  }

  button {
    background-color: var(--button-bg);
    color: var(--button-text);
    border-radius: var(--button-radius);
    padding: var(--button-padding-y) var(--button-padding-x);
  }
`;
```

```css
/* User's project: styles/tokens.css */
:root {
  --primary: hsl(222.2 47.4% 11.2%);
  --primary-foreground: hsl(210 40% 98%);
  --radius: 0.5rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
}

/* Per-instance customization */
ui-button.danger {
  --button-bg: var(--destructive);
  --button-text: var(--destructive-foreground);
}
```

### Pattern 3: Registry-Based Distribution (shadcn Pattern)

**What:** Components defined in a JSON registry that the CLI reads to know what to install.
**When to use:** The entire distribution model - how users add components to their projects.
**Trade-offs:**
- PRO: Users own their code, can customize freely
- PRO: No runtime dependency on library (copy-source)
- PRO: Tree-shaking is automatic (only installed components)
- CON: Updates require manual diffing or re-running CLI
- CON: More complex than npm install

**Example:**
```json
// packages/ui/registry.json
{
  "$schema": "https://example.com/schema/registry.json",
  "name": "lit-ui",
  "homepage": "https://lit-ui.dev",
  "items": [
    {
      "name": "button",
      "type": "registry:component",
      "title": "Button",
      "description": "A customizable button component",
      "dependencies": ["lit"],
      "registryDependencies": ["tailwind-element", "utils"],
      "files": [
        {
          "path": "components/button/button.ts",
          "type": "registry:component"
        },
        {
          "path": "components/button/button.styles.ts",
          "type": "registry:component"
        }
      ]
    },
    {
      "name": "tailwind-element",
      "type": "registry:lib",
      "title": "Tailwind Element",
      "description": "Base class for Tailwind-enabled components",
      "dependencies": ["lit"],
      "files": [
        {
          "path": "primitives/tailwind-element.ts",
          "type": "registry:lib"
        }
      ]
    }
  ]
}
```

### Pattern 4: Component Configuration File

**What:** A project-level config file that tells the CLI how to install components.
**When to use:** Every project using lit-ui. Created during `lit-ui init`.
**Trade-offs:**
- PRO: Customizes installation paths, aliases, style preferences
- PRO: Enables project-specific transformations
- CON: Another config file to maintain

**Example:**
```json
// User's project: lit-ui.json (or components.json)
{
  "$schema": "https://lit-ui.dev/schema/config.json",
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "src/components",
    "ui": "src/components/ui",
    "lib": "src/lib",
    "utils": "src/lib/utils"
  },
  "typescript": true
}
```

## Data Flow

### Component Installation Flow

```
[User runs: npx lit-ui add button]
    |
    v
[CLI reads lit-ui.json] --> If missing, prompt for init
    |
    v
[CLI fetches registry.json from source]
    |
    v
[CLI resolves "button" + registryDependencies]
    |   - button depends on tailwind-element, utils
    |   - check if already installed, prompt if conflict
    v
[CLI fetches component files]
    |
    v
[Transformer rewrites code]
    |   - Adjust import paths to match aliases
    |   - Apply CSS variable mappings if configured
    |   - Convert to JS if typescript: false
    v
[CLI writes files to user's project]
    |   - src/components/ui/button.ts
    |   - src/primitives/tailwind-element.ts (if not exists)
    |   - src/lib/utils.ts (if not exists)
    v
[CLI reports success + next steps]
```

### Component Rendering Data Flow

```
[Parent sets attribute/property]
    |
    v
[Lit reactive property triggers update]
    |
    v
[render() method called]
    |   - Returns lit-html template
    |   - Tailwind classes applied
    v
[lit-html diffs and updates DOM]
    |
    v
[CSS Custom Properties inherited]
    |   - :root tokens flow down
    |   - Component defaults applied
    v
[Browser paints styled component]
```

### Theming Data Flow

```
[Global tokens defined in :root]
    |
    v
[CSS custom properties inherit through Shadow DOM]
    |
    v
[Component uses var(--token) with fallbacks]
    |
    v
[User can override at any level]
    |   - :root (global theme)
    |   - Element selector (all instances)
    |   - Inline style (single instance)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10 components | Single package, all components in one registry. CLI can be minimal. |
| 10-50 components | Consider component categories in registry. Add search/filter to CLI. |
| 50+ components | Split into namespaced registries (@lit-ui/core, @lit-ui/charts). Versioning becomes critical. |

### Scaling Priorities

1. **First bottleneck:** Registry size - as components grow, fetching full registry.json becomes slow. Solution: Lazy-load component metadata or use registry index.
2. **Second bottleneck:** Tailwind CSS bundle in each component. Solution: Component-level CSS extraction or shared stylesheet with CSS parts.
3. **Third consideration:** Version drift between user's installed components and upstream. Solution: `lit-ui diff` command to show changes.

## Anti-Patterns

### Anti-Pattern 1: Tight Coupling to Tailwind Classes

**What people do:** Hard-code Tailwind classes directly in templates without abstraction.
**Why it's wrong:** Users can't customize styling without editing component source. Theme changes require touching every component.
**Do this instead:** Use CSS custom properties for themable values. Tailwind classes are implementation details that reference tokens:
```typescript
// BAD
class="bg-blue-500 text-white"

// GOOD
class="bg-primary text-primary-foreground"
// Where --primary and --primary-foreground are CSS variables
```

### Anti-Pattern 2: Runtime Framework Detection

**What people do:** Add runtime checks for React/Vue/Svelte and adjust behavior.
**Why it's wrong:** Bloats bundle, adds complexity, web components should just work everywhere.
**Do this instead:** Web components are framework-agnostic by design. Document usage patterns for each framework. If wrappers needed, keep them in separate packages (@lit-ui/react).

### Anti-Pattern 3: Monolithic Component Bundle

**What people do:** Publish all components as a single npm package that users import from.
**Why it's wrong:** Defeats tree-shaking, users get all code even if they use one button.
**Do this instead:** Copy-source distribution (shadcn model) or per-component npm packages.

### Anti-Pattern 4: Shadow DOM Style Piercing

**What people do:** Use `::part()` and `::slotted()` extensively for external styling.
**Why it's wrong:** Creates tight coupling between component internals and external CSS. Breaks encapsulation.
**Do this instead:** Expose theming through CSS custom properties. Use `::part()` sparingly for advanced use cases.

### Anti-Pattern 5: Heavy Base Class

**What people do:** Put too much logic in the base TailwindElement class.
**Why it's wrong:** Every component inherits unnecessary code. Hard to tree-shake.
**Do this instead:** Keep base class minimal. Use Lit controllers or mixins for opt-in behaviors.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| npm Registry | Publish CLI package | `npx lit-ui` or global install |
| GitHub/CDN | Host registry.json and component source | Could be GitHub raw URLs or dedicated CDN |
| Tailwind CSS | PostCSS plugin at build time | Uses postcss-lit for Shadow DOM support |
| Bundlers (Vite/Rollup) | Consumer's build process | Components are source files, not pre-built |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| CLI <-> Registry | HTTP fetch (JSON) | Registry is read-only, CLI consumes |
| CLI <-> User Project | File system writes | Transformed source code |
| Component <-> Component | DOM events, properties | Standard web component patterns |
| Component <-> Tokens | CSS custom property inheritance | No JavaScript, pure CSS cascade |
| User App <-> Components | HTML attributes, properties, events | Standard custom element interface |

## Build Order Implications

Based on component dependencies, the recommended build/development order:

### Phase 1: Foundation
1. **Design tokens** (styles/tokens.css) - No dependencies
2. **Tailwind configuration** - Depends on tokens
3. **Utility functions** (lib/utils.ts) - No dependencies

### Phase 2: Primitives
4. **TailwindElement base class** - Depends on Tailwind config
5. **BaseElement** (if separate from TailwindElement) - Depends on TailwindElement

### Phase 3: Core Components (MVP)
6. **Button** - Depends on TailwindElement, tokens, utils
7. **Dialog** - Depends on TailwindElement, tokens, utils (may depend on Button for actions)

### Phase 4: CLI
8. **Registry schema** - Defines components from Phase 3
9. **CLI commands** - Depends on registry schema being stable
10. **Transformer** - May need adjustment as component patterns solidify

### Phase 5: Distribution
11. **Documentation site** - Showcases all components
12. **Integration examples** (React, Vue, Svelte) - Validates framework-agnostic claims

## Sources

### Official Documentation (HIGH confidence)
- [Lit.dev Documentation](https://lit.dev/docs/) - Component structure, styling patterns
- [Lit Styles Guide](https://lit.dev/docs/components/styles/) - CSS custom properties, theming
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) - CLI distribution model, registry schema
- [shadcn registry.json Schema](https://ui.shadcn.com/docs/registry/registry-json) - Registry structure
- [shadcn registry-item.json Schema](https://ui.shadcn.com/docs/registry/registry-item-json) - Component definition
- [shadcn components.json](https://ui.shadcn.com/docs/components-json) - Project configuration

### Reference Implementations (HIGH confidence)
- [Lit GitHub Repository](https://github.com/lit/lit) - Monorepo structure
- [Material Components Web Architecture](https://github.com/material-components/material-components-web/blob/master/docs/code/architecture.md) - Subsystem/component patterns
- [Shoelace GitHub](https://github.com/shoelace-style/shoelace) - Lit-based component library patterns

### Community Resources (MEDIUM confidence)
- [Open Web Components Generator](https://open-wc.org/docs/development/generator/) - Project scaffolding
- [Using Tailwind with Lit Elements](https://dev.to/43081j/using-tailwind-v3-with-lit-elements-39mk) - Tailwind integration patterns
- [Framework Interoperable Component Libraries with Lit](https://dev.to/reggi/framework-interoperable-component-libraries-using-lit-web-components-43ac) - Cross-framework patterns
- [The Anatomy of shadcn/ui](https://manupa.dev/blog/anatomy-of-shadcn-ui) - CLI distribution deep dive

---
*Architecture research for: lit-ui (CLI-distributed Lit.js component library)*
*Researched: 2026-01-23*
