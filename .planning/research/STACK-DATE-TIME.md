# Technology Stack

**Project:** LitUI v4.3 - Date/Time Components
**Researched:** 2026-01-30

## Recommended Stack

### Date Manipulation Library
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **date-fns** | ^4.1.0 | Date manipulation, formatting, parsing | Modular, tree-shakeable, 200+ functions, native timezone support in v4, TypeScript-first, immutable/pure functions, zero dependencies |

### Integration with Existing Stack
| Technology | Integration Point | Notes |
|------------|------------------|-------|
| **Floating UI** | Calendar/date picker dropdown positioning | Already in use for Dialog, can reuse for calendar popover positioning |
| **Intl API** | Locale-aware formatting, first day of week, month names | Native browser API, no polyfill needed for modern browsers |
| **Shadow DOM** | Component encapsulation | Existing pattern, no changes needed |
| **Constructable Stylesheets** | CSS scoping | Existing pattern, no changes needed |

### TypeScript Types
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@types/date-fns** | (included in package) | TypeScript types | date-fns v4 is 100% TypeScript with handcrafted types |

### Browser APIs (No Additional Libraries)
| API | Purpose | Why Native |
|-----|---------|------------|
| **Intl.DateTimeFormat** | Locale-aware date/time formatting | Universal browser support, part of ECMAScript 2026 spec |
| **Intl.Locale.getWeekInfo()** | First day of week, weekend days by locale | Modern API, excellent browser support |
| **Temporal API** | **DO NOT USE** | Only Chrome 144+, Firefox 139+ (not production-ready) |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **Date Library** | date-fns 4.x | **Day.js** | Unfixed timezone handling issues (per community reports), fewer features than date-fns |
| **Date Library** | date-fns 4.x | **Luxon** | Larger bundle size (2x-3x date-fns), mutable API can cause bugs |
| **Date Library** | date-fns 4.x | **Moment.js** | Deprecated, mutable API, large bundle, actively maintained replacement needed |
| **Date Library** | date-fns 4.x | **Native Date API only** | Would require reinventing 200+ functions, edge cases, timezone handling - high maintenance burden |
| **Timezone** | date-fns v4 (built-in) | **date-fns-tz (separate)** | date-fns v4 has first-class timezone support, separate package not needed |
| **Temporal API** | **DO NOT USE** | Native Temporal | Only Chrome 144+ and Firefox 139+ support, Safari/Edge missing, not Stage 4 yet (expected March 2026) |

## Installation

```bash
# Core date manipulation
pnpm add date-fns@^4.1.0

# TypeScript types are included - no separate @types package needed
```

## Integration Points

### With Existing @lit-ui/core
```typescript
// Calendar component extends existing TailwindElement
import { TailwindElement } from '@lit-ui/core';
import { customElement, state } from 'lit/decorators.js';

// Date utilities from date-fns
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
```

### With Floating UI (for dropdown positioning)
```typescript
// Reuse existing Floating UI integration from Dialog
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

// For calendar popover positioning
const position = await computePosition(reference, floating, {
  middleware: [flip(), shift(), offset(4)],
});
```

