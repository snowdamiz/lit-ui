/**
 * JSX type declarations for lui-select, lui-option, and lui-option-group custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Select, SelectSize, Option, OptionGroup } from '@lit-ui/select';

interface LuiSelectAttributes {
  size?: SelectSize;
  placeholder?: string;
  name?: string;
  value?: string | string[];
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  creatable?: boolean;
  'no-results-message'?: string;
  label?: string;
}

interface LuiOptionAttributes {
  value?: string;
  label?: string;
  disabled?: boolean;
}

interface LuiOptionGroupAttributes {
  label?: string;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-select': React.DetailedHTMLProps<
        React.HTMLAttributes<Select> & LuiSelectAttributes,
        Select
      >;
      'lui-option': React.DetailedHTMLProps<
        React.HTMLAttributes<Option> & LuiOptionAttributes,
        Option
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
    'lui-option': import('vue').DefineComponent<LuiOptionAttributes>;
    'lui-option-group': import('vue').DefineComponent<LuiOptionGroupAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-select': LuiSelectAttributes & {
      'on:ui-change'?: (e: CustomEvent) => void;
    };
    'lui-option': LuiOptionAttributes;
    'lui-option-group': LuiOptionGroupAttributes;
  }
}

export {};
