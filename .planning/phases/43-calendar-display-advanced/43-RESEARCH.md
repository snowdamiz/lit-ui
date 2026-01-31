# Phase 43: Calendar Display Advanced - Research

**Researched:** 2026-01-31
**Domain:** Lit web component advanced calendar features (multi-month, decade/century views, animations, gestures, responsive layout)
**Confidence:** HIGH

## Summary

Phase 43 extends the existing `lui-calendar` component (893 lines, Phase 42) with advanced features: multi-month display, decade/century navigation views, CSS animations with accessibility, Pointer Events swipe gestures, ISO week numbers, custom day rendering, and responsive container-query layout. The existing component is built on Lit 3 + TailwindElement base class with date-fns v4.1.0 and native Intl API for localization.

The standard approach uses: (1) date-fns `getISOWeek`/`startOfISOWeek`/`endOfISOWeek` for ISO 8601 week compliance, (2) Pointer Events API (not Touch Events) for unified swipe detection, (3) Web Animations API (`Element.animate()`) for imperative slide transitions with CSS fallback for fade, (4) `@media (prefers-reduced-motion: reduce)` to swap slide for fade, (5) CSS container queries (`container-type: inline-size` on `:host`) for component-level responsiveness, and (6) a `CalendarMulti` wrapper component that owns navigation and renders child `Calendar` instances with `display-month` and `hide-navigation` props.

**Primary recommendation:** Build modular utilities (GestureHandler, AnimationController, week-number helpers) as standalone classes/files, then integrate them into the existing Calendar class and a new CalendarMulti wrapper. Use Pointer Events with `touch-action: pan-y` for swipe, Web Animations API for slide transitions, and container queries for responsive layout.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Web component framework | Already in use, provides reactive properties, Shadow DOM, lifecycle |
| date-fns | ^4.1.0 | Date manipulation | Already in use, provides getISOWeek, startOfISOWeek, endOfISOWeek |
| @lit-ui/core | workspace:* | TailwindElement base class, SSR utilities | Already in use, provides base class and event dispatch |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Pointer Events API | Browser native | Swipe gesture detection | Touch/mouse/pen unified input for month swiping |
| Web Animations API | Browser native | Slide/fade transitions | Month transition animations, cancelable and JS-controllable |
| CSS Container Queries | Browser native | Component-level responsiveness | Responsive layout without viewport dependency |
| Intl API | Browser native | Locale-aware formatting | Already in use for weekday/month names |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pointer Events | Touch Events | Touch Events are touch-only; Pointer Events unify mouse, touch, pen |
| Web Animations API | CSS transitions only | WAAPI allows imperative control, cancellation, direction changes mid-animation |
| Container queries | Viewport media queries | Media queries respond to viewport, not component size; container queries enable true component encapsulation |
| date-fns getISOWeek | Manual ISO week calc | ISO 8601 week numbering has many edge cases (year boundary weeks); date-fns handles them correctly |

**Installation:**
No new dependencies needed. All features use browser-native APIs or existing date-fns functions.

## Architecture Patterns

### Recommended File Structure
```
packages/calendar/src/
├── calendar.ts              # Existing: add view switching, renderDay slot, week numbers
├── calendar-multi.ts        # NEW: CalendarMulti wrapper component
├── date-utils.ts            # Existing: add getISOWeekNumber, getWeekDates helpers
├── intl-utils.ts            # Existing: no changes needed
├── keyboard-nav.ts          # Existing: make columns configurable (already is via constructor)
├── gesture-handler.ts       # NEW: Pointer Events swipe detection
├── animation-controller.ts  # NEW: Slide/fade transition management
├── index.ts                 # Existing: add new exports
├── jsx.d.ts                 # Existing: add CalendarMulti types
└── vite-env.d.ts            # Existing: no changes
```

### Pattern 1: View Dispatch in render()
**What:** Calendar uses a `CalendarView` type (`'month' | 'year' | 'decade'`) and dispatches to separate render methods.
**When to use:** When a single component has multiple visual modes sharing the same state.
**Example:**
```typescript
// Source: Prior decision from Phase 43-04
type CalendarView = 'month' | 'year' | 'decade';

@state()
private currentView: CalendarView = 'month';

protected override render() {
  switch (this.currentView) {
    case 'month': return this.renderMonthView();
    case 'year': return this.renderYearView();    // decade grid showing 12 years
    case 'decade': return this.renderDecadeView(); // century grid showing 12 decades
  }
}
```

