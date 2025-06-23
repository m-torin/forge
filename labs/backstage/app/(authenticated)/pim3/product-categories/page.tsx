import { Suspense } from 'react';
import { Container, LoadingOverlay } from '@mantine/core';

import { ProductCategoryTable } from '@/components/pim3/ProductCategoryTable';
import { getProductCategories } from '@/actions/pim3/actions';

async function ProductCategoriesData() {
  const result = await getProductCategories({ page: 1, limit: 50 });

  return <ProductCategoryTable initialData={result} />;
}

export default function ProductCategoriesPage() {
  return (
    <Container size="xl" py="md">
      <Suspense fallback={<LoadingOverlay visible />}>
        <ProductCategoriesData />
      </Suspense>
    </Container>
  );
}

export const metadata = {
  title: 'Product Category Management - PIM3',
  description: 'Manage product categories and hierarchical classification',
};
