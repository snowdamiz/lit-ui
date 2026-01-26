# Phase 26: CSS Tokens Foundation - Research

**Researched:** 2026-01-26
**Domain:** CSS custom property tokens for Input and Textarea components
**Confidence:** HIGH

## Summary

This phase adds CSS custom property tokens for Input and Textarea styling to the existing theme system in `@lit-ui/core`. The research confirms the exact patterns to follow from the existing v3.0 theme system, including the established naming conventions, layer structure, and light/dark mode handling.

The existing codebase uses a three-layer token system defined in `/packages/core/src/styles/tailwind.css`:
1. **Semantic tokens** in `@theme {}` (e.g., `--color-primary`, `--color-border`)
2. **Component tokens** in `:root {}` (e.g., `--ui-button-*`, `--ui-dialog-*`)
3. **Dark mode overrides** in `.dark {}` selector

The Input and Textarea tokens will follow this exact pattern, adding new `--ui-input-*` and `--ui-textarea-*` component tokens to the `:root {}` block that reference the existing semantic color tokens.

**Primary recommendation:** Add component tokens to the existing `:root {}` block in `tailwind.css`, following the established Button and Dialog token patterns exactly. Use existing semantic tokens (`--ui-color-destructive`, `--ui-color-primary`, `--ui-color-border`, `--ui-color-muted`) as values.

## Standard Stack

This phase requires no new libraries or dependencies.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| N/A | - | CSS custom properties only | Native CSS, no runtime dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | - | - |

**No installation required** - this phase only adds CSS to existing files.

## Architecture Patterns

### Recommended Token Location
```
packages/core/src/styles/
├── tailwind.css           # Add tokens to :root {} block (lines 206-312)
└── host-defaults.css      # No changes needed
```

### Pattern 1: Component Token Block Structure
**What:** Group related tokens with section comments, following existing Button/Dialog patterns
**When to use:** Always for component tokens
**Example:**
```css
/* Source: existing tailwind.css Button and Dialog patterns (lines 234-311) */
:root {
  /* -------------------------------------------------------------------------
   * Input Component
   * ------------------------------------------------------------------------- */

  /* Layout */
  --ui-input-radius: 0.375rem;
  --ui-input-border-width: 1px;

  /* Size variants - sm */
  --ui-input-padding-x-sm: 0.75rem;
  --ui-input-padding-y-sm: 0.375rem;
  --ui-input-font-size-sm: 0.875rem;

  /* etc... */
}
```

### Pattern 2: Semantic Token Referencing
**What:** Component tokens reference semantic tokens with fallback chain
**When to use:** For all color values
**Example:**
```css
/* Source: existing tailwind.css lines 260-283 (button variant colors) */
/* Pattern: var(--color-*, var(--ui-color-*)) allows user override */
--ui-input-border: var(--color-border, var(--ui-color-border));
--ui-input-border-focus: var(--color-ring, var(--ui-color-ring));
--ui-input-border-error: var(--color-destructive, var(--ui-color-destructive));
```

### Pattern 3: State Token Naming (State-Last)
**What:** Property first, then state suffix (per CONTEXT.md decision)
**When to use:** All state-specific tokens
**Example:**
```css
/* Source: CONTEXT.md decisions - state-last pattern */
/* Base state - no suffix (implicit default) */
--ui-input-border: ...;
--ui-input-bg: ...;
--ui-input-text: ...;

/* Focus state */
--ui-input-border-focus: ...;
--ui-input-bg-focus: ...;

/* Error state */
--ui-input-border-error: ...;
--ui-input-bg-error: ...;
--ui-input-text-error: ...;

/* Disabled state */
--ui-input-border-disabled: ...;
--ui-input-bg-disabled: ...;
--ui-input-text-disabled: ...;
```

