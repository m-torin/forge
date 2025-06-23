import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { LocationTable } from '@/components/pim3/LocationTable';
import { getLocations } from '@/actions/pim3/actions';

async function LocationsData() {
  const result = await getLocations({ page: 1, limit: 50 });

  return <LocationTable initialData={result} />;
}

export default function LocationsPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <LocationsData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Location Management - PIM3',
  description: 'Manage locations, destinations, and venues',
};
