# Roadmap: LitUI

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-01-24)
- ✅ **v2.0 NPM + SSR** - Phases 13-20 (shipped 2026-01-25)
- ✅ **v3.0 Theme Customization** - Phases 21-24 (shipped 2026-01-25)
- ✅ **v4.0 Form Inputs** - Phases 25-27 (shipped 2026-01-26)
- ✅ **v4.1 Select Component** - Phases 31-37 (shipped 2026-01-27)
- ✅ **v4.2 Form Controls** - Phases 38-41 (shipped 2026-01-27)
- 🚧 **v4.3 Date/Time Components** - Phases 42-50 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2026-01-24</summary>

### Phase 1: Foundation
**Goal**: Project scaffolding and build tooling
**Plans**: 6 plans

Plans:
- [x] 01-01: Initialize pnpm monorepo with workspace configuration
- [x] 01-02: Set up Vite build pipeline for Lit.js components
- [x] 01-03: Configure TypeScript with strict settings and path aliases
- [x] 01-04: Establish Tailwind CSS integration with constructable stylesheets
- [x] 01-05: Create TailwindElement base class for Shadow DOM styling
- [x] 01-06: Set up testing infrastructure with Web Test Runner

### Phase 2: Button Component
**Goal**: Production-ready button with variants and form integration
**Plans**: 4 plans

Plans:
- [x] 02-01: Implement button core with variants (primary, secondary, ghost, outline)
- [x] 02-02: Add button sizes (sm, md, lg) and icon support
- [x] 02-03: Integrate with forms via ElementInternals
- [x] 02-04: Add loading state and accessibility features

### Phase 3: Dialog Component
**Goal**: Accessible modal with focus trapping and ARIA
**Plans**: 5 plans

Plans:
- [x] 03-01: Implement dialog core with native <dialog> element
- [x] 03-02: Add focus trapping and focus restoration
- [x] 03-03: Implement keyboard navigation (Escape to close)
- [x] 03-04: Add ARIA attributes and screen reader support
- [x] 03-05: Support nested dialogs and backdrop styling

### Phase 4: CLI Tool
**Goal**: Component distribution via copy-source CLI
**Plans**: 4 plans

Plans:
- [x] 04-01: Initialize CLI project with citty framework
- [x] 04-02: Implement init command with project scaffolding
- [x] 04-03: Implement add command for component installation
- [x] 04-04: Add build tool detection (Vite, Webpack, esbuild)

### Phase 5: Framework Validation
**Goal**: Verify components work in React, Vue, Svelte
**Plans**: 3 plans

Plans:
- [x] 05-01: Create React 19 example with components
- [x] 05-02: Create Vue 3 example with components
- [x] 05-03: Create Svelte 5 example with components

</details>

<details>
<summary>✅ v2.0 NPM + SSR (Phases 13-20) - SHIPPED 2026-01-25</summary>

### Phase 13: Package Structure
**Goal**: Set up publishable npm packages
**Plans**: 3 plans

Plans:
- [x] 13-01: Configure @lit-ui/core package with TailwindElement
- [x] 13-02: Set up package.json for @lit-ui/button and @lit-ui/dialog
- [x] 13-03: Configure changesets for version management

### Phase 14: SSR Support
**Goal**: Declarative Shadow DOM for server-side rendering
**Plans**: 4 plans

Plans:
- [x] 14-01: Implement dual-mode styling (inline CSS server, constructable client)
- [x] 14-02: Add isServer guards for DOM APIs
- [x] 14-03: Create @lit-ui/ssr package with render utilities
- [x] 14-04: Add hydration support via @lit-labs/ssr

### Phase 15: Framework SSR Examples
**Goal**: Demonstrate SSR in Next.js, Astro, Express
**Plans**: 3 plans

Plans:
- [x] 15-01: Create Next.js App Router example with SSR
- [x] 15-02: Create Astro example with SSR
- [x] 15-03: Create Express/Node.js example with SSR

### Phase 16: CLI NPM Mode
**Goal**: Support npm package distribution
**Plans**: 4 plans

Plans:
- [x] 16-01: Add mode selection (copy-source vs npm)
- [x] 16-02: Implement npm-aware add command
- [x] 16-03: Add migrate command for copy-source to npm
- [x] 16-04: Update init command with npm mode

