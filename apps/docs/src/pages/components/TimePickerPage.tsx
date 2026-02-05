import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom element
import '@lit-ui/time-picker';

// ---------------------------------------------------------------------------
// Props data from source TimePicker component (20 props)
// ---------------------------------------------------------------------------
const timePickerProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Selected time as ISO 8601 string (HH:mm:ss). This is the canonical form value submitted via ElementInternals.',
  },
  {
    name: 'name',
    type: 'string',
    default: '""',
    description: 'Form field name for form submission.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Accessible label text displayed above the input.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: '"Select time"',
    description: 'Placeholder text shown when no value is set.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether a time selection is required for form submission. Shows a red asterisk next to the label.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the time picker is disabled. Prevents interaction and grays out the input.',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Whether the time picker is readonly. Displays the value but prevents modification.',
  },
  {
    name: 'hour12',
    type: 'boolean',
    default: 'auto (locale)',
    description: 'Whether to display in 12-hour format with AM/PM toggle. Auto-detected from locale when not explicitly set.',
  },
  {
    name: 'locale',
    type: 'string',
    default: '"en-US"',
    description: 'BCP 47 locale tag for formatting (e.g., "en-US", "de-DE"). Controls number formatting and default hour cycle.',
  },
  {
    name: 'step',
    type: 'number',
    default: '30',
    description: 'Interval in minutes between dropdown options (1-60). Also affects clock face minute labels.',
  },
  {
    name: 'min-time',
    type: 'string',
    default: '""',
    description: 'Minimum selectable time as HH:mm or HH:mm:ss. Times before this are invalid and show a validation error.',
  },
  {
    name: 'max-time',
    type: 'string',
    default: '""',
    description: 'Maximum selectable time as HH:mm or HH:mm:ss. Times after this are invalid and show a validation error.',
  },
  {
    name: 'allow-overnight',
    type: 'boolean',
    default: 'false',
    description: 'Allow midnight-crossing validation. When true, an end time before the start time is considered valid (e.g., night shifts).',
  },
  {
    name: 'show-timezone',
    type: 'boolean',
    default: 'false',
    description: 'Whether to display a timezone abbreviation (e.g., "EST") next to the time value in the input.',
  },
  {
    name: 'timezone',
    type: 'string',
    default: 'local',
    description: 'IANA timezone identifier (e.g., "America/New_York"). Defaults to the user\'s local timezone.',
  },
  {
    name: 'voice',
    type: 'boolean',
    default: 'false',
    description: 'Enable voice input button. Uses the Web Speech API for hands-free time entry. Button hidden when Speech API is unavailable.',
  },
  {
    name: 'interface-mode',
    type: '"clock" | "dropdown" | "both" | "wheel" | "range"',
    default: '"both"',
    description: 'Which popup interface(s) to show. "both" provides tabbed clock and dropdown, "clock" or "dropdown" shows one, "wheel" shows iOS-style scroll wheel, "range" shows dual-handle slider.',
  },
  {
    name: 'presets',
    type: 'boolean | TimePreset[]',
    default: 'false',
    description: 'Preset buttons for quick time selection. Set to true for defaults (Morning, Afternoon, Evening) or pass a custom TimePreset array via JS.',
  },
  {
    name: 'businessHours',
    type: '{ start: number; end: number } | false',
    default: 'false',
    description: 'Business hours range for visual highlighting on the clock face. Uses 24-hour format (e.g., { start: 9, end: 17 }). JS-only property.',
  },
  {
    name: 'additionalTimezones',
    type: 'string[]',
    default: '[]',
    description: 'Additional IANA timezone identifiers for multi-timezone comparison display in the popup. Use the additional-timezones attribute with comma-separated values (e.g., "America/Los_Angeles,Europe/London").',
  },
];

// ---------------------------------------------------------------------------
// Events data
// ---------------------------------------------------------------------------
const timePickerEvents: EventDef[] = [
  {
    name: 'change',
    detail: '{ value: string, timeValue: TimeValue | null }',
    description: 'Fired when a time is selected or cleared. The value property contains the ISO string (HH:mm:ss) and timeValue contains the parsed TimeValue object with hour, minute, and second fields.',
  },
];

