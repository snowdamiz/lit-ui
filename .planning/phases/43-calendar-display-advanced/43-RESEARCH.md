# Phase 43: Calendar Display Advanced - Research

**Researched:** 2026-01-30
**Domain:** Advanced calendar features - multi-month, decade/century views, animations, touch gestures, week numbers, responsive layout, slot API
**Confidence:** HIGH

## Summary

Phase 43 extends the Phase 42 calendar foundation with advanced features across eight plans. The implementation builds on the existing `Calendar` class in `packages/calendar/src/calendar.ts`, which already provides a single-month grid with keyboard navigation, range selection, and screen reader support.

The eight feature areas break into three categories:
1. **Layout extensions** (43-01 multi-month, 43-05 week numbers, 43-07 responsive) - CSS Grid layouts wrapping existing month grid, container queries for responsive behavior
2. **Navigation views** (43-02 decade view, 43-03 century view) - New grid views reusing the ARIA grid pattern from Phase 42
3. **Interaction enhancements** (43-04 animations, 43-06 touch gestures, 43-08 slot API) - CSS transitions with reduced-motion, Pointer Events for swipe, named slots for custom rendering

All features use the existing stack: Lit 3, date-fns v4.1.0, Intl API, TailwindElement base class. New date-fns imports needed: `getISOWeek`, `startOfISOWeek`, `endOfISOWeek` for week numbers. No new dependencies required.

**Primary recommendation:** Implement features as extensions to the existing Calendar class. Use CSS-based animations (not JS-based) for month transitions, Pointer Events API for cross-device gesture support, container queries for responsive layout, and named slots with `slotchange` event for custom cell rendering.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | 4.1.0 | getISOWeek, startOfISOWeek, endOfISOWeek for week numbers | Already in project, tree-shakeable, ISO 8601 compliant |
| Lit | 3.3.2 | Web component framework, reactive properties, slots | Project standard |
| @lit-ui/core | workspace:* | TailwindElement base class | Project base class |
| Intl API | Native | Locale-aware week info, month/year formatting | Already used in Phase 42 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Container Queries | Native | Responsive component layout | Multi-month layout adapting to available space |
| Pointer Events API | Native | Unified touch/mouse/pen input | Swipe gesture detection |
| CSS Transitions/Animations | Native | Month slide/fade animations | Transition between months |
| Web Animations API | Native | Programmatic animation control | Complex animation sequencing if needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions | View Transitions API | View Transitions not supported in Firefox; CSS transitions have universal support and are simpler for element-level animations |
| Pointer Events | Touch Events + Mouse Events | Pointer Events unify all input types; Touch Events require separate mouse handling |
| Container queries | Media queries | Container queries respond to component size, not viewport; better for reusable components |
| Named slots | Render callback props | Slots follow web component standards; callbacks require tighter coupling |

**Installation:**
```bash
# No new dependencies - all features use existing stack
# date-fns getISOWeek/startOfISOWeek/endOfISOWeek already included in date-fns@^4.1.0
```

## Architecture Patterns

### Recommended Project Structure

```
packages/calendar/
├── src/
│   ├── calendar.ts              # Main calendar (extended with new features)
│   ├── calendar-multi.ts        # Multi-month wrapper component (NEW)
│   ├── date-utils.ts            # Extended with ISO week functions (MODIFIED)
│   ├── intl-utils.ts            # Existing internationalization (UNCHANGED)
│   ├── keyboard-nav.ts          # Extended for decade/century grids (MODIFIED)
│   ├── gesture-handler.ts       # Swipe gesture detection (NEW)
│   ├── animation-controller.ts  # Animation state management (NEW)
│   ├── styles.ts                # Extended with new CSS custom properties (MODIFIED)
│   ├── jsx.d.ts                 # Updated JSX types (MODIFIED)
│   └── index.ts                 # Updated exports (MODIFIED)
```

### Pattern 1: Multi-Month Display via Wrapper Component

**What:** A `lui-calendar-multi` wrapper that renders 2-3 `lui-calendar` instances with synchronized navigation.

**When to use:** CAL-20 (multiple month display). The wrapper manages shared state and coordinates month changes across instances.

