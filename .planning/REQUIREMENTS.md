# Requirements: LitUI v4.3 - Date/Time Components

**Defined:** 2026-01-30
**Core Value:** Developers can use polished, accessible UI components in any framework without lock-in

## v4.3 Requirements

Requirements for v4.3 milestone - complete date/time input capabilities. Each maps to roadmap phases.

### Calendar Display

- [x] **CAL-01**: Component displays 7-column month grid with weekday headers
- [x] **CAL-02**: Today indicator visually highlights current date with aria-current="date"
- [x] **CAL-03**: Selected date is visually distinct from today and other dates
- [x] **CAL-04**: Previous/next month navigation buttons with descriptive ARIA labels
- [x] **CAL-05**: Month/year dropdown selectors for jumping to specific months
- [x] **CAL-06**: Year dropdown or decade view for distant year selection
- [x] **CAL-07**: Keyboard navigation supports arrow keys, Home/End, Page Up/Down
- [x] **CAL-08**: Roving tabindex implementation for grid navigation
- [x] **CAL-09**: Screen reader announces month changes via aria-live region
- [x] **CAL-10**: Screen reader announces selected date via aria-live region
- [x] **CAL-11**: Minimum date constraint disables dates before min
- [x] **CAL-12**: Maximum date constraint disables dates after max
- [x] **CAL-13**: Specific dates can be disabled with visual gray state
- [x] **CAL-14**: Disabled dates include reason in aria-label
- [x] **CAL-15**: First day of week localizes based on user locale (Sunday US, Monday EU)
- [x] **CAL-16**: Month names localize via Intl.DateTimeFormat
- [x] **CAL-17**: Weekday names localize via Intl.DateTimeFormat
- [x] **CAL-18**: Component respects dark mode via :host-context(.dark)
- [x] **CAL-19**: Component renders via SSR with Declarative Shadow DOM
- [x] **CAL-20**: Multiple month display shows 2-3 month grids side-by-side
- [x] **CAL-21**: Decade view displays year grid for fast year selection
- [x] **CAL-22**: Century view displays decade grid for birth year selection
- [x] **CAL-23**: Date cells support custom rendering via slot API
- [x] **CAL-24**: Month transition animates with slide or fade effect
- [x] **CAL-25**: Animations respect prefers-reduced-motion media query
- [x] **CAL-26**: Week number column displays ISO 8601 week numbers
- [x] **CAL-27**: Clicking week number selects entire week
- [x] **CAL-28**: Touch swipe gesture navigates between months
- [x] **CAL-29**: Component layout adapts responsively to screen size

### Date Picker

- [ ] **DP-01**: Input field displays selected date in formatted locale-aware string
- [ ] **DP-02**: Calendar icon button triggers popup
- [ ] **DP-03**: Input focus opens calendar popup
- [x] **DP-04**: Text input parses dates in multiple formats (dashes, slashes, dots)
- [x] **DP-05**: Date format displays month name or uses labeled fields for international clarity
- [x] **DP-06**: Component integrates with forms via ElementInternals
- [x] **DP-07**: Form value submits as ISO 8601 format (YYYY-MM-DD)
- [x] **DP-08**: Invalid dates show inline error with aria-invalid="true"
- [x] **DP-09**: Placeholder text shows expected date format
- [x] **DP-10**: Helper text displays format requirements
- [x] **DP-11**: Clear button (X icon) resets date selection
- [x] **DP-12**: Focus is trapped within calendar popup when open
- [x] **DP-13**: Focus returns to input when popup closes
- [x] **DP-14**: Escape key closes calendar popup
- [x] **DP-15**: Clicking outside popup closes calendar
- [x] **DP-16**: Calendar popup uses Floating UI for positioning
- [x] **DP-17**: Calendar popup uses flip/shift middleware to avoid clipping
- [x] **DP-18**: Popup uses composedPath() for click-outside detection
- [x] **DP-19**: Component uses date-fns for date manipulation
- [x] **DP-20**: Natural language parsing accepts "tomorrow", "next week", "today"
- [x] **DP-21**: Quick preset buttons provide one-click common dates
- [x] **DP-22**: Preset buttons include Today, Tomorrow, Next Week options
- [x] **DP-23**: Inline mode displays always-visible calendar without popup
- [x] **DP-24**: Custom format prop accepts Intl.DateTimeFormat options
- [x] **DP-25**: Min/max dates show tooltip with constraint reason
- [x] **DP-26**: Component respects dark mode via :host-context(.dark)
- [x] **DP-27**: Component renders via SSR with Declarative Shadow DOM

### Date Range Picker

