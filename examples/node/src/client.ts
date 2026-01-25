// Client-side hydration entry point for @lit-ui components
//
// CRITICAL: Import order matters!
// @lit-ui/ssr/hydration MUST be imported FIRST, before any Lit components.
// This patches LitElement to support hydration from Declarative Shadow DOM.
// If components are imported first, they won't hydrate correctly.

import '@lit-ui/ssr/hydration';

// Now import components - they will hydrate the server-rendered DOM
import '@lit-ui/button';
import '@lit-ui/dialog';

// After hydration, components are fully interactive
console.log('Hydration complete - components are now interactive');

// Add click handler to demonstrate interactivity
const button = document.querySelector('#demo-button');
button?.addEventListener('click', () => {
  alert('Button clicked! Hydration is working.');
});

// Dialog open/close demonstration
const openDialogBtn = document.querySelector('#open-dialog');
const dialog = document.querySelector('#demo-dialog') as HTMLElement & { open: boolean };
const closeDialogBtn = document.querySelector('#close-dialog');

openDialogBtn?.addEventListener('click', () => {
  if (dialog) {
    dialog.open = true;
  }
});

closeDialogBtn?.addEventListener('click', () => {
  if (dialog) {
    dialog.open = false;
  }
});
