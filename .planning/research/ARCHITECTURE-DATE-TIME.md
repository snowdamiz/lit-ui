# Architecture Patterns: Date/Time Components

**Domain:** Date and time picker components for Lit.js component library
**Researched:** 2026-01-30
**Confidence:** HIGH (based on existing LitUI patterns + WAI-ARIA standards + ecosystem research)

## Executive Summary

Date/time components integrate cleanly with the existing LitUI architecture. The key architectural decision is that **Calendar Display is a standalone, reusable component** (not a slotted child like Option), while **Date Picker and Date Range Picker compose it internally**. This differs from the Select/Option pattern because calendar selection logic is more complex and calendars need to work standalone. Time Picker is a separate, simpler component focusing on hour/minute/second selection.

All components follow established patterns:
- Extend `TailwindElement` base class
- Use `ElementInternals` for form participation
- Use Floating UI for dropdown positioning (already in Select)
- Slot-based communication for parent-child where applicable
- CSS custom properties for theming (`--ui-calendar-*`, `--ui-date-picker-*`)
- `isServer` guards for SSR compatibility

## Recommended Architecture

### Package Structure

Following the existing "one component family per package" convention:

| Package | Elements Registered | Rationale |
|---------|-------------------|-----------|
| `@lit-ui/calendar` | `lui-calendar` | Standalone calendar display; used internally by date pickers |
| `@lit-ui/date-picker` | `lui-date-picker` | Single date selection with dropdown calendar |
| `@lit-ui/date-range-picker` | `lui-date-range-picker` | Date range selection; may use one or two calendars internally |
| `@lit-ui/time-picker` | `lui-time-picker` | Time selection (hour/minute/second) |

**Why separate packages?**
- Each component can be used independently
- Users who only need a calendar display (e.g., for booking UI) don't pull in picker logic
- Matches existing pattern: `@lit-ui/button`, `@lit-ui/select`, `@lit-ui/input` are all separate
- CLI copy-source mode works cleanly with self-contained packages

**Why `@lit-ui/calendar` as a separate package?**
- Calendar can be used standalone (e.g., always-visible booking calendar)
- Date Picker internally uses `lui-calendar` but doesn't expose it as a slotted child
- Avoids the complexity of slot-based composition for a component that's primarily composed internally
- Allows for future `lui-range-calendar` variant without breaking the single-date calendar

### File Structure Per Package

```
packages/calendar/
  src/
    calendar.ts           # lui-calendar element (standalone display)
    index.ts              # Exports + element registration
    jsx.d.ts              # JSX type declarations
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts

packages/date-picker/
  src/
    date-picker.ts        # lui-date-picker element (input + dropdown)
    index.ts
    jsx.d.ts
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts

packages/date-range-picker/
  src/
    date-range-picker.ts  # lui-date-range-picker element
    index.ts
    jsx.d.ts
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts

packages/time-picker/
  src/
    time-picker.ts        # lui-time-picker element
    index.ts
    jsx.d.ts
    vite-env.d.ts
  package.json
  tsconfig.json
  vite.config.ts
```

---

## Component Composition Strategy

### Key Distinction: Internal Composition vs Slot-Based Composition

**Select/Option pattern (existing):**
- `lui-option` is a slotted child that `lui-select` discovers via `slotchange`
- Parent sets properties on children (`selected`, `multiselect`)
- Children fire events that parent listens for

**Date Picker / Calendar pattern (recommended):**
- `lui-calendar` is NOT a slotted child of `lui-date-picker`
- `lui-date-picker` internally renders `lui-calendar` in its dropdown
- Communication happens via properties and events, but through composition, not slots
- This is because:
  1. Calendar selection state is complex (selected date, hover date, focused date, visible month)
  2. Calendar needs to work standalone (without a picker wrapper)
  3. Date picker needs tight control over calendar for dropdown positioning and closing

**Date Range Picker / Calendar pattern:**
- `lui-date-range-picker` internally renders one or two `lui-calendar` instances
- Two calendars are common for range selection (showing start/end months)
- Communication is internal to the range picker component

### Component Composition Diagram

```
lui-date-picker (formAssociated)
  +-- [Input field - for display and keyboard input]
  +-- [Trigger button - calendar icon]
  +-- [Dropdown panel - positioned via Floating UI]
        +-- <lui-calendar>  # Internally composed, NOT slotted
              +-- Month navigation
              +-- Weekday headers
              +-- Date grid (7 columns)
              +-- Footer (today, clear buttons)

lui-date-range-picker (formAssociated)
  +-- [Start date input]
  +-- [End date input]
  +-- [Trigger button(s)]
  +-- [Dropdown panel]
        +-- <lui-calendar> # Start month calendar
        +-- <lui-calendar> # End month calendar (optional)

lui-calendar (NOT formAssociated - display only)
  +-- Month/year header
  +-- Prev/next month buttons
  +-- Weekday row (Sun-Sat)
  +-- Date grid (7 columns x 5-6 rows)
  +-- Optional footer

lui-time-picker (formAssociated)
  +-- [Hours input/selector]
  +-- [Minutes input/selector]
  +-- [Seconds input/selector]
  +-- [AM/PM selector for 12-hour format]
```

