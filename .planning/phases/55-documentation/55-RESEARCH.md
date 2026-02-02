# Phase 55: Documentation - Research

**Researched:** 2026-02-02
**Domain:** Docs site pages (React/Vite), CLI registry verification
**Confidence:** HIGH

## Summary

This phase creates documentation pages for the three overlay components (Tooltip, Popover, Toast) on the existing docs site and verifies the CLI registry is complete at 15 components. The work is pure integration -- no new component code is needed. All patterns are well-established from 12 existing component doc pages.

The CLI registry already contains all 15 components (tooltip, popover, toast were added in phases 52-02, 53-02, 54-02). DOCS-04 is already complete. The remaining work is documentation pages (DOCS-01, DOCS-02, DOCS-03) plus the necessary wiring (routes, nav entries, JSX type declarations, package dependencies).

Each doc page follows an identical structure: `FrameworkProvider` wrapper, header section, interactive examples with `ExampleBlock`, accessibility notes section, CSS custom properties / CSS parts styling sections, API reference with `PropsTable`/`EventsTable`/`SlotsTable`, and `PrevNextNav` footer. Pages are ~500-700 lines of TSX.

**Primary recommendation:** Follow existing doc page patterns exactly (SwitchPage.tsx for simpler components, DialogPage.tsx for overlay components). The toast page is unique in requiring an imperative API documentation section since `toast()` is called from JS, not via HTML markup alone. Add JSX type declarations, routes, nav entries, and package dependencies for all three components.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^18.3.1 | Docs site UI framework | Already used for docs app |
| react-router | ^7.12.0 | Docs page routing | Already configured in App.tsx |
| @lit-ui/tooltip | workspace:* | Tooltip component | Built in Phase 52 |
| @lit-ui/popover | workspace:* | Popover component | Built in Phase 53 |
| @lit-ui/toast | workspace:* | Toast component | Built in Phase 54 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ExampleBlock | local component | Live preview + framework code tabs | Every interactive example |
| PropsTable | local component | Props API reference cards | API Reference section |
| EventsTable | local component | Events API reference cards | Events documentation |
| SlotsTable | local component | Slots API reference cards | Slot documentation |
| CodeBlock | local component | Syntax-highlighted code | CSS vars, JS API examples |
| PrevNextNav | local component | Previous/next page navigation | Footer of every page |

### Alternatives Considered

None. This is pure integration work replicating established patterns.

## Architecture Patterns

### Recommended Project Structure
```
apps/docs/src/
  pages/components/
    TooltipPage.tsx         # NEW - DOCS-02
    PopoverPage.tsx         # NEW - DOCS-03
    ToastPage.tsx           # NEW - DOCS-01
  components/
    LivePreview.tsx         # MODIFY - add JSX types + imports for 3 new elements
  nav.ts                    # MODIFY - add 3 nav entries to Components section
  App.tsx                   # MODIFY - add 3 routes
apps/docs/
  package.json              # MODIFY - add 3 workspace dependencies
```

### Pattern 1: Doc Page Structure (established pattern)
**What:** Every component doc page follows the same TSX structure.
**When to use:** Every component documentation page.
**Example:**
```tsx
// Source: apps/docs/src/pages/components/SwitchPage.tsx (template)
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { EventsTable, type EventDef } from '../../components/EventsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom element
import '@lit-ui/[component]';

// Data arrays: props, events, slots, cssVars, cssParts
// Code string constants for examples

export function [Component]Page() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header */}
        {/* Examples Section with ExampleBlock components */}
        {/* Accessibility Section */}
        {/* Custom Styling Section (CSS vars + CSS parts) */}
        {/* API Reference Section (PropsTable, EventsTable, CSS vars table, CSS parts table) */}
        {/* PrevNextNav footer */}
      </div>
    </FrameworkProvider>
  );
}
```

