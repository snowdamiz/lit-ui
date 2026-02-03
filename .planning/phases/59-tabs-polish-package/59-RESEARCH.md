# Phase 59: Tabs Polish & Package - Research

**Researched:** 2026-02-02
**Domain:** Lit.js tabs component polish (animated indicator, lazy rendering, overflow scroll, SSR, packaging)
**Confidence:** HIGH

## Summary

Phase 59 adds visual polish and packaging to the tabs component built in Phase 58. Seven distinct features are needed: (1) an animated active indicator (sliding underline) that transitions between tabs using absolute positioning + CSS transforms, (2) ResizeObserver-based indicator repositioning on resize, (3) lazy rendering of tab panel content on first activation, (4) overflow scroll with navigation buttons when tabs exceed container width, (5) `data-state` attributes on both tab buttons and panels, (6) SSR compatibility verification via Declarative Shadow DOM, and (7) conditional `tabindex="0"` on panels without focusable content. The @lit-ui/tabs package already exists with correct structure from Phase 58 -- INTG-02 needs a final publishability audit.

The animated indicator is the most technically complex feature. It requires measuring the active tab button's position and size via `getBoundingClientRect()`, then setting CSS `transform: translateX()` and `width` on an absolutely-positioned indicator element. A `ResizeObserver` on the tablist handles repositioning on resize. The indicator transitions via CSS `transition` on transform and width properties.

Lazy rendering reuses the exact `_hasBeenExpanded` pattern from `accordion-item.ts` -- a private boolean flag that gates slot rendering via conditional `nothing` in `render()`. The overflow scroll feature adds scroll detection on the tablist container, showing left/right navigation buttons when content overflows, using `scrollLeft`, `scrollWidth`, and `clientWidth` for detection. TABS-22 (conditional tabindex) requires inspecting panel slotted content for focusable elements, similar to the popover component's `getFocusableElements()` pattern.

**Primary recommendation:** The indicator is an absolutely-positioned `<div>` inside the tablist, positioned via inline styles computed from `getBoundingClientRect()` of the active tab button. ResizeObserver triggers recalculation. Lazy rendering uses the accordion's `_hasBeenExpanded` pattern. Overflow uses scroll event listeners + ResizeObserver on the tablist to show/hide scroll buttons. `data-state` is set on tab buttons via the render template and on panel hosts via `syncPanelStates()`. TABS-22 checks for focusable children on activation using a selector query.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lit | ^3.3.2 | Reactive properties, shadow DOM, lifecycle | Already used across all components |
| @lit-ui/core | ^1.0.0 | TailwindElement base, dispatchCustomEvent, tailwindBaseStyles | Standard base for every LitUI component |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lit/decorators.js | ^3.3.2 | @property, @state decorators | Reactive properties |
| lit (nothing) | ^3.3.2 | `nothing` sentinel for conditional rendering | Lazy panel content, conditional attributes |
| lit (isServer) | ^3.3.2 | SSR guards | data-state, ResizeObserver, scroll listeners |
| lit (styleMap) | ^3.3.2 | `styleMap` directive for inline indicator styles | Indicator position/width via computed styles |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Absolute-positioned indicator div | CSS `::after` pseudo-element on active tab | Pseudo-elements cannot be transitioned between different elements; a shared indicator div enables smooth slide animation |
| getBoundingClientRect for indicator | CSS-only indicator with width:100% on active tab | Cannot animate sliding between tabs with CSS alone; JS measurement is needed for cross-tab transitions |
| Scroll buttons for overflow | CSS `overflow-x: auto` with scrollbar | Scrollbar styling is inconsistent cross-browser; explicit scroll buttons provide better UX and accessibility |
| MutationObserver for focusable check | Manual check on activation only | Activation-only check is simpler and sufficient; MutationObserver adds complexity for edge case of dynamic content changes |

**Installation:**
No new dependencies. Zero changes to package.json dependencies.

## Architecture Patterns

### Recommended Changes
```
packages/tabs/
  src/
    tabs.ts              # ADD: indicator, overflow scroll, data-state on tabs, lazy support, TABS-22
    tab-panel.ts         # ADD: lazy property, _hasBeenExpanded flag, conditional slot render
    index.ts             # No changes needed
    jsx.d.ts             # ADD: lazy attribute to LuiTabPanelAttributes
```

