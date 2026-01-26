# Requirements: LitUI v4.0

**Defined:** 2026-01-26
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v4.0 Requirements

Requirements for Input and Textarea components. Form primitives with full validation.

### Input Component

- [ ] **INPUT-01**: Input renders text, email, password, number, and search types
- [ ] **INPUT-02**: Input supports size variants (sm, default, lg)
- [ ] **INPUT-03**: Input supports disabled and readonly states
- [ ] **INPUT-04**: Input participates in native forms via ElementInternals
- [ ] **INPUT-05**: Input validates required fields (shows error when empty on submit)
- [ ] **INPUT-06**: Input validates minlength/maxlength constraints
- [ ] **INPUT-07**: Input validates pattern attribute (regex)
- [ ] **INPUT-08**: Input validates email format for type="email"
- [ ] **INPUT-09**: Input validates min/max for type="number"
- [ ] **INPUT-10**: Input shows focus ring on keyboard focus
- [ ] **INPUT-11**: Input shows error visual state when invalid
- [ ] **INPUT-12**: Input supports placeholder text
- [ ] **INPUT-13**: Password input has visibility toggle button
- [ ] **INPUT-14**: Search input has clear button when not empty
- [ ] **INPUT-15**: Input supports prefix slot (icon/text before input)
- [ ] **INPUT-16**: Input supports suffix slot (icon/text after input)
- [ ] **INPUT-17**: Input supports optional character counter (current/max)

### Textarea Component

- [ ] **TEXTAREA-01**: Textarea renders multi-line text input
- [ ] **TEXTAREA-02**: Textarea supports rows attribute for initial height
- [ ] **TEXTAREA-03**: Textarea supports resize property (none, vertical, horizontal, both)
- [ ] **TEXTAREA-04**: Textarea participates in native forms via ElementInternals
- [ ] **TEXTAREA-05**: Textarea validates required fields
- [ ] **TEXTAREA-06**: Textarea validates minlength/maxlength constraints
- [ ] **TEXTAREA-07**: Textarea shows focus ring on keyboard focus
- [ ] **TEXTAREA-08**: Textarea shows error visual state when invalid
- [ ] **TEXTAREA-09**: Textarea supports placeholder text
- [ ] **TEXTAREA-10**: Textarea auto-resizes to fit content (optional, via attribute)
- [ ] **TEXTAREA-11**: Textarea supports optional character counter (current/max)

### Infrastructure

- [ ] **INFRA-01**: CSS tokens for input/textarea added to @lit-ui/core
- [ ] **INFRA-02**: @lit-ui/input package created with SSR support
- [ ] **INFRA-03**: @lit-ui/textarea package created with SSR support
- [ ] **INFRA-04**: CLI templates updated for input and textarea
- [ ] **INFRA-05**: Docs pages created for Input and Textarea components

## Future Requirements

Deferred to later milestones.

### Additional Form Components (v4.1+)

- Select/Dropdown component
- Checkbox component
- Radio component
- Switch toggle component

### Documentation (v1.1 phases 9-12)

- Framework integration guides (React, Vue, Svelte)
- Accessibility documentation
- Theming documentation
- Search functionality

## Out of Scope

| Feature | Reason |
|---------|--------|
| Integrated labels | Breaks composition; users wrap with their own label |
| Built-in form library integration | Framework-specific; conflicts with agnostic value |
| Input masking | Complex edge cases; use external library |
| Date/time/color/range inputs | Different enough to warrant separate components |
| Automatic error message display | Opinionated; users control error UI |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 26 | Pending |
| INPUT-01 | Phase 27 | Pending |
| INPUT-02 | Phase 27 | Pending |
| INPUT-03 | Phase 27 | Pending |
| INPUT-04 | Phase 27 | Pending |
| INPUT-05 | Phase 27 | Pending |
| INPUT-06 | Phase 27 | Pending |
| INPUT-07 | Phase 27 | Pending |
| INPUT-08 | Phase 27 | Pending |
| INPUT-09 | Phase 27 | Pending |
| INPUT-10 | Phase 27 | Pending |
| INPUT-11 | Phase 27 | Pending |
| INPUT-12 | Phase 27 | Pending |
| INFRA-02 | Phase 27 | Pending |
| INPUT-13 | Phase 28 | Pending |
| INPUT-14 | Phase 28 | Pending |
| INPUT-15 | Phase 28 | Pending |
| INPUT-16 | Phase 28 | Pending |
| INPUT-17 | Phase 28 | Pending |
| TEXTAREA-01 | Phase 29 | Pending |
| TEXTAREA-02 | Phase 29 | Pending |
| TEXTAREA-03 | Phase 29 | Pending |
| TEXTAREA-04 | Phase 29 | Pending |
| TEXTAREA-05 | Phase 29 | Pending |
| TEXTAREA-06 | Phase 29 | Pending |
| TEXTAREA-07 | Phase 29 | Pending |
| TEXTAREA-08 | Phase 29 | Pending |
| TEXTAREA-09 | Phase 29 | Pending |
| TEXTAREA-10 | Phase 29 | Pending |
| TEXTAREA-11 | Phase 29 | Pending |
| INFRA-03 | Phase 29 | Pending |
| INFRA-04 | Phase 30 | Pending |
| INFRA-05 | Phase 30 | Pending |

**Coverage:**
- v4.0 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 after roadmap creation*
