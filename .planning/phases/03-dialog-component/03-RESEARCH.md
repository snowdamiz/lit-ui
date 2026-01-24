# Phase 3: Dialog Component - Research

**Researched:** 2026-01-24
**Domain:** Lit Web Components + Native Dialog Element + Focus Management + Accessibility + CSS Animations
**Confidence:** HIGH (based on MDN, W3C APG, Lit docs, and established focus-trap patterns)

## Summary

This phase builds an accessible modal dialog component using the native HTML `<dialog>` element wrapped in a Lit web component. The native `<dialog>` element provides significant accessibility benefits out-of-the-box: automatic focus management with `showModal()`, built-in Escape key handling via the `cancel` event, implicit `aria-modal="true"`, and rendering in the browser's top layer (solving z-index stacking issues).

The research confirms that using native `<dialog>` with `showModal()` is the modern standard approach, providing focus trapping, backdrop, and accessibility features that would require hundreds of lines of custom code to replicate with `<div role="dialog">`. For animations, CSS `@keyframes` with `transition-behavior: allow-discrete` enables smooth enter/exit transitions, with `@starting-style` available for modern browsers. The `prefers-reduced-motion` media query should disable animations, defaulting to instant show/hide.

**Primary recommendation:** Wrap native `<dialog>` element in Shadow DOM. Use `showModal()` for opening (automatic focus trap, backdrop, Escape handling). Listen to `cancel` event to handle Escape key (allowing prevention for non-dismissible mode). Emit a single `close` event with `reason` detail. Use CSS `@keyframes` for animations with `transition-behavior: allow-discrete` for exit animations. Lock body scroll via CSS `:has(dialog[open])` pattern.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | 3.x | Component base, decorators, rendering | Already in project, provides TailwindElement base |
| Native `<dialog>` | HTML5 | Modal dialog element | Built-in focus trap, Escape handling, top-layer, a11y |
| `showModal()` | Native API | Open as modal dialog | Auto focus management, backdrop, aria-modal=true |
| `cancel` event | Native API | Escape key interception | Cancelable event for non-dismissible dialogs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@a11y/focus-trap` | 1.x | Web component focus trap | Only if native dialog focus trap proves insufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<dialog>` | `<div role="dialog">` | div requires manual focus trap, backdrop, escape handling, 400+ LOC |
| `@a11y/focus-trap` | `focus-trap` library | focus-trap is framework-agnostic but needs wrapper; @a11y is web component ready |
| CSS `:has()` scroll lock | JS scroll lock | `:has()` is declarative, no JS state management; JS more compatible |

**Installation:**
No additional packages required - native `<dialog>` and Lit provide everything needed. The `@a11y/focus-trap` package is optional backup if edge cases arise.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── dialog/
│       ├── dialog.ts           # Main dialog component
│       └── dialog.test.ts      # Component tests (future)
├── base/
│   └── tailwind-element.ts     # Already exists from Phase 1
└── styles/
    └── tailwind.css            # Already includes design tokens
```

### Pattern 1: Native Dialog in Shadow DOM
**What:** Render `<dialog>` element inside Shadow DOM for encapsulation
**When to use:** All modal dialog implementations
**Example:**
```typescript
// Source: MDN dialog element + Lit patterns
import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { TailwindElement } from '../../base/tailwind-element';

@customElement('ui-dialog')
export class Dialog extends TailwindElement {
  @property({ type: Boolean, reflect: true }) open = false;

  @query('dialog') private dialogEl!: HTMLDialogElement;

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this.dialogEl.showModal();
      } else {
        this.dialogEl.close();
      }
    }
  }

  render() {
    return html`
      <dialog
        @cancel=${this.handleCancel}
        @close=${this.handleClose}
      >
        <slot name="title"></slot>
        <slot></slot>
        <slot name="footer"></slot>
      </dialog>
    `;
  }
}
```

### Pattern 2: Cancel Event for Non-Dismissible Mode
**What:** Intercept Escape key via `cancel` event to prevent closing
**When to use:** Dialogs with `dismissible="false"` prop
**Example:**
```typescript
// Source: MDN HTMLDialogElement cancel event
@property({ type: Boolean }) dismissible = true;

