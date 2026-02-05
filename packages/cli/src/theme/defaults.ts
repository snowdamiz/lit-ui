/**
 * Default Theme Configuration
 *
 * Provides a neutral gray palette as the default theme.
 * All colors are in OKLCH format with low chroma for a clean, minimal look.
 *
 * Values are derived from common design system patterns:
 * - Background: near-white (L=0.98)
 * - Foreground: near-black (L=0.15)
 * - Muted/Secondary: subtle gray variations
 * - Primary: neutral gray that can be overridden
 * - Destructive: red hue (H=25) for danger states
 */

import { defu } from "defu";
import type { ThemeConfig, PartialThemeConfig } from "./schema.js";

/**
 * Default theme with neutral gray palette.
 *
 * This theme is used as the base when:
 * - No custom theme is provided
 * - Merging partial configurations
 *
 * Colors use OKLCH with minimal chroma (~0.02-0.03) for neutrals,
 * giving a clean, professional appearance.
 */
export const defaultTheme: ThemeConfig = {
  version: 1,
  colors: {
    /**
     * Primary: Neutral gray with slight blue tint.
     * Override this for brand colors.
     */
    primary: "oklch(0.18 0 0)",

    /**
     * Secondary: Light gray for subtle backgrounds.
     * Used for secondary buttons and alternate surfaces.
     */
    secondary: "oklch(0.92 0 0)",

    /**
     * Destructive: Red for danger/error states.
     * Hue 25 gives a warm red suitable for warnings.
     */
    destructive: "oklch(0.55 0.22 25)",

    /**
     * Background: Near-white page background.
     * Very low lightness variation from pure white.
     */
    background: "oklch(0.98 0 0)",

    /**
     * Foreground: Near-black text color.
     * Provides strong contrast against light backgrounds.
     */
    foreground: "oklch(0.15 0 0)",

    /**
     * Muted: Subtle gray for disabled/secondary text.
     * Mid-lightness with minimal color.
     */
    muted: "oklch(0.92 0 0)",
  },
  radius: "md",
};

/**
 * Merges a partial theme configuration with the default theme.
 *
 * Uses deep merge to preserve nested structure. Missing values
 * are filled from defaultTheme.
 *
 * @param partial - Partial theme configuration to merge
 * @returns Complete ThemeConfig with all required fields
 *
 * @example
 * ```ts
 * const custom = mergeThemeConfig({
 *   colors: { primary: "oklch(0.6 0.2 200)" }
 * });
 * // custom.colors.secondary === defaultTheme.colors.secondary
 * ```
 */
export function mergeThemeConfig(partial: PartialThemeConfig): ThemeConfig {
  return defu(partial, defaultTheme) as ThemeConfig;
}
