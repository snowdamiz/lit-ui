# Roadmap: LitUI

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-24)
- ✅ **v2.0 NPM + SSR** - Phases 6-20 (shipped 2026-01-25)
- ✅ **v3.0 Theme Customization** - Phases 21-24 (shipped 2026-01-25)
- ✅ **v3.1 Docs Dark Mode** - Phases 25-27 (shipped 2026-01-25)
- ✅ **v4.0 Form Inputs** - Phases 28-30 (shipped 2026-01-26)
- ✅ **v4.1 Select Component** - Phases 31-37 (shipped 2026-01-27)
- ✅ **v4.2 Form Controls** - Phases 38-41 (shipped 2026-01-27)
- ✅ **v4.3 Date/Time Components** - Phases 42-50 (shipped 2026-02-02)
- ✅ **v5.0 Overlay & Feedback** - Phases 51-55 (shipped 2026-02-02)
- ✅ **v6.0 Layout Components** - Phases 56-60 (shipped 2026-02-02)
- ✅ **v7.0 Data Table** - Phases 61-68 (shipped 2026-02-05)
- 🚧 **v8.0 Design System Polish** - Phases 69-87 (in progress)

## Phases

<details>
<summary>✅ v1.0 through v7.0 (Phases 1-68) - SHIPPED 2026-02-05</summary>

Phases 1-68 are archived. See:
- `.planning/milestones/v7.0-ROADMAP.md`

</details>

### 🚧 v8.0 Design System Polish (In Progress)

**Milestone Goal:** Polish all 18 component default styles to a unified monochrome shadcn-quality theme, and ensure all docs pages and skill files are accurate.

**Wave structure per phase:**
- Wave 1 (01): Style polish — CSS default values match monochrome shadcn theme
- Wave 2 (02): Docs update — docs page accurate and up-to-date
- Wave 3 (03): Skill update — `skill/skills/<component>` accurate and up-to-date

- [x] **Phase 69: Theme Foundation** - Define unified monochrome design token baseline in `@lit-ui/core` (completed 2026-02-28)
- [x] **Phase 70: Button** - Polish Button styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 71: Dialog** - Polish Dialog styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 72: Input** - Polish Input styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 73: Textarea** - Polish Textarea styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 74: Select** - Polish Select styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 75: Checkbox** - Polish Checkbox styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 76: Radio** - Polish Radio styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 77: Switch** - Polish Switch styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 78: Calendar** - Polish Calendar styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 79: Date Picker** - Polish Date Picker styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 80: Date Range Picker** - Polish Date Range Picker styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 81: Time Picker** - Polish Time Picker styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 82: Tooltip** - Polish Tooltip styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 83: Popover** - Polish Popover styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 84: Toast** - Polish Toast styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 85: Accordion** - Polish Accordion styles, docs, and skill file (completed 2026-02-28)
- [x] **Phase 86: Tabs** - Polish Tabs styles, docs, and skill file (completed 2026-02-28)
- [ ] **Phase 87: Data Table** - Polish Data Table styles, docs, and skill file

## Phase Details

### Phase 69: Theme Foundation
**Goal**: A single authoritative token spec exists that all 18 components can reference during their polish pass
**Depends on**: Phase 68 (v7.0 complete)
**Requirements**: THEME-01, THEME-02, THEME-03
**Success Criteria** (what must be TRUE):
  1. A token reference doc exists listing every `--ui-*` default value for the monochrome shadcn theme (spacing, radius, color scale, shadows, transitions)
  2. The default values are concrete CSS custom property values (not abstract descriptions) matching neutral-gray shadcn aesthetics
  3. Any component phase can be executed against this spec without ambiguity about what "matching the theme" means
**Plans**: 1 plan

Plans:
- [x] 69-01-PLAN.md — Audit token defaults + write THEME-SPEC.md token reference document

