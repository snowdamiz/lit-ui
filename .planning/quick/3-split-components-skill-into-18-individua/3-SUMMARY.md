---
phase: quick
plan: 3
subsystem: skill
tags: [skill, components, documentation, lit-ui]
key-files:
  created:
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
  modified:
    - skill/skills/components/SKILL.md
decisions:
  - Split monolithic components SKILL.md into 18 individual component-scoped files, one per component
  - Each file follows consistent structure: usage examples, props table, slots, events, CSS vars, CSS parts
  - Parent components/SKILL.md updated to be an index with reference table to individual files
  - Source of truth for API data is apps/docs/src/pages/components/*Page.tsx files
metrics:
  completed: 2026-02-27
  tasks: 1
  files: 19
---

# Quick Task 3: Split Components Skill into 18 Individual Component Files Summary

**One-liner:** Split the monolithic `components/SKILL.md` into 18 component-specific SKILL.md files, each containing the complete props, slots, events, CSS vars, CSS parts, and usage examples sourced from the docs pages.

## What Was Done

The existing `skill/skills/components/SKILL.md` was a single monolithic reference file covering all 18 components at a high level. This task split it into 18 individual skill files — one per component — with full API documentation sourced from the actual docs page source files.

### Files Created

| Component | Skill File | Key Content |
|-----------|------------|-------------|
| Button | `skill/skills/button/SKILL.md` | 6 props, 3 slots, 4 CSS parts, 3 CSS vars |
| Input | `skill/skills/input/SKILL.md` | 18 props, 2 slots, 9 CSS parts, 7 CSS vars |
| Textarea | `skill/skills/textarea/SKILL.md` | 18 props, 6 CSS parts, 7 CSS vars |
| Select | `skill/skills/select/SKILL.md` | 20 props (lui-select), 3 sub-elements, 7 CSS vars |
| Checkbox | `skill/skills/checkbox/SKILL.md` | 8+5 props (lui-checkbox + lui-checkbox-group), 12 CSS vars |
| Radio | `skill/skills/radio/SKILL.md` | 5+6 props (lui-radio + lui-radio-group), keyboard nav table, 10 CSS vars |
| Switch | `skill/skills/switch/SKILL.md` | 7 props, 5 CSS parts, 12 CSS vars |
| Calendar | `skill/skills/calendar/SKILL.md` | 10+7 props (lui-calendar + lui-calendar-multi), 16 CSS vars |
| Date Picker | `skill/skills/date-picker/SKILL.md` | 14 props, 1 event, 12 CSS vars |
| Date Range Picker | `skill/skills/date-range-picker/SKILL.md` | 18 props, 1 event (with interval detail), 16 CSS vars |
| Time Picker | `skill/skills/time-picker/SKILL.md` | 20 props, 1 event, 20 CSS vars, 4 sub-components |
| Dialog | `skill/skills/dialog/SKILL.md` | 5 props, 3 slots, 1 event (with reason), 6 CSS parts, 3 CSS vars |
| Accordion | `skill/skills/accordion/SKILL.md` | 5+5 props (lui-accordion + lui-accordion-item), 2 slots each, 1 event, 13 CSS vars |
| Tabs | `skill/skills/tabs/SKILL.md` | 6+5 props (lui-tabs + lui-tab-panel), 1 event, 25 CSS vars |
| Tooltip | `skill/skills/tooltip/SKILL.md` | 9 props, 3 slots, 4 CSS parts, 10 CSS vars |
| Popover | `skill/skills/popover/SKILL.md` | 7 props, 2 slots, 1 event, 4 CSS parts, 9 CSS vars |
| Toast | `skill/skills/toast/SKILL.md` | Imperative API (8 functions), 3 toaster props, 21 CSS vars, 1 CSS part |
| Data Table | `skill/skills/data-table/SKILL.md` | ~40 props, 2 slots, 13 events, 18 CSS vars, column def format |

### Parent File Updated

`skill/skills/components/SKILL.md` — Added a reference table at the end mapping each component to its individual skill file path. The existing high-level API notes were preserved.

## Data Sources

All API data was sourced from the docs page source files under `apps/docs/src/pages/components/`:
- PropDef arrays (typed props tables)
- SlotDef arrays
- CSSVarDef arrays
- EventDef arrays
- CSS parts arrays
- Code example strings

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All 18 component SKILL.md files exist at expected paths. Commit 39d7d23 verified in git log.
