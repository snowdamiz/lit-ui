/**
 * JSX type declarations for lui-calendar custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Calendar } from './calendar.js';
import type { CalendarMulti } from './calendar-multi.js';

// Common attributes for lui-calendar
interface LuiCalendarAttributes {
  value?: string;
  locale?: string;
  'min-date'?: string;
  'max-date'?: string;
  'first-day-of-week'?: number;
  'display-month'?: string;
  'hide-navigation'?: boolean;
  'show-week-numbers'?: boolean;
}

// Common attributes for lui-calendar-multi
interface LuiCalendarMultiAttributes {
  months?: number;
  value?: string;
  locale?: string;
  'min-date'?: string;
  'max-date'?: string;
  'first-day-of-week'?: string;
  'show-week-numbers'?: boolean;
}

// Event handler types
interface LuiCalendarEvents {
  onchange?: (e: CustomEvent<{ date: Date; isoString: string }>) => void;
  'onmonth-change'?: (e: CustomEvent<{ year: number; month: number }>) => void;
}

interface LuiCalendarMultiEvents extends LuiCalendarEvents {
  'onweek-select'?: (e: CustomEvent) => void;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-calendar': React.DetailedHTMLProps<
        React.HTMLAttributes<Calendar> & LuiCalendarAttributes & LuiCalendarEvents,
        Calendar
      >;
      'lui-calendar-multi': React.DetailedHTMLProps<
        React.HTMLAttributes<CalendarMulti> & LuiCalendarMultiAttributes & LuiCalendarMultiEvents,
        CalendarMulti
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-calendar': import('vue').DefineComponent<LuiCalendarAttributes>;
    'lui-calendar-multi': import('vue').DefineComponent<LuiCalendarMultiAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-calendar': LuiCalendarAttributes & {
      'on:change'?: (e: CustomEvent<{ date: Date; isoString: string }>) => void;
      'on:month-change'?: (e: CustomEvent<{ year: number; month: number }>) => void;
    };
    'lui-calendar-multi': LuiCalendarMultiAttributes & {
      'on:change'?: (e: CustomEvent<{ date: Date; isoString: string }>) => void;
      'on:month-change'?: (e: CustomEvent<{ year: number; month: number }>) => void;
      'on:week-select'?: (e: CustomEvent) => void;
    };
  }
}

export {};
