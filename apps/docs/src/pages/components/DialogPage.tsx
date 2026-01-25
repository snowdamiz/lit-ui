import { useState, useRef, useEffect } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import 'lit-ui';

// JSX type declaration for ui-dialog (ui-button is declared in ButtonPage.tsx)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-dialog': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          open?: boolean;
          size?: 'sm' | 'md' | 'lg';
          dismissible?: boolean;
          'show-close-button'?: boolean;
          'dialog-class'?: string;
          ref?: React.RefObject<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}

// Dialog props data from source
const dialogProps: PropDef[] = [
  {
    name: 'open',
    type: 'boolean',
    default: 'false',
    description: 'Whether the dialog is visible. Uses showModal() for focus trapping.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'The max-width of the dialog (24rem, 28rem, or 32rem).',
  },
  {
    name: 'dismissible',
    type: 'boolean',
    default: 'true',
    description: 'Whether the dialog can be closed via Escape or backdrop click.',
  },
  {
    name: 'show-close-button',
    type: 'boolean',
    default: 'false',
    description: 'Shows an X button in the top-right corner.',
  },
  {
    name: 'dialog-class',
    type: 'string',
    default: '""',
    description: 'Additional Tailwind classes to customize the dialog content container.',
  },
];

const dialogSlots: SlotDef[] = [
  { name: 'title', description: 'Dialog title/header content.' },
  { name: '(default)', description: 'Dialog body content.' },
  { name: 'footer', description: 'Dialog footer, typically action buttons.' },
];

