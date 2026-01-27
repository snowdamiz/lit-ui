import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';

// Side-effect import to register custom elements from built library
import '@lit-ui/select';

// Props data for lui-select
const selectProps: PropDef[] = [
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
    type: 'string | string[]',
    default: '""',
    description: 'Current selected value. Returns string[] in multi-select mode.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: '"Select an option"',
    description: 'Placeholder text displayed when no option is selected.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Label text above the select.',
  },
  {
    name: 'options',
    type: 'SelectOption[] | Promise<SelectOption[]>',
    default: '[]',
    description: 'Array of options or Promise that resolves to options. Shows loading skeleton when Promise is pending.',
  },
  {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Whether the select is required for form submission.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the select is disabled.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'false',
    description: 'Show clear button when a value is selected.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Enable multi-select mode. Selected items display as tags.',
  },
  {
    name: 'maxSelections',
    type: 'number',
    default: 'undefined',
    description: 'Maximum number of selections allowed in multi-select mode.',
  },
  {
    name: 'showSelectAll',
    type: 'boolean',
    default: 'false',
    description: 'Show "Select all" / "Clear all" button in multi-select dropdown.',
  },
  {
    name: 'searchable',
    type: 'boolean',
    default: 'false',
    description: 'Transform trigger into text input for filtering options.',
  },
  {
    name: 'creatable',
    type: 'boolean',
    default: 'false',
    description: 'Allow creating new options when searchable and no match exists.',
  },
  {
    name: 'noResultsMessage',
    type: 'string',
    default: '"No results found"',
    description: 'Message shown when filter produces no matches.',
  },
  {
    name: 'customFilter',
    type: '(option, query) => boolean',
    default: 'undefined',
    description: 'Custom filter function to override default contains matching.',
  },
  {
    name: 'debounceDelay',
    type: 'number',
    default: '300',
    description: 'Debounce delay in milliseconds for async search.',
  },
  {
    name: 'minSearchLength',
    type: 'number',
    default: '0',
    description: 'Minimum characters before triggering async search.',
  },
  {
    name: 'asyncSearch',
    type: '(query: string, signal: AbortSignal) => Promise<SelectOption[]>',
    default: 'undefined',
    description: 'Async function called when user types. Receives query and AbortSignal for cancellation.',
  },
  {
    name: 'loadMore',
    type: '() => Promise<SelectOption[]>',
    default: 'undefined',
    description: 'Callback for infinite scroll pagination. Called when scrolling near bottom.',
  },
];

// Props data for lui-option
const optionProps: PropDef[] = [
  {
    name: 'value',
    type: 'string',
    default: '""',
    description: 'The value submitted when this option is selected.',
  },
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Display label (falls back to text content, then value).',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether this option is disabled.',
  },
];

// Props data for lui-option-group
const optionGroupProps: PropDef[] = [
  {
    name: 'label',
    type: 'string',
    default: '""',
    description: 'Label text displayed as the group header.',
  },
];

// Slots data for lui-select
const selectSlots: SlotDef[] = [
  {
    name: 'default',
    description: 'Options (lui-option or lui-option-group elements).',
  },
];

// Slots data for lui-option
const optionSlots: SlotDef[] = [
  {
    name: 'default',
    description: 'Option label text.',
  },
  {
    name: 'start',
    description: 'Content before the label (e.g., icon).',
  },
  {
    name: 'end',
    description: 'Content after the label.',
  },
  {
    name: 'description',
    description: 'Descriptive text below the label.',
  },
];

// CSS Custom Properties data
type CSSVarDef = { name: string; default: string; description: string };
const selectCSSVars: CSSVarDef[] = [
  { name: '--ui-select-radius', default: 'var(--radius-md)', description: 'Border radius of the select trigger.' },
  { name: '--ui-select-border', default: 'var(--color-border)', description: 'Border color.' },
  { name: '--ui-select-border-focus', default: 'var(--color-ring)', description: 'Border color on focus.' },
  { name: '--ui-select-bg', default: 'var(--color-background)', description: 'Background color.' },
  { name: '--ui-select-text', default: 'var(--color-foreground)', description: 'Text color.' },
  { name: '--ui-select-placeholder', default: 'var(--color-muted-foreground)', description: 'Placeholder text color.' },
  { name: '--ui-select-dropdown-shadow', default: 'var(--shadow-md)', description: 'Dropdown shadow.' },
];

