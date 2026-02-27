---
name: lit-ui-checkbox
description: >-
  How to use <lui-checkbox> and <lui-checkbox-group> — props, slots, events, CSS tokens, examples.
---

# Checkbox

## Usage

```html
<lui-checkbox label="Accept terms"></lui-checkbox>
<lui-checkbox checked label="Subscribed"></lui-checkbox>
<lui-checkbox indeterminate label="Select all"></lui-checkbox>
```

```html
<!-- Checkbox group -->
<lui-checkbox-group label="Notifications">
  <lui-checkbox label="Email" name="notif" value="email"></lui-checkbox>
  <lui-checkbox label="SMS" name="notif" value="sms"></lui-checkbox>
  <lui-checkbox label="Push" name="notif" value="push"></lui-checkbox>
</lui-checkbox-group>
```

```html
<!-- Group with select-all -->
<lui-checkbox-group label="Toppings" select-all>
  <lui-checkbox label="Cheese" name="top" value="cheese"></lui-checkbox>
  <lui-checkbox label="Pepperoni" name="top" value="pepperoni"></lui-checkbox>
  <lui-checkbox label="Mushroom" name="top" value="mushroom"></lui-checkbox>
</lui-checkbox-group>
```

```html
<!-- Sizes -->
<lui-checkbox size="sm" label="Small"></lui-checkbox>
<lui-checkbox size="md" label="Medium"></lui-checkbox>
<lui-checkbox size="lg" label="Large"></lui-checkbox>
```

## Props — `lui-checkbox`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean` | `false` | Whether the checkbox is checked. |
| disabled | `boolean` | `false` | Whether the checkbox is disabled. |
| required | `boolean` | `false` | Whether the checkbox is required for form submission. |
| indeterminate | `boolean` | `false` | Whether to show indeterminate (dash) state. |
| name | `string` | `""` | Form submission name. |
| value | `string` | `"on"` | Form submission value when checked. |
| label | `string` | `""` | Label text displayed next to the checkbox. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size variant affecting box dimensions and label typography. |

## Props — `lui-checkbox-group`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | `""` | Group label text displayed above the checkboxes. |
| disabled | `boolean` | `false` | Disables all child checkboxes. |
| required | `boolean` | `false` | At least one checkbox must be checked. |
| error | `string` | `""` | Custom error message displayed below the group. |
| select-all | `boolean` | `false` | Shows a select-all parent checkbox. |

## Slots — `lui-checkbox`

| Slot | Description |
|------|-------------|
| default | Custom label content (alternative to label property). |

## Slots — `lui-checkbox-group`

| Slot | Description |
|------|-------------|
| default | Child `lui-checkbox` elements. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ checked: boolean, value: string }` | Fired when checkbox state changes. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-checkbox-bg` | `var(--color-background)` | Unchecked background color. |
| `--ui-checkbox-bg-checked` | `var(--color-primary)` | Checked/indeterminate background color. |
| `--ui-checkbox-border` | `var(--color-border)` | Border color. |
| `--ui-checkbox-border-checked` | `var(--color-primary)` | Border color when checked. |
| `--ui-checkbox-border-error` | `var(--color-destructive)` | Border color on validation error. |
| `--ui-checkbox-check-color` | `var(--color-primary-foreground)` | Checkmark/dash icon color. |
| `--ui-checkbox-radius` | `var(--radius-sm)` | Border radius of the checkbox box. |
| `--ui-checkbox-ring` | `var(--color-ring)` | Focus ring color. |
| `--ui-checkbox-transition` | `150ms` | Transition duration for animations. |
| `--ui-checkbox-label-gap` | `0.5rem` | Gap between checkbox and label. |
| `--ui-checkbox-group-gap` | `0.5rem` | Gap between items in a checkbox group. |
| `--ui-checkbox-text-error` | `var(--color-destructive)` | Error text color. |

## CSS Parts — `lui-checkbox`

| Part | Description |
|------|-------------|
| `wrapper` | Outer wrapper div containing checkbox and label. |
| `box` | The checkbox box element with role="checkbox". |
| `label` | Label text element. |
| `error` | Error text element. |