const dialogEvents: EventDef[] = [
  {
    name: 'close',
    detail: '{ reason: "escape" | "backdrop" | "programmatic" }',
    description: 'Fired when the dialog closes. Detail includes the close reason.',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const dialogParts: CSSPartDef[] = [
  { name: 'dialog', description: 'The native dialog element.' },
  { name: 'content', description: 'The content container with background and padding.' },
  { name: 'close-button', description: 'The optional close button in the top-right corner.' },
  { name: 'header', description: 'The header/title section.' },
  { name: 'body', description: 'The main body content area.' },
  { name: 'footer', description: 'The footer section for action buttons.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const dialogCSSVars: CSSVarDef[] = [
  { name: '--ui-dialog-radius', default: 'var(--radius-lg)', description: 'Border radius of the dialog content.' },
  { name: '--ui-dialog-shadow', default: 'var(--shadow-lg)', description: 'Box shadow of the dialog content.' },
  { name: '--ui-dialog-padding', default: 'var(--spacing-6)', description: 'Inner padding of the dialog content.' },
];

// Code examples for frameworks
const basicDialogCode = {
  html: `<ui-button onclick="document.getElementById('demo-dialog').open = true">
  Open Dialog
</ui-button>

<ui-dialog id="demo-dialog" show-close-button>
  <span slot="title">Dialog Title</span>
  <p>This is the dialog content. You can put any content here.</p>
</ui-dialog>`,
  react: `const [open, setOpen] = useState(false);

<ui-button onClick={() => setOpen(true)}>Open Dialog</ui-button>
<ui-dialog open={open} show-close-button onClose={() => setOpen(false)}>
  <span slot="title">Dialog Title</span>
  <p>This is the dialog content. You can put any content here.</p>
</ui-dialog>`,
  vue: `<script setup>
const isOpen = ref(false);
</script>

<template>
  <ui-button @click="isOpen = true">Open Dialog</ui-button>
  <ui-dialog :open="isOpen" show-close-button @close="isOpen = false">
    <span slot="title">Dialog Title</span>
    <p>This is the dialog content. You can put any content here.</p>
  </ui-dialog>
</template>`,
  svelte: `<script>
  let isOpen = false;
</script>

<ui-button on:click={() => isOpen = true}>Open Dialog</ui-button>
<ui-dialog open={isOpen} show-close-button on:close={() => isOpen = false}>
  <span slot="title">Dialog Title</span>
  <p>This is the dialog content. You can put any content here.</p>
</ui-dialog>`,
};

const confirmDialogCode = {
  html: `<ui-dialog id="confirm-dialog">
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to proceed? This action cannot be undone.</p>
  <div slot="footer">
    <ui-button variant="outline" onclick="this.closest('ui-dialog').open = false">
      Cancel
    </ui-button>
    <ui-button variant="destructive" onclick="handleConfirm()">
      Confirm
    </ui-button>
  </div>
</ui-dialog>`,
  react: `<ui-dialog open={open} onClose={() => setOpen(false)}>
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to proceed? This action cannot be undone.</p>
  <div slot="footer">
    <ui-button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </ui-button>
    <ui-button variant="destructive" onClick={handleConfirm}>
      Confirm
    </ui-button>
  </div>
</ui-dialog>`,
  vue: `<ui-dialog :open="isOpen" @close="isOpen = false">
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to proceed? This action cannot be undone.</p>
  <div slot="footer">
    <ui-button variant="outline" @click="isOpen = false">
      Cancel
    </ui-button>
    <ui-button variant="destructive" @click="handleConfirm">
      Confirm
    </ui-button>
  </div>
</ui-dialog>`,
  svelte: `<ui-dialog open={isOpen} on:close={() => isOpen = false}>
  <span slot="title">Confirm Action</span>
  <p>Are you sure you want to proceed? This action cannot be undone.</p>
  <div slot="footer">
    <ui-button variant="outline" on:click={() => isOpen = false}>
      Cancel
    </ui-button>
    <ui-button variant="destructive" on:click={handleConfirm}>
      Confirm
    </ui-button>
  </div>
</ui-dialog>`,
};

// Class passthrough example code
const classPassthroughCode = {
  html: `<ui-dialog id="wide-dialog" dialog-class="max-w-2xl">
  <span slot="title">Wide Dialog</span>
  <p>This dialog uses dialog-class for a wider max-width.</p>
</ui-dialog>

<ui-dialog id="styled-dialog" dialog-class="bg-gradient-to-br from-gray-50 to-gray-100">
  <span slot="title">Styled Dialog</span>
  <p>This dialog has a gradient background via Tailwind classes.</p>
</ui-dialog>`,
  react: `<ui-dialog open={open} dialog-class="max-w-2xl" onClose={() => setOpen(false)}>
  <span slot="title">Wide Dialog</span>
  <p>This dialog uses dialog-class for a wider max-width.</p>
</ui-dialog>

<ui-dialog open={open} dialog-class="bg-gradient-to-br from-gray-50 to-gray-100">
  <span slot="title">Styled Dialog</span>
  <p>This dialog has a gradient background via Tailwind classes.</p>
</ui-dialog>`,
  vue: `<ui-dialog :open="isOpen" dialog-class="max-w-2xl" @close="isOpen = false">
  <span slot="title">Wide Dialog</span>
  <p>This dialog uses dialog-class for a wider max-width.</p>
</ui-dialog>

<ui-dialog :open="isOpen" dialog-class="bg-gradient-to-br from-gray-50 to-gray-100">
  <span slot="title">Styled Dialog</span>
  <p>This dialog has a gradient background via Tailwind classes.</p>
</ui-dialog>`,
  svelte: `<ui-dialog open={isOpen} dialog-class="max-w-2xl" on:close={() => isOpen = false}>
  <span slot="title">Wide Dialog</span>
  <p>This dialog uses dialog-class for a wider max-width.</p>
</ui-dialog>

<ui-dialog open={isOpen} dialog-class="bg-gradient-to-br from-gray-50 to-gray-100">
  <span slot="title">Styled Dialog</span>
  <p>This dialog has a gradient background via Tailwind classes.</p>
</ui-dialog>`,
};

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - affects all dialogs */
:root {
  --ui-dialog-radius: 1rem;
  --ui-dialog-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --ui-dialog-padding: 2rem;
}

/* Scoped override - only affects dialogs in this container */
.compact-dialogs {
  --ui-dialog-padding: 1rem;
  --ui-dialog-radius: 0.5rem;
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the dialog content with complete control */
ui-dialog::part(content) {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Style the header */
ui-dialog::part(header) {
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

/* Style the footer */
ui-dialog::part(footer) {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}`;

function BasicDialogDemo() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (el) {
      const handleClose = () => setOpen(false);
      el.addEventListener('close', handleClose);
      return () => el.removeEventListener('close', handleClose);
    }
  }, []);

  return (
    <div>
      <ui-button onClick={() => setOpen(true)}>Open Dialog</ui-button>
      <ui-dialog ref={dialogRef} {...(open ? { open: true } : {})} show-close-button>
        <span slot="title">Dialog Title</span>
        <p>This is the dialog content. You can put any content here.</p>
      </ui-dialog>
    </div>
  );
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (el) {
      const handleClose = () => setOpen(false);
      el.addEventListener('close', handleClose);
      return () => el.removeEventListener('close', handleClose);
    }
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    // In a real app, perform the confirmed action here
  };

  return (
    <div>
      <ui-button variant="destructive" onClick={() => setOpen(true)}>
        Delete Item
      </ui-button>
      <ui-dialog ref={dialogRef} {...(open ? { open: true } : {})}>
        <span slot="title">Confirm Action</span>
        <p>Are you sure you want to proceed? This action cannot be undone.</p>
        <div slot="footer">
          <ui-button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </ui-button>
          <ui-button variant="destructive" onClick={handleConfirm}>
            Confirm
          </ui-button>
        </div>
      </ui-dialog>
    </div>
  );
}

function ClassPassthroughDemo() {
  const [wideOpen, setWideOpen] = useState(false);
  const [styledOpen, setStyledOpen] = useState(false);
  const wideDialogRef = useRef<HTMLElement>(null);
  const styledDialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const wideEl = wideDialogRef.current;
    const styledEl = styledDialogRef.current;

    const handleWideClose = () => setWideOpen(false);
    const handleStyledClose = () => setStyledOpen(false);

    if (wideEl) {
      wideEl.addEventListener('close', handleWideClose);
    }
    if (styledEl) {
      styledEl.addEventListener('close', handleStyledClose);
    }

    return () => {
      if (wideEl) wideEl.removeEventListener('close', handleWideClose);
      if (styledEl) styledEl.removeEventListener('close', handleStyledClose);
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-3">
      <ui-button onClick={() => setWideOpen(true)}>Wide Dialog</ui-button>
      <ui-button variant="secondary" onClick={() => setStyledOpen(true)}>Styled Dialog</ui-button>

      <ui-dialog ref={wideDialogRef} {...(wideOpen ? { open: true } : {})} dialog-class="max-w-2xl" show-close-button>
        <span slot="title">Wide Dialog</span>
        <p>This dialog uses <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">dialog-class="max-w-2xl"</code> for a wider max-width than the default.</p>
        <p className="mt-2 text-gray-500 text-sm">The extra width is useful for content that needs more horizontal space, like tables or forms with side-by-side fields.</p>
      </ui-dialog>

      <ui-dialog ref={styledDialogRef} {...(styledOpen ? { open: true } : {})} dialog-class="bg-gradient-to-br from-gray-50 to-gray-100" show-close-button>
        <span slot="title">Styled Dialog</span>
        <p>This dialog has a gradient background applied via Tailwind classes.</p>
        <p className="mt-2 text-gray-500 text-sm">Use <code className="px-1.5 py-0.5 bg-white rounded text-xs font-mono">dialog-class</code> to add any Tailwind utilities for per-instance customization.</p>
      </ui-dialog>
    </div>
  );
}

export function DialogPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4 md:text-5xl">
              Dialog
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              An accessible modal dialog component built on the native HTML dialog element.
              Provides automatic focus trapping, keyboard handling, and backdrop with smooth
              enter/exit animations.
            </p>
          </div>
        </header>

        {/* Examples Section */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Examples</h2>
              <p className="text-sm text-gray-500">Interactive demonstrations of common use cases</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>

          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Basic Dialog</h3>
            <p className="text-gray-500 mb-4 text-sm">
              A simple dialog with a title, content, and close button. Click the backdrop or press Escape to dismiss.
            </p>
            <ExampleBlock
              preview={<BasicDialogDemo />}
              html={basicDialogCode.html}
              react={basicDialogCode.react}
              vue={basicDialogCode.vue}
              svelte={basicDialogCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Confirmation Dialog</h3>
            <p className="text-gray-500 mb-4 text-sm">
              A dialog with action buttons in the footer for confirming or canceling an action.
            </p>
            <ExampleBlock
              preview={<ConfirmDialogDemo />}
              html={confirmDialogCode.html}
              react={confirmDialogCode.react}
              vue={confirmDialogCode.vue}
              svelte={confirmDialogCode.svelte}
            />
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Custom Styling</h3>
            <p className="text-gray-500 mb-4 text-sm">
              The Dialog component supports three tiers of customization, from simple to advanced.
            </p>
          </section>

          {/* Tier 1: CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Override CSS custom properties to change dialog appearance globally or within a scoped container.
              This is the simplest approach for common customizations like padding and border radius.
            </p>
            <CodeBlock code={cssVarsCode} language="css" />
          </section>

          {/* Tier 2: Class Passthrough */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Class Passthrough</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">dialog-class</code> attribute to add Tailwind utility classes for per-instance customization.
            </p>
            <ExampleBlock
              preview={<ClassPassthroughDemo />}
              html={classPassthroughCode.html}
              react={classPassthroughCode.react}
              vue={classPassthroughCode.vue}
              svelte={classPassthroughCode.svelte}
            />
          </section>

          {/* Tier 3: CSS Parts */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              CSS Parts
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">Advanced</span>
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">::part()</code> pseudo-element for complete styling control over internal elements.
              This is useful for complex customizations like gradient backgrounds or custom borders.
            </p>
            <CodeBlock code={cssPartsCode} language="css" />
          </section>
        </div>

        {/* API Reference */}
        <section className="mt-20 mb-14 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Reference</h2>
              <p className="text-sm text-gray-500">Complete documentation of props, slots, and events</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{dialogProps.length}</span>
            </div>
            <PropsTable props={dialogProps} />
          </div>

          {/* Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{dialogSlots.length}</span>
            </div>
            <SlotsTable slots={dialogSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{dialogCSSVars.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dialogCSSVars.map((cssVar) => (
                    <tr key={cssVar.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-800">{cssVar.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600">{cssVar.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{cssVar.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CSS Parts */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">CSS Parts</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{dialogParts.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Part</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dialogParts.map((part) => (
                    <tr key={part.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-800">::part({part.name})</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{part.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Events</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{dialogEvents.length}</span>
            </div>
            <EventsTable events={dialogEvents} />
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Button', href: '/components/button' }}
        />
      </div>
    </FrameworkProvider>
  );
}
