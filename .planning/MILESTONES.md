# Project Milestones: LitUI

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
