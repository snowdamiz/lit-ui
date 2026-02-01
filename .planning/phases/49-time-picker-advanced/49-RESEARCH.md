# Phase 49: Time Picker Advanced - Research

**Researched:** 2026-01-31
**Domain:** Advanced time picker features (intervals, business hours, range slider, timezone, voice input, mobile wheels, dark mode, SSR)
**Confidence:** HIGH (codebase patterns well-established from Phase 48)

## Summary

Phase 49 extends the Phase 48 time picker with seven advanced features. The existing codebase already has a `step` property on both `TimePicker` and `TimeDropdown` that generates interval-based options (TP-16 partially done -- the dropdown respects step, but the clock face minute mode does not snap to intervals yet). Multi-timezone display (TP-19) builds on the existing `showTimezone` and `timezone` properties already present in TimePicker, extending to show both local and a second timezone. Business hours highlighting (TP-17) requires a new visual treatment in the dropdown/clock. The time range slider (TP-18) is a new dual-handle `<input type="range">` component for visual duration selection. Voice input (TP-20) uses the Web Speech API with limited browser support (no Firefox). Mobile scrolling wheels (TP-21) use CSS scroll-snap for an iOS-style picker. Dark mode (TP-22) and SSR (TP-23) follow established patterns from Phase 48.

**Primary recommendation:** Build each feature as a composable sub-component or property extension on the existing TimePicker, following the same patterns established in Phase 48 (internal components, CSS custom properties, `isServer` guards, `:host-context(.dark)`).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | 3.x | Web component framework | Already in use, all components extend TailwindElement |
| @lit-ui/core | local | Base class, tailwindBaseStyles, dispatchCustomEvent | Project standard |
| Intl.DateTimeFormat | native | Timezone name/offset formatting | Already used for time display; supports all 6 timeZoneName formats |
| CSS scroll-snap | native | iOS-style wheel snapping | No JS library needed; `scroll-snap-type: y mandatory` with `scroll-snap-align: center` |
| Web Speech API | native | Voice input recognition | `SpeechRecognition` / `webkitSpeechRecognition` for voice commands |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @floating-ui/dom | existing | Popup positioning | Already used by TimePicker popup |
| date-fns | 4.x | Date manipulation | Only if TP-20 voice input parses "tomorrow" to a date (time-only parsing uses existing regex) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS scroll-snap (native) | BetterScroll / mobileSelect.js | Extra dependency for no benefit; CSS scroll-snap has full browser support and handles touch/trackpad natively |
| Custom dual-range slider | External range slider lib | External libs don't integrate with Shadow DOM theming; custom implementation is straightforward with two `<input type="range">` or pointer events on a track |
| Web Speech API | Third-party speech service | Web Speech API is free, no API keys; limited browser support is acceptable since voice input is optional enhancement |

**Installation:**
```bash
# No new dependencies required - all features use native APIs and existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
packages/time-picker/src/
├── time-picker.ts           # Main component (extend with new props)
├── time-input.ts            # Spinbutton input (no changes)
├── clock-face.ts            # Clock face (add interval snapping, business hours highlighting)
├── time-dropdown.ts         # Dropdown list (add business hours highlighting)
├── time-range-slider.ts     # NEW: Dual-handle slider for duration selection
├── time-scroll-wheel.ts     # NEW: iOS-style scroll wheel for mobile
├── time-voice-input.ts      # NEW: Voice input handler (SpeechRecognition wrapper)
├── timezone-display.ts      # NEW: Multi-timezone display sub-component
├── time-utils.ts            # Shared utilities (extend with timezone helpers)
├── time-presets.ts           # Presets (no changes)
├── time-utils.test.ts       # Tests (extend)
├── index.ts                 # Exports (update)
├── jsx.d.ts                 # JSX types (update with new props)
└── vite-env.d.ts
```