**Example:**
```typescript
// Multi-month wrapper synchronizes child calendars
export class CalendarMulti extends TailwindElement {
  @property({ type: Number, attribute: 'months' })
  months: number = 2; // 2 or 3

  @property({ type: String })
  locale: string = 'en-US';

  @state()
  private baseMonth: Date = new Date();

  override render() {
    return html`
      <div class="calendar-multi" role="group" aria-label="Calendar">
        <div class="calendar-header">
          <button @click=${this.handlePreviousMonth} aria-label="Previous month">&lt;</button>
          <span>${this.getMonthRange()}</span>
          <button @click=${this.handleNextMonth} aria-label="Next month">&gt;</button>
        </div>
        <div class="calendar-grid-container">
          ${Array.from({ length: this.months }, (_, i) => {
            const month = addMonths(this.baseMonth, i);
            return html`
              <lui-calendar
                .locale=${this.locale}
                .currentMonth=${month}
                @ui-date-select=${this.handleDateSelect}
              ></lui-calendar>
            `;
          })}
        </div>
      </div>
    `;
  }
}
```

**Key design decisions:**
- Wrapper owns the navigation controls; individual calendars are "display only"
- Need to expose a way to set currentMonth on Calendar from parent (currently private @state)
- Consider adding `navigation="none"` prop to Calendar to hide its own nav when used in multi-month
- Flexbox layout with `gap` for spacing between months

### Pattern 2: Decade/Century View with Grid Pattern

**What:** A year grid (4x3 or 5x2) for decade view, and a decade grid for century view. Both reuse the ARIA grid pattern.

**When to use:** CAL-21 (decade view), CAL-22 (century view). Users navigate to distant dates quickly.

**Example:**
```typescript
// Decade view: 12-year grid (current decade + 1 year before/after)
type CalendarView = 'month' | 'year' | 'decade';

@state()
private view: CalendarView = 'month';

private renderDecadeView() {
  const startYear = Math.floor(this.currentMonth.getFullYear() / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

  return html`
    <div class="calendar-header">
      <button @click=${this.handlePreviousDecade} aria-label="Previous decade">&lt;</button>
      <h2 aria-live="polite">${startYear} - ${startYear + 9}</h2>
      <button @click=${this.handleNextDecade} aria-label="Next decade">&gt;</button>
    </div>
    <div role="grid" aria-label="Year selection" class="year-grid">
      ${years.map(year => html`
        <div
          role="gridcell"
          tabindex=${year === this.selectedYear ? '0' : '-1'}
          aria-selected=${year === this.selectedYear ? 'true' : 'false'}
          class="${year < startYear || year > startYear + 9 ? 'outside-range' : ''}"
          @click=${() => this.selectYear(year)}
        >
          ${year}
        </div>
      `)}
    </div>
  `;
}

// Century view: 12-decade grid
private renderCenturyView() {
  const startDecade = Math.floor(this.currentMonth.getFullYear() / 100) * 100;
  const decades = Array.from({ length: 12 }, (_, i) => startDecade - 10 + i * 10);

  return html`
    <div role="grid" aria-label="Decade selection" class="decade-grid">
      ${decades.map(decade => html`
        <div
          role="gridcell"
          tabindex=${Math.floor(this.selectedYear / 10) * 10 === decade ? '0' : '-1'}
          @click=${() => this.selectDecade(decade)}
        >
          ${decade}s
        </div>
      `)}
    </div>
  `;
}
```

**Key design decisions:**
- Grid layout: 4 columns x 3 rows (12 cells) for both decade and century views
- Click on month/year heading drills into decade view; click again into century view
- Selecting a year in decade view returns to month view at that year
- Selecting a decade in century view returns to decade view at that decade
- Reuse KeyboardNavigationManager with configurable column count (4 instead of 7)

### Pattern 3: CSS-Based Month Transition Animations

**What:** Slide or fade animation when navigating between months, with `prefers-reduced-motion` support.

**When to use:** CAL-24 (month transition animation), CAL-25 (reduced-motion).

**Example:**
```css
/* Base transition styles */
.calendar-body {
  position: relative;
  overflow: hidden;
}

.month-grid {
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}

/* Slide left (next month) */
.month-grid.slide-out-left {
  transform: translateX(-100%);
  opacity: 0;
}

.month-grid.slide-in-right {
  transform: translateX(100%);
  opacity: 0;
}

/* Reduced motion: use fade instead of slide */
@media (prefers-reduced-motion: reduce) {
  .month-grid {
    transition: opacity 150ms ease-out;
    transform: none !important;
  }
}
```