---

## Data Flow Patterns

### Date Picker Data Flow

```
User Interaction
     |
     v
[Calendar date clicked]
     |
     | lui-calendar dispatches 'ui-date-select' event
     |  detail: { date: Date, isoString: string }
     |
     v
[lui-date-picker] @ui-date-select handler
     |
     | 1. Updates this.value (ISO string)
     | 2. Updates input field display
     | 3. Closes dropdown
     | 4. Calls updateFormValue() -> internals.setFormValue(isoString)
     | 5. Dispatches 'ui-change' event
     |
     v
[Consumer app] @ui-change handler
```

### Date Constraints Flow

```
Parent Component (lui-date-picker)
     |
     | Sets properties on composed lui-calendar
     v
[lui-calendar] reads minDate, maxDate, disabledDates
     |
     | Uses these to:
     | - Disable date buttons visually
     | - Prevent selection in interaction handlers
     | - Skip navigation beyond min/max months
     v
[Visual feedback: disabled dates cannot be selected]
```

### Event Naming Convention

Following the existing `ui-*` event pattern:

| Event | Emitted By | Detail | Purpose |
|-------|-----------|--------|---------|
| `ui-date-select` | calendar | `{ date: Date, isoString: string }` | Internal: date chosen in calendar |
| `ui-month-change` | calendar | `{ year: number, month: number }` | Internal: month navigated |
| `ui-change` | date-picker, date-range-picker, time-picker | `{ value: string \| string[] }` | Consumer: final value changed |
| `ui-input` | date-picker, time-picker | `{ value: string }` | Consumer: user typing/interacting |
| `ui-open` | date-picker, date-range-picker | `{ open: boolean }` | Consumer: dropdown opened/closed |

**Why `ui-date-select` instead of `ui-select`?** Avoids confusion with the Select component's `ui-select` event. Date-specific naming makes the payload clear.

---

## Form Participation Architecture

### Date Picker Form Value

**Submitted format:** ISO 8601 string (`YYYY-MM-DD`)

```typescript
// lui-date-picker
export class DatePicker extends TailwindElement {
  static formAssociated = true;

  private internals: ElementInternals | null = null;

  @property({ type: String })
  get value(): string {
    return this._value; // ISO string: '2026-01-30'
  }

  set value(val: string) {
    this._value = val;
    this.updateFormValue();
  }

  private updateFormValue(): void {
    // Submit ISO string to form
    this.internals?.setFormValue(this._value || null);
    this.syncValidation();
  }

  // Form lifecycle callbacks
  formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
  }

  formStateRestoreCallback(state: string) {
    this.value = state;
  }
}
```

