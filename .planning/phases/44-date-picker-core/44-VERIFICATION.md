---
phase: 44-date-picker-core
verified: 2026-01-31T03:05:00Z
status: passed
score: 28/28 must-haves verified
---

# Phase 44: Date Picker Core Verification Report

**Phase Goal:** Single date picker with input field, calendar popup, positioning, form integration, and validation.
**Verified:** 2026-01-31T03:05:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

All 5 success criteria from ROADMAP.md verified against actual codebase implementation:

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can type dates in multiple formats (dashes, slashes, dots) with locale-aware display | ✓ VERIFIED | `parseDateInput()` in date-input-parser.ts supports 9 format variations (ISO, slash/dash/dot with US/EU ordering). `formatDateForDisplay()` uses Intl.DateTimeFormat with month:'long' for locale-aware display |
| 2 | User can click input or calendar icon to open calendar popup with proper positioning | ✓ VERIFIED | `togglePopup()` method at line 624, calendar icon button at line 893-903, `computePosition()` with flip/shift middleware at line 677-691 |
| 3 | User sees inline errors for invalid dates with aria-invalid="true" | ✓ VERIFIED | `aria-invalid` attribute set at line 864, `internalError` state displays at lines 915-923, validation errors set via `setValidity()` at lines 528-577 |
| 4 | User can clear date selection with X button and submit form with ISO 8601 format | ✓ VERIFIED | Clear button at lines 878-891 calls `handleClear()` at line 721, ISO format `yyyy-MM-dd` used at line 521, `setFormValue()` at line 762 |
| 5 | User experiences focus management with trap in popup and return to input on close | ✓ VERIFIED | Focus trap in `handlePopupKeydown()` at lines 741-744, focus restore in `closePopup()` at lines 655-656, `focusCalendar()` at lines 664-667 |

**Score:** 5/5 truths verified

### Required Artifacts (from must_haves)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/date-picker/package.json` | Package config with @floating-ui/dom, date-fns, @lit-ui/calendar peer deps | ✓ VERIFIED | 62 lines, has @floating-ui/dom@^1.7.4 dependency, date-fns@^4.0.0 peer dep, @lit-ui/calendar peer dep |
| `packages/date-picker/src/date-input-parser.ts` | Multi-format date parsing utility with exports | ✓ VERIFIED | 114 lines, exports parseDateInput, formatDateForDisplay, getPlaceholderText |
| `packages/date-picker/src/date-picker.ts` | Main component with input, popup, form integration | ✓ VERIFIED | 955 lines, DatePicker class exported, substantive implementation |
| `packages/date-picker/src/index.ts` | Public exports and custom element registration | ✓ VERIFIED | 34 lines, customElements.define at line 26, exports DatePicker and utilities |
| `packages/date-picker/src/jsx.d.ts` | React JSX type declarations | ✓ VERIFIED | 57 lines, declares lui-date-picker with all props and events |

**Score:** 5/5 artifacts verified (all exist, substantive, and wired)

### Key Link Verification

All critical wiring verified against actual imports and usage:

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| date-picker.ts | date-input-parser.ts | import { parseDateInput, formatDateForDisplay, getPlaceholderText } | ✓ WIRED | Import at line 24, parseDateInput called at line 519, formatDateForDisplay called at lines 457, 551, 704, getPlaceholderText used at line 427 |
| date-picker.ts | @lit-ui/calendar | `<lui-calendar>` element in template | ✓ WIRED | Import @lit-ui/calendar in index.ts line 19, lui-calendar element at lines 934-940, querySelector at line 665 |
| date-picker.ts | ElementInternals | attachInternals() with isServer guard | ✓ WIRED | attachInternals() at line 408, setFormValue at lines 762, 820, setValidity at 10 locations (validation throughout) |
| date-picker.ts | @floating-ui/dom | import { computePosition, flip, shift, offset } | ✓ WIRED | Import at line 26, computePosition called at line 677 with middleware |
| date-picker.ts | document click listener | composedPath().includes(this) | ✓ WIRED | handleDocumentClick at line 477 uses composedPath(), addEventListener at line 485, removeEventListener at line 492 |
| date-picker.ts | lui-calendar focus | querySelector('lui-calendar')?.focus() | ✓ WIRED | focusCalendar method at line 664-667, called from openPopup (line 645) and handlePopupKeydown (line 744) |
| index.ts | date-picker.ts | export { DatePicker } | ✓ WIRED | Export at line 6 |
| index.ts | date-input-parser.ts | export utilities | ✓ WIRED | Re-exports parseDateInput, formatDateForDisplay, getPlaceholderText at lines 9-13 |

