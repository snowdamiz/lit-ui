/**
 * Calendar CSS Custom Properties
 *
 * CSS design tokens for calendar theming.
 * These properties are used in calendar.ts for styling calendar cells,
 * today indicators, and selected states.
 *
 * Import this file into core's tailwind.css or use as standalone CSS string.
 */

export const calendarStyles = `
:root {
  /* Calendar spacing and sizing */
  --ui-calendar-gap: 0.25rem;
  --ui-calendar-cell-size: 2.5rem;
  --ui-calendar-cell-radius: 0.375rem;

  /* Today indicator styles */
  --ui-calendar-today-font-weight: 600;
  --ui-calendar-today-border: 2px solid var(--color-brand-500);

  /* Selected date styles */
  --ui-calendar-selected-bg: var(--color-brand-500);
  --ui-calendar-selected-text: oklch(0.98 0.01 250);

  /* Disabled state */
  --ui-calendar-disabled-opacity: 0.4;
}
`;
