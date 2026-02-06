/**
 * JSX type declarations for lui-accordion and lui-accordion-item custom elements.
 * Provides type support for React, Vue, and Svelte.
 */

import type { Accordion, AccordionItem } from '@lit-ui/accordion';

interface LuiAccordionAttributes {
  value?: string;
  'default-value'?: string;
  multiple?: boolean;
  collapsible?: boolean;
  disabled?: boolean;
}

interface LuiAccordionItemAttributes {
  value?: string;
  disabled?: boolean;
  'heading-level'?: number;
  lazy?: boolean;
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
      'on:ui-change'?: (e: CustomEvent<{ value: string; expandedItems: string[] }>) => void;
    };
    'lui-accordion-item': LuiAccordionItemAttributes;
  }
}

export {};
