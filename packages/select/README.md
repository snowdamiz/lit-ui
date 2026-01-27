# @lit-ui/select

Accessible select/dropdown component built with Lit and Tailwind CSS. Supports single-select, multi-select with tags, combobox/autocomplete with search, async data loading, virtual scrolling, and native form participation.

## Installation

```bash
npm install @lit-ui/select @lit-ui/core lit
```

## Quick Start

```html
<script type="module">
  import '@lit-ui/select';
</script>

<lui-select placeholder="Choose a fruit">
  <lui-option value="apple">Apple</lui-option>
  <lui-option value="banana">Banana</lui-option>
  <lui-option value="cherry">Cherry</lui-option>
</lui-select>
```

## Tag Names

- `<lui-select>` — Main dropdown component
- `<lui-option>` — Individual option item
- `<lui-option-group>` — Option group with label

## Select Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger size |
| `placeholder` | `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `name` | `name` | `string` | `''` | Form field name |
| `value` | `value` | `string \| string[]` | `''` | Selected value(s) |
| `disabled` | `disabled` | `boolean` | `false` | Disables the select |
| `required` | `required` | `boolean` | `false` | Marks as required |
| `clearable` | `clearable` | `boolean` | `false` | Show clear button |
| `multiple` | `multiple` | `boolean` | `false` | Enable multi-select mode |
| `maxSelections` | `max-selections` | `number \| undefined` | — | Max selections in multi-select |
| `searchable` | `searchable` | `boolean \| undefined` | — | Enable combobox/search filtering |
| `filterFunction` | — | `FilterFunction \| undefined` | — | Custom filter function (property only) |
| `asyncSearch` | — | `AsyncSearchFunction \| undefined` | — | Async search function (property only) |

## Select Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getOptions()` | `LuiOption[]` | Get all option elements |
| `getSelectedOptions()` | `LuiOption[]` | Get currently selected option(s) |

## Select Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string \| string[] }` | Fired when selection changes |

## Option Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `value` | `value` | `string` | `''` | Option value |
| `label` | `label` | `string` | `''` | Display label (or use slot content) |
| `disabled` | `disabled` | `boolean` | `false` | Disables the option |

## Option Slots

| Slot | Description |
|------|-------------|
| (default) | Custom label content |
| `start` | Icon before label |
| `end` | Icon after label |
| `description` | Description text below label |

## Option Group Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `label` | `label` | `string` | `''` | Group header text |

## CSS Custom Properties

### Trigger

| Property | Description |
|----------|-------------|
| `--ui-select-radius` | Border radius |
| `--ui-select-border-width` | Border width |
| `--ui-select-transition` | Transition timing |
| `--ui-select-font-size-sm/md/lg` | Font size per size |
| `--ui-select-padding-x-sm/md/lg` | Horizontal padding per size |
| `--ui-select-padding-y-sm/md/lg` | Vertical padding per size |
| `--ui-select-bg` | Trigger background |
| `--ui-select-text` | Trigger text color |
| `--ui-select-border` | Trigger border color |
| `--ui-select-placeholder` | Placeholder color |
| `--ui-select-border-focus` | Border on focus |
| `--ui-select-ring` | Focus ring color |
| `--ui-select-border-error` | Border on error |
| `--ui-select-text-error` | Error text color |
| `--ui-select-bg-disabled` | Background when disabled |
| `--ui-select-text-disabled` | Text when disabled |
| `--ui-select-border-disabled` | Border when disabled |

### Dropdown

| Property | Description |
|----------|-------------|
| `--ui-select-dropdown-bg` | Dropdown background |
| `--ui-select-dropdown-border` | Dropdown border color |
| `--ui-select-dropdown-shadow` | Dropdown box shadow |
| `--ui-select-dropdown-max-height` | Dropdown max height |
| `--ui-select-z-index` | Dropdown z-index |

### Options

| Property | Description |
|----------|-------------|
| `--ui-select-option-height` | Option row height |
| `--ui-select-option-bg` | Option background |
| `--ui-select-option-bg-hover` | Option hover background |
| `--ui-select-option-bg-active` | Active/selected background |
| `--ui-select-option-text` | Option text color |
| `--ui-select-option-text-disabled` | Disabled option text color |
| `--ui-select-option-check` | Check mark color |

### Multi-Select Tags

| Property | Description |
|----------|-------------|
| `--ui-select-tag-bg` | Tag background |
| `--ui-select-tag-text` | Tag text color |
| `--ui-select-tag-gap` | Gap between tags |
| `--ui-select-tag-padding-x` | Tag horizontal padding |
| `--ui-select-tag-padding-y` | Tag vertical padding |

