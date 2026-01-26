# Phase 30: CLI and Documentation - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Developers can install Input and Textarea via CLI and learn usage from documentation pages. This phase adds CLI commands for the two new form components and creates comprehensive docs pages with live demos.

</domain>

<decisions>
## Implementation Decisions

### CLI behavior
- Separate install commands only: `add input` and `add textarea` (no combined option)
- Silent success on install — no post-install usage hints
- Proceed silently when shared dependencies already installed
- Categorize components in `list` output by type: Form (input, textarea), Feedback (dialog), Actions (button)

### Docs page structure
- Match existing pattern (Overview, Usage, Props, Examples) — same as Button/Dialog
- Separate pages for Input and Textarea (input.mdx and textarea.mdx)
- Live interactive demos with copyable code below
- Comprehensive coverage: 8-12 examples per component page

### Validation examples
- Show pre-triggered error states for visibility (some examples start in error state)
- Component-only focus — no full form submission demos
- Combined helper text + error text example (one example showing both states)

### Auto-resize demo
- Interactive playground where user types and watches textarea grow
- Start empty — user types to experience resize behavior
- Character counter demonstration — Claude's discretion on combined vs separate

### Claude's Discretion
- Which specific validation patterns to demonstrate (representative subset)
- Whether to show constrained resize (maxRows/maxHeight) as separate example or combined
- Exact example grouping for character counter feature

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches that match existing docs patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 30-cli-documentation*
*Context gathered: 2026-01-26*
