'use client';

import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Drawer, ScrollArea } from '@mantine/core';
import { useDisclosure, useDidUpdate } from '@mantine/hooks';
import Link from 'next/link';
import { type FC, useEffect, useRef, memo, useCallback, useState } from 'react';

import { type TProductItem } from '../data/data';
import { useLocalizeHref } from '../hooks/useLocale';

import AddToCardButton from './AddToCardButton';
import LikeButton from './LikeButton';
import Prices from './Prices';
import ProductQuickView from './ProductQuickView';
import ProductStatus from './ProductStatus';
import { ProgressiveImage } from './ProgressiveImage';
import ButtonPrimary from './shared/Button/ButtonPrimary';
import ButtonSecondary from './shared/Button/ButtonSecondary';

export interface ProductCardProps {
  className?: string;
  data?: TProductItem;
  imageAspectRatio?: string;
  isLiked?: boolean;
  layout?: 'grid' | 'list';
  lazyLoad?: boolean;
  loading?: boolean;
  onAddToCart?: () => void;
  onClick?: () => void;
  onCompare?: () => void;
  onLike?: () => void;
  onQuickView?: () => void;
  onWishlist?: () => void;
  priceFormatter?: (price: number) => string;
  product?: TProductItem;
  responsive?: Record<string, any>;
  showAddToCart?: boolean;
  showCompare?: boolean;
  showDiscount?: boolean;
  showImageGallery?: boolean;
  showLike?: boolean;
  showQuickView?: boolean;
  showRating?: boolean;
  showShipping?: boolean;
  showSizes?: boolean;
  showVariants?: boolean;
  showWishlist?: boolean;
  testId?: string;
}

const ProductCard: FC<ProductCardProps> = memo(
  ({ className = '', data, isLiked, loading, product, testId = 'product-card', ...props }) => {
    const localizeHref = useLocalizeHref();
    const [quickViewOpened, { close: closeQuickView, open: openQuickView }] = useDisclosure(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // ✅ Optimize color rendering with delayed state
    const [shouldRenderColors, setShouldRenderColors] = useState(false);

    const {
      id,
      featuredImage,
      handle,
      images,
      options,
      price,
      salePrice,
      rating,
      reviewNumber,
      selectedOptions,
      status,
      title,
    } = product || data || {};
    const color = selectedOptions?.find((option) => option.name === 'Color')?.value;

    // ✅ Memoize expensive computations
    const productUrl = useCallback(
      () => localizeHref(`/products/${handle}`),
      [localizeHref, handle],
    );

    // ✅ Only render colors after component is mounted and stable
    useDidUpdate(() => {
      setShouldRenderColors(true);
    }, [id]);

    // Reset scroll position when drawer opens
    useEffect(() => {
      if (quickViewOpened) {
        // Multiple approaches to ensure scroll reset works
        const resetScroll = () => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0;
          }
        };

        // Immediate reset
        resetScroll();

        // Fallback after animation frame
        requestAnimationFrame(resetScroll);

        // Final fallback after a short delay
        const timeout = setTimeout(resetScroll, 100);

        return () => clearTimeout(timeout);
      }
    }, [quickViewOpened]);

    // ✅ Optimize color options with memoization and limits
    const renderColorOptions = useCallback(() => {
      if (!shouldRenderColors) return null;

      const optionColorValues = options?.find((option) => option.name === 'Color')?.optionValues;

      if (!optionColorValues?.length) {
        return null;
      }

      return (
        <div className="flex gap-1.5">
          {optionColorValues.slice(0, 4).map(
            (
              color, // ✅ Limit to 4 colors for performance
            ) => (
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
            ),
          )}
        </div>
      );
    }, [shouldRenderColors, options, testId]);

    const renderGroupButtons = () => {
      return (
        <div className="absolute end-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <LikeButton
            onClick={props.onLike}
            className="relative ms-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            aria-label="Like product"
            liked={isLiked}
          />
          <div
            data-testid={`${testId}-quick-view-button`}
            onClick={openQuickView}
            className="relative ms-1.5 mt-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            aria-label="Quick view"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
          </div>
        </div>
      );
    };

    // Show skeleton loading state
    if (loading) {
      return (
        <div
          data-testid={`${testId}-skeleton`}
          className={`nc-ProductCard relative flex flex-col bg-transparent ${className}`}
        >
          <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
            <div
              data-testid="placeholder"
              className="flex aspect-[11/12] w-full animate-pulse bg-gray-200 dark:bg-gray-700"
            />
          </div>
          <div className="space-y-4 px-2.5 pt-5 pb-2.5">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-3/4" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-1/4" />
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      );
    }

    if (!product && !data) {
      return null;
    }

    return (
      <>
        <div
          data-testid={testId}
          onClick={props.onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && props.onClick) {
              props.onClick();
            }
          }}
          className={`nc-ProductCard group relative flex flex-col bg-transparent ${className} ${props.layout ? `layout-${props.layout}` : ''} ${status === 'out-of-stock' ? 'opacity-75' : ''}`}
          tabIndex={props.onClick ? 0 : undefined}
        >
          <Link href={productUrl() as any} className="absolute inset-0" />

          <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
            <Link href={productUrl() as any} className="block">
              {featuredImage?.src ? (
                <ProgressiveImage
                  data-testid={`${testId}-image`}
                  width={400}
                  loading={props.lazyLoad ? 'lazy' : 'eager'}
                  placeholder={featuredImage.alt}
                  priority={false}
                  className="flex aspect-[11/12] w-full relative"
                  alt={handle || 'Product image'}
                  height={440}
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  src={featuredImage.src}
                />
              ) : (
                <div
                  data-testid="placeholder"
                  className="flex aspect-[11/12] w-full bg-gray-200 dark:bg-gray-700"
                />
              )}
            </Link>
            <ProductStatus data-testid={`${testId}-status`} status={status} />
            <LikeButton
              data-testid={`${testId}-like-button`}
              onClick={props.onLike}
              className="absolute end-3 top-3 z-10"
              aria-label="Like product"
              liked={isLiked}
            />
            {renderGroupButtons()}
          </div>

          <div className="space-y-4 px-2.5 pt-5 pb-2.5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  data-testid={`${testId}-title`}
                  className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  <Link href={productUrl() as any}>{title}</Link>
                </h3>
                {renderColorOptions()}
              </div>

              <div className="flex items-center justify-between">
                <Prices
                  data-testid={`${testId}-price`}
                  price={price || 0}
                  salePrice={salePrice}
                  className="text-green-600"
                  contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium"
                />

                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 pb-[1px] text-amber-400" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {(rating ?? 0).toFixed(1)} ({reviewNumber || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full space-x-3">
              <AddToCardButton
                data-testid={`${testId}-add-to-cart`}
                onClick={props.onAddToCart}
                className="flex-1"
                imageUrl={featuredImage?.src || ''}
                price={price || 0}
                quantity={1}
                title={title || ''}
                color={color}
                size={selectedOptions?.find((option) => option.name === 'Size')?.value}
              />
            </div>
          </div>
        </div>

        <Drawer
          opened={quickViewOpened}
          onClose={closeQuickView}
          title="Product Quick View"
          position="right"
          size="md"
          styles={{
            body: { padding: 0 },
            header: { paddingBottom: 0 },
          }}
        >
          <ScrollArea h="100%" ref={scrollAreaRef}>
            <ProductQuickView product={product || data} onClose={closeQuickView} />
          </ScrollArea>
        </Drawer>
      </>
    );
  },
);

// ✅ Add display name for debugging
ProductCard.displayName = 'ProductCard';

export { ProductCard };
export default ProductCard;
