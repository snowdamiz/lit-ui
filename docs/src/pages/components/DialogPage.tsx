import { useState, useRef, useEffect } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';

// Side-effect imports to register custom elements
import '../../lib/ui-dialog';
import '../../lib/ui-button';

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
      <ui-dialog ref={dialogRef} open={open} show-close-button>
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
      <ui-dialog ref={dialogRef} open={open}>
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

export function DialogPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dialog</h1>
          <p className="text-lg text-gray-600">
            An accessible modal dialog component built on the native HTML dialog element.
            Provides automatic focus trapping, keyboard handling, and backdrop with smooth
            enter/exit animations.
          </p>
        </header>

        {/* Examples Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Examples</h2>

          <ExampleBlock
            title="Basic Dialog"
            description="A simple dialog with a title, content, and close button. Click the backdrop or press Escape to dismiss."
            preview={<BasicDialogDemo />}
            html={basicDialogCode.html}
            react={basicDialogCode.react}
            vue={basicDialogCode.vue}
            svelte={basicDialogCode.svelte}
          />

          <ExampleBlock
            title="Confirmation Dialog"
            description="A dialog with action buttons in the footer for confirming or canceling an action."
            preview={<ConfirmDialogDemo />}
            html={confirmDialogCode.html}
            react={confirmDialogCode.react}
            vue={confirmDialogCode.vue}
            svelte={confirmDialogCode.svelte}
          />
        </section>

        {/* API Reference */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">API Reference</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Props</h3>
              <PropsTable props={dialogProps} />
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Slots</h3>
              <SlotsTable slots={dialogSlots} />
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Events</h3>
              <EventsTable events={dialogEvents} />
            </div>
          </div>
        </section>

        {/* Navigation */}
        <PrevNextNav
          prev={{ title: 'Button', href: '/components/button' }}
        />
      </div>
    </FrameworkProvider>
  );
}