### Phase 17: Core Package
**Goal**: Publish @lit-ui/core to npm
**Plans**: 3 plans

Plans:
- [x] 17-01: Finalize package.json and exports
- [x] 17-02: Add TypeScript declarations
- [x] 17-03: Publish to npm registry

### Phase 18: Button Package
**Goal**: Publish @lit-ui/button to npm
**Plans**: 3 plans

Plans:
- [x] 18-01: Extract button to package with SSR compatibility
- [x] 18-02: Add package documentation
- [x] 18-03: Publish to npm registry

### Phase 19: Dialog Package
**Goal**: Publish @lit-ui/dialog to npm
**Plans**: 3 plans

Plans:
- [x] 19-01: Extract dialog to package with SSR compatibility
- [x] 19-02: Add package documentation
- [x] 19-03: Publish to npm registry

### Phase 20: NPM Documentation
**Goal**: Guide for npm installation and SSR setup
**Plans**: 3 plans

Plans:
- [x] 20-01: Write npm installation guide
- [x] 20-02: Document SSR setup process
- [x] 20-03: Create migration guide (copy-source to npm)

</details>

<details>
<summary>✅ v3.0 Theme Customization (Phases 21-24) - SHIPPED 2026-01-25</summary>

### Phase 21: Theme System
**Goal**: OKLCH color customization with shade scales
**Plans**: 4 plans

Plans:
- [x] 21-01: Implement OKLCH color system with Zod validation
- [x] 21-02: Create 11-step shade scale generation (50-950)
- [x] 21-03: Add CSS variable generation for components
- [x] 21-04: Support light/dark mode simultaneous editing

### Phase 22: CLI Theme Integration
**Goal**: CLI commands for theme customization
**Plans**: 4 plans

Plans:
- [x] 22-01: Add lit-ui theme command
- [x] 22-02: Implement --theme parameter for init command
- [x] 22-03: Generate Tailwind CSS layer from theme config
- [x] 22-04: Add theme validation and error handling

### Phase 23: Visual Configurator
**Goal**: Web-based theme customization UI
**Plans**: 4 plans

Plans:
- [x] 23-01: Create theme configurator page on docs site
- [x] 23-02: Implement live preview of components
- [x] 23-03: Add color pickers and input fields
- [x] 23-04: Generate shareable theme URLs

### Phase 24: Preset Themes
**Goal**: Pre-built theme templates
**Plans**: 4 plans

Plans:
- [x] 24-01: Create default theme preset
- [x] 24-02: Create ocean theme preset
- [x] 24-03: Create forest theme preset
- [x] 24-04: Create sunset theme preset

</details>

<details>
<summary>✅ v4.0 Form Inputs (Phases 25-27) - SHIPPED 2026-01-26</summary>

### Phase 25: Input Component
**Goal**: Text input with validation and form integration
**Plans**: 4 plans

Plans:
- [x] 25-01: Implement input core with text field
- [x] 25-02: Add validation states and error display
- [x] 25-03: Implement character counter
- [x] 25-04: Add password visibility toggle

### Phase 26: Textarea Component
**Goal**: Multi-line text input with auto-resize
**Plans**: 3 plans

Plans:
- [x] 26-01: Implement textarea core with auto-resize
- [x] 26-02: Add character counter and maxlength
- [x] 26-03: Implement validation states

### Phase 27: Input/Textarea CLI
**Goal**: CLI integration and documentation
**Plans**: 3 plans

Plans:
- [x] 27-01: Add Input to CLI registry
- [x] 27-02: Add Textarea to CLI registry
- [x] 27-03: Create documentation pages

</details>

<details>
<summary>✅ v4.1 Select Component (Phases 31-37) - SHIPPED 2026-01-27</summary>

### Phase 31: Select Core
**Goal**: Single-select dropdown with ARIA 1.2 combobox
**Plans**: 5 plans

Plans:
- [x] 31-01: Implement select core with dropdown
- [x] 31-02: Add keyboard navigation (arrows, Enter, Escape)
- [x] 31-03: Implement ARIA 1.2 combobox pattern
- [x] 31-04: Add form integration via ElementInternals
- [x] 31-05: Support option slot and property options

### Phase 32: Select Multi-Select
**Goal**: Multi-select with tags and overflow
**Plans**: 4 plans

