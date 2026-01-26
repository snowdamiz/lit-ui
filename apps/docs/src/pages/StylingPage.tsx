import { FrameworkProvider } from '../contexts/FrameworkContext';
import { ExampleBlock } from '../components/ExampleBlock';
import { CodeBlock } from '../components/CodeBlock';
import { PrevNextNav } from '../components/PrevNextNav';

// Side-effect import to register custom elements
import '@lit-ui/button';
import '@lit-ui/dialog';

// Styling tiers data
const stylingTiers = [
  {
    tier: 'Tier 1',
    method: 'CSS Custom Properties',
    useCase: 'Global/scoped theming',
    description: 'Override --ui-* variables on :root or scoped containers',
  },
  {
    tier: 'Tier 2',
    method: 'Class Passthrough',
    useCase: 'Per-instance Tailwind utilities',
    description: 'Use btn-class or dialog-class attributes',
  },
  {
    tier: 'Tier 3',
    method: 'CSS Parts',
    useCase: 'Full control over internal elements',
    description: 'Style internal elements with ::part() selectors',
  },
];

// Button CSS Custom Properties
const buttonCSSVars = {
  layout: [
    { name: '--ui-button-radius', default: '0.375rem', description: 'Border radius of the button' },
    { name: '--ui-button-shadow', default: 'none', description: 'Box shadow of the button' },
    { name: '--ui-button-border-width', default: '1px', description: 'Border width for outline variant' },
  ],
  typography: [
    { name: '--ui-button-font-weight', default: '500', description: 'Font weight of button text' },
    { name: '--ui-button-font-size-sm', default: '0.875rem', description: 'Font size for small buttons' },
    { name: '--ui-button-font-size-md', default: '1rem', description: 'Font size for medium buttons' },
    { name: '--ui-button-font-size-lg', default: '1.125rem', description: 'Font size for large buttons' },
  ],
  spacing: [
    { name: '--ui-button-padding-x-sm', default: '0.75rem', description: 'Horizontal padding for small' },
    { name: '--ui-button-padding-y-sm', default: '0.375rem', description: 'Vertical padding for small' },
    { name: '--ui-button-gap-sm', default: '0.375rem', description: 'Gap between icon and text (small)' },
    { name: '--ui-button-padding-x-md', default: '1rem', description: 'Horizontal padding for medium' },
    { name: '--ui-button-padding-y-md', default: '0.5rem', description: 'Vertical padding for medium' },
    { name: '--ui-button-gap-md', default: '0.5rem', description: 'Gap between icon and text (medium)' },
    { name: '--ui-button-padding-x-lg', default: '1.5rem', description: 'Horizontal padding for large' },
    { name: '--ui-button-padding-y-lg', default: '0.75rem', description: 'Vertical padding for large' },
    { name: '--ui-button-gap-lg', default: '0.625rem', description: 'Gap between icon and text (large)' },
  ],
  variants: [
    { name: '--ui-button-primary-bg', default: 'var(--ui-color-primary)', description: 'Primary variant background' },
    { name: '--ui-button-primary-text', default: 'white', description: 'Primary variant text color' },
    { name: '--ui-button-secondary-bg', default: 'var(--ui-color-secondary)', description: 'Secondary variant background' },
    { name: '--ui-button-secondary-text', default: 'var(--ui-color-secondary-foreground)', description: 'Secondary variant text' },
    { name: '--ui-button-destructive-bg', default: 'var(--ui-color-destructive)', description: 'Destructive variant background' },
    { name: '--ui-button-destructive-text', default: 'white', description: 'Destructive variant text color' },
  ],
};

