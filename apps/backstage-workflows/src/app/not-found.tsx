'use client';

import { NotFound as NotFoundComponent } from '@repo/design-system/backstage';

export default function NotFound() {
  return <NotFoundComponent homeUrl="/workflows" homeLabel="Back to Workflows" />;
}
