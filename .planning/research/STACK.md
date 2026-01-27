# Technology Stack: Checkbox, Radio, and Switch Components

**Project:** LitUI - Checkbox, Radio, Switch milestone
**Researched:** 2026-01-26
**Overall confidence:** HIGH

## Verdict: Zero New Dependencies Required

Checkbox, Radio, and Switch are fundamentally simpler than Select. They require no positioning logic (no Floating UI), no virtual scrolling (no TanStack Virtual), and no async state management (no @lit/task). All animation is achievable with pure CSS. All form participation uses the existing ElementInternals pattern already proven in Button, Input, Textarea, and Select.

**Do not add any npm dependencies for this milestone.** Every capability needed already exists in Lit 3 + CSS.

## Recommended Stack (All Existing)

### Core Framework (No Changes)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Lit | ^3.3.2 | Component framework | Already in use |
| @lit-ui/core | workspace:* | TailwindElement base class, design tokens | Already in use |
| Tailwind CSS | ^4.1.18 | Utility classes in Shadow DOM | Already in use |
| TypeScript | ^5.9.3 | Type safety | Already in use |
| Vite | ^7.3.1 | Build tooling | Already in use |

### Lit APIs Used (All Existing, No New Imports)

| API | Import | Purpose |
|-----|--------|---------|
| `html`, `css`, `svg`, `nothing` | `lit` | Templates, styles, SVG icons, conditional rendering |
| `isServer` | `lit` | SSR guards for ElementInternals |
| `property`, `state`, `query` | `lit/decorators.js` | Reactive properties and DOM queries |
| `TailwindElement`, `tailwindBaseStyles` | `@lit-ui/core` | Base class with Tailwind Shadow DOM injection |

### New Packages (Monorepo Structure)

Three new packages following the existing pattern (mirroring `@lit-ui/input`, `@lit-ui/button`, etc.):

| Package | Contents | Dependencies |
|---------|----------|-------------|
| `@lit-ui/checkbox` | `Checkbox`, `CheckboxGroup` components | Peer: `lit ^3.0.0`, `@lit-ui/core ^1.0.0` (no runtime deps) |
| `@lit-ui/radio` | `Radio`, `RadioGroup` components | Peer: `lit ^3.0.0`, `@lit-ui/core ^1.0.0` (no runtime deps) |
| `@lit-ui/switch` | `Switch` component | Peer: `lit ^3.0.0`, `@lit-ui/core ^1.0.0` (no runtime deps) |

Each package has ZERO `dependencies` -- only `peerDependencies` (like `@lit-ui/input`), unlike `@lit-ui/select` which needs Floating UI and TanStack Virtual.

## CSS Animation Techniques (No JS Animation Libraries)

All animations use CSS `transition` and `@keyframes` with `transform`, `opacity`, and `background-color` -- properties that are GPU-compositable and avoid layout thrashing.

### Checkbox: SVG Stroke-Dashoffset Checkmark

**Technique:** Inline SVG `<polyline>` with `stroke-dasharray`/`stroke-dashoffset` animation.

**How it works:**
1. Define an SVG checkmark as a `<polyline>` with known path length
2. Set `stroke-dasharray` to the path length (creates one long dash)
3. Set `stroke-dashoffset` to the same value (hides the dash by offsetting it fully)
4. On checked state, transition `stroke-dashoffset` to `0` (draws the checkmark)

**Indeterminate state:** Use a horizontal `<line>` element instead of the polyline, with the same dash animation technique.

```css
/* Checkbox checkmark animation */
.checkmark-path {
  stroke-dasharray: 18;        /* total path length */
  stroke-dashoffset: 18;       /* fully hidden */
  transition: stroke-dashoffset 200ms ease-out 50ms; /* 50ms delay for bg fill first */
}

:host([checked]) .checkmark-path {
  stroke-dashoffset: 0;        /* fully drawn */
}

/* Checkbox box fill */
.checkbox-box {
  background-color: transparent;
  border: var(--ui-checkbox-border-width) solid var(--ui-checkbox-border);
  border-radius: var(--ui-checkbox-radius);
  transition: background-color 150ms ease-out, border-color 150ms ease-out;
}

:host([checked]) .checkbox-box,
:host([indeterminate]) .checkbox-box {
  background-color: var(--ui-checkbox-bg-checked);
  border-color: var(--ui-checkbox-bg-checked);
}

/* Indeterminate dash */
.indeterminate-line {
  stroke-dasharray: 8;
  stroke-dashoffset: 8;
  transition: stroke-dashoffset 200ms ease-out 50ms;
}

:host([indeterminate]) .indeterminate-line {
  stroke-dashoffset: 0;
}
```

