# Phase 42: Calendar Display Foundation - Research

**Researched:** 2026-01-30
**Domain:** Standalone calendar grid web component (Lit + Tailwind + date-fns + Intl API)
**Confidence:** HIGH

## Summary

Phase 42 implements `lui-calendar`, a standalone calendar display component in a new `@lit-ui/calendar` package. The component renders a 7-column month grid with weekday headers, month navigation (prev/next buttons + month/year dropdowns), keyboard navigation via WAI-ARIA APG Grid Pattern with roving tabindex, screen reader announcements via `aria-live` regions, date constraints (min/max/disabled), internationalization via native Intl API, dark mode via `:host-context(.dark)`, and SSR compatibility via `isServer` guards.

The codebase already has comprehensive prior research in `.planning/research/STACK-DATE-TIME.md`, `ARCHITECTURE-DATE-TIME.md`, and `PITFALLS-DATE-TIME.md`. Phase 42 STATE decisions (42-01 through 42-10) document all architectural choices. This research consolidates those findings into the format the planner needs.

**Primary recommendation:** Create `packages/calendar/` following the established package pattern (TailwindElement base, safe element registration, CSS custom properties in core `tailwind.css`). Use date-fns v4.1.0 for date math, native Intl API for localization, CSS Grid for the 7-column layout, and WAI-ARIA APG Grid Pattern for keyboard/screen reader accessibility.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Web component framework | Already used by all LitUI components |
| date-fns | ^4.1.0 | Date manipulation (month generation, navigation, comparisons) | Modular, tree-shakeable, v4 has native timezone support, TypeScript-first, pure functions |
| Tailwind CSS | ^4.1.18 | Styling via TailwindElement base class | Already used by all LitUI components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.DateTimeFormat | Native | Locale-aware month/day names formatting | Always for localized text (no library needed) |
| Intl.Locale.getWeekInfo() | Native | Locale-aware first day of week detection | When determining calendar start day per locale |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Day.js | Smaller bundle but known timezone handling issues, fewer functions |
| date-fns | Luxon | 2-3x larger bundle, mutable API can cause bugs |
| date-fns | Native Date only | Would require reinventing edge case handling (DST, leap years, month boundaries) |
| Intl API | date-fns locales | Extra bundle weight for locale data; Intl API is free and browser-native |

**Installation:**
```bash
pnpm add date-fns@^4.1.0 --filter @lit-ui/calendar
```

## Architecture Patterns

### Recommended Project Structure
```
packages/calendar/
  src/
    calendar.ts           # lui-calendar element (standalone display)
    date-utils.ts         # date-fns wrapper functions for calendar operations
    intl-utils.ts         # Intl API helpers (weekday names, month names, first day)
    keyboard-nav.ts       # KeyboardNavigationManager for roving tabindex
    index.ts              # Exports + safe element registration
    jsx.d.ts              # JSX type declarations for React/Preact
    vite-env.d.ts         # Vite type references
  package.json
  tsconfig.json
  vite.config.ts
```

### Pattern 1: Package Setup (follows checkbox/radio/switch pattern)
**What:** Standard package boilerplate for new LitUI component packages.
**When to use:** Always when creating a new component package.
**Example:**
```typescript
// vite.config.ts
import { createLibraryConfig } from '@lit-ui/vite-config/library';
export default createLibraryConfig({ entry: 'src/index.ts' });

// tsconfig.json
{
  "extends": "@lit-ui/typescript-config/library.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src", "baseUrl": "." },
  "include": ["src"]
}

// package.json peerDependencies
{
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0",
    "date-fns": "^4.0.0"
  }
}
```
Source: Existing `packages/checkbox/` package structure

### Pattern 2: Safe Element Registration
**What:** Register custom elements with collision detection.
**When to use:** In every package's `index.ts`.
**Example:**
```typescript
// index.ts
import { isServer } from 'lit';
import { Calendar } from './calendar.js';

export { Calendar } from './calendar.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-calendar')) {
    customElements.define('lui-calendar', Calendar);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-calendar] Custom element already registered.');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-calendar': Calendar;
  }
}
```
Source: `packages/checkbox/src/index.ts`

