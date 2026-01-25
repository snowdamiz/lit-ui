# Phase 21: Theme System Foundation - Research

**Researched:** 2026-01-25
**Domain:** Build-time theming infrastructure (OKLCH colors, URL encoding, CSS generation)
**Confidence:** HIGH

## Summary

This phase implements the foundational theming infrastructure for LitUI v3.0: a TypeScript token schema, URL encoding/decoding utilities, and CSS generation that produces Tailwind v4-compatible output. The research confirms that colorjs.io is the correct library for OKLCH color manipulation, Base64 URL encoding is suitable for configuration serialization, and Tailwind v4's `@theme` directive provides the integration point for generated CSS custom properties.

The existing codebase already uses OKLCH colors in `tailwind.css` and CSS custom properties for component theming (via `--ui-*` and `--color-*` namespaces). This phase builds the generation infrastructure that Phase 22 (CLI) and Phase 23 (Configurator) will consume.

**Primary recommendation:** Create a self-contained `theme/` module in the CLI package with schema types, encoding utilities, and CSS generation functions. Use colorjs.io for all OKLCH operations, including scale generation from base colors.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| colorjs.io | 0.5.2 | OKLCH color manipulation | Co-authored by CSS Color spec editors; native OKLCH support; perceptually uniform operations |
| zod | 3.25+ | Schema validation | TypeScript-first; automatic type inference; standard for config validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| defu | (existing) | Deep merge | Already in codebase via CLI; partial config merge with defaults |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| colorjs.io | culori | culori is smaller but colorjs.io has better OKLCH docs and CSS spec author credibility |
| Base64 JSON | lz-string compression | lz-string is 40-60% smaller but not human-readable; Base64 is debuggable with standard tools |
| zod | TypeScript interfaces only | Runtime validation catches malformed URL configs; prevents silent failures |

**Installation:**
```bash
pnpm add colorjs.io zod --filter lit-ui
```

## Architecture Patterns

### Recommended Project Structure
```
packages/cli/src/
├── theme/
│   ├── index.ts              # Public exports
│   ├── schema.ts             # Zod schema + TypeScript types
│   ├── defaults.ts           # Default theme constant (neutral gray)
│   ├── encoding.ts           # URL encoding/decoding utilities
│   ├── css-generator.ts      # CSS output generation
│   └── color-scale.ts        # OKLCH scale generation from base color
├── commands/
│   └── add.ts                # Will use --theme parameter (Phase 22)
└── ...
```

### Pattern 1: Token Schema with Base + Derived Colors
**What:** User provides 6 base colors; system auto-generates shade scales and dark mode
**When to use:** Always - this is the locked decision from CONTEXT.md
**Example:**
```typescript
// Source: CONTEXT.md decisions
interface ThemeConfig {
  version: 1;
  colors: {
    primary: string;      // OKLCH string e.g., "oklch(0.62 0.18 250)"
    secondary: string;
    destructive: string;
    background: string;
    foreground: string;
    muted: string;
  };
  radius: 'sm' | 'md' | 'lg';  // Scale affecting all components
}
```

### Pattern 2: OKLCH Scale Generation
**What:** Generate 10-step shade scale from single base color by adjusting lightness
**When to use:** For generating semantic color variations (hover, active, foreground)
**Example:**
```typescript
// Source: colorjs.io docs + OKLCH best practices
import Color from 'colorjs.io';

function generateScale(baseColor: string): Record<string, string> {
  const color = new Color(baseColor);
  const baseL = color.oklch.l;
  const baseC = color.oklch.c;
  const baseH = color.oklch.h;

  // Generate scale with lightness progression
  // Chroma modulated via sine wave to prevent oversaturation at extremes
  return {
    50: new Color('oklch', [0.97, baseC * 0.1, baseH]).toString(),
    100: new Color('oklch', [0.94, baseC * 0.2, baseH]).toString(),
    // ... continue through 900
    500: new Color('oklch', [baseL, baseC, baseH]).toString(),  // Base
    900: new Color('oklch', [0.28, baseC * 0.8, baseH]).toString(),
  };
}
```

