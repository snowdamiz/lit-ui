// @lit-ui/calendar - Accessible calendar display component with SSR support
// /// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes and types
export { Calendar } from './calendar.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Re-export date utilities for consumer use
export {
  getCalendarDays,
  getMonthYearLabel,
  intlFirstDayToDateFns,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getYear,
  getMonth,
  format,
} from './date-utils.js';

export {
  getFirstDayOfWeek,
  getWeekdayNames,
  getMonthNames,
} from './intl-utils.js';

// Safe custom element registration with collision detection
import { Calendar } from './calendar.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-calendar')) {
    customElements.define('lui-calendar', Calendar);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-calendar] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-calendar': Calendar;
  }
}