### Phase 70: Button
**Goal**: Button component looks and feels like shadcn Button out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: BTN-01, BTN-02, BTN-03
**Success Criteria** (what must be TRUE):
  1. Button renders with correct monochrome default styles matching the Phase 69 token spec
  2. The Button docs page reflects the actual component API and examples without stale content
  3. `skill/skills/button` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 70-01-PLAN.md — Remove hardcoded button dark mode tokens from .dark block (BTN-01)
- [x] 70-02-PLAN.md — Update ButtonPage.tsx CSS vars to --ui-button-* names (BTN-02)
- [x] 70-03-PLAN.md — Rewrite skill/skills/button/SKILL.md with accurate v8.0 content (BTN-03)

### Phase 71: Dialog
**Goal**: Dialog component looks and feels like shadcn Dialog out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: DLG-01, DLG-02, DLG-03
**Success Criteria** (what must be TRUE):
  1. Dialog renders with correct monochrome default styles (backdrop, panel, borders) matching the token spec
  2. The Dialog docs page reflects the actual component API and examples without stale content
  3. `skill/skills/dialog` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 71-01-PLAN.md — Remove hardcoded dialog dark mode tokens from .dark block (DLG-01)
- [x] 71-02-PLAN.md — Update DialogPage.tsx CSS vars to --ui-dialog-* names (DLG-02)
- [x] 71-03-PLAN.md — Rewrite skill/skills/dialog/SKILL.md with accurate v8.0 content (DLG-03)

### Phase 72: Input
**Goal**: Input component looks and feels like shadcn Input out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: INP-01, INP-02, INP-03
**Success Criteria** (what must be TRUE):
  1. Input renders with correct monochrome default styles (border, focus ring, placeholder) matching the token spec
  2. The Input docs page reflects the actual component API and examples without stale content
  3. `skill/skills/input` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 72-01-PLAN.md — Remove hardcoded input dark mode tokens from .dark block (INP-01)
- [x] 72-02-PLAN.md — Expand InputPage.tsx CSS vars table to full token set (INP-02)
- [x] 72-03-PLAN.md — Rewrite skill/skills/input/SKILL.md with Behavior Notes and expanded tokens (INP-03)

### Phase 73: Textarea
**Goal**: Textarea component looks and feels like shadcn Textarea out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: TXT-01, TXT-02, TXT-03
**Success Criteria** (what must be TRUE):
  1. Textarea renders with correct monochrome default styles matching the token spec
  2. The Textarea docs page reflects the actual component API and examples without stale content
  3. `skill/skills/textarea` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 73-01-PLAN.md — Remove hardcoded textarea dark mode tokens from .dark block (TXT-01)
- [x] 73-02-PLAN.md — Expand TextareaPage.tsx CSS vars table to full token set (TXT-02)
- [x] 73-03-PLAN.md — Rewrite skill/skills/textarea/SKILL.md with Behavior Notes and expanded tokens (TXT-03)

### Phase 74: Select
**Goal**: Select component looks and feels like shadcn Select out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: SEL-01, SEL-02, SEL-03
**Success Criteria** (what must be TRUE):
  1. Select (single, multi, combobox) renders with correct monochrome default styles matching the token spec
  2. The Select docs page reflects the actual component API and examples without stale content
  3. `skill/skills/select` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 74-01-PLAN.md — Remove hardcoded select dark mode tokens from .dark block (SEL-01)
- [x] 74-02-PLAN.md — Expand SelectPage.tsx CSS vars table to full token set and remove phase badges (SEL-02)
- [x] 74-03-PLAN.md — Rewrite skill/skills/select/SKILL.md with Behavior Notes and expanded tokens (SEL-03)

### Phase 75: Checkbox
**Goal**: Checkbox component looks and feels like shadcn Checkbox out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: CHK-01, CHK-02, CHK-03
**Success Criteria** (what must be TRUE):
  1. Checkbox and CheckboxGroup render with correct monochrome default styles matching the token spec
  2. The Checkbox docs page reflects the actual component API and examples without stale content
  3. `skill/skills/checkbox` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 75-01-PLAN.md — Remove hardcoded checkbox dark mode tokens from .dark block (CHK-01)
