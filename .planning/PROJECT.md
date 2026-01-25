# LitUI

## What This Is

A framework-agnostic component library built on Lit.js, following ShadCN's philosophy of beautiful defaults and CLI-driven installation. Components work natively in React, Vue, Svelte, or plain HTML because they're standard web components underneath.

Now with **dual distribution**: copy-source ownership via CLI or traditional npm packages with SSR support.

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
- ✓ pnpm monorepo with changesets for version management — v2.0
- ✓ @lit-ui/core with SSR-aware TailwindElement (dual-mode styling) — v2.0
- ✓ @lit-ui/button and @lit-ui/dialog packages with SSR compatibility — v2.0
- ✓ @lit-ui/ssr with render utilities and hydration support — v2.0
- ✓ Framework SSR examples (Next.js, Astro, Express) — v2.0
- ✓ CLI npm mode with mode selection, add, and migrate commands — v2.0
- ✓ NPM installation guide in docs — v2.0
- ✓ SSR setup guide with hydration instructions — v2.0
- ✓ Migration guide (copy-source to npm) — v2.0

### Active

- [ ] Framework integration guides (React, Vue, Svelte)
- [ ] Theming documentation (design tokens, customization)
- [ ] Accessibility documentation (WCAG patterns, keyboard navigation)
- [ ] Search functionality in docs

### Deferred (v2.1+)

- Auto-update mechanism for installed components
- Custom Elements Manifest for IDE integration
- @lit-ui/react package with React wrappers

### Out of Scope

- Full ShadCN component parity (40+ components) — grow based on demand
- CSS-in-JS runtime — conflicts with Tailwind approach; performance overhead
- React-specific features — defeats framework-agnostic value proposition
- Built-in state management — conflicts with host framework's state management
- CJS output — modern bundlers handle ESM; CJS adds complexity

## Context

**Current state (v2.0):**
- ~8,100 lines TypeScript across packages and apps
- Tech stack: Lit.js 3, Tailwind CSS v4, Vite, TypeScript, pnpm workspaces
- 5 publishable packages: @lit-ui/core, @lit-ui/button, @lit-ui/dialog, @lit-ui/ssr, lit-ui (CLI)
- Framework examples: Next.js App Router, Astro, Express/Node.js
- Distribution: copy-source (CLI) or npm packages with SSR support
- Verified SSR with Declarative Shadow DOM

**Technical patterns established:**
- TailwindElement base class with dual-mode styling (inline CSS for SSR, constructable stylesheets for client)
- isServer guards for DOM APIs (showModal, ElementInternals)
- @lit-labs/ssr with hydration import order pattern
- pnpm workspaces with lockstep versioning via changesets
- Peer dependencies for Lit and @lit-ui/core

**Known limitations:**
- No auto-update for installed components
- Docs site phases 9-12 incomplete (Framework, Theming, Accessibility, Polish)

## Constraints

- **Framework**: Lit.js — chosen for native web component support and small footprint
- **Styling**: Tailwind CSS v4 — CSS-based configuration (not legacy config file)
- **Distribution**: CLI copy-source mode OR npm packages (user choice)
- **Browser support**: Modern browsers only (constructable stylesheets, Declarative Shadow DOM)
- **SSR**: Requires @lit-labs/ssr and proper hydration import order

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
| pnpm over npm/yarn | Better monorepo support, faster | ✓ Good — reliable workspace resolution |
| Fixed/lockstep versioning | Keep @lit-ui packages in sync | ✓ Good — simpler dependency management |
| Dual-mode styling for SSR | Static styles server-side, constructable client-side | ✓ Good — clean SSR output |
| Components register on both server/client | @lit-labs/ssr provides customElements shim | ✓ Good — SSR renders correctly |
| Lit as peer dependency | Avoid version conflicts, reduce bundle size | ✓ Good — single Lit instance |
| Copy-source as default CLI mode | Backward compatibility | ✓ Good — existing users unaffected |

## Shipped Milestones

- **v1.0 MVP** (2026-01-24): Button, Dialog, CLI with copy-source distribution
- **v2.0 NPM + SSR** (2026-01-25): NPM packages, SSR support, dual distribution

## Next Milestone

Complete v1.1 Documentation Site (phases 9-12) to finish framework guides, theming, accessibility, and polish.

---
*Last updated: 2026-01-25 after v2.0 milestone*
