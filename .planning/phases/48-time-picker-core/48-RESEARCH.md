# Phase 48: Time Picker Core - Research

**Researched:** 2026-01-31
**Domain:** Time input/selection web component with form integration
**Confidence:** HIGH

## Summary

This phase builds a standalone time picker component (`lui-time-picker`) for the @lit-ui component library. The component needs hour/minute spinbutton inputs, AM/PM toggle, 12/24-hour format switching, a clock face visual interface, a dropdown interface for desktop, time presets, keyboard navigation, and form integration via ElementInternals submitting ISO 8601 time format (`HH:mm:ss`).

The established patterns from the existing calendar, date-picker, and input components provide a strong foundation. The time picker follows the same architecture: extend TailwindElement, use CSS custom properties (`--ui-time-picker-*`) with fallback values, use ElementInternals for form participation with `static formAssociated = true`, and use `isServer` guards for SSR compatibility. For time formatting and timezone display, use the native `Intl.DateTimeFormat` API (consistent with Phase 44-01 decision). For time value manipulation (hours, minutes), use date-fns helper functions (`getHours`, `setHours`, `getMinutes`, `setMinutes`, `parse`, `format`).

**Primary recommendation:** Build the time picker as a new `@lit-ui/time-picker` package following the exact same package structure, build configuration, and component patterns as `@lit-ui/date-picker`, using `role="spinbutton"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` for hour and minute inputs per WAI-ARIA APG, and `Intl.DateTimeFormat` for locale-aware time display.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Web component framework | Project standard, all components use it |
| date-fns | ^4.1.0 | Time parsing/manipulation (parse, format, getHours, setHours, etc.) | Project standard from Phase 42 decision |
| @lit-ui/core | workspace:* | TailwindElement base class, dispatchCustomEvent, isServer | All project components extend this |
| @floating-ui/dom | ^1.7.4 | Dropdown popup positioning | Same dependency as date-picker for popup positioning |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.DateTimeFormat | Native API | Locale-aware time display, timezone labels, 12/24h detection | Display formatting, timezone name display (Phase 44-01 decision) |
| Intl.Locale | Native API | Detect locale default hour cycle (h12/h23) | Determine default 12-hour vs 24-hour format |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns for time parsing | Manual parsing | date-fns handles edge cases; `parse('13:45:00', 'HH:mm:ss', new Date())` works cleanly |
| Intl API for display | date-fns format() | Phase 44-01 decided to use Intl for display formatting, not date-fns |
| Custom clock face | Third-party clock component | No suitable web component exists; custom implementation needed |

**Installation:**
```bash
# No new dependencies needed - all already available in monorepo
# Package will peer-depend on same stack as date-picker
```

## Architecture Patterns

### Recommended Package Structure
```
packages/time-picker/
├── src/
│   ├── index.ts              # Exports, safe registration
│   ├── time-picker.ts        # Main component (input + popup orchestration)
│   ├── time-input.ts         # Hour/minute spinbutton inputs
│   ├── clock-face.ts         # SVG clock face interface
│   ├── time-dropdown.ts      # Dropdown interface for desktop
│   ├── time-utils.ts         # Time parsing, validation, formatting utilities
│   ├── time-presets.ts        # Preset type definitions (Morning, Afternoon, Evening, Now)
│   ├── jsx.d.ts              # JSX type declarations for React/Vue/Svelte
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

### Pattern 1: Spinbutton for Hour/Minute Input
**What:** Use `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for each numeric time field.
**When to use:** For the hour and minute input fields.
**Example:**
```typescript
// Source: WAI-ARIA APG Spinbutton Pattern
// https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
render() {
  return html`
    <div
      role="spinbutton"
      tabindex="0"
      aria-label="Hour"
      aria-valuenow=${this.hour}
      aria-valuemin=${this.is24Hour ? 0 : 1}
      aria-valuemax=${this.is24Hour ? 23 : 12}
      aria-valuetext=${this.getHourDisplayText()}
      @keydown=${this.handleKeydown}
    >
      ${this.formatHourDisplay()}
    </div>
  `;
}

private handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      this.incrementHour();
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.decrementHour();
      break;
    case 'Home':
      e.preventDefault();
      this.hour = this.is24Hour ? 0 : 1;
      break;
    case 'End':
      e.preventDefault();
      this.hour = this.is24Hour ? 23 : 12;
      break;
    case 'PageUp':
      e.preventDefault();
      this.adjustHour(6); // Jump by 6 hours
      break;
    case 'PageDown':
      e.preventDefault();
      this.adjustHour(-6);
      break;
  }
}
```

