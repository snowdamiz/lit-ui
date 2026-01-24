/**
 * Demo Card Component
 *
 * A demonstration component that validates the foundation:
 * - TailwindElement base class works
 * - Tailwind utility classes render correctly in Shadow DOM
 * - Design tokens (CSS custom properties) work
 * - Dark mode theming works
 *
 * This component uses a wide range of Tailwind utilities to prove
 * the integration works:
 * - Layout: p-6, flex, gap-2, mb-2, mb-4, mt-4
 * - Colors: bg-card, text-card-foreground, bg-primary, bg-secondary, etc.
 * - Borders: rounded-lg, rounded-md, border, border-border
 * - Typography: text-xl, font-semibold, font-medium, text-sm, font-mono
 * - Shadows: shadow-lg, shadow-sm
 * - Transitions: transition-shadow, transition-opacity, transition-colors
 * - Interactivity: hover states
 */

import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TailwindElement } from '../../base/tailwind-element';

@customElement('demo-card')
export class DemoCard extends TailwindElement {
  @property({ type: String }) title = 'Demo Card';
  @property({ type: Boolean }) elevated = false;

  // Component-specific styles (Tailwind styles are injected via connectedCallback)
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <div
        class="
        p-6 rounded-lg border
        bg-card text-card-foreground
        ${this.elevated ? 'shadow-lg' : 'shadow-sm'}
        transition-shadow duration-200
      "
      >
        <h2 class="text-xl font-semibold text-foreground mb-2">${this.title}</h2>
        <p class="text-muted-foreground mb-4">
          This card demonstrates Tailwind utilities working inside Shadow DOM.
        </p>
        <div class="flex gap-2">
          <button
            class="
            px-4 py-2 rounded-md font-medium
            bg-primary text-primary-foreground
            hover:opacity-90 transition-opacity
          "
          >
            Primary
          </button>
          <button
            class="
            px-4 py-2 rounded-md font-medium
            bg-secondary text-secondary-foreground
            border border-border
            hover:bg-accent transition-colors
          "
          >
            Secondary
          </button>
          <button
            class="
            px-4 py-2 rounded-md font-medium
            bg-destructive text-destructive-foreground
            hover:opacity-90 transition-opacity
          "
          >
            Destructive
          </button>
        </div>
        <div class="mt-4 p-3 rounded bg-muted">
          <code class="text-sm font-mono text-muted-foreground">
            Tokens: --color-primary, --color-background, etc.
          </code>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'demo-card': DemoCard;
  }
}
