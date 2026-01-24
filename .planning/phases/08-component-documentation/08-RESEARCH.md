# Phase 8: Component Documentation - Research

**Researched:** 2026-01-24
**Domain:** Component documentation pages (API reference, live examples, framework tabs)
**Confidence:** HIGH

## Summary

This phase creates dedicated documentation pages for Button and Dialog components, building on existing infrastructure from Phases 6-7. The docs site already has CodeBlock, FrameworkTabs, and LivePreview components. The main work is: (1) extending FrameworkTabs to include HTML tab with page-level persistence, (2) creating a reusable Example component that pairs live demos with framework-tabbed code, (3) building API reference sections with props tables, and (4) composing full documentation pages.

Research confirms the existing stack (prism-react-renderer for syntax highlighting, React context for state sharing) is well-suited for this phase. The key decisions around API reference format and example layout are within Claude's discretion but should follow industry patterns from shadcn/ui and Radix primitives.

**Primary recommendation:** Create an ExampleBlock component that combines LivePreview with FrameworkTabs, use React Context for framework tab persistence across all examples on a page, and document props/slots/events in clear tables organized by category.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| prism-react-renderer | ^2.x | Syntax highlighting | Already in use from Phase 7, consistent theming |
| lucide-react | ^0.469.0 | Icons | Already installed, copy button icons |
| react-router | ^7.12.0 | Routing | Already in use, NavLink for prev/next navigation |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Context | Built-in | Tab persistence | Share selected framework across page |
| Native Clipboard API | Built-in | Copy to clipboard | Already used in CodeBlock |

### No New Dependencies Required
This phase builds entirely on Phase 6-7 infrastructure. No new npm packages needed.

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Recommended Project Structure
```
docs/src/
├── components/
│   ├── CodeBlock.tsx          # Existing - syntax highlighting + copy
│   ├── FrameworkTabs.tsx      # Extend: add HTML tab, use context
│   ├── LivePreview.tsx        # Extend: parameterized for any demo
│   ├── ExampleBlock.tsx       # NEW: combines demo + code tabs
│   ├── PropsTable.tsx         # NEW: API reference table
│   └── PrevNextNav.tsx        # NEW: bottom navigation links
├── contexts/
│   └── FrameworkContext.tsx   # NEW: tab persistence context
├── lib/
│   ├── ui-button/             # Existing - Button component for preview
│   └── ui-dialog/             # NEW: Dialog component for preview
└── pages/
    ├── components/
    │   ├── ButtonPage.tsx     # NEW: Button documentation
    │   └── DialogPage.tsx     # NEW: Dialog documentation
    └── GettingStarted.tsx     # Existing
```

### Pattern 1: Framework Context for Tab Persistence
**What:** React Context that stores and shares selected framework across all examples
**When to use:** Every FrameworkTabs and ExampleBlock component
**Example:**
```tsx
// contexts/FrameworkContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Framework = 'html' | 'react' | 'vue' | 'svelte';

interface FrameworkContextValue {
  framework: Framework;
  setFramework: (fw: Framework) => void;
}

const FrameworkContext = createContext<FrameworkContextValue | undefined>(undefined);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [framework, setFramework] = useState<Framework>('html');

  return (
    <FrameworkContext.Provider value={{ framework, setFramework }}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used within FrameworkProvider');
  }
  return context;
}
```

### Pattern 2: ExampleBlock Component (Demo + Code)
**What:** Reusable component that pairs a live demo with framework-tabbed code
**When to use:** Every example section on component pages
**Example:**
```tsx
// components/ExampleBlock.tsx
interface ExampleBlockProps {
  title?: string;
  description?: string;
  preview: ReactNode;      // The live demo
  html: string;
  react: string;
  vue: string;
  svelte: string;
}

export function ExampleBlock({
  title,
  description,
  preview,
  html,
  react,
  vue,
  svelte,
}: ExampleBlockProps) {
  return (
    <div className="my-8">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}

      {/* Side by side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Live preview - left side */}
        <div className="flex-1 p-6 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center min-h-[120px]">
          {preview}
        </div>

        {/* Code tabs - right side */}
        <div className="flex-1">
          <FrameworkTabs html={html} react={react} vue={vue} svelte={svelte} />
        </div>
      </div>
    </div>
  );
}
```