### Pattern 1: Animated Active Indicator via Absolute Positioning
**What:** An absolutely-positioned `<div>` element inside the tablist that slides to the active tab's position. Position and width are computed from `getBoundingClientRect()` of the active tab button relative to the tablist container. CSS `transition` handles the animation.
**When to use:** TABS-16 animated indicator requirement.
**Why this approach:** A shared indicator element can transition smoothly between tabs because its `transform` and `width` are animated. Per-tab indicators (like `::after` on the active tab) would require cross-element animation which CSS cannot do alone.
**Example:**
```typescript
// In tabs.ts

// Indicator element ref
private indicatorStyle: { transform: string; width: string } = {
  transform: 'translateX(0px)',
  width: '0px'
};

private updateIndicator(): void {
  if (isServer) return;
  const activeButton = this.shadowRoot?.querySelector(
    `#${this.tabsId}-tab-${this.value}`
  ) as HTMLElement | null;
  const tablist = this.shadowRoot?.querySelector('.tablist') as HTMLElement | null;

  if (!activeButton || !tablist) return;

  const buttonRect = activeButton.getBoundingClientRect();
  const tablistRect = tablist.getBoundingClientRect();

  if (this.orientation === 'horizontal') {
    this.indicatorStyle = {
      transform: `translateX(${buttonRect.left - tablistRect.left}px)`,
      width: `${buttonRect.width}px`
    };
  } else {
    // Vertical: indicator slides vertically
    this.indicatorStyle = {
      transform: `translateY(${buttonRect.top - tablistRect.top}px)`,
      width: `${buttonRect.height}px`  // "width" becomes height for vertical
    };
  }
  this.requestUpdate();
}

// In render() - inside the tablist div, after tab buttons:
html`
  <div
    class="tab-indicator"
    style=${styleMap({
      transform: this.indicatorStyle.transform,
      width: this.orientation === 'horizontal'
        ? this.indicatorStyle.width : undefined,
      height: this.orientation === 'vertical'
        ? this.indicatorStyle.width : undefined,
    })}
  ></div>
`
```

CSS:
```css
.tablist {
  position: relative; /* For absolute indicator positioning */
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: var(--ui-tabs-indicator-height, 2px);
  background: var(--ui-tabs-indicator-color, var(--color-primary, var(--ui-color-primary)));
  border-radius: var(--ui-tabs-indicator-radius, 9999px);
  transition:
    transform var(--ui-tabs-indicator-transition, 200ms) ease,
    width var(--ui-tabs-indicator-transition, 200ms) ease;
}

/* Vertical orientation: indicator on the left side */
:host([orientation="vertical"]) .tab-indicator {
  bottom: auto;
  left: 0;
  top: 0;
  width: var(--ui-tabs-indicator-height, 2px) !important;
  /* height is set via inline style */
}

@media (prefers-reduced-motion: reduce) {
  .tab-indicator {
    transition-duration: 0ms;
  }
}
```

### Pattern 2: ResizeObserver for Indicator Repositioning (TABS-17)
**What:** A ResizeObserver watches the tablist container. On resize, `updateIndicator()` is called to recalculate the indicator position. This handles window resize, container resize, and font size changes.
**When to use:** Always, alongside the indicator.
**Example:**
```typescript
private resizeObserver: ResizeObserver | null = null;

override connectedCallback(): void {
  super.connectedCallback();
  // ... existing logic
}

override firstUpdated(): void {
  // ... existing SSR slotchange workaround

  if (!isServer) {
    // Set up ResizeObserver for indicator repositioning
    const tablist = this.shadowRoot?.querySelector('.tablist');
    if (tablist) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateIndicator();
      });
      this.resizeObserver.observe(tablist);
    }
  }
}

override disconnectedCallback(): void {
  super.disconnectedCallback();
  this.resizeObserver?.disconnect();
  this.resizeObserver = null;
}
```

**Important:** The ResizeObserver is set up in `firstUpdated()` (not `connectedCallback()`) because the shadow DOM must be available to query the tablist element. Cleanup in `disconnectedCallback()` prevents memory leaks.

### Pattern 3: Lazy Panel Rendering (from Accordion)
**What:** Identical to accordion-item.ts lazy mounting pattern. A `lazy` boolean property and a private `_hasBeenExpanded` flag gate slot rendering. Content is not mounted until first activation, then preserved.
**When to use:** TABS-18 lazy rendering requirement.
**Example:**
```typescript
// In tab-panel.ts
@property({ type: Boolean })
lazy = false;

