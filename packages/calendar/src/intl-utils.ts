/**
 * Internationalization Utility Functions
 *
 * Locale-aware formatting functions using native Intl API.
 * Provides weekday names, month names, and month/year labels
 * for calendar display.
 *
 * Uses Intl.DateTimeFormat and Intl.Locale.getWeekInfo() for
 * browser-native localization without external dependencies.
 */

/**
 * Get localized weekday names starting from Sunday.
 *
 * Uses Intl.DateTimeFormat with weekday: 'short' to generate
 * abbreviated weekday names (e.g., "Sun", "Mon", "Tue").
 *
 * Note: This implementation starts from Sunday (day 1) regardless
 * of locale. Locale-aware first day of week will be handled in
 * the calendar component using Intl.Locale.getWeekInfo().
 *
 * @param locale - BCP 47 language tag (e.g., "en-US", "fr-FR")
 * @returns Array of 7 weekday names starting from Sunday
 *
 * @example
 * ```typescript
 * getWeekdayNames("en-US")
 * // ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
 *
 * getWeekdayNames("fr-FR")
 * // ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."]
 * ```
 */
export function getWeekdayNames(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
  });

  // 2023-01-01 was a Sunday (day 1)
  // Generate names for Sunday (day 1) through Saturday (day 7)
  const names: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date(2023, 0, i);
    names.push(formatter.format(date));
  }

  return names;
}

/**
 * Get localized month name for a date.
 *
 * Uses Intl.DateTimeFormat with month: 'long' to get the full
 * month name (e.g., "January", "February").
 *
 * @param date - Date in the target month
 * @param locale - BCP 47 language tag (e.g., "en-US", "fr-FR")
 * @returns Localized month name
 *
 * @example
 * ```typescript
 * getMonthName(new Date(2026, 0, 15), "en-US") // "January"
 * getMonthName(new Date(2026, 0, 15), "fr-FR") // "janvier"
 * ```
 */
export function getMonthName(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
  });

  return formatter.format(date);
}

/**
 * Get localized month and year label.
 *
 * Uses Intl.DateTimeFormat with year: 'numeric' and month: 'long'
 * to generate a formatted string like "January 2026".
 *
 * @param date - Date in the target month
 * @param locale - BCP 47 language tag (e.g., "en-US", "fr-FR")
 * @returns Localized month/year label
 *
 * @example
 * ```typescript
 * getMonthYearLabel(new Date(2026, 0, 15), "en-US") // "January 2026"
 * getMonthYearLabel(new Date(2026, 0, 15), "fr-FR") // "janvier 2026"
 * ```
 */
export function getMonthYearLabel(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  });

  return formatter.format(date);
}
