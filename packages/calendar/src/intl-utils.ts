/**
 * Internationalization Utility Functions
 *
 * Locale-aware formatting functions using the native Intl API.
 * Provides weekday names, month names, and formatted labels for the calendar.
 */

/**
 * Get localized weekday names.
 *
 * Uses Intl.DateTimeFormat to get weekday abbreviations based on locale.
 * Starts from Sunday (day 1) to Saturday (day 7) for consistency.
 *
 * @param locale - Locale string (e.g., 'en-US', 'en-GB', 'fr-FR')
 * @param style - Weekday style format ('long', 'short', 'narrow')
 * @returns Array of weekday names starting from Sunday
 *
 * @example
 * ```typescript
 * getWeekdayNames('en-US', 'short')
 * // Returns ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
 *
 * getWeekdayNames('en-GB', 'short')
 * // Returns ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
 * // (Note: order is always Sun-Sat, locale affects first day display)
 * ```
 */
export function getWeekdayNames(
  locale: string,
  style: 'long' | 'short' | 'narrow' = 'short'
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: style });

  // Generate names for Sunday through Saturday
  // 2023-01-01 was a Sunday, so we use that as our base date
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, i + 1);
    return formatter.format(date);
  });
}

/**
 * Get localized month name for a date.
 *
 * @param date - Date to get month name for
 * @param locale - Locale string (e.g., 'en-US', 'fr-FR')
 * @returns Full month name (e.g., "January", "janvier")
 *
 * @example
 * ```typescript
 * getMonthName(new Date(2026, 0, 15), 'en-US') // "January"
 * getMonthName(new Date(2026, 0, 15), 'fr-FR') // "janvier"
 * ```
 */
export function getMonthName(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  return formatter.format(date);
}

/**
 * Get localized month and year label.
 *
 * Formats a date as a localized month-year string for calendar headings.
 *
 * @param date - Date to format
 * @param locale - Locale string (e.g., 'en-US', 'de-DE')
 * @returns Formatted month-year string (e.g., "January 2026")
 *
 * @example
 * ```typescript
 * getMonthYearLabel(new Date(2026, 0, 15), 'en-US') // "January 2026"
 * getMonthYearLabel(new Date(2026, 0, 15), 'de-DE') // "Januar 2026"
 * ```
 */
export function getMonthYearLabel(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  });
  return formatter.format(date);
}
