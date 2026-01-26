---
phase: 27-core-input-component
verified: 2026-01-26T10:26:51Z
status: human_needed
score: 8/8 must-haves verified
human_verification:
  - test: "Type into different input types and verify browser behaviors"
    expected: "Email input shows email keyboard on mobile, number input shows steppers, password obscures text, search shows clear icon"
    why_human: "Browser-specific keyboard layouts and UI controls cannot be verified programmatically"
  - test: "Submit form with empty required input"
    expected: "Browser shows native validation error bubble preventing submission"
    why_human: "Native browser validation popup display requires human observation"
  - test: "Fill invalid email format and blur"
    expected: "Red error border appears with validation message below input"
    why_human: "Visual state verification requires human observation"
  - test: "Navigate to input with Tab key"
    expected: "Blue focus border appears (var(--ui-input-border-focus))"
    why_human: "Keyboard navigation and focus ring display require human testing"
  - test: "Wrap lui-input in native form and submit"
    expected: "FormData contains input value with correct name"
    why_human: "Form submission and FormData integration require runtime testing"
---

# Phase 27: Core Input Component Verification Report

**Phase Goal:** Developers can add a fully functional text input to any form with native validation and form participation

**Verified:** 2026-01-26T10:26:51Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can type into input fields of all 5 types | ✓ VERIFIED | InputType = 'text' \| 'email' \| 'password' \| 'number' \| 'search' exported, type prop wired to native input element |
| 2 | User submits form with empty required input and sees browser validation error | ✓ VERIFIED | required prop exists, wired to native input, ElementInternals.setValidity() mirrors native validity including valueMissing |
| 3 | User fills invalid input and sees visual error state with validation message | ✓ VERIFIED | validate() method mirrors native validity (typeMismatch, patternMismatch, tooShort, tooLong, rangeUnderflow, rangeOverflow), showError state triggers input-error class, error message displayed with role="alert" |
| 4 | Developer wraps lui-input in native form and receives input value in FormData | ✓ VERIFIED | static formAssociated = true, attachInternals() called (with isServer guard), updateFormValue() calls setFormValue() on every input event |
| 5 | User navigates to input via Tab key and sees focus ring | ✓ VERIFIED | input:focus-visible { border-color: var(--ui-input-border-focus) } in static styles |
| 6 | Input supports required, minlength, maxlength, pattern validation | ✓ VERIFIED | All validation props exist and wired to native input, validate() mirrors validity states |
| 7 | Input supports min/max for number type | ✓ VERIFIED | min and max props exist, wired to native input, validate() handles rangeUnderflow/rangeOverflow |
| 8 | Developer sees label, helper text, and error display | ✓ VERIFIED | label, helperText, errorMessage all render with proper structure, aria-describedby links to helper or error, required indicator shows * or "(required)" |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/input/package.json` | Package manifest with @lit-ui/input | ✓ VERIFIED | EXISTS (53 lines), SUBSTANTIVE (correct exports, peerDependencies, sideEffects), WIRED (exports point to dist/index.js) |
| `packages/input/src/input.ts` | Input component class | ✓ VERIFIED | EXISTS (500 lines), SUBSTANTIVE (no TODOs, no stubs, complete implementation), WIRED (exported from index.ts, customElements.define in index.ts) |
| `packages/input/src/index.ts` | Package entry with registration | ✓ VERIFIED | EXISTS (33 lines), SUBSTANTIVE (exports Input, InputType, InputSize, registers custom element), WIRED (imports from input.ts, customElements.define('lui-input', Input)) |
| `packages/input/src/jsx.d.ts` | Framework JSX types | ✓ VERIFIED | EXISTS (58 lines), SUBSTANTIVE (React, Vue, Svelte types with all props), WIRED (referenced in index.ts) |
| `packages/input/tsconfig.json` | TypeScript config | ✓ VERIFIED | EXISTS (175 bytes), SUBSTANTIVE (extends @lit-ui/typescript-config/library.json), WIRED (used by build) |
| `packages/input/vite.config.ts` | Vite build config | ✓ VERIFIED | EXISTS (133 bytes), SUBSTANTIVE (uses createLibraryConfig), WIRED (used by build) |
| `packages/input/dist/` | Build outputs | ✓ VERIFIED | EXISTS (index.js 9.07 kB, index.d.ts 4.78 kB), SUBSTANTIVE (complete build), package builds successfully |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| Input class | ElementInternals | attachInternals() | ✓ WIRED | Called in constructor with isServer guard, internals stored as private property |
| Input component | Form value | setFormValue() | ✓ WIRED | updateFormValue() calls internals.setFormValue(this.value) on every input event |
| Input component | Validation | setValidity() | ✓ WIRED | validate() method mirrors native input.validity to internals.setValidity() with all 7 validity flags (valueMissing, typeMismatch, patternMismatch, tooShort, tooLong, rangeUnderflow, rangeOverflow) |
| Native input | Input component | @input handler | ✓ WIRED | handleInput bound to input @input event, updates value and calls updateFormValue() |
| Native input | Validation trigger | @blur handler | ✓ WIRED | handleBlur sets touched=true, calls validate(), sets showError based on validity |
| Input validation props | Native input | attribute binding | ✓ WIRED | required, minlength, maxlength, min, max, pattern all bound to native input attributes |
| Error state | Visual styling | CSS class | ✓ WIRED | showError triggers 'input-error' class, applies border-color: var(--ui-input-border-error) |
| Focus state | Visual styling | CSS pseudo-class | ✓ WIRED | input:focus-visible applies border-color: var(--ui-input-border-focus) |
| Label | Input | for/id association | ✓ WIRED | label for=${this.inputId} links to input id=${this.inputId} |
| Error message | Screen readers | aria-describedby + role | ✓ WIRED | aria-describedby points to error span id, error span has role="alert" |
| Input types | Native behavior | type attribute | ✓ WIRED | InputType exported, type prop bound to native input type=${this.type} |
| Size variants | Visual styling | CSS classes | ✓ WIRED | InputSize exported, getInputClasses() returns 'input-sm/md/lg', CSS tokens applied per size |
| CSS tokens | Core package | var(--ui-input-*) | ✓ WIRED | All tokens (border, bg, text, padding, font-size, etc.) reference Phase 26 tokens, tokens exist in @lit-ui/core/tokens/index.ts |

### Requirements Coverage

Phase 27 requirements from ROADMAP:
- INPUT-01 through INPUT-12 (all core input requirements)
- INFRA-02 (package structure)

All requirements mapped to verified truths and artifacts. All ✓ SATISFIED.

### Anti-Patterns Found

None.

**Findings:**
- No TODO/FIXME comments
- No stub patterns (placeholder text, console.log only, empty returns)
- No orphaned code
- All exports are used
- All props are wired to template
- All handlers have real implementations
- Validation mirrors native input validity (best practice pattern)
- Touch-based error display (show errors only after blur) follows UX best practices
- SSR guards properly implemented (isServer check before attachInternals)

### Human Verification Required

All automated structural checks pass. However, the following require human verification because they involve runtime browser behavior, visual appearance, and native form integration:

#### 1. Input Type Browser Behaviors

**Test:** Create inputs with each type and interact on both desktop and mobile:
```html
<lui-input type="text" label="Text"></lui-input>
<lui-input type="email" label="Email"></lui-input>
<lui-input type="password" label="Password"></lui-input>
<lui-input type="number" label="Number"></lui-input>
<lui-input type="search" label="Search"></lui-input>
```

**Expected:**
- Text: Standard keyboard, text cursor
- Email: Email keyboard on mobile with @ symbol access
- Password: Text is obscured with dots/asterisks
- Number: Shows increment/decrement steppers, numeric keyboard on mobile
- Search: Shows clear (X) button when text entered (browser-specific)

**Why human:** Browser-specific keyboard layouts, UI controls (steppers, clear buttons), and password masking require human testing across devices.

#### 2. Browser Native Validation

**Test:** Create form with required field and submit empty:
```html
<form onsubmit="event.preventDefault(); console.log(new FormData(event.target))">
  <lui-input name="email" type="email" label="Email" required></lui-input>
  <button type="submit">Submit</button>
