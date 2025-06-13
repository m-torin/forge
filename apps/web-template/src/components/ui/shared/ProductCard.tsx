import React, { type FC } from 'react';

export interface TProductItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  [key: string]: any;
}

interface ProductCardProps {
  data: TProductItem;
  className?: string;
}

const ProductCard: FC<ProductCardProps> = ({ data, className = '' }) => {
  return (
    <div className={`group relative ${className}`}>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        {data.image ? (
          <img
            alt={data.name}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
            src={data.image}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700 dark:text-gray-300">
            <span aria-hidden="true" className="absolute inset-0" />
            {data.name}
          </h3>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">${data.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
