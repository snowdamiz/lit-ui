# Phase 23: Visual Configurator Core - Research

**Researched:** 2026-01-25
**Domain:** React visual color configuration UI with OKLCH/hex conversion and live preview
**Confidence:** HIGH

## Summary

This phase builds a visual theme configurator page for the docs site. The configurator needs: (1) color pickers with hue slider and saturation square per the locked decisions, (2) OKLCH/hex bidirectional conversion leveraging the existing colorjs.io library, (3) live preview of Button and Dialog components, and (4) light/dark mode derivation with override capabilities.

The existing codebase already provides the heavy lifting: `colorjs.io` for OKLCH operations, `generateThemeCSS()` for CSS output, and `encodeThemeConfig()` for URL encoding. The configurator's job is to provide a React-based UI that manipulates a `ThemeConfig` object and injects the generated CSS for live preview.

**Primary recommendation:** Use `@uiw/react-color` for color picker components (Saturation, Hue, and EditableInput separately) with colorjs.io for OKLCH/hex conversion, React Context for state management, and CSS custom property injection for live preview.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @uiw/react-color-saturation | latest | Saturation square picker | Modular, separate components, HSV-native, lightweight |
| @uiw/react-color-hue | latest | Hue slider | Same library family, consistent API with saturation |
| @uiw/react-color-editable-input | latest | Hex input field | Integrated with same color state, handles validation |
| @uiw/react-color-swatch | latest | Tailwind palette swatches | Click-to-select presets |
| colorjs.io | 0.5.2 (existing) | OKLCH/hex/HSV conversion | Already in codebase, industry standard by CSS spec editors |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @uiw/color-convert | latest | HSV to hex utilities | Bundled with @uiw/react-color components |
| lucide-react | existing | Icons (reset, copy) | Already in docs site |
| React Context | built-in | Theme state management | Global configurator state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @uiw/react-color | react-colorful | react-colorful is smaller (2.8KB) but lacks separate Saturation/Hue exports for custom layout |
| @uiw/react-color | react-color (casesandberg) | Older, larger bundle, less maintained |
| Context API | Zustand | Overkill for single-page state, adds dependency |

**Installation:**
```bash
npm install @uiw/react-color-saturation @uiw/react-color-hue @uiw/react-color-editable-input @uiw/react-color-swatch
```

Note: colorjs.io is already installed in @lit-ui/cli package. The docs site will need to import it or expose utility functions.

## Architecture Patterns

### Recommended Project Structure
```
apps/docs/src/
├── pages/
│   └── configurator/
│       └── ConfiguratorPage.tsx    # Main page component
├── components/
│   └── configurator/
│       ├── ConfiguratorLayout.tsx  # Sidebar + preview layout
│       ├── ColorPickerGroup.tsx    # Single color with saturation/hue/input
│       ├── ColorSection.tsx        # Grouped colors (Primary/Secondary/Destructive)
│       ├── ThemePreview.tsx        # Live component preview area
│       ├── ModeToggle.tsx          # Light/dark mode switch
│       ├── RadiusSelector.tsx      # Border radius sm/md/lg
│       ├── TailwindSwatches.tsx    # Palette quick-select
│       ├── GetCommandModal.tsx     # CLI output modal
│       └── ResetButton.tsx         # Per-color reset icon
├── contexts/
│   └── ConfiguratorContext.tsx     # Theme state and actions
└── utils/
    └── color-utils.ts              # OKLCH/hex/HSV conversions
```

### Pattern 1: Configurator Context Pattern
**What:** Central React Context managing entire theme state with derived values
**When to use:** For any component that needs to read or modify theme values
**Example:**
```typescript
// Source: React Context best practices + existing codebase patterns

interface ConfiguratorState {
  // Active editing mode
  activeMode: 'light' | 'dark';

  // Light mode colors (primary source when editing light)
  lightColors: {
    primary: string;      // OKLCH format
    secondary: string;
    destructive: string;
    background: string;
    foreground: string;
    muted: string;
  };

  // Dark mode colors (derived or overridden)
  darkColors: {
    primary: string;
    secondary: string;
    destructive: string;
    background: string;
    foreground: string;
    muted: string;
  };

  // Track which dark colors are manually overridden
  darkOverrides: Set<keyof ConfiguratorState['darkColors']>;

  // Border radius
  radius: 'sm' | 'md' | 'lg';
}

interface ConfiguratorActions {
  setActiveMode: (mode: 'light' | 'dark') => void;
  setLightColor: (key: string, oklch: string) => void;
  setDarkColor: (key: string, oklch: string) => void;  // marks as override
  resetDarkColor: (key: string) => void;  // removes override, re-derives
  setRadius: (radius: 'sm' | 'md' | 'lg') => void;
  getThemeConfig: () => ThemeConfig;  // for encoding
  getGeneratedCSS: () => string;      // for preview injection
}
```

