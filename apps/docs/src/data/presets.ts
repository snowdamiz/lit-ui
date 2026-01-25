/**
 * Preset theme definitions for the Visual Configurator.
 *
 * Each preset is a complete ThemeConfig that can be loaded into the configurator
 * with a single click. Colors are in OKLCH format for perceptual uniformity.
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
 * - default: Neutral gray palette, professional appearance
 * - ocean: Professional blue accent for business/corporate apps
 * - forest: Nature-inspired green for eco/health/growth themes
 * - sunset: Warm orange and amber tones
 */
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
    id: "ocean",
    name: "Ocean",
    description: "Professional blue accent",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.22 250)",
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
    id: "forest",
    name: "Forest",
    description: "Nature-inspired green",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.55 0.18 145)",
        secondary: "oklch(0.92 0.05 145)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.98 0.01 145)",
        foreground: "oklch(0.15 0.02 145)",
        muted: "oklch(0.92 0.02 145)",
      },
      radius: "md",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and amber tones",
    config: {
      version: 1,
      colors: {
        primary: "oklch(0.65 0.2 50)",
        secondary: "oklch(0.92 0.05 50)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.98 0.02 50)",
        foreground: "oklch(0.2 0.02 50)",
        muted: "oklch(0.92 0.03 50)",
      },
      radius: "lg",
    },
  },
];
