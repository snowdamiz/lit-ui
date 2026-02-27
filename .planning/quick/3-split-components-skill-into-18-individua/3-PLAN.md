---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - skill/SKILL.md
  - skill/skills/button/SKILL.md
  - skill/skills/input/SKILL.md
  - skill/skills/textarea/SKILL.md
  - skill/skills/select/SKILL.md
  - skill/skills/checkbox/SKILL.md
  - skill/skills/radio/SKILL.md
  - skill/skills/switch/SKILL.md
  - skill/skills/calendar/SKILL.md
  - skill/skills/date-picker/SKILL.md
  - skill/skills/date-range-picker/SKILL.md
  - skill/skills/time-picker/SKILL.md
  - skill/skills/dialog/SKILL.md
  - skill/skills/accordion/SKILL.md
  - skill/skills/tabs/SKILL.md
  - skill/skills/tooltip/SKILL.md
  - skill/skills/popover/SKILL.md
  - skill/skills/toast/SKILL.md
  - skill/skills/data-table/SKILL.md
  - skill/skills/components/SKILL.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "18 per-component SKILL.md files exist, one per component"
    - "Each per-component SKILL.md has Usage examples, Props table, Slots table, Events, CSS Custom Properties, and CSS Parts sections derived from the docs page"
    - "skill/SKILL.md routes to individual component skills instead of the monolithic skills/components skill"
    - "skill/skills/components/SKILL.md is removed (replaced)"
  artifacts:
    - path: "skill/skills/button/SKILL.md"
      provides: "Button component API — props, slots, CSS vars, CSS parts, usage examples"
    - path: "skill/skills/input/SKILL.md"
      provides: "Input component API"
    - path: "skill/skills/data-table/SKILL.md"
      provides: "DataTable component API"
    - path: "skill/SKILL.md"
      provides: "Updated router listing all 18 component sub-skills"
  key_links:
    - from: "skill/SKILL.md"
      to: "skill/skills/button/SKILL.md"
      via: "Available Sub-Skills routing list"
      pattern: "skills/button"
---

<objective>
Split the monolithic `skill/skills/components/SKILL.md` into 18 individual per-component skill files — one per lit-ui component — and update the root `skill/SKILL.md` router to reference them individually.

Purpose: Smaller, focused skills load faster and give Claude precise API info for a specific component rather than the entire library's API. Matches the mesh skill pattern.
Output: 18 new SKILL.md files under `skill/skills/<component>/`, updated root SKILL.md, deleted `skill/skills/components/SKILL.md`.
</objective>

<execution_context>
Read source data for each component from its docs page before writing. The docs pages are the ground truth.
</execution_context>

<context>
@/Users/sn0w/Documents/dev/lit-components/skill/SKILL.md
@/Users/sn0w/Documents/dev/lit-components/skill/skills/components/SKILL.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create 18 per-component SKILL.md files from docs pages</name>
  <files>
    skill/skills/button/SKILL.md
    skill/skills/input/SKILL.md
    skill/skills/textarea/SKILL.md
    skill/skills/select/SKILL.md
    skill/skills/checkbox/SKILL.md
    skill/skills/radio/SKILL.md
    skill/skills/switch/SKILL.md
    skill/skills/calendar/SKILL.md
    skill/skills/date-picker/SKILL.md
    skill/skills/date-range-picker/SKILL.md
    skill/skills/time-picker/SKILL.md
    skill/skills/dialog/SKILL.md
    skill/skills/accordion/SKILL.md
    skill/skills/tabs/SKILL.md
    skill/skills/tooltip/SKILL.md
    skill/skills/popover/SKILL.md
    skill/skills/toast/SKILL.md
    skill/skills/data-table/SKILL.md
  </files>
  <action>
For each of the 18 components below, read the corresponding docs page and create a SKILL.md with the exact structure shown. Read each docs page first, then write the file.

**Source docs pages** (all in `apps/docs/src/pages/components/`):
- AccordionPage.tsx, ButtonPage.tsx, CalendarPage.tsx, CheckboxPage.tsx, DataTablePage.tsx, DatePickerPage.tsx, DateRangePickerPage.tsx, DialogPage.tsx, InputPage.tsx, PopoverPage.tsx, RadioPage.tsx, SelectPage.tsx, SwitchPage.tsx, TabsPage.tsx, TextareaPage.tsx, TimePickerPage.tsx, ToastPage.tsx, TooltipPage.tsx

