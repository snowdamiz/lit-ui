/**
 * JSX type declarations for lui-tabs and lui-tab-panel custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Tabs } from './tabs.js';
import type { TabPanel } from './tab-panel.js';

// Common attributes for lui-tabs
interface LuiTabsAttributes {
  value?: string;
  'default-value'?: string;
  disabled?: boolean;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  'activation-mode'?: 'automatic' | 'manual';
}

// Common attributes for lui-tab-panel
interface LuiTabPanelAttributes {
  value?: string;
  label?: string;
  disabled?: boolean;
  active?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-tabs': React.DetailedHTMLProps<
        React.HTMLAttributes<Tabs> & LuiTabsAttributes,
        Tabs
      >;
      'lui-tab-panel': React.DetailedHTMLProps<
        React.HTMLAttributes<TabPanel> & LuiTabPanelAttributes,
        TabPanel
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-tabs': import('vue').DefineComponent<LuiTabsAttributes>;
    'lui-tab-panel': import('vue').DefineComponent<LuiTabPanelAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-tabs': LuiTabsAttributes & {
      'on:ui-change'?: (e: CustomEvent) => void;
    };
    'lui-tab-panel': LuiTabPanelAttributes & {
      'on:ui-tab-panel-update'?: (e: CustomEvent) => void;
    };
  }
}

export {};
