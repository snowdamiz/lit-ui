/**
 * JSX type declarations for lui-accordion and lui-accordion-item custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Accordion } from './accordion.js';
import type { AccordionItem } from './accordion-item.js';

// Common attributes for lui-accordion
interface LuiAccordionAttributes {
  value?: string;
  'default-value'?: string;
  multiple?: boolean;
  collapsible?: boolean;
  disabled?: boolean;
}

// Common attributes for lui-accordion-item
interface LuiAccordionItemAttributes {
  value?: string;
  expanded?: boolean;
  disabled?: boolean;
  'heading-level'?: number;
}

// React JSX support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-accordion': React.DetailedHTMLProps<
        React.HTMLAttributes<Accordion> & LuiAccordionAttributes,
        Accordion
      >;
      'lui-accordion-item': React.DetailedHTMLProps<
        React.HTMLAttributes<AccordionItem> & LuiAccordionItemAttributes,
        AccordionItem
      >;
    }
  }
}

// Vue support
declare module 'vue' {
  export interface GlobalComponents {
    'lui-accordion': import('vue').DefineComponent<LuiAccordionAttributes>;
    'lui-accordion-item': import('vue').DefineComponent<LuiAccordionItemAttributes>;
  }
}

// Svelte support
declare namespace svelteHTML {
  interface IntrinsicElements {
    'lui-accordion': LuiAccordionAttributes & {
      'on:ui-change'?: (e: CustomEvent) => void;
    };
    'lui-accordion-item': LuiAccordionItemAttributes & {
      'on:ui-accordion-toggle'?: (e: CustomEvent) => void;
    };
  }
}

export {};
