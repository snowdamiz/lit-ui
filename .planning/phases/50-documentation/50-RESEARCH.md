# Phase 50: Documentation - Research

**Researched:** 2026-02-02
**Domain:** Docs site pages (React/Vite), CLI registry integration, accessibility documentation
**Confidence:** HIGH

## Summary

This phase documents all date/time components (Date Picker, Date Range Picker, Time Picker) on the existing docs site, adds CLI registry entries, and creates cross-cutting documentation for accessibility, form integration, and internationalization. The Calendar component already has a documentation page (`CalendarPage.tsx`) that serves as the primary template.

The work is integration-only -- no new component code is needed. All patterns are well-established from 9 existing component doc pages (Button, Calendar, Checkbox, Dialog, Input, Radio, Select, Switch, Textarea). Each doc page follows an identical structure: header, interactive examples with `ExampleBlock`, accessibility section, CSS custom properties, API reference with `PropsTable`/`EventsTable`, and `PrevNextNav` footer.

The CLI needs three new entries in `registry.json` and three new mappings in `install-component.ts`. The docs site needs new page files, route registrations in `App.tsx`, and nav entries in `nav.ts`. JSX type declarations for the new elements must be added to `LivePreview.tsx` for the docs site to compile.

**Primary recommendation:** Follow the CalendarPage.tsx template exactly for all doc pages. Use the established ExampleBlock/PropsTable/EventsTable/CodeBlock components. Add JSX types to LivePreview.tsx for new elements before creating pages.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.3.1 | Docs site UI framework | Already used for docs app |
| react-router | ^7.12.0 | Docs page routing | Already configured in App.tsx |
| @lit-ui/date-picker | workspace:* | Date picker component | Built in Phases 44-45 |
| @lit-ui/date-range-picker | workspace:* | Date range picker component | Built in Phases 46-47 |
| @lit-ui/time-picker | workspace:* | Time picker component | Built in Phases 48-49 |
| @lit-ui/calendar | workspace:* | Calendar display component | Built in Phases 42-43, already documented |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ExampleBlock | local | Live preview + framework code tabs | Every interactive example |
| PropsTable | local | Props API reference cards | API Reference section |
| EventsTable | local | Events API reference cards | Events documentation |
| SlotsTable | local | Slots API reference cards | If components have slots |
| CodeBlock | local | Syntax-highlighted code | CSS custom properties, standalone code |
| FrameworkTabs | local | HTML/React/Vue/Svelte tabs | Used inside ExampleBlock |
| PrevNextNav | local | Previous/next page navigation | Footer of every page |

### Alternatives Considered

None. This is pure integration work replicating established patterns.

## Architecture Patterns

### Recommended Project Structure
```
apps/docs/src/
  pages/components/
    DatePickerPage.tsx         # NEW - Plan 50-02
    DateRangePickerPage.tsx    # NEW - Plan 50-03
    TimePickerPage.tsx         # NEW - Plan 50-04
  pages/
    FormIntegrationGuide.tsx   # NEW - Plan 50-07 (guide page)
    AccessibilityGuide.tsx     # NEW - Plan 50-06 (guide page)
    I18nGuide.tsx              # NEW - Plan 50-08 (guide page)
  components/
    LivePreview.tsx            # MODIFY - add JSX types for new elements
  nav.ts                       # MODIFY - add new nav entries
  App.tsx                      # MODIFY - add new routes

packages/cli/src/
  registry/registry.json       # MODIFY - add 3 component entries
  utils/install-component.ts   # MODIFY - add 3 package mappings
```