// Plain field, NOT @state() -- avoids redundant re-render
private _hasBeenExpanded = false;

protected override updated(changedProperties: PropertyValues): void {
  // ... existing data-state logic
  if (changedProperties.has('active') && this.active) {
    this._hasBeenExpanded = true;
  }
}

override render() {
  if (this.lazy && !this._hasBeenExpanded && !this.active) {
    return html``; // Empty - no slot, no DOM
  }
  return html`<slot></slot>`;
}
```

**Key detail:** Same as accordion -- `_hasBeenExpanded` is a plain field, not `@state()`. The `active` property change already triggers a re-render, and on the first activation render, `this.active` is `true` so the condition `!this.active` is false, causing the slot to render. Then `updated()` sets `_hasBeenExpanded = true` for future renders when `active` goes back to false.

### Pattern 4: Overflow Scroll with Navigation Buttons (TABS-19)
**What:** When tab buttons exceed the tablist container width, show left/right scroll buttons. Uses `scrollLeft`, `scrollWidth`, and `clientWidth` to detect overflow and scroll position. Buttons scroll by a fixed amount (e.g., 200px) with smooth scroll behavior.
**When to use:** TABS-19 overflow scroll requirement. Only applies to horizontal orientation.
**Example:**
```typescript
// Overflow state
@state()
private _showScrollLeft = false;

@state()
private _showScrollRight = false;

private updateScrollButtons(): void {
  if (isServer) return;
  const tablist = this.shadowRoot?.querySelector('.tablist') as HTMLElement | null;
  if (!tablist) return;

  this._showScrollLeft = tablist.scrollLeft > 0;
  this._showScrollRight =
    tablist.scrollLeft + tablist.clientWidth < tablist.scrollWidth - 1;
  // -1 for rounding tolerance
}

private scrollTabs(direction: 'left' | 'right'): void {
  const tablist = this.shadowRoot?.querySelector('.tablist') as HTMLElement | null;
  if (!tablist) return;

  const scrollAmount = tablist.clientWidth * 0.75; // Scroll 75% of visible width
  tablist.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  });
}
```

Template:
```html
<div class="tablist-wrapper">
  ${this._showScrollLeft ? html`
    <button
      class="scroll-button scroll-left"
      aria-hidden="true"
      tabindex="-1"
      @click=${() => this.scrollTabs('left')}
    >
      <svg ...><!-- Left chevron --></svg>
    </button>
  ` : nothing}

  <div
    class="tablist"
    role="tablist"
    @scroll=${this.updateScrollButtons}
    ...
  >
    <!-- tab buttons + indicator -->
  </div>

  ${this._showScrollRight ? html`
    <button
      class="scroll-button scroll-right"
      aria-hidden="true"
      tabindex="-1"
      @click=${() => this.scrollTabs('right')}
    >
      <svg ...><!-- Right chevron --></svg>
    </button>
  ` : nothing}
</div>
```

CSS:
```css
.tablist-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.tablist {
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.tablist::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.scroll-button {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-tabs-scroll-button-size, 2rem);
  height: var(--ui-tabs-scroll-button-size, 2rem);
  border: none;
  background: var(--ui-tabs-list-bg);
  color: var(--ui-tabs-tab-text);
  cursor: pointer;
  border-radius: var(--ui-tabs-tab-radius);
}

.scroll-button:hover {
  color: var(--ui-tabs-tab-hover-text);
  background: var(--ui-tabs-tab-hover-bg);
}
```

**Key details:**
- Scroll buttons have `aria-hidden="true"` and `tabindex="-1"` -- they are visual affordances, not keyboard targets (keyboard users use arrow keys)
- Hide native scrollbar with `-webkit-scrollbar`, `scrollbar-width: none`
- ResizeObserver on the tablist also calls `updateScrollButtons()` for initial detection and container resize
- Scroll event listener on the tablist updates button visibility during user scroll
- Only applicable for horizontal orientation; vertical tabs do not need scroll buttons (they stack naturally)

### Pattern 5: data-state on Tab Buttons (TABS-20)
**What:** Tab buttons in the shadow DOM render template get `data-state="active"` or `data-state="inactive"`. This is purely in the render template, not lifecycle.
**When to use:** TABS-20 requires data-state on both tabs and panels.
**Example:**
```typescript
// In tabs.ts render() - on each tab button:
<button
  ...
  data-state="${panel.value === this.value ? 'active' : 'inactive'}"
  class="tab-button ${panel.value === this.value ? 'tab-active' : ''}"