Plans:
- [x] 32-01: Implement multi-select mode
- [x] 32-02: Add checkbox indicators in dropdown
- [x] 32-03: Support removable tags
- [x] 32-04: Handle overflow display (+N more)

### Phase 33: Select Combobox
**Goal**: Searchable dropdown with match highlighting
**Plans**: 4 plans

Plans:
- [x] 33-01: Implement combobox mode with text input
- [x] 33-02: Add real-time filtering
- [x] 33-03: Implement match highlighting
- [x] 33-04: Support custom filter functions

### Phase 34: Select Async
**Goal**: Async option loading with infinite scroll
**Plans**: 4 plans

Plans:
- [x] 34-01: Implement Promise-based options
- [x] 34-02: Add debounced async search with AbortController
- [x] 34-03: Integrate @tanstack/lit-virtual for virtual scrolling
- [x] 34-04: Implement infinite scroll pagination

### Phase 35: Select Positioning
**Goal**: Floating UI integration for dropdown
**Plans**: 4 plans

Plans:
- [x] 35-01: Integrate Floating UI for positioning
- [x] 35-02: Add flip/shift middleware
- [x] 35-03: Handle viewport edge cases
- [x] 35-04: Implement click-outside detection

### Phase 36: Select Theming
**Goal**: CSS design tokens for select
**Plans**: 3 plans

Plans:
- [x] 36-01: Create --ui-select-* CSS variables
- [x] 36-02: Add dark mode support
- [x] 36-03: Implement responsive design

### Phase 37: Select CLI
**Goal**: CLI integration and documentation
**Plans**: 4 plans

Plans:
- [x] 37-01: Add Select to CLI registry
- [x] 37-02: Create copy-source templates
- [x] 37-03: Write documentation page
- [x] 37-04: Add accessibility documentation

</details>

<details>
<summary>✅ v4.2 Form Controls (Phases 38-41) - SHIPPED 2026-01-27</summary>

### Phase 38: Switch Component
**Goal**: Toggle switch with form participation
**Plans**: 4 plans

Plans:
- [x] 38-01: Implement switch core with role="switch"
- [x] 38-02: Add animated track and thumb
- [x] 38-03: Integrate with forms via ElementInternals
- [x] 38-04: Add required validation

### Phase 39: Checkbox Component
**Goal**: Checkbox with indeterminate state
**Plans**: 4 plans

Plans:
- [x] 39-01: Implement checkbox core with animated SVG checkmark
- [x] 39-02: Add indeterminate tri-state
- [x] 39-03: Implement Space-only keyboard per W3C APG
- [x] 39-04: Add form integration via ElementInternals

### Phase 40: Radio Component
**Goal**: Radio button with group coordination
**Plans**: 4 plans

Plans:
- [x] 40-01: Implement radio core with animated dot
- [x] 40-02: Add presentational child pattern
- [x] 40-03: Create RadioGroup with mutual exclusion
- [x] 40-04: Implement roving tabindex keyboard navigation

### Phase 41: CLI and Documentation
**Goal**: CLI integration and docs for form controls
**Plans**: 5 plans

Plans:
- [x] 41-01: Add Switch to CLI registry
- [x] 41-02: Add Checkbox to CLI registry
- [x] 41-03: Add Radio to CLI registry
- [x] 41-04: Create Switch documentation page
- [x] 41-05: Create Checkbox documentation page
- [x] 41-06: Create Radio documentation page

</details>

### 🚧 v4.3 Date/Time Components (In Progress)

**Milestone Goal:** Add Calendar, Date Picker, Date Range Picker, and Time Picker components for complete date/time input capabilities.

#### Phase 42: Calendar Display Foundation
**Goal**: Standalone calendar component with month grid, navigation, keyboard accessibility, and screen reader support.
**Depends on**: Phase 41
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, CAL-07, CAL-08, CAL-09, CAL-10, CAL-11, CAL-12, CAL-13, CAL-14, CAL-15, CAL-16, CAL-17, CAL-18, CAL-19
**Success Criteria** (what must be TRUE):
  1. User sees a 7-column month grid with weekday headers that displays the current month
  2. User can navigate between months using previous/next buttons and month/year dropdowns
  3. User can navigate the calendar using keyboard (arrow keys, Home/End, Page Up/Down) with roving tabindex
  4. User hears screen reader announcements for month changes and selected dates via aria-live regions
  5. User sees today indicator, selected date highlight, and disabled dates with visual distinctions and proper ARIA