**Why ISO format?**
- Standard, unambiguous format
- What native `<input type="date">` uses
- Easy to parse in any backend language
- Matches [Vuetify date picker format](https://v2.vuetifyjs.com/en/components/date-pickers/) and [WhatWG HTML spec](https://html.spec.whatwg.org/multipage/forms.html)

### Date Range Picker Form Value

**Submitted format:** Two ISO strings with bracket notation or separate names

```typescript
// Option 1: Single name with array-like value
<lui-date-range-picker name="dates"></lui-date-range-picker>
// FormData: dates=2026-01-01&dates=2026-01-31

// Option 2: Separate names
<lui-date-range-picker start-name="start" end-name="end"></lui-date-range-picker>
// FormData: start=2026-01-01&end=2026-01-31

// RECOMMENDED: Option 2 (separate names) - clearer, matches common patterns
```

```typescript
// lui-date-range-picker
export class DateRangePicker extends TailwindElement {
  static formAssociated = true;

  @property({ type: String }) startName = 'start';
  @property({ type: String }) endName = 'end';

  @property({ attribute: false })
  get value(): { start: string; end: string } {
    return { start: this._startValue, end: this._endValue };
  }

  private updateFormValue(): void {
    const entries = new FormData();
    if (this._startValue) entries.append(this.startName, this._startValue);
    if (this._endValue) entries.append(this.endName, this._endValue);

    // Note: ElementInternals.setFormValue doesn't support multiple entries
    // Workaround: Use hidden native inputs internally
    this._startInputEl.value = this._startValue;
    this._endInputEl.value = this._endValue;
  }
}
```

**Why hidden native inputs workaround?** `ElementInternals.setFormValue()` only sets a single value. For range pickers that need to submit two separate form values, the recommended pattern is to include hidden `<input type="date">` elements within the Shadow DOM and update their values.

### Time Picker Form Value

**Submitted format:** ISO 8601 time string (`HH:mm:ss` or `HH:mm`)

```typescript
// lui-time-picker
export class TimePicker extends TailwindElement {
  static formAssociated = true;

  @property({ type: String }) format: '12' | '24' = '24';
  @property({ type: Boolean }) showSeconds = false;

  @property({ type: String })
  get value(): string {
    // Returns '14:30' or '14:30:45' in 24-hour format
    return this._value;
  }

  private updateFormValue(): void {
    this.internals?.setFormValue(this._value || null);
  }
}
```

---

## Styling Architecture

### CSS Custom Properties Pattern

Following existing `--ui-{component}-*` conventions:

```css
/* Calendar Display Tokens (--ui-calendar-*) */
:root {
  /* Layout */
  --ui-calendar-width: 320px;
  --ui-calendar-day-size: 2.5rem;
  --ui-calendar-gap: 0.25rem;

  /* Colors */
  --ui-calendar-bg: var(--color-background, var(--ui-color-background));
  --ui-calendar-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-calendar-border: var(--color-border, var(--ui-color-border));
  --ui-calendar-header-text: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-calendar-weekday-text: var(--color-muted-foreground, var(--ui-color-muted-foreground));

  /* States */
  --ui-calendar-hover-bg: var(--color-accent, var(--ui-color-accent) / 0.1);
  --ui-calendar-selected-bg: var(--color-primary, var(--ui-color-primary));
  --ui-calendar-selected-text: var(--color-primary-foreground, var(--ui-color-primary-foreground));
  --ui-calendar-range-bg: var(--color-primary, var(--ui-color-primary) / 0.2);
  --ui-calendar-today-border: var(--color-primary, var(--ui-color-primary));
  --ui-calendar-disabled-opacity: 0.5;

  /* Focus */
  --ui-calendar-focus-ring: var(--color-ring, var(--ui-color-ring));

  /* Typography */
  --ui-calendar-font-size: 0.875rem;
  --ui-calendar-font-weight: 400;
}

/* Date Picker Tokens (--ui-date-picker-*) */
:root {
  --ui-date-picker-trigger-gap: 0.5rem;
  --ui-date-picker-icon-color: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-date-picker-popover-bg: var(--color-background, var(--ui-color-background));
  --ui-date-picker-popover-border: var(--color-border, var(--ui-color-border));
  --ui-date-picker-popover-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Time Picker Tokens (--ui-time-picker-*) */
:root {
  --ui-time-picker-input-width: 4rem;
  --ui-time-picker-separator-color: var(--color-muted-foreground, var(--ui-color-muted-foreground));
}
```

### Calendar Grid Layout with Tailwind

Calendar uses **CSS Grid** for the 7-column layout:

```typescript
// In lui-calendar render()
render() {
  const days = this.getDaysInMonth(); // Array of date objects
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return html`
    <div class="ui-calendar">
      <header class="ui-calendar-header">
        ${this.renderMonthNavigation()}
      </header>

      <div class="ui-calendar-weekdays">
        ${weekDays.map(day => html`<div>${day}</div>`)}
      </div>

      <div class="ui-calendar-grid" role="grid">
        ${days.map(date => this.renderDateButton(date))}
      </div>

      <footer class="ui-calendar-footer">
        <button @click=${this.selectToday}>Today</button>
        <button @click=${this.clear}>Clear</button>
      </footer>
    </div>
  `;
}

static override styles = [
  ...tailwindBaseStyles,
  css`
    .ui-calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--ui-calendar-gap);
    }

    .ui-calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--ui-calendar-gap);
      margin-bottom: 0.5rem;
    }

    .date-button {
      width: var(--ui-calendar-day-size);
      height: var(--ui-calendar-day-size);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--ui-calendar-radius, 0.375rem);
      cursor: pointer;
      transition: background-color 150ms;
    }

    .date-button:hover:not(:disabled) {
      background-color: var(--ui-calendar-hover-bg);
    }

    .date-button[aria-selected="true"] {
      background-color: var(--ui-calendar-selected-bg);
      color: var(--ui-calendar-selected-text);
    }

    .date-button:disabled {
      opacity: var(--ui-calendar-disabled-opacity);
      cursor: not-allowed;
    }
  `
];
```

