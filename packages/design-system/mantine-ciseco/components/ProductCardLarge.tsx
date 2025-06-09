'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { type FC } from 'react';

import { type TProductItem } from '../data/data';
import { useLocalizeHref } from '../hooks/useLocale';

import Prices from './Prices';
import NcImage from './shared/NcImage/NcImage';

export interface Props {
  className?: string;
  'data-testid'?: string;
  onAddToCart?: () => void;
  onCompare?: () => void;
  onLike?: () => void;
  onQuickView?: () => void;
  onShare?: () => void;
  onWishlist?: () => void;
  product: TProductItem;
  relatedProducts?: TProductItem[];
  responsive?: boolean;
  showAvailability?: boolean;
  showBundle?: boolean;
  showCompare?: boolean;
  showDetailedPricing?: boolean;
  showEnhancedActions?: boolean;
  showExtendedInfo?: boolean;
  showFeatures?: boolean;
  showImageGallery?: boolean;
  showInstallments?: boolean;
  showLoyalty?: boolean;
  showQuantityControls?: boolean;
  showRelated?: boolean;
  showReviews?: boolean;
  showShippingInfo?: boolean;
  showSizeGuide?: boolean;
  showSocialShare?: boolean;
  showSpecifications?: boolean;
  showVariantDetails?: boolean;
  showWishlist?: boolean;
}

const ProductCardLarge: FC<Props> = ({
  'data-testid': testId = 'product-card-large',
  className,
  product,
}) => {
  const localizeHref = useLocalizeHref();
  
  if (!product) {
    return null;
  }
  
  const { handle, images, price, rating, reviewNumber, selectedOptions, title } = product;

  const color = selectedOptions?.find((option) => option.name === 'Color')?.value;

  return (
    <div data-testid={testId} className={`CollectionCard2 group relative ${className}`}>
      <div className="relative flex flex-col">
        {images?.[0] && (
          <NcImage
            data-testid="product-image"
            containerClassName="aspect-8/5 bg-neutral-100 rounded-2xl overflow-hidden relative"
            className="rounded-2xl object-contain"
            alt=""
            fill
            sizes="400px"
            src={images?.[0]}
          />
        )}
        <div className="mt-2.5 grid grid-cols-3 gap-x-2.5">
          {images?.[1] && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="rounded-2xl object-cover"
              alt={images[1].alt}
              fill
              sizes="150px"
              src={images[1]}
            />
          )}
          {images?.[2] && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="rounded-2xl object-cover"
              alt={images[2].alt}
              fill
              sizes="150px"
              src={images[2]}
            />
          )}
          {images?.[3] && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="h-full w-full rounded-2xl object-cover"
              alt={images[3].alt}
              fill
              sizes="150px"
              src={images[3]}
            />
          )}
        </div>
      </div>

      <div className="relative mt-5 flex justify-between gap-4">
        {/* TITLE */}
        <div className="flex-1">
          <h2 data-testid="product-title" className="text-lg font-semibold sm:text-xl">
            {title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <span className="text-sm">
              <span className="line-clamp-1">{color}</span>
            </span>
            <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700" />
            <StarIcon className="h-4 w-4 text-orange-400" />
            <span className="text-sm">
              <span className="line-clamp-1">
                {rating} ({reviewNumber} reviews)
              </span>
            </span>
          </div>
        </div>
        <Prices className="mt-0.5" price={price || 1} />
      </div>
      <Link href={localizeHref(`/products/${handle}`)} className="absolute inset-0" />
    </div>
  );
};

export default ProductCardLarge;