### With Intl API (for localization)
```typescript
// Get locale-specific week info
const locale = new Intl.Locale(this.locale || 'en-US');
const weekInfo = locale.getWeekInfo();
const firstDayOfWeek = weekInfo.firstDay; // 0 = Sunday, 1 = Monday, etc.

// Format dates according to locale
const formatter = new Intl.DateTimeFormat(this.locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

## What NOT to Add

### Avoid These Libraries/Patterns

| Library/Pattern | Why Avoid | Alternative |
|-----------------|-----------|-------------|
| **Moment.js** | Deprecated since 2016, mutable API, 67KB gzipped, actively discouraged | date-fns |
| **Luxon** | 2x-3x larger than date-fns, less modular, heavier bundle impact | date-fns |
| **Day.js** | Known timezone handling issues (unfixed for years), less feature-rich | date-fns |
| **date-fns-tz** | Separate package no longer needed with date-fns v4 built-in timezone support | date-fns v4 |
| **Temporal polyfills** | Large bundle size, API still unstable, unnecessary with date-fns | date-fns + Intl |
| **Bundling timezone data** | IANA timezone database is ~300KB, use date-fns lazy loading or browser APIs | date-fns timezone functions |
| **jQuery-based date pickers** | jQuery dependency, not web component friendly, poor accessibility | Custom implementation |

### Anti-Patterns to Avoid

1. **Don't extend core Date prototype** - Use date-fns pure functions instead
2. **Don't bundle locale data you don't use** - Import only needed locales from date-fns
3. **Don't implement date math yourself** - Use date-fns for daylight saving time edge cases
4. **Don't assume Gregorian calendar only** - Use Intl API for calendar-agnostic formatting
5. **Don't hardcode first day of week** - Use Intl.Locale.getWeekInfo() for locale-aware behavior

## Browser Compatibility

### date-fns v4
- **All modern browsers** (Chrome 24+, Firefox 29+, Safari 7.1+, Edge 12+)
- **IE11** (with polyfills, if needed)

### Intl API Coverage
| Feature | Chrome | Firefox | Safari | Edge | Notes |
|---------|--------|---------|--------|------|-------|
| Intl.DateTimeFormat | 24+ | 29+ | 10+ | 12+ | Universal support |
| Intl.Locale.getWeekInfo() | 91+ | 93+ | 15.4+ | 91+ | Excellent modern support |
| Temporal API | 144+ | 139+ | **None** | **None** | NOT production-ready |

### Recommendation
- **Support modern browsers** (last 2 years) without polyfills
- **Optional polyfill** for IE11 if needed: use `@formatjs/intl-datetimeformat` polyfill

## Bundle Size Impact

| Package | Minified | Gzipped | Tree-Shakeable |
|---------|----------|---------|----------------|
| date-fns (v4.1.0) | 72 KB | 17.5 KB | Yes (modular) |
| Typical usage (5-10 functions) | ~8-15 KB | ~3-6 KB | Yes |

**Bundle size optimization strategies:**
1. Import individual functions: `import { format } from 'date-fns/format'`
2. Lazy-load locale data: `import { enUS } from 'date-fns/locale/en-US'`
3. Use date-fns v4 built-in timezone support (don't add separate tz package)
4. Avoid importing entire library: `import * as dateFns from 'date-fns'` ❌

## Accessibility Stack

### ARIA Patterns (No Libraries Needed)
- **WAI-ARIA Authoring Practices Guide** - Calendar grid pattern (role="grid")
- **Keyboard navigation** - Arrow keys, Home/End, Page Up/Down, Enter/Space
- **Screen reader support** - ARIA labels, live regions for date changes
- **Focus management** - Single tab stop for calendar grid, internal navigation

### Implementation Reference
- [WAI-ARIA Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) - Official W3C pattern
- No additional accessibility libraries needed - follow ARIA APG patterns directly

## Architecture Notes

### Component Structure
```
@lit-ui/calendar (base calendar display)
  ├─ Uses date-fns for date math
  ├─ Uses Intl API for localization
  └─ No external dependencies beyond date-fns

@lit-ui/date-picker (combines input + calendar)
  ├─ Uses @floating-ui/dom for positioning (existing)
  ├─ Uses @lit-ui/dialog (existing pattern)
  └─ Composes @lit-ui/calendar

@lit-ui/date-range-picker (date selection range)
  ├─ Extends @lit-ui/date-picker
  └─ Adds range validation logic

@lit-ui/time-picker (hour/minute/second selection)
  ├─ Uses date-fns for time manipulation
  └─ Custom time grid component
