import { useState, useRef, useEffect } from 'react';
import type { Dialog } from '@lit-ui/dialog';

export default function LitDemo() {
  const [count, setCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<Dialog>(null);

  // Handle dialog open/close through the DOM element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (dialogOpen) {
      dialog.show();
    } else {
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
        <p>This dialog is a Lit component rendered in React.</p>
        <p>The showModal/close APIs work correctly with React state.</p>
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
