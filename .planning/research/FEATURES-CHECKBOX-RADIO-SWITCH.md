# Feature Landscape: Checkbox, Radio, Switch Components

**Domain:** Form toggle controls for a Lit-based web component library
**Researched:** 2026-01-26
**Overall confidence:** HIGH (WAI-ARIA APG patterns are stable, well-documented standards)

## Table Stakes

Features users expect. Missing any of these and the components feel broken or incomplete.

### Checkbox (`lui-checkbox`)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Checked / unchecked toggle | Core purpose of checkbox | Low | None | `checked` boolean property, reflected attribute |
| Indeterminate (tri-state) | Required for "select all" parent checkboxes; WAI-ARIA mandates `aria-checked="mixed"` support | Medium | None | Must be set via JS property only (matches native `HTMLInputElement.indeterminate`). Visual indicator is a horizontal dash, not a checkmark |
| `name` / `value` for form submission | All existing LitUI form components do this | Low | ElementInternals (established pattern) | Submit value when checked, omit when unchecked (matches native behavior). Use `setFormValue(this.checked ? this.value : null)` |
| `disabled` state | Universal form control requirement | Low | None | `aria-disabled`, reduced opacity, `pointer-events: none` on `:host` |
| `required` validation | Standard form validation | Low | ElementInternals | `setValidity({ valueMissing: true }, ...)` when required and unchecked |
| Label text | Checkboxes without labels are inaccessible | Low | None | Property `label` rendered as adjacent `<label>`, or use default slot for custom label content |
| Size variants (sm/md/lg) | Matches existing LitUI convention (Button, Input, Select all have this) | Low | None | Affects checkbox box dimensions, label font-size, gap |
| Focus ring | Keyboard accessibility indicator | Low | Existing `--color-ring` token | Inner glow style matching Button focus ring pattern |
| `role="checkbox"` + `aria-checked` | WAI-ARIA checkbox pattern | Low | None | `aria-checked` must be `"true"`, `"false"`, or `"mixed"` |
| Space key toggles | WAI-ARIA keyboard interaction | Low | None | Single keyboard binding. Do NOT add Enter key (not in spec for checkbox) |
| Form reset support | All existing form components support this | Low | ElementInternals | `formResetCallback()` restores to `defaultChecked` |
| CSS design tokens | All LitUI components use `--ui-component-*` pattern | Medium | Token system | `--ui-checkbox-size-{sm,md,lg}`, `--ui-checkbox-bg`, `--ui-checkbox-bg-checked`, `--ui-checkbox-border`, `--ui-checkbox-check-color`, `--ui-checkbox-radius` |
| Error state styling | Matches Input/Textarea/Select pattern | Low | Error tokens | `--ui-checkbox-border-error`, aria-invalid support |
| Dark mode | All LitUI components support this via token system | Low | Token system | Tokens respond to CSS color-scheme automatically |
| SSR compatibility | Established pattern with `isServer` guards | Low | `@lit-ui/core` | Guard `attachInternals()` with `isServer` check |

### CheckboxGroup (`lui-checkbox-group`)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Group label | WAI-ARIA requires `role="group"` with `aria-labelledby` | Low | None | `label` property rendered as visible heading, referenced by `aria-labelledby` |
| Vertical layout (default) | Standard checkbox group layout | Low | None | Column flex with gap |
| Group-level required validation | "At least one must be checked" | Medium | ElementInternals | `setValidity({ valueMissing })` when required and no children checked. Needs MutationObserver or event listener on children |
| Error message display | Consistent with Input/Select error pattern | Low | None | `role="alert"` error text below group |
| Disabled propagation | Disabling group disables all children | Low | None | Set `disabled` on children via `formDisabledCallback` or MutationObserver |
| Form participation | Group submits array of checked values | Medium | ElementInternals | `setFormValue()` with all checked child values. Consider using FormData with repeated `name` entries (native behavior) |

### Radio (`lui-radio`)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Checked / unchecked state | Core purpose | Low | None | `checked` boolean property |
| `value` attribute | Identifies which option is selected | Low | None | String value submitted via parent RadioGroup |
| `disabled` state | Universal form control | Low | None | Individual radio disable |
| Label text | Radios without labels are inaccessible | Low | None | Adjacent label or default slot |
| Visual selected indicator | Filled circle inside radio circle | Low | None | CSS-only, no SVG needed |
| Size variants (sm/md/lg) | LitUI convention | Low | None | Radio circle dimensions, label font-size |
| `role="radio"` + `aria-checked` | WAI-ARIA radio pattern | Low | None | Only `"true"` or `"false"` (no `"mixed"`) |