**Why CSS Grid over Flexbox?**
- Grid natively handles 7-column layout
- Automatic cell sizing with `1fr`
- Cleaner than Flexbox with manual width calculations
- Matches [Tailwind calendar grid examples](https://www.subframe.com/tips/css-calendar-grid-examples)

### Month Transition Animations

```css
/* For smooth month transitions */
.ui-calendar-grid {
  transition: opacity 200ms, transform 200ms;
}

.ui-calendar-grid.changing-month {
  opacity: 0.5;
  transform: translateX(-10px);
}

/* Or use Lit's directive-based animations */
import { animate } from '@lit-labs/motion';

// In render()
html`
  <div class="ui-calendar-grid">
    ${animate()}`
    ${days.map(date => this.renderDateButton(date))}
  </div>
`
```

**Note:** `@lit-labs/motion` is an experimental library. For MVP, CSS transitions on opacity/transform are simpler and sufficient. Advanced animations can be added later.

---

## Accessibility (WAI-ARIA) Architecture

### Calendar Grid Role

Following [WAI-ARIA Date Picker Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/):

```typescript
// In lui-calendar
render() {
  return html`
    <div
      class="ui-calendar"
      role="grid"
      aria-label="Calendar"
      aria-labelledby="calendar-label"
    >
      <div role="row" class="ui-calendar-weekdays">
        ${weekDays.map(day => html`
          <div role="columnheader" aria-label="${day}">${day.charAt(0)}</div>
        `)}
      </div>

      ${weeks.map(week => html`
        <div role="row">
          ${week.map(date => this.renderDateButton(date))}
        </div>
      `)}
    </div>
  `;
}

private renderDateButton(date: Date) {
  return html`
    <button
      role="gridcell"
      aria-label="${this.formatDateLabel(date)}"
      aria-selected="${this.isSelected(date) ? 'true' : 'false'}"
      aria-disabled="${this.isDisabled(date) ? 'true' : 'false'}"
      tabindex="${this.isFocused(date) ? '0' : '-1'}"
      @click=${() => this.handleDateClick(date)}
    >
      ${date.getDate()}
    </button>
  `;
}
```

**Key ARIA requirements:**
- Calendar grid: `role="grid"`
- Weekday headers: `role="columnheader"`
- Date rows: `role="row"`
- Date buttons: `role="gridcell"`
- `aria-selected` for selected date
- `aria-disabled` for disabled dates
- Roving tabindex for keyboard navigation (only focused date has `tabindex="0"`)

### Keyboard Navigation

```typescript
// Calendar keyboard navigation
private handleKeyDown(e: KeyboardEvent, date: Date): void {
  const actions = {
    'ArrowLeft': () => this.moveFocus(-1, 'day'),
    'ArrowRight': () => this.moveFocus(1, 'day'),
    'ArrowUp': () => this.moveFocus(-7, 'day'),
    'ArrowDown': () => this.moveFocus(7, 'day'),
    'Home': () => this.focusFirstDayOfWeek(),
    'End': () => this.focusLastDayOfWeek(),
    'PageUp': () => this.changeMonth(-1),
    'PageDown': () => this.changeMonth(1),
    'Shift+PageUp': () => this.changeYear(-1),
    'Shift+PageDown': () => this.changeYear(1),
    'Enter': () => this.selectDate(date),
    ' ': () => this.selectDate(date),
    'Escape': () => this.close(),
  };

  const handler = actions[e.key];
  if (handler) {
    e.preventDefault();
    handler();
  }
}
```

Following [WAI-ARIA Date Picker Keyboard Interaction](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/):
- Arrow keys: Move day by day
- Page Up/Down: Move month by month
- Shift + Page Up/Down: Move year by year
- Home/End: First/last day of week
- Enter/Space: Select date
- Escape: Close picker

---

## Date Library Choice

### Recommendation: Temporal API (with date-fns fallback)

**Primary choice:** Native JavaScript [Temporal API](https://bryntum.com/blog/javascript-temporal-is-it-finally-here/)
- Built-in, no dependencies
- Modern, clean API
- Designed to fix Date object issues
- Coming to browsers in 2026

**Fallback:** date-fns
- Mature, well-tested library
- Functional API (tree-shakeable)
- Works in all browsers today
- Used by [shadcn/ui date picker](https://shadcnstudio.com/docs/components/date-picker)

```typescript
// Conditional import
let dateUtils: any;

if ('Temporal' in window) {
  // Use native Temporal API
  dateUtils = {
    format: (date: Date) => Temporal.PlainDate.from(date).toString(),
    addDays: (date: Date, days: number) => {
      const plain = Temporal.PlainDate.from(date);
      return plain.add({ days }).toDate();
    },
    // ... other utilities
  };
} else {
  // Fall back to date-fns
  import('date-fns').then((fns) => {
    dateUtils = fns;
  });
}
```

**Why not Moment.js?**
- Deprecated, large bundle size
- Not tree-shakeable
- Temporal and date-fns are modern alternatives

**Why not Luxon or Day.js?**
- Temporal is the future standard
- date-fns is more modular than Luxon
- Day.js is good but Temporal will supersede it

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `lui-calendar` | Date grid display, month navigation, date selection | Parent via events (`ui-date-select`, `ui-month-change`) |
| `lui-date-picker` | Single date input, dropdown, form value | `lui-calendar` (internal), form via `ElementInternals` |
| `lui-date-range-picker` | Date range input, dual calendar display, form value | `lui-calendar` instances (internal), form via `ElementInternals` |
| `lui-time-picker` | Time input, hour/minute/second selection | Form via `ElementInternals` |
| `@lit-ui/core` | Base class, Tailwind injection | All components extend `TailwindElement` |
| Floating UI | Dropdown positioning | Used by date/range pickers for calendar popover |

---

## New Components Needed

### 1. `@lit-ui/calendar` Package (New)

**Purpose:** Standalone calendar display component

**Files to create:**
- `packages/calendar/package.json`
- `packages/calendar/vite.config.ts`
- `packages/calendar/tsconfig.json`
- `packages/calendar/src/calendar.ts`
- `packages/calendar/src/index.ts`

**Features:**
- Month grid with 7-column layout
- Month/year navigation (prev/next)
- Today indicator
- Min/max date constraints
- Disabled dates
- Keyboard navigation (arrow keys, page up/down)
- Roving tabindex
- NOT form-associated (display only)
- Emits `ui-date-select` events
- Emits `ui-month-change` events

### 2. `@lit-ui/date-picker` Package (New)

**Purpose:** Single date selection with dropdown calendar

**Files to create:**
- `packages/date-picker/package.json`
- `packages/date-picker/vite.config.ts`
- `packages/date-picker/tsconfig.json`
- `packages/date-picker/src/date-picker.ts`
- `packages/date-picker/src/index.ts`

**Features:**
- Text input for date entry
- Calendar trigger button
- Dropdown with `lui-calendar` (internally composed)
- Floating UI positioning (reusing from Select)
- Form-associated via ElementInternals
- Value format: ISO 8601 (`YYYY-MM-DD`)
- Min/max date constraints
- Disabled dates
- Localization support
- Emits `ui-change` events

### 3. `@lit-ui/date-range-picker` Package (New)

**Purpose:** Date range selection

**Files to create:**
- `packages/date-range-picker/package.json`
- `packages/date-range-picker/vite.config.ts`
- `packages/date-range-picker/tsconfig.json`
- `packages/date-range-picker/src/date-range-picker.ts`
- `packages/date-range-picker/src/index.ts`

**Features:**
- Start and end date inputs
- Dropdown with one or two `lui-calendar` instances
- Range selection visual feedback (highlight dates between start/end)
- Form-associated (submits two values)
- Min/max range constraints
- Quick select presets (e.g., "Last 7 days", "This month")
- Emits `ui-change` events

### 4. `@lit-ui/time-picker` Package (New)

**Purpose:** Time selection (hour/minute/second)

**Files to create:**
- `packages/time-picker/package.json`
- `packages/time-picker/vite.config.ts`
- `packages/time-picker/tsconfig.json`
- `packages/time-picker/src/time-picker.ts`
- `packages/time-picker/src/index.ts`

**Features:**
- Hour/minute inputs
- Optional seconds
- 12/24 hour format toggle
- AM/PM selector (12-hour format)
- Form-associated via ElementInternals
- Value format: ISO 8601 time (`HH:mm:ss` or `HH:mm`)
- Min/max time constraints
- Emits `ui-change` events

---

## Modifications to Existing Components

### `@lit-ui/core` - CSS Tokens Addition

Add to `packages/core/src/styles/tailwind.css`:

```css
:root {
  /* Calendar Component Tokens */
  --ui-calendar-width: 320px;
  --ui-calendar-day-size: 2.5rem;
  --ui-calendar-gap: 0.25rem;
  --ui-calendar-radius: 0.375rem;
  --ui-calendar-bg: var(--color-background, var(--ui-color-background));
  --ui-calendar-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-calendar-border: var(--color-border, var(--ui-color-border));
  --ui-calendar-header-text: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-calendar-weekday-text: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-calendar-hover-bg: var(--color-accent, var(--ui-color-accent) / 0.1);
  --ui-calendar-selected-bg: var(--color-primary, var(--ui-color-primary));
  --ui-calendar-selected-text: var(--color-primary-foreground, var(--ui-color-primary-foreground));
  --ui-calendar-range-bg: var(--color-primary, var(--ui-color-primary) / 0.2);
  --ui-calendar-today-border: var(--color-primary, var(--ui-color-primary));
  --ui-calendar-disabled-opacity: 0.5;
  --ui-calendar-focus-ring: var(--color-ring, var(--ui-color-ring));
  --ui-calendar-font-size: 0.875rem;
  --ui-calendar-font-weight: 400;

  /* Date Picker Tokens */
  --ui-date-picker-trigger-gap: 0.5rem;
  --ui-date-picker-icon-color: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-date-picker-popover-bg: var(--color-background, var(--ui-color-background));
  --ui-date-picker-popover-border: var(--color-border, var(--ui-color-border));
  --ui-date-picker-popover-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

  /* Time Picker Tokens */
  --ui-time-picker-input-width: 4rem;
  --ui-time-picker-separator-color: var(--color-muted-foreground, var(--ui-color-muted-foreground));
}
```

### CLI Templates Addition

Add templates to `packages/cli/src/templates/index.ts`:

```typescript
export const CALENDAR_TEMPLATE = `...`;
export const DATE_PICKER_TEMPLATE = `...`;
export const DATE_RANGE_PICKER_TEMPLATE = `...`;
export const TIME_PICKER_TEMPLATE = `...`;

export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,
  textarea: TEXTAREA_TEMPLATE,
  select: SELECT_TEMPLATE,
  checkbox: CHECKBOX_TEMPLATE,
  radio: RADIO_TEMPLATE,
  switch: SWITCH_TEMPLATE,
  calendar: CALENDAR_TEMPLATE,
  'date-picker': DATE_PICKER_TEMPLATE,
  'date-range-picker': DATE_RANGE_PICKER_TEMPLATE,
  'time-picker': TIME_PICKER_TEMPLATE,
};
```

---

## Suggested Build Order

Based on dependencies and complexity:

### Phase 1: Calendar Display (Foundation)

**Priority:** 1 (highest)
**Complexity:** Medium
**Dependencies:** `@lit-ui/core` only

**Why first?**
- Standalone component with no dependencies on other date/time components
- Provides the visual foundation for all date pickers
- Can be used independently (e.g., always-visible booking UI)
- Validates the calendar grid layout and navigation patterns
- Tests the CSS grid layout with Tailwind integration

**Tasks:**
1. Implement 7-column CSS grid layout
2. Month navigation (prev/next)
3. Date button rendering with hover/selected states
4. Keyboard navigation (arrow keys, page up/down)
5. Roving tabindex for accessibility
6. Emit `ui-date-select` and `ui-month-change` events
7. Add min/max date constraints
8. Add disabled dates support
9. Add today indicator
10. Test with WAI-ARIA grid pattern

**Deliverable:** Working `lui-calendar` component that can be used standalone

---

### Phase 2: Date Picker

**Priority:** 2
**Complexity:** High
**Dependencies:** `@lit-ui/core`, `@lit-ui/calendar`

**Why second?**
- Most common use case (single date selection)
- Builds on Calendar component
- Introduces Floating UI dropdown positioning (reusing Select pattern)
- Introduces form participation for date values
- Validates the internal composition pattern (NOT slot-based)

**Tasks:**
1. Implement text input for date entry
2. Implement calendar trigger button
3. Compose `lui-calendar` internally (not slotted)
4. Implement dropdown with Floating UI positioning
5. Wire up `ui-date-select` event from calendar
6. Implement form participation via ElementInternals
7. Submit ISO 8601 format to forms
8. Add min/max date constraints
9. Add disabled dates support
10. Implement localization (date formatting)
11. Emit `ui-change` events
12. Test form submission and validation

**Deliverable:** Working `lui-date-picker` component with dropdown and form participation

---

### Phase 3: Time Picker

**Priority:** 3
**Complexity:** Medium
**Dependencies:** `@lit-ui/core` only

**Why third?**
- Simpler than Date Range Picker (no calendar dependency)
- Can be built in parallel with Date Range Picker
- Independent component with its own patterns
- Useful standalone component

**Tasks:**
1. Implement hour/minute inputs
2. Implement optional seconds input
3. Implement 12/24 hour format toggle
4. Implement AM/PM selector (12-hour format)
5. Implement form participation via ElementInternals
6. Submit ISO 8601 time format to forms
7. Add min/max time constraints
8. Emit `ui-change` events
9. Test form submission

**Deliverable:** Working `lui-time-picker` component with form participation

---

### Phase 4: Date Range Picker

**Priority:** 4
**Complexity:** Highest
**Dependencies:** `@lit-ui/core`, `@lit-ui/calendar`

**Why last?**
- Most complex component (dual calendar state management)
- Benefits from lessons learned in Date Picker
- Less common use case than single date picker
- Requires dual calendar composition

**Tasks:**
1. Implement start/end date inputs
2. Compose one or two `lui-calendar` instances internally
3. Implement range selection visual feedback
4. Highlight dates between start and end
5. Implement form participation (two form values)
6. Use hidden native inputs for dual form value workaround
7. Add min/max range constraints
8. Add quick select presets ("Last 7 days", "This month")
9. Emit `ui-change` events
10. Test form submission with dual values

**Deliverable:** Working `lui-date-range-picker` component with dual calendar display

---

### Phase 5: Documentation and Testing

**Priority:** 5
**Complexity:** Low
**Dependencies:** All previous phases

**Tasks:**
1. Add documentation pages to `apps/docs`
2. Create Calendar component page
3. Create Date Picker component page
4. Create Date Range Picker component page
5. Create Time Picker component page
6. Add form integration examples
7. Add accessibility documentation
8. Add keyboard shortcuts documentation
9. Add Storybook stories (if applicable)
10. Add visual regression tests

---

## Patterns to Follow

### Pattern 1: Internal Composition Over Slot-Based Composition

**What:** Date pickers internally compose `lui-calendar` (not slotted).

**When:** For tightly coupled parent-child relationships where the child doesn't need to work standalone in different contexts.

**Example:**
```typescript
// In date-picker.ts
render() {
  return html`
    <div class="ui-date-picker">
      <input type="text" .value=${this.displayValue} />
      <button @click=${this.toggleCalendar}>📅</button>

      ${this.open
        ? html`
            <div class="ui-datepicker-dropdown">
              <lui-calendar
                value=${this.value}
                @ui-date-select=${this.handleDateSelect}
                minDate=${this.minDate}
                maxDate=${this.maxDate}
              />
            </div>
          `
        : nothing}
    </div>
  `;
}
```

**Why not slot-based?**
- Calendar doesn't need to be swapped out by consumers
- Picker needs tight control over calendar for dropdown closing
- Calendar needs to work standalone (without picker)
- Slot-based is better when children are user-provided (like `lui-option`)

---

### Pattern 2: SSR-Safe Date Operations

**What:** All date operations must work during SSR without DOM access.

**When:** Any component that manipulates dates.

**Example:**
```typescript
// BAD: Uses DOM APIs during SSR
constructor() {
  super();
  this.today = new Date(); // OK - Date constructor works in SSR
  this.focusDate = new Date(); // OK
  this.internals = this.attachInternals(); // BAD - fails in SSR
}

