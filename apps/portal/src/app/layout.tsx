import type { Metadata, Viewport } from 'next';
import React from 'react';
import './globals.css';
import { ThemeProvider } from '../components/shell/ThemeProvider';
import { themeInitializationScript } from '../components/shell/theme-init-script';

export const metadata: Metadata = {
  title: 'Internal Access — Trionyx Operations Portal',
  description: 'Private Operations & Management Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent)]/20 selection:text-[var(--text-primary)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
