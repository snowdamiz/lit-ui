/**
 * JSX type declarations for lui-dialog custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Dialog, DialogSize, CloseReason } from './dialog.js';

// Common attributes for lui-dialog
interface LuiDialogAttributes {
  open?: boolean;
  size?: DialogSize;
  dismissible?: boolean;
  'show-close-button'?: boolean;
  'dialog-class'?: string;
}

// Close event detail type
interface DialogCloseEvent extends CustomEvent {
  detail: { reason: CloseReason };
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
      onclose?: (e: DialogCloseEvent) => void;
      'on:close'?: (e: DialogCloseEvent) => void;
    };
  }
}

export {};