private handleCancel(e: Event) {
  if (!this.dismissible) {
    e.preventDefault();
    return;
  }
  this.emitClose('escape');
}
```

### Pattern 3: Click-Outside Detection for Backdrop
**What:** Detect clicks on the `::backdrop` pseudo-element
**When to use:** When `close-on-backdrop-click` behavior is enabled
**Example:**
```typescript
// Source: Web.dev dialog component article
private handleDialogClick(e: MouseEvent) {
  // The dialog element itself is the backdrop area
  // Clicking the actual content won't have dialog as target
  if (e.target === this.dialogEl) {
    if (this.dismissible) {
      this.close('backdrop');
    }
  }
}

render() {
  return html`
    <dialog @click=${this.handleDialogClick}>
      <div class="dialog-content" @click=${(e: Event) => e.stopPropagation()}>
        <!-- content -->
      </div>
    </dialog>
  `;
}
```

### Pattern 4: Enter/Exit Animations with @keyframes
**What:** Smooth scale+fade animations for dialog and backdrop
**When to use:** All dialogs (with reduced-motion fallback)
**Example:**
```css
/* Source: Frontend Masters Blog - Animating Dialog */
dialog {
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out,
    display 150ms allow-discrete,
    overlay 150ms allow-discrete;
}

dialog[open] {
  opacity: 1;
  transform: scale(1);
}

