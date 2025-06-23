import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { InventoryTable } from '@/components/pim3/InventoryTable';
import { getInventory } from '@/actions/pim3/actions';

async function InventoryData() {
  const result = await getInventory({ page: 1, limit: 50 });

  return <InventoryTable initialData={result} />;
}

export default function InventoryPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <InventoryData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Inventory Management - PIM3',
  description: 'Manage inventory levels, stock adjustments, and reservations',
};
