import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom element
import '@lit-ui/date-picker';

// Props data from source DatePicker component (14 props)
const datePickerProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Selected date as ISO 8601 string (YYYY-MM-DD). This is the canonical form value submitted via ElementInternals.',
  },
  {
    name: 'name',
    type: 'string',
    default: '""',
    description: 'Form field name for form submission.',
  },
  {
    name: 'locale',
    type: 'string',
    default: 'navigator.language',
    description: 'BCP 47 locale tag for localization (e.g. "en-US", "de-DE"). Controls placeholder format, display formatting, and calendar locale.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: '""',
    description: 'Custom placeholder text for the input. Falls back to a locale-aware placeholder (e.g. "mm/dd/yyyy" for en-US).',
  },
  {
    name: 'helper-text',
    type: 'string',
    default: '""',
    description: 'Helper text displayed below the input. Hidden when an error message is shown.',
  },
  {
    name: 'min-date',
    type: 'string',
    default: '""',
    description: 'Minimum selectable date as ISO string (YYYY-MM-DD). Dates before this are disabled in the calendar and rejected on input.',
  },
  {
    name: 'max-date',
    type: 'string',
    default: '""',
    description: 'Maximum selectable date as ISO string (YYYY-MM-DD). Dates after this are disabled in the calendar and rejected on input.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether a date selection is required for form submission. Shows a required indicator (*) next to the label.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the date picker is disabled. Prevents interaction and applies disabled styling.',
  },
  {
    name: 'inline',
    type: 'boolean',
    default: 'false',
    description: 'Render an always-visible calendar without the popup/input wrapper. Skips Floating UI, click-outside, and focus trap.',
  },
  {
    name: 'error',
    type: 'string',
    default: '""',
    description: 'External error message. When set, overrides internal validation errors and shows error styling.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Accessible label for the input field. Rendered as a <label> element associated with the input.',
  },
  {
    name: 'presets',
    type: 'boolean | DatePreset[]',
    default: 'false',
    description: 'Preset buttons for quick date selection. Set to true for defaults (Today, Tomorrow, Next Week) or pass a custom array. JS-only property.',
  },
  {
    name: 'format',
    type: 'Intl.DateTimeFormatOptions | null',
    default: 'null',
    description: 'Custom Intl.DateTimeFormatOptions for display formatting. Only affects display; input parsing still accepts any parseable format. JS-only property.',
  },
];