### Pattern 2: JSX Type Declaration (for React compatibility)
**What:** Custom elements need JSX IntrinsicElements declarations to work in React TSX.
**When to use:** For each new custom element tag used in doc pages.
**Example:**
```tsx
// Source: apps/docs/src/pages/components/DialogPage.tsx
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-tooltip': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          content?: string;
          placement?: string;
          'show-delay'?: number;
          // ... all public properties
        },
        HTMLElement
      >;
    }
  }
}
```

### Pattern 3: Imperative API Documentation (Toast-specific)
**What:** Toast uses an imperative `toast()` function, not just HTML markup. The doc page needs a section showing the JS API with CodeBlock, plus interactive buttons that call `toast()`.
**When to use:** Toast documentation page only.
**Example:**
```tsx
// Toast requires React event handlers to call the imperative API
import { toast } from '@lit-ui/toast';

// In the page component:
<button onClick={() => toast('Hello world')}>Show Toast</button>
<button onClick={() => toast.success('Saved!')}>Success</button>
<button onClick={() => toast.error('Failed')}>Error</button>
```

### Anti-Patterns to Avoid
- **Inconsistent section ordering:** All doc pages must follow the same section order (header, examples, accessibility, styling, API reference, nav)
- **Missing JSX declarations:** Will cause TypeScript compilation errors. Must be declared either in LivePreview.tsx or the page file itself.
- **Forgetting `FrameworkProvider` wrapper:** Every page must wrap content in `FrameworkProvider`.
- **Hardcoded prev/next links that don't account for new pages:** The nav order must be updated, and adjacent pages' PrevNextNav must be updated.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Live previews | Custom preview container | ExampleBlock component | Handles framework tabs, preview styling |
| Props documentation | Manual table HTML | PropsTable component | Consistent styling, animation |
| Events documentation | Manual table HTML | EventsTable component | Consistent styling |
| Code highlighting | Manual pre/code | CodeBlock component | Syntax highlighting via prism-react-renderer |

**Key insight:** Every documentation page component already exists. The task is filling in data, not building UI.

## Common Pitfalls

### Pitfall 1: Missing Package Dependencies
**What goes wrong:** Importing `@lit-ui/tooltip` etc. in the docs app without adding it to `apps/docs/package.json` causes resolution failures.
**Why it happens:** Monorepo may resolve workspace packages implicitly in dev, but builds can fail.
**How to avoid:** Add `"@lit-ui/tooltip": "workspace:*"`, `"@lit-ui/popover": "workspace:*"`, `"@lit-ui/toast": "workspace:*"` to `apps/docs/package.json` dependencies.
**Warning signs:** Build errors mentioning module not found.

### Pitfall 2: Missing LivePreview.tsx Imports
**What goes wrong:** The tooltip/popover/toast custom elements aren't registered when embedded in doc pages.
**Why it happens:** Some pages rely on LivePreview.tsx for element registration as side-effect imports.
**How to avoid:** Add side-effect imports in LivePreview.tsx: `import '@lit-ui/tooltip'`, `import '@lit-ui/popover'`, `import '@lit-ui/toast'`. Also add JSX type declarations for all new element tags.
**Warning signs:** Elements render as empty/unstyled in preview.

### Pitfall 3: Toast Requires Imperative Examples
**What goes wrong:** Toast can't be demonstrated with just HTML markup in ExampleBlock like other components.
**Why it happens:** Toast uses `toast()` function calls, not HTML elements in the preview.
**How to avoid:** Use React button onClick handlers that call `toast()` in the preview prop of ExampleBlock. Show the JS import + function call in the code tabs.
**Warning signs:** Static toast markup won't demonstrate the actual toast flow.

### Pitfall 4: Nav Ordering and PrevNextNav Consistency
**What goes wrong:** New pages are added to nav but adjacent pages' PrevNextNav links aren't updated.
**Why it happens:** Each page hardcodes its prev/next links.
**How to avoid:** When adding Tooltip, Popover, Toast to the nav, update:
  - Time Picker's PrevNextNav to point to Tooltip as next
  - Each new page's PrevNextNav to chain correctly
  - The last new page has no next (or points to a future page)
**Warning signs:** Clicking next/prev on adjacent pages skips or dead-ends.

