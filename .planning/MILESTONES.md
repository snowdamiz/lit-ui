# Project Milestones: LitUI

## v7.0 Data Table (Shipped: 2026-02-05)

**Delivered:** Full-featured data table component for admin dashboards with virtual scrolling (100K+ rows at 60fps), sorting, filtering, inline editing (cell and row modes), selection with bulk actions, column customization, CSV export, and expandable detail rows — using TanStack Table for headless state and TanStack Virtual for row virtualization.

**Phases completed:** 61-68 (28 plans total)

**Key accomplishments:**

- Full-featured Data Table component with virtual scrolling handling 100K+ rows at 60fps using TanStack Table + TanStack Virtual
- Complete data operations — sorting (single/multi-column), filtering (text/number/date/select/global), pagination with server-side support via async callbacks with AbortController
- Inline editing at cell and row levels — click-to-edit cells with validation, row edit mode with save/cancel, mutual exclusion between modes
- Selection with bulk actions — row checkboxes, shift+range select, "select all" banner, floating bulk actions toolbar with confirmation dialogs
- Column customization — resize, reorder, show/hide, sticky first column, with localStorage persistence and server-side callbacks
- Export & expandable rows — RFC 4180 CSV export respecting filters/selection/visibility, expandable detail rows with single-expand accordion mode

**Stats:**

- 99 files created/modified
- 7,342 lines TypeScript (data-table package), 27,776 total insertions
- 8 phases, 28 plans, 76 requirements
- 13 days (2026-01-23 → 2026-02-05)
- 112 commits

**Git range:** `feat(61-01)` → `docs(68)`

**What's next:** Next milestone TBD

---

## v6.0 Layout Components (Shipped: 2026-02-02)

**Delivered:** Accordion and Tabs layout components with full accessibility, CSS Grid animation, multiple expansion/activation modes, animated indicators, lazy rendering, overflow handling, SSR compatibility, and CLI/documentation integration — bringing the component library to 20 publishable packages.

**Phases completed:** 56-60 (10 plans total)

**Key accomplishments:**

- Accordion component with single/multi-expand modes, CSS Grid height animation (0fr/1fr), roving tabindex keyboard navigation, full ARIA accessibility, animated chevron indicator, lazy mounting, and SSR via Declarative Shadow DOM
- Tabs component with container-rendered tablist, automatic/manual activation modes, horizontal/vertical orientation, sliding active indicator with ResizeObserver, lazy panel rendering, overflow scroll with navigation buttons, and SSR compatibility
- 34+ CSS custom property tokens across both components with dark mode support via :host-context(.dark) and prefers-reduced-motion
- @lit-ui/accordion and @lit-ui/tabs publishable packages with peer dependencies on lit and @lit-ui/core, TypeScript types, and JSX declarations
- CLI copy-source templates with CSS variable fallbacks for standalone usage, registry expanded to 19 components total
- Documentation pages for both components with interactive demos, full API references, CSS property tables, and WAI-ARIA APG accessibility notes

**Stats:**

- 63 files created/modified
- ~63,697 lines TypeScript/CSS (total project)
- 5 phases, 10 plans
- 1 day (2026-02-02)

**Git range:** `feat(56-01)` → `docs(60)`

**What's next:** Next milestone TBD

---

## v5.0 Overlay & Feedback Components (Shipped: 2026-02-02)

**Delivered:** Toast, Tooltip, and Popover overlay components with shared Floating UI infrastructure, imperative toast API, full accessibility, and CLI distribution — bringing the component library to 15 publishable packages.

**Phases completed:** 51-55 (11 plans total)

**Key accomplishments:**

- Shadow DOM-safe Floating UI positioning wrapper in `@lit-ui/core/floating` with composed-offset-position ponyfill, bundled for zero-config DX
- Tooltip component with hover/focus triggers, configurable delay groups, arrow indicators, rich variant, touch filtering, and full ARIA (role="tooltip", aria-describedby)
- Popover component with native Popover API integration, click-toggle trigger, modal focus trapping via sentinel elements, nested popover cascade, and controlled/uncontrolled modes
- Toast notification system with framework-agnostic imperative API (`toast.success()`, `toast.promise()`), singleton state manager, queue management, swipe-to-dismiss via Pointer Events, and top-layer rendering via `popover="manual"`
- 37 new CSS custom properties for overlay theming with dark mode, @starting-style entry animations, and prefers-reduced-motion support
- Documentation pages for all three components with interactive demos, full API references, accessibility notes, and CLI registry expanded to 15 total components

**Stats:**

- 79 files created/modified
- ~14,018 lines of TypeScript added
- 5 phases, 11 plans
- 1 day (2026-02-02)
- 44 commits

**Git range:** `feat(51-01)` → `docs(55)`

**What's next:** Additional UI components or documentation site completion

---

