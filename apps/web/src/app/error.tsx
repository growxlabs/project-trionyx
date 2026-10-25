'use client';

import { StatusPage } from '@trionyx/ui';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <StatusPage kind="error" brand="Trionyx" homeHref="/" homeLabel="Back to home" retry={retry} digest={error.digest} />;
}
