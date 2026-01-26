# Phase 28: Input Differentiators - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhanced UX features for the Input component: password visibility toggle, clear button, prefix/suffix content slots. These features distinguish the component from native inputs without adding new input types or validation logic.

</domain>

<decisions>
## Implementation Decisions

### Password Toggle
- Eye / eye-slash icons to represent hidden/visible state
- Toggle button positioned inside input, flush right edge
- Button is tabbable (separate tab stop from input)
- Toggling announces state change to screen readers via aria-live ("Password shown" / "Password hidden")

### Clear Button
- Appears when input has value (regardless of focus state)
- Focus returns to input after clearing
- No animation — instant show/hide
- Developer can enable on any clearable type (text, email, url, search, etc.) via attribute, not just type="search"

### Prefix/Suffix Slots
- No visual divider — content flows seamlessly, distinguished by position only
- Interactive content allowed (developer can put buttons or links in slots)
- Slot padding scales with input size (sm/md/lg)
- Clicking anywhere in prefix/suffix area focuses the input

### Claude's Discretion
- Icon choices for clear button (X, circle-X, etc.)
- Exact slot padding values per size
- Implementation approach for focus delegation

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

- Character count display — belongs in Phase 29 (Textarea) where multi-line content makes it more relevant

</deferred>

---

*Phase: 28-input-differentiators*
*Context gathered: 2026-01-26*
