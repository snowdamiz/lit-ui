# Phase 45: Date Picker Advanced - Research

**Researched:** 2026-01-31
**Domain:** Natural Language Date Parsing / Preset Buttons / Inline Mode / Custom Formatting / Tooltips / Dark Mode / SSR
**Confidence:** HIGH

## Summary

Phase 45 adds advanced features to the existing `lui-date-picker` component: natural language input parsing (DP-20), quick preset buttons (DP-21, DP-22), inline always-visible mode (DP-23), custom date format via `Intl.DateTimeFormat` options (DP-24), min/max constraint tooltips (DP-25), dark mode completeness (DP-26), and SSR with Declarative Shadow DOM (DP-27).

The most impactful architectural decision is **not** pulling in chrono-node (~150KB minified) for natural language parsing. The requirements only call for parsing "tomorrow", "next week", and "today" -- a finite set of phrases that can be handled with a lightweight dictionary-based parser using date-fns functions already in the project (`addDays`, `addWeeks`, `startOfWeek`). This keeps bundle size near zero for this feature.

Inline mode follows the established pattern from PrimeNG, Flatpickr, and other calendar components: a boolean `inline` property that renders `lui-calendar` directly without the popup/input wrapper. The custom format prop passes `Intl.DateTimeFormat` options through to the display formatter, replacing the hardcoded `{ year: 'numeric', month: 'long', day: 'numeric' }`. Tooltips for min/max constraints use CSS-only positioned elements with `title` attribute fallback for accessibility.

**Primary recommendation:** Extend the existing `date-input-parser.ts` with a natural language phrase map, add new properties (`inline`, `format`, `presets`) to the DatePicker class, and implement tooltips as CSS-positioned pseudo-elements or lightweight DOM elements within the component's Shadow DOM.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `lit` | ^3.3.2 | Web component framework | Project standard |
| `@lit-ui/core` | workspace:* | TailwindElement, dispatchCustomEvent, tailwindBaseStyles | Project standard base class |
| `@lit-ui/calendar` | workspace:* | Calendar grid component (Phase 42) | Already built, reused in inline mode |
| `date-fns` | ^4.1.0 | Date manipulation (addDays, addWeeks, startOfWeek, nextMonday) | Already a dependency; tree-shakeable |
| `@floating-ui/dom` | ^1.7.4 | Popup positioning (popup mode only) | Already a dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Intl.DateTimeFormat` | Native | Custom date format display | Always for format prop; zero bundle cost |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled NL parser | `chrono-node` (~150KB min) | Overkill for 3 phrases; adds significant bundle weight for minimal value |
| Hand-rolled NL parser | `simple-date-parse` (1.27KB) | Only handles relative offsets like "+1 day", not "tomorrow"/"next week" strings |
| CSS tooltip | Floating UI tooltip | Already have Floating UI, but CSS-only is simpler for static constraint text |
| `title` attribute tooltip | Custom tooltip element | `title` attribute has cross-browser issues in Shadow DOM (Firefox bug); custom element is more reliable |

**Installation:**
```bash
# No new dependencies needed - all required libraries are already installed
```

## Architecture Patterns

### Recommended File Structure
```
packages/date-picker/src/
├── index.ts                # Updated exports
├── date-picker.ts          # Updated: inline mode, format prop, presets, tooltips
├── date-input-parser.ts    # Updated: natural language phrase parsing
├── natural-language.ts     # NEW: NL phrase dictionary and resolver
├── preset-types.ts         # NEW: Preset button type definitions
├── jsx.d.ts                # Updated: new attributes
└── vite-env.d.ts
```

### Pattern 1: Dictionary-Based Natural Language Parser
**What:** Map a finite set of natural language phrases to date-fns functions. No regex parsing engine needed.
**When to use:** For DP-20 (natural language parsing of "today", "tomorrow", "next week").
**Example:**
```typescript
// Source: date-fns addDays, addWeeks, startOfWeek functions
import { addDays, addWeeks, startOfWeek } from 'date-fns';

type NLResolver = () => Date;

