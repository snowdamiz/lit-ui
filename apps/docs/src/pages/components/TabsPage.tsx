import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements from built library
import '@lit-ui/tabs';

// Props data for lui-tabs (6 props)
const tabsProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Active tab value (controlled mode).',
  },
  {
    name: 'default-value',
    type: 'string',
    default: '""',
    description: 'Initial active tab for uncontrolled mode.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disable all tabs.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Accessible label for the tablist element.',
  },
  {
    name: 'orientation',
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: 'Orientation for keyboard navigation and layout.',
  },
  {
    name: 'activation-mode',
    type: '"automatic" | "manual"',
    default: '"automatic"',
    description: 'Tab activation mode. Automatic activates on focus, manual requires Enter/Space.',
  },
];

// Props data for lui-tab-panel (5 props)
const tabPanelProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'Unique identifier for this panel.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Text label displayed in the tab button.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether this tab is disabled.',
  },
  {
    name: 'active',
    type: 'boolean',
    default: 'false',
    description: 'Whether this panel is active (set by parent).',
  },
  {
    name: 'lazy',
    type: 'boolean',
    default: 'false',
    description: 'Defer content rendering until first activation.',
  },
];

// Slots data
const tabsSlots: SlotDef[] = [
  {
    name: '(default)',
    description: 'Child lui-tab-panel elements.',
  },
];