// Events data
const datePickerEvents: EventDef[] = [
  {
    name: 'change',
    detail: '{ date: Date | null, isoString: string }',
    description: 'Fired when a date is selected, typed, or cleared. The date is null when the value is cleared.',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const datePickerCSSVars: CSSVarDef[] = [
  { name: '--ui-date-picker-text', default: 'inherit', description: 'Text color for the label and input.' },
  { name: '--ui-date-picker-bg', default: 'white', description: 'Background color for the input container.' },
  { name: '--ui-date-picker-border', default: '#d1d5db', description: 'Border color for the input container.' },
  { name: '--ui-date-picker-border-focus', default: '#3b82f6', description: 'Border color when the input is focused.' },
  { name: '--ui-date-picker-radius', default: '0.375rem', description: 'Border radius for the input container.' },
  { name: '--ui-date-picker-border-width', default: '1px', description: 'Border width for the input container.' },
  { name: '--ui-date-picker-placeholder', default: '#9ca3af', description: 'Placeholder text color.' },
  { name: '--ui-date-picker-error', default: '#ef4444', description: 'Error text and border color.' },
  { name: '--ui-date-picker-popup-bg', default: 'white', description: 'Background color for the calendar popup.' },
  { name: '--ui-date-picker-popup-border', default: '#e5e7eb', description: 'Border color for the calendar popup.' },
  { name: '--ui-date-picker-preset-bg', default: '#f9fafb', description: 'Background color for preset buttons.' },
  { name: '--ui-date-picker-preset-border', default: '#d1d5db', description: 'Border color for preset buttons.' },
];

// Code examples
const basicCode = `<lui-date-picker label="Date"></lui-date-picker>`;

const preSelectedCode = `<lui-date-picker label="Birthday" value="2026-02-14"></lui-date-picker>`;

const constraintsCode = `<lui-date-picker
  label="Appointment"
  min-date="2026-01-10"
  max-date="2026-03-31"
></lui-date-picker>`;

const requiredCode = `<lui-date-picker label="Start Date" required></lui-date-picker>`;

const naturalLanguageCode = `<!-- Type "tomorrow", "next friday", or "in 3 days" -->
<lui-date-picker label="Date"></lui-date-picker>`;

const presetsHtmlCode = `<lui-date-picker id="my-picker" label="Date"></lui-date-picker>

<script>
  // true = default presets (Today, Tomorrow, Next Week)
  document.getElementById('my-picker').presets = true;

  // Or pass custom presets:
  // document.getElementById('my-picker').presets = [
  //   { label: 'Christmas', resolve: () => new Date(2026, 11, 25) },
  // ];
</script>`;

const presetsReactCode = `import { useRef, useEffect } from 'react';

function MyForm() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.presets = true;
  }, []);

  return <lui-date-picker ref={ref} label="Date" />;
}`;

const presetsVueCode = `<template>
  <lui-date-picker ref="picker" label="Date" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
const picker = ref(null);
onMounted(() => {
  picker.value.presets = true;
});
</script>`;

const presetsSvelteCode = `<script>
  let picker;
  $: if (picker) {
    picker.presets = true;
  }
</script>

<lui-date-picker bind:this={picker} label="Date" />`;

const inlineCode = `<lui-date-picker label="Date" inline></lui-date-picker>`;

const cssVarsCode = `/* Global override */
:root {
  --ui-date-picker-border-focus: var(--color-accent);
  --ui-date-picker-error: #dc2626;
  --ui-date-picker-radius: 0.5rem;
}

/* Scoped override */
.booking-form {
  --ui-date-picker-bg: #fafafa;
  --ui-date-picker-popup-bg: #fafafa;
  --ui-date-picker-preset-bg: white;
}`;

export function DatePickerPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Date Picker
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible date picker with text input parsing, calendar popup, natural language support, presets, inline mode, and form integration.
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
              A date picker with a text input and calendar popup. Click the calendar icon or press Arrow Down to open the calendar. Type a date directly or select from the calendar.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-date-picker label="Date"></lui-date-picker>
                </div>
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
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> attribute with an ISO date string to set the initially selected date. The display format is locale-aware.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-date-picker label="Birthday" value="2026-02-14"></lui-date-picker>
                </div>
              }
              html={preSelectedCode}
              react={preSelectedCode}
              vue={preSelectedCode}
              svelte={preSelectedCode}
            />
          </section>

          {/* 3. Date Constraints */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Date Constraints</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">min-date</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-date</code> to restrict selectable dates. Out-of-range dates are disabled in the calendar with accessible tooltips, and typed dates are validated on blur.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-date-picker
                    label="Appointment"
                    min-date="2026-01-10"
                    max-date="2026-03-31"
                  ></lui-date-picker>
                </div>
              }
              html={constraintsCode}
              react={constraintsCode}
              vue={constraintsCode}
              svelte={constraintsCode}
            />
          </section>

          {/* 4. Required with Validation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Required with Validation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">required</code> for form validation. The date picker participates in native form validation via ElementInternals, reporting <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">valueMissing</code>, <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">badInput</code>, <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">rangeUnderflow</code>, and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">rangeOverflow</code> validity states.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-date-picker label="Start Date" required></lui-date-picker>
                </div>
              }
              html={requiredCode}
              react={requiredCode}
              vue={requiredCode}
              svelte={requiredCode}
            />
          </section>

          {/* 5. Natural Language Input */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Natural Language Input</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The date picker supports natural language input out of the box. Users can type phrases like "tomorrow", "next friday", "in 3 days", or "next week" and the input is automatically parsed into a date on blur. Natural language parsing runs before format-based parsing in the input pipeline.
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-date-picker label="Date" helper-text='Try typing "tomorrow" or "next friday"'></lui-date-picker>
                </div>
              }
              html={naturalLanguageCode}
              react={naturalLanguageCode}
              vue={naturalLanguageCode}
              svelte={naturalLanguageCode}
            />
          </section>

          {/* 6. Presets */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Presets</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">presets</code> property shows quick-select buttons above the calendar. Set to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">true</code> for default presets (Today, Tomorrow, Next Week) or pass a custom <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">DatePreset[]</code> array. This is a JS-only property (not an HTML attribute).
            </p>
            <ExampleBlock
              preview={
                <div className="max-w-xs">
                  <lui-date-picker
                    label="Date"
                    ref={(el: HTMLElement | null) => { if (el) (el as any).presets = true; }}
                  ></lui-date-picker>
                </div>
              }
              html={presetsHtmlCode}
              react={presetsReactCode}
              vue={presetsVueCode}
              svelte={presetsSvelteCode}
            />
          </section>

          {/* 7. Inline Mode */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Inline Mode</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">inline</code> to render the calendar always visible without the popup/input wrapper. The input field, Floating UI positioning, click-outside detection, and focus trap are all skipped. Label, presets, error, and helper text are still rendered.
            </p>
            <ExampleBlock
              preview={
                <lui-date-picker label="Date" inline></lui-date-picker>
              }
              html={inlineCode}
              react={inlineCode}
              vue={inlineCode}
              svelte={inlineCode}
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
                  Uses native input with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">label</code> association for screen readers. Form participation via ElementInternals.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Calendar popup inherits all keyboard navigation from <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-calendar</code>: arrow keys, Home/End, PageUp/PageDown, Enter/Space to select.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Escape closes the popup and returns focus to the input. Tab is trapped within the popup when open.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Popup uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="dialog"</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-modal="true"</code> to indicate modal context.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-invalid</code> and error messages linked via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-describedby</code> for validation feedback.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">6</span>
                  Natural language and typed date formats provide alternative input methods to calendar selection for motor-impaired users.
                </li>
              </ul>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Date Picker exposes CSS custom properties for theming. It uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">--ui-date-picker-*</code> variables with fallbacks to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">--ui-input-*</code> for consistent form field styling. The calendar inside inherits <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">--ui-calendar-*</code> variables.
            </p>
          </section>

          {/* CSS Custom Properties example */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change date picker appearance globally or within a scoped container.
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{datePickerProps.length}</span>
            </div>
            <PropsTable props={datePickerProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{datePickerCSSVars.length}</span>
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
                  {datePickerCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{datePickerEvents.length}</span>
            </div>
            <EventsTable events={datePickerEvents} />
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Checkbox', href: '/components/checkbox' }}
          next={{ title: 'Date Range Picker', href: '/components/date-range-picker' }}
        />
      </div>
    </FrameworkProvider>
  );
}
