import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom element
import '@lit-ui/calendar';

// Props data from source Calendar component (10 props)
const calendarProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Selected date as ISO string (YYYY-MM-DD).',
  },
  {
    name: 'locale',
    type: 'string',
    default: 'navigator.language',
    description: 'BCP 47 locale tag for localization (e.g. "en-US", "de-DE"). Defaults to browser locale.',
  },
  {
    name: 'min-date',
    type: 'string',
    default: '""',
    description: 'Minimum selectable date as ISO string. Dates before this are grayed out and not selectable.',
  },
  {
    name: 'max-date',
    type: 'string',
    default: '""',
    description: 'Maximum selectable date as ISO string. Dates after this are grayed out and not selectable.',
  },
  {
    name: 'disabled-dates',
    type: 'string[]',
    default: '[]',
    description: 'Comma-separated list of specific disabled dates as ISO strings (e.g., "2026-02-14,2026-02-15"). Also settable as a JS array.',
  },
  {
    name: 'first-day-of-week',
    type: 'string',
    default: '""',
    description: 'Override first day of week from locale. 1=Monday through 7=Sunday.',
  },
  {
    name: 'display-month',
    type: 'string',
    default: '""',
    description: 'Display a specific month without selecting a date. Accepts YYYY-MM-DD or YYYY-MM format. Used internally by CalendarMulti.',
  },
  {
    name: 'hide-navigation',
    type: 'boolean',
    default: 'false',
    description: 'Hide the month navigation header (prev/next buttons and heading). Used by CalendarMulti to suppress individual calendar navigation.',
  },
  {
    name: 'show-week-numbers',
    type: 'boolean',
    default: 'false',
    description: 'Show ISO week numbers in a column to the left of the day grid. Week number buttons allow selecting an entire week.',
  },
  {
    name: 'show-constraint-tooltips',
    type: 'boolean',
    default: 'false',
    description: 'Show tooltips on disabled dates explaining why they are disabled (e.g., "Before minimum date").',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const calendarCSSVars: CSSVarDef[] = [
  // Layout
  { name: '--ui-calendar-width', default: '320px', description: 'Width of the calendar container.' },
  { name: '--ui-calendar-day-size', default: '2.5rem', description: 'Width and height of date cell buttons.' },
  { name: '--ui-calendar-cell-size', default: '2.5rem', description: 'Alias for day-size used in some layout contexts.' },
  { name: '--ui-calendar-cell-radius', default: '0.375rem', description: 'Border radius for individual day cells.' },
  { name: '--ui-calendar-gap', default: '0.25rem', description: 'Gap between calendar grid items.' },
  { name: '--ui-calendar-radius', default: '0.375rem', description: 'Border radius for nav buttons and dropdowns.' },
  // Colors
  { name: '--ui-calendar-bg', default: 'var(--color-background, #ffffff)', description: 'Background color for the calendar.' },
  { name: '--ui-calendar-text', default: 'var(--color-foreground, currentColor)', description: 'Text color for the calendar.' },
  { name: '--ui-calendar-border', default: 'var(--color-border, #e5e7eb)', description: 'Border color for the help dialog and date cells.' },
  { name: '--ui-calendar-hover-bg', default: 'var(--color-muted, #f3f4f6)', description: 'Background color on hover for date and nav buttons.' },
  { name: '--ui-calendar-weekday-color', default: 'var(--color-muted-foreground, #6b7280)', description: 'Weekday header text color.' },
  { name: '--ui-calendar-nav-color', default: 'var(--color-foreground, currentColor)', description: 'Navigation arrow button color.' },
  // Today indicator
  { name: '--ui-calendar-today-font-weight', default: '600', description: "Font weight for today's date cell." },
  { name: '--ui-calendar-today-border', default: '2px solid var(--color-primary, var(--ui-color-primary))', description: "Border applied to today's date cell." },
  // Selected state
  { name: '--ui-calendar-selected-bg', default: 'var(--color-primary, var(--ui-color-primary))', description: 'Background color for the selected date.' },
  { name: '--ui-calendar-selected-text', default: 'var(--color-primary-foreground, white)', description: 'Text color for the selected date.' },
  // Opacity states
  { name: '--ui-calendar-outside-opacity', default: '0.4', description: 'Opacity for dates from adjacent months.' },
  { name: '--ui-calendar-disabled-opacity', default: '0.4', description: 'Opacity for disabled dates.' },
  // Focus
  { name: '--ui-calendar-focus-ring', default: 'var(--color-ring, var(--ui-color-ring))', description: 'Focus outline color for interactive elements.' },
  // Constraint tooltip (show-constraint-tooltips prop)
  { name: '--ui-calendar-tooltip-bg', default: 'var(--color-foreground, #111827)', description: 'Background color for constraint tooltips shown on disabled dates.' },
  { name: '--ui-calendar-tooltip-text', default: 'var(--color-background, #ffffff)', description: 'Text color for constraint tooltips shown on disabled dates.' },
];

// Code examples
const basicCode = `<lui-calendar></lui-calendar>`;

const selectedCode = `<lui-calendar value="2026-02-14"></lui-calendar>`;

const minMaxCode = `<lui-calendar
  min-date="2026-01-10"
  max-date="2026-02-20"
></lui-calendar>`;

const localeCode = `<!-- German locale: Monday start, German month/day names -->
<lui-calendar locale="de-DE"></lui-calendar>

<!-- Arabic locale: Saturday start, RTL month names -->
<lui-calendar locale="ar-SA"></lui-calendar>`;

const firstDayCode = `<!-- Force Monday start regardless of locale -->
<lui-calendar first-day-of-week="1"></lui-calendar>

<!-- Force Sunday start -->
<lui-calendar first-day-of-week="7"></lui-calendar>`;

const disabledDatesCode = `<lui-calendar disabled-dates="2026-02-14,2026-02-15,2026-02-16"></lui-calendar>`;

const eventsHtmlCode = `<lui-calendar
  onchange="console.log('Selected:', this.value)"
></lui-calendar>`;

const eventsReactCode = `<lui-calendar
  onchange={(e) => console.log('Selected:', e.target.value)}
/>`;

const eventsVueCode = `<lui-calendar
  @change="console.log('Selected:', $event.target.value)"
/>`;

const eventsSvelteCode = `<lui-calendar
  on:change={(e) => console.log('Selected:', e.target.value)}
/>`;

// Multi-month code examples
const multiMonthHtmlCode = `<lui-calendar-multi></lui-calendar-multi>`;

const multiMonthReactCode = `<lui-calendar-multi></lui-calendar-multi>`;

const multiMonthVueCode = `<lui-calendar-multi></lui-calendar-multi>`;

const multiMonthSvelteCode = `<lui-calendar-multi></lui-calendar-multi>`;

// Week numbers code example
const weekNumbersCode = `<lui-calendar show-week-numbers></lui-calendar>`;

// Decade/century navigation code example
const decadeNavHtmlCode = `<lui-calendar></lui-calendar>`;

const decadeNavReactCode = `<lui-calendar></lui-calendar>`;

const decadeNavVueCode = `<lui-calendar></lui-calendar>`;

const decadeNavSvelteCode = `<lui-calendar></lui-calendar>`;

// CalendarMulti props
const calendarMultiProps: PropDef[] = [
  {
    name: 'months',
    type: 'number',
    default: '2',
    description: 'Number of side-by-side month calendars to display (clamped to 2-3).',
  },
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Selected date as ISO string (YYYY-MM-DD). Forwarded to all child calendars.',
  },
  {
    name: 'locale',
    type: 'string',
    default: 'navigator.language',
    description: 'BCP 47 locale tag forwarded to child calendars.',
  },
  {
    name: 'min-date',
    type: 'string',
    default: '""',
    description: 'Minimum selectable date forwarded to child calendars.',
  },
  {
    name: 'max-date',
    type: 'string',
    default: '""',
    description: 'Maximum selectable date forwarded to child calendars.',
  },
  {
    name: 'show-week-numbers',
    type: 'boolean',
    default: 'false',
    description: 'Show ISO week numbers forwarded to child calendars.',
  },
  {
    name: 'first-day-of-week',
    type: 'string',
    default: '""',
    description: 'Override first day of week forwarded to child calendars.',
  },
];