### Pattern 2: Color Conversion Bridge
**What:** Utility layer bridging picker HSV format to internal OKLCH format
**When to use:** Every color picker interaction
**Example:**
```typescript
// Source: colorjs.io API + existing color-scale.ts patterns
import Color from 'colorjs.io';

// HSV from picker -> OKLCH for storage
export function hsvToOklch(hsv: { h: number; s: number; v: number }): string {
  // Create HSV color (colorjs.io uses 0-1 for s/v)
  const color = new Color('hsv', [hsv.h, hsv.s / 100, hsv.v / 100]);

  // Convert to OKLCH
  const oklch = color.to('oklch');

  // Format as string (matches existing schema format)
  const l = Number(oklch.oklch.l.toFixed(2));
  const c = Number(oklch.oklch.c.toFixed(2));
  const h = Number.isNaN(oklch.oklch.h) ? 0 : Math.round(oklch.oklch.h);

  return `oklch(${l} ${c} ${h})`;
}

// OKLCH from storage -> HSV for picker
export function oklchToHsv(oklchString: string): { h: number; s: number; v: number } {
  const color = new Color(oklchString);
  const hsv = color.to('hsv');

  return {
    h: hsv.hsv.h || 0,
    s: (hsv.hsv.s || 0) * 100,
    v: (hsv.hsv.v || 0) * 100,
  };
}

// OKLCH -> Hex for display
export function oklchToHex(oklchString: string): string {
  const color = new Color(oklchString);
  return color.to('srgb').toString({ format: 'hex' });
}

// Hex from input -> OKLCH for storage
export function hexToOklch(hex: string): string {
  const color = new Color(hex);
  const oklch = color.to('oklch');

  const l = Number(oklch.oklch.l.toFixed(2));
  const c = Number(oklch.oklch.c.toFixed(2));
  const h = Number.isNaN(oklch.oklch.h) ? 0 : Math.round(oklch.oklch.h);

  return `oklch(${l} ${c} ${h})`;
}
```

### Pattern 3: Live Preview CSS Injection
**What:** Inject generated CSS into preview iframe or scoped container
**When to use:** Every time theme state changes
**Example:**
```typescript
// Source: CSS custom property patterns + existing generateThemeCSS

function ThemePreview() {
  const { getGeneratedCSS, activeMode } = useConfigurator();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;

    // Find or create style element
    let styleEl = previewRef.current.querySelector('#theme-preview-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-preview-styles';
      previewRef.current.prepend(styleEl);
    }

    // Inject generated CSS
    styleEl.textContent = getGeneratedCSS();
  }, [getGeneratedCSS]);

  return (
    <div
      ref={previewRef}
      className={activeMode === 'dark' ? 'dark' : ''}
    >
      {/* Preview components render here with theme applied */}
      <lui-button variant="primary">Primary</lui-button>
      <lui-button variant="secondary">Secondary</lui-button>
      {/* etc */}
    </div>
  );
}
```

