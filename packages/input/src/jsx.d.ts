/**
 * JSX type declarations for lui-input custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Input, InputType, InputSize } from './input.js';

// Common attributes for lui-input (Plan 01 props only)
interface LuiInputAttributes {
  type?: InputType;
  size?: InputSize;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
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
