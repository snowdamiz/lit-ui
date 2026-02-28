# LitUI

## What This Is

A framework-agnostic component library built on Lit.js, following ShadCN's philosophy of beautiful defaults and CLI-driven installation. Components work natively in React, Vue, Svelte, or plain HTML because they're standard web components underneath.

Now with **dual distribution** (copy-source or npm), **SSR support** via Declarative Shadow DOM, **build-time theme customization** via visual configurator, **complete form toolkit** (Input, Textarea, Select, Checkbox, Radio, Switch with group containers), **date/time components** (Calendar, Date Picker, Date Range Picker, Time Picker), **overlay/feedback primitives** (Toast, Tooltip, Popover with shared Floating UI infrastructure), **layout components** (Accordion, Tabs), **data table** (virtual scrolling, sorting, filtering, inline editing, selection, bulk actions, column customization, CSV export, expandable rows), and a **unified monochrome design system** (all 18 components polished to a consistent shadcn-quality theme with semantic dark mode cascade, complete CSS token documentation, and accurate per-component skill files).

## Core Value

Developers can use polished, accessible UI components in any framework without lock-in — one component library that works everywhere.

## Current State (v8.0)

- ~110,000+ lines TypeScript/CSS across packages and apps (v7.0 was ~91,000; v8.0 added +36,559/-16,857)
- Tech stack: Lit.js 3, Tailwind CSS v4, Vite, TypeScript, pnpm workspaces, colorjs.io, Floating UI, @tanstack/lit-virtual, @tanstack/lit-table, date-fns, composed-offset-position
- 21 publishable packages: @lit-ui/core, @lit-ui/button, @lit-ui/dialog, @lit-ui/input, @lit-ui/textarea, @lit-ui/select, @lit-ui/checkbox, @lit-ui/radio, @lit-ui/switch, @lit-ui/calendar, @lit-ui/date-picker, @lit-ui/date-range-picker, @lit-ui/time-picker, @lit-ui/tooltip, @lit-ui/popover, @lit-ui/toast, @lit-ui/accordion, @lit-ui/tabs, @lit-ui/data-table, @lit-ui/ssr, lit-ui (CLI)
- Framework examples: Next.js App Router, Astro, Express/Node.js
- Distribution: copy-source (CLI) or npm packages with SSR support
- Theme customization: Visual configurator + CLI `--theme` parameter
- Form components: Input, Textarea, Select (single, multi, combobox, async), Checkbox (with group), Radio (with group), Switch, Date Picker, Date Range Picker, Time Picker
- Date/time components: Calendar (standalone), Date Picker (with natural language), Date Range Picker (with comparison mode), Time Picker (with clock face, voice input, scroll wheels)
- Overlay/feedback components: Tooltip (hover/focus with delay groups), Popover (click-toggle with focus management), Toast (imperative API with queue management)
- Layout components: Accordion (single/multi-expand, CSS Grid animation, lazy mounting), Tabs (automatic/manual activation, horizontal/vertical, animated indicator, overflow scroll)
- Data components: Data Table (100K+ row virtual scrolling, sorting, filtering, pagination, inline editing, selection, bulk actions, column customization, CSV export, expandable rows)

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
- ✓ Visual theme configurator page on docs site with live preview — v3.0
- ✓ OKLCH color customization with auto-calculated shade scales — v3.0
- ✓ Light/dark mode simultaneous editing — v3.0
- ✓ Border radius customization — v3.0
- ✓ CLI `--theme` parameter with encoded config — v3.0
- ✓ Tailwind CSS layer generation from theme config — v3.0
- ✓ Preset themes (default, ocean, forest, sunset) — v3.0
- ✓ Shareable theme URLs — v3.0
- ✓ Generated npx command display in configurator — v3.0
- ✓ Input component with validation, character counter, password toggle — v4.0
- ✓ Textarea component with auto-resize, character counter — v4.0
- ✓ Select component with single-select dropdown — v4.1
- ✓ Multi-select with tag display, overflow, select all — v4.1
- ✓ Combobox with search/filter, match highlighting, creatable mode — v4.1
- ✓ Async option loading with loading states, infinite scroll, virtual scrolling — v4.1
- ✓ Keyboard navigation (arrow keys, type-ahead, Escape to close) — v4.1
- ✓ Form participation via ElementInternals for all form components — v4.1
- ✓ ARIA 1.2 combobox pattern with full accessibility compliance — v4.1
- ✓ Checkbox with indeterminate tri-state, animated SVG checkmark, form participation — v4.2
- ✓ CheckboxGroup with select-all coordination, disabled propagation, group validation — v4.2
- ✓ Radio with animated dot transition, presentational child pattern — v4.2
- ✓ RadioGroup with mutual exclusion, roving tabindex, form-associated via ElementInternals — v4.2
- ✓ Switch toggle with role="switch", animated track+thumb, form participation — v4.2
- ✓ 67+ CSS design tokens for checkbox, radio, switch theming — v4.2
- ✓ CLI registry (8 components), copy-source templates, docs pages for all form controls — v4.2
- ✓ Calendar Display component with month grid, navigation, decade/century views, multi-month, animations, and i18n — v4.3
- ✓ Date Picker with calendar popup, natural language input, presets, inline mode, and form participation — v4.3
- ✓ Date Range Picker with dual calendars, drag selection, presets, comparison mode, and form participation — v4.3
- ✓ Time Picker with clock face, dropdown, spinbuttons, voice input, scroll wheels, timezone display, and form participation — v4.3
- ✓ Documentation pages with CLI registry (12 components), accessibility guide, form integration guide, and i18n guide — v4.3
- ✓ Shared Floating UI positioning utility with Shadow DOM-safe composed-offset-position ponyfill — v5.0
- ✓ 37 CSS custom properties for overlay theming with dark mode and @starting-style animation patterns — v5.0
- ✓ Tooltip with hover/focus triggers, delay groups, arrow positioning, rich variant, touch filtering, ARIA accessibility — v5.0
- ✓ Popover with native Popover API, click-toggle, modal focus trapping, nested support, controlled/uncontrolled modes — v5.0
- ✓ Toast with imperative API, singleton state manager, queue management, swipe-to-dismiss, promise mode, top-layer rendering — v5.0
- ✓ Documentation pages for Toast, Tooltip, Popover with interactive demos and API references — v5.0
- ✓ CLI registry expanded to 15 components with copy-source templates for all overlay components — v5.0
- ✓ Accordion with single/multi-expand modes, CSS Grid animation, keyboard navigation, chevron indicator, lazy mounting, SSR — v6.0
- ✓ Tabs with horizontal/vertical orientation, automatic/manual activation, animated indicator, overflow scroll, lazy rendering, SSR — v6.0
- ✓ @lit-ui/accordion and @lit-ui/tabs packages with peer dependencies, types, JSX declarations — v6.0
- ✓ 34+ CSS custom properties for accordion and tabs theming (--ui-accordion-*, --ui-tabs-*) with dark mode — v6.0
- ✓ CLI registry expanded to 19 components with copy-source templates for accordion and tabs — v6.0
- ✓ Documentation pages for Accordion and Tabs with interactive demos, API references, and accessibility notes — v6.0
- ✓ Data Table with virtual scrolling (100K+ rows), sorting, filtering, inline editing (cell + row), selection, bulk actions, column customization, CSV export, expandable rows — v7.0
- ✓ Server-side data operations via async callbacks with AbortController, debouncing, error handling — v7.0
- ✓ @lit-ui/data-table package with SSR support, peer dependencies, JSX declarations, 18 CSS custom properties — v7.0
- ✓ CLI integration with copy-source starter template, registry entry, npm mapping — v7.0
- ✓ Documentation with 11 interactive demos, API reference (44 properties, 13 events), accessibility guide — v7.0
- ✓ All 18 components share a unified monochrome design token baseline (THEME-SPEC.md) — v8.0
- ✓ All 18 component default styles polished to shadcn aesthetic via semantic dark mode cascade — v8.0
- ✓ All 18 component docs pages expanded with complete CSS token tables (double-fallback form) — v8.0
- ✓ All 18 component skill files updated with complete CSS tokens and Behavior Notes sections — v8.0

