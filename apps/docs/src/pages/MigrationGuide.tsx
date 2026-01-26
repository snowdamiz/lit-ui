/**
 * Migration Guide documentation page
 * Explains how to convert copy-source projects to npm mode
 */

import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

const migrateCommand = `npx lit-ui migrate`;

const importChange = `// Before (copy-source)
import './components/ui/button';

// After (npm)
import '@lit-ui/button';`;

const importUsage = `// The component tag names stay the same
<lui-button variant="primary">Click me</lui-button>`;

export function MigrationGuide() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Migration Guide
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Convert your copy-source project to use npm packages for automatic updates and smaller bundles.
          </p>
        </div>
      </header>

      {/* Section 1: When to Migrate */}
      <section id="when-to-migrate" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">When to Migrate</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Decide if migration is right for you</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Consider migrating to npm packages if you:
        </p>
        <ul className="space-y-2 mb-6">
          {[
            'Want automatic updates via npm update',
            'Don\'t need to customize component internals',
            'Prefer smaller bundles from tree-shaking',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Keep copy-source</span>{' '}
            if you've customized component code or want full ownership of the source files.
          </p>
        </div>
      </section>

      {/* Section 2: Run the Migration */}
      <section id="run-migration" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Run the Migration</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">One command to convert your project</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Run this command in your project directory:
        </p>
        <CodeBlock code={migrateCommand} language="bash" />

        <div className="mt-8 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">The migration command will:</p>
          <div className="space-y-2">
            {[
              { text: 'Find copied components in your project' },
              { text: 'Check for modifications (shows diff if changed)' },
              { text: 'Install npm packages (@lit-ui/button, etc.)' },
              { text: 'Delete source files after confirmation' },
              { text: 'Update config to npm mode' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Update Your Imports */}
      <section id="update-imports" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Update Your Imports</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Change local paths to npm packages</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          After migration, update your import statements:
        </p>
        <CodeBlock code={importChange} language="typescript" />

        <p className="text-gray-600 dark:text-gray-400 mt-6 mb-4">
          The component tag names remain the same:
        </p>
        <CodeBlock code={importUsage} language="tsx" />

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Tip:</span>{' '}
            The CLI shows you exactly which imports to update after migration completes.
          </p>
        </div>
      </section>

      {/* Section 4: Modified Files */}
      <section id="modified-files" className="scroll-mt-20 mb-14 animate-fade-in-up opacity-0 stagger-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Modified Files</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Handling customized components</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you've customized a component, the CLI detects changes and shows a diff:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Component modified</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The CLI shows added and removed lines compared to the original template, then asks for confirmation before proceeding.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 mb-2">Your options:</p>
            <ul className="space-y-2">
              {[
                { action: 'Migrate', desc: 'Replaces your file with npm package (loses changes)' },
                { action: 'Skip', desc: 'Keeps source file, that component stays as copy-source' },
              ].map((item) => (
                <li key={item.action} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-16 flex-shrink-0">{item.action}:</span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Mixed mode:</span>{' '}
            You can keep some components as copy-source while others use npm packages. The config switches to npm mode, but skipped components remain as local files.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="divider-fade mb-8" />
      <PrevNextNav
        prev={{ title: 'SSR Setup', href: '/guides/ssr' }}
        next={{ title: 'Button', href: '/components/button' }}
      />
    </div>
  );
}
