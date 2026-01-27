# Phase 41: CLI and Documentation - Research

**Researched:** 2026-01-27
**Domain:** CLI registry, docs site pages, navigation integration
**Confidence:** HIGH

## Summary

This phase makes three existing components (Checkbox, Radio, Switch) installable via CLI and documented on the docs site. The work is purely integration — no new component code needs to be written.

There are **five integration points** that must be updated:
1. CLI registry (registry.json) — add entries for checkbox, radio, switch
2. CLI templates (templates/index.ts) — embed component source code as template strings for copy-source mode
3. CLI npm install mapping (install-component.ts) — map component names to @lit-ui/* packages
4. Docs pages — create CheckboxPage.tsx, RadioPage.tsx, SwitchPage.tsx with interactive examples
5. Navigation and routing — update nav.ts and App.tsx

All patterns are well-established from existing components (Button, Dialog, Input, Textarea, Select). The work is mechanical replication of existing patterns with component-specific content.

**Primary recommendation:** Follow the exact patterns established by Input/Textarea/Select for all five integration points. No architectural decisions needed.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18.3.1 | Docs site UI framework | Already used for docs app |
| react-router | ^7.12.0 | Docs routing | Already configured |
| @lit-ui/checkbox | workspace:* | Checkbox component NPM package | Built in Phase 39 |
| @lit-ui/radio | workspace:* | Radio component NPM package | Built in Phase 40 |
| @lit-ui/switch | workspace:* | Switch component NPM package | Built in Phase 38 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| citty | (existing) | CLI command framework | Already used for add command |
| tsup | (existing) | CLI bundler that inlines JSON | Registry JSON bundling |

### Alternatives Considered

None — this is pure integration work using established patterns.

## Architecture Patterns

### Pattern 1: CLI Registry Entry (registry.json)

**What:** Each component gets an entry in `packages/cli/src/registry/registry.json` with files, dependencies, and registryDependencies.
**When to use:** For every installable component.
**Source:** `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/registry/registry.json`

Checkbox needs TWO files (checkbox.ts + checkbox-group.ts), like Select has THREE files. Radio also needs TWO files (radio.ts + radio-group.ts). Switch needs ONE file (switch.ts).

```json
{
  "name": "checkbox",
  "description": "Accessible checkbox with indeterminate state and CheckboxGroup with select-all",
  "files": [
    { "path": "components/checkbox/checkbox.ts", "type": "component" },
    { "path": "components/checkbox/checkbox-group.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

```json
{
  "name": "radio",
  "description": "Accessible radio button with RadioGroup for mutual exclusion and arrow key navigation",
  "files": [
    { "path": "components/radio/radio.ts", "type": "component" },
    { "path": "components/radio/radio-group.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

```json
{
  "name": "switch",
  "description": "Toggle switch with animated slide transition and form participation",
  "files": [
    { "path": "components/switch/switch.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

**Key finding:** No npm dependencies needed (zero new deps — CSS transitions only, per prior decision). No registryDependencies either (each component is standalone with @lit-ui/core as peer dep).

### Pattern 2: CLI Template Embedding (templates/index.ts)

**What:** Component source code is embedded as template string exports in `packages/cli/src/templates/index.ts`. The `COMPONENT_TEMPLATES` record maps names to templates.
**When to use:** For copy-source CLI mode.
**Source:** `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/templates/index.ts`

Each component needs:
- `export const CHECKBOX_TEMPLATE = \`...\`;` (and CHECKBOX_GROUP_TEMPLATE)
- `export const RADIO_TEMPLATE = \`...\`;` (and RADIO_GROUP_TEMPLATE)
- `export const SWITCH_TEMPLATE = \`...\`;`
- Added to `COMPONENT_TEMPLATES` record

**Critical detail:** Templates must adjust import paths. NPM source uses `from '@lit-ui/core'` but copy-source template must use `from '../../lib/lit-ui/tailwind-element'`. The `dispatchCustomEvent` import also needs adjustment — in the copy-source template it should be inlined or imported from the local base file.

**Existing pattern from input template:**
```typescript
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
```

The new components import:
```typescript
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';
```

So templates need to adjust both to local paths. The `dispatchCustomEvent` utility must either be:
1. Included in the tailwind-element base file, OR
2. Inlined in the template (it's a simple function: dispatches a CustomEvent with bubbles/composed)

**Recommendation:** Check if `dispatchCustomEvent` is already in the copy-source base file. If not, inline it in templates.

### Pattern 3: CLI NPM Install Mapping (install-component.ts)

**What:** `componentToPackage` record in `packages/cli/src/utils/install-component.ts` maps CLI component names to npm package names.
**Source:** `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/utils/install-component.ts`

```typescript
export const componentToPackage: Record<string, string> = {
  button: '@lit-ui/button',
  dialog: '@lit-ui/dialog',
  input: '@lit-ui/input',
  textarea: '@lit-ui/textarea',
  select: '@lit-ui/select',
  checkbox: '@lit-ui/checkbox',   // ADD
  radio: '@lit-ui/radio',         // ADD
  switch: '@lit-ui/switch',       // ADD
};
```

### Pattern 4: Docs Page Structure (ComponentPage.tsx)

**What:** Each component docs page follows a consistent structure established by InputPage.tsx.
**Source:** `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/pages/components/InputPage.tsx`

Structure:
1. Import `FrameworkProvider`, `ExampleBlock`, `PropsTable`, `SlotsTable`, `PrevNextNav`, `CodeBlock`
2. Side-effect import to register custom elements: `import '@lit-ui/checkbox';`
3. Define props data array (PropDef[])
4. Define slots data array (SlotDef[])
5. Define CSS parts data array
6. Define CSS custom properties data array
7. Define code examples as template literal strings
8. Export page component with:
   - Header with title and description
   - Examples section with ExampleBlock components (preview + code tabs)
   - Custom Styling section (CSS vars + CSS parts)
   - API Reference section (props table, slots table, CSS vars table, CSS parts table, events)
   - PrevNextNav at bottom

**Critical detail:** Since web components use the same syntax across frameworks, the same code string is passed to all four framework tabs (html, react, vue, svelte).

### Pattern 5: JSX Type Declarations for Docs

**What:** Custom element JSX types must be declared for TypeScript to accept `<lui-checkbox>` etc. in React JSX.
**Source:** `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/components/LivePreview.tsx`

Existing elements (lui-button, lui-input, lui-textarea, lui-select, lui-option, lui-option-group) are declared in LivePreview.tsx. New elements (lui-checkbox, lui-checkbox-group, lui-radio, lui-radio-group, lui-switch) need to be added there.

### Pattern 6: Docs Navigation (nav.ts + App.tsx)

**What:** Two files need updating:
1. `apps/docs/src/nav.ts` — add items to the "Components" section
2. `apps/docs/src/App.tsx` — add route imports and Route elements

**Source:** Both files examined above.

Nav items should be added alphabetically in the Components section:
```typescript
{ title: "Button", href: "/components/button" },
{ title: "Checkbox", href: "/components/checkbox" },  // NEW
{ title: "Dialog", href: "/components/dialog" },
{ title: "Input", href: "/components/input" },
{ title: "Radio", href: "/components/radio" },         // NEW
{ title: "Select", href: "/components/select" },
{ title: "Switch", href: "/components/switch" },       // NEW
{ title: "Textarea", href: "/components/textarea" },
```

### Pattern 7: Docs Package Dependencies

**What:** The docs app package.json needs workspace dependencies for new component packages.
**Source:** `/Users/sn0w/Documents/dev/lit-components/apps/docs/package.json`

Add:
```json
"@lit-ui/checkbox": "workspace:*",
"@lit-ui/radio": "workspace:*",
"@lit-ui/switch": "workspace:*",
```

### Anti-Patterns to Avoid
- **Don't create new shared doc components:** Reuse ExampleBlock, PropsTable, SlotsTable, PrevNextNav, CodeBlock as-is.
- **Don't add framework-specific examples:** Web components use identical syntax in all frameworks; pass same code to all tabs.
- **Don't forget the group components:** Checkbox and Radio each have companion group components that need examples and API docs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Code syntax highlighting | Custom highlighter | Existing CodeBlock/ExampleBlock | Already built, supports all frameworks |
| Props documentation tables | Custom table | Existing PropsTable component | Consistent styling with other pages |
| Navigation management | Custom nav system | Existing nav.ts + App.tsx pattern | Already handles sections and routing |

**Key insight:** Everything needed already exists. This phase is pure content creation following established patterns.

## Common Pitfalls

### Pitfall 1: Forgetting dispatchCustomEvent in Copy-Source Templates
**What goes wrong:** Copy-source templates reference `dispatchCustomEvent` from `@lit-ui/core` but copy-source doesn't have that package available.
**Why it happens:** The NPM package source imports from `@lit-ui/core`, but templates use relative imports.
**How to avoid:** Either inline the helper or ensure the base tailwind-element file exports it.
**Warning signs:** Template compilation errors about missing import.

### Pitfall 2: Missing JSX Type Declarations for Group Components
**What goes wrong:** TypeScript errors when using `<lui-checkbox-group>` or `<lui-radio-group>` in docs pages.
**Why it happens:** Only individual component types are added, not their group companions.
**How to avoid:** Add all five custom elements to LivePreview.tsx JSX declarations: lui-checkbox, lui-checkbox-group, lui-radio, lui-radio-group, lui-switch.

### Pitfall 3: PrevNextNav Link Chain Breaks
**What goes wrong:** The prev/next navigation at the bottom of each page doesn't flow correctly after adding new pages.
**Why it happens:** New pages are inserted but adjacent pages' PrevNextNav props aren't updated.
**How to avoid:** After adding new pages, update the PrevNextNav on all adjacent component pages (the ones before and after the new pages in alphabetical order).

Current order becomes: Button -> Checkbox -> Dialog -> Input -> Radio -> Select -> Switch -> Textarea.
- ButtonPage: next = Checkbox (was Dialog)
- CheckboxPage: prev = Button, next = Dialog
- DialogPage: prev = Checkbox (was Button), next = Input
- InputPage: prev = Dialog, next = Radio (was Textarea)
- RadioPage: prev = Input, next = Select
- SelectPage: prev = Radio (was Textarea? check), next = Switch
- SwitchPage: prev = Select, next = Textarea
- TextareaPage: prev = Switch (was Select? check), next = whatever comes after

### Pitfall 4: Checkbox Template Needs Both Checkbox AND CheckboxGroup
**What goes wrong:** `npx lit-ui add checkbox` only installs checkbox.ts, missing checkbox-group.ts.
**Why it happens:** Registry entry only lists one file.
**How to avoid:** Registry entry must list BOTH files, following the Select pattern (3 files).

### Pitfall 5: Not Running pnpm install After Adding Workspace Dependencies
**What goes wrong:** Docs app can't resolve @lit-ui/checkbox, @lit-ui/radio, @lit-ui/switch imports.
**Why it happens:** Workspace dependencies added to package.json but pnpm lockfile not updated.
**How to avoid:** Run `pnpm install` after updating docs package.json.

## Code Examples

### Checkbox Docs Examples (key scenarios)
```html
<!-- Basic -->
<lui-checkbox label="Accept terms"></lui-checkbox>

<!-- Checked -->
<lui-checkbox checked label="Subscribed"></lui-checkbox>

<!-- Indeterminate -->
<lui-checkbox indeterminate label="Select all"></lui-checkbox>

<!-- Sizes -->
<lui-checkbox size="sm" label="Small"></lui-checkbox>
<lui-checkbox size="md" label="Medium"></lui-checkbox>
<lui-checkbox size="lg" label="Large"></lui-checkbox>

<!-- Disabled -->
<lui-checkbox disabled label="Disabled"></lui-checkbox>
<lui-checkbox disabled checked label="Disabled checked"></lui-checkbox>

<!-- Required -->
<lui-checkbox required label="I agree to terms"></lui-checkbox>

<!-- CheckboxGroup -->
<lui-checkbox-group label="Notifications" required>
  <lui-checkbox label="Email" name="notif" value="email"></lui-checkbox>
  <lui-checkbox label="SMS" name="notif" value="sms"></lui-checkbox>
  <lui-checkbox label="Push" name="notif" value="push"></lui-checkbox>
</lui-checkbox-group>

<!-- CheckboxGroup with select-all -->
<lui-checkbox-group label="Toppings" select-all>
  <lui-checkbox label="Cheese" name="top" value="cheese"></lui-checkbox>
  <lui-checkbox label="Pepperoni" name="top" value="pepperoni"></lui-checkbox>
  <lui-checkbox label="Mushroom" name="top" value="mushroom"></lui-checkbox>
</lui-checkbox-group>
```

### Radio Docs Examples (key scenarios)
```html
<!-- Basic RadioGroup -->
<lui-radio-group name="color" label="Favorite color">
  <lui-radio value="red" label="Red"></lui-radio>
  <lui-radio value="green" label="Green"></lui-radio>
  <lui-radio value="blue" label="Blue"></lui-radio>
</lui-radio-group>

<!-- With initial value -->
<lui-radio-group name="size" value="md" label="Size">
  <lui-radio value="sm" label="Small"></lui-radio>
  <lui-radio value="md" label="Medium"></lui-radio>
  <lui-radio value="lg" label="Large"></lui-radio>
</lui-radio-group>

<!-- Required -->
<lui-radio-group name="plan" label="Select a plan" required>
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="pro" label="Pro"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise"></lui-radio>
</lui-radio-group>

<!-- Disabled -->
<lui-radio-group name="status" label="Status" disabled>
  <lui-radio value="active" label="Active"></lui-radio>
  <lui-radio value="inactive" label="Inactive"></lui-radio>
</lui-radio-group>
```

### Switch Docs Examples (key scenarios)
```html
<!-- Basic -->
<lui-switch label="Notifications"></lui-switch>

<!-- Checked -->
<lui-switch checked label="Dark mode"></lui-switch>

<!-- Sizes -->
<lui-switch size="sm" label="Small"></lui-switch>
<lui-switch size="md" label="Medium"></lui-switch>
<lui-switch size="lg" label="Large"></lui-switch>

<!-- Disabled -->
<lui-switch disabled label="Disabled off"></lui-switch>
<lui-switch disabled checked label="Disabled on"></lui-switch>

<!-- Required -->
<lui-switch required label="Accept terms"></lui-switch>

<!-- Form participation -->
<lui-switch name="notifications" value="enabled" label="Enable notifications"></lui-switch>
```

### Component API Reference Data

**Checkbox props (8):** checked, disabled, required, indeterminate, name, value, label, size
**CheckboxGroup props (5):** label, disabled, required, error, select-all
**Radio props (5):** value, checked, disabled, label, size
**RadioGroup props (6):** name, value, required, disabled, label, error
**Switch props (7):** checked, disabled, required, name, value, label, size

**Events:**
- Checkbox: `ui-change` with `{ checked: boolean, value: string | null }`
- CheckboxGroup: `ui-change` with `{ allChecked: boolean, checkedCount: number, totalCount: number }` (from select-all)
- Radio: `ui-radio-change` (internal, consumed by RadioGroup)
- RadioGroup: `ui-change` with `{ value: string }`
- Switch: `ui-change` with `{ checked: boolean, value: string | null }`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Individual file per component in registry | Multi-file registry entries | v4.1 (Select) | Checkbox and Radio follow this pattern |
| Copy-source only CLI | Dual-mode (copy-source + npm) | v2.0 | Both modes need updating |

## Open Questions

1. **dispatchCustomEvent in copy-source templates**
   - What we know: NPM packages import from `@lit-ui/core`. Copy-source templates must use local imports.
   - What's unclear: Whether the base tailwind-element copy-source file already exports this utility.
   - Recommendation: Check at plan time; if missing, inline the helper (it's ~5 lines: create CustomEvent with bubbles+composed and dispatch).

2. **Template string escaping complexity**
   - What we know: Existing templates use complex escaping (backticks inside backticks, template literals with `\\\``)
   - What's unclear: The new components use `css\`...\`` and `html\`...\`` patterns that need escaping
   - Recommendation: Follow exact escaping pattern from INPUT_TEMPLATE and TEXTAREA_TEMPLATE which already handle this correctly with `tailwindBaseStyles`, `PropertyValues`, and `isServer` imports.

## Sources

### Primary (HIGH confidence)
- Direct codebase examination of all files listed above
- Component source files: packages/checkbox/src/*.ts, packages/radio/src/*.ts, packages/switch/src/*.ts
- CLI source files: packages/cli/src/registry/registry.json, packages/cli/src/templates/index.ts, packages/cli/src/utils/install-component.ts
- Docs source files: apps/docs/src/nav.ts, apps/docs/src/App.tsx, apps/docs/src/pages/components/InputPage.tsx

### Secondary (MEDIUM confidence)
- None needed — all patterns are directly observable in the codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already exist in workspace
- Architecture: HIGH — all patterns directly observable from existing components
- Pitfalls: HIGH — identified from actual code analysis, not speculation

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (stable patterns, internal project)