**Why SVG over CSS-only shapes:** The Lit `svg` tagged template literal (already used in Input for eye/x-circle icons) renders SVG inline in the shadow DOM. This gives precise control over the checkmark shape, smooth stroke animation, and scales perfectly with the component size via `viewBox`. The existing codebase already uses this pattern extensively.

**Confidence:** HIGH -- This is the industry-standard technique. The project already uses inline SVG via `svg` template literals in `lui-input`.

### Radio: Scale Transform Dot

**Technique:** CSS `transform: scale()` transition on a dot element.

**How it works:**
1. The radio circle is the outer element with a border
2. An inner element represents the dot
3. Default state: `transform: scale(0)` (invisible)
4. Checked state: `transform: scale(1)` (visible, animated)

```css
/* Radio outer circle */
.radio-circle {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: var(--ui-radio-border-width) solid var(--ui-radio-border);
  display: grid;
  place-content: center;
  transition: border-color 150ms ease-out;
}

:host([checked]) .radio-circle {
  border-color: var(--ui-radio-border-checked);
}

/* Radio inner dot */
.radio-dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background-color: var(--ui-radio-dot);
  transform: scale(0);
  transition: transform 150ms ease-in-out;
}

:host([checked]) .radio-dot {
  transform: scale(1);
}
```

**Why `transform: scale()` over `width`/`height`:** Scale transforms are GPU-composited and do not trigger layout. Width/height changes cause reflow. The scale approach is also simpler -- one property to transition vs. two.

**Why a real element over `::before`:** In Lit web components with Shadow DOM, we have full control over the template. Using a real `<div class="radio-dot">` is more explicit than pseudo-elements, and avoids potential specificity issues with Tailwind utility resets. Either approach works; a real element is the cleaner pattern in this codebase.

**Confidence:** HIGH -- Standard technique, well-documented.

### Switch: translateX Thumb Slide

**Technique:** CSS `transform: translateX()` on the thumb element.

**How it works:**
1. Track element has a background color transition (off-color to on-color)
2. Thumb element slides via `translateX` from left (off) to right (on)
3. Both transitions run simultaneously for a cohesive feel

```css
/* Switch track */
.switch-track {
  width: 2.5em;
  height: 1.5em;
  border-radius: var(--ui-switch-radius);
  background-color: var(--ui-switch-track-bg);
  padding: 2px;
  transition: background-color 150ms ease-in-out;
}

:host([checked]) .switch-track {
  background-color: var(--ui-switch-track-bg-checked);
}

/* Switch thumb */
.switch-thumb {
  width: 1.25em;
  height: 1.25em;
  border-radius: 50%;
  background-color: var(--ui-switch-thumb-bg);
  box-shadow: var(--ui-switch-thumb-shadow);
  transform: translateX(0);
  transition: transform 150ms ease-in-out;
}

:host([checked]) .switch-thumb {
  transform: translateX(1em); /* track-width - thumb-width - padding */
}
```

**Why `translateX` over `left`/`margin-left`:** `transform` is composited on the GPU and does not trigger layout recalculation. Animating `left` or `margin-left` causes reflow on every frame. This is the universally recommended approach.

**Confidence:** HIGH -- Industry standard, confirmed by MDN and multiple authoritative sources.

### Animation Timing Summary

| Component | Property | Duration | Easing | Delay |
|-----------|----------|----------|--------|-------|
| Checkbox box fill | `background-color`, `border-color` | 150ms | ease-out | none |
| Checkbox checkmark draw | `stroke-dashoffset` | 200ms | ease-out | 50ms (after fill) |
| Checkbox indeterminate dash | `stroke-dashoffset` | 200ms | ease-out | 50ms |
| Radio border color | `border-color` | 150ms | ease-out | none |
| Radio dot appear | `transform` (scale) | 150ms | ease-in-out | none |
| Switch track color | `background-color` | 150ms | ease-in-out | none |
| Switch thumb slide | `transform` (translateX) | 150ms | ease-in-out | none |

