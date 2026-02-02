import { useState, useRef, useEffect } from 'react';
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/popover';
import '@lit-ui/button';

// Popover props data from source
const popoverProps: PropDef[] = [
  {
    name: 'placement',
    type: 'Placement',
    default: '"bottom"',
    description: 'Preferred placement relative to trigger. Floating UI may flip if space is insufficient.',
  },
  {
    name: 'open',
    type: 'boolean',
    default: 'false',
    description: 'Whether the popover is visible. Setting this prop enables controlled mode.',
  },
  {
    name: 'arrow',
    type: 'boolean',
    default: 'false',
    description: 'Whether to show an arrow indicator pointing at the trigger.',
  },
  {
    name: 'modal',
    type: 'boolean',
    default: 'false',
    description: 'Enable modal mode with focus trapping via sentinel elements.',
  },
  {
    name: 'offset',
    type: 'number',
    default: '8',
    description: 'Offset distance from trigger in pixels.',
  },
  {
    name: 'match-trigger-width',
    type: 'boolean',
    default: 'false',
    description: 'Match the popover width to the trigger element width.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disable popover interaction.',
  },
];

const popoverSlots: SlotDef[] = [
  { name: '(default)', description: 'Trigger element that toggles the popover on click.' },
  { name: 'content', description: 'Popover body content displayed when open.' },
];

