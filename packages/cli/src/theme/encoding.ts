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
 * Converts a UTF-8 string to base64url encoding.
 * Works in both Node.js and browser environments.
 */
function toBase64Url(str: string): string {
  // Use Buffer in Node.js, btoa in browser
  if (typeof Buffer !== "undefined" && Buffer.from) {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  // Browser: btoa only handles Latin1, so encode UTF-8 first
  const base64 = btoa(unescape(encodeURIComponent(str)));
  // Convert standard base64 to base64url
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Converts a base64url encoded string to UTF-8.
 * Works in both Node.js and browser environments.
 */
function fromBase64Url(base64url: string): string {
  // Use Buffer in Node.js
  if (typeof Buffer !== "undefined" && Buffer.from) {
    return Buffer.from(base64url, "base64url").toString("utf-8");
  }
  // Browser: convert base64url to standard base64
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  while (base64.length % 4) {
    base64 += "=";
  }
  // atob returns Latin1, so decode UTF-8
  return decodeURIComponent(escape(atob(base64)));
}

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
  return toBase64Url(json);
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
  const json = fromBase64Url(encoded);

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
