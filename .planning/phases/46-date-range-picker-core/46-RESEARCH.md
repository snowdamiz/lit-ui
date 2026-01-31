# Phase 46: Date Range Picker Core - Research

**Researched:** 2026-01-31
**Domain:** Web Components / Date Range Picker / Two-Calendar Layout / Range Highlighting / Form Integration
**Confidence:** HIGH

## Summary

Phase 46 builds a date range picker component (`lui-date-range-picker`) that allows users to select a start and end date via two side-by-side calendars. The component composes the existing `lui-calendar` component from Phase 42 (used directly inside `CalendarMulti` from Phase 43), adds range selection state management (start/end clicks, hover preview), range highlighting CSS, validation for min/max duration, and form integration via ElementInternals with ISO 8601 interval format (`YYYY-MM-DD/YYYY-MM-DD`).

The architecture follows established patterns in this codebase: a new package `@lit-ui/date-range-picker` extending `TailwindElement`, using `ElementInternals` for form participation (matching `lui-date-picker`), using `@floating-ui/dom` for popup positioning (matching `lui-date-picker` and `lui-select`), and composing `lui-calendar` instances inside a popup. The key new patterns are: two-click range selection state machine, CSS range highlighting between start and end dates, hover preview highlighting, and duration-based validation.

The existing `CalendarMulti` component already renders 2-3 side-by-side calendars with synchronized navigation and hidden individual navigation. However, it does not support range highlighting or hover preview. The date range picker will need to either extend `CalendarMulti` or compose two `lui-calendar` instances directly with custom rendering via the `renderDay` callback to inject range/hover CSS classes.

