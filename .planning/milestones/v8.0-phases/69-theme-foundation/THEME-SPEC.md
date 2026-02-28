# Theme Specification — v8.0 Monochrome Design Token Reference

## Purpose

This document is the authoritative spec for the v8.0 monochrome design system polish.
Phases 70-87 reference this document to determine what "matching the monochrome shadcn theme" means for each component.

All values are sourced directly from the `:root` block in `packages/core/src/styles/tailwind.css`. Do not invent values — implement against exactly what is listed here.

## Design Principles

1. Monochrome neutral gray palette — no brand colors in defaults
2. Subtle shadows — components feel lightweight, not heavy
3. Consistent radius scale — form elements at 0.375rem, overlays at 0.5rem, fully-rounded elements at 9999px
4. 150ms transitions for interactive elements; 200ms for panels/overlays (accordion, indicator animations)
5. Focus rings use the ring color (near-black in light, mid-gray in dark), 2px width, 2px offset
6. Light mode: white backgrounds, near-black text (`oklch(0.13 0.028 261.692)`), light-gray borders (`oklch(0.928 0.006 264.531)`)
7. Color token pattern: `var(--color-semantic, var(--ui-color-semantic))` — always double-fallback

## Primitive Token Scale (Light Mode)

These are defined in the `@theme` block. Component tokens reference these via semantic aliases.

### Brand / Gray Scale

| Step | Value | Description |
|------|-------|-------------|
| 50   | `oklch(0.985 0 0)` | Near-white |
| 100  | `oklch(0.96 0 0)` | Very light gray |
| 200  | `oklch(0.90 0 0)` | Light gray |
| 300  | `oklch(0.82 0 0)` | Light-mid gray |
| 400  | `oklch(0.71 0 0)` | Mid-light gray |
| 500  | `oklch(0.55 0 0)` | Mid gray |
| 600  | `oklch(0.45 0 0)` | Mid-dark gray |
| 700  | `oklch(0.37 0 0)` | Dark-mid gray |
| 800  | `oklch(0.27 0 0)` | Dark gray |
| 900  | `oklch(0.18 0 0)` | Near-black (primary) |
| 950  | `oklch(0.10 0 0)` | Very near-black (ring) |

### Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| `--radius-none` | `0px` | Sharp corners |
| `--radius-sm` | `0.125rem` | Very small elements |
| `--radius-md` | `0.375rem` | Form inputs, buttons, small chips |
| `--radius-lg` | `0.5rem` | Overlays (dialog, popover, toast) |
| `--radius-xl` | `0.75rem` | Larger cards |
| `--radius-2xl` | `1rem` | Very rounded |
| `--radius-3xl` | `1.5rem` | Extra rounded |
| `--radius-full` | `9999px` | Pills, switches, radio dots |

### Shadow Scale

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)` |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |

## Semantic Color Scale (Light Mode Defaults)

These are defined in both `@theme` (as `--color-*` Tailwind utilities) and `:root` (as `--ui-color-*` fallbacks for Shadow DOM).

| Token | Resolved Value | Use |
|-------|----------------|-----|
| `--ui-color-primary` | `oklch(0.18 0 0)` | Primary action, selected states, checked states |
| `--ui-color-primary-foreground` | `oklch(0.985 0 0)` | Text on primary backgrounds |
| `--ui-color-secondary` | `oklch(0.967 0.003 264.542)` | Secondary action backgrounds |
| `--ui-color-secondary-foreground` | `oklch(0.21 0.006 285.885)` | Text on secondary backgrounds |
| `--ui-color-destructive` | `oklch(0.637 0.237 25.331)` | Errors, delete actions |
| `--ui-color-destructive-foreground` | `white` | Text on destructive backgrounds |
| `--ui-color-muted` | `oklch(0.967 0.003 264.542)` | Muted/disabled backgrounds |
| `--ui-color-muted-foreground` | `oklch(0.551 0.027 264.364)` | Placeholder text, helper text |
| `--ui-color-accent` | `oklch(0.967 0.003 264.542)` | Hover backgrounds |
| `--ui-color-accent-foreground` | `oklch(0.21 0.006 285.885)` | Text on accent backgrounds |
| `--ui-color-foreground` | `oklch(0.13 0.028 261.692)` | Body text, primary text |
| `--ui-color-border` | `oklch(0.928 0.006 264.531)` | Borders, dividers |
| `--ui-color-ring` | `oklch(0.10 0 0)` | Focus ring color |
| `--ui-color-card` | `white` | Card and overlay surfaces |
| `--ui-color-card-foreground` | `oklch(0.13 0.028 261.692)` | Text on card surfaces |

## Global System Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--ui-focus-ring-width` | `2px` | Focus ring thickness (outline width) |
| `--ui-focus-ring-offset` | `2px` | Focus ring offset from element |
| `--ui-focus-ring-color` | `var(--color-ring, var(--ui-color-ring))` | Focus ring color (near-black light, mid-gray dark) |
| `--ui-contrast-threshold` | `0.7` | Auto-contrast lightness threshold |

---

## Component Token Reference

---

### Button (`--ui-button-*`)

Layout:
- `--ui-button-radius`: `0.375rem`
- `--ui-button-shadow`: `none`
- `--ui-button-border-width`: `1px`

Typography:
- `--ui-button-font-weight`: `500`
- `--ui-button-font-size-sm`: `0.875rem`
- `--ui-button-font-size-md`: `1rem`
- `--ui-button-font-size-lg`: `1.125rem`

