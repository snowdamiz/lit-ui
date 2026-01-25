# Project Milestones: LitUI

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
