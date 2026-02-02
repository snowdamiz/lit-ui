# Architecture Research: Accordion & Tabs

**Domain:** Layout components for Lit.js Shadow DOM component library
**Researched:** 2026-02-02
**Overall confidence:** HIGH

Both Accordion and Tabs follow the same parent-child container pattern already established by RadioGroup and CheckboxGroup. The W3C APG patterns are well-documented and map cleanly to Lit's slot-based composition model.

---

## Accordion Architecture

### Component Structure

Two components in a single `@lit-ui/accordion` package:

| Component | Tag | Role | File |
|-----------|-----|------|------|
| Accordion | `lui-accordion` | Container, manages expand state | `accordion.ts` |
| AccordionItem | `lui-accordion-item` | Individual panel with header + content | `accordion-item.ts` |

**Parent-child relationship:** Follows the RadioGroup pattern -- the parent container discovers children via `slotchange`, manages shared state (which items are expanded), and coordinates keyboard navigation. Children are presentational and dispatch internal events upward.

```
lui-accordion (container, manages state)
  slot[default] -> lui-accordion-item* (discovered via slotchange)
    [header region] -> button with aria-expanded
    [content region] -> div with role="region", animated height
```

**Why two components (not one)?** Each accordion item needs its own header text, value identifier, and disabled state. A single component with slot-based items would require complex slot naming (`header-0`, `content-0`) and break the established pattern. Two components matches RadioGroup/Radio, CheckboxGroup/Checkbox.

### Slot API

**Accordion (container):**
```html
<lui-accordion
  value="item-1"           <!-- Currently expanded item value (single mode) -->
  multiple                 <!-- Allow multiple items open simultaneously -->
  collapsible              <!-- Allow all items to be collapsed (single mode) -->
  disabled                 <!-- Disable entire accordion -->
>
  <slot></slot>            <!-- Default slot for lui-accordion-item children -->
</lui-accordion>
```

**AccordionItem (child):**
```html
<lui-accordion-item
  value="unique-id"        <!-- Identifier for this item -->
  disabled                 <!-- Disable this specific item -->
>
  <slot name="header"></slot>   <!-- Header trigger content (text, icons) -->
  <slot></slot>                 <!-- Panel body content (lazy or eager) -->
</lui-accordion-item>
```

**Usage example:**
```html
<lui-accordion value="faq-1" collapsible>
  <lui-accordion-item value="faq-1">
    <span slot="header">What is LitUI?</span>
    <p>A framework-agnostic component library...</p>
  </lui-accordion-item>
  <lui-accordion-item value="faq-2">
    <span slot="header">How do I install it?</span>
    <p>Run npx lit-ui add accordion...</p>
  </lui-accordion-item>
</lui-accordion>
```

**Multi-expand mode:**
```html
<lui-accordion multiple value='["faq-1","faq-3"]'>
  <!-- value is JSON array in multiple mode, string in single mode -->
</lui-accordion>
```

### State Management

**Single-expand mode (default):**
- `value` property: string identifying the expanded item (empty = all collapsed if `collapsible`, otherwise first item stays open)
- Parent listens for internal `ui-accordion-toggle` events from children
- On toggle: update `value`, call `syncChildStates()` to set `expanded` on matching child
- Pattern: identical to RadioGroup's mutual exclusion via `value` property

**Multi-expand mode (`multiple` attribute):**
- `value` property: JSON string array of expanded item values
- On toggle: add/remove value from array, update all children
- Pattern: similar to CheckboxGroup where children are independent but coordinated

**State flow:**
```
User clicks header
  -> AccordionItem dispatches ui-accordion-toggle (bubbles, composed)
  -> Accordion catches event, stopPropagation (internal event)
  -> Accordion updates value property
  -> Accordion calls syncChildStates() -- sets item.expanded = true/false
  -> AccordionItem reacts to expanded property change, triggers animation
  -> Accordion dispatches ui-change (consumer-facing event)
```

