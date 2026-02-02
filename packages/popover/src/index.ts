// @lit-ui/popover - Accessible popover component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Popover } from './popover.js';
export type { Placement } from './popover.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Popover } from './popover.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-popover')) {
    customElements.define('lui-popover', Popover);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-popover] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-popover': Popover;
  }
}
