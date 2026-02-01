# Phase 47: Date Range Picker Advanced - Research

**Researched:** 2026-01-31
**Domain:** Range Presets / Drag Selection / Duration Display / Comparison Mode / Dark Mode / SSR
**Confidence:** HIGH

## Summary

Phase 47 adds advanced features to the existing `lui-date-range-picker` component built in Phase 46: range preset buttons (DRP-16, DRP-17), mouse drag selection (DRP-18), range duration display (DRP-19), comparison mode for two date ranges (DRP-20), dark mode completeness (DRP-21), and SSR compatibility (DRP-22).

The date-range-picker already has a solid foundation: two-click state machine, dual-calendar layout with `renderRangeDay` callback, inline styles for Shadow DOM range highlighting, form integration via ElementInternals with ISO 8601 interval submission, popup management with Floating UI, and complete dark mode styles via `:host-context(.dark)`. The existing `date-picker` (Phase 45) already implements a presets system with `DatePreset` interface and `DEFAULT_PRESETS` in `preset-types.ts` that can be directly reused and adapted for range presets.

The most significant new feature is **comparison mode** (DRP-20), which requires managing two independent date ranges simultaneously. This needs a clear state model: a `comparison` boolean property, a second range (`compareStartDate`/`compareEndDate`), a `selectionTarget` state to track which range is being selected, and distinct visual styles (different colors) for each range. The drag selection (DRP-18) builds on the existing `mouseenter` hover preview by adding `mousedown`/`mouseup` tracking to convert pointer gestures into range selection, reusing the existing two-click state machine transitions.

**Primary recommendation:** Reuse the `DatePreset` interface from `@lit-ui/date-picker` for range presets (adapting `resolve()` to return `{ start: Date, end: Date }`), implement drag selection via pointer events on the existing `renderRangeDay` spans, add a duration display in the popup footer, and implement comparison mode as an opt-in property with a second range pair and distinct CSS custom properties.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lit` | ^3.3.2 | Web component framework | Project standard |
| `@lit-ui/core` | workspace:* | TailwindElement, dispatchCustomEvent, tailwindBaseStyles | Project standard base class |
| `@lit-ui/calendar` | workspace:* | Calendar grid component (Phase 42) | Already composed in date-range-picker |
| `date-fns` | ^4.1.0 | Date arithmetic (subDays, startOfMonth, endOfMonth, differenceInCalendarDays) | Already a dependency; tree-shakeable |
| `@floating-ui/dom` | ^1.7.4 | Popup positioning | Already a dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Intl.DateTimeFormat` | Native | Duration display localization | For "X days selected" text |
| `date-fns/differenceInCalendarDays` | ^4.1.0 | Computing range duration in days | Already used in `range-utils.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pointer Events for drag | Mouse Events | Pointer Events are the modern standard, work on touch+mouse; Mouse Events lack touch support |
| Second range pair for comparison | Array of ranges | Pair is simpler for the "compare A vs B" use case; array is overkill for 2 ranges |
| Inline styles for comparison colors | CSS custom properties only | Inline styles already used for range highlighting (Shadow DOM boundary); custom properties cascade through for theming |

**Installation:**
```bash
# No new dependencies needed - all required libraries are already installed
```

## Architecture Patterns

### Recommended File Structure
```
packages/date-range-picker/src/
├── index.ts                  # Updated: export new types + preset utilities
├── date-range-picker.ts      # Updated: presets, drag, duration, comparison mode
├── range-utils.ts            # Updated: new utility functions (computeDuration, comparison helpers)
├── range-utils.test.ts       # Updated: tests for new utilities
├── range-preset-types.ts     # NEW: DateRangePreset interface + DEFAULT_RANGE_PRESETS
├── jsx.d.ts                  # Updated: new attributes (presets, comparison, compare-start-date, etc.)
└── vite-env.d.ts
```

### Pattern 1: Range Presets (Adapted from Date Picker Presets)
**What:** Reuse the preset pattern from `@lit-ui/date-picker`'s `preset-types.ts`, adapted for ranges.
**When to use:** For DRP-16, DRP-17 (preset buttons for Last 7 Days, Last 30 Days, This Month).
**Example:**
```typescript
// Source: packages/date-picker/src/preset-types.ts (adapted for ranges)
import { subDays, startOfDay, startOfMonth, endOfMonth } from 'date-fns';

