import { Container, Stack, Skeleton } from '@mantine/core';
import { Suspense } from 'react';
import { SearchAnalytics } from '@/components/search';

function AnalyticsLoading() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Skeleton height={60} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
        <Skeleton height={400} />
      </Stack>
    </Container>
  );
}

export default function SearchAnalyticsPage() {
  return (
    <Container size="xl" py="xl">
      <Suspense fallback={<AnalyticsLoading />}>
        <SearchAnalytics />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Search Analytics Dashboard | Performance Insights',
  description:
    'Monitor search performance, user behavior, and optimization opportunities with comprehensive analytics.',
  keywords: ['analytics', 'search performance', 'user behavior', 'optimization', 'insights'],
  openGraph: {
    title: 'Search Analytics Dashboard',
    description: 'Comprehensive search performance analytics and insights',
    type: 'website',
  },
};
