# Roadmap: LitUI

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-01-24)
- 🚧 **v1.1 Documentation Site** — Phases 6-12 (in progress)
- ✅ **v2.0 NPM + SSR** — Phases 13-20 (shipped 2026-01-25) → [archive](milestones/v2.0-ROADMAP.md)
- 🚧 **v3.0 Theme Customization** — Phases 21-24 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-5) - SHIPPED 2026-01-24</summary>

### Phase 1: Foundation
**Goal**: Project scaffolding with Lit, Tailwind v4, TypeScript, Vite
**Plans**: 4 plans (complete)

### Phase 2: Button Component
**Goal**: Polished button with variants, sizes, form participation, loading states
**Plans**: 4 plans (complete)

### Phase 3: Dialog Component
**Goal**: Accessible modal with focus trap, ARIA, animations, nested support
**Plans**: 4 plans (complete)

### Phase 4: CLI
**Goal**: npx lit-ui commands for init, add, list with build tool detection
**Plans**: 6 plans (complete)

### Phase 5: Framework Verification
**Goal**: Verify components work in React 19, Vue 3, Svelte 5
**Plans**: 4 plans (complete)

</details>

<details>
<summary>v1.1 Documentation Site (Phases 6-12) - IN PROGRESS</summary>

### Phase 6: Docs Foundation
**Goal**: Standalone docs app with navigation and responsive layout
**Plans**: 3 plans (complete)

### Phase 7: Getting Started
**Goal**: New users can install and use their first component
**Plans**: 2 plans (complete)

### Phase 8: Component Documentation
**Goal**: Complete API reference and examples for Button and Dialog
**Plans**: 4 plans (complete)

### Phase 9: Framework Guides
**Goal**: Developers know how to use components in their framework
**Plans**: TBD

### Phase 10: Theming Documentation
**Goal**: Developers can customize component appearance
**Plans**: TBD

### Phase 11: Accessibility Documentation
**Goal**: Developers understand accessibility patterns in components
**Plans**: TBD

### Phase 12: Polish
**Goal**: Docs are discoverable and searchable
**Plans**: TBD

</details>

---

<details>
<summary>✅ v2.0 NPM + SSR (Phases 13-20) — SHIPPED 2026-01-25</summary>

- [x] Phase 13: Monorepo Infrastructure (5/5 plans) — completed 2026-01-25
- [x] Phase 14: Core Package (3/3 plans) — completed 2026-01-25
- [x] Phase 15: Component Packages (3/3 plans) — completed 2026-01-25
- [x] Phase 16: SSR Package (2/2 plans) — completed 2026-01-25
- [x] Phase 17: Framework Integration (3/3 plans) — completed 2026-01-25
- [x] Phase 18: CLI Enhancement (4/4 plans) — completed 2026-01-25
- [x] Phase 19: Publishing (4/4 plans) — completed 2026-01-25
- [x] Phase 20: Documentation (3/3 plans) — completed 2026-01-25

Full details: [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md)

</details>

---

## v3.0 Theme Customization

**Milestone Goal:** Give users build-time control over component appearance through a visual configurator that generates customized CLI commands.

### Phase 21: Theme System Foundation ✓
**Goal**: Token schema, encoding/decoding utilities, and CSS generation logic that transforms configurations into Tailwind-compatible CSS
**Depends on**: Phase 20 (v2.0 complete)
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, CONFIG-11
**Success Criteria** (what must be TRUE):
  1. Token schema TypeScript interface exists defining all customizable tokens (colors, radius)
  2. Encoding utility produces URL-safe base64url string from token config
  3. Decoding utility reconstructs token config from encoded string with validation
  4. CSS generator produces valid :root and .dark blocks from token config
  5. Generated CSS integrates with Tailwind v4 (cascades into Shadow DOM)
**Plans**: 5 plans (complete)
**Completed**: 2026-01-25
Plans:
- [x] 21-01-PLAN.md — Token schema and default theme (TDD)
- [x] 21-02-PLAN.md — OKLCH color utilities (TDD)
- [x] 21-03-PLAN.md — URL encoding/decoding (TDD)
- [x] 21-04-PLAN.md — CSS generator (TDD)
- [x] 21-05-PLAN.md — Integration tests and finalization

### Phase 22: CLI Theme Integration ✓
**Goal**: CLI accepts encoded theme configuration and generates CSS file with user's design tokens
**Depends on**: Phase 21
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05
**Success Criteria** (what must be TRUE):
  1. `lit-ui init --theme <encoded>` parses and validates the theme parameter
  2. CLI decodes theme config and reports validation errors clearly
  3. CLI generates/updates lit-ui-theme.css with theme colors
  4. Theme applies via `lit-ui theme <encoded>` command post-init
  5. Generated CSS uses :root variables that cascade into component Shadow DOM
