# Phase 44: Date Picker Core - Research

**Researched:** 2026-01-31
**Domain:** Web Components / Date Picker / Form Integration / Popup Positioning
**Confidence:** HIGH

## Summary

Phase 44 builds a single date picker component (`lui-date-picker`) that composes the existing `lui-calendar` component from Phase 42 with an input field, popup positioning, form integration, and validation. The date picker is a new package (`@lit-ui/date-picker`) that depends on `@lit-ui/calendar`, `@lit-ui/core`, `date-fns`, and `@floating-ui/dom`.

The architecture follows established patterns in this codebase: extend `TailwindElement`, use `ElementInternals` for form participation (matching `lui-input` and `lui-select`), use `@floating-ui/dom` for popup positioning (matching `lui-select`), and use `composedPath()` for click-outside detection (matching `lui-select`). Date parsing uses date-fns `parse()` with multiple format strings tried sequentially, validated with `isValid()`.

The primary challenge is composing Shadow DOM boundaries correctly: the date picker owns an input field and renders `lui-calendar` inside a popup. Focus management requires trapping focus within the popup when open and returning focus to the input trigger when closed.

**Primary recommendation:** Create a new `@lit-ui/date-picker` package composing `lui-calendar` inside a positioned popup, following the exact patterns from `lui-select` for Floating UI positioning, click-outside detection, and Escape key handling, and from `lui-input` for ElementInternals form integration and validation display.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lit` | ^3.3.2 | Web component framework | Project standard, all components extend LitElement via TailwindElement |
| `@lit-ui/core` | workspace:* | TailwindElement base class, dispatchCustomEvent, tailwindBaseStyles | Project standard base class for all components |
| `@lit-ui/calendar` | workspace:* | Calendar display component (Phase 42) | Provides the calendar grid, keyboard nav, date selection already built |
| `date-fns` | ^4.1.0 | Date parsing, formatting, validation | Project decision from Phase 42; tree-shakeable, modular |
| `@floating-ui/dom` | ^1.7.4 | Popup positioning with flip/shift middleware | Already used by lui-select; handles viewport clipping and Shadow DOM |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `composed-offset-position` | latest | Shadow DOM offsetParent polyfill | If positioning breaks in Shadow DOM contexts; lui-select does not currently use it but Floating UI docs recommend it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@floating-ui/dom` | CSS `popover` + CSS Anchor Positioning | CSS Anchor Positioning not yet widely supported; Floating UI already proven in this codebase |
| `date-fns parse()` | Manual regex parsing | date-fns handles locale quirks, leap years, boundary dates; manual regex is fragile |
| Custom focus trap | `focus-trap` npm package | Extra dependency; the popup is simple enough (calendar + close button) that manual focus trap with sentinel elements suffices |

**Installation:**
```bash
# New package dependencies (peer + direct)
pnpm add --filter @lit-ui/date-picker @floating-ui/dom
# Peer deps (already in workspace): lit, @lit-ui/core, date-fns, @lit-ui/calendar
```

## Architecture Patterns