</form>
```

**Expected:** Clicking Submit shows browser's native validation error popup (e.g., "Please fill out this field") anchored to the input. Form submission is prevented.

**Why human:** Native browser validation popup display and positioning require visual confirmation.

#### 3. Visual Error State

**Test:** Enter invalid email and blur:
```html
<lui-input type="email" label="Email" required></lui-input>
```
Type "notanemail" and press Tab.

**Expected:**
- Input border changes to red (var(--ui-input-border-error))
- Error message appears below input with validation text
- Error message is red text
- aria-invalid="true" is set (verify with DevTools)

**Why human:** Visual styling (colors, borders, spacing) and error message positioning require human observation.

#### 4. Validation Patterns

**Test:** Test each validation type:
```html
<!-- Required -->
<lui-input label="Required" required></lui-input>

<!-- Minlength/maxlength -->
<lui-input label="Username" minlength="3" maxlength="20"></lui-input>

<!-- Pattern -->
<lui-input label="Zip Code" pattern="[0-9]{5}" placeholder="12345"></lui-input>

<!-- Email -->
<lui-input type="email" label="Email"></lui-input>

<!-- Number min/max -->
<lui-input type="number" label="Age" min="18" max="120"></lui-input>
```

**Expected:**
- Blur triggers validation
- Error state shows when invalid
- Error clears when user corrects input
- Error messages are descriptive

**Why human:** Validation timing (blur, input), visual feedback, and error message clarity require interaction testing.

#### 5. Focus State Keyboard Navigation

**Test:** Create multiple inputs and navigate with Tab key:
```html
<lui-input label="First"></lui-input>
<lui-input label="Second"></lui-input>
<lui-input label="Third"></lui-input>
```

**Expected:**
- Tab key moves focus between inputs
- Focused input shows blue border (var(--ui-input-border-focus))
- Focus ring is visible and clear
- Shift+Tab moves backwards

**Why human:** Keyboard navigation and visual focus indicators require keyboard testing.

#### 6. Form Participation and FormData

**Test:** Wrap inputs in form and log FormData:
```html
<form id="test">
  <lui-input name="username" value="john"></lui-input>
  <lui-input name="email" type="email" value="john@example.com"></lui-input>
  <lui-input name="age" type="number" value="30"></lui-input>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('test').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  console.log('FormData:', Object.fromEntries(data));
});
</script>
```

**Expected:** Console shows: `{ username: 'john', email: 'john@example.com', age: '30' }`

**Why human:** FormData integration and native form submission require runtime testing.

#### 7. Disabled and Readonly States

**Test:**
```html
<lui-input label="Disabled" disabled value="Can't edit"></lui-input>
<lui-input label="Readonly" readonly value="Can select/copy"></lui-input>
```

**Expected:**
- Disabled: Muted colors, not-allowed cursor, cannot focus or edit
- Readonly: Distinct background, text cursor, can select and copy text, cannot edit

**Why human:** Visual styling differences and interaction behavior require human testing.

#### 8. Label, Helper Text, Required Indicator

**Test:**
```html
<lui-input label="Email" helper-text="We'll never share your email"></lui-input>
<lui-input label="Password" required required-indicator="asterisk"></lui-input>
<lui-input label="Username" required required-indicator="text"></lui-input>
```

**Expected:**
- Label appears above input
- Helper text appears between label and input in muted color
- Required indicator shows * or "(required)" after label
- Helper text font-size is smaller than label

**Why human:** Visual layout, spacing, and typography require human observation.

#### 9. Size Variants

**Test:**
```html
<lui-input size="sm" placeholder="Small"></lui-input>
<lui-input size="md" placeholder="Medium"></lui-input>
<lui-input size="lg" placeholder="Large"></lui-input>
```

**Expected:**
- Small: Compact padding, smaller font
- Medium: Default comfortable size
- Large: Generous padding, larger font
- Labels scale with input size

**Why human:** Visual size differences and scaling require human observation.

---

## Verification Summary

**Automated Verification: ✓ PASSED**

All structural checks pass:
- Package structure correct (matches button package pattern)
- Input component complete with 500 lines of real implementation
- All 5 input types supported (text, email, password, number, search)
- All 3 sizes supported (sm, md, lg)
- Form association via ElementInternals implemented correctly
- Validation with setValidity() properly mirrors native input validity
- All validation props (required, minlength, maxlength, pattern, min, max) wired
- Visual states (focus, disabled, readonly, error) styled with CSS tokens
- Label, helper text, error display implemented with proper structure
- Accessibility attributes (aria-invalid, aria-describedby, role="alert") present
- Package builds successfully (9.07 kB gzipped: 2.51 kB)
- TypeScript declarations generated
- No stub patterns, TODOs, or anti-patterns found
- All CSS tokens from Phase 26 properly consumed

**Human Verification Required:**

9 test scenarios require human verification because they involve:
- Runtime browser behavior (native validation popups, FormData)
- Visual appearance (colors, borders, spacing, typography)
- Keyboard navigation and focus indicators
- Mobile keyboard layouts
- Browser-specific UI controls (number steppers, search clear button, password masking)

**Recommendation:** Proceed to human testing with the 9 test scenarios above. All code-level verification indicates the component is fully implemented and ready for functional testing.

---

_Verified: 2026-01-26T10:26:51Z_
_Verifier: Claude (gsd-verifier)_
