<script lang="ts">
  import { browser } from '$app/environment';

  // CRITICAL: Hydration support MUST be imported first on the client
  // This import patches LitElement before any component classes are defined.
  if (browser) {
    import('@lit-ui/ssr/hydration').then(() => {
      import('@lit-ui/button');
      import('@lit-ui/dialog');
    });
  }
</script>

<slot />

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
  }
</style>