### Pattern 2: GestureHandler as Standalone Class
**What:** Encapsulate swipe detection in a class that attaches/detaches Pointer Event listeners.
**When to use:** When gesture logic is complex enough to warrant isolation from component code.
**Example:**
```typescript
// Source: Prior decisions from Phase 43-02
export class GestureHandler {
  private startX = 0;
  private startY = 0;
  private pointerId: number | null = null;

  constructor(
    private element: HTMLElement,
    private onSwipe: (direction: 'left' | 'right') => void,
    private threshold = 50,
    private ratio = 1.5
  ) {}

  attach(): void {
    this.element.style.touchAction = 'pan-y'; // Critical: allow vertical scroll, capture horizontal
    this.element.addEventListener('pointerdown', this.onPointerDown);
    this.element.addEventListener('pointermove', this.onPointerMove);
    this.element.addEventListener('pointerup', this.onPointerUp);
    this.element.addEventListener('pointercancel', this.onPointerCancel);
  }

  detach(): void {
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    // ... remove all listeners
  }

  private onPointerDown = (e: PointerEvent) => {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.pointerId = e.pointerId;
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    if (Math.abs(dx) > this.threshold && Math.abs(dx) > Math.abs(dy) * this.ratio) {
      this.onSwipe(dx > 0 ? 'right' : 'left');
    }
    this.pointerId = null;
  };
}
```

### Pattern 3: AnimationController with prefers-reduced-motion
**What:** Manages slide/fade transitions on a target element, automatically respecting motion preferences.
**When to use:** When animations need to be triggered programmatically and must respect accessibility settings.
**Example:**
```typescript
// Source: Prior decisions from Phase 43-05, MDN prefers-reduced-motion docs
export class AnimationController {
  private prefersReducedMotion: boolean;
  private mediaQuery: MediaQueryList;

  constructor(private target: HTMLElement) {
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }

  async transition(direction: 'left' | 'right'): Promise<void> {
    if (this.prefersReducedMotion) {
      return this.fade();
    }
    return this.slide(direction);
  }

  private async slide(direction: 'left' | 'right'): Promise<void> {
    const offset = direction === 'left' ? '-100%' : '100%';
    const animation = this.target.animate(
      [
        { transform: `translateX(${offset})`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: 200, easing: 'ease-out', fill: 'forwards' }
    );
    await animation.finished;
  }

  private async fade(): Promise<void> {
    const animation = this.target.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 150, easing: 'ease-in-out', fill: 'forwards' }
    );
    await animation.finished;
  }
}
```

### Pattern 4: CalendarMulti Wrapper
**What:** A separate `lui-calendar-multi` component that renders 2-3 `lui-calendar` instances with coordinated navigation.
**When to use:** Multi-month display for range selection.
**Example:**
```typescript
// Source: Prior decisions from Phase 43-06
export class CalendarMulti extends TailwindElement {
  @property({ type: Number }) months = 2; // Clamped to 2-3

  static override styles: CSSResultGroup = [
    ...tailwindBaseStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .multi-wrapper {
        display: flex;
        gap: 1rem;
      }
      .multi-wrapper > * {
        min-width: 280px;
        flex: 1;
      }
    `,
  ];

  protected override render() {
    const count = Math.max(2, Math.min(3, this.months));
    // Render count Calendar instances with display-month offset
    // First calendar: currentMonth, second: currentMonth+1, etc.
    // CalendarMulti owns prev/next navigation
  }
}
```

### Pattern 5: Container Queries in Shadow DOM
**What:** Use `:host { container-type: inline-size }` and `@container` rules for responsive layout within Shadow DOM.
**When to use:** When component layout must adapt to its container size, not viewport.
**Example:**
```css
/* Source: https://coryrylan.com/blog/css-container-queries-in-web-components */
:host {
  display: block;
  container-type: inline-size;
}

/* Compact: single column, smaller cells */
@container (max-width: 279px) {
  .calendar { --ui-calendar-day-size: 2rem; }
}

/* Standard: default layout */
@container (min-width: 280px) and (max-width: 380px) {
  .calendar { --ui-calendar-day-size: 2.5rem; }
}

