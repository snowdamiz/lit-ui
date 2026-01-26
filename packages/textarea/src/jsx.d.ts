/**
 * JSX type declarations for lui-textarea custom element.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Textarea, TextareaSize, TextareaResize } from './textarea.js';

// Common attributes for lui-textarea
interface LuiTextareaAttributes {
  size?: TextareaSize;
  resize?: TextareaResize;
  autoresize?: boolean;
  'max-rows'?: number;
  'max-height'?: string;
  'show-count'?: boolean;
  name?: string;
  value?: string;
  placeholder?: string;
  label?: string;
  'helper-text'?: string;
  'required-indicator'?: 'asterisk' | 'text';
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  minlength?: number;
  maxlength?: number;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-textarea': React.DetailedHTMLProps<
        React.TextareaHTMLAttributes<Textarea> & LuiTextareaAttributes,
        Textarea
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-textarea': import('vue').DefineComponent<LuiTextareaAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-textarea': LuiTextareaAttributes & {
      oninput?: (e: InputEvent) => void;
      'on:input'?: (e: CustomEvent<InputEvent>) => void;
    };
  }
}

export {};
