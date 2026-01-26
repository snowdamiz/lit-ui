/**
 * OKLCH Color Scale Utilities
 *
 * Provides color manipulation utilities for generating shade scales
 * and deriving dark mode variants using the OKLCH color space.
 *
 * Uses colorjs.io for perceptually uniform color operations.
 */

import Color from 'colorjs.io';

/**
 * Lightness values for the 11-step scale (50-950).
 * Follows standard Tailwind-like progression.
 */
const LIGHTNESS_SCALE: Record<string, number> = {
  '50': 0.97,
  '100': 0.94,
  '200': 0.88,
  '300': 0.79,
  '400': 0.70,
  '500': 0.62,
  '600': 0.54,
  '700': 0.46,
  '800': 0.38,
  '900': 0.28,
  '950': 0.20,
};

/**
 * Chroma scale factors to prevent oversaturation at lightness extremes.
 * Values closer to 0 or 1 lightness need reduced chroma.
 */
const CHROMA_FACTORS: Record<string, number> = {
  '50': 0.1,
  '100': 0.2,
  '200': 0.4,
  '300': 0.6,
  '400': 0.85,
  '500': 1.0,
  '600': 0.95,
  '700': 0.85,
  '800': 0.75,
  '900': 0.6,
  '950': 0.45,
};

/**
 * Format a number for OKLCH output with consistent precision.
 */
function formatNumber(n: number, decimals: number = 2): string {
  return Number(n.toFixed(decimals)).toString();
}

/**
 * Generate an 11-step shade scale from a base OKLCH color.
 *
 * @param baseColor - OKLCH color string (e.g., "oklch(0.62 0.18 250)")
 * @returns Record with steps 50-950 as OKLCH strings
 */
export function generateScale(baseColor: string): Record<string, string> {
  const color = new Color(baseColor);

  // Extract base OKLCH values
  const baseChroma = color.oklch.c;
  // Handle NaN hue for achromatic colors (gray)
  const baseHue = Number.isNaN(color.oklch.h) ? 0 : color.oklch.h;

  const scale: Record<string, string> = {};

  for (const [step, targetLightness] of Object.entries(LIGHTNESS_SCALE)) {
    const chromaFactor = CHROMA_FACTORS[step];
    const targetChroma = baseChroma * chromaFactor;

    // Create color with target values
    const stepColor = new Color('oklch', [targetLightness, targetChroma, baseHue]);

    // Gamut map to sRGB if needed
    if (!stepColor.inGamut('srgb')) {
      stepColor.toGamut('srgb');
    }

    // Format as OKLCH string
    const l = formatNumber(stepColor.oklch.l);
    const c = formatNumber(stepColor.oklch.c);
    // Handle potential NaN hue after gamut mapping
    const h = Number.isNaN(stepColor.oklch.h) ? '0' : formatNumber(stepColor.oklch.h, 0);

    scale[step] = `oklch(${l} ${c} ${h})`;
  }

  return scale;
}

/**
 * Derive a dark mode variant from a light mode OKLCH color.
 *
 * @param lightColor - Light mode OKLCH color string
 * @returns Dark mode OKLCH color string with inverted lightness
 */
export function deriveDarkMode(lightColor: string): string {
  const color = new Color(lightColor);

  // Invert lightness around 0.5 midpoint
  const darkLightness = 1 - color.oklch.l;

  // Slightly reduce chroma for dark mode (looks better on dark backgrounds)
  const darkChroma = color.oklch.c * 0.9;

  // Handle NaN hue for achromatic colors
  const hue = Number.isNaN(color.oklch.h) ? 0 : color.oklch.h;

  // Create dark mode color
  const darkColor = new Color('oklch', [darkLightness, darkChroma, hue]);

  // Gamut map if needed
  if (!darkColor.inGamut('srgb')) {
    darkColor.toGamut('srgb');
  }

  // Format output
  const l = formatNumber(darkColor.oklch.l);
  const c = formatNumber(darkColor.oklch.c);
  const h = Number.isNaN(darkColor.oklch.h) ? '0' : formatNumber(darkColor.oklch.h, 0);

  return `oklch(${l} ${c} ${h})`;
}

/**
 * Derive a high-contrast foreground color for a background.
 *
 * @param backgroundColor - Background OKLCH color string
 * @returns Foreground OKLCH color (light for dark bg, dark for light bg)
 */
export function deriveForeground(backgroundColor: string): string {
  const color = new Color(backgroundColor);
  const bgLightness = color.oklch.l;

  // Use lightness threshold of 0.7 to determine contrast direction
  // Higher threshold ensures colored buttons (L ~0.5-0.65) get white text for better visibility
  const LIGHTNESS_THRESHOLD = 0.7;

  // Low chroma for foreground (near neutral for readability)
  const FOREGROUND_CHROMA = 0.02;

  let fgLightness: number;

  if (bgLightness < LIGHTNESS_THRESHOLD) {
    // Dark background -> light foreground (near white)
    fgLightness = 0.98;
  } else {
    // Light background -> dark foreground (near black)
    fgLightness = 0.15;
  }

  // Handle NaN hue
  const hue = Number.isNaN(color.oklch.h) ? 0 : color.oklch.h;

  // Create foreground color with low chroma
  const foregroundColor = new Color('oklch', [fgLightness, FOREGROUND_CHROMA, hue]);

  // Format output
  const l = formatNumber(foregroundColor.oklch.l);
  const c = formatNumber(foregroundColor.oklch.c);
  const h = Number.isNaN(foregroundColor.oklch.h) ? '0' : formatNumber(foregroundColor.oklch.h, 0);

  return `oklch(${l} ${c} ${h})`;
}