### Pitfall 5: Popover Interactive Examples Need Click Handling
**What goes wrong:** Popover previews don't work because they need an actual trigger element.
**Why it happens:** Unlike tooltip (hover-based), popover needs a clickable trigger.
**How to avoid:** Use `<lui-popover><button slot="default">Click me</button><div slot="content">Content</div></lui-popover>` pattern in preview JSX.
**Warning signs:** Popover example shows nothing interactive.

## Code Examples

### Tooltip Props Data
```tsx
// Extracted from packages/tooltip/src/tooltip.ts
const tooltipProps: PropDef[] = [
  { name: 'content', type: 'string', default: '""', description: 'Text content for the tooltip.' },
  { name: 'placement', type: 'Placement', default: '"top"', description: 'Preferred placement relative to trigger. Floating UI may flip if space is insufficient.' },
  { name: 'show-delay', type: 'number', default: '300', description: 'Delay in ms before showing tooltip on hover.' },
  { name: 'hide-delay', type: 'number', default: '100', description: 'Delay in ms before hiding tooltip after pointer leaves.' },
  { name: 'arrow', type: 'boolean', default: 'true', description: 'Whether to show an arrow pointing at the trigger.' },
  { name: 'offset', type: 'number', default: '8', description: 'Offset distance from trigger in pixels.' },
  { name: 'rich', type: 'boolean', default: 'false', description: 'Whether this is a rich tooltip with title + description.' },
  { name: 'tooltip-title', type: 'string', default: '""', description: 'Title text for rich tooltip variant.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable tooltip display.' },
];
```

### Tooltip CSS Custom Properties
```tsx
// Extracted from packages/core/src/styles/tailwind.css
const tooltipCSSVars = [
  { name: '--ui-tooltip-bg', default: 'var(--color-foreground)', description: 'Tooltip background color.' },
  { name: '--ui-tooltip-text', default: 'var(--color-background)', description: 'Tooltip text color.' },
  { name: '--ui-tooltip-radius', default: '0.375rem', description: 'Border radius.' },
  { name: '--ui-tooltip-padding-x', default: '0.75rem', description: 'Horizontal padding.' },
  { name: '--ui-tooltip-padding-y', default: '0.375rem', description: 'Vertical padding.' },
  { name: '--ui-tooltip-font-size', default: '0.875rem', description: 'Font size.' },
  { name: '--ui-tooltip-shadow', default: '0 4px 6px -1px rgb(0 0 0 / 0.1)', description: 'Box shadow.' },
  { name: '--ui-tooltip-arrow-size', default: '8px', description: 'Arrow indicator size.' },
  { name: '--ui-tooltip-max-width', default: '20rem', description: 'Maximum width.' },
  { name: '--ui-tooltip-z-index', default: '50', description: 'Z-index stacking order.' },
];
```

### Tooltip CSS Parts
```tsx
// Extracted from packages/tooltip/src/tooltip.ts @csspart annotations
const tooltipParts = [
  { name: 'trigger', description: 'The trigger wrapper element.' },
  { name: 'tooltip', description: 'The tooltip panel.' },
  { name: 'content', description: 'The tooltip content container.' },
  { name: 'arrow', description: 'The arrow indicator.' },
];
```

### Tooltip Slots
```tsx
// Extracted from packages/tooltip/src/tooltip.ts @slot annotations
const tooltipSlots = [
  { name: '(default)', description: 'Default slot for trigger element.' },
  { name: 'content', description: 'Named slot for rich tooltip content (overrides content property).' },
  { name: 'title', description: 'Named slot for rich tooltip title (overrides tooltip-title property).' },
];
```

