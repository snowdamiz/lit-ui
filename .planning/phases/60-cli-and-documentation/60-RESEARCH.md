# Phase 60: CLI & Documentation - Research

**Researched:** 2026-02-02
**Domain:** CLI copy-source templates, registry configuration, documentation pages
**Confidence:** HIGH

## Summary

This phase adds CLI support and documentation for the Accordion and Tabs components. The codebase has well-established patterns for all three concerns: CLI templates are embedded TypeScript template strings with inlined utilities, the registry is a JSON file with dependency resolution, and doc pages are React (TSX) components using shared UI helpers.

Both accordion and tabs are parent-child container components (like checkbox/checkbox-group and radio/radio-group) that import from `@lit-ui/core`. The CLI templates must transform these into standalone files that: (1) import from the local `../../lib/lit-ui/tailwind-element` path instead of `@lit-ui/core`, (2) inline the `dispatchCustomEvent` utility, (3) include `@customElement` decorators or `customElements.define` calls for self-registration, and (4) use CSS variables with fallback values for standalone usage.

**Primary recommendation:** Follow the exact patterns established by tooltip (namespaced multi-file), checkbox/checkbox-group (parent-child container), and toast (multi-file registry) templates -- combining them for accordion and tabs.

## Standard Stack

No new libraries needed. This phase uses only what already exists in the project.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lit | ^3.3.2 | Web component framework | Already used by all components |
| lit/directives/style-map.js | ^3.3.2 | Style binding (tabs indicator) | Already imported in tabs source |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router | (existing) | Doc page routing | Already used in App.tsx |
| @lit-ui/accordion | workspace | Built accordion package | Side-effect import in doc page |
| @lit-ui/tabs | workspace | Built tabs package | Side-effect import in doc page |

## Architecture Patterns

### Pattern 1: CLI Template as Embedded String

Templates are TypeScript files exporting a single `const TEMPLATE = \`...\`` string containing the full component source code. The template string replaces:
- `import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core'` -> `import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element'`
- `import { dispatchCustomEvent } from '@lit-ui/core'` -> inline function definition
- Package `index.ts` registration -> `@customElement('lui-xxx')` decorator on class OR no decorator (for parent-child components where user registers)

**Confidence:** HIGH -- verified across 20+ existing templates

**Evidence:**
- `checkbox.ts` template: inlines `dispatchCustomEvent`, imports from `../../lib/lit-ui/tailwind-element`, no `@customElement` decorator
- `checkbox-group.ts` template: same pattern, references `./checkbox` for type import
- `tooltip.ts` template: uses `@customElement('lui-tooltip')` decorator since it's a standalone element
- `tooltip-delay-group.ts` template: pure module (no class decorator), referenced via `./delay-group` path

### Pattern 2: Registry Namespacing for Multi-File Components

Multi-file components use slash-separated keys in `COMPONENT_TEMPLATES` map.

**Existing examples:**
```
'tooltip/delay-group': TOOLTIP_DELAY_GROUP_TEMPLATE   // namespaced
'toast/types': TOAST_TYPES_TEMPLATE                    // namespaced
'toast/icons': TOAST_ICONS_TEMPLATE                    // namespaced
toast: TOAST_ELEMENT_TEMPLATE                          // main file uses component name directly
```

**For accordion and tabs:**
```
'accordion': ACCORDION_TEMPLATE              // main accordion container
'accordion/accordion-item': ACCORDION_ITEM_TEMPLATE   // child item
'tabs': TABS_TEMPLATE                        // main tabs container
'tabs/tab-panel': TAB_PANEL_TEMPLATE         // child panel
```

**Confidence:** HIGH -- exact pattern from tooltip and toast

### Pattern 3: Registry JSON Entry Structure

Each component entry in `registry.json` has:
```json
{
  "name": "accordion",
  "description": "...",
  "files": [
    { "path": "components/accordion/accordion.ts", "type": "component" },
    { "path": "components/accordion/accordion-item.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

**File resolution in copy-component.ts** (line 141-143):
```typescript
const fileStem = parse(file.path).name;  // e.g. "accordion-item"
const template = getComponentTemplate(fileStem)           // try "accordion-item"
  ?? getComponentTemplate(`${componentName}/${fileStem}`)  // try "accordion/accordion-item"
  ?? getComponentTemplate(componentName);                  // try "accordion"
