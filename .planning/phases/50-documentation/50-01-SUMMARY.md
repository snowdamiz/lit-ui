# Phase 50 Plan 01: Infrastructure Setup Summary

JSX type declarations, CLI registry entries, navigation/routing registration, and PrevNextNav chain fixes for date-picker, date-range-picker, and time-picker documentation pages.

## One-liner

JSX IntrinsicElements + CLI registry + nav/routing for 3 date/time components and 3 guide pages with unbroken PrevNextNav chain.

## Tasks Completed

| Task | Name | Commit | Duration |
|------|------|--------|----------|
| 1 | Add JSX types, component imports, CLI registry entries, and install-component mappings | e98a9b1 | ~50s |
| 2 | Update navigation, routing, and PrevNextNav chain | d394716 | ~50s |

## Changes Made

### Task 1: JSX Types + CLI Registry + Install Mappings

**LivePreview.tsx:**
- Added side-effect imports for `@lit-ui/date-picker`, `@lit-ui/date-range-picker`, `@lit-ui/time-picker`
- Added JSX IntrinsicElements declarations for `lui-date-picker` (12 attrs), `lui-date-range-picker` (17 attrs), `lui-time-picker` (17 attrs)
- JS-only properties (presets, format, businessHours) excluded per established pattern

**registry.json:**
- Added 3 component entries: date-picker, date-range-picker, time-picker
- Each with correct file lists, dependencies (date-fns, @floating-ui/dom), and registryDependencies (calendar)
- Total components: 12

**install-component.ts:**
- Added 4 entries to componentToPackage map: calendar, date-picker, date-range-picker, time-picker
- Calendar was missing from the map despite being importable (bug fix)

### Task 2: Navigation + Routing + PrevNextNav

**nav.ts:**
- Components section: added Date Picker, Date Range Picker, Time Picker (12 total, alphabetical)
- Guides section: added Accessibility, Form Integration, Internationalization (7 total, alphabetical)

**App.tsx:**
- Added 6 lazy imports: DatePickerPage, DateRangePickerPage, TimePickerPage, AccessibilityGuide, FormIntegrationGuide, I18nGuide
- Added 6 Route elements in correct sections

**PrevNextNav chain fixed:**
- ButtonPage: next changed from Checkbox to Calendar
- CheckboxPage: prev changed from Button to Calendar, next changed from Dialog to Date Picker
- DialogPage: prev changed from Checkbox to Date Range Picker
- TextareaPage: next changed from Theme Configurator to Time Picker
- CalendarPage: unchanged (already correct: prev=Button, next=Checkbox)

Full chain: Button -> Calendar -> Checkbox -> Date Picker -> Date Range Picker -> Dialog -> Input -> Radio -> Select -> Switch -> Textarea -> Time Picker

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Calendar missing from componentToPackage map**
- **Found during:** Task 1
- **Issue:** Calendar was importable in LivePreview.tsx but not listed in install-component.ts componentToPackage map, meaning `lui add calendar` would fail
- **Fix:** Added `calendar: '@lit-ui/calendar'` to the map alongside the 3 new entries
- **Files modified:** packages/cli/src/utils/install-component.ts
- **Commit:** e98a9b1

## Decisions Made

- Guide pages follow existing flat pattern in `pages/` directory (AccessibilityGuide.tsx, FormIntegrationGuide.tsx, I18nGuide.tsx) matching SSRGuide.tsx and MigrationGuide.tsx
- Guides section alphabetized (was previously in arbitrary order)

## Verification Results

- registry.json: valid JSON, 12 components, date-picker/date-range-picker/time-picker present
- nav.ts: 12 component href entries
- App.tsx: 12 component route paths, 3 new guide routes
- PrevNextNav chain: unbroken across all 9 existing component pages (3 new pages will be created in Wave 2)

## Duration

~2 minutes
