# Project Research Summary

**Project:** LitUI v4.3 - Date/Time Components
**Domain:** Web component library (Lit.js) - Date/time input components
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

Date/time components are a fundamental part of modern form interfaces, used for booking systems, analytics dashboards, scheduling applications, and data entry. Research across authoritative sources (Nielsen Norman Group, WAI-ARIA APG, Material Design, USWDS) reveals that successful date/time components must balance three critical dimensions: **accessibility** (WCAG 2.1 keyboard navigation, screen reader support), **internationalization** (locale-aware formatting, first day of week, RTL support), and **Shadow DOM compatibility** (event retargeting, positioning, form integration).

The recommended approach for LitUI v4.3 is to use **date-fns v4.1.0** for date manipulation (modular, tree-shakeable, built-in timezone support in v4), **native Intl API** for localization (no additional dependencies), and **Floating UI** for dropdown positioning (already proven in Select component). Components should follow existing LitUI patterns: TailwindElement base class, ElementInternals for form participation, CSS custom properties for theming, and internal composition (Calendar composed by Date Picker, not slotted like Select/Option).

**Key risks** identified: Shadow DOM event retargeting breaks click-outside detection (use `event.composedPath()`), ARIA grid keyboard navigation requires roving tabindex pattern (only one cell has `tabindex="0"` at a time), and ISO 8601 form value format prevents timezone/date parsing bugs. **Mitigation**: All critical pitfalls have clear prevention strategies backed by authoritative sources. The research is HIGH confidence with verified sources (date-fns official, MDN, W3C WAI-ARIA APG).

## Key Findings

### Recommended Stack

**Date manipulation library**: date-fns v4.1.0 — Modular, tree-shakeable, 200+ functions, native timezone support in v4, TypeScript-first, immutable/pure functions, zero dependencies. Alternative libraries (Moment.js, Luxon, Day.js) were rejected: Moment.js is deprecated, Luxon has 2-3x larger bundle, Day.js has unfixed timezone issues per community reports.

**Localization**: Native Intl API — Universal browser support (Intl.DateTimeFormat, Intl.Locale.getWeekInfo()), no polyfill needed for modern browsers. Temporal API is NOT production-ready (only Chrome 144+, Firefox 139+, Safari/Edge missing as of 2026-01).

**Form participation**: ElementInternals — Already proven in Input/Textarea components. Submit ISO 8601 format (YYYY-MM-DD for dates, HH:mm:ss for times) to match native `<input type="date">` behavior and avoid timezone bugs.

**Accessibility**: WAI-ARIA APG Grid Pattern — No additional libraries needed. Calendar uses `role="grid"`, roving tabindex for keyboard navigation, `aria-live` regions for screen reader announcements.

**Positioning**: Floating UI (already in Select) — Proven pattern for dropdown positioning. Use flip/shift middleware to prevent Shadow DOM clipping issues.

**Core technologies:**
- date-fns v4.1.0: Date manipulation, formatting, parsing — Modular, tree-shakeable, v4 has built-in timezone support
- Intl.DateTimeFormat: Locale-aware formatting, month/day names — Browser-native, no dependencies
- Floating UI: Calendar popover positioning — Reuses existing Select pattern, proven in production
- CSS Grid: 7-column calendar layout — Natively handles calendar grid structure
- ElementInternals: Form value submission — ISO 8601 format, matches native input behavior

### Expected Features

**Must have (table stakes):**
- Month grid view with weekday headers — Users expect calendar layout, 7-column grid
- Today indicator with aria-current="date" — Users need reference point
- Selected date highlight — Visual feedback for current selection
- Month/year navigation — Previous/next buttons, year selection
- Keyboard navigation (arrows, Home/End, Page Up/Down) — WCAG 2.1 Level A requirement
- Screen reader announcements — aria-live region for selections/month changes
- Min/max date constraints — Disable invalid dates (past dates, booking cutoffs)
- Disabled dates (weekends, holidays) — Business logic enforcement
- First day of week localization — Sunday (US) vs Monday (EU) based on locale
- Month/day names localization — Intl.DateTimeFormat for native language
- Input field with formatted display — Text input for fast date entry
- Form integration (ElementInternals) — Submit ISO 8601 format
- Focus management — Trap focus in popup, return to trigger on close
- Escape key closes, click outside closes — Standard UI patterns