**Plans**: 8 plans in 4 waves

Plans:
- [x] 42-01-PLAN.md — Package setup, date utilities, and calendar grid layout with 7-column structure
- [x] 42-02-PLAN.md — Date cell rendering with today indicator and selected date states
- [x] 42-03-PLAN.md — Month navigation with previous/next buttons and month/year selectors
- [x] 42-04-PLAN.md — Keyboard navigation with roving tabindex (imperative KeyboardNavigationManager)
- [x] 42-05-PLAN.md — Screen reader support with aria-live regions and keyboard help dialog
- [x] 42-06-PLAN.md — Date constraints (min/max, disabled dates) with accessibility
- [x] 42-07-PLAN.md — Internationalization (first day of week, month/day names) via Intl API
- [x] 42-08-PLAN.md — Dark mode, SSR, CSS tokens, JSX types, and package exports

#### Phase 43: Calendar Display Advanced
**Goal**: Advanced calendar features including multiple months, decade/century views, animations, and touch gestures.
**Depends on**: Phase 42
**Requirements**: CAL-20, CAL-21, CAL-22, CAL-23, CAL-24, CAL-25, CAL-26, CAL-27, CAL-28, CAL-29, DP-01, DP-02, DP-03
**Success Criteria** (what must be TRUE):
  1. User can view and interact with 2-3 month grids side-by-side for range selection
  2. User can select years from decade/century views for fast navigation to distant dates
  3. User sees smooth month transitions with animations that respect prefers-reduced-motion
  4. User can swipe between months on touch devices and click week numbers to select entire weeks
  5. User sees responsive layout that adapts to screen size
**Plans**: 8 plans in 6 waves

Plans:
- [x] 43-01-PLAN.md — Add setColumns()/getColumns() to KeyboardNavigationManager for runtime column switching
- [x] 43-02-PLAN.md — Create GestureHandler (Pointer Events swipe) and AnimationController (slide/fade transitions)
- [x] 43-03-PLAN.md — Add ISO week number utilities (getISOWeekNumber, getISOWeekDates, getMonthWeeks)
- [x] 43-04-PLAN.md — Add decade (4x3 year grid) and century (4x3 decade grid) views with view drilling
- [x] 43-05-PLAN.md — Integrate animations, swipe gestures, week numbers column, and renderDay callback
- [x] 43-06-PLAN.md — Add display-month/hide-navigation props and CalendarMulti wrapper component
- [x] 43-07-PLAN.md — Add responsive container query layout (compact/standard/spacious breakpoints)
- [x] 43-08-PLAN.md — Update package exports, JSX types, and lui-calendar-multi registration

#### Phase 44: Date Picker Core
**Goal**: Single date picker with input field, calendar popup, positioning, form integration, and validation.
**Depends on**: Phase 42
**Requirements**: DP-04, DP-05, DP-06, DP-07, DP-08, DP-09, DP-10, DP-11, DP-12, DP-13, DP-14, DP-15, DP-16, DP-17, DP-18, DP-19
**Success Criteria** (what must be TRUE):
  1. User can type dates in multiple formats (dashes, slashes, dots) with locale-aware display
  2. User can click input or calendar icon to open calendar popup with proper positioning
  3. User sees inline errors for invalid dates with aria-invalid="true"
  4. User can clear date selection with X button and submit form with ISO 8601 format
  5. User experiences focus management with trap in popup and return to input on close
**Plans**: 5 plans in 5 waves

Plans:
- [x] 44-01-PLAN.md — Package scaffolding and TDD date input parser (multi-format parsing)
- [x] 44-02-PLAN.md — Component core with input field, calendar popup, clear button, form integration
- [x] 44-03-PLAN.md — Floating UI popup positioning with flip/shift and click-outside detection
- [x] 44-04-PLAN.md — Focus management (trap in popup, restore on close) and validation states
- [x] 44-05-PLAN.md — Package exports, custom element registration, and React JSX types

