# Stack Research: Theme Customization

**Project:** LitUI Theme Configurator
**Researched:** 2026-01-25
**Focus:** Visual theme configurator and build-time token customization

## Executive Summary

The theme customization feature requires additions in three areas:
1. **Color manipulation** - For OKLCH palette generation and conversion
2. **Token encoding** - For URL-safe config transmission via CLI
3. **UI components** - For the visual configurator on the docs site

The existing stack (Lit.js 3, Tailwind CSS v4, citty CLI, React docs site) provides strong foundations. Tailwind v4's CSS-first `@theme` directive and native CSS variable support align perfectly with the token generation approach.

## Recommended Additions

### 1. Color Manipulation: colorjs.io

| Attribute | Value |
|-----------|-------|
| Package | `colorjs.io` |
| Version | `^0.5.2` |
| Bundle size | ~40KB (tree-shakeable) |
| Purpose | OKLCH color manipulation, palette generation, gamut mapping |
| Install in | `apps/docs` (configurator), `packages/cli` (validation) |

**Why colorjs.io:**
- Created by CSS Color specification editors (Lea Verou, Chris Lilley)
- Native OKLCH support with proper gamut mapping (not naive clipping)
- Used by Sass, Open Props, and axe accessibility engine
- 119M+ npm downloads, actively maintained (updated Jan 2026)
- Comprehensive color space support matches Tailwind v4's OKLCH usage

**Palette generation approach:**
```javascript
import Color from 'colorjs.io';

function generatePalette(baseColor, steps = 11) {
  const base = new Color(baseColor);
  const palette = {};

  // Generate 50-950 scale with perceptually uniform lightness
  const lightnesses = [0.97, 0.94, 0.88, 0.79, 0.70, 0.62, 0.54, 0.46, 0.38, 0.28, 0.20];
  const names = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

  for (let i = 0; i < steps; i++) {
    const color = base.clone();
    color.oklch.l = lightnesses[i];
    // Adjust chroma based on lightness (sine curve for natural feel)
    color.oklch.c = base.oklch.c * Math.sin((i / (steps - 1)) * Math.PI);
    palette[names[i]] = color.toString({ format: 'oklch' });
  }

  return palette;
}
```

**Integration points:**
- Docs site configurator uses colorjs.io for live preview
- CLI uses colorjs.io to validate and normalize color values
- Generated CSS uses OKLCH format (already used in existing tailwind.css)

**Confidence:** HIGH - Verified via official docs and npm registry

### 2. Color Picker UI: react-colorful + colorjs.io bridge

| Attribute | Value |
|-----------|-------|
| Package | `react-colorful` |
| Version | `^5.6.1` |
| Bundle size | 2.8KB gzipped |
| Purpose | Lightweight color picker component |
| Install in | `apps/docs` only |

**Why react-colorful:**
- Extremely lightweight (2.8KB vs 13KB+ for react-color)
- Zero dependencies
- Tree-shakeable with 12 picker variants
- Works with React 18 (docs site uses React 18.3.1)
- TypeScript support built-in

**OKLCH integration pattern:**
react-colorful outputs RGB/HSL, so bridge with colorjs.io:

```tsx
import { RgbColorPicker } from 'react-colorful';
import Color from 'colorjs.io';

function OklchColorPicker({ value, onChange }) {
  // Convert OKLCH to RGB for picker
  const color = new Color(value);
  const rgb = color.to('srgb');

  const handleChange = (newRgb) => {
    const newColor = new Color('srgb', [newRgb.r/255, newRgb.g/255, newRgb.b/255]);
    onChange(newColor.toString({ format: 'oklch' }));
  };

  return (
    <RgbColorPicker
      color={{ r: rgb.r * 255, g: rgb.g * 255, b: rgb.b * 255 }}
      onChange={handleChange}
    />
  );
}
```

**Alternative considered:** `@terrazzo/use-color` - More OKLCH-native but heavier, less mature ecosystem.

**Confidence:** HIGH - Verified via npm registry, widely used

### 3. Token Encoding: lz-string