export interface DateRangePreset {
  label: string;
  resolve: () => { start: Date; end: Date };
}

export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Last 7 Days',
    resolve: () => ({
      start: subDays(startOfDay(new Date()), 6),
      end: startOfDay(new Date()),
    }),
  },
  {
    label: 'Last 30 Days',
    resolve: () => ({
      start: subDays(startOfDay(new Date()), 29),
      end: startOfDay(new Date()),
    }),
  },
  {
    label: 'This Month',
    resolve: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
];

// Property on DateRangePicker:
@property({ attribute: false })
presets: DateRangePreset[] | boolean = false;

private get effectivePresets(): DateRangePreset[] {
  if (this.presets === true) return DEFAULT_RANGE_PRESETS;
  if (Array.isArray(this.presets)) return this.presets;
  return [];
}
```

### Pattern 2: Mouse Drag Selection via Pointer Events
**What:** Use pointer events on day cells to create ranges by dragging from start to end.
**When to use:** For DRP-18 (mouse drag selection).
**Example:**
```typescript
// Drag selection reuses the existing two-click state machine transitions.
// On pointerdown: start selection (same as first click).
// On pointerup on a different cell: complete selection (same as second click).
// The existing mouseenter hover preview already shows the range visually.

@state()
private isDragging = false;

// In renderRangeDay, add pointer events to the span:
@pointerdown="${(e: PointerEvent) => {
  e.preventDefault(); // Prevent text selection during drag
  this.isDragging = true;
  this.handleDragStart(dateStr);
}}"
@pointerup="${() => {
  if (this.isDragging) {
    this.isDragging = false;
    this.handleDragEnd(dateStr);
  }
}}"

private handleDragStart(isoString: string): void {
  // Enter start-selected state (same as first click)
  this.startDate = isoString;
  this.endDate = '';
  this.internalError = '';
  this.rangeState = 'start-selected';
}

private handleDragEnd(isoString: string): void {
  if (this.rangeState === 'start-selected' && isoString !== this.startDate) {
    // Complete range (same as second click)
    const [normalizedStart, normalizedEnd] = normalizeRange(this.startDate, isoString);
    this.startDate = normalizedStart;
    this.endDate = normalizedEnd;
    this.hoveredDate = '';
    this.rangeState = 'complete';
    this.validateAndEmit();
  }
}
```

### Pattern 3: Duration Display in Footer
**What:** Show "X days selected" in the popup footer when a range is complete.
**When to use:** For DRP-19 (range duration display).
**Example:**
```typescript
// Source: packages/date-range-picker/src/range-utils.ts (differenceInCalendarDays already used)
import { differenceInCalendarDays } from 'date-fns';

export function computeRangeDuration(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = startOfDay(parseISO(startISO));
  const end = startOfDay(parseISO(endISO));
  return differenceInCalendarDays(end, start) + 1; // inclusive
}

// In the component:
get durationText(): string {
  if (this.rangeState !== 'complete' || !this.startDate || !this.endDate) return '';
  const days = computeRangeDuration(this.startDate, this.endDate);
  return `${days} day${days === 1 ? '' : 's'} selected`;
}

// Render in footer:
<span class="footer-status">
  ${this.durationText || this.selectionStatus}
</span>
```

### Pattern 4: Comparison Mode
**What:** Support two independent date ranges for comparison (e.g., "this month vs last month").
**When to use:** For DRP-20 (comparison mode).
**Example:**
```typescript
// New properties for comparison mode:
@property({ type: Boolean, reflect: true })
comparison = false;

@property({ type: String, reflect: true, attribute: 'compare-start-date' })
compareStartDate = '';

@property({ type: String, reflect: true, attribute: 'compare-end-date' })
compareEndDate = '';

// Internal state tracks which range is being selected:
@state()
private selectionTarget: 'primary' | 'comparison' = 'primary';

