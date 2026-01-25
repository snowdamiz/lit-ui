import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lit UI Next.js Example',
  description: 'Server-side rendering Lit components with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        {children}
      </body>
    </html>
  );
}