/* Entry animation starting point */
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Fallback for browsers without @starting-style */
@keyframes dialog-open {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dialog-close {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Reduced motion: instant transition */
@media (prefers-reduced-motion: reduce) {
  dialog {
    transition: none;
    animation: none;
  }
}
```

### Pattern 5: Body Scroll Lock with CSS :has()
**What:** Prevent background scrolling when dialog is open
**When to use:** All modal dialogs
**Example:**
```css
/* Source: CSS-Tricks, berbaquero.com */
/* Add to global styles or host-defaults.css */
body:has(ui-dialog[open]) {
  overflow: hidden;
}

/* Prevent scrollbar layout shift */
html {
  scrollbar-gutter: stable;
}
```

### Pattern 6: Close Event with Reason
**What:** Emit single close event with reason (escape, backdrop, programmatic)
**When to use:** All dialog close actions
**Example:**
```typescript
// Source: Lit events documentation
type CloseReason = 'escape' | 'backdrop' | 'programmatic';

private emitClose(reason: CloseReason) {
  this.open = false;
  this.dispatchEvent(new CustomEvent('close', {
    detail: { reason },
    bubbles: true,
    composed: true
  }));
}

close(reason: CloseReason = 'programmatic') {
  this.emitClose(reason);
}
```

### Pattern 7: Return Focus to Trigger Element
**What:** Track and restore focus to the element that opened the dialog
**When to use:** All dialogs on close
**Example:**
```typescript
// Source: W3C APG Dialog Pattern
private triggerElement: HTMLElement | null = null;

show() {
  this.triggerElement = document.activeElement as HTMLElement;
  this.open = true;
}

private handleClose() {
  if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
    this.triggerElement.focus();
  }
  this.triggerElement = null;
}
```

### Anti-Patterns to Avoid
- **Using `<div role="dialog">`:** Don't rebuild what native `<dialog>` provides for free
- **Manual focus trap implementation:** Use native `showModal()` which handles this automatically
- **Setting `tabindex` on `<dialog>`:** The dialog element is not interactive and should not receive focus directly
- **Forgetting `composed: true` on events:** Custom events won't escape Shadow DOM without this
- **Animating with JS timers:** Use CSS transitions/animations for GPU acceleration and reduced-motion support
- **Inline backdrop click handler without stopPropagation:** Content clicks will close the dialog

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trapping | Manual focus trap with tab key listeners | Native `<dialog>` with `showModal()` | Automatic, handles edge cases, Shadow DOM aware |
| Escape key closing | Keydown event listener | Native `cancel` event on dialog | Cancelable, proper event flow |
| Modal backdrop | Fixed positioned div | Native `::backdrop` pseudo-element | Browser-managed, part of top layer |
| Z-index stacking | Manual z-index management | Native dialog top layer | Always on top, no stacking context issues |
| Initial focus | Manual `focus()` call | `autofocus` attribute on element | Declarative, handled by browser |
| Body scroll lock | JS overflow manipulation | CSS `:has(dialog[open])` | Declarative, no JS state |
| Exit animations | JS class toggling with timeouts | `transition-behavior: allow-discrete` | Pure CSS, respects reduced-motion |

**Key insight:** The native `<dialog>` element with `showModal()` provides focus trapping, backdrop, Escape handling, top-layer rendering, and `aria-modal="true"` automatically. A `<div role="dialog">` implementation requires 400+ lines of JavaScript to replicate these features. Don't fight the platform.

## Common Pitfalls

### Pitfall 1: Forgetting `composed: true` on Close Event
**What goes wrong:** Parent components can't listen to the close event
**Why it happens:** Custom events don't cross Shadow DOM boundaries by default
**How to avoid:** Always set `bubbles: true, composed: true` on close events
**Warning signs:** Event listeners on `<ui-dialog>` don't fire

### Pitfall 2: Animation Not Playing on Close
**What goes wrong:** Dialog disappears instantly without exit animation
**Why it happens:** `display: none` applied immediately when dialog closes
**How to avoid:** Use `transition-behavior: allow-discrete` on `display` and `overlay` properties
**Warning signs:** Enter animation works but exit doesn't

### Pitfall 3: Focus Not Returning to Trigger
**What goes wrong:** Focus goes to body or random element after dialog closes
**Why it happens:** Trigger element reference not captured before opening
**How to avoid:** Store `document.activeElement` before calling `showModal()`
**Warning signs:** After closing dialog, keyboard users must re-navigate to continue

### Pitfall 4: Backdrop Click Closing When Content Clicked
**What goes wrong:** Clicking inside dialog content closes the dialog
**Why it happens:** Click event bubbles from content to dialog element
**How to avoid:** Wrap content in inner container with `stopPropagation()`, or check `e.target === dialog`
**Warning signs:** Dialog closes when clicking buttons or form fields inside it

### Pitfall 5: Non-Dismissible Dialog Still Closes on Escape
**What goes wrong:** Escape key closes dialog even when `dismissible="false"`
**Why it happens:** Not calling `preventDefault()` on `cancel` event
**How to avoid:** Listen for `cancel` event and prevent default when non-dismissible
**Warning signs:** Critical confirmation dialogs can be accidentally dismissed

### Pitfall 6: Nested Dialogs Closing Parent
**What goes wrong:** Closing nested dialog also closes parent dialog
**Why it happens:** Close event bubbles to parent dialog component
**How to avoid:** Stop propagation on close event or track which dialog is active
**Warning signs:** Opening dialog-from-dialog closes both when inner is closed

### Pitfall 7: Animation Jank from Layout Shift
**What goes wrong:** Dialog animation stutters or jumps
**Why it happens:** Animating properties that trigger layout (width, height, top, left)
**How to avoid:** Only animate `transform` and `opacity` for GPU-accelerated smooth animation
**Warning signs:** Animation appears choppy, especially on mobile devices

### Pitfall 8: Body Scroll Still Active on iOS Safari
**What goes wrong:** Background content scrolls on touch devices
**Why it happens:** iOS Safari has quirks with `overflow: hidden` on body
**How to avoid:** May need `position: fixed` on body as fallback, or `touch-action: none`
**Warning signs:** Modal looks correct but background scrolls on iOS

## Code Examples

Verified patterns from official sources:

### Complete Dialog Component Structure
```typescript
// Source: MDN dialog element + W3C APG + Lit patterns
import { html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { TailwindElement } from '../../base/tailwind-element';

export type DialogSize = 'sm' | 'md' | 'lg';
export type CloseReason = 'escape' | 'backdrop' | 'programmatic';

@customElement('ui-dialog')
export class Dialog extends TailwindElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) size: DialogSize = 'md';
  @property({ type: Boolean, attribute: 'show-close-button' }) showCloseButton = false;
  @property({ type: Boolean }) dismissible = true;

  @query('dialog') private dialogEl!: HTMLDialogElement;

  private triggerElement: HTMLElement | null = null;

  static override styles = css`
    :host {
      display: contents;
    }

    dialog {
      /* Animation styles */
      opacity: 0;
      transform: scale(0.95);
      transition:
        opacity 150ms ease-out,
        transform 150ms ease-out,
        display 150ms allow-discrete,
        overlay 150ms allow-discrete;
    }

    dialog[open] {
      opacity: 1;
      transform: scale(1);
    }

    @starting-style {
      dialog[open] {
        opacity: 0;
        transform: scale(0.95);
      }
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 150ms ease-out, display 150ms allow-discrete, overlay 150ms allow-discrete;
    }

    dialog[open]::backdrop {
      opacity: 1;
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog,
      dialog::backdrop {
        transition: none;
      }
    }
  `;

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open && !this.dialogEl.open) {
        this.dialogEl.showModal();
      } else if (!this.open && this.dialogEl.open) {
        this.dialogEl.close();
      }
    }
  }

  show() {
    this.triggerElement = document.activeElement as HTMLElement;
    this.open = true;
  }

  close(reason: CloseReason = 'programmatic') {
    this.emitClose(reason);
  }

  private emitClose(reason: CloseReason) {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', {
      detail: { reason },
      bubbles: true,
      composed: true
    }));
  }

  private handleCancel(e: Event) {
    if (!this.dismissible) {
      e.preventDefault();
      return;
    }
    this.emitClose('escape');
  }

  private handleNativeClose() {
    // Return focus to trigger element
    if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
      this.triggerElement.focus();
    }
    this.triggerElement = null;
  }

  private handleDialogClick(e: MouseEvent) {
    // Only close if clicking the dialog backdrop area, not content
    if (e.target === this.dialogEl && this.dismissible) {
      this.emitClose('backdrop');
    }
  }

  override render() {
    return html`
      <dialog
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
        @click=${this.handleDialogClick}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div class="dialog-content ${this.getSizeClasses()}" @click=${(e: Event) => e.stopPropagation()}>
          ${this.showCloseButton ? this.renderCloseButton() : nothing}
          <header id="dialog-title">
            <slot name="title"></slot>
          </header>
          <div id="dialog-description">
            <slot></slot>
          </div>
          <footer>
            <slot name="footer"></slot>
          </footer>
        </div>
      </dialog>
    `;
  }

  private getSizeClasses(): string {
    const sizes: Record<DialogSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    };
    return sizes[this.size];
  }

  private renderCloseButton() {
    return html`
      <button
        class="close-button"
        @click=${() => this.close('programmatic')}
        aria-label="Close dialog"
      >
        &times;
      </button>
    `;
  }
}
```

### Nested Dialog Support
```typescript
// Source: W3C APG nested dialogs, Radix patterns
// Nested dialogs work automatically with native <dialog>
// Each showModal() pushes to the top layer stack
// Key: Don't let close events bubble to parent dialogs