Spacing:
- `--ui-button-padding-x-sm`: `0.75rem` / `--ui-button-padding-y-sm`: `0.375rem` / `--ui-button-gap-sm`: `0.375rem`
- `--ui-button-padding-x-md`: `1rem` / `--ui-button-padding-y-md`: `0.5rem` / `--ui-button-gap-md`: `0.5rem`
- `--ui-button-padding-x-lg`: `1.5rem` / `--ui-button-padding-y-lg`: `0.75rem` / `--ui-button-gap-lg`: `0.625rem`

Variant Colors:
- **primary**: `--ui-button-primary-bg`: `var(--color-primary, var(--ui-color-primary))` → `oklch(0.18 0 0)` near-black; `--ui-button-primary-text`: `var(--color-primary-foreground, var(--ui-color-primary-foreground))` → near-white; `--ui-button-primary-hover-opacity`: `0.9`
- **secondary**: `--ui-button-secondary-bg`: `var(--color-secondary, var(--ui-color-secondary))` → light gray; `--ui-button-secondary-text`: secondary foreground; `--ui-button-secondary-hover-bg`: `var(--color-accent, var(--ui-color-accent))`
- **outline**: `--ui-button-outline-bg`: `transparent`; `--ui-button-outline-text`: foreground; `--ui-button-outline-border`: `var(--color-border, var(--ui-color-border))`; `--ui-button-outline-hover-bg`: accent
- **ghost**: `--ui-button-ghost-bg`: `transparent`; `--ui-button-ghost-text`: foreground; `--ui-button-ghost-hover-bg`: accent
- **destructive**: `--ui-button-destructive-bg`: `var(--color-destructive, var(--ui-color-destructive))`; `--ui-button-destructive-text`: destructive-foreground; `--ui-button-destructive-hover-opacity`: `0.9`

**Button — what matching means:**
- All 5 variants render with the token values above (not hardcoded colors)
- Primary and destructive: hover applies `opacity: 0.9` (not color change)
- Secondary: hover swaps to accent background
- Outline: hover swaps to accent background, always has 1px border
- Ghost: hover swaps to accent background, no border
- Focus ring: `outline: 2px solid var(--ui-focus-ring-color)` with `outline-offset: 2px`
- Disabled and loading: `opacity: 0.5`, `cursor: not-allowed`, pointer-events: none
- Sizes: sm/md/lg apply token-defined padding/font-size/gap values
- Auto-contrast: primary/secondary/destructive use CSS relative color syntax for text color based on background lightness vs `--ui-contrast-threshold: 0.7`

---

### Dialog (`--ui-dialog-*`)

Layout:
- `--ui-dialog-radius`: `0.5rem`
- `--ui-dialog-shadow`: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
- `--ui-dialog-padding`: `1.5rem`
- `--ui-dialog-max-width-sm`: `24rem`
- `--ui-dialog-max-width-md`: `28rem`
- `--ui-dialog-max-width-lg`: `32rem`

Colors:
- `--ui-dialog-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-dialog-text`: `var(--color-card-foreground, var(--ui-color-card-foreground))` → near-black
- `--ui-dialog-backdrop`: `rgba(0, 0, 0, 0.5)`

Typography:
- `--ui-dialog-title-size`: `1.125rem`
- `--ui-dialog-title-weight`: `600`
- `--ui-dialog-body-color`: `var(--color-muted-foreground, var(--ui-color-muted-foreground))` → mid-gray

Spacing:
- `--ui-dialog-header-margin`: `1rem`
- `--ui-dialog-footer-margin`: `1.5rem`
- `--ui-dialog-footer-gap`: `0.75rem`

**Dialog — what matching means:**
- Content box has `border-radius: 0.5rem` with shadow (no border on dialog content itself)
- Backdrop is `rgba(0, 0, 0, 0.5)` semi-transparent
- Enter animation: scale(0.95) → scale(1) with 150ms ease-out, using `@starting-style`
- Exit animation: `transition-behavior: allow-discrete` for `display` and `overlay`
- Reduced motion: transitions set to `none`
- Title: 1.125rem, font-weight 600
- Body text: muted-foreground color (mid-gray)
- Footer: flex row, justify-end, 0.75rem gap between buttons
- Three size variants (sm/md/lg) control max-width via tokens

---

### Input (`--ui-input-*`)

Layout:
- `--ui-input-radius`: `0.375rem`
- `--ui-input-border-width`: `1px`
- `--ui-input-transition`: `150ms`

Typography:
- `--ui-input-font-size-sm`: `0.875rem` / `--ui-input-font-size-md`: `1rem` / `--ui-input-font-size-lg`: `1.125rem`

Spacing:
- `--ui-input-padding-x-sm`: `0.75rem` / `--ui-input-padding-y-sm`: `0.375rem`
- `--ui-input-padding-x-md`: `1rem` / `--ui-input-padding-y-md`: `0.5rem`
- `--ui-input-padding-x-lg`: `1.25rem` / `--ui-input-padding-y-lg`: `0.75rem`

State Colors:
- Default: `--ui-input-bg`: `var(--color-background, white)`; `--ui-input-text`: foreground; `--ui-input-border`: border; `--ui-input-placeholder`: muted-foreground
- Focus: `--ui-input-border-focus`: `var(--color-ring, var(--ui-color-ring))`; `--ui-input-ring`: ring color
- Error: `--ui-input-border-error`: destructive; `--ui-input-text-error`: destructive
- Disabled: `--ui-input-bg-disabled`: muted; `--ui-input-text-disabled`: muted-foreground; `--ui-input-border-disabled`: border

