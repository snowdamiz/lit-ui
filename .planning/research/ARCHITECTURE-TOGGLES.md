# Architecture Patterns: Checkbox, Radio, Switch Components

**Domain:** Toggle control components (Checkbox, Radio, Switch) with group containers
**Researched:** 2026-01-26
**Overall confidence:** HIGH (patterns well-established in existing codebase and ecosystem)

## Recommended Architecture

### Package Structure

Each component family gets its own package, following the existing monorepo convention (`@lit-ui/button`, `@lit-ui/input`, `@lit-ui/select`). Group containers ship inside the same package as their children because they are tightly coupled and always co-deployed.

| Package | Elements Registered | Rationale |
|---------|-------------------|-----------|
| `@lit-ui/checkbox` | `lui-checkbox`, `lui-checkbox-group` | Group is optional container; checkbox works standalone |
| `@lit-ui/radio` | `lui-radio`, `lui-radio-group` | Radio always needs a group conceptually, but `lui-radio` can exist without `lui-radio-group` element (implicit grouping by `name`) |
| `@lit-ui/switch` | `lui-switch` | Standalone only, no group needed |

**Why not a combined `@lit-ui/toggles` package?** The existing convention is one component family per package. Users who need only a switch should not pull in checkbox/radio code. Tree-shaking helps but separate packages are cleaner for the CLI copy-source mode where each component has its own registry entry.

**Why group inside the same package as the child?** The `@lit-ui/select` package already bundles `lui-select`, `lui-option`, and `lui-option-group` together. Groups are tightly coupled to their children (they query for specific child tag names, set properties on children directly). Separate packages would create awkward circular awareness.

### File Structure Per Package

```
packages/checkbox/
  src/
    checkbox.ts           # lui-checkbox element
    checkbox-group.ts     # lui-checkbox-group element
    index.ts              # Exports + element registration
    jsx.d.ts              # JSX type declarations
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts

packages/radio/
  src/
    radio.ts              # lui-radio element
    radio-group.ts        # lui-radio-group element
    index.ts
    jsx.d.ts
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts

packages/switch/
  src/
    switch.ts             # lui-switch element
    index.ts
    jsx.d.ts
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts
```

---

## Component Composition Diagram

```
lui-checkbox-group (role="group", aria-labelledby)
  +-- <slot @slotchange>
        +-- lui-checkbox (formAssociated, role="checkbox")
        +-- lui-checkbox (formAssociated, role="checkbox")

lui-radio-group (role="radiogroup", aria-labelledby, formAssociated)
  +-- <slot @slotchange>
        +-- lui-radio (role="radio", NOT formAssociated individually)
        +-- lui-radio (role="radio", NOT formAssociated individually)

lui-switch (formAssociated, role="switch")
  [standalone, no group]
```

### Key Distinction: Who Owns the Form Value?

This is the most critical architectural decision and differs between checkbox and radio:

| Component | Form Participant | FormData Shape | Why |
|-----------|-----------------|---------------|-----|
| `lui-checkbox` (standalone) | The checkbox itself (`formAssociated = true`) | `name=value` (if checked) | Like native `<input type="checkbox">` |
| `lui-checkbox` (in group) | Each checkbox individually (`formAssociated = true`) | Multiple `name=value` entries | Like native checkbox group: `hobby=reading&hobby=gaming` |
| `lui-checkbox-group` | NOT form-associated | N/A (children submit themselves) | Group is layout/a11y container only |
| `lui-radio-group` | The group itself (`formAssociated = true`) | Single `name=value` entry | Group owns mutual exclusion, tracks selected value |
| `lui-radio` (child) | NOT form-associated | N/A (group submits on behalf) | Radio has no independent form meaning |
| `lui-switch` | The switch itself (`formAssociated = true`) | `name=value` (if checked) | Like a single checkbox |

**Rationale for RadioGroup owning form value:** Native `<input type="radio">` elements use shared `name` to create implicit groups, with the browser managing mutual exclusion. Since custom elements cannot replicate this browser-level grouping, the `lui-radio-group` must explicitly manage both mutual exclusion and form submission. This matches Shoelace's `sl-radio-group` and Fluent UI's `fluent-radio-group` patterns.