### Pattern 4: Bidirectional Derivation
**What:** Derive non-active mode from active mode, with override tracking
**When to use:** When user edits light colors (derive dark) or dark colors (derive light)
**Example:**
```typescript
// Source: existing deriveDarkMode from color-scale.ts

// When editing light mode: derive dark mode for non-overridden colors
function deriveColors(
  sourceColors: Record<string, string>,
  direction: 'light-to-dark' | 'dark-to-light',
  overrides: Set<string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(sourceColors)) {
    if (overrides.has(key)) {
      // Keep existing override, don't re-derive
      continue;
    }

    if (direction === 'light-to-dark') {
      result[key] = deriveDarkMode(value);  // existing function
    } else {
      result[key] = deriveLightMode(value);  // inverse of deriveDarkMode
    }
  }

  return result;
}

// deriveLightMode: inverse of existing deriveDarkMode
function deriveLightMode(darkColor: string): string {
  const color = new Color(darkColor);

  // Invert lightness (same algorithm, just reverse)
  const lightLightness = 1 - color.oklch.l;

  // Restore chroma (dark mode reduces by 0.9, so divide)
  const lightChroma = color.oklch.c / 0.9;

  const hue = Number.isNaN(color.oklch.h) ? 0 : color.oklch.h;

  const lightColor = new Color('oklch', [lightLightness, lightChroma, hue]);

  if (!lightColor.inGamut('srgb')) {
    lightColor.toGamut('srgb');
  }

  // Format output
  const l = Number(lightColor.oklch.l.toFixed(2));
  const c = Number(lightColor.oklch.c.toFixed(2));
  const h = Number.isNaN(lightColor.oklch.h) ? 0 : Math.round(lightColor.oklch.h);

  return `oklch(${l} ${c} ${h})`;
}
```

### Anti-Patterns to Avoid
- **Prop drilling theme state:** Use Context, not passing state through 5+ levels
- **Re-rendering entire tree on color change:** Memoize components, use selectors
- **Storing hex instead of OKLCH:** Internal state must be OKLCH; hex is display-only
- **Mutating state directly:** Always use immutable updates for React state
- **Blocking UI on color conversion:** colorjs.io is fast, but batch updates if needed

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Saturation/value picker UI | Custom canvas/drag implementation | @uiw/react-color-saturation | Touch support, accessibility, edge cases |
| Hue slider | Custom range input | @uiw/react-color-hue | Consistent with saturation, proper gradient |
| Color space conversion | Manual math | colorjs.io | Gamut mapping, precision, spec compliance |
| Hex input validation | Regex parsing | @uiw/react-color-editable-input or colorjs.io | Edge cases (3-char hex, case, prefix) |
| CSS variable injection | Manual DOM manipulation | React useEffect with style element | React lifecycle management |

**Key insight:** Color manipulation is deceptively complex. Gamut mapping (what happens when OKLCH color is outside sRGB) requires proper algorithms. colorjs.io handles this correctly; hand-rolled solutions often produce artifacts or invalid colors.

## Common Pitfalls

### Pitfall 1: HSV/HSL vs HSV/HSB Confusion
**What goes wrong:** Different libraries use different color models. HSL and HSV/HSB are NOT the same. Saturation means different things.
**Why it happens:** UI picker components often use HSV (value), but CSS uses HSL (lightness).
**How to avoid:** Always convert through colorjs.io which handles all models correctly. Never assume direct mapping.
**Warning signs:** Colors look washed out or oversaturated after conversion.

### Pitfall 2: Out-of-Gamut OKLCH Colors
**What goes wrong:** User picks a very saturated OKLCH color that doesn't exist in sRGB. Hex conversion produces wrong color.
**Why it happens:** OKLCH can represent colors outside sRGB gamut.
**How to avoid:** Use colorjs.io's gamut mapping: `color.toGamut('srgb')` before hex conversion.
**Warning signs:** Hex value changes when you convert OKLCH -> hex -> OKLCH.

### Pitfall 3: Dark Mode Derivation Drift
**What goes wrong:** User overrides one dark color, edits light colors, derivation partially runs, states become inconsistent.
**Why it happens:** Complex state interactions between modes and overrides.
**How to avoid:** Clear state model: track overrides explicitly, only derive non-overridden colors.
**Warning signs:** Reset button doesn't restore expected value; colors don't match between modes.

### Pitfall 4: Performance on Rapid Color Changes
**What goes wrong:** Dragging color picker causes lag due to re-renders and CSS regeneration.
**Why it happens:** Every pixel of drag triggers state update, context re-render, CSS generation.
**How to avoid:** Debounce or throttle CSS regeneration (not state updates). Use `useDeferredValue` or `requestAnimationFrame`.
**Warning signs:** Noticeable lag when dragging saturation picker.