// Code examples
const basicCode = `<lui-select label="Country" placeholder="Select a country">
  <lui-option value="us">United States</lui-option>
  <lui-option value="ca">Canada</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
  <lui-option value="au">Australia</lui-option>
</lui-select>`;

const sizesCode = `<lui-select size="sm" placeholder="Small">
  <lui-option value="1">Option 1</lui-option>
  <lui-option value="2">Option 2</lui-option>
</lui-select>
<lui-select size="md" placeholder="Medium">
  <lui-option value="1">Option 1</lui-option>
  <lui-option value="2">Option 2</lui-option>
</lui-select>
<lui-select size="lg" placeholder="Large">
  <lui-option value="1">Option 1</lui-option>
  <lui-option value="2">Option 2</lui-option>
</lui-select>`;

const optionGroupsCode = `<lui-select label="Notification Preference" placeholder="Choose notification type">
  <lui-option-group label="Immediate">
    <lui-option value="push">Push notification</lui-option>
    <lui-option value="sms">SMS</lui-option>
  </lui-option-group>
  <lui-option-group label="Delayed">
    <lui-option value="email">Email</lui-option>
    <lui-option value="digest">Daily digest</lui-option>
  </lui-option-group>
</lui-select>`;

const customContentCode = `<lui-select label="Contact Method" placeholder="Select contact method">
  <lui-option value="email">
    <svg slot="start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 6L12 13 2 6"/>
    </svg>
    Email
    <span slot="description">Receive updates via email</span>
  </lui-option>
  <lui-option value="phone">
    <svg slot="start" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
    Phone
    <span slot="description">Call for urgent matters</span>
  </lui-option>
</lui-select>`;

const clearableCode = `<lui-select label="Country" clearable placeholder="Select a country">
  <lui-option value="us">United States</lui-option>
  <lui-option value="ca">Canada</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
  <lui-option value="au">Australia</lui-option>
</lui-select>`;

const clearableWithGroupsCode = `<lui-select label="Category" clearable placeholder="Select a category">
  <lui-option-group label="Electronics">
    <lui-option value="phones">Phones</lui-option>
    <lui-option value="laptops">Laptops</lui-option>
  </lui-option-group>
  <lui-option-group label="Clothing">
    <lui-option value="shirts">Shirts</lui-option>
    <lui-option value="pants">Pants</lui-option>
  </lui-option-group>
</lui-select>`;

const disabledCode = `<lui-select label="Disabled Select" disabled placeholder="Cannot interact">
  <lui-option value="1">Option 1</lui-option>
</lui-select>
<lui-select label="With Disabled Option" placeholder="Select an option">
  <lui-option value="active">Active option</lui-option>
  <lui-option value="disabled" disabled>Disabled option</lui-option>
  <lui-option value="another">Another option</lui-option>
</lui-select>`;

const requiredCode = `<lui-select label="Required Field" required placeholder="Please select">
  <lui-option value="1">Option 1</lui-option>
  <lui-option value="2">Option 2</lui-option>
</lui-select>`;

// Multi-select examples
const multiSelectBasicCode = `<lui-select label="Skills" multiple placeholder="Select skills">
  <lui-option value="js">JavaScript</lui-option>
  <lui-option value="ts">TypeScript</lui-option>
  <lui-option value="py">Python</lui-option>
  <lui-option value="go">Go</lui-option>
  <lui-option value="rust">Rust</lui-option>
</lui-select>`;

const multiSelectGroupsCode = `<lui-select label="Technologies" multiple placeholder="Select technologies">
  <lui-option-group label="Frontend">
    <lui-option value="react">React</lui-option>
    <lui-option value="vue">Vue</lui-option>
    <lui-option value="svelte">Svelte</lui-option>
  </lui-option-group>
  <lui-option-group label="Backend">
    <lui-option value="node">Node.js</lui-option>
    <lui-option value="django">Django</lui-option>
    <lui-option value="rails">Rails</lui-option>
  </lui-option-group>
</lui-select>`;

