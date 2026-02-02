/**
 * JSX type declarations for lui-tooltip custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Tooltip } from './tooltip.js';
import type { Placement } from '@lit-ui/core/floating';

// Common attributes for lui-tooltip
interface LuiTooltipAttributes {
  content?: string;
  placement?: Placement;
  'show-delay'?: number;
  'hide-delay'?: number;
  arrow?: boolean;
  offset?: number;
  rich?: boolean;
  'tooltip-title'?: string;
  disabled?: boolean;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-tooltip': React.DetailedHTMLProps<
        React.HTMLAttributes<Tooltip> & LuiTooltipAttributes,
        Tooltip
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-tooltip': import('vue').DefineComponent<LuiTooltipAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-tooltip': LuiTooltipAttributes;
  }
}

export {};
