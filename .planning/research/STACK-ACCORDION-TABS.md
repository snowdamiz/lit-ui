# Stack Research: Accordion & Tabs

**Project:** LitUI v6.0 Layout Components
**Researched:** 2026-02-02
**Overall confidence:** HIGH

## Executive Summary

Accordion and Tabs are pure layout/disclosure components that require **zero new dependencies**. The existing stack (Lit 3, TailwindElement, CSS transitions, `@lit-ui/core` utilities) covers every need. These components are structurally similar to RadioGroup (parent-child coordination, roving tabindex, keyboard navigation, slotted children) and use established patterns already validated across 15+ packages.

The key technical decision is the expand/collapse animation strategy for Accordion. Two options exist: the `grid-template-rows: 0fr/1fr` technique (cross-browser today) and `interpolate-size: allow-keywords` (Chromium-only as of Feb 2026). Recommendation: use grid-template-rows as the primary technique with progressive enhancement via `interpolate-size` where supported.

## New Dependencies

**NONE.**

No new npm packages are needed. Accordion and Tabs are purely structural components that orchestrate child visibility and keyboard focus. They do not require:
- Floating UI (no floating/overlay positioning)
- Animation libraries (CSS handles everything)
- Virtual scrolling (bounded number of items)
- Date/math libraries (no calculations)
- Form participation (not form controls)

## Existing Stack Leverage

Every capability needed is already available in the project.

### From `@lit-ui/core`

| Utility | Used For | Accordion | Tabs |
|---------|----------|-----------|------|
| `TailwindElement` | Base class with dual-mode styling (SSR + client) | Yes | Yes |
| `tailwindBaseStyles` | Tailwind CSS in Shadow DOM | Yes | Yes |
| `dispatchCustomEvent()` | `ui-change`, `ui-expand`, `ui-collapse` events | Yes | Yes |
| `isServer` (from Lit) | SSR guards for DOM APIs | Yes | Yes |

### From Lit 3

| Feature | Used For | Notes |
|---------|----------|-------|
| `@property()` decorator | Reactive properties (`value`, `multiple`, `orientation`, `disabled`) | Standard pattern |
| `@state()` decorator | Internal state (`expandedItems`, `activeTab`) | Standard pattern |
| `html` tagged template | Render templates | Standard pattern |
| `nothing` | Conditional rendering | Standard pattern |
| `PropertyValues` | `updated()` lifecycle for syncing children | Used in RadioGroup pattern |
| Slot + `@slotchange` | Child element discovery | Used in RadioGroup, CheckboxGroup |

### From Existing Component Patterns

| Pattern | Source Component | Reuse In |
|---------|-----------------|----------|
| **Roving tabindex** | RadioGroup (`updateRovingTabindex()`) | Tabs (tab list navigation) |
| **Arrow key navigation with wrapping** | RadioGroup (`handleKeyDown()`) | Tabs (Left/Right or Up/Down), Accordion (Up/Down between headers) |
| **Home/End key support** | Calendar (`KeyboardNavigationManager`) | Both (jump to first/last item) |
| **Parent-child coordination via slot** | RadioGroup/CheckboxGroup (`handleSlotChange()`) | Both (discover items/tabs via slotchange) |
| **Disabled propagation** | RadioGroup (`syncDisabledState()`) | Both (skip disabled items in keyboard nav) |
| **CSS custom properties for theming** | All components (`--ui-*` pattern) | `--ui-accordion-*`, `--ui-tabs-*` |
| **@starting-style entry animations** | Dialog, Toast, Popover | Accordion panel reveal |
| **CSS transitions** | All animated components | Accordion expand/collapse, Tab indicator slide |

### Animation Strategy: Accordion Expand/Collapse

**Recommended: `grid-template-rows: 0fr` to `1fr` transition**

```css
/* Accordion panel wrapper */
.panel-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease-out;
}

:host([expanded]) .panel-wrapper {
  grid-template-rows: 1fr;
}

.panel-content {
  overflow: hidden;
}
```

**Why this technique:**
- Cross-browser: Works in Chrome, Firefox, Safari, Edge (all modern versions)
- Pure CSS: No JavaScript measurement of heights needed
- Handles dynamic content: No hardcoded height values
- Consistent with project philosophy: CSS transitions, no animation libraries
- Well-understood: Widely documented, battle-tested pattern

