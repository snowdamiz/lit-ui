---
name: lit-ui-time-picker
description: >-
  How to use <lui-time-picker> — props, events, CSS tokens, sub-components, examples.
---

# Time Picker

## Usage

```html
<lui-time-picker label="Meeting Time"></lui-time-picker>
<lui-time-picker label="Appointment" value="14:30:00"></lui-time-picker>
<lui-time-picker label="Start Time" min-time="09:00" max-time="17:00"></lui-time-picker>
<lui-time-picker label="Time" hour12></lui-time-picker>
<lui-time-picker label="Time" step="15"></lui-time-picker>
<lui-time-picker label="Time" interface-mode="clock"></lui-time-picker>
<lui-time-picker label="Time" interface-mode="wheel"></lui-time-picker>
<lui-time-picker label="Time" show-timezone></lui-time-picker>
<lui-time-picker label="Time" presets></lui-time-picker>
<lui-time-picker label="Time" voice></lui-time-picker>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | Current time value as ISO `HH:mm:ss` string. |
| name | `string` | `""` | Form submission name. |
| label | `string` | `""` | Accessible label text. |
| placeholder | `string` | `"Select time"` | Placeholder text when no time is selected. |
| required | `boolean` | `false` | Whether the time picker is required for form submission. |
| disabled | `boolean` | `false` | Whether the time picker is disabled. |
| readonly | `boolean` | `false` | Whether the time picker is readonly. |
| hour12 | `boolean` | auto from locale | 12-hour clock display. Defaults to locale preference. |
| locale | `string` | `"en-US"` | BCP 47 locale for display formatting. |
| step | `number` | `30` | Minute step interval (minutes). |
| min-time | `string` | `""` | Minimum selectable time as `HH:mm`. |
| max-time | `string` | `""` | Maximum selectable time as `HH:mm`. |
| allow-overnight | `boolean` | `false` | Allow min-time > max-time (overnight range crossing midnight). |
| show-timezone | `boolean` | `false` | Show timezone display and selector. |
| timezone | `string` | local | Timezone identifier (e.g. "America/New_York"). |
| voice | `boolean` | `false` | Enable voice input via Web Speech API (progressive enhancement). |
| interface-mode | `"clock" \| "dropdown" \| "both" \| "wheel" \| "range"` | `"both"` | Which time input interface to show. |
| presets | `boolean \| TimePreset[]` | `false` | Quick preset buttons. `true` for defaults, or pass custom `TimePreset[]` via JS. |
| businessHours | `{start: string, end: string} \| false` | — | Business hours constraint. JS-only property. |
| additionalTimezones | `string[]` | `[]` | Extra timezone options. Pass as comma-separated attribute or JS array. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string, timeValue: TimeValue \| null }` | Fired when the time value changes. `value` is `HH:mm:ss`. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-time-picker-bg` | — | Background color of the input. |
| `--ui-time-picker-text` | — | Text color. |
| `--ui-time-picker-border` | — | Border color. |
| `--ui-time-picker-border-focus` | — | Border color on focus. |
| `--ui-time-picker-radius` | — | Border radius. |
| `--ui-time-picker-placeholder` | — | Placeholder text color. |
| `--ui-time-picker-label-text` | — | Label text color. |
| `--ui-time-picker-error` | — | Error state color. |
| `--ui-time-picker-popup-bg` | — | Calendar/dropdown popup background. |
| `--ui-time-picker-popup-border` | — | Popup border color. |
| `--ui-time-picker-primary` | — | Primary accent color (selected time). |
| `--ui-time-picker-tab-bg` | — | Tab background color. |
| `--ui-time-picker-tab-bg-hover` | — | Tab background on hover. |
| `--ui-time-picker-preset-bg` | — | Preset button background. |
| `--ui-time-picker-preset-border` | — | Preset button border. |
| `--ui-time-picker-preset-text` | — | Preset button text color. |
| `--ui-time-picker-timezone-text` | — | Timezone display text color. |
| `--ui-time-picker-bg-disabled` | — | Disabled background color. |
| `--ui-time-picker-border-disabled` | — | Disabled border color. |
| `--ui-time-picker-border-width` | — | Border width. |

## Sub-Components

These are exported from `@lit-ui/time-picker` for advanced use:

- `lui-timezone-display` — Timezone display widget
- `lui-time-range-slider` — Dual-handle time range slider
- `lui-time-scroll-wheel` — Scroll-wheel time selection
- `lui-time-voice-input` — Voice input control