>
```

**Panels already have data-state:** `tab-panel.ts` already sets `data-state` via `this.setAttribute('data-state', ...)` in `updated()` with isServer guard (from Phase 58).

### Pattern 6: Conditional tabindex="0" on Panels (TABS-22)
**What:** When a tab panel becomes active, check if it contains focusable elements. If no focusable elements exist, set `tabindex="0"` on the panel. If focusable elements exist, remove `tabindex` so the first focusable child receives focus naturally via Tab key.
**When to use:** TABS-22 requirement. W3C APG specifies this behavior.
**Example:**
```typescript
// In tabs.ts syncPanelStates()
private syncPanelStates(): void {
  for (const panel of this.panels) {
    const isActive = panel.value === this.value;
    panel.active = isActive;
    panel.id = `${this.tabsId}-panel-${panel.value}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${this.tabsId}-tab-${panel.value}`);

    if (isActive) {
      // TABS-22: only set tabindex if panel has no focusable children
      if (this.panelHasFocusableContent(panel)) {
        panel.removeAttribute('tabindex');
      } else {
        panel.setAttribute('tabindex', '0');
      }
    } else {
      panel.removeAttribute('tabindex');
    }
  }
}

private panelHasFocusableContent(panel: TabPanel): boolean {
  // Query the panel's light DOM children for focusable elements
  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"])';
  return panel.querySelector(focusableSelector) !== null;
}
```

**Source:** Pattern adapted from `packages/popover/src/popover.ts` `getFocusableElements()` and `isFocusable()` methods (lines 551-585).

### Pattern 7: SSR Compatibility (TABS-21)
**What:** All new features need isServer guards. The existing slotchange workaround in `firstUpdated()` handles child discovery after hydration. New features that use browser APIs (ResizeObserver, getBoundingClientRect, scrollLeft) must be guarded.
**When to use:** All browser API usage.
**Key SSR considerations:**
- **Indicator:** `updateIndicator()` is a no-op on server (isServer guard at top)
- **ResizeObserver:** Created in `firstUpdated()` which only runs on client
- **Scroll detection:** `updateScrollButtons()` is a no-op on server (isServer guard)
- **data-state on tab buttons:** Set in render template via data attribute -- works fine in SSR since it's part of the shadow DOM template
- **data-state on panels:** Already guarded with isServer in `updated()` (from Phase 58)
- **Lazy rendering:** Conditional in `render()` works identically on server and client
- **Declarative Shadow DOM:** The indicator div, scroll buttons, and all structural elements are part of the shadow DOM template and will be included in DSD output

### Anti-Patterns to Avoid
- **Using CSS `::after` for the indicator:** Cannot animate sliding between different tab buttons. A shared indicator element is required.
- **Storing indicator position as `@state()` objects:** Each property update triggers a re-render. Use `requestUpdate()` with a plain object for batched updates.
- **Setting tabindex="0" unconditionally on all panels:** TABS-22 specifically requires it only when no focusable elements exist. Current Phase 58 implementation always sets it; this needs to be changed.
- **Scroll buttons in the tab order:** They must have `tabindex="-1"` and `aria-hidden="true"` -- keyboard users use arrow keys to navigate tabs, not click scroll buttons.
- **ResizeObserver without cleanup:** Must disconnect in `disconnectedCallback()` to prevent memory leaks.
- **Using `offsetLeft`/`offsetWidth` for indicator:** These properties don't account for scroll position or CSS transforms. Use `getBoundingClientRect()` which gives viewport-relative coordinates, then subtract the tablist's rect for relative positioning.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Indicator animation | JS-based requestAnimationFrame loop | CSS `transition` on transform/width | Browser-optimized, prefers-reduced-motion compatible, less code |
| Scroll detection | IntersectionObserver on tab buttons | scrollLeft + scrollWidth + clientWidth | Simpler, more direct, better browser support |
| Focusable element detection | Custom tree walker | querySelector with selector string | Simpler, matches popover pattern, sufficient for this use case |
| Smooth scrolling | Manual scrollLeft animation | `scrollBy({ behavior: 'smooth' })` | Native smooth scrolling, less code |
| Indicator positioning | Manual layout calculation | `getBoundingClientRect()` relative to parent | Accurate, handles CSS transforms and scroll |
| Package setup | Create new package.json | Audit existing @lit-ui/tabs package.json | Already created correctly in Phase 58 |

**Key insight:** The animated indicator is the only genuinely new pattern. All other features (lazy, data-state, SSR, overflow) are adaptations of patterns already in the codebase (accordion, select, popover).

## Common Pitfalls

### Pitfall 1: Indicator Position Wrong After Tab Content Changes (HIGH)
**What goes wrong:** Indicator slides to wrong position or has wrong width after tabs are added/removed dynamically, or after content changes that affect tab button widths.
**Why it happens:** Indicator position is cached and not recalculated when tab buttons change.
**How to avoid:** Call `updateIndicator()` after every state change that could affect tab button layout: (1) value change, (2) panel add/remove (slotchange), (3) label change, (4) resize. Use `updateComplete.then(() => this.updateIndicator())` to ensure the DOM has been updated before measuring.
**Warning signs:** Indicator visually misaligned with the active tab after dynamic changes.

### Pitfall 2: Indicator Flash/Jump on First Render (HIGH)
**What goes wrong:** Indicator appears at position (0,0) then jumps to the correct position, causing a visual flash.
**Why it happens:** Indicator is rendered in the template before `updateIndicator()` runs. Initial inline styles have `translateX(0)` and `width: 0`.
**How to avoid:** Start with `opacity: 0` or `visibility: hidden` on the indicator, then set to visible after the first `updateIndicator()` call. Or use a `_indicatorReady` boolean flag.
**Warning signs:** Brief flash of indicator at wrong position on page load.

### Pitfall 3: ResizeObserver Callback Causes Infinite Loop (MEDIUM)
**What goes wrong:** `updateIndicator()` calls `requestUpdate()`, which changes the DOM, which triggers ResizeObserver again, creating an infinite loop.
**Why it happens:** ResizeObserver fires when observed element dimensions change, and re-rendering can change dimensions.
**How to avoid:** The indicator uses `transform` and `width` via inline styles on a child element, NOT dimensions on the observed tablist element itself. This means the ResizeObserver callback does not change the tablist's dimensions, avoiding the loop. If issues arise, debounce the ResizeObserver callback with `requestAnimationFrame`.
**Warning signs:** Browser becomes unresponsive, "ResizeObserver loop" error in console.

### Pitfall 4: Overflow Scroll Buttons Visible When Not Needed (MEDIUM)
**What goes wrong:** Scroll buttons appear even when all tabs fit within the container.
**Why it happens:** `updateScrollButtons()` not called on initial render, or called before layout is complete.
**How to avoid:** Call `updateScrollButtons()` in `firstUpdated()` (after SSR slotchange workaround) and after every slotchange. Also trigger via ResizeObserver on the tablist. Use a small threshold (`scrollWidth - clientWidth > 1`) to avoid floating-point false positives.
**Warning signs:** Scroll buttons visible with only 2-3 tabs that fit easily.

### Pitfall 5: Indicator Not Visible in Vertical Orientation (MEDIUM)
**What goes wrong:** Indicator CSS is only designed for horizontal tabs. Vertical tabs need the indicator on the left/right side, sliding vertically.
**Why it happens:** Indicator positioned with `bottom: 0` and `width`, which only works for horizontal.
**How to avoid:** Switch indicator positioning based on orientation: horizontal uses `bottom: 0`, `left: 0`, `height: 2px`, animates `translateX` and `width`. Vertical uses `left: 0` (or `right: 0`), `top: 0`, `width: 2px`, animates `translateY` and `height`.
**Warning signs:** No indicator visible in vertical tabs, or indicator is horizontal at the bottom of vertical tablist.

### Pitfall 6: Lazy Panel + TABS-22 Interaction (LOW)
**What goes wrong:** When a lazy panel first activates, `panelHasFocusableContent()` checks for focusable elements before the slot content has been rendered, always returning false.
**Why it happens:** The lazy panel renders `nothing` initially, then renders the slot on activation. The focusable content check runs before the slot content is in the DOM.
**How to avoid:** Delay the focusable content check. Use `panel.updateComplete.then(() => ...)` or run the check in a `requestAnimationFrame` after activation. Alternatively, always set `tabindex="0"` initially and remove it after content renders with focusable elements.
**Warning signs:** Panel always has tabindex="0" even when it contains buttons/links.

### Pitfall 7: data-state on Shadow DOM Tab Buttons Not Accessible to Consumers (LOW)
**What goes wrong:** Consumer CSS `lui-tabs button[data-state="active"]` does not work because tab buttons are in shadow DOM.
**Why it happens:** Shadow DOM encapsulation. Consumer CSS cannot target shadow DOM elements.
**How to avoid:** Document that `data-state` on tab buttons is for internal component CSS only (or for CSS Parts if exposed). The primary consumer hook is `data-state` on the `lui-tab-panel` HOST elements (light DOM), which consumers CAN target. Consider adding `part="tab"` to expose tab buttons for `::part(tab)` styling.
**Warning signs:** Consumer tries to style tabs via data-state and it does not work.

## Code Examples

### Complete Indicator Implementation
```typescript
// In tabs.ts