**Rationale for CheckboxGroup NOT owning form value:** Checkboxes are independent selections. Each has its own checked state. The native pattern submits multiple FormData entries with the same name. Individual `lui-checkbox` elements handle this correctly via their own `ElementInternals`. The group is purely for layout, labeling, and optional aggregate validation (e.g., "select at least 2").

---

## Parent-Child Communication Pattern

### Pattern: Slot Discovery + Properties Down + Events Up

This matches the existing `lui-select` / `lui-option` pattern already proven in the codebase. The parent group discovers children via `slotchange`, sets properties on children imperatively, and children fire events that bubble up.

#### Step 1: Child Discovery via slotchange

```typescript
// In radio-group.ts (same pattern as select.ts line 1199)
private handleSlotChange(e: Event): void {
  const slot = e.target as HTMLSlotElement;
  const assigned = slot.assignedElements({ flatten: true });
  this.radios = assigned.filter(
    (el) => el.tagName === 'LUI-RADIO'
  ) as Radio[];

  // Sync state to discovered children
  this.syncChildStates();
}
```

**Why `slotchange` over MutationObserver?** The `slotchange` event fires when slotted elements are added/removed. It is the primary mechanism. However, the existing Select component also uses a MutationObserver as a secondary mechanism (`select.ts` line 1601) to catch attribute changes within children and dynamic insertions inside nested containers. For RadioGroup, `slotchange` alone should suffice since radios are direct slot children (no nesting like option-group), but a MutationObserver for subtree changes is a reasonable safety net worth considering.

#### Step 2: Properties Down (Parent Sets Child State)

The group sets properties directly on discovered child elements:

```typescript
// RadioGroup syncs checked state to children
private syncChildStates(): void {
  for (const radio of this.radios) {
    radio.checked = radio.value === this.value;
    radio.name = this.name;  // Propagate name for a11y
    if (this.disabled) radio.disabled = true;
    if (this.size) radio.size = this.size;
  }
  this.updateTabindex();
}
```

**Why direct property setting over events?** Setting properties on children is:
1. Synchronous and predictable
2. Already the pattern used in `select.ts` (line 1220-1228: setting `dataset.optionIndex`, `selected`, `multiselect`)
3. More efficient than events for state synchronization
4. The Lit-recommended pattern ("properties down")

#### Step 3: Events Up (Child Notifies Parent)

Children fire `composed: true` custom events that cross Shadow DOM boundaries:

```typescript
// In radio.ts - when user clicks/activates
private handleChange(): void {
  dispatchCustomEvent(this, 'ui-radio-change', {
    value: this.value,
    checked: true,
  });
}
```

The group listens for these events:

```typescript
// In radio-group.ts render()
render() {
  return html`
    <div role="radiogroup"
         aria-labelledby=${this.labelId}
         @ui-radio-change=${this.handleRadioChange}
         @keydown=${this.handleKeyDown}>
      <slot @slotchange=${this.handleSlotChange}></slot>
    </div>
  `;
}
```

**Why `composed: true` events?** The `dispatchCustomEvent` helper in `@lit-ui/core` already defaults to `{ bubbles: true, composed: true }` (see `events.ts` line 14-17). Events must be `composed` to cross Shadow DOM boundaries from child to parent. The group listens on its own shadow root element.

#### Alternative Considered: Controller/Context Pattern

Lit's `@lit/context` provides a `ContextProvider`/`ContextConsumer` pattern for ancestor-descendant communication without events. This was considered but rejected because:

1. It adds a new dependency (`@lit/context`) not currently in the project
2. The existing codebase consistently uses slotchange + direct property setting
3. Context is better for deeply nested or unknown-depth communication; group children are always direct slot children
4. The slotchange pattern is proven in the Select component

### Communication Flow Diagram

```
USER INTERACTION
     |
     v
[lui-radio] click/keyboard
     |
     | dispatches 'ui-radio-change' (composed: true, bubbles: true)
     |
     v
[lui-radio-group] @ui-radio-change handler
     |
     | 1. Updates this.value
     | 2. Calls syncChildStates() - sets checked=true/false on all radios
     | 3. Updates form value via ElementInternals.setFormValue()
     | 4. Dispatches 'ui-change' for consumer applications
     |
     v
[Consumer app] @ui-change handler
```

