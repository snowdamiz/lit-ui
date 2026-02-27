import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom element
import '@lit-ui/date-range-picker';

// Props data from source DateRangePicker component (18 props)
const dateRangePickerProps: PropDef[] = [
  {
    name: 'start-date',
    type: 'string',
    default: '""',
    description: 'Selected start date as ISO string (YYYY-MM-DD).',
  },
  {
    name: 'end-date',
    type: 'string',
    default: '""',
    description: 'Selected end date as ISO string (YYYY-MM-DD).',
  },
  {
    name: 'name',
    type: 'string',
    default: '""',
    description: 'Form field name. Submitted as ISO 8601 interval (YYYY-MM-DD/YYYY-MM-DD).',
  },
  {
    name: 'locale',
    type: 'string',
    default: 'navigator.language',
    description: 'BCP 47 locale tag for localization (e.g. "en-US", "de-DE"). Defaults to browser locale.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: '"Select date range"',
    description: 'Custom placeholder text for the input field.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Accessible label displayed above the input.',
  },
  {
    name: 'helper-text',
    type: 'string',
    default: '""',
    description: 'Helper text displayed below the input.',
  },
  {
    name: 'min-date',
    type: 'string',
    default: '""',
    description: 'Minimum selectable date as ISO string. Dates before this are disabled.',
  },
  {
    name: 'max-date',
    type: 'string',
    default: '""',
    description: 'Maximum selectable date as ISO string. Dates after this are disabled.',
  },
  {
    name: 'min-days',
    type: 'number',
    default: '0',
    description: 'Minimum range duration in days (inclusive). 0 means no minimum.',
  },
  {
    name: 'max-days',
    type: 'number',
    default: '0',
    description: 'Maximum range duration in days (inclusive). 0 means unlimited.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether a range selection is required for form submission.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the date range picker is disabled.',
  },
  {
    name: 'error',
    type: 'string',
    default: '""',
    description: 'External error message. Overrides internal validation errors when set.',
  },
  {
    name: 'comparison',
    type: 'boolean',
    default: 'false',
    description: 'Enable comparison mode for selecting two independent date ranges side by side.',
  },
  {
    name: 'compare-start-date',
    type: 'string',
    default: '""',
    description: 'Comparison range start date as ISO string (YYYY-MM-DD). Only used when comparison is true.',
  },
  {
    name: 'compare-end-date',
    type: 'string',
    default: '""',
    description: 'Comparison range end date as ISO string (YYYY-MM-DD). Only used when comparison is true.',
  },
  {
    name: 'presets',
    type: 'boolean | DateRangePreset[]',
    default: 'false',
    description: 'Preset range buttons. true = default presets (Last 7 Days, Last 30 Days, This Month). Pass an array for custom presets via JS.',
  },
];

