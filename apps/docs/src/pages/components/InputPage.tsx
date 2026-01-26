import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/input';

// Note: JSX types for lui-input are declared in components/LivePreview.tsx

// Props data from source Input component (17 props per RESEARCH.md)
const inputProps: PropDef[] = [
  {
    name: 'type',
    type: '"text" | "email" | "password" | "number" | "search"',
    default: '"text"',
    description: 'The input type.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size variant affecting padding and font size.',
  },
  {
    name: 'name',
    type: 'string',
    default: '""',
    description: 'Form submission name.',
  },
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Current value of the input.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: '""',
    description: 'Placeholder text displayed when empty.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Label text above the input.',
  },
  {
    name: 'helper-text',
    type: 'string',
    default: '""',
    description: 'Helper text between label and input.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether the input is required for form submission.',
  },
  {
    name: 'required-indicator',
    type: '"asterisk" | "text"',
    default: '"asterisk"',
    description: 'Style of required indicator: * or (required).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the input is disabled.',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Whether the input is readonly.',
  },
  {
    name: 'minlength',
    type: 'number',
    default: '-',
    description: 'Minimum length for text validation.',
  },
  {
    name: 'maxlength',
    type: 'number',
    default: '-',
    description: 'Maximum length for text validation.',
  },
  {
    name: 'pattern',
    type: 'string',
    default: '""',
    description: 'Regex pattern for validation.',
  },
  {
    name: 'min',
    type: 'number',
    default: '-',
    description: 'Minimum value for number type.',
  },
  {
    name: 'max',
    type: 'number',
    default: '-',
    description: 'Maximum value for number type.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'false',
    description: 'Show clear button when input has value.',
  },
  {
    name: 'show-count',
    type: 'boolean',
    default: 'false',
    description: 'Show character counter (requires maxlength).',
  },
];

