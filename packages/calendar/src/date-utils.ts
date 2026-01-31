/**
 * Date Utility Functions
 *
 * Wrapper functions around date-fns for calendar date calculations.
 * Provides utilities for month grid generation, date formatting, and date comparisons.
 *
 * All dates are handled as native Date objects. ISO 8601 strings (YYYY-MM-DD)
 * are used for serialization and form values.
 */

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isWeekend,
  isBefore,
  isAfter,
  getISOWeek,
  startOfISOWeek,
  endOfISOWeek,
} from 'date-fns';

/**
 * Get all days in the month for the given date.
 *
 * Uses date-fns eachDayOfInterval to generate an array of Date objects
 * from the first day to the last day of the month.
 *
 * @param date - Reference date (any day in the target month)
 * @returns Array of Date objects for all days in the month
 *
 * @example
 * ```typescript
 * const januaryDays = getMonthDays(new Date(2026, 0, 15));
 * // Returns [2026-01-01, 2026-01-02, ..., 2026-01-31]
 * ```
 */
export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return eachDayOfInterval({ start, end });
}

/**
 * Format a date as ISO 8601 string (YYYY-MM-DD).
 *
 * This format is used for form values and component properties.
 * Time portion is not included (calendar deals with dates only).
 *
 * @param date - Date to format
 * @returns ISO 8601 date string (YYYY-MM-DD)
 *
 * @example
 * ```typescript
 * formatDate(new Date(2026, 0, 15)) // "2026-01-15"
 * ```
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO 8601 date string to a Date object.
 *
 * @param isoString - ISO 8601 date string (YYYY-MM-DD)
 * @returns Date object
 *
 * @example
 * ```typescript
 * parseDate("2026-01-15") // Date(2026, 0, 15)
 * ```
 */
