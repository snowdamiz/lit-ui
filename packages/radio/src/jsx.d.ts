/**
 * JSX type declarations for lui-radio custom element.
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

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-radio': React.DetailedHTMLProps<
        React.HTMLAttributes<Radio> & LuiRadioAttributes,
        Radio
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-radio': import('vue').DefineComponent<LuiRadioAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-radio': LuiRadioAttributes & {
      'on:ui-radio-change'?: (e: CustomEvent) => void;
    };
  }
}

export {};