/* Spacious: larger cells */
@container (min-width: 381px) {
  .calendar { --ui-calendar-day-size: 3rem; }
}
```

### Anti-Patterns to Avoid
- **Animating layout properties:** Never animate `width`, `height`, or `margin` for month transitions. Use `transform` and `opacity` only for GPU-composited animation.
- **Touch Events for swipe:** Do not use `touchstart`/`touchmove`/`touchend`. Pointer Events unify mouse, touch, and pen.
- **Viewport media queries for component responsiveness:** The component may be in a sidebar, modal, or full-width. Use container queries instead.
- **Removing animations entirely for reduced-motion:** Replace slide with fade, do not remove all animation. Users with reduced-motion preference still benefit from state-change indication.
- **Manual ISO week calculation:** ISO 8601 week numbering has edge cases at year boundaries (e.g., Dec 31 can be week 1 of next year). Use date-fns.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ISO week number calculation | Custom week math | date-fns `getISOWeek()` | Year boundary edge cases, locale differences |
| ISO week start/end dates | Manual date arithmetic | date-fns `startOfISOWeek()` / `endOfISOWeek()` | Correct handling of week-year boundaries |
| Swipe gesture detection | Custom touch event handling | Pointer Events API with threshold logic | Pointer Events handle mouse, touch, and pen; Touch Events are touch-only |
| Element animations | Manual CSS class toggling | Web Animations API `Element.animate()` | Cancelable, returns Promise, controllable from JS |
| Reduced motion detection | Manual CSS-only approach | `window.matchMedia('(prefers-reduced-motion: reduce)')` | Allows JS logic branching, not just CSS overrides |
| Component-level responsive layout | Viewport media queries | CSS Container Queries `@container` | Components must adapt to their container, not the viewport |

**Key insight:** All advanced features in this phase use browser-native APIs. No new npm dependencies are needed. The complexity is in orchestrating these APIs correctly within a Lit web component lifecycle.

## Common Pitfalls

### Pitfall 1: pointercancel Firing During Swipe
**What goes wrong:** Swipe gesture is interrupted by `pointercancel` before `pointerup` fires.
**Why it happens:** Default `touch-action: auto` allows the browser to take over the gesture for panning/zooming, firing `pointercancel`.
**How to avoid:** Set `touch-action: pan-y` on the swipe target element. This allows vertical scrolling but prevents the browser from claiming horizontal gestures.
**Warning signs:** Swipe works on desktop mouse but fails on touch devices.

### Pitfall 2: Animation Conflicts During Rapid Navigation
**What goes wrong:** User clicks next/prev rapidly, creating overlapping animations that produce visual glitches.
**Why it happens:** New animation starts before previous one completes.
**How to avoid:** Cancel any in-progress animation before starting a new one. Web Animations API's `Animation.cancel()` makes this straightforward. Store the current `Animation` instance and call `cancel()` on it before starting a new `animate()` call.
**Warning signs:** Month grid flickers or shows wrong content during fast navigation.

### Pitfall 3: KeyboardNavigationManager Column Mismatch
**What goes wrong:** Arrow key navigation moves to wrong cell in decade/century views.
**Why it happens:** Decade/century views use 4-column grids but KeyboardNavigationManager defaults to 7 columns.
**How to avoid:** The existing `KeyboardNavigationManager` constructor already accepts a `columns` parameter. Create a new instance with `columns = 4` for decade/century views, or update the instance when switching views.
**Warning signs:** Up/down arrows in year grid skip multiple items or wrap incorrectly.

### Pitfall 4: display-month Prop Parsing
**What goes wrong:** `display-month="2026-01"` fails to parse because `parseISO` expects a full date.
**Why it happens:** ISO date parsing requires a day component.
**How to avoid:** In `updated()`, detect YYYY-MM format (7 chars, no third hyphen) and append `-01` before parsing. Prior decision specifies supporting both YYYY-MM-DD and YYYY-MM formats.
**Warning signs:** Calendar renders but shows wrong month or today's date instead of the specified month.

### Pitfall 5: Container Queries Not Working in Shadow DOM
**What goes wrong:** `@container` rules have no effect inside the component.
**Why it happens:** `container-type` must be set on an ancestor of the elements being queried. If set on `:host` but querying elements inside a nested div, it works. But if `container-type` is set on the same element being styled, it won't work.
**How to avoid:** Set `container-type: inline-size` on `:host` and apply `@container` rules to child elements within the Shadow DOM. This is the standard pattern for web components.
**Warning signs:** Responsive styles never activate regardless of component width.

### Pitfall 6: GestureHandler Initialized Before DOM Exists
**What goes wrong:** GestureHandler tries to attach listeners to an element that doesn't exist yet.
**Why it happens:** Initializing in `constructor()` or `connectedCallback()` before first render.
**How to avoid:** Initialize GestureHandler in `firstUpdated()` — this is the first Lit lifecycle callback where the Shadow DOM is available. This matches the existing pattern for `KeyboardNavigationManager`.
**Warning signs:** No error thrown (listeners just don't attach to null element), but swipe doesn't work.

### Pitfall 7: Week Number Column Breaking 7-Column Grid
**What goes wrong:** Adding a week number column shifts the calendar grid layout.
**Why it happens:** Calendar grid uses `grid-template-columns: repeat(7, 1fr)`. Adding week numbers means 8 columns.
**How to avoid:** When `show-week-numbers` is enabled, change grid to `repeat(8, 1fr)` or use `auto repeat(7, 1fr)` where the first column is a fixed-width non-interactive label. Also update `KeyboardNavigationManager` to still use 7 columns (week number cells are not focusable).
**Warning signs:** Day cells misalign with weekday headers, or keyboard navigation is off by one.

## Code Examples

### ISO Week Number Utilities
```typescript
// Source: date-fns v4.1.0 API (verified via existing project usage pattern)
import { getISOWeek, startOfISOWeek, endOfISOWeek } from 'date-fns';

