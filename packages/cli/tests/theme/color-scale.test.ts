import { describe, it, expect } from 'vitest';
import { generateScale, deriveDarkMode, deriveForeground } from '../../src/theme/color-scale';

describe('generateScale', () => {
  it('produces 11 steps (50-950) from a base color', () => {
    const scale = generateScale('oklch(0.62 0.18 250)');

    const expectedKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    expect(Object.keys(scale)).toEqual(expectedKeys);
  });

  it('preserves the base color at step 500', () => {
    const baseColor = 'oklch(0.62 0.18 250)';
    const scale = generateScale(baseColor);

    // Step 500 should be close to the base color's lightness
    expect(scale['500']).toMatch(/^oklch\(/);
    // The lightness at 500 should be approximately 0.62
    const match = scale['500'].match(/oklch\(([\d.]+)/);
    expect(match).toBeTruthy();
    if (match) {
      const lightness = parseFloat(match[1]);
      expect(lightness).toBeCloseTo(0.62, 1);
    }
  });

  it('follows lightness progression (50 is lightest, 950 is darkest)', () => {
    const scale = generateScale('oklch(0.62 0.18 250)');

    // Extract lightness values
    const getLightness = (oklchStr: string): number => {
      const match = oklchStr.match(/oklch\(([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };

    const l50 = getLightness(scale['50']);
    const l500 = getLightness(scale['500']);
    const l950 = getLightness(scale['950']);

    // 50 should be lightest (around 0.97)
    expect(l50).toBeGreaterThan(0.9);
    // 950 should be darkest (around 0.20)
    expect(l950).toBeLessThan(0.3);
    // Progressive: 50 > 500 > 950
    expect(l50).toBeGreaterThan(l500);
    expect(l500).toBeGreaterThan(l950);
  });

  it('generates valid sRGB-gamut colors', () => {
    const scale = generateScale('oklch(0.62 0.18 250)');

    for (const [step, color] of Object.entries(scale)) {
      // All colors should be valid OKLCH strings
      expect(color).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);

      // Lightness should be in valid range (0-1)
      const match = color.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
      expect(match).toBeTruthy();
      if (match) {
        const [, l, c, h] = match;
        expect(parseFloat(l)).toBeGreaterThanOrEqual(0);
        expect(parseFloat(l)).toBeLessThanOrEqual(1);
        expect(parseFloat(c)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('handles achromatic colors (gray) without NaN hue', () => {
    // Gray color with chroma = 0, which normally causes NaN hue
    const scale = generateScale('oklch(0.5 0 0)');

    for (const [step, color] of Object.entries(scale)) {
      // Should not contain NaN
      expect(color).not.toContain('NaN');
      expect(color).not.toContain('nan');
      // Should be valid OKLCH format
      expect(color).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
    }
  });

  it('modulates chroma to prevent oversaturation at extremes', () => {
    const scale = generateScale('oklch(0.62 0.18 250)');

    // Extract chroma values
    const getChroma = (oklchStr: string): number => {
      const match = oklchStr.match(/oklch\([\d.]+ ([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };

    const c50 = getChroma(scale['50']);
    const c500 = getChroma(scale['500']);
    const c950 = getChroma(scale['950']);

    // Chroma at extremes should be reduced compared to middle values
    // At very light (50) and very dark (950), chroma is typically reduced
    expect(c50).toBeLessThan(c500);
    expect(c950).toBeLessThan(c500);
  });

  it('handles high chroma input by gamut-mapping', () => {
    // Very high chroma that might exceed sRGB gamut
    const scale = generateScale('oklch(0.6 0.4 30)');

    for (const color of Object.values(scale)) {
      // All colors should still be valid OKLCH
      expect(color).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
      // Should not have unreasonably high chroma values
      const match = color.match(/oklch\([\d.]+ ([\d.]+)/);
      if (match) {
        const chroma = parseFloat(match[1]);
        // After gamut mapping, chroma should be reasonable
        expect(chroma).toBeLessThanOrEqual(0.5);
      }
    }
  });
});

describe('deriveDarkMode', () => {
  it('inverts lightness correctly', () => {
    const lightColor = 'oklch(0.62 0.18 250)';
    const darkColor = deriveDarkMode(lightColor);

    // Should be valid OKLCH
    expect(darkColor).toMatch(/^oklch\(/);

    // Extract lightness
    const lightMatch = lightColor.match(/oklch\(([\d.]+)/);
    const darkMatch = darkColor.match(/oklch\(([\d.]+)/);

    expect(lightMatch).toBeTruthy();
    expect(darkMatch).toBeTruthy();

    if (lightMatch && darkMatch) {
      const lightL = parseFloat(lightMatch[1]);
      const darkL = parseFloat(darkMatch[1]);

      // Dark mode should have inverted lightness (1 - originalL)
      // With 0.62 input, expect ~0.38 output
      expect(darkL).toBeCloseTo(1 - lightL, 1);
    }
  });

  it('reduces chroma for dark mode', () => {
    const lightColor = 'oklch(0.62 0.18 250)';
    const darkColor = deriveDarkMode(lightColor);

    // Extract chroma
    const getChroma = (oklchStr: string): number => {
      const match = oklchStr.match(/oklch\([\d.]+ ([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };

    const lightC = getChroma(lightColor);
    const darkC = getChroma(darkColor);

    // Dark mode chroma should be reduced
    // Note: After gamut mapping, exact 0.9 factor may not be preserved
    expect(darkC).toBeLessThan(lightC);
    // Should be in reasonable range (between 0.5x and 1.0x of original)
    expect(darkC).toBeGreaterThan(lightC * 0.5);
    expect(darkC).toBeLessThanOrEqual(lightC);
  });

  it('preserves hue approximately (may shift slightly due to gamut mapping)', () => {
    const lightColor = 'oklch(0.62 0.18 250)';
    const darkColor = deriveDarkMode(lightColor);

    // Extract hue
    const getHue = (oklchStr: string): number => {
      const match = oklchStr.match(/oklch\([\d.]+ [\d.]+ ([\d.]+)\)/);
      return match ? parseFloat(match[1]) : 0;
    };

    const lightH = getHue(lightColor);
    const darkH = getHue(darkColor);

    // Hue should be approximately preserved
    // Gamut mapping can cause small hue shifts, so allow 15 degree tolerance
    expect(Math.abs(darkH - lightH)).toBeLessThan(15);
  });

  it('handles achromatic colors without errors', () => {
    const grayColor = 'oklch(0.5 0 0)';
    const darkGray = deriveDarkMode(grayColor);

    // Should be valid and not contain NaN
    expect(darkGray).toMatch(/^oklch\(/);
    expect(darkGray).not.toContain('NaN');
  });
});

describe('deriveForeground', () => {
  it('returns light foreground for dark backgrounds', () => {
    // Dark background (low lightness)
    const darkBg = 'oklch(0.2 0.05 250)';
    const foreground = deriveForeground(darkBg);

    // Extract lightness
    const match = foreground.match(/oklch\(([\d.]+)/);
    expect(match).toBeTruthy();
    if (match) {
      const lightness = parseFloat(match[1]);
      // Should be light (high lightness, near white)
      expect(lightness).toBeGreaterThan(0.9);
    }
  });

  it('returns dark foreground for light backgrounds', () => {
    // Light background (high lightness)
    const lightBg = 'oklch(0.9 0.02 250)';
    const foreground = deriveForeground(lightBg);

    // Extract lightness
    const match = foreground.match(/oklch\(([\d.]+)/);
    expect(match).toBeTruthy();
    if (match) {
      const lightness = parseFloat(match[1]);
      // Should be dark (low lightness, near black)
      expect(lightness).toBeLessThan(0.2);
    }
  });

  it('uses lightness threshold around 0.5', () => {
    // Just below threshold
    const belowThreshold = deriveForeground('oklch(0.45 0.1 250)');
    const aboveThreshold = deriveForeground('oklch(0.55 0.1 250)');

    const getLightness = (oklchStr: string): number => {
      const match = oklchStr.match(/oklch\(([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };

    // Below 0.5 lightness -> light foreground
    expect(getLightness(belowThreshold)).toBeGreaterThan(0.8);
    // Above 0.5 lightness -> dark foreground
    expect(getLightness(aboveThreshold)).toBeLessThan(0.2);
  });

  it('returns high-contrast foreground colors', () => {
    const bg1 = 'oklch(0.62 0.18 250)';
    const fg1 = deriveForeground(bg1);

    // Should be valid OKLCH
    expect(fg1).toMatch(/^oklch\(/);

    // Should have low chroma (near neutral)
    const match = fg1.match(/oklch\([\d.]+ ([\d.]+)/);
    expect(match).toBeTruthy();
    if (match) {
      const chroma = parseFloat(match[1]);
      // Foreground colors should be low chroma for readability
      expect(chroma).toBeLessThanOrEqual(0.03);
    }
  });

  it('handles achromatic backgrounds', () => {
    const grayBg = 'oklch(0.5 0 0)';
    const foreground = deriveForeground(grayBg);

    // Should be valid and not contain NaN
    expect(foreground).toMatch(/^oklch\(/);
    expect(foreground).not.toContain('NaN');
  });
});
