'use client';

// CRITICAL: This must be a client component
// React Server Components (RSC) can't serialize Declarative Shadow DOM templates.
// When RSC serializes component output, it includes the <template shadowrootmode="open">
// elements in the payload, which causes hydration mismatches when React tries to
// reconcile the DOM.

// CRITICAL: Hydration support MUST be imported first
// This import patches LitElement before any component classes are defined.
// If you import components before this, hydration will fail silently -
// components will still work but may flash or re-render incorrectly.
import '@lit-ui/ssr/hydration';

// Now import components (order doesn't matter after hydration import)
import '@lit-ui/button';
import '@lit-ui/dialog';

import { useState, useRef, useEffect } from 'react';

// Extend JSX to recognize Lit custom elements
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'lui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary' | 'ghost';
          size?: 'sm' | 'md' | 'lg';
          disabled?: boolean;
        },
        HTMLElement
      >;
      'lui-dialog': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          open?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export default function LitDemo() {
  const [count, setCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  // Handle dialog open/close through the DOM element
  useEffect(() => {
    const dialog = dialogRef.current as HTMLElement & {
      showModal?: () => void;
      close?: () => void;
    };
    if (!dialog) return;

    if (dialogOpen && dialog.showModal) {
      dialog.showModal();
    } else if (!dialogOpen && dialog.close) {
      dialog.close();
    }
  }, [dialogOpen]);

  // Listen for dialog close event
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => setDialogOpen(false);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  return (
    <div
      style={{
        // Example of theming with CSS custom properties
        // These override the default component styles
        '--lui-button-radius': '8px',
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <lui-button
          variant="primary"
          onClick={() => setCount((c) => c + 1)}
        >
          Clicked {count} times
        </lui-button>

        <lui-button
          variant="secondary"
          onClick={() => setDialogOpen(true)}
        >
          Open Dialog
        </lui-button>
      </div>

      <lui-dialog ref={dialogRef}>
        <span slot="title">Hello from Lit UI</span>
        <p>This dialog is a Lit component that was server-side rendered and hydrated on the client.</p>
        <p>The showModal/close APIs work correctly after hydration.</p>
        <div slot="footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <lui-button variant="secondary" onClick={() => setDialogOpen(false)}>
            Close
          </lui-button>
          <lui-button variant="primary" onClick={() => setDialogOpen(false)}>
            Confirm
          </lui-button>
        </div>
      </lui-dialog>
    </div>
  );
}
