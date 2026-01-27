# Phase 37: CLI and Documentation - Research

**Researched:** 2026-01-26
**Domain:** CLI templates, NPM package mapping, Documentation enhancement
**Confidence:** HIGH

## Summary

This phase completes CLI support and documentation for the Select component. The research focused on understanding existing patterns in the codebase since this is an integration task following established patterns from Phase 30 (Input/Textarea CLI and Documentation).

Key findings:
1. **CLI Templates:** Select is too complex for embedded templates due to 3 sub-components (select.ts, option.ts, option-group.ts), async dependencies (@floating-ui/dom, @lit/task, @tanstack/lit-virtual), and ~1500+ lines of code. NPM mode is the practical path for Select.
2. **NPM Mode:** The `componentToPackage` map in `install-component.ts` needs `select: '@lit-ui/select'`. The `isNpmComponent()` check will then allow `lit-ui add select --npm`.
3. **Documentation:** SelectPage.tsx already exists with comprehensive examples covering single-select, multi-select, combobox, option groups, clearable, disabled states, and keyboard navigation. May need async loading examples from Phase 36.
4. **Navigation:** The nav.ts already includes Select in the components list.

**Primary recommendation:** This phase is minimal - add Select to npm mode map, optionally add async loading examples to SelectPage.tsx, and update the list command's component categories. No template embedding due to component complexity.

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
| CodeBlock | apps/docs/src/components | Static code display | CSS examples |
| PrevNextNav | apps/docs/src/components | Page navigation | Bottom of each page |
| FrameworkProvider | apps/docs/src/contexts | Framework tab state | Wrap page component |

### No New Dependencies Needed
This phase uses exclusively existing infrastructure.

## Architecture Patterns

### NPM Install Map Pattern (Only practical option for Select)
```typescript
// packages/cli/src/utils/install-component.ts
export const componentToPackage: Record<string, string> = {
  button: '@lit-ui/button',
  dialog: '@lit-ui/dialog',
  input: '@lit-ui/input',
  textarea: '@lit-ui/textarea',
  select: '@lit-ui/select',     // ADD THIS
};
```

### Why NOT Embedded Templates for Select
The Select component is too complex for template embedding:

1. **Multi-file component:** 3 files (select.ts, option.ts, option-group.ts) vs 1 file for Input/Textarea
2. **External dependencies:** @floating-ui/dom, @lit/task, @tanstack/lit-virtual - copy-source mode doesn't handle installing these
3. **Code size:** ~1500+ lines total vs ~500 for Input
4. **Maintenance burden:** Keeping embedded templates in sync with evolving async/virtual features is error-prone

**Recommendation:** Select is NPM-mode only. Users who want copy-source can copy directly from packages/select/src/.

### Registry Pattern (Optional, for copy-source users who copy manually)
```json
// packages/cli/src/registry/registry.json
{
  "name": "select",
  "description": "Select dropdown with single/multi-select, combobox, and async loading",
  "files": [
    { "path": "components/select/select.ts", "type": "component" },
    { "path": "components/select/option.ts", "type": "component" },
    { "path": "components/select/option-group.ts", "type": "component" }
  ],
  "dependencies": ["@floating-ui/dom", "@lit/task", "@tanstack/lit-virtual"],
  "registryDependencies": []
}
```

Note: Even with registry entry, CLI would need to install npm dependencies, which copy-source mode doesn't handle well.

### List Command Category Pattern
```typescript
// Pattern for grouped output
const categories: Record<string, string[]> = {
  'Form': ['input', 'textarea', 'select'],  // ADD select here
  'Feedback': ['dialog'],
  'Actions': ['button'],
};
```

### Documentation Pattern (Already Implemented)
SelectPage.tsx at `apps/docs/src/pages/components/SelectPage.tsx` already exists with:
- 16+ interactive examples
- Single-select, multi-select, combobox sections
- Full API reference (lui-select, lui-option, lui-option-group)
- CSS Custom Properties documentation
- Keyboard navigation table
- Proper animation classes (stagger-1, stagger-2, stagger-3)

### Missing Documentation: Async Loading
The current SelectPage.tsx doesn't include examples for Phase 36 async features:
- Promise-based options
- Async search with debounce
- Loading states and error handling
- Infinite scroll / pagination
- Virtual scrolling

