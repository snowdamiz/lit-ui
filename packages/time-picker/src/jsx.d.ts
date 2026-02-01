/**
 * JSX type declarations for lui-time-picker custom element.
 * Provides type support for React, Preact, Vue, and Svelte.
 */

import type { TimePicker } from './time-picker.js';

// Separate JS-only props (presets) from HTML attributes
interface LuiTimePickerAttributes {
  value?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hour12?: boolean;
  locale?: string;
  step?: number;
  'min-time'?: string;
  'max-time'?: string;
  'allow-overnight'?: boolean;
  'show-timezone'?: boolean;
  timezone?: string;
  'interface-mode'?: 'clock' | 'dropdown' | 'both';
  class?: string;
  id?: string;
  slot?: string;
  style?: string | Record<string, string>;
}

interface LuiTimePickerEvents {
  onchange?: (event: CustomEvent<{ value: string }>) => void;
  'on:change'?: (event: CustomEvent<{ value: string }>) => void;
}

type LuiTimePickerProps = LuiTimePickerAttributes & LuiTimePickerEvents;

// React JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-time-picker': LuiTimePickerProps;
    }
  }
}

// Preact JSX
declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'lui-time-picker': LuiTimePickerProps;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-time-picker': import('vue').DefineComponent<LuiTimePickerAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-time-picker': LuiTimePickerAttributes & {
      'on:change'?: (event: CustomEvent<{ value: string }>) => void;
    };
  }
}

export {};