- [x] **DRP-01**: First click sets range start date
- [x] **DRP-02**: Second click sets range end date
- [x] **DRP-03**: Selected range highlights with background color
- [x] **DRP-04**: Two calendars display side-by-side
- [x] **DRP-05**: Calendars synchronize month navigation
- [x] **DRP-06**: Hover preview shows potential range from start to hovered date
- [x] **DRP-07**: Start date has distinct visual style (e.g., rounded-left)
- [x] **DRP-08**: End date has distinct visual style (e.g., rounded-right)
- [x] **DRP-09**: Clicking end date before start auto-swaps dates
- [x] **DRP-10**: Minimum range duration validates selection (e.g., 3 nights minimum)
- [x] **DRP-11**: Maximum range duration validates selection (e.g., 30 day maximum)
- [x] **DRP-12**: Start date must be before or equal to end date
- [x] **DRP-13**: Clear button resets both start and end dates
- [x] **DRP-14**: Component integrates with forms via ElementInternals
- [x] **DRP-15**: Form value submits as ISO 8601 range (YYYY-MM-DD/YYYY-MM-DD)
- [ ] **DRP-16**: Range presets provide one-click common ranges
- [ ] **DRP-17**: Preset buttons include Last 7 Days, Last 30 Days, This Month options
- [ ] **DRP-18**: Mouse drag selection creates range by dragging from start
- [ ] **DRP-19**: Range duration display shows "X days selected"
- [ ] **DRP-20**: Range comparison mode supports two date ranges
- [ ] **DRP-21**: Component respects dark mode via :host-context(.dark)
- [ ] **DRP-22**: Component renders via SSR with Declarative Shadow DOM

### Time Picker

- [ ] **TP-01**: Hour input accepts 1-12 (12-hour) or 0-23 (24-hour) values
- [ ] **TP-02**: Minute input accepts 0-59 values
- [ ] **TP-03**: AM/PM toggle button clearly indicates current period
- [ ] **TP-04**: 24-hour format toggle switches between formats
- [ ] **TP-05**: Clock face interface visualizes time selection
- [ ] **TP-06**: Dropdown interface provides desktop alternative
- [ ] **TP-07**: Clock face shows hour marks and minute indicators
- [ ] **TP-08**: Time zone label displays current timezone
- [ ] **TP-09**: Time validation ensures end time after start time
- [ ] **TP-10**: Quick preset buttons provide Morning, Afternoon, Evening options
- [ ] **TP-11**: "Now" button selects current time
- [ ] **TP-12**: Keyboard arrow keys adjust hours and minutes
- [ ] **TP-13**: Enter key confirms time selection
- [ ] **TP-14**: Component integrates with forms via ElementInternals
- [ ] **TP-15**: Form value submits as ISO 8601 time format (HH:mm:ss)
- [ ] **TP-16**: Time interval prop controls minute precision (15, 30, 60)
- [ ] **TP-17**: Business hours highlight (9 AM - 5 PM) with different style
- [ ] **TP-18**: Time range slider provides visual duration selection
- [ ] **TP-19**: Multi-timezone display shows local + selected timezone
- [ ] **TP-20**: Voice input accepts "3 PM tomorrow" via Web Speech API
- [ ] **TP-21**: Mobile scrolling wheels provide iOS-style time selection
- [ ] **TP-22**: Component respects dark mode via :host-context(.dark)
- [ ] **TP-23**: Component renders via SSR with Declarative Shadow DOM

## Future Requirements

Deferred to future releases. Tracked but not in v4.3 roadmap.

### Additional Components

- **COMP-01**: Color Picker component
- **COMP-02**: Slider component
- **COMP-03**: Tabs component
- **COMP-04**: Accordion component
- **COMP-05**: Popover component
- **COMP-06**: Tooltip component
- **COMP-07**: Toast notification component
- **COMP-08**: Alert banner component

### Framework Integration

- **FW-01**: @lit-ui/react wrapper package
- **FW-02**: @lit-ui/vue wrapper package
- **FW-03**: @lit-ui/svelte wrapper package

### Documentation

