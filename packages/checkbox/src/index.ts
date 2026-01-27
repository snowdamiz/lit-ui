// @lit-ui/checkbox - Checkbox component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Checkbox } from './checkbox.js';
export type { CheckboxSize } from './checkbox.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Checkbox } from './checkbox.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-checkbox')) {
    customElements.define('lui-checkbox', Checkbox);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-checkbox] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-checkbox': Checkbox;
  }
}
