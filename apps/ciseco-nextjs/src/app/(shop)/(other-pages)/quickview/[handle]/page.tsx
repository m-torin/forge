import { notFound } from 'next/navigation';

import { getProductDetailByHandle } from '@repo/design-system/ciesco2';
import { ProductQuickViewContent } from '@repo/design-system/ciesco2';

export default async function QuickViewPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductQuickViewContent product={product} />;
}