### Active

*(None — all planned requirements shipped through v8.0. Next milestone to define new active requirements.)*

### Deferred

- Framework integration guides (React, Vue, Svelte) — from v1.1
- Accessibility documentation — from v1.1
- Search functionality in docs — from v1.1
- Auto-update mechanism for installed components
- Custom Elements Manifest for IDE integration
- @lit-ui/react package with React wrappers
- Runtime theme switching
- WCAG contrast validation in configurator
- Typography/animation/shadow customization
- JSON export/import of theme configuration

### Out of Scope

- Full ShadCN component parity (40+ components) — grow based on demand
- CSS-in-JS runtime — conflicts with Tailwind approach; performance overhead
- React-specific features — defeats framework-agnostic value proposition
- Built-in state management — conflicts with host framework's state management
- CJS output — modern bundlers handle ESM; CJS adds complexity
- Server-side theme config storage — keep it simple with URL-encoded params
- Runtime theme switching — build-time customization is simpler and SSR-compatible
- Per-component different themes — all components share one theme
- Component source modification — theme via Tailwind/CSS, not hardcoded values

## Context

**Technical patterns established:**
- TailwindElement base class with dual-mode styling (inline CSS for SSR, constructable stylesheets for client)
- isServer guards for DOM APIs (showModal, ElementInternals)
- @lit-labs/ssr with hydration import order pattern
- pnpm workspaces with lockstep versioning via changesets
- Peer dependencies for Lit and @lit-ui/core
- OKLCH color space with colorjs.io for perceptual uniformity
- Browser/Node isomorphic base64url encoding for theme sharing
- Direct component variable injection (--ui-button-*, --ui-dialog-*) for Shadow DOM theming

