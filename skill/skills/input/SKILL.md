---
name: lit-ui-input
description: >-
  How to use <lui-input> — props, slots, events, CSS tokens, examples.
---

# Input

## Usage

```html
<lui-input type="text" placeholder="Text input"></lui-input>
<lui-input type="email" placeholder="Email input"></lui-input>
<lui-input type="password" placeholder="Password input"></lui-input>
<lui-input type="number" placeholder="Number input"></lui-input>
<lui-input type="search" placeholder="Search input"></lui-input>
```

```html
<lui-input label="Email Address" type="email" placeholder="you@example.com"></lui-input>
<lui-input
  label="Username"
  helper-text="Choose a unique username, 3-20 characters"
  placeholder="your-username"
></lui-input>
<lui-input label="Email" required placeholder="Required field"></lui-input>
<lui-input clearable placeholder="Type to see clear button" value="Clear me"></lui-input>
```

```html
<!-- Prefix/suffix slots -->
<lui-input placeholder="0.00">
  <span slot="prefix">$</span>
</lui-input>
<lui-input type="number" placeholder="100">
  <span slot="suffix">kg</span>
</lui-input>
```

```html
<!-- Character counter -->
<lui-input label="Bio" placeholder="Tell us about yourself" maxlength="100" show-count></lui-input>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `"text" \| "email" \| "password" \| "number" \| "search"` | `"text"` | The input type. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size variant affecting padding and font size. |
| name | `string` | `""` | Form submission name. |
| value | `string` | `""` | Current value of the input. |
| placeholder | `string` | `""` | Placeholder text displayed when empty. |
| label | `string` | `""` | Label text above the input. |
| helper-text | `string` | `""` | Helper text between label and input. |
| required | `boolean` | `false` | Whether the input is required for form submission. |
| required-indicator | `"asterisk" \| "text"` | `"asterisk"` | Style of required indicator: * or (required). |
| disabled | `boolean` | `false` | Whether the input is disabled. |
| readonly | `boolean` | `false` | Whether the input is readonly. |
| minlength | `number` | `-` | Minimum length for text validation. |
| maxlength | `number` | `-` | Maximum length for text validation. |
| pattern | `string` | `""` | Regex pattern for validation. |
| min | `number` | `-` | Minimum value for number type. |
| max | `number` | `-` | Maximum value for number type. |
| clearable | `boolean` | `false` | Show clear button when input has value. |
| show-count | `boolean` | `false` | Show character counter (requires maxlength). |

## Slots

| Slot | Description |
|------|-------------|
| prefix | Content before the input (e.g., currency symbol, icon). |
| suffix | Content after the input (e.g., unit label, icon). |

## Events

No custom events. Use standard DOM events (`input`, `change`, `focus`, `blur`).

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-input-radius` | `var(--radius-md)` | Border radius of the input. |
| `--ui-input-border` | `var(--color-border)` | Border color. |
| `--ui-input-border-focus` | `var(--color-ring)` | Border color on focus. |
| `--ui-input-border-error` | `var(--color-destructive)` | Border color on error. |
| `--ui-input-bg` | `var(--color-background)` | Background color. |
| `--ui-input-text` | `var(--color-foreground)` | Text color. |
| `--ui-input-placeholder` | `var(--color-muted-foreground)` | Placeholder text color. |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | Outer wrapper div containing all elements. |
| `label` | Label element above the input. |
| `helper` | Helper text span. |
| `container` | Input container with border. |
| `input` | Native input element. |
| `prefix` | Prefix slot wrapper. |
| `suffix` | Suffix slot wrapper. |
| `counter` | Character counter span. |
| `error` | Error text span. |
