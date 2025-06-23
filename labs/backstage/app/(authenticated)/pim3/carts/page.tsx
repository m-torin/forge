import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { CartsTable } from '@/components/pim3/CartsTable';
import { getCarts } from '@/actions/pim3/carts/actions';

async function CartsData() {
  const result = await getCarts({ limit: 50, page: 1 });
  const carts = result.success ? result.data : [];

  return <CartsTable initialData={carts} />;
}

export default function CartsPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <CartsData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Cart Management - PIM3',
  description: 'Manage shopping carts, cart items, and cart analytics',
};
