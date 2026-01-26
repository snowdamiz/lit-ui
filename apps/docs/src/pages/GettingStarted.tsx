/**
 * Getting Started documentation page
 */

import { Link } from 'react-router';
import { CodeBlock } from '../components/CodeBlock';
import { FrameworkTabs } from '../components/FrameworkTabs';
import { LivePreview } from '../components/LivePreview';
import { PrevNextNav } from '../components/PrevNextNav';

const installCommand = `npx lit-ui init`;

const addButtonCommand = `npx lit-ui add button`;

const reactExample = `import '../components/ui/button'

function App() {
  return <ui-button variant="primary">Click me</ui-button>
}`;

const vueExample = `<script setup>
import '../components/ui/button'
</script>

<template>
  <ui-button variant="primary">Click me</ui-button>
</template>`;

const svelteExample = `<script>
  import '../components/ui/button'
</script>

<ui-button variant="primary">Click me</ui-button>`;

const projectStructure = `your-project/
├── lit-ui.json           # Configuration file
└── src/
    ├── lib/
    │   └── lit-ui/
    │       ├── tailwind-element.ts   # Base class for components
    │       ├── tailwind.css          # Theme configuration
    │       └── host-defaults.css     # Shadow DOM CSS workaround
    └── components/
        └── ui/
            └── button.ts             # Your Button component`;

const fileDescriptions = [
  {
    name: 'lit-ui.json',
    description: 'Stores your component path preferences. Customize where components are installed.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'tailwind-element.ts',
    description: 'Base class that injects Tailwind CSS into Shadow DOM. All components extend this.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
  {
    name: 'tailwind.css',
    description: 'Your theme tokens (colors, spacing, etc.). Edit this to customize your design system.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    name: 'button.ts',
    description: 'The actual component. You own this code - customize it freely.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

const nextSteps = [
  {
    title: 'Components',
    description: 'Explore Button, Dialog, and more.',
    href: '/components/button',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    title: 'Theming',
    description: 'Customize colors and design tokens.',
    href: '/guides/theming',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    title: 'Framework Guides',
    description: 'React, Vue, and Svelte integration tips.',
    href: '/guides/react',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export function GettingStarted() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
            Getting Started
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Get up and running with LitUI in just a few steps. Works with React, Vue, Svelte, or any framework.
          </p>
        </div>
      </header>

      {/* Section 1: Installation */}
      <section id="installation" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Installation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Initialize LitUI in your existing project</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Run this command to set up LitUI in your project:
        </p>
        <CodeBlock code={installCommand} language="bash" />

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">This command sets up everything you need:</p>
          <div className="space-y-2">
            {[
              { code: 'lit-ui.json', text: 'config file' },
              { code: 'src/lib/lit-ui/', text: 'with base files (TailwindElement, theme config)' },
              { code: 'src/components/ui/', text: 'directory for your components' },
            ].map((item) => (
              <div key={item.code} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Creates <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{item.code}</code> {item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Prefer npm packages?</span>{' '}
            See the{' '}
            <Link to="/installation" className="text-gray-900 dark:text-gray-100 font-medium underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2 hover:decoration-gray-900 dark:hover:decoration-gray-400 transition-colors">
              Installation guide
            </Link>{' '}
            for npm installation and other options.
          </p>
        </div>
      </section>

      {/* Section 2: Quick Start */}
      <section id="quick-start" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Your First Component</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start with the Button component</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add the Button component to your project:
        </p>
        <CodeBlock code={addButtonCommand} language="bash" />

        <p className="text-gray-600 dark:text-gray-400 mt-6 mb-4">
          Now use it in your app:
        </p>
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 card-elevated">
          <FrameworkTabs
            react={reactExample}
            vue={vueExample}
            svelte={svelteExample}
          />
        </div>

        <div className="mt-6">
          <LivePreview />
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">That's it!</span>{' '}
            The button is a native web component, so it works in any framework without wrappers.
          </p>
        </div>
      </section>

      {/* Section 3: Project Structure */}
      <section id="project-structure" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Project Structure</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Understanding the generated files</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          After running init and adding a component, your project will have:
        </p>
        <CodeBlock code={projectStructure} language="plaintext" />

        <div className="mt-8 space-y-3">
          {fileDescriptions.map((file, index) => (
            <div
              key={file.name}
              className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 card-elevated"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all group-hover:bg-gray-900 dark:group-hover:bg-gray-100 group-hover:text-white dark:group-hover:text-gray-900">
                  {file.icon}
                </div>
                <div>
                  <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-sm font-mono font-medium">
                    {file.name}
                  </code>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{file.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: What's Next */}
      <section id="whats-next" className="scroll-mt-20 mb-14 animate-fade-in-up opacity-0 stagger-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">What's Next?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Continue learning with these resources</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => (
            <a
              key={step.title}
              href={step.href}
              className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all group-hover:bg-gray-900 group-hover:text-white">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <div className="divider-fade mb-8" />
      <PrevNextNav
        next={{ title: 'Installation', href: '/installation' }}
      />
    </div>
  );
}
