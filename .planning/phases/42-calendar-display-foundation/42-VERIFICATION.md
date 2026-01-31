---
phase: 42-calendar-display-foundation
verified: 2026-01-31T08:29:29Z
status: gaps_found
score: 3/5 must-haves verified
gaps:
  - truth: "User can navigate the calendar using keyboard (arrow keys, Home/End, Page Up/Down) with roving tabindex"
    status: failed
    reason: "KeyboardNavigationManager class exists but is NOT integrated into Calendar component - all keyboard nav code was removed in commit 91829d9"
    artifacts:
      - path: "packages/calendar/src/calendar.ts"
        issue: "Missing: firstUpdated(), handleKeydown(), setupCells(), navigationManager field, and @keydown event binding"
      - path: "packages/calendar/src/keyboard-nav.ts"
        issue: "Orphaned - class exists but is never imported or instantiated in Calendar"
    missing:
      - "Import KeyboardNavigationManager in calendar.ts"
      - "Add private navigationManager field (not @state)"
      - "Add firstUpdated() lifecycle with isServer guard and requestAnimationFrame setup"
      - "Add setupCells() method to query .date-button elements and call navigationManager.setCells()"
      - "Add handleKeydown() event handler with KEY_TO_DIRECTION map"
      - "Add @keydown event binding to calendar-grid div"
      - "Add boundary crossing logic for seamless month navigation"
      - "Add Enter/Space to trigger selection on focused cell"
      - "Add initial tabindex='0' to first current-month date button in template"
  - truth: "Only the focused date cell has tabindex='0'; all others have tabindex='-1' (roving tabindex)"
    status: failed
    reason: "No tabindex management exists - all date buttons are equally tabbable"
    artifacts:
      - path: "packages/calendar/src/calendar.ts"
        issue: "Template has no tabindex attributes on date buttons"
    missing:
      - "Initial declarative tabindex in template for first current-month button"
      - "Imperative tabindex management via navigationManager.updateTabindexes()"
---

# Phase 42: Calendar Display Foundation Verification Report

**Phase Goal:** Standalone calendar component with month grid, navigation, keyboard accessibility, and screen reader support.

**Verified:** 2026-01-31T08:29:29Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User sees a 7-column month grid with weekday headers that displays the current month | ✓ VERIFIED | Calendar renders with `grid-template-columns: repeat(7, 1fr)`, getCalendarDays() generates full grid including leading/trailing days, weekday headers use getWeekdayNames() |
| 2 | User can navigate between months using previous/next buttons and month/year dropdowns | ✓ VERIFIED | Prev/next buttons call navigatePrevMonth()/navigateNextMonth(), month/year dropdowns with handleMonthSelect()/handleYearSelect(), year range 150 years (currentYear-100 to +50) |
| 3 | User can navigate the calendar using keyboard (arrow keys, Home/End, Page Up/Down) with roving tabindex | ✗ FAILED | KeyboardNavigationManager class exists in keyboard-nav.ts but is ORPHANED - never imported/used in calendar.ts. All keyboard integration code removed in commit 91829d9 |
| 4 | User hears screen reader announcements for month changes and selected dates via aria-live regions | ✓ VERIFIED | Belt-and-suspenders pattern: aria-live="polite" on h2#month-heading + dedicated .visually-hidden announcement region. announceMonthChange() updates liveAnnouncement in all nav paths (prev/next/dropdowns). Date selection updates liveAnnouncement with formatted date |
| 5 | User sees today indicator, selected date highlight, and disabled dates with visual distinctions and proper ARIA | ✗ FAILED | Partial implementation - today indicator (`.today` class, `aria-current="date"`) and selected state (`aria-selected="true"`) work correctly. Disabled dates have `aria-disabled="true"` with reasons. BUT keyboard navigation missing means users cannot reach/interact with dates via keyboard |