### RadioGroup (`lui-radio-group`)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Mutual exclusion | Core purpose: only one selected at a time | Medium | None | When child checked, uncheck all siblings. This is the CRITICAL feature: **native radio mutual exclusion does not work across Shadow DOM boundaries**. RadioGroup MUST manage this programmatically |
| Arrow key navigation (roving tabindex) | WAI-ARIA radio group keyboard pattern | High | None | Up/Left = previous, Down/Right = next, with wrapping. Only one radio in tab order at a time (roving tabindex). Checking follows focus |
| `role="radiogroup"` + `aria-labelledby` | WAI-ARIA requirement | Low | None | Container semantics |
| Group label | Required for accessibility | Low | None | `label` property |
| `value` property | Get/set selected value | Low | None | Reflects currently selected radio's value |
| Required validation | "Must select one" | Medium | ElementInternals | `setValidity({ valueMissing })` |
| Form participation | Submit selected value | Medium | ElementInternals | Single value from group |
| Disabled propagation | Group disable | Low | None | Cascades to all child radios |
| `name` attribute | Form field name | Low | ElementInternals | Set on group, not individual radios |

### Switch (`lui-switch`)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| On / off toggle | Core purpose | Low | None | `checked` boolean property |
| Track + thumb visual | Defining visual characteristic of a switch | Medium | None | Track background, thumb circle that slides left/right |
| `disabled` state | Universal form control | Low | None | Reduced opacity, pointer-events none |
| Label support | Accessibility requirement | Low | None | Adjacent label text. Note: project spec says "standalone toggle, not a labeled row" -- this means label is optional, but ARIA label is still needed |
| `name` / `value` for forms | Form participation | Low | ElementInternals | Submit value when on, omit when off |
| Size variants (sm/md/lg) | LitUI convention | Low | None | Track width/height, thumb diameter |
| `role="switch"` + `aria-checked` | WAI-ARIA switch role (distinct from checkbox!) | Low | None | Only `"true"` or `"false"` -- NO `"mixed"` state. This is semantic: "on/off" not "checked/unchecked" |
| Space key toggles | WAI-ARIA keyboard interaction | Low | None | Enter is optional per spec, recommend including it |
| Focus ring | Keyboard accessibility | Low | `--color-ring` token | On the thumb or track |
| CSS design tokens | LitUI convention | Medium | Token system | `--ui-switch-track-width-{size}`, `--ui-switch-track-height-{size}`, `--ui-switch-thumb-size-{size}`, `--ui-switch-track-bg`, `--ui-switch-track-bg-checked`, `--ui-switch-thumb-bg` |
| Dark mode | Token-driven | Low | Token system | Automatic via token values |
| SSR compatibility | Established pattern | Low | `@lit-ui/core` | `isServer` guard |

## Differentiators

Features that set the library apart. Not expected by default, but add significant value.

### Checkbox Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Animated check transition | Feels polished. SVG path stroke-dashoffset animation for checkmark drawing on, scale-down on uncheck | Medium | None | CSS animation on `aria-checked` change. Use SVG `<path>` with `stroke-dasharray`/`stroke-dashoffset` for draw-in effect. Indeterminate dash can cross-fade |
| `defaultChecked` property | Enables proper form reset behavior (reset to initial, not unchecked) | Low | None | Mirror native `defaultChecked` semantics |
| CSS parts for deep styling | `::part(box)`, `::part(check)`, `::part(label)` | Low | None | Enables consumer theming beyond tokens |
| Help text | Descriptive text below checkbox | Low | None | Matches Input `helper-text` pattern. `aria-describedby` association |

### CheckboxGroup Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Select all / none helper | Automatic tri-state parent checkbox managing group state | High | Indeterminate checkbox | Parent checkbox auto-toggles all children. Auto-calculates indeterminate state when some checked. This is the classic indeterminate use case |
| Horizontal layout option | Useful for small option sets | Low | None | `orientation="horizontal"` attribute |
| Min/max validation | "Select between 2 and 5 options" | Medium | ElementInternals | `setValidity()` with custom message. Uncommon but useful for survey-type UIs |

