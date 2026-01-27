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
| Dialog | \`<lui-dialog>\` | \`@lit-ui/dialog\` |
| Input | \`<lui-input>\` | \`@lit-ui/input\` |
| Textarea | \`<lui-textarea>\` | \`@lit-ui/textarea\` |
| Select | \`<lui-select>\`, \`<lui-option>\`, \`<lui-option-group>\` | \`@lit-ui/select\` |

## Installation

\`\`\`bash
# Initialize project
npx lit-ui init

# Add components
npx lit-ui add button
npx lit-ui add dialog
npx lit-ui add input
npx lit-ui add textarea
npx lit-ui add select
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

All form components (\`<lui-input>\`, \`<lui-textarea>\`, \`<lui-select>\`, \`<lui-button>\`) use
\`ElementInternals\` for native HTML form participation:

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
- Dialog: \`--ui-dialog-*\` (backdrop, radius, shadow, sizing)
- Input: \`--ui-input-*\` (radius, border, colors, sizing)
- Textarea: shares \`--ui-input-*\` tokens
- Select: \`--ui-select-*\` (trigger, dropdown, options, tags, checkbox)

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
};

/**
 * Get the list of available component skill names.
 */
export function getAvailableComponentSkills(): string[] {
  return Object.keys(COMPONENT_SKILLS);
}
