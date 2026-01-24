import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';

// Side-effect import to register ui-button custom element
import '../../lib/ui-button';

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

// Code examples - web components use same syntax in all frameworks
const basicCode = '<ui-button>Click me</ui-button>';

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

export function ButtonPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Button</h1>
          <p className="text-lg text-gray-600">
            A customizable button component with multiple variants, sizes, and states.
            Supports icons, loading state, and form participation.
          </p>
        </div>

        {/* Hero example */}
        <ExampleBlock
          title="Basic Usage"
          description="A simple button with default styling."
          preview={<ui-button>Click me</ui-button>}
          html={basicCode}
          react={basicCode}
          vue={basicCode}
          svelte={basicCode}
        />

        {/* Variants section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Variants</h2>
          <p className="text-gray-600 mb-6">
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

        {/* Sizes section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sizes</h2>
          <p className="text-gray-600 mb-6">
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

        {/* Loading section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Loading State</h2>
          <p className="text-gray-600 mb-6">
            Set the <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">loading</code> attribute to show a pulsing dots spinner and prevent interaction.
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

        {/* Icons section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">With Icons</h2>
          <p className="text-gray-600 mb-6">
            Use the <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">icon-start</code> and <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">icon-end</code> slots to add icons.
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

        {/* Disabled section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disabled State</h2>
          <p className="text-gray-600 mb-6">
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

        {/* API Reference */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">API Reference</h2>

          {/* Props */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Props</h3>
            <PropsTable props={buttonProps} />
          </div>

          {/* Slots */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Slots</h3>
            <SlotsTable slots={buttonSlots} />
          </div>

          {/* Events note */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Events</h3>
            <p className="text-gray-600">
              The Button component does not emit custom events. Use standard DOM events like <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">click</code>.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <PrevNextNav
          prev={{ title: 'Getting Started', href: '/getting-started' }}
          next={{ title: 'Dialog', href: '/components/dialog' }}
        />
      </div>
    </FrameworkProvider>
  );
}
