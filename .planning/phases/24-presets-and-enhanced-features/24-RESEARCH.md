# Phase 24: Presets and Enhanced Features - Research

**Researched:** 2026-01-25
**Domain:** Theme presets, URL state sharing, CLI command generation, shade scale auto-generation
**Confidence:** HIGH

## Summary

Phase 24 builds upon the completed Phase 23 infrastructure to add preset themes, URL sharing, CLI command generation, and shade scale auto-calculation. The existing codebase already provides all the heavy lifting: `encodeThemeConfig()`/`decodeThemeConfig()` for URL-safe encoding, `generateScale()` for shade scale generation, and the `ConfiguratorContext` for state management.

The research confirms this phase is primarily about UI additions and wiring existing utilities together. The key components are: (1) preset theme definitions as `ThemeConfig` objects, (2) reading/writing URL search params with React Router 7's `useSearchParams`, (3) generating CLI commands using existing `getEncodedConfig()`, and (4) exposing `generateScale()` from CLI package for shade calculation.

**Primary recommendation:** Use existing infrastructure extensively. Define presets as `ThemeConfig` objects, use `useSearchParams` for URL state, and expose `generateScale()` to the configurator UI for shade derivation.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router | ^7.12.0 | useSearchParams for URL state | Already in docs app, React Router 7 standard |
| @lit-ui/cli/theme | existing | encodeThemeConfig, decodeThemeConfig, generateScale | Project's own encoding/decoding infrastructure |
| colorjs.io | 0.5.2 | OKLCH color operations | Already used throughout project |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | existing | Copy icon, check icon | UI icons for copy-to-clipboard |
| @uiw/react-color-* | existing | Color picker components | Already installed from Phase 23 |

### No New Dependencies Needed

The existing stack provides everything required:
- URL encoding/decoding: `encodeThemeConfig()` / `decodeThemeConfig()` from @lit-ui/cli/theme
- URL state management: `useSearchParams` from react-router
- Shade generation: `generateScale()` from @lit-ui/cli/theme (needs export)
- CLI commands: Already generated in `GetCommandModal.tsx`

## Architecture Patterns

### Recommended File Structure
```
apps/docs/src/
├── contexts/
│   └── ConfiguratorContext.tsx   # Add loadFromURL, updateURL methods
├── components/
│   └── configurator/
│       ├── PresetSelector.tsx    # NEW: Grid/list of preset themes
│       ├── ShadeScaleDisplay.tsx # NEW: Shows derived 50-950 shades
│       ├── ShareButton.tsx       # NEW: Copy URL button
│       └── GetCommandModal.tsx   # Existing (already complete)
├── data/
│   └── presets.ts                # NEW: Preset theme definitions
└── pages/
    └── configurator/
        └── ConfiguratorPage.tsx  # Add URL sync on mount/change
```

### Pattern 1: Preset Theme Definitions
**What:** Define preset themes as complete `ThemeConfig` objects
**When to use:** For the preset selector UI
**Example:**
```typescript
// Source: existing schema.ts ThemeConfig type
import type { ThemeConfig } from "@lit-ui/cli/theme";

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
}

export const presetThemes: PresetTheme[] = [
  {
    id: "default",
    name: "Default",
    description: "Neutral gray palette",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.45 0.03 250)",
        secondary: "oklch(0.92 0.02 250)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.98 0.01 250)",
        foreground: "oklch(0.15 0.02 250)",
        muted: "oklch(0.92 0.02 250)",
      },
      radius: "md",
    },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Dark mode optimized",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.7 0.15 250)",    // Brighter for dark backgrounds
        secondary: "oklch(0.25 0.02 250)",
        destructive: "oklch(0.65 0.2 25)",
        background: "oklch(0.15 0.01 250)",
        foreground: "oklch(0.95 0.01 250)",
        muted: "oklch(0.3 0.02 250)",
      },
      radius: "md",
    },
  },
  {
    id: "blue",
    name: "Blue",
    description: "Professional blue accent",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.22 250)",   // Vibrant blue (H=250)
        secondary: "oklch(0.92 0.05 250)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.98 0.01 250)",
        foreground: "oklch(0.15 0.02 250)",
        muted: "oklch(0.92 0.02 250)",
      },
      radius: "md",
    },
  },
  {
    id: "green",
    name: "Green",
    description: "Nature-inspired green",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.18 145)",   // Green (H=145)
        secondary: "oklch(0.92 0.05 145)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.98 0.01 145)",
        foreground: "oklch(0.15 0.02 145)",
        muted: "oklch(0.92 0.02 145)",
      },
      radius: "md",
    },
  },
];
```