### Pattern 3: Props Table Component
**What:** Styled table for documenting component props
**When to use:** API reference section of each component page
**Example:**
```tsx
// components/PropsTable.tsx
interface PropDef {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  props: PropDef[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold">Prop</th>
            <th className="text-left py-3 px-4 font-semibold">Type</th>
            <th className="text-left py-3 px-4 font-semibold">Default</th>
            <th className="text-left py-3 px-4 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-sm text-primary">
                {prop.name}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-gray-600">
                {prop.type}
              </td>
              <td className="py-3 px-4 font-mono text-sm text-gray-500">
                {prop.default ?? '—'}
              </td>
              <td className="py-3 px-4 text-gray-700">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Pattern 4: Component Page Structure
**What:** Consistent page layout for all component documentation
**When to use:** ButtonPage, DialogPage, and future component pages
**Example:**
```tsx
function ButtonPage() {
  return (
    <FrameworkProvider>
      <article className="prose prose-gray max-w-none">
        {/* Header */}
        <header className="mb-12">
          <h1>Button</h1>
          <p className="lead">
            A customizable button with multiple variants and sizes.
          </p>
        </header>

        {/* Hero Example (optional) */}
        <ExampleBlock
          preview={<ui-button variant="primary">Click me</ui-button>}
          html={`<ui-button variant="primary">Click me</ui-button>`}
          react={`<ui-button variant="primary">Click me</ui-button>`}
          vue={`<ui-button variant="primary">Click me</ui-button>`}
          svelte={`<ui-button variant="primary">Click me</ui-button>`}
        />

        {/* Examples Section */}
        <section id="examples" className="scroll-mt-20">
          <h2>Examples</h2>
          {/* Multiple ExampleBlock components */}
        </section>

        {/* API Reference */}
        <section id="api" className="scroll-mt-20">
          <h2>API Reference</h2>

          <h3>Props</h3>
          <PropsTable props={buttonProps} />

          <h3>Slots</h3>
          <SlotsTable slots={buttonSlots} />

          <h3>Events</h3>
          <EventsTable events={buttonEvents} />
        </section>

        {/* Prev/Next Navigation */}
        <PrevNextNav
          prev={{ title: 'Getting Started', href: '/getting-started' }}
          next={{ title: 'Dialog', href: '/components/dialog' }}
        />
      </article>
    </FrameworkProvider>
  );
}
```

### Pattern 5: Updated FrameworkTabs with HTML + Context
**What:** Extended FrameworkTabs that includes HTML tab and uses context for persistence
**When to use:** Every code example
**Example:**
```tsx
// Updated FrameworkTabs.tsx
type Framework = 'html' | 'react' | 'vue' | 'svelte';

interface FrameworkTabsProps {
  html: string;
  react: string;
  vue: string;
  svelte: string;
}

const languageMap: Record<Framework, string> = {
  html: 'html',
  react: 'tsx',
  vue: 'vue',
  svelte: 'svelte',
};

const frameworkLabels: Record<Framework, string> = {
  html: 'HTML',
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
};

