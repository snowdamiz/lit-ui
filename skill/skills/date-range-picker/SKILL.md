---
name: lit-ui-date-range-picker
description: >-
  How to use <lui-date-range-picker> — props, events, CSS tokens, examples.
---

# Date Range Picker

## Usage

```html
<lui-date-range-picker label="Date Range"></lui-date-range-picker>
<lui-date-range-picker label="Project Timeline" start-date="2026-01-01" end-date="2026-03-31"></lui-date-range-picker>
<lui-date-range-picker label="Booking" min-date="2026-01-01" max-date="2026-12-31" min-days="2" max-days="30"></lui-date-range-picker>
<lui-date-range-picker label="Trip" required></lui-date-range-picker>
<lui-date-range-picker presets label="Date Range"></lui-date-range-picker>
<lui-date-range-picker comparison label="Compare Periods"></lui-date-range-picker>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| start-date | `string` | `""` | Start of the selected range as ISO string (YYYY-MM-DD). |
| end-date | `string` | `""` | End of the selected range as ISO string (YYYY-MM-DD). |
| name | `string` | `""` | Form field name. Submitted as ISO 8601 interval (`YYYY-MM-DD/YYYY-MM-DD`). |
| locale | `string` | `navigator.language` | BCP 47 locale tag. |
| placeholder | `string` | `"Select date range"` | Placeholder text displayed when no range is selected. |
| label | `string` | `""` | Accessible label text. |
| helper-text | `string` | `""` | Helper text below the input. |
| min-date | `string` | `""` | Minimum selectable date as ISO string. |
| max-date | `string` | `""` | Maximum selectable date as ISO string. |
| min-days | `number` | `0` | Minimum number of days in the selected range. |
| max-days | `number` | `0` | Maximum number of days in the selected range (0 = no limit). |
| required | `boolean` | `false` | Whether a range selection is required for form submission. |
| disabled | `boolean` | `false` | Whether the date range picker is disabled. |
| error | `string` | `""` | External error message to display. |
| comparison | `boolean` | `false` | Enable comparison mode with a second range for analytics/analytics dashboards. |
| compare-start-date | `string` | `""` | Start of the comparison range. |
| compare-end-date | `string` | `""` | End of the comparison range. |
| presets | `boolean \| DateRangePreset[]` | `false` | Quick selection presets. `true` shows defaults (Last 7/30/90 days, This month, etc). Pass custom array via JS. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ startDate: string, endDate: string, isoInterval: string, compareStartDate?: string, compareEndDate?: string, compareIsoInterval?: string }` | Fired when the range changes. All dates are YYYY-MM-DD. `isoInterval` is `"YYYY-MM-DD/YYYY-MM-DD"`. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-range-selected-bg` | — | Background for selected range days. |
| `--ui-range-selected-text` | — | Text color for selected range days. |
| `--ui-range-highlight-bg` | — | Background for in-range (between start and end) days. |
| `--ui-range-highlight-text` | — | Text color for in-range days. |
| `--ui-range-preview-bg` | — | Background for hover-preview range. |
| `--ui-range-compare-bg` | — | Background for comparison range days. |
| `--ui-range-compare-text` | — | Text color for comparison range days. |
| `--ui-range-compare-highlight-bg` | — | Background for in-range comparison days. |
| `--ui-range-compare-preview-bg` | — | Background for hover-preview comparison range. |
| `--ui-date-picker-radius` | `0.375rem` | Border radius. |
| `--ui-date-picker-border` | `#d1d5db` | Border color. |
| `--ui-date-picker-bg` | `white` | Input background. |
| `--ui-date-picker-text` | `inherit` | Input text color. |
| `--ui-date-picker-popup-bg` | `white` | Calendar popup background. |
| `--ui-date-picker-popup-border` | `#e5e7eb` | Calendar popup border. |
| `--ui-date-picker-error` | `#ef4444` | Error text and border color. |