const multiSelectAllCode = `<lui-select label="Fruits" multiple showSelectAll placeholder="Select fruits">
  <lui-option value="apple">Apple</lui-option>
  <lui-option value="banana">Banana</lui-option>
  <lui-option value="cherry">Cherry</lui-option>
  <lui-option value="date">Date</lui-option>
  <lui-option value="elderberry">Elderberry</lui-option>
  <lui-option value="fig">Fig</lui-option>
</lui-select>`;

const multiSelectMaxCode = `<lui-select label="Top 3 Colors" multiple maxSelections="3" placeholder="Select up to 3 colors">
  <lui-option value="red">Red</lui-option>
  <lui-option value="blue">Blue</lui-option>
  <lui-option value="green">Green</lui-option>
  <lui-option value="yellow">Yellow</lui-option>
  <lui-option value="purple">Purple</lui-option>
</lui-select>`;

// Combobox examples (Phase 35)
const searchableCode = `<lui-select label="Country" searchable placeholder="Search countries...">
  <lui-option value="us">United States</lui-option>
  <lui-option value="ca">Canada</lui-option>
  <lui-option value="uk">United Kingdom</lui-option>
  <lui-option value="au">Australia</lui-option>
  <lui-option value="de">Germany</lui-option>
  <lui-option value="fr">France</lui-option>
  <lui-option value="jp">Japan</lui-option>
</lui-select>`;

const searchableHighlightCode = `<lui-select label="Fruit" searchable placeholder="Type 'an' to test highlighting...">
  <lui-option value="apple">Apple</lui-option>
  <lui-option value="banana">Banana</lui-option>
  <lui-option value="mango">Mango</lui-option>
  <lui-option value="orange">Orange</lui-option>
  <lui-option value="tangerine">Tangerine</lui-option>
  <lui-option value="cantaloupe">Cantaloupe</lui-option>
</lui-select>`;

const creatableCode = `<lui-select label="Tags" searchable creatable placeholder="Search or create tag...">
  <lui-option value="bug">Bug</lui-option>
  <lui-option value="feature">Feature</lui-option>
  <lui-option value="docs">Documentation</lui-option>
  <lui-option value="help">Help Wanted</lui-option>
</lui-select>`;

const searchableMultiCode = `<lui-select label="Skills" searchable multiple placeholder="Search and select skills...">
  <lui-option value="js">JavaScript</lui-option>
  <lui-option value="ts">TypeScript</lui-option>
  <lui-option value="py">Python</lui-option>
  <lui-option value="go">Go</lui-option>
  <lui-option value="rust">Rust</lui-option>
  <lui-option value="java">Java</lui-option>
  <lui-option value="csharp">C#</lui-option>
  <lui-option value="ruby">Ruby</lui-option>
</lui-select>`;

