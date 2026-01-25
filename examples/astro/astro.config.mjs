import { defineConfig } from 'astro/config';
import lit from '@semantic-ui/astro-lit';

/**
 * Astro configuration with Lit SSR integration
 *
 * Why @semantic-ui/astro-lit?
 * The official @astrojs/lit package was deprecated in Astro 5.0.
 * @semantic-ui/astro-lit is the community-maintained continuation
 * that supports Astro 5+ with full SSR and hydration support.
 *
 * Output modes:
 * - 'server': Enables SSR (server-side rendering on each request)
 * - 'static': Enables SSG (static site generation at build time)
 * Both work with Lit components and client:* directives.
 */
export default defineConfig({
  integrations: [lit()],
  output: 'server',
});