```

The namespaced key `accordion/accordion-item` will be resolved by the second fallback. This is critical for correct file mapping.

**Confidence:** HIGH -- verified from copy-component.ts source

### Pattern 4: Parent-Child CLI Templates (No Decorator vs Decorator)

Two approaches exist in the codebase for parent-child registration:

**Approach A (checkbox pattern):** No `@customElement` decorator. Classes exported without registration. User must register manually or the framework does it.

**Approach B (tooltip pattern):** `@customElement('lui-tooltip')` decorator on class. Self-registering on import.

The accordion and tabs source packages use Approach A (registration in index.ts), but for CLI copy-source templates, the established convention for parent-child is also Approach A (checkbox, checkbox-group, radio, radio-group have no decorators). However, some single-file components use decorators (tooltip, popover, select, button, dialog).

**Recommendation:** Follow the checkbox/radio pattern for accordion/tabs -- no `@customElement` decorators. Instead, add `customElements.define()` calls at the bottom of each template file (like the package index.ts pattern but inline). This matches how the accordion/tabs packages work and avoids the decorator import.

Actually, reviewing more carefully: the checkbox template does NOT register at all. The user is expected to register. But for accordion, the parent needs to discover children by tag name (`el.tagName === 'LUI-ACCORDION-ITEM'`), so both elements MUST be registered. The safest approach: include `customElements.define()` calls at the bottom of each template, wrapped in the same collision guard pattern from the package index.ts.

**Confidence:** HIGH

### Pattern 5: CSS Variable Fallbacks for Standalone Usage (INTG-06)

The component source files reference CSS variables like `var(--ui-accordion-border)` defined in `packages/core/src/styles/tailwind.css`. In copy-source mode, users may not have the full theme CSS loaded.

**Existing pattern from tooltip template:** Variables like `var(--ui-tooltip-bg)` are used without inline fallbacks in the template -- the fallback values are defined in the core stylesheet. But for standalone usage, templates need hardcoded fallbacks.

**Examining the core tailwind.css:**
```css
--ui-accordion-border: var(--color-border, var(--ui-color-border));
--ui-accordion-header-text: var(--color-foreground, var(--ui-color-foreground));
```

The core CSS already has two-level fallbacks. For CLI templates, CSS variables in component styles should include a third-level literal fallback:
```css
border: var(--ui-accordion-border-width, 1px) solid var(--ui-accordion-border, #e5e7eb);
```

This ensures the component renders correctly even without the theme CSS loaded.

**Confidence:** MEDIUM -- The tooltip template does NOT include fallbacks (it relies on theme CSS). But INTG-06 explicitly requires fallbacks. Need to ADD fallbacks to accordion/tabs templates that don't exist in other templates. This is new ground.

### Pattern 6: Documentation Page Structure

Every component doc page follows this exact structure:
1. **Imports**: `FrameworkProvider`, `ExampleBlock`, `PropsTable`, `SlotsTable`, `PrevNextNav`, `CodeBlock`
2. **Side-effect imports**: `import '@lit-ui/component-name'` to register custom elements
3. **Data definitions**: Props array (`PropDef[]`), Slots array (`SlotDef[]`), CSS vars, CSS parts
4. **Code examples object**: `{ html, react, vue, svelte }` for each demo
5. **Demo components**: React functions rendering live web components
6. **Page component**: Main export with header, examples, accessibility section, custom styling section, API reference
7. **Navigation**: `PrevNextNav` at bottom

**Files to update:**
- `apps/docs/src/pages/components/AccordionPage.tsx` (new)
- `apps/docs/src/pages/components/TabsPage.tsx` (new)
- `apps/docs/src/App.tsx` (add routes)
- `apps/docs/src/nav.ts` (add nav entries)

**Confidence:** HIGH -- verified from TooltipPage.tsx (571 lines, comprehensive pattern)

### Pattern 7: Template String Escaping

Templates are TypeScript template literals. Special characters need escaping:
- Backticks in CSS template literals: `\``
- `${expressions}` in Lit html templates: `\${...}`
- The outer template wraps the entire file content

**Confidence:** HIGH -- visible in every existing template

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event dispatching | Custom event util | Inline `dispatchCustomEvent()` pattern from checkbox template | Matches existing copy-source approach |
| Component registration | Import decorator | `customElements.define()` with collision guard | Matches package index.ts pattern |
| CSS variable fallbacks | Custom CSS reset | Hardcoded fallback values in var() | Standard CSS pattern |
| Doc page layout | Custom layout | ExampleBlock, PropsTable, SlotsTable, PrevNextNav, CodeBlock | Already built and used by 15 doc pages |

## Common Pitfalls

### Pitfall 1: Template Key Mismatch in COMPONENT_TEMPLATES
**What goes wrong:** Template key doesn't match what `copy-component.ts` resolves, causing "template not found" error.
**Why it happens:** The resolution chain tries: `fileStem` -> `componentName/fileStem` -> `componentName`. If the key in COMPONENT_TEMPLATES doesn't match any of these, it fails.
**How to avoid:** For accordion, use keys: `'accordion'` (maps to `accordion.ts` file) and `'accordion/accordion-item'` (maps to `accordion-item.ts` file). For tabs: `'tabs'` and `'tabs/tab-panel'`.
**Warning signs:** `Error: Component template not found: accordion-item (component: accordion)`

### Pitfall 2: Cross-file Imports in Templates
**What goes wrong:** Template files reference each other with wrong relative paths.
**Why it happens:** In the package, accordion.ts imports `./accordion-item.js`. In the copy-source output, both files land in the same directory (e.g., `src/components/ui/`). The import path must match the flat output structure.
**How to avoid:** Use `import type { AccordionItem } from './accordion-item'` (no `.js` extension in template string, same directory). The tooltip template uses `import { delayGroup, type TooltipInstance } from './delay-group'` as reference.
**Warning signs:** Module not found errors when user imports the component.

### Pitfall 3: Missing `styleMap` Import for Tabs
**What goes wrong:** Tabs template fails to compile because `styleMap` is not imported.
**Why it happens:** Tabs source uses `import { styleMap } from 'lit/directives/style-map.js'` which is not commonly used in other templates.
**How to avoid:** Include the `styleMap` import in the tabs template. Verify all Lit imports match what the component actually uses.

### Pitfall 4: Tag Name Check in Parent Components
**What goes wrong:** Accordion checks `el.tagName === 'LUI-ACCORDION-ITEM'` to discover children. If the element isn't registered with that exact tag name, discovery fails silently.
**Why it happens:** Copy-source templates might use a different element name or forget registration.
**How to avoid:** Ensure both accordion and accordion-item templates include `customElements.define()` with exact tag names `lui-accordion` and `lui-accordion-item`. Same for tabs: `lui-tabs` and `lui-tab-panel`.

### Pitfall 5: CSS Variable Naming Consistency
**What goes wrong:** Template uses `--lui-*` prefix but theme uses `--ui-*` prefix.
**Why it happens:** Tech debt note mentions 30 CLI tests need update for `--lui-* -> --ui-*` naming change.
**How to avoid:** Use `--ui-*` prefix consistently in all new templates. The source components already use `--ui-accordion-*` and `--ui-tabs-*`.

### Pitfall 6: Doc Page Missing Route or Nav Entry
**What goes wrong:** Page exists but isn't accessible from the docs app.
**Why it happens:** Three locations need updating: the page file, App.tsx routes, and nav.ts navigation.
**How to avoid:** Checklist: (1) create page TSX, (2) add route in App.tsx, (3) add entry in nav.ts, (4) update PrevNextNav on adjacent pages.

### Pitfall 7: Tabs Indicator Needs ResizeObserver
**What goes wrong:** Tab indicator doesn't position correctly in copy-source mode.
**Why it happens:** Tabs uses `ResizeObserver` to track tablist size changes for indicator positioning. No polyfill needed (supported in all modern browsers) but the feature needs to work correctly.
**How to avoid:** Include the full indicator logic (updateIndicator, ResizeObserver setup) in the tabs template.

## Code Examples

### Accordion Template Key Registration (templates/index.ts)
```typescript
// In COMPONENT_TEMPLATES map:
export const COMPONENT_TEMPLATES: Record<string, string> = {
  // ... existing entries ...
  accordion: ACCORDION_TEMPLATE,
  'accordion/accordion-item': ACCORDION_ITEM_TEMPLATE,
  tabs: TABS_TEMPLATE,
  'tabs/tab-panel': TAB_PANEL_TEMPLATE,
};
```

### Registry Entry for Accordion
```json
{
  "name": "accordion",
  "description": "Accessible accordion with single/multi-expand, collapsible mode, and CSS Grid height animation",
  "files": [
    { "path": "components/accordion/accordion.ts", "type": "component" },
    { "path": "components/accordion/accordion-item.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

### Registry Entry for Tabs
```json
{
  "name": "tabs",
  "description": "Accessible tabs with animated indicator, keyboard navigation, overflow scroll, and lazy panels",
  "files": [
    { "path": "components/tabs/tabs.ts", "type": "component" },
    { "path": "components/tabs/tab-panel.ts", "type": "component" }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

### Template Import Transformation Pattern
```typescript
// Source (packages/accordion/src/accordion.ts):
import { TailwindElement, tailwindBaseStyles } from '@lit-ui/core';
import { dispatchCustomEvent } from '@lit-ui/core';
import type { AccordionItem } from './accordion-item.js';

// Template (packages/cli/src/templates/accordion.ts):
import { TailwindElement, tailwindBaseStyles } from '../../lib/lit-ui/tailwind-element';
import type { AccordionItem } from './accordion-item';

function dispatchCustomEvent(el: HTMLElement, name: string, detail?: unknown) {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}
```

### Custom Element Registration in Template (Bottom of File)
```typescript
// At the bottom of accordion.ts template:
if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-accordion')) {
    customElements.define('lui-accordion', Accordion);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-accordion': Accordion;
  }
}
```

### CSS Variable Fallback Pattern for Standalone Usage
```css
/* In accordion-item template styles: */
.header-button {
  background: var(--ui-accordion-header-bg, transparent);
  color: var(--ui-accordion-header-text, inherit);
  font-weight: var(--ui-accordion-header-font-weight, 500);
  padding: var(--ui-accordion-header-padding, 1rem);
}

.panel-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--ui-accordion-transition, 200ms) ease;
}
```

### Doc Page Import Pattern
```typescript
// AccordionPage.tsx
import { FrameworkProvider } from '../../contexts/FrameworkContext';
import { ExampleBlock } from '../../components/ExampleBlock';
import { PropsTable, type PropDef } from '../../components/PropsTable';
import { SlotsTable, type SlotDef } from '../../components/SlotsTable';
import { PrevNextNav } from '../../components/PrevNextNav';
import { CodeBlock } from '../../components/CodeBlock';

// Side-effect import to register custom elements
import '@lit-ui/accordion';
```

## CSS Variables Reference

### Accordion CSS Variables (from core/styles/tailwind.css)
| Variable | Default | Purpose |
|----------|---------|---------|
| --ui-accordion-border | var(--color-border) | Border color |
| --ui-accordion-border-width | 1px | Border width |
| --ui-accordion-radius | 0.375rem | Container border radius |
| --ui-accordion-header-padding | 1rem | Header button padding |
| --ui-accordion-header-font-weight | 500 | Header font weight |
| --ui-accordion-header-font-size | 1rem | Header font size |
| --ui-accordion-header-text | var(--color-foreground) | Header text color |
| --ui-accordion-header-bg | transparent | Header background |
| --ui-accordion-header-hover-bg | var(--color-muted) | Header hover background |
| --ui-accordion-panel-padding | 0 1rem 1rem | Panel content padding |
| --ui-accordion-panel-text | var(--color-muted-foreground) | Panel text color |
| --ui-accordion-transition | 200ms | Animation duration |
| --ui-accordion-ring | var(--color-ring) | Focus ring color |

### Tabs CSS Variables (from core/styles/tailwind.css)
| Variable | Default | Purpose |
|----------|---------|---------|
| --ui-tabs-border | var(--color-border) | Border color |
| --ui-tabs-list-bg | var(--color-muted) | Tab list background |
| --ui-tabs-list-padding | 0.25rem | Tab list padding |
| --ui-tabs-list-radius | 0.375rem | Tab list border radius |
| --ui-tabs-list-gap | 0.25rem | Gap between tab buttons |
| --ui-tabs-tab-padding | 0.5rem 1rem | Tab button padding |
| --ui-tabs-tab-radius | 0.25rem | Tab button border radius |
| --ui-tabs-tab-font-size | 0.875rem | Tab font size |
| --ui-tabs-tab-font-weight | 500 | Tab font weight |
| --ui-tabs-tab-text | var(--color-muted-foreground) | Inactive tab text |
| --ui-tabs-tab-bg | transparent | Inactive tab background |
| --ui-tabs-tab-hover-text | var(--color-foreground) | Hover tab text |
| --ui-tabs-tab-hover-bg | transparent | Hover tab background |
| --ui-tabs-tab-active-text | var(--color-foreground) | Active tab text |
| --ui-tabs-tab-active-bg | var(--color-background) | Active tab background |
| --ui-tabs-tab-active-shadow | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Active tab shadow |
| --ui-tabs-panel-padding | 1rem 0 | Panel padding |
| --ui-tabs-panel-text | var(--color-foreground) | Panel text |
| --ui-tabs-ring | var(--color-ring) | Focus ring |
| --ui-tabs-transition | 150ms | Transition duration |
| --ui-tabs-indicator-color | var(--color-primary) | Indicator color |
| --ui-tabs-indicator-height | 2px | Indicator height |
| --ui-tabs-indicator-radius | 9999px | Indicator border radius |
| --ui-tabs-indicator-transition | 200ms | Indicator transition |
| --ui-tabs-scroll-button-size | 2rem | Scroll button size |

## Plan Decomposition Guidance

### Plan 60-01: CLI Templates and Registry

**Template files to create (4 files):**
1. `packages/cli/src/templates/accordion.ts` - Accordion container template
2. `packages/cli/src/templates/accordion-item.ts` - AccordionItem template
3. `packages/cli/src/templates/tabs.ts` - Tabs container template
4. `packages/cli/src/templates/tab-panel.ts` - TabPanel template

**Files to modify:**
1. `packages/cli/src/templates/index.ts` - Add imports and COMPONENT_TEMPLATES entries
2. `packages/cli/src/registry/registry.json` - Add accordion and tabs entries

**Template transformation checklist (per file):**
- [ ] Replace `@lit-ui/core` imports with `../../lib/lit-ui/tailwind-element`
- [ ] Inline `dispatchCustomEvent` utility function
- [ ] Add CSS variable fallback values in all `var()` calls
- [ ] Add `customElements.define()` with collision guard at bottom
- [ ] Add `HTMLElementTagNameMap` declaration
- [ ] Fix cross-file imports (use `./accordion-item` not `./accordion-item.js`)
- [ ] Escape template literal characters (backticks, `${}`)
- [ ] Verify all Lit imports present (especially `styleMap` for tabs)

### Plan 60-02: Documentation Pages

**Files to create (2 files):**
1. `apps/docs/src/pages/components/AccordionPage.tsx`
2. `apps/docs/src/pages/components/TabsPage.tsx`

**Files to modify:**
1. `apps/docs/src/App.tsx` - Add routes for accordion and tabs
2. `apps/docs/src/nav.ts` - Add "Accordion" and "Tabs" to Components section
3. Adjacent doc pages' `PrevNextNav` - Update prev/next links

**Doc page content checklist (per page):**
- [ ] Props table with all public properties
- [ ] Slots table
- [ ] CSS custom properties table
- [ ] CSS parts table (if any)
- [ ] Interactive demos: basic usage, key features, variants
- [ ] Accessibility notes section
- [ ] Code examples for HTML, React, Vue, Svelte
- [ ] PrevNextNav with correct adjacent pages

**Accordion demos to include:**
1. Basic single-expand accordion
2. Multi-expand mode
3. Collapsible mode
4. With default expanded item
5. Disabled state
6. Custom heading level
7. Lazy content rendering

**Tabs demos to include:**
1. Basic tabs
2. Vertical orientation
3. Manual activation mode
4. Disabled tabs
5. Lazy panels
6. With default active tab
7. Overflow scroll with many tabs
8. Animated indicator

## Open Questions

1. **Element name prefix in CLI templates**
   - What we know: Some templates use `lui-` prefix (tooltip, popover, toast), others use `ui-` prefix (button, dialog). This appears to be a historical inconsistency.
   - What's unclear: Which prefix should accordion/tabs use?
   - Recommendation: Use `lui-` prefix to match the source packages (`lui-accordion`, `lui-tabs`, `lui-accordion-item`, `lui-tab-panel`). This matches the majority of recent templates.

2. **Nav ordering for Accordion and Tabs**
   - What we know: Components in nav.ts are alphabetically ordered.
   - Recommendation: Insert "Accordion" before "Button" and "Tabs" after "Switch" (alphabetical order).

## Sources

### Primary (HIGH confidence)
- Codebase: `packages/cli/src/templates/` - All 20 existing template files examined
- Codebase: `packages/cli/src/registry/registry.json` - Full registry structure
- Codebase: `packages/cli/src/utils/copy-component.ts` - Template resolution logic (lines 141-143)
- Codebase: `packages/cli/src/utils/registry.ts` - Registry types and dependency resolution
- Codebase: `packages/accordion/src/` - Full accordion source (accordion.ts, accordion-item.ts, index.ts)
- Codebase: `packages/tabs/src/` - Full tabs source (tabs.ts, tab-panel.ts, index.ts)
- Codebase: `packages/core/src/styles/tailwind.css` - All CSS variable definitions
- Codebase: `apps/docs/src/pages/components/TooltipPage.tsx` - Doc page pattern (571 lines)
- Codebase: `apps/docs/src/App.tsx` - Route configuration
- Codebase: `apps/docs/src/nav.ts` - Navigation structure

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, all patterns from existing codebase
- Architecture: HIGH - exact patterns verified across 20+ templates and 15+ doc pages
- Pitfalls: HIGH - identified from actual code resolution logic and edge cases
- CSS variables: HIGH - enumerated from core/styles/tailwind.css source

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (stable - internal codebase patterns)
