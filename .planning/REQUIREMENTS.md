# Requirements: LitUI v5.0

**Defined:** 2026-02-02
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v5.0 Requirements

Requirements for overlay and feedback components milestone. Each maps to roadmap phases.

### Shared Infrastructure

- [x] **INFRA-01**: Shared Floating UI positioning utility in `@lit-ui/core/floating` with `computePosition`, `flip`, `shift`, `offset`, `arrow`, `autoUpdate` wrappers
- [x] **INFRA-02**: `composed-offset-position` integration to fix Floating UI `offsetParent` in Shadow DOM
- [x] **INFRA-03**: CSS custom property tokens for all overlay components (`--ui-toast-*`, `--ui-tooltip-*`, `--ui-popover-*`)
- [x] **INFRA-04**: Shared CSS animation pattern using `@starting-style` + `transition-behavior: allow-discrete` following Dialog's pattern

### Toast

- [x] **TOAST-01**: Variant types — success, error, warning, info, default — with distinct colors and icons
- [x] **TOAST-02**: Auto-dismiss with configurable duration (default 5s), 0 for persistent
- [x] **TOAST-03**: Imperative API — `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.dismiss()`, `toast.dismissAll()`
- [x] **TOAST-04**: Declarative `<lui-toaster>` container element that auto-creates on first imperative call if not present
- [x] **TOAST-05**: 6 position options — top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
- [x] **TOAST-06**: Dismiss button (close X) on each toast, configurable via `dismissible` option
- [x] **TOAST-07**: Stacking/queue management with configurable `maxVisible` (default 3), remaining queued
- [x] **TOAST-08**: Accessible live region — `role="status"` with `aria-live="polite"` for info, `role="alert"` with `aria-live="assertive"` for errors
- [x] **TOAST-09**: Enter/exit animations — slide-in/fade-in on appear, fade-out on dismiss, respects `prefers-reduced-motion`
- [x] **TOAST-10**: Description support — title + optional body text per toast
- [x] **TOAST-11**: Action buttons — single action per toast (e.g., Undo, Retry) with callback
- [x] **TOAST-12**: Promise toast — `toast.promise(asyncFn, { loading, success, error })` auto-transitions through states
- [x] **TOAST-13**: Swipe-to-dismiss via Pointer Events with `setPointerCapture`, velocity-based threshold
- [x] **TOAST-14**: Pause auto-dismiss on hover and focus
- [x] **TOAST-15**: Custom content via slot for arbitrary HTML beyond text
- [x] **TOAST-16**: Theme-aware — respects light/dark mode via CSS custom properties
- [x] **TOAST-17**: Top-layer rendering via `popover="manual"` to display above dialogs
- [x] **TOAST-18**: SSR safe — toast API is no-op during server rendering, container is client-only
- [x] **TOAST-19**: Framework-agnostic imperative API works from vanilla JS, React, Vue, Svelte equally
- [x] **TOAST-20**: CLI registry entry with copy-source template and npm package `@lit-ui/toast`

### Tooltip

- [x] **TIP-01**: Hover trigger with configurable show delay (default 300ms)
- [x] **TIP-02**: Focus trigger — tooltip appears on keyboard focus of trigger element
- [x] **TIP-03**: Escape key dismisses tooltip (WAI-ARIA requirement)
- [x] **TIP-04**: Floating UI positioning with collision avoidance (flip, shift) and 12 placement options
- [x] **TIP-05**: Arrow indicator pointing at trigger element, tracks position flips correctly
- [x] **TIP-06**: `role="tooltip"` with `aria-describedby` linking trigger to tooltip content (same shadow root)
- [x] **TIP-07**: Non-interactive content only (enforced by design — interactive content uses Popover)
- [x] **TIP-08**: `autoUpdate` for repositioning during scroll/resize while tooltip is visible
- [x] **TIP-09**: Delay group — when one tooltip closes, adjacent tooltips open immediately (skip show delay within 300ms window)
- [x] **TIP-10**: Rich tooltip variant — title + description text for feature explanations
- [x] **TIP-11**: Hide delay (100ms) to allow moving cursor from trigger to tooltip without flicker
- [x] **TIP-12**: Touch device handling — skip tooltip on touch `pointerType`, no long-press trigger
- [x] **TIP-13**: `prefers-reduced-motion` respect — disable/reduce animations
- [x] **TIP-14**: SSR safe — renders trigger only, tooltip content hidden during SSR
- [x] **TIP-15**: AbortController pattern for listener cleanup in `disconnectedCallback`
- [x] **TIP-16**: CSS custom properties for full theming (`--ui-tooltip-bg`, `--ui-tooltip-text`, `--ui-tooltip-radius`, etc.)
- [x] **TIP-17**: CLI registry entry with copy-source template and npm package `@lit-ui/tooltip`

### Popover