const NL_PHRASES: Record<string, NLResolver> = {
  'today': () => startOfDay(new Date()),
  'tomorrow': () => addDays(startOfDay(new Date()), 1),
  'yesterday': () => addDays(startOfDay(new Date()), -1),
  'next week': () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
  'next monday': () => nextMonday(new Date()),
  'last week': () => startOfWeek(addWeeks(new Date(), -1), { weekStartsOn: 1 }),
};

export function parseNaturalLanguage(input: string): Date | null {
  const normalized = input.trim().toLowerCase();
  const resolver = NL_PHRASES[normalized];
  return resolver ? resolver() : null;
}
```

### Pattern 2: Inline Mode (Boolean Property)
**What:** When `inline` is true, render the calendar directly without popup, input field, or Floating UI.
**When to use:** For DP-23 (always-visible calendar).
**Example:**
```typescript
// Source: PrimeNG Calendar inline pattern, Flatpickr inline option
@property({ type: Boolean, reflect: true })
inline = false;

override render() {
  if (this.inline) {
    return this.renderInlineCalendar();
  }
  return this.renderPopupMode(); // existing render logic
}

private renderInlineCalendar() {
  return html`
    <div class="date-picker-wrapper">
      ${this.label ? html`<label class="date-picker-label">${this.label}</label>` : nothing}
      <lui-calendar
        .value=${this.value}
        .locale=${this.effectiveLocale}
        min-date=${this.minDate || nothing}
        max-date=${this.maxDate || nothing}
        @change=${this.handleCalendarSelect}
      ></lui-calendar>
    </div>
  `;
}
```

### Pattern 3: Custom Format via Intl.DateTimeFormat Options
**What:** Accept `Intl.DateTimeFormatOptions` as a property to customize date display formatting.
**When to use:** For DP-24 (custom format prop).
**Example:**
```typescript
// Source: MDN Intl.DateTimeFormat constructor options
@property({ attribute: false })
format: Intl.DateTimeFormatOptions | null = null;

private get displayFormatOptions(): Intl.DateTimeFormatOptions {
  return this.format ?? { year: 'numeric', month: 'long', day: 'numeric' };
}

// Updated formatDateForDisplay in date-input-parser.ts:
export function formatDateForDisplay(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const effectiveOptions = options ?? { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat(locale, effectiveOptions).format(date);
}
```

### Pattern 4: Preset Buttons
**What:** Render quick-select buttons above or below the calendar for common dates.
**When to use:** For DP-21, DP-22 (Today, Tomorrow, Next Week presets).
**Example:**
```typescript
// Source: Common date picker pattern (e.g., Shadcn DatePicker, react-day-picker)
interface DatePreset {
  label: string;
  resolve: () => Date;
}

const DEFAULT_PRESETS: DatePreset[] = [
  { label: 'Today', resolve: () => startOfDay(new Date()) },
  { label: 'Tomorrow', resolve: () => addDays(startOfDay(new Date()), 1) },
  { label: 'Next Week', resolve: () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }) },
];

@property({ attribute: false })
presets: DatePreset[] | boolean = false;

private get effectivePresets(): DatePreset[] {
  if (this.presets === true) return DEFAULT_PRESETS;
  if (Array.isArray(this.presets)) return this.presets;
  return [];
}
```

### Pattern 5: Min/Max Constraint Tooltips
**What:** Show a tooltip on disabled dates explaining why they are disabled (before min date, after max date).
**When to use:** For DP-25 (min/max date tooltips).
**Example:**
```typescript
// The calendar already computes DateDisabledResult with a `reason` field.
// Tooltip approach: use a CSS-positioned element that appears on hover.
// The `title` attribute does NOT work reliably inside Shadow DOM (Firefox bug).

// In calendar day cell rendering, add a tooltip data attribute:
<button
  class="date-button ${isDisabled ? 'disabled-with-reason' : ''}"
  aria-label="${label}"
  aria-disabled="${isDisabled}"
  data-tooltip="${constraint.reason || nothing}"
>
  ${day.getDate()}
</button>