### Popover Props Data
```tsx
// Extracted from packages/popover/src/popover.ts
const popoverProps: PropDef[] = [
  { name: 'placement', type: 'Placement', default: '"bottom"', description: 'Preferred placement relative to trigger.' },
  { name: 'open', type: 'boolean', default: 'false', description: 'Whether the popover is visible. Set for controlled mode.' },
  { name: 'arrow', type: 'boolean', default: 'false', description: 'Whether to show an arrow pointing at the trigger.' },
  { name: 'modal', type: 'boolean', default: 'false', description: 'Enable modal mode with focus trapping.' },
  { name: 'offset', type: 'number', default: '8', description: 'Offset distance from trigger in pixels.' },
  { name: 'match-trigger-width', type: 'boolean', default: 'false', description: 'Match popover width to trigger width.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable popover interaction.' },
];
```

### Popover Events
```tsx
const popoverEvents: EventDef[] = [
  { name: 'open-changed', detail: '{ open: boolean }', description: 'Fired in controlled mode when open state should change.' },
];
```

### Popover CSS Custom Properties
```tsx
// Extracted from packages/core/src/styles/tailwind.css
const popoverCSSVars = [
  { name: '--ui-popover-bg', default: 'var(--color-card)', description: 'Popover background color.' },
  { name: '--ui-popover-text', default: 'var(--color-card-foreground)', description: 'Popover text color.' },
  { name: '--ui-popover-border', default: 'var(--color-border)', description: 'Popover border color.' },
  { name: '--ui-popover-radius', default: '0.5rem', description: 'Border radius.' },
  { name: '--ui-popover-padding', default: '1rem', description: 'Content padding.' },
  { name: '--ui-popover-shadow', default: '0 10px 15px -3px ...', description: 'Box shadow.' },
  { name: '--ui-popover-arrow-size', default: '8px', description: 'Arrow indicator size.' },
  { name: '--ui-popover-max-width', default: '20rem', description: 'Maximum width.' },
  { name: '--ui-popover-z-index', default: '50', description: 'Z-index stacking order.' },
];
```

### Popover CSS Parts
```tsx
const popoverParts = [
  { name: 'trigger', description: 'The trigger wrapper element.' },
  { name: 'popover', description: 'The popover panel.' },
  { name: 'content', description: 'The popover content container.' },
  { name: 'arrow', description: 'The arrow indicator.' },
];
```

### Popover Slots
```tsx
const popoverSlots = [
  { name: '(default)', description: 'Default slot for trigger element.' },
  { name: 'content', description: 'Named slot for popover body content.' },
];
```

### Toast Imperative API Documentation
```tsx
// The toast API is function-based, not purely element-based
// Must import and call from JS:
import { toast } from '@lit-ui/toast';

// Basic
toast('Hello world');

// Variants
toast.success('Saved!');
toast.error('Something went wrong');
toast.warning('Careful!');
toast.info('FYI...');

// With options
toast('Message', {
  description: 'More details here',
  duration: 8000,
  dismissible: true,
  action: { label: 'Undo', onClick: () => undoAction() },
  position: 'top-right',
});

// Promise toast
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed',
});

// Dismiss
const id = toast('Persistent', { duration: 0 });
toast.dismiss(id);
toast.dismissAll();
```

### Toaster Props Data
```tsx
// Extracted from packages/toast/src/toaster.ts
const toasterProps: PropDef[] = [
  { name: 'position', type: 'ToastPosition', default: '"bottom-right"', description: 'Position of the toast container. Options: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right.' },
  { name: 'max-visible', type: 'number', default: '3', description: 'Maximum number of visible toasts at once.' },
  { name: 'gap', type: 'number', default: '12', description: 'Gap between toasts in pixels.' },
];
```

