// @lit-ui/toast - Accessible toast notification system with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export imperative API
export { toast } from './api.js';

// Export component classes
export { Toaster } from './toaster.js';
export { Toast } from './toast.js';

// Export all types
export type {
  ToastVariant,
  ToastPosition,
  ToastAction,
  ToastOptions,
  ToastData,
  Subscriber,
} from './types.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Toaster } from './toaster.js';
import { Toast } from './toast.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-toaster')) {
    customElements.define('lui-toaster', Toaster);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-toaster] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }

  if (!customElements.get('lui-toast')) {
    customElements.define('lui-toast', Toast);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-toast] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-toaster': Toaster;
    'lui-toast': Toast;
  }
}
