# Phase 15: Component Packages - Research

**Researched:** 2026-01-24
**Domain:** Web component packaging, SSR-safe custom element registration, TypeScript type exports
**Confidence:** HIGH

## Summary

This phase migrates the existing Button and Dialog components from `src.old/` to independent npm packages (`@lit-ui/button`, `@lit-ui/dialog`). The components extend `@lit-ui/core`'s TailwindElement base class and require SSR-safe guards for browser-only APIs like `ElementInternals` (Button form participation) and `showModal()` (Dialog).

Key architectural insight: Both ElementInternals and HTMLDialogElement.showModal() are browser-only APIs with no SSR equivalents. Lit's `isServer` check enables graceful degradation where these features are skipped during server rendering but fully functional after client hydration. The pattern is straightforward: guard browser API calls with `if (!isServer)` and optionally warn in development mode.

The existing component implementations in `src.old/` are well-structured and need minimal changes beyond updating imports to use `@lit-ui/core` exports, adding isServer guards, updating tag names from `ui-*` to `lui-*`, and implementing safe custom element registration with name collision detection.

**Primary recommendation:** Migrate existing component code with minimal changes, adding `isServer` guards around `attachInternals()` in Button's constructor and `showModal()`/`close()` calls in Dialog's lifecycle methods. Use `customElements.get()` check before registration to prevent duplicate definition errors.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | ^3.0.0 | Web component base, isServer export | Official SSR support, native isServer check |
| @lit-ui/core | workspace:* | TailwindElement base class | Project's shared styling/SSR infrastructure |
| vite | ^7.3.1 | Build tooling | Already configured via @lit-ui/vite-config |
| vite-plugin-dts | ^4.5.4 | TypeScript declaration generation | Generates .d.ts for consumer type safety |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | (bundled with lit) | @customElement, @property | Component definition |
| lit/directives/class-map.js | (bundled with lit) | Dynamic class binding | Variant/size classes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auto-register on import | Explicit register() function | Breaks user decision; they want import = ready |
| Fixed tag names | Configurable tag names | User decided against; adds complexity |
| Per-component isServer guards | Centralized in base class | User decided per-component for explicit control |

**Installation:**
```bash
# Already configured in package.json, no additional installs needed
pnpm install
```

## Architecture Patterns

### Recommended Package Structure
```
packages/button/
├── src/
│   ├── index.ts           # Main exports: Button class, types, auto-registration
│   └── button.ts          # Component implementation
├── package.json           # Peer deps: lit, @lit-ui/core
├── tsconfig.json
└── vite.config.ts

packages/dialog/
├── src/
│   ├── index.ts           # Main exports: Dialog class, types, auto-registration
│   └── dialog.ts          # Component implementation
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: SSR-Safe ElementInternals for Form Participation
**What:** Guard attachInternals() call with isServer check, warn in development
**When to use:** Button component for form submit/reset functionality
**Example:**
```typescript
// Source: Lit SSR authoring docs + MDN ElementInternals
import { isServer } from 'lit';

export class Button extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  constructor() {
    super();

    // ElementInternals is a browser-only API
    if (!isServer) {
      this.internals = this.attachInternals();
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[lui-button] Form participation requires client-side hydration');
    }
  }

  private handleClick(e: MouseEvent) {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Guard form actions - internals may be null during SSR
    if (this.internals?.form) {
      if (this.type === 'submit') {
        this.internals.form.requestSubmit();
      } else if (this.type === 'reset') {
        this.internals.form.reset();
      }
    }
  }
}
```

### Pattern 2: SSR-Safe Dialog showModal/close
**What:** Guard showModal() and close() with isServer check, no-op during SSR
**When to use:** Dialog component for modal display
**Example:**
```typescript
// Source: Lit SSR authoring docs + existing dialog implementation
import { isServer } from 'lit';

export class Dialog extends TailwindElement {
  @query('dialog')
  private dialogEl!: HTMLDialogElement;

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      // Skip DOM manipulation during SSR
      if (isServer) return;

