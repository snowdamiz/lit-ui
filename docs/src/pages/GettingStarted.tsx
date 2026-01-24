/**
 * Getting Started documentation page
 *
 * A single scrollable page that guides new users through:
 * 1. Installation (npx lit-ui init)
 * 2. Quick Start (adding and using the Button component)
 * 3. Project Structure (understanding the generated files)
 * 4. What's Next (links to further reading)
 */

import { CodeBlock } from '../components/CodeBlock';
import { FrameworkTabs } from '../components/FrameworkTabs';
import { LivePreview } from '../components/LivePreview';

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

export function GettingStarted() {
  return (
    <article className="prose prose-gray max-w-none">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
        <p className="text-xl text-gray-600">
          Get up and running in 2 minutes.
        </p>
      </header>

      {/* Section 1: Installation */}
      <section id="installation" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Installation</h2>
        <p className="text-gray-600 mb-4">
          Initialize lit-ui in your existing project. This works with React, Vue, Svelte, or any framework.
        </p>
        <CodeBlock code={installCommand} language="bash" />
        <p className="text-gray-600 mt-4 mb-2">
          This command sets up everything you need:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
          <li>Creates <code className="bg-gray-100 px-1 rounded">lit-ui.json</code> config file</li>
          <li>Sets up <code className="bg-gray-100 px-1 rounded">src/lib/lit-ui/</code> with base files (TailwindElement, theme config)</li>
          <li>Creates <code className="bg-gray-100 px-1 rounded">src/components/ui/</code> directory for your components</li>
        </ul>
        <p className="text-sm text-gray-500">
          Using yarn or pnpm? Just use <code className="bg-gray-100 px-1 rounded">yarn dlx lit-ui init</code> or <code className="bg-gray-100 px-1 rounded">pnpm dlx lit-ui init</code> instead.
        </p>
      </section>

      {/* Section 2: Quick Start */}
      <section id="quick-start" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Add Your First Component</h2>
        <p className="text-gray-600 mb-4">
          Now let's add your first component. We'll start with the Button.
        </p>
        <CodeBlock code={addButtonCommand} language="bash" />
        <p className="text-gray-600 mt-4 mb-4">
          This copies the Button component to your project. Now you can use it in your app:
        </p>
        <FrameworkTabs
          react={reactExample}
          vue={vueExample}
          svelte={svelteExample}
        />
        <LivePreview />
        <p className="text-gray-600 mt-4">
          That's it! The button is a native web component, so it works in any framework.
        </p>
      </section>

      {/* Section 3: Project Structure */}
      <section id="project-structure" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Project Structure</h2>
        <p className="text-gray-600 mb-4">
          After running init and adding a component, your project will have:
        </p>
        <CodeBlock code={projectStructure} language="plaintext" />
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="font-medium text-gray-900">lit-ui.json</dt>
            <dd className="text-gray-600 text-sm mt-1">
              Stores your component path preferences. Customize where components are installed.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">tailwind-element.ts</dt>
            <dd className="text-gray-600 text-sm mt-1">
              Base class that injects Tailwind CSS into Shadow DOM. All components extend this.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">tailwind.css</dt>
            <dd className="text-gray-600 text-sm mt-1">
              Your theme tokens (colors, spacing, etc.). Edit this to customize your design system.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">button.ts</dt>
            <dd className="text-gray-600 text-sm mt-1">
              The actual component. You own this code - customize it freely.
            </dd>
          </div>
        </dl>
      </section>

      {/* Section 4: What's Next */}
      <section id="whats-next" className="scroll-mt-20 mb-12">
        <h2 className="text-2xl font-semibold mb-4">What's Next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
          <a
            href="/components/button"
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Components</h3>
            <p className="text-sm text-gray-600">
              Explore Button, Dialog, and more.
            </p>
          </a>
          <a
            href="/guides/theming"
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Theming</h3>
            <p className="text-sm text-gray-600">
              Customize colors and design tokens.
            </p>
          </a>
          <a
            href="/guides/react"
            className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Framework Guides</h3>
            <p className="text-sm text-gray-600">
              React, Vue, and Svelte integration tips.
            </p>
          </a>
        </div>
      </section>
    </article>
  );
}
