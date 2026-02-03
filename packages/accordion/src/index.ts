// @lit-ui/accordion - Accordion and AccordionItem components with SSR support
/// <reference path="./jsx.d.ts" />
import { isServer } from 'lit';

// Export component classes
export { Accordion } from './accordion.js';
export { AccordionItem } from './accordion-item.js';

// Re-export TailwindElement and isServer for convenience
export { TailwindElement, isServer } from '@lit-ui/core';

// Safe custom element registration with collision detection
import { Accordion } from './accordion.js';
import { AccordionItem } from './accordion-item.js';

if (typeof customElements !== 'undefined') {
  if (!customElements.get('lui-accordion')) {
    customElements.define('lui-accordion', Accordion);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-accordion] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }

  if (!customElements.get('lui-accordion-item')) {
    customElements.define('lui-accordion-item', AccordionItem);
  } else if (!isServer && import.meta.env?.DEV) {
    console.warn(
      '[lui-accordion-item] Custom element already registered. ' +
        'This may indicate duplicate imports or version conflicts.'
    );
  }
}

// TypeScript global type registration
declare global {
  interface HTMLElementTagNameMap {
    'lui-accordion': Accordion;
    'lui-accordion-item': AccordionItem;
  }
}
