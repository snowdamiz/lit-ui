/**
 * UI Button component for live preview in documentation
 *
 * This module exports the Button component and registers it as a custom element.
 * Import this file for its side effect (custom element registration).
 *
 * @example
 * ```tsx
 * // Side-effect import to register the element
 * import '../lib/ui-button';
 *
 * // Then use in JSX
 * <ui-button variant="primary">Click me</ui-button>
 * ```
 */

export { Button } from './button';
export type { ButtonVariant, ButtonSize, ButtonType } from './button';