### Pattern 1: Time Interval Snapping on Clock Face (TP-16)
**What:** The clock face minute mode should snap pointer selections to the nearest valid interval
**When to use:** When step > 1 (e.g., 15, 30, 60 minute intervals)
**Example:**
```typescript
// In clock-face.ts, _calculateValueFromPointer for minute mode:
private _snapToInterval(minute: number, step: number): number {
  if (step <= 1) return minute;
  return Math.round(minute / step) * step % 60;
}

// In minute rendering, only show labels at step intervals:
private _renderMinuteModeWithStep(step: number) {
  const items = [];
  for (let i = 0; i < 60; i += step) {
    const angle = i * 6;
    const pos = polarToCartesian(angle, OUTER_NUMBER_RADIUS);
    // ... render label at each step position
  }
  return items;
}
```

### Pattern 2: Business Hours Highlighting (TP-17)
**What:** Visual differentiation of business hours (9 AM - 5 PM) in dropdown and clock face
**When to use:** When `businessHours` property is set (default: `{ start: 9, end: 17 }`)
**Example:**
```typescript
// New property on TimePicker:
@property({ attribute: false })
businessHours: { start: number; end: number } | false = false;

// In TimeDropdown, add CSS class for business hours:
const isBusinessHour = this.businessHours &&
  opt.value.hour >= this.businessHours.start &&
  opt.value.hour < this.businessHours.end;

// CSS:
.time-option.business-hour {
  border-left: 3px solid var(--ui-time-picker-business-hour-accent, #22c55e);
  background: var(--ui-time-picker-business-hour-bg, #f0fdf4);
}
```

### Pattern 3: Multi-Timezone Display (TP-19)
**What:** Show local time alongside a second timezone
**When to use:** When `additionalTimezones` property is set
**Example:**
```typescript
// Use Intl.DateTimeFormat with different timeZone options
private getTimezoneDisplay(tz: string, time: TimeValue): string {
  const date = new Date(2000, 0, 1, time.hour, time.minute, time.second);
  const formatter = new Intl.DateTimeFormat(this.locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: this.effectiveHour12,
    timeZone: tz,
    timeZoneName: 'short',
  });
  return formatter.format(date);
}

// Display as: "2:30 PM EST | 11:30 AM PST"
```

### Pattern 4: iOS-Style Scroll Wheel (TP-21)
**What:** Touch-friendly scrolling time selector using CSS scroll-snap
**When to use:** Mobile interface mode or explicit `interface-mode="wheel"`
**Example:**
```typescript
// CSS for scroll container:
.wheel-container {
  height: calc(5 * var(--wheel-item-height, 40px)); /* Show 5 items */
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.wheel-container::-webkit-scrollbar { display: none; }

.wheel-item {
  height: var(--wheel-item-height, 40px);
  scroll-snap-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Selection indicator overlay:
.wheel-highlight {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: var(--wheel-item-height, 40px);
  border-top: 1px solid var(--ui-time-picker-border, #d1d5db);
  border-bottom: 1px solid var(--ui-time-picker-border, #d1d5db);
  pointer-events: none;
}
```

### Pattern 5: Voice Input via Web Speech API (TP-20)
**What:** Optional microphone button that accepts spoken time commands
**When to use:** When `voice` property is enabled and browser supports SpeechRecognition
**Example:**
```typescript
// Feature detection:
private get speechRecognitionAvailable(): boolean {
  if (isServer) return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// Create recognition instance:
private createRecognition(): SpeechRecognition | null {
  if (!this.speechRecognitionAvailable) return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = this.locale;
  return recognition;
}

// Parse transcript to time:
private parseVoiceInput(transcript: string): TimeValue | null {
  // Match patterns like "3 PM", "3:30 PM", "15:30", "three thirty"
  const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i;
  const match = transcript.match(timePattern);
  if (!match) return null;
  // ... parse to TimeValue
}
```

### Pattern 6: Time Range Slider (TP-18)
**What:** A dual-thumb slider for selecting start and end times visually
**When to use:** When `mode="range"` or as a standalone `<lui-time-range-slider>` component
**Example:**
```typescript
// Dual-thumb range via two overlaid <input type="range">
// Each input represents minutes since midnight (0-1440)
// CSS z-index management ensures correct thumb interaction

// Alternatively, build custom with pointer events on an SVG/div track:
// - Track element (0-1440 minutes)
// - Two draggable thumb elements
// - Fill between thumbs shows selected range
// - Labels show formatted times at each thumb position
```