```typescript
// Animation controller pattern
private async animateMonthTransition(direction: 'next' | 'prev'): Promise<void> {
  const grid = this.shadowRoot?.querySelector('.month-grid');
  if (!grid) return;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Fade out, update, fade in
    grid.classList.add('fade-out');
    await this.waitForTransition(grid);
    // Update month data
    this.updateMonth(direction);
    grid.classList.remove('fade-out');
    return;
  }

  // Slide animation
  const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
  const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

  grid.classList.add(outClass);
  await this.waitForTransition(grid);
  this.updateMonth(direction);
  grid.classList.replace(outClass, inClass);
  // Force reflow
  void grid.offsetHeight;
  grid.classList.remove(inClass);
}

private waitForTransition(element: Element): Promise<void> {
  return new Promise(resolve => {
    element.addEventListener('transitionend', () => resolve(), { once: true });
  });
}
```

**Key design decisions:**
- Use CSS transitions (not Web Animations API or View Transitions API) for broadest browser support
- `prefers-reduced-motion: reduce` replaces slide with fade, does NOT remove animation entirely
- Animation duration: 200ms for slide, 150ms for fade (fast but perceptible)
- Use `transform` and `opacity` only (GPU-accelerated, 60fps)

### Pattern 4: Pointer Events for Touch Swipe

**What:** Use Pointer Events API for unified touch/mouse/pen swipe detection.

**When to use:** CAL-28 (touch swipe gesture).

**Example:**
```typescript
// gesture-handler.ts
export interface SwipeResult {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

export class GestureHandler {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private element: HTMLElement;
  private readonly threshold = 50; // Minimum swipe distance in px
  private readonly maxDuration = 500; // Maximum swipe duration in ms

  constructor(element: HTMLElement, private onSwipe: (result: SwipeResult) => void) {
    this.element = element;
    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointerup', this.handlePointerUp);
    this.element.addEventListener('pointercancel', this.handlePointerCancel);
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = Date.now();
    // Capture pointer for reliable tracking
    this.element.setPointerCapture(e.pointerId);
  };

  private handlePointerUp = (e: PointerEvent) => {
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const duration = Date.now() - this.startTime;

    if (duration > this.maxDuration) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Must exceed threshold and be primarily horizontal
    if (absDx > this.threshold && absDx > absDy * 1.5) {
      this.onSwipe({
        direction: dx > 0 ? 'right' : 'left',
        distance: absDx,
        duration,
      });
    }
  };

  destroy() {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerCancel);
  }
}
```

**Key design decisions:**
- Use Pointer Events (not Touch Events) for unified input handling
- `setPointerCapture()` ensures reliable tracking even if pointer leaves element
- Threshold of 50px prevents accidental swipes
- Require horizontal distance > 1.5x vertical distance to distinguish from scrolling
- Swipe left = next month, swipe right = previous month

### Pattern 5: ISO 8601 Week Numbers

**What:** Display week numbers in a column alongside the calendar grid.

**When to use:** CAL-26 (week number display), CAL-27 (week selection).

**Example:**
```typescript
import { getISOWeek, startOfISOWeek, endOfISOWeek } from 'date-fns';

// Calculate week numbers for displayed month
private getWeekNumbers(): { weekNumber: number; startDate: Date; endDate: Date }[] {
  const days = this.getMonthDays();
  const weeks: Map<number, { weekNumber: number; startDate: Date; endDate: Date }> = new Map();

  for (const day of days) {
    const weekNum = getISOWeek(day);
    if (!weeks.has(weekNum)) {
      weeks.set(weekNum, {
        weekNumber: weekNum,
        startDate: startOfISOWeek(day),
        endDate: endOfISOWeek(day),
      });
    }
  }

  return Array.from(weeks.values());
}

// Render with week number column
private renderGridWithWeekNumbers() {
  return html`
    <div class="calendar-with-weeks" style="display: grid; grid-template-columns: auto 1fr;">
      <!-- Week number column -->
      <div class="week-numbers" role="presentation">
        <div class="week-header" aria-hidden="true">W</div>
        ${this.getWeekNumbers().map(week => html`
          <button
            class="week-number"
            aria-label="Select week ${week.weekNumber}"
            @click=${() => this.handleWeekSelect(week)}
          >
            ${week.weekNumber}
          </button>
        `)}
      </div>
      <!-- Existing grid -->
      <div role="grid" aria-labelledby="calendar-heading">
        <!-- ... existing grid content ... -->
      </div>
    </div>
  `;
}

// Week selection emits all dates in the week
private handleWeekSelect(week: { weekNumber: number; startDate: Date; endDate: Date }) {
  const dates = eachDayOfInterval({ start: week.startDate, end: week.endDate });
  const isoStrings = dates.map(d => formatDate(d));

  this.dispatchEvent(new CustomEvent('ui-week-select', {
    bubbles: true,
    composed: true,
    detail: {
      week: week.weekNumber,
      dates: isoStrings,
      start: formatDate(week.startDate),
      end: formatDate(week.endDate),
    }
  }));
}
```

