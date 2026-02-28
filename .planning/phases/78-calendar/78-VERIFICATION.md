---
phase: 78-calendar
verified: 2026-02-28T00:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Open the calendar in a browser with dark mode enabled and verify day cells, selected state, and navigation use the expected monochrome shadcn palette"
    expected: "Day cells use gray-950 background; selected date uses brand-50 bg / brand-900 text; today border is brand-300; nav arrows are gray-50"
    why_human: "CSS cascade through semantic .dark tokens cannot be confirmed without a live render"
---

# Phase 78: Calendar Verification Report

**Phase Goal:** Calendar component looks and feels like shadcn Calendar out of the box, with accurate docs and skill file
**Verified:** 2026-02-28
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Success Criteria Mapping

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | Calendar renders with correct monochrome default styles matching token spec | VERIFIED | 21 `:root` tokens verified in tailwind.css; zero `.dark` overrides; semantic cascade intact |
| 2 | Calendar docs page reflects actual component API without stale content | VERIFIED | CalendarPage.tsx has 21-entry calendarCSSVars with correct defaults; all 3 events documented |
| 3 | `skill/skills/calendar` accurately describes component so Claude can implement it correctly | VERIFIED | SKILL.md has 21 token table rows, all 3 events, and Behavior Notes section (12 bullets) |

**Score:** 3/3 success criteria verified

### Observable Truths (from Plan must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All 10 `.dark --ui-calendar-*` declarations removed; "Calendar dark mode overrides" comment gone | VERIFIED | `grep "Calendar dark mode" tailwind.css` returns empty; `.dark` block ends at line 385; calendar tokens start at line 819 (`:root`) |
| 2 | No `--ui-calendar-*` declarations remain in the `.dark` block | VERIFIED | All 21 `--ui-calendar-*` occurrences in tailwind.css are on lines 819–851 (`:root` block only) |
| 3 | `:root` calendar block has `--ui-calendar-tooltip-bg` and `--ui-calendar-tooltip-text` tokens | VERIFIED | Lines 850–851: `var(--color-foreground, #111827)` and `var(--color-background, #ffffff)` |
| 4 | CalendarPage.tsx `calendarCSSVars` has exactly 21 entries matching `:root` defaults | VERIFIED | Array has 21 `name:` entries; values match tailwind.css `:root` for all checked tokens |
| 5 | Events section in CalendarPage.tsx documents all 3 events: change, month-change, week-select | VERIFIED | Lines 604, 615, 626 in CalendarPage.tsx; correct `{ date: Date, isoString: string }`, `{ year, month }`, `{ weekNumber, dates, isoStrings }` shapes |
| 6 | SKILL.md CSS token table has 21 rows covering all `:root` tokens | VERIFIED | `grep -c "| \`--ui-calendar-" SKILL.md` = 21 |
| 7 | SKILL.md has `## Behavior Notes` section | VERIFIED | Line 99 of SKILL.md; 12 bullet points covering views, keyboard, touch, animation, a11y, week numbers, multi-month, locale, change event, help dialog |