### Anti-Patterns to Avoid
- **Never import SpeechRecognition at module level:** Guard behind `isServer` and feature detection. Speech API is browser-only.
- **Never use fixed timezone offsets:** Always use IANA timezone identifiers (e.g., "America/New_York") with `Intl.DateTimeFormat`. Offsets change with DST.
- **Never force scroll-snap via JavaScript scrollTo:** Let CSS handle snapping; only use JS to detect which item is selected after scroll ends.
- **Never use touch events for wheel picker:** Use pointer events (same as clock-face pattern from Phase 48) for unified desktop/mobile handling.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timezone abbreviation lookup | Manual timezone offset tables | `Intl.DateTimeFormat` with `timeZoneName: 'short'` | DST transitions, political changes make static tables wrong |
| Timezone offset calculation | Custom UTC offset math | `Intl.DateTimeFormat` with `timeZoneName: 'shortOffset'` | Intl handles DST-aware offset computation |
| Scroll snapping physics | JavaScript momentum/spring physics | CSS `scroll-snap-type: y mandatory` | Browser-native is smoother, handles all input methods |
| Speech recognition | Custom audio processing | Web Speech API `SpeechRecognition` | Browser handles audio capture, language models, noise cancellation |
| IANA timezone list | Hardcoded timezone array | `Intl.supportedValuesOf('timeZone')` | Browser-native, always current |

**Key insight:** The Intl API handles all timezone complexity (DST transitions, political changes, locale-aware naming). CSS scroll-snap handles all scroll physics. Web Speech API handles all audio processing. Use native APIs rather than reimplementing.

## Common Pitfalls

### Pitfall 1: Timezone Offset vs. Timezone Name Confusion
**What goes wrong:** Displaying "UTC-5" when user expects "EST", or vice versa
**Why it happens:** `timeZoneName: 'short'` gives abbreviation (EST), `timeZoneName: 'shortOffset'` gives offset (GMT-5). Different users expect different formats.
**How to avoid:** Support a `timezoneFormat` property that controls which `timeZoneName` value is used. Default to `'short'` (abbreviation).
**Warning signs:** Timezone display shows "GMT-5" in summer when it should show "EDT" (Eastern Daylight Time)

### Pitfall 2: SpeechRecognition Not Available in Firefox
**What goes wrong:** Voice input button appears but doesn't work in Firefox
**Why it happens:** Firefox does not support the Web Speech Recognition API (as of 2026)
**How to avoid:** Feature-detect `SpeechRecognition` / `webkitSpeechRecognition` and hide the microphone button when unavailable. Never show a broken UI.
**Warning signs:** Error in console: "SpeechRecognition is not defined"

### Pitfall 3: Scroll Wheel Value Detection Timing
**What goes wrong:** Selected value reads wrong item during scroll momentum
**Why it happens:** Reading `scrollTop` during scroll animation gets intermediate values
**How to avoid:** Use the `scrollend` event (or `IntersectionObserver` as fallback) to read the final snapped position. Add a debounce timer for browsers without `scrollend`.
**Warning signs:** Value flickers between two options during fast scrolling

### Pitfall 4: Range Slider Thumb Overlap
**What goes wrong:** When start and end thumbs are at the same position, one becomes unreachable
**Why it happens:** Dual `<input type="range">` elements stack, and the top one captures all pointer events
**How to avoid:** Detect which thumb is closer to the pointer and set `pointer-events: none` on the other. Or use a single custom track with pointer event handling.
**Warning signs:** Cannot drag one thumb past the other

### Pitfall 5: Business Hours Across Timezones
**What goes wrong:** Business hours highlight 9-5 in the wrong timezone
**Why it happens:** Business hours are typically in local time, but the component might display in a different timezone
**How to avoid:** Business hours `start`/`end` are always in the component's configured timezone (or local if none set). Document this clearly.
**Warning signs:** 9 AM highlighted when displaying in a timezone where local 9 AM is a different hour

### Pitfall 6: Voice Input "3 PM Tomorrow"
**What goes wrong:** The requirement mentions "3 PM tomorrow" but TimePicker is time-only (no date)
**Why it happens:** The voice parser may receive date+time input but the component only handles time
**How to avoid:** Parse only the time portion from voice input. Ignore date references ("tomorrow", "next Monday"). If the requirement truly needs date support, that belongs in a DateTimePicker composite.
**Warning signs:** Component tries to store a date when it only has TimeValue { hour, minute, second }