| Attribute | Value |
|-----------|-------|
| Package | `lz-string` |
| Version | `^1.5.0` |
| Bundle size | ~5KB |
| Purpose | URL-safe compression of token config |
| Install in | `apps/docs` (encode), `packages/cli` (decode) |

**Why lz-string:**
- Built-in `compressToEncodedURIComponent()` - produces URL-safe strings
- No need for additional base64url encoding
- 50-70% compression ratio for JSON
- 1145 projects depend on it, battle-tested
- Works in browser and Node.js identically

**Encoding flow:**
```javascript
import LZString from 'lz-string';

// In configurator (browser)
const config = {
  colors: {
    primary: 'oklch(0.62 0.18 250)',
    // ... other tokens
  },
  radius: '0.375rem',
  // ...
};
const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(config));
// Result: "N4IgJg9gxgDg..." (URL-safe, no encoding needed)

// Generated command:
// npx lit-ui add button --tokens=N4IgJg9gxgDg...
```

```javascript
// In CLI (Node.js)
import LZString from 'lz-string';

const config = JSON.parse(
  LZString.decompressFromEncodedURIComponent(args.tokens)
);
```

**Alternative considered:** `json-url` with LZMA - Better compression but slower, overkill for small token configs.

**Confidence:** HIGH - Verified via npm registry and documentation

### 4. CSS Generation: No additional library needed

**Approach:** Template literals with colorjs.io values

The CLI already uses embedded templates (per PROJECT.md key decisions). Extend this pattern:

```javascript
function generateTokensCss(config) {
  const { colors, spacing, radius, shadows } = config;

  return `/**
 * LitUI Design Tokens
 * Generated by lit-ui CLI
 */

@theme {
  /* Brand Colors */
${Object.entries(colors.brand).map(([key, value]) =>
  `  --color-brand-${key}: ${value};`
).join('\n')}

  /* Semantic Tokens */
  --color-primary: var(--color-brand-500);
  --color-primary-foreground: ${colors.primaryForeground};

  /* ... additional tokens */
}
`;
}
```

**Why no library:**
- Token structure is known and fixed
- Template literals are readable and maintainable
- No runtime overhead
- Matches existing CLI pattern (embedded templates)

**Confidence:** HIGH - Pattern already validated in existing CLI

## Integration Points

### With Existing Tailwind v4 Setup

Tailwind v4's `@theme` directive creates CSS variables automatically:
```css
@theme {
  --color-brand-500: oklch(0.62 0.18 250);
}
/* Tailwind generates: bg-brand-500, text-brand-500, etc. */
```

The generated `lit-ui-tokens.css` will:
1. Define primitive tokens (colors, spacing, radius)
2. Define semantic tokens (primary, secondary, destructive)
3. Import into user's Tailwind entry point: `@import "./lit-ui-tokens.css"`

### With Existing CLI (citty)

Extend the `add` command with a `--tokens` argument:

```javascript
// packages/cli/src/commands/add.ts
args: {
  // ... existing args
  tokens: {
    type: 'string',
    alias: 't',
    description: 'Encoded theme tokens from configurator',
  },
}
```

When `--tokens` is provided:
1. Decode with lz-string
2. Validate token structure
3. Generate `lit-ui-tokens.css` in user's styles directory
4. Continue with normal component installation

### With Docs Site (React + Vite)

New dependencies for `apps/docs/package.json`:
```json
{
  "dependencies": {
    "colorjs.io": "^0.5.2",
    "react-colorful": "^5.6.1",
    "lz-string": "^1.5.0"
  }
}
```

Configurator page structure:
```
apps/docs/src/pages/
  Configurator.tsx          # Main configurator page
  configurator/
    ColorSection.tsx        # Brand color picker
    TokenPreview.tsx        # Live CSS preview
    CommandOutput.tsx       # Generated npx command
    useTokenState.ts        # Token state management
```

## Not Recommended

### 1. Runtime Theme Switching Libraries

**Examples:** `next-themes`, `use-dark-mode`, CSS-in-JS solutions