import { styleMap } from 'lit/directives/style-map.js';

// State
private _indicatorStyle: Record<string, string> = {};
private _indicatorReady = false;

private updateIndicator(): void {
  if (isServer) return;

  const activeButton = this.shadowRoot?.querySelector(
    `#${this.tabsId}-tab-${this.value}`
  ) as HTMLElement | null;
  const tablist = this.shadowRoot?.querySelector('.tablist') as HTMLElement | null;

  if (!activeButton || !tablist) {
    this._indicatorReady = false;
    return;
  }

  const buttonRect = activeButton.getBoundingClientRect();
  const tablistRect = tablist.getBoundingClientRect();

  if (this.orientation === 'horizontal') {
    this._indicatorStyle = {
      transform: `translateX(${buttonRect.left - tablistRect.left + tablist.scrollLeft}px)`,
      width: `${buttonRect.width}px`,
    };
  } else {
    this._indicatorStyle = {
      transform: `translateY(${buttonRect.top - tablistRect.top + tablist.scrollTop}px)`,
      height: `${buttonRect.height}px`,
    };
  }

  this._indicatorReady = true;
  this.requestUpdate();
}
```

**Note:** `tablist.scrollLeft` is added to the transform to account for horizontal scroll offset when overflow is present. Without this, the indicator would be wrong when the tablist is scrolled.

### Scroll Buttons Template (Inline SVG Chevrons)
```typescript
// Left scroll button SVG (matches select component chevron pattern)
html`
  <button class="scroll-button scroll-left" aria-hidden="true" tabindex="-1"
    @click=${() => this.scrollTabs('left')}>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M10 4l-4 4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
`

