/**
 * Form Integration Guide documentation page
 * Cross-cutting guide covering ElementInternals, ISO 8601 value formats,
 * form validation, and framework-specific integration patterns.
 */

import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

// Value format table data
const valueFormats = [
  { component: 'Calendar', format: 'YYYY-MM-DD', example: '2026-02-14', spec: 'ISO 8601 date' },
  { component: 'Date Picker', format: 'YYYY-MM-DD', example: '2026-02-14', spec: 'ISO 8601 date' },
  { component: 'Date Range Picker', format: 'YYYY-MM-DD/YYYY-MM-DD', example: '2026-02-10/2026-02-14', spec: 'ISO 8601 interval' },
  { component: 'Time Picker', format: 'HH:mm:ss', example: '14:30:00', spec: 'ISO 8601 time' },
];

// Validation states
const validationStates = [
  { attribute: 'required', validity: 'valueMissing', description: 'No date or time has been selected' },
  { attribute: 'min', validity: 'rangeUnderflow', description: 'Selected value is before the minimum allowed' },
  { attribute: 'max', validity: 'rangeOverflow', description: 'Selected value is after the maximum allowed' },
  { attribute: 'error', validity: 'customError', description: 'Custom error message set via the error attribute' },
];

const basicFormExample = `<form id="booking-form">
  <lui-date-picker
    name="date"
    label="Appointment Date"
    required
    min="2026-02-01"
    max="2026-12-31"
  ></lui-date-picker>

  <lui-time-picker
    name="time"
    label="Appointment Time"
    required
    min="09:00:00"
    max="17:00:00"
  ></lui-time-picker>

  <lui-button type="submit">Book Appointment</lui-button>
</form>

<script>
  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(data.get('date')); // "2026-02-14"
    console.log(data.get('time')); // "14:30:00"
  });
</script>`;

const dateRangeFormExample = `<form id="trip-form">
  <lui-date-range-picker
    name="trip"
    label="Travel Dates"
    required
  ></lui-date-range-picker>

  <lui-button type="submit">Search Flights</lui-button>
</form>

<script>
  document.getElementById('trip-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(data.get('trip')); // "2026-02-10/2026-02-14"

    // Parse the interval
    const [start, end] = data.get('trip').split('/');
    console.log(start); // "2026-02-10"
    console.log(end);   // "2026-02-14"
  });
</script>`;

const validationExample = `<form id="validated-form" novalidate>
  <lui-date-picker
    name="date"
    label="Date"
    required
    min="2026-01-01"
    error=""
  ></lui-date-picker>

  <lui-button type="submit">Submit</lui-button>
</form>

<script>
  const form = document.getElementById('validated-form');
  const picker = form.querySelector('lui-date-picker');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check validity via ElementInternals
    if (!picker.checkValidity()) {
      // Access the ValidityState
      const validity = picker.validity;

      if (validity.valueMissing) {
        picker.error = 'Please select a date';
      } else if (validity.rangeUnderflow) {
        picker.error = 'Date must be after January 1, 2026';
      }
      return;
    }

    // Valid - submit
    const data = new FormData(e.target);
    console.log(data.get('date'));
  });
</script>`;

const reactExample = `import { useRef, FormEvent } from 'react';
import '@lit-ui/date-picker';
import '@lit-ui/time-picker';

export function BookingForm() {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = new FormData(formRef.current!);
    console.log({
      date: data.get('date'), // "2026-02-14"
      time: data.get('time'), // "14:30:00"
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <lui-date-picker name="date" label="Date" required />
      <lui-time-picker name="time" label="Time" required />
      <button type="submit">Book</button>
    </form>
  );
}`;

const vueExample = `<template>
  <form @submit.prevent="handleSubmit" ref="formRef">
    <lui-date-picker name="date" label="Date" required />
    <lui-time-picker name="time" label="Time" required />
    <button type="submit">Book</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '@lit-ui/date-picker';
import '@lit-ui/time-picker';

const formRef = ref<HTMLFormElement>();

function handleSubmit() {
  const data = new FormData(formRef.value!);
  console.log({
    date: data.get('date'), // "2026-02-14"
    time: data.get('time'), // "14:30:00"
  });
}
</script>`;