### Pattern 2: ElementInternals Form Integration (from existing components)
**What:** Use `static formAssociated = true` and `attachInternals()` with `isServer` guard.
**When to use:** For form value submission as ISO 8601 time format.
**Example:**
```typescript
// Source: Existing codebase pattern from lui-input and lui-date-picker
export class TimePicker extends TailwindElement {
  static formAssociated = true;
  private internals: ElementInternals | null = null;

  constructor() {
    super();
    if (!isServer) {
      this.internals = this.attachInternals();
    }
  }

  // Value stored as HH:mm:ss (ISO 8601 time format)
  @property({ type: String, reflect: true })
  value = '';

  private updateFormValue(): void {
    this.internals?.setFormValue(this.value || null);
  }

  formResetCallback(): void {
    this.value = '';
    this.internals?.setFormValue(null);
    this.internals?.setValidity({});
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }
}
```

### Pattern 3: CSS Custom Properties Theming (from calendar/date-picker)
**What:** Use `--ui-time-picker-*` CSS custom properties with fallback values, falling back to `--ui-input-*` tokens.
**When to use:** All visual styling in the time picker.
**Example:**
```css
/* Source: Existing codebase pattern from lui-date-picker */
.time-picker-wrapper {
  border-color: var(--ui-time-picker-border, var(--ui-input-border, #d1d5db));
  background-color: var(--ui-time-picker-bg, var(--ui-input-bg, white));
  border-radius: var(--ui-time-picker-radius, var(--ui-input-radius, 0.375rem));
}

/* Dark mode via :host-context(.dark) */
:host-context(.dark) .time-picker-wrapper {
  border-color: var(--ui-time-picker-border, var(--ui-input-border, #374151));
  background-color: var(--ui-time-picker-bg, var(--ui-input-bg, #111827));
}
```

### Pattern 4: Locale-Aware Time Display with Intl API
**What:** Use `Intl.DateTimeFormat` for display formatting and `Intl.Locale` for detecting default hour cycle.
**When to use:** Displaying formatted time, detecting 12h vs 24h default, timezone labels.
**Example:**
```typescript
// Source: MDN Intl.DateTimeFormat
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

// Detect locale default hour cycle
function getDefaultHourCycle(locale: string): 'h12' | 'h23' {
  try {
    const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
    return resolved.hourCycle === 'h11' || resolved.hourCycle === 'h12' ? 'h12' : 'h23';
  } catch {
    return 'h12'; // fallback
  }
}

// Format time for display
function formatTimeForDisplay(date: Date, locale: string, hour12: boolean): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  }).format(date);
}

// Get timezone label
function getTimeZoneLabel(locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZoneName: 'short',
    ...(timeZone && { timeZone }),
  }).formatToParts(new Date())
    .find(part => part.type === 'timeZoneName')?.value || '';
}
```

### Pattern 5: Clock Face with SVG
**What:** Render a circular clock face using SVG with hour/minute markers as clickable targets.
**When to use:** Visual clock face interface (TP-05, TP-07).
**Example:**
```typescript
// Clock face rendered as SVG within Shadow DOM
private renderClockFace() {
  const radius = 100;
  const center = 120;
  const hourMarkers = this.isShowingHours
    ? this.getHourPositions(radius * 0.75) // Inner ring
    : this.getMinutePositions(radius * 0.85); // Outer ring

  return html`
    <svg viewBox="0 0 240 240" class="clock-face" @click=${this.handleClockClick}>
      <!-- Clock circle -->
      <circle cx="${center}" cy="${center}" r="${radius}" class="clock-circle" />
      <!-- Hour/minute markers -->
      ${hourMarkers.map(marker => html`
        <text
          x="${marker.x}" y="${marker.y}"
          text-anchor="middle" dominant-baseline="central"
          class="clock-marker ${marker.selected ? 'selected' : ''}"
          @click=${() => this.selectClockValue(marker.value)}
        >${marker.label}</text>
      `)}
      <!-- Selection hand -->
      <line
        x1="${center}" y1="${center}"
        x2="${this.handX}" y2="${this.handY}"
        class="clock-hand"
      />
      <circle cx="${center}" cy="${center}" r="3" class="clock-center-dot" />
    </svg>
  `;
}

// Convert angle to position
private getHourPositions(radius: number) {
  const positions = [];
  const count = this.is24Hour ? 24 : 12;
  for (let i = 0; i < count; i++) {
    const angle = ((i * 360) / (this.is24Hour ? 12 : 12) - 90) * (Math.PI / 180);
    const value = this.is24Hour && i >= 12 ? i : (i === 0 ? 12 : i);
    positions.push({
      x: 120 + radius * Math.cos(angle),
      y: 120 + radius * Math.sin(angle),
      value,
      label: String(value),
      selected: value === this.hour,
    });
  }
  return positions;
}
```