---

## Keyboard Navigation Architecture

### Roving Tabindex for RadioGroup

Per WAI-ARIA Radio Group Pattern (W3C APG), radio groups use **roving tabindex**:

- Only the checked radio (or first radio if none checked) has `tabindex="0"`
- All other radios have `tabindex="-1"`
- Arrow keys move focus and selection between radios
- Tab moves focus out of the group entirely

```typescript
// RadioGroup manages tabindex on children
private updateTabindex(): void {
  const checkedRadio = this.radios.find(r => r.checked);
  const focusTarget = checkedRadio || this.radios.find(r => !r.disabled);

  for (const radio of this.radios) {
    radio.tabIndex = radio === focusTarget ? 0 : -1;
  }
}

// Arrow key handling lives on the RadioGroup container
private handleKeyDown(e: KeyboardEvent): void {
  if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
  e.preventDefault();

  const enabledRadios = this.radios.filter(r => !r.disabled);
  const currentIndex = enabledRadios.findIndex(r => r.tabIndex === 0);

  const forward = e.key === 'ArrowDown' || e.key === 'ArrowRight';
  const nextIndex = forward
    ? (currentIndex + 1) % enabledRadios.length
    : (currentIndex - 1 + enabledRadios.length) % enabledRadios.length;

  // Move focus and select
  enabledRadios[nextIndex].focus();
  this.value = enabledRadios[nextIndex].value;
  this.syncChildStates();
  this.updateFormValue();
}
```

**Where does the keydown handler live?** On the RadioGroup's `role="radiogroup"` container `div`, not on individual radios. The group manages all keyboard navigation centrally. This is consistent with the Select component managing keyboard navigation in its own keydown handler.

### Individual Tabindex for CheckboxGroup

Checkboxes do NOT use roving tabindex. Each checkbox is independently focusable with `tabindex="0"`. Users tab between checkboxes normally. Space toggles the focused checkbox. This matches native checkbox behavior.

### Switch Keyboard

Switch uses Space to toggle (same as checkbox). It is a single focusable element, no group navigation needed.

---

## ARIA Roles and Attributes

### Checkbox

| Element | Role | Key Attributes |
|---------|------|---------------|
| `lui-checkbox` control div | `checkbox` | `aria-checked`, `aria-disabled`, `aria-required`, `aria-describedby` |
| `lui-checkbox-group` wrapper div | `group` | `aria-labelledby` (pointing to group label) |

### Radio

| Element | Role | Key Attributes |
|---------|------|---------------|
| `lui-radio-group` wrapper div | `radiogroup` | `aria-labelledby`, `aria-required`, `aria-disabled` |
| `lui-radio` control div | `radio` | `aria-checked`, `aria-disabled` |

### Switch

| Element | Role | Key Attributes |
|---------|------|---------------|
| `lui-switch` control div | `switch` | `aria-checked`, `aria-disabled`, `aria-required` |

---

## Shared Patterns Across All Three Components

### Common Property Surface

All three toggle controls share significant structural overlap:

```typescript
// Common to Checkbox, Radio, Switch
// (Radio: formAssociated = false; RadioGroup: formAssociated = true)
static formAssociated = true;

@property({ type: Boolean, reflect: true }) checked = false;
@property({ type: Boolean, reflect: true }) disabled = false;
@property({ type: Boolean, reflect: true }) required = false;
@property({ type: String }) name = '';
@property({ type: String }) value = '';   // default 'on' for checkbox/switch
@property({ type: String }) label = '';
@property({ type: String }) size: 'sm' | 'md' | 'lg' = 'md';
```

**Should there be a shared mixin/base class?** No. The existing codebase does not use mixins -- `Input` and `Select` share similar form patterns but implement them independently. The duplication is small (constructor with `attachInternals`, `formResetCallback`, `formDisabledCallback`, `updateFormValue`) and keeping components self-contained avoids coupling and simplifies the CLI copy-source mode where users copy individual component files.

### CSS Token Pattern

Following existing `--ui-input-*` and `--ui-select-*` naming conventions:

