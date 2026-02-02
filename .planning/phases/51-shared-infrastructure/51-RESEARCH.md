# Phase 51: Shared Infrastructure - Research

**Researched:** 2026-02-02
**Domain:** Floating UI positioning wrapper, CSS design tokens, CSS animations for overlay components
**Confidence:** HIGH

## Summary

Phase 51 builds four foundational pieces that downstream overlay components (Tooltip, Popover, Toast) consume. The research confirms this is a well-scoped infrastructure phase with zero external unknowns: every technology is either already used in the codebase or documented with HIGH confidence from official sources.

The four deliverables are: (1) a `@lit-ui/core/floating` export wrapping `@floating-ui/dom` with `composed-offset-position` ponyfill for Shadow DOM correctness, (2) verified integration testing that Floating UI works inside nested Shadow DOM, (3) CSS custom property token namespaces for toast, tooltip, and popover following the established `--ui-{component}-*` pattern, and (4) a shared CSS animation mixin using `@starting-style` + `transition-behavior: allow-discrete` extracted from Dialog's proven pattern.

**Primary recommendation:** Add `@floating-ui/dom` and `composed-offset-position` as dependencies of `@lit-ui/core` (not individual component packages), create a new `src/floating/` directory with a thin wrapper module, add token definitions to `tailwind.css`, and extract Dialog's animation CSS into a reusable pattern in `src/styles/`.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@floating-ui/dom` | ^1.7.4 | Element-anchored positioning with collision detection | Already used by 4 packages (select, date-picker, date-range-picker, time-picker). Official Floating UI recommendation for vanilla DOM. |
| `composed-offset-position` | ^0.0.6 | Ponyfill for correct `offsetParent` in Shadow DOM | Floating UI's official recommendation for Shadow DOM. Required because browsers return incorrect offsetParent inside shadow trees (CSS spec change). |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lit` | ^3.3.2 | Base framework (peer dep) | Already a peer dep of @lit-ui/core |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `composed-offset-position` | `strategy: 'fixed'` only | Fixed strategy masks the offsetParent bug in most cases but fails in complex nested layouts. The ponyfill is the correct fix. |
| Shared utility in core | Each component imports Floating UI directly | Current pattern (Select, DatePicker each import directly). Works but duplicates Shadow DOM platform config and lacks `composed-offset-position`. |

**Installation (add to @lit-ui/core):**
```bash
pnpm add -F @lit-ui/core @floating-ui/dom composed-offset-position
```

**Note:** This moves `@floating-ui/dom` from individual component dependencies to `@lit-ui/core`. Downstream components (tooltip, popover) will get it transitively. Existing components (select, date-picker, etc.) can optionally migrate to the shared utility later but do NOT need to change now.

## Architecture Patterns

### Recommended Changes to Core Package Structure

```
packages/core/src/
  floating/
    index.ts          # Public API: positionFloating, autoUpdateFloating, middleware re-exports
  styles/
    overlay-animation.css  # Shared @starting-style + allow-discrete animation pattern
    tailwind.css      # (existing) Add --ui-toast-*, --ui-tooltip-*, --ui-popover-* tokens
  tokens/
    index.ts          # (existing) Add toast, tooltip, popover token objects
  index.ts            # (existing) No changes needed - floating has its own export path
```

### Pattern 1: Floating UI Wrapper with Shadow DOM Platform Fix

**What:** A thin wrapper around `computePosition` that pre-configures the `composed-offset-position` platform fix, and a wrapper around `autoUpdate` that returns a cleanup function.

**When to use:** Any component that needs element-anchored positioning (Tooltip, Popover). NOT needed for viewport-anchored components (Toast).

