---
name: lit-ui-date-picker
description: >-
  How to use <lui-date-picker> — props, events, CSS tokens, examples.
---

# Date Picker

## Usage

```html
<lui-date-picker label="Date"></lui-date-picker>
<lui-date-picker label="Birthday" value="2026-02-14"></lui-date-picker>
<lui-date-picker label="Appointment" min-date="2026-01-10" max-date="2026-03-31"></lui-date-picker>
<lui-date-picker label="Start Date" required></lui-date-picker>
<lui-date-picker presets label="Date"></lui-date-picker>
<lui-date-picker label="Date" inline></lui-date-picker>
```

```html
<!-- Natural language input: type "tomorrow", "next friday", "in 3 days" -->
<lui-date-picker label="Date"></lui-date-picker>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | Selected date as ISO 8601 string (YYYY-MM-DD). Canonical form value submitted via ElementInternals. |
| name | `string` | `""` | Form field name for form submission. |
| locale | `string` | `navigator.language` | BCP 47 locale tag. Controls placeholder format, display formatting, and calendar locale. |
| placeholder | `string` | `""` | Custom placeholder text. Falls back to locale-aware placeholder (e.g. "mm/dd/yyyy" for en-US). |
| label | `string` | `""` | Accessible label for the input field. |
| helper-text | `string` | `""` | Helper text displayed below the input. Hidden when error is shown. |
| min-date | `string` | `""` | Minimum selectable date as ISO string. Dates before this are disabled in calendar and rejected on input. |
| max-date | `string` | `""` | Maximum selectable date as ISO string. Dates after this are disabled in calendar and rejected on input. |
| required | `boolean` | `false` | Whether a date selection is required for form submission. Shows required indicator (*) next to label. |
| disabled | `boolean` | `false` | Whether the date picker is disabled. |
| inline | `boolean` | `false` | Render an always-visible calendar without popup/input wrapper. |
| error | `string` | `""` | External error message. When set, overrides internal validation errors. |
| presets | `boolean \| DatePreset[]` | `false` | Preset buttons for quick selection. `true` shows defaults (Today, Tomorrow, Next Week). Pass custom array via JS. |
| format | `Intl.DateTimeFormatOptions \| null` | `null` | Custom display format options (JS-only). Only affects display; parsing still accepts any parseable format. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ date: Date \| null, isoString: string }` | Fired when a date is selected, typed, or cleared. `date` is null when cleared. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-date-picker-text` | `inherit` | Text color for the label and input. |
| `--ui-date-picker-bg` | `white` | Background color for the input container. |
| `--ui-date-picker-border` | `#d1d5db` | Border color for the input container. |
| `--ui-date-picker-border-focus` | `#3b82f6` | Border color when the input is focused. |
| `--ui-date-picker-radius` | `0.375rem` | Border radius for the input container. |
| `--ui-date-picker-border-width` | `1px` | Border width for the input container. |
| `--ui-date-picker-placeholder` | `#9ca3af` | Placeholder text color. |
| `--ui-date-picker-error` | `#ef4444` | Error text and border color. |
| `--ui-date-picker-popup-bg` | `white` | Background color for the calendar popup. |
| `--ui-date-picker-popup-border` | `#e5e7eb` | Border color for the calendar popup. |
| `--ui-date-picker-preset-bg` | `#f9fafb` | Background color for preset buttons. |
| `--ui-date-picker-preset-border` | `#d1d5db` | Border color for preset buttons. |
