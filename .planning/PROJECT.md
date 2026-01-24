# lit-ui

## What This Is

A framework-agnostic component library built on Lit.js, following ShadCN's philosophy of beautiful defaults and CLI-driven installation. Components work natively in React, Vue, Svelte, or plain HTML because they're standard web components underneath.

## Core Value

Developers can use polished, accessible UI components in any framework without lock-in — one component library that works everywhere.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Button component with variants and Tailwind-compatible styling
- [ ] Dialog/Modal component with proper accessibility (focus trapping, keyboard navigation)
- [ ] CLI that installs components via `npx lit-ui add <component>`
- [ ] CLI supports both copy-source mode (user owns code) and npm dependency mode
- [ ] CLI detects user's build tool (Vite, Webpack, esbuild) and configures appropriately
- [ ] Components work in React without wrappers
- [ ] Components work in Vue without wrappers
- [ ] Components work in Svelte without wrappers
- [ ] Tailwind theming via utility classes

### Out of Scope

- Full ShadCN component parity (40+ components) — v1 is MVP proof of concept
- Documentation site — validate components first
- Form components (Input, Select, etc.) — after MVP validates approach
- Data display components (Table, Avatar, etc.) — after MVP

## Context

**Technical foundation:**
- Lit.js provides lightweight web component authoring (~5KB)
- Web components are natively interoperable with all frameworks
- Shadow DOM scopes CSS but can isolate Tailwind — need to solve this (Light DOM, `::part()`, or adopted stylesheets)

**Design inspiration:**
- ShadCN's aesthetic: clean, modern, production-ready defaults
- ShadCN's CLI workflow: `npx shadcn add button`
- But framework-agnostic via web components instead of React-specific

**Build considerations:**
- Lit requires a build step for production
- CLI must detect and integrate with user's existing toolchain
- Support Vite, Webpack, esbuild at minimum

## Constraints

- **Framework**: Lit.js — chosen for native web component support and small footprint
- **Styling**: Tailwind-compatible — must work with user's Tailwind setup
- **Distribution**: Dual-mode CLI — both copy-source and npm dependency options
- **Scope**: MVP first — 2 components to validate architecture before expanding

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lit.js over other WC libraries | Lightweight, well-maintained, good DX | — Pending |
| Tailwind-compatible styling | Match ShadCN's approach, broad ecosystem | — Pending |
| Dual-mode CLI (copy + npm) | Flexibility for different user preferences | — Pending |
| Button + Dialog for MVP | Button validates styling; Dialog tests complex patterns | — Pending |

---
*Last updated: 2026-01-23 after initialization*