const svelteExample = `<script lang="ts">
  import '@lit-ui/date-picker';
  import '@lit-ui/time-picker';

  let formEl: HTMLFormElement;

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(formEl);
    console.log({
      date: data.get('date'), // "2026-02-14"
      time: data.get('time'), // "14:30:00"
    });
  }
</script>

<form bind:this={formEl} on:submit={handleSubmit}>
  <lui-date-picker name="date" label="Date" required />
  <lui-time-picker name="time" label="Time" required />
  <button type="submit">Book</button>
</form>`;

const resetExample = `<!-- Form reset clears all values -->
<form id="my-form">
  <lui-date-picker name="date" label="Date"></lui-date-picker>
  <lui-time-picker name="time" label="Time"></lui-time-picker>

  <lui-button type="submit">Submit</lui-button>
  <lui-button type="reset" variant="secondary">Reset</lui-button>
</form>

<!-- Components implement formResetCallback() from ElementInternals -->
<!-- Clicking "Reset" clears selected dates and times -->`;

export function FormIntegrationGuide() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Form Integration
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            All date and time components participate in native HTML forms via ElementInternals,
            submitting ISO 8601 formatted values through standard FormData.
          </p>
        </div>
      </header>

      <div className="space-y-16 animate-fade-in-up opacity-0 stagger-2">
        {/* Section 1: Overview */}
        <section id="overview" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">How It Works</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Native form participation via ElementInternals</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Every date and time component uses the{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              ElementInternals API
            </a>{' '}
            to behave like native form controls. This means:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Values appear in <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">new FormData(form)</code> automatically
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validation states (<code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">required</code>,{' '}
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">min</code>,{' '}
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max</code>) are reported through the constraint validation API
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Form reset clears the component's value via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">formResetCallback()</code>
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hidden inputs or JavaScript glue code needed
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Value Formats */}
        <section id="value-formats" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Value Formats</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">ISO 8601 formats for all components</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All components submit values in ISO 8601 format. These are machine-readable, timezone-agnostic,
            and directly parseable by any backend language.
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Component</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Format</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Example</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Spec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {valueFormats.map((f) => (
                  <tr key={f.component} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{f.component}</td>
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{f.format}</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{f.example}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Basic Form Example */}
        <section id="basic-form" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Basic Form Usage</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitting dates and times via FormData</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Date and Time</h3>
          <CodeBlock code={basicFormExample} language="html" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Date Range</h3>
          <CodeBlock code={dateRangeFormExample} language="html" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Form Reset</h3>
          <CodeBlock code={resetExample} language="html" />
        </section>

        {/* Section 4: Validation */}
        <section id="validation" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Validation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Constraint validation with ValidityState</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Components participate in the standard{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              constraint validation API
            </a>. Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">checkValidity()</code> and{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">reportValidity()</code> just like native inputs.
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Attribute</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">ValidityState Flag</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {validationStates.map((v) => (
                  <tr key={v.attribute} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.attribute}</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.validity}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CodeBlock code={validationExample} language="html" />
        </section>

        {/* Section 5: Framework Integration */}
        <section id="framework-integration" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Framework Integration</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">React, Vue, and Svelte form patterns</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Since components use ElementInternals, they work with standard FormData in any framework.
            No special bindings or adapters are needed.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">React</h3>
          <CodeBlock code={reactExample} language="tsx" filename="BookingForm.tsx" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Vue</h3>
          <CodeBlock code={vueExample} language="html" filename="BookingForm.vue" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Svelte</h3>
          <CodeBlock code={svelteExample} language="html" filename="BookingForm.svelte" />

          <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Event listeners:</span>{' '}
              For reactive updates without form submission, listen to{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-date-select</code>,{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-range-select</code>, or{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ui-time-change</code> events
              on the component elements.
            </p>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <div className="divider-fade my-12" />
      <PrevNextNav
        prev={{ title: 'Accessibility', href: '/guides/accessibility' }}
        next={{ title: 'Internationalization', href: '/guides/i18n' }}
      />
    </div>
  );
}