## v4.3 Date/Time Components (Shipped: 2026-02-02)

**Delivered:** Calendar, Date Picker, Date Range Picker, and Time Picker components with full accessibility, natural language input, comparison mode, voice input, and comprehensive documentation.

**Phases completed:** 42-50 (54 plans total)

**Key accomplishments:**

- Calendar component with 7-column CSS Grid, date-fns utilities, Intl API localization, decade/century views, swipe gestures, animations, multi-month display, and ISO week numbers
- Date Picker with multi-format parsing (dashes/slashes/dots), natural language input ("tomorrow", "next week"), Floating UI popup positioning, inline mode, and form participation via ElementInternals
- Date Range Picker with two-click selection state machine, dual synchronized calendars, hover preview, drag selection, preset ranges, duration display, and comparison mode for overlaying two ranges
- Time Picker with SVG clock face, dropdown listbox, spinbutton inputs, AM/PM toggle, voice input via Web Speech API, iOS-style scroll wheels, multi-timezone display, and business hours highlighting
- 96/96 requirements satisfied with full ARIA accessibility (roving tabindex, aria-live regions, screen reader announcements) across all 4 component packages
- Documentation pages for all components with CLI registry (12 total components), guides for accessibility, form integration, and internationalization

**Stats:**

- 204 files created/modified
- ~39,672 lines of TypeScript added
- 9 phases, 54 plans, ~110 tasks
- 8 days (2026-01-25 → 2026-02-02)
- 230 commits

**Git range:** `docs(42)` → `docs(50)`

**What's next:** Additional UI components or documentation site completion

---

## v4.2 Form Controls (Shipped: 2026-01-27)

**Delivered:** Checkbox, Radio, and Switch toggle components with group containers, completing the core form primitive toolkit with zero new dependencies.

**Phases completed:** 38-41 (13 plans total)

**Key accomplishments:**

- Switch component with role="switch", animated track+thumb slide transition, form participation via ElementInternals, required validation, 3 sizes
- Checkbox with animated SVG checkmark draw-in, indeterminate tri-state (aria-checked="mixed"), Space-only keyboard per W3C APG
- CheckboxGroup with select-all coordination, indeterminate parent, disabled propagation, group validation
- RadioGroup with mutual exclusion, roving tabindex keyboard navigation (arrow keys move+select), form-associated via ElementInternals
- 67+ CSS design tokens (--ui-switch-*, --ui-checkbox-*, --ui-radio-*) for full theme customization
- CLI integration with 8 total registered components, 5 copy-source templates, and 3 documentation pages with 27 interactive examples

**Stats:**

- 76 files created/modified
- 2,764 lines of TypeScript (new component packages)
- 4 phases, 13 plans, ~25 tasks
- 4 days (2026-01-23 → 2026-01-27)

**Git range:** `feat(38-01)` → `docs(41)`

**What's next:** Documentation site completion or additional components

---

## v4.1 Select Component (Shipped: 2026-01-27)

**Delivered:** Full-featured Select component with single-select, multi-select, combobox/autocomplete, and async data loading — completing the form toolkit with the most complex form primitive.

**Phases completed:** 31-37 (28 plans total)

**Key accomplishments:**

- Full-featured single-select dropdown with ARIA 1.2 combobox pattern, keyboard navigation, type-ahead, and form participation via ElementInternals
- Multi-select mode with checkbox indicators, removable tags, overflow display (+N more), and select all/deselect all
- Combobox/autocomplete with real-time filtering, match highlighting, custom filter functions, and creatable mode
- Async data loading with Promise-based options, debounced async search with AbortController, virtual scrolling via @tanstack/lit-virtual, and infinite scroll pagination
- 45 CSS design tokens (--ui-select-*) for full theme customization across all select states
- CLI integration with registry entry, 302-line starter template, and 1363-line docs page with 20 interactive examples and accessibility section

**Stats:**

- 94 files created/modified
- 21,453 lines of TypeScript added
- 7 phases, 28 plans
- 4 days (2026-01-23 → 2026-01-27)
- 111 commits

**Git range:** `feat(31-01)` → `docs(37-04)`

**What's next:** Additional form components (checkbox, radio, switch) or documentation site completion

---

## v3.0 Theme Customization (Shipped: 2026-01-25)

**Delivered:** Visual theme configurator on docs site with OKLCH color customization, preset themes, shareable URLs, and CLI integration that generates Tailwind-compatible CSS for build-time theming.

**Phases completed:** 21-24 (16 plans total)

**Key accomplishments:**

- OKLCH theme system with Zod schema validation and 11-step shade scale generation (50-950)
- CLI theme integration: `lit-ui init --theme` and `lit-ui theme` commands with CSS file generation
- Visual configurator at /configurator with live preview, color pickers, and real-time component rendering
- Browser/Node isomorphic base64url encoding with Shadow DOM-compatible CSS variables (--ui-button-*, --ui-dialog-*)
- Preset themes (default, ocean, forest, sunset) with one-click application
- Shareable theme URLs via ?theme= parameter and CLI command generation

