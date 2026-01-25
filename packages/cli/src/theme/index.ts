/**
 * Theme Module
 *
 * Public exports for the theming system.
 * This barrel file provides a clean API surface for theme utilities.
 */

// Schema and types
export { themeConfigSchema, type ThemeConfig, type PartialThemeConfig } from "./schema.js";

// Default theme and merge utility
export { defaultTheme, mergeThemeConfig } from "./defaults.js";

// Color utilities
export { generateScale, deriveDarkMode, deriveForeground } from "./color-scale.js";
