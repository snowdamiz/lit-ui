---
name: lit-ui-popover
description: >-
  How to use <lui-popover> — props, slots, events, CSS tokens, CSS parts, examples.
---

# Popover

## Usage

```html
<!-- Basic popover -->
<lui-popover>
  <lui-button>Open Popover</lui-button>
  <div slot="content">
    <p>This is the popover content.</p>
  </div>
</lui-popover>
```

```html
<!-- With arrow indicator -->
<lui-popover arrow placement="bottom">
  <lui-button>With Arrow</lui-button>
  <div slot="content">Popover with arrow pointing at trigger.</div>
</lui-popover>
```

```html
<!-- Modal popover (traps focus) -->
<lui-popover modal>
  <lui-button>Modal Popover</lui-button>
  <div slot="content">Focus is trapped inside this popover.</div>
</lui-popover>
```

```html
<!-- Match trigger width (useful for dropdowns) -->
<lui-popover match-trigger-width placement="bottom-start">
  <lui-button>Dropdown</lui-button>
  <div slot="content">
    <p>Same width as trigger</p>
  </div>
</lui-popover>
```

```js
// Controlled mode (React)
const [open, setOpen] = useState(false);
// ...
<lui-popover open={open} onOpen-changed={(e) => setOpen(e.detail.open)}>
  <lui-button>Toggle</lui-button>
  <div slot="content">Controlled popover</div>
</lui-popover>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placement | `Placement` | `"bottom"` | Preferred placement relative to trigger (Floating UI). Supports all 12 Floating UI positions. |
| open | `boolean` | `false` | Whether the popover is visible. Setting this enables controlled mode. |
| arrow | `boolean` | `false` | Whether to show an arrow indicator pointing at the trigger. |
| modal | `boolean` | `false` | Enable modal mode with focus trapping inside the popover (uses sentinel elements). |
| offset | `number` | `8` | Offset distance in pixels from the trigger. |
| match-trigger-width | `boolean` | `false` | Make the popover the same width as the trigger element. |
| disabled | `boolean` | `false` | Disable popover interaction. |

## Slots

| Slot | Description |
|------|-------------|
| (default) | The trigger element (receives aria-haspopup and aria-expanded). |
| content | The popover body content (role="dialog"). |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `open-changed` | `{ open: boolean }` | Fired when open state changes (fired in controlled mode). |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-popover-bg` | — | Background color of the popover. |
| `--ui-popover-text` | — | Text color of the popover. |
| `--ui-popover-border` | — | Border color of the popover. |
| `--ui-popover-radius` | `0.5rem` | Border radius of the popover. |
| `--ui-popover-padding` | `1rem` | Inner padding of the popover. |
| `--ui-popover-shadow` | — | Box shadow of the popover. |
| `--ui-popover-arrow-size` | `8px` | Size of the arrow indicator. |
| `--ui-popover-max-width` | `20rem` | Maximum width of the popover. |
| `--ui-popover-z-index` | `50` | Z-index of the popover panel. |

## CSS Parts

| Part | Description |
|------|-------------|
| `trigger` | The trigger wrapper (has aria-haspopup="dialog", aria-expanded). |
| `popover` | The popover panel container (role="dialog"). |
| `content` | The popover content area. |
| `arrow` | The arrow indicator pointing at the trigger. |
