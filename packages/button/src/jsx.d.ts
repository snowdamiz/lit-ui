/**
 * JSX type declarations for lui-button custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Button, ButtonVariant, ButtonSize, ButtonType } from '@lit-ui/button';

// Common attributes for lui-button
interface LuiButtonAttributes {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  'btn-class'?: string;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<Button> & LuiButtonAttributes,
        Button
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-button': import('vue').DefineComponent<LuiButtonAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-button': LuiButtonAttributes & {
      onclick?: (e: MouseEvent) => void;
      'on:click'?: (e: CustomEvent<MouseEvent>) => void;
    };
  }
}

export {};