### Pattern 2: URL State Synchronization
**What:** Sync theme config with URL search params using React Router
**When to use:** On page load and when theme changes
**Example:**
```typescript
// Source: React Router 7 useSearchParams documentation
import { useSearchParams } from "react-router";
import { encodeThemeConfig, decodeThemeConfig } from "@lit-ui/cli/theme";

// In ConfiguratorPage or ConfiguratorProvider
function useURLSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getThemeConfig, loadThemeConfig } = useConfigurator();

  // Load from URL on mount
  useEffect(() => {
    const encoded = searchParams.get("theme");
    if (encoded) {
      try {
        const config = decodeThemeConfig(encoded);
        loadThemeConfig(config);
      } catch (e) {
        // Invalid theme in URL, use defaults
        console.warn("Invalid theme in URL, using defaults");
      }
    }
  }, []); // Only on mount

  // Update URL when theme changes (debounced)
  const updateURL = useCallback(() => {
    const encoded = encodeThemeConfig(getThemeConfig());
    setSearchParams({ theme: encoded }, { replace: true });
  }, [getThemeConfig, setSearchParams]);

  return { updateURL };
}
```

### Pattern 3: Copy Shareable URL
**What:** Copy current page URL with theme encoded in search params
**When to use:** Share button click
**Example:**
```typescript
// Source: Web API patterns
function ShareButton() {
  const { getEncodedConfig } = useConfigurator();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const encoded = getEncodedConfig();
    const url = new URL(window.location.href);
    url.searchParams.set("theme", encoded);

    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleShare}>
      {copied ? <Check /> : <Link />}
      {copied ? "Copied!" : "Share URL"}
    </button>
  );
}
```

### Pattern 4: Shade Scale Auto-Generation
**What:** Generate 50-950 shade scale from base color using existing generateScale
**When to use:** Display derived shades, help users understand their palette
**Example:**
```typescript
// Source: existing color-scale.ts generateScale function
import { generateScale } from "@lit-ui/cli/theme";

function ShadeScaleDisplay({ baseColor }: { baseColor: string }) {
  const shades = useMemo(() => generateScale(baseColor), [baseColor]);

  return (
    <div className="flex gap-0.5">
      {Object.entries(shades).map(([step, oklch]) => (
        <div
          key={step}
          className="w-6 h-6 rounded-sm"
          style={{ backgroundColor: oklchToHex(oklch) }}
          title={`${step}: ${oklch}`}
        />
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Re-implementing encoding:** Use existing `encodeThemeConfig` / `decodeThemeConfig`, don't create new encoding
- **Storing preset configs separately from ThemeConfig:** Presets should be the same `ThemeConfig` type
- **URL updates on every keystroke:** Debounce URL updates to prevent history spam
- **Hash instead of query params:** Use `?theme=` not `#theme=` for SEO and sharing compatibility

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme encoding | Custom base64 encoding | `encodeThemeConfig()` | Already handles JSON + base64url + validation |
| Theme decoding | Manual JSON parse | `decodeThemeConfig()` | Includes Zod validation |
| Shade generation | Manual lightness stepping | `generateScale()` | Handles chroma factors, gamut mapping |
| URL state | Manual `window.location` manipulation | `useSearchParams` | React Router integration, proper history |
| URL formatting | String concatenation | `new URL()` + `URLSearchParams` | Handles encoding edge cases |

**Key insight:** Phase 23 and the CLI package built all the infrastructure. This phase is integration work, not library work.

## Common Pitfalls

