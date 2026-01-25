/**
 * Integration Tests for Theme Pipeline
 *
 * These tests verify the complete theme workflow:
 * config -> encode -> decode -> CSS
 *
 * This is the capstone test suite that proves all components work together.
 */

import { describe, it, expect } from "vitest";
import { defu } from "defu";
import {
  ThemeConfig,
  PartialThemeConfig,
  themeConfigSchema,
  defaultTheme,
  mergeThemeConfig,
  encodeThemeConfig,
  decodeThemeConfig,
  generateThemeCSS,
} from "../../src/theme/index.js";

describe("Theme Pipeline Integration", () => {
  describe("Full pipeline: config -> encode -> decode -> CSS", () => {
    it("should complete full round-trip with custom theme", () => {
      // Create a custom theme
      const customTheme: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.6 0.2 250)",
          secondary: "oklch(0.85 0.05 200)",
          destructive: "oklch(0.55 0.22 25)",
          background: "oklch(0.98 0.01 250)",
          foreground: "oklch(0.15 0.02 250)",
          muted: "oklch(0.90 0.02 250)",
        },
        radius: "lg",
      };

      // Encode
      const encoded = encodeThemeConfig(customTheme);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe("string");

      // Decode
      const decoded = decodeThemeConfig(encoded);
      expect(decoded).toEqual(customTheme);

      // Generate CSS
      const css = generateThemeCSS(decoded);
      expect(css).toContain(":root");
      expect(css).toContain(".dark");
      expect(css).toContain("@media (prefers-color-scheme: dark)");

      // Verify custom values appear in CSS
      expect(css).toContain("oklch(0.6 0.2 250)"); // primary
      expect(css).toContain("--lui-radius-lg: 0.75rem"); // lg radius
    });

    it("should preserve all color values through round-trip", () => {
      const original = defaultTheme;

      // Round-trip
      const encoded = encodeThemeConfig(original);
      const decoded = decodeThemeConfig(encoded);

      // Deep equality
      expect(decoded.version).toBe(original.version);
      expect(decoded.colors.primary).toBe(original.colors.primary);
      expect(decoded.colors.secondary).toBe(original.colors.secondary);
      expect(decoded.colors.destructive).toBe(original.colors.destructive);
      expect(decoded.colors.background).toBe(original.colors.background);
      expect(decoded.colors.foreground).toBe(original.colors.foreground);
      expect(decoded.colors.muted).toBe(original.colors.muted);
      expect(decoded.radius).toBe(original.radius);
    });

    it("should generate complete CSS with all expected variables", () => {
      const css = generateThemeCSS(defaultTheme);

      // All semantic colors present
      expect(css).toContain("--lui-primary:");
      expect(css).toContain("--lui-primary-foreground:");
      expect(css).toContain("--lui-secondary:");
      expect(css).toContain("--lui-secondary-foreground:");
      expect(css).toContain("--lui-destructive:");
      expect(css).toContain("--lui-destructive-foreground:");
      expect(css).toContain("--lui-background:");
      expect(css).toContain("--lui-foreground:");
      expect(css).toContain("--lui-muted:");
      expect(css).toContain("--lui-muted-foreground:");

      // Border radius tokens
      expect(css).toContain("--lui-radius-sm:");
      expect(css).toContain("--lui-radius-md:");
      expect(css).toContain("--lui-radius-lg:");
    });
  });

  describe("Partial config merging", () => {
    it("should produce complete CSS from partial config with just primary color", () => {
      // User only specifies primary color
      const partial: PartialThemeConfig = {
        colors: {
          primary: "oklch(0.55 0.25 280)", // Custom purple
        },
      };

      // Merge with defaults
      const merged = mergeThemeConfig(partial);

      // Verify merge worked
      expect(merged.version).toBe(1);
      expect(merged.colors.primary).toBe("oklch(0.55 0.25 280)"); // Custom
      expect(merged.colors.secondary).toBe(defaultTheme.colors.secondary); // Default
      expect(merged.radius).toBe(defaultTheme.radius); // Default

      // Generate CSS
      const css = generateThemeCSS(merged);

      // All variables present (defaults filled in)
      expect(css).toContain("--lui-primary: oklch(0.55 0.25 280)");
      expect(css).toContain(`--lui-secondary: ${defaultTheme.colors.secondary}`);
      expect(css).toContain("--lui-radius-md:"); // default is md
    });

    it("should merge only specified properties", () => {
      const partial: PartialThemeConfig = {
        radius: "sm",
        colors: {
          destructive: "oklch(0.5 0.3 10)", // Brighter red
        },
      };

      const merged = mergeThemeConfig(partial);

      // Custom values
      expect(merged.radius).toBe("sm");
      expect(merged.colors.destructive).toBe("oklch(0.5 0.3 10)");

      // Defaults preserved
      expect(merged.colors.primary).toBe(defaultTheme.colors.primary);
      expect(merged.colors.secondary).toBe(defaultTheme.colors.secondary);
      expect(merged.colors.background).toBe(defaultTheme.colors.background);
      expect(merged.colors.foreground).toBe(defaultTheme.colors.foreground);
      expect(merged.colors.muted).toBe(defaultTheme.colors.muted);
    });

    it("should allow defu to merge partial configs directly", () => {
      const partial = {
        colors: {
          primary: "oklch(0.6 0.2 200)",
        },
      };

      // Using defu directly (same as mergeThemeConfig internally)
      const merged = defu(partial, defaultTheme) as ThemeConfig;

      // Validate with schema
      const result = themeConfigSchema.safeParse(merged);
      expect(result.success).toBe(true);

      // Verify CSS generation works
      const css = generateThemeCSS(merged);
      expect(css).toContain("--lui-primary: oklch(0.6 0.2 200)");
    });
  });

  describe("CLI simulation", () => {
    it("should handle typical CLI workflow: parse -> decode -> validate -> generate", () => {
      // Simulate CLI receiving encoded theme from --config parameter
      const cliInput = encodeThemeConfig(defaultTheme);

      // Step 1: Decode (includes validation)
      const config = decodeThemeConfig(cliInput);

      // Step 2: Additional schema validation (defensive)
      const validation = themeConfigSchema.safeParse(config);
      expect(validation.success).toBe(true);

      // Step 3: Generate CSS
      const css = generateThemeCSS(config);

      // Step 4: Verify output is complete and valid
      expect(css).toBeTruthy();
      expect(css.length).toBeGreaterThan(500); // Reasonable CSS size
      expect(css).toContain(":root {");
      expect(css).toContain(".dark {");
    });

    it("should handle custom theme from web configurator", () => {
      // Simulate theme from web configurator
      const configuratorTheme: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.62 0.18 220)", // Blue brand
          secondary: "oklch(0.88 0.04 220)",
          destructive: "oklch(0.55 0.22 25)",
          background: "oklch(0.99 0.005 220)",
          foreground: "oklch(0.12 0.03 220)",
          muted: "oklch(0.93 0.02 220)",
        },
        radius: "md",
      };

      // Configurator encodes for URL
      const urlParam = encodeThemeConfig(configuratorTheme);

      // CLI receives from redirect/copy-paste
      const decoded = decodeThemeConfig(urlParam);

      // Generate CSS for project
      const css = generateThemeCSS(decoded);

      // Brand color appears in output
      expect(css).toContain("oklch(0.62 0.18 220)");
    });

    it("should produce deterministic CSS output", () => {
      // Same config should always produce same CSS
      const config = defaultTheme;

      const css1 = generateThemeCSS(config);
      const css2 = generateThemeCSS(config);

      expect(css1).toBe(css2);
    });
  });

  describe("Error propagation", () => {
    it("should provide descriptive error for invalid base64 encoding", () => {
      const invalidEncoded = "not!valid@base64$";

      expect(() => decodeThemeConfig(invalidEncoded)).toThrow(
        "Invalid theme encoding: unable to decode base64"
      );
    });

    it("should provide descriptive error for malformed JSON", () => {
      // Valid base64url but not valid JSON
      const notJson = Buffer.from("{invalid json}", "utf-8").toString("base64url");

      expect(() => decodeThemeConfig(notJson)).toThrow(
        "Invalid theme encoding: malformed JSON"
      );
    });

    it("should provide descriptive error for invalid schema", () => {
      // Valid JSON but wrong structure
      const wrongSchema = Buffer.from(
        JSON.stringify({ version: 2, invalid: true }),
        "utf-8"
      ).toString("base64url");

      expect(() => decodeThemeConfig(wrongSchema)).toThrow("Invalid theme config:");
    });

    it("should explain specific schema validation failures", () => {
      // Missing required fields
      const incomplete = Buffer.from(
        JSON.stringify({ version: 1, colors: { primary: "red" }, radius: "md" }),
        "utf-8"
      ).toString("base64url");

      try {
        decodeThemeConfig(incomplete);
        expect.fail("Should have thrown");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain("Invalid theme config:");
        // Should mention what's wrong (invalid OKLCH format or missing fields)
        expect(message.length).toBeGreaterThan(20); // Not just generic error
      }
    });

    it("should provide actionable error for CLI users", () => {
      const badInput = "abc123"; // Valid base64url chars but decodes to garbage

      try {
        decodeThemeConfig(badInput);
        expect.fail("Should have thrown");
      } catch (error) {
        const message = (error as Error).message;
        // Error should be clear about what went wrong
        expect(
          message.includes("encoding") ||
            message.includes("JSON") ||
            message.includes("config")
        ).toBe(true);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle theme with extreme but valid OKLCH values", () => {
      const extremeTheme: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.99 0.01 0)", // Near white
          secondary: "oklch(0.01 0.01 180)", // Near black
          destructive: "oklch(0.5 0.4 30)", // High chroma red
          background: "oklch(1 0 0)", // Pure white
          foreground: "oklch(0 0 0)", // Pure black
          muted: "oklch(0.5 0 0)", // Pure gray
        },
        radius: "sm",
      };

      // Should work through entire pipeline
      const encoded = encodeThemeConfig(extremeTheme);
      const decoded = decodeThemeConfig(encoded);
      const css = generateThemeCSS(decoded);

      expect(css).toContain("oklch(0.99 0.01 0)");
      expect(css).toContain("oklch(0.01 0.01 180)");
    });

    it("should handle each radius option", () => {
      const radii: Array<ThemeConfig["radius"]> = ["sm", "md", "lg"];

      for (const radius of radii) {
        const config: ThemeConfig = { ...defaultTheme, radius };
        const css = generateThemeCSS(config);

        // Each option should produce valid CSS
        expect(css).toContain("--lui-radius-sm:");
        expect(css).toContain("--lui-radius-md:");
        expect(css).toContain("--lui-radius-lg:");
      }
    });

    it("should maintain type safety through pipeline", () => {
      // TypeScript should catch type errors at compile time
      // This test verifies runtime behavior matches types

      const config: ThemeConfig = defaultTheme;

      // Type assertions should not throw
      const encoded: string = encodeThemeConfig(config);
      const decoded: ThemeConfig = decodeThemeConfig(encoded);
      const css: string = generateThemeCSS(decoded);

      expect(typeof encoded).toBe("string");
      expect(decoded.version).toBe(1);
      expect(typeof css).toBe("string");
    });
  });
});