**Key design decisions:**
- ISO 8601 weeks always start on Monday
- Week number column sits to the left of the grid
- Grid becomes 8-column layout (1 week number + 7 days) when week numbers are enabled
- `show-week-numbers` boolean property controls visibility
- Clicking a week number emits `ui-week-select` with all 7 dates

### Pattern 6: Slot API for Custom Cell Rendering

**What:** Named slots allow users to provide custom content for date cells.

**When to use:** CAL-23 (custom date cell rendering).

**Example:**
```typescript
// Usage (consumer):
// <lui-calendar>
//   <template slot="day-cell">
//     <!-- Receives date info via CSS custom properties or data attributes -->
//   </template>
// </lui-calendar>

// Alternative approach: render callback via property
// <lui-calendar .renderDay=${(date, state) => html`<div class="custom">${date.getDate()}</div>`}>

// Recommended: Use named slots with slotchange event
private renderDayCell(date: Date, index: number) {
  const isoDate = formatDate(date);
  const isSelected = /* ... existing logic ... */;
  const isToday = isDateToday(date);

  return html`
    <div
      role="gridcell"
      aria-selected=${isSelected ? 'true' : 'false'}
      aria-current=${isToday ? 'date' : nothing}
      data-date="${isoDate}"
      data-day="${date.getDate()}"
      data-today="${isToday}"
      data-selected="${isSelected}"
    >
      <slot name="day-${isoDate}">
        <!-- Default content if no slot provided -->
        ${date.getDate()}
      </slot>
    </div>
  `;
}
```

**Key design decisions:**
- Two approaches possible:
  1. **Named slots per date** (`slot="day-2026-01-15"`) - Very flexible but verbose for consumers
  2. **Render callback property** (`.renderDay=${fn}`) - More ergonomic, allows programmatic control
- **Recommendation:** Use a render callback property (`.renderDay`) as the primary API. It's more practical for web components than creating 31+ named slots per month.
- The callback receives `(date: Date, state: { isToday: boolean, isSelected: boolean, isDisabled: boolean })` and returns a `TemplateResult`
- Falls back to default rendering when no callback is provided

### Pattern 7: Container Queries for Responsive Layout

**What:** Use CSS container queries to adapt calendar layout based on component container size.

**When to use:** CAL-29 (responsive layout).

**Example:**
```css
/* Host is the container */
:host {
  container-type: inline-size;
  container-name: calendar;
}

/* Default: compact mobile layout */
.calendar-header h2 { font-size: 1rem; }
[role="gridcell"] { min-height: 2rem; font-size: 0.75rem; }

/* Medium: standard desktop */
@container calendar (min-width: 320px) {
  .calendar-header h2 { font-size: 1.125rem; }
  [role="gridcell"] { min-height: 2.5rem; font-size: 0.875rem; }
}

/* Large: spacious layout */
@container calendar (min-width: 480px) {
  .calendar-header h2 { font-size: 1.375rem; }
  [role="gridcell"] { min-height: 3rem; font-size: 1rem; }
}
```

**Key design decisions:**
- Use `container-type: inline-size` on `:host` so calendar adapts to its container, not viewport
- Browser support: Chrome 105+, Safari 16+, Firefox 110+ (>95% global support)
- Works within Shadow DOM (container queries respect shadow boundaries)
- Multi-month display switches from side-by-side to stacked layout at narrow widths

