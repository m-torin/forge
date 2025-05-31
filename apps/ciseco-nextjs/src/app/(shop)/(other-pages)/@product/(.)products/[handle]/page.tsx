import ProductDetailPage from '@/app/(shop)/(other-pages)/products/[handle]/page';
import ProductModal from '@/components/ProductModal';

export default function InterceptedProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return (
    <ProductModal>
      <ProductDetailPage params={params} />
    </ProductModal>
  );
}