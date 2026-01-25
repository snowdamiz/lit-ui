/**
 * Color Conversion Utilities
 *
 * Provides bidirectional conversion between color spaces used in the visual configurator:
 * - HSV: Used by color picker components (@uiw/react-color)
 * - OKLCH: Internal storage format (perceptually uniform)
 * - Hex: Display format for users
 *
 * Uses colorjs.io for accurate color space conversions and gamut mapping.
 */

import Color from "colorjs.io";

/**
 * Convert HSV color (from picker) to OKLCH string for internal storage.
 *
 * @param hsv - HSV color with h (0-360), s (0-100), v (0-100)
 * @returns OKLCH formatted string like "oklch(0.62 0.18 250)"
 */
export function hsvToOklch(hsv: { h: number; s: number; v: number }): string {
  // colorjs.io HSV uses 0-1 for saturation and value
  const color = new Color("hsv", [hsv.h, hsv.s / 100, hsv.v / 100]);

  // Convert to OKLCH
  const oklch = color.to("oklch");

  // Format with consistent precision
  const l = Number(oklch.oklch.l.toFixed(2));
  const c = Number(oklch.oklch.c.toFixed(2));
  // Handle NaN hue for achromatic colors (grays)
  const h = Number.isNaN(oklch.oklch.h) ? 0 : Math.round(oklch.oklch.h);

  return `oklch(${l} ${c} ${h})`;
}

/**
 * Convert OKLCH string to HSV for color picker components.
 *
 * @param oklchString - OKLCH color string like "oklch(0.62 0.18 250)"
 * @returns HSV object with h (0-360), s (0-100), v (0-100)
 */
export function oklchToHsv(
  oklchString: string
): { h: number; s: number; v: number } {
  const color = new Color(oklchString);
  const hsv = color.to("hsv");

  return {
    // Hue is already 0-360, handle NaN for grays
    h: Number.isNaN(hsv.hsv.h) ? 0 : hsv.hsv.h,
    // Saturation and value need to be scaled to 0-100 for picker
    s: (Number.isNaN(hsv.hsv.s) ? 0 : hsv.hsv.s) * 100,
    v: (Number.isNaN(hsv.hsv.v) ? 0 : hsv.hsv.v) * 100,
  };
}

/**
 * Convert OKLCH string to hex for display to users.
 *
 * Handles out-of-gamut OKLCH colors by gamut mapping to sRGB.
 *
 * @param oklchString - OKLCH color string like "oklch(0.62 0.18 250)"
 * @returns Hex color string like "#3b82f6"
 */
export function oklchToHex(oklchString: string): string {
  const color = new Color(oklchString);

  // Gamut map to sRGB if color is outside sRGB gamut
  if (!color.inGamut("srgb")) {
    color.toGamut("srgb");
  }

  return color.to("srgb").toString({ format: "hex" });
}

/**
 * Convert hex color to OKLCH string for internal storage.
 *
 * Handles various hex formats: #RGB, #RRGGBB, RGB, RRGGBB.
 *
 * @param hex - Hex color string (with or without #)
 * @returns OKLCH formatted string like "oklch(0.62 0.18 250)"
 */
export function hexToOklch(hex: string): string {
  // colorjs.io's Color constructor handles various hex formats
  const color = new Color(hex);
  const oklch = color.to("oklch");

  // Format with consistent precision
  const l = Number(oklch.oklch.l.toFixed(2));
  const c = Number(oklch.oklch.c.toFixed(2));
  // Handle NaN hue for achromatic colors
  const h = Number.isNaN(oklch.oklch.h) ? 0 : Math.round(oklch.oklch.h);

  return `oklch(${l} ${c} ${h})`;
}

/**
 * Validate if a string is a valid hex color.
 *
 * @param hex - String to validate
 * @returns true if valid hex color, false otherwise
 */
export function isValidHex(hex: string): boolean {
  try {
    // Attempt to parse with colorjs.io
    new Color(hex);
    return true;
  } catch {
    return false;
  }
}