### Pitfall 5: Hex Input Edge Cases
**What goes wrong:** User types "f00" (3-char), "#FF0000" (with hash), or "rgb(255,0,0)" - input breaks.
**Why it happens:** Inconsistent input normalization.
**How to avoid:** colorjs.io's Color constructor accepts all these formats. Normalize on blur, not on every keystroke.
**Warning signs:** Error when pasting color values from design tools.

### Pitfall 6: Preview Components Not Updating
**What goes wrong:** Lit components in preview don't reflect CSS variable changes.
**Why it happens:** Shadow DOM doesn't inherit from injected style element if scoping is wrong.
**How to avoid:** Inject styles into :root (document level) since components use CSS custom properties that cascade into Shadow DOM via inheritance.
**Warning signs:** Button colors don't change when picker moves.

## Code Examples

### Color Picker Group Component
```tsx
// Source: @uiw/react-color API + project patterns
import { useState, useCallback, useMemo } from 'react';
import Saturation from '@uiw/react-color-saturation';
import Hue from '@uiw/react-color-hue';
import { EditableInput } from '@uiw/react-color-editable-input';
import { RotateCcw } from 'lucide-react';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { oklchToHsv, hsvToOklch, oklchToHex, hexToOklch } from '../utils/color-utils';

interface ColorPickerGroupProps {
  colorKey: 'primary' | 'secondary' | 'destructive' | 'background' | 'foreground' | 'muted';
  label: string;
}

export function ColorPickerGroup({ colorKey, label }: ColorPickerGroupProps) {
  const {
    activeMode,
    lightColors,
    darkColors,
    darkOverrides,
    setLightColor,
    setDarkColor,
    resetDarkColor
  } = useConfigurator();

  // Get current OKLCH value based on active mode
  const oklchValue = activeMode === 'light'
    ? lightColors[colorKey]
    : darkColors[colorKey];

  // Convert to formats needed by picker components
  const hsva = useMemo(() => {
    const hsv = oklchToHsv(oklchValue);
    return { ...hsv, a: 1 };
  }, [oklchValue]);

  const hexValue = useMemo(() => oklchToHex(oklchValue), [oklchValue]);

  // Is this dark color overridden (not derived)?
  const isOverridden = activeMode === 'dark' && darkOverrides.has(colorKey);

  // Handle color change from saturation/hue picker
  const handleColorChange = useCallback((newHsva: { h: number; s: number; v: number; a: number }) => {
    const oklch = hsvToOklch({ h: newHsva.h, s: newHsva.s, v: newHsva.v });

    if (activeMode === 'light') {
      setLightColor(colorKey, oklch);
    } else {
      setDarkColor(colorKey, oklch);  // marks as override
    }
  }, [activeMode, colorKey, setLightColor, setDarkColor]);

  // Handle hex input change
  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    try {
      const oklch = hexToOklch(hex);
      if (activeMode === 'light') {
        setLightColor(colorKey, oklch);
      } else {
        setDarkColor(colorKey, oklch);
      }
    } catch {
      // Invalid hex, ignore
    }
  }, [activeMode, colorKey, setLightColor, setDarkColor]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isOverridden && (
          <button
            onClick={() => resetDarkColor(colorKey)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Reset to derived value"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Saturation square */}
      <Saturation
        hsva={hsva}
        onChange={handleColorChange}
        style={{ width: '100%', height: 120 }}
      />

      {/* Hue slider */}
      <Hue
        hue={hsva.h}
        onChange={(newHue) => handleColorChange({ ...hsva, ...newHue })}
        style={{ width: '100%', height: 12 }}
      />

      {/* Hex input */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border border-gray-200"
          style={{ backgroundColor: hexValue }}
        />
        <input
          type="text"
          value={hexValue}
          onChange={handleHexChange}
          className="flex-1 px-2 py-1 text-sm font-mono border border-gray-200 rounded"
        />
        {isOverridden && (
          <span className="text-xs text-amber-600">custom</span>
        )}
      </div>
    </div>
  );
}
```

