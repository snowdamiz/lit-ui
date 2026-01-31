import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';

// Side-effect import to register custom elements from built library
import '@lit-ui/calendar';

// Props data from source Calendar component
const calendarProps: PropDef[] = [
  {
    name: 'locale',
    type: 'string',
    default: '"en-US"',
    description: 'Locale for date formatting (BCP 47 language tag). Controls weekday names and month/year label formatting.',
  },
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Currently selected date in ISO 8601 format (YYYY-MM-DD).',
  },
  {
    name: 'minDate',
    type: 'string',
    default: '""',
    description: 'Minimum selectable date in ISO 8601 format (YYYY-MM-DD). Dates before this are disabled.',
  },
  {
    name: 'maxDate',
    type: 'string',
    default: '""',
    description: 'Maximum selectable date in ISO 8601 format (YYYY-MM-DD). Dates after this are disabled.',
  },
  {
    name: 'disabledDates',
    type: 'string[]',
    default: '[]',
    description: 'Array of dates to disable in ISO 8601 format (YYYY-MM-DD).',
  },
  {
    name: 'disableWeekends',
    type: 'boolean',
    default: 'false',
    description: 'Whether to disable Saturday and Sunday dates.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Whether to allow multiple date selection.',
  },
];

// Events data
const calendarEvents: EventDef[] = [
  {
    name: 'ui-date-select',
    detail: '{ date: string }',
    description: 'Emitted when a date is selected. The detail contains the selected date in ISO 8601 format (YYYY-MM-DD).',
  },
  {
    name: 'ui-month-change',
    detail: '{ year: number, month: number }',
    description: 'Emitted when the displayed month changes. The detail contains the year and month (0-11) of the new view.',
  },
];

// Code examples
const basicCode = `<lui-calendar></lui-calendar>`;

const localizedCode = `<lui-calendar locale="fr-FR"></lui-calendar>
<lui-calendar locale="de-DE"></lui-calendar>
<lui-calendar locale="ja-JP"></lui-calendar>`;

const constrainedCode = `<lui-calendar
  minDate="2026-01-01"
  maxDate="2026-12-31"
></lui-calendar>`;

const disabledDatesCode = `<lui-calendar
  :disabled-dates="['2026-01-15', '2026-01-16', '2026-01-17']"
  disable-weekends
></lui-calendar>`;

const withValueCode = `<lui-calendar value="2026-01-30"></lui-calendar>`;

const eventHandlingCode = `const calendar = document.querySelector('lui-calendar');

calendar.addEventListener('ui-date-select', (event) => {
  console.log('Selected date:', event.detail.date);
});

calendar.addEventListener('ui-month-change', (event) => {
  console.log('Current view:', event.detail.year, event.detail.month);
});`;

export function CalendarPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Calendar
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible calendar component with month grid display, navigation, keyboard accessibility,
              and screen reader support. Supports localization, date constraints, and event handling.
            </p>
          </div>
        </header>

        {/* Examples Section */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Examples</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Interactive demonstrations of common use cases</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Basic */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Calendar</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A calendar displaying the current month with navigation and date selection.
            </p>
            <ExampleBlock
              preview={
                <div className="flex justify-center p-4">
                  <lui-calendar></lui-calendar>
                </div>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* Localized */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Localized Calendars</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">locale</code> prop to display weekday and month names in different languages.
            </p>
            <ExampleBlock
              preview={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">French (fr-FR)</p>
                    <lui-calendar locale="fr-FR"></lui-calendar>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">German (de-DE)</p>
                    <lui-calendar locale="de-DE"></lui-calendar>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Japanese (ja-JP)</p>
                    <lui-calendar locale="ja-JP"></lui-calendar>
                  </div>
                </div>
              }
              html={localizedCode}
              react={localizedCode}
              vue={localizedCode}
              svelte={localizedCode}
            />
          </section>

          {/* Constrained */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Constrained Dates</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">minDate</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">maxDate</code> to restrict selectable dates.
            </p>
            <ExampleBlock
              preview={
                <div className="flex justify-center p-4">
                  <lui-calendar minDate="2026-01-01" maxDate="2026-12-31"></lui-calendar>
                </div>
              }
              html={constrainedCode}
              react={constrainedCode}
              vue={constrainedCode}
              svelte={constrainedCode}
            />
          </section>

          {/* With Value */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">With Selected Date</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> prop to pre-select a date.
            </p>
            <ExampleBlock
              preview={
                <div className="flex justify-center p-4">
                  <lui-calendar value="2026-01-30"></lui-calendar>
                </div>
              }
              html={withValueCode}
              react={withValueCode}
              vue={withValueCode}
              svelte={withValueCode}
            />
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props and events</p>
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

          {/* Events */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{calendarEvents.length}</span>
            </div>
            <EventsTable events={calendarEvents} />
          </div>

          {/* Event Handling Example */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Event Handling</h3>
            </div>
            <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Listen for date selection and month changes using custom events:
                </p>
                <pre className="overflow-x-auto text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <code className="text-gray-800 dark:text-gray-200">{eventHandlingCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mt-14 mb-14">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Accessibility</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Keyboard navigation and screen reader support</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Keyboard Navigation</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Keys</kbd>
                  <span>Move focus between dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Home</kbd>
                  <span>Move to first date in month</span>
                </li>
                <li className="flex items-start gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">End</kbd>
                  <span>Move to last date in month</span>
                </li>
                <li className="flex items-start gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Page Up/Down</kbd>
                  <span>Change month</span>
                </li>
                <li className="flex items-start gap-2">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Enter / Space</kbd>
                  <span>Select focused date</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Screen Reader Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                The calendar uses WAI-ARIA Grid pattern with proper roles and labels. Date selections are announced via
                live regions for screen reader users. Weekday headers and dates have proper aria labels for context.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Switch', href: '/components/switch' }}
          next={{ title: 'Getting Started', href: '/getting-started' }}
        />
      </div>
    </FrameworkProvider>
  );
}
