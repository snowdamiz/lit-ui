/**
 * JSX type declarations for lui-dialog custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Dialog, DialogSize, CloseReason } from '@lit-ui/dialog';

interface LuiDialogAttributes {
  open?: boolean;
  size?: DialogSize;
  dismissible?: boolean;
  'show-close-button'?: boolean;
  'dialog-class'?: string;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-dialog': React.DetailedHTMLProps<
        React.HTMLAttributes<Dialog> & LuiDialogAttributes,
        Dialog
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-dialog': import('vue').DefineComponent<LuiDialogAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-dialog': LuiDialogAttributes & {
      'on:close'?: (e: CustomEvent<{ reason: CloseReason }>) => void;
    };
  }
}

export {};
