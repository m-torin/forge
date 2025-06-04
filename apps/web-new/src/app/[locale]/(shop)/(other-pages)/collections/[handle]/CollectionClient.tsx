'use client';

import { type TProductItem } from '@repo/design-system/mantine-ciseco';
import { ProductCardWithFavorite } from '@/components/ProductCardWithFavorite';

interface CollectionClientProps {
  products: TProductItem[];
}

export function CollectionClient({ products }: CollectionClientProps) {
  return (
    <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
      {products?.map((product, index) => (
        <ProductCardWithFavorite 
          key={product.id} 
          data={product}
          listId="collection"
          position={index + 1}
        />
      ))}
    </div>
  );
}