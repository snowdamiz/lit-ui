# @lit-ui/dialog

Accessible dialog/modal component built with Lit and Tailwind CSS. Uses the native HTML `<dialog>` element for built-in focus trapping, top layer positioning, and Escape key handling.

## Installation

```bash
npm install @lit-ui/dialog @lit-ui/core lit
```

## Quick Start

```html
<script type="module">
  import '@lit-ui/dialog';
  import '@lit-ui/button';
</script>

<lui-button onclick="document.getElementById('my-dialog').show()">
  Open Dialog
</lui-button>

<lui-dialog id="my-dialog">
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to proceed?</p>
  <div slot="footer">
    <lui-button variant="outline" onclick="document.getElementById('my-dialog').close()">
      Cancel
    </lui-button>
    <lui-button variant="primary">Confirm</lui-button>
  </div>
</lui-dialog>
```

## Tag Name

`<lui-dialog>`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `open` | `open` | `boolean` | `false` | Show/hide dialog (reflects to attribute) |
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dialog max-width |
| `dismissible` | `dismissible` | `boolean` | `true` | Allow Escape key and backdrop click to close |
| `showCloseButton` | `show-close-button` | `boolean` | `false` | Show X close button in header |
| `customClass` | `dialog-class` | `string` | `''` | Additional CSS classes |

## Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `show()` | — | Opens the dialog, stores current focus for restoration |
| `close(reason?)` | `reason?: 'escape' \| 'backdrop' \| 'programmatic'` | Closes the dialog with optional reason |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `close` | `{ reason: 'escape' \| 'backdrop' \| 'programmatic' }` | Fired when dialog closes |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Dialog body content |
| `title` | Header/title section |
| `footer` | Footer with action buttons |

## CSS Parts

| Part | Description |
|------|-------------|
| `dialog` | The native `<dialog>` element |
| `content` | Main content container |
| `header` | Title section |
| `body` | Body content area |
| `footer` | Footer action area |
| `close-button` | Close button (when `showCloseButton` is true) |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--ui-dialog-backdrop` | Backdrop overlay color |
| `--ui-dialog-radius` | Border radius |
| `--ui-dialog-shadow` | Box shadow |
| `--ui-dialog-padding` | Content padding |
| `--ui-dialog-bg` | Background color |
| `--ui-dialog-text` | Text color |
| `--ui-dialog-max-width-sm` | Max width for size="sm" |
| `--ui-dialog-max-width-md` | Max width for size="md" |
| `--ui-dialog-max-width-lg` | Max width for size="lg" |
| `--ui-dialog-title-size` | Title font size |
| `--ui-dialog-title-weight` | Title font weight |
| `--ui-dialog-header-margin` | Header bottom margin |
| `--ui-dialog-body-color` | Body text color |
| `--ui-dialog-footer-margin` | Footer top margin |
| `--ui-dialog-footer-gap` | Gap between footer buttons |

## Examples

```html
<!-- Basic dialog -->
<lui-dialog id="basic">
  <span slot="title">Title</span>
  <p>Content goes here.</p>
</lui-dialog>

<!-- With close button -->
<lui-dialog show-close-button>
  <span slot="title">Settings</span>
  <p>Configure your preferences.</p>
</lui-dialog>

<!-- Non-dismissible (no backdrop/escape close) -->
<lui-dialog dismissible="false">
  <span slot="title">Terms of Service</span>
  <p>You must accept to continue.</p>
  <div slot="footer">
    <lui-button variant="primary">Accept</lui-button>
  </div>
</lui-dialog>

<!-- Large dialog -->
<lui-dialog size="lg">
  <span slot="title">Large Content</span>
  <p>Lots of content here...</p>
</lui-dialog>

<!-- Listening for close -->
<lui-dialog id="d" @close="${(e) => console.log(e.detail.reason)}">
  <span slot="title">Track Close</span>
  <p>Close me and check the console.</p>
</lui-dialog>
```

## Accessibility

- Uses native `<dialog>` element with `showModal()` for automatic focus trapping
- Browser handles top layer positioning (always on top)
- Escape key closes when `dismissible` is true
- Focus restores to the triggering element on close
- `aria-labelledby` linked to title slot
- `aria-describedby` linked to body content
- Supports nested dialogs (dialog stacking)
- Smooth open/close animations with `@starting-style`
- Respects `prefers-reduced-motion`

## Peer Dependencies

- `lit` ^3.0.0
- `@lit-ui/core` ^1.0.0

## License

MIT
