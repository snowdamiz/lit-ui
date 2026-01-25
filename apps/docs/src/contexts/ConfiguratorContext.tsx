/**
 * ConfiguratorContext - Theme State Management for Visual Configurator
 *
 * Provides React context for managing theme configuration state including:
 * - Light and dark mode colors in OKLCH format
 * - Bidirectional derivation between light and dark modes
 * - Override tracking for manual customizations
 * - Border radius configuration
 * - CSS generation for live preview
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import Color from "colorjs.io";
import {
  defaultTheme,
  generateThemeCSS,
  encodeThemeConfig,
  type ThemeConfig,
} from "@lit-ui/cli/theme";

/**
 * The 6 semantic color keys used in the theme.
 */
export type ColorKey =
  | "primary"
  | "secondary"
  | "destructive"
  | "background"
  | "foreground"
  | "muted";

/**
 * Internal state shape for the configurator.
 */
interface ConfiguratorState {
  /** Currently active editing mode */
  activeMode: "light" | "dark";
  /** Light mode colors in OKLCH format */
  lightColors: Record<ColorKey, string>;
  /** Dark mode colors in OKLCH format */
  darkColors: Record<ColorKey, string>;
  /** Set of dark color keys that have been manually overridden */
  darkOverrides: Set<ColorKey>;
  /** Set of light color keys that have been manually overridden (when editing dark first) */
  lightOverrides: Set<ColorKey>;
  /** Border radius setting */
  radius: "sm" | "md" | "lg";
}

/**
 * Context value shape exposed to consumers.
 */
