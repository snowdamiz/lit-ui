// @lit-ui/radio - Radio and RadioGroup components with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes and types
export { Radio } from './radio.js';
export type { RadioSize } from './radio.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Radio } from './radio.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-radio')) {
    customElements.define('lui-radio', Radio);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-radio] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-radio': Radio;
  }
}
