/**
 * Internationalization Guide documentation page
 * Cross-cutting guide covering locale configuration, Intl API usage,
 * locale-dependent behaviors, and override mechanisms.
 */

import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

// Locale-dependent behaviors
const localeBehaviors = [
  { behavior: 'Month and weekday names', api: 'Intl.DateTimeFormat', example: 'January vs. Januar vs. Janvier' },
  { behavior: 'First day of week', api: 'Intl.Locale.getWeekInfo()', example: 'Sunday (en-US) vs. Monday (de-DE)' },
  { behavior: 'Date display format', api: 'Intl.DateTimeFormat', example: 'MM/DD/YYYY (en-US) vs. DD.MM.YYYY (de-DE)' },
  { behavior: '12h/24h time format', api: 'Intl.DateTimeFormat hourCycle', example: '2:30 PM (en-US) vs. 14:30 (de-DE)' },
  { behavior: 'Number formatting', api: 'Intl.NumberFormat', example: 'Locale-aware digit rendering' },
];

const setLocaleExample = `<!-- Set locale on individual components -->
<lui-calendar locale="de-DE"></lui-calendar>

<lui-date-picker locale="ja-JP" label="Date"></lui-date-picker>

<lui-date-range-picker locale="fr-FR" label="Period"></lui-date-range-picker>

<lui-time-picker locale="en-GB" label="Time"></lui-time-picker>`;

const globalLocaleExample = `<!-- Set locale globally via a wrapper -->
<div id="app" data-locale="de-DE">
  <lui-calendar></lui-calendar>
  <lui-date-picker label="Date"></lui-date-picker>
  <lui-time-picker label="Time"></lui-time-picker>
</div>

<script>
  // Set locale on all date/time components at once
  const locale = document.getElementById('app').dataset.locale;

  document.querySelectorAll(
    'lui-calendar, lui-date-picker, lui-date-range-picker, lui-time-picker'
  ).forEach(el => {
    el.locale = locale;
  });
</script>`;

const overrideExample = `<!-- Override first day of week (regardless of locale) -->
<lui-calendar
  locale="en-US"
  first-day-of-week="1"
></lui-calendar>
<!-- en-US normally starts on Sunday, but this starts on Monday -->

<!-- Override 12h/24h format -->
<lui-time-picker
  locale="en-US"
  hour12="false"
  label="Time"
></lui-time-picker>
<!-- en-US normally uses 12h, but this uses 24h -->

<!-- Override display format via JS property -->
<lui-date-picker
  locale="en-US"
  label="Date"
></lui-date-picker>

<script>
  const picker = document.querySelector('lui-date-picker');
  // Custom format function for display
  picker.format = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
    // "Sat, Feb 14" instead of "02/14/2026"
  };
</script>`;

const intlExample = `// How components use the Intl API internally

// Month and weekday names
const formatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
});
formatter.format(new Date(2026, 1, 1)); // "Februar"

// First day of week
const locale = new Intl.Locale('de-DE');
const weekInfo = locale.getWeekInfo();
weekInfo.firstDay; // 1 (Monday)

// Hour cycle detection
const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
});
const parts = timeFormat.resolvedOptions();
parts.hourCycle; // "h12"

const timeFormatDE = new Intl.DateTimeFormat('de-DE', {
  hour: 'numeric',
});
const partsDE = timeFormatDE.resolvedOptions();
partsDE.hourCycle; // "h23"`;

const commonLocales = [
  { tag: 'en-US', firstDay: 'Sunday', hourCycle: '12h', dateFormat: 'MM/DD/YYYY' },
  { tag: 'en-GB', firstDay: 'Monday', hourCycle: '24h', dateFormat: 'DD/MM/YYYY' },
  { tag: 'de-DE', firstDay: 'Monday', hourCycle: '24h', dateFormat: 'DD.MM.YYYY' },
  { tag: 'fr-FR', firstDay: 'Monday', hourCycle: '24h', dateFormat: 'DD/MM/YYYY' },
  { tag: 'ja-JP', firstDay: 'Sunday', hourCycle: '24h', dateFormat: 'YYYY/MM/DD' },
  { tag: 'ar-SA', firstDay: 'Saturday', hourCycle: '12h', dateFormat: 'DD/MM/YYYY' },
  { tag: 'he-IL', firstDay: 'Sunday', hourCycle: '24h', dateFormat: 'DD.MM.YYYY' },
  { tag: 'zh-CN', firstDay: 'Monday', hourCycle: '24h', dateFormat: 'YYYY/MM/DD' },
  { tag: 'ko-KR', firstDay: 'Sunday', hourCycle: '12h', dateFormat: 'YYYY.MM.DD' },
  { tag: 'pt-BR', firstDay: 'Sunday', hourCycle: '24h', dateFormat: 'DD/MM/YYYY' },
];