interface ConfiguratorContextValue extends ConfiguratorState {
  /** Set the active editing mode (light or dark) */
  setActiveMode: (mode: "light" | "dark") => void;
  /** Set a light mode color - re-derives dark if not overridden */
  setLightColor: (key: ColorKey, oklch: string) => void;
  /** Set a dark mode color - marks as overridden */
  setDarkColor: (key: ColorKey, oklch: string) => void;
  /** Reset a dark color to derived value from light */
  resetDarkColor: (key: ColorKey) => void;
  /** Reset a light color to derived value from dark */
  resetLightColor: (key: ColorKey) => void;
  /** Set the border radius */
  setRadius: (radius: "sm" | "md" | "lg") => void;
  /** Build a ThemeConfig object from current state */
  getThemeConfig: () => ThemeConfig;
  /** Get generated CSS for the current theme */
  getGeneratedCSS: () => string;
  /** Get the encoded theme config string for CLI */
  getEncodedConfig: () => string;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | undefined>(
  undefined
);

// ============================================================================
// Color Derivation Utilities
// ============================================================================

/**
 * Format a number for OKLCH output with consistent precision.
 */
function formatNumber(n: number, decimals: number = 2): string {
  return Number(n.toFixed(decimals)).toString();
}

/**
 * Derive dark mode color from a light mode OKLCH color.
 * Matches the algorithm in packages/cli/src/theme/color-scale.ts
 */
function deriveDarkMode(lightColor: string): string {
  const color = new Color(lightColor);

  // Invert lightness around 0.5 midpoint
  const darkLightness = 1 - color.oklch.l;

  // Reduce chroma by 0.9x for dark mode (looks better on dark backgrounds)
  const darkChroma = color.oklch.c * 0.9;

  // Handle NaN hue for achromatic colors
  const hue = Number.isNaN(color.oklch.h) ? 0 : color.oklch.h;

  // Create dark mode color
  const darkColor = new Color("oklch", [darkLightness, darkChroma, hue]);

  // Gamut map if needed
  if (!darkColor.inGamut("srgb")) {
    darkColor.toGamut("srgb");
  }

  // Format output
  const l = formatNumber(darkColor.oklch.l);
  const c = formatNumber(darkColor.oklch.c);
  const h = Number.isNaN(darkColor.oklch.h)
    ? "0"
    : formatNumber(darkColor.oklch.h, 0);

  return `oklch(${l} ${c} ${h})`;
}

/**
 * Derive light mode color from a dark mode OKLCH color.
 * Inverse of deriveDarkMode.
 */
function deriveLightMode(darkColor: string): string {
  const color = new Color(darkColor);

  // Invert lightness (same as dark derivation, just reverse)
  const lightLightness = 1 - color.oklch.l;

  // Restore chroma (dark mode used 0.9x, so divide to restore)
  const lightChroma = color.oklch.c / 0.9;

  // Handle NaN hue for achromatic colors
  const hue = Number.isNaN(color.oklch.h) ? 0 : color.oklch.h;

  // Create light mode color
  const lightColor = new Color("oklch", [lightLightness, lightChroma, hue]);

  // Gamut map if needed
  if (!lightColor.inGamut("srgb")) {
    lightColor.toGamut("srgb");
  }

  // Format output
  const l = formatNumber(lightColor.oklch.l);
  const c = formatNumber(lightColor.oklch.c);
  const h = Number.isNaN(lightColor.oklch.h)
    ? "0"
    : formatNumber(lightColor.oklch.h, 0);

  return `oklch(${l} ${c} ${h})`;
}

/**
 * Derive all colors in one direction, respecting overrides.
 */
function deriveColors(
  sourceColors: Record<ColorKey, string>,
  direction: "light-to-dark" | "dark-to-light",
  overrides: Set<ColorKey>,
  existingTarget: Record<ColorKey, string>
): Record<ColorKey, string> {
  const result = { ...existingTarget };

  for (const key of Object.keys(sourceColors) as ColorKey[]) {
    if (overrides.has(key)) {
      // Keep existing override, don't re-derive
      continue;
    }

    if (direction === "light-to-dark") {
      result[key] = deriveDarkMode(sourceColors[key]);
    } else {
      result[key] = deriveLightMode(sourceColors[key]);
    }
  }

  return result;
}

// ============================================================================
// Provider Component
// ============================================================================

interface ConfiguratorProviderProps {
  children: ReactNode;
}

export function ConfiguratorProvider({ children }: ConfiguratorProviderProps) {
  // Initialize light colors from defaultTheme
  const [lightColors, setLightColors] = useState<Record<ColorKey, string>>(
    () => ({ ...defaultTheme.colors })
  );

  // Initialize dark colors by deriving from light
  const [darkColors, setDarkColors] = useState<Record<ColorKey, string>>(() => {
    const derived: Record<ColorKey, string> = {} as Record<ColorKey, string>;
    for (const key of Object.keys(defaultTheme.colors) as ColorKey[]) {
      derived[key] = deriveDarkMode(defaultTheme.colors[key]);
    }
    return derived;
  });

  // Track which colors have been manually overridden
  const [darkOverrides, setDarkOverrides] = useState<Set<ColorKey>>(
    () => new Set()
  );
  const [lightOverrides, setLightOverrides] = useState<Set<ColorKey>>(
    () => new Set()
  );

  // Active mode for editing
  const [activeMode, setActiveMode] = useState<"light" | "dark">("light");

  // Border radius
  const [radius, setRadius] = useState<"sm" | "md" | "lg">(defaultTheme.radius);

  // Set a light color and re-derive dark if not overridden
  const setLightColor = useCallback(
    (key: ColorKey, oklch: string) => {
      setLightColors((prev) => {
        const next = { ...prev, [key]: oklch };
        // Re-derive dark colors for non-overridden keys
        setDarkColors((currentDark) =>
          deriveColors(next, "light-to-dark", darkOverrides, currentDark)
        );
        return next;
      });
    },
    [darkOverrides]
  );

  // Set a dark color and mark as overridden
  const setDarkColor = useCallback((key: ColorKey, oklch: string) => {
    setDarkColors((prev) => ({ ...prev, [key]: oklch }));
    setDarkOverrides((prev) => new Set(prev).add(key));
  }, []);

  // Reset dark color to derived value
  const resetDarkColor = useCallback(
    (key: ColorKey) => {
      setDarkOverrides((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      // Re-derive from current light color
      setDarkColors((prev) => ({
        ...prev,
        [key]: deriveDarkMode(lightColors[key]),
      }));
    },
    [lightColors]
  );

  // Reset light color to derived value (when editing dark first)
  const resetLightColor = useCallback(
    (key: ColorKey) => {
      setLightOverrides((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      // Re-derive from current dark color
      setLightColors((prev) => ({
        ...prev,
        [key]: deriveLightMode(darkColors[key]),
      }));
    },
    [darkColors]
  );

  // Build ThemeConfig from current state
  const getThemeConfig = useCallback((): ThemeConfig => {
    return {
      version: 1,
      colors: lightColors,
      radius,
    };
  }, [lightColors, radius]);

  // Get generated CSS for preview
  const getGeneratedCSS = useCallback((): string => {
    return generateThemeCSS(getThemeConfig());
  }, [getThemeConfig]);

  // Get encoded config string for CLI
  const getEncodedConfig = useCallback((): string => {
    return encodeThemeConfig(getThemeConfig());
  }, [getThemeConfig]);

  // Memoize context value
  const value = useMemo<ConfiguratorContextValue>(
    () => ({
      activeMode,
      lightColors,
      darkColors,
      darkOverrides,
      lightOverrides,
      radius,
      setActiveMode,
      setLightColor,
      setDarkColor,
      resetDarkColor,
      resetLightColor,
      setRadius,
      getThemeConfig,
      getGeneratedCSS,
      getEncodedConfig,
    }),
    [
      activeMode,
      lightColors,
      darkColors,
      darkOverrides,
      lightOverrides,
      radius,
      setLightColor,
      setDarkColor,
      resetDarkColor,
      resetLightColor,
      getThemeConfig,
      getGeneratedCSS,
      getEncodedConfig,
    ]
  );

  return (
    <ConfiguratorContext.Provider value={value}>
      {children}
    </ConfiguratorContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access configurator state and actions.
 * Must be used within a ConfiguratorProvider.
 */
export function useConfigurator(): ConfiguratorContextValue {
  const context = useContext(ConfiguratorContext);
  if (!context) {
    throw new Error(
      "useConfigurator must be used within a ConfiguratorProvider"
    );
  }
  return context;
}