/**
 * Get ISO 8601 week number for a date.
 * Week 1 is the week containing the first Thursday of the year.
 */
export function getISOWeekNumber(date: Date): number {
  return getISOWeek(date);
}

/**
 * Get all dates in an ISO week (Monday to Sunday).
 */
export function getISOWeekDates(date: Date): Date[] {
  const weekStart = startOfISOWeek(date);
  const weekEnd = endOfISOWeek(date);
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}
```

### Decade View Grid (4x3 layout, 12 cells)
```typescript
// Source: Prior decision from Phase 43-04
private renderYearView() {
  const currentYear = getYear(this.currentMonth);
  const decadeStart = Math.floor(currentYear / 10) * 10;
  // 12 years: 1 before decade + 10 in decade + 1 after
  const years = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

  return html`
    <div class="year-grid" role="grid" @keydown="${this.handleYearKeydown}">
      ${years.map(year => html`
        <button
          class="year-cell ${year === currentYear ? 'current' : ''} ${year < decadeStart || year > decadeStart + 9 ? 'outside' : ''}"
          @click="${() => this.selectYear(year)}"
          aria-label="${year}"
          aria-selected="${year === getYear(this.currentMonth)}"
        >
          ${year}
        </button>
      `)}
    </div>
  `;
}
```

### Century View Grid (4x3 layout, 12 cells)
```typescript
// Source: Prior decision from Phase 43-04
private renderDecadeView() {
  const currentYear = getYear(this.currentMonth);
  const centuryStart = Math.floor(currentYear / 100) * 100;
  // 12 decades in 4x3 grid
  const decades = Array.from({ length: 12 }, (_, i) => centuryStart - 10 + (i * 10));

  return html`
    <div class="decade-grid" role="grid" @keydown="${this.handleDecadeKeydown}">
      ${decades.map(decade => html`
        <button
          class="decade-cell"
          @click="${() => this.selectDecade(decade)}"
          aria-label="${decade} to ${decade + 9}"
        >
          ${decade}-${decade + 9}
        </button>
      `)}
    </div>
  `;
}
```

### Swipe Integration in Calendar
```typescript
// Source: Prior decision from Phase 43-05
protected override firstUpdated(): void {
  if (isServer) return;

  // Existing: keyboard nav
  this.navigationManager = new KeyboardNavigationManager(7);
  requestAnimationFrame(() => this.setupCells());

  // New: gesture handler on the month-grid wrapper
  const grid = this.renderRoot.querySelector('.month-grid') as HTMLElement;
  if (grid) {
    this.gestureHandler = new GestureHandler(grid, (direction) => {
      if (direction === 'left') this.navigateNextMonth();
      else this.navigatePrevMonth();
    });
    this.gestureHandler.attach();
  }

  // New: animation controller on the same wrapper
  if (grid) {
    this.animationController = new AnimationController(grid);
  }
}
```

### Container Query Responsive Layout
```css
/* Source: https://coryrylan.com/blog/css-container-queries-in-web-components */
:host {
  display: block;
  container-type: inline-size;
}

