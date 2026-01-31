// @lit-ui/calendar - Calendar component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class and types
export { Calendar } from './calendar.js';
export type { CalendarView } from './calendar.js';

// Export utility functions for public API
export {
  getMonthDays,
  formatDate,
  parseDate,
  isSameDayCompare,
  isDateToday,
} from './date-utils.js';
export { getWeekdayNames, getMonthName, getMonthYearLabel } from './intl-utils.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
// Register on both server (via @lit-labs/ssr-dom-shim) and client
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