### Pattern 1: Doc Page Structure (from CalendarPage.tsx)
**What:** Every component doc page follows the same structure: FrameworkProvider wrapper, header, examples section with ExampleBlock components, accessibility section, CSS custom properties section, API reference with PropsTable/EventsTable, and PrevNextNav footer.
**When to use:** Every component documentation page.
**Example:**
```tsx
// Source: apps/docs/src/pages/components/CalendarPage.tsx
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom element
import '@lit-ui/date-picker';

const props: PropDef[] = [
  { name: 'value', type: 'string', default: '""', description: 'Selected date as ISO string (YYYY-MM-DD).' },
  // ...
];

export function DatePickerPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          {/* blur background circle */}
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight ...">Date Picker</h1>
            <p className="text-lg text-gray-500 ...">Description here.</p>
          </div>
        </header>

        {/* Examples */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          {/* Section heading with icon */}
          <ExampleBlock
            preview={<lui-date-picker></lui-date-picker>}
            html={basicCode}
            react={basicCode}
            vue={basicCode}
            svelte={basicCode}
          />
          {/* ... more examples ... */}
        </div>

        {/* API Reference */}
        <section className="mt-20 mb-14 animate-fade-in-up opacity-0 stagger-3">
          <PropsTable props={props} />
          <EventsTable events={events} />
        </section>

        <PrevNextNav
          prev={{ title: 'Calendar', href: '/components/calendar' }}
          next={{ title: 'Date Range Picker', href: '/components/date-range-picker' }}
        />
      </div>
    </FrameworkProvider>
  );
}
```

### Pattern 2: ExampleBlock with Framework Variants
**What:** Each example provides code for HTML, React, Vue, and Svelte. For JS-only properties (like `presets`, `disabledDates`), each framework gets distinct code showing the idiomatic way to set that property.
**When to use:** Any example that involves JS-only properties or event handlers.
**Example:**
```tsx
// HTML variant for JS-only properties
const presetsHtml = `<lui-date-picker id="dp" label="Date"></lui-date-picker>
<script>
  document.getElementById('dp').presets = true;
</script>`;

// React variant
const presetsReact = `<lui-date-picker
  label="Date"
  ref={(el) => { if (el) el.presets = true; }}
/>`;

// Vue variant
const presetsVue = `<template>
  <lui-date-picker ref="dp" label="Date" />
</template>
<script setup>
import { ref, onMounted } from 'vue';
const dp = ref(null);
onMounted(() => { dp.value.presets = true; });
</script>`;

// Svelte variant
const presetsSvelte = `<script>
  let dp;
  $: if (dp) { dp.presets = true; }
</script>
<lui-date-picker bind:this={dp} label="Date" />`;
```

### Pattern 3: CLI Registry Entry
**What:** Each component gets a JSON entry in registry.json listing its files, npm dependencies, and internal registry dependencies.
**When to use:** For every CLI-installable component.
**Example:**
```json
{
  "name": "date-picker",
  "description": "Accessible date picker with calendar popup, text input parsing, and form participation",
  "files": [
    { "path": "components/date-picker/date-picker.ts", "type": "component" },
    { "path": "components/date-picker/date-input-parser.ts", "type": "component" },
    { "path": "components/date-picker/natural-language.ts", "type": "component" },
    { "path": "components/date-picker/preset-types.ts", "type": "component" }
  ],
  "dependencies": ["date-fns", "@floating-ui/dom"],
  "registryDependencies": ["calendar"]
}
```

### Pattern 4: Navigation and Routing Registration
**What:** New pages need entries in `nav.ts` (sidebar), imports + Route elements in `App.tsx`.
**When to use:** For every new page.
**Example:**
```ts
// nav.ts - add to Components section, alphabetical order
{ title: "Date Picker", href: "/components/date-picker" },
{ title: "Date Range Picker", href: "/components/date-range-picker" },
{ title: "Time Picker", href: "/components/time-picker" },
```

### Pattern 5: JSX Type Declarations in LivePreview.tsx
**What:** Custom elements used in doc page previews need JSX type declarations in `LivePreview.tsx` (where all component imports are centralized).
**When to use:** Before creating any doc page that renders the new elements.
**Example:**
```tsx
// Add to LivePreview.tsx imports
import '@lit-ui/date-picker';
import '@lit-ui/date-range-picker';
import '@lit-ui/time-picker';

// Add to IntrinsicElements in the global JSX declaration
'lui-date-picker': React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    value?: string;
    name?: string;
    locale?: string;
    placeholder?: string;
    label?: string;
    'helper-text'?: string;
    'min-date'?: string;
    'max-date'?: string;
    required?: boolean;
    disabled?: boolean;
    inline?: boolean;
    error?: string;
  },
  HTMLElement
>;
```

