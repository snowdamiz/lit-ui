# Phase 30: CLI and Documentation - Research

**Researched:** 2026-01-26
**Domain:** CLI templates, Documentation pages (React + Lit web components)
**Confidence:** HIGH

## Summary

This phase adds CLI support and documentation pages for the Input and Textarea components. The research focused on understanding the existing patterns in the codebase rather than external libraries, as this is an internal integration task.

The CLI uses a template-based system where component source code is embedded as template strings in `packages/cli/src/templates/index.ts`. For npm mode, components map to packages via `componentToPackage` in `install-component.ts`. The registry.json defines metadata for copy-source mode. The list command currently displays flat output but needs category grouping.

The docs pages follow a consistent React component pattern with sections: Header (title, description), Examples (ExampleBlock with live preview + multi-framework code), API Reference (PropsTable, SlotsTable, EventsTable, CSS Custom Properties, CSS Parts), and Navigation (PrevNextNav).

**Primary recommendation:** Follow existing patterns exactly - add input/textarea templates to templates/index.ts, add entries to registry.json, update install-component.ts for npm mode, create InputPage.tsx and TextareaPage.tsx mirroring ButtonPage/DialogPage structure.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| citty | existing | CLI framework | Already used for add/list commands |
| picocolors | existing | Terminal coloring | Already used for output styling |
| consola | existing | Console logging | Already used for CLI feedback |
| React | 18.x | Docs pages | Docs app is React-based |
| react-router | 7.x | Navigation | Already configured in App.tsx |

### Supporting (Docs components)
| Component | Location | Purpose | When to Use |
|-----------|----------|---------|-------------|
| ExampleBlock | apps/docs/src/components | Live preview + code tabs | Each interactive example |
| PropsTable | apps/docs/src/components | Props documentation | API Reference section |
| SlotsTable | apps/docs/src/components | Slots documentation | API Reference section |
| EventsTable | apps/docs/src/components | Events documentation | API Reference section |
| CodeBlock | apps/docs/src/components | Static code display | CSS examples, non-interactive code |
| PrevNextNav | apps/docs/src/components | Page navigation | Bottom of each page |
| FrameworkProvider | apps/docs/src/contexts | Framework tab state | Wrap each page component |

### No New Dependencies Needed
This phase uses exclusively existing infrastructure - no npm packages to add.

## Architecture Patterns

### CLI Templates Pattern
```typescript
// packages/cli/src/templates/index.ts
export const INPUT_TEMPLATE = `// Component source code here...`;

