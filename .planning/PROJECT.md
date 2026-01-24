# lit-ui

## What This Is

A framework-agnostic component library built on Lit.js, following ShadCN's philosophy of beautiful defaults and CLI-driven installation. Components work natively in React, Vue, Svelte, or plain HTML because they're standard web components underneath.

Shipped v1.0 MVP with Button and Dialog components distributed via `npx lit-ui add <component>`.

## Core Value

Developers can use polished, accessible UI components in any framework without lock-in — one component library that works everywhere.

## Requirements

### Validated

- ✓ Button component with variants and Tailwind-compatible styling — v1.0
- ✓ Dialog/Modal component with proper accessibility (focus trapping, keyboard navigation) — v1.0
- ✓ CLI that installs components via `npx lit-ui add <component>` — v1.0
- ✓ CLI detects user's build tool (Vite, Webpack, esbuild) and configures appropriately — v1.0
- ✓ Components work in React without wrappers — v1.0 (React 19 verified)
- ✓ Components work in Vue without wrappers — v1.0 (Vue 3 verified)
- ✓ Components work in Svelte without wrappers — v1.0 (Svelte 5 verified)
- ✓ Tailwind theming via utility classes — v1.0 (constructable stylesheets)

### Active

- [ ] NPM package mode (in addition to copy-source)
- [ ] SSR compatibility (Declarative Shadow DOM)
- [ ] Auto-update mechanism for installed components

### Out of Scope

- Full ShadCN component parity (40+ components) — grow based on demand after NPM/SSR
- CSS-in-JS runtime — conflicts with Tailwind approach; performance overhead
- React-specific features — defeats framework-agnostic value proposition
- Built-in state management — conflicts with host framework's state management

## Context

**Current state (v1.0):**
- 3,931 lines TypeScript/CSS
- Tech stack: Lit.js 3, Tailwind CSS v4, Vite, TypeScript
- Components: Button (5 variants, 3 sizes, form participation, loading, icons), Dialog (focus trap, ARIA, animations, nested)
- CLI: citty-based with init, add, list commands
- Verified in React 19, Vue 3, Svelte 5

**Technical patterns established:**
- TailwindElement base class with constructable stylesheets for Shadow DOM
- :host-context(.dark) for dark mode in Shadow DOM
- ElementInternals for form-associated custom elements
- Native `<dialog>` with showModal() for focus trapping
- Embedded templates for portable CLI distribution

**Known limitations:**
- Copy-source only (no NPM package mode yet)
- No SSR support (requires Declarative Shadow DOM)
- No auto-update for installed components

## Constraints

- **Framework**: Lit.js — chosen for native web component support and small footprint
- **Styling**: Tailwind CSS v4 — CSS-based configuration (not legacy config file)
- **Distribution**: CLI copy-source mode (NPM mode deferred to v2)
- **Browser support**: Modern browsers only (constructable stylesheets required)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lit.js over other WC libraries | Lightweight, well-maintained, good DX | ✓ Good — clean DX, small bundle |
| Tailwind via constructable stylesheets | Solve Shadow DOM CSS isolation | ✓ Good — works well, no runtime overhead |
| Native `<dialog>` element | Built-in focus trap, top layer, Escape handling | ✓ Good — reduced complexity |
| ElementInternals for forms | Native form participation for custom elements | ✓ Good — works like native buttons |
| citty for CLI | TypeScript-first, lightweight | ✓ Good — simple, effective |
| Embedded templates in CLI | Portable for npm publish | ✓ Good — no external file dependencies |
| ESM-only library output | Modern standard, tree-shaking | ✓ Good — clean imports |
| :host-context(.dark) for dark mode | Shadow DOM can't see .dark class | ✓ Good — solves dark mode in WC |

---
*Last updated: 2026-01-24 after v1.0 milestone*
