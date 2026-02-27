---
name: lit-ui-toast
description: >-
  How to use the toast() imperative API and <lui-toaster> — API methods, CSS tokens, examples.
---

# Toast

Toast uses an **imperative API** — import and call `toast()` functions directly. No declarative element needed for the toast itself.

## Usage

```js
import { toast } from '@lit-ui/toast';

// Basic
toast('File saved successfully');
toast.success('Profile updated!');
toast.error('Something went wrong');
toast.warning('Low disk space');
toast.info('3 items selected');

// With options
toast.success('Email sent', {
  description: 'Your message was delivered.',
  duration: 5000,
  dismissible: true,
  action: { label: 'Undo', onClick: () => undoSend() },
});

// Promise toast
toast.promise(fetchData(), {
  loading: 'Loading data...',
  success: 'Data loaded!',
  error: 'Failed to load data',
});

// Dismiss
const id = toast('Uploading...');
toast.dismiss(id);
toast.dismissAll();
```

## `lui-toaster` element

The toaster element is **auto-created** if not present. Optionally add it manually for configuration:

```html
<lui-toaster position="top-center" max-visible="5"></lui-toaster>
```

## `toast()` API

| Function | Description |
|----------|-------------|
| `toast(message, opts?)` | Show a default toast. |
| `toast.success(message, opts?)` | Show a success toast. |
| `toast.error(message, opts?)` | Show an error toast. |
| `toast.warning(message, opts?)` | Show a warning toast. |
| `toast.info(message, opts?)` | Show an info toast. |
| `toast.promise(promise, messages, opts?)` | Show a loading toast that transitions to success/error. |
| `toast.dismiss(id)` | Dismiss a specific toast by ID. |
| `toast.dismissAll()` | Dismiss all toasts. |

## `ToastOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| description | `string` | — | Additional descriptive text below the main message. |
| duration | `number` | `5000` | Auto-dismiss delay in milliseconds. |
| dismissible | `boolean` | `true` | Whether the user can manually dismiss the toast. |
| action | `{ label: string, onClick: () => void }` | — | Action button in the toast. |
| position | (position override) | — | Override position for this individual toast. |

## `lui-toaster` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| position | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"bottom-right"` | Position of the toast stack on screen. |
| max-visible | `number` | `3` | Maximum number of toasts visible simultaneously. |
| gap | `number` | `12` | Gap in pixels between stacked toasts. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-toast-bg` | — | Base toast background. |
| `--ui-toast-text` | — | Toast text color. |
| `--ui-toast-border` | — | Toast border color. |
| `--ui-toast-radius` | — | Toast border radius. |
| `--ui-toast-shadow` | — | Toast box shadow. |
| `--ui-toast-max-width` | — | Maximum toast width. |
| `--ui-toast-gap` | — | Gap between toasts. |
| `--ui-toast-z-index` | — | Toast stack z-index. |
| `--ui-toast-success-bg` | — | Success variant background. |
| `--ui-toast-success-border` | — | Success variant border. |
| `--ui-toast-success-icon` | — | Success icon color. |
| `--ui-toast-error-bg` | — | Error variant background. |
| `--ui-toast-error-border` | — | Error variant border. |
| `--ui-toast-error-icon` | — | Error icon color. |
| `--ui-toast-warning-bg` | — | Warning variant background. |
| `--ui-toast-warning-border` | — | Warning variant border. |
| `--ui-toast-warning-icon` | — | Warning icon color. |
| `--ui-toast-info-bg` | — | Info variant background. |
| `--ui-toast-info-border` | — | Info variant border. |
| `--ui-toast-info-icon` | — | Info icon color. |

## CSS Parts — `lui-toaster`

| Part | Description |
|------|-------------|
| `container` | The toaster container element. |

## Accessibility

- Success and info toasts use `role="status"` + `aria-live="polite"`.
- Error toasts use `role="alert"` + `aria-live="assertive"`.
- Timer pauses on hover/focus.
- Respects `prefers-reduced-motion`.
- Close button has `aria-label="Close notification"`.
