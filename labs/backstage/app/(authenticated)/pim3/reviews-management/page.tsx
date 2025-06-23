import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { ReviewTable } from '@/components/pim3/ReviewTable';
import { getReviews } from '@/actions/pim3/actions';

async function ReviewsData() {
  const result = await getReviews(undefined, 1, 50);

  return <ReviewTable initialData={result} />;
}

export default function ReviewsManagementPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <ReviewsData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Review Management - PIM3',
  description: 'Manage customer reviews, moderation, and analytics',
};