```css
/* Checkbox tokens */
--ui-checkbox-size
--ui-checkbox-radius
--ui-checkbox-border
--ui-checkbox-border-checked
--ui-checkbox-bg
--ui-checkbox-bg-checked
--ui-checkbox-check-color
--ui-checkbox-label-gap

/* Radio tokens */
--ui-radio-size
--ui-radio-border
--ui-radio-border-checked
--ui-radio-bg
--ui-radio-bg-checked
--ui-radio-dot-color
--ui-radio-label-gap

/* Switch tokens */
--ui-switch-width
--ui-switch-height
--ui-switch-radius
--ui-switch-border
--ui-switch-bg
--ui-switch-bg-checked
--ui-switch-thumb-size
--ui-switch-thumb-color
--ui-switch-label-gap
```

### Event Naming Convention

Follow existing pattern where `@lit-ui/core`'s `dispatchCustomEvent` uses `ui-` prefix:

| Event | Emitted By | Detail | Purpose |
|-------|-----------|--------|---------|
| `ui-change` | checkbox, radio-group, switch | `{ value, checked }` | Consumer-facing state change |
| `ui-input` | checkbox, radio-group, switch | `{ value, checked }` | Fires on user interaction (before change settles) |
| `ui-radio-change` | radio (internal only) | `{ value }` | Internal: child notifies parent group |

---

## Group Validation Architecture

### RadioGroup Validation

RadioGroup owns form participation, so it handles validation via `ElementInternals`:

```typescript
// RadioGroup validation
private validate(): void {
  if (this.required && !this.value) {
    this.internals?.setValidity(
      { valueMissing: true },
      'Please select an option.',
      this.radios[0]  // anchor for popup positioning
    );
  } else {
    this.internals?.setValidity({});
  }
}
```

### CheckboxGroup Aggregate Validation

CheckboxGroup is NOT form-associated but can provide aggregate validation UI (e.g., "select at least 2"). This is done via properties, not ElementInternals:

```typescript
// CheckboxGroup validates via properties, shows error UI only
@property({ type: Number }) min?: number;  // minimum selections required
@property({ type: Number }) max?: number;  // maximum selections allowed

private get checkedCount(): number {
  return this.checkboxes.filter(c => c.checked).length;
}

private get isValid(): boolean {
  if (this.min !== undefined && this.checkedCount < this.min) return false;
  if (this.max !== undefined && this.checkedCount > this.max) return false;
  return true;
}
```

The group displays validation messages but individual checkboxes handle their own form submission. This avoids the group needing to "wrap" or "replace" child form values.

---

## SSR Compatibility

All three components follow the established SSR pattern from `TailwindElement`:

1. `isServer` guard around `attachInternals()` in constructor
2. `isServer` guard in `connectedCallback` for client-only setup (event listeners, observers)
3. `tailwindBaseStyles` spread in static styles for SSR inline CSS
4. No DOM APIs (`document`, `MutationObserver`, `ResizeObserver`) without `isServer` guards

