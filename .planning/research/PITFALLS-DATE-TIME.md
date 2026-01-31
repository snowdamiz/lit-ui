# Domain Pitfalls: Date/Time Components

**Domain:** Web component date/time pickers
**Project:** LitUI v4.3 - Date/Time Components
**Researched:** 2026-01-30
**Confidence:** HIGH (verified with multiple authoritative sources)

## Critical Pitfalls

### Pitfall 1: Calendar Popup Positioning Breaks with Shadow DOM Stacking Contexts

**What goes wrong:**
Date picker calendar popovers are clipped, positioned incorrectly, or appear beneath other page elements. The calendar may be cut off at viewport edges or z-index conflicts cause it to render behind overlapping content.

**Why it happens:**
Shadow DOM creates new stacking contexts that isolate z-index values. Floating UI's `position: fixed` calculations reference the viewport, but the shadow boundary can interfere with coordinate systems. Additionally, `<body>` overflow clipping can trap popovers inside scrollable containers.

**Consequences:**
- Users cannot see full calendar grid
- Click targets are unresponsive (clipped outside visible area)
- Visual polish suffers (popover appears "broken")

**Prevention:**
1. **Use @floating-ui/dom with explicit boundary detection:**
   ```typescript
   import { computePosition, flip, shift, offset } from '@floating-ui/dom';

   const { x, y } = await computePosition(this.triggerRef, this.popoverRef, {
     placement: 'bottom-start',
     middleware: [
       offset(8),
       flip({ boundary: document.body }),  // Handle edge cases
       shift({ padding: 8 })                // Keep in viewport
     ]
   });
   ```
2. **Set popover to `position: fixed`** with high z-index in shadow styles
3. **Append popover to body** (escape shadow boundary) OR use `position: absolute` with proper coordinate transformation
4. **Test in scrollable containers** and near viewport edges

**Warning signs:**
- Calendar cut off at screen edges
- Calendar appears behind modals/dropdowns
- ScrollParent causes calendar to drift away from trigger
- Popover coordinates don't align with input in nested shadow DOMs

**Detection:**
- Manual testing: Open date picker near right/bottom edges of viewport
- Automated: Visual regression tests at viewport corners
- Scrollable container test: Embed date picker in `overflow: auto` container

**Phase to address:**
Phase 1 (DatePicker Core) - Foundation. Cannot build working date picker without solving this.

**Severity:** CRITICAL

