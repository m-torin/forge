import { Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { getProductById } from '../../actions';

import { ProductDetailClient } from './client';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Await params as required in Next.js 15
  const { id } = await params;
  
  // Handle "new" product creation
  if (id === 'new') {
    return <ProductDetailClient product={null} isCreating={true} />;
  }

  const result = await getProductById(id);

  if (!result.success || !result.data) {
    return (
      <Stack p="md">
        <Alert color="red" icon={<IconAlertCircle />}>
          {result.error || 'Product not found'}
        </Alert>
      </Stack>
    );
  }

  return <ProductDetailClient product={result.data} isCreating={false} />;
}
