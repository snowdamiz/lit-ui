# Phase 57: Accordion Polish & Package - Research

**Researched:** 2026-02-02
**Domain:** Lit.js component polish (chevron indicator, data-state, lazy mounting, SSR/DSD, npm package)
**Confidence:** HIGH

## Summary

Phase 57 adds visual polish and packaging to the existing accordion from Phase 56. Four distinct features are needed: (1) an inline SVG chevron indicator with CSS rotation animation, (2) `data-state` attribute reflection on accordion items, (3) lazy mounting of panel content on first expand, and (4) SSR compatibility verification via Declarative Shadow DOM. The package (@lit-ui/accordion) already exists with correct peer dependencies on `lit` and `@lit-ui/core` -- INTG-01 is largely satisfied by Phase 56's setup; only a final publishability audit is needed.

All four features are additive changes to `accordion-item.ts` with zero new dependencies. The chevron follows the exact inline SVG + CSS `transform: rotate()` pattern already used by `@lit-ui/select` (chevron with `.chevron-open { transform: rotate(180deg) }`). The `data-state` attribute is a one-liner using Lit's `reflect: true` or manual `setAttribute` in `updated()`. Lazy mounting uses a private `_hasBeenExpanded` boolean flag that gates rendering of the default slot via a conditional in `render()`. SSR is already functional via `isServer` guards and the `firstUpdated()` slotchange workaround in accordion.ts.

**Primary recommendation:** All four features are small, self-contained additions to `accordion-item.ts`. The chevron is an inline SVG in the header button template with CSS rotation keyed to the `expanded` property. `data-state` is set via `updated()` lifecycle. Lazy mounting tracks first-expand via a private boolean and conditionally renders the slot. SSR needs verification that DSD output includes the chevron SVG and that lazy-mounted content hydrates correctly.

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
| lit (nothing) | ^3.3.2 | `nothing` sentinel for conditional rendering | Omit slot when lazy and not yet expanded |
| lit (isServer) | ^3.3.2 | SSR guards | Conditional logic for server vs client |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG chevron | CSS-only triangle (border hack) | SVG is cleaner, consistent with select/calendar components, more customizable |
| Inline SVG chevron | Slot-based user-provided icon | Adds API complexity; built-in default with CSS part override is simpler |
| Private boolean for lazy | Lit `cache` directive | Cache preserves DOM on re-render but doesn't prevent initial creation; a boolean flag is simpler and more explicit |
| `updated()` for data-state | Lit `reflect: true` on a computed property | Lit reflects declared properties; data-state is derived from `expanded`, so manual setAttribute in `updated()` is cleaner |

**Installation:**
No new dependencies. Zero changes to package.json.

## Architecture Patterns

### Recommended Changes (all in accordion-item.ts)
```
packages/accordion/
  src/
    accordion.ts          # No changes needed (parent container)
    accordion-item.ts     # ADD: chevron SVG, data-state, lazy mounting
    index.ts              # No changes needed
    jsx.d.ts              # ADD: lazy attribute to AccordionItemAttributes
```

### Pattern 1: Inline SVG Chevron with CSS Rotation (from @lit-ui/select)
**What:** Inline SVG chevron icon in the header button, rotated via CSS class based on expanded state. Uses `aria-hidden="true"` since the button already has semantic text.
**When to use:** Built-in visual indicator for expand/collapse state.
**Example:**
```typescript
// Source: packages/select/src/select.ts lines 3295-3308
// Adapted for accordion: chevron rotates 180deg when expanded
render() {
  return html`
    <div role="heading" aria-level="${this.headingLevel}">
      <button ...>
        <slot name="header"></slot>
        <svg
          class="chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  `;
}
```

CSS:
```css
.chevron {
  flex-shrink: 0;
  width: var(--ui-accordion-chevron-size, 1em);
  height: var(--ui-accordion-chevron-size, 1em);
  opacity: 0.5;
  transition: transform var(--ui-accordion-transition, 200ms) ease;
  margin-left: auto; /* Push chevron to right side */
}

