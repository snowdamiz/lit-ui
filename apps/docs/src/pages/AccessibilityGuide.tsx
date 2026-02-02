/**
 * Accessibility Guide documentation page
 * Cross-cutting guide covering keyboard navigation, ARIA patterns, screen reader support,
 * focus management, and reduced motion for all date/time components.
 */

import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

// Keyboard shortcuts for Calendar
const calendarKeys = [
  { key: 'Arrow Left', action: 'Move to previous day' },
  { key: 'Arrow Right', action: 'Move to next day' },
  { key: 'Arrow Up', action: 'Move to same day in previous week' },
  { key: 'Arrow Down', action: 'Move to same day in next week' },
  { key: 'Home', action: 'Move to first day of the month' },
  { key: 'End', action: 'Move to last day of the month' },
  { key: 'Page Up', action: 'Move to same day in previous month' },
  { key: 'Page Down', action: 'Move to same day in next month' },
  { key: 'Shift + Page Up', action: 'Move to same day in previous year' },
  { key: 'Shift + Page Down', action: 'Move to same day in next year' },
  { key: 'Enter / Space', action: 'Select the focused date' },
  { key: '?', action: 'Open keyboard shortcuts help dialog' },
  { key: 'Escape', action: 'Close help dialog or drill back from year/month view' },
];

// Keyboard shortcuts for Date Picker
const datePickerKeys = [
  { key: 'Enter / Space', action: 'Open the calendar popup (when trigger focused)' },
  { key: 'Escape', action: 'Close the calendar popup and return focus to trigger' },
  { key: 'Tab', action: 'Move focus between elements within the popup (focus-trapped)' },
  { key: 'Arrow keys', action: 'Navigate dates within the calendar grid (same as Calendar)' },
];

// Keyboard shortcuts for Date Range Picker
const dateRangePickerKeys = [
  { key: 'Enter / Space', action: 'Open popup or select start/end date (two-click pattern)' },
  { key: 'Escape', action: 'Close popup without confirming selection' },
  { key: 'Tab', action: 'Move focus between elements within the popup (focus-trapped)' },
  { key: 'Arrow keys', action: 'Navigate dates within the calendar grid (same as Calendar)' },
];

// Keyboard shortcuts for Time Picker
const timePickerKeys = [
  { key: 'Arrow Up', action: 'Increment the focused time field (hour, minute, second, period)' },
  { key: 'Arrow Down', action: 'Decrement the focused time field' },
  { key: 'Tab', action: 'Move focus between time fields (hours, minutes, seconds, AM/PM)' },
  { key: 'Enter', action: 'Confirm value and close dropdown' },
  { key: 'Escape', action: 'Close dropdown without confirming' },
  { key: '0-9', action: 'Type a numeric value directly into the focused field' },
];

// ARIA roles per component
const ariaPatterns = [
  {
    component: 'Calendar',
    pattern: 'WAI-ARIA Grid Pattern',
    roles: 'role="grid" on table, role="gridcell" on date cells',
    details: 'Uses roving tabindex so the grid is a single Tab stop. Only the focused date has tabindex="0"; all others have tabindex="-1".',
  },
  {
    component: 'Date Picker',
    pattern: 'Combobox with Grid Popup',
    roles: 'role="combobox" on trigger, aria-haspopup="dialog", aria-expanded',
    details: 'The trigger button acts as a combobox. Opening the popup moves focus into the calendar grid. Escape closes and restores focus.',
  },
  {
    component: 'Date Range Picker',
    pattern: 'Combobox with Grid Popup',
    roles: 'role="combobox" on trigger, aria-haspopup="dialog", aria-expanded',
    details: 'Similar to Date Picker. A two-click selection pattern is announced via aria-live: first click sets start date, second click sets end date.',
  },
  {
    component: 'Time Picker',
    pattern: 'Spinbutton + Listbox',
    roles: 'role="spinbutton" on each field, role="listbox" on dropdown options',
    details: 'Each segment (hours, minutes, seconds, period) is a spinbutton. The dropdown clock view uses listbox for selectable times.',
  },
];

const ariaLiveExample = `<!-- Calendar month change announcement -->
<div aria-live="polite" class="sr-only">
  February 2026
</div>

<!-- Date selection announcement -->
<div aria-live="polite" class="sr-only">
  Selected Saturday, February 14, 2026
</div>

<!-- Range selection announcements -->
<div aria-live="polite" class="sr-only">
  Start date: February 10, 2026
</div>
<div aria-live="polite" class="sr-only">
  Range complete: February 10 to February 14, 2026
</div>

<!-- Time picker announcement -->
<div aria-live="polite" class="sr-only">
  2:30 PM
</div>`;

const disabledDateExample = `<!-- Disabled dates include a reason in aria-label -->
<td role="gridcell" aria-disabled="true">
  <button
    tabindex="-1"
    aria-label="January 1, 2026, unavailable: before minimum date"
    disabled
  >
    1
  </button>
</td>

<td role="gridcell" aria-disabled="true">
  <button
    tabindex="-1"
    aria-label="February 29, 2026, unavailable: weekend"
    disabled
  >
    29
  </button>
</td>`;