// Dialog CSS Custom Properties
const dialogCSSVars = {
  layout: [
    { name: '--ui-dialog-radius', default: '0.5rem', description: 'Border radius of the dialog' },
    { name: '--ui-dialog-shadow', default: 'shadow-lg', description: 'Box shadow of the dialog' },
    { name: '--ui-dialog-padding', default: '1.5rem', description: 'Inner padding of the dialog' },
    { name: '--ui-dialog-max-width-sm', default: '24rem', description: 'Max width for small dialogs' },
    { name: '--ui-dialog-max-width-md', default: '28rem', description: 'Max width for medium dialogs' },
    { name: '--ui-dialog-max-width-lg', default: '32rem', description: 'Max width for large dialogs' },
  ],
  colors: [
    { name: '--ui-dialog-bg', default: 'var(--ui-color-card)', description: 'Dialog background color' },
    { name: '--ui-dialog-text', default: 'var(--ui-color-card-foreground)', description: 'Dialog text color' },
    { name: '--ui-dialog-backdrop', default: 'rgba(0, 0, 0, 0.5)', description: 'Backdrop overlay color' },
    { name: '--ui-dialog-body-color', default: 'var(--ui-color-muted-foreground)', description: 'Body text color' },
  ],
  typography: [
    { name: '--ui-dialog-title-size', default: '1.125rem', description: 'Title font size' },
    { name: '--ui-dialog-title-weight', default: '600', description: 'Title font weight' },
    { name: '--ui-dialog-header-margin', default: '1rem', description: 'Space below header' },
    { name: '--ui-dialog-footer-margin', default: '1.5rem', description: 'Space above footer' },
    { name: '--ui-dialog-footer-gap', default: '0.75rem', description: 'Gap between footer buttons' },
  ],
};

// Semantic color tokens
const semanticColors = [
  { name: '--ui-color-primary', description: 'Main brand color for buttons, links, focus states' },
  { name: '--ui-color-primary-foreground', description: 'Text color on primary backgrounds' },
  { name: '--ui-color-secondary', description: 'Subtle backgrounds and secondary actions' },
  { name: '--ui-color-secondary-foreground', description: 'Text color on secondary backgrounds' },
  { name: '--ui-color-destructive', description: 'Errors, delete actions, warnings' },
  { name: '--ui-color-destructive-foreground', description: 'Text color on destructive backgrounds' },
  { name: '--ui-color-muted', description: 'Disabled states, subtle backgrounds' },
  { name: '--ui-color-muted-foreground', description: 'Subdued text color' },
  { name: '--ui-color-accent', description: 'Hover states, highlights' },
  { name: '--ui-color-accent-foreground', description: 'Text on accent backgrounds' },
  { name: '--ui-color-foreground', description: 'Default text color' },
  { name: '--ui-color-border', description: 'Border color' },
  { name: '--ui-color-ring', description: 'Focus ring color' },
  { name: '--ui-color-card', description: 'Card/dialog background' },
  { name: '--ui-color-card-foreground', description: 'Card/dialog text color' },
];

// Button parts
const buttonParts = [
  { name: 'button', description: 'The inner button element' },
  { name: 'icon-start', description: 'The icon-start slot wrapper' },
  { name: 'content', description: 'The default slot wrapper for button text' },
  { name: 'icon-end', description: 'The icon-end slot wrapper' },
];

// Dialog parts
const dialogParts = [
  { name: 'dialog', description: 'The native dialog element' },
  { name: 'content', description: 'The dialog content container' },
  { name: 'close-button', description: 'The X close button (when show-close-button is true)' },
  { name: 'header', description: 'The header/title wrapper' },
  { name: 'body', description: 'The main content area' },
  { name: 'footer', description: 'The footer/actions wrapper' },
];

// Button slots
const buttonSlots = [
  { name: '(default)', description: 'Button text content' },
  { name: 'icon-start', description: 'Icon placed before the text' },
  { name: 'icon-end', description: 'Icon placed after the text' },
];

// Dialog slots
const dialogSlots = [
  { name: '(default)', description: 'Dialog body content' },
  { name: 'title', description: 'Dialog title/header' },
  { name: 'footer', description: 'Dialog footer/actions' },
];

