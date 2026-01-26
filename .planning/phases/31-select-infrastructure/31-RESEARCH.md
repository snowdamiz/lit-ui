# Phase 31: Select Infrastructure - Research

**Researched:** 2026-01-26
**Domain:** Package structure, CSS tokens, dropdown positioning
**Confidence:** HIGH

## Summary

Phase 31 establishes the foundational infrastructure for the Select component: CSS custom properties (tokens), a new `@lit-ui/select` package, and Floating UI integration for dropdown positioning. This phase builds on established LitUI patterns from v4.0 (Input/Textarea tokens) and v2.0 (package structure).

The research confirms three requirements:
1. **INFRA-01:** CSS tokens follow the existing `--ui-*` naming convention in `packages/core/src/styles/tailwind.css`
2. **INFRA-02:** Package structure mirrors `@lit-ui/input` with SSR guards and peer dependencies
3. **INFRA-03:** `@floating-ui/dom` ^1.7.4 provides dropdown positioning with Shadow DOM compatibility

**Primary recommendation:** Create the select package following the exact patterns of @lit-ui/input, add CSS tokens to the existing tailwind.css file, and integrate @floating-ui/dom as a direct dependency (not peer dependency) since users don't interact with it directly.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @floating-ui/dom | ^1.7.4 | Dropdown positioning relative to trigger, collision detection | Industry standard, framework-agnostic, tree-shakeable (~3KB gzipped), explicit Shadow DOM support |
| lit | ^3.3.2 | Web component framework | Existing LitUI framework |
| @lit-ui/core | ^1.0.0 | TailwindElement base class, CSS tokens | LitUI architecture |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/lit-virtual | ^3.13.19 | Virtual scrolling for 100+ options | Phase 36 (Async Loading) - not needed for infrastructure |
| composed-offset-position | ^0.0.6 | Shadow DOM positioning edge cases | Only if positioning bugs appear with CSS transforms |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @floating-ui/dom | Manual positioning | Manual requires handling dozens of edge cases (transforms, iframes, scroll containers) |
| @floating-ui/dom | CSS Anchor Positioning | Only 76.17% browser support; revisit in 2027+ |
| @floating-ui/dom | Popover API alone | 89.66% support, but Select needs custom keyboard nav that conflicts with light dismiss |

**Installation (for packages/select):**
```bash
pnpm add @floating-ui/dom@^1.7.4
```

## Architecture Patterns

### Recommended Project Structure

```
packages/select/
├── src/
│   ├── index.ts           # Entry point with element registration
│   ├── select.ts          # Main Select component class
│   ├── option.ts          # lui-option component (future phase)
│   ├── option-group.ts    # lui-option-group component (future phase)
│   ├── jsx.d.ts           # JSX type definitions
│   └── vite-env.d.ts      # Vite environment types
├── package.json           # Dependencies and exports
├── tsconfig.json          # TypeScript config (extends shared)
└── vite.config.ts         # Vite build config (uses shared)
```

### Pattern 1: Package.json Structure

**What:** Direct dependency for Floating UI, peer dependencies for lit and core
**When to use:** Always for infrastructure libraries users don't interact with directly

```json
{
  "name": "@lit-ui/select",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": true,
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0"
  },
  "dependencies": {
    "@floating-ui/dom": "^1.7.4"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*",
    "@lit-ui/typescript-config": "workspace:*",
    "@lit-ui/vite-config": "workspace:*",
    "@tailwindcss/vite": "^4.1.18",
    "lit": "^3.3.2",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  }
}
```

### Pattern 2: CSS Token Naming Convention

**What:** Component tokens follow `--ui-{component}-{property}` pattern
**When to use:** All new component tokens