// ---------------------------------------------------------------------------
// CSS Custom Properties
// ---------------------------------------------------------------------------
type CSSVarDef = { name: string; default: string; description: string };
const timePickerCSSVars: CSSVarDef[] = [
  { name: '--ui-time-picker-bg', default: 'var(--ui-input-bg, white)', description: 'Background color for the input display.' },
  { name: '--ui-time-picker-text', default: 'var(--ui-input-text, inherit)', description: 'Text color for the displayed time.' },
  { name: '--ui-time-picker-border', default: 'var(--ui-input-border, #d1d5db)', description: 'Border color for the input display.' },
  { name: '--ui-time-picker-border-focus', default: 'var(--ui-input-border-focus, #3b82f6)', description: 'Border color when focused.' },
  { name: '--ui-time-picker-radius', default: 'var(--ui-input-radius, 0.375rem)', description: 'Border radius for the input.' },
  { name: '--ui-time-picker-placeholder', default: 'var(--ui-input-placeholder, #9ca3af)', description: 'Placeholder text color.' },
  { name: '--ui-time-picker-label-text', default: 'var(--ui-input-text, inherit)', description: 'Label text color.' },
  { name: '--ui-time-picker-error', default: 'var(--ui-input-text-error, #ef4444)', description: 'Error message and border color.' },
  { name: '--ui-time-picker-popup-bg', default: 'white', description: 'Background color of the popup panel.' },
  { name: '--ui-time-picker-popup-border', default: '#e5e7eb', description: 'Border color of the popup panel.' },
  { name: '--ui-time-picker-primary', default: 'var(--ui-primary, #3b82f6)', description: 'Primary accent color for selected tab, Now button.' },
  { name: '--ui-time-picker-tab-bg', default: '#f9fafb', description: 'Background for interface tabs (clock/list toggle).' },
  { name: '--ui-time-picker-tab-bg-hover', default: '#e5e7eb', description: 'Background for interface tabs on hover.' },
  { name: '--ui-time-picker-preset-bg', default: '#f9fafb', description: 'Background color for preset buttons.' },
  { name: '--ui-time-picker-preset-border', default: '#d1d5db', description: 'Border color for preset buttons.' },
  { name: '--ui-time-picker-preset-text', default: 'inherit', description: 'Text color for preset buttons.' },
  { name: '--ui-time-picker-timezone-text', default: 'var(--ui-input-placeholder, #6b7280)', description: 'Color for timezone abbreviation label.' },
  { name: '--ui-time-picker-bg-disabled', default: 'var(--ui-input-bg-disabled, #f3f4f6)', description: 'Background when disabled.' },
  { name: '--ui-time-picker-border-disabled', default: 'var(--ui-input-border-disabled, #e5e7eb)', description: 'Border color when disabled.' },
  { name: '--ui-time-picker-border-width', default: 'var(--ui-input-border-width, 1px)', description: 'Border width for the input.' },
];

// ---------------------------------------------------------------------------
// Code examples
// ---------------------------------------------------------------------------

// 1. Basic
const basicCode = `<lui-time-picker label="Time"></lui-time-picker>`;

// 2. 12-Hour Format
const hour12Code = `<lui-time-picker label="Time" hour12></lui-time-picker>`;

// 3. 24-Hour Format
const hour24Code = `<lui-time-picker label="Time" hour12="false"></lui-time-picker>`;

// 4. Clock Face Only
const clockOnlyCode = `<lui-time-picker label="Time" interface-mode="clock"></lui-time-picker>`;

// 5. Dropdown Only
const dropdownOnlyCode = `<lui-time-picker label="Time" interface-mode="dropdown" step="15"></lui-time-picker>`;

// 6. Time Constraints
const constraintsCode = `<lui-time-picker label="Appointment" min-time="09:00" max-time="17:00" step="30"></lui-time-picker>`;

// 7. Timezone Display
const timezoneCode = `<lui-time-picker
  label="Meeting"
  show-timezone
  timezone="America/New_York"
  additional-timezones="America/Los_Angeles,Europe/London"
></lui-time-picker>`;

// 8. Presets
const presetsCode = `<lui-time-picker presets label="Time"></lui-time-picker>`;

// 9. Voice Input
const voiceCode = `<lui-time-picker label="Time" voice></lui-time-picker>`;