:host([expanded]) .chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .chevron {
    transition-duration: 0ms;
  }
}
```

### Pattern 2: data-state Attribute Reflection
**What:** Set `data-state="open"` or `data-state="closed"` on the host element based on expanded state. Enables CSS-only consumer styling without JS.
**When to use:** Consumers want to style accordion items based on open/closed state from outside shadow DOM.
**Example:**
```typescript
// In accordion-item.ts updated() lifecycle
protected override updated(changedProperties: PropertyValues): void {
  if (changedProperties.has('expanded')) {
    this.dataset.state = this.expanded ? 'open' : 'closed';
  }
}
```

Consumer CSS:
```css
lui-accordion-item[data-state="open"] {
  /* Custom styles for open items */
}
lui-accordion-item[data-state="closed"] {
  /* Custom styles for closed items */
}
```

### Pattern 3: Lazy Mounting with Private Boolean Flag
**What:** Panel content (`<slot>`) is not rendered until the item is first expanded. After first expansion, content is preserved (never unmounted). Uses a private `_hasBeenExpanded` boolean that flips to `true` on first expand and stays true.
**When to use:** When `lazy` attribute is set on the accordion item, defer DOM creation for performance.
**Example:**
```typescript
// In accordion-item.ts
@property({ type: Boolean })
lazy = false;

// Private flag — not reactive (no re-render when it changes)
private _hasBeenExpanded = false;

protected override updated(changedProperties: PropertyValues): void {
  if (changedProperties.has('expanded') && this.expanded) {
    this._hasBeenExpanded = true;
  }
  // ... data-state logic
}

