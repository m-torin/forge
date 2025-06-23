import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { FavoritesTable } from '@/components/pim3/FavoritesTable';
import { getFavorites } from '@/actions/pim3/actions';

async function FavoritesData() {
  const result = await getFavorites({ limit: 50, page: 1 });
  const favorites = result.success ? result.data : [];

  return <FavoritesTable initialData={favorites} />;
}

export default function FavoritesPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <FavoritesData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Favorites Management - PIM3',
  description: 'Manage user favorites for products and collections',
};