**Score:** 8/8 key links verified

### Requirements Coverage

Phase 44 requirements from ROADMAP.md (DP-04 through DP-19):

| Requirement | Status | Evidence |
|-------------|--------|----------|
| DP-04: Text input parses dates in multiple formats | ✓ SATISFIED | parseDateInput() handles ISO, slash/dash/dot formats (date-input-parser.ts lines 64-82) |
| DP-05: Date format displays month name or uses labeled fields | ✓ SATISFIED | formatDateForDisplay() uses Intl with month:'long' (line 96-100) |
| DP-06: Component integrates with forms via ElementInternals | ✓ SATISFIED | attachInternals() at line 408, formAssociated=true at line 41 |
| DP-07: Form value submits as ISO 8601 format | ✓ SATISFIED | format(parsed, 'yyyy-MM-dd') at line 521, setFormValue at line 762 |
| DP-08: Invalid dates show inline error with aria-invalid | ✓ SATISFIED | aria-invalid at line 864, error text at lines 915-923, setValidity for badInput at line 561 |
| DP-09: Placeholder text shows expected date format | ✓ SATISFIED | getPlaceholderText() returns MM/DD/YYYY or DD/MM/YYYY (date-input-parser.ts line 111-113) |
| DP-10: Helper text displays format requirements | ✓ SATISFIED | helperText property at line 116, rendered at lines 906-913 |
| DP-11: Clear button resets date selection | ✓ SATISFIED | handleClear() at lines 721-733, button at lines 878-891 |
| DP-12: Focus is trapped within calendar popup | ✓ SATISFIED | handlePopupKeydown Tab handler at lines 741-744 prevents default and refocuses calendar |
| DP-13: Focus returns to input when popup closes | ✓ SATISFIED | closePopup() at lines 655-656 restores focus to triggerElement |
| DP-14: Escape key closes calendar popup | ✓ SATISFIED | handlePopupKeydown Escape handler at lines 745-750 |
| DP-15: Clicking outside popup closes calendar | ✓ SATISFIED | handleDocumentClick at lines 476-480 with composedPath check |
| DP-16: Calendar popup uses Floating UI for positioning | ✓ SATISFIED | computePosition at line 677 with fixed strategy |
| DP-17: Calendar popup uses flip/shift middleware | ✓ SATISFIED | flip/shift middleware at lines 682-683 |
| DP-18: Popup uses composedPath() for click-outside | ✓ SATISFIED | composedPath().includes(this) at line 477 |
| DP-19: Component uses date-fns for date manipulation | ✓ SATISFIED | Imports parseISO, isBefore, isAfter, startOfDay, format at line 25 |

**Score:** 16/16 requirements satisfied

### Plan-Specific Must-Haves

#### Plan 01: Package Scaffolding and Date Input Parser

**Truths:**
- ✓ Date input parser correctly parses dates in ISO format (yyyy-MM-dd)
- ✓ Date input parser correctly parses dates with slashes, dashes, and dots
- ✓ Date input parser respects locale for MM/dd vs dd/MM ambiguity
- ✓ Date input parser returns null for invalid date strings
- ✓ Package scaffolding builds without errors

**Evidence:** ISO_FORMATS constant at line 9, US_ORDERED_FORMATS/EU_ORDERED_FORMATS at lines 11-39, locale ordering logic at lines 47-52 and 69-72, null returns at lines 66 and 81, successful build confirmed (109.83 kB bundle).

#### Plan 02: Main Component with Input, Popup, Form Integration

**Truths:**
- ✓ User sees an input field with a calendar icon button to the right
- ✓ User sees placeholder text showing expected date format
- ✓ User can click the calendar icon or input to open a calendar popup
- ✓ User can type a date and see it parsed and formatted on blur
- ✓ User can click a date in the calendar popup to select it
- ✓ User can clear the date with an X button
- ✓ Component submits ISO 8601 form value via ElementInternals

**Evidence:** Input field at lines 857-876, calendar icon button at lines 893-903, placeholder at line 861, togglePopup at line 624, handleInputBlur parsing at line 519, handleCalendarSelect at line 696, clear button at lines 878-891, setFormValue at line 762.

#### Plan 03: Floating UI Positioning and Click-Outside Detection

**Truths:**
- ✓ Calendar popup uses Floating UI fixed positioning below the input trigger
- ✓ Popup flips above the input when insufficient space below
- ✓ Popup shifts horizontally to avoid viewport clipping
- ✓ Clicking outside the component closes the popup
- ✓ Click-outside detection works across Shadow DOM boundaries via composedPath()
- ✓ Document click listener is cleaned up on disconnectedCallback

