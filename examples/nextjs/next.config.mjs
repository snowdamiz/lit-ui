// Next.js configuration with Lit SSR support
//
// The withLitSSR plugin from @lit-labs/nextjs handles:
// 1. Declarative Shadow DOM polyfill injection for browsers that need it
// 2. Module transformation to support Lit's SSR rendering
// 3. Proper hydration timing for Lit components in React
//
// Without this plugin, Lit components won't render their shadow DOM on the server.

import withLitSSR from '@lit-labs/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// withLitSSR returns a function that wraps the config
// Options can be passed to withLitSSR() if needed:
// - addDeclarativeShadowDomPolyfill: true (default)
// - webpackModuleRulesTest: RegExp for files to transform
export default withLitSSR()(nextConfig);
