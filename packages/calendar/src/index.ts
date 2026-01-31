// @lit-ui/calendar - Accessible calendar display component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes and types
export { Calendar } from './calendar.js';
export { CalendarMulti } from './calendar-multi.js';
export { GestureHandler } from './gesture-handler.js';
export { AnimationController } from './animation-controller.js';
export type { DateConstraints, DayCellState } from './calendar.js';

// Export keyboard navigation manager
export { KeyboardNavigationManager } from './keyboard-nav.js';
export type { NavigationDirection } from './keyboard-nav.js';

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
  isBefore,
  isAfter,
  startOfDay,
  getISOWeekNumber,
  getISOWeekDates,
  getMonthWeeks,
} from './date-utils.js';

export type { WeekInfo } from './date-utils.js';

export {
  getFirstDayOfWeek,
  getWeekdayNames,
  getWeekdayLongNames,
  getMonthNames,
} from './intl-utils.js';

// Safe custom element registration with collision detection
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