**Plans**: 4 plans (complete)
**Completed**: 2026-01-25
Plans:
- [x] 22-01-PLAN.md — Shared theme utilities (detect-css-entry, inject-import, apply-theme)
- [x] 22-02-PLAN.md — Init command --theme parameter
- [x] 22-03-PLAN.md — Standalone theme command
- [x] 22-04-PLAN.md — CLI theme integration tests

### Phase 23: Visual Configurator Core ✓
**Goal**: Users can visually customize theme colors and see live preview of components
**Depends on**: Phase 22
**Requirements**: CONFIG-01, CONFIG-02, CONFIG-03, CONFIG-04, CONFIG-05, CONFIG-06, COMP-01, COMP-02, COMP-03
**Success Criteria** (what must be TRUE):
  1. Configurator page exists on docs site with color pickers and controls
  2. Live preview updates components as user changes theme values
  3. User can customize primary, secondary, destructive, background, foreground, muted colors
  4. User can customize border radius
  5. User can edit light and dark mode simultaneously (both visible or switchable)
**Plans**: 4 plans (complete)
**Completed**: 2026-01-25
Plans:
- [x] 23-01-PLAN.md — Foundation: color utilities and ConfiguratorContext
- [x] 23-02-PLAN.md — Color picker UI components
- [x] 23-03-PLAN.md — Preview, layout, modal, and routing
- [x] 23-04-PLAN.md — Human verification checkpoint

### Phase 24: Presets and Enhanced Features
**Goal**: Preset themes, shareable URLs, and CLI command generation complete the configurator experience
**Depends on**: Phase 23
**Requirements**: CONFIG-07, CONFIG-08, CONFIG-09, CONFIG-10, CONFIG-12
**Success Criteria** (what must be TRUE):
  1. Preset themes available (default, dark, blue, green or similar)
  2. User can apply preset with one click and see it reflected in preview
  3. Configurator generates npx command with encoded theme for copying
  4. User can generate shareable theme URL that restores configuration when loaded
  5. Shade scales auto-calculate from primary color (user picks base, variants derived)
**Plans**: 3 plans
Plans:
- [ ] 24-01-PLAN.md — Foundation: export generateScale, presets data, loadThemeConfig
- [ ] 24-02-PLAN.md — UI components: PresetSelector, ShareButton, ShadeScaleDisplay
- [ ] 24-03-PLAN.md — Integration: wire components, URL sync, verification

---

## Progress

**Execution Order:**
- v1.0: Phases 1-5 (complete)
- v1.1: Phases 6-12 (6->7->8->9->10->11->12)
- v2.0: Phases 13-20 (complete)
- v3.0: Phases 21-24 (21->22->23->24)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-01-24 |
| 2. Button | v1.0 | 4/4 | Complete | 2026-01-24 |
| 3. Dialog | v1.0 | 4/4 | Complete | 2026-01-24 |
| 4. CLI | v1.0 | 6/6 | Complete | 2026-01-24 |
| 5. Verification | v1.0 | 4/4 | Complete | 2026-01-24 |
| 6. Docs Foundation | v1.1 | 3/3 | Complete | 2026-01-24 |
| 7. Getting Started | v1.1 | 2/2 | Complete | 2026-01-24 |
| 8. Component Docs | v1.1 | 4/4 | Complete | 2026-01-24 |
| 9. Framework Guides | v1.1 | 0/? | Not started | - |
| 10. Theming Docs | v1.1 | 0/? | Not started | - |
| 11. Accessibility Docs | v1.1 | 0/? | Not started | - |
| 12. Polish | v1.1 | 0/? | Not started | - |
| 13. Monorepo Infrastructure | v2.0 | 5/5 | Complete | 2026-01-25 |
| 14. Core Package | v2.0 | 3/3 | Complete | 2026-01-25 |
| 15. Component Packages | v2.0 | 3/3 | Complete | 2026-01-25 |
| 16. SSR Package | v2.0 | 2/2 | Complete | 2026-01-25 |
| 17. Framework Integration | v2.0 | 3/3 | Complete | 2026-01-25 |
| 18. CLI Enhancement | v2.0 | 4/4 | Complete | 2026-01-25 |
| 19. Publishing | v2.0 | 4/4 | Complete | 2026-01-25 |
| 20. Documentation | v2.0 | 3/3 | Complete | 2026-01-25 |
| 21. Theme System Foundation | v3.0 | 5/5 | Complete | 2026-01-25 |
| 22. CLI Theme Integration | v3.0 | 4/4 | Complete | 2026-01-25 |
| 23. Visual Configurator Core | v3.0 | 4/4 | Complete | 2026-01-25 |
| 24. Presets and Enhanced Features | v3.0 | 0/3 | Planned | - |

---
*Roadmap created: 2026-01-24*
*Last updated: 2026-01-25 (Phase 24 planned: Presets and Enhanced Features)*