// CSS for tooltip:
.date-button[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.5rem;
  background: var(--ui-tooltip-bg, #1f2937);
  color: var(--ui-tooltip-text, white);
  font-size: 0.75rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}
```

### Anti-Patterns to Avoid
- **Adding chrono-node for 3 phrases:** The requirements specify "tomorrow", "next week", "today" -- a dictionary lookup with date-fns is far cheaper than a full NLP parsing library.
- **Using `title` attribute for tooltips in Shadow DOM:** Firefox has a known bug where `title` tooltips don't appear inside Shadow DOM content. Use CSS `::after` pseudo-elements or a custom tooltip span instead.
- **Making inline mode share popup code paths:** Inline mode should skip all popup-related logic (Floating UI, click-outside, focus trap, Escape key). Use conditional rendering early in `render()`.
- **Hardcoding preset labels:** Presets should be configurable. Use a `presets` property that accepts an array of `{ label, resolve }` objects, with a default set when `presets=true`.
- **Breaking the existing `formatDateForDisplay` signature:** Add the `options` parameter as an optional third argument to maintain backward compatibility.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date arithmetic for "tomorrow", "next week" | Manual Date math with `setDate()` | date-fns `addDays`, `addWeeks`, `startOfWeek` | DST transitions, month boundaries, leap years |
| Locale-aware date formatting | Format string templates | `Intl.DateTimeFormat` with options object | Zero bundle cost, always correct locale data |
| Calendar grid rendering | New calendar for inline mode | Existing `lui-calendar` component | Already built with full a11y, keyboard nav, gestures |
| Popup positioning (popup mode) | Custom CSS positioning | `@floating-ui/dom` | Already in use; handles viewport edge cases |

**Key insight:** The natural language parser and preset buttons share the same underlying logic (mapping phrases to date-fns operations). Extract a shared `resolveDate` function that both the NL parser and presets use.

## Common Pitfalls

### Pitfall 1: Natural Language Parser Case/Whitespace Sensitivity
**What goes wrong:** "Tomorrow" doesn't match because the parser only checks "tomorrow". "Next  Week" (double space) fails.
**Why it happens:** String comparison without normalization.
**How to avoid:** Normalize input: `input.trim().toLowerCase().replace(/\s+/g, ' ')` before dictionary lookup.
**Warning signs:** Tests pass with exact strings but users report "tomorrow" doesn't work.

### Pitfall 2: Inline Mode Still Attaches Popup Listeners
**What goes wrong:** Document click listener, Escape key handler, and Floating UI code runs even in inline mode.
**Why it happens:** Event listeners attached in `connectedCallback` regardless of mode.
**How to avoid:** Guard listener attachment with `if (!this.inline)` in `connectedCallback`. Skip Floating UI imports entirely for inline mode (dynamic import or conditional code paths).
**Warning signs:** Memory leaks in inline mode, console errors about missing popup elements.

### Pitfall 3: Format Prop Breaks Input Parsing Round-Trip
**What goes wrong:** Custom format shows "01/31/2026" but parser expects "January 31, 2026" for the display value.
**Why it happens:** Display format and input parsing format are coupled.
**How to avoid:** The format prop only affects the display (what the user sees in the input when not editing). When the user focuses the input to type, they type in any parseable format. The round-trip is: user types -> parse -> ISO -> format for display. Custom format only changes the last step.
**Warning signs:** Selecting a date shows the formatted value, but focusing and blurring without changes triggers a parse error.

### Pitfall 4: Presets Select Dates Outside Min/Max Range
**What goes wrong:** "Next Week" preset selects a date that violates the max-date constraint.
**Why it happens:** Preset resolution doesn't check constraints.
**How to avoid:** After resolving a preset date, validate it against min/max constraints before setting the value. Disable preset buttons whose resolved dates fall outside the valid range.
**Warning signs:** Error message appears after clicking a preset button.

### Pitfall 5: Dark Mode Missing for New UI Elements
**What goes wrong:** Preset buttons and tooltips render with light theme colors in dark mode.
**Why it happens:** New elements added without corresponding `:host-context(.dark)` styles.
**How to avoid:** For every new CSS rule, add a corresponding `:host-context(.dark)` override. Review the dark mode checklist for: preset buttons, tooltip background/text, inline mode border/background.
**Warning signs:** Visual inconsistency when toggling dark mode.

### Pitfall 6: SSR Crashes on `new Date()` in Natural Language Resolver
**What goes wrong:** Natural language resolvers call `new Date()` at module load time during SSR, producing server-time dates.
**Why it happens:** Phrase resolvers are called during rendering on the server.
**How to avoid:** Resolvers must be functions that are called at evaluation time (on user input), not at module import time. The dictionary pattern already handles this since each entry is a function `() => Date`.
**Warning signs:** "Today" resolves to the server's date/timezone, not the client's.

## Code Examples

### Complete Natural Language Parser Integration
```typescript
// Source: date-fns v4 addDays, addWeeks, startOfWeek, nextMonday
import { addDays, addWeeks, startOfWeek, startOfDay } from 'date-fns';

type NLResolver = () => Date;

const NL_PHRASES: Record<string, NLResolver> = {
  'today': () => startOfDay(new Date()),
  'tomorrow': () => addDays(startOfDay(new Date()), 1),
  'yesterday': () => addDays(startOfDay(new Date()), -1),
  'next week': () => startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }),
};

