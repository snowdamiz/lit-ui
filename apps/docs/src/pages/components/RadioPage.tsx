import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/radio';

// Note: JSX types for lui-radio and lui-radio-group are declared in components/LivePreview.tsx

// Props data for lui-radio (5 props)
const radioProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'The value submitted when this radio is selected.',
  },
  {
    name: 'checked',
    type: 'boolean',
    default: 'false',
    description: 'Whether this radio is currently selected.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether this radio is disabled.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Label text displayed next to the radio.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size variant.',
  },
];

// Props data for lui-radio-group (6 props)
const radioGroupProps: PropDef[] = [
  {
    name: 'name',
    type: 'string',
    default: '""',
    description: 'Form submission name for the group.',
  },
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Currently selected radio value.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether a selection is required.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables all child radios.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Group label text (rendered as fieldset legend).',
  },
  {
    name: 'error',
    type: 'string',
    default: '""',
    description: 'Error message displayed below the group.',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const radioCSSVars: CSSVarDef[] = [
  { name: '--ui-radio-border', default: 'var(--color-border)', description: 'Border color of the radio circle.' },
  { name: '--ui-radio-border-checked', default: 'var(--color-primary)', description: 'Border color when checked.' },
  { name: '--ui-radio-border-width', default: '2px', description: 'Border width of the radio circle.' },
  { name: '--ui-radio-bg', default: 'var(--color-background)', description: 'Background color of the radio circle.' },
  { name: '--ui-radio-dot-color', default: 'var(--color-primary)', description: 'Color of the inner dot when checked.' },
  { name: '--ui-radio-ring', default: 'var(--color-ring)', description: 'Focus ring color.' },
  { name: '--ui-radio-transition', default: '150ms', description: 'Transition duration for state changes.' },
  { name: '--ui-radio-label-gap', default: '0.5rem', description: 'Gap between radio circle and label.' },
  { name: '--ui-radio-group-gap', default: '0.5rem', description: 'Gap between radio items in a group.' },
  { name: '--ui-radio-text-error', default: 'var(--color-destructive)', description: 'Error message text color.' },
];

// Code examples - web components use same syntax in all frameworks
const basicGroupCode = `<lui-radio-group name="color" label="Favorite color">
  <lui-radio value="red" label="Red"></lui-radio>
  <lui-radio value="green" label="Green"></lui-radio>
  <lui-radio value="blue" label="Blue"></lui-radio>
</lui-radio-group>`;

const initialValueCode = `<lui-radio-group name="size" value="md" label="Size">
  <lui-radio value="sm" label="Small"></lui-radio>
  <lui-radio value="md" label="Medium"></lui-radio>
  <lui-radio value="lg" label="Large"></lui-radio>
</lui-radio-group>`;

const sizesCode = `<!-- Small -->
<lui-radio-group name="size-sm" label="Small radios">
  <lui-radio value="a" label="Option A" size="sm"></lui-radio>
  <lui-radio value="b" label="Option B" size="sm"></lui-radio>
</lui-radio-group>

<!-- Medium (default) -->
<lui-radio-group name="size-md" label="Medium radios">
  <lui-radio value="a" label="Option A" size="md"></lui-radio>
  <lui-radio value="b" label="Option B" size="md"></lui-radio>
</lui-radio-group>

<!-- Large -->
<lui-radio-group name="size-lg" label="Large radios">
  <lui-radio value="a" label="Option A" size="lg"></lui-radio>
  <lui-radio value="b" label="Option B" size="lg"></lui-radio>
</lui-radio-group>`;

const disabledCode = `<!-- Entire group disabled -->
<lui-radio-group name="status" label="Status" disabled>
  <lui-radio value="active" label="Active"></lui-radio>
  <lui-radio value="inactive" label="Inactive"></lui-radio>
</lui-radio-group>

<!-- Individual radio disabled -->
<lui-radio-group name="tier" label="Tier">
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="pro" label="Pro"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise" disabled></lui-radio>
</lui-radio-group>`;

const requiredCode = `<lui-radio-group name="plan" label="Select a plan" required>
  <lui-radio value="free" label="Free"></lui-radio>
  <lui-radio value="pro" label="Pro"></lui-radio>
  <lui-radio value="enterprise" label="Enterprise"></lui-radio>
</lui-radio-group>`;

const formCode = `<form>
  <lui-radio-group name="framework" label="Preferred framework" required>
    <lui-radio value="react" label="React"></lui-radio>
    <lui-radio value="vue" label="Vue"></lui-radio>
    <lui-radio value="svelte" label="Svelte"></lui-radio>
    <lui-radio value="angular" label="Angular"></lui-radio>
  </lui-radio-group>
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all radios */
:root {
  --ui-radio-border-checked: var(--color-accent);
  --ui-radio-dot-color: var(--color-accent);
}

/* Scoped override - only in this container */
.form-section {
  --ui-radio-group-gap: 1rem;
  --ui-radio-label-gap: 0.75rem;
}`;

// Keyboard navigation data
type KeyboardDef = { key: string; description: string };
const keyboardNav: KeyboardDef[] = [
  { key: 'Arrow Down / Arrow Right', description: 'Move focus and selection to the next radio option (wraps to first).' },
  { key: 'Arrow Up / Arrow Left', description: 'Move focus and selection to the previous radio option (wraps to last).' },
  { key: 'Tab', description: 'Move focus out of the radio group to the next focusable element on the page.' },
  { key: 'Shift + Tab', description: 'Move focus to the previous focusable element before the radio group.' },
  { key: 'Space', description: 'Select the currently focused radio (if not already selected).' },
];

export function RadioPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Radio
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible radio button with RadioGroup for mutual exclusion, roving tabindex navigation, and form participation.
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

          {/* 1. Basic RadioGroup */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic RadioGroup</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Radio buttons are always used inside a <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-radio-group</code> for mutual exclusion.
              Only one option can be selected at a time.
            </p>
            <ExampleBlock
              preview={
                <lui-radio-group name="color" label="Favorite color">
                  <lui-radio value="red" label="Red"></lui-radio>
                  <lui-radio value="green" label="Green"></lui-radio>
                  <lui-radio value="blue" label="Blue"></lui-radio>
                </lui-radio-group>
              }
              html={basicGroupCode}
              react={basicGroupCode}
              vue={basicGroupCode}
              svelte={basicGroupCode}
            />
          </section>

          {/* 2. Pre-selected Value */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Pre-selected Value</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> attribute on the group to pre-select an option.
            </p>
            <ExampleBlock
              preview={
                <lui-radio-group name="size" value="md" label="Size">
                  <lui-radio value="sm" label="Small"></lui-radio>
                  <lui-radio value="md" label="Medium"></lui-radio>
                  <lui-radio value="lg" label="Large"></lui-radio>
                </lui-radio-group>
              }
              html={initialValueCode}
              react={initialValueCode}
              vue={initialValueCode}
              svelte={initialValueCode}
            />
          </section>

          {/* 3. Sizes */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Sizes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Three sizes are available: small, medium (default), and large. Set the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">size</code> attribute on each radio.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-6">
                  <lui-radio-group name="size-sm" label="Small radios">
                    <lui-radio value="a" label="Option A" size="sm"></lui-radio>
                    <lui-radio value="b" label="Option B" size="sm"></lui-radio>
                  </lui-radio-group>
                  <lui-radio-group name="size-md" label="Medium radios">
                    <lui-radio value="a" label="Option A" size="md"></lui-radio>
                    <lui-radio value="b" label="Option B" size="md"></lui-radio>
                  </lui-radio-group>
                  <lui-radio-group name="size-lg" label="Large radios">
                    <lui-radio value="a" label="Option A" size="lg"></lui-radio>
                    <lui-radio value="b" label="Option B" size="lg"></lui-radio>
                  </lui-radio-group>
                </div>
              }
              html={sizesCode}
              react={sizesCode}
              vue={sizesCode}
              svelte={sizesCode}
            />
          </section>

          {/* 4. Disabled States */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled States</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Disable the entire group with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">disabled</code> on the group, or disable individual radios.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-6">
                  <lui-radio-group name="status" label="Status" disabled>
                    <lui-radio value="active" label="Active"></lui-radio>
                    <lui-radio value="inactive" label="Inactive"></lui-radio>
                  </lui-radio-group>
                  <lui-radio-group name="tier" label="Tier">
                    <lui-radio value="free" label="Free"></lui-radio>
                    <lui-radio value="pro" label="Pro"></lui-radio>
                    <lui-radio value="enterprise" label="Enterprise" disabled></lui-radio>
                  </lui-radio-group>
                </div>
              }
              html={disabledCode}
              react={disabledCode}
              vue={disabledCode}
              svelte={disabledCode}
            />
          </section>

          {/* 5. Required Validation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Validation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Mark a group as <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">required</code> to enforce selection during form validation.
            </p>
            <ExampleBlock
              preview={
                <lui-radio-group name="plan" label="Select a plan" required>
                  <lui-radio value="free" label="Free"></lui-radio>
                  <lui-radio value="pro" label="Pro"></lui-radio>
                  <lui-radio value="enterprise" label="Enterprise"></lui-radio>
                </lui-radio-group>
              }
              html={requiredCode}
              react={requiredCode}
              vue={requiredCode}
              svelte={requiredCode}
            />
          </section>

          {/* 6. Form Integration */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Form Integration</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              RadioGroup participates in native forms via ElementInternals. The selected value is submitted with the group's <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">name</code> attribute.
              Form reset restores the initial selection.
            </p>
            <ExampleBlock
              preview={
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    alert(`Selected: ${data.get('framework') || '(none)'}`);
                  }}
                >
                  <lui-radio-group name="framework" label="Preferred framework" required>
                    <lui-radio value="react" label="React"></lui-radio>
                    <lui-radio value="vue" label="Vue"></lui-radio>
                    <lui-radio value="svelte" label="Svelte"></lui-radio>
                    <lui-radio value="angular" label="Angular"></lui-radio>
                  </lui-radio-group>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Submit</button>
                    <button type="reset" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Reset</button>
                  </div>
                </form>
              }
              html={formCode}
              react={formCode}
              vue={formCode}
              svelte={formCode}
            />
          </section>

          {/* Keyboard Navigation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Keyboard Navigation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              RadioGroup implements <strong>roving tabindex</strong> per the W3C Radio Group pattern. Only the selected (or first) radio receives tab focus.
              Arrow keys move both focus and selection simultaneously.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Key</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {keyboardNav.map((item) => (
                    <tr key={item.key} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{item.key}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change radio appearance globally or within a scoped container.
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props, events, and styling</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Radio Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-radio Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{radioProps.length}</span>
            </div>
            <PropsTable props={radioProps} />
          </div>

          {/* RadioGroup Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-radio-group Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{radioGroupProps.length}</span>
            </div>
            <PropsTable props={radioGroupProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{radioCSSVars.length}</span>
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
                  {radioCSSVars.map((cssVar) => (
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
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Event</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Element</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Detail</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">ui-change</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">lui-radio-group</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{`{ value: string }`}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Fired when the selected radio changes.</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">ui-radio-change</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">lui-radio</code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">-</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Internal event consumed by RadioGroup. Not intended for consumer use.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Input', href: '/components/input' }}
          next={{ title: 'Select', href: '/components/select' }}
        />
      </div>
    </FrameworkProvider>
  );
}
