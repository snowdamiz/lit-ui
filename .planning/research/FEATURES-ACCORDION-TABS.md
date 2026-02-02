# Feature Landscape: Accordion & Tabs

**Domain:** Layout web components for LitUI component library
**Researched:** 2026-02-02
**Overall confidence:** HIGH

## Sources

- [WAI-ARIA APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) - Authoritative accessibility spec (HIGH)
- [WAI-ARIA APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) - Authoritative accessibility spec (HIGH)
- [Radix UI Accordion](https://www.radix-ui.com/primitives/docs/components/accordion) - Headless primitive API (HIGH)
- [Radix UI Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) - Headless primitive API (HIGH)
- [Shoelace/Web Awesome Tab Group](https://shoelace.style/components/tab-group) - Web component reference (HIGH)
- [Ark UI Accordion](https://ark-ui.com/docs/components/accordion) - Headless primitive API (HIGH)
- [Ark UI Tabs](https://ark-ui.com/docs/components/tabs) - Headless primitive API (HIGH)
- [Material Web Tabs](https://material-web.dev/components/tabs/) - Web component reference (HIGH)
- [Headless UI Disclosure](https://headlessui.com/react/disclosure) - Disclosure patterns (HIGH)
- [Headless UI Tabs](https://headlessui.com/v1/react/tabs) - Tab patterns (HIGH)
- [Josh W. Comeau - interpolate-size](https://www.joshwcomeau.com/snippets/html/interpolate-size/) - Height animation techniques (MEDIUM)
- [Builder.io - Animated CSS Accordions](https://www.builder.io/blog/animated-css-accordions) - CSS animation patterns (MEDIUM)
- [216digital - Accordion Accessibility](https://216digital.com/accordion-accessibility-common-issues-fixes/) - Accessibility pitfalls (MEDIUM)
- [Aditus - Accessible Accordion](https://www.aditus.io/patterns/accordion/) - Accessibility patterns (MEDIUM)

---

## Accordion Features

### Table Stakes

Features users expect. Missing any of these makes the accordion feel incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|-------------|------------|-------------|-------|
| **Single-expand mode** | Default mode in every library. Only one panel open at a time; opening one closes the other. Radix `type="single"`, Ark UI default, HTML `<details name="x">` attribute. WAI-ARIA APG explicitly describes this pattern. | LOW | None | Use `type="single"` prop. This is the default mode. |
| **Multi-expand mode** | Every major library supports this. Radix `type="multiple"`, Ark UI `multiple` prop. Users expect to compare content across panels. | LOW | None | Use `type="multiple"` prop. Each panel toggles independently. |
| **Collapsible (all panels closable)** | Radix has `collapsible` prop (default false for single mode). Ark UI has `collapsible` prop. Users expect to close the last open panel. Without this, single-expand forces one panel always open. | LOW | None | Default `collapsible=true` for better UX. Radix defaults to false which surprises many devs. |
| **Keyboard: Enter/Space to toggle** | WAI-ARIA APG required. Every library implements this. The trigger button must respond to Enter and Space to expand/collapse its associated panel. | LOW | None | Use native `<button>` element for triggers -- gets this for free. |
| **Keyboard: Tab/Shift+Tab** | WAI-ARIA APG required. Focus moves through focusable elements in document order. When panel is collapsed, its contents must NOT be focusable. | LOW | None | Use `hidden` attribute or `display:none` on collapsed panels to remove from tab order. Critical accessibility requirement. |
| **aria-expanded on triggers** | WAI-ARIA APG required. Must be `true` when panel is visible, `false` when hidden. Every library implements this. Screen readers announce "expanded" or "collapsed" state. | LOW | None | Toggle `aria-expanded` attribute on the trigger button element. |
| **aria-controls linking** | WAI-ARIA APG required. Trigger button must reference the panel ID via `aria-controls`. Screen readers use this to announce the relationship. | LOW | None | Generate unique IDs for panels, set `aria-controls` on trigger. |
| **Heading wrapper with aria-level** | WAI-ARIA APG requires trigger button wrapped in heading element with appropriate `aria-level`. Radix uses `Accordion.Header`, Ark UI uses `AccordionItemTrigger`. | LOW | None | Wrap trigger in element with `role="heading"` and `aria-level`. Expose `heading-level` prop (default 3). |
| **Animated expand/collapse** | Every modern library animates the height transition. Users perceive non-animated accordions as broken or cheap. Radix exposes `--radix-accordion-content-height` CSS variable. Shoelace animates by default. | MEDIUM | CSS transitions (existing pattern) | Use CSS Grid `0fr`-to-`1fr` trick for broad cross-browser support. Progressive enhance with `interpolate-size` where available. Respect `prefers-reduced-motion`. |
| **Disabled items** | Radix, Ark UI, Headless UI, Shoelace all support disabling individual items. Disabled items cannot be expanded/collapsed and are skipped in keyboard navigation. | LOW | None | `disabled` attribute on individual items. Apply `aria-disabled="true"`, dim styling, skip in keyboard nav. |
| **Default expanded value** | Every library supports setting which panel(s) are open initially. Radix `defaultValue`, Ark UI `defaultValue`, Shoelace `open` attribute. Essential for deep-linking and SSR. | LOW | None | `value`/`default-value` attribute. Accept string for single, array for multiple. |
| **Controlled and uncontrolled modes** | Radix, Ark UI both support controlled (`value`/`onValueChange`) and uncontrolled (`defaultValue`) patterns. Framework users expect to control state externally. | MEDIUM | None | Uncontrolled by default. Support `value` attribute for controlled mode with `change` event. Follows existing LitUI pattern from Select, RadioGroup. |
| **CSS custom properties for theming** | Consistent with all existing LitUI components (--ui-button-*, --ui-dialog-*, etc.). Users expect theming via CSS variables. | LOW | @lit-ui/core theming system | Namespace as `--ui-accordion-*`. Include trigger background, text color, border, content padding, indicator rotation, gap. |
| **data-state attribute** | Radix exposes `data-state="open"/"closed"` on items and content. Enables CSS-only styling of states without JS class toggling. Used by Radix, Ark UI. | LOW | None | Set `data-state="open"` or `data-state="closed"` on item, trigger, and content elements. |

### Differentiators

Features that set LitUI's accordion apart. Not strictly expected, but valued.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|------------------|------------|-------------|-------|
| **Keyboard: Arrow key navigation between headers** | WAI-ARIA APG optional but recommended. Up/Down arrows move focus between accordion triggers. Home/End jump to first/last. Radix and Ark UI implement this. Distinguishes a proper accordion from basic disclosure groups. | MEDIUM | KeyboardNavigationManager (existing, used in RadioGroup, Calendar) | Reuse existing `KeyboardNavigationManager` class. Implement roving tabindex pattern (only active trigger in tab order). |
| **Expand/collapse indicator (chevron)** | Ark UI has `AccordionItemIndicator` part. Radix leaves to userland. Shoelace includes built-in rotate animation. Built-in indicator with rotation animation is a polish feature. | LOW | None | Provide a default chevron SVG that rotates on expand. Allow override via slot. Use CSS `rotate` transition. |
| **Horizontal orientation** | Ark UI supports `orientation` prop. Radix supports it. Uncommon in practice but important for keyboard nav direction (Left/Right vs Up/Down). | LOW | None | `orientation="horizontal"` swaps arrow key directions per WAI-ARIA APG. Visual layout is userland CSS concern. |
| **SSR with Declarative Shadow DOM** | Unique to web component implementations. Accordion must render correctly on server with expanded/collapsed state. Content should be SEO-crawlable. | MEDIUM | @lit-ui/ssr (existing) | Use isServer guards. Collapsed content should still be in HTML (hidden) for SEO. Hydration must restore interactive state. |
| **Slot-based content API** | Web component native pattern. Named slots for trigger content and panel content. More natural than React-style children composition. | LOW | None | Default slot for content, named slot for trigger. Follows existing LitUI component patterns. |
| **Lazy mounting of content** | Ark UI supports lazy mounting where content DOM is only created when panel is first opened. Reduces initial DOM size for accordions with heavy content. | MEDIUM | None | `lazy` attribute on items. Content slot not rendered until first expand. Once rendered, stays in DOM (mount-once pattern). Pairs with SSR -- server renders all content for SEO, client lazy-mounts for performance. |

### Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Built-in nested accordions** | Increases complexity massively. Keyboard navigation becomes ambiguous (which accordion owns arrow keys?). WAI-ARIA APG warns about region role proliferation with nested structures. No major library explicitly builds nested accordion support. | Allow composition naturally (user places accordion inside accordion panel) but do not build special nested-aware keyboard handling or ARIA management. |
| **`region` role on all panels** | WAI-ARIA APG explicitly warns: "avoid using the region role in circumstances that create landmark region proliferation, e.g., in an accordion that contains more than approximately 6 panels." Most real-world accordions have 5+ items. | Only apply `role="region"` with `aria-labelledby` when panel contains headings or nested structure. Default to no region role. Optionally expose a `region` boolean prop for opt-in. |
| **Native `<details>`/`<summary>` under the hood** | Tempting because `<details name="x">` gives exclusive accordion for free. But: inconsistent cross-browser animation support, no roving tabindex, no `aria-expanded` (uses `open` attribute differently), `::details-content` is Chromium-only, and Shadow DOM complicates slotting. Shoelace uses `<details>` for `sl-details` and it is NOT an accordion -- it is a standalone disclosure. | Use `<div>` with `<button>` triggers and ARIA attributes. Full control over keyboard navigation, animation, and accessibility. This is what Radix, Ark UI, and all serious libraries do. |
| **Drag-to-reorder panels** | Adds massive complexity (drag and drop in Shadow DOM is painful). Not expected behavior for accordions. No major library includes this. | If reordering is needed, handle it at the application level by reordering the DOM children. |
| **Search/filter within accordion** | Scope creep. This is an application feature, not a component feature. | Accordion exposes its state; applications can filter items by showing/hiding them. |
| **Built-in loading state per panel** | Overcomplicates the API. Content loading is an application concern. | Users put their own loading spinners inside the content slot. Lazy mounting (differentiator above) handles the DOM creation timing. |

---

## Tabs Features

### Table Stakes

Features users expect. Missing any of these makes the tabs component feel incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|-------------|------------|-------------|-------|
| **Tab list + tab panel structure** | WAI-ARIA APG required pattern. Every library uses `tablist` containing `tab` roles, with associated `tabpanel` roles. Radix: `Tabs.List`/`Tabs.Trigger`/`Tabs.Content`. Material Web: `md-tabs`/`md-primary-tab`. Shoelace: `sl-tab-group`/`sl-tab`/`sl-tab-panel`. | LOW | None | Three-part component: `lui-tabs` (container), `lui-tab` (trigger), `lui-tab-panel` (content). |
| **role="tablist", role="tab", role="tabpanel"** | WAI-ARIA APG required. All libraries implement these roles. Screen readers use these to announce the tabs widget structure. | LOW | None | Set roles on the appropriate elements. `tablist` on the tab container, `tab` on triggers, `tabpanel` on panels. |
| **aria-selected on active tab** | WAI-ARIA APG required. Active tab has `aria-selected="true"`, all others `false`. Every library implements this. | LOW | None | Toggle `aria-selected` when tab changes. |
| **aria-controls / aria-labelledby linking** | WAI-ARIA APG required. Each tab references its panel via `aria-controls`. Each panel references its tab via `aria-labelledby`. | LOW | None | Generate unique IDs, link bidirectionally. |
| **Keyboard: Arrow keys between tabs** | WAI-ARIA APG required. Left/Right for horizontal, Up/Down for vertical. Must wrap around (first to last, last to first). | MEDIUM | KeyboardNavigationManager (existing) | Roving tabindex -- only active tab in tab order. Arrow keys move focus. Reuse existing `KeyboardNavigationManager`. |
| **Keyboard: Tab moves to panel** | WAI-ARIA APG required. When focus is on a tab, Tab key moves focus to the tab panel content (not the next tab). Critical for keyboard efficiency. | LOW | None | Roving tabindex on tablist handles this automatically. Panel should have `tabindex="0"` if it contains no focusable elements. |
| **Automatic activation (default)** | WAI-ARIA APG recommended default. Arrow key focus change immediately activates the tab panel. Radix default, Shoelace `activation="auto"`, Headless UI default. Best for tabs with fast-loading content. | LOW | None | Default mode. Focus change triggers panel switch. |
| **Manual activation** | WAI-ARIA APG describes this for tabs with expensive/slow content. Arrow keys move focus without activating; Enter/Space activates. Shoelace `activation="manual"`, Headless UI `manual` prop. | LOW | None | `activation="manual"` prop. Two-step: focus with arrows, activate with Enter/Space. |
| **Horizontal orientation (default)** | Default in every library. Tabs arranged horizontally, Left/Right arrow keys for navigation. | LOW | None | Default `orientation="horizontal"`. |
| **Vertical orientation** | Radix `orientation="vertical"`, Shoelace `placement="start"/"end"`, Ark UI `orientation="vertical"`. Up/Down arrow keys instead of Left/Right per WAI-ARIA APG. | LOW | None | `orientation="vertical"` prop. Swaps arrow key directions. Layout is CSS -- tabs stacked vertically with content beside them. |
| **Disabled tabs** | Every library supports this. Disabled tabs are not selectable and skipped during keyboard navigation. Radix, Shoelace, Headless UI, Ark UI all support. | LOW | None | `disabled` attribute on individual `lui-tab` elements. Apply `aria-disabled="true"`, dim styling, skip in arrow key navigation. |
| **Default selected tab** | Every library supports initial selection. Radix `defaultValue`, Shoelace first tab, Material Web `active` attribute. | LOW | None | `value`/`default-value` attribute on `lui-tabs`. Defaults to first non-disabled tab if unspecified. |
| **Controlled and uncontrolled modes** | Radix, Ark UI support both. Framework users expect external state control. | MEDIUM | None | Same pattern as Accordion. Uncontrolled default, `value` attribute for controlled with `change` event. |
| **Active tab indicator** | Visual indicator (underline/highlight) showing which tab is active. Shoelace has `--indicator-color`. Material Web has animated indicator. Every tabs implementation has this. | MEDIUM | CSS transitions | Animated sliding indicator that moves between tabs. Use CSS custom property `--ui-tabs-indicator-*` for color, height, radius. |
| **CSS custom properties for theming** | Consistent with all existing LitUI components. | LOW | @lit-ui/core theming system | Namespace as `--ui-tabs-*`. Include tab text color, active color, indicator color/height, background, padding, gap. |
| **data-state attribute** | Consistent with Radix and the Accordion component above. CSS-only state styling. | LOW | None | `data-state="active"/"inactive"` on tabs. `data-state="active"/"inactive"` on panels. |

### Differentiators

Features that set LitUI's tabs apart. Not strictly expected, but valued.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|------------------|------------|-------------|-------|
| **Lazy rendering of tab panels** | Only render the active panel's DOM content. Significant for tabs with heavy content (tables, charts). Ark UI supports lazy mounting. Syncfusion calls this "on-demand" rendering. | MEDIUM | None | `lazy` attribute on `lui-tabs`. Options: `false` (render all, default), `true` (render on first activation, keep in DOM), `"unmount"` (destroy when deactivated). Default to `false` for SSR compatibility. |
| **Overflow scroll with navigation buttons** | When tabs overflow their container, show scroll buttons. Shoelace has this built-in (`no-scroll-controls`, `fixed-scroll-controls`). MUI has `scrollButtons="auto"`. Common in data-heavy dashboards. | MEDIUM | None | Auto-detect overflow with ResizeObserver. Show left/right (or up/down for vertical) scroll buttons. CSS `overflow: auto` with `scroll-behavior: smooth`. Hide buttons when no overflow. |
| **Tab placement (top/bottom/start/end)** | Shoelace supports all four positions. Beyond basic horizontal/vertical, this controls where the tab bar sits relative to content. Mostly a CSS concern. | LOW | None | `placement` attribute: `top` (default), `bottom`, `start`, `end`. `start`/`end` imply vertical orientation. Auto-set `aria-orientation` accordingly. |
| **SSR with Declarative Shadow DOM** | Unique to web component implementations. Tabs must render correctly on server with the active panel visible. | MEDIUM | @lit-ui/ssr (existing) | Active panel rendered server-side. Inactive panels hidden. Hydration restores keyboard navigation. |
| **Keyboard: Home/End** | WAI-ARIA APG optional. Jump to first/last tab. Implemented by Radix and Ark UI. Small addition that improves keyboard efficiency. | LOW | None | Add to KeyboardNavigationManager configuration. |
| **Animated panel transitions** | Crossfade or slide between panels when switching tabs. Subtle but polished. Not standard in most libraries but highly appreciated. | MEDIUM | CSS transitions | Use `opacity` transitions on panels. Optional `--ui-tabs-transition-duration` CSS variable. Respect `prefers-reduced-motion`. |
| **Closable/removable tabs** | Shoelace supports closable tabs. Ant Design supports it for card-type tabs. WAI-ARIA APG lists Delete key as optional for removing tabs. Useful for multi-document interfaces. | MEDIUM | None | `closable` attribute on individual `lui-tab` elements. Emit `close` event (let application handle removal). Show close button. Delete key support per APG. Focus moves to next tab after removal. |

### Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Drag-to-reorder tabs** | Complex interaction in Shadow DOM. Not expected default behavior. Ant Design supports it only via third-party dnd-kit integration. No headless library includes it. | Expose tab order via slotted children order. Applications reorder DOM children if needed. |
| **Tab-as-router-link** | Radix has a separate `TabNav` component for navigation. Mixing tablist semantics with navigation semantics violates WAI-ARIA. Tabs control panels, not pages. | Build tabs for panel switching only. If users need navigation tabs, they can use `lui-tab` visually but should use `<nav>` with links semantically. Document this distinction clearly. |
| **Built-in tab content fetching** | Loading remote content is an application concern. Adds fetch logic, error handling, caching to a layout component. No major headless library includes this. | Lazy rendering (differentiator above) handles DOM creation timing. Users fetch their own data and put it in the panel slot. |
| **Editable tab labels** | Niche feature that adds complexity. Not present in any major headless library. Only seen in IDE-like interfaces. | Users can compose an input inside a custom tab trigger if needed. |
| **Primary/secondary tab variants** | Material Design has primary vs secondary tabs, but this is a Material-specific design concept. Headless libraries do not enforce visual variants. LitUI's CSS custom property approach lets users style tabs however they want. | Provide one structurally flexible tab component. Users differentiate visually via CSS custom properties. Document examples showing underline, pill, card-style tabs via CSS. |
| **Icon-only tabs without labels** | Accessibility concern: icon-only tabs require `aria-label` and are harder for users to understand. Material Web supports it but requires explicit ARIA labeling. | Support icons alongside text labels (via slot). If users want icon-only, they provide `aria-label`. Do not optimize the API for this case. |
| **Tab context menus** | WAI-ARIA APG mentions `aria-haspopup` for tabs with popup menus, but this is extremely rare. No major library implements this. | Omit entirely. If needed in future, can be composed externally with `lui-popover`. |

---

## Feature Dependencies

```
Accordion:
  lui-accordion (root)
    -> lui-accordion-item (contains trigger + content)
       -> uses <button> for trigger (native)
       -> uses CSS Grid for height animation
  Dependencies on existing:
    - @lit-ui/core (TailwindElement base class)
    - KeyboardNavigationManager (reuse from Calendar/RadioGroup for arrow keys)

Tabs:
  lui-tabs (root with tablist)
    -> lui-tab (trigger, role="tab")
    -> lui-tab-panel (content, role="tabpanel")
  Dependencies on existing:
    - @lit-ui/core (TailwindElement base class)
    - KeyboardNavigationManager (reuse from Calendar/RadioGroup for roving tabindex)
    - ResizeObserver (for overflow scroll detection, browser-native)
```

## Cross-Library Feature Matrix

### Accordion

| Feature | Radix | Ark UI | Headless UI | Shoelace | LitUI (recommend) |
|---------|-------|--------|-------------|----------|-------------------|
| Single expand | `type="single"` | default | N/A (Disclosure) | `name` attr | `type="single"` (default) |
| Multi expand | `type="multiple"` | `multiple` | N/A (Disclosure) | default | `type="multiple"` |
| Collapsible | `collapsible` | `collapsible` | always | always | `collapsible` (default true) |
| Arrow keys | Yes | Yes | No | No | Yes |
| Horizontal | `orientation` | `orientation` | No | No | `orientation` |
| Disabled items | Yes | Yes | No | Yes | Yes |
| Controlled | Yes | Yes | Yes (render prop) | No | Yes |
| Height animation | CSS var | CSS var | CSS transition | Built-in | CSS Grid `0fr`/`1fr` |
| RTL | Yes | Yes | No | Yes | Yes (via `dir` attr) |

### Tabs

| Feature | Radix | Ark UI | Headless UI | Shoelace | Material Web | LitUI (recommend) |
|---------|-------|--------|-------------|----------|-------------|-------------------|
| Vertical | `orientation` | `orientation` | `vertical` | `placement` | No | `orientation` |
| Manual activation | No (auto only) | `activationMode` | `manual` | `activation` | No | `activation` |
| Disabled tabs | Yes | Yes | Yes | Yes | No | Yes |
| Scroll overflow | No | No | No | Yes (built-in) | No | Yes (built-in) |
| Closable | No | No | No | Yes | No | Deferred |
| Lazy render | No | `lazyMount` | No | No | No | `lazy` |
| Controlled | Yes | Yes | `selectedIndex` | No | `activeTabIndex` | Yes |
| Indicator animation | No (userland) | No (userland) | No (userland) | Yes (built-in) | Yes (built-in) | Yes (built-in) |

---

## MVP Recommendation

### Accordion MVP

Build all table stakes plus arrow key navigation (differentiator):

1. Single-expand and multi-expand modes with collapsible option
2. Full WAI-ARIA APG keyboard support (Enter/Space, Tab, Arrow keys, Home/End)
3. Animated expand/collapse using CSS Grid `0fr`-to-`1fr` technique
4. Disabled items with skip-in-navigation
5. Controlled/uncontrolled state management
6. Default chevron indicator with rotation animation
7. CSS custom properties for theming (`--ui-accordion-*`)
8. SSR compatibility via Declarative Shadow DOM
9. `data-state` attributes for CSS-only styling

**Defer to post-MVP:**
- Lazy mounting: Low demand for accordion specifically (panels are typically lightweight)
- Horizontal orientation visual layout: Keyboard support is trivial, but visual CSS can come later

### Tabs MVP

Build all table stakes plus overflow scrolling and lazy rendering:

1. Full WAI-ARIA APG tablist/tab/tabpanel structure with all required ARIA
2. Automatic and manual activation modes
3. Horizontal and vertical orientation
4. Arrow key navigation with roving tabindex (wrapping, Home/End)
5. Disabled tabs with skip-in-navigation
6. Animated active indicator (sliding underline)
7. Overflow scroll with navigation buttons
8. Lazy rendering option (render-on-activate, keep-in-DOM)
9. Controlled/uncontrolled state management
10. CSS custom properties for theming (`--ui-tabs-*`)
11. SSR compatibility via Declarative Shadow DOM
12. `data-state` attributes for CSS-only styling

**Defer to post-MVP:**
- Closable tabs: Niche use case, can add later as opt-in feature
- Panel transition animations: Polish feature, not blocking
- Tab placement (bottom): Uncommon, easy to add later
