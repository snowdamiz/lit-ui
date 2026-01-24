/**
 * lit-ui - Framework-agnostic component library
 *
 * Built on Lit.js with Tailwind CSS styling.
 * Components work natively in React, Vue, Svelte, or plain HTML.
 */

// Base class for Tailwind-enabled web components
export { TailwindElement } from './base/tailwind-element';

// Demo component for foundation validation
export { DemoCard } from './components/demo/demo';

// Button component
export { Button } from './components/button/button';

// Dialog component
export { Dialog } from './components/dialog/dialog';
export type { DialogSize, CloseReason } from './components/dialog/dialog';
