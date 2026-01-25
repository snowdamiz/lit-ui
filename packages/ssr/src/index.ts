// @lit-ui/ssr - Server-side rendering utilities for Lit components

import type { TemplateResult } from 'lit';
import type { RenderInfo } from '@lit-labs/ssr';

// Re-export core SSR functions
export { render, html } from '@lit-labs/ssr';
export { collectResult, collectResultSync } from '@lit-labs/ssr/lib/render-result.js';
export { RenderResultReadable } from '@lit-labs/ssr/lib/render-result-readable.js';

// Re-export isServer for conditional logic
export { isServer } from 'lit';

// Re-export types
export type { RenderInfo, RenderResult } from './types.js';

// Import for internal use
import { render as _render } from '@lit-labs/ssr';
import { collectResult as _collectResult } from '@lit-labs/ssr/lib/render-result.js';

/**
 * Render a Lit template to an HTML string.
 * This is a convenience wrapper around render() + collectResult().
 *
 * @example
 * ```typescript
 * import { renderToString, html } from '@lit-ui/ssr';
 *
 * const htmlString = await renderToString(html`
 *   <lui-button variant="primary">Click Me</lui-button>
 * `);
 * ```
 */
export async function renderToString(
  template: TemplateResult,
  options?: Partial<RenderInfo>
): Promise<string> {
  const result = _render(template, options);
  return _collectResult(result);
}

export const VERSION = '0.0.1';
