/**
 * UI Dialog component for live preview in documentation
 *
 * This module exports the Dialog component and registers it as a custom element.
 * Import this file for its side effect (custom element registration).
 *
 * @example
 * ```tsx
 * // Side-effect import to register the element
 * import '../lib/ui-dialog';
 *
 * // Then use in JSX
 * <ui-dialog open>
 *   <span slot="title">Title</span>
 *   <p>Content</p>
 * </ui-dialog>
 * ```
 */

export { Dialog } from './dialog';
export type { DialogSize, CloseReason } from './dialog';
