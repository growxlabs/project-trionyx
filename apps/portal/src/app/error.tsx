'use client';

import { StatusPage } from '@trionyx/ui';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <StatusPage kind="error" brand="Operations portal" homeHref="/overview" homeLabel="Back to overview" retry={retry} digest={error.digest} />;
}