**Input — what matching means:**
- Border radius 0.375rem, 1px border
- Focus: ring color border + 2px focus ring with 2px offset
- Error: destructive color border and text
- Disabled: muted background, muted-foreground text, cursor not-allowed, opacity 0.5
- Transitions: 150ms on border-color and box-shadow
- Placeholder: muted-foreground color

---

### Textarea (`--ui-textarea-*`)

Layout:
- `--ui-textarea-radius`: `0.375rem`
- `--ui-textarea-border-width`: `1px`
- `--ui-textarea-min-height`: `5rem`
- `--ui-textarea-transition`: `150ms`

Typography:
- `--ui-textarea-font-size-sm`: `0.875rem` / `--ui-textarea-font-size-md`: `1rem` / `--ui-textarea-font-size-lg`: `1.125rem`

Spacing:
- `--ui-textarea-padding-x-sm`: `0.75rem` / `--ui-textarea-padding-y-sm`: `0.375rem`
- `--ui-textarea-padding-x-md`: `1rem` / `--ui-textarea-padding-y-md`: `0.5rem`
- `--ui-textarea-padding-x-lg`: `1.25rem` / `--ui-textarea-padding-y-lg`: `0.75rem`

State Colors (same pattern as Input):
- Default: bg=background, text=foreground, border=border, placeholder=muted-foreground
- Focus: `--ui-textarea-border-focus`: ring; `--ui-textarea-ring`: ring
- Error: `--ui-textarea-border-error`: destructive; `--ui-textarea-text-error`: destructive
- Disabled: `--ui-textarea-bg-disabled`: muted; `--ui-textarea-text-disabled`: muted-foreground; `--ui-textarea-border-disabled`: border

**Textarea — what matching means:**
- Identical visual behavior to Input but vertically resizable
- Min-height 5rem (approx 3 lines)
- Border radius 0.375rem, 1px border
- All states match Input (focus, error, disabled)
- Resize handle visible; user may resize vertically

---

### Select (`--ui-select-*`)

Layout:
- `--ui-select-radius`: `0.375rem`
- `--ui-select-border-width`: `1px`
- `--ui-select-transition`: `150ms`
- `--ui-select-dropdown-shadow`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- `--ui-select-dropdown-max-height`: `15rem`
- `--ui-select-option-height`: `2.25rem`
- `--ui-select-z-index`: `40`

Typography:
- `--ui-select-font-size-sm`: `0.875rem` / `--ui-select-font-size-md`: `1rem` / `--ui-select-font-size-lg`: `1.125rem`

Spacing:
- `--ui-select-padding-x-sm`: `0.75rem` / `--ui-select-padding-y-sm`: `0.375rem`
- `--ui-select-padding-x-md`: `1rem` / `--ui-select-padding-y-md`: `0.5rem`
- `--ui-select-padding-x-lg`: `1.25rem` / `--ui-select-padding-y-lg`: `0.75rem`

Trigger State Colors:
- Default: bg=background, text=foreground, border=border, placeholder=muted-foreground
- Focus: `--ui-select-border-focus`: ring; `--ui-select-ring`: ring
- Error: `--ui-select-border-error`: destructive; `--ui-select-text-error`: destructive
- Disabled: bg=muted, text=muted-foreground, border=border

Dropdown Colors:
- `--ui-select-dropdown-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-select-dropdown-border`: `var(--color-border, var(--ui-color-border))`

Option Colors:
- `--ui-select-option-bg`: `transparent`
- `--ui-select-option-bg-hover`: accent
- `--ui-select-option-bg-active`: accent
- `--ui-select-option-text`: foreground
- `--ui-select-option-text-disabled`: muted-foreground
- `--ui-select-option-check`: primary

Multi-select:
- `--ui-select-tag-bg`: secondary; `--ui-select-tag-text`: secondary-foreground
- `--ui-select-tag-gap`: `0.25rem`; `--ui-select-tag-padding-x`: `0.5rem`; `--ui-select-tag-padding-y`: `0.125rem`
- `--ui-select-checkbox-border`: border; `--ui-select-checkbox-bg-checked`: primary; `--ui-select-checkbox-check`: `white`
- `--ui-select-highlight-weight`: `600`; `--ui-select-highlight-text`: `inherit`

**Select — what matching means:**
- Trigger renders like Input (same radius, border, states)
- Dropdown appears below trigger (z-index 40), white bg, 1px border, subtle shadow
- Option height 2.25rem, hover swaps to accent background
- Check mark in primary color for selected option(s)
- Multi-select: tags use secondary bg/text, small gap/padding; checkbox indicators use primary when checked
- Combobox: matching text bold (weight 600), non-matching text at inherit opacity

---

### Checkbox (`--ui-checkbox-*`)

Dimensions:
- `--ui-checkbox-size-sm`: `1rem` / `--ui-checkbox-size-md`: `1.25rem` / `--ui-checkbox-size-lg`: `1.5rem`

Layout:
- `--ui-checkbox-radius`: `0.25rem`
- `--ui-checkbox-label-gap`: `0.5rem`
- `--ui-checkbox-transition`: `150ms`
- `--ui-checkbox-border-width`: `2px`
- `--ui-checkbox-group-gap`: `0.5rem`

Typography:
- `--ui-checkbox-font-size-sm`: `0.875rem` / `--ui-checkbox-font-size-md`: `1rem` / `--ui-checkbox-font-size-lg`: `1.125rem`