/* Compact: <280px */
@container (max-width: 279px) {
  .calendar {
    --ui-calendar-day-size: 1.75rem;
    --ui-calendar-width: 100%;
  }
  .calendar-header h2 { font-size: 0.75rem; }
  .weekday-header { font-size: 0.625rem; }
}

/* Standard: 280-380px — default values apply */

/* Spacious: >380px */
@container (min-width: 381px) {
  .calendar {
    --ui-calendar-day-size: 3rem;
  }
  .date-button { font-size: 1rem; }
}
```

### Week Number Column in Grid
```typescript
// Week number column: non-interactive, fixed-width label
private renderWeekRow(weekDays: Date[]) {
  const weekNum = getISOWeekNumber(weekDays[0]);
  return html`
    <button
      class="week-number"
      aria-label="Week ${weekNum}, select entire week"
      @click="${() => this.selectWeek(weekDays)}"
    >
      ${weekNum}
    </button>
    ${weekDays.map(day => this.renderDay(day))}
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Touch Events for swipe | Pointer Events API | Broadly supported since ~2020 | Unified mouse/touch/pen handling |
| CSS transitions for animations | Web Animations API | Stable since 2020, full support 2022+ | Imperative control, Promises, cancellation |
| Viewport media queries | CSS Container Queries | Stable in all browsers since Feb 2023 | True component-level responsiveness |
| Manual animation removal for a11y | prefers-reduced-motion media query | Widely supported since 2019 | Standard accessibility pattern |
| Class-based animation toggling | Element.animate() returns Animation object | Web Animations API Level 1 | Cancel, pause, reverse, Promise-based completion |

**Deprecated/outdated:**
- Touch Events API for gesture detection: Still works but Pointer Events are the standard replacement
- ResizeObserver for responsive components: Still useful but container queries are more ergonomic for pure CSS layout adaptation

## Open Questions

1. **renderDay callback type definition (CAL-23)**
   - What we know: Prior decision says renderDay receives `DayCellState` and wrapper retains all ARIA attributes
   - What's unclear: Exact shape of `DayCellState` interface — needs to include date, isToday, isSelected, isDisabled, isOutsideMonth, weekNumber
   - Recommendation: Define interface in calendar.ts, export from index.ts. Use a callback property (not slot) since Lit slots cannot receive data.

2. **DP-01, DP-02, DP-03 (DatePicker input/popup requirements)**
   - What we know: These are date picker requirements (input field + popup trigger)
   - What's unclear: Whether these should be in this phase or a separate DatePicker phase
   - Recommendation: These requirements involve a completely different component (`lui-date-picker`) wrapping `lui-calendar`. Likely should be a separate phase. Include them only if the roadmap specifically assigns them here.

3. **Animation direction when navigating via year/decade views**
   - What we know: Slide direction for next/prev month is straightforward (left/right)
   - What's unclear: What animation to use when jumping from decade view to month view, or when selecting a year
   - Recommendation: Use fade transition (not slide) for view switches (month<->year<->decade), reserve slide for sequential month navigation only.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/calendar/src/calendar.ts` (893 lines) — current component architecture
- Existing codebase: `packages/calendar/src/keyboard-nav.ts` — KeyboardNavigationManager with configurable columns
- Existing codebase: `packages/calendar/src/date-utils.ts` — date-fns wrapper pattern
- MDN Pointer Events API — https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN Element.animate() — https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
- MDN prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

### Secondary (MEDIUM confidence)
- CSS Container Queries in Web Components — https://coryrylan.com/blog/css-container-queries-in-web-components
- Container Queries in Web Components (Max Bock) — https://mxb.dev/blog/container-queries-web-components/
- Pointer Events API for Advanced Gesture Handling — https://dev.to/omriluz1/pointer-events-api-for-advanced-gesture-handling-2nf9

### Tertiary (LOW confidence)
- date-fns v4.1.0 getISOWeek API — could not fetch docs page (JS-rendered), verified function exists via project's existing date-fns usage pattern and prior decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all browser-native APIs + existing date-fns
- Architecture: HIGH — pattern decisions locked in prior phases (43-02 through 43-08), codebase architecture well-understood
- Pitfalls: HIGH — well-documented gotchas (pointercancel, touch-action, animation conflicts, container query setup)
- ISO week utilities: HIGH — date-fns functions confirmed in prior decisions, standard ISO 8601 compliance
- DP-01/02/03 scope: MEDIUM — unclear if date picker input/popup belongs in this phase

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable browser APIs, no fast-moving dependencies)