```css
/* Following input/textarea pattern from packages/core/src/styles/tailwind.css */
:root {
  /* -------------------------------------------------------------------------
   * Select Component
   * ------------------------------------------------------------------------- */

  /* Layout */
  --ui-select-radius: 0.375rem;
  --ui-select-border-width: 1px;
  --ui-select-transition: 150ms;
  --ui-select-dropdown-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --ui-select-dropdown-max-height: 15rem;
  --ui-select-option-height: 2.25rem;
  --ui-select-z-index: 50;

  /* Typography */
  --ui-select-font-size-sm: 0.875rem;
  --ui-select-font-size-md: 1rem;
  --ui-select-font-size-lg: 1.125rem;

  /* Spacing - Small */
  --ui-select-padding-x-sm: 0.75rem;
  --ui-select-padding-y-sm: 0.375rem;

  /* Spacing - Medium */
  --ui-select-padding-x-md: 1rem;
  --ui-select-padding-y-md: 0.5rem;

  /* Spacing - Large */
  --ui-select-padding-x-lg: 1.25rem;
  --ui-select-padding-y-lg: 0.75rem;

  /* Trigger state colors */
  --ui-select-bg: var(--color-background, white);
  --ui-select-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-select-border: var(--color-border, var(--ui-color-border));
  --ui-select-placeholder: var(--color-muted-foreground, var(--ui-color-muted-foreground));

  /* Focus state */
  --ui-select-border-focus: var(--color-ring, var(--ui-color-ring));
  --ui-select-ring: var(--color-ring, var(--ui-color-ring));

  /* Error state */
  --ui-select-border-error: var(--color-destructive, var(--ui-color-destructive));
  --ui-select-text-error: var(--color-destructive, var(--ui-color-destructive));

  /* Disabled state */
  --ui-select-bg-disabled: var(--color-muted, var(--ui-color-muted));
  --ui-select-text-disabled: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-select-border-disabled: var(--color-border, var(--ui-color-border));

  /* Dropdown colors */
  --ui-select-dropdown-bg: var(--color-card, var(--ui-color-card));
  --ui-select-dropdown-border: var(--color-border, var(--ui-color-border));

  /* Option colors */
  --ui-select-option-bg: transparent;
  --ui-select-option-bg-hover: var(--color-accent, var(--ui-color-accent));
  --ui-select-option-bg-active: var(--color-accent, var(--ui-color-accent));
  --ui-select-option-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-select-option-text-disabled: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-select-option-check: var(--color-primary, var(--ui-color-primary));
}
```

### Pattern 3: Floating UI Integration with Shadow DOM

**What:** Use `strategy: 'fixed'` for Shadow DOM compatibility
**When to use:** Any floating element positioning in web components

```typescript
// Source: https://floating-ui.com/docs/getting-started
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';
import { isServer } from 'lit';

async function positionDropdown(
  trigger: HTMLElement,
  dropdown: HTMLElement
): Promise<void> {
  // Skip during SSR - dropdown isn't visible anyway
  if (isServer) return;

  const { x, y } = await computePosition(trigger, dropdown, {
    placement: 'bottom-start',
    strategy: 'fixed', // Use fixed strategy for Shadow DOM compatibility
    middleware: [
      offset(4), // 4px gap between trigger and dropdown
      flip({
        fallbackPlacements: ['top-start'], // Flip to top if no room below
      }),
      shift({ padding: 8 }), // Keep 8px from viewport edges
      size({
        apply({ availableHeight, elements }) {
          // Constrain dropdown height to available space
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight, 240)}px`, // --ui-select-dropdown-max-height
          });
        },
      }),
    ],
  });

  Object.assign(dropdown.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
}
```

### Pattern 4: Index.ts Entry Point

**What:** Element registration with collision detection
**When to use:** All component package entry points

```typescript
// Source: packages/input/src/index.ts pattern
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

export { Select } from './select.js';
export type { SelectSize } from './select.js';

