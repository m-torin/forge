import { LoadingState } from '@/components/loading-state';
import { Suspense } from 'react';

import { RelationshipsManager } from './relationships-manager';

export default function RelationshipsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RelationshipsManager />
    </Suspense>
  );
}