### Anti-Patterns to Avoid
- **Creating doc pages before adding JSX types:** The docs site will fail to compile if custom elements are used in JSX without type declarations in LivePreview.tsx.
- **Importing components in individual page files without side-effect import:** Each page must have `import '@lit-ui/date-picker';` to register the custom element.
- **Using CalendarPage structure for guide pages:** The three guide pages (accessibility, form integration, i18n) are NOT component pages. They should follow a guide/prose structure more similar to StylingPage.tsx or SSRGuide.tsx, not the component page pattern.
- **Duplicating CSS custom property tables manually:** Extract from the component source files' `static styles` to ensure accuracy.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Code syntax highlighting | Custom highlighter | Existing `CodeBlock` component | Already handles all languages |
| Framework-specific code tabs | Tab component | Existing `FrameworkTabs` via `ExampleBlock` | Already handles HTML/React/Vue/Svelte |
| Props documentation cards | Custom table | Existing `PropsTable` component | Consistent styling across all pages |
| Events documentation cards | Custom table | Existing `EventsTable` component | Consistent styling across all pages |
| Live component preview | iframe/sandbox | Direct custom element rendering in JSX | Already works -- elements self-register |
| Navigation ordering | Manual prev/next | `PrevNextNav` with href to adjacent components | Consistent navigation pattern |

**Key insight:** The docs site infrastructure is mature with 9 existing component pages. The reusable components (ExampleBlock, PropsTable, EventsTable, CodeBlock, etc.) handle all presentation concerns. Doc pages are purely data-driven: define props array, code strings, and JSX previews.

## Common Pitfalls

### Pitfall 1: Missing JSX Type Declarations
**What goes wrong:** TypeScript compilation fails when using `<lui-date-picker>` in JSX without global IntrinsicElements declaration.
**Why it happens:** Custom elements are not known to TypeScript's JSX type system by default.
**How to avoid:** Add JSX type declarations to `LivePreview.tsx` for all three new elements BEFORE creating any doc pages. Each package has a `jsx.d.ts` file with the exact types to reference.
**Warning signs:** TypeScript errors like "Property 'lui-date-picker' does not exist on type 'JSX.IntrinsicElements'".

### Pitfall 2: CLI Registry Dependencies
**What goes wrong:** `lui add date-picker` installs the component but it fails at runtime because the calendar dependency is missing.
**Why it happens:** Date picker and date range picker both depend on `@lit-ui/calendar` (imported in their index.ts). The registry entry must list "calendar" in `registryDependencies`.
**How to avoid:** Check each component's `index.ts` for `import '@lit-ui/calendar'` or similar dependency imports. Map these to `registryDependencies`.
**Warning signs:** "Undefined custom element" errors when using the installed component.

### Pitfall 3: Incorrect npm Dependencies for CLI
**What goes wrong:** Components fail to build because `date-fns` or `@floating-ui/dom` are missing.
**Why it happens:** Date picker, date range picker, and time picker all import from `date-fns` and `@floating-ui/dom` in their source code.
**How to avoid:** List external npm dependencies in the registry `dependencies` array:
- `date-picker`: `["date-fns", "@floating-ui/dom"]`
- `date-range-picker`: `["date-fns", "@floating-ui/dom"]`
- `time-picker`: `["@floating-ui/dom"]` (time-picker uses date-fns only through calendar re-exports)
**Warning signs:** Module not found errors at build time.

### Pitfall 4: Navigation Order Inconsistency
**What goes wrong:** PrevNextNav links point to wrong pages or skip components.
**Why it happens:** New components are inserted into the alphabetical nav list, changing the prev/next relationships for existing pages.
**How to avoid:** Plan the full alphabetical navigation order first, then update ALL affected PrevNextNav components. The new order would be: Button, Calendar, Checkbox, Date Picker, Date Range Picker, Dialog, Input, Radio, Select, Switch, Textarea, Time Picker. This means CalendarPage, CheckboxPage, DialogPage, and InputPage all need their PrevNextNav updated.
**Warning signs:** Clicking "Next" on Calendar page skips Date Picker.

### Pitfall 5: Guide Pages in Wrong Location
**What goes wrong:** Accessibility, form integration, and i18n guide pages are placed in `pages/components/` instead of `pages/` (or `pages/guides/`).
**Why it happens:** Confusion between component-specific docs and cross-cutting guides.
**How to avoid:** Guide pages go in `pages/` or `pages/guides/` directory. They get nav entries in a "Guides" section, not "Components". The existing nav already has a "Guides" section with Styling, SSR, Migration, Agent Skills.
**Warning signs:** Guide pages appearing in the Components nav section.