These could be added as a new section "Async & Performance".

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Select CLI template | Embedded template string | NPM mode only | Too complex, too many dependencies |
| Async examples | Complex interactive demos | Static code blocks | Async requires server or mock data |
| Package installation | Custom install logic | Existing installComponent() | Already handles package manager detection |

**Key insight:** Select is fundamentally different from Button/Dialog/Input/Textarea due to its dependencies and multi-component nature. The practical approach is NPM mode only.

## Common Pitfalls

### Pitfall 1: Attempting Template Embedding
**What goes wrong:** Trying to embed 1500+ lines of Select code as template string
**Why it happens:** Following Input/Textarea pattern blindly
**How to avoid:** Recognize that Select is NPM-mode only due to complexity and dependencies
**Warning signs:** Template strings becoming unmanageable, dependency installation failures

### Pitfall 2: Missing Async Example Dependencies
**What goes wrong:** Async loading examples don't work without mock data
**Why it happens:** Real APIs aren't available in docs
**How to avoid:** Use inline Promise.resolve() with setTimeout for simulating async, or skip interactive async demos
**Warning signs:** Examples showing "Loading..." forever, fetch errors in console

### Pitfall 3: Forgetting Web Component Registration
**What goes wrong:** Live previews show empty/broken components
**Why it happens:** Missing side-effect import
**How to avoid:** SelectPage.tsx already has `import '@lit-ui/select';` - ensure this remains
**Warning signs:** Components render as empty HTML elements

### Pitfall 4: Navigation Order
**What goes wrong:** Select appears out of order in sidebar
**Why it happens:** nav.ts order doesn't match component addition order
**How to avoid:** nav.ts already has Select in correct position after Textarea
**Warning signs:** User confusion, broken PrevNextNav links

## Code Examples

### Adding to NPM Mode (install-component.ts)
```typescript
// packages/cli/src/utils/install-component.ts
export const componentToPackage: Record<string, string> = {
  button: '@lit-ui/button',
  dialog: '@lit-ui/dialog',
  input: '@lit-ui/input',
  textarea: '@lit-ui/textarea',
  select: '@lit-ui/select',     // Add this line
};
```

### Optional: Async Loading Documentation Example
```tsx
// Simulated async loading for documentation
const asyncLoadingCode = `<lui-select
  placeholder="Loading options..."
  .options=\${new Promise(resolve =>
    setTimeout(() => resolve([
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ]), 1000)
  )}
></lui-select>`;

// Interactive demo with simulated async
function AsyncDemo() {
  const [options, setOptions] = useState<Promise<SelectOption[]>>(
    new Promise(resolve => setTimeout(() => resolve(mockOptions), 1000))
  );

  return (
    <lui-select
      placeholder="Loading..."
      options={options}
    />
  );
}
```

### Optional: Async Search Documentation Example
```tsx
const asyncSearchCode = `<lui-select
  searchable
  placeholder="Search users..."
  .asyncSearch=\${async (query, signal) => {
    // Simulated API call
    await new Promise(r => setTimeout(r, 500));
    return mockUsers.filter(u =>
      u.label.toLowerCase().includes(query.toLowerCase())
    );
  }}
></lui-select>`;
```

## Select Component API Reference

Extracted from `packages/select/src/select.ts`:

### lui-select Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| name | string | '' | Form submission name |
| value | string \| string[] | '' | Current selected value(s) |
| placeholder | string | 'Select an option' | Placeholder text |
| label | string | '' | Label text above select |
| options | SelectOption[] \| Promise<SelectOption[]> | [] | Options array or Promise |
| disabled | boolean | false | Disabled state |
| required | boolean | false | Required for form |
| clearable | boolean | false | Show clear button |
| multiple | boolean | false | Enable multi-select mode |
| maxSelections | number | undefined | Max selections in multi-select |
| showSelectAll | boolean | false | Show select all/clear all button |
| searchable | boolean | false | Enable combobox/filter mode |
| customFilter | (option, query) => boolean | undefined | Custom filter function |
| creatable | boolean | false | Allow creating new options |
| noResultsMessage | string | 'No results found' | Empty state message |
| debounceDelay | number | 300 | Debounce for async search (ms) |
| minSearchLength | number | 0 | Min chars before async search |
| asyncSearch | (query, signal) => Promise<SelectOption[]> | undefined | Async search function |
| loadMore | () => Promise<SelectOption[]> | undefined | Infinite scroll callback |

