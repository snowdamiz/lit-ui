// @lit-ui/checkbox - Checkbox and CheckboxGroup components with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes and types
export { Checkbox } from './checkbox.js';
export { CheckboxGroup } from './checkbox-group.js';
export type { CheckboxSize } from './checkbox.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Checkbox } from './checkbox.js';
import { CheckboxGroup } from './checkbox-group.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-checkbox')) {
    customElements.define('lui-checkbox', Checkbox);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-checkbox] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }

  if (!customElements.get('lui-checkbox-group')) {
    customElements.define('lui-checkbox-group', CheckboxGroup);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-checkbox-group] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-checkbox': Checkbox;
    'lui-checkbox-group': CheckboxGroup;
  }
}