// GOOD: Guard DOM APIs
constructor() {
  super();
  this.today = new Date();
  this.focusDate = new Date();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

---

### Pattern 3: ISO 8601 for Form Values

**What:** Always submit dates in ISO 8601 format to forms.

**When:** Form participation for date/time components.

**Example:**
```typescript
private updateFormValue(): void {
  const isoString = this.value
    ? this.value.toISOString().split('T')[0] // YYYY-MM-DD
    : '';

  this.internals?.setFormValue(isoString || null);
}
```

**Why ISO 8601?**
- Standard, unambiguous format
- What native `<input type="date">` uses
- Easy to parse in any backend language
- Timezone-aware (no ambiguity)

---

### Pattern 4: CSS Grid for Calendar Layout

**What:** Use CSS Grid for 7-column calendar layout.

**When:** Calendar grid rendering.

**Example:**
```css
.ui-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--ui-calendar-gap);
}
```

**Why Grid over Flexbox?**
- Natively handles 7-column layout
- Automatic cell sizing
- Cleaner than manual width calculations
- Standard pattern for calendars ([see examples](https://www.subframe.com/tips/css-calendar-grid-examples))

---

### Pattern 5: Roving Tabindex for Keyboard Navigation

**What:** Only the focused date has `tabindex="0"`, others have `tabindex="-1"`.

**When:** Calendar grid keyboard navigation.

**Example:**
```typescript
private updateTabindex(): void {
  for (const button of this.dateButtons) {
    button.tabIndex = button.date === this.focusedDate ? 0 : -1;
  }
}

private handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'ArrowRight') {
    this.focusedDate = this.addDays(this.focusedDate, 1);
    this.updateTabindex();
    this.focusNewDate();
  }
}
```

**Why roving tabindex?**
- Standard WAI-ARIA pattern for grids
- Reduces tab stops (one tab into calendar, arrow keys inside)
- Improves keyboard accessibility
- Follows [WAI-ARIA Date Picker Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Slot-Based Calendar Composition

**What:** Making `lui-calendar` a slotted child of `lui-date-picker`.

**Why bad:**
- Calendar doesn't need to be user-provided (unlike `lui-option`)
- Picker needs tight control over calendar for dropdown closing
- Creates unnecessary complexity for no benefit
- Breaks when calendar is used standalone

**Instead:** Compose `lui-calendar` internally in picker's `render()` method.

---

### Anti-Pattern 2: Non-ISO Date Formats for Form Values

**What:** Submitting dates as localized strings (e.g., "01/30/2026").

**Why bad:**
- Ambiguous (is it DD/MM or MM/DD?)
- Backend parsing complexity
- Difficult to validate
- Doesn't match native `<input type="date">` behavior

**Instead:** Always use ISO 8601 format (`YYYY-MM-DD`) for form values.

---

### Anti-Pattern 3: Separate Form Values for Range Picker

**What:** Using `setFormValue()` with a single joined value for ranges.

**Why bad:**
- `ElementInternals.setFormValue()` only sets one value
- Forces consumers to parse a single string
- Doesn't match standard FormData patterns

**Instead:** Use hidden native `<input>` elements within Shadow DOM:
```typescript
// In date-range-picker
render() {
  return html`
    <input type="hidden" name=${this.startName} .value=${this._startValue}>
    <input type="hidden" name=${this.endName} .value=${this._endValue}>
    <!-- ... rest of component -->
  `;
}
```

---

### Anti-Pattern 4: Date Library Without Fallback

**What:** Relying solely on date-fns or Temporal without browser support check.

**Why bad:**
- Temporal not yet in all browsers (as of 2026)
- date-fns adds bundle size
- Breaks in environments without the library

**Instead:** Use conditional loading with fallback:
```typescript
const hasTemporal = 'Temporal' in window;
const dateLib = hasTemporal ? temporalLib : dateFnsLib;
```

---

### Anti-Pattern 5: Calendar as Form-Associated Element

**What:** Making `lui-calendar` a form-associated custom element.

**Why bad:**
- Calendar is a display component, not an input
- Should not submit form values directly
- Breaks when used standalone (e.g., booking UI)
- Date picker should own the form value

**Instead:** Calendar emits events; picker handles form participation.

---

## SSR Compatibility Considerations

### Date Operations During SSR

Date operations are SSR-safe (no DOM access needed):
```typescript
// All of these are fine during SSR
const today = new Date();
const nextWeek = addDays(today, 7);
const formatted = formatDate(today, 'YYYY-MM-DD');
```

### ElementInternals Guard

```typescript
constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

### Floating UI Guard

Floating UI requires DOM access; guard its usage:
```typescript
private updatePosition() {
  if (isServer) return;
  computePosition(this.trigger, this.dropdown, {
    placement: 'bottom-start',
    middleware: [flip(), shift()],
  }).then(({ x, y }) => {
    this.dropdown.style.transform = `translate(${x}px, ${y}px)`;
  });
}
```

### Initial State from Properties

During SSR, initial state must derive from properties (not DOM):
```typescript
// GOOD: State from properties
@property({ type: String }) value = '';

private get selectedDate(): Date | null {
  return this.value ? parseISO(this.value) : null;
}

// BAD: State from DOM
private selectedDate: Date | null = null;

firstUpdated() {
  // This won't run during SSR
  const input = this.shadowRoot?.querySelector('input');
  this.selectedDate = parseISO(input?.value || '');
}
```

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Calendar rendering | Client-side generation | Client-side generation | Consider server-generated HTML for initial month |
| Dropdown positioning | Floating UI (fine) | Floating UI (fine) | Floating UI (fine) |
| Date library | date-fns (fine) | date-fns (fine) | Consider Temporal (smaller bundle) |
| CSS tokens | All tokens in one sheet | All tokens in one sheet | All tokens in one sheet (fine) |

**Key insight:** Date/time components are primarily client-side interactive. Server-side concerns are minimal beyond SSR compatibility.

---

## Sources

### High Confidence (Primary Sources)
- Existing codebase: `packages/select/src/select.ts` - Slot-based composition pattern (lines 1199-1232)
- Existing codebase: `packages/input/src/input.ts` - Form participation with ElementInternals
- Existing codebase: `packages/core/src/tailwind-element.ts` - TailwindElement base class
- Existing codebase: `packages/core/src/utils/events.ts` - dispatchCustomEvent helper
- [WAI-ARIA Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) - Keyboard navigation, grid role
- [MDN ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) - Form participation API
- [HTML Standard - WhatWG](https://html.spec.whatwg.org/multipage/forms.html) - Form-associated custom elements
- [Vuetify Date Picker](https://v2.vuetifyjs.com/en/components/date-pickers/) - ISO format example (2026-01-27)

### Medium Confidence (Ecosystem Research)
- [JavaScript Temporal in 2026](https://bryntum.com/blog/javascript-temporal-is-it-finally-here/) - Temporal API status
- [date-fns Documentation](https://date-fns.org/) - Fallback date library
- [Shadcn Date Picker](https://shadcnstudio.com/docs/components/date-picker) - React implementation reference
- [Tailwind Calendar Grid Examples](https://www.subframe.com/tips/css-calendar-grid-examples) - CSS grid patterns
- [How to build a calendar with CSS Grid](https://dev.to/zellwk/how-to-build-a-calendar-with-css-grid-1c46) - Grid layout tutorial
- [Base Web Datepicker](https://baseweb.design/components/datepicker/) - Component patterns
- [10 CSS Calendar Grid Examples](https://www.subframe.com/tips/css-calendar-grid-examples) - Layout inspiration
- [41 CSS Calendars](https://freefrontend.com/css-calendars/) - 7-column grid examples
- [A Calendar in Three Lines of CSS](https://calendartricks.com/a-calendar-in-three-lines-of-css/) - Minimal grid CSS

### Low Confidence (Needs Verification)
- [Carbon Web Components Date Picker](https://github.com/carbon-design-system/carbon-web-components/blob/main/src/components/date-picker/date-picker.ts) - Implementation reference (needs verification of current patterns)
- Chinese guide: [Ultimate Guide to Modern Date Picker with Lit](https://blog.csdn.net/gitblog_00070/article/details/139516635) - Lit-specific (needs translation and verification)

### Verification Status
- ✅ WAI-ARIA patterns verified via W3C official docs
- ✅ Form participation verified via MDN and WhatWG spec
- ✅ CSS Grid layout verified via multiple tutorial sources
- ✅ Temporal API status verified via 2026 articles
- ⚠️ Carbon Web Components example not directly verified (GitHub fetch issues)
- ⚠️ Chinese Lit guide not reviewed (translation needed)

---

## Summary

Date/time components integrate cleanly with the existing LitUI architecture by:

1. **Following established patterns:** TailwindElement base, ElementInternals for forms, CSS tokens for theming
2. **Using internal composition:** Calendar is composed internally by pickers (not slot-based like Select/Option)
3. **Leveraging existing tech:** Floating UI for positioning (already in Select), date-fns/Temporal for date math
4. **Maintaining accessibility:** WAI-ARIA grid pattern, roving tabindex, keyboard navigation
5. **Supporting SSR:** isServer guards for DOM APIs, initial state from properties

**Key architectural decision:** Calendar as a standalone, internally composed component (not a slotted child) distinguishes date/time from the Select/Option pattern while maintaining consistency with the rest of LitUI's patterns.