**Why parent owns state (not children):** Same rationale as RadioGroup -- in single mode, expanding one item must collapse others. Parent coordination prevents race conditions and matches established patterns. In multiple mode, parent still owns state for programmatic control (`accordion.value = '["a","b"]'`).

### Animation Approach

**CSS transition on max-height with measured content height.** This is the most reliable cross-browser approach for smooth expand/collapse within Shadow DOM.

```css
.content-wrapper {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height var(--ui-accordion-transition) ease-out,
    opacity var(--ui-accordion-transition) ease-out;
}

:host([expanded]) .content-wrapper {
  max-height: var(--_content-height); /* Set via JS measurement */
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .content-wrapper {
    transition: none;
  }
}
```

**Height measurement strategy:**
1. On `expanded` change to true: measure `scrollHeight` of the content container
2. Set `--_content-height` CSS variable to measured value + "px"
3. On `transitionend`: optionally set `max-height: none` for dynamic content
4. On collapse: re-measure current height, set explicit value, then transition to 0

**Why max-height over Web Animations API or grid-template-rows trick:**
- `max-height` with measured values gives exact pixel transitions (no guessing)
- No external dependencies (consistent with project's CSS-transitions-only approach per KEY DECISIONS)
- `grid-template-rows: 0fr -> 1fr` is newer but has quirks with padding/border
- Matches `prefers-reduced-motion` pattern already used in Dialog, Radio, etc.

**Alternative considered: `interpolate-size: allow-keywords` with `height: auto`.**
This CSS property (Chrome 129+, no Firefox/Safari as of early 2026) would allow `transition: height` to animate to `auto`. Too new for this library's browser support targets. Worth revisiting later.

### ARIA Implementation

Per W3C APG Accordion Pattern (verified via official spec):

**AccordionItem header region:**
```html
<h3>  <!-- aria-level configurable via property, default 3 -->
  <button
    aria-expanded="true|false"
    aria-controls="panel-{id}"
    id="header-{id}"
    tabindex="0|-1"  <!-- roving tabindex managed by parent -->
  >
    <slot name="header"></slot>
    <svg class="chevron">...</svg>  <!-- animated rotation indicator -->
  </button>
</h3>
```

**AccordionItem panel region:**
```html
<div
  role="region"
  aria-labelledby="header-{id}"
  id="panel-{id}"
  hidden  <!-- when collapsed, for SSR and a11y -->
>
  <slot></slot>
</div>
```

**Note on `role="region"`:** APG recommends omitting `role="region"` when "more than approximately 6 panels can be expanded at the same time." For single-expand mode (default), always use region. For multiple mode, include it by default but document the guidance.

---

## Tabs Architecture

### Component Structure

Three components in a single `@lit-ui/tabs` package:

| Component | Tag | Role | File |
|-----------|-----|------|------|
| Tabs | `lui-tabs` | Container, manages active tab | `tabs.ts` |
| TabList | `lui-tab-list` | Tab button container with tablist role | `tab-list.ts` |
| TabPanel | `lui-tab-panel` | Content panel | `tab-panel.ts` |

**Wait -- should TabList be a separate component?**

After examining the codebase patterns, **no -- collapse to two components: Tabs and TabPanel.** The tab list should be rendered internally by the Tabs container, not as a separate slotted component. Rationale:

1. RadioGroup renders its own wrapper `<div role="radiogroup">` -- it does not require a separate group element
2. Having the tab list be internal gives the parent full control over `role="tablist"`, keyboard navigation, and active indicator positioning
3. Three components adds DX friction for a pattern that is naturally two-level (tabs + panels)

**Revised structure -- two components:**

| Component | Tag | Role | File |
|-----------|-----|------|------|
| Tabs | `lui-tabs` | Container, renders tab list, manages active tab | `tabs.ts` |
| TabPanel | `lui-tab-panel` | Content panel associated with a tab | `tab-panel.ts` |

```
lui-tabs (container, renders tablist from panel metadata)
  [internal tablist] -> buttons generated from panel labels
  [internal panel area]
    slot[default] -> lui-tab-panel* (discovered via slotchange)
```

**How tab labels are specified:** Each `lui-tab-panel` has a `label` property (and optional `icon` slot). The parent `lui-tabs` reads these labels from slotted children to render the tab buttons. This is the same discovery pattern used by RadioGroup reading `value` from Radio children.

### Slot API

**Tabs (container):**
```html
<lui-tabs
  value="tab-1"             <!-- Currently active tab value -->
  orientation="horizontal"   <!-- horizontal | vertical -->
  activation="automatic"     <!-- automatic | manual -->
  disabled                   <!-- Disable all tabs -->
>
  <slot></slot>              <!-- Default slot for lui-tab-panel children -->
</lui-tabs>
```

**TabPanel (child):**
```html
<lui-tab-panel
  value="unique-id"          <!-- Identifier matching tab -->
  label="Tab Label"          <!-- Text rendered in tab button -->
  disabled                   <!-- Disable this specific tab -->
  lazy                       <!-- Only render content when first activated -->
>
  <slot name="icon"></slot>  <!-- Optional icon for tab button (forwarded) -->
  <slot></slot>              <!-- Panel content -->
</lui-tab-panel>
```

**Usage example:**
```html
<lui-tabs value="overview">
  <lui-tab-panel value="overview" label="Overview">
    <p>Overview content here...</p>
  </lui-tab-panel>
  <lui-tab-panel value="api" label="API Reference" lazy>
    <p>API docs loaded on first activation...</p>
  </lui-tab-panel>
  <lui-tab-panel value="examples" label="Examples">
    <p>Code examples here...</p>
  </lui-tab-panel>
</lui-tabs>
```

**Vertical orientation:**
```html
<lui-tabs value="general" orientation="vertical">
  <lui-tab-panel value="general" label="General">...</lui-tab-panel>
  <lui-tab-panel value="security" label="Security">...</lui-tab-panel>
</lui-tabs>
```

### State Management

**Active tab tracking:**
- `value` property on Tabs container: string identifying the active panel
- On tab click or keyboard activation: update `value`, sync child visibility
- Pattern: identical to RadioGroup -- single selection from a set

**State flow:**
```
User clicks tab button (rendered by Tabs container)
  -> Tabs updates value property
  -> Tabs calls syncPanelVisibility() -- shows matching panel, hides others
  -> Tabs dispatches ui-change (consumer-facing event)

User arrow-keys between tabs:
  automatic mode -> focus AND activate (like RadioGroup arrow keys)
  manual mode -> focus only, Enter/Space to activate
```

**Tab button rendering approach:**
The Tabs component iterates over discovered TabPanel children and renders a button for each:

```typescript
private renderTabList() {
  return html`
    <div role="tablist" aria-orientation=${this.orientation} aria-label=${this.label}>
      ${this.panels.map((panel, i) => html`
        <button
          role="tab"
          id="tab-${panel.value}"
          aria-selected=${panel.value === this.value ? 'true' : 'false'}
          aria-controls="panel-${panel.value}"
          tabindex=${this.getTabIndex(panel, i)}
          ?disabled=${panel.disabled || this.disabled}
          @click=${() => this.selectTab(panel.value)}
        >
          ${panel.label}
        </button>
      `)}
    </div>
  `;
}
```

**Why render tabs internally rather than requiring tab elements as slots:**
- Guarantees correct ARIA relationship between tab and panel
- Tab buttons need to be in a single `role="tablist"` container for keyboard nav
- Active indicator animation requires sibling-relative positioning
- Simpler consumer API (just wrap panels, labels are properties)

### Lazy Loading Approach

**Per-panel `lazy` attribute:**
- When `lazy` is set, panel content slot is not rendered until the panel is first activated
- Once activated, content stays in DOM (no re-creation on revisit)
- Implemented via `@state() private _hasBeenActive = false` on TabPanel

```typescript
// In TabPanel
render() {
  if (this.lazy && !this._hasBeenActive) {
    return nothing;  // Don't render slot content
  }
  return html`<slot></slot>`;
}

// When activated by parent:
activate() {
  this._hasBeenActive = true;
  this.active = true;
}
```

**Why lazy is opt-in per panel (not global):**
- Some tabs have heavy content (code editors, charts), others are lightweight
- Per-panel control matches consumer expectations
- Global lazy would penalize simple text panels with unnecessary delay

### Active Indicator Animation

The active tab indicator (underline/highlight) should animate between tabs:

```css
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--ui-tabs-indicator);
  transition:
    left var(--ui-tabs-transition) ease-out,
    width var(--ui-tabs-transition) ease-out;
}
```

The Tabs component measures the active tab button's `offsetLeft` and `offsetWidth` on value change, then updates CSS custom properties `--_indicator-left` and `--_indicator-width` to animate the indicator.

---

## Shared Patterns

### Keyboard Navigation

Both components use roving tabindex with arrow key navigation, matching the existing RadioGroup pattern.

**Accordion keyboard (W3C APG):**
| Key | Action |
|-----|--------|
| Enter/Space | Toggle focused item expand/collapse |
| ArrowDown | Focus next header (wraps) |
| ArrowUp | Focus previous header (wraps) |
| Home | Focus first header |
| End | Focus last header |
| Tab | Move to next focusable element (standard) |

**Tabs keyboard (W3C APG):**
| Key | Action (horizontal) | Action (vertical) |
|-----|---------------------|-------------------|
| ArrowRight | Next tab (wraps) | -- |
| ArrowLeft | Previous tab (wraps) | -- |
| ArrowDown | -- | Next tab (wraps) |
| ArrowUp | -- | Previous tab (wraps) |
| Home | First tab | First tab |
| End | Last tab | Last tab |
| Enter/Space | Activate tab (manual mode only) | Same |

**Implementation note:** Both can share the same arrow-key-with-wrapping logic from RadioGroup's `handleKeyDown`. Consider extracting a utility function or keeping inline (it is only ~15 lines). Given the existing `KeyboardNavigationManager` class in Calendar, the project has precedent for reusable keyboard utilities, but the accordion/tabs case is simpler -- inline is fine.

### ARIA Pattern Summary

| Pattern | Accordion | Tabs |
|---------|-----------|------|
| Container role | none (implicit) | `tablist` |
| Item trigger role | `button` inside heading | `tab` |
| Content role | `region` | `tabpanel` |
| Active state | `aria-expanded` on button | `aria-selected` on tab |
| Association | `aria-controls` + `aria-labelledby` | `aria-controls` + `aria-labelledby` |
| Focus pattern | Roving tabindex on headers | Roving tabindex on tabs |

### CSS Custom Properties (Design Tokens)

Follow the established `--ui-component-*` naming convention:

**Accordion tokens:**
```css
/* Layout */
--ui-accordion-radius
--ui-accordion-border-width
--ui-accordion-transition        /* duration for expand/collapse */

/* Colors */
--ui-accordion-bg
--ui-accordion-border
--ui-accordion-header-bg
--ui-accordion-header-bg-hover
--ui-accordion-header-text
--ui-accordion-header-text-disabled
--ui-accordion-content-bg
--ui-accordion-content-text

/* Spacing */
--ui-accordion-header-padding-x
--ui-accordion-header-padding-y
--ui-accordion-content-padding-x
--ui-accordion-content-padding-y
--ui-accordion-gap               /* gap between items */

/* Indicator */
--ui-accordion-icon-size
--ui-accordion-icon-color
--ui-accordion-icon-transition
```

**Tabs tokens:**
```css
/* Layout */
--ui-tabs-radius
--ui-tabs-border-width
--ui-tabs-transition

/* Tab list */
--ui-tabs-list-bg
--ui-tabs-list-border
--ui-tabs-list-gap
--ui-tabs-list-padding

/* Tab button */
--ui-tabs-tab-padding-x
--ui-tabs-tab-padding-y
--ui-tabs-tab-text
--ui-tabs-tab-text-active
--ui-tabs-tab-text-disabled
--ui-tabs-tab-bg
--ui-tabs-tab-bg-hover
--ui-tabs-tab-bg-active
--ui-tabs-tab-font-size

/* Indicator */
--ui-tabs-indicator
--ui-tabs-indicator-height
--ui-tabs-indicator-radius

/* Panel */
--ui-tabs-panel-padding
--ui-tabs-panel-bg
--ui-tabs-panel-text
```

### SSR Compatibility

Both components follow the established TailwindElement SSR pattern:

1. `isServer` guard on `attachInternals()` (neither component needs form participation, so this is not needed)
2. `isServer` guard on any DOM measurement (accordion height measurement, tabs indicator positioning)
3. Static styles via `tailwindBaseStyles` spread
4. No `showModal()`, `showPopover()`, or other client-only APIs needed

**SSR-specific considerations:**
- Accordion: server-renders with all panels collapsed (or initial `value` expanded). No animation on initial render -- CSS transitions only apply after first paint.
- Tabs: server-renders with active panel visible, inactive panels hidden via `hidden` attribute. Tab indicator position is set on first `updated()` call on client.

### Disabled State Propagation

Both follow the established pattern from RadioGroup/CheckboxGroup:
- Parent `disabled` propagates to all children via `syncDisabledState()` in `updated()` lifecycle
- Individual items can also be independently disabled
- `aria-disabled="true"` on the relevant trigger element
- `:host([disabled]) { pointer-events: none; opacity: 0.5; }` for visual state

---

## Integration Points

### With Existing LitUI Architecture

| Integration Point | How It Connects | Impact |
|---|---|---|
| **TailwindElement base class** | Both Accordion and Tabs extend TailwindElement | No changes to core needed |
| **tailwindBaseStyles** | Spread into static styles array | Standard pattern, no changes |
| **dispatchCustomEvent** | Used for `ui-change` and internal events | Import from `@lit-ui/core`, no changes |
| **CSS custom properties** | New `--ui-accordion-*` and `--ui-tabs-*` tokens in tailwind.css | Add to `:root` block in core's tailwind.css, add to tokens/index.ts |
| **Dark mode** | `:host-context(.dark)` for dark overrides | Standard pattern, add dark token values |
| **CLI templates** | New template files for accordion, accordion-item, tabs, tab-panel | Add to `packages/cli/src/templates/` and registry |
| **CLI registry** | New entries in registry.json | `accordion` depends on `core`, `tabs` depends on `core` |
| **Package structure** | Two new packages: `@lit-ui/accordion`, `@lit-ui/tabs` | Standard peer deps on `lit` and `@lit-ui/core` |
| **SSR** | Declarative Shadow DOM works with standard Lit SSR | No changes to `@lit-ui/ssr` needed |

### New Files Required

**Package: @lit-ui/accordion**
```
packages/accordion/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts           # exports Accordion, AccordionItem + customElement registration
    accordion.ts       # lui-accordion container
    accordion-item.ts  # lui-accordion-item child
    jsx.d.ts           # JSX type declarations
    vite-env.d.ts
```

**Package: @lit-ui/tabs**
```
packages/tabs/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts           # exports Tabs, TabPanel + customElement registration
    tabs.ts            # lui-tabs container
    tab-panel.ts       # lui-tab-panel child
    jsx.d.ts           # JSX type declarations
    vite-env.d.ts
```

**CLI templates:**
```
packages/cli/src/templates/
  accordion.ts          # lui-accordion template
  accordion-item.ts     # lui-accordion-item template
  tabs.ts               # lui-tabs template
  tab-panel.ts          # lui-tab-panel template
```

**Core token additions:**
```
packages/core/src/tokens/index.ts   # Add accordion and tabs token objects
packages/core/src/styles/tailwind.css  # Add --ui-accordion-* and --ui-tabs-* to :root
```

### Modified Files

| File | Change |
|------|--------|
| `packages/core/src/tokens/index.ts` | Add `accordion` and `tabs` token objects |
| `packages/core/src/styles/tailwind.css` | Add CSS custom property defaults for accordion and tabs |
| `packages/cli/src/templates/index.ts` | Export and register new templates |
| `pnpm-workspace.yaml` | Already includes `packages/*` glob -- no change needed |
| `apps/docs/` | New documentation pages (separate concern) |

---

## Suggested Build Order

Based on dependency analysis and complexity:

### Phase 1: Accordion (build first)

**Rationale:** Accordion is simpler than Tabs -- no indicator animation, no lazy loading, no orientation variants. The expand/collapse animation is the main technical challenge, and solving it first establishes a pattern.

1. **Scaffold `@lit-ui/accordion` package** -- package.json, tsconfig, vite.config (copy from radio)
2. **AccordionItem component** -- header slot, content slot, expanded property, ARIA attributes, chevron SVG indicator
3. **Accordion container** -- slotchange discovery, value management, single/multiple mode, keyboard navigation
4. **Expand/collapse animation** -- max-height measurement, CSS transitions, reduced-motion support
5. **CSS tokens** -- add `--ui-accordion-*` to core tailwind.css and tokens/index.ts
6. **CLI templates** -- accordion.ts and accordion-item.ts template strings
7. **Disabled state** -- parent propagation, individual item disabled

### Phase 2: Tabs (build second, reuse patterns)

**Rationale:** Tabs reuses the parent-child discovery pattern from Accordion, adds orientation and lazy loading.

1. **Scaffold `@lit-ui/tabs` package** -- package.json, tsconfig, vite.config
2. **TabPanel component** -- label property, value, active/hidden states, lazy rendering
3. **Tabs container** -- slotchange discovery, tab list rendering from panel metadata, value management
4. **Keyboard navigation** -- automatic/manual activation modes, horizontal/vertical orientation
5. **Active indicator animation** -- position measurement, CSS transition
6. **CSS tokens** -- add `--ui-tabs-*` to core tailwind.css and tokens/index.ts
7. **CLI templates** -- tabs.ts and tab-panel.ts template strings
8. **Lazy loading** -- per-panel `lazy` attribute with `_hasBeenActive` tracking

### Phase 3: Integration (both components)

1. **Documentation pages** -- interactive demos, API reference, accessibility notes
2. **CLI registry update** -- add accordion and tabs entries with dependencies
3. **SSR verification** -- test with Astro/Next.js examples

---

## Sources

- W3C APG Accordion Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/ (HIGH confidence -- authoritative spec)
- W3C APG Tabs Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ (HIGH confidence -- authoritative spec)
- Existing codebase: `packages/radio/src/radio-group.ts` -- parent-child pattern with roving tabindex (HIGH confidence -- source code)
- Existing codebase: `packages/radio/src/radio.ts` -- presentational child pattern (HIGH confidence -- source code)
- Existing codebase: `packages/checkbox/src/checkbox-group.ts` -- multi-select group pattern (HIGH confidence -- source code)
- Existing codebase: `packages/dialog/src/dialog.ts` -- CSS transition and @starting-style pattern (HIGH confidence -- source code)
- Existing codebase: `packages/core/src/tailwind-element.ts` -- base class and SSR pattern (HIGH confidence -- source code)
- Existing codebase: `packages/core/src/utils/events.ts` -- dispatchCustomEvent utility (HIGH confidence -- source code)
- Existing codebase: `packages/core/src/tokens/index.ts` -- token naming convention (HIGH confidence -- source code)
