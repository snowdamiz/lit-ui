/**
 * Date utility functions wrapping date-fns for calendar operations.
 *
 * All date math is delegated to date-fns to handle edge cases
 * (leap years, DST transitions, month boundaries) correctly.
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
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
} from 'date-fns';

// Re-export commonly used date-fns functions for convenience
export {
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
};

/**
 * Generate all days visible in a calendar grid for the given month.
 *
 * Returns an array of Date objects starting from the first day of the week
 * containing the month's first day, through the last day of the week
 * containing the month's last day. This naturally produces 5-6 complete
 * rows of 7 days, including leading/trailing days from adjacent months.
 *
 * @param month - Any date within the target month
 * @param weekStartsOn - First day of week (0=Sun, 1=Mon, ..., 6=Sat) in date-fns format
 * @returns Array of Date objects for the full calendar grid
 */
export function getCalendarDays(
  month: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * Format a month/year label using Intl.DateTimeFormat for localization.
 *
 * @param month - Any date within the target month
 * @param locale - BCP 47 locale tag (e.g., 'en-US', 'de-DE')
 * @returns Localized string like "January 2026" or "Januar 2026"
 */
export function getMonthYearLabel(month: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(month);
}

/**
 * Map Intl firstDay value to date-fns weekStartsOn value.
 *
 * Intl API uses 1=Monday through 7=Sunday.
 * date-fns uses 0=Sunday through 6=Saturday.
 *
 * @param intlFirstDay - Intl.Locale weekInfo firstDay value (1-7)
 * @returns date-fns weekStartsOn value (0-6)
 */
export function intlFirstDayToDateFns(
  intlFirstDay: number
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return (intlFirstDay === 7 ? 0 : intlFirstDay) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
