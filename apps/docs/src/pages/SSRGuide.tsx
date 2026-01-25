/**
 * SSR Setup documentation page
 */

import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

const hydrationImport = `// MUST be first import
import '@lit-ui/ssr/hydration';

// Then import components
import '@lit-ui/button';
import '@lit-ui/dialog';`;

const nextjsExample = `'use client';

// MUST be first import
import '@lit-ui/ssr/hydration';

// Then import components
import '@lit-ui/button';

export default function MyComponent() {
  return <lui-button variant="primary">Click me</lui-button>;
}`;

const astroExample = `---
// Frontmatter: register for SSR
import '@lit-ui/button';
---

<lui-button variant="primary">Click me</lui-button>

<script>
  // Hydration (must be first)
  import '@lit-ui/ssr/hydration';
  import '@lit-ui/button';
</script>`;

const foucCSS = `/* Add to global styles */
lui-button:not(:defined),
lui-dialog:not(:defined) {
  opacity: 0;
  visibility: hidden;
}`;

export function SSRGuide() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
        <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 opacity-50 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4 md:text-5xl">
            SSR Setup
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
            Use Lit UI components with server-side rendering in Next.js and Astro.
          </p>
        </div>
      </header>

      {/* Section 1: Hydration Import Order */}
      <section id="hydration-import" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hydration Import Order</h2>
            <p className="text-sm text-gray-500">The first import in any client-side entry point</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        <p className="text-gray-600 mb-4">
          The hydration import must be the first import before any Lit components:
        </p>
        <CodeBlock code={hydrationImport} language="typescript" />

        <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Why first?</span>{' '}
            This patches LitElement to properly hydrate server-rendered content. If components load first, hydration fails silently.
          </p>
        </div>
      </section>

      {/* Section 2: Next.js Setup */}
      <section id="nextjs" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Next.js Setup</h2>
            <p className="text-sm text-gray-500">App Router with 'use client' components</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">1</div>
            <div>
              <p className="text-gray-700 font-medium">Install packages</p>
              <CodeBlock code="npm install @lit-ui/core @lit-ui/button @lit-ui/ssr" language="bash" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">2</div>
            <div>
              <p className="text-gray-700 font-medium mb-2">Create a client component with 'use client' directive</p>
              <CodeBlock code={nextjsExample} language="typescript" filename="components/MyComponent.tsx" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Why 'use client'?</span>{' '}
            React Server Components can't serialize Shadow DOM templates. The client boundary ensures components render correctly.
          </p>
        </div>
      </section>

      {/* Section 3: Astro Setup */}
      <section id="astro" className="scroll-mt-20 mb-16 animate-fade-in-up opacity-0 stagger-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Astro Setup</h2>
            <p className="text-sm text-gray-500">Frontmatter imports for SSR, script tag for hydration</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">1</div>
            <div>
              <p className="text-gray-700 font-medium">Install packages</p>
              <CodeBlock code="npm install @lit-ui/core @lit-ui/button @lit-ui/ssr" language="bash" />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold">2</div>
            <div>
              <p className="text-gray-700 font-medium mb-2">Import in frontmatter for SSR, script tag for hydration</p>
              <CodeBlock code={astroExample} language="astro" filename="pages/index.astro" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Two imports?</span>{' '}
            Frontmatter runs at build time for SSR. The script tag runs in the browser for hydration and interactivity.
          </p>
        </div>
      </section>

      {/* Section 4: FOUC Prevention */}
      <section id="fouc" className="scroll-mt-20 mb-14 animate-fade-in-up opacity-0 stagger-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">FOUC Prevention</h2>
            <p className="text-sm text-gray-500">Hide components until defined</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        <p className="text-gray-600 mb-4">
          Hide components until JavaScript defines them to prevent flash of unstyled content:
        </p>
        <CodeBlock code={foucCSS} language="css" />

        <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Quick option:</span>{' '}
            Import the pre-built CSS: <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">@import '@lit-ui/core/fouc.css';</code>
          </p>
        </div>
      </section>

      {/* Navigation */}
      <div className="divider-fade mb-8" />
      <PrevNextNav
        prev={{ title: 'Installation', href: '/installation' }}
        next={{ title: 'Migration', href: '/guides/migration' }}
      />
    </div>
  );
}
