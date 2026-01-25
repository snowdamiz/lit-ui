/**
 * @module @lit-ui/cli/theme
 *
 * Theme System for Lit UI
 *
 * This module provides a complete theming pipeline for Lit UI components:
 *
 * 1. **Schema & Types** - Define theme configurations with Zod validation
 * 2. **Defaults** - Merge partial configs with sensible defaults
 * 3. **Encoding** - URL-safe serialization for CLI parameters
 * 4. **CSS Generation** - Transform configs into Tailwind v4-compatible CSS
 *
 * @example Basic Usage
 * ```ts
 * import {
 *   ThemeConfig,
 *   defaultTheme,
 *   encodeThemeConfig,
 *   decodeThemeConfig,
 *   generateThemeCSS
 * } from '@lit-ui/cli/theme';
 *
 * // Create a custom theme
 * const theme: ThemeConfig = {
 *   ...defaultTheme,
 *   colors: {
 *     ...defaultTheme.colors,
 *     primary: 'oklch(0.6 0.2 250)'
 *   }
 * };
 *
 * // Encode for CLI/URL usage
 * const encoded = encodeThemeConfig(theme);
 *
 * // Decode and validate
 * const decoded = decodeThemeConfig(encoded);
 *
 * // Generate CSS
 * const css = generateThemeCSS(decoded);
 * ```
 *
 * @example CLI Workflow
 * ```bash
 * # Pass theme via CLI parameter
 * lit-ui theme --config=eyJ2ZXJzaW9uIjoxLC...
 * ```
 */

/**
 * Theme configuration type.
 *
 * Represents a complete theme with version, colors, and radius settings.
 * All colors must be in OKLCH format for perceptual uniformity.
 *
 * @see {@link themeConfigSchema} for runtime validation
 */
export type { ThemeConfig } from "./schema.js";

/**
 * Partial theme configuration type for merging with defaults.
 */
export type { PartialThemeConfig } from "./schema.js";

/**
 * Zod schema for validating theme configurations at runtime.
 *
 * Use this for advanced validation scenarios or when you need
 * to validate user input before creating a ThemeConfig.
 *
 * @example
 * ```ts
 * import { themeConfigSchema } from '@lit-ui/cli/theme';
 *
 * const result = themeConfigSchema.safeParse(userInput);
 * if (result.success) {
 *   // result.data is a valid ThemeConfig
 * } else {
 *   // result.error contains validation details
 * }
 * ```
 */
export { themeConfigSchema } from "./schema.js";

/**
 * Default theme configuration with a neutral gray palette.
 *
 * This theme provides sensible defaults that work well out of the box.
 * Use it as a base for custom themes or when no customization is needed.
 *
 * Colors use OKLCH with minimal chroma for a clean, professional appearance.
 *
 * @example
 * ```ts
 * import { defaultTheme } from '@lit-ui/cli/theme';
 *
 * // Use as-is
 * const css = generateThemeCSS(defaultTheme);
 *
 * // Or customize specific values
 * const custom = {
 *   ...defaultTheme,
 *   colors: { ...defaultTheme.colors, primary: 'oklch(0.6 0.2 200)' }
 * };
 * ```
 */
export { defaultTheme } from "./defaults.js";

/**
 * Merge a partial theme configuration with the default theme.
 *
 * Performs a deep merge, filling in missing values from defaultTheme.
 * Useful when you only want to customize specific colors or settings.
 *
 * @example
 * ```ts
 * import { mergeThemeConfig } from '@lit-ui/cli/theme';
 *
 * const theme = mergeThemeConfig({
 *   colors: { primary: 'oklch(0.6 0.2 200)' }
 * });
 * // theme.colors.secondary === defaultTheme.colors.secondary
 * ```
 */
export { mergeThemeConfig } from "./defaults.js";

/**
 * Encode a ThemeConfig to a URL-safe base64url string.
 *
 * The encoded string contains only alphanumeric characters, hyphens,
 * and underscores - safe for URLs and CLI parameters without escaping.
 *
 * @example
 * ```ts
 * import { encodeThemeConfig, defaultTheme } from '@lit-ui/cli/theme';
 *
 * const encoded = encodeThemeConfig(defaultTheme);
 * // Use in CLI: lit-ui theme --config=<encoded>
 * // Use in URL: ?theme=<encoded>
 * ```
 */
export { encodeThemeConfig } from "./encoding.js";

/**
 * Decode a base64url string to a validated ThemeConfig.
 *
 * Performs 4-stage validation:
 * 1. Base64url format validation
 * 2. Base64url decoding
 * 3. JSON parsing
 * 4. Zod schema validation
 *
 * Throws descriptive errors for each failure mode.
 *
 * @example
 * ```ts
 * import { decodeThemeConfig } from '@lit-ui/cli/theme';
 *
 * try {
 *   const config = decodeThemeConfig(encodedString);
 *   // config is guaranteed to be valid
 * } catch (error) {
 *   console.error('Invalid theme:', error.message);
 * }
 * ```
 */
export { decodeThemeConfig } from "./encoding.js";

/**
 * Generate Tailwind v4-compatible CSS from a theme configuration.
 *
 * Produces CSS with:
 * - `:root` block with light mode `--lui-*` variables
 * - `.dark` block with dark mode overrides (class-based)
 * - `@media (prefers-color-scheme: dark)` for system preference
 * - Border radius variables (`--lui-radius-sm/md/lg`)
 *
 * Dark mode colors and foreground colors are derived automatically
 * from the base colors in the config.
 *
 * @example
 * ```ts
 * import { generateThemeCSS, defaultTheme } from '@lit-ui/cli/theme';
 *
 * const css = generateThemeCSS(defaultTheme);
 * // Write to file or inject into page
 * fs.writeFileSync('theme.css', css);
 * ```
 */
export { generateThemeCSS } from "./css-generator.js";

/**
 * Generate a 50-950 shade scale from a base OKLCH color.
 *
 * Produces 10 shades with lightness ranging from 0.97 (50) to 0.20 (950).
 * Chroma is modulated to prevent oversaturation at extreme lightness values.
 *
 * @example
 * ```ts
 * import { generateScale } from '@lit-ui/cli/theme';
 *
 * const shades = generateScale('oklch(0.6 0.2 250)');
 * // { '50': 'oklch(0.97 0.02 250)', '100': 'oklch(0.92 0.06 250)', ... }
 * ```
 */
export { generateScale } from "./color-scale.js";