### Radio Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Animated selection transition | Smooth fill animation when radio selected | Medium | None | CSS scale transform on the inner dot. Cross-fade between radios in a group adds polish |
| CSS parts | `::part(circle)`, `::part(dot)`, `::part(label)` | Low | None | Deep styling support |
| Help text per radio | Description below each option | Low | None | `aria-describedby` per radio option |

### RadioGroup Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Horizontal layout option | Button-bar style radio groups | Low | None | `orientation="horizontal"` -- also informs keyboard nav (horizontal = Left/Right only, vertical = Up/Down only, per APG) |
| Radio button variant | Pill/button-style radios (like Shoelace `sl-radio-button`) | High | Button styling tokens | Reuses radio semantics but renders as segmented button bar. Defer to post-MVP |

### Switch Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Animated slide transition | Thumb slides smoothly between positions, track color cross-fades | Medium | None | CSS `transition` on `transform: translateX()` for thumb, `background-color` for track. Core differentiator for perceived quality |
| On/off text labels | Visual "ON"/"OFF" text inside track or adjacent | Low | None | `aria-hidden="true"` on visual labels to prevent redundant screen reader announcement. Important for cognitive accessibility |
| Custom thumb/track content via slots | Icons inside thumb (sun/moon for theme toggle) | Medium | None | `slot="thumb"` for custom thumb content |
| CSS parts | `::part(track)`, `::part(thumb)` | Low | None | Deep theming |
| Loading state | Async operations (e.g., saving preference) | Medium | Button loading pattern | Spinner on thumb or disabled state while async operation completes |

## Anti-Features

Features to deliberately NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Standalone `lui-radio` without RadioGroup | Native radio mutual exclusion breaks across Shadow DOM boundaries. A standalone radio is useless -- it cannot uncheck siblings in other shadow roots | Always require `lui-radio` inside `lui-radio-group`. RadioGroup manages exclusion programmatically. Do not expose radio as independently useful |
| Switch with indeterminate/mixed state | WAI-ARIA spec explicitly forbids `aria-checked="mixed"` on `role="switch"`. A switch is binary by definition | If tri-state is needed, use Checkbox instead. Switch is on/off only |
| Enter key on Checkbox | WAI-ARIA checkbox pattern specifies Space only. Enter is NOT part of the checkbox keyboard spec (it is optional for Switch) | Only bind Space on checkbox. Adding Enter would diverge from ARIA spec and confuse assistive technology users |
| Checkbox submitting `"on"` when no value specified | Native HTML checkboxes submit `"on"` as default value, which is rarely useful | Default `value` to empty string. When checked, submit the value. When unchecked, submit nothing. If consumer wants `"on"`, they set `value="on"` explicitly |
| Radio value on individual radios for form submission | Each radio managing its own form value creates duplicate/conflicting form entries | RadioGroup owns form participation. Individual radios report state to parent. Only RadioGroup calls `setFormValue()` |
| Toggle button masquerading as Switch | A `<button aria-pressed>` looks similar but has different semantics. Switch = "on/off", toggle button = "pressed/not pressed" | Use `role="switch"` with `aria-checked`. Do not use `aria-pressed` |
| Wrapping native inputs in Shadow DOM | Some libraries put `<input type="checkbox">` in shadow DOM for form participation. This is unnecessary with ElementInternals and creates complexity | Use ElementInternals (already established in this project). No hidden native inputs needed |
| Click-to-check on RadioGroup labels | Some implementations make clicking the group label check the first radio. This is wrong -- group labels are for identification, not interaction | Group label should be a `<legend>` or heading with `aria-labelledby`. Not interactive |

## Feature Dependencies

```
Checkbox (standalone)
  |
  +-- CheckboxGroup (requires Checkbox)
  |     |
  |     +-- Select All/None (requires CheckboxGroup + indeterminate)
  |
Radio (standalone, but not useful alone)
  |
  +-- RadioGroup (requires Radio, provides mutual exclusion + roving tabindex)
  |
Switch (fully standalone, no group component needed)

Cross-cutting dependencies:
- All components --> ElementInternals (established pattern from Input/Button)
- All components --> TailwindElement base class (established)
- All components --> CSS design token system (--ui-component-*)
- All components --> SSR isServer guard (established)
- All components --> Size variants (sm/md/lg) (established convention)
```