**Sources:**
- [Flatpickr Shadow DOM Issue #1024](https://github.com/flatpickr/flatpickr/issues/1024)
- [PrimeVue DatePicker in Web Components #7161](https://github.com/primefaces/primevue/issues/7161)
- [Nolan Lawson: Shadow DOM Problems](https://nolanlawson.com/2023/08/23/use-web-components-for-what-theyre-good-at/)
- [JavaScript.info: Shadow DOM Events](https://javascript.info/shadow-dom-events)

---

### Pitfall 2: Click-Outside-to-Close Fails with Event Retargeting

**What goes wrong:**
Calendar popover doesn't close when clicking outside it. Traditional "click outside" detection fails because `event.target` is retargeted to the host element when events bubble from shadow DOM.

**Why it happens:**
Shadow DOM retargets events for encapsulation. When you click inside the calendar's shadow root, the event that reaches the document has `event.target` set to the date picker host, not the actual clicked element. Your "is target outside component" check incorrectly returns true.

**Consequences:**
- Calendar stays open indefinitely (requires escape key or second click)
- Multiple calendars can be open simultaneously
- Broken UX expectations (dropdowns should close on outside click)

**Prevention:**
1. **Use `event.composedPath()` instead of `event.target`:**
   ```typescript
   private handleClickOutside(event: MouseEvent) {
     const path = event.composedPath();
     const clickedInside = path.includes(this);

     if (!clickedInside && this.isOpen) {
       this.isOpen = false;
     }
   }

   // In connectedCallback
   document.addEventListener('click', this.handleClickOutside);
   ```
2. **Attach click listener to document** (not shadow root)
3. **Clean up listener in disconnectedCallback** to prevent memory leaks
4. **Alternative:** Use `<dialog>` element which handles this natively (but has other tradeoffs)

**Warning signs:**
- Clicking page background doesn't close calendar
- Clicking other UI elements doesn't dismiss popover
- Multiple date pickers open simultaneously

**Detection:**
- Manual: Click outside open calendar, verify it closes
- Unit test: Spy on document click, verify popover closes

**Phase to address:**
Phase 1 (DatePicker Core) - Core UX pattern.

**Severity:** CRITICAL

**Sources:**
- [LamplightDev: Click Outside Web Component](https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/)
- [StackOverflow: Click Outside Shadow DOM](https://stackoverflow.com/questions/37369960/determine-if-user-clicked-outside-shadow-dom)
- [JavaScript.info: Shadow DOM Events](https://javascript.info/shadow-dom-events)

---

### Pitfall 3: ARIA Grid Keyboard Navigation Fails Without Roving Tabindex

**What goes wrong:**
Arrow keys don't move focus within calendar grid. Screen readers don't announce cell positions. Tab key focuses every single date cell instead of skipping the grid. Users cannot navigate calendar with keyboard.

**Why it happens:**
Calendar grids require ARIA `role="grid"` with roving tabindex pattern:
- Only one cell has `tabindex="0"` at a time
- All other cells have `tabindex="-1"`
- Arrow keys move focus AND update tabindex programmatically

Without this implementation, every cell is focusable via Tab, making keyboard navigation unusable.

**Consequences:**
- Keyboard users must Tab through 35+ date cells to reach next control
- Screen readers don't announce "Monday, January 5" (just generic cell info)
- Arrow keys do nothing (non-functional for keyboard users)
- WCAG 2.1.1 violation (keyboard accessibility)

**Prevention:**
1. **Implement W3C ARIA APG Grid Pattern:**
   ```typescript
   // Calendar grid setup
   private updateGridFocus(focusedDate: Date) {
     // Reset all cells to -1
     this.dateCells.forEach(cell => cell.tabIndex = -1);

     // Set focused cell to 0
     const focusedCell = this.getCellForDate(focusedDate);
     focusedCell.tabIndex = 0;
     focusedCell.focus();
   }

   // Arrow key handler
   private handleGridKeydown(event: KeyboardEvent) {
     const currentDate = this.getFocusedDate();
     let newDate: Date;

     switch (event.key) {
       case 'ArrowLeft':
         newDate = addDays(currentDate, -1);
         break;
       case 'ArrowRight':
         newDate = addDays(currentDate, 1);
         break;
       case 'ArrowUp':
         newDate = addDays(currentDate, -7);
         break;
       case 'ArrowDown':
         newDate = addDays(currentDate, 7);
         break;
       case 'Home':
         newDate = startOfWeek(currentDate);
         break;
       case 'End':
         newDate = endOfWeek(currentDate);
         break;
       case 'PageUp':
         newDate = addMonths(currentDate, -1);
         break;
       case 'PageDown':
         newDate = addMonths(currentDate, 1);
         break;
       default:
         return; // Not an arrow key
     }

     event.preventDefault();
     this.updateGridFocus(newDate);
   }
   ```
2. **Set grid container to `role="grid"`** with `aria-multiselectable="false"`
3. **Each cell is `role="gridcell"`** with `aria-label` or `aria-selected`
4. **Month navigation buttons are `role="button"`** with `aria-label="Previous month"`

**Warning signs:**
- Tab key focuses every date cell individually
- Arrow keys scroll page instead of moving calendar focus
- Screen reader announces "grid 7 columns" but not cell contents
- Focus gets "stuck" in calendar

**Detection:**
- Manual keyboard test: Tab into calendar, try arrow keys
- Screen reader test: NVDA/VoiceOver should announce dates
- axe DevTools: Check for ARIA grid violations

**Phase to address:**
Phase 1 (DatePicker Core) - Accessibility is non-negotiable.

**Severity:** CRITICAL

**Sources:**
- [W3C WAI-ARIA APG: Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [MDN: ARIA Grid Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/grid_role)
- [Deque University: ARIA Keyboard Patterns](https://dequeuniversity.com/tips/aria-keyboard-patterns)
- [PatternFly: Calendar Month Accessibility](https://www.patternfly.org/components/date-and-time/calendar-month/accessibility)

---

### Pitfall 4: Form Value Format Mismatch (ISO8601 vs Display Format)

**What goes wrong:**
Date picker displays "01/15/2026" but form submits "2026-01-15" (ISO8601). Backend expects one format, receives another. Timezone offsets cause dates to shift by a day. Form submission includes/excludes time incorrectly.

**Why it happens:**
- **HTML5 `<input type="date">`** always uses `YYYY-MM-DD` format for value
- **JavaScript `Date`** includes timezone (new Date('2026-01-15') creates midnight UTC)
- **Display formatting** uses locale (US: MM/DD/YYYY, EU: DD/MM/YYYY)
- **Timezone confusion:** Parse "2026-01-15" → UTC midnight → display in local timezone = previous day

**Consequences:**
- Backend validation fails (format mismatch)
- Users select Jan 15 but backend receives Jan 14 (timezone off-by-one)
- Form submission blocked by server
- Data corruption in database

**Prevention:**
1. **Always store/submit ISO8601 (YYYY-MM-DD) without timezone:**
   ```typescript
   // ElementInternals form value
   this.internals?.setFormValue(this.value ? formatISO(this.value) : '');

   // formatISO returns "2026-01-15" (no time, no timezone)
   ```
2. **Use library for formatting (don't roll your own):**
   - Recommended: **date-fns** (lightweight, tree-shakeable)
   - Alternative: **Tempora**l (new JS standard, but browser support incomplete)
   - Avoid: Moment.js (legacy, large)
3. **Parse user input with explicit timezone:**
   ```typescript
   // BAD: Loses timezone info
   const date = new Date('2026-01-15');

   // GOOD: Use library
   const date = parse(userInput, 'MM/dd/yyyy', new Date());
   ```
4. **Document the contract:** Display format is locale-specific, value format is always ISO8601
5. **TimePicker:** Always submit with timezone offset or explicitly UTC

**Warning signs:**
- Form submission shows different date than selected
- Backend logs show "Invalid date format" errors
- Date shifts by ±1 day for users in certain timezones
- Console shows "Invalid Date" warnings

**Detection:**
- Unit test: Set date to Jan 15, verify form value is "2026-01-15"
- Integration test: Submit form with date, verify backend receives ISO8601
- Timezone test: Set system timezone to UTC±12, verify date doesn't shift

**Phase to address:**
Phase 1 (DatePicker Core) - Form integration is essential.

**Severity:** CRITICAL

**Sources:**
- [MDN: input type="date"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date)
- [Dev.to: Date/Timezone Best Practices](https://dev.to/kcsujeet/how-to-handle-date-and-time-correctly-to-avoid-timezone-bugs-4o03)
- [Medium: UTC vs Timezone Bugs](https://medium.com/@sawinskif/utc-vs-timezone-bugs-that-keep-happening-6f98adfe4977)
- [StackOverflow: DatePicker ISO Format](https://stackoverflow.com/questions/52077119/ng-date-picker-how-to-format-to-different-output-instead-of-iso-8601)

---

### Pitfall 5: Screen Reader Announces Date Picker Incorrectly

**What goes wrong:**
Screen readers announce "Choose date" when calendar opens, but don't announce selected date changes. Don't read "January 15, 2026" when user navigates to that cell. Announce "blank" for disabled dates. Date range pickers don't announce start/end dates.

**Why it happens:**
- Missing `aria-live` region for announcing selection changes
- Grid cells lack proper `aria-label` or `aria-selected`
- Calendar navigation doesn't trigger announcements
- Focus moves but screen reader doesn't know what to announce

**Consequences:**
- Blind users can't use date picker effectively
- WCAG 2.1 violation (level AA)
- Screen reader users frustrated ("What date did I just select?")

**Prevention:**
1. **Add `aria-live` region for announcements:**
   ```html
   <div aria-live="polite" aria-atomic="true" class="sr-only">
     ${this.announcementText}
   </div>
   ```
2. **Update announcement on date selection:**
   ```typescript
   private handleDateSelect(date: Date) {
     this.value = date;
     this.announcementText = `Selected ${formatDateLong(date)}`;
   }
   ```
3. **Each grid cell must have accessibility markup:**
   ```html
   <td
     role="gridcell"
     aria-label="${formatDateLong(cellDate)}"
     aria-selected="${isDateSelected(cellDate)}"
     aria-disabled="${isDateDisabled(cellDate)}"
     tabindex="${isFocused ? 0 : -1}"
   >
     ${format(cellDate, 'd')}
   </td>
   ```
4. **Month/year dropdowns need `aria-label`:**
   ```html
   <select aria-label="Select month">
   <select aria-label="Select year">
   ```
5. **Date range picker:** Announce "Start date selected: January 15" and "End date selected: January 20"

**Warning signs:**
- Screen reader only announces numbers ("1", "2", "3") not full dates
- No announcement when date is selected
- Disabled dates announced as "blank"
- NVDA/VoiceOver test reveals silence or incorrect info

**Detection:**
- Manual screen reader test (NVDA, VoiceOver, TalkBack)
- axe DevTools: Check for ARIA grid violations
- Verify `aria-live` region exists and updates

**Phase to address:**
Phase 1 (DatePicker Core) - Accessibility is non-negotiable.

**Severity:** CRITICAL

**Sources:**
- [WAI-ARIA APG: Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
- [USWDS: Date Range Picker Accessibility](https://designsystem.digital.gov/components/date-range-picker/accessibility-tests/)
- [React DayPicker: Accessibility Guide](https://daypicker.dev/guides/accessibility)
- [Hassell Inclusion: Collecting Dates Accessibly](https://www.hassellinclusion.com/blog/collecting-dates-accessible/)

---

### Pitfall 6: DST Transition Causes Invalid/Impossible Times

**What goes wrong:**
Time picker allows selecting times that don't exist during DST spring-forward (2:00-3:00 AM doesn't exist). Fall-back creates ambiguity (1:30 AM occurs twice). Date arithmetic across DST boundaries produces wrong hour values.

**Why it happens:**
- **Spring forward:** Clocks jump from 1:59 AM to 3:00 AM. Times between 2:00-2:59 don't exist.
- **Fall back:** Clocks go from 1:59 AM back to 1:00 AM. 1:00-1:59 AM occur twice.
- **JavaScript `Date`** applies local timezone DST rules automatically
- **Library pitfalls:** Some libraries don't handle DST boundaries correctly

**Consequences:**
- Users can select "invalid" times that cause backend errors
- Appointment scheduling has wrong times (off by 1 hour)
- Calendar events show incorrect times for users in different timezones
- Date math produces unexpected results (adding 24 hours ≠ same time next day across DST)

**Prevention:**
1. **Use date-fns for DST-safe operations:**
   ```typescript
   import { addDays, setHours, setMinutes } from 'date-fns';
   import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

   // DST-safe: Add 24 hours (respects DST)
   const tomorrow = addDays(today, 1);

   // For timezone-specific times:
   const userTime = utcToZonedTime(utcDate, userTimezone);
   ```
2. **Block invalid times in UI during spring-forward:**
   ```typescript
   const isInvalidTime = (date: Date): boolean => {
     const hour = getHours(date);
     const month = getMonth(date);
     const day = getDate(date);

     // Check if this is the DST transition hour
     const isDSTTransition = isDSTTransitionDay(date);
     if (isDSTTransition && hour === 2) {
       return true; // 2:00-2:59 doesn't exist
     }
     return false;
   };
   ```
3. **Handle ambiguity in fall-back:**
   - Show both times as "1:30 AM (1st occurrence)" and "1:30 AM (2nd occurrence)"
   - Or default to standard time (second occurrence)
4. **Store times in UTC** (or with explicit timezone offset)
5. **Test DST boundaries explicitly** in unit tests

**Warning signs:**
- Time picker shows 2:00-3:00 AM during spring-forward
- Backend rejects times as "invalid"
- Users report events being 1 hour off
- Date math produces unexpected results

**Detection:**
- Unit test: Create date for spring-forward day, verify 2:00 AM is invalid
- Integration test: Schedule event across DST boundary, verify correct time
- Manual test: Change system timezone, test time picker

**Phase to address:**
Phase 2 (TimePicker) - DST is a time picker concern.

**Severity:** IMPORTANT (not critical for DatePicker-only)

**Sources:**
- [Dev.to: JavaScript DST Confusion](https://dev.to/urin/say-goodbye-to-javascripts-dst-date-confusion-24mj)
- [Angular: Timepicker DST Edge Case #31803](https://github.com/angular/components/issues/31803)
- [Code of Matt: Beware Time Edge Cases](https://codeofmatt.com/beware-the-edge-cases-of-time/)
- [UX StackExchange: Time at DST Changeover](https://ux.stackexchange.com/questions/16826/how-to-enter-time-at-dst-changeover)

---

## Moderate Pitfalls

### Pitfall 7: Date Parsing Inconsistencies Across Browsers

**What goes wrong:**
Date strings parse differently in Chrome vs Safari vs Firefox. `Date.parse('01/02/2026')` is Jan 2 in US, Feb 1 in EU. `new Date('2026-01-02')` works in Chrome but fails in older Safari. `toLocaleString()` formats vary by browser.

**Why it happens:**
- JavaScript `Date.parse()` and `Date` constructor are implementation-dependent
- No standard for date string parsing (ES spec says "implementation-dependent")
- Browsers have different locale defaults
- **Historical:** RFC 2822 vs ISO 8601 confusion

**Consequences:**
- User input "01/02/2026" produces wrong date in different regions
- Safari throws "Invalid Date" for strings that work in Chrome
- Unit tests pass in Chrome but fail in Safari
- Form validation fails unexpectedly

**Prevention:**
1. **NEVER parse date strings with `Date.parse()` or `new Date(string)`:**
   ```typescript
   // BAD: Implementation-dependent
   const date = new Date('01/02/2026');

   // GOOD: Use library
   import { parse } from 'date-fns';
   const date = parse(userInput, 'MM/dd/yyyy', new Date());
   ```
2. **Always use explicit format strings:**
   ```typescript
   // Tell date-fns exactly what format to expect
   const date = parse(input, 'yyyy-MM-dd', new Date());
   ```
3. **For display, use `Intl.DateTimeFormat` or date-fns `format`:**
   ```typescript
   // GOOD: Locale-aware formatting
   const formatted = new Intl.DateTimeFormat('en-US', {
     year: 'numeric',
     month: 'long',
     day: 'numeric'
   }).format(date);

   // GOOD: Library formatting
   import { format } from 'date-fns';
   const formatted = format(date, 'MMMM d, yyyy');
   ```
4. **Validate user input before parsing:**
   - Regex check format matches expected pattern
   - Show inline validation errors for malformed dates

**Warning signs:**
- "Invalid Date" in console
- Dates off by 1 month/day
- Different behavior in Safari vs Chrome
- Unit tests fail in specific browsers

**Detection:**
- Cross-browser unit tests
- Manual test in Safari, Chrome, Firefox
- Verify `Date.parse()` is NOT used in codebase

**Phase to address:**
Phase 1 (DatePicker Core) - Add date-fns dependency from start.

**Severity:** IMPORTANT

**Sources:**
- [MDN: Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)
- [StackOverflow: toLocaleString Inconsistencies](https://stackoverflow.com/questions/13428678/inconsistent-behavior-of-tolocalestring-in-different-browser)
- [Medium: Date Formatting Consistency](https://medium.com/@prateek.dbg/date-formatting-in-javascript-ensuring-consistency-across-locales-0fc513aaf834)
- [Hackernoon: JavaScript Dates Are Broken](https://hackernoon.com/dates-in-javascript-are-broken-who-shall-fix-them)

---

### Pitfall 8: First Day of Week Hard-Coded to Sunday/Monday

**What goes wrong:**
Calendar always shows Sunday as first day (US convention), but international users expect Monday (ISO 8601, EU standard). Users in Middle East expect Saturday. Calendar feels "foreign" to non-US users.

**Why it happens:**
- Many libraries hard-code Sunday or Monday
- Developers assume "everyone uses what I use"
- Missing locale-aware first-day detection

**Consequences:**
- International users frustrated
- Calendar doesn't match regional conventions
- Weekend days highlighted incorrectly (Saturday-Sunday vs Friday-Saturday)
- Professionalism suffers (feels US-centric)

**Prevention:**
1. **Detect first day from locale:**
   ```typescript
   // Use Intl API to get first day of week
   const getFirstDayOfWeek = (locale: string): number => {
     // 0 = Sunday, 1 = Monday, etc.
     const region = locale.split('-')[1] || 'US';

     // Map regions to first day (simplified)
     const firstDayMap: Record<string, number> = {
       'US': 0,  // Sunday
       'GB': 1,  // Monday
       'FR': 1,  // Monday
       'DE': 1,  // Monday
       'SA': 6,  // Saturday (Saudi Arabia)
       'AE': 6,  // Saturday (UAE)
     };

     return firstDayMap[region] ?? 1; // Default to Monday
   };
   ```
2. **Or use library (date-fns has locale support):**
   ```typescript
   import { de } from 'date-fns/locale';
   import { format } from 'date-fns';

   // German locale uses Monday as first day
   const formatted = format(date, 'yyyy-MM-dd', { locale: de });
   ```
3. **Allow manual override:**
   ```html
   <lui-date-picker first-day-of-week="monday"></lui-date-picker>
   ```
4. **Highlight weekend days correctly** based on locale (not always Sat-Sun)

**Warning signs:**
- Calendar always starts on Sunday
- International users report "wrong" calendar
- Weekend highlighting doesn't match regional norms

**Detection:**
- Manual test: Change browser locale, verify calendar adapts
- Test with users from different regions
- Check date-fns locale imports

**Phase to address:**
Phase 1 (DatePicker Core) - Add locale support from start.

**Severity:** IMPORTANT

**Sources:**
- [TC39: Intl.getCalendarInfo() First Day Issue #6](https://github.com/tc39/ecma402/issues/6)
- [Vanilla Calendar: First Day Internationalization](https://vanilla-calendar.pro/docs/learn/internationalization-weekday-first-and-weekdays)
- [ZK Developer's Reference: First Day of Week](https://www.zkoss.org/wiki/ZK_Developer's_Reference/Internationalization/The_First_Day_of_the_Week)
- [Apple Developer: Locale.firstDayOfWeek](https://developer.apple.com/documentation/foundation/locale/components/firstdayofweek)

---

### Pitfall 9: Month/Year Labels Not Localized

**What goes wrong:**
Calendar shows "January 2026" for all users, regardless of locale. Month names are English-only. Day names (Mon, Tue, Wed) not translated. RTL languages (Arabic, Hebrew) show LTR layout.

**Why it happens:**
- Hard-coded English strings
- Missing `i18n` or locale prop
- Not using `Intl.DateTimeFormat` for month/day names
- No RTL layout support

**Consequences:**
- Non-English users have poor UX
- Product feels unprofessional internationally
- RTL users see reversed/incorrect layout
- Accessibility suffers for non-English screen readers

**Prevention:**
1. **Use `Intl.DateTimeFormat` for month/day names:**
   ```typescript
   // Get month name in user's locale
   const monthName = new Intl.DateTimeFormat(locale, {
     month: 'long'
   }).format(date);

   // Get day names
   const dayNames = [...Array(7)].map((_, i) => {
     const date = new Date(2026, 0, i + 4); // Jan 4, 2026 is Sunday
     return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
   });
   // Returns ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] (en-US)
   // or ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."] (fr-FR)
   ```
2. **Accept `locale` prop:**
   ```typescript
   @property({ type: String })
   locale: string = navigator.language || 'en-US';
   ```
3. **Support RTL layouts:**
   ```typescript
   // Detect RTL and apply direction
   const isRTL = ['ar', 'he', 'fa'].includes(locale.split('-')[0]);

   // In CSS
   :host([dir="rtl"]) .calendar-grid {
     direction: rtl;
   }
   ```
4. **Use date-fns locales for comprehensive i18n:**
   ```typescript
   import { es, de, fr, ar, ja } from 'date-fns/locale';
   import { format } from 'date-fns';

   const formatted = format(date, 'MMMM yyyy', { locale: es });
   ```

**Warning signs:**
- Month names always English
- No `locale` prop or `navigator.language` usage
- Arabic/Hebrew users see LTR layout
- No RTL CSS or direction handling

**Detection:**
- Manual test: Set browser locale to French, verify month names in French
- RTL test: Set locale to Arabic, verify RTL layout
- Code review: Check for hard-coded month/day name arrays

**Phase to address:**
Phase 1 (DatePicker Core) - Add i18n from start.

**Severity:** IMPORTANT

**Sources:**
- [CSS-Tricks: Calendars with Accessibility and i18n](https://css-tricks.com/making-calendars-with-accessibility-and-internationalization-in-mind/)
- [Lokalise: Date/Time Localization](https://lokalise.com/blog/date-time-localization/)
- [W3C: Internationalization Best Practices](https://www.w3.org/International/)

---

### Pitfall 10: Calendar Performance Degraded with Large Date Ranges

**What goes wrong:**
Date picker shows 12-month view or multi-year selector. Rendering 365+ date cells causes lag. Month navigation triggers re-render of entire calendar. Scrolling through years stutters.

**Why it happens:**
- Rendering all cells upfront (no virtualization)
- Excessive DOM operations on month change
- Not using `key` attributes for efficient Lit updates
- Large date ranges (e.g., date range picker spanning years)

**Consequences:**
- Laggy month navigation (100ms+ delays)
- Janky scrolling
- Poor perceived performance
- Mobile battery drain

**Prevention:**
1. **Limit visible cells (never render full year):**
   - Single month view: ~35-42 cells (manageable)
   - Avoid "year view" with 365+ cells
   - Use dropdown for year selection instead of grid
2. **Use Lit's `key` directive for efficient updates:**
   ```typescript
   import { repeat } from 'lit/directives/repeat.js';

   render() {
     return html`
       <div class="calendar-grid">
         ${repeat(this.dates, date => date.toISOString(), (date) => {
           return html`<div>...</div>`;
         })}
       </div>
     `;
   }
   ```
3. **Debounce month navigation:**
   ```typescript
   private handleMonthChange = debounce((direction: number) => {
     this.currentMonth = addMonths(this.currentMonth, direction);
   }, 50);
   ```
4. **For date range pickers, consider virtualization:**
   - Only render visible months in viewport
   - Use `IntersectionObserver` to lazy-load months
   - Or limit range to ±1 year from current date

**Warning signs:**
- Month navigation takes >50ms
- Chrome DevTools Performance shows long tasks
- Frame rate drops during calendar interactions
- Memory usage grows with calendar usage

**Detection:**
- Chrome DevTools Performance tab: Record month navigation
- Lighthouse: Check Performance score
- Manual test: Rapidly click month navigation, feel for lag

**Phase to address:**
Phase 2 (DateRangePicker) - Single month is fast, but date ranges need optimization.

**Severity:** IMPORTANT

**Sources:**
- [FullCalendar: Resource Timeline Performance #5673](https://github.com/fullcalendar/fullcalendar/issues/5673)
- [Mobiscroll: Virtual Scroll Documentation](https://mobiscroll.com/docs/vue/eventcalendar/timeline)
- [React Native Calendars: Performance Issue #1453](https://github.com/wix/react-native-calendars/issues/1453)
- [Dev.to: Large Dataset Rendering](https://www.syncfusion.com/blogs/post/render-large-datasets-in-react)

---

### Pitfall 11: Focus Management Breaks After Month Navigation

**What goes wrong:**
User navigates months with arrow buttons, but focus doesn't return to the grid. Screen reader focus gets "lost" in navigation buttons. Tabbing after month change focuses unexpected elements. Escape key doesn't close calendar.

**Why it happens:**
- Month navigation buttons don't return focus to grid after click
- Focus trap not implemented for calendar popover
- No `aria-activedescendant` or roving tabindex on navigation
- Missing keyboard handler for Escape/Tab

**Consequences:**
- Keyboard users can't efficiently navigate months
- Screen reader users confused ("Where did focus go?")
- Tab order disrupted after month change
- WCAG 2.4.3 violation (focus order)

**Prevention:**
1. **Return focus to grid after month navigation:**
   ```typescript
   private handlePreviousMonth() {
     this.currentMonth = addMonths(this.currentMonth, -1);

     // Find first day of new month and focus it
     const firstDayCell = this.getFirstDayCell();
     firstDayCell?.focus();
   }
   ```
2. **Implement focus trap for calendar popover:**
   ```typescript
   private handleKeydown(event: KeyboardEvent) {
     switch (event.key) {
       case 'Escape':
         this.close();
         this.triggerRef.focus(); // Return focus to trigger
         break;
       case 'Tab':
         // Trap focus within calendar
         if (event.shiftKey && this.isFirstFocusableElement(document.activeElement)) {
           event.preventDefault();
           this.lastFocusableElement.focus();
         } else if (!event.shiftKey && this.isLastFocusableElement(document.activeElement)) {
           event.preventDefault();
           this.firstFocusableElement.focus();
         }
         break;
     }
   }
   ```
3. **Ensure navigation buttons are focusable and labeled:**
   ```html
   <button
     aria-label="Previous month"
     @click="${this.handlePreviousMonth}"
   >
     ‹
   </button>
   ```
4. **Set initial focus when calendar opens:**
   ```typescript
   private open() {
     this.isOpen = true;
     // Focus selected date, or today if none selected
     const cellToFocus = this.selectedDateCell || this.todayCell;
     cellToFocus?.focus();
   }
   ```

**Warning signs:**
- Focus disappears after clicking month navigation
- Tab key takes focus outside calendar unexpectedly
- Escape key doesn't close calendar
- Screen reader announces "button" but not which month

**Detection:**
- Manual keyboard test: Navigate months, verify focus stays in calendar
- Screen reader test: Verify focus tracking announcements
- axe DevTools: Check for focus order violations

**Phase to address:**
Phase 1 (DatePicker Core) - Keyboard accessibility is essential.

**Severity:** IMPORTANT

**Sources:**
- [WAI-ARIA APG: Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
- [Cal.com: Accessible Calendar Best Practices](https://cal.com/it/blog/designing-an-accessible-calendar-app-best-practices-for-inclusivity)
- [PatternFly: Calendar Month Accessibility](https://www.patternfly.org/components/date-and-time/calendar-month/accessibility)

---

### Pitfall 12: Leap Year/Leap Second Edge Cases

**What goes wrong:**
February 29 shows as invalid date. Year selection doesn't include 2024 (leap year). Date arithmetic across Feb 29 produces wrong results (e.g., adding 1 year to Feb 29, 2024 = Feb 29, 2025 which doesn't exist).

**Why it happens:**
- Not accounting for leap years in date validation
- Adding years naively (just increment year number) without checking day validity
- Missing leap year rules (divisible by 4, except centuries not divisible by 400)

**Consequences:**
- Users born on Feb 29 can't select their birthday
- Date arithmetic produces "March 1" instead of error
- Backend validation fails for Feb 29 dates
- Year-ahead calculations fail

**Prevention:**
1. **Use date-fns for date arithmetic (handles leap years):**
   ```typescript
   import { addYears, isValid } from 'date-fns';

   const nextYear = addYears(new Date('2024-02-29'), 1);
   // Returns March 1, 2025 (correct behavior, not error)

   // Check if date is valid
   if (isValid(nextYear)) {
     // Date exists
   }
   ```
2. **Allow Feb 29 in date picker UI:**
   ```typescript
   const isLeapYear = (year: number): boolean => {
     return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
   };

   const daysInMonth = (month: number, year: number): number => {
     if (month === 1 && !isLeapYear(year)) {
       return 28; // February in non-leap year
     }
     return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
   };
   ```
3. **Document leap year behavior:**
   - Adding 1 year to Feb 29 → Feb 28 or March 1 (choose one)
   - Be consistent with native JS behavior
4. **Leap seconds:** Ignore (JS Date doesn't support leap seconds, 23:59:60 doesn't exist)

**Warning signs:**
- Feb 29 missing from calendar in leap years
- Date arithmetic across Feb 29 produces wrong dates
- Unit tests fail for leap year dates

**Detection:**
- Unit test: Feb 29, 2024 should be valid
- Unit test: Add 1 year to Feb 29, 2024 → verify result
- Manual test: Select Feb 29 in leap year

**Phase to address:**
Phase 1 (DatePicker Core) - Edge cases from start.

**Severity:** NICE-TO-HAVE (rare edge case, but important for correctness)

**Sources:**
- [date-fns: addYears Documentation](https://date-fns.org/v3.0.0-alpha.1/docs/addYears)
- [MDN: Date Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

---

## Minor Pitfalls

### Pitfall 13: Mobile Touch Conflicts (Scroll vs Swipe)

**What goes wrong:**
User tries to scroll page while touching calendar, but calendar intercepts touch. Swipe gesture to change months conflicts with page scroll. Small tap targets on mobile cause missed taps.

**Why it happens:**
- Calendar prevents default on touch events
- Month swipe gestures interfere with scroll
- Tap targets <44px (iOS guideline)
- Touch event listeners not properly managed

**Consequences:**
- Mobile users frustrated (can't scroll page)
- Accidental month changes when trying to scroll
- Difficult to tap specific dates on phone
- Poor mobile UX

**Prevention:**
1. **Don't implement swipe gestures for month navigation** (use buttons)
2. **Ensure tap targets are at least 44x44px:**
   ```css
   .date-cell {
     min-width: 44px;
     min-height: 44px;
   }
   ```
3. **Don't preventDefault on touch unless necessary:**
   ```typescript
   private handleTouchStart(event: TouchEvent) {
     // Only prevent default if touching interactive element
     if ((event.target as HTMLElement).closest('button')) {
       // event.preventDefault(); // Only if needed
     }
   }
   ```
4. **Test on real mobile devices** (emulators aren't enough)

**Warning signs:**
- Page scroll blocked when touching calendar
- Accidental month changes on mobile
- Difficult to tap dates on phone
- Touch lag or unresponsiveness

**Detection:**
- Manual mobile test: Try scrolling page while touching calendar
- iOS Simulator test: Verify 44px tap targets
- Android test: Verify touch responsiveness

**Phase to address:**
Phase 1 (DatePicker Core) - Mobile usability from start.

**Severity:** NICE-TO-HAVE

**Sources:**
- [iOS Human Interface Guidelines: Touch Targets](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design: Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics)

---

### Pitfall 14: Virtual Keyboard Covers Calendar on Mobile

**What goes wrong:**
On mobile, tapping date input opens virtual keyboard which covers the calendar popover. User can't see dates. Keyboard doesn't dismiss when calendar opens.

**Why it happens:**
- Input remains focused when calendar opens
- Virtual keyboard stays visible
- Calendar positioned based on non-keyboard viewport
- Mobile browser keyboards take up 50%+ of screen

**Consequences:**
- Calendar hidden behind keyboard
- Users can't select dates
- Must dismiss keyboard manually (poor UX)

**Prevention:**
1. **Blur input when calendar opens:**
   ```typescript
   private openCalendar() {
     this.inputRef.blur(); // Dismiss virtual keyboard
     this.isOpen = true;
   }
   ```
2. **Or use readonly input (calendar-only mode):**
   ```html
   <input
     readonly
     @click="${this.openCalendar}"
   />
   ```
3. **Position calendar above keyboard if input stays focused:**
   - Use `visualViewport` API to detect keyboard height
   - Adjust calendar position dynamically
4. **Test on mobile devices** (keyboard behavior varies by browser)

**Warning signs:**
- Calendar covered by keyboard on mobile
- Input cursor visible when calendar is open
- Can't see dates when calendar opens

**Detection:**
- Manual mobile test: Open date picker on iPhone/Android
- Verify calendar is visible
- Check if keyboard dismisses

**Phase to address:**
Phase 1 (DatePicker Core) - Mobile usability from start.

**Severity:** NICE-TO-HAVE (mobile-specific)

**Sources:**
- [WebDev: VisualViewport API](https://web.dev/articles/visual-viewport)
- [StackOverflow: Virtual Keyboard Covers Content](https://stackoverflow.com/questions/34151340/virtual-keyboard-covers-input-field-on-mobile-devices)

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| **Phase 1: DatePicker** | Shadow DOM positioning | Pitfall 1: Calendar popover clipped | Use @floating-ui/dom with flip/shift middleware |
| **Phase 1: DatePicker** | Event retargeting | Pitfall 2: Click-outside fails | Use `event.composedPath()` instead of `event.target` |
| **Phase 1: DatePicker** | ARIA grid navigation | Pitfall 3: Keyboard navigation broken | Implement W3C roving tabindex pattern |
| **Phase 1: DatePicker** | Form integration | Pitfall 4: ISO8601 format mismatch | Use date-fns, always submit ISO8601 |
| **Phase 1: DatePicker** | Screen reader announcements | Pitfall 5: Missing aria-live | Add aria-live region, update on selection |
| **Phase 1: DatePicker** | Focus management | Pitfall 11: Focus lost after month nav | Return focus to grid, trap focus in popover |
| **Phase 1: DatePicker** | Date parsing | Pitfall 7: Browser inconsistencies | Use date-fns `parse()`, never `Date.parse()` |
| **Phase 1: DatePicker** | Internationalization | Pitfall 8: First day of week | Detect from locale, use `Intl` API |
| **Phase 1: DatePicker** | Internationalization | Pitfall 9: Month names not localized | Use `Intl.DateTimeFormat` for labels |
| **Phase 2: TimePicker** | DST handling | Pitfall 6: Invalid/ambiguous times | Use date-fns-tz, block invalid times |
| **Phase 2: DateRangePicker** | Performance | Pitfall 10: Large date ranges | Virtualization, limit visible cells |
| **All phases** | Mobile | Pitfall 13: Touch conflicts | Don't prevent scroll, 44px tap targets |
| **All phases** | Mobile | Pitfall 14: Virtual keyboard | Blur input when calendar opens |
| **All phases** | Edge cases | Pitfall 12: Leap years | Use date-fns, test Feb 29 |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Shadow DOM positioning | HIGH | Multiple authoritative sources (Flatpickr, PrimeVue issues) |
| Event retargeting | HIGH | Official MDN and JavaScript.info documentation |
| ARIA grid navigation | HIGH | W3C APG is authoritative source |
| Form value format | HIGH | MDN and multiple implementation guides |
| Screen reader announcements | HIGH | WAI-ARIA APG and USWDS tests |
| DST handling | HIGH | Multiple blog posts and library issues |
| Date parsing | HIGH | MDN explicitly states implementation-dependent |
| First day of week | HIGH | TC39 issue and locale documentation |
| Month localization | HIGH | `Intl.DateTimeFormat` is standard API |
| Performance | HIGH | Real-world issues in major libraries |
| Focus management | HIGH | WAI-ARIA APG dialog pattern |
| Leap years | HIGH | date-fns documentation |
| Touch/mobile | MEDIUM | iOS/Material guidelines are clear, but behavior varies |
| Virtual keyboard | MEDIUM | visualViewport API is newer, less battle-tested |

**Overall confidence:** HIGH

## Integration with Existing LitUI Patterns

### Use Existing Infrastructure

1. **@floating-ui/dom** - Already used in Select for dropdown positioning
2. **ElementInternals** - Already used in Input, Select for form participation
3. **TailwindElement** - Base class for all components
4. **dispatchCustomEvent** - Already in @lit-ui/core for event handling
5. **CSS design tokens** - Follow `--ui-datepicker-*` convention

### New Dependency Required

**date-fns** (or date-fns-tz for timezones):
- Lightweight, tree-shakeable
- Better than Moment.js (legacy)
- More reliable than native Date API
- Handles DST, leap years, parsing

```bash
npm install date-fns
npm install -D @types/date-fns
```

For timezone support (TimePicker):
```bash
npm install date-fns-tz
```

## Testing Requirements

### Critical Tests (Must Have)

1. **Shadow DOM positioning:**
   - Open date picker at right/bottom viewport edges
   - Verify calendar not clipped
   - Test in scrollable container

2. **Click-outside:**
   - Open calendar, click outside
   - Verify calendar closes
   - Test with nested shadow DOMs

3. **Keyboard navigation:**
   - Tab into calendar
   - Arrow keys move focus
   - Escape closes, returns focus to trigger
   - Screen reader announces dates

4. **Form submission:**
   - Select date, submit form
   - Verify value is ISO8601 format
   - Test form reset

5. **DST boundaries:**
   - Create date for spring-forward day
   - Verify 2:00-2:59 AM is invalid
   - Test fall-back ambiguity

6. **Internationalization:**
   - Test with French locale (month names in French)
   - Test with Arabic (RTL layout)
   - Verify first day of week adapts

### Cross-Browser Testing

- Chrome (primary dev browser)
- Safari (Date parsing differences)
- Firefox
- Edge
- Mobile Safari (iOS)
- Mobile Chrome (Android)

### Screen Reader Testing

- NVDA + Firefox
- VoiceOver + Safari
- TalkBack + Chrome
- JAWS + Edge (if available)

## Sources

### Primary Sources (HIGH confidence)
- [W3C WAI-ARIA APG: Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [W3C WAI-ARIA APG: Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [MDN: Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)
- [JavaScript.info: Shadow DOM Events](https://javascript.info/shadow-dom-events)

### Expert Articles (HIGH confidence)
- [Nolan Lawson: Shadow DOM Problems](https://nolanlawson.com/2023/08/23/use-web-components-for-what-theyre-good-at/)
- [Dev.to: Date/Timezone Best Practices](https://dev.to/kcsujeet/how-to-handle-date-and-time-correctly-to-avoid-timezone-bugs-4o03)
- [LamplightDev: Click Outside Web Component](https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/)
- [CSS-Tricks: Calendars with Accessibility and i18n](https://css-tricks.com/making-calendars-with-accessibility-and-internationalization-in-mind/)

### Implementation References (MEDIUM-HIGH confidence)
- [Flatpickr Shadow DOM Issue #1024](https://github.com/flatpickr/flatpickr/issues/1024)
- [PrimeVue DatePicker in Web Components #7161](https://github.com/primefaces/primevue/issues/7161)
- [Angular: Timepicker DST Edge Case #31803](https://github.com/angular/components/issues/31803)
- [USWDS: Date Range Picker Accessibility](https://designsystem.digital.gov/components/date-range-picker/accessibility-tests/)
- [React DayPicker: Accessibility Guide](https://daypicker.dev/guides/accessibility)
- [PatternFly: Calendar Month Accessibility](https://www.patternfly.org/components/date-and-time/calendar-month/accessibility)

### Locale/Internationalization (HIGH confidence)
- [TC39: Intl.getCalendarInfo() First Day Issue #6](https://github.com/tc39/ecma402/issues/6)
- [Vanilla Calendar: First Day Internationalization](https://vanilla-calendar.pro/docs/learn/internationalization-weekday-first-and-weekdays)
- [Apple Developer: Locale.firstDayOfWeek](https://developer.apple.com/documentation/foundation/locale/components/firstdayofweek)
- [Lokalise: Date/Time Localization](https://lokalise.com/blog/date-time-localization/)

### Performance (MEDIUM confidence)
- [FullCalendar: Resource Timeline Performance #5673](https://github.com/fullcalendar/fullcalendar/issues/5673)
- [Mobiscroll: Virtual Scroll Documentation](https://mobiscroll.com/docs/vue/eventcalendar/timeline)
- [React Native Calendars: Performance Issue #1453](https://github.com/wix/react-native-calendars/issues/1453)
- [Dev.to: Large Dataset Rendering](https://www.syncfusion.com/blogs/post/render-large-datasets-in-react)

---

**Research completed:** 2026-01-30
**Ready for roadmap:** Yes
**Critical risks identified:** 6 critical, 6 moderate, 3 minor pitfalls documented
**Severity breakdown:** 6 CRITICAL, 6 IMPORTANT, 3 NICE-TO-HAVE