      if (this.open && !this.dialogEl.open) {
        this.dialogEl.showModal();
      } else if (!this.open && this.dialogEl.open) {
        this.dialogEl.close();
      }
    }
  }

  show() {
    // Safe to access document during client-side only
    if (!isServer) {
      this.triggerElement = document.activeElement as HTMLElement;
    }
    this.open = true;
  }

  close(reason: CloseReason = 'programmatic') {
    this.emitClose(reason);
  }
}
```

### Pattern 3: Safe Custom Element Registration with Collision Detection
**What:** Check if element already registered before calling customElements.define()
**When to use:** Auto-registration on import (user decision)
**Example:**
```typescript
// Source: HTML spec + community patterns
function safeDefine(tagName: string, constructor: CustomElementConstructor): void {
  if (typeof customElements === 'undefined') {
    // SSR environment - skip registration
    return;
  }

  if (customElements.get(tagName)) {
    // Already registered - warn but don't throw
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[${tagName}] Custom element already registered. ` +
        `This may indicate duplicate imports or version conflicts.`
      );
    }
    return;
  }

  customElements.define(tagName, constructor);
}

// Usage in index.ts
import { Button } from './button.js';
safeDefine('lui-button', Button);
export { Button };
```

### Pattern 4: TypeScript Type Exports for Consumer DX
**What:** Export named type aliases for props, events, slots
**When to use:** All component packages for TypeScript autocomplete
**Example:**
```typescript
// Source: Shoelace patterns + TypeScript best practices

// Types for variant/size props
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

// Event detail types
export interface ButtonClickDetail {
  originalEvent: MouseEvent;
}

// Slot names as type for documentation
export type ButtonSlot = 'default' | 'icon-start' | 'icon-end';

// Re-export for convenience
export { Button } from './button.js';
export type { ButtonVariant, ButtonSize, ButtonType, ButtonSlot };

// HTMLElementTagNameMap extension for type-safe DOM access
declare global {
  interface HTMLElementTagNameMap {
    'lui-button': Button;
  }
}
```

### Anti-Patterns to Avoid
- **Calling attachInternals() during SSR:** Will throw - ElementInternals doesn't exist in Node
- **Accessing document.activeElement during SSR:** Document is not available; guard with isServer
- **Using @query decorator result during SSR:** The element reference will be undefined
- **Bundling lit into the package:** Breaks isServer detection; always externalize lit
- **Marking sideEffects: true in package.json:** Prevents tree shaking of unused components

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSR detection | typeof window check | `import { isServer } from 'lit'` | Lit's check handles edge cases (Deno, workers) |
| Constructable stylesheet check | typeof CSSStyleSheet | `hasConstructableStylesheets` from @lit-ui/core | Checks replaceSync support |
| Type-safe events | Manual CustomEvent | `dispatchCustomEvent` from @lit-ui/core | Consistent composed: true, proper typing |
| CSS utility classes | Manual class concatenation | classMap directive | Efficient DOM updates, cleaner syntax |

**Key insight:** The core package already provides SSR utilities - use them consistently across component packages.

## Common Pitfalls

### Pitfall 1: ElementInternals Constructor Timing
**What goes wrong:** Calling `this.attachInternals()` when `isServer === true` throws an error
**Why it happens:** ElementInternals is a browser-only API with no SSR polyfill
**How to avoid:**
```typescript
constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```
**Warning signs:** "attachInternals is not defined" or similar errors during SSR

### Pitfall 2: Duplicate Custom Element Registration
**What goes wrong:** `DOMException: Failed to execute 'define' on 'CustomElementRegistry': the name has already been used`
**Why it happens:** Component imported multiple times, or different versions bundled
**How to avoid:** Check `customElements.get(tagName)` before calling `customElements.define()`
**Warning signs:** Error occurs in browser console on page load

### Pitfall 3: Query Decorator Results During SSR
**What goes wrong:** Accessing `this.dialogEl` in lifecycle methods during SSR returns undefined
**Why it happens:** Shadow DOM isn't created during SSR, @query can't find elements
**How to avoid:** Guard all @query results with isServer check or null check
**Warning signs:** "Cannot read property 'open' of undefined" during SSR

### Pitfall 4: Breaking Tree Shaking with Side Effects
**What goes wrong:** Entire package included even when only types are imported
**Why it happens:** Module-level customElements.define() is a side effect
**How to avoid:**
- Keep `sideEffects: false` in package.json (current setting is correct)
- The side effect (registration) is intentional per user decision
- Bundlers handle this correctly when lit is externalized
**Warning signs:** Unexpectedly large bundle sizes

### Pitfall 5: Missing Type Declarations
**What goes wrong:** Consumers don't get TypeScript autocomplete for component props
**Why it happens:** vite-plugin-dts not configured, or exports not correctly mapped
**How to avoid:**
- Ensure package.json exports include `"types"` field
- Verify dts plugin runs during build
- Check dist/ contains .d.ts files
**Warning signs:** "Could not find declaration file for module '@lit-ui/button'"

## Code Examples

Verified patterns from official sources and existing codebase:

### Complete Button Package Entry Point
```typescript
// packages/button/src/index.ts
// Source: Phase 15 CONTEXT.md decisions + existing src.old/button/button.ts

import { isServer } from 'lit';

// Export the component class
export { Button } from './button.js';

// Export types for consumers
export type {
  ButtonVariant,
  ButtonSize,
  ButtonType,
} from './button.js';

// Re-export common utilities from core for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Auto-register with collision detection
import { Button } from './button.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-button')) {
    customElements.define('lui-button', Button);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[lui-button] Custom element already registered. ' +
      'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-button': Button;
  }
}
```

### Complete Dialog Package Entry Point
```typescript
// packages/dialog/src/index.ts
// Source: Phase 15 CONTEXT.md decisions + existing src.old/dialog/dialog.ts

import { isServer } from 'lit';

// Export the component class
export { Dialog } from './dialog.js';

// Export types for consumers
export type {
  DialogSize,
  CloseReason,
} from './dialog.js';

// Re-export common utilities from core for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Auto-register with collision detection
import { Dialog } from './dialog.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-dialog')) {
    customElements.define('lui-dialog', Dialog);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[lui-dialog] Custom element already registered. ' +
      'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-dialog': Dialog;
  }
}
```

### Updated package.json Configuration
```json
{
  "name": "@lit-ui/button",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^0.0.1"
  },
  "devDependencies": {
    "@lit-ui/core": "workspace:*"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ui-* tag prefix | lui-* tag prefix | Phase 15 decision | Consistent naming across packages |
| No SSR guards | isServer guards | Phase 14-15 | Full SSR compatibility |
| Optional registration | Auto-register on import | Phase 15 decision | Simpler consumer DX |
| @lit-ui/core as dependency | @lit-ui/core as peer dependency | Phase 15 decision | Prevents version conflicts |

**Deprecated/outdated:**
- `ui-button` / `ui-dialog` tag names - replaced with `lui-button` / `lui-dialog`
- Direct import of TailwindElement from internal path - use `@lit-ui/core` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Dialog internal parts export (Claude's discretion area)**
   - What we know: User marked this as Claude's discretion
   - Recommendation: Do NOT export internal parts (overlay, panel). The Dialog is designed as a complete unit. Exporting parts adds maintenance burden and exposes implementation details. Consumers needing advanced composition can use the existing slot system.

2. **Dialog showModal()/close() SSR behavior (Claude's discretion area)**
   - What we know: Two options - no-op or queue approach
   - Recommendation: Use simple no-op approach. Queueing adds complexity for minimal benefit since:
     - SSR renders initial state (open=false typically)
     - After hydration, reactive property change triggers showModal()
     - No need to queue calls made during SSR window

3. **FOUC.css update for new tag names**
   - What we know: Current fouc.css uses `ui-button` and `ui-dialog`
   - What's unclear: Whether to update in Phase 15 or leave for consumer customization
   - Recommendation: Update fouc.css in core package to use `lui-button` and `lui-dialog` during this phase

## Sources

### Primary (HIGH confidence)
- [Lit SSR Authoring Guide](https://lit.dev/docs/ssr/authoring/) - isServer usage, browser API guards
- [Lit SSR DOM Emulation](https://lit.dev/docs/ssr/dom-emulation/) - Available/unavailable APIs during SSR
- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) - Form association requirements
- Existing codebase: `src.old/components/button/button.ts`, `src.old/components/dialog/dialog.ts`
- Existing codebase: `packages/core/src/tailwind-element.ts` - SSR patterns already implemented

### Secondary (MEDIUM confidence)
- [Shoelace TypeScript types PR](https://github.com/shoelace-style/shoelace/pull/1183) - Event type export patterns
- [Shoelace package.json](https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/package.json) - Export structure patterns
- [Lit @customElement discussion](https://github.com/lit/lit/discussions/4772) - Tree shaking considerations

### Tertiary (LOW confidence)
- [Svelte custom element registration issue](https://github.com/sveltejs/svelte/issues/7595) - customElements.get() pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing project infrastructure, no new dependencies
- Architecture: HIGH - Patterns derived from Lit SSR docs and existing working code
- Pitfalls: HIGH - Common issues well-documented in Lit community
- SSR patterns: HIGH - Verified against Lit official documentation

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain, component patterns are mature)