### Pitfall 1: URL History Pollution
**What goes wrong:** Every color picker drag creates a new history entry, "back" button becomes useless
**Why it happens:** Calling `setSearchParams` on every state change without `replace: true`
**How to avoid:**
1. Debounce URL updates (300-500ms delay)
2. Use `replace: true` option on `setSearchParams`
3. Only update URL on explicit save/share action, not during dragging
**Warning signs:** Browser back button requires many clicks to leave page

### Pitfall 2: Invalid URL on Page Load
**What goes wrong:** User shares URL, but encoded theme is invalid or corrupted
**Why it happens:** URL manipulation, encoding version mismatch, or incomplete theme
**How to avoid:**
1. Wrap `decodeThemeConfig` in try/catch
2. Fall back to default theme on decode failure
3. Log warning but don't break the page
**Warning signs:** White screen or error on shared link

### Pitfall 3: Preset Not Fully Applying
**What goes wrong:** User clicks preset but some colors don't change
**Why it happens:** Partial state update, override tracking not cleared
**How to avoid:**
1. Clear `darkOverrides` and `lightOverrides` when loading preset
2. Replace entire color state, don't merge
3. Add `loadThemeConfig(config)` method that resets all state
**Warning signs:** Mixed colors from old and new preset

### Pitfall 4: generateScale Not Exported
**What goes wrong:** Import error when trying to use `generateScale` in docs app
**Why it happens:** Function exists in CLI but not exported from package entry point
**How to avoid:**
1. Verify `generateScale` is exported from `@lit-ui/cli/theme`
2. Add export if missing: `export { generateScale } from './color-scale.js'`
**Warning signs:** TypeScript error on import

### Pitfall 5: URL Too Long
**What goes wrong:** Shareable URL exceeds browser limits (2000+ chars)
**Why it happens:** ThemeConfig JSON + base64 encoding is verbose
**How to avoid:**
1. Current encoding is ~300-400 chars - well within limits
2. If expanded, consider lz-string compression (already mentioned in prior decisions)
3. Monitor URL length during testing
**Warning signs:** URLs truncated, invalid themes on decode

## Code Examples

### Complete Preset Selector Component
```typescript
// Source: Project patterns + ThemeConfig type
import { useConfigurator } from "../../contexts/ConfiguratorContext";
import { presetThemes, type PresetTheme } from "../../data/presets";
import { oklchToHex } from "../../utils/color-utils";

export function PresetSelector() {
  const { loadThemeConfig, lightColors } = useConfigurator();

  // Check which preset matches current state (if any)
  const activePreset = presetThemes.find((preset) =>
    Object.entries(preset.config.colors).every(
      ([key, value]) => lightColors[key as keyof typeof lightColors] === value
    )
  );

  const handleSelectPreset = (preset: PresetTheme) => {
    loadThemeConfig(preset.config);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Presets
      </label>
      <div className="grid grid-cols-2 gap-2">
        {presetThemes.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`
              p-3 rounded-lg border-2 text-left transition-all
              ${activePreset?.id === preset.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }
            `}
          >
            {/* Color preview dots */}
            <div className="flex gap-1 mb-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: oklchToHex(preset.config.colors.primary) }}
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: oklchToHex(preset.config.colors.secondary) }}
              />
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: oklchToHex(preset.config.colors.destructive) }}
              />
            </div>
            <div className="text-sm font-medium">{preset.name}</div>
            <div className="text-xs text-gray-500">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### URL Sync Hook
```typescript
// Source: React Router 7 useSearchParams + project encoding
import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import { decodeThemeConfig, encodeThemeConfig, type ThemeConfig } from "@lit-ui/cli/theme";

interface UseURLSyncOptions {
  onLoad?: (config: ThemeConfig) => void;
  getConfig: () => ThemeConfig;
}

