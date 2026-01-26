/**
 * JSX type declarations for lui-select custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Select, SelectSize } from './select.js';
import type { OptionGroup } from './option-group.js';

// Common attributes for lui-select
interface LuiSelectAttributes {
  size?: SelectSize;
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Common attributes for lui-option-group
interface LuiOptionGroupAttributes {
  label?: string;
  children?: any;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-select': React.DetailedHTMLProps<
        React.HTMLAttributes<Select> & LuiSelectAttributes,
        Select
      >;
      'lui-option-group': React.DetailedHTMLProps<
        React.HTMLAttributes<OptionGroup> & LuiOptionGroupAttributes,
        OptionGroup
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-select': import('vue').DefineComponent<LuiSelectAttributes>;
    'lui-option-group': import('vue').DefineComponent<LuiOptionGroupAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-select': LuiSelectAttributes & {
      onchange?: (e: Event) => void;
      'on:change'?: (e: CustomEvent) => void;
    };
    'lui-option-group': LuiOptionGroupAttributes;
  }
}

export {};
