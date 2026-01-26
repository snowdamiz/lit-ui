/**
 * Installation documentation page
 * Primary path: NPM packages
 * Alternative: Copy-source for full ownership
 */

import { Link } from 'react-router';
import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

const npmInstallCommand = `npm install @lit-ui/core @lit-ui/button @lit-ui/dialog`;

const singlePackageCommand = `npm install @lit-ui/button`;

const usageExample = `import '@lit-ui/button';

// Use in JSX, Vue template, Svelte, or plain HTML
<lui-button variant="primary">Click me</lui-button>`;

const copySourceInit = `npx lit-ui init`;

const copySourceAdd = `npx lit-ui add button`;

export function Installation() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Installation
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Choose how you want to use LitUI: install packages from npm for automatic updates, or copy the source code for full ownership and customization.
          </p>
        </div>
      </header>

      {/* Section 1: NPM Installation */}
      <section id="npm-installation" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">NPM Installation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Recommended for most projects</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Install the components you need:
        </p>
        <CodeBlock code={npmInstallCommand} language="bash" />

        <p className="text-gray-600 dark:text-gray-400 mt-6 mb-4">
          Or install components individually:
        </p>
        <CodeBlock code={singlePackageCommand} language="bash" />

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Using yarn or pnpm?</span>{' '}
            Replace <code className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">npm install</code> with{' '}
            <code className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">yarn add</code> or{' '}
            <code className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">pnpm add</code>.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mt-8 mb-4">
          Import and use the components:
        </p>
        <CodeBlock code={usageExample} language="tsx" />

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Web components work everywhere.</span>{' '}
            Use <code className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">lui-button</code> directly in React, Vue, Svelte, Angular, or plain HTML.
          </p>
        </div>
      </section>

      {/* Section 2: Copy-Source Installation */}
      <section id="copy-source" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Copy-Source Installation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Own and customize the source code</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Initialize LitUI in your project to get the base files:
        </p>
        <CodeBlock code={copySourceInit} language="bash" />

        <p className="text-gray-600 dark:text-gray-400 mt-6 mb-4">
          Then add components to copy their source into your project:
        </p>
        <CodeBlock code={copySourceAdd} language="bash" />

        <p className="text-gray-600 dark:text-gray-400 mt-6">
          For a detailed walkthrough of the copy-source workflow, including project structure and customization, see the{' '}
          <Link to="/getting-started" className="text-gray-900 dark:text-gray-100 font-medium underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2 hover:decoration-gray-900 dark:hover:decoration-gray-400 transition-colors">
            Getting Started guide
          </Link>.
        </p>
      </section>

      {/* Section 3: Choosing Your Approach */}
      <section id="choosing" className="scroll-mt-20 mb-14 animate-fade-in-up opacity-0 stagger-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Choosing Your Approach</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Trade-offs to consider</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Aspect</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">NPM Packages</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Copy-Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Updates</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Automatic via npm update</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Manual (run migrate command)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Customization</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">CSS variables only</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Full source access</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Bundle size</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Tree-shakeable</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Only what you copy</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Best for</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Standard usage, staying up-to-date</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Deep customization, code ownership</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Start with npm packages.</span>{' '}
            You can always switch to copy-source later if you need deeper customization.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="divider-fade mb-8" />
      <PrevNextNav
        prev={{ title: 'Getting Started', href: '/getting-started' }}
        next={{ title: 'SSR Setup', href: '/guides/ssr' }}
      />
    </div>
  );
}
