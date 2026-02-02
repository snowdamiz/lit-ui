# Requirements: LitUI v5.0

**Defined:** 2026-02-02
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v5.0 Requirements

Requirements for overlay and feedback components milestone. Each maps to roadmap phases.

### Shared Infrastructure

- [ ] **INFRA-01**: Shared Floating UI positioning utility in `@lit-ui/core/floating` with `computePosition`, `flip`, `shift`, `offset`, `arrow`, `autoUpdate` wrappers
- [ ] **INFRA-02**: `composed-offset-position` integration to fix Floating UI `offsetParent` in Shadow DOM
- [ ] **INFRA-03**: CSS custom property tokens for all overlay components (`--ui-toast-*`, `--ui-tooltip-*`, `--ui-popover-*`)
- [ ] **INFRA-04**: Shared CSS animation pattern using `@starting-style` + `transition-behavior: allow-discrete` following Dialog's pattern

### Toast

- [ ] **TOAST-01**: Variant types — success, error, warning, info, default — with distinct colors and icons
- [ ] **TOAST-02**: Auto-dismiss with configurable duration (default 5s), 0 for persistent
- [ ] **TOAST-03**: Imperative API — `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.dismiss()`, `toast.dismissAll()`
- [ ] **TOAST-04**: Declarative `<lui-toaster>` container element that auto-creates on first imperative call if not present
- [ ] **TOAST-05**: 6 position options — top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
- [ ] **TOAST-06**: Dismiss button (close X) on each toast, configurable via `dismissible` option
- [ ] **TOAST-07**: Stacking/queue management with configurable `maxVisible` (default 3), remaining queued
- [ ] **TOAST-08**: Accessible live region — `role="status"` with `aria-live="polite"` for info, `role="alert"` with `aria-live="assertive"` for errors
- [ ] **TOAST-09**: Enter/exit animations — slide-in/fade-in on appear, fade-out on dismiss, respects `prefers-reduced-motion`
- [ ] **TOAST-10**: Description support — title + optional body text per toast
- [ ] **TOAST-11**: Action buttons — single action per toast (e.g., Undo, Retry) with callback
- [ ] **TOAST-12**: Promise toast — `toast.promise(asyncFn, { loading, success, error })` auto-transitions through states
- [ ] **TOAST-13**: Swipe-to-dismiss via Pointer Events with `setPointerCapture`, velocity-based threshold
- [ ] **TOAST-14**: Pause auto-dismiss on hover and focus
- [ ] **TOAST-15**: Custom content via slot for arbitrary HTML beyond text
- [ ] **TOAST-16**: Theme-aware — respects light/dark mode via CSS custom properties
- [ ] **TOAST-17**: Top-layer rendering via `popover="manual"` to display above dialogs
- [ ] **TOAST-18**: SSR safe — toast API is no-op during server rendering, container is client-only
- [ ] **TOAST-19**: Framework-agnostic imperative API works from vanilla JS, React, Vue, Svelte equally
- [ ] **TOAST-20**: CLI registry entry with copy-source template and npm package `@lit-ui/toast`

### Tooltip

- [ ] **TIP-01**: Hover trigger with configurable show delay (default 300ms)
- [ ] **TIP-02**: Focus trigger — tooltip appears on keyboard focus of trigger element
- [ ] **TIP-03**: Escape key dismisses tooltip (WAI-ARIA requirement)
- [ ] **TIP-04**: Floating UI positioning with collision avoidance (flip, shift) and 12 placement options
- [ ] **TIP-05**: Arrow indicator pointing at trigger element, tracks position flips correctly
- [ ] **TIP-06**: `role="tooltip"` with `aria-describedby` linking trigger to tooltip content (same shadow root)
- [ ] **TIP-07**: Non-interactive content only (enforced by design — interactive content uses Popover)
- [ ] **TIP-08**: `autoUpdate` for repositioning during scroll/resize while tooltip is visible
- [ ] **TIP-09**: Delay group — when one tooltip closes, adjacent tooltips open immediately (skip show delay within 300ms window)
- [ ] **TIP-10**: Rich tooltip variant — title + description text for feature explanations
- [ ] **TIP-11**: Hide delay (100ms) to allow moving cursor from trigger to tooltip without flicker
- [ ] **TIP-12**: Touch device handling — skip tooltip on touch `pointerType`, no long-press trigger
- [ ] **TIP-13**: `prefers-reduced-motion` respect — disable/reduce animations
- [ ] **TIP-14**: SSR safe — renders trigger only, tooltip content hidden during SSR
- [ ] **TIP-15**: AbortController pattern for listener cleanup in `disconnectedCallback`
- [ ] **TIP-16**: CSS custom properties for full theming (`--ui-tooltip-bg`, `--ui-tooltip-text`, `--ui-tooltip-radius`, etc.)
- [ ] **TIP-17**: CLI registry entry with copy-source template and npm package `@lit-ui/tooltip`

### Popover