### Pattern 3: Dark Mode Auto-Derivation
**What:** Invert lightness values for dark mode while preserving hue identity
**When to use:** Automatically generating dark mode from light mode colors
**Example:**
```typescript
// Source: OKLCH perceptual uniformity research
function deriveDarkMode(lightColor: string): string {
  const color = new Color(lightColor);
  // Invert lightness around 0.5 midpoint
  const darkL = 1 - color.oklch.l;
  // Slightly reduce chroma for dark mode (looks better on dark backgrounds)
  const darkC = color.oklch.c * 0.9;
  return new Color('oklch', [darkL, darkC, color.oklch.h]).toString();
}
```

### Pattern 4: Tailwind v4 CSS Output
**What:** Generate CSS using `@theme` for utility classes or `:root` for cascading variables
**When to use:** Output must integrate with user's Tailwind setup
**Example:**
```css
/* Source: Tailwind v4 docs - theme variables */
/* Generated CSS injected into user's tailwind.css */

/* =============================================================================
 * LitUI Theme Variables
 * Generated by: npx lit-ui add button --theme=<encoded>
 * ============================================================================= */

:root {
  /* Base semantic colors */
  --lui-primary: oklch(0.62 0.18 250);
  --lui-primary-foreground: oklch(0.98 0.01 250);
  --lui-secondary: oklch(0.92 0.02 250);
  /* ... */

  /* Component tokens reference semantic colors */
  --color-primary: var(--lui-primary);
  --color-primary-foreground: var(--lui-primary-foreground);
}

.dark {
  --lui-primary: oklch(0.75 0.15 250);
  --lui-primary-foreground: oklch(0.15 0.02 250);
  /* ... inverted values */
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --lui-primary: oklch(0.75 0.15 250);
    /* ... same as .dark */
  }
}
```

### Anti-Patterns to Avoid
- **RGB/HSL color manipulation:** OKLCH is perceptually uniform; HSL causes hue drift when adjusting lightness
- **Hand-rolled color math:** Use colorjs.io's battle-tested algorithms
- **Runtime theme switching:** Phase scope is build-time only; runtime is v3.1+ deferred
- **Exporting encoding utilities:** CONTEXT.md specifies CLI-internal only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OKLCH parsing/manipulation | Regex string parsing | colorjs.io | Edge cases (gamut mapping, achromatic colors, NaN hue) |
| Color scale generation | Linear interpolation | colorjs.io .steps() | Perceptual uniformity requires proper color science |
| URL-safe encoding | btoa/atob | Buffer.from().toString('base64url') | Handle non-ASCII, special chars, padding correctly |
| Schema validation | Manual type guards | Zod .safeParse() | Type inference, detailed error messages |
| Deep merge | Object.assign/spread | defu (existing in codebase) | Nested objects, undefined handling |

**Key insight:** Color manipulation appears simple but requires understanding of color science, gamut boundaries, and human perception. colorjs.io handles these complexities correctly.

## Common Pitfalls

### Pitfall 1: OKLCH Gamut Clipping
**What goes wrong:** Generated colors with high chroma fall outside sRGB gamut, causing visible clipping
**Why it happens:** OKLCH allows theoretically valid colors that no display can show
**How to avoid:** Check gamut and map colors to nearest displayable color before output
**Warning signs:** Colors look "flat" or different from expected when rendered
```typescript
// Prevention: Always check and map to sRGB gamut
const color = new Color('oklch', [l, c, h]);
if (!color.inGamut('srgb')) {
  color.toGamut('srgb');  // Map to nearest displayable color
}
```

### Pitfall 2: Base64 URL Characters
**What goes wrong:** Standard Base64 contains `+`, `/`, `=` which break URLs
**Why it happens:** Using btoa() or Buffer.toString('base64') instead of URL-safe variant
**How to avoid:** Use 'base64url' encoding or manually replace characters
**Warning signs:** Theme parameter causes 404s or partial parsing
```typescript
// Prevention: Use base64url encoding
const encoded = Buffer.from(JSON.stringify(config)).toString('base64url');
// This replaces +→- /→_ and removes padding =
```

