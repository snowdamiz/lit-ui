# Phase 58: Tabs Core - Research

**Researched:** 2026-02-02
**Domain:** Lit.js parent-child web component with W3C APG Tabs pattern
**Confidence:** HIGH

## Summary

Phase 58 implements `lui-tabs` (container with tablist) and `lui-tab-panel` (child panel) elements following the established parent-child container pattern from RadioGroup/CheckboxGroup/Accordion. The W3C ARIA Authoring Practices Guide defines the authoritative Tabs pattern with specific keyboard interactions, activation modes (automatic vs manual), and ARIA roles/attributes (`tablist`, `tab`, `tabpanel` with `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation`).

The key architectural difference from Accordion is that Tabs renders the tab buttons (role="tab") **inside the container's own shadow DOM** based on metadata from slotted TabPanel children, rather than having each child render its own trigger. This is because the tablist must be a single contiguous element with role="tablist" for screen readers, and tab buttons must be direct children of the tablist. The tab panels are slotted children that show/hide based on active state.

The secondary key difference from Accordion/RadioGroup is the dual activation mode: automatic (arrow keys immediately activate the focused tab, like RadioGroup) and manual (arrow keys only move focus, Enter/Space activates, like Accordion headers). Both modes use roving tabindex. Orientation (horizontal/vertical) determines which arrow keys are used.

**Primary recommendation:** Container discovers `lui-tab-panel` children via `slotchange`, reads their `value` and `label` attributes, and renders tab buttons in the container's shadow DOM tablist. Container owns active tab state (`value`/`default-value`). Tab panels are simple elements that show/hide via `active` property set by container. Keyboard navigation reuses the roving tabindex pattern from RadioGroup/Accordion, with orientation-aware arrow key mapping and activation mode branching.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Reactive properties, shadow DOM, lifecycle | Already used across all components |
| @lit-ui/core | ^1.0.0 | TailwindElement base, dispatchCustomEvent, isServer, tailwindBaseStyles | Standard base for every LitUI component |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | ^3.3.2 | @property, @state decorators | All reactive properties |
| lit (nothing) | ^3.3.2 | `nothing` sentinel for conditional ARIA attrs | aria-disabled, aria-orientation conditional rendering |
| lit (isServer) | ^3.3.2 | SSR guards | firstUpdated slotchange workaround, data-state |
| lit (repeat) | ^3.3.2 | `repeat` directive for keyed tab button rendering | Efficient tab list re-rendering when panels change |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Container-rendered tabs | Each panel renders its own tab button | Breaks tablist contiguity requirement; screen readers need all tabs as siblings under role="tablist" |
| Roving tabindex | aria-activedescendant | Roving tabindex is established pattern in this codebase; aria-activedescendant adds complexity |
| Show/hide panels | Remove/add panels from DOM | Show/hide preserves panel state (form inputs, scroll position); simpler lifecycle |

**Installation:**
No new dependencies. Only `@lit-ui/core` (already a workspace dependency).

## Architecture Patterns

### Recommended Project Structure
```
packages/tabs/
  src/
    tabs.ts              # lui-tabs container element (renders tablist + manages state)
    tab-panel.ts         # lui-tab-panel child element (panel content wrapper)
    index.ts             # Registration, exports, HTMLElementTagNameMap
    jsx.d.ts             # React/Vue/Svelte type declarations
    vite-env.d.ts        # Vite types
  package.json           # @lit-ui/tabs, peer deps on lit + @lit-ui/core
  tsconfig.json
  vite.config.ts         # createLibraryConfig({ entry: 'src/index.ts' })
```

