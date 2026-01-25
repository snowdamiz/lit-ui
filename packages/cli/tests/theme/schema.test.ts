import { describe, it, expect } from "vitest";
import { themeConfigSchema, type ThemeConfig } from "../../src/theme/schema";
import { defaultTheme, mergeThemeConfig } from "../../src/theme/defaults";

describe("themeConfigSchema", () => {
  describe("OKLCH validation", () => {
    it("accepts valid OKLCH color string", () => {
      const config: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("accepts OKLCH with decimal values", () => {
      const config: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.625 0.185 250.5)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("rejects invalid format rgb(255, 0, 0) with descriptive error", () => {
      const config = {
        version: 1,
        colors: {
          primary: "rgb(255, 0, 0)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("Invalid OKLCH format");
      }
    });

    it("rejects hex color format", () => {
      const config = {
        version: 1,
        colors: {
          primary: "#3b82f6",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it("rejects hsl color format", () => {
      const config = {
        version: 1,
        colors: {
          primary: "hsl(217, 91%, 60%)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe("required fields", () => {
    it("fails when required field is missing", () => {
      const config = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          // missing secondary, destructive, background, foreground, muted
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have descriptive error about missing fields
        const errorPaths = result.error.issues.map((issue) => issue.path.join("."));
        expect(errorPaths.some((p) => p.includes("secondary"))).toBe(true);
      }
    });

    it("fails when colors object is missing", () => {
      const config = {
        version: 1,
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it("fails when version is missing", () => {
      const config = {
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe("radius validation", () => {
    it("accepts valid radius value sm", () => {
      const config: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "sm",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("accepts valid radius value lg", () => {
      const config: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "lg",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("rejects invalid radius value xl", () => {
      const config = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "xl",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it("rejects invalid radius value none", () => {
      const config = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "none",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe("version validation", () => {
    it("accepts version 1", () => {
      const config: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("rejects version other than 1", () => {
      const config = {
        version: 2,
        colors: {
          primary: "oklch(0.62 0.18 250)",
          secondary: "oklch(0.92 0.02 250)",
          destructive: "oklch(0.65 0.23 25)",
          background: "oklch(1 0 0)",
          foreground: "oklch(0.15 0 0)",
          muted: "oklch(0.95 0.01 250)",
        },
        radius: "md",
      };

      const result = themeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});

describe("defaultTheme", () => {
  it("has version 1", () => {
    expect(defaultTheme.version).toBe(1);
  });

  it("has all 6 base colors", () => {
    expect(defaultTheme.colors).toHaveProperty("primary");
    expect(defaultTheme.colors).toHaveProperty("secondary");
    expect(defaultTheme.colors).toHaveProperty("destructive");
    expect(defaultTheme.colors).toHaveProperty("background");
    expect(defaultTheme.colors).toHaveProperty("foreground");
    expect(defaultTheme.colors).toHaveProperty("muted");
  });

  it("has all colors as valid OKLCH strings", () => {
    const oklchRegex = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

    expect(defaultTheme.colors.primary).toMatch(oklchRegex);
    expect(defaultTheme.colors.secondary).toMatch(oklchRegex);
    expect(defaultTheme.colors.destructive).toMatch(oklchRegex);
    expect(defaultTheme.colors.background).toMatch(oklchRegex);
    expect(defaultTheme.colors.foreground).toMatch(oklchRegex);
    expect(defaultTheme.colors.muted).toMatch(oklchRegex);
  });

  it("has neutral gray colors with low chroma", () => {
    // Extract chroma values from OKLCH strings
    // OKLCH format: oklch(L C H) where C is chroma (0-0.4 typical range)
    // Neutral gray should have very low chroma (~0.02-0.05)
    const extractChroma = (oklch: string): number => {
      const match = oklch.match(/oklch\(\s*[\d.]+\s+([\d.]+)\s+[\d.]+\s*\)/);
      return match ? parseFloat(match[1]) : -1;
    };

    // Background and foreground should be near-neutral (chroma < 0.05)
    expect(extractChroma(defaultTheme.colors.background)).toBeLessThan(0.05);
    expect(extractChroma(defaultTheme.colors.foreground)).toBeLessThan(0.05);
    expect(extractChroma(defaultTheme.colors.muted)).toBeLessThan(0.05);
    expect(extractChroma(defaultTheme.colors.secondary)).toBeLessThan(0.05);
  });

  it("has default radius of md", () => {
    expect(defaultTheme.radius).toBe("md");
  });

  it("validates against schema", () => {
    const result = themeConfigSchema.safeParse(defaultTheme);
    expect(result.success).toBe(true);
  });
});

describe("mergeThemeConfig", () => {
  it("merges partial config with defaults", () => {
    const partial = {
      colors: {
        primary: "oklch(0.5 0.2 30)",
      },
    };

    const merged = mergeThemeConfig(partial);

    // Should have the overridden primary
    expect(merged.colors.primary).toBe("oklch(0.5 0.2 30)");

    // Should have all other defaults filled in
    expect(merged.version).toBe(1);
    expect(merged.colors.secondary).toBe(defaultTheme.colors.secondary);
    expect(merged.colors.destructive).toBe(defaultTheme.colors.destructive);
    expect(merged.colors.background).toBe(defaultTheme.colors.background);
    expect(merged.colors.foreground).toBe(defaultTheme.colors.foreground);
    expect(merged.colors.muted).toBe(defaultTheme.colors.muted);
    expect(merged.radius).toBe(defaultTheme.radius);
  });

  it("preserves nested structure on deep merge", () => {
    const partial = {
      colors: {
        primary: "oklch(0.6 0.2 200)",
        secondary: "oklch(0.8 0.1 200)",
      },
      radius: "lg" as const,
    };

    const merged = mergeThemeConfig(partial);

    expect(merged.colors.primary).toBe("oklch(0.6 0.2 200)");
    expect(merged.colors.secondary).toBe("oklch(0.8 0.1 200)");
    expect(merged.colors.destructive).toBe(defaultTheme.colors.destructive);
    expect(merged.radius).toBe("lg");
  });

  it("returns valid ThemeConfig that passes schema", () => {
    const partial = {
      colors: {
        primary: "oklch(0.5 0.2 30)",
      },
    };

    const merged = mergeThemeConfig(partial);
    const result = themeConfigSchema.safeParse(merged);

    expect(result.success).toBe(true);
  });

  it("returns default when given empty object", () => {
    const merged = mergeThemeConfig({});

    expect(merged.version).toBe(defaultTheme.version);
    expect(merged.colors).toEqual(defaultTheme.colors);
    expect(merged.radius).toBe(defaultTheme.radius);
  });
});
