import { Rating } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

import type { Product } from '@/data/types';
import Prices from './Prices';

export interface ProductCardLargeProps {
  className?: string;
  product: Product;
}

const ProductCardLarge: FC<ProductCardLargeProps> = ({ className = '', product }) => {
  const { handle, images, price, compareAtPrice, rating, reviewCount, variants, title } = product;

  // Get color from first variant
  const color = variants?.[0]?.selectedOptions?.find((opt) => opt.name === 'Color')?.value;

  return (
    <div className={`group relative ${className}`}>
      <div className="relative flex flex-col">
        {/* Main image */}
        {images?.[0] && (
          <div className="aspect-[8/5] relative bg-neutral-100 rounded-2xl overflow-hidden">
            <Image
              className="rounded-2xl object-contain"
              alt={images[0].altText || title}
              fill
              sizes="400px"
              src={images[0].url}
            />
          </div>
        )}
        
        {/* Thumbnail images */}
        {images && images.length > 1 && (
          <div className="mt-2.5 grid grid-cols-3 gap-x-2.5">
            {images.slice(1, 4).map((image, index) => (
              <div key={index} className="w-full h-24 sm:h-28 relative">
                <Image
                  className="rounded-2xl object-cover"
                  alt={image.altText || `${title} ${index + 2}`}
                  fill
                  sizes="150px"
                  src={image.url}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-5 flex justify-between gap-4">
        {/* Title and details */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
            {color && (
              <>
                <span className="text-sm">
                  <span className="line-clamp-1">{color}</span>
                </span>
                <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700" />
              </>
            )}
            <Rating
              value={rating || 0}
              fractions={2}
              readOnly
              size="sm"
              emptySymbol={<IconStar size={16} />}
            />
            <span className="text-sm">
              <span className="line-clamp-1">
                {rating?.toFixed(1)} ({reviewCount || 0} reviews)
              </span>
            </span>
          </div>
        </div>
        
        {/* Price */}
        <Prices 
          className="mt-0.5" 
          price={price} 
          compareAtPrice={compareAtPrice}
        />
      </div>
      
      {/* Full card link */}
      <Link href={`/products/${handle}`} className="absolute inset-0" />
    </div>
  );
};

export default ProductCardLarge;