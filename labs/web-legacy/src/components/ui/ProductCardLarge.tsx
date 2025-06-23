import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

import type { TProductItem as Product } from '@/types';
import Prices from './Prices';

export interface ProductCardLargeProps {
  className?: string;
  product: Product;
  priority?: boolean; // For above-the-fold images
}

const ProductCardLarge: FC<ProductCardLargeProps> = ({
  className = '',
  product,
  priority = false,
}) => {
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
              priority={priority}
              sizes="400px"
              src={images[0].url || images[0].src}
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
                  src={image.url || image.src}
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
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                const ratingValue = rating || 0;
                const isFilled = starValue <= Math.floor(ratingValue);
                const isHalfFilled = starValue === Math.ceil(ratingValue) && ratingValue % 1 !== 0;

                return (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      isFilled || isHalfFilled
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                );
              })}
            </div>
            <span className="text-sm">
              <span className="line-clamp-1">
                {rating?.toFixed(1)} ({reviewCount || 0} reviews)
              </span>
            </span>
          </div>
        </div>

        {/* Price */}
        <Prices className="mt-0.5" price={price || 0} compareAtPrice={compareAtPrice} />
      </div>

      {/* Full card link */}
      <Link href={`/products/${handle}`} className="absolute inset-0" />
    </div>
  );
};

export default ProductCardLarge;