// Code examples
const globalOverrideCode = `/* Global override - affects all components */
:root {
  --ui-color-primary: oklch(0.65 0.2 145); /* Green theme */
  --ui-button-radius: 9999px; /* Pill buttons */
  --ui-dialog-radius: 1rem; /* More rounded dialogs */
}

/* Scoped override - only affects children */
.card-actions {
  --ui-button-radius: 0.25rem;
  --ui-button-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}`;

const classPassthroughCode = `<!-- Button with Tailwind utilities -->
<lui-button btn-class="rounded-full shadow-lg">
  Pill Button
</lui-button>

<!-- Dialog with custom width -->
<lui-dialog dialog-class="max-w-2xl">
  <span slot="title">Wide Dialog</span>
  <p>Content here...</p>
</lui-dialog>`;

const cssPartsCode = `/* Style the button's internal element */
lui-button::part(button) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

lui-button::part(button):hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
}

/* Style dialog parts */
lui-dialog::part(header) {
  border-bottom: 1px solid var(--ui-color-border);
  padding-bottom: 1rem;
}

lui-dialog::part(footer) {
  border-top: 1px solid var(--ui-color-border);
  padding-top: 1rem;
}`;

const darkModeCode = `/* Light mode (default) */
:root {
  --ui-color-primary: oklch(0.62 0.18 250);
  --ui-color-card: white;
  --ui-color-card-foreground: oklch(0.13 0.028 261.692);
}

/* Dark mode - add .dark class to html or body */
.dark {
  --ui-color-primary: oklch(0.54 0.16 250);
  --ui-color-card: oklch(0.21 0.006 285.885);
  --ui-color-card-foreground: oklch(0.97 0.02 250);
}`;

const slottedContentCode = `<!-- Styling slotted content -->
<lui-button>
  <svg slot="icon-start" class="text-yellow-500">...</svg>
  Click me
</lui-button>

<style>
/* Style slotted icons with CSS */
lui-button::slotted([slot="icon-start"]) {
  color: var(--ui-color-primary);
}
</style>`;