const popoverEvents: EventDef[] = [
  {
    name: 'open-changed',
    detail: '{ open: boolean }',
    description: 'Fired in controlled mode when the open state should change. Listen to this event and update the open prop accordingly.',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const popoverParts: CSSPartDef[] = [
  { name: 'trigger', description: 'The trigger wrapper element with aria-haspopup and aria-expanded.' },
  { name: 'popover', description: 'The popover panel container with role="dialog".' },
  { name: 'content', description: 'The popover content container with background, border, and padding.' },
  { name: 'arrow', description: 'The arrow indicator pointing at the trigger.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const popoverCSSVars: CSSVarDef[] = [
  { name: '--ui-popover-bg', default: 'var(--color-card)', description: 'Background color of the popover.' },
  { name: '--ui-popover-text', default: 'var(--color-card-foreground)', description: 'Text color of the popover.' },
  { name: '--ui-popover-border', default: 'var(--color-border)', description: 'Border color of the popover.' },
  { name: '--ui-popover-radius', default: '0.5rem', description: 'Border radius of the popover.' },
  { name: '--ui-popover-padding', default: '1rem', description: 'Inner padding of the popover content.' },
  { name: '--ui-popover-shadow', default: '0 10px 15px -3px rgb(0 0 0 / 0.1)', description: 'Box shadow of the popover.' },
  { name: '--ui-popover-arrow-size', default: '8px', description: 'Size of the arrow indicator.' },
  { name: '--ui-popover-max-width', default: '20rem', description: 'Maximum width of the popover.' },
  { name: '--ui-popover-z-index', default: '50', description: 'Z-index of the popover panel.' },
];

// Code examples for frameworks
const basicPopoverCode = {
  html: `<lui-popover>
  <lui-button>Click me</lui-button>
  <div slot="content">
    <p style="font-weight: 500; margin-bottom: 0.25rem;">Popover Title</p>
    <p style="font-size: 0.875rem; color: gray;">
      This is the popover content. Click outside or press Escape to close.
    </p>
  </div>
</lui-popover>`,
  react: `<lui-popover>
  <lui-button>Click me</lui-button>
  <div slot="content">
    <p className="font-medium mb-1">Popover Title</p>
    <p className="text-sm text-gray-500">
      This is the popover content. Click outside or press Escape to close.
    </p>
  </div>
</lui-popover>`,
  vue: `<template>
  <lui-popover>
    <lui-button>Click me</lui-button>
    <div slot="content">
      <p class="font-medium mb-1">Popover Title</p>
      <p class="text-sm text-gray-500">
        This is the popover content. Click outside or press Escape to close.
      </p>
    </div>
  </lui-popover>
</template>`,
  svelte: `<lui-popover>
  <lui-button>Click me</lui-button>
  <div slot="content">
    <p class="font-medium mb-1">Popover Title</p>
    <p class="text-sm text-gray-500">
      This is the popover content. Click outside or press Escape to close.
    </p>
  </div>
</lui-popover>`,
};

const arrowPopoverCode = {
  html: `<lui-popover arrow>
  <lui-button variant="outline">With Arrow</lui-button>
  <div slot="content">
    <p style="font-weight: 500; margin-bottom: 0.25rem;">Arrow Popover</p>
    <p style="font-size: 0.875rem; color: gray;">
      This popover has an arrow indicator pointing at the trigger.
    </p>
  </div>
</lui-popover>`,
  react: `<lui-popover arrow>
  <lui-button variant="outline">With Arrow</lui-button>
  <div slot="content">
    <p className="font-medium mb-1">Arrow Popover</p>
    <p className="text-sm text-gray-500">
      This popover has an arrow indicator pointing at the trigger.
    </p>
  </div>
</lui-popover>`,
  vue: `<template>
  <lui-popover arrow>
    <lui-button variant="outline">With Arrow</lui-button>
    <div slot="content">
      <p class="font-medium mb-1">Arrow Popover</p>
      <p class="text-sm text-gray-500">
        This popover has an arrow indicator pointing at the trigger.
      </p>
    </div>
  </lui-popover>
</template>`,
  svelte: `<lui-popover arrow>
  <lui-button variant="outline">With Arrow</lui-button>
  <div slot="content">
    <p class="font-medium mb-1">Arrow Popover</p>
    <p class="text-sm text-gray-500">
      This popover has an arrow indicator pointing at the trigger.
    </p>
  </div>
</lui-popover>`,
};

const controlledPopoverCode = {
  html: `<lui-button onclick="togglePopover()">Toggle Popover</lui-button>

<lui-popover id="my-popover" open>
  <lui-button>Trigger</lui-button>
  <div slot="content">Controlled popover content</div>
</lui-popover>

<script>
  const popover = document.getElementById('my-popover');
  popover.addEventListener('open-changed', (e) => {
    popover.open = e.detail.open;
  });
</script>`,
  react: `const [open, setOpen] = useState(false);
const ref = useRef(null);

useEffect(() => {
  const el = ref.current;
  if (el) {
    const handler = (e) => setOpen(e.detail.open);
    el.addEventListener('open-changed', handler);
    return () => el.removeEventListener('open-changed', handler);
  }
}, []);

<lui-popover ref={ref} open={open}>
  <lui-button onClick={() => setOpen(!open)}>Toggle</lui-button>
  <div slot="content">Controlled popover content</div>
</lui-popover>`,
  vue: `<script setup>
const isOpen = ref(false);

function handleOpenChanged(e) {
  isOpen.value = e.detail.open;
}
</script>

<template>
  <lui-popover :open="isOpen" @open-changed="handleOpenChanged">
    <lui-button @click="isOpen = !isOpen">Toggle</lui-button>
    <div slot="content">Controlled popover content</div>
  </lui-popover>
</template>`,
  svelte: `<script>
  let isOpen = false;

  function handleOpenChanged(e) {
    isOpen = e.detail.open;
  }
</script>

<lui-popover open={isOpen} on:open-changed={handleOpenChanged}>
  <lui-button on:click={() => isOpen = !isOpen}>Toggle</lui-button>
  <div slot="content">Controlled popover content</div>
</lui-popover>`,
};

const matchWidthPopoverCode = {
  html: `<lui-popover match-trigger-width>
  <lui-button style="width: 16rem;">Select an option</lui-button>
  <div slot="content">
    <p style="font-size: 0.875rem; color: gray;">
      This popover matches the width of its trigger element.
    </p>
  </div>
</lui-popover>`,
  react: `<lui-popover match-trigger-width>
  <lui-button style={{ width: '16rem' }}>Select an option</lui-button>
  <div slot="content">
    <p className="text-sm text-gray-500">
      This popover matches the width of its trigger element.
    </p>
  </div>
</lui-popover>`,
  vue: `<template>
  <lui-popover match-trigger-width>
    <lui-button style="width: 16rem;">Select an option</lui-button>
    <div slot="content">
      <p class="text-sm text-gray-500">
        This popover matches the width of its trigger element.
      </p>
    </div>
  </lui-popover>
</template>`,
  svelte: `<lui-popover match-trigger-width>
  <lui-button style="width: 16rem;">Select an option</lui-button>
  <div slot="content">
    <p class="text-sm text-gray-500">
      This popover matches the width of its trigger element.
    </p>
  </div>
</lui-popover>`,
};

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - affects all popovers */
:root {
  --ui-popover-bg: white;
  --ui-popover-text: #1e293b;
  --ui-popover-border: #e2e8f0;
  --ui-popover-radius: 0.75rem;
  --ui-popover-padding: 1.25rem;
}

/* Scoped override - only affects popovers in this container */
.compact-popovers {
  --ui-popover-padding: 0.5rem;
  --ui-popover-radius: 0.375rem;
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the popover content */
lui-popover::part(content) {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
  border: 1px solid #fde68a;
}

/* Style the trigger wrapper */
lui-popover::part(trigger) {
  display: inline-flex;
}

/* Style the arrow */
lui-popover::part(arrow) {
  background: #fefce8;
  border-color: #fde68a;
}`;

// Interactive demo components
function BasicPopoverDemo() {
  return (
    <lui-popover>
      <lui-button>Click me</lui-button>
      <div slot="content">
        <p className="font-medium mb-1">Popover Title</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is the popover content. Click outside or press Escape to close.
        </p>
      </div>
    </lui-popover>
  );
}

function ArrowPopoverDemo() {
  return (
    <lui-popover arrow>
      <lui-button variant="outline">With Arrow</lui-button>
      <div slot="content">
        <p className="font-medium mb-1">Arrow Popover</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This popover has an arrow indicator pointing at the trigger.
        </p>
      </div>
    </lui-popover>
  );
}

function ControlledPopoverDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      const handler = (e: Event) => setOpen((e as CustomEvent).detail.open);
      el.addEventListener('open-changed', handler);
      return () => el.removeEventListener('open-changed', handler);
    }
  }, []);

  return (
    <div className="flex items-center gap-4">
      <lui-popover ref={ref} {...(open ? { open: true } : {})}>
        <lui-button onClick={() => setOpen(!open)}>Toggle Popover</lui-button>
        <div slot="content">
          <p className="font-medium mb-1">Controlled Popover</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This popover is managed via React state and the open-changed event.
          </p>
        </div>
      </lui-popover>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        State: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{open ? 'open' : 'closed'}</code>
      </span>
    </div>
  );
}

function MatchTriggerWidthDemo() {
  return (
    <lui-popover match-trigger-width>
      <lui-button style={{ width: '16rem' }}>Select an option</lui-button>
      <div slot="content">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This popover matches the width of its trigger element. Useful for dropdown-style menus.
        </p>
      </div>
    </lui-popover>
  );
}

export function PopoverPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Popover
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              A click-triggered interactive overlay with focus management and Floating UI positioning.
              Supports controlled and uncontrolled modes, modal focus trapping, nested popovers,
              and trigger width matching for dropdown-style layouts.
            </p>
          </div>
        </header>

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

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Popover</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Click the trigger to toggle the popover. Click outside or press Escape to dismiss.
            </p>
            <ExampleBlock
              preview={<BasicPopoverDemo />}
              html={basicPopoverCode.html}
              react={basicPopoverCode.react}
              vue={basicPopoverCode.vue}
              svelte={basicPopoverCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">With Arrow</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">arrow</code> attribute to show an arrow indicator connecting the popover to its trigger.
            </p>
            <ExampleBlock
              preview={<ArrowPopoverDemo />}
              html={arrowPopoverCode.html}
              react={arrowPopoverCode.react}
              vue={arrowPopoverCode.vue}
              svelte={arrowPopoverCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Controlled Mode</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">open</code> prop to control the popover externally.
              Listen for the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">open-changed</code> event to stay in sync.
            </p>
            <ExampleBlock
              preview={<ControlledPopoverDemo />}
              html={controlledPopoverCode.html}
              react={controlledPopoverCode.react}
              vue={controlledPopoverCode.vue}
              svelte={controlledPopoverCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Match Trigger Width</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">match-trigger-width</code> to make the popover match the trigger element width. Useful for dropdown menus and select-like patterns.
            </p>
            <ExampleBlock
              preview={<MatchTriggerWidthDemo />}
              html={matchWidthPopoverCode.html}
              react={matchWidthPopoverCode.react}
              vue={matchWidthPopoverCode.vue}
              svelte={matchWidthPopoverCode.svelte}
            />
          </section>

          {/* Accessibility */}
          <section>
            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Accessibility</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Screen reader and keyboard interaction details</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">1</span>
                  Focus management: focus moves into the popover content on open and returns to the trigger on close.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Trigger has <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-haspopup="dialog"</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-expanded</code> reflecting the open state.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Popover panel has <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="dialog"</code> for screen reader identification.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Pressing <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Escape</code> dismisses the popover. Clicking outside also dismisses via the Popover API light dismiss.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Modal mode traps focus within the popover using sentinel elements, preventing tabbing to background content.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">6</span>
                  Animations respect the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">prefers-reduced-motion</code> media query.
                </li>
              </ul>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Popover component supports two tiers of customization: CSS custom properties for simple changes and CSS parts for advanced styling.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change popover appearance globally or within a scoped container.
            </p>
            <CodeBlock code={cssVarsCode} language="css" />
          </section>

          {/* CSS Parts */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Parts
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">Advanced</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">::part()</code> pseudo-element for complete styling control over internal elements.
            </p>
            <CodeBlock code={cssPartsCode} language="css" />
          </section>
        </div>

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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props, slots, events, and styling</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{popoverProps.length}</span>
            </div>
            <PropsTable props={popoverProps} />
          </div>

          {/* Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{popoverSlots.length}</span>
            </div>
            <SlotsTable slots={popoverSlots} />
          </div>

          {/* Events */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{popoverEvents.length}</span>
            </div>
            <EventsTable events={popoverEvents} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{popoverCSSVars.length}</span>
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
                  {popoverCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{popoverParts.length}</span>
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
                  {popoverParts.map((part) => (
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
          prev={{ title: 'Input', href: '/components/input' }}
          next={{ title: 'Radio', href: '/components/radio' }}
        />
      </div>
    </FrameworkProvider>
  );
}
