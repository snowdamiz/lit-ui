---
name: lit-ui-button
description: >-
  How to use <lui-button> — props, slots, events, CSS tokens, examples.
---

# Button

## Usage

```html
<lui-button variant="primary">Primary</lui-button>
<lui-button variant="secondary">Secondary</lui-button>
<lui-button variant="outline">Outline</lui-button>
<lui-button variant="ghost">Ghost</lui-button>
<lui-button variant="destructive">Destructive</lui-button>
```

```html
<lui-button loading>Loading...</lui-button>
<lui-button variant="secondary" loading>Saving</lui-button>
```

```html
<lui-button>
  <svg slot="icon-start" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  Add Item
</lui-button>
<lui-button variant="outline">
  Settings
  <svg slot="icon-end" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
</lui-button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `"primary" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | `"primary"` | The visual style of the button. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | The size affecting padding and font size. |
| type | `"button" \| "submit" \| "reset"` | `"button"` | The button type for form behavior. |
| disabled | `boolean` | `false` | Whether the button is disabled. Uses aria-disabled for accessibility. |
| loading | `boolean` | `false` | Shows a pulsing dots spinner and prevents interaction. |
| btn-class | `string` | `""` | Additional Tailwind classes to customize the button. Appended to default classes. |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Button text content. |
| icon-start | Icon placed before the text. Scales with button font-size. |
| icon-end | Icon placed after the text. Scales with button font-size. |

## Events

No custom events. Use standard DOM events (e.g. `click`).

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--lui-button-radius` | `var(--radius-md)` | Border radius of the button. |
| `--lui-button-shadow` | `none` | Box shadow of the button. |
| `--lui-button-font-weight` | `500` | Font weight of the button text. |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | The inner button element. |
| `icon-start` | The icon-start slot wrapper. |
| `content` | The default slot wrapper for button text. |
| `icon-end` | The icon-end slot wrapper. |
