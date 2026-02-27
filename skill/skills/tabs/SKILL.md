---
name: lit-ui-tabs
description: >-
  How to use <lui-tabs> and <lui-tab-panel> — props, slots, events, CSS tokens, examples.
---

# Tabs

## Usage

```html
<lui-tabs default-value="tab-1" label="Example tabs">
  <lui-tab-panel value="tab-1" label="Account">
    Manage your account settings and preferences.
  </lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Security">
    Update your password and two-factor authentication.
  </lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Notifications">
    Configure email and push notification preferences.
  </lui-tab-panel>
</lui-tabs>
```

```html
<!-- Vertical orientation -->
<lui-tabs orientation="vertical" default-value="general" label="Settings">
  <lui-tab-panel value="general" label="General">General application settings.</lui-tab-panel>
  <lui-tab-panel value="appearance" label="Appearance">Theme and display preferences.</lui-tab-panel>
  <lui-tab-panel value="privacy" label="Privacy">Privacy and data sharing options.</lui-tab-panel>
</lui-tabs>
```

```html
<!-- Manual activation (arrow keys move focus, Enter/Space activates) -->
<lui-tabs activation-mode="manual" default-value="tab-1" label="Manual tabs">
  <lui-tab-panel value="tab-1" label="Overview">Arrow keys move focus. Press Enter or Space to activate.</lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Details">Useful when tab switching has side effects.</lui-tab-panel>
</lui-tabs>
```

```html
<!-- Disabled tab -->
<lui-tabs default-value="tab-1" label="Tabs with disabled">
  <lui-tab-panel value="tab-1" label="Active">Active tab content.</lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Disabled" disabled>Cannot be selected.</lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Available">Another functional tab.</lui-tab-panel>
</lui-tabs>
```

```html
<!-- Lazy loading -->
<lui-tabs default-value="tab-1" label="Lazy tabs">
  <lui-tab-panel value="tab-1" label="Eager">Renders immediately.</lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Lazy" lazy>Not rendered until first click.</lui-tab-panel>
</lui-tabs>
```

## Props — `lui-tabs`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | Active tab value (controlled mode). |
| default-value | `string` | `""` | Initial active tab for uncontrolled mode. |
| disabled | `boolean` | `false` | Disable all tabs. |
| label | `string` | `""` | Accessible label for the tablist element. |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Orientation for keyboard navigation and layout. |
| activation-mode | `"automatic" \| "manual"` | `"automatic"` | Tab activation mode. Automatic activates on focus; manual requires Enter/Space. |

## Props — `lui-tab-panel`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | Unique identifier for this panel. |
| label | `string` | `""` | Text label displayed in the tab button. |
| disabled | `boolean` | `false` | Whether this tab is disabled. |
| active | `boolean` | `false` | Whether this panel is active (set by parent). |
| lazy | `boolean` | `false` | Defer content rendering until first activation. |

## Slots — `lui-tabs`

| Slot | Description |
|------|-------------|
| (default) | Child `lui-tab-panel` elements. |

## Slots — `lui-tab-panel`

| Slot | Description |
|------|-------------|
| (default) | Panel content. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `ui-change` | `{ value: string }` | Fired on `lui-tabs` when the active tab changes. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-tabs-border` | `var(--color-border)` | Border color. |
| `--ui-tabs-list-bg` | `var(--color-muted)` | Tab list background. |
| `--ui-tabs-list-padding` | `0.25rem` | Tab list padding. |
| `--ui-tabs-list-radius` | `0.375rem` | Tab list border radius. |
| `--ui-tabs-list-gap` | `0.25rem` | Gap between tab buttons. |
| `--ui-tabs-tab-padding` | `0.5rem 1rem` | Tab button padding. |
| `--ui-tabs-tab-radius` | `0.25rem` | Tab button border radius. |
| `--ui-tabs-tab-font-size` | `0.875rem` | Tab font size. |
| `--ui-tabs-tab-font-weight` | `500` | Tab font weight. |
| `--ui-tabs-tab-text` | `var(--color-muted-foreground)` | Inactive tab text color. |
| `--ui-tabs-tab-bg` | `transparent` | Inactive tab background. |
| `--ui-tabs-tab-hover-text` | `var(--color-foreground)` | Hover tab text color. |
| `--ui-tabs-tab-hover-bg` | `transparent` | Hover tab background. |
| `--ui-tabs-tab-active-text` | `var(--color-foreground)` | Active tab text color. |
| `--ui-tabs-tab-active-bg` | `var(--color-background)` | Active tab background. |
| `--ui-tabs-tab-active-shadow` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Active tab box shadow. |
| `--ui-tabs-panel-padding` | `1rem 0` | Panel content padding. |
| `--ui-tabs-panel-text` | `var(--color-foreground)` | Panel text color. |
| `--ui-tabs-ring` | `var(--color-ring)` | Focus ring color. |
| `--ui-tabs-transition` | `150ms` | Transition duration. |
| `--ui-tabs-indicator-color` | `var(--color-primary)` | Sliding indicator color. |
| `--ui-tabs-indicator-height` | `2px` | Sliding indicator height. |
| `--ui-tabs-indicator-radius` | `9999px` | Sliding indicator border radius. |
| `--ui-tabs-indicator-transition` | `200ms` | Sliding indicator transition duration. |
| `--ui-tabs-scroll-button-size` | `2rem` | Scroll button size for overflow navigation. |
