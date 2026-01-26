---
phase: 33
plan: 01
subsystem: select-component
tags: [slots, custom-content, icons, descriptions, lui-option]
depends_on:
  requires: [32-01, 32-02]
  provides: [slot-based-options, option-custom-content]
  affects: [33-02, 33-03]
tech_stack:
  added: []
  patterns: [named-slots, slot-change-handling, unified-options-interface]
key_files:
  created: []
  modified:
    - packages/select/src/option.ts
    - packages/select/src/select.ts
decisions:
  - id: options-property-precedence
    choice: Options property takes precedence over slotted options
    rationale: Backwards compatibility with existing property-based usage
  - id: getLabel-method
    choice: Option.getLabel() returns label prop > textContent > value
    rationale: Flexible label resolution for slotted content
  - id: data-active-attribute
    choice: Use data-active attribute for slotted option active state
    rationale: CSS ::slotted() selector can target attribute-based states
metrics:
  duration: 6 min
  completed: 2026-01-26
---

# Phase 33 Plan 01: Option Slot Support Summary

Slot-based custom content in lui-option with start/end/description slots; Select renders slotted children with full keyboard navigation.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Enhance lui-option with named slots | 60a6f6a | option.ts |
| 2 | Update Select to support slotted children | f9466a0 | select.ts |
| 3 | Register lui-option and update types | (already done) | index.ts, jsx.d.ts |

## Implementation Details

### Option Component Enhancement (option.ts)

Added named slot support to lui-option:

```html
<lui-option value="email">
  <svg slot="start">...</svg>
  Email
  <span slot="description">Via email notification</span>
</lui-option>
```

Key additions:
- `slot="start"` - Icon or content before label (flex, 1.25em sizing)
- `slot="end"` - Icon or content after label
- `slot="description"` - Text below label (0.75rem, muted color)
- Default slot - Custom label text (alternative to label property)
- `getLabel()` method - Priority: label prop > textContent > value

CSS structure:
```css
.option { display: flex; align-items: center; gap: 0.5rem; }
.slot-start, .slot-end { display: flex; align-items: center; flex-shrink: 0; }
.option-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
```

### Select Slot Support (select.ts)

Updated Select to render slotted lui-option children alongside options property:

1. **Unified Options Interface**: `getAllOptions()` returns both property-based and slotted options in common format
2. **Mode Detection**: `isSlottedMode` getter checks if using slots vs property
3. **Backwards Compatible**: Options property takes precedence when provided
4. **Active State Sync**: `syncSlottedActiveState()` manages `data-active` attribute for keyboard navigation
5. **Conditional Rendering**: Property options render inline, otherwise slot element rendered

```typescript
// Slotted active state CSS
::slotted([data-active='true']) {
  background-color: var(--ui-select-option-bg-active);
}
```

ARIA integration:
- `aria-activedescendant` uses `option.getId()` for slotted options
- Scroll into view works for both property and slotted options

## Deviations from Plan

None - plan executed exactly as written. Note: Task 3 (registration) was already completed by prior work.

## Verification Results

- Build: `pnpm build --filter @lit-ui/select` - PASS
- TypeScript: `pnpm exec tsc --noEmit -p packages/select` - PASS
- Custom elements: lui-select, lui-option registered
- Slotted options: Render and selectable
- Keyboard navigation: Works with slotted options
- Type-ahead: Finds slotted options by getLabel()

## Next Phase Readiness

Ready for 33-02 (Option Groups) - select.ts already has detection for lui-option-group with nested option queries.

**Dependencies satisfied:**
- lui-option has slots for custom content
- Select handles slotted children with keyboard navigation
- TypeScript types complete
