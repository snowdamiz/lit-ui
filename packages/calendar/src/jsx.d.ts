/**
 * JSX type declarations for lui-calendar custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Calendar } from './calendar.js';

// Common attributes for lui-calendar
interface LuiCalendarAttributes {
  locale?: string;
  value?: string;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-calendar': React.DetailedHTMLProps<
        React.HTMLAttributes<Calendar> & LuiCalendarAttributes,
        Calendar
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-calendar': import('vue').DefineComponent<LuiCalendarAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-calendar': LuiCalendarAttributes & {
      onclick?: (e: MouseEvent) => void;
      'on:click'?: (e: CustomEvent<MouseEvent>) => void;
    };
  }
}

export {};
