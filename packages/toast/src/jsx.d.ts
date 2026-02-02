/**
 * JSX type declarations for lui-toaster and lui-toast custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Toaster } from './toaster.js';
import type { Toast } from './toast.js';
import type { ToastPosition, ToastVariant } from './types.js';

// Common attributes for lui-toaster
interface LuiToasterAttributes {
  position?: ToastPosition;
  'max-visible'?: number;
  gap?: number;
}

// Common attributes for lui-toast
interface LuiToastAttributes {
  'toast-id'?: string;
  variant?: ToastVariant;
  'toast-title'?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-toaster': React.DetailedHTMLProps<
        React.HTMLAttributes<Toaster> & LuiToasterAttributes,
        Toaster
      >;
      'lui-toast': React.DetailedHTMLProps<
        React.HTMLAttributes<Toast> & LuiToastAttributes,
        Toast
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-toaster': import('vue').DefineComponent<LuiToasterAttributes>;
    'lui-toast': import('vue').DefineComponent<LuiToastAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-toaster': LuiToasterAttributes;
    'lui-toast': LuiToastAttributes;
  }
}

export {};
