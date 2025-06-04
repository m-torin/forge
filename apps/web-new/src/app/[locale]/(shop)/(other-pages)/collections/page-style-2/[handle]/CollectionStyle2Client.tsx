"use client";

import { ProductCardWithFavorite } from "@/components/ProductCardWithFavorite";

import { type TProductItem } from "@repo/design-system/mantine-ciseco";

interface CollectionStyle2ClientProps {
  products: TProductItem[];
}

export function CollectionStyle2Client({
  products,
}: CollectionStyle2ClientProps) {
  return (
    <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((item, index) => (
        <ProductCardWithFavorite
          key={item.id}
          position={index + 1}
          data={item}
          listId="collection-style-2"
        />
      ))}
    </div>
  );
}