// Re-export for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe registration with collision detection
import { Select } from './select.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-select')) {
    customElements.define('lui-select', Select);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-select] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-select': Select;
  }
}
```

### Anti-Patterns to Avoid

- **Portaling dropdown outside shadow root:** Causes inert issues inside modal dialogs, breaks CSS cascade for tokens
- **Using Floating UI as peer dependency:** Users shouldn't need to install positioning libraries directly
- **Defining tokens in the select package:** Tokens must be in @lit-ui/core to cascade properly into Shadow DOM
- **Using CSS Anchor Positioning:** Only 76.17% browser support, not production-ready

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning | Manual `getBoundingClientRect()` calculations | @floating-ui/dom | Edge cases: transforms, iframes, scroll containers, viewport overflow |
| Collision detection | Check if element fits in viewport | Floating UI `flip()` middleware | Handles all placement fallbacks automatically |
| Viewport constraint | Manually calculate available height | Floating UI `size()` middleware | Responsive to scroll, resize, and available space |
| Click-outside detection | `event.target !== this` | `event.composedPath().includes(this)` | Shadow DOM retargets events |

**Key insight:** Positioning looks simple until you encounter transformed ancestors, scrolling containers, iframes, or viewport edges. Floating UI is only ~3KB and handles all these cases.

## Common Pitfalls

### Pitfall 1: Wrong External Configuration in Vite

**What goes wrong:** Floating UI gets bundled into the package instead of being externalized, causing duplicate instances
**Why it happens:** Default vite-config externalizes `@lit-ui/*` but not other packages
**How to avoid:** Ensure vite.config.ts does NOT externalize @floating-ui/dom (it should be bundled with the component)
**Warning signs:** Large bundle size increase, positioning works in dev but fails in production

**Note:** The existing `@lit-ui/vite-config/library.js` externalizes `@lit-ui/*` only, which is correct. Floating UI will be bundled automatically.

### Pitfall 2: SSR Crashes from Floating UI

**What goes wrong:** `computePosition` accesses DOM APIs that don't exist during SSR
**Why it happens:** Floating UI is browser-only
**How to avoid:** Guard all positioning calls with `if (isServer) return;`
**Warning signs:** "document is not defined" or "window is not defined" errors during SSR

```typescript
// CORRECT
private async updatePosition(): Promise<void> {
  if (isServer || !this.open) return;
  await this.positionDropdown();
}
```

### Pitfall 3: Token Export Missing from Core

**What goes wrong:** Select tokens aren't accessible via `@lit-ui/core/tokens`
**Why it happens:** Forgetting to add TypeScript types for new tokens
**How to avoid:** Add `SelectToken` type to `packages/core/src/tokens/index.ts`
**Warning signs:** TypeScript errors when trying to use `tokens.select.*`

### Pitfall 4: Missing Dropdown in Top Layer Context

**What goes wrong:** Dropdown appears behind other elements or modals
**Why it happens:** Not using proper z-index or fixed positioning
**How to avoid:** Use `--ui-select-z-index: 50` and `position: fixed` for dropdown
**Warning signs:** Dropdown hidden behind other content, especially in dialogs

## Code Examples

### Vite Config

```typescript
// packages/select/vite.config.ts
// Source: packages/input/vite.config.ts pattern
import { createLibraryConfig } from '@lit-ui/vite-config/library';

export default createLibraryConfig({
  entry: 'src/index.ts'
});
```

### TypeScript Config

```json
// packages/select/tsconfig.json
// Source: packages/input/tsconfig.json pattern
{
  "extends": "@lit-ui/typescript-config/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "."
  },
  "include": ["src"]
}
```

### Skeleton Select Component for Infrastructure Validation

```typescript
// packages/select/src/select.ts
// Minimal skeleton to validate build pipeline - full implementation in Phase 32
import { html, css, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { computePosition, flip, shift, offset, size } from '@floating-ui/dom';

export type SelectSize = 'sm' | 'md' | 'lg';

export class Select extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  @property({ type: String })
  size: SelectSize = 'md';

  @property({ type: String })
  placeholder = 'Select an option';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: inline-block;
      }

      .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: var(--ui-select-radius);
        border-width: var(--ui-select-border-width);
        border-style: solid;
        border-color: var(--ui-select-border);
        background-color: var(--ui-select-bg);
        color: var(--ui-select-text);
        cursor: pointer;
        transition: border-color var(--ui-select-transition);
      }

      .trigger.trigger-sm {
        padding: var(--ui-select-padding-y-sm) var(--ui-select-padding-x-sm);
        font-size: var(--ui-select-font-size-sm);
      }

      .trigger.trigger-md {
        padding: var(--ui-select-padding-y-md) var(--ui-select-padding-x-md);
        font-size: var(--ui-select-font-size-md);
      }

      .trigger.trigger-lg {
        padding: var(--ui-select-padding-y-lg) var(--ui-select-padding-x-lg);
        font-size: var(--ui-select-font-size-lg);
      }

      .placeholder {
        color: var(--ui-select-placeholder);
      }
    `,
  ];

  override render() {
    return html`
      <div
        class="trigger trigger-${this.size}"
        role="combobox"
        aria-expanded="false"
        aria-haspopup="listbox"
        tabindex="0"
      >
        <span class="placeholder">${this.placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" />
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-select': Select;
  }
}
```

### Tokens Export Update

```typescript
// Addition to packages/core/src/tokens/index.ts
export const tokens = {
  // ... existing tokens ...
  select: {
    // Layout
    radius: 'var(--ui-select-radius)',
    borderWidth: 'var(--ui-select-border-width)',
    transition: 'var(--ui-select-transition)',
    dropdownShadow: 'var(--ui-select-dropdown-shadow)',
    dropdownMaxHeight: 'var(--ui-select-dropdown-max-height)',
    optionHeight: 'var(--ui-select-option-height)',
    zIndex: 'var(--ui-select-z-index)',

    // Typography
    fontSizeSm: 'var(--ui-select-font-size-sm)',
    fontSizeMd: 'var(--ui-select-font-size-md)',
    fontSizeLg: 'var(--ui-select-font-size-lg)',

    // Spacing
    paddingXSm: 'var(--ui-select-padding-x-sm)',
    paddingYSm: 'var(--ui-select-padding-y-sm)',
    paddingXMd: 'var(--ui-select-padding-x-md)',
    paddingYMd: 'var(--ui-select-padding-y-md)',
    paddingXLg: 'var(--ui-select-padding-x-lg)',
    paddingYLg: 'var(--ui-select-padding-y-lg)',

    // Trigger state
    bg: 'var(--ui-select-bg)',
    text: 'var(--ui-select-text)',
    border: 'var(--ui-select-border)',
    placeholder: 'var(--ui-select-placeholder)',

    // Focus state
    borderFocus: 'var(--ui-select-border-focus)',
    ring: 'var(--ui-select-ring)',

    // Error state
    borderError: 'var(--ui-select-border-error)',
    textError: 'var(--ui-select-text-error)',

    // Disabled state
    bgDisabled: 'var(--ui-select-bg-disabled)',
    textDisabled: 'var(--ui-select-text-disabled)',
    borderDisabled: 'var(--ui-select-border-disabled)',

    // Dropdown
    dropdownBg: 'var(--ui-select-dropdown-bg)',
    dropdownBorder: 'var(--ui-select-dropdown-border)',

    // Option
    optionBg: 'var(--ui-select-option-bg)',
    optionBgHover: 'var(--ui-select-option-bg-hover)',
    optionBgActive: 'var(--ui-select-option-bg-active)',
    optionText: 'var(--ui-select-option-text)',
    optionTextDisabled: 'var(--ui-select-option-text-disabled)',
    optionCheck: 'var(--ui-select-option-check)',
  },
} as const;

export type SelectToken = keyof typeof tokens.select;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| aria-owns for combobox | aria-controls (ARIA 1.2) | ARIA 1.2 (2021+) | Better screen reader support |
| Popper.js | Floating UI | 2022 | Smaller bundle, better tree-shaking |
| Manual positioning | CSS Anchor Positioning | Chrome 125 (2024) | Not yet universal (76.17% support) |
| Large virtualization libs | @tanstack/lit-virtual | 2024 | Headless, Lit-native reactive controller |

**Deprecated/outdated:**
- Popper.js: Replaced by Floating UI (same author, official successor)
- aria-owns for combobox: Use aria-controls per ARIA 1.2
- @lit-labs/virtualizer: Still experimental, breaking changes likely

## Open Questions

1. **Virtual scrolling threshold**
   - What we know: @tanstack/lit-virtual works with Lit reactive controllers
   - What's unclear: Exact performance threshold (100? 200? 500 options?)
   - Recommendation: Defer to Phase 36, default to no virtualization, add when needed

2. **Popover API integration**
   - What we know: 89.66% support, provides top-layer promotion automatically
   - What's unclear: Compatibility with custom keyboard navigation for Select
   - Recommendation: Start with manual implementation, evaluate Popover API later

## Sources

### Primary (HIGH confidence)
- [Floating UI Getting Started](https://floating-ui.com/docs/getting-started) - Version 1.7.4, basic API
- [Floating UI Platform](https://floating-ui.com/docs/platform) - Shadow DOM support
- [npm @floating-ui/dom](https://www.npmjs.com/package/@floating-ui/dom) - Version verification
- LitUI codebase - packages/input, packages/core (established patterns)

### Secondary (MEDIUM confidence)
- [W3C APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) - ARIA 1.2 specification
- [Can I Use - CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning) - 76.17% support
- [Can I Use - Popover API](https://caniuse.com/mdn-api_htmlelement_popover) - 89.66% support

### Prior Research (HIGH confidence)
- `.planning/research/STACK-SELECT.md` - Comprehensive stack analysis
- `.planning/research/FEATURES-SELECT.md` - Feature requirements
- `.planning/research/PITFALLS-SELECT.md` - Common pitfalls

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm versions verified, Floating UI is industry standard
- Architecture: HIGH - Following established LitUI patterns from v4.0
- Pitfalls: HIGH - Prior research documents Shadow DOM and SSR concerns

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable infrastructure)