## Code Examples

### Multi-Timezone Display with Intl API
```typescript
// Source: MDN Intl.DateTimeFormat documentation
// Get timezone abbreviation for an IANA timezone
function getTimezoneAbbreviation(locale: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZoneName: 'short',
    hour: 'numeric',
    timeZone: timezone,
  }).formatToParts(new Date());
  return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
}

// Get timezone offset string for an IANA timezone
function getTimezoneOffset(locale: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZoneName: 'shortOffset',
    hour: 'numeric',
    timeZone: timezone,
  }).formatToParts(new Date());
  return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
}

// Convert time between timezones for display
function convertTimeForTimezone(
  time: TimeValue,
  fromTz: string,
  toTz: string,
  locale: string,
  hour12: boolean,
): string {
  // Create a date in the source timezone
  const date = new Date();
  date.setHours(time.hour, time.minute, time.second);

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
    timeZone: toTz,
    timeZoneName: 'short',
  }).format(date);
}
```

### CSS Scroll-Snap Wheel Picker
```typescript
// Source: CSS scroll-snap specification + established project patterns
render() {
  return html`
    <div class="wheel-wrapper">
      <div class="wheel-highlight" aria-hidden="true"></div>
      <div
        class="wheel-container"
        @scrollend=${this._handleScrollEnd}
        @scroll=${this._handleScroll}
      >
        <!-- Padding items for top/bottom overflow -->
        ${this._renderPaddingItems(2)}
        ${this.items.map((item, i) => html`
          <div
            class="wheel-item"
            data-index=${i}
            aria-selected=${i === this.selectedIndex ? 'true' : 'false'}
          >${item.label}</div>
        `)}
        ${this._renderPaddingItems(2)}
      </div>
    </div>
  `;
}
```

### Web Speech API Integration
```typescript
// Source: MDN SpeechRecognition documentation
private startVoiceInput(): void {
  if (isServer || !this.speechRecognitionAvailable) return;

  const SpeechRecognition = (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = this.locale;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    const parsed = this.parseVoiceTranscript(transcript);
    if (parsed) {
      this.internalValue = parsed;
      this.syncValueFromInternal();
    }
    this._voiceListening = false;
  };

  recognition.onerror = () => {
    this._voiceListening = false;
  };

  recognition.onend = () => {
    this._voiceListening = false;
  };

  this._voiceListening = true;
  recognition.start();
}

// Parse spoken time to TimeValue
private parseVoiceTranscript(text: string): TimeValue | null {
  const normalized = text.toLowerCase().trim();

  // Pattern: "3 PM", "3:30 PM", "three thirty PM"
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i;
  const match = normalized.match(timeRegex);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.replace(/\./g, '').toUpperCase();

  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute, second: 0 };
}
```