**Should have (competitive):**
- Quick presets (Today, Tomorrow, Next Week) — One-click common dates for efficiency
- Hover preview for range selection — Show potential range before selecting end date
- Range highlighting between start/end dates — Visual feedback for selected range
- Two calendar display for ranges — Side-by-side months (NNG recommends)
- Date range presets ("Last 7 days", "This month") — Common in analytics dashboards
- Auto-resize textarea — Field-sizing: content with fallback for Safari/Firefox
- Character counter with aria-describedby — Visual count for maxlength fields
- Password visibility toggle — Built-in eye icon with aria-pressed
- Search clear button — X icon appears when value is non-empty
- Prefix/suffix slots — Icons, text, or buttons alongside input

**Defer (v2+):**
- Natural language parsing ("tomorrow", "next week") — HIGH complexity, library dependency
- Decade/century view — MEDIUM complexity, edge case for birthdates
- Custom date cell rendering — HIGH complexity, slot API for badges/icons
- Drag to select range — HIGH complexity, mouse events handling
- Time zone conversion — HIGH complexity, multi-timezone display
- Voice input support — VERY HIGH complexity, Web Speech API
- Recurring time selection ("Every Monday at 2 PM") — VERY HIGH complexity, recurrence rules

### Architecture Approach

**Key architectural decision**: Calendar Display is a standalone, reusable component (NOT a slotted child like Option). Date Picker and Date Range Picker compose Calendar internally (not via slots). This differs from Select/Option because calendar selection state is complex (selected date, hover date, focused date, visible month), calendar needs to work standalone (e.g., always-visible booking UI), and picker needs tight control for dropdown positioning and closing. Time Picker is a separate, simpler component.

All components follow established LitUI patterns: Extend `TailwindElement` base class, use `ElementInternals` for form participation, use Floating UI for dropdown positioning (reusing Select pattern), CSS custom properties for theming (`--ui-calendar-*`, `--ui-date-picker-*`), and `isServer` guards for SSR compatibility.

**Form value format**: Date Picker submits ISO 8601 (YYYY-MM-DD), Date Range Picker submits two ISO strings via hidden native inputs (ElementInternals limitation), Time Picker submits ISO 8601 time (HH:mm or HH:mm:ss).

**Major components:**
1. Calendar Display (lui-calendar) — Standalone month grid, NOT form-associated, emits ui-date-select/ui-month-change events, used internally by pickers
2. Date Picker (lui-date-picker) — Single date selection with input + dropdown calendar, form-associated, composes Calendar internally, submits ISO 8601 format
3. Date Range Picker (lui-date-range-picker) — Start/end date selection, dual calendar display, form-associated via hidden inputs, range highlighting, hover preview
4. Time Picker (lui-time-picker) — Hour/minute/second selection, 12/24 hour format, AM/PM selector, form-associated, submits ISO 8601 time format

### Critical Pitfalls

1. **Calendar popup positioning breaks with Shadow DOM stacking contexts** — Use @floating-ui/dom with flip/shift middleware, set popover to position: fixed with high z-index, test at viewport edges and in scrollable containers
2. **Click-outside-to-close fails with event retargeting** — Use `event.composedPath()` instead of `event.target`, attach click listener to document, clean up in disconnectedCallback
3. **ARIA grid keyboard navigation fails without roving tabindex** — Only one cell has tabindex="0" at a time, arrow keys move focus AND update tabindex programmatically, follow W3C ARIA APG Grid Pattern
4. **Form value format mismatch (ISO8601 vs display format)** — Always store/submit ISO8601 (YYYY-MM-DD) without timezone, use date-fns for formatting, never use `Date.parse()` or `new Date(string)` (implementation-dependent)
5. **Screen reader doesn't announce date changes** — Add aria-live region for announcements, update on date selection, each grid cell needs aria-label with full date (e.g., "Monday, January 15, 2026")

## Implications for Roadmap

Based on combined research from STACK, FEATURES, ARCHITECTURE, and PITFALLS, the recommended phase structure for v4.3:

### Phase 1: Calendar Display (Foundation)
**Rationale:** Standalone component with no dependencies on other date/time components. Provides visual foundation for all date pickers. Can be used independently (e.g., always-visible booking UI). Validates CSS Grid layout and navigation patterns before adding complexity.

**Delivers:** Working `lui-calendar` component with month grid, today indicator, navigation, keyboard accessibility, screen reader support.

**Addresses:** FEATURES.md table stakes (month grid, today indicator, navigation, keyboard nav, screen reader announcements, min/max constraints, disabled dates, localization).

**Avoids:** PITFALLS.md #3 (ARIA grid without roving tabindex), #11 (focus management breaks after month nav), #7 (date parsing inconsistencies - use date-fns from start).

**Stack used:** date-fns v4.1.0 for date math, Intl API for localization, CSS Grid for layout.

### Phase 2: Date Picker (Core UX)
**Rationale:** Most common use case (single date selection). Builds on Calendar component. Introduces Floating UI dropdown positioning (reusing Select pattern). Introduces form participation for date values. Validates internal composition pattern (NOT slot-based).