- **DOC-01**: Framework integration guides
- **DOC-02**: Accessibility documentation
- **DOC-03**: Search functionality in docs

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native `<input type="date">` on mobile | Custom picker provides consistent UX across platforms |
| Server-side theme config storage | Keep it simple with URL-encoded params |
| Runtime theme switching | Build-time customization is simpler and SSR-compatible |
| Per-component different themes | All components share one theme |
| Component source modification | Theme via Tailwind/CSS, not hardcoded values |
| Auto-update mechanism for installed components | Users control when to update |
| Full ShadCN component parity (40+ components) | Grow based on demand |
| Built-in state management | Conflicts with host framework's state management |
| CJS output | Modern bundlers handle ESM; CJS adds complexity |
| React-specific features | Defeats framework-agnostic value proposition |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAL-01 | Phase 42 | Complete |
| CAL-02 | Phase 42 | Complete |
| CAL-03 | Phase 42 | Complete |
| CAL-04 | Phase 42 | Complete |
| CAL-05 | Phase 42 | Complete |
| CAL-06 | Phase 42 | Complete |
| CAL-07 | Phase 42 | Complete |
| CAL-08 | Phase 42 | Complete |
| CAL-09 | Phase 42 | Complete |
| CAL-10 | Phase 42 | Complete |
| CAL-11 | Phase 42 | Complete |
| CAL-12 | Phase 42 | Complete |
| CAL-13 | Phase 42 | Complete |
| CAL-14 | Phase 42 | Complete |
| CAL-15 | Phase 42 | Complete |
| CAL-16 | Phase 42 | Complete |
| CAL-17 | Phase 42 | Complete |
| CAL-18 | Phase 42 | Complete |
| CAL-19 | Phase 42 | Complete |
| CAL-20 | Phase 43 | Complete |
| CAL-21 | Phase 43 | Complete |
| CAL-22 | Phase 43 | Complete |
| CAL-23 | Phase 43 | Complete |
| CAL-24 | Phase 43 | Complete |
| CAL-25 | Phase 43 | Complete |
| CAL-26 | Phase 43 | Complete |
| CAL-27 | Phase 43 | Complete |
| CAL-28 | Phase 43 | Complete |
| CAL-29 | Phase 43 | Complete |
| DP-01 | Phase 43 | Pending |
| DP-02 | Phase 43 | Pending |
| DP-03 | Phase 43 | Pending |
| DP-04 | Phase 44 | Complete |
| DP-05 | Phase 44 | Complete |
| DP-06 | Phase 44 | Complete |
| DP-07 | Phase 44 | Complete |
| DP-08 | Phase 44 | Complete |
| DP-09 | Phase 44 | Complete |
| DP-10 | Phase 44 | Complete |
| DP-11 | Phase 44 | Complete |
| DP-12 | Phase 44 | Complete |
| DP-13 | Phase 44 | Complete |
| DP-14 | Phase 44 | Complete |
| DP-15 | Phase 44 | Complete |
| DP-16 | Phase 44 | Complete |
| DP-17 | Phase 44 | Complete |
| DP-18 | Phase 44 | Complete |
| DP-19 | Phase 44 | Complete |
| DP-20 | Phase 45 | Complete |
| DP-21 | Phase 45 | Complete |
| DP-22 | Phase 45 | Complete |
| DP-23 | Phase 45 | Complete |
| DP-24 | Phase 45 | Complete |
| DP-25 | Phase 45 | Complete |
| DP-26 | Phase 45 | Complete |
| DP-27 | Phase 45 | Complete |
| DRP-01 | Phase 46 | Complete |
| DRP-02 | Phase 46 | Complete |
| DRP-03 | Phase 46 | Complete |
| DRP-04 | Phase 46 | Complete |
| DRP-05 | Phase 46 | Complete |
| DRP-06 | Phase 46 | Complete |
| DRP-07 | Phase 46 | Complete |
| DRP-08 | Phase 46 | Complete |
| DRP-09 | Phase 46 | Complete |
| DRP-10 | Phase 46 | Complete |
| DRP-11 | Phase 46 | Complete |
| DRP-12 | Phase 46 | Complete |
| DRP-13 | Phase 46 | Complete |
| DRP-14 | Phase 46 | Complete |
| DRP-15 | Phase 46 | Complete |
| DRP-16 | Phase 47 | Pending |
| DRP-17 | Phase 47 | Pending |
| DRP-18 | Phase 47 | Pending |
| DRP-19 | Phase 47 | Pending |
| DRP-20 | Phase 47 | Pending |
| DRP-21 | Phase 47 | Pending |
| DRP-22 | Phase 47 | Pending |
| TP-01 | Phase 48 | Pending |
| TP-02 | Phase 48 | Pending |
| TP-03 | Phase 48 | Pending |
| TP-04 | Phase 48 | Pending |
| TP-05 | Phase 48 | Pending |
| TP-06 | Phase 48 | Pending |
| TP-07 | Phase 48 | Pending |
| TP-08 | Phase 48 | Pending |
| TP-09 | Phase 48 | Pending |
| TP-10 | Phase 48 | Pending |
| TP-11 | Phase 48 | Pending |
| TP-12 | Phase 48 | Pending |
| TP-13 | Phase 48 | Pending |
| TP-14 | Phase 48 | Pending |
| TP-15 | Phase 48 | Pending |
| TP-16 | Phase 49 | Pending |
| TP-17 | Phase 49 | Pending |
| TP-18 | Phase 49 | Pending |
| TP-19 | Phase 49 | Pending |
| TP-20 | Phase 49 | Pending |
| TP-21 | Phase 49 | Pending |
| TP-22 | Phase 49 | Pending |
| TP-23 | Phase 49 | Pending |

**Coverage:**
- v4.3 requirements: 96 total
- Mapped to phases: 96
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-30 after initial definition*
