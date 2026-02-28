# Requirements: LitUI

**Defined:** 2026-02-27
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v8.0 Requirements

Requirements for the Design System Polish milestone. Each component phase maps to: style polish + docs update + skill update.

### Theme Foundation

- [x] **THEME-01**: All components share a unified monochrome design token baseline (spacing, radius, color scale, shadows, transitions) defined in `@lit-ui/core`
- [x] **THEME-02**: Default component styles match shadcn aesthetic — neutral grays, clean borders, subtle shadows — as concrete CSS custom property values
- [x] **THEME-03**: Theme token reference document written so all subsequent component phases have a concrete spec to match against

### Button

- [x] **BTN-01**: Button default styles match the v8.0 monochrome theme
- [x] **BTN-02**: Button docs page is accurate and up-to-date
- [x] **BTN-03**: `skill/skills/button` skill file is accurate and up-to-date

### Dialog

- [x] **DLG-01**: Dialog default styles match the v8.0 monochrome theme
- [x] **DLG-02**: Dialog docs page is accurate and up-to-date
- [x] **DLG-03**: `skill/skills/dialog` skill file is accurate and up-to-date

### Input

- [x] **INP-01**: Input default styles match the v8.0 monochrome theme
- [x] **INP-02**: Input docs page is accurate and up-to-date
- [x] **INP-03**: `skill/skills/input` skill file is accurate and up-to-date

### Textarea

- [x] **TXT-01**: Textarea default styles match the v8.0 monochrome theme
- [x] **TXT-02**: Textarea docs page is accurate and up-to-date
- [x] **TXT-03**: `skill/skills/textarea` skill file is accurate and up-to-date

### Select

- [x] **SEL-01**: Select default styles match the v8.0 monochrome theme
- [x] **SEL-02**: Select docs page is accurate and up-to-date
- [x] **SEL-03**: `skill/skills/select` skill file is accurate and up-to-date

### Checkbox

- [x] **CHK-01**: Checkbox default styles match the v8.0 monochrome theme
- [ ] **CHK-02**: Checkbox docs page is accurate and up-to-date
- [ ] **CHK-03**: `skill/skills/checkbox` skill file is accurate and up-to-date

### Radio

- [ ] **RAD-01**: Radio default styles match the v8.0 monochrome theme
- [ ] **RAD-02**: Radio docs page is accurate and up-to-date
- [ ] **RAD-03**: `skill/skills/radio` skill file is accurate and up-to-date

### Switch

- [ ] **SWT-01**: Switch default styles match the v8.0 monochrome theme
- [ ] **SWT-02**: Switch docs page is accurate and up-to-date
- [ ] **SWT-03**: `skill/skills/switch` skill file is accurate and up-to-date

### Calendar

- [ ] **CAL-01**: Calendar default styles match the v8.0 monochrome theme
- [ ] **CAL-02**: Calendar docs page is accurate and up-to-date
- [ ] **CAL-03**: `skill/skills/calendar` skill file is accurate and up-to-date

### Date Picker

- [ ] **DTP-01**: Date Picker default styles match the v8.0 monochrome theme
- [ ] **DTP-02**: Date Picker docs page is accurate and up-to-date
- [ ] **DTP-03**: `skill/skills/date-picker` skill file is accurate and up-to-date

### Date Range Picker

- [ ] **DRP-01**: Date Range Picker default styles match the v8.0 monochrome theme
- [ ] **DRP-02**: Date Range Picker docs page is accurate and up-to-date
- [ ] **DRP-03**: `skill/skills/date-range-picker` skill file is accurate and up-to-date

### Time Picker

- [ ] **TMP-01**: Time Picker default styles match the v8.0 monochrome theme
- [ ] **TMP-02**: Time Picker docs page is accurate and up-to-date
- [ ] **TMP-03**: `skill/skills/time-picker` skill file is accurate and up-to-date

### Tooltip

- [ ] **TTP-01**: Tooltip default styles match the v8.0 monochrome theme
- [ ] **TTP-02**: Tooltip docs page is accurate and up-to-date
- [ ] **TTP-03**: `skill/skills/tooltip` skill file is accurate and up-to-date

### Popover

- [ ] **POP-01**: Popover default styles match the v8.0 monochrome theme
- [ ] **POP-02**: Popover docs page is accurate and up-to-date
- [ ] **POP-03**: `skill/skills/popover` skill file is accurate and up-to-date

