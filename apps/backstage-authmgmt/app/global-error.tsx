'use client';

import { GlobalError as GlobalErrorComponent } from '@repo/design-system/backstage';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return <GlobalErrorComponent error={error} />;
}
