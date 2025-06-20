import { Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { getProductById } from '@/actions/pim3/actions';

import { ProductDetailClient } from '../client';

interface ProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  // Await params as required in Next.js 15
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    return (
      <Stack p="md">
        <Alert c="red" icon={<IconAlertCircle />}>
          Product not found
        </Alert>
      </Stack>
    );
  }

  return <ProductDetailClient product={product as any} isCreating={false} />;
}