export function parseNaturalLanguage(input: string): Date | null {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
  const resolver = NL_PHRASES[normalized];
  return resolver ? resolver() : null;
}
```

### Integrating NL Parser with Existing parseDateInput
```typescript
// In date-input-parser.ts - modify parseDateInput to try NL first:
export function parseDateInput(input: string, locale?: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try natural language first
  const nlResult = parseNaturalLanguage(trimmed);
  if (nlResult) return nlResult;

  // Fall back to format-based parsing (existing logic)
  const referenceDate = new Date();
  const localeFormats = isUSOrderLocale(locale) ? US_ORDERED_FORMATS : EU_ORDERED_FORMATS;
  const formats = [...ISO_FORMATS, ...localeFormats];

  for (const fmt of formats) {
    const result = parse(trimmed, fmt, referenceDate);
    if (isValid(result)) return result;
  }
  return null;
}
```

### Custom Format Prop Usage
```html
<!-- Default: "January 31, 2026" -->
<lui-date-picker value="2026-01-31"></lui-date-picker>

<!-- Short: "1/31/2026" -->
<lui-date-picker
  value="2026-01-31"
  .format=${{ year: 'numeric', month: 'numeric', day: 'numeric' }}
></lui-date-picker>

<!-- With weekday: "Friday, January 31, 2026" -->
<lui-date-picker
  value="2026-01-31"
  .format=${{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}
></lui-date-picker>

<!-- Short month: "Jan 31, 2026" -->
<lui-date-picker
  value="2026-01-31"
  .format=${{ year: 'numeric', month: 'short', day: 'numeric' }}
></lui-date-picker>
```

### Inline Mode Usage
```html
<!-- Always-visible calendar, no popup -->
<lui-date-picker inline label="Select a date"></lui-date-picker>

<!-- Inline with presets sidebar -->
<lui-date-picker inline .presets=${true}></lui-date-picker>
```

### Preset Buttons with Custom Presets
```html
<!-- Default presets: Today, Tomorrow, Next Week -->
<lui-date-picker .presets=${true}></lui-date-picker>

<!-- Custom presets -->
<lui-date-picker .presets=${[
  { label: 'Today', resolve: () => new Date() },
  { label: 'End of Month', resolve: () => endOfMonth(new Date()) },
  { label: 'End of Year', resolve: () => endOfYear(new Date()) },
]}></lui-date-picker>
```

### Tooltip CSS for Disabled Dates
```css
/* Position relative on the date button for tooltip positioning */
.date-button {
  position: relative;
}

/* Tooltip shown on hover for disabled dates with a reason */
.date-button[data-tooltip]:not([data-tooltip=""]):hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.5rem;
  background: var(--ui-tooltip-bg, #1f2937);
  color: var(--ui-tooltip-text, white);
  font-size: 0.75rem;
  line-height: 1.25;
  border-radius: 0.25rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

/* Dark mode tooltip */
:host-context(.dark) .date-button[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: var(--ui-tooltip-bg, #e5e7eb);
  color: var(--ui-tooltip-text, #111827);
}
```

### SSR Guard for Inline Mode
```typescript
// Inline mode is simpler for SSR - no popup, no Floating UI, no document listeners
override connectedCallback(): void {
  super.connectedCallback();
  if (!isServer && !this.inline) {
    document.addEventListener('click', this.handleDocumentClick);
  }
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  if (!isServer && !this.inline) {
    document.removeEventListener('click', this.handleDocumentClick);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| chrono-node for all NL parsing | Dictionary + date-fns for finite phrase sets | N/A (architecture choice) | ~150KB bundle savings; adequate for known phrase set |
| `title` attribute for tooltips | CSS `::after` pseudo-element tooltips | 2023+ (Firefox Shadow DOM bug) | Reliable cross-browser tooltips in Shadow DOM |
| Separate inline calendar component | Boolean `inline` prop on date-picker | Common pattern (PrimeNG, Flatpickr) | Single component serves both use cases |
| Hardcoded display format | `Intl.DateTimeFormat` options passthrough | Native API | Zero bundle cost, full locale support |
| `dateStyle` shorthand only | Full `Intl.DateTimeFormatOptions` object | ES2020+ | Granular control over each component (weekday, month style, etc.) |

**Deprecated/outdated:**
- `title` attribute tooltips inside Shadow DOM: Unreliable in Firefox. Use custom tooltip elements instead.

## Open Questions

1. **Should NL parser support localized phrases?**
   - What we know: Requirements specify English phrases ("tomorrow", "next week", "today"). The component supports multiple locales via the `locale` prop.
   - What's unclear: Should "morgen" (German for tomorrow) or "demain" (French) be supported?
   - Recommendation: Start with English-only phrases. The dictionary pattern makes adding locale-specific phrases straightforward later. Document this as a future enhancement.

2. **Tooltip for disabled dates: calendar or date-picker responsibility?**
   - What we know: The `lui-calendar` component already computes `DateDisabledResult` with a `reason` string. The tooltip needs to render in the calendar's Shadow DOM (where the day cells live).
   - What's unclear: Should the tooltip be added to `lui-calendar` itself, or should the date-picker pass a `renderDay` callback that includes the tooltip?
   - Recommendation: Add tooltip support directly to `lui-calendar` via a new `show-constraint-tooltips` boolean property. This keeps the tooltip rendering co-located with the day cell rendering, and benefits all calendar consumers, not just the date picker.

3. **Preset button placement in popup vs inline mode**
   - What we know: In popup mode, presets should appear inside the popup alongside the calendar. In inline mode, they should appear adjacent to the calendar.
   - What's unclear: Should presets be above, below, or to the side of the calendar?
   - Recommendation: Render presets as a horizontal button group above the calendar in both modes. This works well at the calendar's max-width of 380px and is the most common pattern.

## Sources

### Primary (HIGH confidence)
- `packages/date-picker/src/date-picker.ts` - Current component implementation with all properties and methods
- `packages/date-picker/src/date-input-parser.ts` - Current parser with format-based parsing
- `packages/calendar/src/calendar.ts` - Calendar component with `isDateDisabled()`, `DateDisabledResult`, dark mode patterns
- `packages/core/src/tailwind-element.ts` - TailwindElement SSR pattern with isServer guards
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) - Full options reference for format prop

### Secondary (MEDIUM confidence)
- [date-fns nextMonday, addDays, addWeeks](https://date-fns.org/) - date-fns v4 functions for NL resolution; verified via GitHub source and PR history
- [Firefox Shadow DOM title bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1475485) - Title attribute tooltips don't appear in Shadow DOM
- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) - Declarative Shadow DOM rendering approach
- [chrono-node npm](https://www.npmjs.com/package/chrono-node) - Natural language parser (~150KB minified, v2.9.0)
- [simple-date-parse](https://github.com/nrkno/simple-date-parse) - Lightweight alternative (1.27KB) but limited to offset syntax

### Tertiary (LOW confidence)
- chrono-node exact bundle size: ~150-170KB minified based on general knowledge; Bundlephobia page did not render size data. Needs validation if chrono-node is ever reconsidered.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; all tools already in the project
- Architecture: HIGH - Patterns directly observed in existing components and well-established in the ecosystem
- Natural language parsing: HIGH - Dictionary approach is trivial and testable; date-fns functions verified
- Tooltips: MEDIUM - CSS `::after` approach is standard but needs testing with the calendar's existing grid layout and overflow
- SSR: HIGH - Existing isServer guards in the codebase; inline mode is simpler for SSR than popup mode

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable domain, no new dependencies)