### Dual-Handle Time Range Slider
```typescript
// Custom implementation using pointer events on a track
// Source: WAI-ARIA Slider Pattern + project Pointer Events conventions

render() {
  const startPercent = (this.startMinutes / 1440) * 100;
  const endPercent = (this.endMinutes / 1440) * 100;

  return html`
    <div class="range-slider-wrapper">
      <div class="range-labels">
        <span>${this.formatMinutes(this.startMinutes)}</span>
        <span>${this.formatMinutes(this.endMinutes)}</span>
      </div>
      <div
        class="range-track"
        @pointerdown=${this._handleTrackPointerDown}
        @pointermove=${this._handleTrackPointerMove}
        @pointerup=${this._handleTrackPointerUp}
      >
        <div
          class="range-fill"
          style="left: ${startPercent}%; width: ${endPercent - startPercent}%"
        ></div>
        <div
          class="range-thumb range-thumb-start"
          role="slider"
          aria-label="Start time"
          aria-valuemin="0"
          aria-valuemax="1440"
          aria-valuenow=${this.startMinutes}
          aria-valuetext=${this.formatMinutes(this.startMinutes)}
          tabindex="0"
          style="left: ${startPercent}%"
        ></div>
        <div
          class="range-thumb range-thumb-end"
          role="slider"
          aria-label="End time"
          aria-valuemin="0"
          aria-valuemax="1440"
          aria-valuenow=${this.endMinutes}
          aria-valuetext=${this.formatMinutes(this.endMinutes)}
          tabindex="0"
          style="left: ${endPercent}%"
        ></div>
      </div>
      ${this._renderTickMarks()}
    </div>
  `;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Touch Events for mobile scroll | Pointer Events API | 2020+ | Unified handling for touch, mouse, pen; all browsers support PointerEvent |
| JS-based scroll momentum | CSS scroll-snap | 2019+ | Browser handles physics, works for all scroll inputs (touch, trackpad, keyboard) |
| Static timezone offset tables | `Intl.DateTimeFormat` timeZone option | 2018+ (mature 2020+) | DST-aware, politically correct, no maintenance |
| webkitSpeechRecognition prefix only | Unprefixed `SpeechRecognition` | Chrome 99+ | Still need webkit prefix for Safari; Firefox still unsupported |
| `scrollend` event unavailable | `scrollend` event | Chrome 114, Firefox 109, Safari 17+ | Native scroll-end detection; no need for debounce timers (but provide fallback) |

**Deprecated/outdated:**
- `touchstart`/`touchmove`/`touchend`: Replaced by Pointer Events for cross-input handling
- Manual `setTimeout` scroll-end detection: `scrollend` event now has wide support (but keep fallback for older Safari)

## Open Questions

1. **Voice input scope ("3 PM tomorrow")**
   - What we know: TimePicker stores TimeValue (hour, minute, second) with no date component
   - What's unclear: The requirement TP-20 mentions "3 PM tomorrow" which includes a date reference
   - Recommendation: Parse only the time portion ("3 PM") from voice input. Ignore date words. Document that date-aware voice input would require a DateTimePicker composite component.

2. **Time range slider: standalone or integrated?**
   - What we know: Plan 49-03 describes "time range slider for visual duration selection"
   - What's unclear: Is this a mode within TimePicker or a separate component?
   - Recommendation: Build as an internal component `<lui-time-range-slider>` composed by TimePicker when `mode="range"` is set, or usable standalone. This follows the pattern of TimeDropdown being internal but composable.

3. **Mobile wheel auto-detection**
   - What we know: Plan 49-05 is "mobile scrolling wheels (iOS-style)"
   - What's unclear: Should wheel mode activate automatically on mobile or require explicit `interface-mode="wheel"`?
   - Recommendation: Add `'wheel'` to the `interfaceMode` union type. For v1, require explicit setting. Auto-detection based on `matchMedia('(pointer: coarse)')` can be added later.

4. **`scrollend` event browser support**
   - What we know: `scrollend` is supported in Chrome 114+, Firefox 109+, Safari 17+
   - What's unclear: Exact support for the target Safari versions of this project
   - Recommendation: Use `scrollend` with a fallback debounced `scroll` listener (200ms timeout). Feature-detect via `'onscrollend' in window`.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `packages/time-picker/src/` - All existing component files read and analyzed
- [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) - API surface, events, browser compat
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) - timeZone, timeZoneName options
- [Can I Use: Speech Recognition](https://caniuse.com/speech-recognition) - Browser support (Chrome/Safari yes, Firefox no)
- [web.dev CSS Scroll Snap](https://web.dev/css-scroll-snap/) - scroll-snap-type, scroll-snap-align patterns

### Secondary (MEDIUM confidence)
- [CSS-Tricks: Practical CSS Scroll Snapping](https://css-tricks.com/practical-css-scroll-snapping/) - Implementation patterns verified with web.dev
- [MDN formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts) - Timezone part extraction

### Tertiary (LOW confidence)
- Various wheel picker libraries (BetterScroll, mobileSelect.js, react-mobile-picker) - Referenced for UX patterns only, not for code adoption

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All native APIs, no new dependencies needed; codebase patterns well-established
- Architecture: HIGH - Follows exact same component composition pattern from Phase 48 (internal components, CSS custom properties, event dispatching)
- Pitfalls: HIGH - Timezone handling pitfalls verified via MDN; Speech API limitations verified via Can I Use; scroll-snap edge cases verified via web.dev

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (stable domain - native APIs don't change frequently)
