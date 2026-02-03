// @lit-ui/tabs - Tabs and TabPanel components with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes
export { Tabs } from './tabs.js';
export { TabPanel } from './tab-panel.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-tabs')) {
    customElements.define('lui-tabs', Tabs);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-tabs] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }

  if (!customElements.get('lui-tab-panel')) {
    customElements.define('lui-tab-panel', TabPanel);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-tab-panel] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-tabs': Tabs;
    'lui-tab-panel': TabPanel;
  }
}
