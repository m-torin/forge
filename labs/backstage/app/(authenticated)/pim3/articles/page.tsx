import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { ArticleTable } from '@/components/pim3/ArticleTable';
import { getArticles } from '@/actions/pim3/actions';

async function ArticlesData() {
  const articles = await getArticles();

  return <ArticleTable initialData={articles || []} />;
}

export default function ArticlesPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <ArticlesData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Articles Management - PIM3',
  description: 'Manage blog posts, guides, and documentation',
};
