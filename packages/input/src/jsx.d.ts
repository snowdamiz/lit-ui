/**
 * JSX type declarations for lui-input custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Input, InputType, InputSize } from '@lit-ui/input';

interface LuiInputAttributes {
  type?: InputType;
  size?: InputSize;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  minlength?: number;
  maxlength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  label?: string;
  'helper-text'?: string;
  'required-indicator'?: 'asterisk' | 'text';
  clearable?: boolean;
  'show-count'?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-input': React.DetailedHTMLProps<
        React.HTMLAttributes<Input> & LuiInputAttributes,
        Input
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-input': import('vue').DefineComponent<LuiInputAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-input': LuiInputAttributes & {
      'on:input'?: (e: Event) => void;
      'on:change'?: (e: Event) => void;
    };
  }
}

export {};