### Pattern 4: Size Variant Tokens
**What:** Separate tokens for each size variant (sm, md, lg)
**When to use:** Padding, font-size, gap values
**Example:**
```css
/* Source: existing tailwind.css lines 249-258 (button size tokens) */
/* Small */
--ui-input-padding-x-sm: 0.75rem;
--ui-input-padding-y-sm: 0.375rem;
--ui-input-font-size-sm: 0.875rem;

/* Medium (default) */
--ui-input-padding-x-md: 1rem;
--ui-input-padding-y-md: 0.5rem;
--ui-input-font-size-md: 1rem;

/* Large */
--ui-input-padding-x-lg: 1.25rem;
--ui-input-padding-y-lg: 0.75rem;
--ui-input-font-size-lg: 1.125rem;
```

### Anti-Patterns to Avoid
- **Hardcoding color values:** Always reference semantic tokens
- **Creating new semantic tokens:** Use existing `--ui-color-*` tokens
- **Adding dark mode overrides for component tokens:** Semantic tokens already handle dark mode
- **Using `-default` suffix:** Per CONTEXT.md, base state has no suffix

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error color | Hardcoded red value | `var(--ui-color-destructive)` | Maintains theme consistency |
| Focus ring color | New focus color | `var(--ui-color-ring)` | Matches button focus ring |
| Border color | Hardcoded gray | `var(--ui-color-border)` | Responds to dark mode |
| Disabled background | Hardcoded gray | `var(--ui-color-muted)` | Consistent disabled styling |

**Key insight:** All color values should reference existing semantic tokens. The semantic tokens already have dark mode handling in the `.dark {}` block, so component tokens inherit dark mode support automatically.

## Common Pitfalls

### Pitfall 1: Forgetting the Fallback Chain
**What goes wrong:** Component tokens fail when user hasn't defined `--color-*` variables
**Why it happens:** Only using `var(--color-border)` without fallback
**How to avoid:** Always use two-level fallback: `var(--color-*, var(--ui-color-*))`
**Warning signs:** Colors missing or transparent in fresh projects

### Pitfall 2: Adding Dark Mode Overrides for Component Tokens
**What goes wrong:** Duplicate dark mode handling, potential conflicts
**Why it happens:** Thinking component tokens need their own dark mode values
**How to avoid:** Reference semantic tokens only - they already handle dark mode
**Warning signs:** Component tokens appear in both `:root` and `.dark` blocks

### Pitfall 3: Inconsistent Token Naming
**What goes wrong:** Tokens don't match established patterns, hard to discover
**Why it happens:** Not following existing Button/Dialog naming conventions
**How to avoid:** Check existing patterns before creating new tokens
**Warning signs:** Token names don't match `--ui-{component}-{property}[-{variant}][-{state}]` pattern

### Pitfall 4: Missing Placeholder Token
**What goes wrong:** No way to style placeholder text separately from input text
**Why it happens:** Overlooking placeholder as a separate styling concern
**How to avoid:** Include `--ui-input-placeholder` token per CONTEXT.md decision
**Warning signs:** Placeholder uses same color as input text

## Code Examples

### Complete Input Token Block
```css
/* Source: Based on existing Button tokens (tailwind.css lines 234-284) */
:root {
  /* -------------------------------------------------------------------------
   * Input Component
   * ------------------------------------------------------------------------- */

  /* Layout */
  --ui-input-radius: 0.375rem; /* --radius-md */
  --ui-input-border-width: 1px;

  /* Typography */
  --ui-input-font-size-sm: 0.875rem;
  --ui-input-font-size-md: 1rem;
  --ui-input-font-size-lg: 1.125rem;

  /* Spacing - Small */
  --ui-input-padding-x-sm: 0.75rem;
  --ui-input-padding-y-sm: 0.375rem;

  /* Spacing - Medium */
  --ui-input-padding-x-md: 1rem;
  --ui-input-padding-y-md: 0.5rem;

  /* Spacing - Large */
  --ui-input-padding-x-lg: 1.25rem;
  --ui-input-padding-y-lg: 0.75rem;

  /* Default state colors */
  --ui-input-bg: white;
  --ui-input-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-input-border: var(--color-border, var(--ui-color-border));
  --ui-input-placeholder: var(--color-muted-foreground, var(--ui-color-muted-foreground));

  /* Focus state colors */
  --ui-input-border-focus: var(--color-ring, var(--ui-color-ring));
  --ui-input-ring: var(--color-ring, var(--ui-color-ring));

  /* Error state colors */
  --ui-input-border-error: var(--color-destructive, var(--ui-color-destructive));
  --ui-input-text-error: var(--color-destructive, var(--ui-color-destructive));

  /* Disabled state colors */
  --ui-input-bg-disabled: var(--color-muted, var(--ui-color-muted));
  --ui-input-text-disabled: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-input-border-disabled: var(--color-border, var(--ui-color-border));
}
```