### Checkboxes (multi-select)

| Property | Description |
|----------|-------------|
| `--ui-select-checkbox-border` | Checkbox border |
| `--ui-select-checkbox-bg-checked` | Checked checkbox background |
| `--ui-select-checkbox-check` | Check mark color |

### Combobox Search

| Property | Description |
|----------|-------------|
| `--ui-select-highlight-weight` | Match highlight font weight |
| `--ui-select-highlight-text` | Match highlight text color |

## Form Participation

`<lui-select>` participates in native HTML forms via `ElementInternals`:

```html
<form @submit="${handleSubmit}">
  <lui-select name="country" required>
    <lui-option value="us">United States</lui-option>
    <lui-option value="uk">United Kingdom</lui-option>
  </lui-select>
  <lui-button type="submit">Submit</lui-button>
</form>
```

Multi-select uses `FormData.append()` for each value. Retrieve with `formData.getAll('name')`.

## Examples

### Single Select

```html
<lui-select placeholder="Pick a color">
  <lui-option value="red">Red</lui-option>
  <lui-option value="green">Green</lui-option>
  <lui-option value="blue">Blue</lui-option>
</lui-select>
```

### Multi-Select

```html
<lui-select multiple placeholder="Select languages">
  <lui-option value="js">JavaScript</lui-option>
  <lui-option value="ts">TypeScript</lui-option>
  <lui-option value="py">Python</lui-option>
  <lui-option value="rs">Rust</lui-option>
</lui-select>
```

### Grouped Options

```html
<lui-select>
  <lui-option-group label="Fruits">
    <lui-option value="apple">Apple</lui-option>
    <lui-option value="banana">Banana</lui-option>
  </lui-option-group>
  <lui-option-group label="Vegetables">
    <lui-option value="carrot">Carrot</lui-option>
    <lui-option value="lettuce">Lettuce</lui-option>
  </lui-option-group>
</lui-select>
```

### With Descriptions

```html
<lui-select>
  <lui-option value="py">
    Python
    <span slot="description">Popular for data science</span>
  </lui-option>
  <lui-option value="rs">
    Rust
    <span slot="description">Memory safe systems language</span>
  </lui-option>
</lui-select>
```

### Searchable Combobox

```html
<lui-select searchable placeholder="Search countries...">
  <lui-option value="us">United States</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
  <lui-option value="ca">Canada</lui-option>
  <!-- Many more options... -->
</lui-select>
```

### Async Search

```typescript
const select = document.querySelector('lui-select');
select.asyncSearch = async (query, { signal }) => {
  const res = await fetch(`/api/users?q=${query}`, { signal });
  const data = await res.json();
  return data.map(u => ({ value: u.id, label: u.name }));
};
```

```html
<lui-select searchable placeholder="Search users..."></lui-select>
```

### Clearable with Max Selections

```html
<lui-select multiple clearable max-selections="3" placeholder="Pick up to 3">
  <lui-option value="a">Alpha</lui-option>
  <lui-option value="b">Beta</lui-option>
  <lui-option value="c">Gamma</lui-option>
  <lui-option value="d">Delta</lui-option>
</lui-select>
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Arrow Down` | Open dropdown / move to next option |
| `Arrow Up` | Move to previous option |
| `Enter` | Select focused option |
| `Escape` | Close dropdown |
| `Home` | Move to first option |
| `End` | Move to last option |
| `Type character` | Type-ahead search (jumps to matching option) |
| `Backspace` | Remove last tag (multi-select) |

## Accessibility

- ARIA 1.2 combobox pattern (`role="combobox"` on trigger, `role="listbox"` on dropdown)
- `aria-activedescendant` for focus management (DOM focus stays on trigger)
- `aria-expanded` indicates dropdown state
- `aria-controls` links trigger to listbox
- `aria-selected` on options
- `aria-disabled` on disabled options
- `aria-setsize` / `aria-posinset` for virtual scrolling
- Live region announcements for selection changes
- Full keyboard navigation per W3C APG combobox pattern

## Dependencies

- `@floating-ui/dom` ^1.7.4 — Dropdown positioning with collision detection
- `@lit/task` ^1.0.3 — Async data loading state management
- `@tanstack/lit-virtual` ^3.13.2 — Virtual scrolling for large option lists

## Peer Dependencies

- `lit` ^3.0.0
- `@lit-ui/core` ^1.0.0

## License

MIT