All timings use 150ms as the base, matching the existing `transition-colors duration-150` pattern used throughout the codebase (visible in Button). The checkbox checkmark gets a slightly longer 200ms with a 50ms delay so the fill completes before the stroke draws -- a small polish detail that makes the animation feel sequential rather than simultaneous.

## Integration Points with Existing Patterns

### ElementInternals (Form Participation)

Follow the exact pattern from `lui-input`:

```typescript
static formAssociated = true;
private internals: ElementInternals | null = null;

constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

**Checkbox/Switch form value:** `this.internals?.setFormValue(this.checked ? this.value : null)` -- native checkbox behavior submits `value` when checked, nothing when unchecked.

**Radio form value:** `this.internals?.setFormValue(this.checked ? this.value : null)` -- only the selected radio in a group submits its value.

**Checkbox validity (required):** `this.internals?.setValidity({ valueMissing: true }, 'Please check this box', anchorEl)` when `required` and not `checked`.

### ARIA Roles via ElementInternals

Use `ElementInternals.role` and `ElementInternals.ariaChecked` to set default semantics:

```typescript
// In constructor or connectedCallback:
if (this.internals) {
  this.internals.role = 'checkbox'; // or 'radio' or 'switch'
  this.internals.ariaChecked = 'false';
}
```

This avoids polluting the host element's attributes while providing correct semantics. The `ariaChecked` property supports `'true'`, `'false'`, and `'mixed'` (for indeterminate checkbox).

**Key ARIA details by component:**
- **Checkbox:** `role="checkbox"`, `aria-checked="true|false|mixed"`
- **Radio:** `role="radio"`, `aria-checked="true|false"` -- group container gets `role="radiogroup"`
- **Switch:** `role="switch"`, `aria-checked="true|false"` -- NOT `role="checkbox"`, as switch communicates on/off semantics per W3C APG

### RadioGroup: Roving Tabindex

The W3C ARIA Authoring Practices Guide recommends roving tabindex for radio groups:
- Only the selected (or first) radio has `tabindex="0"`
- All other radios have `tabindex="-1"`
- Arrow keys move focus AND selection simultaneously
- Tab/Shift+Tab exit the group entirely
- Wraps at boundaries (last -> first, first -> last)

This requires no library -- it is straightforward DOM management in the RadioGroup's keyboard event handler.

### TailwindElement Base Class

Extend `TailwindElement` exactly as all other components do:

```typescript
export class Checkbox extends TailwindElement {
  static override styles = [
    ...tailwindBaseStyles,
    css`/* component-specific styles */`,
  ];
}
```

### CSS Design Tokens Pattern

Follow the `--ui-{component}-{property}` convention established in the tokens system. New tokens needed:

**Checkbox tokens:** `--ui-checkbox-radius`, `--ui-checkbox-border-width`, `--ui-checkbox-border`, `--ui-checkbox-bg-checked`, `--ui-checkbox-check-color`, `--ui-checkbox-size-{sm,md,lg}`

**Radio tokens:** `--ui-radio-border-width`, `--ui-radio-border`, `--ui-radio-border-checked`, `--ui-radio-dot`, `--ui-radio-size-{sm,md,lg}`

**Switch tokens:** `--ui-switch-radius`, `--ui-switch-track-bg`, `--ui-switch-track-bg-checked`, `--ui-switch-thumb-bg`, `--ui-switch-thumb-shadow`, `--ui-switch-width-{sm,md,lg}`, `--ui-switch-height-{sm,md,lg}`

### Inline SVG Icons

Use Lit `svg` tagged template literals for checkmark and indeterminate icons (same as Input's eye/x-circle icons):

```typescript
private checkIcon = svg`
  <polyline points="4 12 9 17 20 6"
    stroke="currentColor" stroke-width="2.5" fill="none"
    stroke-linecap="round" stroke-linejoin="round"
    class="checkmark-path" />
`;
```

## What NOT to Add (and Why)

| Temptation | Why to Avoid |
|------------|-------------|
| **Framer Motion / Motion One** | These are React/JS animation libraries. CSS transitions handle all needed animations. Adding JS animation for simple state transitions is over-engineering. |
| **@floating-ui/dom** | No positioning needed. Checkboxes, radios, and switches render inline. Only Select uses popover positioning. |
| **@tanstack/lit-virtual** | No virtualization needed. Even CheckboxGroup/RadioGroup will have at most a few dozen items, never thousands. |
| **@lit/task** | No async operations. These are synchronous state-toggle controls. |
| **lit/directives/class-map.js** | The existing codebase manually constructs class strings (see `getButtonClasses()` in Button). Stay consistent -- `classMap` adds marginal value for these simple components. |
| **Web Animations API** | Overkill for simple state transitions. CSS transitions are declarative, inspectable, and already the pattern used in this codebase. |
| **Gesture libraries (e.g., use-gesture)** | Switch drag-to-toggle is a nice-to-have but unnecessary for v1. Click/tap/keyboard is sufficient. If added later, it is a few lines of pointer event handling, not a library. |
| **Icon library (Lucide, Heroicons)** | The codebase already uses inline SVG via `svg` template literals. A checkmark is 1 polyline. A minus is 1 line. No icon library needed. |
| **@lit/context** | Group-to-child communication (CheckboxGroup, RadioGroup) can use DOM events and slotted element queries. Context API adds complexity without benefit for these simple parent-child relationships. |

## Package Structure Template

Each new package follows the exact structure of `@lit-ui/input`:

```
packages/checkbox/
  package.json          # Zero dependencies, peer: lit + @lit-ui/core
  tsconfig.json
  vite.config.ts
  src/
    index.ts            # Re-exports + customElement registration
    checkbox.ts         # Checkbox component class
    checkbox-group.ts   # CheckboxGroup component class
    jsx.d.ts            # JSX type declarations
    vite-env.d.ts