### Recommended Package Structure
```
packages/date-picker/
├── src/
│   ├── index.ts              # Public exports + customElements.define
│   ├── date-picker.ts        # Main lui-date-picker component
│   ├── date-input-parser.ts  # Multi-format date parsing utility
│   ├── jsx.d.ts              # React JSX type declarations
│   └── vite-env.d.ts         # Vite types
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: Composed Calendar Popup (NOT slotted)
**What:** The date picker renders `lui-calendar` directly in its shadow DOM template inside a positioned popup container. The calendar is NOT passed via slot.
**When to use:** Always for this component. The calendar is an implementation detail, not consumer-provided content.
**Example:**
```typescript
// Source: Derived from lui-calendar Phase 42 decision
render() {
  return html`
    <div class="date-picker-wrapper">
      ${this.renderInput()}
      ${this.open ? html`
        <div class="date-picker-popup" role="dialog" aria-modal="true" aria-label="Choose date">
          <lui-calendar
            .value=${this.value}
            .locale=${this.locale}
            .minDate=${this.minDate}
            .maxDate=${this.maxDate}
            @change=${this.handleCalendarSelect}
          ></lui-calendar>
        </div>
      ` : nothing}
    </div>
  `;
}
```

### Pattern 2: ElementInternals Form Integration
**What:** Use `static formAssociated = true` and `attachInternals()` with SSR guard, matching the exact pattern from `lui-input`.
**When to use:** For form value submission as ISO 8601 (YYYY-MM-DD).
**Example:**
```typescript
// Source: packages/input/src/input.ts lines 46-53, 528-563
export class DatePicker extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  private updateFormValue(): void {
    // Always submit ISO 8601 format regardless of display format
    this.internals?.setFormValue(this.value); // value is always YYYY-MM-DD
  }

  private validate(): boolean {
    if (!this.internals) return true;
    if (this.required && !this.value) {
      this.internals.setValidity(
        { valueMissing: true },
        'Please select a date',
        this.inputEl
      );
      return false;
    }
    // Custom date range validation
    if (this.value && this.minDate) {
      const date = parseISO(this.value);
      const min = parseISO(this.minDate);
      if (isBefore(date, min)) {
        this.internals.setValidity(
          { rangeUnderflow: true },
          `Date must be on or after ${this.minDate}`,
          this.inputEl
        );
        return false;
      }
    }
    this.internals.setValidity({});
    return true;
  }
}
```

### Pattern 3: Floating UI Positioning (from lui-select)
**What:** Use `computePosition` with `flip`, `shift`, `offset` middleware and `fixed` strategy.
**When to use:** When opening the calendar popup.
**Example:**
```typescript
// Source: packages/select/src/select.ts lines 2227-2260
private async positionPopup(): Promise<void> {
  if (isServer) return;
  const trigger = this.inputContainerEl;
  const popup = this.popupEl;
  if (!trigger || !popup) return;

  const { x, y } = await computePosition(trigger, popup, {
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(4),
      flip({ fallbackPlacements: ['top-start'] }),
      shift({ padding: 8 }),
    ],
  });

  Object.assign(popup.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
  });
}
```

### Pattern 4: Click-Outside Detection with composedPath()
**What:** Listen for document clicks and check `composedPath()` to detect clicks outside the component. Required for Shadow DOM compatibility.
**When to use:** Always for popup close behavior.
**Example:**
```typescript
// Source: packages/select/src/select.ts lines 1186-1193, 1589-1626
private handleDocumentClick = (e: MouseEvent): void => {
  if (!e.composedPath().includes(this)) {
    this.closePopup();
  }
};

override connectedCallback(): void {
  super.connectedCallback();
  if (!isServer) {
    document.addEventListener('click', this.handleDocumentClick);
  }
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  if (!isServer) {
    document.removeEventListener('click', this.handleDocumentClick);
  }
}
```

### Pattern 5: Multi-Format Date Parsing
**What:** Try parsing user input against an array of format strings, accepting the first valid result.
**When to use:** When the user types a date in the input field and blurs or presses Enter.
**Example:**
```typescript
// Source: https://gist.github.com/krutoo/c88dc9259e0ff531f3a640d5c3c6f267 + date-fns docs
import { parse, isValid } from 'date-fns';

const DATE_FORMATS = [
  'yyyy-MM-dd',    // ISO: 2026-01-31
  'MM/dd/yyyy',    // US: 01/31/2026
  'dd/MM/yyyy',    // EU: 31/01/2026
  'MM-dd-yyyy',    // US with dashes: 01-31-2026
  'dd-MM-yyyy',    // EU with dashes: 31-01-2026
  'MM.dd.yyyy',    // US with dots: 01.31.2026
  'dd.MM.yyyy',    // EU with dots: 31.01.2026
  'M/d/yyyy',      // US short: 1/31/2026
  'd/M/yyyy',      // EU short: 31/1/2026
];

function parseDateInput(input: string, locale: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Determine format order based on locale (US vs rest of world)
  const formats = getLocaleFormats(locale);

  for (const fmt of formats) {
    const result = parse(trimmed, fmt, new Date());
    if (isValid(result)) {
      return result;
    }
  }
  return null;
}
```

### Pattern 6: Focus Trap in Popup
**What:** When the popup opens, move focus into the calendar. Trap Tab/Shift+Tab within the popup. Return focus to input on close.
**When to use:** Every time the popup opens or closes.
**Example:**
```typescript
// Focus management approach
private openPopup(): void {
  this.open = true;
  // Store trigger for focus restoration
  this.triggerElement = this.inputEl;

  this.updateComplete.then(() => {
    this.positionPopup();
    // Focus the calendar inside the popup
    const calendar = this.renderRoot.querySelector('lui-calendar');
    calendar?.focus();
  });
}

