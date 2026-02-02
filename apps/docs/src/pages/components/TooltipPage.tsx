import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/tooltip';
import '@lit-ui/button';

// Tooltip props data from source
const tooltipProps: PropDef[] = [
  {
    name: 'content',
    type: 'string',
    default: '""',
    description: 'Text content for the tooltip. Alternative to the content slot.',
  },
  {
    name: 'placement',
    type: 'Placement',
    default: '"top"',
    description: 'Preferred placement relative to trigger. Floating UI may flip if space is insufficient.',
  },
  {
    name: 'show-delay',
    type: 'number',
    default: '300',
    description: 'Delay in milliseconds before showing tooltip on hover.',
  },
  {
    name: 'hide-delay',
    type: 'number',
    default: '100',
    description: 'Delay in milliseconds before hiding tooltip after pointer leaves.',
  },
  {
    name: 'arrow',
    type: 'boolean',
    default: 'true',
    description: 'Whether to show an arrow indicator pointing at the trigger.',
  },
  {
    name: 'offset',
    type: 'number',
    default: '8',
    description: 'Offset distance from trigger in pixels.',
  },
  {
    name: 'rich',
    type: 'boolean',
    default: 'false',
    description: 'Whether this is a rich tooltip with title and description.',
  },
  {
    name: 'tooltip-title',
    type: 'string',
    default: '""',
    description: 'Title text for the rich tooltip variant. Uses tooltip-title attribute to avoid HTMLElement.title conflict.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disable tooltip display.',
  },
];

