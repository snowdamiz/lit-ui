import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/accordion';

// Props data for lui-accordion (5 props)
const accordionProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Comma-separated list of expanded item values (controlled mode).',
  },
  {
    name: 'default-value',
    type: 'string',
    default: '""',
    description: 'Initial expanded items for uncontrolled mode.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Allow multiple panels open simultaneously.',
  },
  {
    name: 'collapsible',
    type: 'boolean',
    default: 'false',
    description: 'Allow all panels to close in single-expand mode.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disable all child items.',
  },
];

// Props data for lui-accordion-item (5 props)
const accordionItemProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Unique identifier for this item within the accordion group.',
  },
  {
    name: 'expanded',
    type: 'boolean',
    default: 'false',
    description: 'Whether this item is expanded (set by parent).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether this item is disabled.',
  },
  {
    name: 'heading-level',
    type: 'number',
    default: '3',
    description: 'ARIA heading level for the header element.',
  },
  {
    name: 'lazy',
    type: 'boolean',
    default: 'false',
    description: 'Defer panel content rendering until first expand.',
  },
];

// Slots data
const accordionSlots: SlotDef[] = [
  {
    name: '(default)',
    description: 'Child lui-accordion-item elements.',
  },
];

const accordionItemSlots: SlotDef[] = [
  {
    name: 'header',
    description: 'Content for the accordion header button.',
  },
  {
    name: '(default)',
    description: 'Panel content revealed when expanded.',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const accordionCSSVars: CSSVarDef[] = [
  { name: '--ui-accordion-border', default: 'var(--color-border)', description: 'Border color between items and around the container.' },
  { name: '--ui-accordion-border-width', default: '1px', description: 'Border width.' },
  { name: '--ui-accordion-radius', default: '0.375rem', description: 'Container border radius.' },
  { name: '--ui-accordion-header-padding', default: '1rem', description: 'Header button padding.' },
  { name: '--ui-accordion-header-font-weight', default: '500', description: 'Header font weight.' },
  { name: '--ui-accordion-header-font-size', default: '1rem', description: 'Header font size.' },
  { name: '--ui-accordion-header-text', default: 'var(--color-foreground)', description: 'Header text color.' },
  { name: '--ui-accordion-header-bg', default: 'transparent', description: 'Header background color.' },
  { name: '--ui-accordion-header-hover-bg', default: 'var(--color-muted)', description: 'Header background on hover.' },
  { name: '--ui-accordion-panel-padding', default: '0 1rem 1rem', description: 'Panel content padding.' },
  { name: '--ui-accordion-panel-text', default: 'var(--color-muted-foreground)', description: 'Panel text color.' },
  { name: '--ui-accordion-transition', default: '200ms', description: 'Animation duration for expand/collapse.' },
  { name: '--ui-accordion-ring', default: 'var(--color-ring)', description: 'Focus ring color.' },
];

// Code examples - web components use same syntax in all frameworks
const basicCode = `<lui-accordion default-value="item-1">
  <lui-accordion-item value="item-1">
    <span slot="header">What is Lit UI?</span>
    Lit UI is a collection of accessible web components built with Lit.
  </lui-accordion-item>
  <lui-accordion-item value="item-2">
    <span slot="header">How do I install it?</span>
    Install via npm: npm install @lit-ui/accordion
  </lui-accordion-item>
  <lui-accordion-item value="item-3">
    <span slot="header">Is it accessible?</span>
    Yes, all components follow WAI-ARIA patterns with full keyboard support.
  </lui-accordion-item>
</lui-accordion>`;

const multiExpandCode = `<lui-accordion multiple>
  <lui-accordion-item value="item-1">
    <span slot="header">Section One</span>
    Content for section one. Multiple sections can be open at once.
  </lui-accordion-item>
  <lui-accordion-item value="item-2">
    <span slot="header">Section Two</span>
    Content for section two. Try opening both panels simultaneously.
  </lui-accordion-item>
  <lui-accordion-item value="item-3">
    <span slot="header">Section Three</span>
    Content for section three.
  </lui-accordion-item>
</lui-accordion>`;

const collapsibleCode = `<lui-accordion collapsible default-value="item-1">
  <lui-accordion-item value="item-1">
    <span slot="header">Collapsible Panel</span>
    Click the header again to collapse this panel. In default mode, the open panel cannot be closed.
  </lui-accordion-item>
  <lui-accordion-item value="item-2">
    <span slot="header">Another Panel</span>
    You can close all panels when collapsible is enabled.
  </lui-accordion-item>
</lui-accordion>`;

const disabledCode = `<lui-accordion disabled default-value="item-1">
  <lui-accordion-item value="item-1">
    <span slot="header">Disabled Container</span>
    All items are disabled when set on the container.
  </lui-accordion-item>
  <lui-accordion-item value="item-2">
    <span slot="header">Also Disabled</span>
    This panel cannot be opened.
  </lui-accordion-item>
</lui-accordion>`;

const disabledItemCode = `<lui-accordion default-value="item-1">
  <lui-accordion-item value="item-1">
    <span slot="header">Enabled Item</span>
    This item works normally.
  </lui-accordion-item>
  <lui-accordion-item value="item-2" disabled>
    <span slot="header">Disabled Item</span>
    This individual item is disabled.
  </lui-accordion-item>
  <lui-accordion-item value="item-3">
    <span slot="header">Another Enabled Item</span>
    This item also works normally.
  </lui-accordion-item>
</lui-accordion>`;

const headingLevelCode = `<lui-accordion default-value="item-1">
  <lui-accordion-item value="item-1" heading-level="4">
    <span slot="header">Heading Level 4</span>
    This item uses h4 for its header, suitable for nested document outlines.
  </lui-accordion-item>
  <lui-accordion-item value="item-2" heading-level="4">
    <span slot="header">Also Level 4</span>
    Consistent heading levels help screen readers understand document structure.
  </lui-accordion-item>
</lui-accordion>`;

const lazyCode = `<lui-accordion>
  <lui-accordion-item value="item-1" lazy>
    <span slot="header">Lazy Panel 1</span>
    This content is not rendered until the panel is first expanded.
  </lui-accordion-item>
  <lui-accordion-item value="item-2" lazy>
    <span slot="header">Lazy Panel 2</span>
    Useful for heavy content that should only load on demand.
  </lui-accordion-item>
</lui-accordion>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all accordions */
:root {
  --ui-accordion-radius: 0.5rem;
  --ui-accordion-header-hover-bg: rgba(0, 0, 0, 0.05);
}

/* Scoped override - only in this container */
.faq-section {
  --ui-accordion-header-padding: 1.25rem;
  --ui-accordion-panel-padding: 0 1.25rem 1.25rem;
  --ui-accordion-transition: 300ms;
}`;

export function AccordionPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Accordion
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              An accessible accordion component with single or multi-expand modes,
              collapsible panels, CSS Grid height animation, and full keyboard navigation.
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

          {/* 1. Basic Accordion */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Accordion</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A single-expand accordion with one item open by default. Clicking another header closes the current panel and opens the new one.
            </p>
            <ExampleBlock
              preview={
                <lui-accordion default-value="item-1">
                  <lui-accordion-item value="item-1">
                    <span slot="header">What is Lit UI?</span>
                    Lit UI is a collection of accessible web components built with Lit.
                  </lui-accordion-item>
                  <lui-accordion-item value="item-2">
                    <span slot="header">How do I install it?</span>
                    Install via npm: npm install @lit-ui/accordion
                  </lui-accordion-item>
                  <lui-accordion-item value="item-3">
                    <span slot="header">Is it accessible?</span>
                    Yes, all components follow WAI-ARIA patterns with full keyboard support.
                  </lui-accordion-item>
                </lui-accordion>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Multi-expand */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Multi-expand</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">multiple</code> attribute to allow several panels to be open at the same time.
            </p>
            <ExampleBlock
              preview={
                <lui-accordion multiple>
                  <lui-accordion-item value="item-1">
                    <span slot="header">Section One</span>
                    Content for section one. Multiple sections can be open at once.
                  </lui-accordion-item>
                  <lui-accordion-item value="item-2">
                    <span slot="header">Section Two</span>
                    Content for section two. Try opening both panels simultaneously.
                  </lui-accordion-item>
                  <lui-accordion-item value="item-3">
                    <span slot="header">Section Three</span>
                    Content for section three.
                  </lui-accordion-item>
                </lui-accordion>
              }
              html={multiExpandCode}
              react={multiExpandCode}
              vue={multiExpandCode}
              svelte={multiExpandCode}
            />
          </section>

          {/* 3. Collapsible */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Collapsible</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              By default in single-expand mode, clicking the open panel header is a no-op. Add the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">collapsible</code> attribute to allow closing the last open panel.
            </p>
            <ExampleBlock
              preview={
                <lui-accordion collapsible default-value="item-1">
                  <lui-accordion-item value="item-1">
                    <span slot="header">Collapsible Panel</span>
                    Click the header again to collapse this panel. In default mode, the open panel cannot be closed.
                  </lui-accordion-item>
                  <lui-accordion-item value="item-2">
                    <span slot="header">Another Panel</span>
                    You can close all panels when collapsible is enabled.
                  </lui-accordion-item>
                </lui-accordion>
              }
              html={collapsibleCode}
              react={collapsibleCode}
              vue={collapsibleCode}
              svelte={collapsibleCode}
            />
          </section>

          {/* 4. Disabled */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Disable the entire accordion by setting <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">disabled</code> on the container, or disable individual items.
            </p>
            <ExampleBlock
              preview={
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Container disabled</p>
                    <lui-accordion disabled default-value="item-1">
                      <lui-accordion-item value="item-1">
                        <span slot="header">Disabled Container</span>
                        All items are disabled when set on the container.
                      </lui-accordion-item>
                      <lui-accordion-item value="item-2">
                        <span slot="header">Also Disabled</span>
                        This panel cannot be opened.
                      </lui-accordion-item>
                    </lui-accordion>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Individual item disabled</p>
                    <lui-accordion default-value="item-1">
                      <lui-accordion-item value="item-1">
                        <span slot="header">Enabled Item</span>
                        This item works normally.
                      </lui-accordion-item>
                      <lui-accordion-item value="item-2" disabled>
                        <span slot="header">Disabled Item</span>
                        This individual item is disabled.
                      </lui-accordion-item>
                      <lui-accordion-item value="item-3">
                        <span slot="header">Another Enabled Item</span>
                        This item also works normally.
                      </lui-accordion-item>
                    </lui-accordion>
                  </div>
                </div>
              }
              html={`<!-- Container disabled -->\n${disabledCode}\n\n<!-- Individual item disabled -->\n${disabledItemCode}`}
              react={`<!-- Container disabled -->\n${disabledCode}\n\n<!-- Individual item disabled -->\n${disabledItemCode}`}
              vue={`<!-- Container disabled -->\n${disabledCode}\n\n<!-- Individual item disabled -->\n${disabledItemCode}`}
              svelte={`<!-- Container disabled -->\n${disabledCode}\n\n<!-- Individual item disabled -->\n${disabledItemCode}`}
            />
          </section>

          {/* 5. Custom Heading Level */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Heading Level</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">heading-level</code> to set the ARIA heading level for proper document outline semantics. Default is 3.
            </p>
            <ExampleBlock
              preview={
                <lui-accordion default-value="item-1">
                  <lui-accordion-item value="item-1" heading-level={4}>
                    <span slot="header">Heading Level 4</span>
                    This item uses h4 for its header, suitable for nested document outlines.
                  </lui-accordion-item>
                  <lui-accordion-item value="item-2" heading-level={4}>
                    <span slot="header">Also Level 4</span>
                    Consistent heading levels help screen readers understand document structure.
                  </lui-accordion-item>
                </lui-accordion>
              }
              html={headingLevelCode}
              react={headingLevelCode}
              vue={headingLevelCode}
              svelte={headingLevelCode}
            />
          </section>

          {/* 6. Lazy Content */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Lazy Content</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lazy</code> on individual items to defer content rendering until first expand. Content is preserved after collapse.
            </p>
            <ExampleBlock
              preview={
                <lui-accordion>
                  <lui-accordion-item value="item-1" lazy>
                    <span slot="header">Lazy Panel 1</span>
                    This content is not rendered until the panel is first expanded.
                  </lui-accordion-item>
                  <lui-accordion-item value="item-2" lazy>
                    <span slot="header">Lazy Panel 2</span>
                    Useful for heavy content that should only load on demand.
                  </lui-accordion-item>
                </lui-accordion>
              }
              html={lazyCode}
              react={lazyCode}
              vue={lazyCode}
              svelte={lazyCode}
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
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Arrow Down</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Arrow Up</code> move focus between accordion headers with wrapping.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Home</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">End</code> jump to first / last enabled header.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Space</code> toggle the focused header via native button click.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Each header button uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-expanded</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-controls</code> to associate with its panel region.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Configurable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">heading-level</code> ensures correct document outline semantics.
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
              The Accordion component supports CSS custom properties for theming. Override globally or within a scoped container.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change accordion appearance globally or within a scoped container.
            </p>
            <CodeBlock code={cssVarsCode} language="css" />
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

          {/* Accordion Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-accordion Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{accordionProps.length}</span>
            </div>
            <PropsTable props={accordionProps} />
          </div>

          {/* AccordionItem Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-accordion-item Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{accordionItemProps.length}</span>
            </div>
            <PropsTable props={accordionItemProps} />
          </div>

          {/* Accordion Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-accordion Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{accordionSlots.length}</span>
            </div>
            <SlotsTable slots={accordionSlots} />
          </div>

          {/* AccordionItem Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-accordion-item Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{accordionItemSlots.length}</span>
            </div>
            <SlotsTable slots={accordionItemSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{accordionCSSVars.length}</span>
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
                  {accordionCSSVars.map((cssVar) => (
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

          {/* Events */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</h3>
            </div>
            <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">ui-change</code>
                  <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">on lui-accordion</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Fired when the expanded state changes. Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ value: string, expandedItems: string[] }'}</code>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Getting Started', href: '/getting-started' }}
          next={{ title: 'Button', href: '/components/button' }}
        />
      </div>
    </FrameworkProvider>
  );
}