### Toast CSS Custom Properties
```tsx
// Extracted from packages/core/src/styles/tailwind.css
const toastCSSVars = [
  { name: '--ui-toast-bg', default: 'var(--color-card)', description: 'Toast background color.' },
  { name: '--ui-toast-text', default: 'var(--color-card-foreground)', description: 'Toast text color.' },
  { name: '--ui-toast-border', default: 'var(--color-border)', description: 'Toast border color.' },
  { name: '--ui-toast-radius', default: '0.5rem', description: 'Border radius.' },
  { name: '--ui-toast-padding', default: '1rem', description: 'Toast padding.' },
  { name: '--ui-toast-shadow', default: '0 10px 15px -3px ...', description: 'Box shadow.' },
  { name: '--ui-toast-max-width', default: '24rem', description: 'Maximum width.' },
  { name: '--ui-toast-gap', default: '0.75rem', description: 'Gap between stacked toasts.' },
  { name: '--ui-toast-z-index', default: '50', description: 'Z-index stacking order.' },
  { name: '--ui-toast-success-bg', default: 'oklch(0.25 0.05 150)', description: 'Success variant background.' },
  { name: '--ui-toast-success-border', default: 'oklch(0.45 0.12 150)', description: 'Success variant border.' },
  { name: '--ui-toast-success-icon', default: 'oklch(0.70 0.18 150)', description: 'Success variant icon color.' },
  { name: '--ui-toast-error-bg', default: 'oklch(0.25 0.05 25)', description: 'Error variant background.' },
  { name: '--ui-toast-error-border', default: 'oklch(0.45 0.12 25)', description: 'Error variant border.' },
  { name: '--ui-toast-error-icon', default: 'oklch(0.70 0.18 25)', description: 'Error variant icon color.' },
  { name: '--ui-toast-warning-bg', default: 'oklch(0.25 0.05 85)', description: 'Warning variant background.' },
  { name: '--ui-toast-warning-border', default: 'oklch(0.45 0.12 85)', description: 'Warning variant border.' },
  { name: '--ui-toast-warning-icon', default: 'oklch(0.70 0.18 85)', description: 'Warning variant icon color.' },
  { name: '--ui-toast-info-bg', default: 'oklch(0.25 0.05 250)', description: 'Info variant background.' },
  { name: '--ui-toast-info-border', default: 'oklch(0.45 0.12 250)', description: 'Info variant border.' },
  { name: '--ui-toast-info-icon', default: 'oklch(0.70 0.18 250)', description: 'Info variant icon color.' },
];
```

### Nav Entry Updates
```tsx
// Source: apps/docs/src/nav.ts - Components section
// Add after Time Picker, in alphabetical order:
{ title: "Popover", href: "/components/popover" },
{ title: "Toast", href: "/components/toast" },
{ title: "Tooltip", href: "/components/tooltip" },
// Note: Current list is alphabetical. New entries must maintain alphabetical order:
// Button, Calendar, Checkbox, Date Picker, Date Range Picker, Dialog, Input,
// Popover, Radio, Select, Switch, Textarea, Time Picker, Toast, Tooltip
```

### Route Registrations
```tsx
// Source: apps/docs/src/App.tsx - add routes
import { TooltipPage } from './pages/components/TooltipPage'
import { PopoverPage } from './pages/components/PopoverPage'
import { ToastPage } from './pages/components/ToastPage'

// In Routes:
<Route path="components/tooltip" element={<TooltipPage />} />
<Route path="components/popover" element={<PopoverPage />} />
<Route path="components/toast" element={<ToastPage />} />
```

