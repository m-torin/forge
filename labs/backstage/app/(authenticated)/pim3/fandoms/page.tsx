import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { FandomTable } from '@/components/pim3/FandomTable';
import { getFandoms } from '@/actions/pim3/actions';

async function FandomsData() {
  const result = await getFandoms({ page: 1, limit: 50 });

  return <FandomTable initialData={result} />;
}

export default function FandomsPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <FandomsData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Fandom Management - PIM3',
  description: 'Manage fandoms, universes, and franchise content',
};