export function FrameworkTabs({ html, react, vue, svelte }: FrameworkTabsProps) {
  const { framework, setFramework } = useFramework();

  const codeMap: Record<Framework, string> = { html, react, vue, svelte };
  const code = codeMap[framework];
  const language = languageMap[framework];

  return (
    <div>
      <div className="flex border-b border-gray-200" role="tablist">
        {(['html', 'react', 'vue', 'svelte'] as const).map((fw) => (
          <button
            key={fw}
            role="tab"
            aria-selected={framework === fw}
            onClick={() => setFramework(fw)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              framework === fw
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {frameworkLabels[fw]}
          </button>
        ))}
      </div>
      <CodeBlock code={code} language={language} />
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Props as prose paragraphs:** Use tables for scannable, structured API docs. Props buried in paragraphs are hard to reference.
- **Code without context:** Every example needs a brief description of what it demonstrates.
- **Inconsistent code style:** All code examples should follow same formatting conventions.
- **Missing framework versions:** Each example must have HTML, React, Vue, and Svelte versions - don't leave any blank.
- **Demo without code:** Live previews are meaningless without corresponding implementation code.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab persistence across page | Multiple useState hooks | React Context | Single source of truth, cleaner updates |
| Table styling | Custom CSS per table | Reusable PropsTable component | Consistency, less code |
| Live preview styling | Inline styles per demo | Shared preview container styles | Uniform appearance |
| Navigation links | Hardcoded prev/next | PrevNextNav with nav.ts data | Auto-updates with navigation changes |

**Key insight:** The infrastructure from Phase 7 (CodeBlock, FrameworkTabs, LivePreview) should be extended, not replaced. Build on what exists.

## Common Pitfalls

### Pitfall 1: Dialog Preview Requires Trigger State
**What goes wrong:** Dialog doesn't open because it needs open={true} to display
**Why it happens:** Dialog is controlled component, not open by default
**How to avoid:** For docs preview, pass open={true} directly OR create mini-demo with open/close button
**Warning signs:** Empty preview area, dialog content not visible

### Pitfall 2: Dialog Web Component Events in React
**What goes wrong:** React doesn't bind to custom element events like `@close`
**Why it happens:** React treats unknown event handlers as attributes, not event listeners
**How to avoid:** Use refs and `addEventListener`, or keep dialog controlled via state only
**Warning signs:** onClose doesn't fire, close reason not captured

### Pitfall 3: FrameworkTabs Regression Breaking Phase 7
**What goes wrong:** Modifying FrameworkTabs breaks Getting Started page
**Why it happens:** Adding HTML prop and context without maintaining backward compatibility
**How to avoid:** Make HTML prop optional with empty string default, provide FrameworkProvider at layout level
**Warning signs:** Getting Started page throws context error, tabs don't work

### Pitfall 4: Inconsistent Props Documentation
**What goes wrong:** Props descriptions vary wildly in style and detail
**Why it happens:** No standard for how to describe props
**How to avoid:** Define template: what it does, valid values, behavior notes. Keep descriptions 1-2 sentences.
**Warning signs:** Some props have novels, others have "The variant"

### Pitfall 5: ui-dialog Custom Element Not Registered
**What goes wrong:** Dialog preview shows nothing or throws error
**Why it happens:** No side-effect import for dialog component registration
**How to avoid:** Create docs/src/lib/ui-dialog/ with same pattern as ui-button, import in LivePreview or page
**Warning signs:** "ui-dialog is not defined", empty custom element in DOM

### Pitfall 6: Code Examples Don't Match Live Preview
**What goes wrong:** Shown code produces different output than preview
**Why it happens:** Code examples hardcoded separately from actual preview JSX
**How to avoid:** Single source of truth where possible; at minimum, verify every example matches
**Warning signs:** User tries code, gets different result than docs show

## Code Examples

Verified patterns from official sources and prior phases:

### Button Props Data Structure
```tsx
// Props data for PropsTable component
const buttonProps = [
  {
    name: 'variant',
    type: '"primary" | "secondary" | "outline" | "ghost" | "destructive"',
    default: '"primary"',
    description: 'The visual style of the button.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'The size affecting padding and font size.',
  },
  {
    name: 'type',
    type: '"button" | "submit" | "reset"',
    default: '"button"',
    description: 'The button type for form behavior.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the button is disabled. Uses aria-disabled for accessibility.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a pulsing dots spinner and prevents interaction.',
  },
];
```

### Button Slots Data Structure
```tsx
const buttonSlots = [
  {
    name: '(default)',
    description: 'Button text content.',
  },
  {
    name: 'icon-start',
    description: 'Icon placed before the text. Scales with button font-size.',
  },
  {
    name: 'icon-end',
    description: 'Icon placed after the text. Scales with button font-size.',
  },
];
```

### Dialog Props Data Structure
```tsx
const dialogProps = [
  {
    name: 'open',
    type: 'boolean',
    default: 'false',
    description: 'Whether the dialog is visible. Uses showModal() for focus trapping.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'The max-width of the dialog (24rem, 28rem, or 32rem).',
  },
  {
    name: 'dismissible',
    type: 'boolean',
    default: 'true',
    description: 'Whether the dialog can be closed via Escape or backdrop click.',
  },
  {
    name: 'show-close-button',
    type: 'boolean',
    default: 'false',
    description: 'Shows an X button in the top-right corner.',
  },
];
```

### Dialog Events Data Structure
```tsx
const dialogEvents = [
  {
    name: 'close',
    detail: '{ reason: "escape" | "backdrop" | "programmatic" }',
    description: 'Fired when the dialog closes. Detail includes the close reason.',
  },
];
```

### Framework Code Example Templates
```tsx
// Button variants example - all frameworks
const variantsExample = {
  html: `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Destructive</ui-button>`,

  react: `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Destructive</ui-button>`,

  vue: `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Destructive</ui-button>`,

  svelte: `<ui-button variant="primary">Primary</ui-button>
<ui-button variant="secondary">Secondary</ui-button>
<ui-button variant="outline">Outline</ui-button>
<ui-button variant="ghost">Ghost</ui-button>
<ui-button variant="destructive">Destructive</ui-button>`,
};
```

### Dialog Example with Stateful Demo
```tsx
// Dialog live demo needs local state for open/close
function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <ui-button onClick={() => setOpen(true)}>Open Dialog</ui-button>
      <ui-dialog
        open={open}
        ref={(el) => {
          if (el) {
            el.addEventListener('close', () => setOpen(false));
          }
        }}
      >
        <span slot="title">Dialog Title</span>
        <p>This is the dialog content.</p>
        <div slot="footer">
          <ui-button variant="ghost" onClick={() => setOpen(false)}>Cancel</ui-button>
          <ui-button variant="primary">Confirm</ui-button>
        </div>
      </ui-dialog>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Props as prose | Props tables | Standard | Scannable, searchable documentation |
| Static code images | Live editable examples | 2020+ | Copy-paste ready, verifiable |
| Single framework docs | Multi-framework tabs | 2022+ | Serves all users, emphasizes portability |
| Separate demo pages | Inline examples with code | Current | Lower friction, see implementation immediately |

**Deprecated/outdated:**
- Separate "API" and "Examples" pages: Modern docs combine them on single page
- Definition lists for props: Tables are more scannable and sortable
- Framework-specific example pages: Tabs on single page is standard

## Open Questions

Things that couldn't be fully resolved:

1. **Dialog Live Demo Interactivity**
   - What we know: Dialog needs open state to display, needs trigger button
   - What's unclear: Should demo be always-open (simpler) or include open/close interaction (more realistic)
   - Recommendation: Include open/close for at least one example to show real usage; consider both approaches

2. **Slots Table vs Combined Props Table**
   - What we know: Button has 3 slots, Dialog has 3 slots; separate or combined with props?
   - What's unclear: User preference not stated, left to Claude's discretion
   - Recommendation: Separate sections (Props, Slots, Events) for clarity and scanability

3. **HTML vs Framework Syntax Differences**
   - What we know: For web components, HTML and framework usage is nearly identical
   - What's unclear: Whether to show import statements in framework tabs
   - Recommendation: Context decided "Show template/JSX only - assume imports are understood" - follow this

## Sources

### Primary (HIGH confidence)
- Existing codebase: docs/src/components/CodeBlock.tsx, FrameworkTabs.tsx, LivePreview.tsx - patterns to extend
- Existing codebase: src/components/button/button.ts, dialog/dialog.ts - source of truth for props/slots/events
- Phase 7 RESEARCH.md - established patterns for prism-react-renderer, copy functionality

### Secondary (MEDIUM confidence)
- [shadcn/ui Button documentation](https://ui.shadcn.com/docs/components/button) - page structure, examples organization
- [Radix UI Dialog documentation](https://www.radix-ui.com/primitives/docs/components/dialog) - API reference format, props tables
- [StackBlitz component documentation best practices](https://blog.stackblitz.com/posts/design-system-component-documentation/) - live previews, prop naming

### Tertiary (LOW confidence)
- WebSearch results for tab persistence patterns - React Context approach is well-established

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Building on existing Phase 6-7 infrastructure, no new dependencies
- Architecture: HIGH - Patterns verified against working codebase and industry standards
- Pitfalls: HIGH - Based on actual component implementations and known React/web component interop issues

**Research date:** 2026-01-24
**Valid until:** 60 days (documentation patterns are stable)
