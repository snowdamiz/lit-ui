/**
 * Environment Detection Utilities
 *
 * Re-exports and helpers for SSR-safe environment detection.
 */

// Re-export isServer from lit for convenience
export { isServer } from 'lit';

/**
 * Check if constructable stylesheets are supported.
 * Always false on server, feature-detected on client.
 */
export const hasConstructableStylesheets =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.CSSStyleSheet?.prototype?.replaceSync === 'function';
