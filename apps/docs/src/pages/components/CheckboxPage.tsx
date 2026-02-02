import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements
import '@lit-ui/checkbox';

// Note: JSX types for lui-checkbox and lui-checkbox-group are declared in components/LivePreview.tsx

// Props data for lui-checkbox (8 props)
const checkboxProps: PropDef[] = [
  {
    name: 'checked',
    type: 'boolean',
    default: 'false',
    description: 'Whether the checkbox is checked.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the checkbox is disabled.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether the checkbox is required for form submission.',
  },
  {
    name: 'indeterminate',
    type: 'boolean',
    default: 'false',
    description: 'Whether to show indeterminate (dash) state.',
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
    default: '"on"',
    description: 'Form submission value when checked.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Label text displayed next to the checkbox.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size variant affecting box dimensions and label typography.',
  },
];

// Props data for lui-checkbox-group (5 props)
const checkboxGroupProps: PropDef[] = [
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Group label text displayed above the checkboxes.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables all child checkboxes.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'At least one checkbox must be checked.',
  },
  {
    name: 'error',
    type: 'string',
    default: '""',
    description: 'Custom error message displayed below the group.',
  },
  {
    name: 'select-all',
    type: 'boolean',
    default: 'false',
    description: 'Shows a select-all parent checkbox.',
  },
];

// Slots data
const checkboxSlots: SlotDef[] = [
  {
    name: 'default',
    description: 'Custom label content (alternative to label property).',
  },
];

