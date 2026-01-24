import { useState, type FormEvent } from 'react';

// Side-effect import to register custom elements
import 'lit-ui';

/**
 * React 19 lit-ui Component Verification App
 *
 * Demonstrates all Button and Dialog features:
 * - All 5 button variants (primary, secondary, outline, ghost, destructive)
 * - All 3 button sizes (sm, md, lg)
 * - Disabled and loading states
 * - Icon slots (icon-start, icon-end)
 * - Dialog with open prop, close events with reason
 * - Slots (title, content, footer)
 * - Form participation with submit button
 */
function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState<string>('');

  const handleButtonClick = (variant: string) => {
    console.log(`Button clicked: ${variant}`);
    setLastEvent(`Button clicked: ${variant}`);
  };

  const handleDialogClose = (e: CustomEvent<{ reason: string }>) => {
    console.log('Dialog closed with reason:', e.detail.reason);
    setLastEvent(`Dialog closed: ${e.detail.reason}`);
    setDialogOpen(false);
  };

  const handleLoadingClick = () => {
    console.log('Loading button clicked');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastEvent('Loading complete');
    }, 2000);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setLastEvent('Form submitted via ui-button type="submit"');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>React 19 lit-ui Component Test</h1>

      {/* Event log */}
      <div
        style={{
          padding: '1rem',
          background: '#f0f0f0',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}
      >
        <strong>Last Event:</strong> {lastEvent || 'None'}
      </div>

      {/* Button Variants */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Button Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ui-button
            variant="primary"
            onClick={() => handleButtonClick('primary')}
          >
            Primary
          </ui-button>
          <ui-button
            variant="secondary"
            onClick={() => handleButtonClick('secondary')}
          >
            Secondary
          </ui-button>
          <ui-button
            variant="outline"
            onClick={() => handleButtonClick('outline')}
          >
            Outline
          </ui-button>
          <ui-button
            variant="ghost"
            onClick={() => handleButtonClick('ghost')}
          >
            Ghost
          </ui-button>
          <ui-button
            variant="destructive"
            onClick={() => handleButtonClick('destructive')}
          >
            Destructive
          </ui-button>
        </div>
      </section>

      {/* Button Sizes */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Button Sizes</h2>
        <div
          style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
        >
          <ui-button size="sm" onClick={() => handleButtonClick('sm')}>
            Small
          </ui-button>
          <ui-button size="md" onClick={() => handleButtonClick('md')}>
            Medium
          </ui-button>
          <ui-button size="lg" onClick={() => handleButtonClick('lg')}>
            Large
          </ui-button>
        </div>
      </section>

      {/* Button States */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Button States</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ui-button disabled onClick={() => handleButtonClick('disabled')}>
            Disabled
          </ui-button>
          <ui-button loading={loading} onClick={handleLoadingClick}>
            {loading ? 'Loading...' : 'Click to Load'}
          </ui-button>
        </div>
      </section>

      {/* Button with Icons */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Button with Icons</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ui-button onClick={() => handleButtonClick('icon-start')}>
            <svg
              slot="icon-start"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            With Icon Start
          </ui-button>
          <ui-button onClick={() => handleButtonClick('icon-end')}>
            With Icon End
            <svg
              slot="icon-end"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </ui-button>
        </div>
      </section>

      {/* Dialog Trigger */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Dialog</h2>
        <ui-button onClick={() => setDialogOpen(true)}>Open Dialog</ui-button>
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          Try closing with Escape key or clicking the backdrop
        </p>
      </section>

      {/* Form Participation */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Form Participation</h2>
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Enter something..."
            style={{
              padding: '0.5rem',
              marginRight: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <ui-button type="submit" variant="primary">
            Submit Form
          </ui-button>
        </form>
      </section>

      {/* Dialog Component */}
      <ui-dialog open={dialogOpen} onClose={handleDialogClose}>
        <span slot="title">Test Dialog Title</span>
        <p>This is the dialog content.</p>
        <p>
          You can close this dialog by:
        </p>
        <ul>
          <li>Pressing the Escape key</li>
          <li>Clicking the backdrop</li>
          <li>Clicking the Close button below</li>
        </ul>
        <div slot="footer">
          <ui-button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </ui-button>
          <ui-button
            variant="primary"
            onClick={() => {
              console.log('Confirm clicked');
              setLastEvent('Dialog confirmed');
              setDialogOpen(false);
            }}
          >
            Confirm
          </ui-button>
        </div>
      </ui-dialog>
    </div>
  );
}

export default App;