### Pattern 1: Container-Rendered Tablist (NEW - differs from Accordion)
**What:** The `lui-tabs` container renders tab buttons inside its own shadow DOM based on metadata (value, label, disabled) read from slotted `lui-tab-panel` children. This ensures the tablist is a single contiguous element with all tab buttons as direct siblings.
**When to use:** When the trigger elements (tabs) must be grouped as siblings under a single ARIA role container.
**Why different from Accordion:** Accordion headers are inside each AccordionItem's shadow DOM. Tabs cannot do this because the W3C APG requires all role="tab" elements to be direct children of role="tablist". Splitting tabs across shadow boundaries breaks screen reader navigation.
**Example:**
```typescript
// lui-tabs container renders the tablist from panel metadata
render() {
  return html`
    <div class="tabs-wrapper">
      <div
        role="tablist"
        aria-orientation="${this.orientation}"
        aria-label="${this.label || nothing}"
        @keydown=${this.handleKeyDown}
      >
        ${this.panels.map((panel, i) => html`
          <button
            id="${this.tabsId}-tab-${panel.value}"
            role="tab"
            aria-selected="${panel.value === this.value ? 'true' : 'false'}"
            aria-controls="${this.tabsId}-panel-${panel.value}"
            aria-disabled="${panel.disabled ? 'true' : nothing}"
            tabindex="${panel.value === this.value ? '0' : '-1'}"
            @click=${() => this.handleTabClick(panel.value, panel.disabled)}
          >
            ${panel.label}
          </button>
        `)}
      </div>
      <div class="panels-container">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    </div>
  `;
}
```

### Pattern 2: Panel Metadata Discovery via Slotchange
**What:** Container discovers `lui-tab-panel` children via slotchange, reads their `value`, `label`, and `disabled` attributes to build the tab button list. Uses MutationObserver or re-reads on attribute changes.
**When to use:** Building the tablist from slotted panel metadata.
**Example:**
```typescript
// Discover panels and extract metadata
private handleSlotChange(e: Event): void {
  const slot = e.target as HTMLSlotElement;
  const assigned = slot.assignedElements({ flatten: true });
  this.panels = assigned.filter(
    (el) => el.tagName === 'LUI-TAB-PANEL'
  ) as TabPanel[];
  this.syncPanelStates();
  this.updateRovingTabindex();
}

// Panel metadata used for tab button rendering
interface PanelMeta {
  value: string;
  label: string;
  disabled: boolean;
}
```

### Pattern 3: Dual Activation Mode (automatic vs manual)
**What:** In automatic mode (default), arrow keys move focus AND immediately activate the tab (like RadioGroup). In manual mode, arrow keys only move focus; Enter/Space activates (like Accordion headers).
**When to use:** Tabs component always needs both modes per W3C APG.
**Example:**
```typescript
private handleKeyDown(e: KeyboardEvent): void {
  const keys = this.orientation === 'horizontal'
    ? ['ArrowLeft', 'ArrowRight']
    : ['ArrowUp', 'ArrowDown'];
  const allKeys = [...keys, 'Home', 'End'];

  // Manual mode also handles Enter/Space
  if (this.activationMode === 'manual') {
    allKeys.push('Enter', ' ');
  }

  if (!allKeys.includes(e.key)) return;
  e.preventDefault();

  if (e.key === 'Enter' || e.key === ' ') {
    // Manual activation: activate the currently focused tab
    const focusedPanel = this.enabledPanels.find(p => /* has tabindex=0 */);
    if (focusedPanel) this.activateTab(focusedPanel.value);
    return;
  }

  // Arrow navigation with wrapping
  const nextIndex = this.getNextIndex(e.key);

  if (this.activationMode === 'automatic') {
    // Auto: move focus AND activate
    this.activateTab(this.enabledPanels[nextIndex].value);
  }
  // Focus the next tab button
  this.focusTab(nextIndex);
}
```

### Pattern 4: Orientation-Aware Arrow Keys
**What:** Horizontal tabs use Left/Right arrows. Vertical tabs use Up/Down arrows. The opposite axis arrows are ignored to avoid interfering with in-page scrolling.
**When to use:** All tabs implementations.
**Example:**
```typescript
// Map orientation to arrow keys
private get forwardKey(): string {
  return this.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
}

private get backwardKey(): string {
  return this.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
}
```

### Pattern 5: Tab Focus to Panel (Tab key behavior)
**What:** When focus is on a tab in the tablist, pressing Tab moves focus to the active panel content (or the first focusable element within it). The tabpanel should have `tabindex="0"` so it is focusable even without interactive children.
**When to use:** W3C APG requirement TABS-09.
**Example:**
```typescript
// In panel element, set tabindex when active
// Active panel gets tabindex="0" so Tab from tablist lands on it
static override styles = [
  ...tailwindBaseStyles,
  css`
    :host { display: block; }
    :host(:not([active])) { display: none; }
  `
];
```