### Complete Textarea Token Block
```css
/* Source: Based on Input pattern above */
:root {
  /* -------------------------------------------------------------------------
   * Textarea Component
   * ------------------------------------------------------------------------- */

  /* Layout */
  --ui-textarea-radius: 0.375rem; /* --radius-md */
  --ui-textarea-border-width: 1px;
  --ui-textarea-min-height: 5rem;

  /* Typography */
  --ui-textarea-font-size-sm: 0.875rem;
  --ui-textarea-font-size-md: 1rem;
  --ui-textarea-font-size-lg: 1.125rem;

  /* Spacing - Small */
  --ui-textarea-padding-x-sm: 0.75rem;
  --ui-textarea-padding-y-sm: 0.375rem;

  /* Spacing - Medium */
  --ui-textarea-padding-x-md: 1rem;
  --ui-textarea-padding-y-md: 0.5rem;

  /* Spacing - Large */
  --ui-textarea-padding-x-lg: 1.25rem;
  --ui-textarea-padding-y-lg: 0.75rem;

  /* Default state colors - same pattern as Input */
  --ui-textarea-bg: white;
  --ui-textarea-text: var(--color-foreground, var(--ui-color-foreground));
  --ui-textarea-border: var(--color-border, var(--ui-color-border));
  --ui-textarea-placeholder: var(--color-muted-foreground, var(--ui-color-muted-foreground));

  /* Focus state colors */
  --ui-textarea-border-focus: var(--color-ring, var(--ui-color-ring));
  --ui-textarea-ring: var(--color-ring, var(--ui-color-ring));

  /* Error state colors */
  --ui-textarea-border-error: var(--color-destructive, var(--ui-color-destructive));
  --ui-textarea-text-error: var(--color-destructive, var(--ui-color-destructive));

  /* Disabled state colors */
  --ui-textarea-bg-disabled: var(--color-muted, var(--ui-color-muted));
  --ui-textarea-text-disabled: var(--color-muted-foreground, var(--ui-color-muted-foreground));
  --ui-textarea-border-disabled: var(--color-border, var(--ui-color-border));
}
```

### Token TypeScript Export Update
```typescript
/* Source: Based on existing tokens/index.ts pattern */
// Add to packages/core/src/tokens/index.ts

export const tokens = {
  // ... existing tokens ...

  input: {
    // Layout
    radius: 'var(--ui-input-radius)',
    borderWidth: 'var(--ui-input-border-width)',

    // Colors - default
    bg: 'var(--ui-input-bg)',
    text: 'var(--ui-input-text)',
    border: 'var(--ui-input-border)',
    placeholder: 'var(--ui-input-placeholder)',

    // Colors - focus
    borderFocus: 'var(--ui-input-border-focus)',
    ring: 'var(--ui-input-ring)',

    // Colors - error
    borderError: 'var(--ui-input-border-error)',
    textError: 'var(--ui-input-text-error)',

    // Colors - disabled
    bgDisabled: 'var(--ui-input-bg-disabled)',
    textDisabled: 'var(--ui-input-text-disabled)',
    borderDisabled: 'var(--ui-input-border-disabled)',

    // Sizes
    paddingXSm: 'var(--ui-input-padding-x-sm)',
    paddingYSm: 'var(--ui-input-padding-y-sm)',
    fontSizeSm: 'var(--ui-input-font-size-sm)',
    paddingXMd: 'var(--ui-input-padding-x-md)',
    paddingYMd: 'var(--ui-input-padding-y-md)',
    fontSizeMd: 'var(--ui-input-font-size-md)',
    paddingXLg: 'var(--ui-input-padding-x-lg)',
    paddingYLg: 'var(--ui-input-padding-y-lg)',
    fontSizeLg: 'var(--ui-input-font-size-lg)',
  },

  textarea: {
    // Same structure as input
    // ...
  },
} as const;
```