export function SelectPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
              Select
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              A customizable select dropdown with keyboard navigation, option groups, custom content slots,
              and clearable functionality. Supports form participation via ElementInternals.
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

          {/* 1. Basic Select */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Select</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              A simple select with slotted options. Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-option</code> elements inside the select.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Country" placeholder="Select a country">
                  <lui-option value="us">United States</lui-option>
                  <lui-option value="ca">Canada</lui-option>
                  <lui-option value="uk">United Kingdom</lui-option>
                  <lui-option value="au">Australia</lui-option>
                </lui-select>
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
                  <lui-select size="sm" placeholder="Small">
                    <lui-option value="1">Option 1</lui-option>
                    <lui-option value="2">Option 2</lui-option>
                  </lui-select>
                  <lui-select size="md" placeholder="Medium">
                    <lui-option value="1">Option 1</lui-option>
                    <lui-option value="2">Option 2</lui-option>
                  </lui-select>
                  <lui-select size="lg" placeholder="Large">
                    <lui-option value="1">Option 1</lui-option>
                    <lui-option value="2">Option 2</lui-option>
                  </lui-select>
                </div>
              }
              html={sizesCode}
              react={sizesCode}
              vue={sizesCode}
              svelte={sizesCode}
            />
          </section>

          {/* 3. Option Groups */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Option Groups
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Phase 33</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Group related options using <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">lui-option-group</code>. Groups are visually separated and announced by screen readers.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Notification Preference" placeholder="Choose notification type">
                  <lui-option-group label="Immediate">
                    <lui-option value="push">Push notification</lui-option>
                    <lui-option value="sms">SMS</lui-option>
                  </lui-option-group>
                  <lui-option-group label="Delayed">
                    <lui-option value="email">Email</lui-option>
                    <lui-option value="digest">Daily digest</lui-option>
                  </lui-option-group>
                </lui-select>
              }
              html={optionGroupsCode}
              react={optionGroupsCode}
              vue={optionGroupsCode}
              svelte={optionGroupsCode}
            />
          </section>

          {/* 4. Custom Content with Icons */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Custom Content with Icons
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Phase 33</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">slot="start"</code> for icons and <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">slot="description"</code> for helper text below the label.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Contact Method" placeholder="Select contact method">
                  <lui-option value="email">
                    <span slot="start">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M22 6L12 13 2 6"/>
                      </svg>
                    </span>
                    Email
                    <span slot="description">Receive updates via email</span>
                  </lui-option>
                  <lui-option value="phone">
                    <span slot="start">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    </span>
                    Phone
                    <span slot="description">Call for urgent matters</span>
                  </lui-option>
                </lui-select>
              }
              html={customContentCode}
              react={customContentCode}
              vue={customContentCode}
              svelte={customContentCode}
            />
          </section>

          {/* 5. Clearable Select */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Clearable Select
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Phase 33</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Enable the clear button with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">clearable</code>. Click the X or press Delete/Backspace to clear the selection.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Country" clearable placeholder="Select a country">
                  <lui-option value="us">United States</lui-option>
                  <lui-option value="ca">Canada</lui-option>
                  <lui-option value="uk">United Kingdom</lui-option>
                  <lui-option value="au">Australia</lui-option>
                </lui-select>
              }
              html={clearableCode}
              react={clearableCode}
              vue={clearableCode}
              svelte={clearableCode}
            />
          </section>

          {/* 6. Clearable with Groups */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Clearable with Groups</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Combine clearable with option groups for a full-featured select.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Category" clearable placeholder="Select a category">
                  <lui-option-group label="Electronics">
                    <lui-option value="phones">Phones</lui-option>
                    <lui-option value="laptops">Laptops</lui-option>
                  </lui-option-group>
                  <lui-option-group label="Clothing">
                    <lui-option value="shirts">Shirts</lui-option>
                    <lui-option value="pants">Pants</lui-option>
                  </lui-option-group>
                </lui-select>
              }
              html={clearableWithGroupsCode}
              react={clearableWithGroupsCode}
              vue={clearableWithGroupsCode}
              svelte={clearableWithGroupsCode}
            />
          </section>

          {/* 7. Disabled States */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Disabled States</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Disable the entire select or individual options. Disabled options are skipped during keyboard navigation.
            </p>
            <ExampleBlock
              preview={
                <div className="flex flex-col gap-4">
                  <lui-select label="Disabled Select" disabled placeholder="Cannot interact">
                    <lui-option value="1">Option 1</lui-option>
                  </lui-select>
                  <lui-select label="With Disabled Option" placeholder="Select an option">
                    <lui-option value="active">Active option</lui-option>
                    <lui-option value="disabled" disabled>Disabled option</lui-option>
                    <lui-option value="another">Another option</lui-option>
                  </lui-select>
                </div>
              }
              html={disabledCode}
              react={disabledCode}
              vue={disabledCode}
              svelte={disabledCode}
            />
          </section>

          {/* 8. Required Field */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Field</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Mark fields as required. Validation error shows on blur when no option is selected.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Required Field" required placeholder="Please select">
                  <lui-option value="1">Option 1</lui-option>
                  <lui-option value="2">Option 2</lui-option>
                </lui-select>
              }
              html={requiredCode}
              react={requiredCode}
              vue={requiredCode}
              svelte={requiredCode}
            />
          </section>

          {/* Multi-Select Section Header */}
          <div className="mt-16 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Multi-Select
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">Phase 34</span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select multiple values with tags, overflow handling, and bulk actions</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
          </div>

          {/* 9. Basic Multi-Select */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Multi-Select</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">multiple</code> to enable multi-select.
              Selected items appear as removable tags. Dropdown stays open while selecting.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Skills" multiple placeholder="Select skills">
                  <lui-option value="js">JavaScript</lui-option>
                  <lui-option value="ts">TypeScript</lui-option>
                  <lui-option value="py">Python</lui-option>
                  <lui-option value="go">Go</lui-option>
                  <lui-option value="rust">Rust</lui-option>
                </lui-select>
              }
              html={multiSelectBasicCode}
              react={multiSelectBasicCode}
              vue={multiSelectBasicCode}
              svelte={multiSelectBasicCode}
            />
          </section>

          {/* 10. Multi-Select with Groups */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Multi-Select with Option Groups</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Combine multi-select with option groups for organized selection across categories.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Technologies" multiple placeholder="Select technologies">
                  <lui-option-group label="Frontend">
                    <lui-option value="react">React</lui-option>
                    <lui-option value="vue">Vue</lui-option>
                    <lui-option value="svelte">Svelte</lui-option>
                  </lui-option-group>
                  <lui-option-group label="Backend">
                    <lui-option value="node">Node.js</lui-option>
                    <lui-option value="django">Django</lui-option>
                    <lui-option value="rails">Rails</lui-option>
                  </lui-option-group>
                </lui-select>
              }
              html={multiSelectGroupsCode}
              react={multiSelectGroupsCode}
              vue={multiSelectGroupsCode}
              svelte={multiSelectGroupsCode}
            />
          </section>

          {/* 11. Select All / Clear All */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Select All / Clear All</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">showSelectAll</code> for bulk selection actions.
              The button toggles between "Select all" and "Clear all" based on current selection state.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Fruits" multiple showSelectAll placeholder="Select fruits">
                  <lui-option value="apple">Apple</lui-option>
                  <lui-option value="banana">Banana</lui-option>
                  <lui-option value="cherry">Cherry</lui-option>
                  <lui-option value="date">Date</lui-option>
                  <lui-option value="elderberry">Elderberry</lui-option>
                  <lui-option value="fig">Fig</lui-option>
                </lui-select>
              }
              html={multiSelectAllCode}
              react={multiSelectAllCode}
              vue={multiSelectAllCode}
              svelte={multiSelectAllCode}
            />
          </section>

          {/* 12. Max Selections */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Maximum Selections</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Use <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">maxSelections</code> to limit how many options can be selected.
              "Select all" also respects this limit.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Top 3 Colors" multiple maxSelections={3} placeholder="Select up to 3 colors">
                  <lui-option value="red">Red</lui-option>
                  <lui-option value="blue">Blue</lui-option>
                  <lui-option value="green">Green</lui-option>
                  <lui-option value="yellow">Yellow</lui-option>
                  <lui-option value="purple">Purple</lui-option>
                </lui-select>
              }
              html={multiSelectMaxCode}
              react={multiSelectMaxCode}
              vue={multiSelectMaxCode}
              svelte={multiSelectMaxCode}
            />
          </section>

          {/* Combobox Section Header */}
          <div className="mt-16 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Combobox / Searchable
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">Phase 35</span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type to filter options with match highlighting and creatable mode</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
          </div>

          {/* 13. Basic Searchable */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Searchable Select</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">searchable</code> to enable text input filtering.
              Options filter in real-time as you type.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Country" searchable placeholder="Search countries...">
                  <lui-option value="us">United States</lui-option>
                  <lui-option value="ca">Canada</lui-option>
                  <lui-option value="uk">United Kingdom</lui-option>
                  <lui-option value="au">Australia</lui-option>
                  <lui-option value="de">Germany</lui-option>
                  <lui-option value="fr">France</lui-option>
                  <lui-option value="jp">Japan</lui-option>
                </lui-select>
              }
              html={searchableCode}
              react={searchableCode}
              vue={searchableCode}
              svelte={searchableCode}
            />
          </section>

          {/* 14. Match Highlighting */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Match Highlighting</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Matching text is highlighted in <strong>bold</strong>. Try typing "an" to see ALL occurrences highlighted
              (e.g., both "an"s in "B<strong>an</strong><strong>an</strong>a").
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Fruit" searchable placeholder="Type 'an' to test highlighting...">
                  <lui-option value="apple">Apple</lui-option>
                  <lui-option value="banana">Banana</lui-option>
                  <lui-option value="mango">Mango</lui-option>
                  <lui-option value="orange">Orange</lui-option>
                  <lui-option value="tangerine">Tangerine</lui-option>
                  <lui-option value="cantaloupe">Cantaloupe</lui-option>
                </lui-select>
              }
              html={searchableHighlightCode}
              react={searchableHighlightCode}
              vue={searchableHighlightCode}
              svelte={searchableHighlightCode}
            />
          </section>

          {/* 15. Creatable Mode */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Creatable Mode</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Add <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">creatable</code> to allow creating new options.
              A "Create 'xyz'" option appears when no exact match exists. Listen to the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">create</code> event.
            </p>
            <ExampleBlock
              preview={
                <lui-select
                  label="Tags"
                  searchable
                  creatable
                  placeholder="Search or create tag..."
                  onCreate={(e: CustomEvent) => console.log('onCreate:', e.detail)}
                >
                  <lui-option value="bug">Bug</lui-option>
                  <lui-option value="feature">Feature</lui-option>
                  <lui-option value="docs">Documentation</lui-option>
                  <lui-option value="help">Help Wanted</lui-option>
                </lui-select>
              }
              html={creatableCode}
              react={creatableCode}
              vue={creatableCode}
              svelte={creatableCode}
            />
          </section>

          {/* 16. Searchable Multi-Select */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Searchable Multi-Select</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Combine <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">searchable</code> with <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">multiple</code> for
              searchable multi-select. Selections persist while filtering.
            </p>
            <ExampleBlock
              preview={
                <lui-select label="Skills" searchable multiple placeholder="Search and select skills...">
                  <lui-option value="js">JavaScript</lui-option>
                  <lui-option value="ts">TypeScript</lui-option>
                  <lui-option value="py">Python</lui-option>
                  <lui-option value="go">Go</lui-option>
                  <lui-option value="rust">Rust</lui-option>
                  <lui-option value="java">Java</lui-option>
                  <lui-option value="csharp">C#</lui-option>
                  <lui-option value="ruby">Ruby</lui-option>
                </lui-select>
              }
              html={searchableMultiCode}
              react={searchableMultiCode}
              vue={searchableMultiCode}
              svelte={searchableMultiCode}
            />
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

          {/* lui-select Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-select Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{selectProps.length}</span>
            </div>
            <PropsTable props={selectProps} />
          </div>

          {/* lui-option Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-option Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{optionProps.length}</span>
            </div>
            <PropsTable props={optionProps} />
          </div>

          {/* lui-option-group Props */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-option-group Props</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{optionGroupProps.length}</span>
            </div>
            <PropsTable props={optionGroupProps} />
          </div>

          {/* lui-select Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-select Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{selectSlots.length}</span>
            </div>
            <SlotsTable slots={selectSlots} />
          </div>

          {/* lui-option Slots */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">lui-option Slots</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{optionSlots.length}</span>
            </div>
            <SlotsTable slots={optionSlots} />
          </div>

          {/* CSS Custom Properties */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Custom Properties</h3>
              <span className="px-2.5 py-1 rounded-full bg-gray-900 dark:bg-gray-100 text-xs font-bold text-white dark:text-gray-900">{selectCSSVars.length}</span>
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
                  {selectCSSVars.map((cssVar) => (
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
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">change</code> - Fired when selection changes. <code className="text-xs">event.detail.value</code> contains the new value.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">clear</code> - Fired when selection is cleared via the clear button or keyboard.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <code className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-mono font-medium">create</code> - Fired in creatable mode when user creates a new option. <code className="text-xs">event.detail.value</code> contains the typed text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Navigation */}
        <section className="mb-14 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Keyboard Navigation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full keyboard support following W3C APG patterns</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Key</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Enter</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Open dropdown / Select option and close (single) / Close dropdown (multi)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Space</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Open dropdown / Select option (single) / Toggle selection (multi, stays open)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Down</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Arrow Up</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Navigate through options</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Home</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">End</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Jump to first / last option</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Escape</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Close dropdown</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Delete</kbd> / <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">Backspace</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Clear selection (when clearable)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">A-Z</kbd></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Type-ahead search</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: 'Textarea', href: '/components/textarea' }}
          next={{ title: 'Theme Configurator', href: '/configurator' }}
        />
      </div>
    </FrameworkProvider>
  );
}