### JSX Type Declarations for LivePreview.tsx
```tsx
// Add to LivePreview.tsx IntrinsicElements:
'lui-tooltip': React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    content?: string;
    placement?: string;
    'show-delay'?: number;
    'hide-delay'?: number;
    arrow?: boolean;
    offset?: number;
    rich?: boolean;
    'tooltip-title'?: string;
    disabled?: boolean;
  },
  HTMLElement
>;
'lui-popover': React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    placement?: string;
    open?: boolean;
    arrow?: boolean;
    modal?: boolean;
    offset?: number;
    'match-trigger-width'?: boolean;
    disabled?: boolean;
  },
  HTMLElement
>;
'lui-toaster': React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    position?: string;
    'max-visible'?: number;
    gap?: number;
  },
  HTMLElement
>;
'lui-toast': React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    'toast-id'?: string;
    variant?: string;
    'toast-title'?: string;
    description?: string;
    duration?: number;
    dismissible?: boolean;
    position?: string;
  },
  HTMLElement
>;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A | Established doc pattern | Phase 08 onwards | All 12 existing doc pages follow same template |

**Deprecated/outdated:**
- None. The doc site patterns are stable and recently validated in Phase 50.

## DOCS-04 Verification: CLI Registry Already Complete

The CLI registry (`packages/cli/src/registry/registry.json`) already contains 15 component entries:
1. button
2. dialog
3. input
4. textarea
5. select
6. checkbox
7. radio
8. switch
9. calendar
10. date-picker
11. date-range-picker
12. time-picker
13. tooltip (added in Phase 52-02)
14. popover (added in Phase 53-02)
15. toast (added in Phase 54-02)

Copy-source templates are also present in `packages/cli/src/templates/index.ts`.

**DOCS-04 is fully complete. No CLI work is needed in this phase.**

## Files to Modify

### Existing files (modifications)
1. `apps/docs/package.json` - Add 3 workspace dependencies
2. `apps/docs/src/components/LivePreview.tsx` - Add 3 imports + 4 JSX type declarations
3. `apps/docs/src/nav.ts` - Add 3 nav entries (alphabetical order)
4. `apps/docs/src/App.tsx` - Add 3 imports + 3 routes
5. `apps/docs/src/pages/components/TimePickerPage.tsx` - Update PrevNextNav (next = Tooltip)
6. Other adjacent pages' PrevNextNav links as needed

### New files
1. `apps/docs/src/pages/components/TooltipPage.tsx` (~550 lines)
2. `apps/docs/src/pages/components/PopoverPage.tsx` (~550 lines)
3. `apps/docs/src/pages/components/ToastPage.tsx` (~650 lines, larger due to imperative API docs)

## Open Questions

1. **PrevNextNav ordering for new pages**
   - What we know: Nav is alphabetical. Current last component is Time Picker. New pages: Popover, Toast, Tooltip.
   - What's unclear: The exact alphabetical chain. Looking at the full alphabetical list: ...Input, Popover, Radio, Select, Switch, Textarea, Time Picker, Toast, Tooltip. This means Popover inserts between Input and Radio, Toast inserts between Time Picker and Tooltip, and Tooltip is last.
   - Recommendation: Update PrevNextNav for Input (next=Popover), Popover (prev=Input, next=Radio), Radio (prev=Popover), Time Picker (next=Toast), Toast (prev=Time Picker, next=Tooltip), Tooltip (prev=Toast, no next or next=first guide). This is several files to update.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `apps/docs/src/pages/components/SwitchPage.tsx` - 497 lines, complete doc page template
- Codebase analysis: `apps/docs/src/pages/components/DialogPage.tsx` - 599 lines, overlay component doc template
- Codebase analysis: `apps/docs/src/App.tsx` - routing pattern
- Codebase analysis: `apps/docs/src/nav.ts` - navigation structure
- Codebase analysis: `apps/docs/src/components/LivePreview.tsx` - JSX type declaration pattern
- Codebase analysis: `packages/tooltip/src/tooltip.ts` - 9 public properties, 4 CSS parts, 3 slots
- Codebase analysis: `packages/popover/src/popover.ts` - 7 public properties, 4 CSS parts, 2 slots, 1 event
- Codebase analysis: `packages/toast/src/api.ts` - imperative API: toast(), toast.success/error/warning/info/dismiss/dismissAll/promise
- Codebase analysis: `packages/toast/src/toast.ts` - individual toast element, 9 properties
- Codebase analysis: `packages/toast/src/toaster.ts` - container element, 3 properties
- Codebase analysis: `packages/core/src/styles/tailwind.css` - all CSS custom properties for tooltip, popover, toast
- Codebase analysis: `packages/cli/src/registry/registry.json` - 15 components confirmed

### Secondary (MEDIUM confidence)
- Phase 50 research: `.planning/phases/50-documentation/50-RESEARCH.md` - established patterns, validated approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - identical to previous doc phases, all verified in codebase
- Architecture: HIGH - replicating exact established patterns from 12 existing pages
- Pitfalls: HIGH - identified from codebase analysis and Phase 50 experience

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (stable patterns, no external dependencies)