export function parseDate(isoString: string): Date {
  // Parse ISO string manually to avoid timezone issues
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if two dates are the same day (ignoring time).
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 *
 * @example
 * ```typescript
 * isSameDayCompare(
 *   new Date(2026, 0, 15, 10, 30),
 *   new Date(2026, 0, 15, 18, 45)
 * ) // true
 * ```
 */
export function isSameDayCompare(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Check if a date is today.
 *
 * @param date - Date to check
 * @returns True if date is today
 *
 * @example
 * ```typescript
 * isDateToday(new Date()) // true
 * ```
 */
export function isDateToday(date: Date): boolean {
  return isToday(date);
}

/**
 * Add months to a date.
 *
 * @param date - Reference date
 * @param amount - Number of months to add (can be negative)
 * @returns New date with months added
 *
 * @example
 * ```typescript
 * addMonthsTo(new Date(2026, 0, 15), 1) // 2026-02-15
 * addMonthsTo(new Date(2026, 0, 15), -1) // 2025-12-15
 * ```
 */
export function addMonthsTo(date: Date, amount: number): Date {
  return addMonths(date, amount);
}

/**
 * Subtract months from a date.
 *
 * @param date - Reference date
 * @param amount - Number of months to subtract
 * @returns New date with months subtracted
 *
 * @example
 * ```typescript
 * subtractMonths(new Date(2026, 0, 15), 1) // 2025-12-15
 * ```
 */
export function subtractMonths(date: Date, amount: number): Date {
  return subMonths(date, amount);
}

/**
 * Date constraints for calendar date validation.
 */
export interface DateConstraints {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

/**
 * Check if a date is disabled based on constraints.
 *
 * Evaluates minimum date, maximum date, and specific disabled dates.
 * Returns true if the date should be disabled for any reason.
 *
 * @param date - Date to check
 * @param constraints - Date constraints (min/max, disabled dates)
 * @returns True if date is disabled
 *
 * @example
 * ```typescript
 * isDateDisabled(
 *   new Date(2026, 0, 1),
 *   { minDate: new Date(2026, 0, 15) }
 * ) // true (before min date)
 *
 * isDateDisabled(
 *   new Date(2026, 0, 20),
 *   { maxDate: new Date(2026, 0, 15) }
 * ) // true (after max date)
 *
 * isDateDisabled(
 *   new Date(2026, 0, 15),
 *   { disabledDates: [new Date(2026, 0, 15)] }
 * ) // true (specifically disabled)
 * ```
 */
export function isDateDisabled(
  date: Date,
  constraints: DateConstraints
): boolean {
  const { minDate, maxDate, disabledDates } = constraints;

  // Check minimum date
  if (minDate && isBefore(date, minDate)) {
    return true;
  }

  // Check maximum date
  if (maxDate && isAfter(date, maxDate)) {
    return true;
  }

  // Check disabled dates
  if (disabledDates?.some(d => isSameDay(date, d))) {
    return true;
  }

  return false;
}

/**
 * Check if a date falls on a weekend.
 *
 * Uses date-fns isWeekend which checks for Saturday (6) or Sunday (0).
 *
 * @param date - Date to check
 * @returns True if date is on a weekend
 *
 * @example
 * ```typescript
 * isWeekendDate(new Date(2026, 0, 4)) // true (Saturday)
 * isWeekendDate(new Date(2026, 0, 5)) // true (Sunday)
 * isWeekendDate(new Date(2026, 0, 6)) // false (Monday)
 * ```
 */
export function isWeekendDate(date: Date): boolean {
  return isWeekend(date);
}

/**
 * Get the ISO 8601 week number for a date.
 *
 * ISO weeks start on Monday and the first week of the year contains
 * January 4th. This means December 31 can belong to week 1 of the
 * following year, and January 1 can belong to week 52/53 of the
 * previous year.
 *
 * @param date - Date to get week number for
 * @returns ISO 8601 week number (1-53)
 *
 * @example
 * ```typescript
 * getISOWeekNumber(new Date(2026, 0, 5)) // 2 (Monday of week 2)
 * // Year boundary edge case:
 * getISOWeekNumber(new Date(2025, 11, 31)) // 1 (Dec 31 2025 is ISO week 1 of 2026)
 * ```
 */
export function getISOWeekNumber(date: Date): number {
  return getISOWeek(date);
}

/**
 * Get the start and end dates of the ISO week containing the given date.
 *
 * ISO weeks always start on Monday and end on Sunday.
 *
 * @param date - Any date within the target week
 * @returns Object with start (Monday) and end (Sunday) dates
 *
 * @example
 * ```typescript
 * const range = getWeekRange(new Date(2026, 0, 7)); // Wednesday
 * // range.start = 2026-01-05 (Monday)
 * // range.end = 2026-01-11 (Sunday)
 * ```
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfISOWeek(date),
    end: endOfISOWeek(date),
  };
}

/**
 * Information about a single ISO week within a month.
 */
export interface WeekInfo {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Get all ISO week numbers that appear in the displayed month.
 *
 * Returns a sorted array of WeekInfo objects, one per unique week number
 * visible in the month. Handles year boundaries correctly (e.g., January 1
 * may belong to week 52/53 of the previous year).
 *
 * @param monthDate - Reference date (any day in the target month)
 * @returns Array of WeekInfo objects sorted by calendar order
 *
 * @example
 * ```typescript
 * const weeks = getMonthWeeks(new Date(2026, 0, 1)); // January 2026
 * // Returns 5 WeekInfo objects for weeks 1-5
 * // (Jan 1 2026 is a Thursday in ISO week 1)
 * ```
 */
export function getMonthWeeks(monthDate: Date): WeekInfo[] {
  const days = getMonthDays(monthDate);
  const weekMap = new Map<string, WeekInfo>();

  for (const day of days) {
    const weekNumber = getISOWeek(day);
    const weekStart = startOfISOWeek(day);
    // Use a composite key of year+week to handle year boundaries
    // where week 52/53 from previous year and week 1 are both present
    const key = `${weekStart.getTime()}`;

    if (!weekMap.has(key)) {
      weekMap.set(key, {
        weekNumber,
        startDate: weekStart,
        endDate: endOfISOWeek(day),
      });
    }
  }

  // Sort by start date to maintain calendar order
  return Array.from(weekMap.values()).sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );
}