const focusTrapExample = `<!-- Focus trap in Date Picker popup -->
<!--
  When the popup opens:
  1. Focus moves to the currently selected date (or today)
  2. Tab cycles through: calendar grid → nav buttons → close
  3. Shift+Tab cycles in reverse
  4. Focus never leaves the popup until Escape or selection
  5. On close, focus returns to the trigger button
-->

<lui-date-picker label="Appointment date"></lui-date-picker>`;

const reducedMotionCSS = `/* Built into all date/time components */
@media (prefers-reduced-motion: reduce) {
  /* Calendar slide animations become instant transitions */
  .calendar-month-transition {
    transition: none;
  }

  /* Fade-in effects use instant opacity change */
  .popup-enter {
    animation: none;
    opacity: 1;
  }
}`;

export function AccessibilityGuide() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Accessibility
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            All date and time components follow WAI-ARIA Authoring Practices with full keyboard
            navigation, screen reader announcements, and reduced motion support.
          </p>
        </div>
      </header>

      <div className="space-y-16 animate-fade-in-up opacity-0 stagger-2">
        {/* Section 1: Keyboard Navigation */}
        <section id="keyboard-navigation" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Keyboard Navigation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete keyboard control for every component</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Every date and time component is fully operable with a keyboard. No mouse interaction is required.
          </p>

          {/* Calendar */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Calendar</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">Key</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {calendarKeys.map((k) => (
                  <tr key={k.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{k.key}</kbd>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{k.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Date Picker */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Date Picker</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Inherits all Calendar keyboard shortcuts when the popup is open, plus popup-specific controls:
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">Key</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {datePickerKeys.map((k) => (
                  <tr key={k.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{k.key}</kbd>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{k.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Date Range Picker */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Date Range Picker</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Uses the same Calendar keyboard shortcuts with a two-click selection pattern:
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">Key</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {dateRangePickerKeys.map((k) => (
                  <tr key={k.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{k.key}</kbd>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{k.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Time Picker */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Time Picker</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 w-48">Key</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {timePickerKeys.map((k) => (
                  <tr key={k.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{k.key}</kbd>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{k.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: ARIA Patterns */}
        <section id="aria-patterns" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">ARIA Patterns</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">WAI-ARIA design patterns used by each component</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Each component implements a specific WAI-ARIA Authoring Practices design pattern to ensure
            consistent behavior with assistive technologies.
          </p>

          <div className="space-y-4">
            {ariaPatterns.map((p) => (
              <div key={p.component} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.component}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                    {p.pattern}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{p.roles}</code>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{p.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Screen Reader Support */}
        <section id="screen-reader" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Screen Reader Support</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Live region announcements and descriptive labels</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All components use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-live="polite"</code> regions
            to announce state changes without interrupting the user's current focus.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">Live Region Announcements</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            These announcements are made automatically when the user interacts with components:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Month change</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">When navigating months, the new month and year are announced (e.g., "February 2026")</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date selection</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Announces the full date when selected (e.g., "Selected Saturday, February 14, 2026")</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Range selection</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Two-step announcements: "Start date: February 10, 2026" then "Range complete: February 10 to February 14, 2026"</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time value</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Announces the updated time when changed (e.g., "2:30 PM")</p>
              </div>
            </div>
          </div>

          <CodeBlock code={ariaLiveExample} language="html" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Disabled Date Descriptions</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Disabled dates include a human-readable reason in their <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-label</code> so
            screen reader users understand why a date cannot be selected:
          </p>

          <CodeBlock code={disabledDateExample} language="html" />
        </section>

        {/* Section 4: Focus Management */}
        <section id="focus-management" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Focus Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Focus trapping, restoration, and roving tabindex</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Proper focus management ensures keyboard users never lose their place in the page.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Focus Trap in Popups</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When a Date Picker, Date Range Picker, or Time Picker popup opens, focus is trapped inside. Pressing Tab cycles through
                interactive elements within the popup. Focus cannot escape to the page behind until the popup is closed.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Focus Restoration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When a popup closes (via Escape, selection, or clicking outside), focus returns to the trigger element that opened it.
                This ensures the user's position in the Tab order is preserved.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Roving Tabindex</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The calendar grid uses roving tabindex per the WAI-ARIA Grid Pattern. The entire grid is a single Tab stop.
                Only the currently focused date cell has <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">tabindex="0"</code>;
                all other cells have <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">tabindex="-1"</code>.
                Arrow keys move focus between cells without changing the Tab order.
              </p>
            </div>
          </div>

          <CodeBlock code={focusTrapExample} language="html" />
        </section>

        {/* Section 5: Reduced Motion */}
        <section id="reduced-motion" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reduced Motion</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Respecting user motion preferences</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All components respect the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">prefers-reduced-motion</code> media
            query. When enabled, animations are either removed or replaced with non-motion alternatives.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calendar month transitions</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Slide animations between months are replaced with instant transitions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Popup open/close</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fade and scale animations on popup entry/exit are removed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time picker</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">No motion-sensitive interactions - the clock face and dropdown work without animation dependencies</p>
              </div>
            </div>
          </div>

          <CodeBlock code={reducedMotionCSS} language="css" />

          <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">No configuration needed:</span>{' '}
              Reduced motion support is built into every component. It activates automatically based on the user's OS-level preference.
            </p>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <div className="divider-fade my-12" />
      <PrevNextNav
        prev={{ title: 'Agent Skills', href: '/guides/agent-skills' }}
        next={{ title: 'Form Integration', href: '/guides/form-integration' }}
      />
    </div>
  );
}