### Pattern 6: Dropdown Time Selection (from USWDS pattern)
**What:** A combobox/listbox dropdown with filterable time slots at configurable intervals.
**When to use:** Desktop alternative interface (TP-06).
**Example:**
```typescript
// Dropdown renders a listbox of time options at step intervals
private renderDropdown() {
  const options = this.generateTimeOptions(this.step); // e.g., 30-minute intervals

  return html`
    <div class="time-dropdown" role="listbox" aria-label="Select time">
      ${options.map(opt => html`
        <div
          role="option"
          class="time-option ${opt.value === this.value ? 'selected' : ''}"
          aria-selected=${opt.value === this.value ? 'true' : 'false'}
          @click=${() => this.selectTime(opt.value)}
        >${opt.display}</div>
      `)}
    </div>
  `;
}
```

### Anti-Patterns to Avoid
- **Don't use `<input type="time">`:** Inconsistent browser implementations, poor customization, inaccessible clock face in some browsers. Build custom for consistency.
- **Don't parse time-only strings with `parseISO()`:** date-fns `parseISO` does NOT support time-only ISO strings (returns Invalid Date). Use `parse('13:45:00', 'HH:mm:ss', new Date())` instead.
- **Don't use date-fns `format()` for display text:** Phase 44-01 decided to use `Intl.DateTimeFormat` for display formatting. Use date-fns only for internal value formatting (ISO 8601 strings).
- **Don't store time as Date object internally:** Store as `{ hour: number, minute: number, second: number }` internally and convert to ISO string (`HH:mm:ss`) for form value. Avoids date portion confusion.
- **Don't forget `isServer` guards:** Every `attachInternals()`, `document.addEventListener()`, and DOM query must be guarded, per TailwindElement pattern.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time value parsing | Custom regex parser | `date-fns parse('13:45', 'HH:mm', new Date())` | Handles edge cases, AM/PM parsing |
| ISO 8601 time formatting | Manual string building | `date-fns format(date, 'HH:mm:ss')` | Consistent zero-padding |
| Locale hour cycle detection | Manual locale mapping | `Intl.DateTimeFormat(locale, {hour:'numeric'}).resolvedOptions().hourCycle` | Covers all locales correctly |
| Timezone name display | Manual timezone database | `Intl.DateTimeFormat(locale, {timeZoneName: 'short'})` | Localized, up-to-date |
| Popup positioning | Manual top/left calc | `@floating-ui/dom computePosition` with flip/shift | Handles viewport edges, scrolling |
| Trigonometric clock positions | Manual math helpers | Standard `Math.cos`/`Math.sin` with angle conversion | Simple geometry, no library needed |