**Known limitations:**
- No auto-update for installed components
- 30 CLI tests need update for CSS variable naming change (tech debt from v3.0)
- CalendarMulti component exported but unused by other packages (available for custom use)
- CLI registry.json has incorrect time-picker→calendar dependency (minor, causes unnecessary install)

## Constraints

- **Framework**: Lit.js — chosen for native web component support and small footprint
- **Styling**: Tailwind CSS v4 — CSS-based configuration (not legacy config file)
- **Distribution**: CLI copy-source mode OR npm packages (user choice)
- **Browser support**: Modern browsers only (constructable stylesheets, Declarative Shadow DOM)
- **SSR**: Requires @lit-labs/ssr and proper hydration import order
- **Theme persistence**: URL-encoded in CLI command (no server storage)

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
| Build-time theming over runtime | Simpler, no JS overhead, works with SSR | ✓ Good — no runtime cost, SSR-compatible |
| URL-encoded token config | No server needed, shareable commands | ✓ Good — stateless, portable |
| Tailwind CSS layer for themes | Integrates with user's existing Tailwind setup | ✓ Good — no config conflicts |
| OKLCH color space | Perceptual uniformity for calculated shades | ✓ Good — mathematically correct shade scales |
| Direct --ui-* component variables | Shadow DOM can't inherit through @theme | ✓ Good — reliable Shadow DOM theming |
| Browser-compatible base64url | Node Buffer not available in browsers | ✓ Good — works everywhere |
| Floating UI for dropdown positioning | Collision detection, auto-placement, framework-agnostic | ✓ Good — zero-config positioning |
| ARIA 1.2 combobox pattern | Modern standard, uses aria-controls not aria-owns | ✓ Good — correct screen reader behavior |
| Slot + property fallback for options | Slot always rendered; property options when slot empty | ✓ Good — flexible API |
| @tanstack/lit-virtual for large lists | DOM recycling for 100+ options | ✓ Good — 60fps scroll performance |
| AbortController for async search | Cancel previous requests on new input | ✓ Good — no race conditions |
| IntersectionObserver for infinite scroll | Sentinel element at bottom triggers load | ✓ Good — reliable pagination |
| Minimal CLI starter template | Full select is 1500+ lines; starter provides ~200 line shell | ✓ Good — manageable starting point |
| RadioGroup owns form participation | Shadow DOM breaks native radio name-grouping | ✓ Good — correct form behavior |
| CheckboxGroup NOT form-associated | Children submit independently (matches native HTML) | ✓ Good — simpler, correct semantics |
| Space-only keyboard for checkbox | W3C APG checkbox spec does not include Enter | ✓ Good — spec-compliant |
| CSS transitions for all animations | Zero new dependencies, consistent with existing approach | ✓ Good — no runtime overhead |
| Per-file template lookup in CLI | Multi-file components need different templates per file | ✓ Good — correct copy-source output |
| date-fns for date manipulation | Comprehensive, tree-shakeable, immutable API | ✓ Good — clean utilities, small bundle impact |
| Intl API for calendar localization | Zero-bundle-cost i18n, browser-native | ✓ Good — no locale data to ship |
| KeyboardNavigationManager class | Reusable imperative keyboard nav for grids | ✓ Good — shared across month/decade/century views |
| Two-click range selection state machine | Clear UX: first click = start, second = end | ✓ Good — intuitive, handles edge cases |
| SVG clock face for time picker | Vector-based, scales to any size, precise hit areas | ✓ Good — clean rendering at all sizes |
| Web Speech API for voice input | Browser-native, no external dependency | ✓ Good — progressive enhancement |
| Pointer Events for gestures | Unified mouse/touch/pen API | ✓ Good — single code path for all inputs |
| Bundle Floating UI into @lit-ui/core/floating | Zero-config DX for consumers | ✓ Good — no extra installs needed |
| composed-offset-position for Shadow DOM | Fix Floating UI offsetParent in Shadow DOM | ✓ Good — correct positioning in nested shadow roots |
| tooltipTitle property (not title) | Avoid shadowing HTMLElement.title | ✓ Good — no attribute conflicts |
| Tooltip position:fixed without Popover API | z-index:50 sufficient for non-interactive overlay | ✓ Good — simpler implementation |
| Imperative showPopover()/hidePopover() | Shadow DOM spec limits declarative popovertarget | ✓ Good — works reliably cross-shadow |
| Sentinel-based focus trap for modal popover | Native dialog showModal() not available for popover | ✓ Good — correct focus wrapping |
| Singleton state manager for toast | Decouple imperative API from web component rendering | ✓ Good — framework-agnostic, proven pattern |
| popover="manual" for toaster top-layer | Free top-layer above dialogs, no stacking context issues | ✓ Good — renders above everything |
| Namespaced template keys for toast | Bare fileStem too generic for multi-file components | ✓ Good — prevents future collisions |
| CSS var() fallbacks in copy-source templates | Standalone usage without token system needs defaults | ✓ Good — visual correctness without setup |
| @starting-style entry only (no exit animation) for toast | Simpler initial implementation | — Pending — may add animated exit later |
| CSS Grid 0fr/1fr for accordion animation | Cross-browser height animation without JS measurement | ✓ Good — smooth, no layout thrashing |
| Parent-child container pattern reuse | Same discovery/state pattern as RadioGroup/CheckboxGroup | ✓ Good — consistent architecture |
| Container-rendered tablist in shadow DOM | ARIA roles stay in single shadow root | ✓ Good — correct ARIA, simpler state |
| _focusedValue separate from active value | Manual activation needs independent focus tracking | ✓ Good — clean separation of concerns |
| CSS transition indicator (no JS animation) | Consistent with project's CSS-first approach | ✓ Good — no runtime overhead |
| Lazy panels return `nothing` | Zero DOM footprint for unmounted panels | ✓ Good — minimal memory usage |
| Scroll buttons aria-hidden + tabindex=-1 | Keep scroll nav out of keyboard tab order | ✓ Good — clean tab flow |
| TanStack Table for headless state | Lit-native reactive controller, handles sort/filter/pagination | ✓ Good — proven, extensible |
| TanStack Virtual for row virtualization | Already used in Select, proven for 100K+ items | ✓ Good — 60fps with 100K rows |
| Fixed 48px row height | Variable heights break virtual scroll performance | ✓ Good — consistent performance |
| Div-based ARIA grid layout | Required for virtualization; native table elements incompatible | ✓ Good — correct ARIA, virtual scroll works |
| Native HTML inputs in edit cells | LitUI components exceed 48px row height | ✓ Good — compact, fits fixed rows |
| Cell renderers as factory functions | Not custom elements; matches createSelectionColumn pattern | ✓ Good — no element overhead |
| Native confirmation dialog for bulk | Avoids lui-dialog dependency overhead | ✓ Good — matches project pattern |
| Column preferences with version field | Enables future migration of stored preferences | ✓ Good — forward-compatible |
| Utility column _ prefix exclusion | All columns with _ prefix excluded from CSV export | ✓ Good — clean export output |
| v8.0 polish-only milestone (no new components) | Unify design without scope creep | ✓ Good — focused, shipped in 23 days |
| Semantic dark mode cascade over hardcoded .dark tokens | Hardcoded tokens fight the semantic token system | ✓ Good — dark mode now correct everywhere |
| Double-fallback var() form in docs/skill tables | Single var() breaks if --color-* not imported | ✓ Good — tables work in both contexts |
| THEME-SPEC.md as authoritative token reference | Phases needed concrete spec, not abstract descriptions | ✓ Good — all 18 phases executed consistently |
| Retain oklch literals and white values as .dark exceptions | These cannot cascade from :root through semantic tokens | ✓ Good — correct per-exception approach |