export function useURLSync({ onLoad, getConfig }: UseURLSyncOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLoadDone = useRef(false);
  const debounceTimer = useRef<number>();

  // Load from URL on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const encoded = searchParams.get("theme");
    if (encoded && onLoad) {
      try {
        const config = decodeThemeConfig(encoded);
        onLoad(config);
      } catch (e) {
        console.warn("Invalid theme in URL:", e);
        // Keep defaults
      }
    }
  }, [searchParams, onLoad]);

  // Debounced URL update
  const updateURL = useCallback(() => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(() => {
      const encoded = encodeThemeConfig(getConfig());
      setSearchParams({ theme: encoded }, { replace: true });
    }, 500);
  }, [getConfig, setSearchParams]);

  // Generate shareable URL
  const getShareableURL = useCallback(() => {
    const encoded = encodeThemeConfig(getConfig());
    const url = new URL(window.location.href);
    url.searchParams.set("theme", encoded);
    return url.toString();
  }, [getConfig]);

  return { updateURL, getShareableURL };
}
```

### Context Extension for loadThemeConfig
```typescript
// Add to ConfiguratorContext.tsx
interface ConfiguratorContextValue extends ConfiguratorState {
  // ... existing methods ...

  /** Load a complete theme config (from preset or URL) */
  loadThemeConfig: (config: ThemeConfig) => void;
}

// In ConfiguratorProvider
const loadThemeConfig = useCallback((config: ThemeConfig) => {
  // Set light colors from config
  setLightColors({ ...config.colors });

  // Re-derive dark colors (clear overrides)
  const derivedDark: Record<ColorKey, string> = {} as Record<ColorKey, string>;
  for (const key of Object.keys(config.colors) as ColorKey[]) {
    derivedDark[key] = deriveDarkMode(config.colors[key]);
  }
  setDarkColors(derivedDark);

  // Clear all overrides (fresh start)
  setDarkOverrides(new Set());
  setLightOverrides(new Set());

  // Set radius
  setRadius(config.radius);
}, []);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash-based URL state (#key=value) | Query params (?theme=...) | 2024+ | Better SEO, server-readable, standard |
| Manual window.history | useSearchParams from React Router | React Router 6+ | Proper React integration, less bugs |
| Separate preset files per theme | Array of ThemeConfig objects | Best practice | Type-safe, single source of truth |
| Custom URL encoding | Base64url (RFC 4648) | Standard | Universal, no special chars |

**Deprecated/outdated:**
- `window.location.hash` for complex state: Use query params with proper router integration
- Generating presets at runtime: Define as static `ThemeConfig` objects for predictability
- `lz-string` compression for short configs: Base64url is sufficient for ~400 char themes

## Open Questions

1. **URL Update Timing**
   - What we know: Updating URL on every color change spams history
   - What's unclear: Should URL update be automatic (debounced) or manual (button)?
   - Recommendation: Debounced automatic (500ms) + explicit "Share" button for copying

2. **Preset Extensibility**
   - What we know: Requirements say "default, dark, blue, green or similar"
   - What's unclear: Should users be able to save custom presets?
   - Recommendation: Start with 4 built-in presets; custom presets are future scope

3. **Shade Scale Display Location**
   - What we know: `generateScale()` exists and works
   - What's unclear: Where to display the 50-950 scale in the UI?
   - Recommendation: Add expandable section below each color picker, or as preview tab

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/cli/src/theme/encoding.ts` - encodeThemeConfig, decodeThemeConfig
- Existing codebase: `packages/cli/src/theme/color-scale.ts` - generateScale
- Existing codebase: `apps/docs/src/contexts/ConfiguratorContext.tsx` - state management
- [React Router useSearchParams API](https://reactrouter.com/api/hooks/useSearchParams) - URL state management

### Secondary (MEDIUM confidence)
- [LogRocket: URL State with useSearchParams](https://blog.logrocket.com/url-state-usesearchparams/) - Patterns for URL state
- [Carbon Design System Themes](https://carbondesignsystem.com/elements/themes/overview/) - Preset theme patterns
- [OKLCH.fyi](https://oklch.fyi/) - OKLCH palette generation concepts

### Tertiary (LOW confidence)
- WebSearch results on theme configurator UX - General guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, no new dependencies
- Architecture: HIGH - Building on existing Phase 23 infrastructure
- Presets: HIGH - Direct ThemeConfig objects, no complexity
- URL sharing: HIGH - React Router 7 official docs verified
- Shade scales: HIGH - generateScale already exists and tested
- Pitfalls: MEDIUM - Based on general URL state patterns

**Research date:** 2026-01-25
**Valid until:** 2026-02-24 (30 days - stable domain, building on existing code)
