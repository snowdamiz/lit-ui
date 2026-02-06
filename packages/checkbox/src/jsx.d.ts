/**
 * JSX type declarations for lui-checkbox and lui-checkbox-group custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Checkbox, CheckboxSize, CheckboxGroup } from '@lit-ui/checkbox';

interface LuiCheckboxAttributes {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string;
  label?: string;
  size?: CheckboxSize;
}

interface LuiCheckboxGroupAttributes {
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  'select-all'?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-checkbox': React.DetailedHTMLProps<
        React.HTMLAttributes<Checkbox> & LuiCheckboxAttributes,
        Checkbox
      >;
      'lui-checkbox-group': React.DetailedHTMLProps<
        React.HTMLAttributes<CheckboxGroup> & LuiCheckboxGroupAttributes,
        CheckboxGroup
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-checkbox': import('vue').DefineComponent<LuiCheckboxAttributes>;
    'lui-checkbox-group': import('vue').DefineComponent<LuiCheckboxGroupAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-checkbox': LuiCheckboxAttributes & {
      'on:ui-change'?: (e: CustomEvent<{ checked: boolean; value: string | null }>) => void;
    };
    'lui-checkbox-group': LuiCheckboxGroupAttributes & {
      'on:ui-change'?: (e: CustomEvent<{ allChecked: boolean; checkedCount: number; totalCount: number }>) => void;
    };
  }
}

export {};