**Delivers:** Working `lui-date-picker` component with input field, calendar trigger, dropdown, form integration, text input parsing, validation.

**Addresses:** FEATURES.md table stakes (input field, popup trigger, text input support, date format clarity, form integration, validation feedback, clear button, focus management, escape/click-outside closes).

**Avoids:** PITFALLS.md #1 (popup positioning with Shadow DOM), #2 (click-outside fails with retargeting), #4 (ISO8601 format mismatch), #5 (screen reader announcements for picker), #14 (virtual keyboard covers calendar on mobile).

**Stack used:** Floating UI (existing), ElementInternals (existing pattern), date-fns for parsing.

### Phase 3: Time Picker (Simpler, Parallel)
**Rationale:** Simpler than Date Range Picker (no calendar dependency). Can be built in parallel with Date Range Picker. Independent component with its own patterns. Useful standalone component.

**Delivers:** Working `lui-time-picker` component with hour/minute inputs, AM/PM selector, 24-hour format, form integration, time validation.

**Addresses:** FEATURES.md table stakes (hour/minute inputs, AM/PM indicator, 24-hour format, clock face or dropdown, time validation, "Now" button, keyboard navigation, form integration).

**Avoids:** PITFALLS.md #6 (DST transition causes invalid/impossible times), #4 (form value format - use HH:mm:ss), #7 (time parsing with date-fns).

**Stack used:** date-fns for time manipulation, Intl API for locale-aware formatting.

### Phase 4: Date Range Picker (Most Complex)
**Rationale:** Most complex component (dual calendar state management). Benefits from lessons learned in Date Picker. Less common use case than single date picker. Requires dual calendar composition and range validation logic.

**Delivers:** Working `lui-date-range-picker` component with start/end selection, range highlighting, hover preview, two calendar display, min/max range constraints, quick presets.

**Addresses:** FEATURES.md table stakes (start/end selection, range highlighting, two calendar display, hover preview, start/end visual distinction, swap out-of-order, min/max duration, range constraints, clear button, form integration).

**Avoids:** PITFALLS.md #10 (performance with large date ranges - virtualization if needed), #4 (form value format - hidden inputs for dual values), #6 (DST handling for time ranges).

**Stack used:** Calendar component (Phase 1), ElementInternals, hidden native inputs workaround.

### Phase 5: Documentation and Testing
**Rationale:** All components complete. Documentation is essential for adoption. Testing validates accessibility, cross-browser compatibility, and mobile behavior.

**Delivers:** Documentation pages for all components, form integration examples, accessibility documentation, keyboard shortcuts docs, visual regression tests, screen reader testing.

**Addresses:** FEATURES.md differentiators (quick presets, character counter, password visibility toggle - if built).

**Testing coverage:** PITFALLS.md all 14 pitfalls verified (positioning, click-outside, keyboard nav, form format, screen readers, DST, parsing, i18n, performance, focus management, leap years, mobile touch, virtual keyboard).

### Phase Ordering Rationale

- **Calendar first**: Validates core patterns (CSS Grid, keyboard navigation, i18n) before adding complexity. Reusable by all date pickers.
- **Date Picker second**: Most common use case, proves internal composition pattern, introduces Floating UI + form integration.
- **Time Picker third**: Simpler than range picker, can parallel-track with range picker development.
- **Date Range Picker last**: Most complex (dual calendar, range validation), benefits from Date Picker lessons.
- **Documentation final**: Requires all components to be complete, validates accessibility and cross-browser behavior.

**Grouping based on architecture**:
- Foundation (Phase 1): Core calendar patterns
- Single selection (Phases 2-3): Date + Time pickers (can parallel-track)
- Range selection (Phase 4): Builds on single selection patterns
- Validation (Phase 5): Documentation, testing, examples

