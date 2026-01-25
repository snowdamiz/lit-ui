// @lit-ui/button - Button component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Button } from './button.js';
export type { ButtonVariant, ButtonSize, ButtonType } from './button.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
// Register on both server (via @lit-labs/ssr-dom-shim) and client
import { Button } from './button.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-button')) {
    customElements.define('lui-button', Button);
  } else if (!isServer && import.meta.env?.DEV) {
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
