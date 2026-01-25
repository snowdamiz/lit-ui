<script setup lang="ts">
import LitDemo from './components/LitDemo.vue';
</script>

<template>
  <div class="app">
    <h1>Lit UI + Vue Example</h1>
    <p class="description">
      This example demonstrates using Lit UI components with Vue 3.5 and Vite.
    </p>
    <LitDemo />
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.description {
  margin-bottom: 1.5rem;
  color: #666;
}
</style>