### Pitfall 3: Achromatic Color Hue
**What goes wrong:** Gray colors (chroma = 0) have undefined hue, causing NaN in calculations
**Why it happens:** Mathematical definition - hue is meaningless without saturation
**How to avoid:** Handle NaN hue explicitly when generating scales
**Warning signs:** Color operations return NaN or throw errors for gray colors
```typescript
// Prevention: Default NaN hue to 0 or preserve original
const hue = isNaN(color.oklch.h) ? 0 : color.oklch.h;
```

### Pitfall 4: CSS Variable Circular References
**What goes wrong:** CSS fails to resolve when variables reference each other
**Why it happens:** Defining `--color-primary: var(--lui-primary)` before `--lui-primary` exists
**How to avoid:** Define base tokens first, then semantic mappings
**Warning signs:** Colors show as transparent or fallback values

### Pitfall 5: Version Mismatch in Encoded Configs
**What goes wrong:** Old encoded configs fail to parse with new schema
**Why it happens:** Schema evolves, encoded strings contain outdated structure
**How to avoid:** Include version field in config, migrate on decode
**Warning signs:** "Invalid config" errors for previously working URLs

## Code Examples

Verified patterns from official sources:

### Creating and Manipulating OKLCH Colors
```typescript
// Source: colorjs.io docs
import Color from 'colorjs.io';

// Create from OKLCH values
const primary = new Color('oklch', [0.62, 0.18, 250]);

// Access components
console.log(primary.oklch.l);  // 0.62 (lightness)
console.log(primary.oklch.c);  // 0.18 (chroma)
console.log(primary.oklch.h);  // 250 (hue degrees)

// Modify components
primary.oklch.l = 0.8;  // Lighten
primary.oklch.c *= 1.2; // Increase saturation

// Output as CSS string
console.log(primary.toString());  // "oklch(0.8 0.216 250)"
```

### Generating Color Range/Steps
```typescript
// Source: colorjs.io interpolation docs
import Color from 'colorjs.io';

const light = new Color('oklch', [0.95, 0.02, 250]);
const dark = new Color('oklch', [0.25, 0.15, 250]);

// Generate 10 steps
const scale = light.steps(dark, {
  space: 'oklch',
  steps: 10,
  outputSpace: 'oklch'
});

scale.forEach((color, i) => {
  console.log(`${(i + 1) * 100}: ${color.toString()}`);
});
```

### Zod Schema with Type Inference
```typescript
// Source: Zod docs
import { z } from 'zod';

const themeConfigSchema = z.object({
  version: z.literal(1),
  colors: z.object({
    primary: z.string().regex(/^oklch\([^)]+\)$/),
    secondary: z.string().regex(/^oklch\([^)]+\)$/),
    destructive: z.string().regex(/^oklch\([^)]+\)$/),
    background: z.string().regex(/^oklch\([^)]+\)$/),
    foreground: z.string().regex(/^oklch\([^)]+\)$/),
    muted: z.string().regex(/^oklch\([^)]+\)$/),
  }),
  radius: z.enum(['sm', 'md', 'lg']),
});

// Type inference
type ThemeConfig = z.infer<typeof themeConfigSchema>;

// Safe parsing with error handling
const result = themeConfigSchema.safeParse(input);
if (!result.success) {
  throw new Error(`Invalid theme config: ${result.error.message}`);
}
const config: ThemeConfig = result.data;
```

