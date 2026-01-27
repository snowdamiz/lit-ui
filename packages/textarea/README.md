# @lit-ui/textarea

Accessible textarea component built with Lit and Tailwind CSS. Supports auto-resize, character counter, configurable resize behavior, and native form participation.

## Installation

```bash
npm install @lit-ui/textarea @lit-ui/core lit
```

## Quick Start

```html
<script type="module">
  import '@lit-ui/textarea';
</script>

<lui-textarea
  label="Comments"
  placeholder="Enter your feedback"
  rows="4"
></lui-textarea>
```

## Tag Name

`<lui-textarea>`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Textarea size |
| `name` | `name` | `string` | `''` | Form field name |
| `value` | `value` | `string` | `''` | Textarea value |
| `placeholder` | `placeholder` | `string` | `''` | Placeholder text |
| `label` | `label` | `string` | `''` | Label text |
| `helperText` | `helper-text` | `string` | `''` | Helper text below textarea |
| `disabled` | `disabled` | `boolean` | `false` | Disables the textarea |
| `readonly` | `readonly` | `boolean` | `false` | Makes textarea read-only |
| `required` | `required` | `boolean` | `false` | Marks as required |
| `rows` | `rows` | `number` | `3` | Initial visible rows |
| `resize` | `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Manual resize behavior |
| `autoresize` | `autoresize` | `boolean` | `false` | Auto-expand to fit content |
| `maxRows` | `max-rows` | `number \| undefined` | — | Max rows when autoresizing |
| `maxHeight` | `max-height` | `string \| undefined` | — | Max height CSS value (overrides maxRows) |
| `minlength` | `minlength` | `number \| undefined` | — | Minimum character length |
| `maxlength` | `maxlength` | `number \| undefined` | — | Maximum character length |
| `showCount` | `show-count` | `boolean` | `false` | Show character counter |
| `requiredIndicator` | `required-indicator` | `'asterisk' \| 'text'` | `'asterisk'` | Required indicator style |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | Outer container |
| `label` | Label element |
| `helper` | Helper text |
| `textarea` | Native `<textarea>` element |
| `error` | Error message |
| `counter` | Character counter |

## CSS Custom Properties

Uses the same `--ui-input-*` token system as `<lui-input>`:

| Property | Description |
|----------|-------------|
| `--ui-input-radius` | Border radius |
| `--ui-input-border-width` | Border width |
| `--ui-input-transition` | Transition timing |
| `--ui-input-font-size-sm/md/lg` | Font size per size variant |
| `--ui-input-padding-x-sm/md/lg` | Horizontal padding per size |
| `--ui-input-padding-y-sm/md/lg` | Vertical padding per size |
| `--ui-input-bg` | Background color |
| `--ui-input-text` | Text color |
| `--ui-input-border` | Border color |
| `--ui-input-placeholder` | Placeholder color |
| `--ui-input-border-focus` | Border on focus |
| `--ui-input-border-error` | Border on error |
| `--ui-input-text-error` | Error text color |
| `--ui-input-bg-disabled` | Background when disabled |
| `--ui-input-text-disabled` | Text when disabled |
| `--ui-input-border-disabled` | Border when disabled |

## Form Participation

`<lui-textarea>` participates in native HTML forms via `ElementInternals`:

```html
<form @submit="${handleSubmit}">
  <lui-textarea name="message" label="Message" required minlength="10"></lui-textarea>
  <lui-button type="submit">Send</lui-button>
</form>
```

## Examples

```html
<!-- Basic with label -->
<lui-textarea label="Description" placeholder="Enter description" rows="4"></lui-textarea>

<!-- Auto-resize -->
<lui-textarea label="Bio" autoresize max-rows="10" placeholder="Tell us about yourself"></lui-textarea>

<!-- Character counter -->
<lui-textarea label="Comment" maxlength="500" show-count></lui-textarea>

<!-- No resize -->
<lui-textarea label="Fixed" resize="none" rows="5"></lui-textarea>

<!-- With validation -->
<lui-textarea label="Feedback" required minlength="20" helper-text="At least 20 characters"></lui-textarea>

<!-- Sizes -->
<lui-textarea size="sm" placeholder="Small"></lui-textarea>
<lui-textarea size="md" placeholder="Medium"></lui-textarea>
<lui-textarea size="lg" placeholder="Large"></lui-textarea>
```

## Accessibility

- Uses native `<textarea>` element for semantic HTML
- Label associated via `for`/`id` attributes
- `aria-describedby` links to helper text and error messages
- `aria-invalid` set on validation error
- `aria-required` reflects required state
- Smooth height transitions respect `prefers-reduced-motion`

## Peer Dependencies

- `lit` ^3.0.0
- `@lit-ui/core` ^1.0.0

## License

MIT
