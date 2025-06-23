import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { OrdersTable } from '@/components/pim3/OrdersTable';
import { getOrders } from '@/actions/pim3/actions';

async function OrdersData() {
  const result = await getOrders({ limit: 50, page: 1 });
  const orders = result.success ? result.data : [];

  return <OrdersTable initialData={orders} />;
}

export default function OrdersPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <OrdersData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Order Management - PIM3',
  description: 'Manage orders, order items, payments, and fulfillment',
};
