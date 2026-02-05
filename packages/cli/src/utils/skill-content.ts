/**
 * Agent Skills content for lit-ui components.
 * Each skill follows the agentskills.io specification:
 * - YAML frontmatter with name + description
 * - Markdown body with instructions
 *
 * Skills are injected into AI platform directories during `lit-ui init` and `lit-ui add`.
 */

// =============================================================================
// OVERVIEW SKILL (injected during init)
// =============================================================================

export const LIT_UI_OVERVIEW_SKILL = `---
name: lit-ui
description: >-
  lit-ui is a framework-agnostic web component library built on Lit.js with Tailwind CSS.
  Use this skill when working with lit-ui components, the lit-ui CLI, or building UIs
  with <lui-*> custom elements. Covers installation, theming, SSR, and component API patterns.
---

# lit-ui Component Library

A framework-agnostic component library built on Lit.js. Components are standard web components
that work natively in React, Vue, Svelte, or plain HTML.

## Available Components

| Component | Tag Name(s) | Import |
|-----------|-------------|--------|
| Button | \`<lui-button>\` | \`@lit-ui/button\` |
| Checkbox | \`<lui-checkbox>\`, \`<lui-checkbox-group>\` | \`@lit-ui/checkbox\` |
| Radio | \`<lui-radio>\`, \`<lui-radio-group>\` | \`@lit-ui/radio\` |
| Switch | \`<lui-switch>\` | \`@lit-ui/switch\` |
| Input | \`<lui-input>\` | \`@lit-ui/input\` |
| Textarea | \`<lui-textarea>\` | \`@lit-ui/textarea\` |
| Select | \`<lui-select>\`, \`<lui-option>\`, \`<lui-option-group>\` | \`@lit-ui/select\` |
| Calendar | \`<lui-calendar>\` | \`@lit-ui/calendar\` |
| Date Picker | \`<lui-date-picker>\` | \`@lit-ui/date-picker\` |
| Date Range Picker | \`<lui-date-range-picker>\` | \`@lit-ui/date-range-picker\` |
| Time Picker | \`<lui-time-picker>\` | \`@lit-ui/time-picker\` |
| Dialog | \`<lui-dialog>\` | \`@lit-ui/dialog\` |
| Accordion | \`<lui-accordion>\`, \`<lui-accordion-item>\` | \`@lit-ui/accordion\` |
| Tabs | \`<lui-tabs>\`, \`<lui-tab-panel>\` | \`@lit-ui/tabs\` |
| Tooltip | \`<lui-tooltip>\` | \`@lit-ui/tooltip\` |
| Popover | \`<lui-popover>\` | \`@lit-ui/popover\` |
| Toast | \`<lui-toaster>\` + \`toast()\` API | \`@lit-ui/toast\` |
| Data Table | \`<lui-data-table>\` | \`@lit-ui/data-table\` |

## Installation

\`\`\`bash
# Initialize project
npx lit-ui init

# Add components
npx lit-ui add button
npx lit-ui add checkbox
npx lit-ui add radio
npx lit-ui add switch
npx lit-ui add input
npx lit-ui add textarea
npx lit-ui add select
npx lit-ui add calendar
npx lit-ui add date-picker
npx lit-ui add date-range-picker
npx lit-ui add time-picker
npx lit-ui add dialog
npx lit-ui add accordion
npx lit-ui add tabs
npx lit-ui add tooltip
npx lit-ui add popover
npx lit-ui add toast
npx lit-ui add data-table
\`\`\`

Two distribution modes:
- **copy-source** (default): Component source copied to your project. Full ownership.
- **npm**: Install \`@lit-ui/<component>\` packages. Auto updates via npm.

## Core Patterns

### Base Class

All components extend \`TailwindElement\` from \`@lit-ui/core\`, which handles:
- Tailwind CSS in Shadow DOM via constructable stylesheets
- SSR dual-mode styling (inline for server, constructable for client)
- Design token injection

### Form Participation

All form components (\`<lui-input>\`, \`<lui-textarea>\`, \`<lui-select>\`, \`<lui-checkbox>\`,
\`<lui-switch>\`, \`<lui-radio-group>\`, \`<lui-date-picker>\`, \`<lui-date-range-picker>\`,
\`<lui-time-picker>\`, \`<lui-button>\`) use \`ElementInternals\` for native HTML form participation:

\`\`\`html
<form>
  <lui-input name="email" type="email" required></lui-input>
  <lui-textarea name="message" required></lui-textarea>
  <lui-select name="category" required>
    <lui-option value="bug">Bug Report</lui-option>
    <lui-option value="feature">Feature Request</lui-option>
  </lui-select>
  <lui-button type="submit">Submit</lui-button>
</form>
\`\`\`

### Theming

Components are themed via CSS custom properties (\`--ui-<component>-*\`).
Each component has its own token namespace:

- Button: \`--ui-button-*\` (radius, shadow, variant colors, size padding)
- Checkbox: \`--ui-checkbox-*\` (size, border, colors, check mark)
- Radio: \`--ui-radio-*\` (size, border, colors, dot)
- Switch: \`--ui-switch-*\` (track, thumb, sizes)
- Input: \`--ui-input-*\` (radius, border, colors, sizing)
- Textarea: shares \`--ui-input-*\` tokens
- Select: \`--ui-select-*\` (trigger, dropdown, options, tags, checkbox)
- Calendar: \`--ui-calendar-*\` (cell sizes, selection, today indicator)
- Date Picker: \`--ui-date-picker-*\` (input, popup, presets)
- Date Range Picker: \`--ui-date-range-*\` (inputs, popup, range highlight)
- Time Picker: \`--ui-time-picker-*\` (input, dropdown, clock face)
- Dialog: \`--ui-dialog-*\` (backdrop, radius, shadow, sizing)
- Accordion: \`--ui-accordion-*\` (border, header, panel, chevron, transition)
- Tabs: \`--ui-tabs-*\` (border, indicator, tab colors, sizes)
- Tooltip: \`--ui-tooltip-*\` (bg, text, arrow, radius, delay)
- Popover: \`--ui-popover-*\` (bg, border, shadow, arrow, radius)
- Toast: \`--ui-toast-*\` (bg, text, border, shadow, variant colors)
- Data Table: \`--ui-table-*\` (header, rows, border, selection, pagination)

Global semantic colors: \`--color-primary\`, \`--color-secondary\`, \`--color-destructive\`,
\`--color-muted\`, \`--color-accent\`, \`--color-background\`, \`--color-foreground\`,
\`--color-border\`, \`--color-ring\`.

### Dark Mode

Add \`.dark\` class to \`<html>\` or \`<body>\`. Components use \`:host-context(.dark)\` for Shadow DOM.

### SSR

All components are SSR-compatible. Guard client-only APIs:

\`\`\`typescript
import { isServer } from '@lit-ui/core';
if (!isServer) {
  // Client-only code
}
\`\`\`

For SSR rendering:

\`\`\`typescript
import { renderToString, html } from '@lit-ui/ssr';
const markup = await renderToString(html\`<lui-button>Click</lui-button>\`);
\`\`\`

Hydration must be the first import on client:

\`\`\`typescript
import '@lit-ui/ssr/hydration'; // MUST be first
import '@lit-ui/button';
\`\`\`

### Sizes

All components support \`size="sm" | "md" | "lg"\` (default: \`"md"\`).

### Accessibility

- Semantic HTML elements (button, dialog, input, textarea)
- Full ARIA support (labels, descriptions, states)
- Keyboard navigation
- Focus management and restoration
- Screen reader announcements
- \`prefers-reduced-motion\` respected
`;

// =============================================================================
// COMPONENT-SPECIFIC SKILLS (injected during add)
// =============================================================================

