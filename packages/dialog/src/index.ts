// @lit-ui/dialog - Dialog component with SSR support
import { isServer } from 'lit';

// Export component class and types
export { Dialog } from './dialog.js';
export type { DialogSize, CloseReason } from './dialog.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Dialog } from './dialog.js';

if (!isServer && typeof customElements !== 'undefined') {
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
