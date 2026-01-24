# Requirements: lit-ui

**Defined:** 2026-01-24
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v1.1 Requirements

Requirements for the documentation site milestone.

### Infrastructure

- [x] **INFRA-01**: Docs app in `/docs` folder with same stack as landing (React, Tailwind v4, Vite)
- [x] **INFRA-02**: Sidebar navigation with collapsible sections
- [x] **INFRA-03**: Mobile-responsive layout with hamburger menu
- [ ] **INFRA-04**: Search functionality or comprehensive anchor links
- [ ] **INFRA-05**: Link from landing page header to docs

### Getting Started

- [ ] **START-01**: Installation page covering `npx lit-ui init`
- [ ] **START-02**: Quick start guide (add first component)
- [ ] **START-03**: Project structure explanation

### Component Documentation

- [ ] **COMP-01**: Button API reference (props, slots, events)
- [ ] **COMP-02**: Button live examples (all variants, sizes, states)
- [ ] **COMP-03**: Dialog API reference (props, slots, events)
- [ ] **COMP-04**: Dialog live examples (basic, nested, dismissible)

### Framework Guides

- [ ] **FRAME-01**: React integration guide
- [ ] **FRAME-02**: Vue integration guide
- [ ] **FRAME-03**: Svelte integration guide

### Theming

- [ ] **THEME-01**: Design tokens documentation (colors, spacing, typography)
- [ ] **THEME-02**: Customization guide (CSS custom properties)
- [ ] **THEME-03**: Dark mode setup guide

### Accessibility

- [ ] **A11Y-01**: Accessibility overview (WCAG compliance)
- [ ] **A11Y-02**: Keyboard navigation patterns
- [ ] **A11Y-03**: Screen reader considerations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full-text search with indexing | Overkill for 2 components; anchor links sufficient |
| Versioned docs | Single version (v1) for now |
| User comments/feedback | Not needed for initial docs |
| Playground/sandbox environment | Live examples in-page are sufficient |
| Internationalization | English only for v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 6 | Complete |
| INFRA-02 | Phase 6 | Complete |
| INFRA-03 | Phase 6 | Complete |
| INFRA-04 | Phase 12 | Pending |
| INFRA-05 | Phase 12 | Pending |
| START-01 | Phase 7 | Pending |
| START-02 | Phase 7 | Pending |
| START-03 | Phase 7 | Pending |
| COMP-01 | Phase 8 | Pending |
| COMP-02 | Phase 8 | Pending |
| COMP-03 | Phase 8 | Pending |
| COMP-04 | Phase 8 | Pending |
| FRAME-01 | Phase 9 | Pending |
| FRAME-02 | Phase 9 | Pending |
| FRAME-03 | Phase 9 | Pending |
| THEME-01 | Phase 10 | Pending |
| THEME-02 | Phase 10 | Pending |
| THEME-03 | Phase 10 | Pending |
| A11Y-01 | Phase 11 | Pending |
| A11Y-02 | Phase 11 | Pending |
| A11Y-03 | Phase 11 | Pending |

**Coverage:**
- v1.1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-01-24*
*Last updated: 2026-01-24 after roadmap creation*
