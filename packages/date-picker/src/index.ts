// @lit-ui/date-picker - Accessible date picker component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class
export { DatePicker } from './date-picker.js';

// Export parser utilities for consumer reuse
export {
  parseDateInput,
  formatDateForDisplay,
  getPlaceholderText,
} from './date-input-parser.js';

// Export natural language parsing
export { parseNaturalLanguage } from './natural-language.js';

// Export preset types and defaults
export type { DatePreset } from './preset-types.js';
export { DEFAULT_PRESETS } from './preset-types.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Import calendar to ensure it's registered when date-picker is used
import '@lit-ui/calendar';

// Safe custom element registration with collision detection
import { DatePicker } from './date-picker.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-date-picker')) {
    customElements.define('lui-date-picker', DatePicker);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-date-picker] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}
