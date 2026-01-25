// @lit-ui/ssr/hydration - Client-side hydration support
//
// IMPORTANT: This module MUST be imported before any Lit component code.
// The hydration support patches LitElement before component classes are defined.
//
// @example
// ```typescript
// // In your app entry point (FIRST import!)
// import '@lit-ui/ssr/hydration';
// // Then import components
// import '@lit-ui/button';
// import '@lit-ui/dialog';
// ```

// Initialize hydration support - side effect import
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';

// Re-export hydrate function for manual hydration if needed
export { hydrate } from '@lit-labs/ssr-client';
