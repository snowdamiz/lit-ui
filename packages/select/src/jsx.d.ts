/**
 * JSX type declarations for lui-select custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Select, SelectSize } from './select.js';

// Common attributes for lui-select
interface LuiSelectAttributes {
  size?: SelectSize;
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-select': React.DetailedHTMLProps<
        React.HTMLAttributes<Select> & LuiSelectAttributes,
        Select
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-select': import('vue').DefineComponent<LuiSelectAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-select': LuiSelectAttributes & {
      onchange?: (e: Event) => void;
      'on:change'?: (e: CustomEvent) => void;
    };
  }
}

export {};