**Example:**
```typescript
// Source: Floating UI platform docs (https://floating-ui.com/docs/platform)
// packages/core/src/floating/index.ts

import {
  computePosition as _computePosition,
  autoUpdate as _autoUpdate,
  platform,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type AutoUpdateOptions,
} from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';

// Re-export middleware for downstream consumers
export { flip, shift, offset, arrow, size } from '@floating-ui/dom';
export type { Placement, MiddlewareData } from '@floating-ui/dom';

/**
 * Shadow DOM-safe platform configuration.
 * Overrides getOffsetParent to use composed-offset-position ponyfill,
 * fixing incorrect positioning inside nested shadow roots.
 */
const shadowDomPlatform = {
  ...platform,
  getOffsetParent: (element: Element) =>
    platform.getOffsetParent(element, offsetParent),
};

/**
 * Compute position with Shadow DOM-safe platform.
 * Drop-in replacement for @floating-ui/dom computePosition.
 */
export function computePosition(
  reference: Element,
  floating: HTMLElement,
  config?: Partial<ComputePositionConfig>
): Promise<ComputePositionReturn> {
  return _computePosition(reference, floating, {
    ...config,
    platform: shadowDomPlatform,
  });
}

/**
 * Auto-update position on scroll/resize with cleanup.
 * Returns a cleanup function to call in disconnectedCallback.
 */
export function autoUpdatePosition(
  reference: Element,
  floating: HTMLElement,
  update: () => void,
  options?: AutoUpdateOptions
): () => void {
  return _autoUpdate(reference, floating, update, options);
}
```

### Pattern 2: CSS Token Namespace Convention

**What:** CSS custom properties following the established `--ui-{component}-{property}` naming convention, defined on `:root` in `tailwind.css` with semantic color references.

**When to use:** All three overlay components need their own token namespace. Define them now so downstream phases have tokens ready.

**Example (following existing Dialog/Select pattern in tailwind.css):**
```css
/* Tooltip tokens */
--ui-tooltip-bg: var(--color-foreground, var(--ui-color-foreground));
--ui-tooltip-text: var(--color-background, white);
--ui-tooltip-radius: 0.375rem;
--ui-tooltip-padding-x: 0.75rem;
--ui-tooltip-padding-y: 0.375rem;
--ui-tooltip-font-size: 0.875rem;
--ui-tooltip-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--ui-tooltip-arrow-size: 8px;
--ui-tooltip-max-width: 20rem;
--ui-tooltip-z-index: 50;

/* Popover tokens */
--ui-popover-bg: var(--color-card, var(--ui-color-card));
--ui-popover-text: var(--color-card-foreground, var(--ui-color-card-foreground));
--ui-popover-border: var(--color-border, var(--ui-color-border));
--ui-popover-radius: 0.5rem;
--ui-popover-padding: 1rem;
--ui-popover-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--ui-popover-arrow-size: 8px;
--ui-popover-max-width: 20rem;
--ui-popover-z-index: 50;

/* Toast tokens */
--ui-toast-bg: var(--color-card, var(--ui-color-card));
--ui-toast-text: var(--color-card-foreground, var(--ui-color-card-foreground));
--ui-toast-border: var(--color-border, var(--ui-color-border));
--ui-toast-radius: 0.5rem;
--ui-toast-padding: 1rem;
--ui-toast-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--ui-toast-max-width: 24rem;
--ui-toast-gap: 0.75rem;
--ui-toast-z-index: 50;
/* Toast variant colors */
--ui-toast-success-bg: oklch(0.95 0.05 150);
--ui-toast-success-border: oklch(0.70 0.15 150);
--ui-toast-success-icon: oklch(0.55 0.20 150);
--ui-toast-error-bg: oklch(0.95 0.05 25);
--ui-toast-error-border: oklch(0.70 0.15 25);
--ui-toast-error-icon: oklch(0.55 0.20 25);
--ui-toast-warning-bg: oklch(0.95 0.05 85);
--ui-toast-warning-border: oklch(0.70 0.15 85);
--ui-toast-warning-icon: oklch(0.55 0.20 85);
--ui-toast-info-bg: oklch(0.95 0.05 250);
--ui-toast-info-border: oklch(0.70 0.15 250);
--ui-toast-info-icon: oklch(0.55 0.20 250);
```

### Pattern 3: Shared Overlay Animation CSS (from Dialog)

**What:** Extract the `@starting-style` + `transition-behavior: allow-discrete` animation pattern already proven in Dialog into a documented, reusable pattern.

**When to use:** All overlay components (tooltip fade-in, popover scale+fade, toast slide-in).

