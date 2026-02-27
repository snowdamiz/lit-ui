---
name: lit-ui-select
description: >-
  How to use <lui-select>, <lui-option>, <lui-option-group> — props, slots, events, CSS tokens, examples.
---

# Select

## Usage

```html
<lui-select label="Country" placeholder="Select a country">
  <lui-option value="us">United States</lui-option>
  <lui-option value="ca">Canada</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
  <lui-option value="au">Australia</lui-option>
</lui-select>
```

```html
<!-- Option groups -->
<lui-select label="Notification Preference" placeholder="Choose notification type">
  <lui-option-group label="Immediate">
    <lui-option value="push">Push notification</lui-option>
    <lui-option value="sms">SMS</lui-option>
  </lui-option-group>
  <lui-option-group label="Delayed">
    <lui-option value="email">Email</lui-option>
    <lui-option value="digest">Daily digest</lui-option>
  </lui-option-group>
</lui-select>
```

```html
<!-- Multi-select -->
<lui-select label="Skills" multiple placeholder="Select skills">
  <lui-option value="js">JavaScript</lui-option>
  <lui-option value="ts">TypeScript</lui-option>
  <lui-option value="py">Python</lui-option>
</lui-select>
```

```html
<!-- Searchable -->
<lui-select label="Country" searchable placeholder="Search countries...">
  <lui-option value="us">United States</lui-option>
  <lui-option value="ca">Canada</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
</lui-select>
```

```html
<!-- Custom option content -->
<lui-select label="Contact Method" placeholder="Select contact method">
  <lui-option value="email">
    <svg slot="start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6L12 13 2 6"/>
    </svg>
    Email
    <span slot="description">Receive updates via email</span>
  </lui-option>
</lui-select>
```

## Props — `lui-select`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size variant affecting padding and font size. |
| name | `string` | `""` | Form submission name. |
| value | `string \| string[]` | `""` | Current selected value. Returns string[] in multi-select mode. |
| placeholder | `string` | `"Select an option"` | Placeholder text displayed when no option is selected. |
| label | `string` | `""` | Label text above the select. |
| options | `SelectOption[] \| Promise<SelectOption[]>` | `[]` | Array of options or Promise that resolves to options. Shows loading skeleton when Promise is pending. |
| required | `boolean` | `false` | Whether the select is required for form submission. |
| disabled | `boolean` | `false` | Whether the select is disabled. |
| clearable | `boolean` | `false` | Show clear button when a value is selected. |
| multiple | `boolean` | `false` | Enable multi-select mode. Selected items display as tags. |
| maxSelections | `number` | `undefined` | Maximum number of selections allowed in multi-select mode. |
| showSelectAll | `boolean` | `false` | Show "Select all" / "Clear all" button in multi-select dropdown. |
| searchable | `boolean` | `false` | Transform trigger into text input for filtering options. |
| creatable | `boolean` | `false` | Allow creating new options when searchable and no match exists. |
| noResultsMessage | `string` | `"No results found"` | Message shown when filter produces no matches. |
| customFilter | `(option, query) => boolean` | `undefined` | Custom filter function to override default contains matching. |
| debounceDelay | `number` | `300` | Debounce delay in milliseconds for async search. |
| minSearchLength | `number` | `0` | Minimum characters before triggering async search. |
| asyncSearch | `(query: string, signal: AbortSignal) => Promise<SelectOption[]>` | `undefined` | Async function called when user types. Receives query and AbortSignal for cancellation. |
| loadMore | `() => Promise<SelectOption[]>` | `undefined` | Callback for infinite scroll pagination. Called when scrolling near bottom. |

## Props — `lui-option`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | `""` | The value submitted when this option is selected. |
| label | `string` | `""` | Display label (falls back to text content, then value). |
| disabled | `boolean` | `false` | Whether this option is disabled. |

## Props — `lui-option-group`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | `""` | Label text displayed as the group header. |

## Slots — `lui-select`

| Slot | Description |
|------|-------------|
| default | Options (`lui-option` or `lui-option-group` elements). |

## Slots — `lui-option`

| Slot | Description |
|------|-------------|
| default | Option label text. |
| start | Content before the label (e.g., icon). |
| end | Content after the label. |
| description | Descriptive text below the label. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string \| string[] }` | Fired when the selected value changes. |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--ui-select-radius` | `var(--radius-md)` | Border radius of the select trigger. |
| `--ui-select-border` | `var(--color-border)` | Border color. |
| `--ui-select-border-focus` | `var(--color-ring)` | Border color on focus. |
| `--ui-select-bg` | `var(--color-background)` | Background color. |
| `--ui-select-text` | `var(--color-foreground)` | Text color. |
| `--ui-select-placeholder` | `var(--color-muted-foreground)` | Placeholder text color. |
| `--ui-select-dropdown-shadow` | `var(--shadow-md)` | Dropdown shadow. |