### Pattern 3: CSS Grid for 7-Column Calendar Layout
**What:** Use CSS Grid `repeat(7, 1fr)` for calendar grid.
**When to use:** For both weekday headers and date cells.
**Example:**
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--ui-calendar-gap, 0.125rem);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--ui-calendar-gap, 0.125rem);
}
```
Source: `.planning/research/ARCHITECTURE-DATE-TIME.md`

### Pattern 4: WAI-ARIA Grid Pattern with Roving Tabindex
**What:** Calendar grid uses `role="grid"` with semantic table roles. Only the focused date cell has `tabindex="0"`; all others have `tabindex="-1"`.
**When to use:** For the calendar date grid.
**Example:**
```html
<table role="grid" aria-labelledby="month-year-heading">
  <thead>
    <tr>
      <th role="columnheader" aria-label="Sunday">Su</th>
      <!-- ... 6 more -->
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="gridcell">
        <button
          tabindex="-1"
          aria-label="Thursday, January 1, 2026"
          aria-selected="false"
        >1</button>
      </td>
      <!-- ... more cells -->
    </tr>
  </tbody>
</table>
```
Source: [W3C WAI-ARIA APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)

### Pattern 5: SSR-Safe Component Base
**What:** Extend TailwindElement, guard DOM APIs with `isServer`.
**When to use:** Always for all component code.
**Example:**
```typescript
import { html, css, isServer, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';

export class Calendar extends TailwindElement {
  static override styles = [
    ...tailwindBaseStyles,
    css`/* calendar-specific styles */`
  ];

  @property({ type: String }) locale = '';
  @property({ type: String }) value = '';  // ISO YYYY-MM-DD
  @state() private currentMonth = new Date();

  // Guard DOM operations
  override firstUpdated(): void {
    if (isServer) return;
    this.setupKeyboardNavigation();
  }
}
```
Source: `packages/core/src/tailwind-element.ts`, `packages/switch/src/switch.ts`

### Pattern 6: Event Dispatching
**What:** Use `dispatchCustomEvent` from `@lit-ui/core` for all component events.
**When to use:** When emitting ui-date-select, ui-month-change events.
**Example:**
```typescript
import { dispatchCustomEvent } from '@lit-ui/core';

// When date is selected
dispatchCustomEvent(this, 'ui-date-select', {
  date: selectedDate,
  isoString: format(selectedDate, 'yyyy-MM-dd'),
});

// When month changes
dispatchCustomEvent(this, 'ui-month-change', {
  year: getYear(this.currentMonth),
  month: getMonth(this.currentMonth),
});
```
Source: `packages/core/src/utils/events.ts`

### Pattern 7: CSS Custom Properties for Theming
**What:** Define `--ui-calendar-*` tokens in core tailwind.css `:root`, use in component with fallback values.
**When to use:** For all visual properties (colors, sizes, spacing, opacity).
**Example:**
```css
/* In packages/core/src/styles/tailwind.css :root block */
--ui-calendar-width: 320px;
--ui-calendar-day-size: 2.5rem;
--ui-calendar-gap: 0.125rem;
--ui-calendar-radius: 0.375rem;
--ui-calendar-bg: var(--color-background, var(--ui-color-background));
--ui-calendar-selected-bg: var(--color-primary, var(--ui-color-primary));
--ui-calendar-selected-text: var(--color-primary-foreground, var(--ui-color-primary-foreground));
--ui-calendar-today-border: var(--color-primary, var(--ui-color-primary));
--ui-calendar-disabled-opacity: 0.5;
--ui-calendar-focus-ring: var(--color-ring, var(--ui-color-ring));

/* Component uses them */
.date-button[aria-selected="true"] {
  background-color: var(--ui-calendar-selected-bg);
  color: var(--ui-calendar-selected-text);
}
```
Source: Existing `--ui-switch-*` tokens in `packages/core/src/styles/tailwind.css`

### Anti-Patterns to Avoid
- **Do NOT make lui-calendar form-associated:** Calendar is display-only. Date picker (future Phase 44) handles form participation.
- **Do NOT use slot-based composition for calendar in picker:** Calendar is internally composed, not slotted (unlike lui-option in lui-select).
- **Do NOT hardcode English month/day names:** Use Intl.DateTimeFormat for all localized strings.
- **Do NOT hardcode Sunday as first day of week:** Use Intl.Locale.getWeekInfo() with fallback.
- **Do NOT parse dates with `new Date(string)` or `Date.parse()`:** Use date-fns `parseISO()` or `parse()` for deterministic behavior.
- **Do NOT put tabindex in Lit templates for roving tabindex:** Manage imperatively via KeyboardNavigationManager in lifecycle hooks (per Phase 42-09 decision).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Month day generation | Manual loop counting days in month | `date-fns`: `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `startOfWeek`, `endOfWeek` | Handles leap years, month boundaries, DST transitions |
| Month navigation | Manual month/year arithmetic | `date-fns`: `addMonths`, `subMonths`, `setMonth`, `setYear` | Handles Dec->Jan rollover, year boundaries |
| Date comparison | Manual getTime() equality | `date-fns`: `isSameDay`, `isSameMonth`, `isToday`, `isBefore`, `isAfter` | Null-safe, timezone-aware, handles edge cases |
| Weekday names | Hard-coded array `['Sun','Mon',...]` | `Intl.DateTimeFormat` with `{ weekday: 'short' }` | Auto-localizes to any language |
| Month names | Hard-coded array `['January',...]` | `Intl.DateTimeFormat` with `{ month: 'long' }` | Auto-localizes to any language |
| First day of week | Hard-coded `0` (Sunday) | `Intl.Locale.getWeekInfo().firstDay` with fallback map | Correct for all locales (Sunday US, Monday EU, Saturday Middle East) |
| Date formatting for labels | Manual string concat | `Intl.DateTimeFormat` with `{ year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }` | Correct for screen readers in any locale |

**Key insight:** Date math has edge cases (leap years, DST, month boundaries, locale differences) that look simple but cause bugs. date-fns handles all of them. Intl API handles all localization without shipping locale data in the bundle.

## Common Pitfalls

### Pitfall 1: Roving Tabindex Managed in Lit Templates Causes Re-render Loops
**What goes wrong:** Using `tabindex="${this.focusedDate === date ? 0 : -1}"` in Lit templates causes full grid re-render on every focus change, creating jank and losing focus.
**Why it happens:** Changing tabindex values in templates triggers Lit's reactive update cycle, which re-renders the entire grid, resetting DOM focus.
**How to avoid:** Manage tabindex imperatively in `updated()` / `firstUpdated()` lifecycle hooks via a `KeyboardNavigationManager` class. Keep `focusedIndex` as a plain private field, not `@state()`. Use `requestAnimationFrame` for post-render tabindex setup.
**Warning signs:** Focus jumps unexpectedly, grid flickers on arrow key press, performance degrades with 35+ cells.
Source: Phase 42-09 STATE decision

### Pitfall 2: Screen Reader Does Not Announce Month Changes
**What goes wrong:** Navigating to a new month with buttons or Page Up/Down doesn't announce the new month to screen readers. Users don't know what month they're viewing.
**Why it happens:** Missing `aria-live` region, or the live region text doesn't change (screen readers only announce changes).
**How to avoid:** Use two live region strategies (belt-and-suspenders per Phase 42-10): (1) `aria-live="polite"` on the month/year heading element, AND (2) a dedicated visually-hidden `aria-live="polite"` announcement region that gets updated with descriptive text like "Now showing February 2026". Use a shared `announceMonthChange()` method called from all navigation handlers.
**Warning signs:** No announcement after clicking prev/next month buttons, screen reader silent during Page Up/Down.
Source: Phase 42-10 STATE decision, [W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)

### Pitfall 3: Calendar Grid Doesn't Show Leading/Trailing Days
**What goes wrong:** February 2026 starts on Sunday. If the grid only shows Feb 1-28, there are empty cells. Some calendars show Jan 26-31 as grayed leading days and Mar 1-7 as trailing days to fill the 6-week grid.
**Why it happens:** Only generating days for the current month, not padding to fill complete weeks.
**How to avoid:** Generate days from `startOfWeek(startOfMonth(date))` to `endOfWeek(endOfMonth(date))`. Mark leading/trailing days with reduced opacity and `aria-disabled="true"` since they belong to adjacent months. Use `isSameMonth()` to distinguish current month days.
**Warning signs:** Empty cells in first/last row, grid height jumps between months (5 vs 6 rows).

### Pitfall 4: Intl.Locale.getWeekInfo() Not Available in All Browsers
**What goes wrong:** `getWeekInfo()` throws in older browsers. Chrome 91+, Firefox 93+, Safari 15.4+, but some users may have older versions.
**Why it happens:** Relatively newer API. Was previously a property (`weekInfo`) before becoming a method.
**How to avoid:** Use try/catch with fallback: try `getWeekInfo()`, then `weekInfo` property, then fall back to locale-based map (Sunday for en-US/he-IL, Monday for others). Per Phase 42-07 decision.
**Warning signs:** Uncaught TypeError in console on older browsers.
Source: [MDN Intl.Locale.getWeekInfo()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo)

### Pitfall 5: Dark Mode Styles Not Reaching Shadow DOM
**What goes wrong:** `:host-context(.dark)` doesn't work in all browsers (Firefox had issues historically).
**Why it happens:** `:host-context()` has limited browser support; it checks ancestor elements outside shadow DOM.
**How to avoid:** Follow the established project pattern: use `:host-context(.dark)` selectors (already used by all other LitUI components). The dark rules are also extracted to document level by TailwindElement base class. If `:host-context` is insufficient, CSS custom properties cascade into shadow DOM from the `.dark` class on document root.
**Warning signs:** Calendar ignores dark mode while other components switch correctly.
Source: `packages/core/src/tailwind-element.ts` dark rule extraction

### Pitfall 6: Date Constraint Parsing from Attributes
**What goes wrong:** `min-date="2026-01-15"` attribute arrives as a string, but date comparison needs Date objects.
**Why it happens:** HTML attributes are always strings. Lit property reflection needs explicit parsing.
**How to avoid:** Accept ISO string attributes (`min-date`, `max-date`), parse to Date objects in `updated()` lifecycle using date-fns `parseISO()`. Use a `DateConstraints` interface for type safety. Per Phase 42-06 decision.
**Warning signs:** Constraints silently ignored, all dates appear enabled despite min/max set.

## Code Examples

### Calendar Day Generation with date-fns
```typescript
// Source: date-fns API + Phase 42 architecture decisions
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, getYear, getMonth, format, parseISO
} from 'date-fns';

function getCalendarDays(month: Date, firstDayOfWeek: 0 | 1 | 5 | 6): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}
```

### Locale-Aware Weekday Names with Intl API
```typescript
// Source: Intl.DateTimeFormat MDN + Phase 42-07 decisions
function getWeekdayNames(locale: string, firstDayOfWeek: number): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // Generate 7 days starting from a known reference
  const refSunday = new Date(2026, 0, 4); // Sunday Jan 4, 2026
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(refSunday);
    day.setDate(refSunday.getDate() + i);
    days.push(formatter.format(day));
  }
  // Rotate array so firstDayOfWeek is at index 0
  // Intl firstDay: 1=Mon ... 7=Sun; map 7->0 for array index
  const startIndex = firstDayOfWeek === 7 ? 0 : firstDayOfWeek;
  return [...days.slice(startIndex), ...days.slice(0, startIndex)];
}
```

### First Day of Week Detection with Fallback
```typescript
// Source: MDN Intl.Locale.getWeekInfo() + Phase 42-07 decisions
function getFirstDayOfWeek(locale: string): number {
  try {
    const loc = new Intl.Locale(locale);
    // Try method first (modern), then property (older)
    const weekInfo = (loc as any).getWeekInfo?.() ?? (loc as any).weekInfo;
    if (weekInfo?.firstDay != null) {
      return weekInfo.firstDay; // 1=Mon ... 7=Sun
    }
  } catch {
    // Fallback
  }
  // Fallback map: Sunday for US/Israel, Monday for most others
  const sundayLocales = ['en-US', 'he-IL', 'ja-JP', 'ko-KR', 'zh-TW'];
  const lang = locale || navigator?.language || 'en-US';
  return sundayLocales.some(l => lang.startsWith(l.split('-')[0]) && lang.includes(l.split('-')[1])) ? 7 : 1;
}
```

### KeyboardNavigationManager (Imperative Focus Management)
```typescript
// Source: Phase 42-09 STATE decisions + WAI-ARIA APG Grid Pattern
class KeyboardNavigationManager {
  private cells: HTMLElement[] = [];
  private focusedIndex = 0;
  private columns = 7;

  constructor(columns: number = 7) {
    this.columns = columns;
  }

  setCells(cells: HTMLElement[]): void {
    this.cells = cells;
    this.updateTabindexes();
  }

  moveFocus(direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end'): number {
    const offsets: Record<string, number> = {
      left: -1, right: 1,
      up: -this.columns, down: this.columns,
    };

    let newIndex: number;
    if (direction === 'home') {
      // First day of current row
      newIndex = Math.floor(this.focusedIndex / this.columns) * this.columns;
    } else if (direction === 'end') {
      newIndex = Math.floor(this.focusedIndex / this.columns) * this.columns + this.columns - 1;
      newIndex = Math.min(newIndex, this.cells.length - 1);
    } else {
      newIndex = this.focusedIndex + offsets[direction];
    }

    // Return -1 if navigation goes beyond grid (trigger month change)
    if (newIndex < 0 || newIndex >= this.cells.length) return -1;

    this.focusedIndex = newIndex;
    this.updateTabindexes();
    this.cells[this.focusedIndex]?.focus();
    return this.focusedIndex;
  }

  private updateTabindexes(): void {
    this.cells.forEach((cell, i) => {
      cell.tabIndex = i === this.focusedIndex ? 0 : -1;
    });
  }
}
```

### Screen Reader Announcement Pattern
```typescript
// Source: Phase 42-10 decisions + WAI-ARIA APG
// In calendar.ts render():
html`
  <!-- Heading with aria-live for month changes -->
  <h2 id="month-heading" aria-live="polite">
    ${this.getMonthYearLabel()}
  </h2>

  <!-- Dedicated announcement region (belt-and-suspenders) -->
  <div
    class="visually-hidden"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    ${this.liveAnnouncement}
  </div>
`

// Shared method called by all navigation handlers
private announceMonthChange(): void {
  const label = this.getMonthYearLabel();
  this.liveAnnouncement = `Now showing ${label}`;
}
```

### Dark Mode Pattern
```css
/* Source: Existing LitUI pattern from switch/checkbox components */
:host-context(.dark) .calendar-grid {
  --ui-calendar-bg: var(--color-background);
  --ui-calendar-text: var(--color-foreground);
  --ui-calendar-border: var(--color-border);
}

:host-context(.dark) .date-button:hover:not(:disabled) {
  background-color: var(--ui-calendar-hover-bg);
}
```

### Component Attributes (Public API)
```typescript
// Source: Phase 42 requirements + architecture decisions
@property({ type: String }) value = '';           // Selected date ISO string YYYY-MM-DD
@property({ type: String }) locale = '';          // BCP 47 locale tag (defaults to navigator.language)
@property({ type: String, attribute: 'min-date' }) minDate = '';   // ISO string
@property({ type: String, attribute: 'max-date' }) maxDate = '';   // ISO string
@property({ type: Array, attribute: false }) disabledDates: string[] = []; // ISO strings
@property({ type: String, attribute: 'first-day-of-week' }) firstDayOfWeek = ''; // Override: '1'-'7'
@property({ type: String, attribute: 'display-month' }) displayMonth = ''; // YYYY-MM or YYYY-MM-DD
@property({ type: Boolean, attribute: 'hide-navigation' }) hideNavigation = false; // For multi-calendar
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Moment.js for date math | date-fns v4 | 2024 (Moment deprecated 2020) | 80% smaller bundle, tree-shakeable |
| Hard-coded locale strings | Intl.DateTimeFormat / Intl.Locale | 2023+ (getWeekInfo widespread) | Zero-cost localization, no locale data bundle |
| aria-activedescendant for grid focus | Roving tabindex | WAI-ARIA APG recommendation | Better screen reader support, simpler implementation |
| `new Date(string)` parsing | date-fns parseISO() | Always was better practice | Cross-browser consistency, no Safari issues |
| `:host-context(.dark)` only | CSS custom properties + `:host-context` | Ongoing | Better cascade, easier theming |

**Deprecated/outdated:**
- **Temporal API:** NOT production-ready (Chrome 144+, Firefox 139+, Safari/Edge not supported as of Jan 2026). Do not use.
- **date-fns-tz (separate package):** Not needed with date-fns v4 which has built-in timezone support.
- **Intl.Locale.weekInfo (property):** Changed to `getWeekInfo()` method. Support both for compatibility.

## Open Questions

1. **date-fns weekStartsOn mapping**
   - What we know: Intl API uses 1=Monday through 7=Sunday. date-fns `startOfWeek` uses `weekStartsOn: 0` (Sunday) through `6` (Saturday).
   - What's unclear: Exact mapping function needed between Intl `firstDay` values and date-fns `weekStartsOn`.
   - Recommendation: Create a mapping utility: Intl 7 (Sunday) -> date-fns 0, Intl 1 (Monday) -> date-fns 1, etc. Formula: `firstDay === 7 ? 0 : firstDay`.

2. **Number of grid rows (5 vs 6)**
   - What we know: Some months need 5 rows, others 6 (e.g., months starting on Saturday with 31 days).
   - What's unclear: Whether to always show 6 rows (consistent height) or variable rows.
   - Recommendation: Always generate from startOfWeek(startOfMonth) to endOfWeek(endOfMonth), which naturally produces 5-6 rows. Accept variable height for now; Phase 43 can add fixed 6-row option.

3. **Disabled date reasons localization**
   - What we know: Phase 42-06 says provide human-readable disabled reasons in aria-label ("before minimum date", "after maximum date", "unavailable", "weekend").
   - What's unclear: Whether these reason strings should be localizable.
   - Recommendation: Start with English strings. Add a `disabledDateLabel` callback property in future if i18n of these strings is needed.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/core/src/tailwind-element.ts` - TailwindElement base class with SSR support
- Existing codebase: `packages/core/src/utils/events.ts` - dispatchCustomEvent helper
- Existing codebase: `packages/checkbox/` - Package setup pattern (package.json, vite.config.ts, tsconfig.json, index.ts)
- Existing codebase: `packages/radio/src/radio-group.ts` - Roving tabindex implementation for radios
- Existing codebase: `packages/core/src/styles/tailwind.css` - CSS custom property token pattern (`--ui-switch-*` etc.)
- `.planning/research/STACK-DATE-TIME.md` - date-fns v4.1.0 recommendation, Intl API recommendation
- `.planning/research/ARCHITECTURE-DATE-TIME.md` - Component architecture, composition strategy, event naming
- `.planning/research/PITFALLS-DATE-TIME.md` - 14 pitfalls catalogued with prevention strategies
- `.planning/STATE.md` - Phase 42 decisions (42-01 through 42-10) documenting all architectural choices
- [W3C WAI-ARIA APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) - Keyboard navigation, grid roles, roving tabindex, aria-live

### Secondary (MEDIUM confidence)
- [MDN Intl.Locale.getWeekInfo()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) - API shape, browser compat, return values
- [date-fns official site](https://date-fns.org/) - API reference (v4.1.0)

### Tertiary (LOW confidence)
- date-fns v4 specific tree-shaking details (WebFetch returned console page, not docs; verify with actual build)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - date-fns v4.1.0 verified via prior research, already decided in STATE.md
- Architecture: HIGH - All patterns derived from existing codebase analysis + prior research docs
- Pitfalls: HIGH - 14 pitfalls documented in PITFALLS-DATE-TIME.md, verified with W3C sources
- Keyboard/a11y: HIGH - WAI-ARIA APG is authoritative, fetched and verified
- Intl API: HIGH - MDN documentation verified, browser compat confirmed

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (stable domain, established patterns)
