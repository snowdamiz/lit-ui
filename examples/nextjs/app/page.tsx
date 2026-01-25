// This is a Server Component (no 'use client' directive)
// Server Components can import client components that contain Lit code

import LitDemo from './components/LitDemo';

export default function Home() {
  return (
    <main>
      <h1>Lit UI + Next.js SSR Example</h1>

      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        This page demonstrates server-side rendering of Lit components in Next.js 15+
        using the App Router. The Button and Dialog components below are SSR&apos;d on
        the server and hydrated on the client for interactivity.
      </p>

      <section>
        <h2>Interactive Components</h2>
        <LitDemo />
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>What to notice:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Components render immediately (no flash of unstyled content)</li>
          <li>Button click counter increments after hydration</li>
          <li>Dialog opens and closes properly</li>
          <li>No hydration mismatch errors in the console</li>
        </ul>
      </section>
    </main>
  );
}