### Anti-Patterns to Avoid

- **Separate component for each view:** Don't create `lui-decade-view`, `lui-century-view` as separate custom elements. Keep them as internal views within Calendar to share state and avoid cross-component communication complexity.
- **JavaScript-driven animations:** Don't use `requestAnimationFrame` loops or Web Animations API for simple slide/fade. CSS transitions with `transitionend` events are simpler and more performant.
- **Touch Events API:** Don't use `touchstart`/`touchend`. Pointer Events unify all input types and are the modern standard.
- **31 named slots:** Don't create a named slot for each day of the month. Use a render callback property instead.
- **Viewport media queries for component sizing:** Don't use `@media` queries. Use `@container` queries so the calendar adapts to its container, not the browser window.
- **Removing all animation for reduced-motion:** Don't use `animation: none` or `transition: none`. Replace slide with fade instead - users who prefer reduced motion still benefit from visual feedback.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ISO week calculation | Manual week math | date-fns `getISOWeek()` | DST transitions, year boundaries, ISO 8601 edge cases |
| Week start/end dates | Manual date arithmetic | date-fns `startOfISOWeek()` / `endOfISOWeek()` | Handles year-crossing weeks correctly |
| Touch gesture detection | Raw touch coordinate math | Pointer Events API with `setPointerCapture()` | Handles touch, mouse, pen; prevents pointer loss |
| Reduced motion detection | Manual OS checks | `window.matchMedia('(prefers-reduced-motion: reduce)')` | Standard API, matches all platforms |
| Responsive breakpoints | Fixed pixel breakpoints | CSS container queries (`@container`) | Component adapts to container, not viewport |

**Key insight:** The browser platform now provides native APIs for every interaction pattern needed in this phase. Pointer Events replace Touch Events, container queries replace viewport media queries, and CSS transitions with `prefers-reduced-motion` handle accessible animations. No third-party libraries needed.

## Common Pitfalls

### Pitfall 1: Multi-Month Navigation Desync

**What goes wrong:** Multiple calendar instances show wrong months after navigation. Month 1 shows January, Month 2 shows March instead of February.

**Why it happens:** Each calendar instance manages its own `currentMonth` state independently. Navigation events propagate incorrectly.

**How to avoid:**
- Wrapper component owns the base month; child calendars receive month as prop
- Child calendars have `navigation="none"` prop to hide their own nav controls
- Only the wrapper handles prev/next navigation
- The wrapper calculates each child's month: `baseMonth + offset`

**Warning signs:** "Each calendar has its own prev/next buttons." This leads to desync.

### Pitfall 2: Animation Interruption on Rapid Navigation

**What goes wrong:** User clicks next month rapidly. Animations overlap, grid shows wrong data, or animation gets stuck mid-transition.

**Why it happens:** New animation starts before previous one finishes. Multiple `transitionend` listeners accumulate.

**How to avoid:**
- Track animation state: `isAnimating: boolean`
- Skip animation if already animating (instant update)
- Or cancel current animation before starting new one
- Always clean up `transitionend` listeners
- Use `{ once: true }` on event listeners

**Warning signs:** "The grid flickers when clicking fast." Animation state management is missing.

### Pitfall 3: Swipe Conflicts with Scrolling

**What goes wrong:** Horizontal swipe triggers both month navigation AND page scroll. Or vertical scroll accidentally triggers month change.

**Why it happens:** No distinction between horizontal swipe and vertical scroll gestures.

**How to avoid:**
- Require horizontal distance > 1.5x vertical distance for swipe detection
- Set minimum swipe threshold (50px)
- Set maximum swipe duration (500ms) to distinguish swipe from drag
- Only call `preventDefault()` after confirming it's a horizontal swipe
- Use `touch-action: pan-y` CSS to allow vertical scrolling but capture horizontal

**Warning signs:** "Month changes when I try to scroll the page." Missing gesture discrimination.

### Pitfall 4: Week Number Off-by-One at Year Boundaries

**What goes wrong:** January 1st shows as week 52 or 53 of the previous year (correct per ISO 8601) but confuses users. Or December 31st shows as week 1 of next year.

**Why it happens:** ISO 8601 week numbering follows the "Thursday rule" - week 1 contains the first Thursday of the year. This means some days at the start of January may belong to the previous year's last week.