- [x] 75-02-PLAN.md — Expand CheckboxPage.tsx CSS vars table to full token set (CHK-02)
- [x] 75-03-PLAN.md — Rewrite skill/skills/checkbox/SKILL.md with Behavior Notes and expanded tokens (CHK-03)

### Phase 76: Radio
**Goal**: Radio component looks and feels like shadcn Radio out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: RAD-01, RAD-02, RAD-03
**Success Criteria** (what must be TRUE):
  1. Radio and RadioGroup render with correct monochrome default styles matching the token spec
  2. The Radio docs page reflects the actual component API and examples without stale content
  3. `skill/skills/radio` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 76-01-PLAN.md — Remove hardcoded radio dark mode tokens from .dark block (RAD-01)
- [x] 76-02-PLAN.md — Expand RadioPage.tsx CSS vars table to full token set (RAD-02)
- [x] 76-03-PLAN.md — Rewrite skill/skills/radio/SKILL.md with Behavior Notes and expanded tokens (RAD-03)

### Phase 77: Switch
**Goal**: Switch component looks and feels like shadcn Switch out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: SWT-01, SWT-02, SWT-03
**Success Criteria** (what must be TRUE):
  1. Switch renders with correct monochrome default styles (track, thumb, checked state) matching the token spec
  2. The Switch docs page reflects the actual component API and examples without stale content
  3. `skill/skills/switch` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 77-01-PLAN.md — Prune switch .dark block to thumb-bg exception only (SWT-01)
- [x] 77-02-PLAN.md — Expand SwitchPage.tsx CSS vars table from 12 to 24 tokens (SWT-02)
- [x] 77-03-PLAN.md — Expand skill/skills/switch/SKILL.md CSS tokens, fix event name, add Behavior Notes (SWT-03)

### Phase 78: Calendar
**Goal**: Calendar component looks and feels like shadcn Calendar out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: CAL-01, CAL-02, CAL-03
**Success Criteria** (what must be TRUE):
  1. Calendar renders with correct monochrome default styles (day cells, selected state, navigation) matching the token spec
  2. The Calendar docs page reflects the actual component API and examples without stale content
  3. `skill/skills/calendar` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 78-01-PLAN.md — Remove .dark calendar block (10 declarations); add tooltip tokens to :root (CAL-01)
- [x] 78-02-PLAN.md — Expand CalendarPage.tsx CSS vars table from 16 to 21 entries with correct defaults (CAL-02)
- [x] 78-03-PLAN.md — Expand skill/skills/calendar/SKILL.md CSS tokens, add all 3 events, add Behavior Notes (CAL-03)

### Phase 79: Date Picker
**Goal**: Date Picker component looks and feels like shadcn DatePicker out of the box, with accurate docs and skill file
**Depends on**: Phase 78
**Requirements**: DTP-01, DTP-02, DTP-03
**Success Criteria** (what must be TRUE):
  1. Date Picker renders with correct monochrome default styles (trigger, popup, input) matching the token spec
  2. The Date Picker docs page reflects the actual component API and examples without stale content
  3. `skill/skills/date-picker` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 79-01-PLAN.md — Remove .dark date-picker block (17 declarations) from tailwind.css (DTP-01)
- [x] 79-02-PLAN.md — Expand DatePickerPage.tsx CSS vars table from 12 to 21 entries with correct defaults (DTP-02)
- [x] 79-03-PLAN.md — Expand skill/skills/date-picker/SKILL.md CSS tokens, verify Events table, add Behavior Notes (DTP-03)

### Phase 80: Date Range Picker
**Goal**: Date Range Picker component looks polished and matches the monochrome theme, with accurate docs and skill file
**Depends on**: Phase 79
**Requirements**: DRP-01, DRP-02, DRP-03
**Success Criteria** (what must be TRUE):
  1. Date Range Picker renders with correct monochrome default styles (range highlight, comparison overlay) matching the token spec
  2. The Date Range Picker docs page reflects the actual component API and examples without stale content
  3. `skill/skills/date-range-picker` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 80-01-PLAN.md — Remove .dark date-range block (21 declarations, keep 2 compare-* oklch exceptions) from tailwind.css (DRP-01)