// In render():
// If lazy and never expanded, render empty div (no slot)
// If lazy and has been expanded (or currently expanded), render slot
// If not lazy, always render slot
private renderPanelContent() {
  if (this.lazy && !this._hasBeenExpanded && !this.expanded) {
    return nothing;
  }
  return html`<slot></slot>`;
}
```

**Key insight:** The `_hasBeenExpanded` flag is NOT a `@state()` reactive property. It is set in `updated()` BEFORE the next render when `expanded` becomes true. Since `expanded` changing already triggers a re-render, the flag is naturally available when `render()` runs. Making it `@state()` would cause a redundant re-render cycle.

**Wait -- correction:** `updated()` runs AFTER `render()`, not before. So on the first expand, `render()` runs with `_hasBeenExpanded = false` and `expanded = true`. The conditional `!this._hasBeenExpanded && !this.expanded` would be false (because `this.expanded` is true), so the slot WOULD render correctly. Then `updated()` sets `_hasBeenExpanded = true` for future re-renders when `expanded` goes back to false. This works correctly without `@state()`.

### Pattern 4: SSR with Declarative Shadow DOM (Already Implemented)
**What:** The accordion already uses `isServer` guards and `TailwindElement` which handles SSR dual-mode styling. The `firstUpdated()` slotchange workaround in accordion.ts ensures child discovery after hydration.
**When to use:** Verifying existing SSR support works with the new features.
**Key considerations:**
- Chevron SVG renders in shadow DOM template -- DSD includes it automatically
- `data-state` attribute is set in `updated()`, which runs on client after hydration -- initial SSR HTML will NOT have `data-state`. This is acceptable; the attribute appears after first client render.
- Lazy mounting: During SSR, if `lazy` is true and item is not in initial expanded set, content slot is omitted. After hydration, content appears on first expand. This is correct behavior.
- SSR hydration with `@lit-labs/ssr` v4 and `@lit-labs/ssr-client` v1.1 is the established pattern in this project (see packages/ssr/).

### Anti-Patterns to Avoid
- **SVG as external asset:** Do NOT use `<img src="chevron.svg">` or icon fonts. Inline SVG in template is the project standard (calendar, select, toast all use inline SVGs).
- **Using `display: none` for lazy mounting:** Do NOT hide content with CSS. The requirement is lazy MOUNTING (DOM not created until needed), not lazy display.
- **data-state on shadow DOM internals:** Set `data-state` on the HOST element (this.dataset.state), not on internal divs. Consumers style via `lui-accordion-item[data-state="open"]` which targets the host.
- **Making _hasBeenExpanded a @property:** This is internal state, not a public API. It should not be an attribute, not reflected, and not even @state (to avoid redundant renders).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chevron icon | Icon library, external SVG | Inline SVG in template | Project standard; zero deps, SSR compatible |
| CSS rotation animation | JS-based animation | CSS `transform: rotate()` + `transition` | Zero runtime, prefers-reduced-motion compatible |
| Lazy mounting | Lit `cache` directive or IntersectionObserver | Simple boolean flag + conditional render | Simpler, more explicit, no directive overhead |
| data-state reflection | Custom attribute observer | `this.dataset.state` in `updated()` | Standard DOM API, one line |
| Package setup | Manual package.json from scratch | Verify existing @lit-ui/accordion package.json | Already created in Phase 56 with correct structure |

**Key insight:** All four features are small additions. No new libraries, directives, or architectural changes needed.

## Common Pitfalls

### Pitfall 1: Chevron Blocking Header Text Layout (MEDIUM)
**What goes wrong:** Chevron SVG takes space from header text, causing text to wrap or truncate unexpectedly.
**Why it happens:** SVG is inline without proper flex layout or margin-left: auto.
**How to avoid:** Header button must be `display: flex; align-items: center;` (already is). Add `margin-left: auto` to chevron to push it right. Use `flex-shrink: 0` on chevron to prevent it from shrinking.
**Warning signs:** Header text truncates when window is narrow; chevron overlaps text.

### Pitfall 2: data-state Not Set on Initial Server Render (LOW)
**What goes wrong:** CSS rules targeting `[data-state="closed"]` don't apply on initial page load because `data-state` is set in `updated()` which runs on client.
**Why it happens:** SSR renders the template but `updated()` is a client lifecycle.
**How to avoid:** Accept this as a known limitation. After hydration + first update cycle, `data-state` is set. For critical initial styling, consumers should use `:not([data-state="open"])` as fallback or rely on the component's own `[expanded]` attribute reflection which IS present in SSR output.
**Warning signs:** Brief flash of un-styled state on hydration.

### Pitfall 3: Lazy Mounting Breaks Screen Reader Announcements (MEDIUM)
**What goes wrong:** When lazy content is not mounted, the `aria-controls` panel has no content. Screen reader may announce an empty region.
**Why it happens:** The panel `role="region"` element exists but has no slot content.
**How to avoid:** When lazy and not yet expanded, also hide the panel wrapper with `hidden` attribute or do not render the region role wrapper at all. Best approach: render the panel wrapper (for animation) but conditionally render the slot inside it. The empty region is acceptable since `aria-expanded="false"` signals the panel is collapsed.
**Warning signs:** Screen reader announces "region, empty" for collapsed lazy items.

### Pitfall 4: Chevron Animation Out of Sync with Panel Animation (LOW)
**What goes wrong:** Chevron rotation completes faster/slower than panel expand, looking janky.
**Why it happens:** Different transition durations for chevron and panel.
**How to avoid:** Use the same CSS custom property `--ui-accordion-transition` for both chevron rotation and panel grid-template-rows transition. Both already reference this variable.
**Warning signs:** Chevron finishes rotating while panel is still animating.

### Pitfall 5: Package Not Publishable (MEDIUM)
**What goes wrong:** `npm publish` fails or produces incorrect package.
**Why it happens:** Missing fields in package.json, incorrect exports map, dist not built, sideEffects flag wrong.
**How to avoid:** Verify: `"type": "module"`, `"main"` and `"module"` point to `dist/index.js`, `"types"` points to `dist/index.d.ts`, `"exports"` map is correct, `"files"` includes `["dist"]`, `"sideEffects": true` (because customElements.define is a side effect), `"peerDependencies"` lists `lit` and `@lit-ui/core`.
**Warning signs:** Build succeeds but `npm pack` includes wrong files; TypeScript users get no types.

## Code Examples

### Complete Chevron SVG (Matching Select Component Pattern)
```typescript
// Source: packages/select/src/select.ts lines 3295-3308 (adapted for accordion)
// Inline SVG with aria-hidden, stroke-based, viewBox 0 0 16 16
<svg
  class="chevron"
  viewBox="0 0 16 16"
  fill="none"
  stroke="currentColor"
  aria-hidden="true"
  part="chevron"
>
  <path
    d="M4 6l4 4 4-4"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

Note: `part="chevron"` exposes the SVG for consumer CSS customization via `::part(chevron)`.