**How to avoid:**
- Use `getISOWeek()` from date-fns consistently (it handles this correctly)
- Don't manually calculate week numbers
- Consider displaying the ISO week-numbering year alongside ambiguous weeks
- Add visual indicator when a week spans two calendar years

**Warning signs:** "Week 1 starts on January 4th, that seems wrong." It's correct per ISO 8601 - document this behavior.

### Pitfall 5: Decade/Century View Missing Keyboard Navigation

**What goes wrong:** Users can navigate the month grid with arrow keys but decade/century views don't support keyboard navigation.

**Why it happens:** Developer forgets to adapt KeyboardNavigationManager for new grid layouts (4 columns instead of 7).

**How to avoid:**
- Make KeyboardNavigationManager's column count configurable
- Apply roving tabindex to decade grid (4x3) and century grid (4x3)
- Maintain consistent keyboard shortcuts: arrows, Home/End, Enter/Space
- Test keyboard navigation in all three views

**Warning signs:** "I can't tab into the year grid." Missing tabindex and key handlers.

### Pitfall 6: Slot API Memory Leaks

**What goes wrong:** Custom render callbacks cause memory leaks or stale closures when component re-renders.

**Why it happens:** Render callback captures external state, component doesn't clean up properly.

**How to avoid:**
- Use Lit's reactive property system (`.renderDay=${fn}`) - Lit handles cleanup
- Don't store callback results; re-invoke on each render
- If using slots, listen for `slotchange` to handle dynamic content
- Test with rapid month switching and custom renderers

**Warning signs:** "Memory grows when switching months with custom renderer." Stale references not cleaned up.

## Code Examples

### ISO Week Number Calculation

```typescript
// Source: date-fns official API (getISOWeek, startOfISOWeek, endOfISOWeek)
import { getISOWeek, startOfISOWeek, endOfISOWeek, eachDayOfInterval } from 'date-fns';

// Get ISO week for a specific date
const week = getISOWeek(new Date(2026, 0, 1));
// => 1 (January 1, 2026 is a Thursday, so it's week 1)

// Get ISO week for year boundary edge case
const weekDec31 = getISOWeek(new Date(2025, 11, 31));
// => 1 (December 31, 2025 is a Wednesday, belongs to week 1 of 2026)

// Get all dates in a specific ISO week
const weekStart = startOfISOWeek(new Date(2026, 0, 15));
const weekEnd = endOfISOWeek(new Date(2026, 0, 15));
const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });
// => [Mon Jan 12, Tue Jan 13, Wed Jan 14, Thu Jan 15, Fri Jan 16, Sat Jan 17, Sun Jan 18]
```

### Prefers-Reduced-Motion Pattern

```typescript
// Detect and respond to reduced motion preference
// Source: MDN prefers-reduced-motion + web.dev best practices
private get prefersReducedMotion(): boolean {
  if (isServer) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Listen for changes (user toggles setting while component is mounted)
override connectedCallback() {
  super.connectedCallback();
  if (!isServer) {
    this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._motionQuery.addEventListener('change', this._handleMotionChange);
  }
}

override disconnectedCallback() {
  super.disconnectedCallback();
  this._motionQuery?.removeEventListener('change', this._handleMotionChange);
}
```

```css
/* CSS approach: swap animation type, don't remove it */
.month-grid {
  transition: transform 200ms ease-out, opacity 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .month-grid {
    /* Replace slide with crossfade only */
    transition: opacity 150ms ease-out;
    transform: none !important;
  }
}
```

### Pointer Events Swipe Detection

```typescript
// Source: MDN Pointer Events API + CSS-Tricks simple swipe pattern
// Use setPointerCapture for reliable tracking
private handlePointerDown(e: PointerEvent) {
  this._swipeStart = { x: e.clientX, y: e.clientY, time: Date.now() };
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

private handlePointerUp(e: PointerEvent) {
  if (!this._swipeStart) return;

  const dx = e.clientX - this._swipeStart.x;
  const dy = e.clientY - this._swipeStart.y;
  const dt = Date.now() - this._swipeStart.time;

  // Swipe detection: horizontal, minimum distance, within time limit
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
    if (dx > 0) {
      this.handlePreviousMonth(); // Swipe right = go back
    } else {
      this.handleNextMonth(); // Swipe left = go forward
    }
  }

  this._swipeStart = null;
}
```

