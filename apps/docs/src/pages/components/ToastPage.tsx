import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements
import '@lit-ui/toast';
import '@lit-ui/button';

// Named import for imperative API
import { toast } from '@lit-ui/toast';

// JSX type declaration for lui-toaster
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-toaster': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          position?: string;
          'max-visible'?: number;
          gap?: number;
        },
        HTMLElement
      >;
    }
  }
}

// ---------------------------------------------------------------------------
// Data: Toaster Props (3)
// ---------------------------------------------------------------------------

const toasterProps: PropDef[] = [
  {
    name: 'position',
    type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
    default: '"bottom-right"',
    description: 'Position of the toast container on the viewport.',
  },
  {
    name: 'max-visible',
    type: 'number',
    default: '3',
    description: 'Maximum number of visible toasts at once. Additional toasts queue behind.',
  },
  {
    name: 'gap',
    type: 'number',
    default: '12',
    description: 'Gap between toasts in pixels.',
  },
];

// ---------------------------------------------------------------------------
// Data: CSS Custom Properties (21)
// ---------------------------------------------------------------------------

type CSSVarDef = { name: string; default: string; description: string };

const toastCSSVars: CSSVarDef[] = [
  // Base
  { name: '--ui-toast-bg', default: 'var(--color-card, var(--ui-color-card))', description: 'Background color of the toast.' },
  { name: '--ui-toast-text', default: 'var(--color-card-foreground, var(--ui-color-card-foreground))', description: 'Text color of the toast.' },
  { name: '--ui-toast-border', default: 'var(--color-border, var(--ui-color-border))', description: 'Border color of the toast.' },
  { name: '--ui-toast-radius', default: '0.5rem', description: 'Border radius of the toast.' },
  { name: '--ui-toast-padding', default: '1rem', description: 'Inner padding of the toast.' },
  { name: '--ui-toast-shadow', default: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', description: 'Box shadow of the toast.' },
  { name: '--ui-toast-max-width', default: '24rem', description: 'Maximum width of the toast container.' },
  { name: '--ui-toast-gap', default: '0.75rem', description: 'Gap between stacked toasts.' },
  { name: '--ui-toast-z-index', default: '55', description: 'Z-index of the toaster container.' },
  // Success variant
  { name: '--ui-toast-success-bg', default: 'oklch(0.95 0.05 150)', description: 'Background color for success toasts.' },
  { name: '--ui-toast-success-border', default: 'oklch(0.70 0.15 150)', description: 'Border color for success toasts.' },
  { name: '--ui-toast-success-icon', default: 'oklch(0.55 0.20 150)', description: 'Icon color for success toasts.' },
  // Error variant
  { name: '--ui-toast-error-bg', default: 'oklch(0.95 0.05 25)', description: 'Background color for error toasts.' },
  { name: '--ui-toast-error-border', default: 'oklch(0.70 0.15 25)', description: 'Border color for error toasts.' },
  { name: '--ui-toast-error-icon', default: 'oklch(0.55 0.20 25)', description: 'Icon color for error toasts.' },
  // Warning variant
  { name: '--ui-toast-warning-bg', default: 'oklch(0.95 0.05 85)', description: 'Background color for warning toasts.' },
  { name: '--ui-toast-warning-border', default: 'oklch(0.70 0.15 85)', description: 'Border color for warning toasts.' },
  { name: '--ui-toast-warning-icon', default: 'oklch(0.55 0.20 85)', description: 'Icon color for warning toasts.' },
  // Info variant
  { name: '--ui-toast-info-bg', default: 'oklch(0.95 0.05 250)', description: 'Background color for info toasts.' },
  { name: '--ui-toast-info-border', default: 'oklch(0.70 0.15 250)', description: 'Border color for info toasts.' },
  { name: '--ui-toast-info-icon', default: 'oklch(0.55 0.20 250)', description: 'Icon color for info toasts.' },
];

// ---------------------------------------------------------------------------
// Data: Imperative API functions
// ---------------------------------------------------------------------------

type APIFunctionDef = { fn: string; args: string; description: string };

const apiFunctions: APIFunctionDef[] = [
  { fn: 'toast(message)', args: 'message: string, options?: ToastOptions', description: 'Show a default toast notification.' },
  { fn: 'toast.success(message)', args: 'message: string, options?: ToastOptions', description: 'Show a success variant toast.' },
  { fn: 'toast.error(message)', args: 'message: string, options?: ToastOptions', description: 'Show an error variant toast.' },
  { fn: 'toast.warning(message)', args: 'message: string, options?: ToastOptions', description: 'Show a warning variant toast.' },
  { fn: 'toast.info(message)', args: 'message: string, options?: ToastOptions', description: 'Show an info variant toast.' },
  { fn: 'toast.promise(promise, msgs)', args: 'promise: Promise<T>, { loading, success, error }', description: 'Show a loading toast that resolves to success or error.' },
  { fn: 'toast.dismiss(id)', args: 'id: string', description: 'Dismiss a specific toast by its ID.' },
  { fn: 'toast.dismissAll()', args: '\u2014', description: 'Dismiss all active toasts.' },
];

// ---------------------------------------------------------------------------
// Data: CSS Parts
// ---------------------------------------------------------------------------

type CSSPartDef = { name: string; description: string };

const toastParts: CSSPartDef[] = [
  { name: 'container', description: 'The toaster wrapper element (popover container).' },
];

// ---------------------------------------------------------------------------
// Code: Quick Start / Imperative API
// ---------------------------------------------------------------------------

const imperativeAPICode = `import { toast } from '@lit-ui/toast';

// Basic
toast('Hello world');

// Variants
toast.success('Saved!');
toast.error('Something went wrong');
toast.warning('Careful!');
toast.info('FYI...');

// With options
toast('Custom toast', {
  description: 'More details here',
  duration: 8000,
  dismissible: true,
  action: { label: 'Undo', onClick: () => undoAction() },
  position: 'top-right',
});

// Promise
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed',
});

// Dismiss
const id = toast('Persistent', { duration: 0 });
toast.dismiss(id);
toast.dismissAll();`;

// ---------------------------------------------------------------------------
// Code: Framework examples
// ---------------------------------------------------------------------------

const basicToastCode = {
  html: `<script type="module">
  import { toast } from '@lit-ui/toast';
  document.querySelector('#toast-btn')
    .addEventListener('click', () => toast('Hello world!'));
</script>

<button id="toast-btn">Show Toast</button>`,
  react: `import { toast } from '@lit-ui/toast';

function App() {
  return (
    <button onClick={() => toast('Hello world!')}>
      Show Toast
    </button>
  );
}`,
  vue: `<script setup>
import { toast } from '@lit-ui/toast';
</script>

<template>
  <button @click="toast('Hello world!')">Show Toast</button>
</template>`,
  svelte: `<script>
  import { toast } from '@lit-ui/toast';
</script>

<button on:click={() => toast('Hello world!')}>Show Toast</button>`,
};

const variantsCode = {
  html: `<script type="module">
  import { toast } from '@lit-ui/toast';

  document.querySelector('#success-btn').addEventListener('click', () => toast.success('Changes saved!'));
  document.querySelector('#error-btn').addEventListener('click', () => toast.error('Something went wrong'));
  document.querySelector('#warning-btn').addEventListener('click', () => toast.warning('Are you sure?'));
  document.querySelector('#info-btn').addEventListener('click', () => toast.info('New update available'));
</script>

<button id="success-btn">Success</button>
<button id="error-btn">Error</button>
<button id="warning-btn">Warning</button>
<button id="info-btn">Info</button>`,
  react: `import { toast } from '@lit-ui/toast';

function App() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button onClick={() => toast.success('Changes saved!')}>Success</button>
      <button onClick={() => toast.error('Something went wrong')}>Error</button>
      <button onClick={() => toast.warning('Are you sure?')}>Warning</button>
      <button onClick={() => toast.info('New update available')}>Info</button>
    </div>
  );
}`,
  vue: `<script setup>
import { toast } from '@lit-ui/toast';
</script>

<template>
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
    <button @click="toast.success('Changes saved!')">Success</button>
    <button @click="toast.error('Something went wrong')">Error</button>
    <button @click="toast.warning('Are you sure?')">Warning</button>
    <button @click="toast.info('New update available')">Info</button>
  </div>
</template>`,
  svelte: `<script>
  import { toast } from '@lit-ui/toast';
</script>

<div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
  <button on:click={() => toast.success('Changes saved!')}>Success</button>
  <button on:click={() => toast.error('Something went wrong')}>Error</button>
  <button on:click={() => toast.warning('Are you sure?')}>Warning</button>
  <button on:click={() => toast.info('New update available')}>Info</button>
</div>`,
};

const descriptionCode = {
  html: `<script type="module">
  import { toast } from '@lit-ui/toast';
  document.querySelector('#desc-btn').addEventListener('click', () => {
    toast('Event Created', { description: 'Your event has been scheduled for tomorrow at 3:00 PM.' });
  });
</script>

<button id="desc-btn">Toast with Description</button>`,
  react: `import { toast } from '@lit-ui/toast';

function App() {
  return (
    <button onClick={() => toast('Event Created', {
      description: 'Your event has been scheduled for tomorrow at 3:00 PM.',
    })}>
      Toast with Description
    </button>
  );
}`,
  vue: `<script setup>
import { toast } from '@lit-ui/toast';

function showToast() {
  toast('Event Created', {
    description: 'Your event has been scheduled for tomorrow at 3:00 PM.',
  });
}
</script>

<template>
  <button @click="showToast">Toast with Description</button>
</template>`,
  svelte: `<script>
  import { toast } from '@lit-ui/toast';

  function showToast() {
    toast('Event Created', {
      description: 'Your event has been scheduled for tomorrow at 3:00 PM.',
    });
  }
</script>

<button on:click={showToast}>Toast with Description</button>`,
};

const actionCode = {
  html: `<script type="module">
  import { toast } from '@lit-ui/toast';
  document.querySelector('#action-btn').addEventListener('click', () => {
    toast('Item deleted', {
      action: { label: 'Undo', onClick: () => toast.success('Undone!') },
    });
  });
</script>

<button id="action-btn">Toast with Action</button>`,
  react: `import { toast } from '@lit-ui/toast';

function App() {
  return (
    <button onClick={() => toast('Item deleted', {
      action: { label: 'Undo', onClick: () => toast.success('Undone!') },
    })}>
      Toast with Action
    </button>
  );
}`,
  vue: `<script setup>
import { toast } from '@lit-ui/toast';

function showToast() {
  toast('Item deleted', {
    action: { label: 'Undo', onClick: () => toast.success('Undone!') },
  });
}
</script>

<template>
  <button @click="showToast">Toast with Action</button>
</template>`,
  svelte: `<script>
  import { toast } from '@lit-ui/toast';

  function showToast() {
    toast('Item deleted', {
      action: { label: 'Undo', onClick: () => toast.success('Undone!') },
    });
  }
</script>

<button on:click={showToast}>Toast with Action</button>`,
};

// ---------------------------------------------------------------------------
// Code: Toaster configuration
// ---------------------------------------------------------------------------

const toasterConfigCode = `<!-- Add to your app's root layout -->
<lui-toaster position="top-center" max-visible="5"></lui-toaster>

<!-- The toaster is auto-created if not present, but you can
     customize it by adding one explicitly. Only one toaster
     is needed per page. -->`;

// ---------------------------------------------------------------------------
// Code: CSS Custom Properties overrides
// ---------------------------------------------------------------------------

const cssVarsCode = `/* Global override - affects all toasts */
:root {
  --ui-toast-bg: var(--color-card, var(--ui-color-card));
  --ui-toast-text: var(--color-card-foreground, var(--ui-color-card-foreground));
  --ui-toast-border: var(--color-border, var(--ui-color-border));
  --ui-toast-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --ui-toast-max-width: 28rem;
}

/* Customize variant colors */
:root {
  --ui-toast-success-bg: oklch(0.95 0.05 150);
  --ui-toast-success-border: oklch(0.70 0.15 150);
  --ui-toast-success-icon: oklch(0.55 0.20 150);
}`;

// ---------------------------------------------------------------------------
// Demo Components
// ---------------------------------------------------------------------------

function BasicToastDemo() {
  return (
    <lui-button onClick={() => toast('Hello world!')}>
      Show Toast
    </lui-button>
  );
}

function VariantsDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <lui-button onClick={() => toast.success('Changes saved!')}>Success</lui-button>
      <lui-button onClick={() => toast.error('Something went wrong')}>Error</lui-button>
      <lui-button onClick={() => toast.warning('Are you sure?')}>Warning</lui-button>
      <lui-button onClick={() => toast.info('New update available')}>Info</lui-button>
    </div>
  );
}

