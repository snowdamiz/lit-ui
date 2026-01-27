# Pitfalls Research: Checkbox, Radio, Switch & Group Components

**Domain:** Toggle control web components (Checkbox, Radio, Switch) with group containers for LitUI
**Researched:** 2026-01-26
**Confidence:** HIGH (W3C APG, MDN, Adrian Roselli, Nolan Lawson, Google HowTo Components)

---

## Critical Pitfalls

Mistakes that cause broken accessibility, rewrite-level rework, or silent form submission failures.

---

### Pitfall 1: Radio Buttons as Separate Web Components Break Native Grouping

**What goes wrong:** Building each radio button as an independent `<lui-radio>` web component with its own shadow DOM means the internal `<input type="radio">` elements are isolated in separate shadow roots. Even if they share a `name` attribute, the browser does not treat them as a group -- checking one does not uncheck the others. Arrow-key navigation between them fails completely.

**Why it happens:** Shadow DOM encapsulation scopes form controls. Native radio grouping depends on inputs sharing the same name within the same form/document context. Shadow boundaries prevent this.

**Consequences:**
- Multiple radios can be checked simultaneously
- Arrow key navigation does not work between radios
- Form data contains multiple conflicting values
- Screen readers do not announce "X of Y" position information

**Warning signs:**
- Clicking one radio does not deselect others
- Tab key moves between individual radios instead of arrow keys
- FormData contains duplicate radio name entries

**Prevention:**
The group container (`<lui-radio-group>`) must own all state and keyboard navigation. Individual `<lui-radio>` items should be presentational children, not independent form participants. Two viable approaches:

1. **Group-as-form-element (RECOMMENDED for LitUI):** The `<lui-radio-group>` is the form-associated custom element (with `ElementInternals`). Individual `<lui-radio>` elements are purely visual/semantic. The group manages `setFormValue()` with the selected radio's value.

2. **Light DOM inputs with web component wrapper:** Place native `<input type="radio">` in light DOM, wrap with styling web component. Gets native grouping free but limits Shadow DOM styling control.

```typescript
// WRONG: Each radio is form-associated independently
class Radio extends TailwindElement {
  static formAssociated = true; // Don't do this for individual radios
}

// CORRECT: Group is the form-associated element
class RadioGroup extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;

  private handleSelection(value: string) {
    this.value = value;
    this.internals?.setFormValue(value);
  }
}
```

**Phase to address:** Phase 1 (Component Architecture) -- this is a foundational API decision