**Existing Dialog pattern (verified from codebase):**
```css
/* From packages/dialog/src/dialog.ts - lines 152-197 */

/* Base: hidden state */
dialog {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out,
    display 150ms allow-discrete,
    overlay 150ms allow-discrete;
}

/* Open: visible state */
dialog[open] {
  opacity: 1;
  transform: scale(1);
}

/* Entry animation starting values */
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  dialog, dialog::backdrop {
    transition: none;
  }
}
```

**Shared pattern for overlay components:**
```css
/* Reusable overlay animation pattern
 * Apply to any overlay element that needs enter/exit transitions.
 * The key insight: transition `display` and `overlay` with allow-discrete
 * to animate elements entering/leaving the top layer or going to/from display:none.
 *
 * Template for component authors:
 */

/* 1. Base state (hidden) */
.overlay {
  opacity: 0;
  /* Add component-specific transforms here (scale, translateY, etc.) */
  transition:
    opacity var(--duration, 150ms) ease-out,
    transform var(--duration, 150ms) ease-out,
    display var(--duration, 150ms) allow-discrete,
    overlay var(--duration, 150ms) allow-discrete;
}

/* 2. Active state (visible) */
.overlay[data-open],
.overlay:popover-open {
  opacity: 1;
  /* Reset transforms to identity */
}

/* 3. Entry animation starting values */
@starting-style {
  .overlay[data-open],
  .overlay:popover-open {
    opacity: 0;
    /* Same as base state transforms */
  }
}

/* 4. Always respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .overlay {
    transition: none;
  }
}
```

### Anti-Patterns to Avoid

- **Adding @floating-ui/dom as a dependency of individual overlay packages:** Centralizing in core ensures the `composed-offset-position` platform fix is applied everywhere. Individual packages should import from `@lit-ui/core/floating`.
- **Using `@keyframes` for overlay animations:** The `@starting-style` approach handles both enter AND exit animations with CSS alone, no JS animation frame management needed. Dialog already proves this works.
- **Defining tokens in component packages instead of core:** All `--ui-*` tokens live in `@lit-ui/core`'s `tailwind.css` `:root` block. This ensures they cascade into Shadow DOM correctly and are available for theming without installing the component.
- **Skipping `overlay` in the transition list:** Without `transition: overlay ... allow-discrete`, popover elements in the top layer won't animate on exit. This is required alongside `display` for Popover API elements.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Shadow DOM offsetParent fix | Custom offset calculation | `composed-offset-position` ponyfill | Browser spec changed offsetParent behavior in Shadow DOM. The ponyfill is 1KB and handles all edge cases including nested shadow roots. |
| Position calculation | Manual getBoundingClientRect math | `@floating-ui/dom` `computePosition` | Collision detection, viewport boundaries, scroll handling, placement flipping are non-trivial. Already proven in 4 packages. |
| Scroll/resize repositioning | Manual scroll event listeners | `@floating-ui/dom` `autoUpdate` | Handles ancestor scroll, resize, element resize, and layout shift with optimal performance (ResizeObserver, IntersectionObserver internally). |
| CSS enter/exit animations | JS-managed animation states with transitionend events | `@starting-style` + `allow-discrete` | Native CSS solution proven in Dialog. Zero JS overhead, handles both enter and exit, works with `display: none` toggling. |

**Key insight:** This phase is almost entirely wiring existing solutions together. The Floating UI wrapper is ~50 lines. Token definitions are copy-paste from existing patterns. The animation CSS is extracted from Dialog. The novelty is the `composed-offset-position` integration, which is 3 lines of platform config.

## Common Pitfalls

### Pitfall 1: Floating UI Incorrectly Positioned in Nested Shadow DOM

**What goes wrong:** Elements positioned by Floating UI appear at wrong coordinates (sometimes hundreds of pixels off) when the component is nested inside other Shadow DOM components.
**Why it happens:** Browsers return incorrect `offsetParent` inside shadow trees per the CSS spec change. Since all LitUI components use Shadow DOM, this affects any nesting scenario.
**How to avoid:** Use `composed-offset-position` ponyfill in the platform config (the exact code in Pattern 1 above).
**Warning signs:** Positioning works in simple test pages but breaks when the component is used inside another LitUI component.