State Colors:
- Unchecked: `--ui-checkbox-bg`: `var(--color-background, white)`; `--ui-checkbox-border`: `var(--color-border, var(--ui-color-border))`
- Checked: `--ui-checkbox-bg-checked`: primary; `--ui-checkbox-border-checked`: primary; `--ui-checkbox-check-color`: `white`
- Indeterminate: `--ui-checkbox-bg-indeterminate`: primary; `--ui-checkbox-border-indeterminate`: primary
- Focus: `--ui-checkbox-ring`: `var(--color-ring, var(--ui-color-ring))`
- Error: `--ui-checkbox-border-error`: destructive; `--ui-checkbox-text-error`: destructive

**Checkbox — what matching means:**
- Square box, 0.25rem radius (slightly rounded, not round)
- 2px border (heavier than inputs, consistent with form control spec)
- Unchecked: white bg, light gray border
- Checked: near-black bg, near-black border, white checkmark SVG inside
- Indeterminate: same colors as checked, minus symbol instead of check
- Focus: 2px ring with 2px offset using ring color
- Disabled: opacity 0.5, cursor not-allowed
- Error: border turns destructive color, helper text turns destructive

---

### Radio (`--ui-radio-*`)

Dimensions:
- `--ui-radio-size-sm`: `1rem` / `--ui-radio-size-md`: `1.25rem` / `--ui-radio-size-lg`: `1.5rem`
- `--ui-radio-dot-size-sm`: `0.5rem` / `--ui-radio-dot-size-md`: `0.625rem` / `--ui-radio-dot-size-lg`: `0.75rem`

Layout:
- `--ui-radio-label-gap`: `0.5rem`
- `--ui-radio-transition`: `150ms`
- `--ui-radio-border-width`: `2px`
- `--ui-radio-group-gap`: `0.5rem`

Typography:
- `--ui-radio-font-size-sm`: `0.875rem` / `--ui-radio-font-size-md`: `1rem` / `--ui-radio-font-size-lg`: `1.125rem`

State Colors:
- Unchecked: `--ui-radio-bg`: `var(--color-background, white)`; `--ui-radio-border`: `var(--color-border, var(--ui-color-border))`
- Checked: `--ui-radio-border-checked`: primary; `--ui-radio-dot-color`: primary
- Focus: `--ui-radio-ring`: `var(--color-ring, var(--ui-color-ring))`
- Error: `--ui-radio-border-error`: destructive; `--ui-radio-text-error`: destructive

**Radio — what matching means:**
- Circular control (border-radius: 9999px for the outer ring)
- 2px border, same as checkbox
- Unchecked: white bg, light gray border
- Checked: primary color border with primary-color filled dot inside (`border-radius: 9999px`)
- Dot is centered inside the circle at ~50% size of outer circle
- Focus ring: 2px ring with 2px offset
- Disabled: opacity 0.5, cursor not-allowed
- Error: border and helper text turn destructive color

---

### Switch (`--ui-switch-*`)

Track Dimensions:
- Small: `--ui-switch-track-width-sm`: `2rem` / `--ui-switch-track-height-sm`: `1.125rem` / `--ui-switch-thumb-size-sm`: `0.875rem`
- Medium: `--ui-switch-track-width-md`: `2.5rem` / `--ui-switch-track-height-md`: `1.375rem` / `--ui-switch-thumb-size-md`: `1.125rem`
- Large: `--ui-switch-track-width-lg`: `3rem` / `--ui-switch-track-height-lg`: `1.625rem` / `--ui-switch-thumb-size-lg`: `1.375rem`

Layout:
- `--ui-switch-radius`: `9999px` (fully rounded track)
- `--ui-switch-thumb-radius`: `9999px` (fully rounded thumb)
- `--ui-switch-thumb-offset`: `2px`
- `--ui-switch-label-gap`: `0.5rem`
- `--ui-switch-transition`: `150ms`

Typography:
- `--ui-switch-font-size-sm`: `0.875rem` / `--ui-switch-font-size-md`: `1rem` / `--ui-switch-font-size-lg`: `1.125rem`

State Colors:
- Unchecked: `--ui-switch-track-bg`: muted; `--ui-switch-track-border`: border; `--ui-switch-thumb-bg`: `white`
- Checked: `--ui-switch-track-bg-checked`: `var(--color-primary, var(--ui-color-primary))` → near-black
- Disabled: `--ui-switch-track-bg-disabled`: muted; `--ui-switch-thumb-bg-disabled`: muted-foreground
- Focus: `--ui-switch-ring`: `var(--color-ring, var(--ui-color-ring))`
- Error: `--ui-switch-border-error`: destructive; `--ui-switch-text-error`: destructive

**Switch — what matching means:**
- Pill-shaped track (fully rounded), circular thumb
- Unchecked: muted/gray track with white thumb
- Checked: near-black track with white thumb (thumb slides to right)
- Thumb offset from track edge: 2px inset
- Transition: thumb slides and track color transitions over 150ms
- Disabled: both track and thumb use muted colors
- Focus ring on the track (2px, 2px offset)

---

### Calendar (`--ui-calendar-*`)

Layout:
- `--ui-calendar-width`: `320px`
- `--ui-calendar-day-size`: `2.5rem`
- `--ui-calendar-gap`: `0.25rem`
- `--ui-calendar-radius`: `0.375rem`
- `--ui-calendar-cell-size`: `2.5rem`
- `--ui-calendar-cell-radius`: `0.375rem`

Colors:
- `--ui-calendar-bg`: `var(--color-background, #ffffff)`
- `--ui-calendar-text`: `var(--color-foreground, var(--ui-color-foreground))`
- `--ui-calendar-border`: `var(--color-border, #e5e7eb)`
- `--ui-calendar-hover-bg`: `var(--color-muted, #f3f4f6)`
- `--ui-calendar-weekday-color`: `var(--color-muted-foreground, #6b7280)`
- `--ui-calendar-nav-color`: `var(--color-foreground, currentColor)`