### Pitfall 6: install-component.ts Missing Mappings
**What goes wrong:** `lui add date-picker` says "Unknown component" even though registry.json has the entry.
**Why it happens:** The `componentToPackage` map in `install-component.ts` is separate from `registry.json` and must be updated independently.
**How to avoid:** Add entries to BOTH `registry.json` AND `install-component.ts` for each new component.
**Warning signs:** CLI `add` command fails but `list` command shows the component.

## Code Examples

### Date Picker Props Array (for PropsTable)
```tsx
// Source: packages/date-picker/src/date-picker.ts (extracted from @property decorators)
const datePickerProps: PropDef[] = [
  { name: 'value', type: 'string', default: '""', description: 'Selected date as ISO 8601 string (YYYY-MM-DD).' },
  { name: 'name', type: 'string', default: '""', description: 'Form field name for form submission.' },
  { name: 'locale', type: 'string', default: 'navigator.language', description: 'BCP 47 locale tag for localization.' },
  { name: 'placeholder', type: 'string', default: 'locale-aware', description: 'Custom placeholder text for the input.' },
  { name: 'helper-text', type: 'string', default: '""', description: 'Helper text displayed below the input.' },
  { name: 'min-date', type: 'string', default: '""', description: 'Minimum selectable date as ISO string.' },
  { name: 'max-date', type: 'string', default: '""', description: 'Maximum selectable date as ISO string.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Whether a date is required for form submission.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Whether the date picker is disabled.' },
  { name: 'inline', type: 'boolean', default: 'false', description: 'Render calendar inline without popup.' },
  { name: 'error', type: 'string', default: '""', description: 'External error message overriding internal validation.' },
  { name: 'label', type: 'string', default: '""', description: 'Accessible label for the input field.' },
  { name: 'presets', type: 'DatePreset[] | boolean', default: 'false', description: 'Preset buttons for quick date selection (JS property).' },
  { name: 'format', type: 'Intl.DateTimeFormatOptions | null', default: 'null', description: 'Custom display format options (JS property).' },
];
```

### Date Range Picker Props Array
```tsx
// Source: packages/date-range-picker/src/date-range-picker.ts
const dateRangePickerProps: PropDef[] = [
  { name: 'start-date', type: 'string', default: '""', description: 'Selected start date as ISO 8601 string.' },
  { name: 'end-date', type: 'string', default: '""', description: 'Selected end date as ISO 8601 string.' },
  { name: 'name', type: 'string', default: '""', description: 'Form field name for submission.' },
  { name: 'locale', type: 'string', default: 'navigator.language', description: 'BCP 47 locale tag.' },
  { name: 'placeholder', type: 'string', default: '""', description: 'Custom placeholder text.' },
  { name: 'label', type: 'string', default: '""', description: 'Accessible label.' },
  { name: 'helper-text', type: 'string', default: '""', description: 'Helper text below the input.' },
  { name: 'min-date', type: 'string', default: '""', description: 'Minimum selectable date.' },
  { name: 'max-date', type: 'string', default: '""', description: 'Maximum selectable date.' },
  { name: 'min-days', type: 'number', default: '0', description: 'Minimum range duration in days.' },
  { name: 'max-days', type: 'number', default: '0', description: 'Maximum range duration in days (0 = unlimited).' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Whether range selection is required.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Whether the picker is disabled.' },
  { name: 'error', type: 'string', default: '""', description: 'External error message.' },
  { name: 'comparison', type: 'boolean', default: 'false', description: 'Enable comparison mode for two date ranges.' },
  { name: 'compare-start-date', type: 'string', default: '""', description: 'Comparison range start date.' },
  { name: 'compare-end-date', type: 'string', default: '""', description: 'Comparison range end date.' },
  { name: 'presets', type: 'DateRangePreset[] | boolean', default: 'false', description: 'Preset range buttons (JS property).' },
];
```