export const COMPONENT_SKILLS: Record<string, string> = {
  button: `---
name: lit-ui-button
description: >-
  API reference for the lit-ui Button component (<lui-button>). Use when creating buttons,
  form submit/reset buttons, or when working with button variants, sizes, loading states,
  or icon slots.
---

# lit-ui Button (\`<lui-button>\`)

## Import

\`\`\`typescript
import '@lit-ui/button';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`variant\` | \`variant\` | \`'primary' \\| 'secondary' \\| 'outline' \\| 'ghost' \\| 'destructive'\` | \`'primary'\` | Visual style |
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Button size |
| \`type\` | \`type\` | \`'button' \\| 'submit' \\| 'reset'\` | \`'button'\` | HTML button type |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disables interaction |
| \`loading\` | \`loading\` | \`boolean\` | \`false\` | Shows loading spinner |
| \`customClass\` | \`btn-class\` | \`string\` | \`''\` | Additional CSS classes |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Button text |
| \`icon-start\` | Icon before text |
| \`icon-end\` | Icon after text |

## CSS Parts

\`button\`, \`icon-start\`, \`icon-end\`, \`content\`

## CSS Custom Properties

**Layout:** \`--ui-button-radius\`, \`--ui-button-shadow\`, \`--ui-button-font-weight\`

**Primary:** \`--ui-button-primary-bg\`, \`--ui-button-primary-text\`, \`--ui-button-primary-hover-opacity\`

**Secondary:** \`--ui-button-secondary-bg\`, \`--ui-button-secondary-text\`, \`--ui-button-secondary-hover-bg\`

**Outline:** \`--ui-button-outline-bg\`, \`--ui-button-outline-text\`, \`--ui-button-outline-border\`, \`--ui-button-outline-hover-bg\`, \`--ui-button-border-width\`

**Ghost:** \`--ui-button-ghost-bg\`, \`--ui-button-ghost-text\`, \`--ui-button-ghost-hover-bg\`

**Destructive:** \`--ui-button-destructive-bg\`, \`--ui-button-destructive-text\`, \`--ui-button-destructive-hover-opacity\`

**Sizing:** \`--ui-button-padding-x-{sm,md,lg}\`, \`--ui-button-padding-y-{sm,md,lg}\`, \`--ui-button-font-size-{sm,md,lg}\`, \`--ui-button-gap-{sm,md,lg}\`

## Examples

\`\`\`html
<lui-button variant="primary">Save</lui-button>
<lui-button variant="destructive" size="sm">Delete</lui-button>
<lui-button loading>Saving...</lui-button>
<lui-button type="submit">Submit Form</lui-button>
<lui-button variant="outline">
  <svg slot="icon-start" width="16" height="16">...</svg>
  Download
</lui-button>
\`\`\`

## Form Participation

Uses \`ElementInternals\`. \`type="submit"\` submits the parent form. \`type="reset"\` resets it.

## Accessibility

Native \`<button>\` element. \`aria-disabled\`, \`aria-busy\` for loading. Focus ring on keyboard navigation.

## See Also

For cross-cutting concepts that apply to all lit-ui components, see the [lit-ui overview skill](../lit-ui/SKILL.md):

- **Theming** — CSS custom properties, global semantic colors, component token namespaces
- **Dark Mode** — \`.dark\` class on \`<html>\`/\`<body>\`, \`:host-context(.dark)\` in Shadow DOM
- **SSR** — \`isServer\` guard, \`renderToString()\`, hydration import order
- **Form Participation** — \`ElementInternals\` pattern used across all form components
- **CLI** — \`npx lit-ui init\`, \`npx lit-ui add\`, distribution modes
`,

  dialog: `---
name: lit-ui-dialog
description: >-
  API reference for the lit-ui Dialog component (<lui-dialog>). Use when creating modals,
  confirmation dialogs, or overlay content. Handles focus trapping, keyboard navigation,
  backdrop clicks, and ARIA.
---

# lit-ui Dialog (\`<lui-dialog>\`)

## Import

\`\`\`typescript
import '@lit-ui/dialog';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`open\` | \`open\` | \`boolean\` | \`false\` | Show/hide (reflects) |
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Max width |
| \`dismissible\` | \`dismissible\` | \`boolean\` | \`true\` | Allow Escape/backdrop close |
| \`showCloseButton\` | \`show-close-button\` | \`boolean\` | \`false\` | Show X button |
| \`customClass\` | \`dialog-class\` | \`string\` | \`''\` | Additional CSS classes |

## Methods

- \`show()\` — Opens dialog, stores focus for restoration
- \`close(reason?)\` — Closes with reason: \`'escape' | 'backdrop' | 'programmatic'\`

## Events

- \`close\` — Detail: \`{ reason: 'escape' | 'backdrop' | 'programmatic' }\`

## Slots

| Slot | Description |
|------|-------------|
| (default) | Body content |
| \`title\` | Header title |
| \`footer\` | Footer actions |

## CSS Parts

\`dialog\`, \`content\`, \`header\`, \`body\`, \`footer\`, \`close-button\`

## CSS Custom Properties

\`--ui-dialog-backdrop\`, \`--ui-dialog-radius\`, \`--ui-dialog-shadow\`, \`--ui-dialog-padding\`,
\`--ui-dialog-bg\`, \`--ui-dialog-text\`, \`--ui-dialog-max-width-{sm,md,lg}\`,
\`--ui-dialog-title-size\`, \`--ui-dialog-title-weight\`, \`--ui-dialog-header-margin\`,
\`--ui-dialog-body-color\`, \`--ui-dialog-footer-margin\`, \`--ui-dialog-footer-gap\`

## Examples

\`\`\`html
<lui-dialog id="confirm">
  <span slot="title">Confirm</span>
  <p>Are you sure?</p>
  <div slot="footer">
    <lui-button variant="outline" onclick="this.closest('lui-dialog').close()">Cancel</lui-button>
    <lui-button variant="primary">Confirm</lui-button>
  </div>
</lui-dialog>

<!-- Open programmatically -->
<script>document.getElementById('confirm').show();</script>
\`\`\`

## Accessibility

Native \`<dialog>\` with \`showModal()\`. Auto focus trapping, Escape to close, focus restoration.
\`aria-labelledby\` links to title, \`aria-describedby\` links to body. Supports nested dialogs.

## See Also

For cross-cutting concepts that apply to all lit-ui components, see the [lit-ui overview skill](../lit-ui/SKILL.md):

- **Theming** — CSS custom properties, global semantic colors, component token namespaces
- **Dark Mode** — \`.dark\` class on \`<html>\`/\`<body>\`, \`:host-context(.dark)\` in Shadow DOM
- **SSR** — \`isServer\` guard, \`renderToString()\`, hydration import order
- **CLI** — \`npx lit-ui init\`, \`npx lit-ui add\`, distribution modes
`,

  input: `---
name: lit-ui-input
description: >-
  API reference for the lit-ui Input component (<lui-input>). Use when creating text fields,
  email inputs, password fields, number inputs, or search boxes. Supports validation,
  character counter, clearable, prefix/suffix slots, and form participation.
---

# lit-ui Input (\`<lui-input>\`)

## Import

\`\`\`typescript
import '@lit-ui/input';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`type\` | \`type\` | \`'text' \\| 'email' \\| 'password' \\| 'number' \\| 'search'\` | \`'text'\` | Input type |
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`value\` | \`value\` | \`string\` | \`''\` | Current value |
| \`placeholder\` | \`placeholder\` | \`string\` | \`''\` | Placeholder text |
| \`label\` | \`label\` | \`string\` | \`''\` | Label text |
| \`helperText\` | \`helper-text\` | \`string\` | \`''\` | Helper text |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`readonly\` | \`readonly\` | \`boolean\` | \`false\` | Read-only |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`minlength\` | \`minlength\` | \`number\` | — | Min characters |
| \`maxlength\` | \`maxlength\` | \`number\` | — | Max characters |
| \`pattern\` | \`pattern\` | \`string\` | \`''\` | Regex pattern |
| \`min\` | \`min\` | \`number\` | — | Min value (number) |
| \`max\` | \`max\` | \`number\` | — | Max value (number) |
| \`clearable\` | \`clearable\` | \`boolean\` | \`false\` | Show clear button |
| \`showCount\` | \`show-count\` | \`boolean\` | \`false\` | Character counter |
| \`requiredIndicator\` | \`required-indicator\` | \`'asterisk' \\| 'text'\` | \`'asterisk'\` | Required style |

## Slots

| Slot | Description |
|------|-------------|
| \`prefix\` | Before input (icon, currency) |
| \`suffix\` | After input (unit, icon) |

## CSS Parts

\`wrapper\`, \`label\`, \`helper\`, \`container\`, \`input\`, \`prefix\`, \`suffix\`, \`error\`, \`counter\`

## CSS Custom Properties

\`--ui-input-radius\`, \`--ui-input-border-width\`, \`--ui-input-transition\`,
\`--ui-input-font-size-{sm,md,lg}\`, \`--ui-input-padding-x-{sm,md,lg}\`,
\`--ui-input-padding-y-{sm,md,lg}\`, \`--ui-input-bg\`, \`--ui-input-text\`,
\`--ui-input-border\`, \`--ui-input-placeholder\`, \`--ui-input-border-focus\`,
\`--ui-input-ring\`, \`--ui-input-border-error\`, \`--ui-input-text-error\`,
\`--ui-input-bg-disabled\`, \`--ui-input-text-disabled\`, \`--ui-input-border-disabled\`,
\`--ui-input-bg-readonly\`

## Examples

\`\`\`html
<lui-input type="email" name="email" label="Email" placeholder="you@example.com" required></lui-input>
<lui-input type="password" name="password" label="Password" required></lui-input>
<lui-input label="Username" minlength="3" maxlength="20" show-count clearable></lui-input>
<lui-input type="number" label="Age" min="0" max="120"></lui-input>
<lui-input type="search" placeholder="Search..." clearable></lui-input>
<lui-input label="Price">
  <span slot="prefix">$</span>
  <span slot="suffix">USD</span>
</lui-input>
\`\`\`

## Form Participation

Uses \`ElementInternals\`. Mirrors HTML5 validation. Shows errors on blur.

## See Also

For cross-cutting concepts that apply to all lit-ui components, see the [lit-ui overview skill](../lit-ui/SKILL.md):

- **Theming** — CSS custom properties, global semantic colors, component token namespaces
- **Dark Mode** — \`.dark\` class on \`<html>\`/\`<body>\`, \`:host-context(.dark)\` in Shadow DOM
- **SSR** — \`isServer\` guard, \`renderToString()\`, hydration import order
- **Form Participation** — \`ElementInternals\` pattern used across all form components
- **CLI** — \`npx lit-ui init\`, \`npx lit-ui add\`, distribution modes
`,

  textarea: `---
name: lit-ui-textarea
description: >-
  API reference for the lit-ui Textarea component (<lui-textarea>). Use when creating
  multi-line text areas with auto-resize, character counter, and form participation.
---

# lit-ui Textarea (\`<lui-textarea>\`)

## Import

\`\`\`typescript
import '@lit-ui/textarea';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`value\` | \`value\` | \`string\` | \`''\` | Current value |
| \`placeholder\` | \`placeholder\` | \`string\` | \`''\` | Placeholder |
| \`label\` | \`label\` | \`string\` | \`''\` | Label text |
| \`helperText\` | \`helper-text\` | \`string\` | \`''\` | Helper text |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`readonly\` | \`readonly\` | \`boolean\` | \`false\` | Read-only |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`rows\` | \`rows\` | \`number\` | \`3\` | Initial rows |
| \`resize\` | \`resize\` | \`'none' \\| 'vertical' \\| 'horizontal' \\| 'both'\` | \`'vertical'\` | Resize behavior |
| \`autoresize\` | \`autoresize\` | \`boolean\` | \`false\` | Auto-expand to fit |
| \`maxRows\` | \`max-rows\` | \`number\` | — | Max rows (autoresize) |
| \`maxHeight\` | \`max-height\` | \`string\` | — | Max height CSS value |
| \`minlength\` | \`minlength\` | \`number\` | — | Min characters |
| \`maxlength\` | \`maxlength\` | \`number\` | — | Max characters |
| \`showCount\` | \`show-count\` | \`boolean\` | \`false\` | Character counter |
| \`requiredIndicator\` | \`required-indicator\` | \`'asterisk' \\| 'text'\` | \`'asterisk'\` | Required style |

## CSS Parts

\`wrapper\`, \`label\`, \`helper\`, \`textarea\`, \`error\`, \`counter\`

## CSS Custom Properties

Shares \`--ui-input-*\` tokens with \`<lui-input>\`:
\`--ui-input-radius\`, \`--ui-input-border-width\`, \`--ui-input-bg\`, \`--ui-input-text\`,
\`--ui-input-border\`, \`--ui-input-placeholder\`, \`--ui-input-border-focus\`,
\`--ui-input-border-error\`, \`--ui-input-text-error\`, \`--ui-input-bg-disabled\`,
\`--ui-input-text-disabled\`

## Examples

\`\`\`html
<lui-textarea label="Comments" placeholder="Your feedback" rows="4"></lui-textarea>
<lui-textarea label="Bio" autoresize max-rows="10"></lui-textarea>
<lui-textarea label="Message" maxlength="500" show-count required></lui-textarea>
<lui-textarea label="Notes" resize="none" rows="6"></lui-textarea>
\`\`\`

## Form Participation

Uses \`ElementInternals\`. Mirrors HTML5 validation (required, minlength, maxlength).

## See Also

For cross-cutting concepts that apply to all lit-ui components, see the [lit-ui overview skill](../lit-ui/SKILL.md):

- **Theming** — CSS custom properties, global semantic colors, component token namespaces
- **Dark Mode** — \`.dark\` class on \`<html>\`/\`<body>\`, \`:host-context(.dark)\` in Shadow DOM
- **SSR** — \`isServer\` guard, \`renderToString()\`, hydration import order
- **Form Participation** — \`ElementInternals\` pattern used across all form components
- **CLI** — \`npx lit-ui init\`, \`npx lit-ui add\`, distribution modes
`,

  select: `---
name: lit-ui-select
description: >-
  API reference for the lit-ui Select component (<lui-select>, <lui-option>, <lui-option-group>).
  Use when creating dropdowns, multi-select pickers, searchable comboboxes, or async-loaded
  option lists. Supports virtual scrolling for large datasets.
---

# lit-ui Select (\`<lui-select>\`)

## Import

\`\`\`typescript
import '@lit-ui/select';
\`\`\`

## Select Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size |
| \`placeholder\` | \`placeholder\` | \`string\` | \`'Select an option'\` | Placeholder |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`value\` | \`value\` | \`string \\| string[]\` | \`''\` | Selected value(s) |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`clearable\` | \`clearable\` | \`boolean\` | \`false\` | Show clear button |
| \`multiple\` | \`multiple\` | \`boolean\` | \`false\` | Multi-select mode |
| \`maxSelections\` | \`max-selections\` | \`number\` | — | Max selections |
| \`searchable\` | \`searchable\` | \`boolean\` | — | Enable search/filter |
| \`filterFunction\` | — | \`FilterFunction\` | — | Custom filter (property) |
| \`asyncSearch\` | — | \`AsyncSearchFunction\` | — | Async search (property) |

## Select Methods

- \`getOptions()\` — Returns all \`<lui-option>\` elements
- \`getSelectedOptions()\` — Returns selected \`<lui-option>\` element(s)

## Select Events

- \`change\` — Detail: \`{ value: string | string[] }\`

## Option Properties

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`value\` | \`value\` | \`string\` | \`''\` |
| \`label\` | \`label\` | \`string\` | \`''\` |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` |

## Option Slots

\`(default)\` — Label content, \`start\` — Icon before, \`end\` — Icon after, \`description\` — Description text

## Option Group Properties

| Property | Attribute | Type |
|----------|-----------|------|
| \`label\` | \`label\` | \`string\` |

## CSS Custom Properties

**Trigger:** \`--ui-select-radius\`, \`--ui-select-border-width\`, \`--ui-select-bg\`, \`--ui-select-text\`,
\`--ui-select-border\`, \`--ui-select-placeholder\`, \`--ui-select-border-focus\`, \`--ui-select-ring\`,
\`--ui-select-border-error\`, \`--ui-select-bg-disabled\`

**Dropdown:** \`--ui-select-dropdown-bg\`, \`--ui-select-dropdown-border\`, \`--ui-select-dropdown-shadow\`,
\`--ui-select-dropdown-max-height\`, \`--ui-select-z-index\`

**Options:** \`--ui-select-option-height\`, \`--ui-select-option-bg\`, \`--ui-select-option-bg-hover\`,
\`--ui-select-option-bg-active\`, \`--ui-select-option-text\`, \`--ui-select-option-text-disabled\`,
\`--ui-select-option-check\`

**Tags (multi):** \`--ui-select-tag-bg\`, \`--ui-select-tag-text\`, \`--ui-select-tag-gap\`,
\`--ui-select-tag-padding-x\`, \`--ui-select-tag-padding-y\`

**Checkboxes:** \`--ui-select-checkbox-border\`, \`--ui-select-checkbox-bg-checked\`, \`--ui-select-checkbox-check\`

**Search highlight:** \`--ui-select-highlight-weight\`, \`--ui-select-highlight-text\`

## Examples

\`\`\`html
<!-- Single select -->
<lui-select placeholder="Choose...">
  <lui-option value="a">Alpha</lui-option>
  <lui-option value="b">Beta</lui-option>
</lui-select>

<!-- Multi-select -->
<lui-select multiple placeholder="Select items">
  <lui-option value="1">Item 1</lui-option>
  <lui-option value="2">Item 2</lui-option>
  <lui-option value="3">Item 3</lui-option>
</lui-select>

<!-- Grouped -->
<lui-select>
  <lui-option-group label="Fruits">
    <lui-option value="apple">Apple</lui-option>
  </lui-option-group>
  <lui-option-group label="Vegs">
    <lui-option value="carrot">Carrot</lui-option>
  </lui-option-group>
</lui-select>

<!-- Searchable combobox -->
<lui-select searchable placeholder="Search...">
  <lui-option value="us">United States</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
</lui-select>

<!-- Async search -->
<script>
  const sel = document.querySelector('lui-select');
  sel.asyncSearch = async (query, { signal }) => {
    const res = await fetch(\\\`/api/search?q=\\\${query}\\\`, { signal });
    const data = await res.json();
    return data.map(d => ({ value: d.id, label: d.name }));
  };
</script>
<lui-select searchable placeholder="Search users..."></lui-select>
\`\`\`

## Keyboard Navigation

Arrow Down/Up: navigate options. Enter: select. Escape: close. Home/End: first/last.
Type characters: type-ahead. Backspace: remove last tag (multi-select).

## Form Participation

Uses \`ElementInternals\`. Multi-select uses \`FormData.append()\` for each value —
retrieve server-side with \`formData.getAll('name')\`.

## Accessibility

ARIA 1.2 combobox pattern. \`aria-activedescendant\` for focus. \`aria-expanded\`,
\`aria-controls\`, \`aria-selected\`. Virtual scrolling uses \`aria-setsize\`/\`aria-posinset\`.

## See Also

For cross-cutting concepts that apply to all lit-ui components, see the [lit-ui overview skill](../lit-ui/SKILL.md):

- **Theming** — CSS custom properties, global semantic colors, component token namespaces
- **Dark Mode** — \`.dark\` class on \`<html>\`/\`<body>\`, \`:host-context(.dark)\` in Shadow DOM
- **SSR** — \`isServer\` guard, \`renderToString()\`, hydration import order
- **Form Participation** — \`ElementInternals\` pattern used across all form components
- **CLI** — \`npx lit-ui init\`, \`npx lit-ui add\`, distribution modes
`,

  checkbox: `---
name: lit-ui-checkbox
description: >-
  API reference for the lit-ui Checkbox component (<lui-checkbox>, <lui-checkbox-group>).
  Use when creating checkboxes, checkbox groups with select-all, or boolean form fields.
  Supports indeterminate state, form participation, and grouping.
---

# lit-ui Checkbox (\`<lui-checkbox>\`, \`<lui-checkbox-group>\`)

## Import

\`\`\`typescript
import '@lit-ui/checkbox';
\`\`\`

## Checkbox Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`checked\` | \`checked\` | \`boolean\` | \`false\` | Checked state |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`indeterminate\` | \`indeterminate\` | \`boolean\` | \`false\` | Indeterminate visual state |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`value\` | \`value\` | \`string\` | \`'on'\` | Form value when checked |
| \`label\` | \`label\` | \`string\` | \`''\` | Accessible label |
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size |

## Checkbox Events

- \`ui-change\` — Detail: \`{ checked: boolean, value: string }\`

## Checkbox Slots

| Slot | Description |
|------|-------------|
| (default) | Label content |

## CheckboxGroup Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`label\` | \`label\` | \`string\` | \`''\` | Group label |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable all children |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Require at least one |
| \`error\` | \`error\` | \`string\` | \`''\` | Error message |
| \`selectAll\` | \`select-all\` | \`boolean\` | \`false\` | Show select-all checkbox |

## CheckboxGroup Events

- \`ui-change\` — Detail: \`{ allChecked: boolean, checkedCount: number, totalCount: number }\` (on select-all toggle)

## CSS Custom Properties

\`--ui-checkbox-size-{sm,md,lg}\`, \`--ui-checkbox-radius\`, \`--ui-checkbox-border\`,
\`--ui-checkbox-border-hover\`, \`--ui-checkbox-bg-checked\`, \`--ui-checkbox-check-color\`,
\`--ui-checkbox-ring\`, \`--ui-checkbox-bg-disabled\`, \`--ui-checkbox-border-error\`,
\`--ui-checkbox-label-gap\`, \`--ui-checkbox-group-gap\`

## Examples

\`\`\`html
<lui-checkbox name="terms" required>I agree to the terms</lui-checkbox>
<lui-checkbox checked disabled>Pre-selected</lui-checkbox>
<lui-checkbox indeterminate>Partial selection</lui-checkbox>

<lui-checkbox-group label="Toppings" select-all>
  <lui-checkbox value="cheese">Cheese</lui-checkbox>
  <lui-checkbox value="mushrooms">Mushrooms</lui-checkbox>
  <lui-checkbox value="peppers">Peppers</lui-checkbox>
</lui-checkbox-group>
\`\`\`

## Form Participation

\`<lui-checkbox>\` uses \`ElementInternals\`. Submits \`value\` when checked, nothing when unchecked.
\`<lui-checkbox-group>\` is NOT form-associated — each child checkbox submits independently.

## Accessibility

Native checkbox semantics. \`aria-checked\`, \`aria-disabled\`, \`aria-required\`.
Indeterminate state uses \`aria-checked="mixed"\`. Click on label toggles checkbox.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  radio: `---
name: lit-ui-radio
description: >-
  API reference for the lit-ui Radio component (<lui-radio>, <lui-radio-group>).
  Use when creating radio button groups for single-selection choices.
  Supports form participation, roving tabindex, and keyboard navigation.
---

# lit-ui Radio (\`<lui-radio>\`, \`<lui-radio-group>\`)

## Import

\`\`\`typescript
import '@lit-ui/radio';
\`\`\`

## Radio Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Option value |
| \`checked\` | \`checked\` | \`boolean\` | \`false\` | Selected state (set by group) |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`label\` | \`label\` | \`string\` | \`''\` | Accessible label |
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size |

## Radio Slots

| Slot | Description |
|------|-------------|
| (default) | Label content |

## RadioGroup Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`value\` | \`value\` | \`string\` | \`''\` | Selected radio value |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable all children |
| \`label\` | \`label\` | \`string\` | \`''\` | Group label |
| \`error\` | \`error\` | \`string\` | \`''\` | Error message |

## RadioGroup Events

- \`ui-change\` — Detail: \`{ value: string }\`

## CSS Custom Properties

\`--ui-radio-size-{sm,md,lg}\`, \`--ui-radio-border\`, \`--ui-radio-border-hover\`,
\`--ui-radio-bg-checked\`, \`--ui-radio-dot-color\`, \`--ui-radio-ring\`,
\`--ui-radio-bg-disabled\`, \`--ui-radio-border-error\`, \`--ui-radio-label-gap\`,
\`--ui-radio-group-gap\`

## Examples

\`\`\`html
<lui-radio-group name="plan" label="Select Plan" value="pro">
  <lui-radio value="free">Free</lui-radio>
  <lui-radio value="pro">Pro</lui-radio>
  <lui-radio value="enterprise">Enterprise</lui-radio>
</lui-radio-group>
\`\`\`

## Keyboard Navigation

Arrow Up/Down or Left/Right: navigate and select. Focus moves via roving tabindex.

## Form Participation

\`<lui-radio-group>\` uses \`ElementInternals\`. Submits the selected radio's \`value\`.
Individual \`<lui-radio>\` elements are NOT form-associated.

## Accessibility

\`role="radiogroup"\` on group. \`role="radio"\` with \`aria-checked\` on each radio.
Roving tabindex for single tab-stop navigation.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  switch: `---
name: lit-ui-switch
description: >-
  API reference for the lit-ui Switch component (<lui-switch>).
  Use when creating toggle switches for boolean on/off settings.
  Supports form participation, labels, and keyboard activation.
---

# lit-ui Switch (\`<lui-switch>\`)

## Import

\`\`\`typescript
import '@lit-ui/switch';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`checked\` | \`checked\` | \`boolean\` | \`false\` | On/off state |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`value\` | \`value\` | \`string\` | \`'on'\` | Form value when checked |
| \`label\` | \`label\` | \`string\` | \`''\` | Accessible label |
| \`size\` | \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size |

## Events

- \`ui-change\` — Detail: \`{ checked: boolean, value: string }\`

## Slots

| Slot | Description |
|------|-------------|
| (default) | Label content |

## CSS Custom Properties

\`--ui-switch-width-{sm,md,lg}\`, \`--ui-switch-height-{sm,md,lg}\`,
\`--ui-switch-thumb-size-{sm,md,lg}\`, \`--ui-switch-track-bg\`,
\`--ui-switch-track-bg-checked\`, \`--ui-switch-thumb-bg\`,
\`--ui-switch-ring\`, \`--ui-switch-track-bg-disabled\`, \`--ui-switch-label-gap\`

## Examples

\`\`\`html
<lui-switch name="notifications" label="Enable notifications"></lui-switch>
<lui-switch checked>Dark mode</lui-switch>
<lui-switch size="sm" disabled>Locked setting</lui-switch>
\`\`\`

## Form Participation

Uses \`ElementInternals\`. Submits \`value\` when checked, nothing when unchecked.

## Accessibility

\`role="switch"\` with \`aria-checked\`. Keyboard: Space and Enter toggle state.
Focus ring on keyboard navigation.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  calendar: `---
name: lit-ui-calendar
description: >-
  API reference for the lit-ui Calendar component (<lui-calendar>).
  Use when displaying an interactive calendar for date selection.
  Supports min/max dates, disabled dates, custom day rendering, week numbers,
  locale-aware formatting, and keyboard navigation.
---

# lit-ui Calendar (\`<lui-calendar>\`)

## Import

\`\`\`typescript
import '@lit-ui/calendar';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Selected date (ISO string YYYY-MM-DD) |
| \`locale\` | \`locale\` | \`string\` | browser default | BCP 47 locale |
| \`minDate\` | \`min-date\` | \`string\` | — | Earliest selectable date (ISO) |
| \`maxDate\` | \`max-date\` | \`string\` | — | Latest selectable date (ISO) |
| \`disabledDates\` | — | \`string[]\` | \`[]\` | Array of disabled ISO dates (property only) |
| \`firstDayOfWeekOverride\` | \`first-day-of-week\` | \`number\` | — | Override first day (0=Sun, 1=Mon, etc.) |
| \`displayMonth\` | \`display-month\` | \`string\` | — | Displayed month (YYYY-MM) |
| \`hideNavigation\` | \`hide-navigation\` | \`boolean\` | \`false\` | Hide prev/next month buttons |
| \`showWeekNumbers\` | \`show-week-numbers\` | \`boolean\` | \`false\` | Show ISO week numbers |
| \`showConstraintTooltips\` | \`show-constraint-tooltips\` | \`boolean\` | \`false\` | Show tooltips on disabled dates |
| \`renderDay\` | — | \`(date: Date, state: DayState) => TemplateResult\` | — | Custom day cell renderer (property only) |

## Events

- \`change\` — Detail: \`{ date: Date, isoString: string }\`
- \`month-change\` — Detail: \`{ year: number, month: number }\`

## CSS Custom Properties

\`--ui-calendar-cell-size\`, \`--ui-calendar-radius\`, \`--ui-calendar-bg\`,
\`--ui-calendar-text\`, \`--ui-calendar-header-text\`,
\`--ui-calendar-day-hover-bg\`, \`--ui-calendar-day-selected-bg\`,
\`--ui-calendar-day-selected-text\`, \`--ui-calendar-day-today-border\`,
\`--ui-calendar-day-disabled-text\`, \`--ui-calendar-day-outside-text\`,
\`--ui-calendar-nav-hover-bg\`, \`--ui-calendar-week-number-text\`

## Examples

\`\`\`html
<lui-calendar value="2025-03-15"></lui-calendar>
<lui-calendar min-date="2025-01-01" max-date="2025-12-31"></lui-calendar>
<lui-calendar locale="de-DE" first-day-of-week="1" show-week-numbers></lui-calendar>

<!-- Custom day rendering (JS property) -->
<script>
  const cal = document.querySelector('lui-calendar');
  cal.disabledDates = ['2025-03-25', '2025-03-26'];
  cal.renderDay = (date, state) => {
    // Return custom TemplateResult for each day cell
  };
</script>
\`\`\`

## Views

Three navigable views:
- **Month** — Day grid (default)
- **Year** — 12-month picker (click month header)
- **Decade** — Year picker (click year header)

## Keyboard Navigation

Arrow keys: move focus. Enter/Space: select date. Page Up/Down: prev/next month.
Home/End: first/last day of month. Escape: return to month view.

## Accessibility

\`role="grid"\` for date grid. \`aria-label\` on navigation buttons.
\`aria-selected\` on chosen date. \`aria-disabled\` on disabled dates.
Supports \`prefers-reduced-motion\`.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  accordion: `---
name: lit-ui-accordion
description: >-
  API reference for the lit-ui Accordion component (<lui-accordion>, <lui-accordion-item>).
  Use when creating expandable/collapsible content sections. Supports single and multiple
  expand modes, lazy content rendering, keyboard navigation, and CSS Grid height animation.
---

# lit-ui Accordion (\`<lui-accordion>\`, \`<lui-accordion-item>\`)

## Import

\`\`\`typescript
import '@lit-ui/accordion';
\`\`\`

## Accordion Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Comma-separated expanded item values |
| \`defaultValue\` | \`default-value\` | \`string\` | \`''\` | Initial expanded items (uncontrolled) |
| \`multiple\` | \`multiple\` | \`boolean\` | \`false\` | Allow multiple items expanded |
| \`collapsible\` | \`collapsible\` | \`boolean\` | \`true\` | Allow collapsing all items |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable all items |

## Accordion Events

- \`ui-change\` — Detail: \`{ value: string, expandedItems: string[] }\`

## AccordionItem Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Unique identifier |
| \`expanded\` | \`expanded\` | \`boolean\` | \`false\` | Expanded state (set by parent) |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`headingLevel\` | \`heading-level\` | \`number\` | \`3\` | ARIA heading level |
| \`lazy\` | \`lazy\` | \`boolean\` | \`false\` | Defer content rendering until first expand |

## AccordionItem Slots

| Slot | Description |
|------|-------------|
| \`header\` | Header button content |
| (default) | Collapsible panel content |

## CSS Parts

\`chevron\` (on accordion-item)

## CSS Custom Properties

\`--ui-accordion-border-width\`, \`--ui-accordion-border\`,
\`--ui-accordion-header-bg\`, \`--ui-accordion-header-hover-bg\`,
\`--ui-accordion-header-text\`, \`--ui-accordion-header-font-weight\`,
\`--ui-accordion-header-font-size\`, \`--ui-accordion-header-padding\`,
\`--ui-accordion-panel-padding\`, \`--ui-accordion-panel-text\`,
\`--ui-accordion-ring\`, \`--ui-accordion-transition\`

## Examples

\`\`\`html
<!-- Single expand -->
<lui-accordion value="item-1">
  <lui-accordion-item value="item-1">
    <span slot="header">Section 1</span>
    <p>Content for section 1</p>
  </lui-accordion-item>
  <lui-accordion-item value="item-2">
    <span slot="header">Section 2</span>
    <p>Content for section 2</p>
  </lui-accordion-item>
</lui-accordion>

<!-- Multiple expand -->
<lui-accordion multiple default-value="a,b">
  <lui-accordion-item value="a">
    <span slot="header">FAQ A</span>
    <p>Answer A</p>
  </lui-accordion-item>
  <lui-accordion-item value="b">
    <span slot="header">FAQ B</span>
    <p>Answer B</p>
  </lui-accordion-item>
</lui-accordion>

<!-- Lazy loading -->
<lui-accordion>
  <lui-accordion-item value="heavy" lazy>
    <span slot="header">Heavy Content</span>
    <div>Not rendered until first expand</div>
  </lui-accordion-item>
</lui-accordion>
\`\`\`

## Keyboard Navigation

Arrow Up/Down: move focus between headers. Home/End: first/last header.
Enter/Space: toggle expanded. Roving tabindex for single tab-stop.

## Accessibility

\`aria-expanded\` on header buttons. \`aria-controls\` links to panel.
\`role="heading"\` with configurable \`aria-level\`. \`role="region"\` on panel.
\`data-state="open|closed"\` reflects current state. Supports \`prefers-reduced-motion\`.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  tabs: `---
name: lit-ui-tabs
description: >-
  API reference for the lit-ui Tabs component (<lui-tabs>, <lui-tab-panel>).
  Use when creating tabbed interfaces with content panels. Supports horizontal
  and vertical orientation, animated indicator, lazy rendering, scroll overflow,
  and keyboard navigation.
---

# lit-ui Tabs (\`<lui-tabs>\`, \`<lui-tab-panel>\`)

## Import

\`\`\`typescript
import '@lit-ui/tabs';
\`\`\`

## Tabs Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Active tab value (controlled) |
| \`defaultValue\` | \`default-value\` | \`string\` | \`''\` | Initial active tab (uncontrolled) |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable all tabs |
| \`label\` | \`label\` | \`string\` | \`''\` | Accessible label for tablist |
| \`orientation\` | \`orientation\` | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` | Layout direction |
| \`activationMode\` | \`activation-mode\` | \`'automatic' \\| 'manual'\` | \`'automatic'\` | Activate on focus or on enter/space |

## Tabs Events

- \`ui-change\` — Detail: \`{ value: string }\`

## TabPanel Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Unique panel identifier |
| \`label\` | \`label\` | \`string\` | \`''\` | Tab button text |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable this tab |
| \`active\` | \`active\` | \`boolean\` | \`false\` | Active state (set by parent) |
| \`lazy\` | \`lazy\` | \`boolean\` | \`false\` | Defer rendering until first activation |

## TabPanel Slots

| Slot | Description |
|------|-------------|
| (default) | Panel content |

## CSS Custom Properties

\`--ui-tabs-border\`, \`--ui-tabs-border-width\`,
\`--ui-tabs-indicator-color\`, \`--ui-tabs-indicator-height\`,
\`--ui-tabs-tab-text\`, \`--ui-tabs-tab-text-active\`,
\`--ui-tabs-tab-text-hover\`, \`--ui-tabs-tab-text-disabled\`,
\`--ui-tabs-tab-padding\`, \`--ui-tabs-tab-font-size\`,
\`--ui-tabs-tab-font-weight\`, \`--ui-tabs-ring\`,
\`--ui-tabs-scroll-button-bg\`, \`--ui-tabs-scroll-button-text\`

## Examples

\`\`\`html
<lui-tabs default-value="tab1" label="Settings">
  <lui-tab-panel value="tab1" label="General">
    <p>General settings content</p>
  </lui-tab-panel>
  <lui-tab-panel value="tab2" label="Security">
    <p>Security settings content</p>
  </lui-tab-panel>
  <lui-tab-panel value="tab3" label="Notifications" disabled>
    <p>Coming soon</p>
  </lui-tab-panel>
</lui-tabs>

<!-- Vertical tabs -->
<lui-tabs orientation="vertical" default-value="profile">
  <lui-tab-panel value="profile" label="Profile">...</lui-tab-panel>
  <lui-tab-panel value="billing" label="Billing">...</lui-tab-panel>
</lui-tabs>

<!-- Lazy rendering -->
<lui-tabs default-value="basic">
  <lui-tab-panel value="basic" label="Basic">Always rendered</lui-tab-panel>
  <lui-tab-panel value="advanced" label="Advanced" lazy>Rendered on first view</lui-tab-panel>
</lui-tabs>
\`\`\`

## Keyboard Navigation

Arrow Left/Right (horizontal) or Up/Down (vertical): move focus.
Home/End: first/last tab. Automatic mode selects on focus;
manual mode requires Enter/Space. Roving tabindex for single tab-stop.

## Accessibility

\`role="tablist"\` with \`aria-label\`. \`role="tab"\` with \`aria-selected\`,
\`aria-controls\`. \`role="tabpanel"\` with \`aria-labelledby\`.
\`data-state="active|inactive"\` on panels. Animated indicator for visual feedback.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  tooltip: `---
name: lit-ui-tooltip
description: >-
  API reference for the lit-ui Tooltip component (<lui-tooltip>).
  Use when adding hover/focus tooltips to elements. Supports 12 placements,
  rich content, delay groups, arrow, and Floating UI positioning.
---

# lit-ui Tooltip (\`<lui-tooltip>\`)

## Import

\`\`\`typescript
import '@lit-ui/tooltip';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`content\` | \`content\` | \`string\` | \`''\` | Tooltip text |
| \`placement\` | \`placement\` | \`Placement\` | \`'top'\` | Position (12 options) |
| \`showDelay\` | \`show-delay\` | \`number\` | \`300\` | Show delay in ms |
| \`hideDelay\` | \`hide-delay\` | \`number\` | \`200\` | Hide delay in ms |
| \`arrow\` | \`arrow\` | \`boolean\` | \`true\` | Show arrow |
| \`offset\` | \`offset\` | \`number\` | \`8\` | Distance from trigger |
| \`rich\` | \`rich\` | \`boolean\` | \`false\` | Rich tooltip (interactive, stays open on hover) |
| \`tooltipTitle\` | \`tooltip-title\` | \`string\` | \`''\` | Title for rich tooltips |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable tooltip |

**Placement options:** \`top\`, \`top-start\`, \`top-end\`, \`bottom\`, \`bottom-start\`, \`bottom-end\`,
\`left\`, \`left-start\`, \`left-end\`, \`right\`, \`right-start\`, \`right-end\`

## Slots

| Slot | Description |
|------|-------------|
| (default) | Trigger element |
| \`content\` | Rich tooltip body content |
| \`title\` | Rich tooltip title |

## CSS Parts

\`trigger\`, \`tooltip\`, \`content\`, \`arrow\`

## CSS Custom Properties

\`--ui-tooltip-bg\`, \`--ui-tooltip-text\`, \`--ui-tooltip-radius\`,
\`--ui-tooltip-padding\`, \`--ui-tooltip-font-size\`, \`--ui-tooltip-max-width\`,
\`--ui-tooltip-shadow\`, \`--ui-tooltip-z-index\`, \`--ui-tooltip-arrow-size\`

## Examples

\`\`\`html
<!-- Simple text tooltip -->
<lui-tooltip content="Save your work">
  <lui-button>Save</lui-button>
</lui-tooltip>

<!-- Custom placement -->
<lui-tooltip content="Info" placement="right">
  <span>Hover me</span>
</lui-tooltip>

<!-- Rich tooltip with interactive content -->
<lui-tooltip rich>
  <lui-button>Help</lui-button>
  <span slot="title">Getting Started</span>
  <div slot="content">
    <p>Click here to learn more about this feature.</p>
    <a href="/docs">View documentation</a>
  </div>
</lui-tooltip>
\`\`\`

## Delay Groups

Adjacent tooltips use a skip-delay pattern: once one tooltip is shown,
nearby tooltips open instantly without the show delay.

## Accessibility

\`role="tooltip"\` with \`aria-describedby\` linking trigger to tooltip.
Shows on hover and focus. Escape dismisses. Rich tooltips remain interactive.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  popover: `---
name: lit-ui-popover
description: >-
  API reference for the lit-ui Popover component (<lui-popover>).
  Use when creating floating content panels triggered by a button or element.
  Supports modal/non-modal modes, focus trapping, arrow, Floating UI positioning,
  and nested popovers.
---

# lit-ui Popover (\`<lui-popover>\`)

## Import

\`\`\`typescript
import '@lit-ui/popover';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`placement\` | \`placement\` | \`Placement\` | \`'bottom-start'\` | Position (12 options) |
| \`open\` | \`open\` | \`boolean\` | \`false\` | Open state (controlled/uncontrolled) |
| \`arrow\` | \`arrow\` | \`boolean\` | \`false\` | Show arrow |
| \`modal\` | \`modal\` | \`boolean\` | \`false\` | Modal mode (focus trap + backdrop) |
| \`offset\` | \`offset\` | \`number\` | \`8\` | Distance from trigger |
| \`matchTriggerWidth\` | \`match-trigger-width\` | \`boolean\` | \`false\` | Match trigger width |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disable popover |

## Events

- \`open-changed\` — Fired when open state changes

## Slots

| Slot | Description |
|------|-------------|
| (default) | Trigger element |
| \`content\` | Popover body content |

## CSS Parts

\`trigger\`, \`popover\`, \`content\`, \`arrow\`

## CSS Custom Properties

\`--ui-popover-bg\`, \`--ui-popover-text\`, \`--ui-popover-border\`,
\`--ui-popover-radius\`, \`--ui-popover-shadow\`, \`--ui-popover-padding\`,
\`--ui-popover-z-index\`, \`--ui-popover-max-width\`, \`--ui-popover-arrow-size\`

## Examples

\`\`\`html
<!-- Basic popover -->
<lui-popover>
  <lui-button>Open Menu</lui-button>
  <div slot="content">
    <p>Popover content here</p>
  </div>
</lui-popover>

<!-- Modal popover with focus trap -->
<lui-popover modal arrow placement="top">
  <lui-button>Settings</lui-button>
  <div slot="content">
    <lui-input label="Name"></lui-input>
    <lui-button>Save</lui-button>
  </div>
</lui-popover>

<!-- Controlled popover -->
<lui-popover id="pop" .open=\${isOpen}>
  <lui-button>Toggle</lui-button>
  <div slot="content">Controlled content</div>
</lui-popover>
\`\`\`

## Behavior

- **Non-modal** (default): Click outside or Escape closes. No backdrop.
- **Modal**: Focus trapped inside. Backdrop click closes. Nested popovers supported.
- Uses the Popover API (\`popover="auto"|"manual"\`) for top-layer positioning.

## Accessibility

\`aria-expanded\` on trigger. \`aria-controls\` links to popover.
Focus trapping in modal mode. Escape closes. Focus restored on close.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  toast: `---
name: lit-ui-toast
description: >-
  API reference for the lit-ui Toast component (<lui-toaster> + toast() API).
  Use when showing temporary notification messages. Supports variants (success,
  error, warning, info, loading), promise toasts, actions, positions, and queue management.
---

# lit-ui Toast (\`<lui-toaster>\` + \`toast()\` API)

## Import

\`\`\`typescript
import { toast } from '@lit-ui/toast';
import '@lit-ui/toast'; // registers <lui-toaster>
\`\`\`

## Imperative API

\`\`\`typescript
// Basic
toast('Message');

// Variants
toast.success('Saved!');
toast.error('Failed to save');
toast.warning('Disk space low');
toast.info('New version available');

// With options
toast.success('Created', {
  description: 'The item was created successfully.',
  duration: 5000,
  action: { label: 'Undo', onClick: () => undoCreate() },
  position: 'top-right',
  dismissible: true,
});

// Promise toast (auto-transitions loading -> success/error)
toast.promise(fetchData(), {
  loading: 'Loading data...',
  success: 'Data loaded!',
  error: 'Failed to load data',
});

// Dismiss
const id = toast('Persistent');
toast.dismiss(id);
toast.dismissAll();
\`\`\`

## Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`id\` | \`string\` | auto | Unique toast ID |
| \`variant\` | \`'default' \\| 'success' \\| 'error' \\| 'warning' \\| 'info' \\| 'loading'\` | \`'default'\` | Visual style |
| \`title\` | \`string\` | — | Toast title |
| \`description\` | \`string\` | — | Additional text |
| \`duration\` | \`number\` | \`4000\` | Auto-dismiss ms (0 = persistent) |
| \`dismissible\` | \`boolean\` | \`true\` | Show close button |
| \`action\` | \`{ label: string, onClick: () => void }\` | — | Action button |
| \`position\` | \`ToastPosition\` | \`'bottom-right'\` | Screen position |
| \`onDismiss\` | \`() => void\` | — | Callback on dismiss |
| \`onAutoClose\` | \`() => void\` | — | Callback on auto-close |

**Positions:** \`top-left\`, \`top-center\`, \`top-right\`, \`bottom-left\`, \`bottom-center\`, \`bottom-right\`

## Toaster Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`position\` | \`position\` | \`ToastPosition\` | \`'bottom-right'\` | Default position |
| \`maxVisible\` | \`max-visible\` | \`number\` | \`5\` | Max visible toasts |
| \`gap\` | \`gap\` | \`number\` | \`8\` | Gap between toasts (px) |

## CSS Custom Properties

\`--ui-toast-bg\`, \`--ui-toast-text\`, \`--ui-toast-border\`,
\`--ui-toast-shadow\`, \`--ui-toast-radius\`, \`--ui-toast-padding\`,
\`--ui-toast-success-bg\`, \`--ui-toast-success-text\`, \`--ui-toast-success-border\`,
\`--ui-toast-error-bg\`, \`--ui-toast-error-text\`, \`--ui-toast-error-border\`,
\`--ui-toast-warning-bg\`, \`--ui-toast-warning-text\`, \`--ui-toast-warning-border\`,
\`--ui-toast-info-bg\`, \`--ui-toast-info-text\`, \`--ui-toast-info-border\`,
\`--ui-toast-z-index\`

## Examples

\`\`\`html
<!-- Add toaster container (one per app, auto-created if omitted) -->
<lui-toaster position="top-right" max-visible="3"></lui-toaster>

<script type="module">
  import { toast } from '@lit-ui/toast';

  document.querySelector('#save-btn').addEventListener('click', async () => {
    const promise = saveData();
    toast.promise(promise, {
      loading: 'Saving...',
      success: 'Saved successfully!',
      error: (err) => \`Failed: \${err.message}\`,
    });
  });
</script>
\`\`\`

## Behavior

- Auto-creates \`<lui-toaster>\` if none exists in the document.
- Uses \`popover="manual"\` for top-layer rendering.
- Queue management: excess toasts queue behind \`maxVisible\` limit.
- Enter/exit animations with \`prefers-reduced-motion\` support.

## Accessibility

\`role="status"\` with \`aria-live="polite"\` for non-error toasts.
\`aria-live="assertive"\` for error toasts. Action buttons are focusable.
Dismiss button labeled for screen readers.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  'date-picker': `---
name: lit-ui-date-picker
description: >-
  API reference for the lit-ui Date Picker component (<lui-date-picker>).
  Use when creating date input fields with calendar popup. Supports presets,
  min/max constraints, multi-format parsing, inline mode, and form participation.
---

# lit-ui Date Picker (\`<lui-date-picker>\`)

## Import

\`\`\`typescript
import '@lit-ui/date-picker';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Selected date (ISO YYYY-MM-DD) |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`label\` | \`label\` | \`string\` | \`''\` | Label text |
| \`placeholder\` | \`placeholder\` | \`string\` | \`''\` | Placeholder |
| \`helperText\` | \`helper-text\` | \`string\` | \`''\` | Helper text |
| \`locale\` | \`locale\` | \`string\` | browser default | BCP 47 locale |
| \`format\` | \`format\` | \`string\` | locale default | Display format (e.g. \`'MM/DD/YYYY'\`) |
| \`minDate\` | \`min-date\` | \`string\` | — | Earliest date (ISO) |
| \`maxDate\` | \`max-date\` | \`string\` | — | Latest date (ISO) |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`error\` | \`error\` | \`string\` | \`''\` | Error message |
| \`inline\` | \`inline\` | \`boolean\` | \`false\` | Show calendar inline (no popup) |
| \`presets\` | — | \`Array<{ label: string, value: string }>\` | \`[]\` | Quick-select presets (property only) |

## Events

- \`change\` — Detail: \`{ date: Date, isoString: string }\`

## CSS Custom Properties

\`--ui-date-picker-radius\`, \`--ui-date-picker-border\`,
\`--ui-date-picker-bg\`, \`--ui-date-picker-text\`,
\`--ui-date-picker-border-focus\`, \`--ui-date-picker-ring\`,
\`--ui-date-picker-border-error\`, \`--ui-date-picker-bg-disabled\`,
\`--ui-date-picker-popup-bg\`, \`--ui-date-picker-popup-shadow\`,
\`--ui-date-picker-preset-hover-bg\`

## Examples

\`\`\`html
<lui-date-picker name="birthday" label="Date of Birth" required></lui-date-picker>

<lui-date-picker
  label="Start Date"
  min-date="2025-01-01"
  max-date="2025-12-31"
  placeholder="Pick a date"
></lui-date-picker>

<!-- Inline calendar (no popup) -->
<lui-date-picker inline value="2025-06-15"></lui-date-picker>

<!-- With presets -->
<script>
  const picker = document.querySelector('lui-date-picker');
  picker.presets = [
    { label: 'Today', value: new Date().toISOString().split('T')[0] },
    { label: 'Tomorrow', value: '2025-03-16' },
  ];
</script>
\`\`\`

## Form Participation

Uses \`ElementInternals\`. Submits ISO date string. Validates required, min/max date constraints.

## Accessibility

Input with \`aria-haspopup="dialog"\` and \`aria-expanded\`.
Calendar popup receives focus. Escape closes popup and restores focus.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  'date-range-picker': `---
name: lit-ui-date-range-picker
description: >-
  API reference for the lit-ui Date Range Picker component (<lui-date-range-picker>).
  Use when selecting date ranges with dual calendars. Supports min/max days, presets,
  comparison ranges, drag selection, and form participation.
---

# lit-ui Date Range Picker (\`<lui-date-range-picker>\`)

## Import

\`\`\`typescript
import '@lit-ui/date-range-picker';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`startDate\` | \`start-date\` | \`string\` | \`''\` | Range start (ISO) |
| \`endDate\` | \`end-date\` | \`string\` | \`''\` | Range end (ISO) |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`label\` | \`label\` | \`string\` | \`''\` | Label text |
| \`placeholder\` | \`placeholder\` | \`string\` | \`''\` | Placeholder |
| \`helperText\` | \`helper-text\` | \`string\` | \`''\` | Helper text |
| \`locale\` | \`locale\` | \`string\` | browser default | BCP 47 locale |
| \`minDate\` | \`min-date\` | \`string\` | — | Earliest date (ISO) |
| \`maxDate\` | \`max-date\` | \`string\` | — | Latest date (ISO) |
| \`minDays\` | \`min-days\` | \`number\` | — | Minimum range length |
| \`maxDays\` | \`max-days\` | \`number\` | — | Maximum range length |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`error\` | \`error\` | \`string\` | \`''\` | Error message |
| \`comparison\` | \`comparison\` | \`boolean\` | \`false\` | Enable comparison range |
| \`compareStartDate\` | \`compare-start-date\` | \`string\` | \`''\` | Comparison start (ISO) |
| \`compareEndDate\` | \`compare-end-date\` | \`string\` | \`''\` | Comparison end (ISO) |
| \`presets\` | — | \`Array<{ label: string, startDate: string, endDate: string }>\` | \`[]\` | Quick-select presets (property only) |

## Events

- \`change\` — Detail: \`{ startDate: string, endDate: string, compareStartDate?: string, compareEndDate?: string }\`

## CSS Custom Properties

\`--ui-date-range-radius\`, \`--ui-date-range-border\`,
\`--ui-date-range-bg\`, \`--ui-date-range-text\`,
\`--ui-date-range-border-focus\`, \`--ui-date-range-ring\`,
\`--ui-date-range-highlight-bg\`, \`--ui-date-range-highlight-text\`,
\`--ui-date-range-compare-bg\`, \`--ui-date-range-compare-border\`,
\`--ui-date-range-popup-bg\`, \`--ui-date-range-popup-shadow\`

## Examples

\`\`\`html
<lui-date-range-picker
  name="period"
  label="Select Period"
  required
></lui-date-range-picker>

<!-- With constraints -->
<lui-date-range-picker
  min-date="2025-01-01"
  max-date="2025-12-31"
  min-days="3"
  max-days="30"
></lui-date-range-picker>

<!-- With comparison range -->
<lui-date-range-picker comparison label="Analytics Period"></lui-date-range-picker>

<!-- With presets -->
<script>
  const picker = document.querySelector('lui-date-range-picker');
  picker.presets = [
    { label: 'Last 7 days', startDate: '2025-03-08', endDate: '2025-03-15' },
    { label: 'Last 30 days', startDate: '2025-02-14', endDate: '2025-03-15' },
  ];
</script>
\`\`\`

## Selection Behavior

Two-click state machine: first click sets start date, second click sets end date.
Drag selection supported. If second click is before first, dates are swapped automatically.

## Form Participation

Uses \`ElementInternals\`. Submits ISO 8601 interval format (\`startDate/endDate\`).

## Accessibility

Dual calendar grids with keyboard navigation. Focus moves between calendars.
\`aria-selected\` marks range. Escape closes popup and restores focus.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  'time-picker': `---
name: lit-ui-time-picker
description: >-
  API reference for the lit-ui Time Picker component (<lui-time-picker>).
  Use when creating time input fields. Supports multiple input interfaces
  (dropdown, clock face, wheel, range slider), 12/24 hour format, timezone display,
  business hours, presets, and form participation.
---

# lit-ui Time Picker (\`<lui-time-picker>\`)

## Import

\`\`\`typescript
import '@lit-ui/time-picker';
\`\`\`

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`value\` | \`value\` | \`string\` | \`''\` | Time value (HH:mm or HH:mm:ss) |
| \`name\` | \`name\` | \`string\` | \`''\` | Form field name |
| \`label\` | \`label\` | \`string\` | \`''\` | Label text |
| \`placeholder\` | \`placeholder\` | \`string\` | \`''\` | Placeholder |
| \`required\` | \`required\` | \`boolean\` | \`false\` | Required |
| \`disabled\` | \`disabled\` | \`boolean\` | \`false\` | Disabled |
| \`readonly\` | \`readonly\` | \`boolean\` | \`false\` | Read-only |
| \`hour12\` | \`hour12\` | \`boolean\` | locale default | Use 12-hour format |
| \`locale\` | \`locale\` | \`string\` | browser default | BCP 47 locale |
| \`step\` | \`step\` | \`number\` | \`60\` | Step in seconds (60=minutes, 1=seconds) |
| \`minTime\` | \`min-time\` | \`string\` | — | Minimum time (HH:mm) |
| \`maxTime\` | \`max-time\` | \`string\` | — | Maximum time (HH:mm) |
| \`allowOvernight\` | \`allow-overnight\` | \`boolean\` | \`false\` | Allow overnight ranges (min > max) |
| \`showTimezone\` | \`show-timezone\` | \`boolean\` | \`false\` | Show timezone info |
| \`timezone\` | \`timezone\` | \`string\` | local | IANA timezone |
| \`interfaceMode\` | \`interface-mode\` | \`'dropdown' \\| 'clock' \\| 'wheel' \\| 'range'\` | \`'dropdown'\` | Input interface |
| \`businessHours\` | — | \`{ start: string, end: string }\` | — | Highlight business hours (property only) |
| \`presets\` | — | \`Array<{ label: string, value: string }>\` | \`[]\` | Quick-select presets (property only) |
| \`additionalTimezones\` | — | \`string[]\` | \`[]\` | Display other timezones (property only) |

## Events

- \`change\` — Detail: \`{ value: string, timeValue: { hours: number, minutes: number, seconds: number } }\`

## CSS Custom Properties

\`--ui-time-picker-radius\`, \`--ui-time-picker-border\`,
\`--ui-time-picker-bg\`, \`--ui-time-picker-text\`,
\`--ui-time-picker-border-focus\`, \`--ui-time-picker-ring\`,
\`--ui-time-picker-border-error\`, \`--ui-time-picker-bg-disabled\`,
\`--ui-time-picker-dropdown-bg\`, \`--ui-time-picker-dropdown-shadow\`,
\`--ui-time-picker-option-hover-bg\`, \`--ui-time-picker-clock-bg\`,
\`--ui-time-picker-clock-hand\`

## Examples

\`\`\`html
<lui-time-picker name="meeting" label="Meeting Time" required></lui-time-picker>

<!-- 12-hour with AM/PM -->
<lui-time-picker hour12 value="14:30"></lui-time-picker>

<!-- Clock face interface -->
<lui-time-picker interface-mode="clock" label="Alarm"></lui-time-picker>

<!-- Business hours constraint -->
<script>
  const tp = document.querySelector('lui-time-picker');
  tp.minTime = '09:00';
  tp.maxTime = '17:00';
  tp.businessHours = { start: '09:00', end: '17:00' };
  tp.presets = [
    { label: 'Morning standup', value: '09:30' },
    { label: 'Lunch', value: '12:00' },
    { label: 'End of day', value: '17:00' },
  ];
</script>

<!-- With timezone display -->
<lui-time-picker show-timezone timezone="America/New_York"></lui-time-picker>
\`\`\`

## Interface Modes

- **dropdown** (default): Scrollable time list
- **clock**: Analog clock face for hour/minute selection
- **wheel**: iOS-style scroll wheel
- **range**: Slider-based selection

## Form Participation

Uses \`ElementInternals\`. Submits time string in HH:mm or HH:mm:ss format.

## Accessibility

Input with \`aria-haspopup\`. Keyboard navigation within dropdown/clock.
Arrow keys adjust time. Escape closes popup. AM/PM toggle via keyboard.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,

  'data-table': `---
name: lit-ui-data-table
description: >-
  API reference for the lit-ui Data Table component (<lui-data-table>).
  Use when creating data tables with sorting, filtering, pagination, row selection,
  column resize/reorder, inline editing, virtual scrolling, expandable rows,
  CSV export, and server-side mode. Built on TanStack Table.
---

# lit-ui Data Table (\`<lui-data-table>\`)

## Import

\`\`\`typescript
import '@lit-ui/data-table';
\`\`\`

## Core Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| \`columns\` | — | \`ColumnConfig<T>[]\` | \`[]\` | Column definitions (property only) |
| \`data\` | — | \`T[]\` | \`[]\` | Row data (property only) |
| \`keyField\` | \`key-field\` | \`string\` | \`'id'\` | Unique row identifier field |
| \`caption\` | \`caption\` | \`string\` | \`''\` | Table caption for accessibility |
| \`loading\` | \`loading\` | \`boolean\` | \`false\` | Show loading state |
| \`emptyMessage\` | \`empty-message\` | \`string\` | \`'No data available'\` | Empty state text |
| \`striped\` | \`striped\` | \`boolean\` | \`false\` | Striped rows |
| \`hoverable\` | \`hoverable\` | \`boolean\` | \`true\` | Row hover effect |
| \`bordered\` | \`bordered\` | \`boolean\` | \`false\` | Cell borders |
| \`compact\` | \`compact\` | \`boolean\` | \`false\` | Compact density |

## Sorting

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`sortable\` | \`sortable\` | \`boolean\` | \`false\` |
| \`multiSort\` | \`multi-sort\` | \`boolean\` | \`false\` |

Event: \`ui-sort-change\` — Detail: \`{ sorting: SortingState }\`

## Filtering

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`filterable\` | \`filterable\` | \`boolean\` | \`false\` |
| \`globalFilter\` | \`global-filter\` | \`string\` | \`''\` |

Event: \`ui-filter-change\` — Detail: \`{ columnFilters, globalFilter }\`

## Pagination

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`paginated\` | \`paginated\` | \`boolean\` | \`false\` |
| \`pageSize\` | \`page-size\` | \`number\` | \`10\` |
| \`pageIndex\` | \`page-index\` | \`number\` | \`0\` |
| \`pageSizeOptions\` | — | \`number[]\` | \`[10,25,50,100]\` |

Event: \`ui-pagination-change\` — Detail: \`{ pageIndex, pageSize }\`

## Row Selection

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`selectable\` | \`selectable\` | \`boolean\` | \`false\` |
| \`multiSelect\` | \`multi-select\` | \`boolean\` | \`true\` |
| \`selectedRows\` | — | \`Record<string, boolean>\` | \`{}\` |

Event: \`ui-selection-change\` — Detail: \`{ selectedRows, selectedData }\`

## Column Features

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`resizable\` | \`resizable\` | \`boolean\` | \`false\` |
| \`reorderable\` | \`reorderable\` | \`boolean\` | \`false\` |
| \`columnVisibility\` | — | \`Record<string, boolean>\` | \`{}\` |
| \`stickyColumns\` | — | \`{ left?: string[], right?: string[] }\` | — |

## Inline Editing

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`editable\` | \`editable\` | \`boolean\` | \`false\` |
| \`editMode\` | \`edit-mode\` | \`'cell' \\| 'row'\` | \`'cell'\` |

Events: \`ui-cell-edit\`, \`ui-row-edit-save\`, \`ui-row-edit-cancel\`

## Expandable Rows

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`expandable\` | \`expandable\` | \`boolean\` | \`false\` |
| \`renderExpandedRow\` | — | \`(row: T) => TemplateResult\` | — |

Event: \`ui-row-expand\`

## Row/Bulk Actions

| Property | Type | Description |
|----------|------|-------------|
| \`rowActions\` | \`RowAction<T>[]\` | Per-row action menu items (property only) |
| \`bulkActions\` | \`BulkAction<T>[]\` | Toolbar actions for selected rows (property only) |

Events: \`ui-row-action\`, \`ui-bulk-action\`

## Virtual Scrolling

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`virtualScroll\` | \`virtual-scroll\` | \`boolean\` | \`false\` |
| \`virtualRowHeight\` | \`virtual-row-height\` | \`number\` | \`48\` |
| \`tableHeight\` | \`table-height\` | \`string\` | — |

## Server-Side Mode

| Property | Attribute | Type | Default |
|----------|-----------|------|---------|
| \`serverSide\` | \`server-side\` | \`boolean\` | \`false\` |
| \`totalRows\` | \`total-rows\` | \`number\` | \`0\` |

In server-side mode, sorting/filtering/pagination events fire but the table does NOT
process data locally. You must handle data fetching and pass updated \`data\` and \`totalRows\`.

## Export

| Property | Attribute | Type |
|----------|-----------|------|
| \`exportable\` | \`exportable\` | \`boolean\` |
| \`exportFilename\` | \`export-filename\` | \`string\` |

## Persistence

| Property | Attribute | Type |
|----------|-----------|------|
| \`persistState\` | \`persist-state\` | \`boolean\` |
| \`persistKey\` | \`persist-key\` | \`string\` |

Persists sorting, pagination, column visibility, column sizing, and column order to localStorage.

## ColumnConfig

\`\`\`typescript
interface ColumnConfig<T> {
  id: string;                    // Unique column ID
  header: string;                // Column header text
  accessorKey?: keyof T;         // Data field to access
  accessorFn?: (row: T) => any;  // Custom accessor function
  cell?: (value: any, row: T) => TemplateResult | string;  // Custom cell renderer
  sortable?: boolean;            // Per-column sort override
  filterable?: boolean;          // Per-column filter override
  filterType?: 'text' | 'select' | 'number-range' | 'date-range';
  filterOptions?: { label: string, value: string }[];
  editable?: boolean;            // Per-column edit override
  editType?: 'text' | 'number' | 'select' | 'boolean';
  editOptions?: { label: string, value: string }[];
  validate?: (value: any) => string | null;  // Edit validation
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
}
\`\`\`

## CSS Custom Properties

\`--ui-table-header-bg\`, \`--ui-table-header-text\`, \`--ui-table-header-font-weight\`,
\`--ui-table-row-bg\`, \`--ui-table-row-hover-bg\`, \`--ui-table-row-selected-bg\`,
\`--ui-table-row-stripe-bg\`, \`--ui-table-border\`, \`--ui-table-text\`,
\`--ui-table-cell-padding\`, \`--ui-table-cell-padding-compact\`,
\`--ui-table-radius\`, \`--ui-table-shadow\`,
\`--ui-table-pagination-bg\`, \`--ui-table-pagination-text\`,
\`--ui-table-sort-indicator\`, \`--ui-table-resize-handle\`,
\`--ui-table-z-index\`

## Examples

\`\`\`html
<lui-data-table
  caption="Users"
  sortable
  filterable
  paginated
  selectable
  .columns=\${[
    { id: 'name', header: 'Name', accessorKey: 'name', sortable: true, filterable: true },
    { id: 'email', header: 'Email', accessorKey: 'email' },
    { id: 'role', header: 'Role', accessorKey: 'role', filterType: 'select',
      filterOptions: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }] },
    { id: 'joined', header: 'Joined', accessorKey: 'joinedAt',
      cell: (val) => new Date(val).toLocaleDateString() },
  ]}
  .data=\${users}
  .rowActions=\${[
    { label: 'Edit', action: (row) => editUser(row) },
    { label: 'Delete', action: (row) => deleteUser(row), variant: 'destructive' },
  ]}
  .bulkActions=\${[
    { label: 'Delete Selected', action: (rows) => deleteUsers(rows) },
  ]}
  @ui-selection-change=\${handleSelection}
></lui-data-table>
\`\`\`

## Accessibility

\`<table>\` with \`<caption>\`. \`aria-sort\` on sortable headers.
\`aria-selected\` on selectable rows. \`role="checkbox"\` for select-all.
Keyboard navigation for sorting, pagination, and editing.

## See Also

For cross-cutting concepts, see the [lit-ui overview skill](../lit-ui/SKILL.md).
`,
};

/**
 * Get the list of available component skill names.
 */
export function getAvailableComponentSkills(): string[] {
  return Object.keys(COMPONENT_SKILLS);
}