**Evidence:** computePosition with strategy:'fixed' at lines 677-679, flip middleware with fallbackPlacements at line 682, shift middleware with padding at line 683, handleDocumentClick at lines 476-480, composedPath() at line 477, removeEventListener at line 492.

#### Plan 04: Focus Management and Validation

**Truths:**
- ✓ Focus moves into the calendar when popup opens
- ✓ Tab/Shift+Tab is trapped within the popup when open
- ✓ Focus returns to the input when popup closes
- ✓ Invalid dates show inline error with aria-invalid=true
- ✓ Required empty field shows validation error after blur
- ✓ Min/max date violations show range validation errors

**Evidence:** focusCalendar called at line 645, Tab trap at lines 741-744, focus restore at lines 655-656, aria-invalid at line 864, valueMissing validation at lines 567-573, rangeUnderflow/rangeOverflow at lines 524-546 and 780-803.

#### Plan 05: Package Exports and JSX Types

**Truths:**
- ✓ lui-date-picker custom element is registered via index.ts
- ✓ DatePicker class is exported for programmatic use
- ✓ React JSX types declare lui-date-picker with all props and events
- ✓ Full package builds without errors via pnpm workspace

**Evidence:** customElements.define at line 26 of index.ts, export { DatePicker } at line 6 of index.ts, JSX types in jsx.d.ts lines 29-38, build success confirmed (109.83 kB, gzip 24.40 kB).

**Total Must-Haves:** 28/28 verified

### Anti-Patterns Found

No blocking anti-patterns detected. Scanned all source files for:
- TODO/FIXME comments: None found
- Placeholder content: Only legitimate placeholder property/CSS
- Empty implementations: None found
- Stub patterns: None found
- Console.log-only handlers: None found

All "return null" instances are legitimate parser failure cases in date-input-parser.ts.

### Build Verification

```
pnpm --filter @lit-ui/date-picker build
✓ built in 12.70s
dist/index.js  109.83 kB │ gzip: 24.40 kB
```

Package builds successfully with no errors.

### Wiring Quality Assessment

All critical integrations are properly wired:

1. **Date parsing pipeline:** Input → parseDateInput → validation → formatDateForDisplay → display (COMPLETE)
2. **Calendar integration:** Popup → lui-calendar → @change → handleCalendarSelect → value update (COMPLETE)
3. **Form integration:** value → setFormValue → ElementInternals → form submission (COMPLETE)
4. **Validation pipeline:** blur/change → validate → setValidity → aria-invalid → error display (COMPLETE)
5. **Positioning pipeline:** openPopup → computePosition → flip/shift → style update (COMPLETE)
6. **Focus management:** openPopup → focusCalendar, closePopup → triggerElement.focus (COMPLETE)
7. **Lifecycle management:** connectedCallback → addEventListener, disconnectedCallback → removeEventListener (COMPLETE)

### Human Verification Required

None. All success criteria can be verified programmatically through code inspection. The component is structurally complete with all required wiring in place.

If you wish to perform manual testing, recommended test cases:

1. **Multi-format parsing:** Type "01/31/2026", "2026-01-31", "31.01.2026" and verify each parses correctly
2. **Locale awareness:** Set locale="de-DE", type "01/02/2026" and verify it's interpreted as February 1st (dd/MM)
3. **Popup positioning:** Open popup at bottom of viewport and verify it flips above
4. **Focus trap:** Open popup, press Tab repeatedly and verify focus stays on calendar
5. **Validation:** Enter invalid date "99/99/9999" and verify error message appears with aria-invalid="true"
6. **Min/max constraints:** Set min-date="2026-01-15", enter "2026-01-10" and verify range error
7. **Form submission:** Add to form, select date, submit and verify ISO 8601 format in FormData

---

## Summary

Phase 44 goal **ACHIEVED**. All success criteria verified:

1. ✓ Multi-format date parsing with locale-aware display
2. ✓ Calendar popup with proper Floating UI positioning
3. ✓ Inline validation errors with aria-invalid
4. ✓ Clear button and ISO 8601 form submission
5. ✓ Complete focus management with trap and restoration

**Implementation Quality:**
- 28/28 must-haves verified across 5 plans
- 16/16 requirements satisfied (DP-04 through DP-19)
- Zero anti-patterns or stub implementations
- All key integrations properly wired
- Package builds successfully (109.83 kB)

**Ready for:** Phase 45 (date picker advanced features)

---

_Verified: 2026-01-31T03:05:00Z_
_Verifier: Claude (gsd-verifier)_
