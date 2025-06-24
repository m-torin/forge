'use client';

import { ErrorBoundary } from '@repo/design-system/backstage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} homeUrl="/cms" homeLabel="Back to CMS" />;
}