**Stats:**

- 86 files created/modified
- 2,788 lines of TypeScript (theme-specific code)
- 4 phases, 16 plans
- Same day milestone (2026-01-25)

**Git range:** `docs(21)` → `docs(24)`

**Tech debt tracked:** 30 tests need update for CSS variable naming change (--lui-* → --ui-*)

**What's next:** Complete v1.1 Documentation Site (phases 9-12)

---

## v2.0 NPM + SSR (Shipped: 2026-01-25)

**Delivered:** NPM package distribution (@lit-ui/core, @lit-ui/button, @lit-ui/dialog, @lit-ui/ssr) with SSR compatibility via Declarative Shadow DOM, giving developers the choice between copy-source ownership and traditional npm install.

**Phases completed:** 13-20 (27 plans total)

**Key accomplishments:**

- pnpm monorepo with 5 publishable @lit-ui packages and changesets for version management
- SSR-aware TailwindElement with dual-mode styling (inline CSS server, constructable stylesheets client)
- @lit-ui/button and @lit-ui/dialog packages with isServer guards for SSR compatibility
- @lit-ui/ssr package with render utilities and hydration support via @lit-labs/ssr
- Framework SSR examples for Next.js App Router, Astro, and Express/Node.js
- CLI enhanced with npm/copy-source mode selection, mode-aware add command, and migration support

**Stats:**

- 334 files created/modified
- 4,171 lines of TypeScript (packages: 3,668 + examples: 503)
- 8 phases, 27 plans
- 2 days from phase 13 start to ship

**Git range:** `feat(13-01)` → `feat(20-03)`

**What's next:** Complete v1.1 Documentation Site (phases 9-12), then v2.1 Enhanced DX

---

## v1.0 MVP (Shipped: 2026-01-24)

**Delivered:** Framework-agnostic Button and Dialog components with CLI distribution, validated in React 19, Vue 3, and Svelte 5.

**Phases completed:** 1-5 (22 plans total)

**Key accomplishments:**

- TailwindElement base class with constructable stylesheets enabling Tailwind in Shadow DOM
- Production-ready Button component with 5 variants, 3 sizes, form participation, and loading states
- Accessible Dialog component with focus trapping, ARIA, animations, and nested dialog support
- CLI tool (`lit-ui init`, `add`, `list`) for component distribution with build tool detection
- Verified framework compatibility across React 19, Vue 3, and Svelte 5 without wrappers
- Complete design token system with CSS custom properties and dark mode support

**Stats:**

- 133 files created/modified
- 3,931 lines of TypeScript/CSS
- 5 phases, 22 plans, ~100 tasks
- 1 day from project start to ship

**Git range:** `feat(01-01)` -> `feat(05-04)`

**What's next:** v2.0 NPM + SSR - Add NPM package mode and SSR compatibility with Declarative Shadow DOM

---

## v8.0 Design System Polish (Shipped: 2026-02-28)

**Delivered:** Polished all 18 component default styles to a unified monochrome shadcn-quality theme — removing hardcoded dark mode token overrides across the board and replacing them with a semantic cascade, while expanding CSS token documentation and skill files to be complete and accurate.

**Phases completed:** 69-87 (19 phases, 55 plans)

**Key accomplishments:**

- Authored THEME-SPEC.md as authoritative v8.0 token reference — audited all `--ui-*` defaults in tailwind.css and documented the monochrome shadcn baseline so all 18 component phases had a concrete spec to match against
- Removed hardcoded `.dark { --ui-*: ... }` overrides from all 18 components — dark mode now cascades via semantic tokens (`--color-background`, `--color-foreground`); only true exceptions (oklch literals, white values that can't cascade) retained per-component
- Expanded CSS token documentation across all 18 component docs pages — e.g. Input 7→16 entries, Select 7→27, Switch 12→26, Time Picker 20→67, Data Table 18→35; all defaults now use double-fallback `var()` form matching `tailwind.css :root`
- Updated all 18 component skill files with complete CSS token tables and new Behavior Notes sections (8-13 entries each) covering state management, keyboard nav, dark mode, accessibility, and framework integration patterns
- Corrected stale token names across skill files — prefixes fixed (`--lui-*` → `--ui-*`), obsolete tokens removed, z-index values corrected (popover 45, toast 55), shadow values updated to two-layer form matching tailwind.css

**Stats:**

- 509 files modified
- +36,559 / -16,857 lines
- 19 phases, 55 plans
- 23 days (2026-02-05 → 2026-02-28)
- 179 commits

**Git range:** `docs(69-theme-foundation)` → `docs(phase-87)`

---

