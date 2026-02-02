/**
 * JSX type declarations for lui-popover custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Popover } from './popover.js';
import type { Placement } from '@lit-ui/core/floating';

// Common attributes for lui-popover
interface LuiPopoverAttributes {
  placement?: Placement;
  open?: boolean;
  arrow?: boolean;
  modal?: boolean;
  offset?: number;
  'match-trigger-width'?: boolean;
  disabled?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-popover': React.DetailedHTMLProps<
        React.HTMLAttributes<Popover> & LuiPopoverAttributes & {
          onOpenChanged?: (e: CustomEvent<{ open: boolean }>) => void;
        },
        Popover
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-popover': import('vue').DefineComponent<LuiPopoverAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-popover': LuiPopoverAttributes;
  }
}

export {};