private handleCloseEvent(e: CustomEvent) {
  // Prevent parent dialog from receiving this close
  e.stopPropagation();
}

// In nested scenario:
// <ui-dialog id="parent">
//   <ui-dialog id="child" @close=${this.handleChildClose}></ui-dialog>
// </ui-dialog>
```

### Body Scroll Lock CSS
```css
/* Source: CSS-Tricks, Frontend Masters Blog */
/* Add to global stylesheet or document styles */
body:has(dialog[open]) {
  overflow: hidden;
}

/* Prevent layout shift when scrollbar disappears */
html {
  scrollbar-gutter: stable;
}

/* iOS Safari fallback (may need JS detection) */
body.dialog-open {
  position: fixed;
  width: 100%;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<div role="dialog">` with manual focus trap | Native `<dialog>` with `showModal()` | 2022 (Safari 15.4) | 90% less code, better a11y |
| JS-based Escape key listener | Native `cancel` event | 2022 (Baseline) | Cancelable, proper event flow |
| Manual z-index management | Top layer (automatic) | 2022 (Baseline) | No stacking context issues |
| `aria-hidden` on background | `inert` attribute / `aria-modal` implicit | 2023+ | Cleaner, automatic with showModal |
| JS class toggle for animations | `@starting-style` + `transition-behavior` | 2024 (Baseline) | Pure CSS, reduced-motion aware |
| JS scroll lock | CSS `:has(dialog[open])` | 2023 (Baseline) | Declarative, no state management |

**Deprecated/outdated:**
- **`<div role="dialog">`:** Use native `<dialog>` unless supporting very old browsers
- **Manual focus trap libraries for modal dialogs:** Native `showModal()` handles this automatically
- **`aria-hidden` on siblings:** `showModal()` makes content inert automatically
- **z-index: 9999 patterns:** Top layer eliminates stacking context issues entirely

## Open Questions

Things that couldn't be fully resolved:

1. **iOS Safari Scroll Lock Edge Cases**
   - What we know: CSS `:has()` and `overflow: hidden` work in most cases
   - What's unclear: Some iOS Safari versions may still allow background scroll on touch
   - Recommendation: Test on real iOS devices; may need JS fallback with `position: fixed`

2. **@starting-style Browser Support Timing**
   - What we know: Baseline newly available (Firefox 129+), good Chromium/WebKit support
   - What's unclear: Exact percentage of users without support
   - Recommendation: Use `@keyframes` fallback for broader support; @starting-style is progressive enhancement

3. **Nested Dialog Focus Restoration**
   - What we know: Each dialog tracks its own trigger element
   - What's unclear: Edge cases when parent dialog's trigger is inside another component
   - Recommendation: Test nested scenarios thoroughly; may need `composedPath()` for proper target

## Sources

### Primary (HIGH confidence)
- [MDN: `<dialog>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) - Native dialog API, methods, events
- [MDN: HTMLDialogElement cancel event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/cancel_event) - Escape key handling
- [W3C WAI-ARIA APG: Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) - Accessibility requirements
- [MDN: @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) - Entry animation CSS
- [Lit Events Documentation](https://lit.dev/docs/components/events/) - Custom event dispatching

### Secondary (MEDIUM confidence)
- [Frontend Masters: Animating Dialog](https://frontendmasters.com/blog/animating-dialog/) - Animation patterns with @starting-style
- [CSS-Tricks: Prevent Page Scrolling When Modal is Open](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/) - Scroll lock strategies
- [Nolan Lawson: Managing Focus in Shadow DOM](https://nolanlawson.com/2021/02/13/managing-focus-in-the-shadow-dom/) - Shadow DOM focus patterns
- [web.dev: Building a Dialog Component](https://web.dev/articles/building/a-dialog-component) - Modern dialog implementation

### Tertiary (LOW confidence)
- [@a11y/focus-trap GitHub](https://github.com/andreasbm/focus-trap) - Web component focus trap (backup option)
- [focus-trap/tabbable GitHub](https://github.com/focus-trap/tabbable) - Shadow DOM tabbable traversal

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native `<dialog>` is the clear standard, well-documented
- Architecture patterns: HIGH - W3C APG and MDN provide authoritative guidance
- Animation approach: MEDIUM - `@starting-style` is newer but `@keyframes` fallback is solid
- Accessibility: HIGH - Native dialog handles most requirements automatically
- Pitfalls: MEDIUM - Some iOS Safari edge cases need real-device testing

**Research date:** 2026-01-24
**Valid until:** ~90 days (Native dialog API is stable, animation CSS is Baseline)
