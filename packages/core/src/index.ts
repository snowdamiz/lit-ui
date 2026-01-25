// @lit-ui/core - SSR-aware base class for Tailwind-styled web components

export { TailwindElement } from './tailwind-element.js';

// Re-export isServer for component authors to use directly
export { isServer } from 'lit';

// Utility exports
export { dispatchCustomEvent, hasConstructableStylesheets } from './utils/index.js';

export const VERSION = '0.0.1';
