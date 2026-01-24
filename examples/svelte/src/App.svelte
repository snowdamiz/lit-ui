<script lang="ts">
  // Import lit-ui components (side-effect registers custom elements)
  import 'lit-ui';

  // Svelte 5 runes for reactive state
  let dialogOpen = $state(false);
  let loading = $state(false);
  let lastEvent = $state('None');

  function handleButtonClick(variant: string) {
    console.log(`Button clicked: ${variant}`);
    lastEvent = `Button clicked: ${variant}`;
  }

  function handleDialogClose(e: CustomEvent<{ reason: string }>) {
    console.log('Dialog closed with reason:', e.detail.reason);
    lastEvent = `Dialog closed: ${e.detail.reason}`;
    dialogOpen = false;
  }

  function handleLoadingClick() {
    console.log('Loading button clicked');
    loading = true;
    lastEvent = 'Loading started...';
    setTimeout(() => {
      loading = false;
      lastEvent = 'Loading complete';
    }, 2000);
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    console.log('Form submitted');
    lastEvent = 'Form submitted via ui-button type="submit"';
  }

  function handleOpenDialog() {
    dialogOpen = true;
    lastEvent = 'Dialog opened';
  }
</script>

<div class="container">
  <header class="header">
    <h1>lit-ui Component Test</h1>
    <span class="badge">Svelte 5</span>
  </header>
  <p class="subtitle">Testing lit-ui web components in Svelte 5 with TypeScript</p>

  <!-- Event Log -->
  <div class="event-log">
    <strong>Last Event:</strong> {lastEvent}
  </div>

  <!-- Button Variants -->
  <section class="section">
    <h2>Button Variants</h2>
    <p class="description">All 5 button variants: primary, secondary, outline, ghost, destructive</p>
    <div class="button-row">
      <ui-button variant="primary" onclick={() => handleButtonClick('primary')}>Primary</ui-button>
      <ui-button variant="secondary" onclick={() => handleButtonClick('secondary')}>Secondary</ui-button>
      <ui-button variant="outline" onclick={() => handleButtonClick('outline')}>Outline</ui-button>
      <ui-button variant="ghost" onclick={() => handleButtonClick('ghost')}>Ghost</ui-button>
      <ui-button variant="destructive" onclick={() => handleButtonClick('destructive')}>Destructive</ui-button>
    </div>
  </section>

  <!-- Button Sizes -->
  <section class="section">
    <h2>Button Sizes</h2>
    <p class="description">All 3 button sizes: small, medium, large</p>
    <div class="button-row">
      <ui-button size="sm" onclick={() => handleButtonClick('sm')}>Small</ui-button>
      <ui-button size="md" onclick={() => handleButtonClick('md')}>Medium</ui-button>
      <ui-button size="lg" onclick={() => handleButtonClick('lg')}>Large</ui-button>
    </div>
  </section>

  <!-- Button States -->
  <section class="section">
    <h2>Button States</h2>
    <p class="description">Disabled and loading states</p>
    <div class="button-row">
      <ui-button variant="destructive" disabled>Disabled</ui-button>
      <ui-button loading={loading} onclick={handleLoadingClick}>
        {loading ? 'Loading...' : 'Click to Load'}
      </ui-button>
    </div>
  </section>

  <!-- Button with Icons -->
  <section class="section">
    <h2>Button with Icons</h2>
    <p class="description">Using icon-start and icon-end slots</p>
    <div class="button-row">
      <ui-button onclick={() => handleButtonClick('icon-start')}>
        <svg slot="icon-start" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
        </svg>
        With Start Icon
      </ui-button>
      <ui-button variant="secondary" onclick={() => handleButtonClick('icon-end')}>
        With End Icon
        <svg slot="icon-end" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
        </svg>
      </ui-button>
    </div>
  </section>

  <!-- Dialog -->
  <section class="section">
    <h2>Dialog Component</h2>
    <p class="description">Modal dialog with open/close via state binding</p>
    <ui-button onclick={handleOpenDialog}>Open Dialog</ui-button>
  </section>

  <!-- Form Participation -->
  <section class="section">
    <h2>Form Participation</h2>
    <p class="description">Button with type="submit" participates in form submission</p>
    <form class="form" onsubmit={handleFormSubmit}>
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" type="text" placeholder="Enter your name" />
      </div>
      <div class="button-row">
        <ui-button type="submit" variant="primary">Submit Form</ui-button>
        <ui-button type="reset" variant="outline">Reset Form</ui-button>
      </div>
    </form>
  </section>

  <!-- Dialog Component -->
  <ui-dialog open={dialogOpen} onclose={handleDialogClose}>
    <span slot="title">Test Dialog</span>
    <p>This is the dialog content. It demonstrates:</p>
    <ul>
      <li>open property bound to Svelte $state</li>
      <li>onclose event handler with reason in detail</li>
      <li>Named slots for title, content, and footer</li>
    </ul>
    <p><strong>Close by:</strong> Escape key, backdrop click, or buttons below</p>
    <div slot="footer">
      <ui-button variant="outline" onclick={() => dialogOpen = false}>Cancel</ui-button>
      <ui-button variant="primary" onclick={() => { lastEvent = 'Dialog confirmed'; dialogOpen = false; }}>Confirm</ui-button>
    </div>
  </ui-dialog>

  <footer class="footer">
    <p>Svelte 5 + lit-ui integration example</p>
    <p>Using $state runes for reactive property binding</p>
  </footer>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background: #f9fafb;
    color: #1f2937;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .header h1 {
    margin: 0;
    font-size: 1.875rem;
    font-weight: 700;
  }
  .badge {
    background: #f97316;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .subtitle {
    color: #6b7280;
    margin: 0 0 1.5rem 0;
  }
  .event-log {
    background: #e5e7eb;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    font-family: monospace;
  }
  .section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #374151;
  }
  .description {
    color: #6b7280;
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
  }
  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }
  .form {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  .form-group input {
    width: 100%;
    max-width: 300px;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
  }
  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  li {
    margin: 0.25rem 0;
  }
  .footer {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    margin-top: 2rem;
  }
  .footer p {
    margin: 0.25rem 0;
  }
</style>
