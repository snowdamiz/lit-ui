// Shadow DOM-safe Floating UI wrapper for @lit-ui/core
// Uses composed-offset-position ponyfill to fix incorrect offsetParent in Shadow DOM

import {
  computePosition as _computePosition,
  autoUpdate as _autoUpdate,
  platform,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type AutoUpdateOptions,
} from '@floating-ui/dom';
import { offsetParent } from 'composed-offset-position';

// Re-export middleware for downstream consumers
export { flip, shift, offset, arrow, size } from '@floating-ui/dom';
export type { Placement, MiddlewareData } from '@floating-ui/dom';

/**
 * Shadow DOM-safe platform configuration.
 * Overrides getOffsetParent to use composed-offset-position ponyfill,
 * fixing incorrect positioning inside nested shadow roots.
 */
const shadowDomPlatform = {
  ...platform,
  getOffsetParent: (element: Element) =>
    platform.getOffsetParent(element, offsetParent),
};

/**
 * Compute position with Shadow DOM-safe platform.
 * Drop-in replacement for @floating-ui/dom computePosition.
 */
export function computePosition(
  reference: Element,
  floating: HTMLElement,
  config?: Partial<ComputePositionConfig>
): Promise<ComputePositionReturn> {
  return _computePosition(reference, floating, {
    ...config,
    platform: shadowDomPlatform,
  });
}

/**
 * Auto-update position on scroll/resize with cleanup.
 * Returns a cleanup function to call in disconnectedCallback.
 */
export function autoUpdatePosition(
  reference: Element,
  floating: HTMLElement,
  update: () => void,
  options?: AutoUpdateOptions
): () => void {
  return _autoUpdate(reference, floating, update, options);
}