// The renderRangeDay callback checks both ranges:
renderRangeDay = (state: DayCellState): unknown => {
  const dateStr = state.formattedDate;
  // Primary range styling (existing blue)
  const isPrimaryStart = dateStr === this.startDate;
  const isPrimaryEnd = dateStr === this.endDate;
  const inPrimaryRange = isDateInRange(dateStr, this.startDate, this.endDate);

  // Comparison range styling (different color, e.g., orange/amber)
  const isCompareStart = this.comparison && dateStr === this.compareStartDate;
  const isCompareEnd = this.comparison && dateStr === this.compareEndDate;
  const inCompareRange = this.comparison && isDateInRange(dateStr, this.compareStartDate, this.compareEndDate);

  // Use --ui-range-compare-* CSS custom properties for comparison range
  // ...build styles based on which range the date belongs to
};

// Toggle buttons in the popup header to switch between primary/comparison:
<div class="comparison-toggle">
  <button class="${this.selectionTarget === 'primary' ? 'active' : ''}"
          @click="${() => this.selectionTarget = 'primary'}">
    Primary Range
  </button>
  <button class="${this.selectionTarget === 'comparison' ? 'active' : ''}"
          @click="${() => this.selectionTarget = 'comparison'}">
    Comparison Range
  </button>
</div>
```

### Pattern 5: Preset Buttons Layout in Popup
**What:** Render preset buttons in a sidebar or horizontal strip within the popup, alongside the dual calendars.
**When to use:** For DRP-16, DRP-17 (preset buttons placement).
**Example:**
```typescript
// Preset buttons render as a vertical sidebar to the left of the calendars
// (common pattern in analytics date pickers like Google Analytics, Datadog).
// At narrow widths (container query), stack vertically above calendars.

