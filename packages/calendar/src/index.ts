// @lit-ui/calendar - Calendar component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes and types
export { Calendar } from './calendar.js';
export { CalendarMulti } from './calendar-multi.js';
export type { CalendarView, DayCellState } from './calendar.js';

// Export utility functions for public API
export {
  getMonthDays,
  formatDate,
  parseDate,
  isSameDayCompare,
  isDateToday,
  getISOWeekNumber,
  getWeekRange,
  getMonthWeeks,
} from './date-utils.js';
export type { WeekInfo } from './date-utils.js';
export { getWeekdayNames, getMonthName, getMonthYearLabel } from './intl-utils.js';

// Export utility classes for advanced usage
export { GestureHandler } from './gesture-handler.js';
export type { SwipeResult } from './gesture-handler.js';
export { AnimationController } from './animation-controller.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
// Register on both server (via @lit-labs/ssr-dom-shim) and client
import { Calendar } from './calendar.js';
import { CalendarMulti } from './calendar-multi.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-calendar')) {
    customElements.define('lui-calendar', Calendar);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-calendar] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }

  if (!customElements.get('lui-calendar-multi')) {
    customElements.define('lui-calendar-multi', CalendarMulti);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-calendar-multi] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-calendar': Calendar;
    'lui-calendar-multi': CalendarMulti;
  }
}
