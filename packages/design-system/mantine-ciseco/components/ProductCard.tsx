'use client';

import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Drawer, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { type FC, useEffect, useRef } from 'react';

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

const ProductCard: FC<ProductCardProps> = ({
  className = '',
  data,
  isLiked,
  loading,
  product,
  testId = 'product-card',
  ...props
}) => {
  const localizeHref = useLocalizeHref();
  const [quickViewOpened, { close: closeQuickView, open: openQuickView }] = useDisclosure(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    id,
    featuredImage,
    handle,
    images,
    options,
    price,
    rating,
    reviewNumber,
    selectedOptions,
    status,
    title,
  } = product || data || {};
  const color = selectedOptions?.find((option) => option.name === 'Color')?.value;

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

  const renderColorOptions = () => {
    const optionColorValues = options?.find((option) => option.name === 'Color')?.optionValues;

    if (!optionColorValues?.length) {
      return null;
    }

    return (
      <div className="flex gap-1.5">
        {optionColorValues.map((color) => (
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
  };

  const renderGroupButtons = () => {
    return (
      <div className="invisible absolute inset-x-1 bottom-0 flex justify-center opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
        <AddToCardButton
          data-testid={`${testId}-add-to-cart-button`}
          color={selectedOptions?.find((option) => option.name === 'Color')?.value}
          fontSize="text-xs"
          className="shadow-lg"
          as={ButtonPrimary}
          imageUrl={featuredImage?.src || ''}
          price={price || 0}
          quantity={1}
          size={selectedOptions?.find((option) => option.name === 'Size')?.value}
          sizeClass="py-2 px-4"
          title={title || ''}
        >
          <HugeiconsIcon
            strokeWidth={2}
            color="currentColor"
            icon={ShoppingBag03Icon}
            className="mb-px"
            size={12}
          />
          <span className="ms-1">Add to bag</span>
        </AddToCardButton>

        <ButtonSecondary
          data-testid={`${testId}-quick-view-button`}
          fontSize="text-xs"
          onClick={openQuickView}
          className="ms-1.5 bg-white shadow-lg transition-colors hover:bg-gray-100! hover:text-neutral-900"
          aria-label="Quick view"
          sizeClass="py-2 px-4"
        >
          <ArrowsPointingOutIcon className="size-3.5" />
          <span className="ms-1">Quick view</span>
        </ButtonSecondary>
      </div>
    );
  };

  const productUrl = localizeHref(`/products/${handle}`);

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
        className={`nc-ProductCard relative flex flex-col bg-transparent ${className} ${props.layout ? `layout-${props.layout}` : ''} ${status === 'out-of-stock' ? 'opacity-75' : ''}`}
        tabIndex={props.onClick ? 0 : undefined}
      >
        <Link href={productUrl as any} className="absolute inset-0" />

        <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
          <Link href={productUrl as any} className="block">
            {featuredImage?.src ? (
              <ProgressiveImage
                data-testid={`${testId}-image`}
                loading={props.lazyLoad ? 'lazy' : 'eager'}
                placeholder={featuredImage.alt}
                priority={false}
                className="flex aspect-[11/12] w-full relative"
                alt={handle || 'Product image'}
                fill
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
          {status === 'out-of-stock' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-3xl">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="space-y-4 px-2.5 pt-5 pb-2.5">
          {renderColorOptions()}
          <div>
            <h2 className="nc-ProductCard__title text-base font-semibold transition-colors">
              {title}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{color}</p>
          </div>

          <div className="flex items-end justify-between">
            <Prices
              data-testid={`${testId}-price`}
              priceFormatter={props.priceFormatter}
              price={price ?? 1}
              salePrice={props.product?.salePrice}
            />
            {props.showRating && (
              <div className="mb-0.5 flex items-center">
                <StarIcon className="h-5 w-5 pb-px text-amber-400" />
                <span className="ms-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {rating || ''} ({reviewNumber || 0})
                </span>
              </div>
            )}
            {props.showDiscount && price && props.product?.salePrice && (
              <span className="text-sm font-medium text-green-600">
                {Math.round(((price - props.product.salePrice) / price) * 100)}% OFF
              </span>
            )}
          </div>

          {props.showCompare && (
            <div className="flex items-center">
              <input
                data-testid={`${testId}-compare-checkbox`}
                id={`compare-${id}`}
                onChange={props.onCompare}
                className="mr-2"
                aria-label="Compare"
                type="checkbox"
              />
              <label htmlFor={`compare-${id}`} className="text-sm">
                Compare
              </label>
            </div>
          )}

          {props.product?.badges && (
            <div className="flex gap-2 flex-wrap">
              {props.product.badges.map((badge, index) => (
                <span
                  key={index}
                  data-testid={`${testId}-badge-${index}`}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer
        onClose={closeQuickView}
        opened={quickViewOpened}
        overlayProps={{ blur: 4, opacity: 0.5 }}
        position="right"
        transitionProps={{ duration: 300, transition: 'slide-left' }}
        styles={{
          body: { height: '100%', padding: 0 },
          content: { display: 'flex', flexDirection: 'column' },
        }}
        size={800}
        title="Product Details"
        zIndex={200}
      >
        <ScrollArea ref={scrollAreaRef} scrollbarSize={8} h="100%" p="md" type="scroll">
          <ProductQuickView product={product || data} />
        </ScrollArea>
      </Drawer>
    </>
  );
};

export { ProductCard };
export default ProductCard;
