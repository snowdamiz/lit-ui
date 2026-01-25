# @lit-ui/dialog

Accessible dialog/modal component built with Lit and Tailwind CSS.

## Installation

```bash
npm install @lit-ui/dialog @lit-ui/core
```

## Quick Start

```html
<script type="module">
  import '@lit-ui/dialog';
</script>

<lui-dialog id="my-dialog">
  <span slot="title">Dialog Title</span>
  <p>Dialog content goes here.</p>
  <div slot="footer">
    <lui-button variant="outline" onclick="document.getElementById('my-dialog').close()">
      Cancel
    </lui-button>
    <lui-button variant="primary">Confirm</lui-button>
  </div>
</lui-dialog>

<lui-button onclick="document.getElementById('my-dialog').showModal()">
  Open Dialog
</lui-button>
```

## Features

- **Focus Trap**: Automatic focus management within dialog
- **Keyboard Navigation**: Escape to close, Tab cycling
- **ARIA Support**: Proper accessibility attributes
- **Animations**: Smooth open/close transitions
- **Nested Dialogs**: Support for dialog stacking
- **SSR Compatible**: Works with server-side rendering

## Documentation

Full documentation: [https://lit-ui.dev/components/dialog](https://lit-ui.dev/components/dialog)

## License

MIT
