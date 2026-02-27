---
name: lit-ui-radio
description: >-
  How to use <lui-radio> and <lui-radio-group> — props, slots, events, CSS tokens, keyboard nav, examples.
---

# Radio

## Usage

```html
<lui-radio-group name="color" label="Favorite color">
  <lui-radio value="red" label="Red"></lui-radio>
  <lui-radio value="green" label="Green"></lui-radio>
  <lui-radio value="blue" label="Blue"></lui-radio>
</lui-radio-group>
```

```html
<!-- With initial value -->
<lui-radio-group name="size" value="md" label="Size">
  <lui-radio value="sm" label="Small"></lui-radio>
  <lui-radio value="md" label="Medium"></lui-radio>
  <lui-radio value="lg" label="Large"></lui-radio>
</lui-radio-group>
```

```html
<!-- Required -->
<lui-radio-group name="plan" label="Select a plan" required>
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="pro" label="Pro"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise"></lui-radio>
</lui-radio-group>
```

```html
<!-- Disabled group or individual item -->
<lui-radio-group name="status" label="Status" disabled>
  <lui-radio value="active" label="Active"></lui-radio>
  <lui-radio value="inactive" label="Inactive"></lui-radio>
</lui-radio-group>

<lui-radio-group name="tier" label="Tier">
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise" disabled></lui-radio>
</lui-radio-group>
```

## Props — `lui-radio`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | The value submitted when this radio is selected. |
| checked | `boolean` | `false` | Whether this radio is currently selected. |
| disabled | `boolean` | `false` | Whether this radio is disabled. |
| label | `string` | `""` | Label text displayed next to the radio. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size variant. |

## Props — `lui-radio-group`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | `string` | `""` | Form submission name for the group. |
| value | `string` | `""` | Currently selected radio value. |
| required | `boolean` | `false` | Whether a selection is required. |
| disabled | `boolean` | `false` | Disables all child radios. |
| label | `string` | `""` | Group label text (rendered as fieldset legend). |
| error | `string` | `""` | Error message displayed below the group. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string }` | Fired when the selected radio changes. Emitted on the radio-group. |

## Keyboard Navigation

| Key | Behavior |
|-----|----------|
| Arrow Down / Arrow Right | Move focus and selection to next radio option (wraps to first). |
| Arrow Up / Arrow Left | Move focus and selection to previous radio option (wraps to last). |
| Tab | Move focus out of the radio group. |
| Shift + Tab | Move focus to previous focusable element before the group. |
| Space | Select the currently focused radio (if not already selected). |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-radio-border` | `var(--color-border)` | Border color of the radio circle. |
| `--ui-radio-border-checked` | `var(--color-primary)` | Border color when checked. |
| `--ui-radio-border-width` | `2px` | Border width of the radio circle. |
| `--ui-radio-bg` | `var(--color-background)` | Background color of the radio circle. |
| `--ui-radio-dot-color` | `var(--color-primary)` | Color of the inner dot when checked. |
| `--ui-radio-ring` | `var(--color-ring)` | Focus ring color. |
| `--ui-radio-transition` | `150ms` | Transition duration for state changes. |
| `--ui-radio-label-gap` | `0.5rem` | Gap between radio circle and label. |
| `--ui-radio-group-gap` | `0.5rem` | Gap between radio items in a group. |
| `--ui-radio-text-error` | `var(--color-destructive)` | Error message text color. |
