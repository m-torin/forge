'use client';

import { NotFound as NotFoundComponent } from '@repo/design-system/backstage';

export default function NotFound() {
  return <NotFoundComponent homeUrl="/authmgmt" homeLabel="Back to Auth Management" />;
}
