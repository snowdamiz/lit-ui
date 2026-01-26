# Pitfalls Research: Select/Combobox Component

**Domain:** Select/Combobox Web Component for LitUI
**Researched:** 2026-01-26
**Confidence:** HIGH (multiple authoritative sources cross-referenced)

## Critical Pitfalls

These are show-stoppers that cause major rewrites or broken functionality if not addressed early.

### Pitfall 1: ARIA 1.1 vs 1.2 Combobox Pattern Confusion

**What goes wrong:** The W3C ARIA spec had significant changes between 1.1 and 1.2 for combobox. ARIA 1.1 comboboxes have poor screen reader support. Developers using outdated tutorials or documentation implement the wrong pattern.

**Warning signs:**
- Using `aria-owns` instead of `aria-controls`
- Putting `role="combobox"` on a wrapper div instead of the input
- Following tutorials from before 2021

**Prevention strategy:**
- Use ONLY the [WAI-ARIA APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) as the reference
- The input element must have `role="combobox"`
- Use `aria-controls` to reference the listbox popup
- Test with NVDA + Chrome, JAWS, and VoiceOver from day one

**Phase to address:** Phase 1 (Foundation) - Get ARIA structure right before any features

**Confidence:** HIGH - [APG Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [MDN ARIA Combobox](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role)

---

### Pitfall 2: Click-Outside Detection with Shadow DOM Event Retargeting

**What goes wrong:** Standard click-outside detection (`event.target !== element`) fails in Shadow DOM because events are retargeted. The `event.target` becomes the host element, not the actual clicked element inside shadow DOM. Dropdowns close unexpectedly or fail to close.

**Warning signs:**
- Dropdown closes when clicking inside it
- Dropdown doesn't close when clicking outside
- Event listeners on document returning unexpected targets

**Prevention strategy:**
```typescript
// WRONG - will fail with Shadow DOM
document.addEventListener('click', (e) => {
  if (e.target !== this) this.close();
});

// CORRECT - use composedPath()
document.addEventListener('click', (e) => {
  if (!e.composedPath().includes(this)) {
    this.close();
  }
});
```

**Phase to address:** Phase 1 (Foundation) - Core dropdown behavior

**Confidence:** HIGH - [Shadow DOM Events](https://javascript.info/shadow-dom-events), [Lamplightdev Blog](https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/)

---

### Pitfall 3: Multi-Select Form Submission with FormData

**What goes wrong:** `setFormValue()` only accepts string, File, or FormData - not arrays. Using `Object.fromEntries(formData)` loses all but the last selected value. Server receives single value instead of array.

**Warning signs:**
- Only one value received on server for multi-select
- Form data logging shows single value
- Tests pass with single selection but fail with multiple

**Prevention strategy:**
```typescript
// For multi-select, use FormData to submit multiple values
private updateFormValue(): void {
  if (this.multiple && this.selectedValues.length > 0) {
    const formData = new FormData();
    this.selectedValues.forEach(value => {
      formData.append(this.name, value);
    });
    this.internals?.setFormValue(formData);
  } else {
    this.internals?.setFormValue(this.value);
  }
}

// Server-side: Use formData.getAll('fieldName'), not formData.get()
```

**Phase to address:** Phase 2 (Multi-select) - When implementing multi-select feature

**Confidence:** HIGH - [MDN setFormValue](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue), [Shoelace Discussion #1799](https://github.com/shoelace-style/shoelace/discussions/1799)

---

## ARIA/Accessibility Pitfalls

Common accessibility mistakes specific to Select/Combobox.

### Pitfall 4: aria-activedescendant Mobile Screen Reader Failure

**What goes wrong:** `aria-activedescendant` is essential for combobox accessibility on desktop but is essentially ignored by iOS VoiceOver and Android TalkBack. Mobile users can't navigate options.

**Warning signs:**
- Desktop screen readers work, mobile fails
- VoiceOver doesn't announce option changes
- Touch users can't find current selection

**Prevention strategy:**
- Always use `aria-activedescendant` for combobox (required for pattern)
- Ensure options are independently focusable for mobile fallback
- Test with actual devices, not just emulators
- Consider showing native `<select>` on mobile as progressive enhancement

**Phase to address:** Phase 1 (Foundation) - Bake into initial ARIA implementation

**Confidence:** HIGH - [Sarah Higley on activedescendant](https://sarahmhigley.com/writing/activedescendant/), [MDN aria-activedescendant](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant)

---

### Pitfall 5: VoiceOver Ignoring aria-activedescendant with Filled Input

**What goes wrong:** VoiceOver on Safari has a bug where it refuses to announce the active descendant when the combobox input already contains text. Users can't hear which option is highlighted.

**Warning signs:**
- VoiceOver works on empty input, fails after typing
- Other screen readers work fine
- User reports from Mac Safari users

**Prevention strategy:**
- Test specifically with Safari VoiceOver after typing in the input
- Consider fallback announcement via `role="status"` live region
- Document known limitation if no workaround found
- LitUI already uses live regions for password toggle - apply same pattern

**Phase to address:** Phase 1 (Foundation) - During screen reader testing

**Confidence:** MEDIUM - [Zell Liew Blog](https://zellwk.com/blog/element-focus-vs-aria-activedescendant/)

---

### Pitfall 6: Missing Keyboard Navigation Requirements

**What goes wrong:** Incomplete keyboard support violates WCAG. Common misses: Home/End keys, type-ahead character navigation, Alt+Down/Up shortcuts.

**Warning signs:**
- Arrow keys work but Home/End don't
- Typing doesn't jump to matching option
- Escape doesn't clear/close properly

**Prevention strategy - Required keyboard behaviors:**

| Key | Closed Popup | Open Popup |
|-----|--------------|------------|
| Down Arrow | Open popup, focus first | Move to next option |
| Up Arrow | Open popup, focus last (optional) | Move to previous option |
| Enter | Open popup (optional) | Select focused, close |
| Escape | Clear value (optional) | Close without selecting |
| Home | - | Jump to first option |
| End | - | Jump to last option |
| Printable chars | Type in input / jump to match | Continue typing / jump to match |
| Tab | Move to next field | Close, move to next field |

**Phase to address:** Phase 1 (Foundation) - Core keyboard implementation

**Confidence:** HIGH - [W3C APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

---

### Pitfall 7: aria-selected vs Visual Focus Mismatch

**What goes wrong:** The visually highlighted option doesn't match `aria-selected="true"`. Screen reader announces different option than what's visually shown.

**Warning signs:**
- Screen reader says "Option A selected" but Option B is highlighted
- Confusion about selection vs focus states
- Multiple options with `aria-selected="true"`

**Prevention strategy:**
- Only ONE option should have `aria-selected="true"` at a time
- Visual highlight must match `aria-activedescendant` target
- `aria-selected` indicates the value that would be submitted
- For multi-select, multiple `aria-selected="true"` is valid

**Phase to address:** Phase 1 (Foundation) - Option rendering

**Confidence:** HIGH - [APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)

---

## Technical Pitfalls

Shadow DOM, positioning, and async behavior issues.

### Pitfall 8: Popup Positioning with CSS Anchor Positioning Cross-Tree

**What goes wrong:** CSS Anchor Positioning requires anchor-name and position-anchor to be in the same shadow tree. If the popup is in a different shadow tree (e.g., portaled to body), anchoring breaks silently.

**Warning signs:**
- Popup appears at wrong position
- Popup works in some browsers but not others
- Position works initially then breaks on scroll

**Prevention strategy:**
- Keep popup in same shadow tree as trigger (preferred)
- If portaling, use JavaScript positioning (Floating UI/Popper)
- Use the Popover API for implicit anchor relationships (Chrome 133+)
- Test anchor positioning with scroll and viewport edge cases

```typescript
// Implicit anchor with Popover API (Chrome 133+)
// Button and popover automatically have anchor relationship
render() {
  return html`
    <button popovertarget="options">Select</button>
    <div popover id="options" style="position-area: bottom span-left;">
      ...options
    </div>
  `;
}
```

**Phase to address:** Phase 1 (Foundation) - Dropdown positioning

**Confidence:** HIGH - [OddBird Anchor Updates](https://www.oddbird.net/2025/10/13/anchor-position-area-update/), [Chrome Blog](https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap)

---

### Pitfall 9: Top Layer Stacking with Modal Dialogs

**What goes wrong:** If a Select is inside a modal dialog (opened via `showModal()`), the page becomes inert. If the Select's popup is portaled outside the dialog DOM, it becomes inert and unusable.

**Warning signs:**
- Select works standalone, fails inside modal dialog
- Popup appears but can't be interacted with
- Keyboard focus can't reach popup options

**Prevention strategy:**
- Keep popup inside the dialog DOM if dialog might be used
- Don't portal outside modal boundaries
- Test Select inside `<dialog>` and LitUI Dialog component
- If using Popover API, place popover inside dialog element

**Phase to address:** Phase 1 (Foundation) - Integration testing

**Confidence:** HIGH - [HTMHell Top Layer](https://www.htmhell.dev/adventcalendar/2025/1/)

---

### Pitfall 10: Async Loading Race Conditions

**What goes wrong:** User types "abc", triggers search, then types "abcd" triggering new search. "abc" results return after "abcd" results, overwriting the correct options.

**Warning signs:**
- Options flicker or show wrong results
- Fast typing shows stale results
- Results don't match current input value

**Prevention strategy:**
```typescript
private searchController: AbortController | null = null;
private searchTimeout: number | null = null;

private async handleSearch(query: string): Promise<void> {
  // Cancel previous request
  this.searchController?.abort();
  this.searchController = new AbortController();

  // Debounce (300-500ms typical)
  if (this.searchTimeout) clearTimeout(this.searchTimeout);

  this.searchTimeout = window.setTimeout(async () => {
    try {
      this.loading = true;
      const results = await this.fetchOptions(query, this.searchController.signal);

      // Verify query still matches (race condition guard)
      if (query === this.inputValue) {
        this.options = results;
      }
    } catch (e) {
      if (e.name !== 'AbortError') throw e;
    } finally {
      this.loading = false;
    }
  }, 300);
}
```

**Phase to address:** Phase 3 (Async/Combobox) - When adding async search

**Confidence:** HIGH - [React Router Race Conditions](https://reactrouter.com/explanation/race-conditions), [FreeCodeCamp Debounce](https://www.freecodecamp.org/news/deboucing-in-react-autocomplete-example/)

---

### Pitfall 11: Virtualized List Accessibility

**What goes wrong:** Virtualization renders only visible items. Screen readers can't see the full list. `aria-rowcount` and indexes aren't updated. Focus management breaks when scrolling.

**Warning signs:**
- Screen reader announces wrong total count
- Keyboard navigation skips items
- Focus lost when scrolling

**Prevention strategy:**
- Set `aria-setsize` on listbox with total count (not rendered count)
- Update `aria-posinset` on each visible option
- Maintain `aria-activedescendant` correctly during scroll
- Consider max option limit instead of virtualization for most cases (100-200 items render fine)

```typescript
// On listbox
aria-setsize="${this.totalOptions}"

// On each option
aria-posinset="${actualIndexInFullList + 1}"
```

**Phase to address:** Phase 4 (Performance) - Only if virtualization needed

**Confidence:** MEDIUM - [StudyRaid Virtualization A11y](https://app.studyraid.com/en/read/11538/362764/ensuring-accessibility-in-virtualized-components)

---

## UX Pitfalls

User experience mistakes that frustrate users.

### Pitfall 12: iOS Safari Double UI Problem

**What goes wrong:** On iOS, tapping a custom combobox can trigger both the custom dropdown AND the native iOS select picker simultaneously. Users see two UIs fighting.

**Warning signs:**
- iOS users report confusing double interface
- Native picker slides up while custom dropdown shows
- Works on Android, broken on iOS

**Prevention strategy:**
- Ensure no hidden native `<select>` is receiving focus
- Use `-webkit-appearance: none` on any native elements
- Consider detecting iOS and showing native select instead
- Test on actual iOS devices, not just Safari desktop

**Phase to address:** Phase 1 (Foundation) - Mobile testing

**Confidence:** HIGH - [react-select Issue #904](https://github.com/JedWatson/react-select/issues/904), [Select2 iOS Issues](https://github.com/select2/select2/issues/5904)

---

### Pitfall 13: Touch Device Sticky Hover States

**What goes wrong:** iOS emulates hover on tap, causing "sticky" hover styles that persist after tapping an option. The previously selected option looks highlighted even when it shouldn't be.

**Warning signs:**
- Options stay highlighted after selection on iOS
- Hover styles persist until tapping elsewhere
- Works correctly with mouse

**Prevention strategy:**
```css
/* Only apply hover on devices that support it */
@media (hover: hover) {
  .option:hover {
    background-color: var(--hover-bg);
  }
}

/* For touch, use :active instead */
@media (hover: none) {
  .option:active {
    background-color: var(--hover-bg);
  }
}
```

**Phase to address:** Phase 1 (Foundation) - Option styling

**Confidence:** HIGH - [Bootstrap Browser Docs](https://getbootstrap.com/docs/4.1/getting-started/browsers-devices/)

---

### Pitfall 14: Popup Opening Behavior Inconsistency with Native Select

**What goes wrong:** Native `<select>` opens on click. Custom combobox might open on focus, or require explicit click on chevron. Users expect different behavior.

**Warning signs:**
- Users confused about how to open dropdown
- Different behavior than native select feels wrong
- Accessibility testers flag inconsistent behavior

**Prevention strategy:**
- For "select-only" mode: Open on click (matches native)
- For "combobox" mode with search: Open on focus or first character
- Always support Down Arrow to open
- Document the chosen behavior clearly
- Be consistent within the component

**Phase to address:** Phase 1 (Foundation) - Core interaction design

**Confidence:** HIGH - [Fluent UI Issue #15779](https://github.com/microsoft/fluentui/issues/15779)

---

### Pitfall 15: No Loading State for Async Search

**What goes wrong:** User types, nothing happens for 500ms+ while fetching. User thinks it's broken, types more, or clicks away.

**Warning signs:**
- Users abandon before results load
- Multiple search requests triggered by confused users
- No feedback during network latency

**Prevention strategy:**
- Show spinner/skeleton immediately on input (before debounce completes)
- Announce "Loading" to screen readers via live region
- Show "No results" vs "Loading" states distinctly
- Consider minimum loading time to prevent flash

```typescript
render() {
  return html`
    <div role="status" aria-live="polite" class="visually-hidden">
      ${this.loading ? 'Loading options' : ''}
    </div>
    ${this.loading
      ? html`<div class="loading-indicator">Loading...</div>`
      : this.renderOptions()}
  `;
}
```

**Phase to address:** Phase 3 (Async/Combobox) - Async search feature

**Confidence:** HIGH - [shadcn/ui Discussion](https://github.com/shadcn-ui/ui/issues/1391)

---

## Integration Pitfalls with LitUI

Issues specific to integrating with existing LitUI patterns.

### Pitfall 16: ElementInternals State Restoration for Complex Values

**What goes wrong:** Browser form restoration (back button, bfcache) calls `formStateRestoreCallback`. For multi-select, the state is a FormData object, not a string. Incorrect parsing loses selections.

**Warning signs:**
- Multi-select loses values on back navigation
- Single value restored correctly, array fails
- Autocomplete doesn't restore properly

**Prevention strategy:**
```typescript
// When setting form value for multi-select
this.internals?.setFormValue(formData, formData); // Pass same as state

// In restore callback
formStateRestoreCallback(state: FormData | string | File | null, reason: string): void {
  if (reason === 'restore' && state instanceof FormData) {
    this.selectedValues = state.getAll(this.name) as string[];
    this.updateDisplay();
  } else if (typeof state === 'string') {
    this.value = state;
  }
}
```

**Phase to address:** Phase 2 (Multi-select) - Form integration

**Confidence:** MEDIUM - [WebKit ElementInternals](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/), [CSS-Tricks ElementInternals](https://css-tricks.com/creating-custom-form-controls-with-elementinternals/)

---

### Pitfall 17: Slotted Content (Options) Accessibility Linking

**What goes wrong:** Options provided via slots exist in light DOM. The listbox `aria-labelledby` can't reference elements across the shadow boundary (prior to Reference Target). Screen readers can't associate labels.

**Warning signs:**
- Screen reader doesn't announce option groups
- aria-labelledby pointing to light DOM fails
- Label associations silently broken

**Prevention strategy:**
- For LitUI, define options via property (not slots) for full control
- If using slots, duplicate accessible names into shadow DOM
- Watch for Cross-root ARIA (Reference Target) browser support
- Test aria-labelledby across shadow boundary in all target browsers

```typescript
// Prefer property-based options over slots for accessibility
@property({ type: Array })
options: Array<{value: string, label: string}> = [];
```

**Phase to address:** Phase 1 (Foundation) - Component API design

**Confidence:** HIGH - [W3C Web Components CG](https://w3c.github.io/webcomponents-cg/2023.html)

---

### Pitfall 18: Inheriting ValidityState Mapping from Input Component

**What goes wrong:** LitUI Input already maps ValidityState. Select has different validity conditions (e.g., no `typeMismatch`). Copy-pasting validation code includes irrelevant states.

**Warning signs:**
- Validation messages don't make sense for Select
- `typeMismatch` error on a Select component
- Over-engineered validity mapping

**Prevention strategy:**
- Select only needs: `valueMissing` (required but empty)
- Multi-select might need: custom validity for min/max selections
- Don't blindly copy Input's validity mapping
- Create Select-specific validation

```typescript
private validate(): boolean {
  if (!this.internals) return true;

  if (this.required && !this.value) {
    this.internals.setValidity(
      { valueMissing: true },
      'Please select an option',
      this.triggerElement
    );
    return false;
  }

  // Multi-select: custom min/max validation
  if (this.multiple && this.minSelections && this.selectedValues.length < this.minSelections) {
    this.internals.setValidity(
      { customError: true },
      `Please select at least ${this.minSelections} options`,
      this.triggerElement
    );
    return false;
  }

  this.internals.setValidity({});
  return true;
}
```

**Phase to address:** Phase 1 (Foundation) - Form validation

**Confidence:** HIGH - Based on existing LitUI Input patterns

---

## Prevention Summary

Quick reference checklist for each pitfall.

| # | Pitfall | Prevention | Phase |
|---|---------|------------|-------|
| 1 | ARIA 1.1 vs 1.2 | Use APG pattern only, test with screen readers | Phase 1 |
| 2 | Click-outside Shadow DOM | Use `composedPath()` not `event.target` | Phase 1 |
| 3 | Multi-select FormData | Use FormData.append(), server uses getAll() | Phase 2 |
| 4 | Mobile aria-activedescendant | Test on real devices, consider native fallback | Phase 1 |
| 5 | VoiceOver filled input | Test Safari VoiceOver, use live region fallback | Phase 1 |
| 6 | Missing keyboard nav | Implement full APG keyboard spec | Phase 1 |
| 7 | aria-selected mismatch | One aria-selected, match visual focus | Phase 1 |
| 8 | Anchor positioning cross-tree | Keep popup in same shadow tree | Phase 1 |
| 9 | Modal dialog inert | Don't portal outside dialog DOM | Phase 1 |
| 10 | Async race conditions | AbortController + debounce + query validation | Phase 3 |
| 11 | Virtualized list a11y | aria-setsize/posinset, avoid if <200 items | Phase 4 |
| 12 | iOS double UI | No hidden native select, test real iOS | Phase 1 |
| 13 | Sticky hover on touch | @media (hover: hover) for hover styles | Phase 1 |
| 14 | Popup opening inconsistency | Match native select behavior, document choice | Phase 1 |
| 15 | No async loading state | Immediate loading indicator + live region | Phase 3 |
| 16 | State restoration | Handle FormData in formStateRestoreCallback | Phase 2 |
| 17 | Slotted options a11y | Use property-based options, not slots | Phase 1 |
| 18 | Wrong validity states | Select-specific validation, not Input copy | Phase 1 |

---

## Phase-Specific Warnings

| Phase | Likely Pitfalls | Focus Areas |
|-------|-----------------|-------------|
| **Phase 1: Foundation** | #1, #2, #4, #5, #6, #7, #8, #9, #12, #13, #14, #17, #18 | ARIA structure, keyboard nav, positioning, mobile |
| **Phase 2: Multi-select** | #3, #16 | FormData handling, state restoration |
| **Phase 3: Async/Combobox** | #10, #15 | Race conditions, loading states |
| **Phase 4: Performance** | #11 | Virtualization accessibility (if needed) |

---

## Sources

### Authoritative (HIGH Confidence)
- [W3C APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C APG Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [MDN aria-activedescendant](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant)
- [MDN ElementInternals.setFormValue()](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue)
- [Chrome Developers: Top Layer](https://developer.chrome.com/blog/what-is-the-top-layer)
- [Chrome Developers: Web UI 2025](https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap)

### Expert Articles (MEDIUM-HIGH Confidence)
- [Sarah Higley: aria-activedescendant is not focus](https://sarahmhigley.com/writing/activedescendant/)
- [OddBird: Anchor Positioning Updates](https://www.oddbird.net/2025/10/13/anchor-position-area-update/)
- [HTMHell: Top Layer Troubles](https://www.htmhell.dev/adventcalendar/2025/1/)
- [Shadow DOM Events](https://javascript.info/shadow-dom-events)
- [Lamplightdev: Click Outside Web Component](https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/)

### Community/Issue Trackers (MEDIUM Confidence)
- [Shoelace Multi-select FormData Discussion](https://github.com/shoelace-style/shoelace/discussions/1799)
- [react-select iOS Issues](https://github.com/JedWatson/react-select/issues/904)
- [Fluent UI Mobile Combobox](https://github.com/microsoft/fluentui/issues/15779)
