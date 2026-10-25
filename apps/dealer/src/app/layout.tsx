import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { NetworkStatus } from '@trionyx/ui';

export const metadata: Metadata = {
  title: 'Trionyx Dealer Portal',
  description: 'Certified Dealer & Studio Partner Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F5F5F5', color: '#171717', fontFamily: 'system-ui, sans-serif' }}>
        {children}
        <NetworkStatus />
      </body>
    </html>
  );
}
