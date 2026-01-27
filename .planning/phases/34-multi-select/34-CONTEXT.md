# Phase 34: Multi-Select - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can select multiple values from a dropdown. Selections display as removable tags in the trigger area. Proper form participation with multiple values. This builds on the single-select foundation from Phase 32.

</domain>

<decisions>
## Implementation Decisions

### Tag/chip display
- Pill-shaped tags (fully rounded ends) for selected items
- Filled background style (subtle background color, not outlined)
- Truncate long labels with ellipsis, show full text on hover tooltip
- Tags display in trigger area where placeholder normally shows

### Remove button on tags
- Claude's discretion on X button visibility (always vs hover)

### Overflow handling
- Use +N more counter when selections exceed available space
- Dynamic tag count — show as many tags as fit the trigger width
- Clicking +N counter shows tooltip/popover listing hidden selections
- Claude's discretion on whether popover allows removal

### Selection behavior
- Dropdown stays open after selecting an option (no close on select)
- Checkmark icon on right side of options (consistent with single-select pattern)
- Select all / Clear all actions via optional prop (showSelectAll)
- No keyboard shortcut for removing last tag — must use mouse or navigate

### Form submission
- Claude's discretion on FormData format (FormData.append per value recommended from research)
- Optional maxSelections prop to limit number of selections
- Claude's discretion on value property format (array recommended)
- Claude's discretion on validation (min/max counts vs just required)

### Claude's Discretion
- X button visibility (always vs hover)
- Popover removal capability
- FormData format (recommend FormData.append per value)
- Value property type (recommend array)
- Validation scope (recommend required + maxSelections from prop)

</decisions>

<specifics>
## Specific Ideas

- Tags should feel like Gmail chips — pill shape, filled background, clean
- The +N counter with popover matches patterns in mature multi-selects (MUI, Ant Design)
- Dropdown staying open is critical for multi-select UX — reopening for each selection is frustrating

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 34-multi-select*
*Context gathered: 2026-01-26*
