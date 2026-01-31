/**
 * Internationalization Utility Functions
 *
 * Locale-aware formatting functions using the native Intl API.
 * Provides weekday names, month names, and formatted labels for the calendar.
 */

/**
 * Get the first day of the week for a given locale.
 *
 * Uses Intl.Locale.getWeekInfo() when available (Chrome 99+, Safari 17+)
 * with fallback for unsupported browsers.
 *
 * @param locale - Locale string (e.g., 'en-US', 'en-GB', 'fr-FR')
 * @returns First day of week (1=Monday, 7=Sunday)
 *
 * @example
 * ```typescript
 * getFirstDayOfWeek('en-US') // 7 (Sunday)
 * getFirstDayOfWeek('en-GB') // 1 (Monday)
 * getFirstDayOfWeek('fr-FR') // 1 (Monday)
 * ```
 */
export function getFirstDayOfWeek(locale: string): number {
  try {
    const localeObj = new Intl.Locale(locale as any);

    // Check if getWeekInfo is available (Chrome 99+, Safari 17+)
    if (typeof (localeObj as any).getWeekInfo === 'function') {
      const weekInfo = (localeObj as any).getWeekInfo();
      // getWeekInfo returns: { firstDay: number, weekend: number[], minimalDays: number }
      // firstDay: 1=Monday, 7=Sunday
      return weekInfo.firstDay;
    }
  } catch (e) {
    // Fall through to fallback
  }

  // Fallback: Sunday (7) for US/IL, Monday (1) for most others
  if (locale.startsWith('en-US') || locale.startsWith('he-IL')) {
    return 7; // Sunday
  }
  return 1; // Monday
}

/**
 * Get localized weekday names starting from locale-specific first day.
 *
 * Uses Intl.DateTimeFormat to get weekday abbreviations based on locale.
 * Starts from the locale's first day of week (e.g., Sunday for en-US, Monday for en-GB).
 *
 * @param locale - Locale string (e.g., 'en-US', 'en-GB', 'fr-FR')
 * @param style - Weekday style format ('long', 'short', 'narrow')
 * @returns Array of weekday names starting from locale's first day
 *
 * @example
 * ```typescript
 * getWeekdayNames('en-US', 'short')
 * // Returns ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
 *
 * getWeekdayNames('en-GB', 'short')
 * // Returns ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
 *
 * getWeekdayNames('fr-FR', 'short')
 * // Returns ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
 * ```
 */
export function getWeekdayNames(
  locale: string,
  style: 'long' | 'short' | 'narrow' = 'short'
): string[] {
  // Get first day of week for this locale
  const firstDay = getFirstDayOfWeek(locale);

  // Create formatter
  const formatter = new Intl.DateTimeFormat(locale, { weekday: style });

  // Generate names starting from firstDay
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    // 2023-01-01 was a Sunday (day 1), so we add (firstDay - 1) to adjust
    const date = new Date(2023, 0, firstDay + i);
    names.push(formatter.format(date));
  }

  return names;
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
