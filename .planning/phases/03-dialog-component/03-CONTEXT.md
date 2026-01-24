# Phase 3: Dialog Component - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A fully accessible modal dialog with focus trapping, ARIA patterns, keyboard navigation, and animations. This phase delivers the base dialog component. AlertDialog/ConfirmDialog variants are separate future components.

</domain>

<decisions>
## Implementation Decisions

### Visual presentation
- Centered positioning (vertical and horizontal)
- Size prop available (sm/md/lg), but defaults to content-driven with max-width
- Backdrop is dark semi-transparent by default, customizable via CSS variable
- Clicking backdrop closes dialog by default (can be disabled per-dialog)

### Trigger pattern
- Both property (`open`) and methods (`show()`/`close()`) supported
- No built-in close button by default — enable via `show-close-button` prop
- Body scroll locked when dialog is open (always)
- Single `close` event emitted with reason (escape, backdrop, programmatic)

### Animation style
- Enter: fade + scale up (from ~95% to 100%)
- Exit: reverse of enter
- Backdrop: simple fade in/out
- Duration: quick (150ms)
- prefers-reduced-motion: instant (no animation)

### Dialog structure
- Named slots: title, default (body), footer
- All slots fully customizable — named slots provide semantic structure
- Footer actions right-aligned
- Non-dismissible mode supported via prop (prevents Escape and backdrop close)

### Claude's Discretion
- Exact scale values for animation
- Focus trap implementation approach
- z-index management
- Transition timing curve (ease-out, etc.)

</decisions>

<specifics>
## Specific Ideas

- Title/body/footer should be default structure but completely customizable
- AlertDialog as a separate component built on top of Dialog (future phase)

</specifics>

<deferred>
## Deferred Ideas

- AlertDialog/ConfirmDialog variant — separate component
- Drawer variant (slide from side) — potential future component

</deferred>

---

*Phase: 03-dialog-component*
*Context gathered: 2026-01-24*
