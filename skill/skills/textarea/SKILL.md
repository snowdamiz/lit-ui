---
name: lit-ui-textarea
description: >-
  How to use <lui-textarea> — props, slots, events, CSS tokens, examples.
---

# Textarea

## Usage

```html
<lui-textarea placeholder="Enter your message..."></lui-textarea>
```

```html
<lui-textarea label="Bio" helper-text="Max 500 characters" placeholder="About you..."></lui-textarea>
<lui-textarea label="Notes" required placeholder="Required field"></lui-textarea>
<lui-textarea autoresize placeholder="Grows as you type"></lui-textarea>
<lui-textarea autoresize max-rows="6" placeholder="Max 6 rows"></lui-textarea>
<lui-textarea label="Bio" maxlength="200" show-count placeholder="Tell us about yourself"></lui-textarea>
<lui-textarea resize="none" placeholder="Fixed size"></lui-textarea>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size variant affecting padding and font size. |
| name | `string` | `""` | Form submission name. |
| value | `string` | `""` | Current value of the textarea. |
| placeholder | `string` | `""` | Placeholder text displayed when empty. |
| label | `string` | `""` | Label text above the textarea. |
| helper-text | `string` | `""` | Helper text between label and textarea. |
| rows | `number` | `3` | Initial height in rows. |
| resize | `"none" \| "vertical" \| "horizontal" \| "both"` | `"vertical"` | Resize handle behavior. |
| autoresize | `boolean` | `false` | Auto-grow to fit content. Hides resize handle when enabled. |
| max-rows | `number` | `-` | Maximum rows for auto-resize constraint. |
| max-height | `string` | `-` | Maximum height CSS value (e.g., "200px"). Takes precedence over max-rows. |
| required | `boolean` | `false` | Whether the textarea is required for form submission. |
| required-indicator | `"asterisk" \| "text"` | `"asterisk"` | Style of required indicator: * or (required). |
| disabled | `boolean` | `false` | Whether the textarea is disabled. |
| readonly | `boolean` | `false` | Whether the textarea is readonly. |
| minlength | `number` | `-` | Minimum length for text validation. |
| maxlength | `number` | `-` | Maximum length for text validation. |
| show-count | `boolean` | `false` | Show character counter (requires maxlength). Displays "current/max" format. |

## Slots

No slots. All content is via properties.

## Events

No custom events. Use standard DOM events (`input`, `change`, `focus`, `blur`).

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-input-radius` | `var(--radius-md)` | Border radius of the textarea. |
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
| `label` | Label element above the textarea. |
| `helper` | Helper text span. |
| `textarea` | Native textarea element. |
| `counter` | Character counter span. |
| `error` | Error text span. |
