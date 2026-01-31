/**
 * JSX type declarations for lui-calendar and lui-calendar-multi custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Calendar } from './calendar.js';
import type { CalendarMulti } from './calendar-multi.js';
import type { DayCellState } from './calendar.js';

// Common attributes for lui-calendar
interface LuiCalendarAttributes {
  locale?: string;
  value?: string;
  'min-date'?: string;
  'max-date'?: string;
  'disabled-dates'?: string[];
  'disable-weekends'?: boolean;
  'show-week-numbers'?: boolean;
  'display-month'?: string;
  'hide-navigation'?: boolean;
  size?: string;
  renderDay?: (state: DayCellState) => unknown;
  'onui-date-select'?: (e: CustomEvent) => void;
  'onui-month-change'?: (e: CustomEvent) => void;
  'onui-week-select'?: (e: CustomEvent) => void;
}

// Common attributes for lui-calendar-multi
interface LuiCalendarMultiAttributes {
  months?: number;
  locale?: string;
  value?: string;
  'min-date'?: string;
  'max-date'?: string;
  'disabled-dates'?: string[];
  'disable-weekends'?: boolean;
  'show-week-numbers'?: boolean;
  size?: string;
  'onui-date-select'?: (e: CustomEvent) => void;
  'onui-month-change'?: (e: CustomEvent) => void;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-calendar': React.DetailedHTMLProps<
        React.HTMLAttributes<Calendar> & LuiCalendarAttributes,
        Calendar
      >;
      'lui-calendar-multi': React.DetailedHTMLProps<
        React.HTMLAttributes<CalendarMulti> & LuiCalendarMultiAttributes,
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
      onclick?: (e: MouseEvent) => void;
      'on:click'?: (e: CustomEvent<MouseEvent>) => void;
    };
    'lui-calendar-multi': LuiCalendarMultiAttributes & {
      onclick?: (e: MouseEvent) => void;
      'on:click'?: (e: CustomEvent<MouseEvent>) => void;
    };
  }
}

export {};
