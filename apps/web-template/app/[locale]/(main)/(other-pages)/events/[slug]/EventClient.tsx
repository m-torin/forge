'use client';

import { ProductCardWithFavorite } from '@/components/guest/ProductCardWithFavorite';

import { TProductItem } from '@/types';

interface EventClientProps {
  products: TProductItem[];
}

export function EventClient({ products }: EventClientProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product: TProductItem, index) => (
        <ProductCardWithFavorite
          key={product.id}
          position={index + 1}
          data={product}
          listId="event"
        />
      ))}
    </div>
  );
}
