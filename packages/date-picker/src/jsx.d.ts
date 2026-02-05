/**
 * JSX type declarations for lui-date-picker custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { DatePicker } from './date-picker.js';
import type { DatePreset } from './preset-types.js';

// Attributes for lui-date-picker (HTML attributes, reflected)
interface LuiDatePickerAttributes {
  value?: string;
  name?: string;
  locale?: string;
  placeholder?: string;
  'helper-text'?: string;
  'min-date'?: string;
  'max-date'?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  inline?: boolean;
}

// Properties (presets is now also an attribute; format remains JS-only)
interface LuiDatePickerProperties {
  presets?: DatePreset[] | boolean;
  format?: Intl.DateTimeFormatOptions | null;
}

// Event handler types
interface LuiDatePickerEvents {
  onChange?: (e: CustomEvent<{ date: Date | null; isoString: string }>) => void;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-date-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<DatePicker> & LuiDatePickerAttributes & LuiDatePickerProperties & LuiDatePickerEvents,
        DatePicker
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-date-picker': import('vue').DefineComponent<LuiDatePickerAttributes & LuiDatePickerProperties>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-date-picker': LuiDatePickerAttributes & LuiDatePickerProperties & {
      'on:change'?: (e: CustomEvent<{ date: Date | null; isoString: string }>) => void;
    };
  }
}

export {};