### Time Picker Props Array
```tsx
// Source: packages/time-picker/src/time-picker.ts
const timePickerProps: PropDef[] = [
  { name: 'value', type: 'string', default: '""', description: 'Selected time as ISO 8601 string (HH:mm:ss).' },
  { name: 'name', type: 'string', default: '""', description: 'Form field name.' },
  { name: 'label', type: 'string', default: '""', description: 'Accessible label text.' },
  { name: 'placeholder', type: 'string', default: '"Select time"', description: 'Placeholder text.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Whether time selection is required.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Whether the picker is disabled.' },
  { name: 'readonly', type: 'boolean', default: 'false', description: 'Whether the picker is readonly.' },
  { name: 'hour12', type: 'boolean | undefined', default: 'auto-detect', description: 'Display in 12-hour format with AM/PM.' },
  { name: 'locale', type: 'string', default: '"en-US"', description: 'BCP 47 locale tag.' },
  { name: 'step', type: 'number', default: '30', description: 'Interval in minutes between dropdown options.' },
  { name: 'min-time', type: 'string', default: '""', description: 'Minimum selectable time (HH:mm or HH:mm:ss).' },
  { name: 'max-time', type: 'string', default: '""', description: 'Maximum selectable time.' },
  { name: 'allow-overnight', type: 'boolean', default: 'false', description: 'Allow midnight-crossing validation.' },
  { name: 'show-timezone', type: 'boolean', default: 'false', description: 'Display timezone label.' },
  { name: 'timezone', type: 'string', default: 'local', description: 'IANA timezone identifier.' },
  { name: 'voice', type: 'boolean', default: 'false', description: 'Enable voice input button.' },
  { name: 'interface-mode', type: '"clock" | "dropdown" | "both" | "wheel" | "range"', default: '"both"', description: 'Which popup interface to show.' },
  { name: 'presets', type: 'TimePreset[] | boolean', default: 'false', description: 'Preset time buttons (JS property).' },
  { name: 'businessHours', type: '{ start: number; end: number } | false', default: 'false', description: 'Business hours range for visual highlighting (JS property).' },
  { name: 'additionalTimezones', type: 'string[]', default: '[]', description: 'Additional IANA timezones for comparison (JS property).' },
];
```

### CLI Registry Entries
```json
// Add to packages/cli/src/registry/registry.json components array
{
  "name": "date-picker",
  "description": "Accessible date picker with calendar popup, text input parsing, and form participation",
  "files": [
    { "path": "components/date-picker/date-picker.ts", "type": "component" },
    { "path": "components/date-picker/date-input-parser.ts", "type": "component" },
    { "path": "components/date-picker/natural-language.ts", "type": "component" },
    { "path": "components/date-picker/preset-types.ts", "type": "component" }
  ],
  "dependencies": ["date-fns", "@floating-ui/dom"],
  "registryDependencies": ["calendar"]
},
{
  "name": "date-range-picker",
  "description": "Accessible date range picker with dual calendars, comparison mode, and ISO 8601 interval submission",
  "files": [
    { "path": "components/date-range-picker/date-range-picker.ts", "type": "component" },
    { "path": "components/date-range-picker/range-utils.ts", "type": "component" },
    { "path": "components/date-range-picker/range-preset-types.ts", "type": "component" }
  ],
  "dependencies": ["date-fns", "@floating-ui/dom"],
  "registryDependencies": ["calendar"]
},
{
  "name": "time-picker",
  "description": "Accessible time picker with clock face, dropdown, voice input, and timezone support",
  "files": [
    { "path": "components/time-picker/time-picker.ts", "type": "component" },
    { "path": "components/time-picker/time-input.ts", "type": "component" },
    { "path": "components/time-picker/clock-face.ts", "type": "component" },
    { "path": "components/time-picker/time-dropdown.ts", "type": "component" },
    { "path": "components/time-picker/time-utils.ts", "type": "component" },
    { "path": "components/time-picker/time-presets.ts", "type": "component" },
    { "path": "components/time-picker/timezone-display.ts", "type": "component" },
    { "path": "components/time-picker/time-range-slider.ts", "type": "component" },
    { "path": "components/time-picker/time-scroll-wheel.ts", "type": "component" },
    { "path": "components/time-picker/time-voice-input.ts", "type": "component" }
  ],
  "dependencies": ["@floating-ui/dom"],
  "registryDependencies": ["calendar"]
}
```

