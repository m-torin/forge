import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { CastTable } from '@/components/pim3/CastTable';
import { getCast } from '@/actions/pim3/actions';

async function CastData() {
  const result = await getCast({ page: 1, limit: 50 });

  return <CastTable initialData={result} />;
}

export default function CastPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <CastData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Cast Management - PIM3',
  description: 'Manage cast members, characters, and media associations',
};
