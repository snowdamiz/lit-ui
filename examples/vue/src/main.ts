// CRITICAL: Hydration support MUST be imported first
// This import patches LitElement before any component classes are defined.
import '@lit-ui/ssr/hydration';

// Now import components (order doesn't matter after hydration import)
import '@lit-ui/button';
import '@lit-ui/dialog';

import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
