# Requirements: LitUI v3.1

**Defined:** 2026-01-25
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v3.1 Requirements

Requirements for docs site dark mode. Single phase milestone.

### Dark Mode

- [ ] **DARK-01**: Global header displays theme toggle button on every docs page
- [ ] **DARK-02**: Toggle switches between light and dark mode for entire docs site
- [ ] **DARK-03**: Theme preference persists in localStorage across browser sessions
- [ ] **DARK-04**: Initial theme defaults to system preference (prefers-color-scheme)
- [ ] **DARK-05**: Dark mode styling for navigation (sidebar, header, links)
- [ ] **DARK-06**: Dark mode styling for content areas (backgrounds, text, borders)
- [ ] **DARK-07**: Dark mode styling for code blocks and syntax highlighting
- [ ] **DARK-08**: Configurator page toggle and header toggle control same theme state

## Future Requirements

Deferred to later milestones.

### Documentation Completion (v1.1 phases 9-12)

- Framework integration guides (React, Vue, Svelte)
- Accessibility documentation
- Theming documentation
- Search functionality

### Enhanced Theme Features

- WCAG contrast validation in configurator
- Typography/animation/shadow customization
- JSON export/import of theme configuration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Runtime theme switching for components | Build-time theming is simpler, SSR-compatible |
| Multiple theme presets for docs site | Light/dark is sufficient |
| Per-page theme overrides | Unnecessary complexity |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DARK-01 | Phase 25 | Pending |
| DARK-02 | Phase 25 | Pending |
| DARK-03 | Phase 25 | Pending |
| DARK-04 | Phase 25 | Pending |
| DARK-05 | Phase 25 | Pending |
| DARK-06 | Phase 25 | Pending |
| DARK-07 | Phase 25 | Pending |
| DARK-08 | Phase 25 | Pending |

**Coverage:**
- v3.1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-25*
*Last updated: 2026-01-25 after initial definition*
