/**
 * Custom Event Utilities
 *
 * Helpers for dispatching typed custom events from Lit components.
 */

export interface CustomEventOptions {
  bubbles?: boolean;
  composed?: boolean;
  cancelable?: boolean;
}

const defaultOptions: CustomEventOptions = {
  bubbles: true,
  composed: true, // Cross shadow DOM boundary
  cancelable: false,
};

/**
 * Dispatch a typed custom event from a component.
 *
 * @param element - The element dispatching the event
 * @param eventName - Event type name
 * @param detail - Event detail payload
 * @param options - Event options (defaults: bubbles: true, composed: true)
 * @returns Whether the event was cancelled
 *
 * @example
 * ```typescript
 * dispatchCustomEvent(this, 'ui-change', { value: 'new value' });
 * ```
 */
export function dispatchCustomEvent<T>(
  element: HTMLElement,
  eventName: string,
  detail?: T,
  options: CustomEventOptions = {}
): boolean {
  const event = new CustomEvent<T>(eventName, {
    detail,
    ...defaultOptions,
    ...options,
  });
  return element.dispatchEvent(event);
}
