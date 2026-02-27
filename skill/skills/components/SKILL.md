---
name: lit-ui-components
description: >-
  API reference for all lit-ui components (lui-* tags). Use for component properties,
  attributes, events, slots, CSS parts, and CSS custom properties. Covers all 19 components:
  button, input, textarea, select, checkbox, radio, switch, calendar, date-picker,
  date-range-picker, time-picker, dialog, accordion, tabs, tooltip, popover, toast, data-table.
---

# lit-ui Components

## Component Tag Reference

| Component | Tag Name(s) | npm Package |
|-----------|-------------|-------------|
| Button | `<lui-button>` | `@lit-ui/button` |
| Checkbox | `<lui-checkbox>`, `<lui-checkbox-group>` | `@lit-ui/checkbox` |
| Radio | `<lui-radio>`, `<lui-radio-group>` | `@lit-ui/radio` |
| Switch | `<lui-switch>` | `@lit-ui/switch` |
| Input | `<lui-input>` | `@lit-ui/input` |
| Textarea | `<lui-textarea>` | `@lit-ui/textarea` |
| Select | `<lui-select>`, `<lui-option>`, `<lui-option-group>` | `@lit-ui/select` |
| Calendar | `<lui-calendar>` | `@lit-ui/calendar` |
| Date Picker | `<lui-date-picker>` | `@lit-ui/date-picker` |
| Date Range Picker | `<lui-date-range-picker>` | `@lit-ui/date-range-picker` |
| Time Picker | `<lui-time-picker>` | `@lit-ui/time-picker` |
| Dialog | `<lui-dialog>` | `@lit-ui/dialog` |
| Accordion | `<lui-accordion>`, `<lui-accordion-item>` | `@lit-ui/accordion` |
| Tabs | `<lui-tabs>`, `<lui-tab-panel>` | `@lit-ui/tabs` |
| Tooltip | `<lui-tooltip>` | `@lit-ui/tooltip` |
| Popover | `<lui-popover>` | `@lit-ui/popover` |
| Toast | `<lui-toaster>` + `toast()` API | `@lit-ui/toast` |
| Data Table | `<lui-data-table>` | `@lit-ui/data-table` |

## Common Properties

Rules:
1. All components support `size="sm" | "md" | "lg"` (default: `"md"`).
2. All interactive components support `disabled` (boolean attribute).
3. All form components support `name` and `value` for form participation.
4. Properties with complex types (objects, arrays) must be set via JS reference, not HTML attributes.

```html
<lui-button size="sm" disabled>Can't click</lui-button>
<lui-input name="email" value="user@example.com"></lui-input>
```

## Event Naming Convention

Rules:
1. All custom events use the `ui-` prefix.
2. Common events: `ui-change` (value changed), `ui-input` (live input), `ui-open` (overlay opened), `ui-close` (overlay closed), `ui-submit` (form submit).
3. Events bubble and are composed (cross Shadow DOM boundary).
4. Event detail is always an object: `event.detail.value` for value changes.

```javascript
document.querySelector('lui-input').addEventListener('ui-change', (e) => {
  console.log(e.detail.value); // the new value
});
```

## Slot Patterns

Rules:
1. Default slot: main content (label text, body content).
2. Named slots use kebab-case: `icon-start`, `icon-end`, `header`, `footer`, `trigger`.
3. Check component-specific skills for exact slot names.

```html
<lui-button>
  <svg slot="icon-start" width="16" height="16">...</svg>
  Download
</lui-button>

<lui-dialog>
  <span slot="header">Confirm Action</span>
  <p>Are you sure?</p>
  <div slot="footer">
    <lui-button variant="outline">Cancel</lui-button>
    <lui-button variant="destructive">Delete</lui-button>
  </div>
</lui-dialog>
```

## CSS Parts

Rules:
1. All components expose `part="base"` on their root element for external styling.
2. Additional parts are component-specific (e.g., `button`, `input`, `trigger`, `panel`).
3. Target parts with `::part()` selector from outside Shadow DOM.

```css
lui-button::part(base) { font-weight: 700; }
lui-input::part(base) { border-radius: 0; }
```

## Form Components