private closePopup(): void {
  this.open = false;
  // Restore focus to trigger input
  this.triggerElement?.focus();
  this.triggerElement = null;
}

// Tab trap: listen for Tab on the popup container
private handlePopupKeydown(e: KeyboardEvent): void {
  if (e.key === 'Tab') {
    const focusable = this.getFocusablePopupElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
```

### Anti-Patterns to Avoid
- **Rendering calendar outside Shadow DOM:** Always keep `lui-calendar` inside the date picker's shadow root. Use Floating UI `fixed` strategy to escape stacking contexts.
- **Using native `<dialog>` for popup:** The calendar popup is NOT a modal dialog. Use a positioned `<div>` with `role="dialog" aria-modal="true"`. Native `<dialog>` with `showModal()` creates a top-layer that interferes with Floating UI positioning.
- **Parsing dates with regex:** Use date-fns `parse()` which handles edge cases like Feb 29 on leap years, month boundaries, etc.
- **Storing displayed text as form value:** Always store and submit ISO 8601 (`YYYY-MM-DD`) via ElementInternals, regardless of display format.
- **Attaching click listeners without cleanup:** Always remove document-level listeners in `disconnectedCallback()`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Popup positioning | Custom absolute positioning | `@floating-ui/dom` computePosition | Viewport clipping, scroll containers, Shadow DOM offsetParent issues |
| Date parsing from user input | Regex-based parsers | `date-fns` parse() + isValid() | Leap years, month boundaries, locale-specific ordering, DST |
| Calendar grid/keyboard nav | New calendar grid | `lui-calendar` component | Already built in Phase 42 with full a11y, keyboard nav, gestures |
| Form value submission | Manual form event handling | `ElementInternals` setFormValue | Native form participation, works with FormData, validation API |
| Weekday/month localization | Locale data bundles | `Intl.DateTimeFormat` | Zero-bundle-size, native browser API, already used in calendar |
| Click-outside detection | `element.contains()` | `event.composedPath().includes()` | `contains()` doesn't cross Shadow DOM boundaries |

**Key insight:** This component is primarily a composition layer. Almost all the hard parts (calendar rendering, keyboard nav, date math, positioning) already exist in the codebase or dependencies. The date picker's job is to orchestrate them correctly.

## Common Pitfalls

### Pitfall 1: Shadow DOM Breaks offsetParent for Floating UI
**What goes wrong:** Floating UI's default `absolute` strategy uses `offsetParent` which returns incorrect values when the floating element is inside Shadow DOM (Chrome 109+, Firefox, Safari).
**Why it happens:** The CSS spec hides the actual offsetParent inside Shadow DOM hierarchies.
**How to avoid:** Use `strategy: 'fixed'` in Floating UI config, matching the existing `lui-select` pattern. If that doesn't work, add the `composed-offset-position` polyfill.
**Warning signs:** Popup appears in wrong position, especially when date picker is inside another web component.

### Pitfall 2: Month/Day Order Ambiguity in Date Parsing
**What goes wrong:** "01/02/2026" means January 2 in US but February 1 in Europe. Parsing with wrong format silently produces wrong date.
**Why it happens:** Both `MM/dd/yyyy` and `dd/MM/yyyy` are valid formats that parse successfully for many inputs.
**How to avoid:** Use locale to determine format priority. For US locales (en-US), try MM/dd/yyyy first. For European locales, try dd/MM/yyyy first. Always try ISO format (yyyy-MM-dd) first as it's unambiguous.
**Warning signs:** Tests with dates where day <= 12 pass but real users get wrong dates.

### Pitfall 3: Focus Restoration Fails After Popup Close
**What goes wrong:** After closing the popup, focus doesn't return to the input. Or focus is lost entirely.
**Why it happens:** The trigger element reference is stale (component re-rendered), or the focus restoration runs before the popup fully closes.
**How to avoid:** Store trigger reference before opening. Use `requestAnimationFrame` or `updateComplete` to ensure DOM is settled before focus restoration. Match the pattern from `lui-dialog` which stores `triggerElement` on open and restores on close.
**Warning signs:** After selecting a date, pressing Tab doesn't move to the next form field.

### Pitfall 4: Form Value Not Synced on Programmatic Changes
**What goes wrong:** Setting `value` property programmatically doesn't update the form value.
**Why it happens:** `setFormValue()` only called in event handlers, not in property setters.
**How to avoid:** Override `updated()` to call `updateFormValue()` whenever `value` changes, not just on user interaction. Match the `lui-input` pattern.
**Warning signs:** Form submission sends stale or empty value after programmatic date change.

### Pitfall 5: Calendar Events Don't Cross Shadow DOM
**What goes wrong:** `change` event from `lui-calendar` inside the popup doesn't reach the date picker's event handler.
**Why it happens:** Custom events without `composed: true` stop at Shadow DOM boundaries. However, `lui-calendar` uses `dispatchCustomEvent` which sets `composed: true` by default.
**How to avoid:** Verify that `lui-calendar`'s `change` event is dispatched with `composed: true` (it is, via `dispatchCustomEvent` from `@lit-ui/core`). Listen for the event on the calendar element directly, not on a parent container.
**Warning signs:** Clicking a date in the popup does nothing.

### Pitfall 6: Escape Key Conflict Between Calendar and Date Picker
**What goes wrong:** Pressing Escape while in year/decade view should drill down in the calendar, but instead closes the entire popup.
**Why it happens:** Both the calendar's internal keyboard handler and the date picker's popup handler listen for Escape.
**How to avoid:** The date picker should only handle Escape at the popup level when the calendar is in month view. Check `event.defaultPrevented` or let the calendar handle Escape first and stop propagation when it navigates views.
**Warning signs:** Can't navigate back from year view to month view without closing the popup.

## Code Examples

### Complete Date Picker Component Structure
```typescript
// Source: Synthesized from codebase patterns (lui-input, lui-select, lui-calendar)
import { html, css, nothing, isServer, type PropertyValues, type CSSResultGroup } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles, dispatchCustomEvent } from '@lit-ui/core';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
import { parse, isValid, format } from 'date-fns';
import { parseISO } from 'date-fns';

export class DatePicker extends TailwindElement {
  static formAssociated = true;

  static override styles: CSSResultGroup = [
    ...tailwindBaseStyles,
    css`
      :host { display: inline-block; }
      .popup { position: fixed; z-index: 50; }
    `,
  ];

  private internals: ElementInternals | null = null;

  @property({ type: String }) value = '';           // ISO 8601: YYYY-MM-DD
  @property({ type: String }) name = '';
  @property({ type: String }) locale = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String, attribute: 'helper-text' }) helperText = '';
  @property({ type: String, attribute: 'min-date' }) minDate = '';
  @property({ type: String, attribute: 'max-date' }) maxDate = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;

  @state() private open = false;
  @state() private displayValue = '';       // Formatted for display
  @state() private inputValue = '';         // Raw text input
  @state() private showError = false;
  @state() private touched = false;

  @query('.input-container') private inputContainerEl!: HTMLElement;
  @query('.popup') private popupEl!: HTMLElement;
  @query('input') private inputEl!: HTMLInputElement;

  private triggerElement: HTMLElement | null = null;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }
}
```

### Locale-Aware Format Display
```typescript
// Source: Intl.DateTimeFormat API (used in existing intl-utils.ts)
private formatDateForDisplay(date: Date): string {
  return new Intl.DateTimeFormat(this.effectiveLocale, {
    year: 'numeric',
    month: 'long',  // Use month name for international clarity (DP-05)
    day: 'numeric',
  }).format(date);
}