- [x] 80-02-PLAN.md — Replace stale dateRangePickerCSSVars (16 entries, wrong names) with 31 accurate --ui-date-range-* entries (DRP-02)
- [x] 80-03-PLAN.md — Rewrite skill/skills/date-range-picker/SKILL.md with 31 correct tokens and Behavior Notes (DRP-03)

### Phase 81: Time Picker
**Goal**: Time Picker component looks polished and matches the monochrome theme, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: TMP-01, TMP-02, TMP-03
**Success Criteria** (what must be TRUE):
  1. Time Picker renders with correct monochrome default styles (clock face, scroll wheels, spinbuttons) matching the token spec
  2. The Time Picker docs page reflects the actual component API and examples without stale content
  3. `skill/skills/time-picker` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 81-01-PLAN.md — Remove .dark time-picker block (keep 6 oklch exceptions) (TMP-01)
- [x] 81-02-PLAN.md — Replace timePickerCSSVars with 67 accurate --ui-time-picker-* entries (TMP-02)
- [x] 81-03-PLAN.md — Rewrite skill/skills/time-picker/SKILL.md with 67 tokens and Behavior Notes (TMP-03)

### Phase 82: Tooltip
**Goal**: Tooltip component looks and feels like shadcn Tooltip out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: TTP-01, TTP-02, TTP-03
**Success Criteria** (what must be TRUE):
  1. Tooltip renders with correct monochrome default styles (background, arrow, border) matching the token spec
  2. The Tooltip docs page reflects the actual component API and examples without stale content
  3. `skill/skills/tooltip` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 82-01-PLAN.md — Remove .dark tooltip block (2 gray declarations cascade via semantic tokens) (TTP-01)
- [x] 82-02-PLAN.md — Fix tooltipCSSVars defaults (shadow, bg/text double-fallback) to match tailwind.css :root (TTP-02)
- [x] 82-03-PLAN.md — Fix SKILL.md CSS token defaults and add Behavior Notes (TTP-03)

### Phase 83: Popover
**Goal**: Popover component looks and feels like shadcn Popover out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: POP-01, POP-02, POP-03
**Success Criteria** (what must be TRUE):
  1. Popover renders with correct monochrome default styles (panel, shadow, border) matching the token spec
  2. The Popover docs page reflects the actual component API and examples without stale content
  3. `skill/skills/popover` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 83-01-PLAN.md — Remove hardcoded popover dark mode tokens from .dark block (POP-01)
- [x] 83-02-PLAN.md — Fix popoverCSSVars defaults (shadow, color double-fallback) to match tailwind.css :root (POP-02)
- [x] 83-03-PLAN.md — Fix SKILL.md CSS token defaults and add Behavior Notes (POP-03)

### Phase 84: Toast
**Goal**: Toast component looks and feels like shadcn Toast/Sonner out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: TST-01, TST-02, TST-03
**Success Criteria** (what must be TRUE):
  1. Toast renders with correct monochrome default styles (card, variants, action button) matching the token spec
  2. The Toast docs page reflects the actual component API and examples without stale content
  3. `skill/skills/toast` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 84-01-PLAN.md — Remove base toast dark mode declarations from .dark block; keep 12 variant oklch exceptions (TST-01)
- [x] 84-02-PLAN.md — Fix toastCSSVars defaults (double-fallback, shadow, z-index), add padding entry, update cssVarsCode (TST-02)
- [x] 84-03-PLAN.md — Fix SKILL.md CSS token defaults (21 entries) and add Behavior Notes (TST-03)

### Phase 85: Accordion
**Goal**: Accordion component looks and feels like shadcn Accordion out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: ACC-01, ACC-02, ACC-03
**Success Criteria** (what must be TRUE):
  1. Accordion renders with correct monochrome default styles (trigger, border, chevron) matching the token spec
  2. The Accordion docs page reflects the actual component API and examples without stale content
  3. `skill/skills/accordion` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 85-01-PLAN.md — Remove 4 hardcoded accordion dark mode declarations from .dark block (ACC-01)
