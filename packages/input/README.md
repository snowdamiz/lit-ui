# @lit-ui/input

Accessible input component built with Lit and Tailwind CSS. Supports text, email, password, number, and search types with validation, character counter, password toggle, and native form participation.

## Installation

```bash
npm install @lit-ui/input @lit-ui/core lit
```

## Quick Start

```html
<script type="module">
  import '@lit-ui/input';
</script>

<lui-input
  type="email"
  name="email"
  label="Email Address"
  placeholder="you@example.com"
  required
></lui-input>
```

## Tag Name

`<lui-input>`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `type` | `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'search'` | `'text'` | Input type |
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `name` | `name` | `string` | `''` | Form field name |
| `value` | `value` | `string` | `''` | Input value |
| `placeholder` | `placeholder` | `string` | `''` | Placeholder text |
| `label` | `label` | `string` | `''` | Label text |
| `helperText` | `helper-text` | `string` | `''` | Helper text below input |
| `disabled` | `disabled` | `boolean` | `false` | Disables the input |
| `readonly` | `readonly` | `boolean` | `false` | Makes input read-only |
| `required` | `required` | `boolean` | `false` | Marks as required |
| `minlength` | `minlength` | `number \| undefined` | — | Minimum character length |
| `maxlength` | `maxlength` | `number \| undefined` | — | Maximum character length |
| `pattern` | `pattern` | `string` | `''` | Regex validation pattern |
| `min` | `min` | `number \| undefined` | — | Minimum value (number type) |
| `max` | `max` | `number \| undefined` | — | Maximum value (number type) |
| `clearable` | `clearable` | `boolean` | `false` | Show clear button |
| `showCount` | `show-count` | `boolean` | `false` | Show character counter |
| `requiredIndicator` | `required-indicator` | `'asterisk' \| 'text'` | `'asterisk'` | Required indicator style |

## Slots

| Slot | Description |
|------|-------------|
| `prefix` | Content before input (icon, currency symbol) |
| `suffix` | Content after input (unit label, icon) |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | Outer container |
| `label` | Label element |
| `helper` | Helper text |
| `container` | Input container (border, background) |
| `input` | Native `<input>` element |
| `prefix` | Prefix slot container |
| `suffix` | Suffix slot container |
| `error` | Error message |
| `counter` | Character counter |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--ui-input-radius` | Border radius |
| `--ui-input-border-width` | Border width |
| `--ui-input-transition` | Transition timing |
| `--ui-input-font-size-sm` | Font size (small) |
| `--ui-input-font-size-md` | Font size (medium) |
| `--ui-input-font-size-lg` | Font size (large) |
| `--ui-input-padding-x-sm` | Horizontal padding (small) |
| `--ui-input-padding-y-sm` | Vertical padding (small) |
| `--ui-input-padding-x-md` | Horizontal padding (medium) |
| `--ui-input-padding-y-md` | Vertical padding (medium) |
| `--ui-input-padding-x-lg` | Horizontal padding (large) |
| `--ui-input-padding-y-lg` | Vertical padding (large) |
| `--ui-input-bg` | Background color |
| `--ui-input-text` | Text color |
| `--ui-input-border` | Border color |
| `--ui-input-placeholder` | Placeholder color |
| `--ui-input-border-focus` | Border color on focus |
| `--ui-input-ring` | Focus ring color |
| `--ui-input-border-error` | Border color on error |
| `--ui-input-text-error` | Error text color |
| `--ui-input-bg-disabled` | Background when disabled |
| `--ui-input-text-disabled` | Text color when disabled |
| `--ui-input-border-disabled` | Border when disabled |
| `--ui-input-bg-readonly` | Background when readonly |

## Form Participation

`<lui-input>` participates in native HTML forms via `ElementInternals`:

```html
<form @submit="${handleSubmit}">
  <lui-input name="username" label="Username" required minlength="3"></lui-input>
  <lui-input name="email" type="email" label="Email" required></lui-input>
  <lui-button type="submit">Submit</lui-button>
</form>
```

- Submits value with the form's `FormData`
- Mirrors HTML5 validation (required, minlength, maxlength, pattern, min, max)
- Shows validation errors on blur
- Supports form reset

## Examples

```html
<!-- Text with label and helper -->
<lui-input
  label="Username"
  helper-text="3-20 characters"
  minlength="3"
  maxlength="20"
  show-count
  required
></lui-input>

<!-- Email validation -->
<lui-input type="email" label="Email" placeholder="you@example.com" required></lui-input>

<!-- Password with toggle -->
<lui-input type="password" label="Password" required></lui-input>

<!-- Number with range -->
<lui-input type="number" label="Age" min="0" max="120"></lui-input>

<!-- Search with clear button -->
<lui-input type="search" placeholder="Search..." clearable></lui-input>

<!-- With prefix/suffix slots -->
<lui-input label="Price">
  <span slot="prefix">$</span>
  <span slot="suffix">USD</span>
</lui-input>

<!-- Sizes -->
<lui-input size="sm" placeholder="Small"></lui-input>
<lui-input size="md" placeholder="Medium"></lui-input>
<lui-input size="lg" placeholder="Large"></lui-input>

<!-- Disabled and readonly -->
<lui-input label="Disabled" disabled value="Can't edit"></lui-input>
<lui-input label="Read Only" readonly value="Read only"></lui-input>
```

## Accessibility

- Uses native `<input>` element for semantic HTML
- Label associated via `for`/`id` attributes
- `aria-describedby` links to helper text and error messages
- `aria-invalid` set on validation error
- `aria-required` reflects required state
- Error messages announced to screen readers
- Password toggle button with `aria-label`
- Focus ring visible on keyboard navigation

## Peer Dependencies

- `lit` ^3.0.0
- `@lit-ui/core` ^1.0.0

## License

MIT