function DescriptionDemo() {
  return (
    <lui-button onClick={() => toast('Event Created', {
      description: 'Your event has been scheduled for tomorrow at 3:00 PM.',
    })}>
      Toast with Description
    </lui-button>
  );
}

function ActionDemo() {
  return (
    <lui-button onClick={() => toast('Item deleted', {
      action: { label: 'Undo', onClick: () => toast.success('Undone!') },
    })}>
      Toast with Action
    </lui-button>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export function ToastPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Toast
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              A notification system with an imperative API for showing feedback messages.
              Supports variants (success, error, warning, info), queue management with
              configurable max visible count, auto-dismiss with pause on hover, and
              swipe-to-dismiss on touch devices.
            </p>
          </div>
        </header>

        {/* Quick Start / Imperative API */}
        <section className="mb-16 animate-fade-in-up opacity-0 stagger-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Imperative API</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Call functions to show toasts from anywhere in your app</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Unlike other components, Toast uses an imperative function-based API. Import the{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">toast</code>{' '}
            function and call it from event handlers, async flows, or anywhere in your code.
            A <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'<lui-toaster>'}</code>{' '}
            element is automatically created if one does not exist.
          </p>

          <CodeBlock code={imperativeAPICode} language="typescript" />
        </section>

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

          {/* Basic Toast */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Toast</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Click the button to show a default toast. Toasts auto-dismiss after 5 seconds,
              or swipe them away on touch devices.
            </p>
            <ExampleBlock
              preview={<BasicToastDemo />}
              html={basicToastCode.html}
              react={basicToastCode.react}
              vue={basicToastCode.vue}
              svelte={basicToastCode.svelte}
            />
          </section>

          {/* Variants */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Variants</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Four semantic variants with distinct colors and icons: success, error, warning, and info.
              Each variant uses OKLCH colors with automatic dark mode adjustments.
            </p>
            <ExampleBlock
              preview={<VariantsDemo />}
              html={variantsCode.html}
              react={variantsCode.react}
              vue={variantsCode.vue}
              svelte={variantsCode.svelte}
            />
          </section>

          {/* Toast with Description */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Toast with Description</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add a secondary description line below the title for additional context.
            </p>
            <ExampleBlock
              preview={<DescriptionDemo />}
              html={descriptionCode.html}
              react={descriptionCode.react}
              vue={descriptionCode.vue}
              svelte={descriptionCode.svelte}
            />
          </section>

          {/* Toast with Action */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Toast with Action</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Attach an action button to a toast for undo flows, retries, or navigation.
              The toast is dismissed when the action is clicked.
            </p>
            <ExampleBlock
              preview={<ActionDemo />}
              html={actionCode.html}
              react={actionCode.react}
              vue={actionCode.vue}
              svelte={actionCode.svelte}
            />
          </section>
        </div>

        {/* Accessibility */}
        <section className="mt-16 mb-16 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Accessibility</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Screen reader and keyboard interaction notes</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Feature</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">role="status"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    Info and success toasts use <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="status"</code> with{' '}
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-live="polite"</code> so they do not interrupt the current screen reader announcement.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">role="alert"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    Error toasts use <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="alert"</code> with{' '}
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-live="assertive"</code> so they are announced immediately.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">Auto-dismiss pause</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    The auto-dismiss timer pauses on hover and keyboard focus, giving users time to read or interact with the toast.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">prefers-reduced-motion</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    Enter and exit animations are disabled when the user has reduced motion preferences enabled.
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">Close button</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    Toasts are dismissible via a close button with{' '}
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-label="Close notification"</code> for keyboard users.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Toaster Configuration */}
        <section className="mb-16">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Toaster Configuration</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            A <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'<lui-toaster>'}</code>{' '}
            element is automatically created when you call{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">toast()</code>.
            To customize position, max visible count, or gap, add the element explicitly in your root layout.
          </p>
          <CodeBlock code={toasterConfigCode} language="html" />
        </section>

        {/* Custom Styling */}
        <section className="mb-16">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            CSS Custom Properties
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Override CSS custom properties to change toast appearance globally. The four variant groups
            (success, error, warning, info) each have{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">-bg</code>,{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">-border</code>, and{' '}
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">-icon</code> tokens.
          </p>
          <CodeBlock code={cssVarsCode} language="css" />
        </section>

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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of the imperative API, toaster props, and CSS tokens</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Imperative API Table */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Imperative API</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{apiFunctions.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Function</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Arguments</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {apiFunctions.map((fn) => (
                    <tr key={fn.fn} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{fn.fn}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{fn.args}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fn.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Toaster Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Toaster Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{toasterProps.length}</span>
            </div>
            <PropsTable props={toasterProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{toastCSSVars.length}</span>
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
                  {toastCSSVars.map((cssVar) => (
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

          {/* CSS Parts */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Parts</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{toastParts.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Part</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {toastParts.map((part) => (
                    <tr key={part.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">::part({part.name})</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{part.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Time Picker', href: '/components/time-picker' }}
          next={{ title: 'Tooltip', href: '/components/tooltip' }}
        />
      </div>
    </FrameworkProvider>
  );
}