**Why NOT `interpolate-size: allow-keywords`:**
- Chromium-only as of Feb 2026 (Chrome 129+, Edge 129+)
- Firefox: not supported through version 150
- Safari: not supported through version 26.3
- The project targets "modern browsers" but that means all evergreen browsers, not Chromium-only
- Can be added later as progressive enhancement via `@supports`

**Progressive enhancement (optional, can add later):**
```css
@supports (interpolate-size: allow-keywords) {
  :host {
    interpolate-size: allow-keywords;
  }
  .panel-wrapper {
    display: block; /* Override grid */
    height: 0;
    transition: height 200ms ease-out;
  }
  :host([expanded]) .panel-wrapper {
    height: auto;
  }
}
```

**Confidence:** HIGH -- grid-template-rows technique verified via [CSS-Tricks](https://css-tricks.com/css-grid-can-do-auto-height-transitions/), [Stefan Judis](https://www.stefanjudis.com/snippets/how-to-animate-height-with-css-grid/), and [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-rows). Browser support for `interpolate-size` verified via [Can I Use](https://caniuse.com/mdn-css_properties_interpolate-size_allow-keywords).

### Animation Strategy: Tabs

Tabs are simpler -- no height animation needed. The active tab indicator can slide using `transform: translateX()` with CSS transitions. Panel switching is instant (display toggle) or can use a subtle opacity fade.

```css
/* Tab indicator sliding */
.indicator {
  transition: transform 200ms ease-out, width 200ms ease-out;
}

/* Panel fade (optional) */
.panel {
  opacity: 0;
  transition: opacity 150ms ease-in;
}
.panel[aria-hidden="false"] {
  opacity: 1;
}
```

## What NOT to Add

### Do NOT use `<details>`/`<summary>` for Accordion

**Why it is tempting:** Native HTML `<details>` with `name` attribute now supports exclusive accordions across all browsers (Chrome 120+, Safari 17.2+, Firefox 130+). Sounds like less code.

**Why to avoid it:**
- Shadow DOM complicates the `name` attribute grouping (elements must share the same tree)
- Limited styling control over the `<summary>` marker and expand/collapse animation
- Cannot animate expand/collapse smoothly with the grid-template-rows technique (the `::details-content` pseudo-element approach requires `interpolate-size` which is Chromium-only)
- The WAI-ARIA APG Accordion pattern uses `button` + `aria-expanded` + `aria-controls`, not `<details>`. Custom implementation gives full ARIA control
- Inconsistent with the rest of the library's approach (custom elements with full control)

**Confidence:** HIGH -- APG pattern verified at [W3C APG Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

### Do NOT add an animation library (GSAP, Motion, Framer Motion, etc.)

**Why:** The project explicitly uses CSS transitions for all animations (documented decision in PROJECT.md). Accordion and Tabs animations are simple enough for CSS. Adding a JS animation library would:
- Break the zero-runtime-overhead pattern
- Add bundle size for trivial animations
- Create SSR complexity (JS animations don't work server-side)
- Be inconsistent with every other component

### Do NOT add a state management library

**Why:** Both components have simple state (which item is expanded, which tab is active). Lit's reactive properties handle this. A state manager would be massive overkill.

### Do NOT use the `KeyboardNavigationManager` class from Calendar

**Why:** That class is designed for 2D grid navigation (rows and columns). Accordion and Tabs need 1D list navigation (previous/next with wrapping). The RadioGroup pattern (`handleKeyDown` with modular arithmetic on a flat array) is the correct, simpler pattern to follow.

### Do NOT use `ElementInternals` / form association

**Why:** Accordion and Tabs are layout components, not form controls. They don't submit values. There is no form participation needed. (RadioGroup uses it because radios submit values; Accordion/Tabs do not.)

### Do NOT add lazy loading infrastructure (IntersectionObserver, dynamic imports)

**Why for Tabs lazy loading:** The "lazy loading" feature for Tabs means "don't render panel content until tab is first activated." This is trivially handled with a boolean flag per panel and Lit's conditional rendering (`${this.visited ? html`<slot>` : nothing}`). No IntersectionObserver or dynamic import infrastructure needed.

## Recommended Technology Per Component

### Accordion

| Concern | Technology | Notes |
|---------|-----------|-------|
| Base class | `TailwindElement` from `@lit-ui/core` | Same as all components |
| Child discovery | `<slot @slotchange>` | Same pattern as RadioGroup |
| Expand/collapse animation | CSS `grid-template-rows: 0fr/1fr` transition | Cross-browser, pure CSS |
| Keyboard navigation | Manual arrow key handler (1D list) | Port RadioGroup pattern |
| ARIA | `aria-expanded`, `aria-controls`, `role="region"`, heading buttons | WAI-ARIA APG Accordion |
| Events | `dispatchCustomEvent()` from `@lit-ui/core` | `ui-expand`, `ui-collapse` |
| Theming | CSS custom properties (`--ui-accordion-*`) | 10-15 tokens expected |
| SSR | `isServer` guards | Minimal -- no DOM APIs needed at init |

### Tabs

| Concern | Technology | Notes |
|---------|-----------|-------|
| Base class | `TailwindElement` from `@lit-ui/core` | Same as all components |
| Child discovery | `<slot @slotchange>` | Same pattern as RadioGroup |
| Tab indicator animation | CSS `transform` + `transition` | Measure tab positions imperatively |
| Keyboard navigation | Roving tabindex + arrow keys | Direct port of RadioGroup pattern |
| Activation modes | `activation="automatic"` or `activation="manual"` property | Auto: select on focus. Manual: select on Enter/Space |
| Orientation | `orientation="horizontal"` or `orientation="vertical"` property | Changes arrow key bindings (Left/Right vs Up/Down) |
| Lazy loading | Boolean `visited` map + conditional slot rendering | No infrastructure needed |
| ARIA | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation` | WAI-ARIA APG Tabs |
| Events | `dispatchCustomEvent()` from `@lit-ui/core` | `ui-change` |
| Theming | CSS custom properties (`--ui-tabs-*`) | 15-20 tokens expected |
| SSR | `isServer` guards | Tab indicator measurement needs client |

## Package Structure

Follow the established pattern from RadioGroup (parent + child in same package):

```
packages/accordion/
  src/
    accordion.ts         # Container (manages expand state, keyboard nav)
    accordion-item.ts    # Individual item (header button + collapsible panel)
    index.ts             # Exports
    jsx.d.ts             # JSX type augmentation

packages/tabs/
  src/
    tabs.ts              # Container (tablist, manages selection, keyboard nav)
    tab.ts               # Individual tab trigger
    tab-panel.ts         # Individual tab panel (or combine with tabs.ts)
    index.ts             # Exports
    jsx.d.ts             # JSX type augmentation
```

Both packages depend only on `@lit-ui/core` as a peer dependency, matching the Radio/Checkbox pattern. No additional workspace dependencies.

## Version Compatibility

All existing versions remain correct:

| Technology | Current Version in Project | Changes Needed |
|------------|---------------------------|----------------|
| Lit | ^3.3.2 | None |
| Tailwind CSS | ^4.1.18 | None |
| @tailwindcss/vite | ^4.1.18 | None |
| TypeScript | ^5.9.3 | None |
| Vite | ^7.3.1 | None |
| vite-plugin-dts | ^4.5.4 | None |

## Sources

- [W3C WAI-ARIA APG Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- [W3C WAI-ARIA APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C APG Tabs Automatic Activation Example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/)
- [W3C APG Tabs Manual Activation Example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-manual/)
- [CSS-Tricks: CSS Grid Can Do Auto Height Transitions](https://css-tricks.com/css-grid-can-do-auto-height-transitions/)
- [Stefan Judis: How to Animate Height with CSS Grid](https://www.stefanjudis.com/snippets/how-to-animate-height-with-css-grid/)
- [Can I Use: interpolate-size: allow-keywords](https://caniuse.com/mdn-css_properties_interpolate-size_allow-keywords)
- [MDN: interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size)
- [MDN: Exclusive Accordions Using HTML details](https://developer.mozilla.org/en-US/blog/html-details-exclusive-accordions/)
- [Chrome Developers: Animate to height auto](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)
