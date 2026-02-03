import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/textarea';

// Note: JSX types for lui-textarea are declared in components/LivePreview.tsx

// Props data from source Textarea component (17 props per RESEARCH.md)
const textareaProps: PropDef[] = [
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
    description: 'Current value of the textarea.',
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
    description: 'Label text above the textarea.',
  },
  {
    name: 'helper-text',
    type: 'string',
    default: '""',
    description: 'Helper text between label and textarea.',
  },
  {
    name: 'rows',
    type: 'number',
    default: '3',
    description: 'Initial height in rows.',
  },
  {
    name: 'resize',
    type: '"none" | "vertical" | "horizontal" | "both"',
    default: '"vertical"',
    description: 'Resize handle behavior.',
  },
  {
    name: 'autoresize',
    type: 'boolean',
    default: 'false',
    description: 'Auto-grow to fit content. Hides resize handle when enabled.',
  },
  {
    name: 'max-rows',
    type: 'number',
    default: '-',
    description: 'Maximum rows for auto-resize constraint.',
  },
  {
    name: 'max-height',
    type: 'string',
    default: '-',
    description: 'Maximum height CSS value (e.g., "200px"). Takes precedence over max-rows.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether the textarea is required for form submission.',
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
    description: 'Whether the textarea is disabled.',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Whether the textarea is readonly.',
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
    name: 'show-count',
    type: 'boolean',
    default: 'false',
    description: 'Show character counter (requires maxlength). Displays "current/max" format.',
  },
];

