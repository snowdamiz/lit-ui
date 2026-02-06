/**
 * Preset theme definitions for the Visual Configurator.
 *
 * Each preset is a complete ThemeConfig that can be loaded into the configurator
 * with a single click. Colors are in OKLCH format for perceptual uniformity.
 *
 * Design philosophy:
 * - Primary sets the brand identity (monochrome or saturated)
 * - Secondary is a very subtle tint of the hue for alternate surfaces
 * - Destructive is always red (H=25) for consistent error semantics
 * - Background/foreground are near-white/near-black with optional hue tinting
 * - Muted provides subtle gray backgrounds with optional hue tinting
 */

import type { ThemeConfig } from "@lit-ui/cli/theme";

/**
 * Preset theme metadata including display information.
 */
export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
}

/**
 * Available preset themes.
 *
 * Organized from neutral to colorful, covering the most common design directions.
 */
export const presetThemes: PresetTheme[] = [
  {
    id: "neutral",
    name: "Neutral",
    description: "Monochrome black & white",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.18 0 0)",
        secondary: "oklch(0.96 0 0)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0 0)",
        foreground: "oklch(0.14 0 0)",
        muted: "oklch(0.96 0 0)",
      },
      radius: "md",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool gray with blue undertone",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.21 0.006 265)",
        secondary: "oklch(0.97 0.003 265)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0.002 265)",
        foreground: "oklch(0.15 0.006 265)",
        muted: "oklch(0.95 0.005 265)",
      },
      radius: "md",
    },
  },
  {
    id: "blue",
    name: "Blue",
    description: "Classic professional blue",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.22 250)",
        secondary: "oklch(0.96 0.02 250)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0.005 250)",
        foreground: "oklch(0.15 0.02 250)",
        muted: "oklch(0.95 0.01 250)",
      },
      radius: "md",
    },
  },
  {
    id: "green",
    name: "Green",
    description: "Nature-inspired forest",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.52 0.18 150)",
        secondary: "oklch(0.96 0.02 150)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0.005 150)",
        foreground: "oklch(0.15 0.02 150)",
        muted: "oklch(0.95 0.01 150)",
      },
      radius: "md",
    },
  },
  {
    id: "violet",
    name: "Violet",
    description: "Rich purple accent",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.22 290)",
        secondary: "oklch(0.96 0.02 290)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0.005 290)",
        foreground: "oklch(0.15 0.02 290)",
        muted: "oklch(0.95 0.01 290)",
      },
      radius: "md",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Soft pink tones",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.2 350)",
        secondary: "oklch(0.96 0.02 350)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0.005 350)",
        foreground: "oklch(0.18 0.015 350)",
        muted: "oklch(0.95 0.01 350)",
      },
      radius: "md",
    },
  },
  {
    id: "orange",
    name: "Orange",
    description: "Warm amber accent",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.2 55)",
        secondary: "oklch(0.96 0.02 55)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.99 0.005 55)",
        foreground: "oklch(0.18 0.015 55)",
        muted: "oklch(0.95 0.01 55)",
      },
      radius: "lg",
    },
  },
  {
    id: "red",
    name: "Red",
    description: "Bold and energetic",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.5 0.22 25)",
        secondary: "oklch(0.96 0.02 25)",
        destructive: "oklch(0.5 0.22 25)",
        background: "oklch(0.99 0.005 25)",
        foreground: "oklch(0.17 0.015 25)",
        muted: "oklch(0.95 0.01 25)",
      },
      radius: "sm",
    },
  },
];
