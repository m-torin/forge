import ProductModal from '@/components/ProductModal';
import ProductQuickViewContent from '@/components/ProductQuickViewContent';
import { getProductDetailByHandle } from '@/data/data';
import { notFound } from 'next/navigation';

export default async function InterceptedQuickViewPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <ProductModal>
      <ProductQuickViewContent product={product} />
    </ProductModal>
  );
}