**Target directories** (create if not exist):
`skill/skills/<component-name>/SKILL.md`

Component name → directory mapping:
- Accordion → `accordion/`
- Button → `button/`
- Calendar → `calendar/`
- Checkbox → `checkbox/`
- DataTable → `data-table/`
- DatePicker → `date-picker/`
- DateRangePicker → `date-range-picker/`
- Dialog → `dialog/`
- Input → `input/`
- Popover → `popover/`
- Radio → `radio/`
- Select → `select/`
- Switch → `switch/`
- Tabs → `tabs/`
- Textarea → `textarea/`
- TimePicker → `time-picker/`
- Toast → `toast/`
- Tooltip → `tooltip/`

**Required SKILL.md structure for each component:**

```markdown
---
name: lit-ui-<component-name>
description: >-
  How to use <lui-tag> — props, slots, events, CSS tokens, examples.
---

# <ComponentName>

## Usage

[2-3 code examples drawn from the *Code examples section of the docs page (the `const xxxCode` variables). Pick the most representative: basic usage, a variant/state, and one advanced pattern. Use the raw HTML strings, not JSX.]]

```html
[example 1]
```

```html
[example 2]
```

```html
[example 3 — omit if only 2 good examples]
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
[one row per entry in the docs page's `const xxxProps` array]

## Slots

| Slot | Description |
|------|-------------|
[one row per entry in the docs page's `const xxxSlots` array — if the component has no slots, write "None." instead of the table]

## Events

| Event | Detail | Description |
|-------|--------|-------------|
[Derive from the Events section text in the docs page — if no custom events (like Button), write "No custom events. Use standard DOM events (e.g. `click`)." instead of the table]

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
[one row per entry in the docs page's `const xxxCSSVars` array — if no CSS vars, write "None." instead of the table]

## CSS Parts

| Part | Description |
|------|-------------|
[one row per entry in the docs page's `const xxxParts` array — if no parts, write "None." instead of the table]
```

**Important rules:**
- Skills describe HOW TO USE the component, not internal implementation.
- Copy props/slots/parts/CSS vars verbatim from the docs page arrays.
- For `name: lit-ui-<component-name>`, use the kebab-case directory name (e.g. `lit-ui-date-range-picker`).
- For multi-tag components (checkbox has `<lui-checkbox>` and `<lui-checkbox-group>`, radio has `<lui-radio>` and `<lui-radio-group>`, select has `<lui-select>`, `<lui-option>`, `<lui-option-group>`, accordion has `<lui-accordion>` and `<lui-accordion-item>`, tabs has `<lui-tabs>` and `<lui-tab-panel>`, toast has `<lui-toaster>` and `toast()` function), mention all tags in the description and in the Usage examples.
- CSS var prefix: some components use `--lui-` (button) and some use `--ui-` (input). Copy exactly from the docs page.
  </action>
  <verify>
ls /Users/sn0w/Documents/dev/lit-components/skill/skills/button/SKILL.md /Users/sn0w/Documents/dev/lit-components/skill/skills/data-table/SKILL.md /Users/sn0w/Documents/dev/lit-components/skill/skills/date-range-picker/SKILL.md && echo "spot-check OK"
  </verify>
  <done>18 directories exist under skill/skills/ with a SKILL.md in each. Each file has frontmatter with name/description, and sections: Usage, Props, Slots, Events, CSS Custom Properties, CSS Parts. Props rows match the docs page arrays.</done>
</task>

<task type="auto">
  <name>Task 2: Update root SKILL.md router and delete monolithic components/SKILL.md</name>
  <files>
    skill/SKILL.md
    skill/skills/components/SKILL.md
  </files>
  <action>
**Step A — Rewrite `skill/SKILL.md`:**

Replace the "Available Sub-Skills" and "Routing Rules" sections so they reference individual component skills instead of the monolithic `skills/components`.

New "Available Sub-Skills" section:

```markdown
## Available Sub-Skills

### Components (load the specific one needed)

1. `skills/button` — lui-button: variants, sizes, loading state, icons, form submission
2. `skills/input` — lui-input: types, validation, label, helper-text, prefix/suffix, clearable
3. `skills/textarea` — lui-textarea: rows, resize, auto-grow, character counter
4. `skills/select` — lui-select + lui-option + lui-option-group: single/multi-select, searchable, clearable
5. `skills/checkbox` — lui-checkbox + lui-checkbox-group: indeterminate, group binding
6. `skills/radio` — lui-radio + lui-radio-group: group binding, orientation
7. `skills/switch` — lui-switch: checked state, label, form participation
8. `skills/calendar` — lui-calendar: date selection, min/max, disabled dates
9. `skills/date-picker` — lui-date-picker: date input + calendar overlay, format
10. `skills/date-range-picker` — lui-date-range-picker: start/end date selection
11. `skills/time-picker` — lui-time-picker: hour/minute/second, 12h/24h
12. `skills/dialog` — lui-dialog: show/hide, dismissible, header/footer slots
13. `skills/accordion` — lui-accordion + lui-accordion-item: single/multiple open
14. `skills/tabs` — lui-tabs + lui-tab-panel: active tab, orientation
15. `skills/tooltip` — lui-tooltip: trigger, placement, delay
16. `skills/popover` — lui-popover: trigger, placement, dismissible
17. `skills/toast` — lui-toaster + toast() API: variants, duration, positioning
18. `skills/data-table` — lui-data-table: columns, data, sorting, pagination, selection

### Utilities

19. `skills/cli` — CLI commands: init, add, list, migrate, theme — flags and workflows
20. `skills/authoring` — Creating new components: TailwindElement, ElementInternals, SSR guards, decorators
21. `skills/theming` — CSS custom properties, design tokens, dark mode, ::part() selectors
22. `skills/framework-usage` — React, Vue, Svelte, Angular, and vanilla HTML integration patterns
23. `skills/ssr` — Server-side rendering: renderToString, hydration, isServer guards
```

New "Routing Rules" section:

```markdown
## Routing Rules

1. After delivering the overview, route to the relevant component sub-skill for deep answers.
2. Load the specific component skill (e.g. `skills/button`) — do not improvise from the overview alone.
3. For cross-component questions, load each relevant component skill.
4. For CLI questions (npx lit-ui ...), load `skills/cli`.
5. For "how do I build a component" questions, load `skills/authoring`.
6. For theming / dark mode / design tokens questions, load `skills/theming`.
7. For framework integration (React, Vue, Svelte, Angular), load `skills/framework-usage`.
8. For SSR questions, load `skills/ssr`.
```

**Step B — Delete `skill/skills/components/SKILL.md`:**

Delete the file (it is replaced by the 18 individual skill files). You can use the Bash tool: `rm /Users/sn0w/Documents/dev/lit-components/skill/skills/components/SKILL.md && rmdir /Users/sn0w/Documents/dev/lit-components/skill/skills/components/`
  </action>
  <verify>
grep -c "skills/button" /Users/sn0w/Documents/dev/lit-components/skill/SKILL.md && ! test -f /Users/sn0w/Documents/dev/lit-components/skill/skills/components/SKILL.md && echo "router updated, monolithic file deleted"
  </verify>
  <done>skill/SKILL.md references all 18 individual component skills. skill/skills/components/ directory and its SKILL.md no longer exist.</done>
</task>

</tasks>

<verification>
Run after both tasks complete:

```bash
# Confirm 18 component skills exist
ls /Users/sn0w/Documents/dev/lit-components/skill/skills/*/SKILL.md | wc -l
# Should print 22 (18 component + cli + authoring + theming + framework-usage + ssr)

# Confirm monolithic file is gone
test ! -f /Users/sn0w/Documents/dev/lit-components/skill/skills/components/SKILL.md && echo "deleted OK"

# Spot-check that a per-component file has required sections
grep -l "## Props" /Users/sn0w/Documents/dev/lit-components/skill/skills/*/SKILL.md | wc -l
# Should be 18
```
</verification>

<success_criteria>
- 18 per-component SKILL.md files exist under skill/skills/
- Each has: frontmatter (name, description), Usage (2-3 code examples), Props table, Slots section, Events section, CSS Custom Properties section, CSS Parts section
- All data matches the corresponding docs page arrays (props, slots, cssVars, parts)
- skill/SKILL.md routes to individual component skills (no reference to skills/components)
- skill/skills/components/SKILL.md is deleted
</success_criteria>

<output>
No SUMMARY.md required for quick tasks.
</output>
