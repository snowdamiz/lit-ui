/**
 * JSX type declarations for lui-switch custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Switch, SwitchSize } from '@lit-ui/switch';

interface LuiSwitchAttributes {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  label?: string;
  size?: SwitchSize;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-switch': React.DetailedHTMLProps<
        React.HTMLAttributes<Switch> & LuiSwitchAttributes,
        Switch
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-switch': import('vue').DefineComponent<LuiSwitchAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-switch': LuiSwitchAttributes & {
      'on:ui-change'?: (e: CustomEvent<{ checked: boolean; value: string | null }>) => void;
    };
  }
}

export {};