Today indicator:
- `--ui-calendar-today-font-weight`: `600`
- `--ui-calendar-today-border`: `2px solid var(--color-primary, var(--ui-color-primary))`

Selected:
- `--ui-calendar-selected-bg`: `var(--color-primary, var(--ui-color-primary))` → near-black
- `--ui-calendar-selected-text`: `var(--color-primary-foreground, white)`

Disabled/outside:
- `--ui-calendar-disabled-opacity`: `0.4`
- `--ui-calendar-outside-opacity`: `0.4`

Focus:
- `--ui-calendar-focus-ring`: `var(--color-ring, var(--ui-color-ring))`

**Calendar — what matching means:**
- 320px wide grid with 7 columns (Sun–Sat)
- Day cells are 2.5rem × 2.5rem with 0.375rem radius
- Today: bold font-weight + 2px border in primary color (no fill)
- Selected: filled primary bg with primary-foreground text
- Hovered: muted background
- Disabled/outside month: 40% opacity
- Weekday headers: muted-foreground color
- Navigation arrows: foreground color
- Focus ring on keyboard-navigated day

---

### Tooltip (`--ui-tooltip-*`)

Colors (inverted — dark bg, light text):
- `--ui-tooltip-bg`: `var(--color-foreground, var(--ui-color-foreground))` → near-black
- `--ui-tooltip-text`: `var(--color-background, white)` → white

Layout:
- `--ui-tooltip-radius`: `0.375rem`
- `--ui-tooltip-padding-x`: `0.75rem`
- `--ui-tooltip-padding-y`: `0.375rem`
- `--ui-tooltip-font-size`: `0.875rem`
- `--ui-tooltip-shadow`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- `--ui-tooltip-arrow-size`: `8px`
- `--ui-tooltip-max-width`: `20rem`
- `--ui-tooltip-z-index`: `50`

**Tooltip — what matching means:**
- Inverted dark background with white text (in both light and dark mode — inverts)
- Small font (0.875rem), comfortable padding
- Subtle shadow (xs/sm level, not heavy)
- Arrow pointing to trigger, 8px arrow
- Max width 20rem (prevents very wide tooltips)
- Z-index 50 (above popovers and other overlays)
- Show/hide with short fade or immediate appearance

---

### Popover (`--ui-popover-*`)

Colors:
- `--ui-popover-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-popover-text`: `var(--color-card-foreground, var(--ui-color-card-foreground))` → near-black
- `--ui-popover-border`: `var(--color-border, var(--ui-color-border))`

Layout:
- `--ui-popover-radius`: `0.5rem`
- `--ui-popover-padding`: `1rem`
- `--ui-popover-shadow`: `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)`
- `--ui-popover-arrow-size`: `8px`
- `--ui-popover-max-width`: `20rem`
- `--ui-popover-z-index`: `45`

**Popover — what matching means:**
- Card-surface background (white in light mode)
- 1px border (light gray), 0.5rem radius
- Larger, more prominent shadow than tooltip (lg level)
- Z-index 45 (below tooltip but above most content)
- 1rem internal padding
- Arrow pointing to trigger, 8px arrow

---

### Toast (`--ui-toast-*`)

Colors:
- `--ui-toast-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-toast-text`: `var(--color-card-foreground, var(--ui-color-card-foreground))` → near-black
- `--ui-toast-border`: `var(--color-border, var(--ui-color-border))`

Layout:
- `--ui-toast-radius`: `0.5rem`
- `--ui-toast-padding`: `1rem`
- `--ui-toast-shadow`: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
- `--ui-toast-max-width`: `24rem`
- `--ui-toast-gap`: `0.75rem`
- `--ui-toast-z-index`: `55` (highest, always on top)

Variant Colors (light mode):
- Success: `--ui-toast-success-bg`: `oklch(0.95 0.05 150)` / `--ui-toast-success-border`: `oklch(0.70 0.15 150)` / `--ui-toast-success-icon`: `oklch(0.55 0.20 150)`
- Error: `--ui-toast-error-bg`: `oklch(0.95 0.05 25)` / `--ui-toast-error-border`: `oklch(0.70 0.15 25)` / `--ui-toast-error-icon`: `oklch(0.55 0.20 25)`
- Warning: `--ui-toast-warning-bg`: `oklch(0.95 0.05 85)` / `--ui-toast-warning-border`: `oklch(0.70 0.15 85)` / `--ui-toast-warning-icon`: `oklch(0.55 0.20 85)`
- Info: `--ui-toast-info-bg`: `oklch(0.95 0.05 250)` / `--ui-toast-info-border`: `oklch(0.70 0.15 250)` / `--ui-toast-info-icon`: `oklch(0.55 0.20 250)`

**Toast — what matching means:**
- White card bg with 1px border and shadow (same visual weight as dialog)
- 0.5rem radius, 1rem padding, 24rem max-width
- Z-index 55 — always above dialogs (z:50) and tooltips
- Semantic variants use tinted backgrounds (very light hue, bg at L=0.95)
- Variant border and icon color at higher chroma than bg for visual pop
- Slide in from bottom or top of screen, stack vertically with gap
- Toast gap between content sections: 0.75rem

---

### Accordion (`--ui-accordion-*`)

Layout:
- `--ui-accordion-border`: `var(--color-border, var(--ui-color-border))`
- `--ui-accordion-border-width`: `1px`
- `--ui-accordion-radius`: `0.375rem`
- `--ui-accordion-gap`: `0`

