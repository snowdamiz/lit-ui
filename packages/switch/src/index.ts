// @lit-ui/switch - Switch/toggle component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Switch } from './switch.js';
export type { SwitchSize } from './switch.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Switch } from './switch.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-switch')) {
    customElements.define('lui-switch', Switch);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-switch] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-switch': Switch;
  }
}
