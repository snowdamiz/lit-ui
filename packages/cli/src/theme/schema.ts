/**
 * Theme Configuration Schema
 *
 * Defines the data structure for theme configurations using Zod for
 * runtime validation and TypeScript type inference.
 *
 * All colors must be in OKLCH format for perceptual uniformity.
 */

import { z } from "zod";

/**
 * OKLCH color string regex pattern.
 * Matches: oklch(L C H) where L, C, H are decimal numbers.
 * Examples:
 *   - oklch(0.62 0.18 250)
 *   - oklch(0.625 0.185 250.5)
 *   - oklch(1 0 0)
 */
const OKLCH_REGEX = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

/**
 * Zod schema for OKLCH color strings with custom error message.
 */
const oklchColorSchema = z.string().regex(OKLCH_REGEX, {
  message: "Invalid OKLCH format. Expected: oklch(L C H) e.g., oklch(0.62 0.18 250)",
});

/**
 * Schema for the colors object containing all 6 base semantic colors.
 */
const colorsSchema = z.object({
  /** Primary brand color for buttons, links, focus states */
  primary: oklchColorSchema,
  /** Secondary color for subtle backgrounds and secondary actions */
  secondary: oklchColorSchema,
  /** Destructive color for errors, delete actions, warnings */
  destructive: oklchColorSchema,
  /** Page background color */
  background: oklchColorSchema,
  /** Primary text color */
  foreground: oklchColorSchema,
  /** Muted color for disabled states, subtle text, backgrounds */
  muted: oklchColorSchema,
});

/**
 * Schema for border radius scale.
 * Affects all components uniformly.
 */
const radiusSchema = z.enum(["sm", "md", "lg"]);

/**
 * Complete theme configuration schema.
 *
 * Version is locked to 1 to enable future schema migrations.
 * When schema changes, version will be bumped and migration logic added.
 */
export const themeConfigSchema = z.object({
  /** Schema version for future migrations */
  version: z.literal(1),
  /** Semantic color tokens */
  colors: colorsSchema,
  /** Border radius scale */
  radius: radiusSchema,
});

/**
 * TypeScript type inferred from the Zod schema.
 * Use this type for theme configuration objects throughout the codebase.
 */
export type ThemeConfig = z.infer<typeof themeConfigSchema>;

/**
 * Type for partial theme configuration (for merging with defaults).
 */
export type PartialThemeConfig = {
  version?: 1;
  colors?: Partial<ThemeConfig["colors"]>;
  radius?: ThemeConfig["radius"];
};