**Source:** [Floating UI Platform docs](https://floating-ui.com/docs/platform), [Floating UI issue #1345](https://github.com/floating-ui/floating-ui/issues/1345) (HIGH confidence)

### Pitfall 2: Forgetting `display` and `overlay` in Transition List

**What goes wrong:** Elements using `@starting-style` animate on entry but snap to hidden on exit (no exit animation).
**Why it happens:** `display: none` is a discrete property. Without `transition: display ... allow-discrete`, the element immediately becomes `display: none` before the opacity/transform transition can play. Similarly, `overlay` is needed for Popover API elements to stay in the top layer during exit.
**How to avoid:** Always include `display` and `overlay` in the transition property list with `allow-discrete`. This is already correct in Dialog's implementation.
**Warning signs:** Fade-in works, but closing causes instant disappearance.

**Source:** [MDN @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style), Dialog codebase (HIGH confidence)

### Pitfall 3: Token Naming Conflicts with Existing Components

**What goes wrong:** New tokens accidentally shadow or conflict with existing component tokens.
**Why it happens:** All tokens share the `:root` scope. A typo or reused name could override an existing value.
**How to avoid:** Follow the strict `--ui-{component}-{property}` naming convention. The three new namespaces (`--ui-toast-*`, `--ui-tooltip-*`, `--ui-popover-*`) do not overlap with any existing namespaces (`--ui-button-*`, `--ui-dialog-*`, `--ui-input-*`, `--ui-textarea-*`, `--ui-select-*`, `--ui-switch-*`, `--ui-checkbox-*`, `--ui-radio-*`, `--ui-calendar-*`).
**Warning signs:** Existing component styling changes after adding new tokens.

### Pitfall 4: Making @floating-ui/dom a Regular Dependency of Core

**What goes wrong:** Every app that imports `@lit-ui/core` for TailwindElement also downloads Floating UI, even if they only use Button or Dialog (no positioning needed).
**Why it happens:** Adding to `dependencies` makes it always installed.
**How to avoid:** `@floating-ui/dom` and `composed-offset-position` should be `dependencies` of `@lit-ui/core` BUT the `floating` export is a separate entry point. Modern bundlers tree-shake unused entry points. Alternatively, consider making them `peerDependencies` with `optional: true` or keeping as regular deps since the Floating UI bundle is small (~6KB gzipped). **Recommendation:** Use regular dependencies. The 6KB cost is negligible, and it simplifies the DX for tooltip/popover consumers who just `import from '@lit-ui/core/floating'`.

### Pitfall 5: Not Adding Dark Mode Overrides for New Tokens

**What goes wrong:** New overlay tokens look correct in light mode but have wrong colors in dark mode.
**Why it happens:** The `.dark` block in `tailwind.css` needs explicit overrides for component tokens that reference semantic colors.
**How to avoid:** For every token that references a color, add a corresponding override in the `.dark` block. Follow the existing pattern (see Calendar dark mode overrides at line 194-203 of `tailwind.css`).
**Warning signs:** Components look wrong when `.dark` class is on `<html>`.

## Code Examples

### Adding the `floating` Export to Core's package.json

```json
// Source: existing packages/core/package.json exports pattern
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./floating": {
      "types": "./dist/floating/index.d.ts",
      "import": "./dist/floating/index.js"
    },
    "./tokens": {
      "types": "./dist/tokens/index.d.ts",
      "import": "./dist/tokens/index.js"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.js"
    },
    "./fouc.css": "./src/fouc.css"
  }
}
```

### Adding `floating` Entry to Core's Vite Config

```typescript
// Source: existing packages/core/vite.config.ts pattern
build: {
  lib: {
    entry: {
      index: 'src/index.ts',
      'floating/index': 'src/floating/index.ts',
      'tokens/index': 'src/tokens/index.ts',
      'utils/index': 'src/utils/index.ts',
    },
    formats: ['es'],
  },
  rollupOptions: {
    // NOTE: Do NOT externalize @floating-ui/dom or composed-offset-position
    // They should be bundled into the floating entry point
    external: ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//],
  },
}
```

### Adding Token Objects to tokens/index.ts

```typescript
// Source: existing token pattern in packages/core/src/tokens/index.ts

export const tokens = {
  // ... existing tokens ...

  tooltip: {
    bg: 'var(--ui-tooltip-bg)',
    text: 'var(--ui-tooltip-text)',
    radius: 'var(--ui-tooltip-radius)',
    paddingX: 'var(--ui-tooltip-padding-x)',
    paddingY: 'var(--ui-tooltip-padding-y)',
    fontSize: 'var(--ui-tooltip-font-size)',
    shadow: 'var(--ui-tooltip-shadow)',
    arrowSize: 'var(--ui-tooltip-arrow-size)',
    maxWidth: 'var(--ui-tooltip-max-width)',
    zIndex: 'var(--ui-tooltip-z-index)',
  },

  popover: {
    bg: 'var(--ui-popover-bg)',
    text: 'var(--ui-popover-text)',
    border: 'var(--ui-popover-border)',
    radius: 'var(--ui-popover-radius)',
    padding: 'var(--ui-popover-padding)',
    shadow: 'var(--ui-popover-shadow)',
    arrowSize: 'var(--ui-popover-arrow-size)',
    maxWidth: 'var(--ui-popover-max-width)',
    zIndex: 'var(--ui-popover-z-index)',
  },

  toast: {
    bg: 'var(--ui-toast-bg)',
    text: 'var(--ui-toast-text)',
    border: 'var(--ui-toast-border)',
    radius: 'var(--ui-toast-radius)',
    padding: 'var(--ui-toast-padding)',
    shadow: 'var(--ui-toast-shadow)',
    maxWidth: 'var(--ui-toast-max-width)',
    gap: 'var(--ui-toast-gap)',
    zIndex: 'var(--ui-toast-z-index)',
    // Variant colors
    successBg: 'var(--ui-toast-success-bg)',
    successBorder: 'var(--ui-toast-success-border)',
    successIcon: 'var(--ui-toast-success-icon)',
    errorBg: 'var(--ui-toast-error-bg)',
    errorBorder: 'var(--ui-toast-error-border)',
    errorIcon: 'var(--ui-toast-error-icon)',
    warningBg: 'var(--ui-toast-warning-bg)',
    warningBorder: 'var(--ui-toast-warning-border)',
    warningIcon: 'var(--ui-toast-warning-icon)',
    infoBg: 'var(--ui-toast-info-bg)',
    infoBorder: 'var(--ui-toast-info-border)',
    infoIcon: 'var(--ui-toast-info-icon)',
  },
} as const;

// Add type exports
export type TooltipToken = keyof typeof tokens.tooltip;
export type PopoverToken = keyof typeof tokens.popover;
export type ToastToken = keyof typeof tokens.toast;
```

### How Downstream Tooltip/Popover Will Consume the Floating Utility

```typescript
// Example: How tooltip will use the shared utility
import { computePosition, autoUpdatePosition, flip, shift, offset, arrow } from '@lit-ui/core/floating';

class Tooltip extends TailwindElement {
  private cleanupAutoUpdate?: () => void;

  private async updatePosition() {
    const { x, y, middlewareData, placement } = await computePosition(
      this.triggerEl,
      this.tooltipEl,
      {
        placement: this.placement,
        strategy: 'fixed',
        middleware: [
          offset(8),
          flip(),
          shift({ padding: 8 }),
          arrow({ element: this.arrowEl }),
        ],
      }
    );

    // Position tooltip
    Object.assign(this.tooltipEl.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // Position arrow
    if (middlewareData.arrow) {
      const { x: ax, y: ay } = middlewareData.arrow;
      Object.assign(this.arrowEl.style, {
        left: ax != null ? `${ax}px` : '',
        top: ay != null ? `${ay}px` : '',
      });
    }
  }

  private startAutoUpdate() {
    this.cleanupAutoUpdate = autoUpdatePosition(
      this.triggerEl,
      this.tooltipEl,
      () => this.updatePosition()
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupAutoUpdate?.();
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS animation management with `transitionend` events | `@starting-style` + `transition-behavior: allow-discrete` | Baseline since Aug 2024 (~88% support) | Pure CSS enter/exit animations, no JS needed |
| `z-index: 999999` for overlays | Popover API top-layer (`popover="manual"`) | Baseline Widely Available Apr 2025 (~95% support) | Escapes all stacking contexts |
| Manual `offsetParent` calculation in Shadow DOM | `composed-offset-position` ponyfill | v0.0.6 (stable) | 3-line Floating UI platform config fix |

**Deprecated/outdated:**
- `@keyframes` for overlay enter/exit: Still works but `@starting-style` is simpler for the enter case and `allow-discrete` handles exit. Dialog already uses the modern approach.
- Manual scroll listeners for repositioning: `autoUpdate` from Floating UI uses ResizeObserver + IntersectionObserver internally, more efficient and complete.

## Open Questions

1. **Should `@floating-ui/dom` be bundled into the floating entry or kept external?**
   - What we know: Current pattern externalizes all `@lit-ui/*` packages. Floating UI is a third-party dep (~6KB gzipped).
   - What's unclear: Whether bundling it into the core floating entry is better (simpler for consumers) vs keeping it external (deduplication if consumer also uses Floating UI directly).
   - Recommendation: Keep it as a regular dependency of core and let the bundler handle dedup. Do NOT externalize it in the vite config for the floating entry point, so it gets bundled into the output.

2. **Should existing Select/DatePicker/etc. be migrated to the shared utility in this phase?**
   - What we know: They work fine with `strategy: 'fixed'` masking the offsetParent issue. Migration would add `composed-offset-position` correctness.
   - What's unclear: Whether the migration is worth the risk of regressions in working components.
   - Recommendation: Do NOT migrate existing components in this phase. They are stable. Migration can be a separate tech-debt task after v5.0 ships.

3. **Toast variant token colors for dark mode**
   - What we know: Toast success/error/warning/info use OKLCH colors with high lightness (0.95) for backgrounds. These will look wrong in dark mode.
   - What's unclear: Exact dark mode values need design review.
   - Recommendation: Define light mode defaults now and add `.dark` overrides with inverted lightness (lower L values for backgrounds, higher L for text).

## Sources

### Primary (HIGH confidence)
- [Floating UI Platform docs](https://floating-ui.com/docs/platform) - `composed-offset-position` integration pattern
- [Floating UI autoUpdate docs](https://floating-ui.com/docs/autoupdate) - Cleanup function API, options
- [Floating UI arrow docs](https://floating-ui.com/docs/arrow) - Arrow middleware API and positioning data
- [MDN @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) - CSS entry animation specification
- LitUI codebase: `packages/dialog/src/dialog.ts` lines 136-197 - Proven animation pattern
- LitUI codebase: `packages/select/src/select.ts` lines 44, 2227-2260 - Existing Floating UI usage
- LitUI codebase: `packages/core/src/styles/tailwind.css` - Token definition pattern
- LitUI codebase: `packages/core/src/tokens/index.ts` - Token object pattern
- LitUI codebase: `packages/core/vite.config.ts` - Build entry point pattern
- LitUI codebase: `packages/core/package.json` - Export map pattern

### Secondary (MEDIUM confidence)
- [npm: composed-offset-position](https://www.npmjs.com/package/composed-offset-position) - Version 0.0.6, stable
- [Floating UI issue #1345](https://github.com/floating-ui/floating-ui/issues/1345) - Shadow DOM offsetParent bug reports

### Tertiary (LOW confidence)
- None - all findings verified against official docs or codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `@floating-ui/dom` already used in 4 packages, `composed-offset-position` is Floating UI's official recommendation
- Architecture: HIGH - All patterns derived from existing codebase conventions (package.json exports, vite.config entries, token structure, CSS patterns)
- Pitfalls: HIGH - Pitfall 1 verified via official Floating UI docs and issue tracker; Pitfall 2 verified via MDN and Dialog codebase; Pitfalls 3-5 derived from codebase analysis
- Code examples: HIGH - All examples follow verified patterns from existing codebase files

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (stable domain, 30 days)