renderCalendarContent() {
  return html`
    <div class="range-header">...</div>
    <div class="popup-body">
      ${this.effectivePresets.length > 0
        ? html`
          <div class="preset-sidebar">
            ${this.effectivePresets.map(preset => html`
              <button class="preset-button"
                      @click="${() => this.handlePresetSelect(preset)}">
                ${preset.label}
              </button>
            `)}
          </div>
        ` : nothing}
      <div class="calendars-wrapper" @mouseleave="${this.clearHoverPreview}">
        ...calendars...
      </div>
    </div>
    <div class="popup-footer">
      <span class="footer-status">${this.durationText || this.selectionStatus}</span>
      ...
    </div>
  `;
}
```

### Anti-Patterns to Avoid
- **Separate component for comparison mode:** Comparison mode should be a property on the existing date-range-picker, not a separate `lui-date-range-comparison-picker` component. The rendering logic is 90% shared.
- **Using `mousemove` for drag tracking:** The existing `mouseenter` on day cells already provides hover preview. Adding `mousemove` on the calendars-wrapper is redundant and wasteful. Use `pointerdown`/`pointerup` on day cells only.
- **Duplicating the state machine for comparison:** Reuse the same `handleDateClick` logic with a `selectionTarget` switch. Both ranges follow the same idle -> start-selected -> complete flow.
- **Global pointer event listeners for drag:** Attach pointer events to the day cells directly, not to `document`. The calendars-wrapper `mouseleave` already handles leaving the calendar area.
- **Rendering presets outside the popup:** Presets should be inside the popup (or always visible in inline mode). External preset buttons break the component's encapsulation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Day count between dates | Manual date subtraction | `differenceInCalendarDays` from date-fns | DST transitions, leap seconds, timezone edge cases |
| Start/end of month | Manual Date constructors | `startOfMonth`/`endOfMonth` from date-fns | Month boundary edge cases (Feb 28/29, etc.) |
| Relative date computation for presets | `new Date(Date.now() - 7 * 86400000)` | `subDays(startOfDay(new Date()), 6)` | DST transitions cause 23/25 hour days |
| Range normalization | Manual if/swap | Existing `normalizeRange()` in range-utils.ts | Already tested and handles edge cases |
| Popup positioning | CSS absolute/fixed | Existing `@floating-ui/dom` setup | Already handles viewport boundaries, flip, shift |

**Key insight:** The existing `range-utils.ts` already has `isDateInRange`, `isDateInPreview`, `normalizeRange`, and `validateRangeDuration`. Extend it with `computeRangeDuration` rather than duplicating date arithmetic in the component.

## Common Pitfalls

### Pitfall 1: Drag Selection Interferes with Text Selection
**What goes wrong:** Dragging across day cells selects text instead of creating a range.
**Why it happens:** Default browser behavior on mousedown starts text selection.
**How to avoid:** Call `e.preventDefault()` on the `pointerdown` event of day cells. Also set `user-select: none` on the calendars-wrapper during drag. Reset on `pointerup`.
**Warning signs:** Blue text selection highlight appears during drag instead of range preview.

### Pitfall 2: Drag Selection Doesn't Complete When Mouse Released Outside Calendar
**What goes wrong:** User starts drag on a day, drags outside the calendar, releases mouse -- range selection gets stuck in `start-selected` state.
**Why it happens:** `pointerup` on the day cell never fires because the mouse is outside.
**How to avoid:** Listen for `pointerup` on the popup container (or use `setPointerCapture`) to catch releases outside day cells. On release outside, either cancel the drag (stay in start-selected for click-to-complete) or complete the range to the last hovered date.
**Warning signs:** Manual testing with drag-and-release outside calendar area.

### Pitfall 3: Comparison Range Colors Clash with Primary Range
**What goes wrong:** When both ranges overlap days, it's unclear which range a day belongs to.
**Why it happens:** Both ranges apply background colors to the same cells.
**How to avoid:** Use distinct color sets: primary = blue (`--ui-range-selected-bg`), comparison = amber/orange (`--ui-range-compare-bg`). For overlapping days, use a striped/gradient pattern or a third "overlap" color. Document the visual precedence: primary range takes precedence, comparison shows as underlay.
**Warning signs:** Overlapping range days show indeterminate color.

### Pitfall 4: Preset Resolvers Evaluate at Wrong Time During SSR
**What goes wrong:** Preset `resolve()` functions call `new Date()` during server-side rendering, producing server-time dates.
**Why it happens:** Presets render buttons with labels only; `resolve()` is only called on click, which only happens on the client.
**How to avoid:** The pattern is already correct -- `resolve()` is a function called on click, not at render time. Ensure preset buttons never call `resolve()` during rendering (e.g., don't pre-compute resolved dates for display in the template unless needed for disabled-state checking).
**Warning signs:** Preset labels show correctly but clicking produces wrong dates.

### Pitfall 5: Duration Display Shows Wrong Count
**What goes wrong:** "6 days selected" when the user expects 7 (Jan 1 to Jan 7).
**Why it happens:** Using `differenceInCalendarDays` without adding 1 for inclusive counting.
**How to avoid:** The existing `validateRangeDuration` already uses `differenceInCalendarDays(end, start) + 1` for inclusive counting. Follow the same pattern in `computeRangeDuration`.
**Warning signs:** Off-by-one in displayed day count.

### Pitfall 6: Comparison Mode Form Submission Missing Second Range
**What goes wrong:** Form submission only includes the primary range interval, losing the comparison range.
**Why it happens:** `setFormValue` only stores a single string value.
**How to avoid:** When comparison mode is active, submit a structured value. Options: (a) submit two form values using `FormData` entries, (b) use a JSON string, or (c) use a custom format like `2026-01-01/2026-01-31|2025-12-01/2025-12-31`. Recommend option (c) for simplicity -- pipe-delimited ISO intervals.
**Warning signs:** Form data only contains one range when comparison mode is active.

### Pitfall 7: Dark Mode Missing for New Comparison Toggle and Preset Sidebar
**What goes wrong:** Comparison toggle buttons and preset sidebar render with light theme colors in dark mode.
**Why it happens:** New CSS classes added without corresponding `:host-context(.dark)` overrides.
**How to avoid:** For every new CSS rule, add a corresponding `:host-context(.dark)` override. The existing component already has ~20 dark mode rules as a reference.
**Warning signs:** Visual inconsistency when toggling dark mode with new UI elements.

## Code Examples

### Complete Range Preset Handling
```typescript
// Source: Adapted from packages/date-picker/src/date-picker.ts handlePresetSelect
import { format } from 'date-fns';