**Score:** 3/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/calendar/package.json` | Package config with date-fns peer dependency | ✓ VERIFIED | 56 lines, date-fns ^4.0.0 in peerDependencies, exports configured |
| `packages/calendar/src/date-utils.ts` | Date manipulation utilities wrapping date-fns | ✓ VERIFIED | 93 lines, exports getCalendarDays, getMonthYearLabel, intlFirstDayToDateFns, re-exports date-fns functions |
| `packages/calendar/src/intl-utils.ts` | Intl API helpers for locale-aware calendar | ✓ VERIFIED | 126 lines, exports getFirstDayOfWeek (3-level fallback), getWeekdayNames, getWeekdayLongNames, getMonthNames |
| `packages/calendar/src/calendar.ts` | lui-calendar component with full features | ⚠️ PARTIAL | 750 lines, MISSING keyboard navigation integration (firstUpdated, handleKeydown, navigationManager usage) |
| `packages/calendar/src/keyboard-nav.ts` | KeyboardNavigationManager for roving tabindex | ⚠️ ORPHANED | 127 lines, class complete and correct, BUT never imported or used in calendar.ts |
| `packages/calendar/src/index.ts` | Package entry with element registration | ✓ VERIFIED | 60 lines, safe customElements.define with collision detection, exports Calendar, KeyboardNavigationManager, utilities |
| `packages/calendar/src/jsx.d.ts` | JSX type declarations | ✓ VERIFIED | 53 lines, React/Vue/Svelte support for lui-calendar attributes and events |
| `packages/core/src/styles/tailwind.css` | Calendar CSS custom property tokens | ✓ VERIFIED | 28 --ui-calendar-* tokens defined (width, day-size, gap, radius, colors, opacity) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `calendar.ts` | `date-fns` | import functions | ✓ WIRED | Imports via date-utils.ts wrapper |
| `calendar.ts` | `date-utils.ts` | import getCalendarDays | ✓ WIRED | Used in render() to generate days array |
| `calendar.ts` | `intl-utils.ts` | import getWeekdayNames | ✓ WIRED | Used in render() for weekday headers |
| `calendar.ts` | `keyboard-nav.ts` | import KeyboardNavigationManager | ✗ NOT_WIRED | Import statement missing, never instantiated |
| `calendar.ts` | consumer | ui-date-select CustomEvent | ✓ WIRED | dispatchCustomEvent in handleDateSelect() |
| `calendar.ts` | consumer | ui-month-change CustomEvent | ✓ WIRED | dispatchCustomEvent in emitMonthChange() |
| `calendar.ts` | screen reader | aria-live polite region text updates | ✓ WIRED | liveAnnouncement state bound to visually-hidden div[role="status"][aria-live="polite"] |
| `core/tailwind.css` | `calendar.ts` | CSS custom properties | ✓ WIRED | Tokens cascade into Shadow DOM, used in component styles |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| CAL-01: 7-column month grid with weekday headers | ✓ SATISFIED | - |
| CAL-02: Today indicator with aria-current="date" | ✓ SATISFIED | - |
| CAL-03: Selected date visual distinction | ✓ SATISFIED | - |
| CAL-04: Prev/next navigation buttons with ARIA | ✓ SATISFIED | - |
| CAL-05: Month dropdown selector | ✓ SATISFIED | - |
| CAL-06: Year dropdown for distant dates | ✓ SATISFIED | 150-year range |
| CAL-07: Keyboard navigation (arrows, Home/End, PageUp/Down) | ✗ BLOCKED | KeyboardNavigationManager not integrated |
| CAL-08: Roving tabindex implementation | ✗ BLOCKED | No tabindex management exists |
| CAL-09: Screen reader announces month changes | ✓ SATISFIED | - |
| CAL-10: Screen reader announces selected date | ✓ SATISFIED | - |
| CAL-11: Min date constraint disables earlier dates | ✓ SATISFIED | - |
| CAL-12: Max date constraint disables later dates | ✓ SATISFIED | - |
| CAL-13: Specific dates can be disabled | ✓ SATISFIED | - |
| CAL-14: Disabled dates include reason in aria-label | ✓ SATISFIED | - |
| CAL-15: First day of week localizes | ✓ SATISFIED | - |
| CAL-16: Month names localize | ✓ SATISFIED | - |
| CAL-17: Weekday names localize | ✓ SATISFIED | - |
| CAL-18: Dark mode via :host-context(.dark) | ✓ SATISFIED | - |
| CAL-19: SSR with Declarative Shadow DOM | ⚠️ PARTIAL | isServer guard in effectiveLocale getter, BUT missing guards in lifecycle methods (no firstUpdated exists to guard) |

**Requirements Score:** 15/19 satisfied, 2 blocked, 2 partial

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| keyboard-nav.ts | 1-127 | Orphaned module | 🛑 Blocker | Complete keyboard navigation class exists but is never imported or used - indicates incomplete integration |
| calendar.ts | 617-749 | Missing event handler | 🛑 Blocker | Help dialog LISTS keyboard shortcuts (PageUp, arrows, etc.) but no @keydown binding or handleKeydown() method exists |
| calendar.ts | - | Missing lifecycle | 🛑 Blocker | No firstUpdated() method to initialize keyboard navigation manager |
| calendar.ts | 702-712 | No tabindex attributes | 🛑 Blocker | Date buttons have no tabindex, all are equally tabbable (violates roving tabindex pattern) |

### Human Verification Required

#### 1. Visual Rendering

**Test:** Open the calendar component in a browser
**Expected:** 
- 7-column grid displays current month with weekday headers
- Today's date has a visible border ring
- Selected date has filled background
- Outside-month dates are dimmed (40% opacity)
- Disabled dates are grayed (50% opacity)
**Why human:** Visual appearance cannot be verified programmatically

#### 2. Mouse Interaction

**Test:** Click on various dates in the calendar
**Expected:**
- Clicking a current-month date highlights it and emits ui-date-select event
- Clicking outside-month dates does nothing
- Clicking disabled dates does nothing
- Previous/next arrows navigate months
- Month/year dropdowns jump to selected month/year
**Why human:** Click behavior and visual feedback need manual testing

#### 3. Screen Reader Announcements

**Test:** Use NVDA/JAWS/VoiceOver to navigate the calendar
**Expected:**
- Month changes announce "Now showing [Month Year]"
- Date selection announces "Selected [Weekday, Month Day, Year]"
- Today's date announces with "current date" indication
- Disabled dates announce reason (e.g., "before minimum date")
**Why human:** Screen reader audio output requires human verification

#### 4. Dark Mode

**Test:** Add `.dark` class to an ancestor element
**Expected:**
- Calendar background darkens
- Text color inverts to light
- Hover states use dark-appropriate colors
- All interactive elements remain visible and accessible
**Why human:** Visual dark mode appearance needs manual verification

#### 5. Locale Behavior

**Test:** Set `locale="de-DE"` and `locale="en-US"` attributes
**Expected:**
- German locale starts week on Monday (Montag) with German weekday names
- US locale starts week on Sunday with English names
- Month dropdown shows localized month names
- Date labels use localized formatting
**Why human:** Locale-specific rendering needs manual verification across multiple locales

### Gaps Summary

**2 critical gaps block goal achievement:**

## Gap 1: Keyboard Navigation Not Integrated

**Truth Failed:** User can navigate the calendar using keyboard

**Root Cause:** Commit 91829d9 (Plan 06 - date constraints) overwrote calendar.ts and removed all keyboard navigation code that was added in commits 6cdb766 (Plan 04 Task 2).

**Evidence:**
- `KeyboardNavigationManager` class exists in `keyboard-nav.ts` (127 lines, complete implementation)
- Git history shows keyboard nav was implemented in commit 6cdb766
- Current `calendar.ts` has NO import, NO firstUpdated(), NO handleKeydown(), NO @keydown binding
- Help dialog lists keyboard shortcuts but they don't work

**Impact:**
- CAL-07 requirement (keyboard navigation) blocked
- CAL-08 requirement (roving tabindex) blocked
- Keyboard users cannot navigate the calendar at all
- Screen reader users cannot efficiently browse dates

**What's Missing:**

In `packages/calendar/src/calendar.ts`:

1. **Import statement:**
   ```typescript
   import { KeyboardNavigationManager } from './keyboard-nav.js';
   ```

2. **Private field (NOT @state):**
   ```typescript
   private navigationManager: KeyboardNavigationManager | null = null;
   private focusedIndex: number = 0;
   ```

3. **Lifecycle method:**
   ```typescript
   protected override firstUpdated(): void {
     if (isServer) return;
     this.navigationManager = new KeyboardNavigationManager(7);
     requestAnimationFrame(() => this.setupCells());
   }
   ```

4. **Cell setup method:**
   ```typescript
   private setupCells(): void {
     if (!this.navigationManager) return;
     const buttons = Array.from(
       this.renderRoot.querySelectorAll('.date-button:not(.outside-month)')
     ) as HTMLElement[];
     this.navigationManager.setCells(buttons);
     const todayIndex = days.findIndex(d => isToday(d) && isSameMonth(d, this.currentMonth));
     this.focusedIndex = todayIndex >= 0 ? todayIndex : 0;
     this.navigationManager.setFocusedIndex(this.focusedIndex);
   }
   ```

5. **Keyboard event handler:**
   ```typescript
   private handleKeydown(e: KeyboardEvent): void {
     if (!this.navigationManager) return;
     
     const KEY_TO_DIRECTION = {
       ArrowLeft: 'left',
       ArrowRight: 'right',
       ArrowUp: 'up',
       ArrowDown: 'down',
       Home: 'home',
       End: 'end',
     };
     
     const direction = KEY_TO_DIRECTION[e.key];
     if (direction) {
       e.preventDefault();
       const result = this.navigationManager.moveFocus(direction);
       if (result === -1) {
         // Handle boundary crossing - navigate to adjacent month
         // (See commit 6cdb766 for full implementation)
       } else {
         this.focusedIndex = result;
       }
       return;
     }
     
     if (e.key === 'PageUp') {
       e.preventDefault();
       this.navigatePrevMonth();
       // Preserve focus position after render
       return;
     }
     
     if (e.key === 'PageDown') {
       e.preventDefault();
       this.navigateNextMonth();
       // Preserve focus position after render
       return;
     }
     
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       const focusIdx = this.navigationManager.getFocusedIndex();
       const days = getCalendarDays(this.currentMonth, this.weekStartsOn);
       const currentMonthDays = days.filter(d => isSameMonth(d, this.currentMonth));
       if (focusIdx >= 0 && focusIdx < currentMonthDays.length) {
         this.handleDateSelect(currentMonthDays[focusIdx]);
       }
       return;
     }
   }
   ```

6. **Template binding in render():**
   ```typescript
   <div
     class="calendar-grid"
     role="grid"
     aria-labelledby="month-heading"
     @keydown="${this.handleKeydown}"
   >
   ```

7. **Initial tabindex in date button template:**
   ```typescript
   let currentMonthButtonIndex = 0;
   ${days.map((day) => {
     const outsideMonth = !isSameMonth(day, this.currentMonth);
     let tabindex = -1;
     if (!outsideMonth) {
       if (currentMonthButtonIndex === 0) {
         tabindex = 0; // First current-month button is tabbable
       }
       currentMonthButtonIndex++;
     }
     return html`
       <button
         class="date-button ..."
         tabindex="${tabindex}"
         ...
       >
   ```

8. **Updated lifecycle hook:**
   ```typescript
   protected override updated(changedProperties: PropertyValues): void {
     super.updated(changedProperties);
     // ... existing logic ...
     if (changedProperties.has('currentMonth' as keyof this)) {
       requestAnimationFrame(() => this.setupCells());
     }
   }
   ```

**Reference Implementation:** Git commit 6cdb766 contains the complete working integration.

## Gap 2: SSR Guards Missing in Lifecycle

**Truth Affected:** SSR with Declarative Shadow DOM

**Issue:** The calendar has `isServer` guard in the `effectiveLocale` getter, but no lifecycle methods that need guarding exist (because firstUpdated was removed with keyboard nav).

**When keyboard nav is restored:**
- firstUpdated() MUST start with `if (isServer) return;`
- Any requestAnimationFrame, querySelector, focus() calls must be guarded
- Component should render template on server but skip DOM manipulation

**Currently:** SSR works for static rendering but this is fragile - once lifecycle methods are added, guards are required.

---

**Verification Timestamp:** 2026-01-31T08:29:29Z
**Verifier:** Claude (gsd-verifier)
**Next Steps:** Run `/gsd:plan-phase --gaps` to create plan(s) addressing these gaps.