const tabPanelSlots: SlotDef[] = [
  {
    name: '(default)',
    description: 'Panel content.',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const tabsCSSVars: CSSVarDef[] = [
  { name: '--ui-tabs-border', default: 'var(--color-border, var(--ui-color-border))', description: 'Border color.' },
  { name: '--ui-tabs-list-bg', default: 'var(--color-muted, var(--ui-color-muted))', description: 'Tab list background.' },
  { name: '--ui-tabs-list-padding', default: '0.25rem', description: 'Tab list padding.' },
  { name: '--ui-tabs-list-radius', default: '0.375rem', description: 'Tab list border radius.' },
  { name: '--ui-tabs-list-gap', default: '0.25rem', description: 'Gap between tab buttons.' },
  { name: '--ui-tabs-tab-padding', default: '0.5rem 1rem', description: 'Tab button padding.' },
  { name: '--ui-tabs-tab-radius', default: '0.25rem', description: 'Tab button border radius.' },
  { name: '--ui-tabs-tab-font-size', default: '0.875rem', description: 'Tab font size.' },
  { name: '--ui-tabs-tab-font-weight', default: '500', description: 'Tab font weight.' },
  { name: '--ui-tabs-tab-text', default: 'var(--color-muted-foreground, var(--ui-color-muted-foreground))', description: 'Inactive tab text color.' },
  { name: '--ui-tabs-tab-bg', default: 'transparent', description: 'Inactive tab background.' },
  { name: '--ui-tabs-tab-hover-text', default: 'var(--color-foreground, var(--ui-color-foreground))', description: 'Hover tab text color.' },
  { name: '--ui-tabs-tab-hover-bg', default: 'transparent', description: 'Hover tab background.' },
  { name: '--ui-tabs-tab-active-text', default: 'var(--color-foreground, var(--ui-color-foreground))', description: 'Active tab text color.' },
  { name: '--ui-tabs-tab-active-bg', default: 'var(--color-background, white)', description: 'Active tab background.' },
  { name: '--ui-tabs-tab-active-shadow', default: '0 1px 2px 0 rgb(0 0 0 / 0.05)', description: 'Active tab box shadow.' },
  { name: '--ui-tabs-panel-padding', default: '1rem 0', description: 'Panel content padding.' },
  { name: '--ui-tabs-panel-text', default: 'var(--color-foreground, var(--ui-color-foreground))', description: 'Panel text color.' },
  { name: '--ui-tabs-ring', default: 'var(--color-ring, var(--ui-color-ring))', description: 'Focus ring color.' },
  { name: '--ui-tabs-transition', default: '150ms', description: 'Transition duration.' },
  { name: '--ui-tabs-indicator-color', default: 'var(--color-primary, var(--ui-color-primary))', description: 'Sliding indicator color.' },
  { name: '--ui-tabs-indicator-height', default: '2px', description: 'Sliding indicator height.' },
  { name: '--ui-tabs-indicator-radius', default: '9999px', description: 'Sliding indicator border radius.' },
  { name: '--ui-tabs-indicator-transition', default: '200ms', description: 'Sliding indicator transition duration.' },
  { name: '--ui-tabs-scroll-button-size', default: '2rem', description: 'Scroll button size for overflow.' },
];

// Code examples
const basicCode = `<lui-tabs default-value="tab-1" label="Example tabs">
  <lui-tab-panel value="tab-1" label="Account">
    Manage your account settings and preferences.
  </lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Security">
    Update your password and two-factor authentication.
  </lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Notifications">
    Configure email and push notification preferences.
  </lui-tab-panel>
</lui-tabs>`;

const verticalCode = `<lui-tabs orientation="vertical" default-value="general" label="Settings">
  <lui-tab-panel value="general" label="General">
    General application settings.
  </lui-tab-panel>
  <lui-tab-panel value="appearance" label="Appearance">
    Theme and display preferences.
  </lui-tab-panel>
  <lui-tab-panel value="privacy" label="Privacy">
    Privacy and data sharing options.
  </lui-tab-panel>
</lui-tabs>`;

const manualCode = `<lui-tabs activation-mode="manual" default-value="tab-1" label="Manual tabs">
  <lui-tab-panel value="tab-1" label="Overview">
    Arrow keys move focus between tabs. Press Enter or Space to activate.
  </lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Details">
    This mode is useful when tab switching has side effects like network requests.
  </lui-tab-panel>
  <lui-tab-panel value="tab-3" label="History">
    The focused tab is visually distinct from the active tab.
  </lui-tab-panel>
</lui-tabs>`;

const disabledCode = `<lui-tabs default-value="tab-1" label="Tabs with disabled">
  <lui-tab-panel value="tab-1" label="Active">
    This tab is active and functional.
  </lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Disabled" disabled>
    This tab is disabled and cannot be selected.
  </lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Available">
    This tab is also functional.
  </lui-tab-panel>
</lui-tabs>`;

const lazyCode = `<lui-tabs default-value="tab-1" label="Lazy tabs">
  <lui-tab-panel value="tab-1" label="Eager">
    This panel renders immediately.
  </lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Lazy" lazy>
    This content is not rendered until you click this tab for the first time.
  </lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Also Lazy" lazy>
    Once rendered, lazy panels preserve their content when deactivated.
  </lui-tab-panel>
</lui-tabs>`;

const overflowCode = `<lui-tabs default-value="tab-1" label="Overflow tabs">
  <lui-tab-panel value="tab-1" label="Dashboard">Dashboard content</lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Analytics">Analytics content</lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Reports">Reports content</lui-tab-panel>
  <lui-tab-panel value="tab-4" label="Settings">Settings content</lui-tab-panel>
  <lui-tab-panel value="tab-5" label="Users">Users content</lui-tab-panel>
  <lui-tab-panel value="tab-6" label="Billing">Billing content</lui-tab-panel>
  <lui-tab-panel value="tab-7" label="Integrations">Integrations content</lui-tab-panel>
  <lui-tab-panel value="tab-8" label="API Keys">API Keys content</lui-tab-panel>
  <lui-tab-panel value="tab-9" label="Webhooks">Webhooks content</lui-tab-panel>
</lui-tabs>`;

const indicatorCode = `<lui-tabs default-value="tab-1" label="Indicator tabs">
  <lui-tab-panel value="tab-1" label="First">
    Click between tabs to see the indicator slide smoothly.
  </lui-tab-panel>
  <lui-tab-panel value="tab-2" label="Second">
    The indicator width matches the active tab button.
  </lui-tab-panel>
  <lui-tab-panel value="tab-3" label="Third">
    The indicator transitions with configurable duration via CSS.
  </lui-tab-panel>
</lui-tabs>`;

// CSS Custom Properties example code
const cssVarsCode = `/* Global override - all tabs */
:root {
  --ui-tabs-list-radius: 0.5rem;
  --ui-tabs-tab-radius: 0.375rem;
  --ui-tabs-indicator-color: var(--color-accent);
}

/* Scoped override - only in this container */
.settings-tabs {
  --ui-tabs-tab-padding: 0.75rem 1.25rem;
  --ui-tabs-list-gap: 0.5rem;
  --ui-tabs-transition: 200ms;
}`;

export function TabsPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Tabs
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              An accessible tabs component with animated sliding indicator, horizontal and vertical
              orientations, automatic or manual activation, overflow scroll, and lazy panel rendering.
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

          {/* 1. Basic Tabs */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Tabs</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A horizontal tab group with three panels. Click a tab or use arrow keys to switch panels.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs default-value="tab-1" label="Example tabs">
                  <lui-tab-panel value="tab-1" label="Account">
                    Manage your account settings and preferences.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-2" label="Security">
                    Update your password and two-factor authentication.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-3" label="Notifications">
                    Configure email and push notification preferences.
                  </lui-tab-panel>
                </lui-tabs>
              }
              html={basicCode}
              react={basicCode}
              vue={basicCode}
              svelte={basicCode}
            />
          </section>

          {/* 2. Vertical Orientation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Vertical Orientation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">orientation="vertical"</code> for a side-by-side layout. Keyboard navigation uses Arrow Up/Down instead of Left/Right.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs orientation="vertical" default-value="general" label="Settings">
                  <lui-tab-panel value="general" label="General">
                    General application settings.
                  </lui-tab-panel>
                  <lui-tab-panel value="appearance" label="Appearance">
                    Theme and display preferences.
                  </lui-tab-panel>
                  <lui-tab-panel value="privacy" label="Privacy">
                    Privacy and data sharing options.
                  </lui-tab-panel>
                </lui-tabs>
              }
              html={verticalCode}
              react={verticalCode}
              vue={verticalCode}
              svelte={verticalCode}
            />
          </section>

          {/* 3. Manual Activation */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Manual Activation</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              With <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">activation-mode="manual"</code>, arrow keys move focus between tabs without activating them. Press Enter or Space to activate the focused tab.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs activation-mode="manual" default-value="tab-1" label="Manual tabs">
                  <lui-tab-panel value="tab-1" label="Overview">
                    Arrow keys move focus between tabs. Press Enter or Space to activate.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-2" label="Details">
                    This mode is useful when tab switching has side effects like network requests.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-3" label="History">
                    The focused tab is visually distinct from the active tab.
                  </lui-tab-panel>
                </lui-tabs>
              }
              html={manualCode}
              react={manualCode}
              vue={manualCode}
              svelte={manualCode}
            />
          </section>

          {/* 4. Disabled Tabs */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled Tabs</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Individual tabs can be disabled. Disabled tabs are skipped during keyboard navigation and cannot be activated.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs default-value="tab-1" label="Tabs with disabled">
                  <lui-tab-panel value="tab-1" label="Active">
                    This tab is active and functional.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-2" label="Disabled" disabled>
                    This tab is disabled and cannot be selected.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-3" label="Available">
                    This tab is also functional.
                  </lui-tab-panel>
                </lui-tabs>
              }
              html={disabledCode}
              react={disabledCode}
              vue={disabledCode}
              svelte={disabledCode}
            />
          </section>

          {/* 5. Lazy Panels */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Lazy Panels</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Set <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lazy</code> on individual panels to defer content rendering until first activation. Content is preserved after deactivation.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs default-value="tab-1" label="Lazy tabs">
                  <lui-tab-panel value="tab-1" label="Eager">
                    This panel renders immediately.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-2" label="Lazy" lazy>
                    This content is not rendered until you click this tab for the first time.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-3" label="Also Lazy" lazy>
                    Once rendered, lazy panels preserve their content when deactivated.
                  </lui-tab-panel>
                </lui-tabs>
              }
              html={lazyCode}
              react={lazyCode}
              vue={lazyCode}
              svelte={lazyCode}
            />
          </section>

          {/* 6. Overflow Scroll */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Overflow Scroll</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              When tabs overflow the container, scroll buttons appear automatically. The tablist scrolls horizontally to reveal hidden tabs.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs default-value="tab-1" label="Overflow tabs">
                  <lui-tab-panel value="tab-1" label="Dashboard">Dashboard content</lui-tab-panel>
                  <lui-tab-panel value="tab-2" label="Analytics">Analytics content</lui-tab-panel>
                  <lui-tab-panel value="tab-3" label="Reports">Reports content</lui-tab-panel>
                  <lui-tab-panel value="tab-4" label="Settings">Settings content</lui-tab-panel>
                  <lui-tab-panel value="tab-5" label="Users">Users content</lui-tab-panel>
                  <lui-tab-panel value="tab-6" label="Billing">Billing content</lui-tab-panel>
                  <lui-tab-panel value="tab-7" label="Integrations">Integrations content</lui-tab-panel>
                  <lui-tab-panel value="tab-8" label="API Keys">API Keys content</lui-tab-panel>
                  <lui-tab-panel value="tab-9" label="Webhooks">Webhooks content</lui-tab-panel>
                </lui-tabs>
              }
              html={overflowCode}
              react={overflowCode}
              vue={overflowCode}
              svelte={overflowCode}
            />
          </section>

          {/* 7. Animated Indicator */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Animated Indicator</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              The sliding indicator animates between tabs by default. Its color, height, and transition can be customized via CSS custom properties.
            </p>
            <ExampleBlock
              preview={
                <lui-tabs default-value="tab-1" label="Indicator tabs">
                  <lui-tab-panel value="tab-1" label="First">
                    Click between tabs to see the indicator slide smoothly.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-2" label="Second">
                    The indicator width matches the active tab button.
                  </lui-tab-panel>
                  <lui-tab-panel value="tab-3" label="Third">
                    The indicator transitions with configurable duration via CSS.
                  </lui-tab-panel>
                </lui-tabs>
              }
              html={indicatorCode}
              react={indicatorCode}
              vue={indicatorCode}
              svelte={indicatorCode}
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
                  Horizontal: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Arrow Left</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Arrow Right</code>. Vertical: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Arrow Up</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Arrow Down</code>. Navigation wraps at boundaries.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">2</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Home</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">End</code> jump to first / last enabled tab.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">3</span>
                  Automatic mode activates tabs on focus. Manual mode requires <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</code> / <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Space</code> to activate.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">4</span>
                  Tab buttons use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="tab"</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-selected</code> and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">aria-controls</code> for panel association.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">5</span>
                  Panels have <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">role="tabpanel"</code> and conditional <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">tabindex="0"</code> when panel has no focusable children (W3C APG).
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
              The Tabs component supports CSS custom properties for theming. Override globally or within a scoped container.
            </p>
          </section>

          {/* CSS Custom Properties */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              CSS Custom Properties
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Recommended</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Override CSS custom properties to change tabs appearance globally or within a scoped container.
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

          {/* Tabs Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-tabs Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tabsProps.length}</span>
            </div>
            <PropsTable props={tabsProps} />
          </div>

          {/* TabPanel Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-tab-panel Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tabPanelProps.length}</span>
            </div>
            <PropsTable props={tabPanelProps} />
          </div>

          {/* Tabs Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-tabs Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tabsSlots.length}</span>
            </div>
            <SlotsTable slots={tabsSlots} />
          </div>

          {/* TabPanel Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-tab-panel Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tabPanelSlots.length}</span>
            </div>
            <SlotsTable slots={tabPanelSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{tabsCSSVars.length}</span>
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
                  {tabsCSSVars.map((cssVar) => (
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
                  <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">on lui-tabs</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Fired when the active tab changes. Detail: <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">{'{ value: string }'}</code>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Switch', href: '/components/switch' }}
          next={{ title: 'Textarea', href: '/components/textarea' }}
        />
      </div>
    </FrameworkProvider>
  );
}
