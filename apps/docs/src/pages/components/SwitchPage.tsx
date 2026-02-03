import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/switch';

// Props data from source Switch component (7 props per RESEARCH.md)
const switchProps: PropDef[] = [
  {
    name: 'checked',
    type: 'boolean',
    default: 'false',
    description: 'Whether the switch is on.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the switch is disabled.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether the switch must be on for form submission.',
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
    description: 'Label text displayed next to the switch.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size variant affecting track and thumb dimensions.',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const switchParts: CSSPartDef[] = [
  { name: 'wrapper', description: 'Outer flex wrapper containing label and track.' },
  { name: 'track', description: 'The oval toggle track background.' },
  { name: 'thumb', description: 'The sliding circle thumb.' },
  { name: 'label', description: 'Label text element.' },
  { name: 'error', description: 'Error message text.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const switchCSSVars: CSSVarDef[] = [
  { name: '--ui-switch-radius', default: '9999px', description: 'Border radius of the track.' },
  { name: '--ui-switch-thumb-radius', default: '9999px', description: 'Border radius of the thumb.' },
  { name: '--ui-switch-thumb-offset', default: '2px', description: 'Inset offset for thumb positioning.' },
  { name: '--ui-switch-label-gap', default: '0.5rem', description: 'Gap between label and track.' },
  { name: '--ui-switch-transition', default: '150ms', description: 'Transition duration for slide animation.' },
  { name: '--ui-switch-track-bg', default: 'var(--color-muted)', description: 'Track background when unchecked.' },
  { name: '--ui-switch-track-bg-checked', default: 'var(--color-primary)', description: 'Track background when checked.' },
  { name: '--ui-switch-track-border', default: 'var(--color-border)', description: 'Track border color.' },
  { name: '--ui-switch-thumb-bg', default: 'white', description: 'Thumb background color.' },
  { name: '--ui-switch-ring', default: 'var(--color-ring)', description: 'Focus ring color.' },
  { name: '--ui-switch-border-error', default: 'var(--color-destructive)', description: 'Track border color on error.' },
  { name: '--ui-switch-text-error', default: 'var(--color-destructive)', description: 'Error text color.' },
];

// Code examples - web components use same syntax in all frameworks
const basicCode = `<lui-switch label="Notifications"></lui-switch>`;

const checkedCode = `<lui-switch checked label="Dark mode"></lui-switch>`;

const sizesCode = `<lui-switch size="sm" label="Small"></lui-switch>
<lui-switch size="md" label="Medium"></lui-switch>
<lui-switch size="lg" label="Large"></lui-switch>`;

const disabledCode = `<lui-switch disabled label="Disabled off"></lui-switch>
<lui-switch disabled checked label="Disabled on"></lui-switch>`;

const requiredCode = `<lui-switch required label="Accept terms"></lui-switch>`;

const formCode = `<form>
  <lui-switch name="notifications" value="enabled" label="Enable notifications"></lui-switch>
  <lui-switch name="dark-mode" value="on" label="Dark mode"></lui-switch>
  <button type="submit">Save</button>
</form>`;

const multipleCode = `<div class="settings-panel">
  <lui-switch name="notifications" label="Push notifications"></lui-switch>
  <lui-switch name="dark-mode" checked label="Dark mode"></lui-switch>
  <lui-switch name="auto-save" checked label="Auto-save"></lui-switch>
</div>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all switches */
:root {
  --ui-switch-track-bg-checked: var(--color-success);
  --ui-switch-transition: 200ms;
}

/* Scoped override - only in this container */
.settings-panel {
  --ui-switch-label-gap: 0.75rem;
  --ui-switch-radius: 0.5rem;
  --ui-switch-thumb-radius: 0.25rem;
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the track directly */
lui-switch::part(track) {
  border-width: 2px;
}

/* Style the label */
lui-switch::part(label) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}`;

export function SwitchPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Switch
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Toggle switch with animated slide transition, form participation, and full keyboard accessibility.
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

          {/* 1. Basic Toggle */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Toggle</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A simple on/off switch with a label. Click or press Space/Enter to toggle.
            </p>
            <ExampleBlock
              preview={
                <lui-switch label="Notifications"></lui-switch>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Default Checked */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Default Checked</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">checked</code> attribute to set the initial state to on.
            </p>
            <ExampleBlock
              preview={
                <lui-switch checked label="Dark mode"></lui-switch>
              }
              html={checkedCode}
              react={checkedCode}
              vue={checkedCode}
              svelte={checkedCode}
            />
          </section>

          {/* 3. Sizes */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Sizes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Three sizes are available: small, medium (default), and large.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-switch size="sm" label="Small"></lui-switch>
                  <lui-switch size="md" label="Medium"></lui-switch>
                  <lui-switch size="lg" label="Large"></lui-switch>
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
              Disabled switches prevent all interaction. Both on and off states can be disabled.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-switch disabled label="Disabled off"></lui-switch>
                  <lui-switch disabled checked label="Disabled on"></lui-switch>
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
              Mark a switch as required for form submission. An error message appears after interaction if the switch is not toggled on.
            </p>
            <ExampleBlock
              preview={
                <lui-switch required label="Accept terms"></lui-switch>
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
              Switches participate in forms via ElementInternals. Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">name</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">value</code> for form submission. When checked, the value is submitted; when unchecked, null is submitted (matching native checkbox behavior).
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-switch name="notifications" value="enabled" label="Enable notifications"></lui-switch>
                  <lui-switch name="dark-mode" value="on" label="Dark mode"></lui-switch>
                </div>
              }
              html={formCode}
              react={formCode}
              vue={formCode}
              svelte={formCode}
            />
          </section>

          {/* 7. Settings Panel */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Settings Panel</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Multiple switches arranged as a settings panel. Each switch operates independently.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-switch name="notifications" label="Push notifications"></lui-switch>
                  <lui-switch name="dark-mode" checked label="Dark mode"></lui-switch>
                  <lui-switch name="auto-save" checked label="Auto-save"></lui-switch>
                </div>
              }
              html={multipleCode}
              react={multipleCode}
              vue={multipleCode}
              svelte={multipleCode}
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
                  Uses <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="switch"</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-checked</code> for screen readers to announce toggle state.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  Toggle via click, Space, or Enter keys. Focus is visible with a ring outline.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Respects <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">prefers-reduced-motion</code> by disabling slide animation for users who prefer reduced motion.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Disabled switches set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-disabled="true"</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">tabindex="-1"</code> to remove from tab order.
                </li>
              </ul>
            </div>
          </section>

          {/* Custom Styling */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Switch component supports two tiers of customization.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change switch appearance globally or within a scoped container.
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete documentation of props, events, and styling</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          {/* Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{switchProps.length}</span>
            </div>
            <PropsTable props={switchProps} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{switchCSSVars.length}</span>
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
                  {switchCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{switchParts.length}</span>
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
                  {switchParts.map((part) => (
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
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Event</th>
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
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{'{ checked: boolean, value: string | null }'}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Fired when the switch is toggled. Value is the submission value when checked, null when unchecked.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Select', href: '/components/select' }}
          next={{ title: 'Tabs', href: '/components/tabs' }}
        />
      </div>
    </FrameworkProvider>
  );
}
