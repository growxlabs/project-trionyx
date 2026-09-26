import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Trionyx Operations Portal',
  description: 'Private Operations & Management Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#171714', color: '#FCFBF7', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
