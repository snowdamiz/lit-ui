// @lit-ui/date-range-picker - Accessible date range picker component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class
export { DateRangePicker } from './date-range-picker.js';

// Export range utilities for consumer reuse
export {
  isDateInRange,
  isDateInPreview,
  validateRangeDuration,
  formatISOInterval,
  normalizeRange,
} from './range-utils.js';

export type { RangeValidation } from './range-utils.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Import calendar to ensure it's registered when date-range-picker is used
import '@lit-ui/calendar';

// Safe custom element registration with collision detection
import { DateRangePicker } from './date-range-picker.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-date-range-picker')) {
    customElements.define('lui-date-range-picker', DateRangePicker);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-date-range-picker] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}