Header:
- `--ui-accordion-header-padding`: `1rem`
- `--ui-accordion-header-font-weight`: `500`
- `--ui-accordion-header-font-size`: `1rem`
- `--ui-accordion-header-text`: foreground
- `--ui-accordion-header-bg`: `transparent`
- `--ui-accordion-header-hover-bg`: `var(--color-muted, var(--ui-color-muted))`

Panel:
- `--ui-accordion-panel-padding`: `0 1rem 1rem`
- `--ui-accordion-panel-text`: `var(--color-muted-foreground, var(--ui-color-muted-foreground))`

Animation:
- `--ui-accordion-transition`: `200ms`

Focus:
- `--ui-accordion-ring`: ring

**Accordion — what matching means:**
- Items separated by bottom border (1px), no outer border by default
- Header: transparent bg, muted hover, 1rem padding, 500 weight, 1rem font size
- Panel text: muted-foreground (mid-gray) to indicate secondary content
- Expand/collapse animation: 200ms (panel height, not 150ms — panels are slower)
- Chevron rotates 180° on expand (also 200ms)
- Focus ring on header trigger (not the whole item)
- No gap between items (they share borders)

---

### Tabs (`--ui-tabs-*`)

Layout:
- `--ui-tabs-border`: border

Tab List:
- `--ui-tabs-list-bg`: `var(--color-muted, var(--ui-color-muted))`
- `--ui-tabs-list-padding`: `0.25rem`
- `--ui-tabs-list-radius`: `0.375rem`
- `--ui-tabs-list-gap`: `0.25rem`

Tab Button:
- `--ui-tabs-tab-padding`: `0.5rem 1rem`
- `--ui-tabs-tab-radius`: `0.25rem`
- `--ui-tabs-tab-font-size`: `0.875rem`
- `--ui-tabs-tab-font-weight`: `500`
- `--ui-tabs-tab-text`: muted-foreground
- `--ui-tabs-tab-bg`: `transparent`
- `--ui-tabs-tab-hover-text`: foreground
- `--ui-tabs-tab-hover-bg`: `transparent`

