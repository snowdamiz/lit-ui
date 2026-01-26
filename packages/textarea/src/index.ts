// @lit-ui/textarea - Textarea component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Textarea } from './textarea.js';
export type { TextareaSize, TextareaResize } from './textarea.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
// Register on both server (via @lit-labs/ssr-dom-shim) and client
import { Textarea } from './textarea.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-textarea')) {
    customElements.define('lui-textarea', Textarea);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-textarea] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-textarea': Textarea;
  }
}
