import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import 'lit-ui';

// Note: JSX types for ui-button are declared in components/LivePreview.tsx

// Props data from source Button component
const buttonProps: PropDef[] = [
  {
    name: 'variant',
    type: '"primary" | "secondary" | "outline" | "ghost" | "destructive"',
    default: '"primary"',
    description: 'The visual style of the button.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'The size affecting padding and font size.',
  },
  {
    name: 'type',
    type: '"button" | "submit" | "reset"',
    default: '"button"',
    description: 'The button type for form behavior.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the button is disabled. Uses aria-disabled for accessibility.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a pulsing dots spinner and prevents interaction.',
  },
  {
    name: 'btn-class',
    type: 'string',
    default: '""',
    description: 'Additional Tailwind classes to customize the button. Appended to default classes.',
  },
];

// Slots data
const buttonSlots: SlotDef[] = [
  {
    name: '(default)',
    description: 'Button text content.',
  },
  {
    name: 'icon-start',
    description: 'Icon placed before the text. Scales with button font-size.',
  },
  {
    name: 'icon-end',
    description: 'Icon placed after the text. Scales with button font-size.',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const buttonParts: CSSPartDef[] = [
  { name: 'button', description: 'The inner button element.' },
  { name: 'icon-start', description: 'The icon-start slot wrapper.' },
  { name: 'content', description: 'The default slot wrapper for button text.' },
  { name: 'icon-end', description: 'The icon-end slot wrapper.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const buttonCSSVars: CSSVarDef[] = [
  { name: '--ui-button-radius', default: 'var(--radius-md)', description: 'Border radius of the button.' },
  { name: '--ui-button-shadow', default: 'none', description: 'Box shadow of the button.' },
  { name: '--ui-button-font-weight', default: '500', description: 'Font weight of the button text.' },
];

// Code examples - web components use same syntax in all frameworks
const variantsCode = `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Destructive</ui-button>`;

const sizesCode = `<ui-button size="sm">Small</ui-button>
<ui-button size="md">Medium</ui-button>
<ui-button size="lg">Large</ui-button>`;

const loadingCode = `<ui-button loading>Loading...</ui-button>
<ui-button variant="secondary" loading>Saving</ui-button>`;

const iconCode = `<ui-button>
  <svg slot="icon-start" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  Add Item
</ui-button>
<ui-button variant="outline">
  Settings
  <svg slot="icon-end" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
</ui-button>`;

const disabledCode = `<ui-button disabled>Disabled</ui-button>
<ui-button variant="destructive" disabled>Cannot Delete</ui-button>`;

const customStyleCode = `<ui-button btn-class="rounded-full">Pill Button</ui-button>
<ui-button btn-class="shadow-lg">Shadow Button</ui-button>
<ui-button variant="secondary" btn-class="font-bold">Bold Text</ui-button>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all buttons become pill-shaped */
:root {
  --ui-button-radius: 9999px;
  --ui-button-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Scoped override - only affects buttons in this container */
.card-actions {
  --ui-button-radius: 0.25rem;
  --ui-button-shadow: none;
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the inner button element with complete control */
ui-button::part(button) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Style on hover */
ui-button::part(button):hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
}`;

export function ButtonPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4 md:text-5xl">
              Button
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              A customizable button component with multiple variants, sizes, and states.
              Supports icons, loading state, and form participation.
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

          {/* Variants */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Variants</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Choose from five visual variants to match your design needs.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-3">
                  <ui-button variant="primary">Primary</ui-button>
                  <ui-button variant="secondary">Secondary</ui-button>
                  <ui-button variant="outline">Outline</ui-button>
                  <ui-button variant="ghost">Ghost</ui-button>
                  <ui-button variant="destructive">Destructive</ui-button>
                </div>
              }
              html={variantsCode}
              react={variantsCode}
              vue={variantsCode}
              svelte={variantsCode}
            />
          </section>

          {/* Sizes */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Sizes</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Three sizes are available: small, medium (default), and large.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap items-center gap-3">
                  <ui-button size="sm">Small</ui-button>
                  <ui-button size="md">Medium</ui-button>
                  <ui-button size="lg">Large</ui-button>
                </div>
              }
              html={sizesCode}
              react={sizesCode}
              vue={sizesCode}
              svelte={sizesCode}
            />
          </section>

          {/* Loading */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Loading State</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Set the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">loading</code> attribute to show a pulsing dots spinner and prevent interaction.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-3">
                  <ui-button loading>Loading...</ui-button>
                  <ui-button variant="secondary" loading>Saving</ui-button>
                </div>
              }
              html={loadingCode}
              react={loadingCode}
              vue={loadingCode}
              svelte={loadingCode}
            />
          </section>

          {/* Icons */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">With Icons</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">icon-start</code> and <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">icon-end</code> slots to add icons.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-3">
                  <ui-button>
                    <span slot="icon-start" dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>' }} />
                    Add Item
                  </ui-button>
                  <ui-button variant="outline">
                    Settings
                    <span slot="icon-end" dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>' }} />
                  </ui-button>
                </div>
              }
              html={iconCode}
              react={iconCode}
              vue={iconCode}
              svelte={iconCode}
            />
          </section>

          {/* Disabled */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Disabled State</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Disabled buttons remain in the tab order for accessibility but prevent interaction.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-3">
                  <ui-button disabled>Disabled</ui-button>
                  <ui-button variant="destructive" disabled>Cannot Delete</ui-button>
                </div>
              }
              html={disabledCode}
              react={disabledCode}
              vue={disabledCode}
              svelte={disabledCode}
            />
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Custom Styling</h3>
            <p className="text-gray-500 mb-4 text-sm">
              The Button component supports three tiers of customization, from simple to advanced.
            </p>
          </section>

          {/* Tier 1: CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              Override CSS custom properties to change button appearance globally or within a scoped container.
              This is the simplest approach for common customizations.
            </p>
            <div className="mb-4">
              <style>{`
                .demo-pill-buttons { --ui-button-radius: 9999px; --ui-button-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              `}</style>
              <div className="demo-pill-buttons flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <ui-button>Pill Button</ui-button>
                <ui-button variant="secondary">With Shadow</ui-button>
                <ui-button variant="outline">Styled via CSS Vars</ui-button>
              </div>
            </div>
            <CodeBlock code={cssVarsCode} language="css" />
          </section>

          {/* Tier 2: Class Passthrough */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Class Passthrough</h3>
            <p className="text-gray-500 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">btn-class</code> attribute to add Tailwind utility classes for per-instance customization.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-3">
                  <ui-button btn-class="rounded-full">Pill Button</ui-button>
                  <ui-button btn-class="shadow-lg">Shadow Button</ui-button>
                  <ui-button variant="secondary" btn-class="font-bold">Bold Text</ui-button>
                </div>
              }
              html={customStyleCode}
              react={customStyleCode}
              vue={customStyleCode}
              svelte={customStyleCode}
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
              This is useful for complex customizations like gradients that aren't possible with utility classes.
            </p>
            <div className="mb-4">
              <style>{`
                .demo-gradient-buttons ui-button::part(button) {
                  background: linear-gradient(135deg, #667eea, #764ba2);
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                .demo-gradient-buttons ui-button::part(button):hover {
                  background: linear-gradient(135deg, #764ba2, #667eea);
                }
              `}</style>
              <div className="demo-gradient-buttons flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <ui-button>Gradient Button</ui-button>
              </div>
            </div>
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{buttonProps.length}</span>
            </div>
            <PropsTable props={buttonProps} />
          </div>

          {/* Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{buttonSlots.length}</span>
            </div>
            <SlotsTable slots={buttonSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{buttonCSSVars.length}</span>
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
                  {buttonCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-xs font-bold text-white">{buttonParts.length}</span>
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
                  {buttonParts.map((part) => (
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
            </div>
            <div className="group relative rounded-xl border border-gray-200 bg-white p-5 card-elevated">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The Button component does not emit custom events. Use standard DOM events like{' '}
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">click</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Getting Started', href: '/getting-started' }}
          next={{ title: 'Dialog', href: '/components/dialog' }}
        />
      </div>
    </FrameworkProvider>
  );
}