### Tailwind Swatches Component
```tsx
// Source: Tailwind default colors documentation
const TAILWIND_COLORS = {
  red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'],
  orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#431407'],
  yellow: ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12', '#422006'],
  green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'],
  blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
  purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87', '#3b0764'],
  pink: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#500724'],
  gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827', '#030712'],
};

interface TailwindSwatchesProps {
  onSelect: (hex: string) => void;
}

export function TailwindSwatches({ onSelect }: TailwindSwatchesProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">Quick Select</label>
      <div className="space-y-1">
        {Object.entries(TAILWIND_COLORS).map(([name, shades]) => (
          <div key={name} className="flex gap-0.5">
            {shades.map((hex, i) => (
              <button
                key={i}
                onClick={() => onSelect(hex)}
                className="w-4 h-4 rounded-sm border border-gray-200 hover:scale-125 transition-transform"
                style={{ backgroundColor: hex }}
                title={`${name}-${[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][i]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Get Command Modal
```tsx
// Source: existing Dialog component patterns + theme encoding
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { encodeThemeConfig } from '@lit-ui/cli/theme';

export function GetCommandModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { getThemeConfig } = useConfigurator();
  const [copied, setCopied] = useState(false);

  const config = getThemeConfig();
  const encoded = encodeThemeConfig(config);
  const command = `npx @lit-ui/cli init --theme=${encoded}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <lui-dialog open={open} onClose={onClose} show-close-button>
      <span slot="title">Get CLI Command</span>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Run this command to initialize your project with this theme:
        </p>
        <div className="relative">
          <pre className="p-3 bg-gray-900 text-gray-100 text-sm rounded-lg overflow-x-auto">
            {command}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div slot="footer">
        <lui-button variant="outline" onClick={onClose}>Close</lui-button>
      </div>
    </lui-dialog>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HSL for color manipulation | OKLCH for perceptual uniformity | 2023-2024 | More consistent saturation across hues |
| Redux for all state | Context + lightweight stores | 2023-2025 | Less boilerplate, better DX |
| Polling for live preview | CSS custom property injection | Always | Instant updates, no polling needed |
| Separate light/dark themes | Derived dark mode from light | 2024+ | Less manual work, consistent themes |

**Deprecated/outdated:**
- `react-color` (casesandberg): Older API, less maintained, larger bundle
- Manual CSS-in-JS for theming: CSS custom properties are simpler and more performant
- HSL-based color manipulation: OKLCH provides better perceptual results

## Open Questions

1. **URL sharing of theme state**
   - What we know: Prior decisions mention URL encoding with lz-string, but current encoding.ts uses base64url
   - What's unclear: Should configurator update URL in real-time, or only when "Get Command" is clicked?
   - Recommendation: Update URL hash on debounced state changes for shareability; this is separate from CLI command generation

2. **Accent color (mentioned in requirements)**
   - What we know: Requirements mention "accent" color, but current schema has 6 colors (primary, secondary, destructive, background, foreground, muted)
   - What's unclear: Is accent a new color to add, or is it covered by secondary/muted?
   - Recommendation: Check requirements - if accent is distinct from secondary, schema needs extending in a prior task

3. **Initial theme state**
   - What we know: defaultTheme exists in CLI package
   - What's unclear: Should configurator load from URL on mount, or always start with default?
   - Recommendation: Check URL hash first, fall back to default theme

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/cli/src/theme/` - schema, encoding, css-generator, color-scale
- Existing codebase: `apps/docs/src/` - page patterns, component patterns
- [colorjs.io API](https://colorjs.io/api/) - OKLCH conversion, gamut mapping

### Secondary (MEDIUM confidence)
- [@uiw/react-color GitHub](https://github.com/uiwjs/react-color) - Saturation, Hue, EditableInput component APIs
- [react-colorful GitHub](https://github.com/omgovich/react-colorful) - Alternative considered
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors) - Default palette values
- [lz-string GitHub](https://github.com/pieroxy/lz-string) - URL compression (if needed)

### Tertiary (LOW confidence)
- WebSearch results on color picker UX pitfalls - general guidance, not library-specific
- WebSearch results on React Context patterns - general patterns confirmed by docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against existing codebase and official docs
- Architecture: HIGH - patterns match existing docs site, verified Context API usage
- Pitfalls: MEDIUM - based on general color picker knowledge + colorjs.io docs
- Code examples: HIGH - based on official component APIs and existing codebase patterns

**Research date:** 2026-01-25
**Valid until:** 2026-02-24 (30 days - stable domain, no major version changes expected)
