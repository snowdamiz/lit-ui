---
name: lit-ui-switch
description: >-
  How to use <lui-switch> — props, slots, events, CSS tokens, examples.
---

# Switch

## Usage

```html
<lui-switch label="Notifications"></lui-switch>
<lui-switch checked label="Dark mode"></lui-switch>
```

```html
<!-- Sizes -->
<lui-switch size="sm" label="Small"></lui-switch>
<lui-switch size="md" label="Medium"></lui-switch>
<lui-switch size="lg" label="Large"></lui-switch>
```

```html
<!-- Disabled states -->
<lui-switch disabled label="Disabled off"></lui-switch>
<lui-switch disabled checked label="Disabled on"></lui-switch>
```

```html
<!-- Form participation -->
<form>
  <lui-switch name="notifications" value="enabled" label="Enable notifications"></lui-switch>
  <lui-switch name="dark-mode" value="on" label="Dark mode"></lui-switch>
  <button type="submit">Save</button>
</form>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean` | `false` | Whether the switch is on. |
| disabled | `boolean` | `false` | Whether the switch is disabled. |
| required | `boolean` | `false` | Whether the switch must be on for form submission. |
| name | `string` | `""` | Form submission name. |
| value | `string` | `"on"` | Form submission value when checked. |
| label | `string` | `""` | Label text displayed next to the switch. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size variant affecting track and thumb dimensions. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ checked: boolean }` | Fired when the switch is toggled. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-switch-radius` | `9999px` | Border radius of the track. |
| `--ui-switch-thumb-radius` | `9999px` | Border radius of the thumb. |
| `--ui-switch-thumb-offset` | `2px` | Inset offset for thumb positioning. |
| `--ui-switch-label-gap` | `0.5rem` | Gap between label and track. |
| `--ui-switch-transition` | `150ms` | Transition duration for slide animation. |
| `--ui-switch-track-bg` | `var(--color-muted)` | Track background when unchecked. |
| `--ui-switch-track-bg-checked` | `var(--color-primary)` | Track background when checked. |
| `--ui-switch-track-border` | `var(--color-border)` | Track border color. |
| `--ui-switch-thumb-bg` | `white` | Thumb background color. |
| `--ui-switch-ring` | `var(--color-ring)` | Focus ring color. |
| `--ui-switch-border-error` | `var(--color-destructive)` | Track border color on error. |
| `--ui-switch-text-error` | `var(--color-destructive)` | Error text color. |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | Outer flex wrapper containing label and track. |
| `track` | The oval toggle track background. |
| `thumb` | The sliding circle thumb. |
| `label` | Label text element. |
| `error` | Error message text. |