- [x] 85-02-PLAN.md — Update AccordionPage.tsx CSS vars to 14 accurate entries with double-fallback defaults (ACC-02)
- [x] 85-03-PLAN.md — Fix skill/skills/accordion/SKILL.md CSS token defaults and add Behavior Notes (ACC-03)

### Phase 86: Tabs
**Goal**: Tabs component looks and feels like shadcn Tabs out of the box, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: TAB-01, TAB-02, TAB-03
**Success Criteria** (what must be TRUE):
  1. Tabs renders with correct monochrome default styles (tablist, active indicator, panel) matching the token spec
  2. The Tabs docs page reflects the actual component API and examples without stale content
  3. `skill/skills/tabs` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [x] 86-01-PLAN.md — Remove 7 hardcoded tabs dark mode declarations from .dark block (TAB-01)
- [x] 86-02-PLAN.md — Fix tabsCSSVars color defaults to double-fallback form in TabsPage.tsx (TAB-02)
- [x] 86-03-PLAN.md — Fix skill/skills/tabs/SKILL.md CSS token defaults and add Behavior Notes (TAB-03)

### Phase 87: Data Table
**Goal**: Data Table component looks polished and consistent with the monochrome theme, with accurate docs and skill file
**Depends on**: Phase 69
**Requirements**: DAT-01, DAT-02, DAT-03
**Success Criteria** (what must be TRUE):
  1. Data Table renders with correct monochrome default styles (header, rows, toolbar, pagination) matching the token spec
  2. The Data Table docs page reflects the actual component API and examples without stale content
  3. `skill/skills/data-table` accurately describes the component so Claude can implement it correctly
**Plans**: 3 plans

Plans:
- [ ] 87-01-PLAN.md — Remove cascadeable data-table dark mode tokens from .dark block; keep oklch and value-inversion exceptions (DAT-01)
- [ ] 87-02-PLAN.md — Replace dataTableCSSVars with 35-entry accurate array matching tailwind.css :root (DAT-02)
- [ ] 87-03-PLAN.md — Update skill/skills/data-table/SKILL.md CSS tokens and add Behavior Notes (DAT-03)

## Progress

**Execution Order:**
Phases execute in order: 69 → 70 → 71 → ... → 87
Note: Phases 70-87 all depend on Phase 69. Phases 70-78 and 80-87 are independent of each other (except 79 depends on 78, 80 depends on 79).

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 69. Theme Foundation | 1/1 | Complete    | 2026-02-28 | - |
| 70. Button | 3/3 | Complete    | 2026-02-28 | - |
| 71. Dialog | 3/3 | Complete    | 2026-02-28 | - |
| 72. Input | 3/3 | Complete    | 2026-02-28 | - |
| 73. Textarea | 3/3 | Complete    | 2026-02-28 | - |
| 74. Select | 3/3 | Complete    | 2026-02-28 | - |
| 75. Checkbox | 3/3 | Complete    | 2026-02-28 | - |
| 76. Radio | 3/3 | Complete    | 2026-02-28 | - |
| 77. Switch | 3/3 | Complete    | 2026-02-28 | - |
| 78. Calendar | 3/3 | Complete    | 2026-02-28 | - |
| 79. Date Picker | 3/3 | Complete    | 2026-02-28 | - |
| 80. Date Range Picker | 3/3 | Complete    | 2026-02-28 | - |
| 81. Time Picker | 3/3 | Complete    | 2026-02-28 | - |
| 82. Tooltip | 3/3 | Complete    | 2026-02-28 | - |
| 83. Popover | 3/3 | Complete    | 2026-02-28 | - |
| 84. Toast | 3/3 | Complete    | 2026-02-28 | - |
| 85. Accordion | 3/3 | Complete    | 2026-02-28 | - |
| 86. Tabs | 3/3 | Complete    | 2026-02-28 | - |
| 87. Data Table | 2/3 | In Progress|  | - |
