import { describe, it, expect } from "vitest";
import { defaultTheme } from "../../src/theme/defaults";
import type { ThemeConfig } from "../../src/theme/schema";

// Import the functions we'll implement
import { encodeThemeConfig, decodeThemeConfig } from "../../src/theme/encoding";

describe("encodeThemeConfig", () => {
  it("returns a URL-safe base64url string", () => {
    const encoded = encodeThemeConfig(defaultTheme);

    // Should be a non-empty string
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    // Should contain only URL-safe characters (base64url alphabet)
    // base64url uses: A-Z, a-z, 0-9, -, _ (no +, /, or =)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("produces no URL-special characters (no +, /, or =)", () => {
    const encoded = encodeThemeConfig(defaultTheme);

    // These characters would cause issues in URLs and shell escaping
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("encodes a custom theme config", () => {
    const customConfig: ThemeConfig = {
      version: 1,
      colors: {
        primary: "oklch(0.6 0.2 200)",
        secondary: "oklch(0.8 0.1 200)",
        destructive: "oklch(0.55 0.22 25)",
        background: "oklch(0.98 0.01 250)",
        foreground: "oklch(0.15 0.02 250)",
        muted: "oklch(0.92 0.02 250)",
      },
      radius: "lg",
    };

    const encoded = encodeThemeConfig(customConfig);

    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("decodeThemeConfig", () => {
  describe("round-trip", () => {
    it("round-trips the default theme exactly", () => {
      const encoded = encodeThemeConfig(defaultTheme);
      const decoded = decodeThemeConfig(encoded);

      expect(decoded).toEqual(defaultTheme);
    });

    it("round-trips a custom config with all fields", () => {
      const customConfig: ThemeConfig = {
        version: 1,
        colors: {
          primary: "oklch(0.6 0.2 200)",
          secondary: "oklch(0.8 0.1 200)",
          destructive: "oklch(0.55 0.22 25)",
          background: "oklch(0.98 0.01 250)",
          foreground: "oklch(0.15 0.02 250)",
          muted: "oklch(0.92 0.02 250)",
        },
        radius: "lg",
      };

      const encoded = encodeThemeConfig(customConfig);
      const decoded = decodeThemeConfig(encoded);

      expect(decoded).toEqual(customConfig);
    });

    it("round-trips a config with sm radius", () => {
      const config: ThemeConfig = {
        ...defaultTheme,
        radius: "sm",
      };

      const encoded = encodeThemeConfig(config);
      const decoded = decodeThemeConfig(encoded);

      expect(decoded).toEqual(config);
    });
  });

  describe("error handling", () => {
    it("throws descriptive error for invalid base64", () => {
      const invalidBase64 = "!!!not-valid-base64!!!";

      expect(() => decodeThemeConfig(invalidBase64)).toThrow(
        "Invalid theme encoding: unable to decode base64"
      );
    });

    it("throws descriptive error for malformed JSON", () => {
      // Valid base64url but decodes to invalid JSON
      // "not json" encoded as base64url
      const validBase64InvalidJson = Buffer.from("not json", "utf-8").toString(
        "base64url"
      );

      expect(() => decodeThemeConfig(validBase64InvalidJson)).toThrow(
        "Invalid theme encoding: malformed JSON"
      );
    });

    it("throws descriptive error for invalid schema (missing field)", () => {
      // Valid JSON but doesn't match ThemeConfig schema
      const invalidSchema = { version: 1 }; // missing colors and radius
      const encoded = Buffer.from(JSON.stringify(invalidSchema), "utf-8").toString(
        "base64url"
      );

      expect(() => decodeThemeConfig(encoded)).toThrow(
        "Invalid theme config:"
      );
    });

    it("throws descriptive error for invalid schema (wrong color format)", () => {
      const invalidSchema = {
        version: 1,
        colors: {
          primary: "#ff0000", // hex instead of OKLCH
          secondary: "oklch(0.8 0.1 200)",
          destructive: "oklch(0.55 0.22 25)",
          background: "oklch(0.98 0.01 250)",
          foreground: "oklch(0.15 0.02 250)",
          muted: "oklch(0.92 0.02 250)",
        },
        radius: "md",
      };
      const encoded = Buffer.from(JSON.stringify(invalidSchema), "utf-8").toString(
        "base64url"
      );

      expect(() => decodeThemeConfig(encoded)).toThrow(
        "Invalid theme config:"
      );
    });

    it("throws descriptive error for invalid schema (wrong version)", () => {
      const invalidSchema = {
        version: 2, // only version 1 is valid
        colors: {
          primary: "oklch(0.6 0.2 200)",
          secondary: "oklch(0.8 0.1 200)",
          destructive: "oklch(0.55 0.22 25)",
          background: "oklch(0.98 0.01 250)",
          foreground: "oklch(0.15 0.02 250)",
          muted: "oklch(0.92 0.02 250)",
        },
        radius: "md",
      };
      const encoded = Buffer.from(JSON.stringify(invalidSchema), "utf-8").toString(
        "base64url"
      );

      expect(() => decodeThemeConfig(encoded)).toThrow(
        "Invalid theme config:"
      );
    });

    it("throws descriptive error for invalid schema (invalid radius)", () => {
      const invalidSchema = {
        version: 1,
        colors: {
          primary: "oklch(0.6 0.2 200)",
          secondary: "oklch(0.8 0.1 200)",
          destructive: "oklch(0.55 0.22 25)",
          background: "oklch(0.98 0.01 250)",
          foreground: "oklch(0.15 0.02 250)",
          muted: "oklch(0.92 0.02 250)",
        },
        radius: "xl", // invalid radius
      };
      const encoded = Buffer.from(JSON.stringify(invalidSchema), "utf-8").toString(
        "base64url"
      );

      expect(() => decodeThemeConfig(encoded)).toThrow(
        "Invalid theme config:"
      );
    });

    it("throws error for empty string input", () => {
      expect(() => decodeThemeConfig("")).toThrow();
    });
  });
});

describe("encoding format", () => {
  it("encoded string can be decoded with standard tools (base64url)", () => {
    const encoded = encodeThemeConfig(defaultTheme);

    // Verify the encoded string can be decoded using Node's Buffer
    // This proves it's standard base64url, not a custom format
    const decoded = Buffer.from(encoded, "base64url").toString("utf-8");

    // Should be valid JSON
    const parsed = JSON.parse(decoded);

    // Should have expected structure
    expect(parsed).toHaveProperty("version", 1);
    expect(parsed).toHaveProperty("colors");
    expect(parsed).toHaveProperty("radius");
  });
});