Rules:
1. All form components use `ElementInternals` for native HTML form participation.
2. Form components: `<lui-input>`, `<lui-textarea>`, `<lui-select>`, `<lui-checkbox>`, `<lui-radio-group>`, `<lui-switch>`, `<lui-date-picker>`, `<lui-date-range-picker>`, `<lui-time-picker>`, `<lui-button>`.
3. Use `name` attribute for form field identification; `value` for initial value.
4. Supports `required`, `disabled` for validation and state.

```html
<form id="my-form">
  <lui-input name="email" type="email" required></lui-input>
  <lui-select name="role" required>
    <lui-option value="admin">Admin</lui-option>
    <lui-option value="user">User</lui-option>
  </lui-select>
  <lui-checkbox name="agree" required>I agree to terms</lui-checkbox>
  <lui-button type="submit">Submit</lui-button>
</form>
```

## Component-Specific API Notes

### Button (`<lui-button>`)

- `variant`: `primary | secondary | outline | ghost | destructive` (default: `primary`)
- `type`: `button | submit | reset` (default: `button`)
- `loading`: boolean — shows spinner, prevents interaction
- Parts: `button`, `icon-start`, `icon-end`, `content`

### Input (`<lui-input>`)

- `type`: any HTML input type (`text`, `email`, `password`, `number`, etc.)
- `placeholder`, `readonly`, `maxlength`, `min`, `max`, `step`
- Events: `ui-input` (live), `ui-change` (committed)
- Parts: `base`, `input`, `label`, `helper`

### Select (`<lui-select>`)

- `multiple`: boolean — enables multi-select with tags
- `searchable`: boolean — adds search input to dropdown
- `clearable`: boolean — shows clear button
- `placeholder`: string — shown when no value selected
- Children: `<lui-option value="x">Label</lui-option>`, `<lui-option-group label="Group">`

### Dialog (`<lui-dialog>`)

- `open`: boolean (reflects) — controls visibility
- `dismissible`: boolean — allows Escape/backdrop close (default: true)
- `show-close-button`: boolean — renders X button
- Methods: `show()`, `hide()`
- Events: `ui-open`, `ui-close`
- Parts: `base`, `backdrop`, `panel`, `header`, `body`, `footer`

### Data Table (`<lui-data-table>`)

- `columns`: array property (must be set via JS) — column definitions
- `data`: array property (must be set via JS) — row data
- `selectable`: boolean — enables row checkboxes
- `sortable`: boolean — enables column sorting
- `paginated`: boolean — enables pagination
- Events: `ui-sort`, `ui-page-change`, `ui-selection-change`

### Toast (`<lui-toaster>` + `toast()`)

- Place `<lui-toaster>` once at root level
- Import and call `toast({ title, description, variant })` to trigger toasts
- `variant`: `default | success | error | warning`

```javascript
import { toast } from '@lit-ui/toast';
toast({ title: 'Saved', description: 'Your changes were saved.', variant: 'success' });
```

## Per-Component Deep Skills

Each component has a dedicated skill file with the full property table, all events, all CSS tokens, and complete examples:

| Component | Skill File |
|-----------|------------|
| Button | `skill/skills/button/SKILL.md` |
| Input | `skill/skills/input/SKILL.md` |
| Textarea | `skill/skills/textarea/SKILL.md` |
| Select | `skill/skills/select/SKILL.md` |
| Checkbox | `skill/skills/checkbox/SKILL.md` |
| Radio | `skill/skills/radio/SKILL.md` |
| Switch | `skill/skills/switch/SKILL.md` |
| Calendar | `skill/skills/calendar/SKILL.md` |
| Date Picker | `skill/skills/date-picker/SKILL.md` |
| Date Range Picker | `skill/skills/date-range-picker/SKILL.md` |
| Time Picker | `skill/skills/time-picker/SKILL.md` |
| Dialog | `skill/skills/dialog/SKILL.md` |
| Accordion | `skill/skills/accordion/SKILL.md` |
| Tabs | `skill/skills/tabs/SKILL.md` |
| Tooltip | `skill/skills/tooltip/SKILL.md` |
| Popover | `skill/skills/popover/SKILL.md` |
| Toast | `skill/skills/toast/SKILL.md` |
| Data Table | `skill/skills/data-table/SKILL.md` |
