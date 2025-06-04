"use client";

import { ProductCardWithFavorite } from "@/components/ProductCardWithFavorite";

import { type TProductItem } from "@repo/design-system/mantine-ciseco";

interface SearchClientProps {
  products: TProductItem[];
}

export function SearchClient({ products }: SearchClientProps) {
  return (
    <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((item, index) => (
        <ProductCardWithFavorite
          key={item.id}
          position={index + 1}
          data={item}
          listId="search"
        />
      ))}
    </div>
  );
}