### Lazy Mounting Conditional Render
```typescript
// In accordion-item.ts render()
<div class="panel-wrapper">
  <div class="panel-content">
    <div
      class="panel-inner"
      role="region"
      aria-labelledby="${this.itemId}-header"
      id="${this.itemId}-panel"
    >
      ${this.lazy && !this._hasBeenExpanded && !this.expanded
        ? nothing
        : html`<slot></slot>`}
    </div>
  </div>
</div>
```

### data-state in updated()
```typescript
protected override updated(changedProperties: PropertyValues): void {
  if (changedProperties.has('expanded')) {
    this.dataset.state = this.expanded ? 'open' : 'closed';
    // Also update lazy flag
    if (this.expanded) {
      this._hasBeenExpanded = true;
    }
  }
}
```

### CSS Custom Properties to Add for Chevron
```css
/* In tailwind.css :root block */
--ui-accordion-chevron-size: 1em;
--ui-accordion-chevron-opacity: 0.5;
```

### JSX Type Update for lazy Attribute
```typescript
// In jsx.d.ts
interface LuiAccordionItemAttributes {
  value?: string;
  expanded?: boolean;
  disabled?: boolean;
  lazy?: boolean;
  'heading-level'?: number;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Font icon for chevron | Inline SVG with CSS rotation | 2020+ | No font dependency, SSR-safe, CSS Parts customizable |
| class-based state hooks | data-* attributes for CSS hooks | 2022+ (Radix, Headless UI) | Pure CSS consumer styling without JS |
| Eager DOM for all panels | Lazy mounting on first expand | Standard pattern | Better initial performance for many-item accordions |
| Client-only rendering | Declarative Shadow DOM + hydration | Lit 3.x + @lit-labs/ssr 4.x | SEO, performance, progressive enhancement |

**Deprecated/outdated:**
- CSS triangle via border hack: use inline SVG instead (better control, animation)
- `will-change: transform` on chevron: unnecessary for simple rotation, can hurt performance

## Open Questions

1. **Should chevron be hideable via attribute?**
   - What we know: The requirement says "built-in chevron indicator" -- it must be present by default.
   - What's unclear: Should there be a `no-chevron` attribute to hide it?
   - Recommendation: Do NOT add a no-chevron attribute in this phase. Consumers can hide it with `lui-accordion-item::part(chevron) { display: none; }` via CSS Parts. Keep API minimal.

2. **data-state initial value during SSR**
   - What we know: `updated()` only runs on client. SSR output will not have `data-state`.
   - What's unclear: Whether consumers rely on `data-state` for initial paint styling.
   - Recommendation: Accept this. The `[expanded]` attribute IS reflected during SSR and can be used for initial styling. Document this in component docs.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/select/src/select.ts` lines 1761-1772, 3295-3308 -- Chevron SVG pattern with CSS rotation
- Existing codebase: `packages/calendar/src/calendar.ts` lines 1305-1307 -- Inline SVG icon pattern
- Existing codebase: `packages/accordion/src/accordion-item.ts` -- Current implementation to modify
- Existing codebase: `packages/accordion/src/accordion.ts` -- Parent container (SSR workaround already present)
- Existing codebase: `packages/accordion/package.json` -- Package already configured with correct peer deps
- Existing codebase: `packages/ssr/src/index.ts` -- SSR rendering utilities
- Existing codebase: `packages/ssr/src/hydration.ts` -- Client hydration support
- Existing codebase: `packages/core/src/tailwind-element.ts` -- SSR dual-mode styling base class
- Phase 56 verification: `.planning/phases/56-accordion-core/56-VERIFICATION.md` -- Confirmed all Phase 56 requirements met

### Secondary (MEDIUM confidence)
- Phase 56 research: `.planning/phases/56-accordion-core/56-RESEARCH.md` -- Architecture patterns, CSS Grid animation, ARIA patterns
- Radix UI Accordion pattern (data-state attribute convention) -- Industry standard for CSS-only styling hooks

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Zero new dependencies, all patterns already exist in codebase
- Architecture: HIGH -- All four features are small additive changes to existing accordion-item.ts
- Pitfalls: HIGH -- Pitfalls identified from codebase analysis and SSR lifecycle understanding

**Research date:** 2026-02-02
**Valid until:** 2026-03-04 (30 days -- stable domain, no moving parts)