### Pattern 6: Shadow-Internal ARIA ID Wiring
**What:** All ARIA-connected elements (tab buttons with aria-controls, panels with aria-labelledby) use shadow-internal IDs. Since tab buttons are in the container's shadow DOM and panels are slotted (light DOM), the aria-controls/aria-labelledby references cross the shadow boundary. This is a known issue -- tab buttons use shadow-internal IDs, and panels get their ARIA attributes set programmatically via properties rather than ID references.
**When to use:** Tabs specifically, because tabs and panels are in different DOM trees.
**Critical detail:** Since `aria-controls` on shadow DOM tab buttons references panel IDs that are in light DOM (slotted), this cross-boundary reference will NOT work for screen readers. Instead, the container should set `aria-labelledby` on the panel element as a host attribute (light DOM), and tab buttons can use `aria-controls` pointing to panel IDs that are also host-level attributes on the panel elements. Both tab IDs and panel IDs should be set as attributes on the host elements so they exist in the same (light DOM) scope.
**Alternative approach:** Render everything (tabs AND panels) in shadow DOM, using slots only for panel content. This keeps all ARIA ID references within the same shadow root, consistent with Accordion's approach.
**Recommendation:** Render tab buttons AND panel wrappers in shadow DOM. Panel content is slotted into shadow DOM panel wrappers. This avoids cross-boundary ARIA issues entirely.
**Example:**
```typescript
// All ARIA-linked elements in the same shadow root
private tabsId = `lui-tabs-${Math.random().toString(36).substr(2, 9)}`;

render() {
  return html`
    <div role="tablist" aria-orientation="${this.orientation}">
      ${this.panels.map(panel => html`
        <button
          id="${this.tabsId}-tab-${panel.value}"
          role="tab"
          aria-selected="${panel.value === this.value ? 'true' : 'false'}"
          aria-controls="${this.tabsId}-panel-${panel.value}"
        >${panel.label}</button>
      `)}
    </div>
    ${this.panels.map(panel => html`
      <div
        id="${this.tabsId}-panel-${panel.value}"
        role="tabpanel"
        aria-labelledby="${this.tabsId}-tab-${panel.value}"
        tabindex="0"
        ?hidden=${panel.value !== this.value}
      >
        <!-- Content from the corresponding lui-tab-panel -->
      </div>
    `)}
  `;
}
```
**Issue with above:** Cannot easily slot specific panel content into specific shadow DOM wrappers. Named slots require static slot names.

**RECOMMENDED APPROACH:** Use a single default slot for all panels. The container renders tab buttons in shadow DOM. Panels are slotted light DOM elements. The `lui-tab-panel` elements set their own ARIA attributes (`role="tabpanel"`, `aria-labelledby`) as host-level attributes (visible in light DOM). The container sets `aria-controls` on tab buttons pointing to panel host IDs that are also set as light DOM attributes.

Since `aria-controls` on a shadow DOM button cannot reference a light DOM element ID, the pragmatic solution is:
1. Tab buttons have `role="tab"` and `aria-selected` in shadow DOM (these work without ID references)
2. Panel elements set `role="tabpanel"` on their host (light DOM)
3. Skip `aria-controls`/`aria-labelledby` cross-boundary references OR use a workaround where the container sets IDs on the host-level tab-panel elements and then uses `aria-controls` on buttons pointing to those IDs via `ElementInternals.ariaControlsElements` (not widely supported).

**FINAL RECOMMENDATION:** Follow the Accordion approach -- keep ARIA simple. Tab buttons are in shadow DOM with `role="tab"`, `aria-selected`. Panel wrappers are also in shadow DOM with `role="tabpanel"`, `aria-labelledby`. User content is slotted into panel wrappers. This mirrors the Accordion pattern exactly (header button + panel region both in shadow DOM, user content via slots).

The challenge is routing each panel's slotted content to the correct shadow DOM panel wrapper. Solution: use named slots where each `lui-tab-panel` has a unique slot name derived from its value, and the container creates corresponding named `<slot name="...">` elements inside the panel wrappers.