const tooltipSlots: SlotDef[] = [
  { name: '(default)', description: 'Trigger element that the tooltip attaches to.' },
  { name: 'content', description: 'Named slot for rich tooltip content. Overrides the content property.' },
  { name: 'title', description: 'Named slot for rich tooltip title. Overrides the tooltip-title property.' },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const tooltipParts: CSSPartDef[] = [
  { name: 'trigger', description: 'The trigger wrapper element.' },
  { name: 'tooltip', description: 'The tooltip panel container.' },
  { name: 'content', description: 'The tooltip content container with background and padding.' },
  { name: 'arrow', description: 'The arrow indicator pointing at the trigger.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const tooltipCSSVars: CSSVarDef[] = [
  { name: '--ui-tooltip-bg', default: 'var(--color-foreground)', description: 'Background color of the tooltip.' },
  { name: '--ui-tooltip-text', default: 'var(--color-background)', description: 'Text color of the tooltip.' },
  { name: '--ui-tooltip-radius', default: '0.375rem', description: 'Border radius of the tooltip.' },
  { name: '--ui-tooltip-padding-x', default: '0.75rem', description: 'Horizontal padding of the tooltip.' },
  { name: '--ui-tooltip-padding-y', default: '0.375rem', description: 'Vertical padding of the tooltip.' },
  { name: '--ui-tooltip-font-size', default: '0.875rem', description: 'Font size of the tooltip text.' },
  { name: '--ui-tooltip-shadow', default: '0 4px 6px -1px rgb(0 0 0 / 0.1)', description: 'Box shadow of the tooltip.' },
  { name: '--ui-tooltip-arrow-size', default: '8px', description: 'Size of the arrow indicator.' },
  { name: '--ui-tooltip-max-width', default: '20rem', description: 'Maximum width of the tooltip.' },
  { name: '--ui-tooltip-z-index', default: '50', description: 'Z-index of the tooltip panel.' },
];

// Code examples for frameworks
const basicTooltipCode = {
  html: `<lui-tooltip content="This is a helpful tooltip">
  <lui-button>Hover me</lui-button>
</lui-tooltip>`,
  react: `<lui-tooltip content="This is a helpful tooltip">
  <lui-button>Hover me</lui-button>
</lui-tooltip>`,
  vue: `<template>
  <lui-tooltip content="This is a helpful tooltip">
    <lui-button>Hover me</lui-button>
  </lui-tooltip>
</template>`,
  svelte: `<lui-tooltip content="This is a helpful tooltip">
  <lui-button>Hover me</lui-button>
</lui-tooltip>`,
};

const placementTooltipCode = {
  html: `<lui-tooltip content="Top tooltip" placement="top">
  <lui-button variant="outline">Top</lui-button>
</lui-tooltip>

<lui-tooltip content="Right tooltip" placement="right">
  <lui-button variant="outline">Right</lui-button>
</lui-tooltip>

<lui-tooltip content="Bottom tooltip" placement="bottom">
  <lui-button variant="outline">Bottom</lui-button>
</lui-tooltip>

<lui-tooltip content="Left tooltip" placement="left">
  <lui-button variant="outline">Left</lui-button>
</lui-tooltip>`,
  react: `<div className="flex flex-wrap gap-4">
  <lui-tooltip content="Top tooltip" placement="top">
    <lui-button variant="outline">Top</lui-button>
  </lui-tooltip>
  <lui-tooltip content="Right tooltip" placement="right">
    <lui-button variant="outline">Right</lui-button>
  </lui-tooltip>
  <lui-tooltip content="Bottom tooltip" placement="bottom">
    <lui-button variant="outline">Bottom</lui-button>
  </lui-tooltip>
  <lui-tooltip content="Left tooltip" placement="left">
    <lui-button variant="outline">Left</lui-button>
  </lui-tooltip>
</div>`,
  vue: `<template>
  <div class="flex flex-wrap gap-4">
    <lui-tooltip content="Top tooltip" placement="top">
      <lui-button variant="outline">Top</lui-button>
    </lui-tooltip>
    <lui-tooltip content="Right tooltip" placement="right">
      <lui-button variant="outline">Right</lui-button>
    </lui-tooltip>
    <lui-tooltip content="Bottom tooltip" placement="bottom">
      <lui-button variant="outline">Bottom</lui-button>
    </lui-tooltip>
    <lui-tooltip content="Left tooltip" placement="left">
      <lui-button variant="outline">Left</lui-button>
    </lui-tooltip>
  </div>
</template>`,
  svelte: `<div class="flex flex-wrap gap-4">
  <lui-tooltip content="Top tooltip" placement="top">
    <lui-button variant="outline">Top</lui-button>
  </lui-tooltip>
  <lui-tooltip content="Right tooltip" placement="right">
    <lui-button variant="outline">Right</lui-button>
  </lui-tooltip>
  <lui-tooltip content="Bottom tooltip" placement="bottom">
    <lui-button variant="outline">Bottom</lui-button>
  </lui-tooltip>
  <lui-tooltip content="Left tooltip" placement="left">
    <lui-button variant="outline">Left</lui-button>
  </lui-tooltip>
</div>`,
};

const richTooltipCode = {
  html: `<lui-tooltip rich tooltip-title="Keyboard Shortcut">
  <span slot="content">Press Ctrl+S to save your document</span>
  <lui-button>Details</lui-button>
</lui-tooltip>`,
  react: `<lui-tooltip rich tooltip-title="Keyboard Shortcut">
  <span slot="content">Press Ctrl+S to save your document</span>
  <lui-button>Details</lui-button>
</lui-tooltip>`,
  vue: `<template>
  <lui-tooltip rich tooltip-title="Keyboard Shortcut">
    <span slot="content">Press Ctrl+S to save your document</span>
    <lui-button>Details</lui-button>
  </lui-tooltip>
</template>`,
  svelte: `<lui-tooltip rich tooltip-title="Keyboard Shortcut">
  <span slot="content">Press Ctrl+S to save your document</span>
  <lui-button>Details</lui-button>
</lui-tooltip>`,
};

const noArrowTooltipCode = {
  html: `<lui-tooltip content="No arrow indicator" arrow="false">
  <lui-button variant="outline">No Arrow</lui-button>
</lui-tooltip>`,
  react: `<lui-tooltip content="No arrow indicator" arrow={false}>
  <lui-button variant="outline">No Arrow</lui-button>
</lui-tooltip>`,
  vue: `<template>
  <lui-tooltip content="No arrow indicator" :arrow="false">
    <lui-button variant="outline">No Arrow</lui-button>
  </lui-tooltip>
</template>`,
  svelte: `<lui-tooltip content="No arrow indicator" arrow={false}>
  <lui-button variant="outline">No Arrow</lui-button>
</lui-tooltip>`,
};

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - affects all tooltips */
:root {
  --ui-tooltip-bg: #1e293b;
  --ui-tooltip-text: #f8fafc;
  --ui-tooltip-radius: 0.5rem;
  --ui-tooltip-padding-x: 1rem;
  --ui-tooltip-padding-y: 0.5rem;
}

/* Scoped override - only affects tooltips in this container */
.custom-tooltips {
  --ui-tooltip-font-size: 0.75rem;
  --ui-tooltip-max-width: 16rem;
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the tooltip panel */
lui-tooltip::part(tooltip) {
  filter: drop-shadow(0 10px 15px rgb(0 0 0 / 0.2));
}

/* Style the tooltip content */
lui-tooltip::part(content) {
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Style the arrow */
lui-tooltip::part(arrow) {
  background: #1e293b;
}`;

// Interactive demo components
function BasicTooltipDemo() {
  return (
    <lui-tooltip content="This is a helpful tooltip">
      <lui-button>Hover me</lui-button>
    </lui-tooltip>
  );
}

function PlacementDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <lui-tooltip content="Top tooltip" placement="top">
        <lui-button variant="outline">Top</lui-button>
      </lui-tooltip>
      <lui-tooltip content="Right tooltip" placement="right">
        <lui-button variant="outline">Right</lui-button>
      </lui-tooltip>
      <lui-tooltip content="Bottom tooltip" placement="bottom">
        <lui-button variant="outline">Bottom</lui-button>
      </lui-tooltip>
      <lui-tooltip content="Left tooltip" placement="left">
        <lui-button variant="outline">Left</lui-button>
      </lui-tooltip>
    </div>
  );
}

function RichTooltipDemo() {
  return (
    <lui-tooltip rich tooltip-title="Keyboard Shortcut">
      <span slot="content">Press Ctrl+S to save your document</span>
      <lui-button>Details</lui-button>
    </lui-tooltip>
  );
}

function NoArrowDemo() {
  return (
    <lui-tooltip content="No arrow indicator" arrow={false}>
      <lui-button variant="outline">No Arrow</lui-button>
    </lui-tooltip>
  );
}

export function TooltipPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Tooltip
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              An accessible hover and focus tooltip component with Floating UI positioning.
              Supports 12 placement options with collision avoidance, configurable delays,
              arrow indicators, and a rich variant with title and description.
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Tooltip</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Hover or focus the trigger to show a tooltip. The tooltip appears after a short delay and hides when the pointer leaves.
            </p>
            <ExampleBlock
              preview={<BasicTooltipDemo />}
              html={basicTooltipCode.html}
              react={basicTooltipCode.react}
              vue={basicTooltipCode.vue}
              svelte={basicTooltipCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Placement</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Tooltips support 12 placement options. Floating UI automatically flips to an alternate position if there is insufficient space.
            </p>
            <ExampleBlock
              preview={<PlacementDemo />}
              html={placementTooltipCode.html}
              react={placementTooltipCode.react}
              vue={placementTooltipCode.vue}
              svelte={placementTooltipCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Rich Tooltip</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Rich tooltips display a title and description for more detailed information. Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">rich</code> attribute
              with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">tooltip-title</code> and the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">content</code> slot.
            </p>
            <ExampleBlock
              preview={<RichTooltipDemo />}
              html={richTooltipCode.html}
              react={richTooltipCode.react}
              vue={richTooltipCode.vue}
              svelte={richTooltipCode.svelte}
            />
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Without Arrow</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">arrow={'{false}'}</code> to hide the arrow indicator.
            </p>
            <ExampleBlock
              preview={<NoArrowDemo />}
              html={noArrowTooltipCode.html}
              react={noArrowTooltipCode.react}
              vue={noArrowTooltipCode.vue}
              svelte={noArrowTooltipCode.svelte}
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
                  Uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-describedby</code> to link the trigger element to the tooltip content for screen readers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Tooltip appears on both hover and keyboard focus, ensuring accessibility for keyboard-only users.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Pressing <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Escape</code> dismisses the tooltip immediately.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Touch devices do not trigger tooltips. Pointer type filtering ensures touch users are not shown tooltips that would obscure content.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Delay groups skip the show delay when moving between adjacent tooltips, improving discoverability.
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
              The Tooltip component supports two tiers of customization: CSS custom properties for simple changes and CSS parts for advanced styling.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change tooltip appearance globally or within a scoped container.
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props, slots, and styling</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tooltipProps.length}</span>
            </div>
            <PropsTable props={tooltipProps} />
          </div>

          {/* Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tooltipSlots.length}</span>
            </div>
            <SlotsTable slots={tooltipSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tooltipCSSVars.length}</span>
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
                  {tooltipCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tooltipParts.length}</span>
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
                  {tooltipParts.map((part) => (
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
          prev={{ title: 'Toast', href: '/components/toast' }}
          next={{ title: 'Theme Configurator', href: '/configurator' }}
        />
      </div>
    </FrameworkProvider>
  );
}