### Container Query Responsive Layout

```css
/* Source: MDN Container Queries, Chrome 105+/Safari 16+/Firefox 110+ */
:host {
  container-type: inline-size;
  container-name: calendar;
  display: block;
}

/* Multi-month: stack vertically on narrow containers */
.calendar-multi-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.calendar-multi-container > * {
  flex: 1 1 280px; /* Minimum 280px per month */
}

@container calendar (max-width: 600px) {
  .calendar-multi-container {
    flex-direction: column;
  }
}
```

### Decade View Grid CSS

```css
/* 4x3 grid for decade/century views */
.year-grid, .decade-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--ui-calendar-gap, 0.25rem);
}

.year-grid [role="gridcell"],
.decade-grid [role="gridcell"] {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  cursor: pointer;
  border-radius: var(--ui-calendar-cell-radius, 0.375rem);
  transition: background-color 150ms;
}

.year-grid [role="gridcell"]:hover,
.decade-grid [role="gridcell"]:hover {
  background-color: var(--color-gray-100);
}

.year-grid [role="gridcell"][aria-selected="true"],
.decade-grid [role="gridcell"][aria-selected="true"] {
  background-color: var(--ui-calendar-selected-bg, var(--color-brand-500));
  color: var(--ui-calendar-selected-text, oklch(0.98 0.01 250));
}

/* Outside range (e.g., years before/after the decade) */
.year-grid .outside-range,
.decade-grid .outside-range {
  opacity: 0.4;
}
```

### Render Callback for Custom Day Cells

```typescript
// Source: Lit property patterns (reactive callback property)
export interface DayCellState {
  date: Date;
  isoDate: string;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange: boolean;
  isWeekend: boolean;
}

// Property definition
@property({ attribute: false })
renderDay?: (state: DayCellState) => unknown;

// Usage in renderDayCell
private renderDayCell(date: Date, index: number) {
  const state: DayCellState = {
    date,
    isoDate: formatDate(date),
    isToday: isDateToday(date),
    isSelected: /* ... */,
    isDisabled: this.isCellDisabled(date),
    isInRange: /* ... */,
    isWeekend: isWeekendDate(date),
  };

  return html`
    <div
      role="gridcell"
      aria-selected=${state.isSelected ? 'true' : 'false'}
      data-date="${state.isoDate}"
    >
      ${this.renderDay ? this.renderDay(state) : date.getDate()}
    </div>
  `;
}

// Consumer usage:
// <lui-calendar .renderDay=${(state) => html`
//   <span class=${state.isWeekend ? 'weekend' : ''}>
//     ${state.date.getDate()}
//     ${state.hasEvent ? html`<span class="dot"></span>` : nothing}
//   </span>
// `}></lui-calendar>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Touch Events API | Pointer Events API | Chrome 55+ (2016), full adoption 2020+ | Unified input handling for touch/mouse/pen |
| Viewport media queries | Container queries | Chrome 105+ (2022), Safari 16+ (2022) | Component-level responsive design |
| JavaScript animation loops | CSS transitions + prefers-reduced-motion | Broad adoption 2020+ | GPU-accelerated, accessible by default |
| Remove animation for a11y | Replace animation type (slide->fade) | Best practice shift 2023+ | Users still get visual feedback |
| Named slots for templating | Render callback properties | Common in Lit ecosystem 2022+ | More ergonomic for dynamic content |
| View Transitions API | CSS transitions (for components) | View Transitions Level 2 spec 2026 | View Transitions better for page-level; CSS transitions for component-level |

**Deprecated/outdated:**
- **Touch Events for gesture detection**: Use Pointer Events instead (unified API)
- **Hammer.js**: No longer maintained, Pointer Events provide same capabilities natively
- **Viewport-only responsive design**: Container queries are the standard for components (2022+)
- **`animation: none` for reduced-motion**: Replace animation type instead; don't remove all visual feedback

## Open Questions

### 1. Multi-Month Calendar: New Component or Extended Existing?

**What we know:**
- Current `Calendar` class is a single-month component
- Multi-month needs synchronized navigation across 2-3 grids
- Wrapper pattern (new component) keeps single-month simple

