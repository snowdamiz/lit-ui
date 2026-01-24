<script setup lang="ts">
import { ref } from 'vue';
import 'lit-ui';

// Dialog state
const dialogOpen = ref(false);

// Loading state for button demo
const loading = ref(false);

// Form state
const formSubmitted = ref(false);

function handleButtonClick() {
  console.log('Button clicked');
  dialogOpen.value = true;
}

function handleDialogClose(e: CustomEvent<{ reason: string }>) {
  console.log('Dialog closed with reason:', e.detail.reason);
  dialogOpen.value = false;
}

function handleLoadingClick() {
  console.log('Loading button clicked');
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    console.log('Loading complete');
  }, 2000);
}

function handleFormSubmit(e: Event) {
  e.preventDefault();
  console.log('Form submitted');
  formSubmitted.value = true;
  setTimeout(() => formSubmitted.value = false, 2000);
}
</script>

<template>
  <div class="container">
    <h1>Vue 3 + lit-ui Test</h1>
    <p>Testing lit-ui web components in Vue 3 with TypeScript</p>

    <!-- Button Variants Section -->
    <section>
      <h2>Button Variants</h2>
      <div class="button-row">
        <ui-button variant="primary" @click="() => console.log('Primary clicked')">Primary</ui-button>
        <ui-button variant="secondary" @click="() => console.log('Secondary clicked')">Secondary</ui-button>
        <ui-button variant="outline" @click="() => console.log('Outline clicked')">Outline</ui-button>
        <ui-button variant="ghost" @click="() => console.log('Ghost clicked')">Ghost</ui-button>
        <ui-button variant="destructive" @click="() => console.log('Destructive clicked')">Destructive</ui-button>
      </div>
    </section>

    <!-- Button Sizes Section -->
    <section>
      <h2>Button Sizes</h2>
      <div class="button-row">
        <ui-button size="sm">Small</ui-button>
        <ui-button size="md">Medium</ui-button>
        <ui-button size="lg">Large</ui-button>
      </div>
    </section>

    <!-- Button States Section -->
    <section>
      <h2>Button States</h2>
      <div class="button-row">
        <ui-button disabled>Disabled</ui-button>
        <ui-button :loading="loading" @click="handleLoadingClick">
          {{ loading ? 'Loading...' : 'Click to Load' }}
        </ui-button>
      </div>
    </section>

    <!-- Button with Icons Section -->
    <section>
      <h2>Button with Icons</h2>
      <div class="button-row">
        <ui-button variant="primary">
          <svg slot="icon-start" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
          With Start Icon
        </ui-button>
        <ui-button variant="secondary">
          With End Icon
          <svg slot="icon-end" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
          </svg>
        </ui-button>
      </div>
    </section>

    <!-- Dialog Section -->
    <section>
      <h2>Dialog</h2>
      <ui-button variant="primary" @click="handleButtonClick">Open Dialog</ui-button>
      <p class="hint">Dialog will open. Press Escape or click backdrop to close.</p>
    </section>

    <!-- Dialog Component -->
    <ui-dialog :open="dialogOpen" @close="handleDialogClose">
      <span slot="title">Test Dialog</span>
      <p>This is the dialog content. The dialog opened via Vue's :open property binding.</p>
      <p>Close this dialog by:</p>
      <ul>
        <li>Pressing the Escape key</li>
        <li>Clicking the backdrop</li>
        <li>Clicking the Close button below</li>
      </ul>
      <div slot="footer">
        <ui-button variant="ghost" @click="dialogOpen = false">Cancel</ui-button>
        <ui-button variant="primary" @click="dialogOpen = false">Confirm</ui-button>
      </div>
    </ui-dialog>

    <!-- Form Participation Section -->
    <section>
      <h2>Form Participation</h2>
      <form @submit="handleFormSubmit">
        <div class="form-group">
          <label for="name">Name:</label>
          <input id="name" type="text" placeholder="Enter your name" />
        </div>
        <div class="button-row">
          <ui-button type="submit" variant="primary">Submit Form</ui-button>
          <ui-button type="reset" variant="outline">Reset Form</ui-button>
        </div>
        <p v-if="formSubmitted" class="success">Form submitted successfully!</p>
      </form>
    </section>
  </div>
</template>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #666;
}

section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.hint {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
}

.success {
  color: #22c55e;
  font-weight: 500;
  margin-top: 0.5rem;
}

ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

li {
  margin: 0.25rem 0;
}
</style>