const cssVarsCode = `/* Global override */
:root {
  --ui-calendar-selected-bg: var(--color-accent);
  --ui-calendar-today-border: var(--color-success);
  --ui-calendar-radius: 9999px;
}

/* Scoped override */
.booking-widget {
  --ui-calendar-width: 100%;
  --ui-calendar-day-size: 3rem;
  --ui-calendar-gap: 0.25rem;
}`;

// Helper to get today + offset as ISO string
function isoDate(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

export function CalendarPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Calendar
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible date calendar with month navigation, keyboard support, locale-aware formatting, date constraints, multi-month display, gesture navigation, and drill-down decade/century views.
            </p>
          </div>
        </header>

        {/* Examples Section */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Examples</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Interactive demonstrations of common use cases</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* 1. Basic */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A standalone calendar displaying the current month. Click a date to select it, or use arrow keys to navigate.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar></lui-calendar>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Pre-selected Date */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Pre-selected Date</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> attribute with an ISO date string to set the initially selected date.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar value="2026-02-14"></lui-calendar>
              }
              html={selectedCode}
              react={selectedCode}
              vue={selectedCode}
              svelte={selectedCode}
            />
          </section>

          {/* 3. Min/Max Date Constraints */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Date Constraints</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">min-date</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-date</code> to restrict selectable dates. Dates outside the range are grayed out with an accessible label explaining why.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar
                  min-date={isoDate(-5)}
                  max-date={isoDate(30)}
                ></lui-calendar>
              }
              html={minMaxCode}
              react={minMaxCode}
              vue={minMaxCode}
              svelte={minMaxCode}
            />
          </section>

          {/* 4. Locale */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Locale</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">locale</code> attribute controls month names, weekday names, and the first day of week. Defaults to the browser locale.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-6">
                  <lui-calendar locale="de-DE"></lui-calendar>
                  <lui-calendar locale="ja-JP"></lui-calendar>
                </div>
              }
              html={localeCode}
              react={localeCode}
              vue={localeCode}
              svelte={localeCode}
            />
          </section>

          {/* 5. First Day of Week */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">First Day of Week</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override the locale-detected first day of week with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">first-day-of-week</code>. Values follow the Intl format: 1=Monday through 7=Sunday.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-6">
                  <lui-calendar first-day-of-week="1"></lui-calendar>
                </div>
              }
              html={firstDayCode}
              react={firstDayCode}
              vue={firstDayCode}
              svelte={firstDayCode}
            />
          </section>

          {/* 6. Disabled Dates */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled Dates</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">disabled-dates</code> attribute with a comma-separated list of ISO date strings to disable specific dates. These receive an "unavailable" label for screen readers.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar
                  disabled-dates="2026-02-14,2026-02-15,2026-02-16"
                  min-date={isoDate(-3)}
                  max-date={isoDate(60)}
                ></lui-calendar>
              }
              html={disabledDatesCode}
              react={disabledDatesCode}
              vue={disabledDatesCode}
              svelte={disabledDatesCode}
            />
          </section>

          {/* 7. Events */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Listening to Events</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The calendar emits a standard <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">change</code> event when a date is selected (updating the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> property) and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">month-change</code> when navigating months.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar></lui-calendar>
              }
              html={eventsHtmlCode}
              react={eventsReactCode}
              vue={eventsVueCode}
              svelte={eventsSvelteCode}
            />
          </section>

          {/* Advanced Features divider */}
          <div className="flex items-center gap-4 mb-8 mt-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Advanced Features</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Multi-month display, week numbers, and drill-down navigation</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* 8. Multi-Month Display */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Multi-Month Display</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-calendar-multi</code> component renders 2 or 3 side-by-side calendars showing consecutive months. It provides unified navigation controls and forwards all props (value, locale, constraints) to its child calendars. On narrow containers, the calendars stack vertically via CSS container queries.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar-multi></lui-calendar-multi>
              }
              html={multiMonthHtmlCode}
              react={multiMonthReactCode}
              vue={multiMonthVueCode}
              svelte={multiMonthSvelteCode}
            />
          </section>

          {/* 9. Week Numbers */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Week Numbers</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">show-week-numbers</code> to display ISO week numbers in a column to the left of each week row. Clicking a week number emits a <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">week-select</code> event with the week number and all selectable dates in that week.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar show-week-numbers></lui-calendar>
              }
              html={weekNumbersCode}
              react={weekNumbersCode}
              vue={weekNumbersCode}
              svelte={weekNumbersCode}
            />
          </section>

          {/* 10. Decade/Century Navigation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Decade and Century Views</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Click the month/year heading to drill into a <strong>year view</strong> (4x3 grid of years in the current decade). Click the decade heading again to reach the <strong>century view</strong> (4x3 grid of decades). Select a decade or year to drill back down. Press <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Escape</code> to navigate back up one level. This enables fast navigation to distant dates without repeatedly clicking prev/next.
            </p>
            <ExampleBlock
              preview={
                <lui-calendar></lui-calendar>
              }
              html={decadeNavHtmlCode}
              react={decadeNavReactCode}
              vue={decadeNavVueCode}
              svelte={decadeNavSvelteCode}
            />
          </section>

          {/* Accessibility */}
          <section>
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Accessibility</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Screen reader and keyboard interaction details</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">1</span>
                  Follows the WAI-ARIA Grid Pattern with roving <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">tabindex</code> for single-tab-stop grid navigation.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Arrow keys move focus between dates. Home/End jump to first/last day. PageUp/PageDown navigate months. Enter/Space select.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Month changes announced via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-live="polite"</code> region. Selected dates also announced.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Today uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-current="date"</code>. Disabled dates include reason in <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-label</code>.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Press <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">?</code> to open a keyboard shortcuts help dialog listing all available shortcuts.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">6</span>
                  Swipe gestures on touch devices navigate between months (swipe left for next, swipe right for previous).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">7</span>
                  Month transition animations respect the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">prefers-reduced-motion</code> media query. Animations are disabled when the user prefers reduced motion.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">8</span>
                  Week number buttons are keyboard-accessible with visible focus indicators and descriptive <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-label</code> text.
                </li>
              </ul>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Calendar exposes CSS custom properties for theming. Override them globally or scoped to a container.
            </p>
          </section>

          {/* CSS Custom Properties example */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change calendar appearance globally or within a scoped container.
            </p>
            <CodeBlock code={cssVarsCode} language="css" />
          </section>
        </div>

        {/* API Reference */}
        <section className="mt-20 mb-14 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">API Reference</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props, events, and styling</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{calendarProps.length}</span>
            </div>
            <PropsTable props={calendarProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{calendarCSSVars.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {calendarCSSVars.map((cssVar) => (
                    <tr key={cssVar.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{cssVar.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{cssVar.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cssVar.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</h3>
            </div>
            <div className="space-y-4">
              <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">change</code>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Fired when a date is selected. The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> property is updated to the ISO string. Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ date: Date, isoString: string }'}</code>
                  </p>
                </div>
              </div>
              <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">month-change</code>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Fired when the displayed month changes via navigation buttons, dropdowns, or keyboard. Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ year: number, month: number }'}</code>
                  </p>
                </div>
              </div>
              <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">week-select</code>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Fired when a week number button is clicked (requires <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">show-week-numbers</code>). Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ weekNumber: number, dates: Date[], isoStrings: string[] }'}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CalendarMulti Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CalendarMulti Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{calendarMultiProps.length}</span>
            </div>
            <PropsTable props={calendarMultiProps} />
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Button', href: '/components/button' }}
          next={{ title: 'Checkbox', href: '/components/checkbox' }}
        />
      </div>
    </FrameworkProvider>
  );
}