// Slots data
const inputSlots: SlotDef[] = [
  {
    name: 'prefix',
    description: 'Content before the input (e.g., currency symbol, icon).',
  },
  {
    name: 'suffix',
    description: 'Content after the input (e.g., unit label, icon).',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const inputParts: CSSPartDef[] = [
  { name: 'wrapper', description: 'Outer wrapper div containing all elements.' },
  { name: 'label', description: 'Label element above the input.' },
  { name: 'helper', description: 'Helper text span.' },
  { name: 'container', description: 'Input container with border.' },
  { name: 'input', description: 'Native input element.' },
  { name: 'prefix', description: 'Prefix slot wrapper.' },
  { name: 'suffix', description: 'Suffix slot wrapper.' },
  { name: 'counter', description: 'Character counter span.' },
  { name: 'error', description: 'Error text span.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const inputCSSVars: CSSVarDef[] = [
  { name: '--ui-input-radius', default: 'var(--radius-md)', description: 'Border radius of the input.' },
  { name: '--ui-input-border', default: 'var(--color-border)', description: 'Border color.' },
  { name: '--ui-input-border-focus', default: 'var(--color-ring)', description: 'Border color on focus.' },
  { name: '--ui-input-border-error', default: 'var(--color-destructive)', description: 'Border color on error.' },
  { name: '--ui-input-bg', default: 'var(--color-background)', description: 'Background color.' },
  { name: '--ui-input-text', default: 'var(--color-foreground)', description: 'Text color.' },
  { name: '--ui-input-placeholder', default: 'var(--color-muted-foreground)', description: 'Placeholder text color.' },
];

// Code examples - web components use same syntax in all frameworks
const typesCode = `<lui-input type="text" placeholder="Text input"></lui-input>
<lui-input type="email" placeholder="Email input"></lui-input>
<lui-input type="password" placeholder="Password input"></lui-input>
<lui-input type="number" placeholder="Number input"></lui-input>
<lui-input type="search" placeholder="Search input"></lui-input>`;

const sizesCode = `<lui-input size="sm" placeholder="Small"></lui-input>
<lui-input size="md" placeholder="Medium"></lui-input>
<lui-input size="lg" placeholder="Large"></lui-input>`;

const labelCode = `<lui-input label="Email Address" type="email" placeholder="you@example.com"></lui-input>
<lui-input label="Full Name" placeholder="John Doe"></lui-input>`;

const helperTextCode = `<lui-input
  label="Username"
  helper-text="Choose a unique username, 3-20 characters"
  placeholder="your-username"
></lui-input>`;

const requiredCode = `<lui-input label="Email" required placeholder="Required field"></lui-input>
<lui-input label="Email" required required-indicator="text" placeholder="Required with text"></lui-input>`;

const passwordCode = `<lui-input type="password" label="Password" placeholder="Enter password"></lui-input>`;

const clearableCode = `<lui-input clearable placeholder="Type to see clear button" value="Clear me"></lui-input>`;

const prefixSuffixCode = `<lui-input placeholder="0.00">
  <span slot="prefix">$</span>
</lui-input>
<lui-input type="number" placeholder="100">
  <span slot="suffix">kg</span>
</lui-input>
<lui-input type="email" placeholder="username">
  <span slot="prefix">@</span>
  <span slot="suffix">.com</span>
</lui-input>`;

const disabledCode = `<lui-input disabled value="Disabled input"></lui-input>
<lui-input readonly value="Readonly input"></lui-input>`;

const characterCountCode = `<lui-input
  label="Bio"
  placeholder="Tell us about yourself"
  maxlength="100"
  show-count
></lui-input>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all inputs */
:root {
  --ui-input-radius: 9999px;
  --ui-input-border-focus: var(--color-primary);
}

/* Scoped override - only in this container */
.form-section {
  --ui-input-radius: 0.25rem;
  --ui-input-bg: var(--color-muted);
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the input element directly */
lui-input::part(input) {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Style the container with custom border */
lui-input::part(container) {
  border-width: 2px;
}

/* Style the label */
lui-input::part(label) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}`;

export function InputPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Input
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              A customizable input component with validation, sizes, password toggle, and prefix/suffix slots.
              Supports form participation via ElementInternals.
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

          {/* 1. Types */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Input Types</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Five input types are available: text, email, password, number, and search.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-input type="text" placeholder="Text input"></lui-input>
                  <lui-input type="email" placeholder="Email input"></lui-input>
                  <lui-input type="password" placeholder="Password input"></lui-input>
                  <lui-input type="number" placeholder="Number input"></lui-input>
                  <lui-input type="search" placeholder="Search input"></lui-input>
                </div>
              }
              html={typesCode}
              react={typesCode}
              vue={typesCode}
              svelte={typesCode}
            />
          </section>

          {/* 2. Sizes */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Sizes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Three sizes are available: small, medium (default), and large.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-input size="sm" placeholder="Small"></lui-input>
                  <lui-input size="md" placeholder="Medium"></lui-input>
                  <lui-input size="lg" placeholder="Large"></lui-input>
                </div>
              }
              html={sizesCode}
              react={sizesCode}
              vue={sizesCode}
              svelte={sizesCode}
            />
          </section>

          {/* 3. With Label */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">With Label</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">label</code> attribute to add a label above the input.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-input label="Email Address" type="email" placeholder="you@example.com"></lui-input>
                  <lui-input label="Full Name" placeholder="John Doe"></lui-input>
                </div>
              }
              html={labelCode}
              react={labelCode}
              vue={labelCode}
              svelte={labelCode}
            />
          </section>

          {/* 4. Helper Text */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Helper Text</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Provide additional guidance with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">helper-text</code>.
            </p>
            <ExampleBlock
              preview={
                <lui-input
                  label="Username"
                  helper-text="Choose a unique username, 3-20 characters"
                  placeholder="your-username"
                ></lui-input>
              }
              html={helperTextCode}
              react={helperTextCode}
              vue={helperTextCode}
              svelte={helperTextCode}
            />
          </section>

          {/* 5. Required Field */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Field</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Mark fields as required with an asterisk or text indicator. Validation error shows on blur when empty.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-input label="Email" required placeholder="Required field"></lui-input>
                  <lui-input label="Email" required required-indicator="text" placeholder="Required with text"></lui-input>
                </div>
              }
              html={requiredCode}
              react={requiredCode}
              vue={requiredCode}
              svelte={requiredCode}
            />
          </section>

          {/* 6. Password Toggle */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Password Toggle</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Password inputs automatically include a visibility toggle button. Click the eye icon to show/hide.
            </p>
            <ExampleBlock
              preview={
                <lui-input type="password" label="Password" placeholder="Enter password"></lui-input>
              }
              html={passwordCode}
              react={passwordCode}
              vue={passwordCode}
              svelte={passwordCode}
            />
          </section>

          {/* 7. Clearable */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Clearable</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable the clear button with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">clearable</code>. It appears when the input has a value.
            </p>
            <ExampleBlock
              preview={
                <lui-input clearable placeholder="Type to see clear button" value="Clear me"></lui-input>
              }
              html={clearableCode}
              react={clearableCode}
              vue={clearableCode}
              svelte={clearableCode}
            />
          </section>

          {/* 8. Prefix/Suffix Slots */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Prefix & Suffix Slots</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">slot="prefix"</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">slot="suffix"</code> for icons, symbols, or units.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-input placeholder="0.00">
                    <span slot="prefix">$</span>
                  </lui-input>
                  <lui-input type="number" placeholder="100">
                    <span slot="suffix">kg</span>
                  </lui-input>
                  <lui-input type="email" placeholder="username">
                    <span slot="prefix">@</span>
                    <span slot="suffix">.com</span>
                  </lui-input>
                </div>
              }
              html={prefixSuffixCode}
              react={prefixSuffixCode}
              vue={prefixSuffixCode}
              svelte={prefixSuffixCode}
            />
          </section>

          {/* 9. Disabled & Readonly */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled & Readonly</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Disabled inputs prevent all interaction. Readonly inputs allow text selection but no editing.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-input disabled value="Disabled input"></lui-input>
                  <lui-input readonly value="Readonly input"></lui-input>
                </div>
              }
              html={disabledCode}
              react={disabledCode}
              vue={disabledCode}
              svelte={disabledCode}
            />
          </section>

          {/* 10. Character Counter */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Character Counter</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">show-count</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">maxlength</code> to display a live character count.
            </p>
            <ExampleBlock
              preview={
                <lui-input
                  label="Bio"
                  placeholder="Tell us about yourself"
                  maxlength={100}
                  show-count
                ></lui-input>
              }
              html={characterCountCode}
              react={characterCountCode}
              vue={characterCountCode}
              svelte={characterCountCode}
            />
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Input component supports two tiers of customization.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change input appearance globally or within a scoped container.
            </p>
            <div className="mb-4">
              <style>{`
                .demo-pill-inputs { --ui-input-radius: 9999px; }
              `}</style>
              <div className="demo-pill-inputs flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <lui-input placeholder="Pill-shaped input"></lui-input>
                <lui-input placeholder="Another pill input"></lui-input>
              </div>
            </div>
            <CodeBlock code={cssVarsCode} language="css" />
          </section>

          {/* CSS Parts */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Parts
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">Advanced</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">::part()</code> for complete styling control over internal elements.
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props, slots, and events</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{inputProps.length}</span>
            </div>
            <PropsTable props={inputProps} />
          </div>

          {/* Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{inputSlots.length}</span>
            </div>
            <SlotsTable slots={inputSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{inputCSSVars.length}</span>
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
                  {inputCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{inputParts.length}</span>
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
                  {inputParts.map((part) => (
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

          {/* Events */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Events</h3>
            </div>
            <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    The Input component uses standard DOM events like{' '}
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">input</code>,{' '}
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">change</code>, and{' '}
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">blur</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Dialog', href: '/components/dialog' }}
          next={{ title: 'Textarea', href: '/components/textarea' }}
        />
      </div>
    </FrameworkProvider>
  );
}
