/**
 * JSX type declarations for lui-input custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Input, InputType, InputSize } from './input.js';

// Common attributes for lui-input
interface LuiInputAttributes {
  type?: InputType;
  size?: InputSize;
  name?: string;
  value?: string;
  placeholder?: string;
  label?: string;
  'helper-text'?: string;
  'required-indicator'?: 'asterisk' | 'text';
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  minlength?: number;
  maxlength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-input': React.DetailedHTMLProps<
        React.InputHTMLAttributes<Input> & LuiInputAttributes,
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
      oninput?: (e: InputEvent) => void;
      'on:input'?: (e: CustomEvent<InputEvent>) => void;
    };
  }
}

export {};