### Anti-Patterns to Avoid
- **Tab buttons rendered by child elements:** Breaks tablist contiguity. All role="tab" elements must be siblings under role="tablist".
- **ARIA ID references across shadow boundaries:** Screen readers cannot resolve cross-boundary ID refs. Keep all ARIA-linked elements in the same shadow root.
- **Horizontal arrow keys on vertical tabs:** Must respect orientation. Left/Right for horizontal, Up/Down for vertical.
- **Auto-activation in manual mode:** Arrow keys must NOT activate tabs in manual mode. Only Enter/Space activates.
- **Removing inactive panels from DOM:** Destroys panel state (form inputs, scroll position). Use show/hide (display:none or hidden attribute) instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event dispatching | Manual `new CustomEvent()` | `dispatchCustomEvent()` from @lit-ui/core | Ensures `bubbles: true, composed: true` defaults |
| Base class setup | Raw LitElement | TailwindElement from @lit-ui/core | Handles Tailwind injection, SSR dual-mode |
| Unique ID generation | UUID library | `Math.random().toString(36).substr(2, 9)` | Pattern used by all existing components |
| Keyboard nav logic | Custom from scratch | Adapt from RadioGroup/Accordion | Wrapping, disabled skip, Home/End all proven |
| Panel show/hide | Custom visibility management | CSS `:host(:not([active]))` or `hidden` attribute | Declarative, no JS measurement needed |

**Key insight:** Tabs reuses the same parent-child, roving tabindex, and state management patterns as Accordion/RadioGroup. The only new pattern is the container-rendered tablist (tabs generated from panel metadata) and the dual activation mode (automatic/manual).

## Common Pitfalls

### Pitfall 1: ARIA ID References Across Shadow DOM (CRITICAL)
**What goes wrong:** Tab buttons (shadow DOM) use `aria-controls` pointing to panel IDs in light DOM. Screen readers cannot resolve cross-boundary ID references.
**Why it happens:** Tabs and panels are in different DOM trees when using slotted content.
**How to avoid:** Two valid approaches: (A) Render panel wrappers with role="tabpanel" inside shadow DOM and use named slots for content, keeping all ARIA in the same shadow root. (B) Accept that aria-controls/aria-labelledby will be limited and rely on aria-selected + role semantics for screen reader support. Approach A is preferred for full APG compliance.
**Warning signs:** Screen reader does not announce panel association with tab, cannot navigate from tab to panel.

### Pitfall 2: Tab Buttons Not Contiguous Under Tablist (HIGH)
**What goes wrong:** If each `lui-tab-panel` renders its own tab trigger (like Accordion), the tab buttons are scattered across different shadow roots and are NOT siblings under a single role="tablist" container.
**Why it happens:** Developer copies Accordion pattern verbatim.
**How to avoid:** Container MUST render all tab buttons itself based on panel metadata. Panels are content-only elements.
**Warning signs:** Screen reader announces individual tabs but not "tab 1 of N" or cannot navigate between tabs with arrows.

