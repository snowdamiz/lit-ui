# Requirements: LitUI v3.0 Theme Customization

**Defined:** 2026-01-25
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v3.0 Requirements

Requirements for theme customization milestone. Each maps to roadmap phases.

### Visual Configurator

- [ ] **CONFIG-01**: Configurator page exists on docs site
- [ ] **CONFIG-02**: Live preview updates as theme values change
- [ ] **CONFIG-03**: User can customize primary color
- [ ] **CONFIG-04**: User can customize secondary, destructive, background, foreground, muted, accent colors
- [ ] **CONFIG-05**: User can customize border radius
- [ ] **CONFIG-06**: User can edit light and dark mode simultaneously
- [ ] **CONFIG-07**: Preset themes available (default, dark, blue, green)
- [ ] **CONFIG-08**: User can apply preset with one click
- [ ] **CONFIG-09**: Configurator generates npx command with encoded theme
- [ ] **CONFIG-10**: User can generate shareable theme URL
- [ ] **CONFIG-11**: Colors use OKLCH for perceptual uniformity
- [ ] **CONFIG-12**: Shade scales auto-calculate from primary color

### CLI Theme Integration

- [ ] **CLI-01**: `lit-ui add` accepts `--theme` parameter with encoded config
- [ ] **CLI-02**: CLI decodes and validates theme config
- [ ] **CLI-03**: CLI generates/updates Tailwind CSS layer with theme colors
- [ ] **CLI-04**: Generated CSS integrates with Tailwind v4 @theme or :root
- [ ] **CLI-05**: Theme applies to all components installed in session

### Theme System

- [ ] **THEME-01**: Theme colors defined as CSS custom properties
- [ ] **THEME-02**: Theme integrates with user's Tailwind configuration
- [ ] **THEME-03**: Light and dark mode variants generated
- [ ] **THEME-04**: User can override theme via standard CSS mechanisms
- [ ] **THEME-05**: Components use theme colors via Tailwind utilities or CSS vars

### Component Integration

- [ ] **COMP-01**: Installed components display with configured theme
- [ ] **COMP-02**: Components work correctly in light and dark mode
- [ ] **COMP-03**: Theme persists across component installations (same session)

## Future Requirements (v3.1+)

### Enhanced Configurator

- **CONFIG-13**: WCAG contrast validation indicators
- **CONFIG-14**: JSON export/import of theme configuration
- **CONFIG-15**: Typography token customization
- **CONFIG-16**: Animation/transition customization
- **CONFIG-17**: Shadow customization

### Enhanced CLI

- **CLI-06**: Theme versioning for forward compatibility
- **CLI-07**: Theme migration between versions
- **CLI-08**: Per-component theme overrides

### Additional Features

- **FEAT-01**: Runtime theme switching
- **FEAT-02**: Theme inheritance/extension

## Out of Scope

| Feature | Reason |
|---------|--------|
| Runtime theme switching | v3.0 is build-time; runtime deferred to v3.1+ |
| Server-side config storage | URL-encoded params keep it simple |
| Per-component different themes | All components share one theme in v3.0 |
| Custom font uploads | Typography deferred to v3.1+ |
| Component source modification | Theme via Tailwind/CSS, not hardcoded values |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CONFIG-01 | TBD | Pending |
| CONFIG-02 | TBD | Pending |
| CONFIG-03 | TBD | Pending |
| CONFIG-04 | TBD | Pending |
| CONFIG-05 | TBD | Pending |
| CONFIG-06 | TBD | Pending |
| CONFIG-07 | TBD | Pending |
| CONFIG-08 | TBD | Pending |
| CONFIG-09 | TBD | Pending |
| CONFIG-10 | TBD | Pending |
| CONFIG-11 | TBD | Pending |
| CONFIG-12 | TBD | Pending |
| CLI-01 | TBD | Pending |
| CLI-02 | TBD | Pending |
| CLI-03 | TBD | Pending |
| CLI-04 | TBD | Pending |
| CLI-05 | TBD | Pending |
| THEME-01 | TBD | Pending |
| THEME-02 | TBD | Pending |
| THEME-03 | TBD | Pending |
| THEME-04 | TBD | Pending |
| THEME-05 | TBD | Pending |
| COMP-01 | TBD | Pending |
| COMP-02 | TBD | Pending |
| COMP-03 | TBD | Pending |

**Coverage:**
- v3.0 requirements: 25 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 25 ⚠️

---
*Requirements defined: 2026-01-25*
*Last updated: 2026-01-25 after clarification*