**What's unclear:**
- Should multi-month be a separate `lui-calendar-multi` element or a `months` property on existing `lui-calendar`?

**Recommendation:** Create a **separate `lui-calendar-multi` wrapper component** that composes multiple `lui-calendar` instances. This keeps the single-month component simple and follows composition over inheritance. The wrapper handles navigation synchronization. Add a `hide-navigation` prop to `lui-calendar` for use inside the multi-month wrapper.

### 2. View Transitions API vs CSS Transitions for Month Switching

**What we know:**
- View Transitions API (Level 1) is supported in Chrome 111+, Safari 18+
- Firefox support is still limited
- CSS transitions have universal support

**What's unclear:**
- Whether View Transitions provide meaningful UX improvement over CSS transitions for this specific use case

**Recommendation:** Use **CSS transitions** for Phase 43. They have universal browser support and are simpler for element-level animations within Shadow DOM. View Transitions API is better suited for page-level transitions and can be explored in a future enhancement phase if needed.

### 3. Calendar currentMonth Property Access

**What we know:**
- `currentMonth` is currently `@state()` (private internal state)
- Multi-month wrapper needs to set child calendar's displayed month
- Wrapper needs to coordinate which month each child displays

**What's unclear:**
- Best way to expose month setting: make currentMonth a `@property()` or add a public method

**Recommendation:** Add a public `@property({ attribute: 'display-month' })` that accepts an ISO date string (YYYY-MM-DD or YYYY-MM) to set the displayed month externally. When set, it overrides internal `currentMonth`. This follows the existing pattern of string-based attribute APIs in the project.

### 4. KeyboardNavigationManager Column Count

**What we know:**
- Current `KeyboardNavigationManager` hardcodes `columns = 7`
- Decade/century views use 4-column grids
- The manager needs to work with different column counts

**What's unclear:**
- Whether to make it configurable per instance or create separate manager instances

**Recommendation:** Make the `columns` parameter configurable in the `KeyboardNavigationManager` constructor. Default remains 7 for backward compatibility. Decade/century views pass `columns: 4`.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/calendar/src/calendar.ts` - Current Calendar implementation, all Phase 42 patterns
- Existing codebase: `packages/calendar/src/keyboard-nav.ts` - KeyboardNavigationManager with roving tabindex
- Existing codebase: `packages/calendar/src/date-utils.ts` - Current date-fns wrapper functions
- [date-fns Official Site](https://date-fns.org/) - getISOWeek, startOfISOWeek, endOfISOWeek APIs
- [date-fns v4.0 Release Blog](https://blog.date-fns.org/v40-with-time-zone-support/) - v4 API stability confirmation
- [MDN: Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) - Unified input handling
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) - Reduced motion media query
- [MDN: CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) - Component-level responsive design
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) - Browser support assessment
- [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) - Accessibility pattern for decade/century grids
- [Lit Shadow DOM / Slots](https://lit.dev/docs/components/shadow-dom/) - Slot API patterns

### Secondary (MEDIUM confidence)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) - Best practices for accessible animation
- [CSS-Tricks: Simple Swipe with Vanilla JavaScript](https://css-tricks.com/simple-swipe-with-vanilla-javascript/) - Swipe detection patterns
- [LogRocket: Container Queries in 2026](https://blog.logrocket.com/container-queries-2026/) - Container query browser support status
- [Can I Use: View Transitions](https://caniuse.com/view-transitions) - Browser support data
- [Kendo UI MultiViewCalendar](https://www.telerik.com/kendo-angular-ui/multiviewcalendar) - Multi-month calendar reference implementation

### Tertiary (LOW confidence)
- [GitHub: lit-transition](https://github.com/sijakret/lit-transition) - Community animation directive (LOW: may be outdated)
- Various StackOverflow discussions on ISO week numbering edge cases (LOW: community answers)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All features use existing project stack (date-fns, Lit, Intl API) plus native browser APIs (Pointer Events, Container Queries, CSS Transitions)
- Architecture: HIGH - Patterns directly extend Phase 42 implementation with well-documented browser APIs
- Pitfalls: HIGH - Common issues documented from real calendar component implementations and verified against codebase

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (60 days - stable APIs with broad browser support)

---

*Phase: 43-calendar-display-advanced*
*Research completed: 2026-01-30*