```

### Data Flow
1. **State**: Native Date objects (not wrapped)
2. **Manipulation**: date-fns pure functions
3. **Formatting**: Intl.DateTimeFormat + date-fns format() when needed
4. **Localization**: Intl API (browser-native)
5. **Rendering**: Lit reactive properties + Shadow DOM

## Migration Path

### From Existing Patterns
- **No changes needed** to @lit-ui/core
- **Reuse Floating UI** integration from Dialog component
- **Follow existing patterns**: ElementInternals, form participation, slots
- **Add date-fns** as peer dependency for date/time components only

### Version Strategy
```json
{
  "peerDependencies": {
    "lit": "^3.0.0",
    "@lit-ui/core": "^1.0.0",
    "date-fns": "^4.0.0"
  }
}
```

## Sources

### HIGH Confidence (Official Sources)
- [date-fns GitHub Repository](https://github.com/date-fns/date-fns) - Official source, v4.1.0 latest
- [date-fns npm Package](https://www.npmjs.com/package/date-fns) - Latest version: 4.1.0
- [date-fns v4.0 Announcement](https://blog.date-fns.org/v40-with-time-zone-support/) - First-class timezone support
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) - Browser compatibility
- [MDN: Intl.Locale.getWeekInfo()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) - Locale week info
- [Can I Use: Temporal API](https://caniuse.com/temporal) - Browser support verification
- [WAI-ARIA Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) - Official accessibility pattern

### MEDIUM Confidence (Verified Community Sources)
- [Reddit: Luxon vs date-fns](https://www.reddit.com/r/react/comments/1bpd2es/luxon_vs_datefns/) - Community feedback on timezone issues
- [You Don't Need Moment.js](https://github.com/you-dont-need/You-Dont-Need-Momentjs/blob/master/README.md) - Migration guidance
- [NPM Trends: date-fns vs dayjs vs luxon vs moment](https://npmtrends.com/date-fns-vs-dayjs-vs-luxon-vs-moment) - Usage statistics

### LOW Confidence (Unverified - Needs Validation)
- Bundle size claims for specific functions (verify with actual build analysis)
- Specific performance benchmarks (benchmark with real component usage)

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| **date-fns v4 recommendation** | HIGH | Official sources verify v4.1.0 with timezone support |
| **Intl API usage** | HIGH | MDN documentation confirms excellent browser support |
| **Temporal API exclusion** | HIGH | Can I Use shows insufficient browser support |
| **Bundle size impact** | MEDIUM | Official sources cite 17.5KB, but real usage varies |
| **Day.js timezone issues** | MEDIUM | Community reports, but not officially verified |
| **Accessibility patterns** | HIGH | WAI-ARIA APG is authoritative source |
| **Floating UI integration** | HIGH | Already in use, proven pattern |

## Research Flags for Roadmap

### Phase: Calendar Display
- **Risk**: LOW - date-fns has mature calendar generation functions
- **Research needed**: None significant, standard patterns apply

### Phase: Date Picker
- **Risk**: LOW - Floating UI integration proven in Dialog component
- **Research needed**: Keyboard navigation details from WAI-ARIA APG

### Phase: Date Range Picker
- **Risk**: MEDIUM - Range validation logic can be complex
- **Research needed**: Edge cases for month-crossing ranges, disabled date ranges

### Phase: Time Picker
- **Risk**: LOW - Time manipulation simpler than dates
- **Research needed**: Time increment options (15min, 30min, 60min)

### Phase: Timezone Support
- **Risk**: LOW - date-fns v4 has first-class timezone support
- **Research needed**: UI for timezone selection (if needed), lazy-loading timezone data

## Next Steps

1. **Add date-fns to package.json** as peer dependency
2. **Create @lit-ui/calendar** package with date-fns integration
3. **Test bundle size** with actual usage patterns (5-10 functions typical)
4. **Verify accessibility** with screen reader testing (keyboard navigation from WAI-ARIA APG)
5. **Document locale API** for component consumers (how to pass locale prop)

## Summary

**Recommended stack:** date-fns v4.1.0 + native Intl API + existing Floating UI integration

**Key decision:** date-fns v4's built-in timezone support eliminates need for separate timezone library, keeping bundle size minimal while providing comprehensive date manipulation.

**Avoid:** Moment.js (deprecated), Luxon (larger bundle), Day.js (timezone issues), Temporal API (insufficient browser support).

**Confidence:** HIGH - Recommendations based on official sources with verification of current versions and browser support.