Active Tab:
- `--ui-tabs-tab-active-text`: foreground
- `--ui-tabs-tab-active-bg`: `var(--color-background, white)`
- `--ui-tabs-tab-active-shadow`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`

Panel:
- `--ui-tabs-panel-padding`: `1rem 0`
- `--ui-tabs-panel-text`: foreground

Focus:
- `--ui-tabs-ring`: ring

Transition:
- `--ui-tabs-transition`: `150ms`

Indicator:
- `--ui-tabs-indicator-color`: `var(--color-primary, var(--ui-color-primary))`
- `--ui-tabs-indicator-height`: `2px`
- `--ui-tabs-indicator-radius`: `9999px`
- `--ui-tabs-indicator-transition`: `200ms`

Scroll Buttons:
- `--ui-tabs-scroll-button-size`: `2rem`

**Tabs — what matching means:**
- Tab list: muted bg container, 0.375rem radius, 0.25rem padding and gap between tabs
- Inactive tabs: muted-foreground text, transparent bg
- Active tab: white bg, foreground text, xs shadow (elevated card look)
- Horizontal scroll: scroll buttons (2rem) appear when tabs overflow
- Indicator (underline variant): 2px primary-color bar, 9999px radius (rounded ends), slides 200ms
- Panel content: 1rem top/bottom padding, foreground text

---

### Time Picker (`--ui-time-picker-*`)

Trigger colors:
- `--ui-time-picker-bg`: `var(--color-background, white)`
- `--ui-time-picker-text`: foreground
- `--ui-time-picker-border`: border
- `--ui-time-picker-placeholder`: muted-foreground
- `--ui-time-picker-label-text`: foreground
- `--ui-time-picker-error`: destructive
- `--ui-time-picker-ring`: ring

Popup:
- `--ui-time-picker-popup-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-time-picker-popup-border`: border
- `--ui-time-picker-popup-shadow`: `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)`

States:
- `--ui-time-picker-hover-bg`: muted
- `--ui-time-picker-disabled-bg`: muted
- `--ui-time-picker-disabled-border`: border
- `--ui-time-picker-z-index`: `40`

Mode Tabs:
- `--ui-time-picker-tab-bg`: background / `--ui-time-picker-tab-text`: foreground / `--ui-time-picker-tab-border`: border
- `--ui-time-picker-tab-hover-bg`: muted
- `--ui-time-picker-tab-active-bg`: primary / `--ui-time-picker-tab-active-text`: primary-foreground

Presets:
- `--ui-time-picker-preset-bg`: background / `--ui-time-picker-preset-text`: foreground / `--ui-time-picker-preset-border`: border
- `--ui-time-picker-preset-hover-bg`: muted / `--ui-time-picker-preset-hover-border`: muted-foreground

Muted:
- `--ui-time-picker-muted-text`: muted-foreground

Dropdown:
- `--ui-time-picker-dropdown-bg`: card / `--ui-time-picker-dropdown-border`: border
- `--ui-time-picker-option-text`: foreground / `--ui-time-picker-option-hover-bg`: muted
- `--ui-time-picker-option-selected-bg`: `oklch(0.95 0.03 250)` / `--ui-time-picker-option-selected-text`: `oklch(0.45 0.15 250)`
- `--ui-time-picker-business-accent`: `oklch(0.60 0.18 150)` / `--ui-time-picker-business-bg`: `oklch(0.97 0.02 150)` / `--ui-time-picker-business-hover-bg`: `oklch(0.93 0.04 150)`

Spinbutton:
- `--ui-time-picker-spinbutton-bg`: background / `--ui-time-picker-spinbutton-text`: foreground / `--ui-time-picker-spinbutton-border`: border
- `--ui-time-picker-separator-color`: muted-foreground
- `--ui-time-picker-period-bg`: background / `--ui-time-picker-period-text`: foreground / `--ui-time-picker-period-border`: border / `--ui-time-picker-period-hover-bg`: muted

Clock Face:
- `--ui-time-picker-clock-bg`: muted / `--ui-time-picker-clock-border`: border / `--ui-time-picker-clock-text`: foreground
- `--ui-time-picker-clock-selected-bg`: primary / `--ui-time-picker-clock-selected-text`: primary-foreground / `--ui-time-picker-clock-hand`: primary

Voice Input:
- `--ui-time-picker-voice-bg`: background / `--ui-time-picker-voice-text`: foreground / `--ui-time-picker-voice-border`: border
- `--ui-time-picker-voice-hover-border`: primary / `--ui-time-picker-voice-hover-text`: primary

Range Slider:
- `--ui-time-picker-range-label`: foreground / `--ui-time-picker-range-muted`: muted-foreground
- `--ui-time-picker-range-track`: border / `--ui-time-picker-range-fill`: primary
- `--ui-time-picker-range-thumb-bg`: background / `--ui-time-picker-range-thumb-border`: primary

Scroll Wheel:
- `--ui-time-picker-wheel-text`: foreground / `--ui-time-picker-wheel-selected-text`: primary
- `--ui-time-picker-wheel-highlight-border`: border / `--ui-time-picker-wheel-highlight-bg`: `oklch(0.97 0.01 250)`
- `--ui-time-picker-wheel-separator`: muted-foreground

Timezone:
- `--ui-time-picker-timezone-text`: muted-foreground / `--ui-time-picker-timezone-separator`: border

**Time Picker — what matching means:**
- Trigger renders like Input (same radius/border/states)
- Popup: white card bg, 1px border, subtle shadow
- Mode tabs (analog/digital/wheel): active tab uses primary bg with primary-foreground text
- Selected option: subtle blue tint (`oklch(0.95 0.03 250)`) with blue text
- Business hours: green accent background for highlighting
- Clock hand and selected time use primary color
- Range slider fill uses primary color

---

### Date Picker (`--ui-date-picker-*`)

Trigger colors:
- `--ui-date-picker-bg`: `var(--color-background, white)`
- `--ui-date-picker-text`: foreground / `--ui-date-picker-border`: border
- `--ui-date-picker-placeholder`: muted-foreground / `--ui-date-picker-label-text`: foreground
- `--ui-date-picker-error`: destructive / `--ui-date-picker-ring`: ring

Popup:
- `--ui-date-picker-popup-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-date-picker-popup-border`: border
- `--ui-date-picker-popup-shadow`: `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)`
- `--ui-date-picker-z-index`: `40`

States:
- `--ui-date-picker-hover-bg`: muted
- `--ui-date-picker-disabled-bg`: muted / `--ui-date-picker-disabled-border`: border
- `--ui-date-picker-helper-text`: muted-foreground / `--ui-date-picker-action-text`: muted-foreground

Presets:
- `--ui-date-picker-preset-bg`: background / `--ui-date-picker-preset-text`: foreground
- `--ui-date-picker-preset-border`: border / `--ui-date-picker-preset-hover-bg`: muted
- `--ui-date-picker-preset-hover-border`: muted-foreground

**Date Picker — what matching means:**
- Trigger renders like Input (same radius/border/states)
- Popup: white card bg, 1px border, subtle shadow, z-index 40
- Embeds Calendar component for date selection
- Preset buttons: background white, border, muted hover
- Helper/action text in muted-foreground
- Clear button uses muted background on hover

---

### Date Range Picker (`--ui-date-range-*`)

Trigger colors:
- `--ui-date-range-bg`: `var(--color-background, white)`
- `--ui-date-range-text`: foreground / `--ui-date-range-border`: border
- `--ui-date-range-placeholder`: muted-foreground / `--ui-date-range-label-text`: foreground
- `--ui-date-range-error`: destructive / `--ui-date-range-ring`: ring

Popup:
- `--ui-date-range-popup-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-date-range-popup-border`: border
- `--ui-date-range-popup-shadow`: `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)`
- `--ui-date-range-z-index`: `40`

States:
- `--ui-date-range-hover-bg`: muted
- `--ui-date-range-disabled-bg`: muted / `--ui-date-range-disabled-border`: border
- `--ui-date-range-helper-text`: muted-foreground / `--ui-date-range-action-text`: muted-foreground

Presets:
- `--ui-date-range-preset-bg`: background / `--ui-date-range-preset-text`: foreground
- `--ui-date-range-preset-border`: border / `--ui-date-range-preset-hover-bg`: muted

Borders:
- `--ui-date-range-sidebar-border`: border / `--ui-date-range-footer-border`: border

Controls:
- `--ui-date-range-clear-border`: border / `--ui-date-range-clear-text`: foreground / `--ui-date-range-clear-hover-bg`: muted
- `--ui-date-range-toggle-border`: border / `--ui-date-range-toggle-hover-bg`: muted
- `--ui-date-range-toggle-active-bg`: primary / `--ui-date-range-toggle-active-text`: primary-foreground

Compare Mode:
- `--ui-date-range-compare-highlight-bg`: `oklch(0.93 0.06 85)` (yellow tint)
- `--ui-date-range-compare-preview-bg`: `oklch(0.97 0.03 85)` (very light yellow)

**Date Range Picker — what matching means:**
- Trigger renders like Input (same radius/border/states)
- Popup: white card, 1px border, subtle shadow — may show 2 calendars side by side
- Sidebar with preset ranges separated by 1px border
- Footer with action buttons separated by 1px border
- Toggle buttons for compare mode: active state uses primary color
- Compare mode: yellow-tinted highlights for comparison ranges
- Clear button: bordered, foreground text, muted hover

---

### Data Table (`--ui-data-table-*`)

Base Colors:
- `--ui-data-table-header-bg`: `var(--color-muted, var(--ui-color-muted))`
- `--ui-data-table-row-bg`: `var(--color-background, white)`
- `--ui-data-table-row-hover-bg`: `var(--color-muted, var(--ui-color-muted))`
- `--ui-data-table-border-color`: `var(--color-border, var(--ui-color-border))`
- `--ui-data-table-text-color`: `var(--color-foreground, var(--ui-color-foreground))`
- `--ui-data-table-header-text`: `var(--color-muted-foreground, var(--ui-color-muted-foreground))`

Selection:
- `--ui-data-table-selected-bg`: `oklch(0.97 0.01 250)` (very light blue tint)
- `--ui-data-table-selected-hover-bg`: `oklch(0.94 0.02 250)` (slightly stronger tint on hover)

Skeleton:
- `--ui-data-table-skeleton-base`: border / `--ui-data-table-skeleton-highlight`: muted

Interactions:
- `--ui-data-table-header-hover-bg`: `rgba(0, 0, 0, 0.05)`
- `--ui-data-table-sticky-shadow`: `rgba(0, 0, 0, 0.06)`

Menu / Overlay:
- `--ui-data-table-menu-bg`: `var(--color-card, var(--ui-color-card))` → white
- `--ui-data-table-menu-shadow`: `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)`
- `--ui-data-table-overlay-bg`: `rgba(255, 255, 255, 0.6)`

Editable:
- `--ui-data-table-editable-hover-bg`: `rgba(0, 0, 0, 0.03)`
- `--ui-data-table-editing-bg`: `color-mix(in oklch, var(--color-primary, var(--ui-color-primary)) 5%, var(--color-background, white))`

Badge Colors:
- Default: `--ui-data-table-badge-default-bg`: muted / `--ui-data-table-badge-default-text`: foreground
- Green: bg=`oklch(0.93 0.06 150)` / text=`oklch(0.35 0.10 150)`
- Blue: bg=`oklch(0.93 0.06 250)` / text=`oklch(0.35 0.10 250)`
- Red: bg=`oklch(0.93 0.06 25)` / text=`oklch(0.35 0.10 25)`
- Yellow: bg=`oklch(0.93 0.06 85)` / text=`oklch(0.40 0.12 85)`
- Purple: bg=`oklch(0.93 0.06 310)` / text=`oklch(0.35 0.10 310)`

**Data Table — what matching means:**
- Header row: muted background, muted-foreground text (header labels are lighter than data)
- Data rows: white background, foreground text, muted hover
- Borders: 1px light-gray between rows and columns
- Selected rows: very light blue tint (subtle, not jarring)
- Sortable header hover: `rgba(0,0,0,0.05)` overlay for clickability feedback
- Sticky columns: shadow `rgba(0,0,0,0.06)` indicates separation
- Context menus: white card bg with subtle shadow
- Loading skeleton: border-color base, muted highlight (shimmer animation)
- Editing cell: 5% primary color mix into background (very subtle)
- Badges: light pastel backgrounds with dark text of matching hue

---

## Dark Mode Overrides Summary

The `.dark` class in `tailwind.css` overrides the following `:root` semantic colors:
- primary: `oklch(0.985 0 0)` (near-white) / primary-foreground: `oklch(0.18 0 0)` (near-black) — inverted
- secondary: `oklch(0.27 0 0)` / secondary-foreground: `oklch(0.96 0 0)`
- destructive: `oklch(0.55 0.22 25)` (brighter red for dark mode)
- muted: `oklch(0.27 0 0)` / muted-foreground: `oklch(0.71 0 0)`
- accent: `oklch(0.27 0 0)` / accent-foreground: `oklch(0.96 0 0)`
- background: `oklch(0.10 0 0)` / foreground: `oklch(0.985 0 0)` — inverted
- border: `oklch(0.27 0 0)` / input: `oklch(0.27 0 0)`
- ring: `oklch(0.55 0 0)` (mid-gray, not near-black)
- card: `oklch(0.18 0 0)` / card-foreground: `oklch(0.985 0 0)`

Most component tokens inherit from the `.dark` semantic overrides automatically via `var(--color-*, var(--ui-color-*))`. Components that have explicit `.dark` block overrides in `tailwind.css` include: calendar, tooltip, popover, toast, accordion, tabs, time-picker, date-picker, date-range, data-table, button, dialog, input, textarea, select, switch, checkbox, radio.

---

## Token Pattern Reference

All component tokens follow this double-fallback pattern:
```css
--ui-{component}-{property}: var(--color-{semantic}, var(--ui-color-{semantic}));
```

This means:
1. If user provides `--color-primary` (Tailwind semantic), that wins
2. If not, falls back to `--ui-color-primary` (defined in `:root`)
3. Component phases must NOT hardcode colors — always reference component tokens

For hardcoded values (radius, shadow, spacing), they appear as concrete values in `:root` which users override by setting `--ui-{component}-{property}` directly.