// Events data
const dateRangePickerEvents: EventDef[] = [
  {
    name: 'change',
    detail: '{ startDate: string, endDate: string, isoInterval: string, compareStartDate?: string, compareEndDate?: string, compareIsoInterval?: string }',
    description: 'Fired when a range selection is complete or cleared. Includes comparison fields when comparison mode is active.',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const dateRangePickerCSSVars: CSSVarDef[] = [
  { name: '--ui-range-selected-bg', default: 'var(--color-primary, #3b82f6)', description: 'Background color for start and end date endpoints.' },
  { name: '--ui-range-selected-text', default: 'white', description: 'Text color for start and end date endpoints.' },
  { name: '--ui-range-highlight-bg', default: '#dbeafe', description: 'Background color for dates within the selected range.' },
  { name: '--ui-range-highlight-text', default: 'inherit', description: 'Text color for dates within the selected range.' },
  { name: '--ui-range-preview-bg', default: '#eff6ff', description: 'Background color for hover preview between start date and cursor.' },
  { name: '--ui-range-compare-bg', default: '#f59e0b', description: 'Background color for comparison range endpoints (amber).' },
  { name: '--ui-range-compare-text', default: 'white', description: 'Text color for comparison range endpoints.' },
  { name: '--ui-range-compare-highlight-bg', default: '#fef3c7', description: 'Background color for dates within the comparison range.' },
  { name: '--ui-range-compare-preview-bg', default: '#fffbeb', description: 'Background color for comparison hover preview.' },
  { name: '--ui-date-picker-radius', default: 'var(--ui-input-radius, 0.375rem)', description: 'Border radius for the input container.' },
  { name: '--ui-date-picker-border', default: 'var(--ui-input-border, #d1d5db)', description: 'Border color for the input container.' },
  { name: '--ui-date-picker-bg', default: 'var(--ui-input-bg, white)', description: 'Background color for the input.' },
  { name: '--ui-date-picker-text', default: 'var(--ui-input-text, inherit)', description: 'Text color for the input.' },
  { name: '--ui-date-picker-popup-bg', default: 'white', description: 'Background color for the calendar popup.' },
  { name: '--ui-date-picker-popup-border', default: '#e5e7eb', description: 'Border color for the calendar popup.' },
  { name: '--ui-date-picker-error', default: 'var(--ui-input-text-error, #ef4444)', description: 'Color for error state and messages.' },
];

// Code examples
const basicCode = `<lui-date-range-picker label="Date Range"></lui-date-range-picker>`;

const preSelectedCode = `<lui-date-range-picker
  label="Booking"
  start-date="2026-02-10"
  end-date="2026-02-17"
></lui-date-range-picker>`;

const constraintsCode = `<lui-date-range-picker
  label="Trip"
  min-date="2026-01-01"
  max-date="2026-12-31"
  min-days="3"
  max-days="14"
></lui-date-range-picker>`;

const presetsCode = `<lui-date-range-picker presets label="Report Period"></lui-date-range-picker>`;

const comparisonCode = `<lui-date-range-picker
  label="Analytics"
  comparison
></lui-date-range-picker>`;

const cssVarsCode = `/* Primary range theming */
:root {
  --ui-range-selected-bg: var(--color-accent);
  --ui-range-highlight-bg: rgba(var(--color-accent-rgb), 0.15);
  --ui-range-preview-bg: rgba(var(--color-accent-rgb), 0.08);
}

/* Comparison range theming */
:root {
  --ui-range-compare-bg: #8b5cf6;
  --ui-range-compare-highlight-bg: #ede9fe;
  --ui-range-compare-preview-bg: #f5f3ff;
}`;

export function DateRangePickerPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Date Range Picker
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible date range picker with two-click selection, dual calendars, range constraints, presets, comparison mode, and drag selection.
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
              A date range picker with dual-calendar popup. Click a date to set the start, then click another date to set the end. The range is automatically normalized if the end date is before the start date.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full max-w-sm">
                  <lui-date-range-picker label="Date Range"></lui-date-range-picker>
                </div>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Pre-selected Range */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Pre-selected Range</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">start-date</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">end-date</code> with ISO date strings to set an initial range. The input displays a formatted summary like "Feb 10 -- Feb 17, 2026".
            </p>
            <ExampleBlock
              preview={
                <div className="w-full max-w-sm">
                  <lui-date-range-picker label="Booking" start-date="2026-02-10" end-date="2026-02-17"></lui-date-range-picker>
                </div>
              }
              html={preSelectedCode}
              react={preSelectedCode}
              vue={preSelectedCode}
              svelte={preSelectedCode}
            />
          </section>

          {/* 3. Date and Duration Constraints */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Date and Duration Constraints</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Combine <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">min-date</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-date</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">min-days</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-days</code> to restrict both the selectable date window and the allowed range duration. In this example, trips must be 3 to 14 days within the year 2026.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full max-w-sm">
                  <lui-date-range-picker
                    label="Trip"
                    min-date="2026-01-01"
                    max-date="2026-12-31"
                    min-days={3}
                    max-days={14}
                  ></lui-date-range-picker>
                </div>
              }
              html={constraintsCode}
              react={constraintsCode}
              vue={constraintsCode}
              svelte={constraintsCode}
            />
          </section>

          {/* 4. Presets */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Presets</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">presets</code> attribute for default presets (Last 7 Days, Last 30 Days, This Month), or pass a custom <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">DateRangePreset[]</code> array via JS. Presets appear as a sidebar in the popup for one-click range selection.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full max-w-sm">
                  <lui-date-range-picker presets label="Report Period"></lui-date-range-picker>
                </div>
              }
              html={presetsCode}
              react={presetsCode}
              vue={presetsCode}
              svelte={presetsCode}
            />
          </section>

          {/* 5. Comparison Mode */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Comparison Mode</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">comparison</code> attribute to allow selecting two independent date ranges. Toggle buttons in the popup switch between Primary Range (blue) and Comparison Range (amber) for side-by-side analysis. The change event includes both ranges.
            </p>
            <ExampleBlock
              preview={
                <div className="w-full max-w-sm">
                  <lui-date-range-picker label="Analytics" comparison></lui-date-range-picker>
                </div>
              }
              html={comparisonCode}
              react={comparisonCode}
              vue={comparisonCode}
              svelte={comparisonCode}
            />
          </section>

          {/* 6. Drag Selection */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Drag Selection</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              On desktop, users can click and drag from a start date to an end date for faster range selection. The range preview updates in real time as the pointer moves, and the selection completes on pointer release. Drag selection fires the same <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">change</code> event as two-click selection and respects the same min/max day constraints. This behavior is built-in and requires no additional configuration.
            </p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Drag selection uses the Pointer Events API for unified mouse and touch support. If the pointer is released on the same cell it started on, the component stays in "start-selected" state so the user can click a different cell to complete the range.
                </p>
              </div>
            </div>
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
                  Two-click selection announced via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-live</code>: "Start date selected: [date]", "Range selected: [start] to [end]".
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Dual calendars share keyboard navigation from <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-calendar</code> (arrows, Home/End, PageUp/PageDown).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Escape closes the popup and returns focus to the input. Tab is trapped within the popup when open.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Range duration displayed in popup footer for confirmation before closing.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Drag selection fires the same events as click selection for consistent screen reader announcements.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">6</span>
                  Form value submitted as ISO 8601 interval format (<code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">YYYY-MM-DD/YYYY-MM-DD</code>).
                </li>
              </ul>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Date Range Picker exposes CSS custom properties for theming both the range highlighting colors and the input/popup chrome. Override them globally or scoped to a container.
            </p>
          </section>

          {/* CSS Custom Properties example */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to customize range highlight colors, comparison range colors, and input appearance.
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dateRangePickerProps.length}</span>
            </div>
            <PropsTable props={dateRangePickerProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dateRangePickerCSSVars.length}</span>
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
                  {dateRangePickerCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{dateRangePickerEvents.length}</span>
            </div>
            <EventsTable events={dateRangePickerEvents} />
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Date Picker', href: '/components/date-picker' }}
          next={{ title: 'Dialog', href: '/components/dialog' }}
        />
      </div>
    </FrameworkProvider>
  );
}
