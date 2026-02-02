// @lit-ui/time-picker - Accessible time picker component with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component class
export { TimePicker } from './time-picker.js';

// Export utility functions for consumer reuse
export {
  parseTimeISO,
  timeToISO,
  formatTimeForDisplay,
  getDefaultHourCycle,
  to12Hour,
  to24Hour,
  isEndTimeAfterStart,
} from './time-utils.js';
export type { TimeValue } from './time-utils.js';

// Export preset types and defaults
export type { TimePreset } from './time-presets.js';
export { DEFAULT_TIME_PRESETS, resolveNow } from './time-presets.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Export new sub-component classes for advanced consumers
export { TimezoneDisplay } from './timezone-display.js';
export { TimeRangeSlider } from './time-range-slider.js';
export { TimeScrollWheel } from './time-scroll-wheel.js';
export { TimeVoiceInput } from './time-voice-input.js';

// Import internal components to ensure they are registered
import './time-input.js';
import './clock-face.js';
import './time-dropdown.js';
import './timezone-display.js';
import './time-range-slider.js';
import './time-scroll-wheel.js';
import './time-voice-input.js';

// Safe custom element registration with collision detection
import { TimePicker } from './time-picker.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-time-picker')) {
    customElements.define('lui-time-picker', TimePicker);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-time-picker] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}