// Right scroll button SVG
html`
  <button class="scroll-button scroll-right" aria-hidden="true" tabindex="-1"
    @click=${() => this.scrollTabs('right')}>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
`
```

### CSS Custom Properties to Add
```css
/* In tailwind.css :root block - add to existing tabs section */

/* Active indicator */
--ui-tabs-indicator-color: var(--color-primary, var(--ui-color-primary));
--ui-tabs-indicator-height: 2px;
--ui-tabs-indicator-radius: 9999px;
--ui-tabs-indicator-transition: 200ms;

/* Scroll buttons */
--ui-tabs-scroll-button-size: 2rem;
```

```css
/* In tailwind.css .dark block - add to existing tabs dark section */
--ui-tabs-indicator-color: var(--color-primary, var(--ui-color-primary));
```

### JSX Type Update for lazy Attribute
```typescript
// In jsx.d.ts - add to LuiTabPanelAttributes
interface LuiTabPanelAttributes {
  value?: string;
  label?: string;
  disabled?: boolean;
  active?: boolean;
  lazy?: boolean;  // NEW
}
```

### Focusable Content Detection
```typescript
// Source: adapted from packages/popover/src/popover.ts lines 551-585
private panelHasFocusableContent(panel: TabPanel): boolean {
  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"])';
  return panel.querySelector(focusableSelector) !== null;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS `::after` per-tab indicator | Shared absolutely-positioned indicator div | Common in modern UI libs (Radix, Material, Headless) | Enables smooth slide animation between tabs |
| JS measurement with offsetLeft | getBoundingClientRect() | Standard modern approach | Handles CSS transforms, zoom, scroll correctly |
| Custom scroll implementation | scrollBy({ behavior: 'smooth' }) | Native since 2020+ | Less code, respects user scroll preferences |
| Always tabindex="0" on panels | Conditional based on focusable content | W3C APG best practice | Better keyboard experience when panels contain interactive elements |
| window.addEventListener('resize') | ResizeObserver on container | ResizeObserver widely supported since 2020 | More precise, handles container resize (not just window), less overhead |

**Deprecated/outdated:**
- `window.onresize` for indicator repositioning: use ResizeObserver instead (handles container resize, not just window)
- CSS-only tab indicators with `:target` or `:checked`: requires specific HTML patterns incompatible with web components

## Open Questions

1. **Should the indicator be optional via an attribute?**
   - What we know: TABS-16 requires an animated indicator. Some tab designs (e.g., pill/button style) do not use underlines.
   - What's unclear: Whether all tab variants in this project need the indicator.
   - Recommendation: Always render the indicator. Consumers can hide it with `--ui-tabs-indicator-height: 0` or `--ui-tabs-indicator-color: transparent`. This keeps the API simple and the indicator easily overridable without an extra attribute.

2. **Overflow scroll in vertical orientation?**
   - What we know: TABS-19 describes overflow when "tabs exceed container width" -- implying horizontal. Vertical tabs stack and grow vertically.
   - What's unclear: Whether vertical tabs should also have overflow handling (max-height with scroll).
   - Recommendation: Only implement overflow scroll for horizontal orientation. Vertical tabs grow naturally. If a consumer needs vertical overflow, they can set `max-height` and `overflow-y: auto` on the host. Document this limitation.

3. **Should scrolling the tablist also update the indicator?**
   - What we know: When the user scrolls the tablist (via scroll buttons or touch), the indicator's visual position relative to the viewport changes, but its position relative to the tablist content is still correct (if scrollLeft offset is accounted for in the transform calculation).
   - What's unclear: Whether a scroll event should trigger `updateIndicator()`.
   - Recommendation: The indicator position includes `tablist.scrollLeft` in the transform calculation, so it remains visually correct during scroll. No additional scroll-triggered update is needed for the indicator. However, if the indicator uses `position: absolute` within the scrollable tablist, it scrolls with the content naturally. This is the preferred approach -- make the indicator a child of the scrollable tablist, not the outer wrapper.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/tabs/src/tabs.ts` -- Current tabs implementation from Phase 58
- Existing codebase: `packages/tabs/src/tab-panel.ts` -- Current tab panel implementation from Phase 58
- Existing codebase: `packages/accordion/src/accordion-item.ts` -- Lazy mounting pattern (`_hasBeenExpanded`, conditional slot render, data-state)
- Existing codebase: `packages/popover/src/popover.ts` lines 551-585 -- Focusable element detection pattern
- Existing codebase: `packages/select/src/select.ts` -- ResizeObserver pattern for tracking container width changes
- Existing codebase: `packages/core/src/styles/tailwind.css` -- CSS custom property token pattern (existing --ui-tabs-* section)
- Existing codebase: `packages/tabs/package.json` -- Package already configured with correct peer deps and exports
- Phase 58 research: `.planning/phases/58-tabs-core/58-RESEARCH.md` -- Architecture patterns, ARIA, keyboard nav
- Phase 57 research: `.planning/phases/57-accordion-polish-package/57-RESEARCH.md` -- Accordion polish patterns (lazy, data-state, SSR, package audit)
- `.planning/STATE.md` -- Prior decisions on data-state, lazy mounting, isServer guards

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS-ACCORDION-TABS.md` -- Tab panel tabindex when no focusable content (pitfall #11)
- `.planning/research/FEATURES-ACCORDION-TABS.md` -- Feature matrix for tabs polish items

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies; only adds `styleMap` directive from lit (already available)
- Architecture: HIGH -- Indicator is a well-understood pattern (getBoundingClientRect + CSS transition). All other features directly reuse existing codebase patterns (accordion lazy, popover focusable detection, select ResizeObserver)
- Pitfalls: HIGH -- 7 pitfalls identified from codebase analysis, DOM measurement edge cases, and SSR lifecycle understanding

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (30 days -- stable domain, no moving parts)