**Confidence:** HIGH -- [Google HowTo Radio Group](https://googlechromelabs.github.io/howto-components/howto-radio-group/), [Filament Group Forms](https://www.filamentgroup.com/lab/forms-with-custom-elements/), [Benny Powers FACE](https://bennypowers.dev/posts/form-associated-custom-elements/)

---

### Pitfall 2: Roving Tabindex Fails When Radio Items Are in Separate Shadow DOMs

**What goes wrong:** Roving tabindex requires setting `tabindex="0"` on the active item and `tabindex="-1"` on all others. If each radio item is a web component with its own shadow root, the group parent cannot directly manipulate the tabindex of elements inside children's shadow DOMs. The group needs to coordinate with children, but `querySelector` cannot reach into shadow roots.

**Why it happens:** Shadow DOM encapsulation prevents parent components from directly accessing child shadow DOM internals. `element.focus()` works on the host element but roving tabindex needs coordination on the internal focusable element.

**Consequences:**
- Tab stops on every radio instead of one
- Arrow key navigation skips items or gets stuck
- Screen readers do not treat the group as a single tab stop

**Warning signs:**
- Pressing Tab moves through each radio individually
- Arrow keys don't move between radios
- Focus ring appears on wrong element

**Prevention:**
Use **roving tabindex on the host elements** (the `<lui-radio>` custom elements themselves), not on elements inside their shadow DOMs. The group manages tabindex on its direct children.

```typescript
// RadioGroup manages tabindex on child host elements
class RadioGroup extends TailwindElement {
  private updateRovingTabindex() {
    const radios = this.querySelectorAll('lui-radio:not([disabled])');
    radios.forEach((radio, i) => {
      if (radio === this.activeRadio) {
        radio.setAttribute('tabindex', '0');
      } else {
        radio.setAttribute('tabindex', '-1');
      }
    });
  }

  private handleKeyDown(e: KeyboardEvent) {
    const radios = [...this.querySelectorAll('lui-radio:not([disabled])')];
    const current = radios.indexOf(this.activeRadio);

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const next = (current + 1) % radios.length; // WRAP
        this.selectRadio(radios[next]);
        radios[next].focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prev = (current - 1 + radios.length) % radios.length; // WRAP
        this.selectRadio(radios[prev]);
        radios[prev].focus();
        break;
    }
  }
}

// Individual radio delegates focus to host
class Radio extends TailwindElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
}
```

**Key detail:** Arrow keys in radio groups MUST wrap (first to last, last to first). This differs from listbox navigation which stops at boundaries. Forgetting to wrap is a common mistake.

**Phase to address:** Phase 1 (Keyboard Navigation) -- must be designed alongside component architecture

**Confidence:** HIGH -- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), [APG Keyboard Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [Google HowTo Radio Group](https://googlechromelabs.github.io/howto-components/howto-radio-group/)

---

### Pitfall 3: aria-controls on Mixed-State Checkbox Cannot Cross Shadow DOM Boundaries

**What goes wrong:** The WAI-ARIA mixed-state checkbox pattern requires `aria-controls="id1 id2 id3"` on the parent checkbox, referencing child checkboxes by their IDs. If the parent checkbox is in a group component's shadow DOM and child checkboxes are slotted light DOM elements (or vice versa), the ID references are invisible across the shadow boundary.

**Why it happens:** ARIA ID references (`aria-controls`, `aria-labelledby`, `aria-describedby`, `aria-activedescendant`) are scoped to their DOM tree. Shadow DOM creates separate DOM trees. IDs in light DOM cannot be referenced from shadow DOM and vice versa. This is the core "Shadow DOM vs ARIA" conflict documented extensively by Nolan Lawson and Alice Boxhall.

**Consequences:**
- Screen readers cannot associate parent checkbox with controlled children
- `aria-controls` silently fails (no error, just broken)
- Parent "select all" checkbox lacks semantic connection to children

**Warning signs:**
- Screen reader does not announce controlled elements
- Accessibility audit tools flag orphaned `aria-controls` references
- Pattern works in tests without shadow DOM but fails in actual component

**Prevention:**
Keep the parent "select all" checkbox and child checkboxes in the SAME DOM tree. Two approaches:

1. **All in shadow DOM:** The `<lui-checkbox-group>` renders both the parent "select all" checkbox and child checkbox visuals entirely in its shadow DOM, reading data from slotted `<lui-checkbox>` elements but rendering the actual ARIA markup internally.

2. **All in light DOM (simpler):** The group component only adds behavior/styling. The actual checkbox elements with `aria-controls` references all exist in the light DOM together. This is the pragmatic approach until Cross-Root ARIA (Reference Target) ships.

3. **Skip aria-controls entirely:** Some accessibility experts argue that `aria-controls` has such poor screen reader support that omitting it has no practical impact. Instead, rely on visual proximity and a clear label like "Select all" to convey the relationship.

```typescript
// Pragmatic approach: skip aria-controls, use clear labeling
render() {
  return html`
    <div role="group" aria-labelledby="group-label">
      <span id="group-label">${this.label}</span>
      <!-- "Select all" checkbox with descriptive label -->
      <div
        role="checkbox"
        aria-checked=${this.allChecked ? 'true' : this.someChecked ? 'mixed' : 'false'}
        aria-label="Select all ${this.label}"
        tabindex="0"
      ></div>
      <slot></slot>
    </div>
  `;
}
```

**Phase to address:** Phase 2 (Indeterminate/Mixed State) -- only relevant when implementing parent-child checkbox patterns

**Confidence:** HIGH -- [Nolan Lawson: Shadow DOM and ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/), [Alice Boxhall: Shadow DOM Conflict](https://alice.pages.igalia.com/blog/how-shadow-dom-and-accessibility-are-in-conflict/), [W3C APG Mixed Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/)

---

### Pitfall 4: role="switch" Screen Reader Inconsistency

**What goes wrong:** The `role="switch"` is not consistently announced as "switch" across screen reader and browser combinations. VoiceOver (iOS/macOS) announces switches as "checkboxes." NVDA+Firefox announces switches as "checkboxes." Only some combinations (TalkBack+Firefox, VoiceOver+Safari desktop) announce correctly. Users may not understand that this is an on/off toggle rather than a check/uncheck control.

**Why it happens:** `role="switch"` is relatively newer than `role="checkbox"`. Screen readers have been slow to implement distinct switch announcements. Some AT vendors treat switch as a checkbox subtype.

**Consequences:**
- Users hear "checkbox" instead of "switch" -- may expect different interaction model
- On/off semantics lost; "checked/unchecked" announced instead of "on/off"
- Inconsistent experience across browsers and screen readers

**Warning signs:**
- VoiceOver says "checkbox" for your switch component
- Users confused by "checked" vs "on" language
- QA testing on single browser/SR misses cross-platform issues

**Prevention:**
1. **Still use `role="switch"`** -- it is the correct semantic. Screen reader support is improving and the spec is clear.
2. **Never use `aria-checked="mixed"` on switches** -- the switch role does not support the `mixed` value. Chrome incorrectly exposes it as `true`, TalkBack announces it as "on". The spec says it maps to `false`.
3. **Test with at minimum:** VoiceOver+Safari (macOS), NVDA+Chrome (Windows), TalkBack+Chrome (Android).
4. **Use visual design to reinforce semantics** -- the switch should visually look like a toggle (sliding thumb) not a checkbox, so even if the SR says "checkbox," the visual clearly communicates "toggle."
5. **Consider `<input type="checkbox" role="switch">` as base** -- gets native form participation free, adds switch semantics. But do NOT set `aria-checked` on native checkboxes (use the `checked` property instead).

```typescript
// Option A: Custom div with role="switch"
render() {
  return html`
    <div
      role="switch"
      aria-checked=${this.checked ? 'true' : 'false'}
      aria-labelledby="label"
      tabindex="0"
      @click=${this.toggle}
      @keydown=${this.handleKeyDown}
    >
      <span class="thumb"></span>
    </div>
  `;
}

// Option B: Native checkbox with switch role (gets form participation)
render() {
  return html`
    <input
      type="checkbox"
      role="switch"
      .checked=${this.checked}
      @change=${this.handleChange}
    />
  `;
}
```

**Phase to address:** Phase 1 (Switch Component) -- fundamental ARIA decision

**Confidence:** HIGH -- [Adrian Roselli: Switch Role Support](https://adrianroselli.com/2021/10/switch-role-support.html), [MDN: switch role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/switch_role), [Scott O'Hara: ARIA Switch](https://scottaohara.github.io/aria-switch-control/)

---

### Pitfall 5: Checkbox Group Form Submission Loses Unchecked Values

**What goes wrong:** Native HTML checkboxes only submit their value when checked -- unchecked checkboxes submit nothing. Developers expect form data to include all checkboxes with true/false values. When using `ElementInternals.setFormValue()` for a checkbox group, calling `setFormValue(null)` when nothing is checked removes the field entirely from FormData. Server-side code that expects the field to always be present fails.

**Why it happens:** This matches native checkbox behavior, but developers building groups often expect array semantics where every option is represented.

**Consequences:**
- Server receives no data for the checkbox group when nothing is checked
- Difficult to distinguish "user unchecked everything" from "field was not in the form"
- Backend validation may reject submissions with missing fields

**Warning signs:**
- `FormData.has('fieldName')` returns false when all checkboxes unchecked
- Server-side framework throws "required field missing" errors
- Difference in behavior between individual checkbox and group

**Prevention:**
For a `<lui-checkbox-group>` component, decide on the submission model early:

```typescript
// Approach 1: Submit only checked values (matches native behavior)
private updateFormValue() {
  const checked = this.getCheckedValues();
  if (checked.length === 0) {
    this.internals?.setFormValue(null); // Remove from form data
  } else {
    const fd = new FormData();
    checked.forEach(v => fd.append(this.name, v));
    this.internals?.setFormValue(fd);
  }
}

// Approach 2: Always submit, empty string when none checked
private updateFormValue() {
  const checked = this.getCheckedValues();
  if (checked.length === 0) {
    this.internals?.setFormValue(''); // Present but empty
  } else {
    const fd = new FormData();
    checked.forEach(v => fd.append(this.name, v));
    this.internals?.setFormValue(fd);
  }
}
```

**Document whichever approach is chosen.** Approach 1 matches native behavior. Approach 2 is more developer-friendly for server-side frameworks.

**Phase to address:** Phase 1 (Form Participation) -- for both individual checkbox and checkbox group

**Confidence:** HIGH -- [MDN setFormValue](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue), [WebKit ElementInternals](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/), [web.dev Form Controls](https://web.dev/articles/more-capable-form-controls)

---

## Moderate Pitfalls

Mistakes that cause accessibility issues, user confusion, or technical debt requiring targeted fixes.

---

### Pitfall 6: Indeterminate State is Visual-Only But Developers Treat It as a Third Value

**What goes wrong:** Developers implement `aria-checked="mixed"` and treat indeterminate as a submittable form value. But indeterminate/mixed is purely visual -- it does not affect what gets submitted. A checkbox is either checked or unchecked for form submission purposes, regardless of indeterminate display. Building logic that depends on "is indeterminate" as a form state leads to broken submissions.

**Why it happens:** The visual mixed state looks like a distinct value. Developers assume it corresponds to a third form value.

**Consequences:**
- Form submissions contain unexpected values
- Server-side validation confused by missing "mixed" state
- Parent checkbox submits wrong value

**Warning signs:**
- Code has three-way value logic: true/false/mixed for form submission
- `setFormValue('mixed')` or `setFormValue('indeterminate')` in codebase
- Tests check for indeterminate in FormData

**Prevention:**
- `aria-checked="mixed"` is for ARIA/screen readers only
- The checkbox's actual form value is determined solely by checked/unchecked
- Indeterminate state must be computed from children, not stored as own state
- Never submit "mixed" or "indeterminate" as a form value

```typescript
// Parent checkbox in a mixed-state pattern
// The parent does NOT participate in form submission
// Only child checkboxes submit their values
get ariaState(): string {
  const checked = this.childCheckboxes.filter(c => c.checked);
  if (checked.length === 0) return 'false';
  if (checked.length === this.childCheckboxes.length) return 'true';
  return 'mixed'; // Visual/ARIA only, not a form value
}
```

**Phase to address:** Phase 2 (Indeterminate Checkbox) -- when implementing parent-child patterns

**Confidence:** HIGH -- [MDN :indeterminate](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:indeterminate), [CSS-Tricks Indeterminate Checkboxes](https://css-tricks.com/indeterminate-checkboxes/), [W3C APG Mixed Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/)

---

### Pitfall 7: Radio Group Arrow Keys Change Selection (Unlike Checkbox Groups)

**What goes wrong:** Developers apply the same keyboard pattern to both radio groups and checkbox groups. In a radio group, arrow keys both move focus AND change selection (check the new radio, uncheck the previous). In a checkbox group, arrow keys should ONLY move focus -- Space toggles the checkbox. Applying radio semantics to checkbox groups means users accidentally toggle checkboxes by arrowing through them.

**Why it happens:** Both patterns use arrow keys for navigation, so they seem identical. The difference in selection behavior is subtle but critical.

**Consequences:**
- Checkbox group: arrow keys accidentally check/uncheck items
- Radio group: Space key doesn't work (if modeled after checkbox)
- Users lose selections while navigating

**Warning signs:**
- Arrowing through checkbox group toggles checkboxes
- Space key in radio group doesn't select
- Shared keyboard handler for both group types

**Prevention:**
Implement separate keyboard handlers:

| Key | Radio Group | Checkbox Group |
|-----|------------|----------------|
| Arrow Up/Down | Move focus AND select | Move focus only |
| Arrow Left/Right | Move focus AND select | (Not required) |
| Space | Check focused radio | Toggle focused checkbox |
| Home/End | Not required (optional) | Not required (optional) |
| Tab | Exit group | Move between checkboxes (or exit) |

**Important nuance:** For radio groups, the APG specifies that arrow keys should wrap (last to first, first to last). Tab should exit the group entirely -- the whole radio group is a single tab stop.

For checkbox groups, the APG does NOT specify roving tabindex. Each checkbox is typically an independent tab stop. However, some implementations use roving tabindex for consistency with radio groups. Choose one approach and document it.

**Phase to address:** Phase 1 (Keyboard Navigation) -- design the keyboard model before implementation

**Confidence:** HIGH -- [W3C APG Radio Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), [W3C APG Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

---

### Pitfall 8: Using aria-activedescendant Instead of Roving Tabindex for Radio/Checkbox Groups

**What goes wrong:** Developers choose `aria-activedescendant` for managing focus in radio/checkbox groups because it seems simpler (no tabindex juggling). But `aria-activedescendant` requires ID references that cannot cross shadow DOM boundaries. It also has significantly worse screen reader support than roving tabindex -- VoiceOver ignores it in many contexts, and the browser does not auto-scroll to the active element.

**Why it happens:** `aria-activedescendant` is documented in the APG as an alternative to roving tabindex. For combobox/listbox (like LitUI's Select), it is the standard pattern. Developers generalize it to all composite widgets.

**Consequences:**
- Screen readers do not announce the focused radio/checkbox
- Active element not scrolled into view (long groups)
- Shadow DOM breaks ID references silently
- VoiceOver + Safari may ignore the active descendant entirely

**Warning signs:**
- Screen reader does not announce current item in group
- Items off-screen are "focused" but not scrolled to
- Works in Chrome but fails in Safari

**Prevention:**
**Use roving tabindex for radio and checkbox groups. Use aria-activedescendant only for combobox/listbox patterns** (where a text input retains focus).

LitUI's Select already uses `aria-activedescendant` correctly for its combobox pattern. Radio and checkbox groups are different -- there is no text input maintaining focus. Use roving tabindex where actual DOM focus moves between items.

```typescript
// CORRECT for radio/checkbox groups: roving tabindex
private focusItem(item: HTMLElement) {
  // Remove tabindex from all
  this.items.forEach(i => i.setAttribute('tabindex', '-1'));
  // Set on active item
  item.setAttribute('tabindex', '0');
  item.focus(); // Actual DOM focus -- scroll + screen reader announcement
}

// WRONG for radio/checkbox groups: aria-activedescendant
// (Use this only for combobox/listbox patterns like lui-select)
```

**Phase to address:** Phase 1 (Architecture Decision) -- choose focus management strategy before building

**Confidence:** HIGH -- [Zell Liew: focus vs activedescendant](https://zellwk.com/blog/element-focus-vs-aria-activedescendant/), [APG Keyboard Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [Nolan Lawson: Shadow DOM + ARIA](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)

---

### Pitfall 9: Switch Animation Ignores prefers-reduced-motion

**What goes wrong:** The switch component's sliding thumb animation plays regardless of the user's motion preference. For users with vestibular disorders, even small repeated toggle animations can cause discomfort, especially when rapidly toggling or when multiple switches appear on a settings page.

**Why it happens:** Developers focus on making the animation look good and forget the reduced-motion media query. Or they apply it to page-level animations but miss component-level transitions.

**Consequences:**
- WCAG 2.3.3 (AAA) violation -- non-essential animation without user control
- Users with vestibular disorders experience discomfort
- Accessibility audits flag the issue

**Warning signs:**
- Switch thumb slides smoothly even with "Reduce motion" enabled in OS
- No `prefers-reduced-motion` media query in component styles
- Animation tests do not cover reduced-motion preference

**Prevention:**

```css
/* Switch thumb transition */
.switch-thumb {
  transition: transform 150ms ease-in-out;
}

/* Respect user preference: reduce, not remove */
@media (prefers-reduced-motion: reduce) {
  .switch-thumb {
    transition-duration: 0ms;
    /* Or use a very short duration: 1ms */
  }
}
```

**Apply the same pattern to:**
- Checkbox check mark animation (if animated)
- Radio dot fill animation (if animated)
- Focus ring transitions (keep these -- they are functional, not decorative)

**Important:** `prefers-reduced-motion: reduce` means reduce, not eliminate all motion. Functional transitions like focus indicators should still work. Only decorative/non-essential animations should be disabled.

LitUI's Dialog component already handles animations -- follow whatever pattern was established there.

**Phase to address:** Phase 1 (Styling) -- include from the start, not as an afterthought

**Confidence:** HIGH -- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [Kitty Giraudel: Accessible Toggle](https://kittygiraudel.com/2021/04/05/an-accessible-toggle/), [Pope Tech: Accessible Animation](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)

---

### Pitfall 10: Checkbox/Switch Missing form Lifecycle Callbacks

**What goes wrong:** Developers implement `setFormValue()` but forget the form lifecycle callbacks: `formResetCallback`, `formDisabledCallback`, and `formStateRestoreCallback`. When a user resets the form, checkboxes/switches/radios retain their current state instead of reverting to defaults. Back-button navigation (bfcache) loses state.

**Why it happens:** `setFormValue` is the obvious API. The lifecycle callbacks are less documented and easy to overlook. LitUI's existing Input component implements these correctly, but developers building new components may not copy all callbacks.

**Consequences:**
- Form reset leaves checkboxes in checked state
- Back-button doesn't restore toggle states
- Disabled state from `<fieldset disabled>` not inherited

**Warning signs:**
- Clicking form reset button does not uncheck checkboxes
- `<fieldset disabled>` does not disable nested custom checkboxes
- Browser autofill/restore does not work

**Prevention:**
Copy the pattern from LitUI's existing Input component. All form-associated toggle components need:

```typescript
class Checkbox extends TailwindElement {
  static formAssociated = true;

  // Store the default checked state for reset
  private defaultChecked = false;

  connectedCallback() {
    super.connectedCallback();
    this.defaultChecked = this.checked;
  }

  formResetCallback() {
    this.checked = this.defaultChecked;
    this.internals?.setFormValue(this.checked ? this.value || 'on' : null);
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  formStateRestoreCallback(state: string | null, reason: string) {
    if (reason === 'restore') {
      this.checked = state === 'checked';
      this.updateFormValue();
    }
  }
}
```

**Phase to address:** Phase 1 (Form Participation) -- implement alongside setFormValue

**Confidence:** HIGH -- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals), [WebKit FACE Blog](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/), existing LitUI Input pattern

---

### Pitfall 11: Radio Group Does Not Set ARIA Role or Accessible Name on Container

**What goes wrong:** The `<lui-radio-group>` component renders radios but does not set `role="radiogroup"` on the container or provide an accessible name via `aria-labelledby` or `aria-label`. Screen readers do not announce the group context, and users cannot understand which radios belong together.

**Why it happens:** Developers focus on individual radio accessibility and forget the container needs its own ARIA markup. The group container feels like a layout wrapper rather than a semantic element.

**Consequences:**
- Screen readers do not announce "radio group, [name]"
- Users cannot distinguish between multiple radio groups on the same page
- No "X of Y" position announcement within the group

**Warning signs:**
- Screen reader just says "radio button" without group context
- Multiple radio groups on a page create confusion
- Accessibility audits flag missing group role

**Prevention:**

```typescript
class RadioGroup extends TailwindElement {
  @property() label = '';

  render() {
    return html`
      <div
        role="radiogroup"
        aria-labelledby=${this.label ? 'group-label' : nothing}
        aria-label=${!this.label ? this.ariaLabel : nothing}
      >
        ${this.label
          ? html`<span id="group-label" part="label">${this.label}</span>`
          : nothing}
        <slot></slot>
      </div>
    `;
  }
}
```

**Also applies to checkbox groups:** Use `role="group"` with `aria-labelledby` for checkbox groups. Note: checkbox groups use `role="group"`, NOT `role="checkboxgroup"` (which does not exist).

**Phase to address:** Phase 1 (Component Structure) -- baked into the template from day one

**Confidence:** HIGH -- [MDN radiogroup role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role), [W3C APG Radio Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

---

## Minor Pitfalls

Mistakes that cause annoyance, inconsistency, or polish issues.

---

### Pitfall 12: Switch Label Changes on State Change

**What goes wrong:** The visible label of a switch changes between "Enable notifications" (off) and "Disable notifications" (on). Screen readers announce both the state change AND the label change, creating confusing double-announcements. Users lose context about what the control does.

**Why it happens:** Developers think the label should describe the action (what will happen on toggle) rather than the setting (what is being controlled).

**Prevention:**
Labels must describe WHAT is controlled, not the current action. The state (on/off) communicates the current value.

```html
<!-- WRONG: Label changes with state -->
<lui-switch label=${this.checked ? 'Disable notifications' : 'Enable notifications'}>
</lui-switch>

<!-- CORRECT: Static label, state communicates value -->
<lui-switch label="Notifications" ?checked=${this.notificationsEnabled}>
</lui-switch>
```

**Phase to address:** Phase 1 (API Design) -- document in component API guidelines

**Confidence:** HIGH -- [MDN switch role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/switch_role), [W3C APG Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)

---

### Pitfall 13: Checkbox Value Defaults to Empty String Instead of "on"

**What goes wrong:** Native `<input type="checkbox">` submits the value "on" when checked and no `value` attribute is set. Custom checkbox components often default to `value = ''`, submitting an empty string. Server-side code expecting "on" or a truthy value receives falsy empty string.

**Why it happens:** Lit properties default to empty string. Developers do not match native checkbox default behavior.

**Prevention:**

```typescript
class Checkbox extends TailwindElement {
  @property() value = 'on'; // Match native default

  private updateFormValue() {
    this.internals?.setFormValue(
      this.checked ? this.value : null
    );
  }
}
```

**Phase to address:** Phase 1 (Form Participation) -- set correct default in property declaration

**Confidence:** HIGH -- [MDN checkbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)

---

### Pitfall 14: Checkbox/Radio Click Handler Uses Wrong Event for Form Integration

**What goes wrong:** Using `@click` on a custom checkbox/radio to toggle state means programmatic `.click()` calls, form label clicks (if using light DOM labels), and Enter key presses all trigger the handler. But `@click` fires BEFORE `@change`, and if the component uses both events, state may be toggled twice. Additionally, `@click` on a `<div>` does not fire on Enter key by default -- only Space.

**Why it happens:** `click` seems like the natural event for toggles. The distinction between `click`, `change`, and keyboard events is subtle.

**Prevention:**

For custom elements using `role="checkbox"` / `role="radio"` / `role="switch"` on non-native elements:
- Handle `click` for mouse/touch
- Handle `keydown` for Space (checkbox, radio, switch) -- prevent default to avoid page scroll
- Handle `keydown` for Enter only if the element is also a button (not standard for checkbox/radio/switch)
- Do NOT handle both `click` and `change` on the same element

```typescript
private handleClick() {
  if (this.disabled) return;
  this.toggle();
}

private handleKeyDown(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault(); // Prevent page scroll
    this.toggle();
  }
}
```

**Phase to address:** Phase 1 (Event Handling) -- core interaction design

**Confidence:** HIGH -- [W3C APG Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

---

### Pitfall 15: Forgetting delegatesFocus for Shadow DOM Focus Management

**What goes wrong:** When a label or external element calls `.focus()` on the custom element host, focus lands on the host element itself rather than the interactive element inside the shadow DOM. The focus ring appears on the outer container instead of the checkbox/radio/switch control.

**Why it happens:** By default, `element.focus()` focuses the host. Without `delegatesFocus: true` in the shadow root options, focus does not forward to the first focusable element inside the shadow DOM.

**Prevention:**

```typescript
class Checkbox extends TailwindElement {
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
}
```

**Note:** `delegatesFocus` forwards focus to the first focusable element in shadow DOM. Ensure the interactive control (the checkbox/radio/switch) IS the first focusable element, or focus will land on the wrong thing (e.g., a close button or label).

**Phase to address:** Phase 1 (Component Foundation) -- set in class definition

**Confidence:** HIGH -- [Smashing Magazine: Shadow DOM](https://www.smashingmagazine.com/2025/07/web-components-working-with-shadow-dom/)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|---|---|---|---|
| **Component Architecture** | #1: Separate radio web components break grouping | CRITICAL | Group owns form participation, individual items are presentational |
| **Component Architecture** | #2: Roving tabindex across shadow boundaries | CRITICAL | Manage tabindex on host elements, not shadow internals |
| **ARIA Implementation** | #3: aria-controls cross shadow boundary | CRITICAL | Keep related ARIA elements in same DOM tree, or skip aria-controls |
| **Switch ARIA** | #4: role="switch" SR inconsistency | MODERATE | Use role="switch" anyway, test across SR/browser combos |
| **Form Participation** | #5: Unchecked group removes field from FormData | MODERATE | Document submission model, choose null vs empty string |
| **Indeterminate State** | #6: Mixed treated as form value | MODERATE | Mixed is visual/ARIA only, never a submitted value |
| **Keyboard Navigation** | #7: Radio vs checkbox keyboard differences | MODERATE | Separate keyboard handlers per component type |
| **Focus Management** | #8: aria-activedescendant misuse | MODERATE | Use roving tabindex for radio/checkbox, activedescendant for combobox only |
| **Accessibility/Animation** | #9: Missing prefers-reduced-motion | MODERATE | Include media query from day one |
| **Form Lifecycle** | #10: Missing form callbacks | MODERATE | Copy pattern from existing Input component |
| **Group Container** | #11: Missing radiogroup role/label | MODERATE | Add role and aria-labelledby to container |
| **API Design** | #12: Dynamic switch labels | MINOR | Document: labels describe setting, not action |
| **Form Defaults** | #13: Wrong default value | MINOR | Default checkbox value to "on" |
| **Event Handling** | #14: Wrong event for toggle | MINOR | Handle click + keydown Space separately |
| **Focus** | #15: Missing delegatesFocus | MINOR | Set in shadowRootOptions |

---

## Prevention Summary

Quick reference checklist organized by implementation order:

### Before writing any code:
- [ ] Decide: group-as-form-element vs individual form elements (#1)
- [ ] Decide: roving tabindex (recommended) vs aria-activedescendant (#8)
- [ ] Decide: radio arrow keys select, checkbox arrow keys move only (#7)
- [ ] Decide: checkbox group submission model -- null vs empty string (#5)

### During Phase 1 (Individual Components):
- [ ] Set `delegatesFocus: true` on shadow root (#15)
- [ ] Default checkbox value to "on" (#13)
- [ ] Handle click + Space keydown, prevent Space scroll (#14)
- [ ] Implement all form lifecycle callbacks (#10)
- [ ] Add `prefers-reduced-motion` to all animations (#9)
- [ ] Use `role="switch"` for switch, test across screen readers (#4)
- [ ] Never change switch label on state change (#12)

### During Phase 2 (Group Components):
- [ ] Set `role="radiogroup"` with accessible name on radio group (#11)
- [ ] Set `role="group"` with accessible name on checkbox group (#11)
- [ ] Group owns form participation, not individual items (#1)
- [ ] Roving tabindex on host elements, not shadow internals (#2)
- [ ] Arrow keys wrap in radio group (#2)

### During Phase 3 (Indeterminate/Mixed State):
- [ ] `aria-checked="mixed"` is visual/ARIA only, not a form value (#6)
- [ ] Keep aria-controls references in same DOM tree (#3)
- [ ] Never use `aria-checked="mixed"` on switches (#4)

---

## Sources

### Authoritative (HIGH Confidence)
- [W3C APG Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)
- [W3C APG Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [W3C APG Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
- [W3C APG Mixed-State Checkbox Example](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/)
- [W3C APG Keyboard Interface Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [MDN ElementInternals.setFormValue()](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue)
- [MDN role="switch"](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/switch_role)
- [MDN role="radiogroup"](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role)
- [MDN :indeterminate](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:indeterminate)
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)

### Expert Articles (HIGH Confidence)
- [Adrian Roselli: Switch Role Support](https://adrianroselli.com/2021/10/switch-role-support.html) -- screen reader support matrix
- [Nolan Lawson: Shadow DOM and Accessibility](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/) -- cross-root ARIA problem
- [Alice Boxhall: Shadow DOM and Accessibility in Conflict](https://alice.pages.igalia.com/blog/how-shadow-dom-and-accessibility-are-in-conflict/)
- [Scott O'Hara: ARIA Switch Control](https://scottaohara.github.io/aria-switch-control/)
- [Kitty Giraudel: Accessible Toggle](https://kittygiraudel.com/2021/04/05/an-accessible-toggle/) -- reduced motion pattern
- [Zell Liew: focus vs aria-activedescendant](https://zellwk.com/blog/element-focus-vs-aria-activedescendant/)
- [Smashing Magazine: Shadow DOM (2025)](https://www.smashingmagazine.com/2025/07/web-components-working-with-shadow-dom/)

### Implementation References (MEDIUM-HIGH Confidence)
- [Google HowTo Radio Group](https://googlechromelabs.github.io/howto-components/howto-radio-group/) -- reference implementation
- [Benny Powers: Form-Associated Custom Elements](https://bennypowers.dev/posts/form-associated-custom-elements/)
- [WebKit: ElementInternals and FACE](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/)
- [web.dev: More Capable Form Controls](https://web.dev/articles/more-capable-form-controls)
- [Filament Group: Forms with Custom Elements](https://www.filamentgroup.com/lab/forms-with-custom-elements/)
- [Noah Liebman: Progressive Radio Button](https://noahliebman.net/2023/12/radio-button-with-host-has/)

### Community/Cross-Reference (MEDIUM Confidence)
- [DEV.to: ElementInternals](https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj)
- [CSS-Tricks: Indeterminate Checkboxes](https://css-tricks.com/indeterminate-checkboxes/)
- [Pope Tech: Accessible Animation (Dec 2025)](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)
- [Igalia: Solving Cross-Root ARIA](https://blogs.igalia.com/mrego/solving-cross-root-aria-issues-in-shadow-dom/)