### URL Encoding/Decoding
```typescript
// Source: Node.js Buffer docs + CONTEXT.md decision (Base64 JSON)
function encodeThemeConfig(config: ThemeConfig): string {
  const json = JSON.stringify(config);
  return Buffer.from(json, 'utf-8').toString('base64url');
}

function decodeThemeConfig(encoded: string): ThemeConfig {
  const json = Buffer.from(encoded, 'base64url').toString('utf-8');
  const parsed = JSON.parse(json);

  const result = themeConfigSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid theme config: ${result.error.message}`);
  }
  return result.data;
}
```

### CSS Generation with Comments
```typescript
// Source: CONTEXT.md decisions + existing tailwind.css patterns
function generateThemeCSS(config: ThemeConfig): string {
  const { colors, radius } = config;

  const radiusValues = {
    sm: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem' },
    md: { sm: '0.125rem', md: '0.375rem', lg: '0.5rem' },
    lg: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
  };

  return `/* =============================================================================
 * LitUI Theme Configuration
 * Generated: ${new Date().toISOString()}
 *
 * Customize by editing values below or regenerate with configurator:
 * https://lit-ui.dev/themes
 * ============================================================================= */

:root {
  /* Primary - Main brand color */
  --lui-primary: ${colors.primary};
  --lui-primary-foreground: ${deriveForeground(colors.primary)};

  /* Secondary - Subtle backgrounds */
  --lui-secondary: ${colors.secondary};
  --lui-secondary-foreground: ${deriveForeground(colors.secondary)};

  /* ... additional colors ... */

  /* Border radius scale */
  --lui-radius-sm: ${radiusValues[radius].sm};
  --lui-radius-md: ${radiusValues[radius].md};
  --lui-radius-lg: ${radiusValues[radius].lg};
}

/* Dark mode - class-based */
.dark {
  --lui-primary: ${deriveDarkMode(colors.primary)};
  /* ... */
}

/* Dark mode - system preference */
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --lui-primary: ${deriveDarkMode(colors.primary)};
    /* ... */
  }
}
`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HSL color manipulation | OKLCH perceptual uniform | 2023-2024 | No hue drift, predictable lightness |
| JavaScript Tailwind config | CSS-based @theme directive | Tailwind v4 (2024) | CSS-first, no build config |
| lz-string compression | Base64url (project decision) | N/A | Debuggable, standard tools |
| Runtime theme switching | Build-time CSS generation | Project v3.0 decision | Simpler, SSR-compatible |

**Deprecated/outdated:**
- `tailwind.config.js` JavaScript configuration - replaced by CSS @theme in v4
- HSL/RGB for palette generation - OKLCH provides perceptual uniformity
- btoa/atob for URL encoding - use Buffer with 'base64url' encoding

## Open Questions

Things that couldn't be fully resolved:

1. **Schema Versioning Strategy**
   - What we know: Version field should be included, Verzod library exists for migrations
   - What's unclear: Whether to use simple version number or semver string
   - Recommendation: Start with `version: 1` literal, add migration logic when v2 needed

2. **Exact Neutral Gray OKLCH Values**
   - What we know: Need minimal chroma, balanced lightness
   - What's unclear: Precise values for 6 base colors
   - Recommendation: Reference existing ShadCN/Tailwind gray scales, test visually

3. **Scale Generation Algorithm Details**
   - What we know: Lightness progression 10-100%, sine wave chroma modulation
   - What's unclear: Exact sine parameters, number of steps (10 vs 11)
   - Recommendation: Start with documented patterns, adjust based on visual testing

## Sources

### Primary (HIGH confidence)
- [colorjs.io documentation](https://colorjs.io/docs/) - OKLCH manipulation, interpolation, gamut mapping
- [Tailwind CSS v4 theme docs](https://tailwindcss.com/docs/theme) - @theme directive, CSS variables
- [Zod documentation](https://zod.dev/) - Schema definition, validation, type inference
- Existing codebase: `/packages/core/src/styles/tailwind.css` - Current token patterns

### Secondary (MEDIUM confidence)
- [Evil Martians OKLCH article](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) - Why OKLCH, perceptual uniformity
- [CSS-Tricks oklch() reference](https://css-tricks.com/almanac/functions/o/oklch/) - OKLCH channel ranges
- [SuperGeekery OKLCH scales](https://supergeekery.com/blog/create-mathematically-generated-css-color-schemes-with-oklch) - Scale generation algorithm
- [lz-string GitHub](https://github.com/pieroxy/lz-string) - Compression vs Base64 tradeoffs

### Tertiary (LOW confidence)
- Various color palette generators - Algorithm inspiration only, verify before implementing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - colorjs.io, zod are well-documented with official sources
- Architecture: HIGH - Patterns follow existing codebase conventions + official Tailwind v4 docs
- Pitfalls: MEDIUM - Based on documented edge cases + search results, may miss project-specific issues

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable domain, libraries mature)
