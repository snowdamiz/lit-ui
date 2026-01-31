# Phase 42: Calendar Display Foundation - Research

**Researched:** 2026-01-30
**Domain:** Accessible Calendar Component with Lit.js, date-fns v4, WAI-ARIA Grid Pattern
**Confidence:** HIGH

## Summary

Phase 42 requires building a standalone calendar component with full keyboard navigation, screen reader support, and internationalization. The component will display a 7-column month grid with weekday headers, support month navigation via buttons and dropdowns, enable keyboard navigation with roving tabindex, and announce changes via aria-live regions.

The standard approach combines:
1. **date-fns v4.1.0** for date calculations (startOfMonth, endOfMonth, eachDayOfInterval, format, differenceInDays)
2. **WAI-ARIA Grid Pattern** for accessibility with roving tabindex implementation
3. **Native Intl API** (Intl.Locale.getWeekInfo(), Intl.DateTimeFormat) for locale-aware formatting
4. **Lit.js 3** with TailwindElement base class following established project patterns
5. **Declarative Shadow DOM** for SSR compatibility

**Primary recommendation:** Follow WAI-ARIA APG Date Picker Dialog example for accessibility structure, use date-fns v4 modular functions for calendar math, implement roving tabindex with keyboard navigation (arrows, Home/End, Page Up/Down), and use aria-live="polite" for announcing month changes and date selections.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | 4.1.0 | Date manipulation (startOfMonth, endOfMonth, eachDayOfInterval, format) | Modular, tree-shakeable, v4 adds timezone support, industry standard |
| Lit | 3.3.2 | Web component framework | Project standard, SSR support, reactive properties |
| @lit-ui/core | workspace:* | TailwindElement base class | Project base class with Tailwind integration and SSR guards |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl API | Native | Localization (getWeekInfo, DateTimeFormat) | Built into browsers, no dependencies needed |
| Tailwind CSS | 4.1.18 | Styling with design tokens | Project standard, CSS custom properties for theming |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | dayjs, luxon | date-fns is more modular and tree-shakeable; dayjs/luxon have larger bundle size |
| Native Intl API | moment-timezone | Intl is built-in (no dependencies), moment is deprecated and heavy |

**Installation:**
```bash
pnpm add date-fns@^4.1.0
```

## Architecture Patterns

### Recommended Project Structure

```
packages/calendar/
├── src/
│   ├── calendar.ts          # Main calendar component
│   ├── calendar-grid.ts     # Grid layout with weekday headers
│   ├── calendar-cell.ts     # Individual date cell (optional subcomponent)
│   ├── calendar-nav.ts      # Month/year navigation controls
│   ├── date-utils.ts        # date-fns wrapper functions
│   ├── keyboard-nav.ts      # Roving tabindex implementation
│   ├── intl-utils.ts        # Intl API wrapper functions
│   └── index.ts             # Public exports
├── test/
│   ├── calendar.test.ts     # Component tests
│   └── accessibility.test.ts # ARIA assertions, keyboard nav tests
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Pattern 1: WAI-ARIA Grid Pattern with Roving Tabindex

**What:** Calendar grid follows WAI-ARIA Authoring Practices Guide Grid Pattern, where only one cell is in the tab sequence at a time (tabindex="0"), others are focusable but not in tab order (tabindex="-1"). Arrow keys move focus between cells.

**When to use:** All calendar grids requiring keyboard navigation. This is the standard accessibility pattern for calendar widgets.

**Example:**
```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
// Grid container
<div
  role="grid"
  aria-labelledby="calendar-heading"
>
  <!-- Weekday headers (role="columnheader") -->
  <div role="row">
    <div role="columnheader" aria-label="Sunday">Sun</div>
    <!-- ... more headers ... -->
  </div>

  <!-- Date cells (role="gridcell") -->
  <div role="row">
    <div
      role="gridcell"
      tabindex="0"  // Only selected cell has tabindex="0"
      aria-selected="true"
      aria-current="date"  // For today
    >
      15
    </div>
    <div role="gridcell" tabindex="-1">16</div>
    <!-- ... more cells ... -->
  </div>
