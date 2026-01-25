// @lit-ui/dialog - Dialog component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Dialog } from './dialog.js';
export type { DialogSize, CloseReason } from './dialog.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
// Register on both server (via @lit-labs/ssr-dom-shim) and client
import { Dialog } from './dialog.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-dialog')) {
    customElements.define('lui-dialog', Dialog);
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-dialog': Dialog;
  }
}