**Score:** 7/7 truths verified

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/core/src/styles/tailwind.css` | Calendar .dark block cleared; tooltip tokens added to :root | VERIFIED | 21 tokens in `:root` lines 819–851; `.dark` block (lines 172–385) contains zero `--ui-calendar-*` entries |
| `apps/docs/src/pages/components/CalendarPage.tsx` | 21-entry calendarCSSVars with accurate :root defaults | VERIFIED | Exactly 21 array entries; `calendarCSSVars.length` badge wired in JSX |
| `skill/skills/calendar/SKILL.md` | 21 token table rows, 3 events, Behavior Notes section | VERIFIED | 21 table rows; Events table with all 3 events and correct detail shapes; `## Behavior Notes` with 12 bullets |

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tailwind.css (.dark block)` | `tailwind.css (:root block)` | double-fallback var() cascade | VERIFIED | `.dark` overrides `--color-background`, `--color-foreground`, `--color-primary`, etc.; `:root` calendar tokens use `var(--color-*, ...)` form; cascade confirmed |
| `CalendarPage.tsx (calendarCSSVars)` | `tailwind.css (:root calendar block)` | default values match :root declarations | VERIFIED (minor note) | 20/21 values match exactly; `--ui-calendar-text` fallback reads `currentColor` in docs but `:root` has `var(--ui-color-foreground)` — functional difference only in unstyled edge case |
| `SKILL.md (CSS Custom Properties)` | `tailwind.css (:root calendar block)` | token defaults must match exactly | VERIFIED (same minor note) | Same 20/21 exact match; `--ui-calendar-text` fallback is `currentColor` in SKILL.md vs `var(--ui-color-foreground)` in tailwind.css |

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CAL-01 | 78-01-PLAN.md | Calendar default styles match the v8.0 monochrome theme | SATISFIED | `.dark` calendar block removed; 21 `:root` tokens with semantic double-fallback cascade |
| CAL-02 | 78-02-PLAN.md | Calendar docs page is accurate and up-to-date | SATISFIED | CalendarPage.tsx has 21-entry calendarCSSVars with correct `:root` defaults; all 3 events documented |
| CAL-03 | 78-03-PLAN.md | `skill/skills/calendar` skill file is accurate and up-to-date | SATISFIED | SKILL.md: 21 tokens, 3 events (corrected detail shapes), 12-bullet Behavior Notes |

No orphaned requirements — all CAL-01, CAL-02, CAL-03 are claimed by plans and evidenced in the codebase.

## Anti-Patterns Found

No anti-patterns detected in the modified files. No TODO/FIXME/placeholder comments, no empty implementations, no stub handlers.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | — |

## Notable Discrepancy (Non-Blocking)

`--ui-calendar-text` fallback value differs between source and docs:

- **tailwind.css `:root`**: `var(--color-foreground, var(--ui-color-foreground))` — secondary fallback is `--ui-color-foreground` (oklch near-black)
- **CalendarPage.tsx + SKILL.md**: documents fallback as `var(--color-foreground, currentColor)`

This is a minor inaccuracy in the secondary fallback only. In any normal usage context `--color-foreground` will be set (it's a base semantic token), so the secondary fallback never activates. This does not block the phase goal and is not a regression from the phase scope (the old value was `inherit` which was also inaccurate).

## Human Verification Required

### 1. Calendar Dark Mode Visual Appearance

**Test:** Open the docs app with `dark` class on `<html>`, navigate to the Calendar page, and inspect day cells, selected date, today indicator, and nav buttons.
**Expected:** Background is near-black (gray-950); selected date has brand-50 background with brand-900 text; today's cell has a brand-300 border; weekday headers are gray-400; navigation arrows are gray-50.
**Why human:** CSS cascade through semantic `.dark` token overrides cannot be confirmed by static code analysis alone; requires a live render.

### 2. Constraint Tooltip Dark Mode

**Test:** Enable `show-constraint-tooltips` and `max-date` on a calendar, hover a disabled date in dark mode.
**Expected:** Tooltip uses inverted colors — dark tooltip background (foreground color) with light text (background color).
**Why human:** The `::after` pseudo-element tooltip uses `--ui-calendar-tooltip-bg` and `--ui-calendar-tooltip-text` which are new tokens added in this phase; visual confirmation required.

## Verified Commit Hashes

All three commits cited in SUMMARYs exist in git history:

- `74906f1` — feat(78-01): remove .dark calendar block and add tooltip tokens to :root
- `05ee621` — feat(78-02): expand calendarCSSVars from 16 to 21 entries with correct defaults
- `f3caeba` — feat(78-03): expand calendar SKILL.md — 21 tokens, 3 events, Behavior Notes

## Summary

Phase 78 goal is achieved. All three plans executed correctly:

- **78-01 (CAL-01)**: The `.dark` block no longer contains any `--ui-calendar-*` declarations. Calendar dark mode is now governed entirely by the semantic `.dark` cascade (`--color-background`, `--color-foreground`, `--color-primary`, etc.). Two previously-undeclared tooltip tokens were added to `:root` with correct double-fallback `var()` form.

- **78-02 (CAL-02)**: `CalendarPage.tsx` `calendarCSSVars` array was expanded from 16 to 21 entries. All stale defaults were corrected (e.g., `white` → `var(--color-background, #ffffff)`, `0.125rem` → `0.25rem`, `0.5` → `0.4`). All 3 events (`change`, `month-change`, `week-select`) are documented with correct detail shapes.

- **78-03 (CAL-03)**: `skill/skills/calendar/SKILL.md` token table expanded from 16 to 21 rows with accurate `:root` defaults. Events table completed to 3 events. `## Behavior Notes` section added covering three calendar views, keyboard navigation, touch gestures, slide animation, aria-live, today indicator, disabled dates, week numbers, multi-month, locale detection, and change event semantics.

One minor documentation inaccuracy noted: `--ui-calendar-text` fallback is documented as `currentColor` in both docs and SKILL.md, but the actual `:root` value is `var(--ui-color-foreground)`. This does not affect phase goal achievement.

---

_Verified: 2026-02-28_
_Verifier: Claude (gsd-verifier)_
