/**
 * Theme Configuration Encoding/Decoding
 *
 * Provides URL-safe encoding and decoding utilities for theme configurations.
 * Uses base64url encoding (RFC 4648) for compatibility with CLI parameters
 * and URLs without special character escaping.
 *
 * The encoded format is:
 *   JSON.stringify(config) -> base64url encode
 *
 * This allows the encoded string to be:
 * - Passed as --theme=<encoded> CLI parameter
 * - Used in URLs without escaping
 * - Decoded with standard tools for debugging
 */

import { themeConfigSchema, type ThemeConfig } from "./schema.js";

/**
 * Base64url alphabet: A-Z, a-z, 0-9, -, _ (no padding)
 * RFC 4648 Section 5
 */
const BASE64URL_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * Encodes a ThemeConfig to a URL-safe base64url string.
 *
 * The encoded string:
 * - Contains only A-Z, a-z, 0-9, -, _ characters
 * - Has no padding (=) characters
 * - Is safe for URLs and shell parameters
 *
 * @param config - Valid ThemeConfig object
 * @returns URL-safe base64url encoded string
 *
 * @example
 * ```ts
 * const encoded = encodeThemeConfig(myTheme);
 * // Use in CLI: --theme=eyJ2ZXJzaW9uIjoxLC...
 * ```
 */
export function encodeThemeConfig(config: ThemeConfig): string {
  const json = JSON.stringify(config);
  return Buffer.from(json, "utf-8").toString("base64url");
}

/**
 * Decodes a base64url encoded string to a validated ThemeConfig.
 *
 * Performs four-stage validation:
 * 1. Base64url format validation (catches invalid characters)
 * 2. Base64url decoding
 * 3. JSON parsing (catches malformed JSON)
 * 4. Zod schema validation (catches invalid config structure)
 *
 * @param encoded - base64url encoded theme configuration string
 * @returns Validated ThemeConfig object
 * @throws Error with descriptive message for each failure mode:
 *   - "Invalid theme encoding: unable to decode base64"
 *   - "Invalid theme encoding: malformed JSON"
 *   - "Invalid theme config: [zod validation errors]"
 *
 * @example
 * ```ts
 * try {
 *   const config = decodeThemeConfig(encodedString);
 *   // config is guaranteed to be valid ThemeConfig
 * } catch (error) {
 *   // Handle invalid encoding
 * }
 * ```
 */
export function decodeThemeConfig(encoded: string): ThemeConfig {
  // Stage 1: Validate base64url format
  if (!encoded || !BASE64URL_REGEX.test(encoded)) {
    throw new Error("Invalid theme encoding: unable to decode base64");
  }

  // Stage 2: Base64url decode
  const json = Buffer.from(encoded, "base64url").toString("utf-8");

  // Stage 3: JSON parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid theme encoding: malformed JSON");
  }

  // Stage 4: Zod schema validation
  const result = themeConfigSchema.safeParse(parsed);
  if (!result.success) {
    // Format Zod errors into readable message
    const errorDetails = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid theme config: ${errorDetails}`);
  }

  return result.data;
}