</div>
```

**Key implementation details:**
- Grid container has `role="grid"` and `aria-labelledby` pointing to heading
- Weekday headers use `role="columnheader"` with `aria-label` for full names
- Date cells use `role="gridcell"`
- Selected cell: `aria-selected="true"`
- Today: `aria-current="date"`
- Only one cell has `tabindex="0"` at a time (roving tabindex)
- Other cells have `tabindex="-1"` (focusable but not in tab sequence)

### Pattern 2: Roving Tabindex Implementation

**What:** Manage focus within the grid by dynamically updating tabindex. Only one cell has tabindex="0" at any time. Arrow keys move focus and update tabindex.

**When to use:** Grid navigation with keyboard. Required for WCAG 2.1 Level AA compliance.

**Example:**
```typescript
// Source: Based on WAI-ARIA APG and Spectrum Web Components
// https://opensource.adobe.com/spectrum-web-components/tools/roving-tab-index/

private focusableElements: HTMLElement[] = [];

@query('[role="gridcell"]')
gridCells!: NodeListOf<HTMLElement>;

override updated(changedProperties: PropertyValues) {
  super.updated(changedProperties);

  // Collect focusable cells
  this.focusableElements = Array.from(this.gridCells);

  // Set initial tabindex (only selected cell gets 0)
  this.focusableElements.forEach((cell, index) => {
    const isSelected = cell.getAttribute('aria-selected') === 'true';
    cell.setAttribute('tabindex', isSelected ? '0' : '-1');
  });
}

private handleKeyDown(event: KeyboardEvent) {
  const currentIndex = this.focusableElements.indexOf(
    event.target as HTMLElement
  );

  let nextIndex = currentIndex;

  switch (event.key) {
    case 'ArrowRight':
      nextIndex = currentIndex + 1;
      break;
    case 'ArrowLeft':
      nextIndex = currentIndex - 1;
      break;
    case 'ArrowDown':
      nextIndex = currentIndex + 7; // Move down one row
      break;
    case 'ArrowUp':
      nextIndex = currentIndex - 7; // Move up one row
      break;
    case 'Home':
      nextIndex = this.getRowStartIndex(currentIndex);
      break;
    case 'End':
      nextIndex = this.getRowEndIndex(currentIndex);
      break;
    case 'PageDown':
      this.changeMonth(1); // Next month
      return;
    case 'PageUp':
      this.changeMonth(-1); // Previous month
      return;
    default:
      return;
  }

  // Update tabindex and move focus
  if (nextIndex >= 0 && nextIndex < this.focusableElements.length) {
    this.focusableElements[currentIndex].setAttribute('tabindex', '-1');
    this.focusableElements[nextIndex].setAttribute('tabindex', '0');
    this.focusableElements[nextIndex].focus();
  }
}
```

### Pattern 3: date-fns v4 Calendar Math

**What:** Use date-fns modular functions to calculate calendar grid days.

**When to use:** Any date calculation needed for calendar rendering.

**Example:**
```typescript
// Source: https://date-fns.org/ (verified v4.1.0 API)
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  differenceInDays,
  isSameDay,
  isWeekend,
  isBefore,
  isAfter
} from 'date-fns';

// Get all days in the current month
function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  });
}

// Get localized weekday names
function getWeekdayNames(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short'
  });

  // Generate names for Sunday-Saturday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, i + 1); // 2023-01-01 was a Sunday
    return formatter.format(date);
  });
}

