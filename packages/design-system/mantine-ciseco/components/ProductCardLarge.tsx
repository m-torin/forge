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

export interface Props {
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
  'data-testid': testId = 'product-card-large',
  className,
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
    id,
    featuredImage,
    handle,
    images,
    options,
    price,
    rating,
    reviewNumber,
    salePrice,
    selectedOptions,
    status,
    title,
  } = product || {};

  const color = selectedOptions?.find((option) => option.name === 'Color')?.value;

  // Memoize expensive computations
  const productUrl = useCallback(
    () => localizeHref(`/products/${handle}`),
    [localizeHref, handle],
  );

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

    const optionColorValues = options?.find((option) => option.name === 'Color')?.optionValues;

    if (!optionColorValues?.length) {
      return null;
    }

    return (
      <div className="flex gap-1.5">
        {optionColorValues.slice(0, 4).map((color) => (
          <div
            key={color.name}
            data-testid={`${testId}-color-option-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full"
            aria-label={`Color: ${color.name}`}
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
            data-testid={`${testId}-like-button`}
            onClick={props.onLike}
            className="relative ms-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            aria-label="Like product"
            liked={isLiked}
          />
        )}
        {showQuickView && (
          <div
            data-testid={`${testId}-quick-view-button`}
            onClick={openQuickView}
            className="relative ms-1.5 mt-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            aria-label="Quick view"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  };

  // Early return for missing product after all hooks
  if (!product) {
    return null;
  }

  // Show skeleton loading state
  if (loading) {
    return (
      <div
        data-testid={`${testId}-skeleton`}
        className={`nc-ProductCardLarge relative flex flex-col bg-transparent ${className}`}
      >
        <div className="group relative z-1 shrink-0 overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-300">
          <div
            data-testid="placeholder"
            className="flex aspect-[8/5] w-full animate-pulse bg-gray-200 dark:bg-gray-700"
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
        data-testid={testId}
        className={`nc-ProductCardLarge group relative flex flex-col bg-transparent ${className} ${status === 'out-of-stock' ? 'opacity-75' : ''}`}
      >
        <Link href={productUrl() as any} className="absolute inset-0" />

        <div className="group relative z-1 shrink-0 overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-300">
          <Link href={productUrl() as any} className="block">
            {images?.[0] ? (
              <NcImage
                data-testid={`${testId}-image`}
                containerClassName="aspect-8/5 bg-neutral-100 rounded-2xl overflow-hidden relative"
                className="rounded-2xl object-contain"
                alt={images[0].alt || title || 'Product image'}
                fill
                sizes="400px"
                src={images[0]}
              />
            ) : (
              <div
                data-testid="placeholder"
                className="flex aspect-[8/5] w-full bg-gray-200 dark:bg-gray-700"
              />
            )}
          </Link>
          
          <ProductStatus data-testid={`${testId}-status`} status={status} />
          
          {showLike && (
            <LikeButton
              data-testid={`${testId}-like-button-static`}
              onClick={props.onLike}
              className="absolute end-3 top-3 z-10"
              aria-label="Like product"
              liked={isLiked}
            />
          )}
          
          {renderGroupButtons()}
        </div>

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

        <div className="relative mt-5 space-y-4">
          {/* TITLE AND COLOR OPTIONS */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 data-testid={`${testId}-title`} className="text-lg font-semibold sm:text-xl">
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
                    {(rating ?? 0).toFixed(1)} ({reviewNumber || 0} reviews)
                  </span>
                </span>
              </div>
            </div>
            {renderColorOptions()}
          </div>

          {/* PRICE */}
          <div className="flex items-center justify-between">
            <Prices
              data-testid={`${testId}-price`}
              contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium"
              className="text-green-600"
              price={price || 0}
              salePrice={salePrice}
            />
          </div>

          {/* ADD TO CART BUTTON */}
          {showAddToCart && (
            <div className="flex w-full">
              <AddToCardButton
                data-testid={`${testId}-add-to-cart`}
                color={color}
                onClick={props.onAddToCart}
                className="flex-1"
                imageUrl={featuredImage?.src || (typeof images?.[0] === 'string' ? images[0] : images?.[0]?.src) || ''}
                price={price || 0}
                quantity={1}
                size={selectedOptions?.find((option) => option.name === 'Size')?.value}
                title={title || ''}
              />
            </div>
          )}
        </div>
      </div>

      <Drawer
        onClose={closeQuickView}
        opened={quickViewOpened}
        position="right"
        styles={{
          body: { padding: 0 },
          header: { paddingBottom: 0 },
        }}
        size="md"
        title="Product Quick View"
      >
        <ScrollArea ref={scrollAreaRef} h="100%">
          <ProductQuickView onClose={closeQuickView} product={product} />
        </ScrollArea>
      </Drawer>
    </>
  );
};

export default ProductCardLarge;
