/**
 * JSX type declarations for lui-calendar custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Calendar } from './calendar.js';

// Common attributes for lui-calendar
interface LuiCalendarAttributes {
  value?: string;
  locale?: string;
  'min-date'?: string;
  'max-date'?: string;
  'first-day-of-week'?: number;
}

// Event handler types
interface LuiCalendarEvents {
  onchange?: (e: CustomEvent<{ date: Date; isoString: string }>) => void;
  'onmonth-change'?: (e: CustomEvent<{ year: number; month: number }>) => void;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-calendar': React.DetailedHTMLProps<
        React.HTMLAttributes<Calendar> & LuiCalendarAttributes & LuiCalendarEvents,
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
      'on:change'?: (e: CustomEvent<{ date: Date; isoString: string }>) => void;
      'on:month-change'?: (e: CustomEvent<{ year: number; month: number }>) => void;
    };
  }
}

export {};