**Why avoid:**
- Project explicitly scopes to build-time theming (PROJECT.md: "Out of Scope: Runtime theme switching")
- Adds JS runtime overhead
- Conflicts with SSR approach (Declarative Shadow DOM)
- Dark mode already handled via `.dark` class + CSS cascade

### 2. Full Design Token Platforms

**Examples:** `@tokens-studio/sd-transforms`, Style Dictionary, Theo

**Why avoid:**
- Overkill for single-library theming
- Adds build complexity
- Token structure is simple and known
- CLI already handles file generation

### 3. Standalone OKLCH Picker Components

**Examples:** `oklume`, `@evilmartians/oklch-picker` embed

**Why avoid:**
- Less control over UI integration
- Harder to match docs site styling
- react-colorful + colorjs.io gives same capability with more flexibility
- No additional dependencies beyond what's already needed

### 4. Heavy Compression Libraries

**Examples:** `pako` (gzip), `lzma-js`, `fflate`

**Why avoid:**
- Token configs are small (~500 bytes uncompressed)
- lz-string achieves 50-70% compression
- Simpler API with URL-safe output built-in
- No WASM or complex setup

### 5. React State Management Libraries

**Examples:** Zustand, Jotai, Redux for configurator state

**Why avoid:**
- Configurator is single-page, self-contained
- React useState + useReducer sufficient
- framer-motion already in docs for animations
- Keep bundle minimal

## Dependency Summary

### apps/docs (new dependencies)

```json
{
  "dependencies": {
    "colorjs.io": "^0.5.2",
    "react-colorful": "^5.6.1",
    "lz-string": "^1.5.0"
  }
}
```

**Total addition:** ~48KB (colorjs.io is tree-shakeable)

### packages/cli (new dependencies)

```json
{
  "dependencies": {
    "colorjs.io": "^0.5.2",
    "lz-string": "^1.5.0"
  }
}
```

**Note:** CLI bundles with tsup, so tree-shaking applies.

## Token Schema

Recommended structure for encoded config:

```typescript
interface TokenConfig {
  // Version for future compatibility
  v: 1;

  // Brand color (single hue, palette generated)
  brand: {
    h: number;  // Hue (0-360)
    c: number;  // Chroma (0-0.4)
  };

  // Semantic color overrides (optional)
  semantic?: {
    destructive?: string;  // OKLCH string
  };

  // Layout tokens
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // Typography (optional)
  font?: {
    sans?: string;
    mono?: string;
  };
}
```

**Example encoded size:**
- Raw JSON: ~200 bytes
- lz-string compressed: ~80 bytes
- URL-safe, no escaping needed

## Verification Checklist

- [x] colorjs.io version verified (0.5.2, updated Jan 2026)
- [x] react-colorful version verified (5.6.1, stable)
- [x] lz-string version verified (1.5.0, stable)
- [x] Tailwind v4 @theme syntax confirmed (CSS-first)
- [x] citty argument parsing confirmed (type: 'string' works)
- [x] OKLCH color space already in use (tailwind.css)
- [x] React 18 compatibility confirmed (docs site)

## Sources

### Official Documentation
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - CSS-first configuration
- [Color.js Documentation](https://colorjs.io/) - OKLCH manipulation API
- [citty GitHub](https://github.com/unjs/citty) - CLI argument parsing

### NPM Packages
- [colorjs.io on npm](https://www.npmjs.com/package/colorjs.io) - Version 0.5.2
- [react-colorful on npm](https://www.npmjs.com/package/react-colorful) - Version 5.6.1
- [lz-string on npm](https://www.npmjs.com/package/lz-string) - Version 1.5.0

### Color Science
- [OKLCH in CSS - Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) - Why OKLCH for design systems
- [OKLCH Color Picker](https://oklch.com/) - Reference implementation

### Patterns
- [Oklchroma - CSS Variable Generation](https://utilitybend.com/blog/oklchroma-an-oklch-color-pattern-generator-that-generates-css-variables) - Sine-wave chroma algorithm
- [Go Make Things - OKLCH Generation](https://gomakethings.com/generating-colors-with-the-css-oklch-function/) - Palette generation patterns