### Pitfall 3: Activation Mode Confusion (HIGH)
**What goes wrong:** Auto mode behaves like manual (arrows don't activate), or manual mode behaves like auto (arrows activate).
**Why it happens:** RadioGroup always auto-activates on arrow keys. Developer copies RadioGroup behavior without adding the manual mode branch.
**How to avoid:** Explicit `activationMode` property ('automatic' | 'manual'). In handleKeyDown, branch on mode: auto = move focus + activate; manual = move focus only, Enter/Space activates separately.
**Warning signs:** User complaints about keyboard behavior not matching expectations.

### Pitfall 4: Wrong Arrow Keys for Orientation (HIGH)
**What goes wrong:** Vertical tabs respond to Left/Right arrows instead of Up/Down.
**Why it happens:** Developer hardcodes horizontal arrow keys.
**How to avoid:** Map arrow keys based on `orientation` property. Horizontal = Left/Right. Vertical = Up/Down. Home/End work in both orientations.
**Warning signs:** Arrow keys don't navigate tabs in vertical orientation.

### Pitfall 5: slotchange Not Firing After SSR Hydration (CRITICAL)
**What goes wrong:** Same as Accordion -- component renders server-side, but slotchange never fires on client hydration. Panel list stays empty, no tabs render.
**Why it happens:** Browser hydration attaches existing DOM without re-assigning slots.
**How to avoid:** In `firstUpdated()`, manually dispatch `slotchange` on the default slot (established SSR workaround from Accordion/RadioGroup).
**Warning signs:** No tab buttons appear after SSR, panels don't respond.

### Pitfall 6: Tab Key Behavior (MEDIUM)
**What goes wrong:** Tab key cycles through all tab buttons instead of jumping to the active panel.
**Why it happens:** All tab buttons have tabindex=0 instead of roving tabindex (only active tab = 0, others = -1).
**How to avoid:** Roving tabindex pattern. Only the active/focused tab button has tabindex=0. All other tab buttons have tabindex=-1. Active panel has tabindex="0" so Tab from tablist lands on it.
**Warning signs:** Tab key takes many presses to escape the tab list.

### Pitfall 7: Panel Metadata Out of Sync (MEDIUM)
**What goes wrong:** Tab buttons show stale labels or disabled states when panel attributes change dynamically.
**Why it happens:** Container reads panel metadata once on slotchange but doesn't observe attribute changes.
**How to avoid:** Use MutationObserver on panels to watch for attribute changes (label, disabled), OR re-read metadata in the container's update cycle. Alternatively, panels can dispatch an internal event when their label/disabled changes, and the container re-syncs.
**Warning signs:** Changing a panel's label attribute doesn't update the corresponding tab button text.

### Pitfall 8: Dynamic Panel Add/Remove (MEDIUM)
**What goes wrong:** Adding or removing a `lui-tab-panel` doesn't update the tab buttons.
**Why it happens:** Developer doesn't handle slotchange for dynamic changes.
**How to avoid:** The slotchange handler already fires when slotted content changes. Ensure `handleSlotChange` fully rebuilds the panels array and re-syncs state. If the active panel is removed, fall back to the first available panel.
**Warning signs:** Ghost tab buttons for removed panels, missing buttons for new panels.

## Code Examples

### Complete Tabs Container Shadow DOM Structure
```typescript
// Verified pattern combining APG Tabs spec + container-rendered tablist + roving tabindex
render() {
  return html`
    <div class="tabs-wrapper ${this.orientation === 'vertical' ? 'tabs-vertical' : ''}">
      <div
        role="tablist"
        aria-orientation="${this.orientation}"
        aria-label="${this.label || nothing}"
        class="tablist"
        @keydown=${this.handleKeyDown}
      >
        ${this.panels.map(panel => html`
          <button
            id="${this.tabsId}-tab-${panel.value}"
            role="tab"
            aria-selected="${panel.value === this.value ? 'true' : 'false'}"
            aria-controls="${this.tabsId}-panel-${panel.value}"
            aria-disabled="${panel.disabled ? 'true' : nothing}"
            tabindex="${this.getTabIndex(panel)}"
            class="tab-button ${panel.value === this.value ? 'tab-active' : ''}"
            @click=${() => this.handleTabClick(panel.value, panel.disabled)}
          >
            ${panel.label}
          </button>
        `)}
      </div>
      <div class="panels-container">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    </div>
  `;
}
```

### TabPanel Element (Simple Content Wrapper)
```typescript
// lui-tab-panel - minimal element, container manages all behavior
export class TabPanel extends TailwindElement {
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean, reflect: true }) active = false;

  static override styles = [
    ...tailwindBaseStyles,
    css`
      :host { display: block; }
      :host(:not([active])) { display: none; }
    `
  ];

  render() {
    return html`<slot></slot>`;
  }
}
```

### Keyboard Navigation with Activation Modes
```typescript
private handleKeyDown(e: KeyboardEvent): void {
  const isForward = e.key === this.forwardKey;
  const isBackward = e.key === this.backwardKey;
  const isHome = e.key === 'Home';
  const isEnd = e.key === 'End';
  const isActivate = e.key === 'Enter' || e.key === ' ';

  if (!isForward && !isBackward && !isHome && !isEnd && !isActivate) return;
  e.preventDefault();

  const enabledPanels = this.panels.filter(p => !p.disabled);
  if (enabledPanels.length === 0) return;

  // Manual mode: Enter/Space activates focused tab
  if (isActivate && this.activationMode === 'manual') {
    const focusedTab = this.getFocusedTab();
    if (focusedTab) this.activateTab(focusedTab.value);
    return;
  }

  // Navigation
  const currentIndex = this.getFocusedIndex(enabledPanels);
  let nextIndex: number;

  if (isForward) {
    nextIndex = (currentIndex + 1) % enabledPanels.length;
  } else if (isBackward) {
    nextIndex = (currentIndex - 1 + enabledPanels.length) % enabledPanels.length;
  } else if (isHome) {
    nextIndex = 0;
  } else if (isEnd) {
    nextIndex = enabledPanels.length - 1;
  } else {
    return;
  }

  // Auto mode: navigate AND activate
  if (this.activationMode === 'automatic') {
    this.activateTab(enabledPanels[nextIndex].value);
  }

  // Both modes: move focus
  this.focusTabButton(enabledPanels[nextIndex].value);
  this.updateRovingTabindex(enabledPanels[nextIndex].value);
}
```

### CSS Custom Properties Block (for tailwind.css :root)
```css
/* -------------------------------------------------------------------------
 * Tabs Component
 * ------------------------------------------------------------------------- */

/* Layout */
--ui-tabs-border: var(--color-border, var(--ui-color-border));
--ui-tabs-border-width: 1px;

/* Tab list */
--ui-tabs-list-bg: var(--color-muted, var(--ui-color-muted));
--ui-tabs-list-padding: 0.25rem;
--ui-tabs-list-radius: 0.375rem;
--ui-tabs-list-gap: 0.25rem;

/* Tab button */
--ui-tabs-tab-padding: 0.5rem 1rem;
--ui-tabs-tab-radius: 0.25rem;
--ui-tabs-tab-font-size: 0.875rem;
--ui-tabs-tab-font-weight: 500;
--ui-tabs-tab-text: var(--color-muted-foreground, var(--ui-color-muted-foreground));
--ui-tabs-tab-bg: transparent;
--ui-tabs-tab-hover-text: var(--color-foreground, var(--ui-color-foreground));
--ui-tabs-tab-hover-bg: transparent;

/* Active tab */
--ui-tabs-tab-active-text: var(--color-foreground, var(--ui-color-foreground));
--ui-tabs-tab-active-bg: var(--color-background, white);
--ui-tabs-tab-active-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Panel */
--ui-tabs-panel-padding: 1rem 0;
--ui-tabs-panel-text: var(--color-foreground, var(--ui-color-foreground));

/* Focus */
--ui-tabs-ring: var(--color-ring, var(--ui-color-ring));

/* Transition */
--ui-tabs-transition: 150ms;
```

### Dark Mode Overrides (for tailwind.css .dark block)
```css
/* Tabs dark mode */
--ui-tabs-list-bg: var(--color-gray-800);
--ui-tabs-tab-text: var(--color-gray-400);
--ui-tabs-tab-hover-text: var(--color-gray-50);
--ui-tabs-tab-active-text: var(--color-gray-50);
--ui-tabs-tab-active-bg: var(--color-gray-900);
--ui-tabs-panel-text: var(--color-gray-50);
```

### Element Registration Pattern (index.ts)
```typescript
// Source: packages/accordion/src/index.ts pattern
import { isServer } from 'lit';
export { Tabs } from './tabs.js';
export { TabPanel } from './tab-panel.js';

import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-tabs')) {
    customElements.define('lui-tabs', Tabs);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-tabs] Custom element already registered.');
  }
  if (!customElements.get('lui-tab-panel')) {
    customElements.define('lui-tab-panel', TabPanel);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn('[lui-tab-panel] Custom element already registered.');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lui-tabs': Tabs;
    'lui-tab-panel': TabPanel;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery UI tabs with manual DOM manipulation | Custom elements with declarative ARIA | N/A | Framework-agnostic, SSR-compatible |
| aria-activedescendant for focus management | Roving tabindex | N/A (both valid) | Roving tabindex is simpler, used by this project |
| Lazy loading panels on demand | Show/hide all panels, load eagerly | N/A | Simpler, preserves state; lazy loading can be added later |

**Deprecated/outdated:**
- Using `display: none` via JavaScript class toggling: use declarative CSS `:host(:not([active]))` instead
- Tab-based navigation without activation modes: W3C APG requires both automatic and manual activation support

## Open Questions

1. **Named slots vs single default slot for panel content routing**
   - What we know: If we render panel wrappers (role="tabpanel") in shadow DOM for ARIA compliance, we need a way to slot each panel's content into the correct wrapper. Named slots require the slot name to be known at author time.
   - What's unclear: Whether the ARIA cross-boundary limitation is a practical issue for modern screen readers, or whether simpler approach (panels as slotted light DOM with role="tabpanel" set on host) works well enough.
   - Recommendation: Use the simpler approach -- `lui-tab-panel` elements are slotted into a single default slot. Each panel sets `role="tabpanel"` on its own host element. Tab buttons in shadow DOM use `aria-selected` and `role="tab"` without `aria-controls` (or with `aria-controls` as a best-effort). This matches how Radix, Shoelace, and most real-world tabs implementations work. The `aria-selected` + role semantics provide sufficient screen reader context.

2. **Should panel have tabindex="0"?**
   - What we know: W3C APG says tabpanel should have `tabindex="0"` when it doesn't contain focusable elements, so Tab from tablist can reach it.
   - What's unclear: Whether to always set it or conditionally (check for focusable children).
   - Recommendation: Always set `tabindex="0"` on active panel. Simpler, and the standard recommends it as the default approach. Users can override if needed.

3. **Panel metadata sync strategy**
   - What we know: Container reads panel `value`, `label`, `disabled` to render tab buttons. If these attributes change dynamically, the tab buttons must update.
   - What's unclear: Best mechanism -- MutationObserver vs internal events vs polling.
   - Recommendation: Use a lightweight internal event pattern. When a panel's `label` or `disabled` property changes, it dispatches an internal `ui-tab-panel-update` event. The container listens and re-reads metadata. This is simpler than MutationObserver and consistent with the internal event pattern (ui-accordion-toggle, ui-radio-change). Additionally, the container can call `requestUpdate()` to re-render tab buttons.

## Sources

### Primary (HIGH confidence)
- [W3C WAI-ARIA APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) -- Authoritative ARIA spec for tablist/tab/tabpanel roles, keyboard interaction, activation modes. Verified via WebFetch.
- Existing codebase: `packages/accordion/src/accordion.ts` -- Parent-child container pattern, slotchange discovery, roving tabindex, controlled/uncontrolled mode, SSR slotchange workaround, CSS custom property theming
- Existing codebase: `packages/accordion/src/accordion-item.ts` -- Shadow-internal ARIA ID wiring, disabled pattern, data-state, CSS grid animation
- Existing codebase: `packages/radio/src/radio-group.ts` -- Roving tabindex implementation, arrow key navigation with wrapping, Home/End, disabled skip, internal event pattern
- Existing codebase: `packages/radio/src/radio.ts` -- Presentational child pattern, internal event dispatch
- Existing codebase: `packages/core/src/tailwind-element.ts` -- TailwindElement base class, SSR dual-mode styling
- Existing codebase: `packages/core/src/utils/events.ts` -- dispatchCustomEvent utility
- Existing codebase: `packages/core/src/styles/tailwind.css` -- CSS custom property token pattern (:root + .dark blocks), existing component token examples
- Existing codebase: `packages/accordion/src/index.ts` -- Element registration pattern
- Existing codebase: `packages/accordion/src/jsx.d.ts` -- JSX type declaration pattern
- Existing codebase: `packages/accordion/package.json` -- Package structure with peer deps
- Existing codebase: `packages/accordion/vite.config.ts` -- Vite library config
- `.planning/phases/56-accordion-core/56-RESEARCH.md` -- Accordion research with reusable patterns
- `.planning/STATE.md` -- Prior decisions affecting implementation

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources (W3C APG spec + existing codebase)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies, all capabilities exist in current codebase
- Architecture: HIGH -- Direct adaptation of Accordion/RadioGroup parent-child pattern, with well-understood container-rendered tablist variation. W3C APG Tabs spec verified via WebFetch.
- Pitfalls: HIGH -- 8 pitfalls identified from W3C APG spec, existing codebase patterns, and shadow DOM ARIA constraints

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (30 days -- stable domain, no moving parts)
