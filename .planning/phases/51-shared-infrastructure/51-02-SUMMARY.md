---
phase: 51-shared-infrastructure
plan: 02
subsystem: design-tokens
tags: [css-tokens, overlay-animation, starting-style, allow-discrete, tooltip, popover, toast]
depends_on: []
provides: ["CSS custom properties for tooltip/popover/toast", "Token objects importable from @lit-ui/core/tokens", "Documented overlay animation pattern"]
affects: [52-tooltip, 53-popover, 54-toast]
tech-stack:
  added: []
  patterns: ["@starting-style + allow-discrete overlay animation", "--ui-{component}-{property} token naming"]
key-files:
  created:
    - packages/core/src/styles/overlay-animation.css
  modified:
    - packages/core/src/styles/tailwind.css
    - packages/core/src/tokens/index.ts
decisions:
  - id: "51-02-toast-variants"
    summary: "Toast variant colors use OKLCH with dark mode overrides (inverted lightness)"
  - id: "51-02-overlay-ref"
    summary: "overlay-animation.css is a copy-paste reference, not an imported module"
metrics:
  duration: "~2 min"
  completed: "2026-02-02"
---

# Phase 51 Plan 02: CSS Design Tokens and Overlay Animation Pattern Summary

**One-liner:** 37 CSS custom properties for tooltip/popover/toast with dark mode, token objects in TypeScript, and documented @starting-style overlay animation reference.

## What Was Done

### Task 1: CSS Custom Properties in tailwind.css

Added 37 new CSS custom properties to the `:root` block following the established `--ui-{component}-{property}` convention:

- **Tooltip** (10 tokens): Inverted color scheme (dark bg/light text), radius, padding, font-size, shadow, arrow-size, max-width, z-index
- **Popover** (9 tokens): Card-based surface with border, shadow, arrow-size, max-width, z-index
- **Toast** (18 tokens): Card surface + 4 variant color sets (success/error/warning/info) using OKLCH

Added dark mode overrides in the `.dark` block:
- Tooltip: Swaps to light bg/dark text (inverted stays inverted)
- Popover: Gray-900 bg, gray-50 text, gray-800 border
- Toast: Same base overrides + all 12 variant colors with lower lightness backgrounds and higher lightness icons

### Task 2: Token Objects and Overlay Animation CSS

Added `tooltip`, `popover`, and `toast` objects to the `tokens` const in `tokens/index.ts`, each mapping camelCase keys to `var(--ui-*)` references. Added `TooltipToken`, `PopoverToken`, `ToastToken` type exports.

Created `overlay-animation.css` as a documented reference pattern showing:
- Generic template with the 4-part pattern (base/active/@starting-style/reduced-motion)
- Tooltip example: fade only (100ms)
- Popover example: scale + fade (150ms, same as Dialog)
- Toast example: slide + fade (200ms, translateY)

## Commits

| Hash | Message |
|------|---------|
| 25c024e | feat(51-02): add tooltip, popover, and toast CSS tokens to tailwind.css |
| 1f5d318 | feat(51-02): add token objects and overlay animation reference pattern |

## Verification Results

- `pnpm --filter @lit-ui/core build` passes
- tailwind.css: 12 tooltip matches, 12 popover matches, 36 toast matches
- tokens/index.ts: tooltip, popover, toast objects with type exports
- overlay-animation.css: documented @starting-style + allow-discrete pattern
- dist/tokens/index.js: new token objects present in build output

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

All three downstream phases have the infrastructure they need:
- **Phase 52 (Tooltip):** CSS tokens + token object + fade animation pattern + floating utility (from 51-01)
- **Phase 53 (Popover):** CSS tokens + token object + scale+fade animation pattern + floating utility (from 51-01)
- **Phase 54 (Toast):** CSS tokens + token object + slide+fade animation pattern (no floating utility needed)
