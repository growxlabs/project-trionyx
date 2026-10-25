'use client';

import { StatusPage, NetworkStatus } from '@trionyx/ui';
import './globals.css';

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="en"><head><title>Unable to load — Trionyx</title></head><body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}><StatusPage kind="error" brand="Trionyx" homeHref="/" homeLabel="Back to home" retry={retry} digest={error.digest} /><NetworkStatus /></body></html>;
}