// CSS Parts data
type CSSPartDef = { name: string; description: string };
const textareaParts: CSSPartDef[] = [
  { name: 'wrapper', description: 'Outer wrapper div containing all elements.' },
  { name: 'label', description: 'Label element above the textarea.' },
  { name: 'helper', description: 'Helper text span.' },
  { name: 'textarea', description: 'Native textarea element.' },
  { name: 'counter', description: 'Character counter span.' },
  { name: 'error', description: 'Error text span.' },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const textareaCSSVars: CSSVarDef[] = [
  { name: '--ui-input-radius', default: 'var(--radius-md)', description: 'Border radius of the textarea.' },
  { name: '--ui-input-border', default: 'var(--color-border)', description: 'Border color.' },
  { name: '--ui-input-border-focus', default: 'var(--color-ring)', description: 'Border color on focus.' },
  { name: '--ui-input-border-error', default: 'var(--color-destructive)', description: 'Border color on error.' },
  { name: '--ui-input-bg', default: 'var(--color-background)', description: 'Background color.' },
  { name: '--ui-input-text', default: 'var(--color-foreground)', description: 'Text color.' },
  { name: '--ui-input-placeholder', default: 'var(--color-muted-foreground)', description: 'Placeholder text color.' },
];

// Code examples - web components use same syntax in all frameworks
const basicCode = `<lui-textarea placeholder="Enter your message..."></lui-textarea>`;

const sizesCode = `<lui-textarea size="sm" placeholder="Small"></lui-textarea>
<lui-textarea size="md" placeholder="Medium"></lui-textarea>
<lui-textarea size="lg" placeholder="Large"></lui-textarea>`;

const labelCode = `<lui-textarea label="Description" placeholder="Enter description..."></lui-textarea>
<lui-textarea label="Comments" placeholder="Add your comments..."></lui-textarea>`;

const helperTextCode = `<lui-textarea
  label="Bio"
  helper-text="Tell us about yourself in a few sentences"
  placeholder="Write something about yourself..."
></lui-textarea>`;

const resizeModesCode = `<lui-textarea resize="none" placeholder="No resize"></lui-textarea>
<lui-textarea resize="vertical" placeholder="Vertical resize (default)"></lui-textarea>
<lui-textarea resize="horizontal" placeholder="Horizontal resize"></lui-textarea>
<lui-textarea resize="both" placeholder="Both directions"></lui-textarea>`;

const autoresizeCode = `<lui-textarea
  autoresize
  placeholder="Start typing to see me grow..."
></lui-textarea>`;

const constrainedAutoresizeCode = `<lui-textarea
  autoresize
  max-rows="5"
  placeholder="I'll grow up to 5 rows, then scroll..."
></lui-textarea>

<lui-textarea
  autoresize
  max-height="150px"
  placeholder="I'll grow up to 150px max height..."
></lui-textarea>`;

const characterCountCode = `<lui-textarea
  label="Tweet"
  placeholder="What's happening?"
  maxlength="280"
  show-count
></lui-textarea>`;

const requiredCode = `<lui-textarea label="Feedback" required placeholder="Your feedback is required"></lui-textarea>
<lui-textarea label="Feedback" required required-indicator="text" placeholder="Required with text indicator"></lui-textarea>`;

const disabledCode = `<lui-textarea disabled value="This textarea is disabled"></lui-textarea>
<lui-textarea readonly value="This textarea is readonly - you can select but not edit"></lui-textarea>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all textareas */
:root {
  --ui-input-radius: 1rem;
  --ui-input-border-focus: var(--color-primary);
}

/* Scoped override - only in this container */
.form-section {
  --ui-input-radius: 0.25rem;
  --ui-input-bg: var(--color-muted);
}`;

// CSS Parts example code
const cssPartsCode = `/* Style the textarea element directly */
lui-textarea::part(textarea) {
  font-family: monospace;
  line-height: 1.8;
}

/* Style the label */
lui-textarea::part(label) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

/* Style the character counter */
lui-textarea::part(counter) {
  font-size: 0.625rem;
  opacity: 0.7;
}`;

export function TextareaPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Textarea
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              A multi-line text input with auto-resize, validation, and character count.
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

          {/* 1. Basic Textarea */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Textarea</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A simple textarea with placeholder text. By default, it has 3 rows and vertical resize.
            </p>
            <ExampleBlock
              preview={
                <lui-textarea placeholder="Enter your message..."></lui-textarea>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
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
                  <lui-textarea size="sm" placeholder="Small"></lui-textarea>
                  <lui-textarea size="md" placeholder="Medium"></lui-textarea>
                  <lui-textarea size="lg" placeholder="Large"></lui-textarea>
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
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">label</code> attribute to add a label above the textarea.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-textarea label="Description" placeholder="Enter description..."></lui-textarea>
                  <lui-textarea label="Comments" placeholder="Add your comments..."></lui-textarea>
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
                <lui-textarea
                  label="Bio"
                  helper-text="Tell us about yourself in a few sentences"
                  placeholder="Write something about yourself..."
                ></lui-textarea>
              }
              html={helperTextCode}
              react={helperTextCode}
              vue={helperTextCode}
              svelte={helperTextCode}
            />
          </section>

          {/* 5. Resize Modes */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Resize Modes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Control the resize handle behavior with the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">resize</code> attribute.
            </p>
            <ExampleBlock
              preview={
                <div className="grid grid-cols-2 gap-3">
                  <lui-textarea resize="none" placeholder="No resize" rows={2}></lui-textarea>
                  <lui-textarea resize="vertical" placeholder="Vertical resize (default)" rows={2}></lui-textarea>
                  <lui-textarea resize="horizontal" placeholder="Horizontal resize" rows={2}></lui-textarea>
                  <lui-textarea resize="both" placeholder="Both directions" rows={2}></lui-textarea>
                </div>
              }
              html={resizeModesCode}
              react={resizeModesCode}
              vue={resizeModesCode}
              svelte={resizeModesCode}
            />
          </section>

          {/* 6. Auto-resize - Signature interactive demo */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Auto-resize
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Interactive</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">autoresize</code> to make the textarea grow automatically as you type. Try it below!
            </p>
            <ExampleBlock
              preview={
                <lui-textarea
                  autoresize
                  placeholder="Start typing to see me grow..."
                ></lui-textarea>
              }
              html={autoresizeCode}
              react={autoresizeCode}
              vue={autoresizeCode}
              svelte={autoresizeCode}
            />
          </section>

          {/* 7. Constrained Auto-resize */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Constrained Auto-resize</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Limit auto-resize growth with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-rows</code> or <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">max-height</code>. The textarea scrolls after reaching the limit.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-textarea
                    autoresize
                    max-rows={5}
                    label="Max 5 rows"
                    placeholder="I'll grow up to 5 rows, then scroll..."
                  ></lui-textarea>
                  <lui-textarea
                    autoresize
                    max-height="150px"
                    label="Max 150px height"
                    placeholder="I'll grow up to 150px max height..."
                  ></lui-textarea>
                </div>
              }
              html={constrainedAutoresizeCode}
              react={constrainedAutoresizeCode}
              vue={constrainedAutoresizeCode}
              svelte={constrainedAutoresizeCode}
            />
          </section>

          {/* 8. Character Counter */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Character Counter</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">show-count</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">maxlength</code> to display a live character count in the bottom-right corner.
            </p>
            <ExampleBlock
              preview={
                <lui-textarea
                  label="Tweet"
                  placeholder="What's happening?"
                  maxlength={280}
                  show-count
                ></lui-textarea>
              }
              html={characterCountCode}
              react={characterCountCode}
              vue={characterCountCode}
              svelte={characterCountCode}
            />
          </section>

          {/* 9. Validation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Validation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Mark fields as required with an asterisk or text indicator. Validation error shows on blur when empty.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-textarea label="Feedback" required placeholder="Your feedback is required"></lui-textarea>
                  <lui-textarea label="Feedback" required required-indicator="text" placeholder="Required with text indicator"></lui-textarea>
                </div>
              }
              html={requiredCode}
              react={requiredCode}
              vue={requiredCode}
              svelte={requiredCode}
            />
          </section>

          {/* 10. Disabled & Readonly */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled & Readonly</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Disabled textareas prevent all interaction. Readonly textareas allow text selection but no editing.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-3">
                  <lui-textarea disabled value="This textarea is disabled"></lui-textarea>
                  <lui-textarea readonly value="This textarea is readonly - you can select but not edit"></lui-textarea>
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
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Custom Styling</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The Textarea component supports two tiers of customization.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change textarea appearance globally or within a scoped container.
              Textarea shares the same <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">--ui-input-*</code> tokens as Input.
            </p>
            <div className="mb-4">
              <style>{`
                .demo-rounded-textareas { --ui-input-radius: 1rem; }
              `}</style>
              <div className="demo-rounded-textareas flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <lui-textarea placeholder="Rounded textarea" rows={2}></lui-textarea>
                <lui-textarea placeholder="Another rounded textarea" rows={2}></lui-textarea>
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{textareaProps.length}</span>
            </div>
            <PropsTable props={textareaProps} />
          </div>

          {/* No Slots Section - Textarea has no slots per RESEARCH.md */}

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{textareaCSSVars.length}</span>
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
                  {textareaCSSVars.map((cssVar) => (
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
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{textareaParts.length}</span>
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
                  {textareaParts.map((part) => (
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
                    The Textarea component uses standard DOM events like{' '}
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
          prev={{ title: 'Tabs', href: '/components/tabs' }}
          next={{ title: 'Time Picker', href: '/components/time-picker' }}
        />
      </div>
    </FrameworkProvider>
  );
}