#### Phase 45: Date Picker Advanced
**Goal**: Advanced date picker features including natural language parsing, presets, inline mode, and custom formatting.
**Depends on**: Phase 44
**Requirements**: DP-20, DP-21, DP-22, DP-23, DP-24, DP-25, DP-26, DP-27
**Success Criteria** (what must be TRUE):
  1. User can type natural language like "tomorrow" or "next week" to select dates
  2. User can click quick preset buttons for common dates (Today, Tomorrow, Next Week)
  3. User can use inline mode for always-visible calendar without popup
  4. User can customize date format with Intl.DateTimeFormat options
  5. User sees tooltips for min/max date constraints
**Plans**: 5 plans in 4 waves

Plans:
- [x] 45-01-PLAN.md -- Natural language date parser (TDD) with dictionary-based phrase resolution
- [x] 45-02-PLAN.md -- Preset buttons (Today, Tomorrow, Next Week) and custom format prop
- [x] 45-03-PLAN.md -- Inline mode with always-visible calendar rendering
- [x] 45-04-PLAN.md -- Min/max constraint tooltips on disabled calendar dates
- [x] 45-05-PLAN.md -- Dark mode, SSR compatibility, package exports, and JSX types

#### Phase 46: Date Range Picker Core
**Goal**: Date range picker with start/end selection, two calendars, range highlighting, hover preview, and validation.
**Depends on**: Phase 42
**Requirements**: DRP-01, DRP-02, DRP-03, DRP-04, DRP-05, DRP-06, DRP-07, DRP-08, DRP-09, DRP-10, DRP-11, DRP-12, DRP-13, DRP-14, DRP-15
**Success Criteria** (what must be TRUE):
  1. User can click two dates to select a range with visual highlighting between start and end
  2. User sees two side-by-side calendars with synchronized month navigation
  3. User sees hover preview showing potential range from start date to hovered date
  4. User sees distinct visual styles for start date (rounded-left) and end date (rounded-right)
  5. User experiences validation for minimum/maximum range duration and start before end constraints
**Plans**: 5 plans in 5 waves

Plans:
- [ ] 46-01-PLAN.md — Package scaffolding, range utilities (TDD), and range selection state machine
- [ ] 46-02-PLAN.md — Dual calendar layout with synchronized navigation and range highlighting via renderDay
- [ ] 46-03-PLAN.md — Input field, Floating UI popup, click-outside, focus trap, and Escape handling
- [ ] 46-04-PLAN.md — Form integration via ElementInternals, range validation, clear button, error display
- [ ] 46-05-PLAN.md — Dark mode styles, package exports, custom element registration, and JSX types

#### Phase 47: Date Range Picker Advanced
**Goal**: Advanced range picker features including presets, drag selection, duration display, and comparison mode.
**Depends on**: Phase 46
**Requirements**: DRP-16, DRP-17, DRP-18, DRP-19, DRP-20, DRP-21, DRP-22
**Success Criteria** (what must be TRUE):
  1. User can click preset buttons for common ranges (Last 7 Days, Last 30 Days, This Month)
  2. User can drag from start date to create range by mouse movement
  3. User sees range duration display showing "X days selected"
  4. User can use comparison mode for two date ranges (e.g., compare this month vs last month)
  5. User experiences dark mode support and SSR compatibility
**Plans**: TBD

Plans:
- [ ] 47-01: Range preset buttons (Last 7 Days, Last 30 Days, This Month)
- [ ] 47-02: Mouse drag selection for range creation
- [ ] 47-03: Range duration display
- [ ] 47-04: Range comparison mode with two date ranges
- [ ] 47-05: Dark mode support via :host-context(.dark)
- [ ] 47-06: SSR compatibility with Declarative Shadow DOM

#### Phase 48: Time Picker Core
**Goal**: Time picker with hour/minute inputs, clock face, validation, and form integration.
**Depends on**: Phase 41 (no dependency on date components)
**Requirements**: TP-01, TP-02, TP-03, TP-04, TP-05, TP-06, TP-07, TP-08, TP-09, TP-10, TP-11, TP-12, TP-13, TP-14, TP-15
**Success Criteria** (what must be TRUE):
  1. User can input hours and minutes with 12/24-hour format toggle and AM/PM selector
  2. User can select time from clock face interface with hour marks and minute indicators
  3. User can use dropdown interface as desktop alternative
  4. User can click "Now" button for current time and preset buttons (Morning, Afternoon, Evening)
  5. User can submit form with ISO 8601 time format and see validation for end time after start time