## ARIA Quick Reference

### Checkbox
| Attribute | Value | When |
|-----------|-------|------|
| `role` | `checkbox` | Always |
| `aria-checked` | `true` | Checked |
| `aria-checked` | `false` | Unchecked |
| `aria-checked` | `mixed` | Indeterminate |
| `aria-disabled` | `true` | Disabled |
| `aria-invalid` | `true` | Validation error |
| `aria-describedby` | `{id}` | When help text or error text present |
| `tabindex` | `0` | Always (focusable) |
| **Keyboard** | Space | Toggle checked state |

### CheckboxGroup
| Attribute | Value | When |
|-----------|-------|------|
| `role` | `group` | Always |
| `aria-labelledby` | `{label-id}` | Always (references visible label) |

### Radio
| Attribute | Value | When |
|-----------|-------|------|
| `role` | `radio` | Always |
| `aria-checked` | `true` / `false` | Selected / not selected |
| `aria-disabled` | `true` | Disabled |
| `tabindex` | `0` | When checked OR first in group with none checked |
| `tabindex` | `-1` | When not the active radio in roving tabindex |

### RadioGroup
| Attribute | Value | When |
|-----------|-------|------|
| `role` | `radiogroup` | Always |
| `aria-labelledby` | `{label-id}` | Always |
| `aria-required` | `true` | When selection required |
| **Keyboard** | Space | Check focused radio |
| **Keyboard** | Down/Right Arrow | Move to next radio (wraps), auto-checks |
| **Keyboard** | Up/Left Arrow | Move to previous radio (wraps), auto-checks |
| **Tab behavior** | Single tab stop | Tab enters/exits group; arrows navigate within |

### Switch
| Attribute | Value | When |
|-----------|-------|------|
| `role` | `switch` | Always |
| `aria-checked` | `true` / `false` | On / off (NEVER `mixed`) |
| `aria-disabled` | `true` | Disabled |
| `tabindex` | `0` | Always |
| **Keyboard** | Space | Toggle state |
| **Keyboard** | Enter (optional) | Toggle state (recommended to include) |

## MVP Recommendation

For MVP, prioritize in this order:

1. **Checkbox** -- simplest standalone component, establishes the checked/unchecked pattern and form participation for boolean controls (new territory vs text inputs)
2. **Switch** -- fully standalone like Checkbox, adds the animated slide that demonstrates component polish, uses distinct `role="switch"`
3. **Radio + RadioGroup** -- most complex due to roving tabindex and cross-shadow-DOM mutual exclusion, but essential for any form-heavy application
4. **CheckboxGroup** -- relatively simple group wrapper, but depends on Checkbox being solid first
5. **Select All/None** -- differentiator, defer if time-constrained

Defer to post-MVP:
- Radio button variant (pill/segmented style) -- high complexity, niche use case
- Switch loading state -- nice-to-have, can be added later
- Min/max validation on CheckboxGroup -- uncommon requirement
- Custom thumb content slot on Switch -- advanced theming

## Sources

- [W3C WAI-ARIA APG: Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) -- HIGH confidence
- [W3C WAI-ARIA APG: Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) -- HIGH confidence
- [W3C WAI-ARIA APG: Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) -- HIGH confidence
- [MDN: aria-checked attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-checked) -- HIGH confidence
- [MDN: ARIA switch role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role) -- HIGH confidence
- [MDN: HTMLInputElement.indeterminate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate) -- HIGH confidence
- [Shoelace: Checkbox](https://shoelace.style/components/checkbox) -- HIGH confidence (reference implementation)
- [Shoelace: Switch](https://shoelace.style/components/switch) -- HIGH confidence (reference implementation)
- [Shoelace: Radio](https://shoelace.style/components/radio) -- HIGH confidence (reference implementation)
- [W3C WAI-ARIA APG: Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) -- HIGH confidence
- [Noah Liebman: Radio Button Web Component](https://noahliebman.net/2023/12/radio-button-with-host-has/) -- MEDIUM confidence (documents Shadow DOM radio pitfall)
- [Form-Associated Custom Elements](https://dev.to/steveblue/form-associated-custom-elements-ftw-16bi) -- MEDIUM confidence (documents ElementInternals patterns)