const checkboxGroupSlots: SlotDef[] = [
  {
    name: 'default',
    description: 'Child lui-checkbox elements.',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const checkboxParts: CSSPartDef[] = [
  { name: 'wrapper', description: 'Outer wrapper div containing checkbox and label.' },
  { name: 'box', description: 'The checkbox box element with role="checkbox".' },
  { name: 'label', description: 'Label text element.' },
  { name: 'error', description: 'Error text element.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const checkboxCSSVars: CSSVarDef[] = [
  { name: '--ui-checkbox-bg', default: 'var(--color-background)', description: 'Unchecked background color.' },
  { name: '--ui-checkbox-bg-checked', default: 'var(--color-primary)', description: 'Checked/indeterminate background color.' },
  { name: '--ui-checkbox-border', default: 'var(--color-border)', description: 'Border color.' },
  { name: '--ui-checkbox-border-checked', default: 'var(--color-primary)', description: 'Border color when checked.' },
  { name: '--ui-checkbox-border-error', default: 'var(--color-destructive)', description: 'Border color on validation error.' },
  { name: '--ui-checkbox-check-color', default: 'var(--color-primary-foreground)', description: 'Checkmark/dash icon color.' },
  { name: '--ui-checkbox-radius', default: 'var(--radius-sm)', description: 'Border radius of the checkbox box.' },
  { name: '--ui-checkbox-ring', default: 'var(--color-ring)', description: 'Focus ring color.' },
  { name: '--ui-checkbox-transition', default: '150ms', description: 'Transition duration for animations.' },
  { name: '--ui-checkbox-label-gap', default: '0.5rem', description: 'Gap between checkbox and label.' },
  { name: '--ui-checkbox-group-gap', default: '0.5rem', description: 'Gap between items in a checkbox group.' },
  { name: '--ui-checkbox-text-error', default: 'var(--color-destructive)', description: 'Error text color.' },
];

// Code examples - web components use same syntax in all frameworks
const basicCode = `<lui-checkbox label="Accept terms"></lui-checkbox>`;

const checkedCode = `<lui-checkbox checked label="Subscribed"></lui-checkbox>`;

const indeterminateCode = `<lui-checkbox indeterminate label="Select all"></lui-checkbox>`;

const sizesCode = `<lui-checkbox size="sm" label="Small"></lui-checkbox>
<lui-checkbox size="md" label="Medium"></lui-checkbox>
<lui-checkbox size="lg" label="Large"></lui-checkbox>`;

const disabledCode = `<lui-checkbox disabled label="Disabled"></lui-checkbox>
<lui-checkbox disabled checked label="Disabled checked"></lui-checkbox>`;

const requiredCode = `<lui-checkbox required label="I agree to terms"></lui-checkbox>`;

const groupCode = `<lui-checkbox-group label="Notifications">
  <lui-checkbox label="Email" name="notif" value="email"></lui-checkbox>
  <lui-checkbox label="SMS" name="notif" value="sms"></lui-checkbox>
  <lui-checkbox label="Push" name="notif" value="push"></lui-checkbox>
</lui-checkbox-group>`;

const selectAllCode = `<lui-checkbox-group label="Toppings" select-all>
  <lui-checkbox label="Cheese" name="top" value="cheese"></lui-checkbox>
  <lui-checkbox label="Pepperoni" name="top" value="pepperoni"></lui-checkbox>
  <lui-checkbox label="Mushroom" name="top" value="mushroom"></lui-checkbox>
</lui-checkbox-group>`;

const groupDisabledCode = `<lui-checkbox-group label="Features" disabled>
  <lui-checkbox label="Dark mode" name="feat" value="dark"></lui-checkbox>
  <lui-checkbox label="Notifications" name="feat" value="notif"></lui-checkbox>
  <lui-checkbox label="Auto-save" name="feat" value="save"></lui-checkbox>
</lui-checkbox-group>`;

const groupRequiredCode = `<lui-checkbox-group label="Agreement" required error="You must accept at least one">
  <lui-checkbox label="Terms of service" name="agree" value="tos"></lui-checkbox>
  <lui-checkbox label="Privacy policy" name="agree" value="privacy"></lui-checkbox>
</lui-checkbox-group>`;

const formCode = `<form onsubmit="handleSubmit(event)">
  <lui-checkbox
    name="newsletter"
    value="yes"
    label="Subscribe to newsletter"
  ></lui-checkbox>
  <button type="submit">Submit</button>
</form>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all checkboxes */
:root {
  --ui-checkbox-radius: 9999px;
  --ui-checkbox-bg-checked: var(--color-accent);
}

/* Scoped override - only in this container */
.form-section {
  --ui-checkbox-radius: 0;
  --ui-checkbox-label-gap: 0.75rem;
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the checkbox box */
lui-checkbox::part(box) {
  border-width: 2px;
}

/* Style the label */
lui-checkbox::part(label) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}`;

export function CheckboxPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Checkbox
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Accessible checkbox with indeterminate state, CheckboxGroup with select-all, and full form participation.
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

          {/* 1. Basic */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A simple checkbox with a label.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox label="Accept terms"></lui-checkbox>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Checked */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Pre-checked</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">checked</code> attribute to render in a checked state.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox checked label="Subscribed"></lui-checkbox>
              }
              html={checkedCode}
              react={checkedCode}
              vue={checkedCode}
              svelte={checkedCode}
            />
          </section>

          {/* 3. Indeterminate */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Indeterminate</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">indeterminate</code> state shows a dash icon, useful for "select all" when only some children are checked.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox indeterminate label="Select all"></lui-checkbox>
              }
              html={indeterminateCode}
              react={indeterminateCode}
              vue={indeterminateCode}
              svelte={indeterminateCode}
            />
          </section>

          {/* 4. Sizes */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Sizes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Three sizes are available: small, medium (default), and large.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-checkbox size="sm" label="Small"></lui-checkbox>
                  <lui-checkbox size="md" label="Medium"></lui-checkbox>
                  <lui-checkbox size="lg" label="Large"></lui-checkbox>
                </div>
              }
              html={sizesCode}
              react={sizesCode}
              vue={sizesCode}
              svelte={sizesCode}
            />
          </section>

          {/* 5. Disabled */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Disabled checkboxes prevent all interaction. Both unchecked and checked states can be disabled.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-checkbox disabled label="Disabled"></lui-checkbox>
                  <lui-checkbox disabled checked label="Disabled checked"></lui-checkbox>
                </div>
              }
              html={disabledCode}
              react={disabledCode}
              vue={disabledCode}
              svelte={disabledCode}
            />
          </section>

          {/* 6. Required */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Required</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Required checkboxes show a validation error after interaction if not checked.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox required label="I agree to terms"></lui-checkbox>
              }
              html={requiredCode}
              react={requiredCode}
              vue={requiredCode}
              svelte={requiredCode}
            />
          </section>

          {/* 7. CheckboxGroup */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Checkbox Group</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-checkbox-group</code> to group related checkboxes with a label.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox-group label="Notifications">
                  <lui-checkbox label="Email" name="notif" value="email"></lui-checkbox>
                  <lui-checkbox label="SMS" name="notif" value="sms"></lui-checkbox>
                  <lui-checkbox label="Push" name="notif" value="push"></lui-checkbox>
                </lui-checkbox-group>
              }
              html={groupCode}
              react={groupCode}
              vue={groupCode}
              svelte={groupCode}
            />
          </section>

          {/* 8. Select All */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Select All</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">select-all</code> to show a parent checkbox that toggles all children and shows indeterminate state when partially selected.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox-group label="Toppings" select-all>
                  <lui-checkbox label="Cheese" name="top" value="cheese"></lui-checkbox>
                  <lui-checkbox label="Pepperoni" name="top" value="pepperoni"></lui-checkbox>
                  <lui-checkbox label="Mushroom" name="top" value="mushroom"></lui-checkbox>
                </lui-checkbox-group>
              }
              html={selectAllCode}
              react={selectAllCode}
              vue={selectAllCode}
              svelte={selectAllCode}
            />
          </section>

          {/* 9. Disabled Group */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled Group</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Setting <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">disabled</code> on the group propagates to all child checkboxes.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox-group label="Features" disabled>
                  <lui-checkbox label="Dark mode" name="feat" value="dark"></lui-checkbox>
                  <lui-checkbox label="Notifications" name="feat" value="notif"></lui-checkbox>
                  <lui-checkbox label="Auto-save" name="feat" value="save"></lui-checkbox>
                </lui-checkbox-group>
              }
              html={groupDisabledCode}
              react={groupDisabledCode}
              vue={groupDisabledCode}
              svelte={groupDisabledCode}
            />
          </section>

          {/* 10. Required Group */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Group</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A required group shows a validation error when no checkboxes are checked. Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">error</code> for a custom message.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox-group label="Agreement" required error="You must accept at least one">
                  <lui-checkbox label="Terms of service" name="agree" value="tos"></lui-checkbox>
                  <lui-checkbox label="Privacy policy" name="agree" value="privacy"></lui-checkbox>
                </lui-checkbox-group>
              }
              html={groupRequiredCode}
              react={groupRequiredCode}
              vue={groupRequiredCode}
              svelte={groupRequiredCode}
            />
          </section>

          {/* 11. Form Integration */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Form Integration</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Checkboxes participate in form submission via ElementInternals. The <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">name</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> attributes control submission data.
            </p>
            <ExampleBlock
              preview={
                <lui-checkbox name="newsletter" value="yes" label="Subscribe to newsletter"></lui-checkbox>
              }
              html={formCode}
              react={formCode}
              vue={formCode}
              svelte={formCode}
            />
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Checkbox component supports two tiers of customization.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change checkbox appearance globally or within a scoped container.
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

          {/* Checkbox Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-checkbox Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{checkboxProps.length}</span>
            </div>
            <PropsTable props={checkboxProps} />
          </div>

          {/* CheckboxGroup Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-checkbox-group Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{checkboxGroupProps.length}</span>
            </div>
            <PropsTable props={checkboxGroupProps} />
          </div>

          {/* Checkbox Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-checkbox Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{checkboxSlots.length}</span>
            </div>
            <SlotsTable slots={checkboxSlots} />
          </div>

          {/* CheckboxGroup Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-checkbox-group Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{checkboxGroupSlots.length}</span>
            </div>
            <SlotsTable slots={checkboxGroupSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{checkboxCSSVars.length}</span>
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
                  {checkboxCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{checkboxParts.length}</span>
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
                  {checkboxParts.map((part) => (
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
            <div className="space-y-4">
              <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">ui-change</code>
                    <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">on lui-checkbox</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Fired when the checkbox is toggled. Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ checked: boolean, value: string | null }'}</code>
                  </p>
                </div>
              </div>
              <div className="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-elevated">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-gray-50 dark:from-gray-800 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">ui-change</code>
                    <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">on lui-checkbox-group (from select-all)</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Fired when the select-all checkbox is toggled. Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ allChecked: boolean, checkedCount: number, totalCount: number }'}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Calendar', href: '/components/calendar' }}
          next={{ title: 'Date Picker', href: '/components/date-picker' }}
        />
      </div>
    </FrameworkProvider>
  );
}