export function StylingPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Styling
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              Customize litui components with CSS custom properties, class passthrough, and CSS parts.
            </p>
          </div>
        </header>

        <div className="space-y-16 animate-fade-in-up opacity-0 stagger-2">
          {/* Styling Philosophy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Customization Tiers</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              litui components support three tiers of customization, from simple theming to complete control.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Tier</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stylingTiers.map((tier) => (
                    <tr key={tier.tier} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-semibold text-gray-700 dark:text-gray-300">{tier.tier}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{tier.method}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tier.useCase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CSS Custom Properties</h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Tier 1 - Recommended</span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Override CSS custom properties to change component appearance globally or within scoped containers.
              Properties cascade into Shadow DOM, enabling consistent theming across all components.
            </p>

            <CodeBlock code={globalOverrideCode} language="css" />

            {/* Semantic Colors */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Semantic Color Tokens</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              These tokens define the color palette used by all components. Override them to apply your brand colors.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {semanticColors.map((color) => (
                    <tr key={color.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{color.name}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{color.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Button Properties */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Button Properties</h3>

            {/* Layout */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Layout</h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {buttonCSSVars.layout.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Typography */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Typography</h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {buttonCSSVars.typography.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Spacing */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Spacing</h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {buttonCSSVars.spacing.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Variant Colors */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Variant Colors</h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {buttonCSSVars.variants.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dialog Properties */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4">Dialog Properties</h3>

            {/* Layout */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Layout</h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dialogCSSVars.layout.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Colors */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Colors</h4>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Default</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dialogCSSVars.colors.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Typography */}
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Typography & Spacing</h4>
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
                  {dialogCSSVars.typography.map((v) => (
                    <tr key={v.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{v.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">{v.default}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Class Passthrough */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Class Passthrough</h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Tier 2</span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">btn-class</code> and{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">dialog-class</code> attributes
              to add Tailwind utility classes for per-instance customization.
            </p>

            <ExampleBlock
              preview={
                <div className="flex flex-wrap gap-3">
                  <lui-button btn-class="rounded-full">Pill Button</lui-button>
                  <lui-button btn-class="shadow-lg">Shadow Button</lui-button>
                  <lui-button variant="secondary" btn-class="font-bold">Bold Text</lui-button>
                </div>
              }
              html={classPassthroughCode}
              react={classPassthroughCode}
              vue={classPassthroughCode}
              svelte={classPassthroughCode}
            />

            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Arbitrary Values Not Supported</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    All default Tailwind utility classes work with class passthrough. However, arbitrary values like{' '}
                    <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded text-xs font-mono">bg-[#000000]</code> or{' '}
                    <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded text-xs font-mono">p-[13px]</code>{' '}
                    are not supported because they are not precompiled. Use CSS custom properties (Tier 1) or CSS parts (Tier 3) for custom values.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CSS Parts */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CSS Parts</h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">Tier 3 - Advanced</span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">::part()</code> pseudo-element
              for complete styling control over internal elements. This is useful for complex customizations like gradients.
            </p>

            <div className="mb-6">
              <style>{`
                .demo-gradient-buttons lui-button::part(button) {
                  background: linear-gradient(135deg, #667eea, #764ba2);
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                .demo-gradient-buttons lui-button::part(button):hover {
                  background: linear-gradient(135deg, #764ba2, #667eea);
                }
              `}</style>
              <div className="demo-gradient-buttons flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <lui-button>Gradient Button</lui-button>
              </div>
            </div>
            <CodeBlock code={cssPartsCode} language="css" />

            {/* Button Parts */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Button Parts</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Part</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {buttonParts.map((part) => (
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

            {/* Dialog Parts */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Dialog Parts</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Part</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dialogParts.map((part) => (
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
          </section>

          {/* Slots */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Slots</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Components use slots to accept content. Style slotted content from the light DOM or use the{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">::slotted()</code> pseudo-element.
            </p>

            <CodeBlock code={slottedContentCode} language="html" />

            {/* Button Slots */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Button Slots</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Slot</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {buttonSlots.map((slot) => (
                    <tr key={slot.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{slot.name}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{slot.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dialog Slots */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">Dialog Slots</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Slot</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {dialogSlots.map((slot) => (
                    <tr key={slot.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-800 dark:text-gray-200">{slot.name}</code>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{slot.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Theme System */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Theme System</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              litui uses a class-based dark mode system. Add the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">.dark</code> class
              to your <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">&lt;html&gt;</code> or <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">&lt;body&gt;</code> element
              to enable dark mode.
            </p>

            <CodeBlock code={darkModeCode} language="css" />

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">OKLCH Color Space</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    litui uses the OKLCH color space for wide-gamut support and perceptually uniform colors.
                    This enables automatic text contrast calculation based on background lightness.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Theme Configurator</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the{' '}
                    <a href="/configurator" className="text-blue-600 dark:text-blue-400 hover:underline">Theme Configurator</a>{' '}
                    to visually customize your theme and export CSS custom properties.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Reference */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Reference</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Summary of all customization options for each component.
            </p>

            {/* Button Quick Reference */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Button</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Class Passthrough</h4>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">btn-class="..."</code>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">CSS Parts</h4>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">button, icon-start, content, icon-end</code>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Slots</h4>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">(default), icon-start, icon-end</code>
                </div>
              </div>
            </div>

            {/* Dialog Quick Reference */}
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Dialog</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Class Passthrough</h4>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">dialog-class="..."</code>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">CSS Parts</h4>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">dialog, content, close-button, header, body, footer</code>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Slots</h4>
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">(default), title, footer</code>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="divider-fade my-12" />
        <PrevNextNav
          prev={{ title: 'Installation', href: '/installation' }}
          next={{ title: 'SSR Setup', href: '/guides/ssr' }}
        />
      </div>
    </FrameworkProvider>
  );
}