private handlePresetSelect(preset: DateRangePreset): void {
  const { start, end } = preset.resolve();
  const startISO = format(start, 'yyyy-MM-dd');
  const endISO = format(end, 'yyyy-MM-dd');

  // Set the target range (primary or comparison)
  if (this.comparison && this.selectionTarget === 'comparison') {
    this.compareStartDate = startISO;
    this.compareEndDate = endISO;
  } else {
    this.startDate = startISO;
    this.endDate = endISO;
    this.rangeState = 'complete';
  }

  this.validateAndEmit();
}
```

### Duration Display Utility Function
```typescript
// Source: Extends packages/date-range-picker/src/range-utils.ts
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

export function computeRangeDuration(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = startOfDay(parseISO(startISO));
  const end = startOfDay(parseISO(endISO));
  return differenceInCalendarDays(end, start) + 1; // inclusive
}
```

### Comparison Mode Event Payload
```typescript
// Extended change event payload for comparison mode:
dispatchCustomEvent(this, 'change', {
  startDate: this.startDate,
  endDate: this.endDate,
  isoInterval: formatISOInterval(this.startDate, this.endDate),
  // Comparison fields only present when comparison mode is active:
  ...(this.comparison ? {
    compareStartDate: this.compareStartDate,
    compareEndDate: this.compareEndDate,
    compareIsoInterval: formatISOInterval(this.compareStartDate, this.compareEndDate),
  } : {}),
});
```

### CSS Custom Properties for Comparison Range
```css
/* Primary range (existing) */
--ui-range-selected-bg: var(--color-primary, #3b82f6);
--ui-range-selected-text: white;
--ui-range-highlight-bg: #dbeafe;
--ui-range-preview-bg: #eff6ff;

/* Comparison range (new) */
--ui-range-compare-bg: var(--color-warning, #f59e0b);
--ui-range-compare-text: white;
--ui-range-compare-highlight-bg: #fef3c7;
--ui-range-compare-preview-bg: #fffbeb;

/* Dark mode comparison */
:host-context(.dark) {
  --ui-range-compare-highlight-bg: #78350f;
  --ui-range-compare-preview-bg: #451a03;
}
```

### Preset Sidebar CSS
```css
.preset-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border-right: 1px solid var(--ui-date-picker-popup-border, #e5e7eb);
  min-width: 120px;
}

.popup-body {
  display: flex;
}

/* Dark mode preset sidebar */
:host-context(.dark) .preset-sidebar {
  border-right-color: var(--ui-date-picker-popup-border, #374151);
}

/* Container query: stack presets above calendars on narrow containers */
@container (max-width: 599px) {
  .popup-body {
    flex-direction: column;
  }
  .preset-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    border-right: none;
    border-bottom: 1px solid var(--ui-date-picker-popup-border, #e5e7eb);
  }
}
```

### SSR Guard Pattern (Existing, Apply to New Features)
```typescript
// Source: packages/date-range-picker/src/date-range-picker.ts
// All new features should follow this existing pattern:

constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}

override connectedCallback(): void {
  super.connectedCallback();
  if (!isServer) {
    document.addEventListener('click', this.handleDocumentClick);
  }
}

// Drag selection pointer events are on day cells in the template,
// so they naturally don't fire during SSR (no user interaction on server).
// No additional isServer guards needed for drag.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate preset panel component | Inline preset sidebar in popup | Common pattern (Google Analytics, Datadog) | Single component, simpler API |
| Full drag tracking with pointermove | Pointerdown + existing mouseenter hover + pointerup | Modern Pointer Events API | Simpler code, reuses existing hover preview |
| Duration computed in template | Pure function in range-utils.ts | Architecture pattern from Phase 46 | Testable, reusable |
| Separate comparison picker | Boolean `comparison` property | Analytics tools (Mixpanel, GA4) | Single component serves both modes |

**Deprecated/outdated:**
- Mouse Events for drag: Use Pointer Events (`pointerdown`/`pointerup`) instead of `mousedown`/`mouseup` for unified touch+mouse support.

## Open Questions

1. **Form submission format for comparison mode**
   - What we know: Primary range submits as ISO 8601 interval (YYYY-MM-DD/YYYY-MM-DD). Comparison mode needs to include two ranges.
   - What's unclear: Best format for dual-range form submission. Options: pipe-delimited intervals, JSON, or two separate form values.
   - Recommendation: Use pipe-delimited format: `2026-01-01/2026-01-31|2025-12-01/2025-12-31`. Simple to parse, maintains ISO 8601 for each individual range. Document this in the API docs.

2. **Preset button disabled state for range presets**
   - What we know: The date-picker checks if a preset's resolved date falls outside min/max constraints. Range presets resolve to two dates.
   - What's unclear: Should a preset be disabled if ANY part of the range falls outside min/max, or only if the entire range is outside?
   - Recommendation: Disable the preset if the resolved start date is before min-date OR the resolved end date is after max-date. This matches user expectation that clicking a preset always produces a fully valid range.

3. **Comparison mode UI: toggle in header vs footer vs separate section**
   - What we know: The popup already has a header (navigation) and footer (status + clear). Comparison toggle needs to be accessible.
   - What's unclear: Best placement for the comparison toggle (primary/comparison selector).
   - Recommendation: Place a segmented button in the popup header area, between the navigation header and the calendars/presets. This is above the fold and immediately visible. Use distinct colors (blue indicator for primary, amber for comparison) matching the range highlight colors.

## Sources

### Primary (HIGH confidence)
- `packages/date-range-picker/src/date-range-picker.ts` - Current component: 1298 lines with full state machine, popup, dark mode, form integration
- `packages/date-range-picker/src/range-utils.ts` - Pure utility functions: isDateInRange, isDateInPreview, normalizeRange, validateRangeDuration, formatISOInterval
- `packages/date-range-picker/src/range-utils.test.ts` - 164 lines of tests, vitest patterns
- `packages/date-picker/src/preset-types.ts` - `DatePreset` interface and `DEFAULT_PRESETS` pattern
- `packages/date-picker/src/date-picker.ts` - Presets implementation: `effectivePresets`, `handlePresetSelect`, `isPresetDisabled`, `renderPresets`
- `packages/calendar/src/calendar.ts` - Calendar component: renderDay callback, DayCellState interface, date-button-wrapper pattern
- `packages/calendar/src/gesture-handler.ts` - GestureHandler class: Pointer Events pattern with pointerdown/pointerup
- `packages/core/src/tailwind-element.ts` - TailwindElement SSR pattern, isServer guards, constructable stylesheets

### Secondary (MEDIUM confidence)
- Phase 45 research (`45-RESEARCH.md`) - Presets architecture patterns, dark mode pitfalls, SSR patterns
- Prior decision (Phase 45-02): `presets` property accepts `boolean | DatePreset[]` -- `true` uses DEFAULT_PRESETS, array for custom
- Prior decision (Phase 46-02): Inline styles for renderDay output (Shadow DOM CSS boundary)
- Prior decision (Phase 46-02): CSS custom properties (`--ui-range-*`) for range theming

### Tertiary (LOW confidence)
- Comparison mode patterns observed in analytics tools (Google Analytics, Datadog, Mixpanel) -- not directly verified from documentation, based on general knowledge of these UIs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; all tools already in the project
- Range presets: HIGH - Direct adaptation of existing date-picker preset pattern
- Drag selection: HIGH - Pointer Events API well understood; existing hover preview provides visual feedback
- Duration display: HIGH - Simple computation using existing date-fns functions
- Comparison mode: MEDIUM - Novel feature for this codebase; architecture patterns based on common analytics UI patterns
- Dark mode: HIGH - Extensive existing dark mode rules provide clear pattern to follow
- SSR: HIGH - Existing isServer guards; no new browser-only APIs needed beyond existing patterns

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable domain, no new dependencies)
