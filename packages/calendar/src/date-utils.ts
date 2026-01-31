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