**Pitfall avoidance by phase**:
- Phase 1 addresses all accessibility pitfalls (#3, #5, #11) upfront
- Phase 2 addresses Shadow DOM pitfalls (#1, #2) and form format (#4)
- Phase 3 addresses time-specific pitfalls (#6, DST)
- Phase 4 addresses performance (#10) and range-specific edge cases
- Phase 5 validates all pitfalls with testing

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1 (Calendar Display):** Keyboard navigation details from WAI-ARIA APG grid pattern, specific aria-label formats for screen readers
- **Phase 2 (Date Picker):** Text input parsing with date-fns (multiple format support), Floating UI positioning with Shadow DOM edge cases
- **Phase 3 (Time Picker):** DST boundary handling (spring-forward invalid times, fall-back ambiguity), time zone support if needed
- **Phase 4 (Date Range Picker):** Range validation edge cases (month-crossing, disabled date ranges), performance optimization for large ranges

**Phases with standard patterns (skip research-phase):**
- **Phase 5 (Documentation):** Well-documented pattern from existing components (Button, Dialog, Input), follow existing docs structure

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | date-fns v4.1.0 verified via official sources, Intl API has universal browser support, Floating UI proven in Select component |
| Features | HIGH | Verified against NNG (Nielsen Norman Group), WAI-ARIA APG, Material Design, USWDS documentation |
| Architecture | HIGH | Based on existing LitUI patterns (TailwindElement, ElementInternals), CSS Grid is standard for calendars, internal composition validated against Select/Option tradeoffs |
| Pitfalls | HIGH | All 14 pitfalls verified with authoritative sources (W3C, MDN, Nolan Lawson, Flatpickr/PrimeVue issues), prevention strategies are explicit and actionable |

**Overall confidence:** HIGH

### Gaps to Address

- **date-fns bundle size impact**: Official sources cite 17.5KB gzipped for full library, but real usage varies (5-10 functions typical). Validate with actual build analysis during implementation.
- **Mobile native inputs vs custom picker**: Research suggests using `<input type="date">` on mobile for better UX, but implementation pattern needs validation. Consider platform-specific rendering during Phase 2.
- **Time zone support**: Time Picker timezone awareness is HIGH complexity. MVP should focus on local time only. Timezone support can be deferred to v2+ or addressed via date-fns-tz if user demand emerges.
- **Temporal API future-proofing**: Temporal API is expected to reach Stage 4 in March 2026. Monitor for maturity. date-fns provides stable fallback until Temporal is production-ready.

## Sources

### Primary (HIGH confidence)
- [date-fns GitHub Repository](https://github.com/date-fns/date-fns) — v4.1.0 with timezone support
- [date-fns v4.0 Announcement](https://blog.date-fns.org/v40-with-time-zone-support/) — First-class timezone support verification
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) — Browser compatibility for localization
- [MDN: Intl.Locale.getWeekInfo()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) — First day of week by locale
- [WAI-ARIA Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) — Official accessibility pattern
- [W3C WAI-ARIA APG: Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) — Keyboard navigation for calendar grids
- [Nielsen Norman Group: Date-Input Form Fields](https://www.nngroup.com/articles/date-input/) — UX best practices for date input
- [24 Accessibility: Making a Better Calendar](https://www.24a11y.com/2018/a-new-day-making-a-better-calendar/) — Accessibility expert guidance

### Secondary (MEDIUM confidence)
- [JavaScript Temporal in 2026](https://bryntum.com/blog/javascript-temporal-is-it-finally-here/) — Temporal API status (not production-ready)
- [Nolan Lawson: Shadow DOM Problems](https://nolanlawson.com/2023/08/23/use-web-components-for-what-theyre-good-at/) — Shadow DOM event retargeting
- [LamplightDev: Click Outside Web Component](https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/) — Click-outside detection pattern
- [Flatpickr Shadow DOM Issue #1024](https://github.com/flatpickr/flatpickr/issues/1024) — Real-world positioning issues
- [PrimeVue DatePicker in Web Components #7161](https://github.com/primefaces/primevue/issues/7161) — Stacking context problems
- [Dev.to: Date/Timezone Best Practices](https://dev.to/kcsujeet/how-to-handle-date-and-time-correctly-to-avoid-timezone-bugs-4o03) — DST handling strategies
- [Material Design Date Pickers](https://m2.material.io/components/date-pickers) — Design system patterns
- [USWDS: Date Picker Accessibility Tests](https://designsystem.digital.gov/components/date-picker/accessibility-tests/) — Government standard validation

### Tertiary (LOW confidence)
- [NPM Trends: date-fns vs dayjs vs luxon vs moment](https://npmtrends.com/date-fns-vs-dayjs-vs-luxon-vs-moment) — Usage statistics (community preference)
- [Reddit: Luxon vs date-fns](https://www.reddit.com/r/react/comments/1bpd2es/luxon_vs_datefns/) — Community feedback on timezone issues (unverified)
- [You Don't Need Moment.js](https://github.com/you-dont-need/You-Dont-Need-Momentjs/blob/master/README.md) — Migration guidance (general consensus)
- Bundle size claims for specific date-fns functions — Verify with actual build analysis during implementation

---
*Research completed: 2026-01-30*
*Ready for roadmap: yes*
*Critical risks identified: 14 pitfalls documented, all with prevention strategies*
*Recommended stack: date-fns v4.1.0 + native Intl API + Floating UI*
*Phase count: 5 phases (Foundation → Core UX → Time Picker → Range Picker → Docs/Testing)*
