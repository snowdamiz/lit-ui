# @lit-ui/button

Accessible button component built with Lit and Tailwind CSS. Supports variants, sizes, loading states, icon slots, and native HTML form participation.

## Installation

```bash
npm install @lit-ui/button @lit-ui/core lit
```

## Quick Start

```html
<script type="module">
  import '@lit-ui/button';
</script>

<lui-button variant="primary">Click me</lui-button>
<lui-button variant="destructive">Delete</lui-button>
<lui-button variant="outline" size="sm">Small</lui-button>
```

## Tag Name

`<lui-button>`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `variant` | `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'primary'` | Visual style variant |
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `type` | `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `disabled` | `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `loading` | `boolean` | `false` | Shows loading spinner, disables interaction |
| `customClass` | `btn-class` | `string` | `''` | Additional CSS classes |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Button text content |
| `icon-start` | Icon before text (scales with font size) |
| `icon-end` | Icon after text (scales with font size) |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | The native `<button>` element |
| `icon-start` | Start icon slot container |
| `icon-end` | End icon slot container |
| `content` | Text content slot container |

## CSS Custom Properties

### Layout & Shape

| Property | Description |
|----------|-------------|
| `--ui-button-radius` | Border radius |
| `--ui-button-shadow` | Box shadow |
| `--ui-button-font-weight` | Font weight |

### Variant Colors

| Property | Description |
|----------|-------------|
| `--ui-button-primary-bg` | Primary background |
| `--ui-button-primary-text` | Primary text color |
| `--ui-button-primary-hover-opacity` | Primary hover opacity |
| `--ui-button-secondary-bg` | Secondary background |
| `--ui-button-secondary-text` | Secondary text color |
| `--ui-button-secondary-hover-bg` | Secondary hover background |
| `--ui-button-outline-bg` | Outline background |
| `--ui-button-outline-text` | Outline text color |
| `--ui-button-outline-border` | Outline border color |
| `--ui-button-outline-hover-bg` | Outline hover background |
| `--ui-button-border-width` | Border width for outline variant |
| `--ui-button-ghost-bg` | Ghost background |
| `--ui-button-ghost-text` | Ghost text color |
| `--ui-button-ghost-hover-bg` | Ghost hover background |
| `--ui-button-destructive-bg` | Destructive background |
| `--ui-button-destructive-text` | Destructive text color |
| `--ui-button-destructive-hover-opacity` | Destructive hover opacity |

### Size Tokens

| Property | Description |
|----------|-------------|
| `--ui-button-padding-x-sm` | Horizontal padding (small) |
| `--ui-button-padding-y-sm` | Vertical padding (small) |
| `--ui-button-font-size-sm` | Font size (small) |
| `--ui-button-gap-sm` | Gap between icon and text (small) |
| `--ui-button-padding-x-md` | Horizontal padding (medium) |
| `--ui-button-padding-y-md` | Vertical padding (medium) |
| `--ui-button-font-size-md` | Font size (medium) |
| `--ui-button-gap-md` | Gap between icon and text (medium) |
| `--ui-button-padding-x-lg` | Horizontal padding (large) |
| `--ui-button-padding-y-lg` | Vertical padding (large) |
| `--ui-button-font-size-lg` | Font size (large) |
| `--ui-button-gap-lg` | Gap between icon and text (large) |

## Form Participation

`<lui-button>` participates in native HTML forms via `ElementInternals`:

```html
<form @submit="${handleSubmit}">
  <lui-input name="email" type="email" required></lui-input>
  <lui-button type="submit">Submit</lui-button>
  <lui-button type="reset" variant="outline">Reset</lui-button>
</form>
```

- `type="submit"` submits the parent form
- `type="reset"` resets the parent form
- Form participation is client-side only (SSR-guarded)

## Examples

```html
<!-- Variants -->
<lui-button variant="primary">Primary</lui-button>
<lui-button variant="secondary">Secondary</lui-button>
<lui-button variant="outline">Outline</lui-button>
<lui-button variant="ghost">Ghost</lui-button>
<lui-button variant="destructive">Destructive</lui-button>

<!-- Sizes -->
<lui-button size="sm">Small</lui-button>
<lui-button size="md">Medium</lui-button>
<lui-button size="lg">Large</lui-button>

<!-- Loading state -->
<lui-button loading>Saving...</lui-button>

<!-- With icons -->
<lui-button variant="outline">
  <svg slot="icon-start" width="16" height="16" viewBox="0 0 16 16">...</svg>
  Download
</lui-button>

<!-- Disabled -->
<lui-button disabled>Can't click</lui-button>
```

## Accessibility

- Uses native `<button>` element for semantic HTML
- `aria-disabled` reflects disabled state
- `aria-busy="true"` during loading state
- Focus ring with visible outline on keyboard focus
- Respects `prefers-reduced-motion` for animations

## Peer Dependencies

- `lit` ^3.0.0
- `@lit-ui/core` ^1.0.0

## License

MIT