- [x] **POP-01**: Click-to-toggle trigger — click opens/closes popover
- [x] **POP-02**: Escape key dismisses popover
- [x] **POP-03**: Light dismiss — click outside closes popover (Popover API `auto` or manual detection)
- [x] **POP-04**: Floating UI positioning with collision avoidance and 12 placement options
- [x] **POP-05**: Arrow indicator, optional, tracks position flips
- [x] **POP-06**: Focus management — focus returns to trigger on close, non-modal by default (tab out closes)
- [x] **POP-07**: Modal mode option — traps focus like Dialog when explicitly set
- [x] **POP-08**: Controlled and uncontrolled modes — internal state by default, `open` property + `open-changed` event for controlled
- [x] **POP-09**: Nested popover support — child popover keeps parent open, closing parent closes children
- [x] **POP-10**: `aria-expanded` on trigger, `aria-haspopup`, `role="dialog"` on content
- [x] **POP-11**: Native Popover API integration — `popover="auto"` for top-layer rendering where supported
- [x] **POP-12**: Width matching trigger option via CSS custom property (`--ui-popover-trigger-width`)
- [x] **POP-13**: `autoUpdate` for repositioning during scroll/resize
- [x] **POP-14**: `prefers-reduced-motion` respect
- [x] **POP-15**: SSR safe — renders trigger only, popover content hidden during SSR
- [x] **POP-16**: AbortController pattern for listener cleanup
- [x] **POP-17**: CSS custom properties for full theming (`--ui-popover-bg`, `--ui-popover-border`, `--ui-popover-radius`, etc.)
- [x] **POP-18**: CLI registry entry with copy-source template and npm package `@lit-ui/popover`

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
| INFRA-01 | Phase 51 | Pending |
| INFRA-02 | Phase 51 | Pending |
| INFRA-03 | Phase 51 | Pending |
| INFRA-04 | Phase 51 | Pending |
| TOAST-01 | Phase 54 | Pending |
| TOAST-02 | Phase 54 | Pending |
| TOAST-03 | Phase 54 | Pending |
| TOAST-04 | Phase 54 | Pending |
| TOAST-05 | Phase 54 | Pending |
| TOAST-06 | Phase 54 | Pending |
| TOAST-07 | Phase 54 | Pending |
| TOAST-08 | Phase 54 | Pending |
| TOAST-09 | Phase 54 | Pending |
| TOAST-10 | Phase 54 | Pending |
| TOAST-11 | Phase 54 | Pending |
| TOAST-12 | Phase 54 | Pending |
| TOAST-13 | Phase 54 | Pending |
| TOAST-14 | Phase 54 | Pending |
| TOAST-15 | Phase 54 | Pending |
| TOAST-16 | Phase 54 | Pending |
| TOAST-17 | Phase 54 | Pending |
| TOAST-18 | Phase 54 | Pending |
| TOAST-19 | Phase 54 | Pending |
| TOAST-20 | Phase 54 | Pending |
| TIP-01 | Phase 52 | Complete |
| TIP-02 | Phase 52 | Complete |
| TIP-03 | Phase 52 | Complete |
| TIP-04 | Phase 52 | Complete |
| TIP-05 | Phase 52 | Complete |
| TIP-06 | Phase 52 | Complete |
| TIP-07 | Phase 52 | Complete |
| TIP-08 | Phase 52 | Complete |
| TIP-09 | Phase 52 | Complete |
| TIP-10 | Phase 52 | Complete |
| TIP-11 | Phase 52 | Complete |
| TIP-12 | Phase 52 | Complete |
| TIP-13 | Phase 52 | Complete |
| TIP-14 | Phase 52 | Complete |
| TIP-15 | Phase 52 | Complete |
| TIP-16 | Phase 52 | Complete |
| TIP-17 | Phase 52 | Complete |
| POP-01 | Phase 53 | Complete |
| POP-02 | Phase 53 | Complete |
| POP-03 | Phase 53 | Complete |
| POP-04 | Phase 53 | Complete |
| POP-05 | Phase 53 | Complete |
| POP-06 | Phase 53 | Complete |
| POP-07 | Phase 53 | Complete |
| POP-08 | Phase 53 | Complete |
| POP-09 | Phase 53 | Complete |
| POP-10 | Phase 53 | Complete |
| POP-11 | Phase 53 | Complete |
| POP-12 | Phase 53 | Complete |
| POP-13 | Phase 53 | Complete |
| POP-14 | Phase 53 | Complete |
| POP-15 | Phase 53 | Complete |
| POP-16 | Phase 53 | Complete |
| POP-17 | Phase 53 | Complete |
| POP-18 | Phase 53 | Complete |
| DOCS-01 | Phase 55 | Pending |
| DOCS-02 | Phase 55 | Pending |
| DOCS-03 | Phase 55 | Pending |
| DOCS-04 | Phase 55 | Pending |

**Coverage:**
- v5.0 requirements: 63 total
- Mapped to phases: 63
- Unmapped: 0

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-02 after roadmap creation*
