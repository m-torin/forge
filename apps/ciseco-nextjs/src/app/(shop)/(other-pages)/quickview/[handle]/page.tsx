import { getProductDetailByHandle } from '@/data/data';
import { notFound } from 'next/navigation';
import ProductQuickViewContent from '@/components/ProductQuickViewContent';

export default async function QuickViewPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductQuickViewContent product={product} />;
}