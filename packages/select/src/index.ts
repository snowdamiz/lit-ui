// @lit-ui/select - Select component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Select } from './select.js';
export type { SelectSize, SelectOption } from './select.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
// Register on both server (via @lit-labs/ssr-dom-shim) and client
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

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-select': Select;
  }
}