- [ ] **POP-01**: Click-to-toggle trigger — click opens/closes popover
- [ ] **POP-02**: Escape key dismisses popover
- [ ] **POP-03**: Light dismiss — click outside closes popover (Popover API `auto` or manual detection)
- [ ] **POP-04**: Floating UI positioning with collision avoidance and 12 placement options
- [ ] **POP-05**: Arrow indicator, optional, tracks position flips
- [ ] **POP-06**: Focus management — focus returns to trigger on close, non-modal by default (tab out closes)
- [ ] **POP-07**: Modal mode option — traps focus like Dialog when explicitly set
- [ ] **POP-08**: Controlled and uncontrolled modes — internal state by default, `open` property + `open-changed` event for controlled
- [ ] **POP-09**: Nested popover support — child popover keeps parent open, closing parent closes children
- [ ] **POP-10**: `aria-expanded` on trigger, `aria-haspopup`, `role="dialog"` on content
- [ ] **POP-11**: Native Popover API integration — `popover="auto"` for top-layer rendering where supported
- [ ] **POP-12**: Width matching trigger option via CSS custom property (`--ui-popover-trigger-width`)
- [ ] **POP-13**: `autoUpdate` for repositioning during scroll/resize
- [ ] **POP-14**: `prefers-reduced-motion` respect
- [ ] **POP-15**: SSR safe — renders trigger only, popover content hidden during SSR
- [ ] **POP-16**: AbortController pattern for listener cleanup
- [ ] **POP-17**: CSS custom properties for full theming (`--ui-popover-bg`, `--ui-popover-border`, `--ui-popover-radius`, etc.)
- [ ] **POP-18**: CLI registry entry with copy-source template and npm package `@lit-ui/popover`

### Documentation

- [ ] **DOCS-01**: Toast documentation page with usage examples, API reference, accessibility notes
- [ ] **DOCS-02**: Tooltip documentation page with usage examples, API reference, accessibility notes
- [ ] **DOCS-03**: Popover documentation page with usage examples, API reference, accessibility notes
- [ ] **DOCS-04**: CLI registry updated for all 3 new components (15 total registered)

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Toast Enhancements

- **TOAST-F01**: Sound/vibration on toast (browser API restrictions, user annoyance)
- **TOAST-F02**: Toast notification center/history (scope expansion — application concern)
- **TOAST-F03**: Rich media (images, progress bars) in toasts

### Tooltip Enhancements

- **TIP-F01**: Virtual trigger element (position relative to cursor or arbitrary coordinates)
- **TIP-F02**: Touch-triggered tooltips (long-press) — contentious UX
- **TIP-F03**: Transform-origin awareness CSS variable based on placement

### Popover Enhancements

- **POP-F01**: Hover-triggered popover (anti-pattern per WAI-ARIA, but some use cases exist)
- **POP-F02**: Popover group behavior (opening one closes siblings, nav menu pattern)
- **POP-F03**: Anchor element separate from trigger
- **POP-F04**: Drag-to-reposition (floating panel pattern)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Interactive forms in toasts | WAI-ARIA warns against interactive content in timed notifications |
| Persistent/blocking toasts by default | Defeats toast purpose as non-intrusive feedback |
| Toast with >1 action button | Keep simple — one action max |
| Click-triggered tooltips | That's a popover, not a tooltip |
| Tooltip with close button | If it needs a close button, it's a popover |
| Built-in header/footer slots in popover | Over-opinionated — users structure content themselves |
| CSS Anchor Positioning | Too new (~37% support), Floating UI is proven |
| `popover="hint"` | Safari negative, Chrome-only — too early |
| Popover API fallback/polyfill | ~95% support, matches Dialog's no-fallback precedent |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| TOAST-01 | TBD | Pending |
| TOAST-02 | TBD | Pending |
| TOAST-03 | TBD | Pending |
| TOAST-04 | TBD | Pending |
| TOAST-05 | TBD | Pending |
| TOAST-06 | TBD | Pending |
| TOAST-07 | TBD | Pending |
| TOAST-08 | TBD | Pending |
| TOAST-09 | TBD | Pending |
| TOAST-10 | TBD | Pending |
| TOAST-11 | TBD | Pending |
| TOAST-12 | TBD | Pending |
| TOAST-13 | TBD | Pending |
| TOAST-14 | TBD | Pending |
| TOAST-15 | TBD | Pending |
| TOAST-16 | TBD | Pending |
| TOAST-17 | TBD | Pending |
| TOAST-18 | TBD | Pending |
| TOAST-19 | TBD | Pending |
| TOAST-20 | TBD | Pending |
| TIP-01 | TBD | Pending |
| TIP-02 | TBD | Pending |
| TIP-03 | TBD | Pending |
| TIP-04 | TBD | Pending |
| TIP-05 | TBD | Pending |
| TIP-06 | TBD | Pending |
| TIP-07 | TBD | Pending |
| TIP-08 | TBD | Pending |
| TIP-09 | TBD | Pending |
| TIP-10 | TBD | Pending |
| TIP-11 | TBD | Pending |
| TIP-12 | TBD | Pending |
| TIP-13 | TBD | Pending |
| TIP-14 | TBD | Pending |
| TIP-15 | TBD | Pending |
| TIP-16 | TBD | Pending |
| TIP-17 | TBD | Pending |
| POP-01 | TBD | Pending |
| POP-02 | TBD | Pending |
| POP-03 | TBD | Pending |
| POP-04 | TBD | Pending |
| POP-05 | TBD | Pending |
| POP-06 | TBD | Pending |
| POP-07 | TBD | Pending |
| POP-08 | TBD | Pending |
| POP-09 | TBD | Pending |
| POP-10 | TBD | Pending |
| POP-11 | TBD | Pending |
| POP-12 | TBD | Pending |
| POP-13 | TBD | Pending |
| POP-14 | TBD | Pending |
| POP-15 | TBD | Pending |
| POP-16 | TBD | Pending |
| POP-17 | TBD | Pending |
| POP-18 | TBD | Pending |
| DOCS-01 | TBD | Pending |
| DOCS-02 | TBD | Pending |
| DOCS-03 | TBD | Pending |
| DOCS-04 | TBD | Pending |

**Coverage:**
- v5.0 requirements: 63 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 63 (pending roadmap)

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-02 after initial definition*