export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,    // Add
  textarea: TEXTAREA_TEMPLATE, // Add
};
```

### Registry Pattern
```json
// packages/cli/src/registry/registry.json
{
  "components": [
    {
      "name": "input",
      "description": "Form input with validation, sizes, password toggle, and clearable",
      "files": [{ "path": "components/input/input.ts", "type": "component" }],
      "dependencies": [],
      "registryDependencies": []
    }
  ]
}
```

### NPM Install Map Pattern
```typescript
// packages/cli/src/utils/install-component.ts
export const componentToPackage: Record<string, string> = {
  button: '@lit-ui/button',
  dialog: '@lit-ui/dialog',
  input: '@lit-ui/input',     // Add
  textarea: '@lit-ui/textarea', // Add
};
```

### List Command Category Pattern (New)
Per CONTEXT.md: Categorize components by type in list output.
```typescript
// Recommended structure for grouped output
const categories = {
  Form: ['input', 'textarea'],
  Feedback: ['dialog'],
  Actions: ['button'],
};
```

### Docs Page Pattern
```tsx
// Pattern from ButtonPage.tsx and DialogPage.tsx
export function ComponentPage() {
  return (
    <FrameworkProvider>
      <div className="max-w-4xl">
        {/* Header with animation classes */}
        <header className="relative mb-16 animate-fade-in-up opacity-0 stagger-1">
          <h1 className="text-4xl font-extrabold...">Component Name</h1>
          <p className="text-lg text-gray-500...">Description</p>
        </header>

        {/* Examples Section with animation */}
        <div className="space-y-12 animate-fade-in-up opacity-0 stagger-2">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-8">...</div>

          {/* Each example */}
          <section>
            <h3>Example Name</h3>
            <p>Description</p>
            <ExampleBlock
              preview={<live-component />}
              html={codeString}
              react={codeString}
              vue={codeString}
              svelte={codeString}
            />
          </section>
        </div>

        {/* API Reference with animation */}
        <section className="mt-20 mb-14 animate-fade-in-up opacity-0 stagger-3">
          <PropsTable props={propsArray} />
          <SlotsTable slots={slotsArray} />
          {/* CSS Custom Properties table (manual) */}
          {/* CSS Parts table (manual) */}
          <EventsTable events={eventsArray} /> {/* or info card if no events */}
        </section>

        {/* Navigation */}
        <PrevNextNav prev={{...}} next={{...}} />
      </div>
    </FrameworkProvider>
  );
}
```

### JSX Type Declaration Pattern
```tsx
// Required for lui-input and lui-textarea in React TSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-input': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: 'text' | 'email' | 'password' | 'number' | 'search';
          size?: 'sm' | 'md' | 'lg';
          // ... all props
        },
        HTMLElement
      >;
    }
  }
}
```

### Anti-Patterns to Avoid
- **Inline component imports in templates:** Templates should import from `@lit-ui/core`, not relative paths - the copy-source mode adjusts paths after copying
- **Missing JSX types:** Always declare JSX intrinsic elements for custom elements used in docs
- **Inconsistent animation classes:** Use exact stagger class names (stagger-1, stagger-2, stagger-3) for consistent page load animations
- **Framework-specific React code in code examples:** Web component syntax should be identical across html/react/vue/svelte props in ExampleBlock (Button/Dialog pages show this pattern)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Live code preview | Custom renderer | ExampleBlock component | Already handles preview + tabs |
| Props documentation | Custom table | PropsTable component | Consistent styling, already exists |
| Framework code tabs | Manual tabs | FrameworkTabs (via ExampleBlock) | State management, consistent UX |
| CLI output formatting | Raw console.log | consola + picocolors | Already used, consistent formatting |
| Component categorization | Complex logic | Simple Record<string, string[]> | List command just needs grouping |

**Key insight:** This phase is 100% integration work - every pattern already exists in the codebase. The task is replication, not invention.

## Common Pitfalls

### Pitfall 1: Template Import Paths
**What goes wrong:** Templates embed component source that imports from `@lit-ui/core`, but copy-source mode places files differently
**Why it happens:** Copy confusion between npm mode and copy-source mode paths
**How to avoid:** Templates use npm-style imports (`@lit-ui/core`); copy-component.ts handles path transformation for copy-source mode
**Warning signs:** Components fail to compile after copy-source installation

### Pitfall 2: Forgetting CLI Silent Success
**What goes wrong:** Adding "usage hints" or verbose output after successful install
**Why it happens:** Developer instinct to provide helpful feedback
**How to avoid:** Per CONTEXT.md decisions - silent success, no post-install hints
**Warning signs:** Output text after `consola.success()` on install

### Pitfall 3: Interactive Example State Management
**What goes wrong:** Docs examples don't properly handle web component event cleanup
**Why it happens:** React useEffect doesn't auto-clean custom element event listeners
**How to avoid:** Follow DialogPage pattern - useRef + useEffect with explicit removeEventListener in cleanup
**Warning signs:** Console warnings, memory leaks, stale state

### Pitfall 4: Missing Web Component Registration
**What goes wrong:** Live previews show empty/broken components
**Why it happens:** Missing side-effect import to register custom elements
**How to avoid:** Add `import '@lit-ui/input';` and `import '@lit-ui/textarea';` at top of page components
**Warning signs:** Components render as empty HTML elements

### Pitfall 5: Inconsistent Example Count
**What goes wrong:** Not enough examples per CONTEXT.md (8-12 required)
**Why it happens:** Rushing through examples
**How to avoid:** Plan examples in advance covering all major features
**Warning signs:** Less than 8 examples, missing key features like validation states

## Code Examples

### Adding Template (templates/index.ts)
```typescript
// Source: packages/cli/src/templates/index.ts (existing pattern)
export const INPUT_TEMPLATE = `/**
 * lui-input - A customizable input component
 * ... JSDoc header from packages/input/src/input.ts
 */

import { html, css, svg, isServer, nothing } from 'lit';
// ... rest of component source
`;