**Plans**: TBD

Plans:
- [ ] 48-01: Hour input with 12/24-hour format values
- [ ] 48-02: Minute input with 0-59 values
- [ ] 48-03: AM/PM toggle button with clear indication
- [ ] 48-04: 24-hour format toggle
- [ ] 48-05: Clock face interface with hour marks and minute indicators
- [ ] 48-06: Dropdown interface for desktop
- [ ] 48-07: Time zone label display
- [ ] 48-08: Time validation (end time after start time)
- [ ] 48-09: Quick preset buttons (Morning, Afternoon, Evening, Now)
- [ ] 48-10: Keyboard navigation (arrow keys, Enter to confirm)
- [ ] 48-11: Form integration via ElementInternals with ISO 8601 time submission

#### Phase 49: Time Picker Advanced
**Goal**: Advanced time picker features including business hours, time interval slider, timezone support, and voice input.
**Depends on**: Phase 48
**Requirements**: TP-16, TP-17, TP-18, TP-19, TP-20, TP-21, TP-22, TP-23
**Success Criteria** (what must be TRUE):
  1. User can configure time intervals (15, 30, 60 minutes) for minute precision
  2. User sees business hours (9 AM - 5 PM) highlighted with different style
  3. User can use time range slider for visual duration selection
  4. User can see multi-timezone display showing local + selected timezone
  5. User can use voice input via Web Speech API for commands like "3 PM tomorrow" and mobile scrolling wheels
**Plans**: TBD

Plans:
- [ ] 49-01: Time interval prop (15, 30, 60 minutes)
- [ ] 49-02: Business hours highlighting (9 AM - 5 PM)
- [ ] 49-03: Time range slider for visual duration selection
- [ ] 49-04: Multi-timezone display (local + selected)
- [ ] 49-05: Voice input via Web Speech API
- [ ] 49-06: Mobile scrolling wheels (iOS-style)
- [ ] 49-07: Dark mode support via :host-context(.dark)
- [ ] 49-08: SSR compatibility with Declarative Shadow DOM

#### Phase 50: Documentation
**Goal**: Component documentation pages, examples, accessibility notes, and CLI integration for all date/time components.
**Depends on**: Phases 42-49
**Requirements**: (Documentation requirements - covers all components)
**Success Criteria** (what must be TRUE):
  1. User can read comprehensive documentation for Calendar, Date Picker, Date Range Picker, and Time Picker
  2. User can see interactive examples demonstrating key features and use cases
  3. User can access accessibility documentation with keyboard shortcuts and ARIA patterns
  4. User can install components via CLI with registered component entries
  5. User can understand form integration patterns and ISO 8601 value formats
**Plans**: TBD

Plans:
- [ ] 50-01: Calendar Display documentation page
- [ ] 50-02: Date Picker documentation page
- [ ] 50-03: Date Range Picker documentation page
- [ ] 50-04: Time Picker documentation page
- [ ] 50-05: CLI integration for all date/time components
- [ ] 50-06: Accessibility documentation for date/time components
- [ ] 50-07: Form integration examples
- [ ] 50-08: Internationalization documentation

## Progress

**Execution Order:**
Phases execute in numeric order: 42 → 43 → 44 → 45 → 46 → 47 → 48 → 49 → 50

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 42. Calendar Display Foundation | v4.3 | 8/8 | Complete | 2026-01-31 |
| 43. Calendar Display Advanced | v4.3 | 8/8 | Complete | 2026-01-31 |
| 44. Date Picker Core | v4.3 | 5/5 | Complete | 2026-01-31 |
| 45. Date Picker Advanced | v4.3 | 5/5 | Complete | 2026-01-31 |
| 46. Date Range Picker Core | v4.3 | 0/5 | Not started | - |
| 47. Date Range Picker Advanced | v4.3 | 0/6 | Not started | - |
| 48. Time Picker Core | v4.3 | 0/11 | Not started | - |
| 49. Time Picker Advanced | v4.3 | 0/8 | Not started | - |
| 50. Documentation | v4.3 | 0/8 | Not started | - |
