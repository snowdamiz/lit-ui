<script lang="ts">
  // Import lit-ui components (side-effect registers custom elements)
  import 'lit-ui';

  // Svelte 5 runes for reactive state
  let dialogOpen = $state(false);
  let loading = $state(false);
  let clickCount = $state(0);

  function handleButtonClick() {
    clickCount++;
    console.log('Button clicked, count:', clickCount);
  }

  function handleOpenDialog() {
    console.log('Opening dialog');
    dialogOpen = true;
  }

  function handleDialogClose(e: CustomEvent<{ reason: string }>) {
    console.log('Dialog closed with reason:', e.detail.reason);
    dialogOpen = false;
  }

  function handleLoadingClick() {
    loading = true;
    console.log('Loading started');
    setTimeout(() => {
      loading = false;
      console.log('Loading finished');
    }, 2000);
  }

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    console.log('Form submitted via ui-button type="submit"');
  }
</script>

<main class="container mx-auto p-8 max-w-4xl">
  <h1 class="text-3xl font-bold mb-8 text-center">lit-ui Svelte 5 Example</h1>

  <!-- Button Variants Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Button Variants</h2>
    <p class="text-gray-600 mb-4">All 5 button variants demonstrating visual styling.</p>
    <div class="flex flex-wrap gap-4">
      <ui-button variant="primary" onclick={handleButtonClick}>Primary</ui-button>
      <ui-button variant="secondary" onclick={handleButtonClick}>Secondary</ui-button>
      <ui-button variant="outline" onclick={handleButtonClick}>Outline</ui-button>
      <ui-button variant="ghost" onclick={handleButtonClick}>Ghost</ui-button>
      <ui-button variant="destructive" onclick={handleButtonClick}>Destructive</ui-button>
    </div>
    <p class="mt-4 text-sm text-gray-500">Click count: {clickCount}</p>
  </section>

  <!-- Button Sizes Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Button Sizes</h2>
    <p class="text-gray-600 mb-4">All 3 button sizes: small, medium, large.</p>
    <div class="flex flex-wrap items-center gap-4">
      <ui-button variant="primary" size="sm">Small</ui-button>
      <ui-button variant="primary" size="md">Medium</ui-button>
      <ui-button variant="primary" size="lg">Large</ui-button>
    </div>
  </section>

  <!-- Button States Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Button States</h2>
    <p class="text-gray-600 mb-4">Disabled and loading states.</p>
    <div class="flex flex-wrap gap-4">
      <ui-button variant="primary" disabled>Disabled</ui-button>
      <ui-button variant="primary" loading={loading} onclick={handleLoadingClick}>
        {loading ? 'Loading...' : 'Click to Load'}
      </ui-button>
    </div>
  </section>

  <!-- Button with Icons Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Button with Icons</h2>
    <p class="text-gray-600 mb-4">Using icon-start and icon-end slots.</p>
    <div class="flex flex-wrap gap-4">
      <ui-button variant="primary">
        <svg slot="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
        </svg>
        Icon Start
      </ui-button>
      <ui-button variant="secondary">
        Icon End
        <svg slot="icon-end" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
        </svg>
      </ui-button>
      <ui-button variant="outline">
        <svg slot="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Both Icons
        <svg slot="icon-end" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clip-rule="evenodd" />
        </svg>
      </ui-button>
    </div>
  </section>

  <!-- Dialog Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Dialog Component</h2>
    <p class="text-gray-600 mb-4">Modal dialog with open/close via $state binding.</p>
    <ui-button variant="primary" onclick={handleOpenDialog}>Open Dialog</ui-button>

    <ui-dialog open={dialogOpen} onclose={handleDialogClose}>
      <span slot="title">Dialog Title</span>
      <p>This is the dialog content. It demonstrates:</p>
      <ul class="list-disc ml-6 mt-2">
        <li>open property bound to Svelte $state</li>
        <li>onclose event handler with reason in detail</li>
        <li>Named slots for title, content, and footer</li>
        <li>Press Escape or click backdrop to close</li>
      </ul>
      <div slot="footer">
        <ui-button variant="ghost" onclick={() => dialogOpen = false}>Cancel</ui-button>
        <ui-button variant="primary" onclick={() => dialogOpen = false}>Confirm</ui-button>
      </div>
    </ui-dialog>
  </section>

  <!-- Dialog Sizes Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Dialog Sizes</h2>
    <p class="text-gray-600 mb-4">Dialogs support sm, md, lg sizes.</p>
    <div class="flex gap-4">
      <ui-button variant="outline" onclick={() => {
        const dialog = document.querySelector('#dialog-sm') as any;
        if (dialog) dialog.show();
      }}>Small Dialog</ui-button>
      <ui-button variant="outline" onclick={() => {
        const dialog = document.querySelector('#dialog-md') as any;
        if (dialog) dialog.show();
      }}>Medium Dialog</ui-button>
      <ui-button variant="outline" onclick={() => {
        const dialog = document.querySelector('#dialog-lg') as any;
        if (dialog) dialog.show();
      }}>Large Dialog</ui-button>
    </div>

    <ui-dialog id="dialog-sm" size="sm" show-close-button>
      <span slot="title">Small Dialog</span>
      <p>This is a small dialog (max-w-sm).</p>
      <div slot="footer">
        <ui-button variant="primary" onclick={(e: Event) => ((e.target as HTMLElement).closest('ui-dialog') as any)?.close()}>Close</ui-button>
      </div>
    </ui-dialog>

    <ui-dialog id="dialog-md" size="md" show-close-button>
      <span slot="title">Medium Dialog</span>
      <p>This is a medium dialog (max-w-md). This is the default size.</p>
      <div slot="footer">
        <ui-button variant="primary" onclick={(e: Event) => ((e.target as HTMLElement).closest('ui-dialog') as any)?.close()}>Close</ui-button>
      </div>
    </ui-dialog>

    <ui-dialog id="dialog-lg" size="lg" show-close-button>
      <span slot="title">Large Dialog</span>
      <p>This is a large dialog (max-w-lg). Good for forms or more content.</p>
      <div slot="footer">
        <ui-button variant="primary" onclick={(e: Event) => ((e.target as HTMLElement).closest('ui-dialog') as any)?.close()}>Close</ui-button>
      </div>
    </ui-dialog>
  </section>

  <!-- Form Participation Section -->
  <section class="mb-12">
    <h2 class="text-2xl font-semibold mb-4">Form Participation</h2>
    <p class="text-gray-600 mb-4">Button with type="submit" participates in form submission.</p>
    <form class="p-4 border rounded-lg bg-gray-50" onsubmit={handleFormSubmit}>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="name">Name</label>
        <input
          type="text"
          id="name"
          class="w-full px-3 py-2 border rounded-md"
          placeholder="Enter your name"
        />
      </div>
      <ui-button variant="primary" type="submit">Submit Form</ui-button>
    </form>
  </section>

  <footer class="text-center text-gray-500 text-sm mt-8">
    <p>Svelte 5 + lit-ui integration example</p>
    <p>Using $state runes for reactive property binding</p>
  </footer>
</main>

<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    background: #f9fafb;
    margin: 0;
    padding: 0;
  }
</style>
