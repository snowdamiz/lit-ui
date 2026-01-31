/**
 * JSX type declarations for lui-date-picker custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { DatePicker } from './date-picker.js';

// Attributes for lui-date-picker
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
        React.HTMLAttributes<DatePicker> & LuiDatePickerAttributes & LuiDatePickerEvents,
        DatePicker
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-date-picker': import('vue').DefineComponent<LuiDatePickerAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-date-picker': LuiDatePickerAttributes & {
      'on:change'?: (e: CustomEvent<{ date: Date | null; isoString: string }>) => void;
    };
  }
}

export {};