### Toast

- [ ] **TST-01**: Toast default styles match the v8.0 monochrome theme
- [ ] **TST-02**: Toast docs page is accurate and up-to-date
- [ ] **TST-03**: `skill/skills/toast` skill file is accurate and up-to-date

### Accordion

- [ ] **ACC-01**: Accordion default styles match the v8.0 monochrome theme
- [ ] **ACC-02**: Accordion docs page is accurate and up-to-date
- [ ] **ACC-03**: `skill/skills/accordion` skill file is accurate and up-to-date

### Tabs

- [ ] **TAB-01**: Tabs default styles match the v8.0 monochrome theme
- [ ] **TAB-02**: Tabs docs page is accurate and up-to-date
- [ ] **TAB-03**: `skill/skills/tabs` skill file is accurate and up-to-date

### Data Table

- [ ] **DAT-01**: Data Table default styles match the v8.0 monochrome theme
- [ ] **DAT-02**: Data Table docs page is accurate and up-to-date
- [ ] **DAT-03**: `skill/skills/data-table` skill file is accurate and up-to-date

## Future Requirements

*(None identified — this milestone completes a foundational pass)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| New components | This milestone is polish-only; new components are a separate milestone |
| Runtime theme switching | Already out of scope per project decisions |
| Per-component different themes | All components share one theme by design |
| Breaking CSS API changes | Preserve existing `--ui-*` token names; only update default values |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| THEME-01 | Phase 69 | Complete |
| THEME-02 | Phase 69 | Complete |
| THEME-03 | Phase 69 | Complete |
| BTN-01 | Phase 70 | Complete |
| BTN-02 | Phase 70 | Complete |
| BTN-03 | Phase 70 | Complete |
| DLG-01 | Phase 71 | Complete |
| DLG-02 | Phase 71 | Complete |
| DLG-03 | Phase 71 | Complete |
| INP-01 | Phase 72 | Complete |
| INP-02 | Phase 72 | Complete |
| INP-03 | Phase 72 | Complete |
| TXT-01 | Phase 73 | Complete |
| TXT-02 | Phase 73 | Complete |
| TXT-03 | Phase 73 | Complete |
| SEL-01 | Phase 74 | Complete |
| SEL-02 | Phase 74 | Complete |
| SEL-03 | Phase 74 | Complete |
| CHK-01 | Phase 75 | Complete |
| CHK-02 | Phase 75 | Pending |
| CHK-03 | Phase 75 | Pending |
| RAD-01 | Phase 76 | Pending |
| RAD-02 | Phase 76 | Pending |
| RAD-03 | Phase 76 | Pending |
| SWT-01 | Phase 77 | Pending |
| SWT-02 | Phase 77 | Pending |
| SWT-03 | Phase 77 | Pending |
| CAL-01 | Phase 78 | Pending |
| CAL-02 | Phase 78 | Pending |
| CAL-03 | Phase 78 | Pending |
| DTP-01 | Phase 79 | Pending |
| DTP-02 | Phase 79 | Pending |
| DTP-03 | Phase 79 | Pending |
| DRP-01 | Phase 80 | Pending |
| DRP-02 | Phase 80 | Pending |
| DRP-03 | Phase 80 | Pending |
| TMP-01 | Phase 81 | Pending |
| TMP-02 | Phase 81 | Pending |
| TMP-03 | Phase 81 | Pending |
| TTP-01 | Phase 82 | Pending |
| TTP-02 | Phase 82 | Pending |
| TTP-03 | Phase 82 | Pending |
| POP-01 | Phase 83 | Pending |
| POP-02 | Phase 83 | Pending |
| POP-03 | Phase 83 | Pending |
| TST-01 | Phase 84 | Pending |
| TST-02 | Phase 84 | Pending |
| TST-03 | Phase 84 | Pending |
| ACC-01 | Phase 85 | Pending |
| ACC-02 | Phase 85 | Pending |
| ACC-03 | Phase 85 | Pending |
| TAB-01 | Phase 86 | Pending |
| TAB-02 | Phase 86 | Pending |
| TAB-03 | Phase 86 | Pending |
| DAT-01 | Phase 87 | Pending |
| DAT-02 | Phase 87 | Pending |
| DAT-03 | Phase 87 | Pending |

**Coverage:**
- v8.0 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after initial definition*
