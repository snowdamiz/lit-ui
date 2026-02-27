---
name: lit-ui-calendar
description: >-
  How to use <lui-calendar> and <lui-calendar-multi> — props, events, CSS tokens, examples.
---

# Calendar

## Usage

```html
<!-- Basic -->
<lui-calendar></lui-calendar>

<!-- Pre-selected date -->
<lui-calendar value="2026-02-14"></lui-calendar>

<!-- Min/max range -->
<lui-calendar min-date="2026-01-10" max-date="2026-02-20"></lui-calendar>

<!-- Disabled specific dates -->
<lui-calendar disabled-dates="2026-02-14,2026-02-15,2026-02-16"></lui-calendar>

<!-- Locale (German: Monday start, German names) -->
<lui-calendar locale="de-DE"></lui-calendar>

<!-- Force first day of week -->
<lui-calendar first-day-of-week="1"></lui-calendar>

<!-- Week numbers -->
<lui-calendar show-week-numbers></lui-calendar>

<!-- Multi-month (side-by-side) -->
<lui-calendar-multi></lui-calendar-multi>
<lui-calendar-multi months="3"></lui-calendar-multi>
```

## Props — `lui-calendar`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | Selected date as ISO string (YYYY-MM-DD). |
| locale | `string` | `navigator.language` | BCP 47 locale tag for localization. |
| min-date | `string` | `""` | Minimum selectable date as ISO string. Dates before this are grayed out. |
| max-date | `string` | `""` | Maximum selectable date as ISO string. Dates after this are grayed out. |
| disabled-dates | `string[]` | `[]` | Comma-separated list of disabled dates (or JS array). E.g., "2026-02-14,2026-02-15". |
| first-day-of-week | `string` | `""` | Override first day of week from locale. 1=Monday through 7=Sunday. |
| display-month | `string` | `""` | Display a specific month without selecting. Accepts YYYY-MM-DD or YYYY-MM format. |
| hide-navigation | `boolean` | `false` | Hide the month navigation header. Used internally by CalendarMulti. |
| show-week-numbers | `boolean` | `false` | Show ISO week numbers column. Week number buttons allow selecting an entire week. |
| show-constraint-tooltips | `boolean` | `false` | Show tooltips on disabled dates explaining why they are disabled. |

## Props — `lui-calendar-multi`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| months | `number` | `2` | Number of side-by-side month calendars to display (clamped to 2–3). |
| value | `string` | `""` | Selected date as ISO string (YYYY-MM-DD). Forwarded to all child calendars. |
| locale | `string` | `navigator.language` | BCP 47 locale tag forwarded to child calendars. |
| min-date | `string` | `""` | Minimum selectable date forwarded to child calendars. |
| max-date | `string` | `""` | Maximum selectable date forwarded to child calendars. |
| show-week-numbers | `boolean` | `false` | Show ISO week numbers forwarded to child calendars. |
| first-day-of-week | `string` | `""` | Override first day of week forwarded to child calendars. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string }` (YYYY-MM-DD) | Fired when a date is selected. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-calendar-width` | `320px` | Width of the calendar container. |
| `--ui-calendar-day-size` | `2.5rem` | Width and height of date buttons. |
| `--ui-calendar-gap` | `0.125rem` | Gap between grid items. |
| `--ui-calendar-radius` | `0.375rem` | Border radius for buttons and dropdowns. |
| `--ui-calendar-border` | `#e5e7eb` | Border color for selects and dialogs. |
| `--ui-calendar-bg` | `white` | Background color for the calendar. |
| `--ui-calendar-text` | `inherit` | Text color (used in dark mode). |
| `--ui-calendar-hover-bg` | `#f3f4f6` | Background color on hover for date and nav buttons. |
| `--ui-calendar-focus-ring` | `var(--color-ring, #3b82f6)` | Focus outline color. |
| `--ui-calendar-nav-color` | `currentColor` | Navigation arrow button color. |
| `--ui-calendar-weekday-color` | `#6b7280` | Weekday header text color. |
| `--ui-calendar-today-border` | `var(--color-primary, #3b82f6)` | Border color for today indicator. |
| `--ui-calendar-selected-bg` | `var(--color-primary, #3b82f6)` | Background color for selected date. |
| `--ui-calendar-selected-text` | `white` | Text color for selected date. |
| `--ui-calendar-outside-opacity` | `0.4` | Opacity for adjacent month dates. |
| `--ui-calendar-disabled-opacity` | `0.5` | Opacity for disabled dates. |
