import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { StoryTable } from '@/components/pim3/StoryTable';
import { getStories } from '@/actions/pim3/actions';

async function StoriesData() {
  const result = await getStories({ page: 1, limit: 50 });

  return <StoryTable initialData={result} />;
}

export default function StoriesPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <StoriesData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Story Management - PIM3',
  description: 'Manage stories, books, and narrative content',
};