### lui-option Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | string | '' | Value submitted when selected |
| label | string | '' | Display label (falls back to textContent) |
| disabled | boolean | false | Disabled state |

### lui-option-group Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | string | '' | Group header label |

### Slots (lui-select)
| Name | Description |
|------|-------------|
| default | Options (lui-option or lui-option-group elements) |

### Slots (lui-option)
| Name | Description |
|------|-------------|
| default | Option label text |
| start | Content before label (icon) |
| end | Content after label |
| description | Description text below label |

### Events
| Event | Detail | Description |
|-------|--------|-------------|
| change | { value: string \| string[] } | Selection changed |
| clear | - | Selection cleared |
| create | { value: string } | New option created (creatable mode) |

### CSS Custom Properties
| Property | Default | Description |
|----------|---------|-------------|
| --ui-select-radius | var(--radius-md) | Border radius |
| --ui-select-border | var(--color-border) | Border color |
| --ui-select-border-focus | var(--color-ring) | Focus border color |
| --ui-select-bg | var(--color-background) | Background color |
| --ui-select-text | var(--color-foreground) | Text color |
| --ui-select-placeholder | var(--color-muted-foreground) | Placeholder color |
| --ui-select-dropdown-shadow | var(--shadow-md) | Dropdown shadow |

## Current State Analysis

### What Already Exists
1. **SelectPage.tsx** - Comprehensive with 16+ examples covering:
   - Basic single-select
   - Size variants
   - Option groups
   - Custom content with icons
   - Clearable
   - Disabled states
   - Required validation
   - Multi-select (basic, groups, select all, max selections)
   - Combobox/searchable (basic, highlighting, creatable, combined with multi)
   - Full API reference tables
   - Keyboard navigation documentation

2. **nav.ts** - Already includes Select in components list

3. **@lit-ui/select package** - Published and working

### What Needs to be Added
1. **install-component.ts** - Add `select: '@lit-ui/select'` to componentToPackage map
2. **list.ts** (optional) - Add 'select' to Form category if implementing categorized output
3. **SelectPage.tsx** (optional) - Add Async Loading section for Phase 36 features

## Open Questions

### Q1: Should we add async loading examples to SelectPage?
- **What we know:** Phase 36 added Promise options, async search, loading states, virtual scrolling, infinite scroll
- **What's unclear:** Whether static code examples suffice or if interactive demos are needed
- **Recommendation:** Add a new "Async & Performance" section with code examples. Interactive async demos are tricky without real APIs - use simulated Promise.resolve() patterns.

### Q2: Registry entry for copy-source mode?
- **What we know:** Registry would need to list 3 files and external dependencies
- **What's unclear:** Whether copy-source should be supported at all for Select
- **Recommendation:** Skip registry entry. Document that Select requires NPM mode due to dependencies. Users can manually copy from packages/select/src/ if needed.

## Sources

### Primary (HIGH confidence)
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/utils/install-component.ts` - NPM install mapping
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/registry/registry.json` - Registry structure
- `/Users/sn0w/Documents/dev/lit-components/packages/cli/src/templates/index.ts` - Template embedding pattern
- `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/pages/components/SelectPage.tsx` - Existing Select docs
- `/Users/sn0w/Documents/dev/lit-components/apps/docs/src/nav.ts` - Navigation config
- `/Users/sn0w/Documents/dev/lit-components/packages/select/package.json` - Select package dependencies
- `/Users/sn0w/Documents/dev/lit-components/packages/select/src/select.ts` - Select component source
- `/Users/sn0w/Documents/dev/lit-components/packages/select/src/option.ts` - Option component source
- `/Users/sn0w/Documents/dev/lit-components/.planning/phases/30-cli-documentation/30-RESEARCH.md` - Prior CLI/Docs pattern

### Secondary (MEDIUM confidence)
- N/A - all sources are primary (actual codebase)

### Tertiary (LOW confidence)
- N/A

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - All patterns visible in existing code
- Pitfalls: HIGH - Based on Select complexity analysis

**Research date:** 2026-01-26
**Valid until:** Indefinite (internal codebase patterns)