export function I18nGuide() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Internationalization
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            All date and time components support internationalization via the{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">locale</code>{' '}
            attribute using BCP 47 locale tags and the native Intl API.
          </p>
        </div>
      </header>

      <div className="space-y-16 animate-fade-in-up opacity-0 stagger-2">
        {/* Section 1: Setting Locale */}
        <section id="setting-locale" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Setting Locale</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Per-component and global locale configuration</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Set the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">locale</code> attribute
            on any date or time component using a{' '}
            <a href="https://www.rfc-editor.org/info/bcp47" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              BCP 47
            </a>{' '}
            language tag. If no locale is specified, the component defaults to the browser's locale.
          </p>

          <CodeBlock code={setLocaleExample} language="html" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Setting Locale Globally</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            To set the same locale on all components, set the property programmatically:
          </p>

          <CodeBlock code={globalLocaleExample} language="html" />
        </section>

        {/* Section 2: What Locale Affects */}
        <section id="locale-effects" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">What Locale Affects</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Locale-dependent behaviors powered by Intl API</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Behavior</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Powered By</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {localeBehaviors.map((b) => (
                  <tr key={b.behavior} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{b.behavior}</td>
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{b.api}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Under the Hood</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Components use the browser's native <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Intl</code> API
            directly. No locale data is bundled with the components, keeping bundle size minimal.
          </p>

          <CodeBlock code={intlExample} language="typescript" />
        </section>

        {/* Section 3: Common Locales Reference */}
        <section id="common-locales" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Common Locales Reference</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Default behaviors for popular locales</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Locale</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">First Day</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Hour Cycle</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Date Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {commonLocales.map((l) => (
                  <tr key={l.tag} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{l.tag}</code>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{l.firstDay}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{l.hourCycle}</td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{l.dateFormat}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Overriding Locale Defaults */}
        <section id="overrides" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Overriding Locale Defaults</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fine-grained control over locale-dependent behavior</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            While the locale determines default behaviors, you can override specific aspects using component attributes:
          </p>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">first-day-of-week</code>
                <span className="text-xs text-gray-500 dark:text-gray-400">Calendar, Date Picker, Date Range Picker</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Override the locale's first day of week. Accepts <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">1</code> (Monday)
                through <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">7</code> (Sunday).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">hour12</code>
                <span className="text-xs text-gray-500 dark:text-gray-400">Time Picker</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Override the locale's hour cycle. Set to <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">true</code> for 12-hour
                or <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">false</code> for 24-hour format.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">format</code>
                <span className="text-xs text-gray-500 dark:text-gray-400">Date Picker (JS property)</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Override the display format. Accepts a function that receives a Date and returns a formatted string.
                The form submission value always remains ISO 8601 regardless of display format.
              </p>
            </div>
          </div>

          <CodeBlock code={overrideExample} language="html" />
        </section>

        {/* Section 5: Supported Locales */}
        <section id="supported-locales" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Supported Locales</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Any locale your browser supports</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Since components use the browser's native <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Intl</code> API,
            any BCP 47 locale tag supported by the user's browser is automatically supported. No locale data is
            bundled with the components, so there is zero impact on bundle size regardless of how many locales you support.
          </p>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Browser support:</span>{' '}
              All modern browsers support <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Intl.DateTimeFormat</code> with
              hundreds of locales. <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Intl.Locale.getWeekInfo()</code> requires
              Chrome 99+, Safari 17+, or Firefox 120+. For older browsers, the component falls back to
              Sunday for en-US/he-IL and Monday for all other locales.
            </p>
          </div>
        </section>

        {/* Section 6: RTL Support */}
        <section id="rtl" className="scroll-mt-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">RTL Support</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Right-to-left layout for Arabic, Hebrew, and other RTL locales</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Components automatically adapt their layout when used within an RTL context
            (set via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">dir="rtl"</code> on
            the document or a parent element):
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calendar navigation arrows swap direction (previous month on the right, next month on the left)
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calendar grid reads right-to-left (Saturday as the visual first column for ar-SA)
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date and time picker trigger text aligns to the right
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keyboard arrow left/right behavior is preserved (Arrow Right always moves to the next day, not visually right)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Automatic detection:</span>{' '}
              Components inherit the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">dir</code> attribute
              from the document or closest ancestor. No additional configuration is needed for RTL locales.
            </p>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <div className="divider-fade my-12" />
      <PrevNextNav
        prev={{ title: 'Form Integration', href: '/guides/form-integration' }}
        next={{ title: 'Migration', href: '/guides/migration' }}
      />
    </div>
  );
}
