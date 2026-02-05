/**
 * JSX type declarations for lui-date-range-picker custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { DateRangePicker } from './date-range-picker.js';

// Attributes for lui-date-range-picker (HTML attributes, reflected)
interface LuiDateRangePickerAttributes {
  'start-date'?: string;
  'end-date'?: string;
  name?: string;
  locale?: string;
  placeholder?: string;
  'helper-text'?: string;
  'min-date'?: string;
  'max-date'?: string;
  'min-days'?: number;
  'max-days'?: number;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  comparison?: boolean;
  'compare-start-date'?: string;
  'compare-end-date'?: string;
  presets?: boolean;
}

// Event handler types
interface LuiDateRangePickerEvents {
  onChange?: (e: CustomEvent<{
    startDate: string;
    endDate: string;
    isoInterval: string;
    compareStartDate?: string;
    compareEndDate?: string;
    compareIsoInterval?: string;
  }>) => void;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-date-range-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<DateRangePicker> & LuiDateRangePickerAttributes & LuiDateRangePickerEvents,
        DateRangePicker
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-date-range-picker': import('vue').DefineComponent<LuiDateRangePickerAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-date-range-picker': LuiDateRangePickerAttributes & {
      'on:change'?: (e: CustomEvent<{
        startDate: string;
        endDate: string;
        isoInterval: string;
        compareStartDate?: string;
        compareEndDate?: string;
        compareIsoInterval?: string;
      }>) => void;
    };
  }
}

export {};
