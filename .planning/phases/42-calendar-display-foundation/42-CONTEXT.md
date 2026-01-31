# Phase 42: Calendar Display Foundation - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

## Phase Boundary

Standalone calendar component with month grid, navigation, keyboard accessibility, and screen reader support. Users can view and select dates. This is the foundation — date picker integration is a separate phase.

## Implementation Decisions

### Visual layout
- Weekday headers: 3-letter abbreviations (Mon, Tue, Wed)
- Prev/next navigation: Icon-only buttons with aria-label
- Out-of-month days: Hidden entirely (blank cells, not shown)

### Selection behavior
- Multi-select mode: Supported (multiple dates can be selected at once)
- Date constraints: Configured via minDate/maxDate props
- Disabled weekends: Boolean prop (disableWeekends) to disable Sat/Sun
- Disabled date appearance: Faded text style (reduced opacity, no hover)

### Claude's Discretion
- Cell sizing (large ~44px+ or compact ~36-40px)
- Today indicator visual treatment
- Selected date visual style (solid fill, ring, or pill)
- Month/year selector (combined dropdown, two dropdowns, or buttons only)
- Today button inclusion
- Selection trigger (single click vs click+confirm)
- Multi-select visual pattern (checkmarks, circles, etc.)
- Deselection behavior (toggle or explicit)

## Specific Ideas

- Standard calendar patterns apply — follow familiar UX from iOS/Android calendars

## Deferred Ideas

None — discussion stayed within phase scope

---

*Phase: 42-calendar-display-foundation*
*Context gathered: 2026-01-30*