// CSS Custom Properties example
const cssVarsCode = `/* Global override */
:root {
  --ui-time-picker-primary: var(--color-accent);
  --ui-time-picker-radius: 0.5rem;
  --ui-time-picker-popup-bg: #fafafa;
}

/* Scoped override */
.scheduling-widget {
  --ui-time-picker-border: var(--color-border);
  --ui-time-picker-preset-bg: var(--color-surface);
}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimePickerPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Time Picker
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible time picker with clock face, dropdown list, scroll wheel, presets, timezone display, voice input, and form integration.
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
              Default time picker with both clock face and dropdown interfaces. Click the clock icon or input to open the popup.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Time"></lui-time-picker>
                </div>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. 12-Hour Format */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">12-Hour Format</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">hour12</code> attribute to force 12-hour display with AM/PM toggle. Without this attribute, the format is auto-detected from the locale.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Time" hour12></lui-time-picker>
                </div>
              }
              html={hour12Code}
              react={hour12Code}
              vue={hour12Code}
              svelte={hour12Code}
            />
          </section>

          {/* 3. 24-Hour Format */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">24-Hour Format</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">hour12="false"</code> for 24-hour display. The clock face shows an inner ring for hours 13-23 and an outer ring for 0-12.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Time" hour12={false}></lui-time-picker>
                </div>
              }
              html={hour24Code}
              react={hour24Code}
              vue={hour24Code}
              svelte={hour24Code}
            />
          </section>

          {/* 4. Clock Face Only */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Clock Face Only</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">interface-mode="clock"</code> to show only the analog clock face. Click or drag to select hours, then minutes.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Time" interface-mode="clock"></lui-time-picker>
                </div>
              }
              html={clockOnlyCode}
              react={clockOnlyCode}
              vue={clockOnlyCode}
              svelte={clockOnlyCode}
            />
          </section>

          {/* 5. Dropdown Only */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Dropdown Only</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">interface-mode="dropdown"</code> to show a scrollable list of time options. The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">step</code> prop controls the interval between options.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Time" interface-mode="dropdown" step={15}></lui-time-picker>
                </div>
              }
              html={dropdownOnlyCode}
              react={dropdownOnlyCode}
              vue={dropdownOnlyCode}
              svelte={dropdownOnlyCode}
            />
          </section>

          {/* 6. Time Constraints */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Time Constraints</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">min-time</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-time</code> to restrict selectable times. Selecting a time outside the range shows a validation error after the popup closes.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Appointment" min-time="09:00" max-time="17:00" step={30}></lui-time-picker>
                </div>
              }
              html={constraintsCode}
              react={constraintsCode}
              vue={constraintsCode}
              svelte={constraintsCode}
            />
          </section>

          {/* 7. Timezone Display */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Timezone Display</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">show-timezone</code> to display a timezone abbreviation in the input. Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">timezone</code> to an IANA identifier and use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">additional-timezones</code> for multi-timezone comparison.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Meeting" show-timezone timezone="America/New_York" additional-timezones="America/Los_Angeles,Europe/London"></lui-time-picker>
                </div>
              }
              html={timezoneCode}
              react={timezoneCode}
              vue={timezoneCode}
              svelte={timezoneCode}
            />
          </section>

          {/* 8. Presets */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Presets</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">presets</code> attribute for default presets (Morning, Afternoon, Evening, plus a Now button) or pass a custom <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">TimePreset[]</code> array via JS.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker presets label="Time"></lui-time-picker>
                </div>
              }
              html={presetsCode}
              react={presetsCode}
              vue={presetsCode}
              svelte={presetsCode}
            />
          </section>

          {/* 9. Voice Input */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Voice Input</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">voice</code> attribute to enable a microphone button for hands-free time entry. This is a progressive enhancement: the button is only visible when the browser supports the Web Speech API.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-time-picker label="Time" voice></lui-time-picker>
                </div>
              }
              html={voiceCode}
              react={voiceCode}
              vue={voiceCode}
              svelte={voiceCode}
            />
          </section>

          {/* Sub-Components */}
          <section>
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sub-Components</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Publicly exported components for standalone use</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              The Time Picker package exports four sub-components that are composed internally but can also be used as standalone elements or imported directly for advanced use cases.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* TimezoneDisplay */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">lui-timezone-display</code>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  Standalone timezone comparison display showing the selected time converted across multiple timezones. Uses <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="status"</code> for screen reader updates.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Key props: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">primaryTimezone</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">additionalTimezones</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">hour12</code>
                </p>
              </div>

              {/* TimeRangeSlider */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">lui-time-range-slider</code>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  Visual time range slider with dual handles for selecting a start and end time. Used via <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">interface-mode="range"</code> or imported directly.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Key props: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">startMinutes</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">endMinutes</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">step</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">hour12</code>
                </p>
              </div>

              {/* TimeScrollWheel */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">lui-time-scroll-wheel</code>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  iOS-style scroll wheel time selector using CSS scroll-snap for physics-based momentum scrolling. Used via <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">interface-mode="wheel"</code> or imported directly.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Key props: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">hour12</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">step</code>
                </p>
              </div>

              {/* TimeVoiceInput */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">lui-time-voice-input</code>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  Voice-activated time input using the Web Speech API. Progressively enhanced: renders nothing when the Speech API is unavailable. Parses natural language time references from transcripts.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Key props: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">locale</code>, <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">disabled</code>
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
                  TimeInput uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="spinbutton"</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-valuemin</code>/<code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-valuemax</code>/<code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-valuenow</code> for hour, minute, and second spinners.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Arrow Up/Down increments and decrements values with proper wrapping (e.g., 23 to 0 for hours, 59 to 0 for minutes).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Clock face supports pointer events for mouse and touch selection with visual feedback during drag.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Dropdown uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="listbox"</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="option"</code> items following the WAI-ARIA Listbox pattern.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Tab cycles through input fields (hour, minute, AM/PM). Tab within the popup is trapped and cycles back to the hour spinbutton.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">6</span>
                  Voice input provides progressive enhancement: the microphone button renders nothing when the Web Speech API is unavailable.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">7</span>
                  Timezone display uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="status"</code> for screen reader updates when the selected time changes across displayed timezones.
                </li>
              </ul>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Time Picker exposes CSS custom properties for theming. All properties fall back to shared input tokens (<code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">--ui-input-*</code>) so overriding the base input theme also themes the time picker.
            </p>
          </section>

          {/* CSS Custom Properties example */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change time picker appearance globally or within a scoped container.
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{timePickerProps.length}</span>
            </div>
            <PropsTable props={timePickerProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{timePickerCSSVars.length}</span>
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
                  {timePickerCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{timePickerEvents.length}</span>
            </div>
            <EventsTable events={timePickerEvents} />
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Textarea', href: '/components/textarea' }}
          next={{ title: 'Toast', href: '/components/toast' }}
        />
      </div>
    </FrameworkProvider>
  );
}