### install-component.ts Additions
```ts
// Add to componentToPackage map in packages/cli/src/utils/install-component.ts
'date-picker': '@lit-ui/date-picker',
'date-range-picker': '@lit-ui/date-range-picker',
'time-picker': '@lit-ui/time-picker',
```

### Navigation Order (Complete)
```ts
// nav.ts Components section - alphabetical with new entries
{ title: "Button", href: "/components/button" },
{ title: "Calendar", href: "/components/calendar" },
{ title: "Checkbox", href: "/components/checkbox" },
{ title: "Date Picker", href: "/components/date-picker" },
{ title: "Date Range Picker", href: "/components/date-range-picker" },
{ title: "Dialog", href: "/components/dialog" },
{ title: "Input", href: "/components/input" },
{ title: "Radio", href: "/components/radio" },
{ title: "Select", href: "/components/select" },
{ title: "Switch", href: "/components/switch" },
{ title: "Textarea", href: "/components/textarea" },
{ title: "Time Picker", href: "/components/time-picker" },
```

### Guide Navigation Entries
```ts
// nav.ts Guides section additions
{ title: "Accessibility", href: "/guides/accessibility" },
{ title: "Form Integration", href: "/guides/form-integration" },
{ title: "Internationalization", href: "/guides/i18n" },
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manually typed JSX declarations per page | Centralized in LivePreview.tsx | Phase 08 | All elements declared once |
| Component-specific page structures | Shared components (ExampleBlock, PropsTable) | Phase 06 | Consistent look across all pages |

**Deprecated/outdated:**
- None relevant. The docs infrastructure is stable and current.

## Open Questions

1. **Time Picker sub-component documentation scope**
   - What we know: Time picker has 7 sub-components (TimeInput, ClockFace, TimeDropdown, TimezoneDisplay, TimeRangeSlider, TimeScrollWheel, TimeVoiceInput). Some are exported as public API (TimezoneDisplay, TimeRangeSlider, TimeScrollWheel, TimeVoiceInput).
   - What's unclear: Should publicly exported sub-components get their own props documentation within the TimePicker page, or just brief mentions?
   - Recommendation: Include a "Sub-Components" section in the TimePicker page documenting the 4 exported components briefly, since they are part of the public API per Phase 43-08 decisions.

2. **Calendar page updates needed**
   - What we know: CalendarPage.tsx already exists and documents the basic calendar. It was created before Phases 42-43 added advanced features (gesture navigation, animation controller, etc.).
   - What's unclear: Whether Phase 42-43 features are already documented on CalendarPage or need additions.
   - Recommendation: Plan 50-01 should audit CalendarPage.tsx and add any missing advanced features from Phases 42-43.

3. **Guide page structure template**
   - What we know: Existing guide pages (StylingPage, SSRGuide, MigrationGuide) exist but were not examined in detail.
   - What's unclear: Exact structure/components used in guide pages vs component pages.
   - Recommendation: Planner should reference StylingPage.tsx or SSRGuide.tsx as the template for guide-style pages (50-06, 50-07, 50-08).

## Sources

### Primary (HIGH confidence)
- `apps/docs/src/pages/components/CalendarPage.tsx` - Complete doc page template
- `apps/docs/src/nav.ts` - Navigation structure
- `apps/docs/src/App.tsx` - Route configuration
- `apps/docs/src/components/LivePreview.tsx` - JSX type declarations
- `packages/cli/src/registry/registry.json` - CLI registry format
- `packages/cli/src/utils/install-component.ts` - Component-to-package mapping
- `packages/date-picker/src/date-picker.ts` - All @property decorators (14 props)
- `packages/date-range-picker/src/date-range-picker.ts` - All @property decorators (18 props)
- `packages/time-picker/src/time-picker.ts` - All @property decorators (20 props)
- `packages/*/src/jsx.d.ts` - JSX type declarations for reference
- `packages/*/src/index.ts` - Export surfaces and registration patterns
- `.planning/phases/41-cli-and-documentation/41-RESEARCH.md` - Prior docs phase pattern

### Secondary (MEDIUM confidence)
- None needed. All patterns are established in the codebase.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - 9 existing component pages establish the exact pattern
- Pitfalls: HIGH - Derived from actual code inspection of imports, types, and registration
- CLI integration: HIGH - Registry format and install-component.ts patterns are explicit

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (stable infrastructure, no expected changes)