**Key insight:** Time-only ISO string parsing is a known gap in date-fns (`parseISO` doesn't support it). Use `parse()` with explicit format patterns instead.

## Common Pitfalls

### Pitfall 1: 12/24-hour Format Boundary Confusion
**What goes wrong:** Hour 0 in 24-hour format maps to 12 AM, hour 12 maps to 12 PM. Off-by-one errors when converting.
**Why it happens:** Inconsistent mental models between 12-hour and 24-hour systems.
**How to avoid:** Store internally as 24-hour (0-23). Convert to 12-hour only for display. Use a single conversion function tested against all boundaries: `{ 0: '12 AM', 1: '1 AM', ..., 12: '12 PM', 13: '1 PM', ..., 23: '11 PM' }`.
**Warning signs:** Hour 0 showing as "0 AM" instead of "12 AM", hour 12 showing as "0 PM" instead of "12 PM".

### Pitfall 2: parseISO Doesn't Support Time-Only Strings
**What goes wrong:** `parseISO('14:30:00')` returns `Invalid Date`.
**Why it happens:** date-fns parseISO only supports date or date-time ISO strings, not time-only.
**How to avoid:** Use `parse('14:30:00', 'HH:mm:ss', new Date())` from date-fns, or manually construct the value string.
**Warning signs:** Invalid Date errors when trying to parse form values.

### Pitfall 3: AM/PM State Lost During Format Toggle
**What goes wrong:** User selects "2:30 PM" (14:30), toggles to 24-hour, toggling back shows "2:30 AM" instead of "2:30 PM".
**Why it happens:** AM/PM state derived from display rather than stored internally.
**How to avoid:** Always store the canonical 24-hour value (0-23). AM/PM is purely a display concern.
**Warning signs:** Time values changing when switching between 12/24 hour modes.

### Pitfall 4: End-Time-After-Start-Time Validation Without Date Context
**What goes wrong:** Validation rejects "23:00 - 01:00" (overnight shift) as invalid.
**Why it happens:** Naive comparison `endTime > startTime` doesn't account for midnight crossing.
**How to avoid:** Document that the validation assumes same-day comparison. Provide an `allow-overnight` attribute or flag for overnight time ranges. Default behavior: end must be after start within the same day.
**Warning signs:** User complaints about overnight time ranges being rejected.

### Pitfall 5: Keyboard Type-Ahead Conflicts with Spinbutton
**What goes wrong:** User tries to type "14" for 2 PM but spinbutton interprets as two separate keystrokes.
**Why it happens:** Spinbutton pattern treats each keypress independently.
**How to avoid:** Implement a type-ahead buffer with a short timeout (~750ms). Accumulate digits: pressing "1" then "4" within the timeout selects hour 14. After timeout, buffer resets.
**Warning signs:** Users unable to type multi-digit hours quickly.

### Pitfall 6: Clock Face Touch Events and Mouse Events Overlap
**What goes wrong:** Touch events fire both touchstart and mousedown, causing double-handling.
**Why it happens:** Mobile browsers fire mouse events after touch events for compatibility.
**How to avoid:** Use `pointer events` API (`pointerdown`, `pointermove`, `pointerup`) which unifies touch and mouse. Alternatively, call `e.preventDefault()` on touch handlers to suppress synthetic mouse events.
**Warning signs:** Time selection "jumping" on mobile, double-fires of change events.

## Code Examples

### Time Value Storage and ISO 8601 Conversion
```typescript
// Source: Codebase pattern + date-fns
// Store time as hours/minutes/seconds internally, convert for form value

interface TimeValue {
  hour: number;   // 0-23 (always 24-hour internally)
  minute: number; // 0-59
  second: number; // 0-59 (default 0)
}

function timeToISO(time: TimeValue): string {
  const h = String(time.hour).padStart(2, '0');
  const m = String(time.minute).padStart(2, '0');
  const s = String(time.second).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function parseTimeISO(value: string): TimeValue | null {
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = match[3] ? parseInt(match[3], 10) : 0;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }
  return { hour, minute, second };
}

function to12Hour(hour24: number): { hour: number; period: 'AM' | 'PM' } {
  if (hour24 === 0) return { hour: 12, period: 'AM' };
  if (hour24 < 12) return { hour: hour24, period: 'AM' };
  if (hour24 === 12) return { hour: 12, period: 'PM' };
  return { hour: hour24 - 12, period: 'PM' };
}

function to24Hour(hour12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}
```

### Time Validation (End After Start)
```typescript
// Source: Phase requirement TP-09
function isEndTimeAfterStart(
  startValue: string,
  endValue: string,
  allowOvernight = false
): boolean {
  const start = parseTimeISO(startValue);
  const end = parseTimeISO(endValue);
  if (!start || !end) return true; // Don't validate if either is empty

  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  if (allowOvernight) {
    return startMinutes !== endMinutes; // Any different time is valid
  }
  return endMinutes > startMinutes;
}
```

### Preset Buttons Pattern
```typescript
// Source: Existing date-picker preset pattern (preset-types.ts)
export interface TimePreset {
  label: string;
  resolve: () => TimeValue;
}

export const DEFAULT_TIME_PRESETS: TimePreset[] = [
  { label: 'Morning', resolve: () => ({ hour: 9, minute: 0, second: 0 }) },
  { label: 'Afternoon', resolve: () => ({ hour: 14, minute: 0, second: 0 }) },
  { label: 'Evening', resolve: () => ({ hour: 18, minute: 0, second: 0 }) },
];

// "Now" button is special — always resolves to current time
export function resolveNow(): TimeValue {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes(), second: 0 };
}
```

### Safe Custom Element Registration
```typescript
// Source: Existing codebase pattern from calendar/index.ts
import { isServer } from 'lit';
import { TimePicker } from './time-picker.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-time-picker')) {
    customElements.define('lui-time-picker', TimePicker);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-time-picker] Custom element already registered.'
    );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<input type="time">` | Custom web component with ARIA spinbutton | Always for component libs | Full control over UX, consistent cross-browser |
| date-fns format() for display | Intl.DateTimeFormat for display | Phase 44-01 decision | Locale-aware without format strings |
| Mouse events for clock face | Pointer Events API | 2020+ (wide support) | Unified touch/mouse handling |
| Manual 12/24h locale detection | `Intl.DateTimeFormat.resolvedOptions().hourCycle` | ES2020+ | Accurate per-locale detection |

**Deprecated/outdated:**
- date-fns v1 `parse()`: Replaced by v2+ `parse(dateString, formatString, referenceDate)`
- W3C APG Date Picker Spin Button example: Deprecated in favor of combobox pattern (but spinbutton role itself is still valid for individual numeric inputs)

## Open Questions

1. **Clock face hour display for 24-hour mode**
   - What we know: 12-hour clock face shows 1-12. For 24-hour, options include: (a) inner/outer ring (0-11 inner, 12-23 outer like Material Design), (b) single ring 0-23 with crowded labels, (c) keep 1-12 ring but interpret based on AM/PM context
   - What's unclear: Which approach the project prefers
   - Recommendation: Use inner/outer ring pattern (Material Design approach) as it's the most established UX pattern for 24-hour clock faces. Inner ring for 13-23/0, outer ring for 1-12.

2. **Seconds input granularity**
   - What we know: ISO 8601 time format is `HH:mm:ss`. The requirements mention hour and minute inputs but don't mention a seconds input UI element.
   - What's unclear: Whether seconds should be user-editable or always default to `00`
   - Recommendation: Default seconds to `00`. The form value always includes `:00` suffix for full ISO 8601 compliance. Could add optional `show-seconds` attribute later.

3. **Step interval for dropdown**
   - What we know: USWDS uses 30-minute default step. Requirements just say "dropdown interface."
   - What's unclear: What default step interval to use
   - Recommendation: Default to 30-minute intervals with a configurable `step` attribute (in minutes). Minimum step: 1 minute.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/input/src/input.ts` - ElementInternals form integration pattern
- Existing codebase: `packages/date-picker/src/date-picker.ts` - Popup, presets, validation pattern
- Existing codebase: `packages/calendar/src/calendar.ts` - Keyboard nav, CSS custom properties, dark mode pattern
- Existing codebase: `packages/calendar/src/date-utils.ts` - date-fns utility wrapper pattern
- [WAI-ARIA APG Spinbutton Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) - Keyboard interaction, ARIA roles/attributes
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) - hourCycle, timeZoneName, hour12 options

### Secondary (MEDIUM confidence)
- [USWDS Time Picker](https://designsystem.digital.gov/components/time-picker/) - Dropdown time picker pattern, accessibility testing guidance
- [date-fns parseISO issue #2160](https://github.com/date-fns/date-fns/issues/2160) - Confirmed parseISO doesn't support time-only strings
- [MUI X Date/Time Picker Accessibility](https://mui.com/x/react-date-pickers/accessibility/) - WCAG 2.1 AA conformance approach

### Tertiary (LOW confidence)
- [Time Picker UX Best Practices 2025](https://www.eleken.co/blog-posts/time-picker-ux) - UX patterns and trends
- [clock-timepicker web component](https://www.cssscript.com/material-clock-time-picker/) - Material clock face implementation reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use in the project; no new dependencies needed
- Architecture: HIGH - Follows established patterns from existing date-picker and calendar components
- Pitfalls: HIGH - Core pitfalls (12/24h conversion, parseISO limitation) verified with official sources
- Clock face implementation: MEDIUM - Pattern is well-established (Material Design) but specific SVG implementation is custom

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable domain, well-established patterns)