## Existing Semantic Token Values Reference

For Claude's discretion on exact values, reference these existing semantic tokens:

### Light Mode (`:root` block)
```css
/* Source: tailwind.css lines 218-232 */
--ui-color-primary: oklch(0.62 0.18 250);           /* brand-500 - focus ring */
--ui-color-destructive: oklch(0.637 0.237 25.331); /* red-500 - error */
--ui-color-muted: oklch(0.967 0.003 264.542);      /* gray-100 - disabled bg */
--ui-color-muted-foreground: oklch(0.551 0.027 264.364); /* gray-500 - placeholder */
--ui-color-foreground: oklch(0.13 0.028 261.692);  /* gray-950 - text */
--ui-color-border: oklch(0.928 0.006 264.531);     /* gray-200 - border */
--ui-color-ring: oklch(0.70 0.15 250);             /* brand-400 - focus ring */
```

### Dark Mode (`.dark` block auto-inherits via semantic tokens)
The component tokens reference semantic tokens, which already have dark mode values:
- Border: `--color-border` maps to `var(--color-gray-800)` in dark mode
- Muted: `--color-muted` maps to `var(--color-gray-800)` in dark mode
- Destructive: Uses `oklch(0.55 0.22 25)` in dark mode

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline styles | CSS custom properties | v3.0 | Theme customization via tokens |
| Component-level dark mode | Semantic token inheritance | v3.0 | Single source of truth for dark mode |
| Hardcoded colors | Semantic token references | v3.0 | Automatic theme consistency |

**Current best practices:**
- All component tokens live in `:root {}` block
- Colors reference semantic tokens with two-level fallback
- No component-specific dark mode overrides needed
- Size variants follow `-sm`, `-md`, `-lg` suffix pattern

## Open Questions

1. **Transition Duration Token**
   - What we know: CONTEXT.md gives Claude discretion on transition duration
   - Recommendation: Add `--ui-input-transition: 150ms` to match existing button transition (`transition-colors duration-150`)

2. **Ring Width Token**
   - What we know: Button uses `box-shadow: inset 0 0 0 2px` for focus ring
   - Recommendation: Consider adding `--ui-input-ring-width: 2px` for consistency, or use same hardcoded value

3. **Background Color for Dark Mode**
   - What we know: Default `--ui-input-bg: white` won't work in dark mode
   - Recommendation: Use `var(--color-background, white)` to inherit dark mode background, or add explicit `--ui-input-bg: var(--color-card, var(--ui-color-card))` to match dialog pattern

## Sources

### Primary (HIGH confidence)
- `/packages/core/src/styles/tailwind.css` - Existing token patterns, semantic colors, component tokens
- `/packages/core/src/tokens/index.ts` - TypeScript token export structure
- `/packages/button/src/button.ts` - Component token usage patterns
- `/packages/dialog/src/dialog.ts` - Component token usage patterns
- `.planning/phases/26-css-tokens-foundation/26-CONTEXT.md` - Locked decisions

### Secondary (MEDIUM confidence)
- `.planning/phases/21-theme-system-foundation/21-RESEARCH.md` - Theme system architecture context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, CSS-only changes
- Architecture: HIGH - Exact patterns established in existing codebase
- Token values: HIGH - Reference existing semantic tokens
- Pitfalls: MEDIUM - Based on existing patterns, may miss implementation-specific issues

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable domain, infrastructure only)
