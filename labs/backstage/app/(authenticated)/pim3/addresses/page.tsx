import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { AddressTable } from '@/components/pim3/AddressTable';
import { getAddresses } from '@/actions/pim3/actions';

async function AddressesData() {
  const result = await getAddresses({ limit: 50, page: 1 });
  const addresses = result.success ? result.data : [];

  return <AddressTable initialData={addresses} />;
}

export default function AddressesPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <AddressesData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Address Management - PIM3',
  description: 'Manage user addresses for billing and shipping',
};
