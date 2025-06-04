'use client';

import { type TProductItem } from '@repo/design-system/mantine-ciseco';
import { ProductCardWithFavorite } from '@/components/ProductCardWithFavorite';

interface BrandClientProps {
  products: TProductItem[];
}

export function BrandClient({ products }: BrandClientProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product: TProductItem, index) => (
        <ProductCardWithFavorite 
          key={product.id} 
          data={product}
          listId="brand"
          position={index + 1}
        />
      ))}
    </div>
  );
}