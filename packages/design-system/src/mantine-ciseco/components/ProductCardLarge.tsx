'use client';

import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Drawer, ScrollArea } from '@mantine/core';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { type TProductItem } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import AddToCardButton from './AddToCardButton';
import LikeButton from './LikeButton';
import Prices from './Prices';
import ProductQuickView from './ProductQuickView';
import ProductStatus from './ProductStatus';
import NcImage from './shared/NcImage/NcImage';

export interface Props extends Record<string, any> {
  className?: string;
  'data-testid'?: string;
  imageAspectRatio?: string;
  isLiked?: boolean;
  lazyLoad?: boolean;
  loading?: boolean;
  onAddToCart?: () => void;
  onCompare?: () => void;
  onLike?: () => void;
  onQuickView?: () => void;
  onShare?: () => void;
  onWishlist?: () => void;
  product: TProductItem;
  relatedProducts?: TProductItem[];
  responsive?: boolean;
  showAddToCart?: boolean;
  showAvailability?: boolean;
  showBundle?: boolean;
  showCompare?: boolean;
  showDetailedPricing?: boolean;
  showEnhancedActions?: boolean;
  showExtendedInfo?: boolean;
  showFeatures?: boolean;
  showImageGallery?: boolean;
  showInstallments?: boolean;
  showLike?: boolean;
  showLoyalty?: boolean;
  showQuantityControls?: boolean;
  showQuickView?: boolean;
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
  className,
  'data-testid': testId = 'product-card-large',
  isLiked = false,
  loading = false,
  product,
  showAddToCart = true,
  showLike = true,
  showQuickView = true,
  ...props
}) => {
  const localizeHref = useLocalizeHref();
  const [quickViewOpened, { close: closeQuickView, open: openQuickView }] = useDisclosure(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Optimize color rendering with delayed state
  const [shouldRenderColors, setShouldRenderColors] = useState(false);

  // Extract product data with defaults to avoid conditional hook usage
  const {
    featuredImage,
    handle,
    id,
    images,
    options,
    price,
    rating,
    reviewNumber,
    salePrice,
    selectedOptions,
    status,
    title,
  } = product;

  const color = selectedOptions?.find((option: any) => option.name === 'Color')?.value;

  // Memoize expensive computations
  const productUrl = useCallback(() => localizeHref(`/products/${handle}`), [localizeHref, handle]);

  // Only render colors after component is mounted and stable
  useDidUpdate(() => {
    setShouldRenderColors(true);
  }, [id]);

  // Reset scroll position when drawer opens
  useEffect(() => {
    if (quickViewOpened) {
      const resetScroll = () => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 0;
        }
      };

      resetScroll();
      requestAnimationFrame(resetScroll);
      const timeout = setTimeout(resetScroll, 100);

      return () => clearTimeout(timeout);
    }
  }, [quickViewOpened]);

  // Optimize color options with memoization and limits
  const renderColorOptions = useCallback(() => {
    if (!shouldRenderColors) return null;

    const optionColorValues = options?.find((option: any) => option.name === 'Color')?.optionValues;

    if (!optionColorValues?.length) {
      return null;
    }

    return (
      <div className="flex gap-1.5">
        {optionColorValues.slice(0, 4).map((color: any) => (
          <div
            key={color.name}
            aria-label={`Color: ${color.name}`}
            className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full"
            data-testid={`${testId}-color-option-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div
              className="absolute inset-0.5 z-0 rounded-full"
              style={{
                backgroundColor: color.swatch?.color,
                backgroundImage: color.swatch?.image ? `url(${color.swatch.image})` : undefined,
              }}
            />
          </div>
        ))}
      </div>
    );
  }, [shouldRenderColors, options, testId]);

  const renderGroupButtons = () => {
    return (
      <div className="absolute end-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        {showLike && (
          <LikeButton
            aria-label="Like product"
            className="relative ms-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            data-testid={`${testId}-like-button`}
            liked={isLiked}
            onClick={props.onLike}
          />
        )}
        {showQuickView && (
          <button
            aria-label="Quick view"
            className="relative ms-1.5 mt-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            data-testid={`${testId}-quick-view-button`}
            type="button"
            onClick={openQuickView}
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  // Product is guaranteed to exist when component is used
  // This was checked by the parent component

  // Show skeleton loading state
  if (loading) {
    return (
      <div
        className={`nc-ProductCardLarge relative flex flex-col bg-transparent ${className}`}
        data-testid={`${testId}-skeleton`}
      >
        <div className="group relative z-1 shrink-0 overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-300">
          <div
            className="flex aspect-[8/5] w-full animate-pulse bg-gray-200 dark:bg-gray-700"
            data-testid="placeholder"
          />
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-x-2.5">
          <div className="h-24 sm:h-28 bg-gray-200 rounded-2xl animate-pulse dark:bg-gray-700" />
          <div className="h-24 sm:h-28 bg-gray-200 rounded-2xl animate-pulse dark:bg-gray-700" />
          <div className="h-24 sm:h-28 bg-gray-200 rounded-2xl animate-pulse dark:bg-gray-700" />
        </div>
        <div className="space-y-4 pt-5">
          <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-3/4" />
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`nc-ProductCardLarge group relative flex flex-col bg-transparent ${className} ${status === 'out-of-stock' ? 'opacity-75' : ''}`}
        data-testid={testId}
      >
        <Link className="absolute inset-0" href={productUrl() as any} />

        <div className="group relative z-1 shrink-0 overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-300">
          <Link className="block" href={productUrl() as any}>
            {images?.[0] ? (
              <NcImage
                alt={images[0].alt ?? title ?? 'Product image'}
                className="rounded-2xl object-contain"
                containerClassName="aspect-8/5 bg-neutral-100 rounded-2xl overflow-hidden relative"
                data-testid={`${testId}-image`}
                fill
                sizes="400px"
                src={images[0]}
              />
            ) : (
              <div
                className="flex aspect-[8/5] w-full bg-gray-200 dark:bg-gray-700"
                data-testid="placeholder"
              />
            )}
          </Link>

          <ProductStatus data-testid={`${testId}-status`} status={status} />

          {showLike && (
            <LikeButton
              aria-label="Like product"
              className="absolute end-3 top-3 z-10"
              data-testid={`${testId}-like-button-static`}
              liked={isLiked}
              onClick={props.onLike}
            />
          )}

          {renderGroupButtons()}
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-x-2.5">
          {images?.[1] && (
            <NcImage
              alt={images[1].alt}
              className="rounded-2xl object-cover"
              containerClassName="w-full h-24 sm:h-28 relative"
              fill
              sizes="150px"
              src={images[1]}
            />
          )}
          {images?.[2] && (
            <NcImage
              alt={images[2].alt}
              className="rounded-2xl object-cover"
              containerClassName="w-full h-24 sm:h-28 relative"
              fill
              sizes="150px"
              src={images[2]}
            />
          )}
          {images?.[3] && (
            <NcImage
              alt={images[3].alt}
              className="h-full w-full rounded-2xl object-cover"
              containerClassName="w-full h-24 sm:h-28 relative"
              fill
              sizes="150px"
              src={images[3]}
            />
          )}
        </div>

        <div className="relative mt-5 space-y-4">
          {/* TITLE AND COLOR OPTIONS */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold sm:text-xl" data-testid={`${testId}-title`}>
                <Link href={productUrl() as any}>{title}</Link>
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
                <span className="text-sm">
                  <span className="line-clamp-1">{color}</span>
                </span>
                <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700" />
                <StarIcon className="h-4 w-4 text-orange-400" />
                <span className="text-sm">
                  <span className="line-clamp-1">
                    {(rating ?? 0).toFixed(1)} ({reviewNumber ?? 0} reviews)
                  </span>
                </span>
              </div>
            </div>
            {renderColorOptions()}
          </div>

          {/* PRICE */}
          <div className="flex items-center justify-between">
            <Prices
              className="text-green-600"
              contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium"
              data-testid={`${testId}-price`}
              price={price ?? 0}
              salePrice={salePrice}
            />
          </div>

          {/* ADD TO CART BUTTON */}
          {showAddToCart && (
            <div className="flex w-full">
              <AddToCardButton
                className="flex-1"
                color={color}
                data-testid={`${testId}-add-to-cart`}
                imageUrl={
                  featuredImage?.src ??
                  (typeof images?.[0] === 'string' ? images[0] : images?.[0]?.src) ??
                  ''
                }
                price={price ?? 0}
                quantity={1}
                size={selectedOptions?.find((option: any) => option.name === 'Size')?.value}
                title={title ?? ''}
                onClick={props.onAddToCart}
              />
            </div>
          )}
        </div>
      </div>

      <Drawer
        opened={quickViewOpened}
        position="right"
        size="sm"
        styles={{
          body: { padding: 0 },
          header: { paddingBottom: 0 },
        }}
        title="Product Quick View"
        onClose={closeQuickView}
      >
        <ScrollArea h="100%" ref={scrollAreaRef}>
          <ProductQuickView product={product} onClose={closeQuickView} />
        </ScrollArea>
      </Drawer>
    </>
  );
};

export default ProductCardLarge;
