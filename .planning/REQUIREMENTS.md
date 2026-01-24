# Requirements: lit-ui

**Defined:** 2026-01-23
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FNDN-01**: Tailwind + Shadow DOM integration using constructable stylesheets
- [ ] **FNDN-02**: Full TypeScript support with strict type definitions
- [ ] **FNDN-03**: Design token system with primitive → semantic → component layers

### Button

- [ ] **BTN-01**: Variants (primary, secondary, outline, ghost, destructive)
- [ ] **BTN-02**: Sizes (sm, md, lg)
- [ ] **BTN-03**: States (default, hover, focus, active, disabled)
- [ ] **BTN-04**: Keyboard activation (Enter/Space)
- [ ] **BTN-05**: Visible focus ring and aria-disabled support
- [ ] **BTN-06**: Form participation (works inside `<form>` with submit)
- [ ] **BTN-07**: Loading state with spinner and aria-busy
- [ ] **BTN-08**: Icon slots (leading/trailing via named slots)

### Dialog

- [ ] **DLG-01**: Controlled open/close via property
- [ ] **DLG-02**: Focus trap (WCAG requirement)
- [ ] **DLG-03**: Escape key to close
- [ ] **DLG-04**: aria-labelledby/describedby for accessibility
- [ ] **DLG-05**: Return focus to trigger on close
- [ ] **DLG-06**: Click-outside to close (optional via prop)
- [ ] **DLG-07**: Enter/exit animations
- [ ] **DLG-08**: Reduced-motion support (prefers-reduced-motion)
- [ ] **DLG-09**: Nested dialog support

### CLI

- [ ] **CLI-01**: `npx lit-ui init` command for project setup
- [ ] **CLI-02**: `npx lit-ui add <component>` command to copy source
- [ ] **CLI-03**: Build tool detection (Vite, Webpack, esbuild)
- [ ] **CLI-04**: Component registry/list command
- [ ] **CLI-05**: Tailwind v4 CSS-based support (not config file based)

### Framework Verification

- [ ] **FWK-01**: Works in React 19+ without wrappers
- [ ] **FWK-02**: Works in Vue 3 without wrappers
- [ ] **FWK-03**: Works in Svelte 5 without wrappers

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Customization

- **CUST-01**: CSS custom properties API for explicit style overrides
- **CUST-02**: Headless/unstyled component variants

### Distribution

- **DIST-01**: NPM package mode (in addition to copy-source)
- **DIST-02**: Auto-update mechanism for installed components

### Components

- **COMP-01**: Input component with validation support
- **COMP-02**: Select/Dropdown component
- **COMP-03**: Tooltip component
- **COMP-04**: Checkbox/Radio components
- **COMP-05**: Card component

### Framework Verification

- **FWK-04**: Plain HTML verification (no framework)
- **FWK-05**: SSR compatibility (Declarative Shadow DOM)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Documentation site | v1 is MVP validation; docs come after concept proven |
| SSR compatibility | Complex, requires Declarative Shadow DOM; defer to v2+ |
| 40+ component parity | Start small, grow based on demand |
| CSS-in-JS runtime | Conflicts with Tailwind approach; performance overhead |
| React-specific features | Defeats framework-agnostic value proposition |
| Built-in state management | Conflicts with host framework's state management |
| Data components (Table, Chart) | Better served by specialized libraries |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | — | Pending |
| FNDN-02 | — | Pending |
| FNDN-03 | — | Pending |
| BTN-01 | — | Pending |
| BTN-02 | — | Pending |
| BTN-03 | — | Pending |
| BTN-04 | — | Pending |
| BTN-05 | — | Pending |
| BTN-06 | — | Pending |
| BTN-07 | — | Pending |
| BTN-08 | — | Pending |
| DLG-01 | — | Pending |
| DLG-02 | — | Pending |
| DLG-03 | — | Pending |
| DLG-04 | — | Pending |
| DLG-05 | — | Pending |
| DLG-06 | — | Pending |
| DLG-07 | — | Pending |
| DLG-08 | — | Pending |
| DLG-09 | — | Pending |
| CLI-01 | — | Pending |
| CLI-02 | — | Pending |
| CLI-03 | — | Pending |
| CLI-04 | — | Pending |
| CLI-05 | — | Pending |
| FWK-01 | — | Pending |
| FWK-02 | — | Pending |
| FWK-03 | — | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 0
- Unmapped: 28 ⚠️

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after initial definition*