## Shipped Milestones

- **v1.0 MVP** (2026-01-24): Button, Dialog, CLI with copy-source distribution
- **v2.0 NPM + SSR** (2026-01-25): NPM packages, SSR support, dual distribution
- **v3.0 Theme Customization** (2026-01-25): Visual configurator, OKLCH themes, preset themes, shareable URLs
- **v3.1 Docs Dark Mode** (2026-01-25): Global theme toggle, localStorage persistence, full dark mode styling
- **v4.0 Form Inputs** (2026-01-26): Input and Textarea components with validation, form participation
- **v4.1 Select Component** (2026-01-27): Full-featured Select with single, multi, combobox, and async loading
- **v4.2 Form Controls** (2026-01-27): Checkbox, Radio, Switch with group containers, completing form primitives
- **v4.3 Date/Time Components** (2026-02-02): Calendar, Date Picker, Date Range Picker, Time Picker with full accessibility
- **v5.0 Overlay & Feedback Components** (2026-02-02): Toast, Tooltip, Popover with shared Floating UI infrastructure
- **v6.0 Layout Components** (2026-02-02): Accordion, Tabs with full accessibility, animations, SSR, CLI, documentation
- **v7.0 Data Table** (2026-02-05): Full-featured data table with virtual scrolling, sorting, filtering, inline editing, selection, bulk actions, column customization, CSV export, expandable rows
- **v8.0 Design System Polish** (2026-02-28): Unified monochrome design system — removed hardcoded dark mode overrides from all 18 components, expanded CSS token docs (avg 3x more tokens per component), rewrote all 18 skill files with Behavior Notes sections

## Current Milestone

No active milestone. Run `/gsd:new-milestone` to start the next.

---
*Last updated: 2026-02-28 after v8.0 milestone*