packages/radio/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts
    radio.ts
    radio-group.ts
    jsx.d.ts
    vite-env.d.ts

packages/switch/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    index.ts
    switch.ts
    jsx.d.ts
    vite-env.d.ts
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Animation | CSS transitions | Web Animations API | CSS is simpler, declarative, already the codebase pattern |
| Checkmark rendering | Inline SVG with `svg` literal | CSS-only pseudo-element shapes | SVG gives precise control, smooth stroke animation, scales with viewBox, matches existing pattern |
| Radio dot | Real `<div>` element | `::before` pseudo-element | Either works; real element is more explicit in Lit templates |
| Switch thumb | `translateX` transform | `left` positioning | Transform is GPU-composited, avoids layout thrashing |
| Group communication | DOM events bubbling | `@lit/context` | Events are simpler, no new dependency, matches web platform patterns |
| Focus management (RadioGroup) | Roving tabindex | `aria-activedescendant` | Roving tabindex is the W3C APG primary recommendation and works more reliably with screen readers |

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Zero new deps needed | HIGH | These are simple toggle controls; all capabilities exist in Lit + CSS |
| SVG stroke animation | HIGH | Industry standard, codebase already uses inline SVG extensively |
| Scale/translateX animation | HIGH | GPU-composited transforms, confirmed by MDN |
| ElementInternals pattern | HIGH | Proven in 4 existing components in this codebase |
| Roving tabindex for RadioGroup | HIGH | W3C APG primary recommendation, no library needed |
| Design token naming | HIGH | Clear convention from existing `--ui-input-*`, `--ui-select-*` patterns |

## Sources

- [W3C WAI-ARIA APG: Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) -- ARIA roles, states, keyboard interaction
- [W3C WAI-ARIA APG: Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) -- Roving tabindex, arrow key navigation
- [W3C WAI-ARIA APG: Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) -- role="switch", aria-checked semantics
- [MDN: ElementInternals.ariaChecked](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/ariaChecked) -- Setting ARIA checked via internals
- [MDN: Using CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using) -- Transition fundamentals
- [WebKit: ElementInternals and Form-Associated Custom Elements](https://webkit.org/blog/13711/elementinternals-and-form-associated-custom-elements/) -- Form participation patterns
- [Modern CSS Solutions: Pure CSS Custom Styled Radio Buttons](https://moderncss.dev/pure-css-custom-styled-radio-buttons/) -- Scale transform technique
- [Go Make Things: Creating a Toggle Switch with CSS](https://gomakethings.com/creating-a-toggle-switch-with-just-css/) -- translateX pattern
- Existing codebase: `packages/input/src/input.ts`, `packages/button/src/button.ts`, `packages/core/src/tailwind-element.ts` -- Established patterns for ElementInternals, SVG icons, CSS transitions, TailwindElement usage