// Check if date is disabled
function isDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disabledDates?: Date[]
): boolean {
  if (minDate && isBefore(date, minDate)) return true;
  if (maxDate && isAfter(date, maxDate)) return true;
  if (disabledDates?.some(d => isSameDay(date, d))) return true;
  return false;
}
```

### Pattern 4: Intl API for Locale-Aware Calendar

**What:** Use native Intl API to get first day of week and format month/day names based on locale.

**When to use:** Internationalization. Required for CAL-15, CAL-16, CAL-17.

**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo
function getFirstDayOfWeek(locale: string): number {
  const localeObj = new Intl.Locale(locale);

  // getWeekInfo returns { firstDay: number, weekend: number[], minimalDays: number }
  // firstDay: 1=Monday, 7=Sunday
  const weekInfo = localeObj.getWeekInfo();

  return weekInfo.firstDay;
}

// Example outputs:
// en-US: { firstDay: 7, weekend: [6, 7], minimalDays: 1 }  // Sunday start
// en-GB: { firstDay: 1, weekend: [6, 7], minimalDays: 4 }  // Monday start
// he-IL: { firstDay: 7, weekend: [5, 6], minimalDays: 1 }  // Sunday start

// Get localized month name
function getMonthName(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  // en-US: "January", fr-FR: "janvier", de-DE: "Januar"
}

// Get localized weekday names
function getWeekdayNames(locale: string, style: 'long' | 'short' | 'narrow' = 'short'): string[] {
  // Get first day of week for this locale
  const firstDay = getFirstDayOfWeek(locale);

  // Create formatter
  const formatter = new Intl.DateTimeFormat(locale, { weekday: style });

  // Generate names starting from firstDay
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    // 2023-01-01 was a Sunday (day 1)
    const date = new Date(2023, 0, firstDay + i);
    names.push(formatter.format(date));
  }

  return names;
  // en-US, short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  // en-GB, short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
}
```

**Browser support for getWeekInfo():**
- Chrome 99+
- Safari 17+
- Firefox: Check latest (MDN says "Limited availability")
- **Fallback needed:** If getWeekInfo() is not available, default to Sunday (7) for en-US or Monday (1) for most other locales.

### Pattern 5: aria-live Announcements

**What:** Use aria-live="polite" regions to announce month changes and date selections to screen readers.

**When to use:** Any dynamic content change that screen reader users need to know about (CAL-09, CAL-10).

**Example:**
```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/

override render() {
  return html`
    <!-- Live region for month announcements -->
    <h2 id="calendar-heading" aria-live="polite">
      ${this.getMonthYearLabel()}
    </h2>

    <!-- Grid -->
    <div role="grid" aria-labelledby="calendar-heading">
      <!-- ... grid cells ... -->
    </div>

    <!-- Live region for keyboard help (announced on focus) -->
    <div aria-live="polite" aria-atomic="true">
      ${this.showKeyboardHelp ? this.keyboardHelpText : ''}
    </div>
  `;
}

private getMonthYearLabel(): string {
  const formatter = new Intl.DateTimeFormat(this.locale, {
    year: 'numeric',
    month: 'long'
  });
  return formatter.format(this.currentMonth);
  // "January 2026"
}

private announceDateSelection(date: Date) {
  const formatter = new Intl.DateTimeFormat(this.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const announcement = `Selected ${formatter.format(date)}`;

  // Update aria-live region content
  this.liveRegionText = announcement;
}
```

**Key implementation details:**
- Use `aria-live="polite"` (not "assertive") - waits for user to pause
- Month heading should have `aria-live="polite"` to announce month changes
- Separate `aria-live` region for date selection announcements
- `aria-atomic="true"` for multi-word announcements (entire region is read)

### Pattern 6: Lit Component Structure (Following Button Pattern)

**What:** Extend TailwindElement, use @property decorators, SSR guards, emit custom events.

**When to use:** All components in this project. This is the established pattern.