export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,
  textarea: TEXTAREA_TEMPLATE,
};
```

### Adding to Registry (registry.json)
```json
// Source: packages/cli/src/registry/registry.json (existing pattern)
{
  "name": "input",
  "description": "Form input with validation, sizes, password toggle, and clearable",
  "files": [
    { "path": "components/input/input.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

### List Command with Categories
```typescript
// Pattern for grouped output per CONTEXT.md
const categories: Record<string, string[]> = {
  'Form': ['input', 'textarea'],
  'Feedback': ['dialog'],
  'Actions': ['button'],
};

// Then iterate and print
for (const [category, componentNames] of Object.entries(categories)) {
  console.log(pc.bold(category));
  for (const name of componentNames) {
    const component = components.find(c => c.name === name);
    // ... print component info
  }
}
```

### Docs Page Example Structure
```tsx
// Source: apps/docs/src/pages/components/DialogPage.tsx (existing pattern)

// Props definition
const inputProps: PropDef[] = [
  {
    name: 'type',
    type: '"text" | "email" | "password" | "number" | "search"',
    default: '"text"',
    description: 'The input type.',
  },
  // ... more props
];

// Code examples (same syntax for all frameworks since web components)
const basicInputCode = `<lui-input type="text" placeholder="Enter text"></lui-input>`;

// Interactive demo component with proper event handling
function ValidationDemo() {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      const handleInput = (e: Event) => {
        setValue((e.target as HTMLInputElement).value);
      };
      el.addEventListener('input', handleInput);
      return () => el.removeEventListener('input', handleInput);
    }
  }, []);

  return <lui-input ref={inputRef} value={value} />;
}
```

### Pre-triggered Error State (per CONTEXT.md)
```tsx
// Show error state immediately for visibility (some examples start in error)
function ErrorStateDemo() {
  // Start with touched=true to show error immediately
  return (
    <lui-input
      required
      value=""  // Empty = validation error
      // Component needs internal way to force error display
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat component list | Categorized list output | Phase 30 (now) | Better organization in CLI |
| Button/Dialog only | Input/Textarea added | Phase 27-29 | More form components available |

**Deprecated/outdated:**
- N/A - this is greenfield integration work

## Input Component API Reference

Extracted from `packages/input/src/input.ts`:

### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| type | 'text' \| 'email' \| 'password' \| 'number' \| 'search' | 'text' | Input type |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| name | string | '' | Form submission name |
| value | string | '' | Current value |
| placeholder | string | '' | Placeholder text |
| label | string | '' | Label text above input |
| helper-text | string | '' | Helper text below label |
| required | boolean | false | Required for form |
| required-indicator | 'asterisk' \| 'text' | 'asterisk' | Required indicator style |
| disabled | boolean | false | Disabled state |
| readonly | boolean | false | Readonly state |
| minlength | number | - | Minimum length validation |
| maxlength | number | - | Maximum length validation |
| pattern | string | '' | Regex pattern validation |
| min | number | - | Minimum value (number type) |
| max | number | - | Maximum value (number type) |
| clearable | boolean | false | Show clear button |
| show-count | boolean | false | Show character counter |

### Slots
| Name | Description |
|------|-------------|
| prefix | Content before input (icon, symbol) |
| suffix | Content after input (icon, unit) |

### CSS Parts
| Part | Description |
|------|-------------|
| wrapper | Outer wrapper div |
| label | Label element |
| helper | Helper text span |
| container | Input container with border |
| input | Native input element |
| prefix | Prefix slot wrapper |
| suffix | Suffix slot wrapper |
| counter | Character counter |
| error | Error text span |

### CSS Custom Properties (inherited from core tokens)
Uses `--ui-input-*` tokens from Phase 26.

## Textarea Component API Reference

Extracted from `packages/textarea/src/textarea.ts`:

### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| name | string | '' | Form submission name |
| value | string | '' | Current value |
| placeholder | string | '' | Placeholder text |
| label | string | '' | Label text above textarea |
| helper-text | string | '' | Helper text below label |
| rows | number | 3 | Initial height in rows |
| resize | 'none' \| 'vertical' \| 'horizontal' \| 'both' | 'vertical' | Resize handle behavior |
| autoresize | boolean | false | Auto-grow to fit content |
| max-rows | number | - | Max rows for auto-resize |
| max-height | string | - | Max height CSS value (overrides max-rows) |
| required | boolean | false | Required for form |
| required-indicator | 'asterisk' \| 'text' | 'asterisk' | Required indicator style |
| disabled | boolean | false | Disabled state |
| readonly | boolean | false | Readonly state |
| minlength | number | - | Minimum length validation |
| maxlength | number | - | Maximum length validation |
| show-count | boolean | false | Show character counter |

### Slots
None (textarea doesn't have prefix/suffix like input)

### CSS Parts
| Part | Description |
|------|-------------|
| wrapper | Outer wrapper div |
| label | Label element |
| helper | Helper text span |
| textarea | Native textarea element |
| counter | Character counter |
| error | Error text span |

## Open Questions

None - all decisions locked in CONTEXT.md, existing patterns are clear.

## Sources

### Primary (HIGH confidence)
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/templates/index.ts` - Template embedding pattern
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/registry/registry.json` - Registry structure
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/utils/install-component.ts` - NPM install mapping
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/commands/list.ts` - List command structure
- `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/pages/components/ButtonPage.tsx` - Docs page pattern
- `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/pages/components/DialogPage.tsx` - Docs page pattern with events
- `/Users/sn0w/Documents/dev/lit-components/packages/input/src/input.ts` - Input component source
- `/Users/sn0w/Documents/dev/lit-components/packages/textarea/src/textarea.ts` - Textarea component source

### Secondary (MEDIUM confidence)
- N/A - all sources are primary (actual codebase)

### Tertiary (LOW confidence)
- N/A

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - All patterns visible in existing code
- Pitfalls: HIGH - Based on existing code structure analysis

**Research date:** 2026-01-26
**Valid until:** Indefinite (internal codebase patterns, not external dependencies)