Groups need additional SSR consideration: `slotchange` does not fire during SSR. Initial state must be derivable from properties alone (e.g., RadioGroup's `value` property determines which radio renders as checked during SSR). The `syncChildStates()` call should also run in `firstUpdated()` on the client to catch the initial state.

---

## Suggested Build Order

Based on dependency analysis and incremental complexity:

### Phase 1: Switch (standalone, simplest)

- No parent-child communication needed
- Direct form participation pattern (same as `lui-input`)
- Single element, single package
- Validates the toggle visual pattern (track + thumb CSS)
- **Depends on:** `@lit-ui/core` only
- **Complexity:** Low

### Phase 2: Checkbox + CheckboxGroup

- Checkbox standalone works like Switch (same form pattern)
- CheckboxGroup adds slot-based child discovery (proven in Select)
- CheckboxGroup does NOT own form value (simpler than RadioGroup)
- Each checkbox independently form-associated
- Indeterminate state adds minor complexity
- **Depends on:** `@lit-ui/core` only
- **Complexity:** Medium

### Phase 3: Radio + RadioGroup

- Most complex: RadioGroup owns form value AND mutual exclusion
- Requires roving tabindex keyboard navigation (new pattern not yet in codebase)
- Requires state synchronization (group sets checked on children)
- Benefits from lessons learned in CheckboxGroup slot pattern
- **Depends on:** `@lit-ui/core` only
- **Complexity:** High

**Why this order?**
1. Switch proves the toggle visual/interaction pattern with zero group complexity
2. Checkbox introduces group slot communication without form ownership complexity
3. Radio builds on group pattern but adds form ownership and roving tabindex
4. Each phase is independently shippable and valuable

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Individual Radios as Form Participants

**What:** Making each `lui-radio` have `formAssociated = true` and trying to coordinate form values across siblings.
**Why bad:** There is no web platform mechanism for custom elements to discover same-named siblings across Shadow DOM boundaries. Native radios rely on browser-internal grouping by name within a form. Custom elements cannot replicate this. The group must own the form value.
**Instead:** RadioGroup is `formAssociated = true`. Individual radios are not.

### Anti-Pattern 2: Using `@lit/context` for Direct Slot Children

**What:** Introducing a Context provider/consumer for group-to-child communication.
**Why bad:** Overkill for direct slot children. Adds a dependency not in the project. The slotchange + property-setting pattern is simpler, proven in the codebase, and sufficient for one level of depth.
**Instead:** Use slotchange + direct property setting (the existing Select pattern).

### Anti-Pattern 3: Shared FormAssociated Mixin

**What:** Creating a base mixin that Checkbox, Radio, Switch all extend for form participation.
**Why bad:** The existing codebase intentionally avoids mixins -- Input, Textarea, and Select all implement form participation independently. The CLI copy-source mode requires self-contained files. A mixin creates a hidden dependency that breaks copy-paste usability.
**Instead:** Duplicate the small form participation boilerplate in each component.

### Anti-Pattern 4: CheckboxGroup as Form Participant

**What:** Making `lui-checkbox-group` `formAssociated = true` and submitting an array/joined value.
**Why bad:** Breaks the native checkbox form pattern where each checkbox submits independently. Makes it impossible to have checkboxes with different names in a group. Forces consumers to parse a single joined value instead of getting standard FormData entries.
**Instead:** CheckboxGroup is a layout/a11y container only. Each checkbox submits its own form value.

### Anti-Pattern 5: Keyboard Handler on Individual Radios

**What:** Each radio managing its own arrow key navigation.
**Why bad:** Individual radios do not know about their siblings. Navigation requires knowledge of the full group (which radio is next, wrapping, skipping disabled). This logic must live in the group.
**Instead:** RadioGroup handles all keydown events and manages focus across children.

---

## Sources

- [Lit Component Composition Documentation](https://lit.dev/docs/composition/component-composition/) - Properties down, events up pattern (HIGH confidence)
- [Shoelace Radio Group](https://shoelace.style/components/radio-group) - Reference implementation: group owns form value, propagates size to children (HIGH confidence)
- [Shoelace Radio](https://shoelace.style/components/radio) - Reference child component: value, size, disabled properties (HIGH confidence)
- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) - Keyboard navigation specification, roving tabindex (HIGH confidence)
- [W3C APG Radio Group Roving Tabindex Example](https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio/) - Concrete roving tabindex implementation (HIGH confidence)
- [Fluent UI ElementInternals Radio/RadioGroup PR #31783](https://github.com/microsoft/fluentui/pull/31783) - RadioGroup with ElementInternals pattern (MEDIUM confidence)
- [Form-Associated Custom Elements Guide](https://bennypowers.dev/posts/form-associated-custom-elements/) - ElementInternals patterns and form lifecycle (MEDIUM confidence)
- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) - API reference (HIGH confidence)
- [MDN ARIA radiogroup role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/radiogroup_role) - Role and attribute requirements (HIGH confidence)
- Existing codebase: `packages/select/src/select.ts` lines 1196-1232 - Proven slotchange + property-setting pattern (HIGH confidence, primary source)
- Existing codebase: `packages/select/src/index.ts` - Multi-element package registration pattern (HIGH confidence, primary source)
- Existing codebase: `packages/core/src/utils/events.ts` - dispatchCustomEvent with composed:true default (HIGH confidence, primary source)
- Existing codebase: `packages/input/src/input.ts` - Form participation pattern with ElementInternals (HIGH confidence, primary source)
