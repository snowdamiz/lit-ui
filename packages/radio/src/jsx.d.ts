/**
 * JSX type declarations for lui-radio and lui-radio-group custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Radio, RadioSize } from './radio.js';

// Common attributes for lui-radio
interface LuiRadioAttributes {
  checked?: boolean;
  disabled?: boolean;
  value?: string;
  label?: string;
  size?: RadioSize;
}

// Common attributes for lui-radio-group
interface LuiRadioGroupAttributes {
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-radio': React.DetailedHTMLProps<
        React.HTMLAttributes<Radio> & LuiRadioAttributes,
        Radio
      >;
      'lui-radio-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & LuiRadioGroupAttributes,
        HTMLElement
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-radio': import('vue').DefineComponent<LuiRadioAttributes>;
    'lui-radio-group': import('vue').DefineComponent<LuiRadioGroupAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-radio': LuiRadioAttributes & {
      'on:ui-radio-change'?: (e: CustomEvent) => void;
    };
    'lui-radio-group': LuiRadioGroupAttributes & {
      'on:ui-change'?: (e: CustomEvent) => void;
    };
  }
}

export {};
