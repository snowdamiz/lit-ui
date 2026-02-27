---
name: lit-ui-dialog
description: >-
  How to use <lui-dialog> — props, slots, events, CSS tokens, examples.
---

# Dialog

## Usage

```html
<!-- HTML: controlled via ID reference -->
<lui-button onclick="document.getElementById('my-dialog').open = true">Open Dialog</lui-button>

<lui-dialog id="my-dialog" show-close-button>
  <span slot="title">Dialog Title</span>
  <p>This is the dialog content.</p>
</lui-dialog>
```

```html
<!-- Confirm dialog with footer actions -->
<lui-dialog id="confirm-dialog">
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to proceed? This action cannot be undone.</p>
  <div slot="footer">
    <lui-button variant="outline" onclick="this.closest('lui-dialog').open = false">Cancel</lui-button>
    <lui-button variant="destructive" onclick="handleConfirm()">Confirm</lui-button>
  </div>
</lui-dialog>
```

```js
// React: controlled with state
const [open, setOpen] = useState(false);
// ...
<lui-button onClick={() => setOpen(true)}>Open Dialog</lui-button>
<lui-dialog open={open} show-close-button onClose={() => setOpen(false)}>
  <span slot="title">Dialog Title</span>
  <p>This is the dialog content.</p>
</lui-dialog>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | `boolean` | `false` | Whether the dialog is visible. Uses showModal() for focus trapping. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | The max-width of the dialog (24rem, 28rem, or 32rem). |
| dismissible | `boolean` | `true` | Whether the dialog can be closed via Escape or backdrop click. |
| show-close-button | `boolean` | `false` | Shows an X button in the top-right corner. |
| dialog-class | `string` | `""` | Additional Tailwind classes to customize the dialog content container. |

## Slots

| Slot | Description |
|------|-------------|
| title | Dialog title/header content. |
| (default) | Dialog body content. |
| footer | Dialog footer, typically action buttons. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `close` | `{ reason: "escape" \| "backdrop" \| "programmatic" }` | Fired when the dialog closes. Detail includes the close reason. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--lui-dialog-radius` | `var(--radius-lg)` | Border radius of the dialog content. |
| `--lui-dialog-shadow` | `var(--shadow-lg)` | Box shadow of the dialog content. |
| `--lui-dialog-padding` | `var(--spacing-6)` | Inner padding of the dialog content. |

## CSS Parts

| Part | Description |
|------|-------------|
| `dialog` | The native dialog element. |
| `content` | The content container with background and padding. |
| `close-button` | The optional close button in the top-right corner. |
| `header` | The header/title section. |
| `body` | The main body content area. |
| `footer` | The footer section for action buttons. |