**Primary recommendation:** Create a new `@lit-ui/date-range-picker` package that composes two `lui-calendar` instances (leveraging `CalendarMulti`'s layout pattern but with custom day rendering via the `renderDay` callback for range highlighting). Use a state machine approach for click-to-select (first click = start, second click = end, auto-swap if needed). Apply range/hover CSS via the `DayCellState` callback pattern already supported by `lui-calendar`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lit` | ^3.3.2 | Web component framework | Project standard, all components extend LitElement via TailwindElement |
| `@lit-ui/core` | workspace:* | TailwindElement base class, dispatchCustomEvent, tailwindBaseStyles | Project standard base class |
| `@lit-ui/calendar` | workspace:* | Calendar display component with `renderDay` callback | Provides calendar grid, keyboard nav, date selection, `DayCellState` |
| `date-fns` | ^4.1.0 | Date arithmetic, formatting, comparison | Project standard; `differenceInCalendarDays`, `isBefore`, `isAfter`, `format`, `parseISO`, `startOfDay`, `isWithinInterval`, `addMonths`, `subMonths` |
| `@floating-ui/dom` | ^1.7.4 | Popup positioning with flip/shift middleware | Already used by `lui-date-picker` and `lui-select` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns/isWithinInterval` | ^4.1.0 | Check if date falls within start/end range | Range highlighting logic |
| `date-fns/differenceInCalendarDays` | ^4.1.0 | Calculate range duration for min/max validation | Duration constraints |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two `lui-calendar` via `renderDay` | Extend `CalendarMulti` with range props | CalendarMulti doesn't expose renderDay; direct composition with two calendars gives more control over range highlighting |
| Custom range CSS classes | CSS `::part()` on calendar cells | Calendar doesn't expose parts; `renderDay` callback is the designed extension point |
| Manual hover tracking | Lit `@mouseover` per cell | Using `renderDay` wrapper divs with `@mouseenter` events is cleaner and avoids modifying calendar internals |

**Installation:**
```bash
# New package setup (following date-picker pattern)
mkdir -p packages/date-range-picker/src
# Dependencies match date-picker pattern
pnpm add --filter @lit-ui/date-range-picker @floating-ui/dom
# Peer deps: lit, @lit-ui/core, @lit-ui/calendar, date-fns
```

## Architecture Patterns

### Recommended Package Structure
```
packages/date-range-picker/
├── src/
│   ├── index.ts                    # Public exports + customElements.define
│   ├── date-range-picker.ts        # Main lui-date-range-picker component
│   ├── range-calendar.ts           # Two-calendar range display (internal)
│   ├── range-utils.ts              # Range validation, duration math
│   ├── range-presets.ts            # Range preset types (This Week, Next 7 Days, etc.)
│   ├── jsx.d.ts                    # React/Vue/Svelte JSX types
│   └── vite-env.d.ts              # Vite types
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: Two-Click Range Selection State Machine
**What:** Range selection uses a clear state machine: IDLE -> SELECTING_START -> SELECTING_END -> COMPLETE. First click sets start, second click sets end. Clicking again resets to new start.
**When to use:** Always for range selection. This is the universal pattern used by MUI, React Aria, and USWDS.
**Example:**
```typescript
// Source: Derived from React Aria RangeCalendar pattern
type RangeState = 'idle' | 'start-selected' | 'complete';

@state() private rangeState: RangeState = 'idle';
@state() private startDate: string = '';  // ISO string
@state() private endDate: string = '';    // ISO string
@state() private hoveredDate: string = ''; // ISO string for preview

private handleDateClick(isoString: string): void {
  if (this.rangeState === 'idle' || this.rangeState === 'complete') {
    // First click: set start, enter selecting state
    this.startDate = isoString;
    this.endDate = '';
    this.rangeState = 'start-selected';
  } else {
    // Second click: set end, auto-swap if needed
    const start = parseISO(this.startDate);
    const end = parseISO(isoString);
    if (isBefore(end, start)) {
      // DRP-09: Auto-swap
      this.endDate = this.startDate;
      this.startDate = isoString;
    } else {
      this.endDate = isoString;
    }
    this.rangeState = 'complete';
    this.hoveredDate = '';
    this.validateAndEmit();
  }
}
```

### Pattern 2: Range Highlighting via renderDay Callback
**What:** The existing `lui-calendar` supports a `renderDay` callback (`DayCellState => TemplateResult`). Use this to inject range CSS classes (in-range, range-start, range-end, hover-preview) without modifying the calendar component.
**When to use:** For all range visual states on calendar day cells.
**Example:**
```typescript
// Source: Derived from lui-calendar DayCellState API
private renderRangeDay = (state: DayCellState) => {
  const dateStr = state.formattedDate; // 'yyyy-MM-dd'
  const isStart = dateStr === this.startDate;
  const isEnd = dateStr === this.endDate;
  const inRange = this.isInRange(dateStr);
  const inPreview = this.isInPreview(dateStr);

  const classes = [
    'range-day',
    isStart ? 'range-start' : '',
    isEnd ? 'range-end' : '',
    inRange ? 'in-range' : '',
    inPreview ? 'in-preview' : '',
  ].filter(Boolean).join(' ');

  return html`
    <span
      class="${classes}"
      @mouseenter="${() => this.handleDayHover(dateStr)}"
    >
      ${state.date.getDate()}
    </span>
  `;
};
```

### Pattern 3: Dual Calendar Layout with Synchronized Navigation
**What:** Render two `lui-calendar` instances side-by-side showing consecutive months. A single set of prev/next navigation controls both calendars. Each calendar uses `display-month` and `hide-navigation` props (already supported).
**When to use:** Always for the date range picker's calendar display.
**Example:**
```typescript
// Source: Derived from CalendarMulti pattern in calendar-multi.ts
render() {
  return html`
    <div class="range-calendars">
      <div class="range-header">
        <button class="nav-button" @click="${this.navigatePrev}">&#8249;</button>
        <span class="range-heading">${this.rangeHeading}</span>
        <button class="nav-button" @click="${this.navigateNext}">&#8250;</button>
      </div>
      <div class="calendars-wrapper">
        <lui-calendar
          display-month="${this.getDisplayMonth(0)}"
          hide-navigation
          .renderDay="${this.renderRangeDay}"
          .locale="${this.effectiveLocale}"
          min-date="${this.minDate || nothing}"
          max-date="${this.maxDate || nothing}"
          @change="${this.handleCalendarSelect}"
        ></lui-calendar>
        <lui-calendar
          display-month="${this.getDisplayMonth(1)}"
          hide-navigation
          .renderDay="${this.renderRangeDay}"
          .locale="${this.effectiveLocale}"
          min-date="${this.minDate || nothing}"
          max-date="${this.maxDate || nothing}"
          @change="${this.handleCalendarSelect}"
        ></lui-calendar>
      </div>
    </div>
  `;
}
```

### Pattern 4: Form Value as ISO 8601 Interval
**What:** The form value (submitted via ElementInternals) uses the ISO 8601 interval format: `YYYY-MM-DD/YYYY-MM-DD` (start/end separated by solidus). This is the standard specified in ISO 8601 Section 4.4.
**When to use:** Always for form submission value.
**Example:**
```typescript
// Source: ISO 8601 Time Intervals specification
private updateFormValue(): void {
  if (this.startDate && this.endDate) {
    this.internals?.setFormValue(`${this.startDate}/${this.endDate}`);
  } else {
    this.internals?.setFormValue(null);
  }
}
```

### Pattern 5: Hover Preview During Range Selection
**What:** After start date is selected (state = 'start-selected'), hovering over any date shows a visual preview of what the range would be if that date were clicked. This applies both via mouse hover AND keyboard focus movement.
**When to use:** Only when `rangeState === 'start-selected'`.
**Example:**
```typescript
// Source: React Aria RangeCalendar hover preview pattern
private handleDayHover(dateStr: string): void {
  if (this.rangeState === 'start-selected') {
    this.hoveredDate = dateStr;
  }
}

private isInPreview(dateStr: string): boolean {
  if (this.rangeState !== 'start-selected' || !this.hoveredDate) return false;
  const date = parseISO(dateStr);
  const start = parseISO(this.startDate);
  const hovered = parseISO(this.hoveredDate);

  // Preview shows range from start to hovered (or hovered to start if before)
  const rangeStart = isBefore(hovered, start) ? hovered : start;
  const rangeEnd = isAfter(hovered, start) ? hovered : start;
  return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
}
```

### Anti-Patterns to Avoid
- **Modifying lui-calendar internals for range highlighting:** Use the `renderDay` callback instead. The calendar already supports custom day cell rendering via `DayCellState`.
- **Using two separate date pickers instead of a unified range picker:** This breaks the user mental model of "selecting a range" and makes hover preview impossible.
- **Submitting start and end as separate form fields:** Use the ISO 8601 interval format (`YYYY-MM-DD/YYYY-MM-DD`) as a single value. This is semantically correct and parseable.
- **Allowing range selection to complete with invalid duration:** Validate min/max constraints at selection time and prevent the range from completing if invalid. Show visual feedback (e.g., tooltip or inline error).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Calendar grid rendering | Custom 7-column grid | `lui-calendar` with `renderDay` | Already built, tested, accessible, with keyboard nav, gestures, animations |
| Calendar navigation | Month prev/next logic | `lui-calendar` `display-month` + `hide-navigation` props | CalendarMulti pattern already proven |
| Date arithmetic | Manual month/day math | `date-fns` (`differenceInCalendarDays`, `isWithinInterval`, `addMonths`) | Edge cases: leap years, DST, month boundaries |
| Popup positioning | Manual `position: fixed` + offset calculations | `@floating-ui/dom` with `flip()`, `shift()`, `offset()` | Handles viewport clipping, scroll, Shadow DOM |
| Form participation | Custom form handling | `ElementInternals` (`setFormValue`, `setValidity`) | Native API, matches existing components |
| Click-outside detection | Global click listener with DOM checking | `composedPath().includes(this)` pattern | Shadow DOM compatible, already used in date-picker |

**Key insight:** The `renderDay` callback on `lui-calendar` is the designed extension point for range highlighting. It receives `DayCellState` with all computed state (isToday, isSelected, isDisabled, isOutsideMonth) and returns a Lit template. The date range picker wraps each day cell with range-aware CSS classes via this callback, avoiding any modification to the calendar component.

## Common Pitfalls

### Pitfall 1: Range Highlight Leaking Across Shadow DOM Boundaries
**What goes wrong:** CSS classes added via `renderDay` are inside the calendar's Shadow DOM. If range CSS is defined in the date-range-picker's styles, it won't reach the calendar cells.
**Why it happens:** Shadow DOM style encapsulation prevents parent styles from reaching child component internals.
**How to avoid:** Define range CSS as inline styles on the rendered day elements, OR use CSS custom properties (which DO cascade into Shadow DOM) for range colors, and apply them via `style=` attributes in the `renderDay` callback.
**Warning signs:** Range highlighting appears in dev tools style rules but cells don't visually change.

### Pitfall 2: Event Name Convention Mismatch
**What goes wrong:** Calendar emits `change` events via `dispatchCustomEvent(this, 'change', ...)` but CalendarMulti listens for `@ui-change`. The `dispatchCustomEvent` helper does NOT prefix events with `ui-`.
**Why it happens:** Looking at the codebase, `dispatchCustomEvent` dispatches the raw event name. Some components dispatch `change`, others dispatch `ui-change`. CalendarMulti uses `@ui-change` to listen to child calendars, but Calendar dispatches `change`.
**How to avoid:** Test event handling carefully. Listen for the actual event name the calendar dispatches. Check whether events bubble and are composed (both are `true` by default in `dispatchCustomEvent`).
**Warning signs:** Date selection clicks on the calendar don't trigger the range picker's handler.

### Pitfall 3: Hover Preview Not Clearing on Mouse Leave
**What goes wrong:** The hover preview range remains visible after the mouse leaves the calendar area, creating a confusing "stuck" state.
**Why it happens:** Only `mouseenter` is tracked on day cells; no `mouseleave` handler on the calendar container.
**How to avoid:** Add a `@mouseleave` handler on the calendars wrapper that clears `hoveredDate` when the mouse exits the calendar area entirely.
**Warning signs:** Hover preview persists after mouse moves away from calendars.

### Pitfall 4: Auto-Swap Breaking Min/Max Duration Validation
**What goes wrong:** User clicks a date as "end" that's before start. Auto-swap fires, but the swapped range may violate min/max duration constraints. If validation only runs on the original click order, it misses the constraint violation.
**Why it happens:** Validation checks pre-swap values.
**How to avoid:** Always validate AFTER auto-swap, using the final start/end values.
**Warning signs:** Invalid ranges (too short/long) slip through when auto-swap triggers.

### Pitfall 5: Keyboard Focus Not Triggering Hover Preview
**What goes wrong:** Mouse hover shows range preview, but keyboard navigation (arrow keys) does not. This violates accessibility parity.
**Why it happens:** Preview logic only listens to `mouseenter` events, not keyboard focus changes.
**How to avoid:** Also update `hoveredDate` when the calendar's focused date changes. This can be tracked by listening to the calendar's internal focus movement or by intercepting keyboard events on the calendar grid.
**Warning signs:** Keyboard-only users cannot preview the range before committing.

### Pitfall 6: Two Calendars Showing Same Month
**What goes wrong:** When the user navigates, both calendars might show the same month or overlap.
**Why it happens:** Navigation logic doesn't enforce that the second calendar is always `currentMonth + 1`.
**How to avoid:** The second calendar's `display-month` should always be `addMonths(currentMonth, 1)`. Navigation moves `currentMonth`, and the second calendar follows automatically.
**Warning signs:** Both calendars show "January 2026".

## Code Examples

### Complete Range Highlighting CSS
```css
/* Source: Derived from React Aria RangeCalendar CSS patterns */

/* Range day wrapper - applied via renderDay callback */
.range-day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 0;
  transition: background-color 150ms;
}

/* Start date: rounded on the left */
.range-start {
  background-color: var(--ui-range-selected-bg, var(--color-primary, #3b82f6));
  color: var(--ui-range-selected-text, white);
  border-radius: 9999px 0 0 9999px;
}

/* End date: rounded on the right */
.range-end {
  background-color: var(--ui-range-selected-bg, var(--color-primary, #3b82f6));
  color: var(--ui-range-selected-text, white);
  border-radius: 0 9999px 9999px 0;
}

/* Start == End (single day range) */
.range-start.range-end {
  border-radius: 9999px;
}

/* In-range days between start and end */
.in-range {
  background-color: var(--ui-range-highlight-bg, #dbeafe);
  color: var(--ui-range-highlight-text, inherit);
}

/* Hover preview during selection */
.in-preview {
  background-color: var(--ui-range-preview-bg, #eff6ff);
}
```

### Range Duration Validation
```typescript
// Source: date-fns differenceInCalendarDays API
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface RangeValidation {
  valid: boolean;
  error: string;
}

function validateRangeDuration(
  startDate: string,
  endDate: string,
  minDays?: number,
  maxDays?: number,
): RangeValidation {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const duration = differenceInCalendarDays(end, start);

  if (duration < 0) {
    return { valid: false, error: 'End date must be after start date' };
  }
  if (minDays !== undefined && duration < minDays) {
    return { valid: false, error: `Minimum range is ${minDays} days` };
  }
  if (maxDays !== undefined && duration > maxDays) {
    return { valid: false, error: `Maximum range is ${maxDays} days` };
  }
  return { valid: true, error: '' };
}
```

### ElementInternals Form Integration
```typescript
// Source: Derived from lui-date-picker form integration pattern
static formAssociated = true;
private internals: ElementInternals | null = null;

// Properties for range
@property({ type: String, attribute: 'start-date', reflect: true })
startDate = '';

@property({ type: String, attribute: 'end-date', reflect: true })
endDate = '';

@property({ type: String })
name = '';

// Form value as ISO 8601 interval
private updateFormValue(): void {
  if (this.startDate && this.endDate) {
    const isoInterval = `${this.startDate}/${this.endDate}`;
    this.internals?.setFormValue(isoInterval);
  } else {
    this.internals?.setFormValue(null);
  }
}

// Form reset callback
formResetCallback(): void {
  this.startDate = '';
  this.endDate = '';
  this.rangeState = 'idle';
  this.hoveredDate = '';
  this.internals?.setFormValue(null);
  this.internals?.setValidity({});
}
```

### Clear Button Handler
```typescript
// Source: Derived from lui-date-picker handleClear pattern
private handleClear(): void {
  this.startDate = '';
  this.endDate = '';
  this.hoveredDate = '';
  this.rangeState = 'idle';
  this.internalError = '';
  this.updateFormValue();
  this.inputEl?.focus();

  dispatchCustomEvent(this, 'change', {
    startDate: null,
    endDate: null,
    isoInterval: '',
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Two separate date inputs for range | Single unified range picker with visual highlighting | Established pattern since ~2018 | Much better UX for selecting continuous date ranges |
| jQuery daterangepicker plugin | Native web components with Shadow DOM | Progressive adoption | No jQuery dependency, works with any framework |
| Manual popup positioning | Floating UI / CSS Anchor Positioning | Floating UI mature since 2022 | Handles viewport clipping, scroll, Shadow DOM boundaries |
| Custom form values via hidden inputs | ElementInternals `setFormValue()` | Chrome 77+, now all major browsers | Native form participation without hidden inputs |

**Deprecated/outdated:**
- jQuery daterangepicker: Still widely used but unnecessary with modern web components
- CSS Anchor Positioning: Not yet widely enough supported to replace Floating UI (as of 2026-01)

## Open Questions

1. **Calendar `renderDay` callback and hover events**
   - What we know: `renderDay` returns a template that gets rendered inside a `date-button-wrapper` div. The wrapper handles `@click` for selection.
   - What's unclear: Whether `@mouseenter` events on elements inside `renderDay` will propagate correctly through Shadow DOM boundaries for hover preview.
   - Recommendation: Test during implementation. If events don't propagate, use `@mouseover` on the calendar wrapper and calculate which date cell the mouse is over from coordinates.

2. **Calendar event name disambiguation**
   - What we know: Calendar dispatches `change` events, but CalendarMulti listens for `@ui-change`. There may be event name prefixing happening at the custom element boundary.
   - What's unclear: Whether `dispatchCustomEvent(this, 'change', ...)` results in event type `change` or `ui-change` at the parent listener level.
   - Recommendation: Verify by inspecting the actual event type during implementation. Use whichever event name the calendar actually dispatches.

3. **Keyboard-driven hover preview**
   - What we know: Mouse hover preview is straightforward via `@mouseenter`. Keyboard parity requires tracking the calendar's currently focused date.
   - What's unclear: Whether `lui-calendar` exposes a focus-change event or if the focused date needs to be detected indirectly.
   - Recommendation: If no focus-change event exists, track `@keydown` events on the calendar container and compute the focused date from the navigation manager's state. Alternatively, add a lightweight `focus-change` event to `lui-calendar` if modifying it is acceptable.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/calendar/src/calendar.ts` - Calendar component with `renderDay`, `DayCellState`, `display-month`, `hide-navigation`
- Existing codebase: `packages/calendar/src/calendar-multi.ts` - Multi-calendar layout pattern with synchronized navigation
- Existing codebase: `packages/date-picker/src/date-picker.ts` - DatePicker with ElementInternals, Floating UI, click-outside
- Existing codebase: `packages/core/src/utils/events.ts` - `dispatchCustomEvent` utility
- ISO 8601 specification - Time intervals format (`YYYY-MM-DD/YYYY-MM-DD`)
- React Aria RangeCalendar - Accessibility patterns, data attributes, hover preview

### Secondary (MEDIUM confidence)
- [React Aria RangeCalendar](https://react-aria.adobe.com/RangeCalendar) - ARIA roles and CSS data attributes for range cells
- [MUI X DateRangeCalendar](https://mui.com/x/react-date-pickers/date-range-calendar/) - Dual calendar layout, `calendars` prop pattern
- [USWDS Date Range Picker](https://designsystem.digital.gov/components/date-range-picker/) - Accessibility testing guidance
- [W3C ARIA APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) - ARIA grid pattern, keyboard navigation
- [date-fns documentation](https://date-fns.org/) - `differenceInCalendarDays`, `isWithinInterval` API

### Tertiary (LOW confidence)
- [Angular dual mat-calendar Medium article](https://medium.com/@akarshneeraj/implementing-a-custom-datepicker-with-two-mat-calendar-components-in-angular-7db122773d24) - General dual-calendar implementation approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already used in the codebase, no new dependencies except date-fns functions already available
- Architecture: HIGH - Patterns directly derived from existing `lui-calendar`, `CalendarMulti`, and `lui-date-picker` implementations
- Pitfalls: HIGH - Identified from codebase analysis (Shadow DOM styling, event naming) and established range picker patterns
- Range highlighting approach: MEDIUM - `renderDay` callback is designed for customization but range-specific inline styles in Shadow DOM need implementation verification

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable domain, no fast-moving dependencies)