private get effectiveLocale(): string {
  return this.locale || (isServer ? 'en-US' : navigator.language);
}
```

### Input Parsing with Validation
```typescript
// Source: date-fns parse() + isValid() pattern
private handleInputBlur(): void {
  this.touched = true;
  const parsed = this.parseDateInput(this.inputValue);

  if (parsed) {
    this.value = format(parsed, 'yyyy-MM-dd');
    this.displayValue = this.formatDateForDisplay(parsed);
    this.inputValue = this.displayValue;
    this.updateFormValue();
    dispatchCustomEvent(this, 'change', { date: parsed, isoString: this.value });
  } else if (this.inputValue.trim()) {
    // Invalid input
    this.showError = true;
    this.internals?.setValidity(
      { badInput: true },
      'Please enter a valid date',
      this.inputEl
    );
  }
}
```

### Clear Button Handler
```typescript
// Source: lui-input handleClear pattern (line 677-687)
private handleClear(): void {
  this.value = '';
  this.displayValue = '';
  this.inputValue = '';
  this.showError = false;
  this.updateFormValue();
  this.internals?.setValidity({});
  this.inputEl?.focus();
  dispatchCustomEvent(this, 'change', { date: null, isoString: '' });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<dialog>` for popups | Positioned `<div>` with Floating UI | N/A (architectural choice) | `<dialog>` top-layer conflicts with Floating UI; use `<div>` with `role="dialog"` |
| Manual offsetParent calculation | Floating UI `fixed` strategy | Chrome 109 (2023) | Shadow DOM broke `offsetParent`; `fixed` strategy bypasses issue |
| `element.contains()` for click-outside | `event.composedPath().includes()` | Shadow DOM adoption | `contains()` doesn't see across Shadow DOM boundaries |
| Bundle locale data for date display | Native `Intl.DateTimeFormat` | 2020+ browser support | Zero bundle cost, always up-to-date locale data |
| `moment.js` for date parsing | `date-fns` v4 modular imports | date-fns v4 (2024) | Tree-shakeable, timezone support, smaller bundles |

**Deprecated/outdated:**
- `Intl.Locale.weekInfo` property: Use `getWeekInfo()` method instead (property still works as fallback, handled in existing intl-utils.ts)

## Open Questions

1. **Display format for the input field**
   - What we know: DP-05 says "displays month name or uses labeled fields for international clarity." Intl.DateTimeFormat with `month: 'long'` gives locale-aware display like "January 31, 2026".
   - What's unclear: Should the input show the long format ("January 31, 2026") or a shorter format? Long format is more readable but takes more space.
   - Recommendation: Use `Intl.DateTimeFormat` with `{ month: 'long', day: 'numeric', year: 'numeric' }` for display. The input shows this formatted string when not focused, and switches to editable text when focused.

2. **autoUpdate for scroll/resize repositioning**
   - What we know: Floating UI's `autoUpdate` keeps the popup positioned during scroll/resize. The existing `lui-select` does NOT use `autoUpdate` - it positions once on open.
   - What's unclear: Is repositioning during scroll needed for the date picker popup?
   - Recommendation: Match `lui-select` pattern: position once on open. The calendar popup is relatively quick to interact with. Add `autoUpdate` later if scroll repositioning becomes a user complaint.

3. **Popup width matching trigger width**
   - What we know: The `lui-select` dropdown matches trigger width. The calendar has a fixed max-width of 380px.
   - What's unclear: Should the date picker popup match the input width or use the calendar's natural width?
   - Recommendation: Let the calendar popup use its natural width (up to 380px). Don't constrain it to the input width since the calendar grid needs adequate space.

## Sources

### Primary (HIGH confidence)
- `packages/calendar/src/calendar.ts` - Full calendar component with events, keyboard nav, date constraints
- `packages/calendar/src/date-utils.ts` - date-fns wrappers for calendar operations
- `packages/calendar/src/intl-utils.ts` - Intl API helpers for locale-aware rendering
- `packages/input/src/input.ts` - ElementInternals form integration, validation, clear button patterns
- `packages/select/src/select.ts` - Floating UI positioning, composedPath() click-outside, Escape key handling
- `packages/dialog/src/dialog.ts` - Focus restoration pattern (triggerElement)
- `packages/core/src/tailwind-element.ts` - TailwindElement base class and SSR patterns
- `packages/select/package.json` - @floating-ui/dom ^1.7.4 version reference

### Secondary (MEDIUM confidence)
- [Floating UI autoUpdate docs](https://floating-ui.com/docs/autoupdate) - autoUpdate function signature and options
- [Floating UI computePosition docs](https://floating-ui.com/docs/computeposition) - Shadow DOM offsetParent fix with composed-offset-position
- [date-fns parse multiple formats gist](https://gist.github.com/krutoo/c88dc9259e0ff531f3a640d5c3c6f267) - Multi-format parsing pattern

### Tertiary (LOW confidence)
- date-fns v4 `parse()` function behavior with format strings - WebSearch confirmed but official docs page didn't render content; pattern verified through gist and community examples

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already used in the codebase; versions confirmed from package.json files
- Architecture: HIGH - All patterns directly observed in existing components (lui-select, lui-input, lui-dialog, lui-calendar)
- Pitfalls: HIGH - Shadow DOM, Floating UI, and focus management pitfalls observed from existing code and official docs
- Date parsing: MEDIUM - date-fns parse() API confirmed through multiple sources but official docs page didn't render

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable domain, established libraries)