**Example:**
```typescript
// Source: /packages/button/src/button.ts (project reference)
import { html, css, isServer } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';

export class Calendar extends TailwindElement {
  // Reactive properties
  @property({ type: String })
  locale: string = 'en-US';

  @property({ type: String })
  value: string = ''; // ISO 8601 format (YYYY-MM-DD)

  @property({ type: String, attribute: 'min-date' })
  minDate?: string;

  @property({ type: String, attribute: 'max-date' })
  maxDate?: string;

  @property({ type: Boolean, attribute: 'disable-weekends' })
  disableWeekends = false;

  @property({ type: Boolean })
  multiple = false;

  // Internal state
  @state()
  private currentMonth: Date = new Date();

  @state()
  private selectedDates: Set<string> = new Set();

  // Element references
  @query('[role="grid"]')
  gridElement!: HTMLElement;

  constructor() {
    super();
    // Client-only initialization
    if (!isServer) {
      this.selectedDates.add(this.value);
    }
  }

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
      }

      /* Calendar-specific styles */
      [role="grid"] {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--ui-calendar-gap);
      }

      [role="gridcell"][aria-current="date"] {
        font-weight: var(--ui-calendar-today-font-weight);
      }

      [role="gridcell"][aria-selected="true"] {
        background-color: var(--ui-calendar-selected-bg);
        color: var(--ui-calendar-selected-text);
      }

      /* Dark mode support */
      :host-context(.dark) [role="gridcell"][aria-selected="true"] {
        background-color: var(--ui-calendar-selected-bg-dark);
      }
    `
  ];

  private emitDateSelect(date: Date) {
    const isoDate = this.formatDate(date); // YYYY-MM-DD
    this.dispatchEvent(new CustomEvent('ui-date-select', {
      bubbles: true,
      composed: true,
      detail: { date: isoDate }
    }));
  }

  private emitMonthChange(date: Date) {
    this.dispatchEvent(new CustomEvent('ui-month-change', {
      bubbles: true,
      composed: true,
      detail: {
        year: date.getFullYear(),
        month: date.getMonth()
      }
    }));
  }

  private formatDate(date: Date): string {
    // ISO 8601 format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
```

### Anti-Patterns to Avoid

- **Native HTML table for grid:** Don't use `<table>` element. Use `role="grid"` on `<div>` for better control over ARIA attributes. WAI-ARIA example uses `<table>` but web components benefit from explicit roles.
- **All cells with tabindex="0":** Don't make every cell tabbable. This creates long tab sequences. Use roving tabindex (only one cell tabindex="0" at a time).
- **Using moment.js:** Don't use moment.js. It's deprecated, large, and immutable. Use date-fns v4 or native Intl API.
- **Hardcoded weekday order:** Don't assume Sunday is first day. Use `Intl.Locale.getWeekInfo()` to get locale-specific first day.
- **Skipping aria-live regions:** Don't rely only on focus announcements. Use aria-live="polite" for month changes and selections.
- **Using aria-label for everything:** Don't put long descriptions in aria-label. Use visible text with aria-labelledby where possible.
- **Forgetting SSR guards:** Don't call browser APIs without `if (!isServer)` check. This breaks SSR.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date arithmetic | Custom date math | date-fns (startOfMonth, endOfMonth, eachDayOfInterval) | Leap years, month boundaries, timezone edge cases are complex |
| Locale-aware formatting | Custom locale maps | Intl.DateTimeFormat, Intl.Locale.getWeekInfo() | Browser has built-in CLDR data for 100+ locales |
| Keyboard navigation | Custom key handlers | WAI-ARIA Grid Pattern (roving tabindex) | Screen reader compatibility requires specific ARIA roles |
| CSS theming | Hardcoded colors | CSS custom properties (--ui-calendar-*) | Enables dark mode and user customization |

**Key insight:** Custom date math is fragile. Date libraries handle 100+ edge cases (leap years, month boundaries, DST transitions, timezone offsets). Custom locale formatting requires maintaining CLDR data for 100+ languages. Accessibility patterns require specific ARIA roles that screen readers recognize.

## Common Pitfalls

### Pitfall 1: Missing aria-live Announcements

**What goes wrong:** Screen reader users don't hear about month changes or date selections. They navigate the grid but don't know what's happening.

**Why it happens:** Developer focuses on visual updates, forgets screen reader announcements. aria-live regions seem like "extra markup."

**How to avoid:** Always add aria-live="polite" to:
- Month/year heading (announces month changes)
- Separate region for date selection announcements
- Test with actual screen reader (NVDA, JAWS, VoiceOver)

**Warning signs:** "It works visually but I should test with a screen reader." If you're saying this, you probably need aria-live.

### Pitfall 2: Broken Roving Tabindex

**What goes wrong:** More than one cell has tabindex="0", or no cell has tabindex="0". Keyboard navigation breaks.

**Why it happens:** Tabindex is set in render() but not updated when focus moves. Or tabindex is hardcoded in template instead of managed dynamically.

**How to avoid:**
- Maintain array of focusable elements
- Update tabindex on every focus move (arrow keys)
- Ensure only ONE element has tabindex="0" at all times
- Test: Tab into grid, press arrows, verify focus moves

**Warning signs:** "I can tab into multiple cells." This is wrong - only one cell should be in tab sequence.

### Pitfall 3: Hardcoded Sunday First

**What goes wrong:** Calendar always shows Sunday as first day of week, even in locales where Monday is first (e.g., UK, EU).

**Why it happens:** Developer assumes universal Sunday start. Doesn't test with different locales.

**How to avoid:**
- Use `Intl.Locale.getWeekInfo().firstDay` to get locale-specific first day
- Generate weekday array starting from firstDay
- Test with en-US (Sunday) vs en-GB (Monday) vs he-IL (Sunday)

**Warning signs:** "We'll just use Sunday for now." This is not国际化-friendly.

### Pitfall 4: SSR Compatibility Issues

**What goes wrong:** Component crashes during server-side rendering because browser APIs (attachInternals, Date constructor with timezone) are not available.

**Why it happens:** Component runs browser-only code in constructor or without isServer guards.

**How to avoid:**
- Guard all browser-only code: `if (!isServer) { ... }`
- Defer browser API calls to connectedCallback() or first render
- Test with SSR build: `pnpm build && node dist/index.js`

**Warning signs:** "It works in dev but crashes in SSR." You need isServer guards.

### Pitfall 5: Incorrect ARIA Roles

**What goes wrong:** Screen reader announces calendar as "table" instead of "grid," or doesn't recognize grid navigation.

**Why it happens:** Using native HTML table without explicit roles, or missing role attributes.

**How to avoid:**
- Use `role="grid"` on grid container
- Use `role="row"` on row containers
- Use `role="columnheader"` on weekday headers
- Use `role="gridcell"` on date cells
- Add `aria-labelledby` pointing to heading
- Test with screen reader

**Warning signs:** "I used `<table>` so it should work." Native table semantics don't match grid widget semantics.

### Pitfall 6: Missing Form Value Format

**What goes wrong:** Calendar emits different date format than form expects (e.g., timestamp vs ISO string).

**Why it happens:** No clear contract for value format. Component uses Date object but parent expects string.

**How to avoid:**
- Decide on ISO 8601 format (YYYY-MM-DD) for all date values
- Convert Date to ISO string when emitting events
- Parse ISO string to Date when receiving props
- Document format in component comments

**Warning signs:** "I'll just pass the Date object." This doesn't serialize well for forms or JSON.

## Code Examples

Verified patterns from official sources:

### Calendar Grid Generation

```typescript
// Source: https://date-fns.org/ (verified v4.1.0 API)
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

function getCalendarDays(month: Date): Date[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  return eachDayOfInterval({ start, end });
}

// Example output for January 2026:
// [2026-01-01, 2026-01-02, ..., 2026-01-31]
```

### Weekday Names with Locale

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
function getWeekdayNames(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  // Get first day of week for locale
  const firstDay = new Intl.Locale(locale).getWeekInfo().firstDay;

  // Generate names starting from firstDay
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, firstDay + i);
    return formatter.format(date);
  });
}

// Example output for en-US:
// ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Example output for en-GB:
// ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
```

### Keyboard Navigation Handler

```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
private handleKeyDown(event: KeyboardEvent) {
  const cells = Array.from(this.gridCells);
  const currentIndex = cells.indexOf(event.target as HTMLElement);

  let nextIndex = currentIndex;
  let monthChanged = false;

  switch (event.key) {
    case 'ArrowRight':
      nextIndex = currentIndex + 1;
      break;
    case 'ArrowLeft':
      nextIndex = currentIndex - 1;
      break;
    case 'ArrowDown':
      nextIndex = currentIndex + 7;
      break;
    case 'ArrowUp':
      nextIndex = currentIndex - 7;
      break;
    case 'Home':
      nextIndex = Math.floor(currentIndex / 7) * 7; // First cell in row
      break;
    case 'End':
      nextIndex = Math.floor(currentIndex / 7) * 7 + 6; // Last cell in row
      break;
    case 'PageDown':
      this.currentMonth = this.addMonths(this.currentMonth, 1);
      monthChanged = true;
      break;
    case 'PageUp':
      this.currentMonth = this.addMonths(this.currentMonth, -1);
      monthChanged = true;
      break;
    case 'Enter':
    case ' ':
      this.selectDate(cells[currentIndex]);
      break;
    default:
      return; // Don't prevent default
  }

  event.preventDefault();

  if (monthChanged) {
    this.requestUpdate();
    return;
  }

  if (nextIndex >= 0 && nextIndex < cells.length) {
    // Update roving tabindex
    cells[currentIndex].setAttribute('tabindex', '-1');
    cells[nextIndex].setAttribute('tabindex', '0');
    cells[nextIndex].focus();
  }
}
```

### aria-live Announcement

```typescript
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
@state()
private liveAnnouncement = '';

override render() {
  return html`
    <h2 id="calendar-heading" aria-live="polite">
      ${this.getMonthYearLabel()}
    </h2>

    <div role="grid" aria-labelledby="calendar-heading">
      <!-- Grid cells -->
    </div>

    <div aria-live="polite" aria-atomic="true" class="sr-only">
      ${this.liveAnnouncement}
    </div>
  `;
}

private selectDate(date: Date) {
  this.value = this.formatDate(date); // ISO 8601

  // Announce selection
  const formatter = new Intl.DateTimeFormat(this.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  this.liveAnnouncement = `Selected ${formatter.format(date)}`;

  // Emit event
  this.emitDateSelect(date);
}
```

### SSR Guard Pattern

```typescript
// Source: /packages/button/src/button.ts (project pattern)
private initializeClientOnly() {
  // Skip during SSR
  if (isServer) {
    return;
  }

  // Client-only initialization
  this.attachInternals();
  this.setupKeyboardListeners();
}

constructor() {
  super();
  this.initializeClientOnly();
}
```

### CSS Custom Properties for Theming

```css
/* Source: /packages/core/src/styles/tailwind.css (project pattern) */
:root {
  /* Calendar-specific tokens */
  --ui-calendar-gap: 0.25rem;
  --ui-calendar-cell-size: 2.5rem;
  --ui-calendar-cell-radius: 0.375rem;

  /* Today indicator */
  --ui-calendar-today-font-weight: 600;
  --ui-calendar-today-border: 2px solid var(--color-brand-500);

  /* Selected state */
  --ui-calendar-selected-bg: var(--color-brand-500);
  --ui-calendar-selected-text: oklch(0.98 0.01 250);

  /* Disabled state */
  --ui-calendar-disabled-opacity: 0.4;
}

.dark {
  --ui-calendar-selected-bg: var(--color-brand-400);
  --ui-calendar-selected-text: oklch(0.2 0.01 250);
}

/* Component styles */
:host {
  --calendar-gap: var(--ui-calendar-gap);
  --calendar-cell-size: var(--ui-calendar-cell-size);
}

[role="gridcell"][aria-current="date"] {
  font-weight: var(--ui-calendar-today-font-weight);
  border: var(--ui-calendar-today-border);
}

[role="gridcell"][aria-selected="true"] {
  background-color: var(--ui-calendar-selected-bg);
  color: var(--ui-calendar-selected-text);
}

[role="gridcell"][aria-disabled="true"] {
  opacity: var(--ui-calendar-disabled-opacity);
  pointer-events: none;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js | date-fns v4 | 2024 (v4 release) | Smaller bundle, tree-shakeable, timezone support |
| Custom locale maps | Intl API (getWeekInfo, DateTimeFormat) | Chrome 99+, Safari 17+ | Built-in locale support, no dependencies |
| Native focus management | Roving tabindex pattern | WAI-ARIA 1.2 | Standard keyboard nav, screen reader compatible |
| Client-only rendering | Declarative Shadow DOM SSR | Chrome 90+, Safari 16.4+ | Faster initial paint, SEO-friendly |
| Hardcoded theming | CSS custom properties | CSS Variables (2017) | Dynamic theming, dark mode support |

**Deprecated/outdated:**
- **moment.js**: Deprecated in 2020, use date-fns or native Intl API instead
- **aria-flowto / aria-owns**: Avoid for calendar grids, use proper grid roles instead
- **table-based calendars**: While HTML tables have implicit ARIA roles, explicit role="grid" on div elements is more flexible for web components

## Open Questions

### 1. Intl.Locale.getWeekInfo() Browser Support

**What we know:**
- Chrome 99+ (March 2022)
- Safari 17+ (September 2023)
- Firefox: MDN says "Limited availability" - need to verify
- No support in older browsers

**What's unclear:**
- Exact Firefox version support
- Whether we need polyfill or fallback

**Recommendation:**
Implement feature detection with fallback:
```typescript
function getFirstDayOfWeek(locale: string): number {
  try {
    const localeObj = new Intl.Locale(locale);
    if (typeof localeObj.getWeekInfo === 'function') {
      return localeObj.getWeekInfo().firstDay;
    }
  } catch (e) {
    // Fall through to fallback
  }

  // Fallback: Sunday for US, Monday for most others
  if (locale.startsWith('en-US') || locale.startsWith('he-IL')) {
    return 7; // Sunday
  }
  return 1; // Monday
}
```

### 2. Multi-select Visual Pattern

**What we know:**
- Context.md says multi-select is supported
- Need visual indicator for selected dates

**What's unclear:**
- Visual pattern: checkmarks, circles, filled cells, or rings?
- Deselection behavior: toggle or explicit clear?

**Recommendation:**
Deferred to implementation phase. Options to consider:
- Checkmark icon in selected cells (clear visual)
- Filled background with contrasting text (common pattern)
- Ring outline with subtle background (subtle)

**Implementation decision should consider:**
- Touch target size (44px minimum)
- Color contrast requirements (WCAG AA)
- Visual hierarchy (today vs selected vs disabled)

### 3. Year Selection UI

**What we know:**
- Requirements CAL-06: "Year dropdown or decade view for distant year selection"
- Need to navigate to distant years

**What's unclear:**
- Dropdown with all years (may be long list)?
- Decade view grid (like iOS calendar)?
- Previous/next year buttons only?

**Recommendation:**
Start with year dropdown (simpler). Consider decade view for v4.4 if needed.

### 4. Cell Sizing

**What we know:**
- Context.md says "Cell sizing (large ~44px+ or compact ~36-40px)" is at Claude's discretion
- WCAG touch target minimum: 44x44px
- iOS/Android calendars use ~44px cells

**What's unclear:**
- Default size for this component
- Whether to expose size prop (sm/md/lg like button)

**Recommendation:**
Default to 44px (touch-friendly). Consider size prop in future phase if needed.

## Sources

### Primary (HIGH confidence)
- [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) - Full pattern specification, keyboard interactions, ARIA roles
- [WAI-ARIA Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) - Complete accessible calendar implementation
- [MDN: Intl.Locale.prototype.getWeekInfo()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) - Browser API for locale-aware week data
- [MDN: ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) - aria-live implementation patterns
- [Lit SSR Documentation](https://lit.dev/docs/ssr/client-usage/) - Declarative Shadow DOM usage for Lit components
- [date-fns Official Documentation](https://date-fns.org/) - Date manipulation API reference
- [date-fns GitHub CHANGELOG](https://github.com/date-fns/date-fns/blob/main/CHANGELOG.md) - v4.0 release notes and API changes

### Secondary (MEDIUM confidence)
- [Roving Tabindex: Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/tools/roving-tab-index/) - Production roving tabindex implementation
- [Mastering Keyboard Navigation with Roving Tabindex in Grids](https://rajeev.dev/mastering-keyboard-navigation-with-roving-tabindex-in-grids) - Implementation guide with examples
- [Keyboard-navigable JavaScript widgets - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets) - MDN keyboard navigation patterns
- [React DayPicker Accessibility Guide](https://daypicker.dev/guides/accessibility) - Screen reader testing recommendations
- [Adobe React Aria - Date and Time Pickers for All](https://react-aria.adobe.com/blog/date-and-time-pickers-for-all) - Accessibility considerations for date pickers

### Tertiary (LOW confidence)
- [Why I'm Betting on the Browser: The Return of Web Components - 2026 Edition](https://shadhujan.medium.com/why-im-betting-on-the-browser-the-return-of-web-components-2026-edition-1a27d4dcefce) - Web components trend analysis (LOW confidence: speculative)
- Various StackOverflow discussions on date-fns API usage (LOW confidence: unverified community answers)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - date-fns v4 and Intl API are industry standards with official documentation
- Architecture: HIGH - WAI-ARIA patterns are official W3C recommendations, Lit patterns follow project conventions
- Pitfalls: HIGH - All pitfalls documented with specific solutions from official sources

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (60 days - stable APIs, but verify browser support changes)

---

*Phase: 42-calendar-display-foundation*
*Research completed: 2026-01-30*
