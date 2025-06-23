import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { SeriesTable } from '@/components/pim3/SeriesTable';
import { getSeries } from '@/actions/pim3/actions';

async function SeriesData() {
  const result = await getSeries({ page: 1, limit: 50 });

  return <SeriesTable initialData={result} />;
}

export default function SeriesPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <SeriesData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Series Management - PIM3',
  description: 'Manage series, shows, and content franchises',
};
