'use client';

import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Drawer, ScrollArea, Text, Center, Stack } from '@mantine/core';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { IconAlertTriangle, IconPackage } from '@tabler/icons-react';

import { FavoriteButton } from '@/components/guest/FavoriteButton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { type TProductItem } from '@/types';

// Local component definitions
interface PricesProps {
  className?: string;
  contentClass?: string;
  'data-testid'?: string;
  price: number;
  priceFormatter?: (price: number) => string;
  salePrice?: number;
}

const Prices: FC<PricesProps> = ({
  className,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  'data-testid': testId,
  price,
  priceFormatter,
  salePrice,
}) => {
  const formatPrice = priceFormatter ?? ((p: number) => `$${p.toFixed(2)}`);

  return (
    <div className={clsx(className)} data-testid={testId}>
      {salePrice ? (
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
            <span className="!leading-none text-green-500">{formatPrice(salePrice)}</span>
          </div>
          <span className="text-sm text-gray-500 line-through">{formatPrice(price)}</span>
        </div>
      ) : (
        <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
          <span className="!leading-none text-green-500">{formatPrice(price)}</span>
        </div>
      )}
    </div>
  );
};

interface ProductStatusProps {
  animate?: boolean;
  availableDate?: string;
  className?: string;
  clickable?: boolean;
  colorScheme?: {
    background: string;
    text: string;
  };
  'data-testid'?: string;
  icon?: React.ReactNode;
  maxStock?: number;
  notification?: boolean;
  onClick?: () => void;
  restockDate?: string;
  shape?: 'pill' | 'rounded' | 'square';
  showCount?: boolean;
  showDate?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  showRestockDate?: boolean;
  size?: 'lg' | 'md' | 'sm' | 'xs' | { base: string; lg: string; md: string; sm: string };
  status?: string;
  stockCount?: number;
  text?: string;
  tooltip?: string;
  urgent?: boolean;
  variant?: 'dot' | 'filled' | 'light' | 'outline';
}

const ProductStatus: FC<ProductStatusProps> = ({
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
  'data-testid': testId,
  status = 'New in',
}) => {
  const renderStatus = () => {
    if (!status) {
      return null;
    }

    const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`;
    if (status === 'New in') {
      return (
        <div className={classes} data-testid={testId}>
          <StarIcon className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === '50% Discount') {
      return (
        <div className={classes} data-testid={testId}>
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === 'Sold Out' || status === 'out-of-stock') {
      return (
        <div className={classes} data-testid={testId}>
          <span className="ms-1 leading-none">Sold Out</span>
        </div>
      );
    }
    if (status === 'limited edition') {
      return (
        <div className={classes} data-testid={testId}>
          <span className="ml-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  return renderStatus();
};

// Simplified AddToCartButton without complex notifications
interface AddToCartButtonProps {
  className?: string;
  'data-testid'?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const AddToCartButton: FC<AddToCartButtonProps> = ({
  className,
  'data-testid': testId = 'add-to-cart-button',
  onClick,
  children = 'Add to Cart',
}) => {
  return (
    <button
      className={clsx(
        'flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
        className,
      )}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Product Quick View Modal (simplified)
interface ProductQuickViewProps {
  product: TProductItem;
  onClose?: () => void;
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ product, onClose: _onClose }) => {
  const { title, featuredImage, price, description, vendor: _vendor } = product;

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Image */}
        <div className="lg:w-1/2">
          <div className="aspect-square relative">
            <Image
              alt={featuredImage.alt ?? title}
              className="rounded-xl object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              src={featuredImage.src}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 lg:mt-0 lg:w-1/2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {_vendor && <p className="mt-1 text-sm text-gray-500">{_vendor}</p>}

          <div className="mt-4">
            <Prices price={price || 0} />
          </div>

          {description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

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
  error?: string;
}

// Error state for ProductCard
function ProductCardError({ error, testId }: { error: string; testId: string }) {
  return (
    <div
      className="nc-ProductCard relative flex flex-col bg-transparent border-2 border-red-200 rounded-3xl p-4"
      data-testid={`${testId}-error`}
    >
      <Center py="xl">
        <Stack align="center" gap="sm">
          <IconAlertTriangle size={32} color="red" />
          <Text size="sm" c="red" ta="center">
            Failed to load product
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            {error}
          </Text>
        </Stack>
      </Center>
    </div>
  );
}

// Zero state for when no product data
function ProductCardEmpty({ testId }: { testId: string }) {
  return (
    <div
      className="nc-ProductCard relative flex flex-col bg-transparent border-2 border-gray-200 rounded-3xl p-4"
      data-testid={`${testId}-empty`}
    >
      <Center py="xl">
        <Stack align="center" gap="sm">
          <IconPackage size={32} color="gray" />
          <Text size="sm" c="dimmed" ta="center">
            No product data
          </Text>
        </Stack>
      </Center>
    </div>
  );
}

const ProductCard: FC<ProductCardProps> = memo(
  ({
    className = '',
    data,
    isLiked: _isLiked,
    loading,
    product,
    testId = 'product-card',
    showQuickView = true,
    error,
    ...props
  }) => {
    const [quickViewOpened, { close: closeQuickView, open: openQuickView }] = useDisclosure(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [internalError, setInternalError] = useState<string | null>(null);
    // Optimize color rendering with delayed state
    const [_shouldRenderColors, setShouldRenderColors] = useState(false);

    // Use consistent product data
    const productData = product ?? data;
    const {
      featuredImage,
      handle,
      id,
      price,
      rating,
      reviewCount,
      title,
      vendor: _vendor,
    } = productData ?? {};

    // Memoize expensive computations
    const productUrl = useCallback(() => `/products/${handle}`, [handle]);

    // Only render colors after component is mounted and stable
    useDidUpdate(() => {
      setShouldRenderColors(true);
    }, [id]);

    // Reset scroll position when drawer opens
    useEffect(() => {
      if (quickViewOpened && scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = 0;
      }
    }, [quickViewOpened]);

    // Show error state
    const currentError = error || internalError;
    if (currentError) {
      return <ProductCardError error={currentError} testId={testId} />;
    }

    // Convert price to number if it's a string from priceRange
    const displayPrice =
      typeof price === 'number'
        ? price
        : productData?.priceRange?.minVariantPrice
          ? parseFloat(productData.priceRange.minVariantPrice.amount)
          : 0;

    const renderGroupButtons = () => {
      return (
        <div className="absolute end-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <FavoriteButton
            className="relative ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
            productId={id!}
            productName={title}
            price={displayPrice}
          />
          {showQuickView && (
            <button
              aria-label="Quick view"
              className="relative ml-1.5 mt-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-xs text-neutral-700 shadow-lg dark:bg-neutral-900 dark:text-neutral-300"
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

    // Show skeleton loading state
    if (loading) {
      return (
        <div
          className={`nc-ProductCard relative flex flex-col bg-transparent ${className}`}
          data-testid={`${testId}-skeleton`}
        >
          <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
            <div
              className="flex aspect-[11/12] w-full animate-pulse bg-gray-200 dark:bg-gray-700"
              data-testid="placeholder"
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

    // Show zero state when no product data
    if (!productData) {
      return <ProductCardEmpty testId={testId} />;
    }

    return (
      <ErrorBoundary
        fallback={<ProductCardError error="Product card failed to render" testId={testId} />}
      >
        <div
          data-testid={testId}
          {...(props.onClick
            ? {
                onClick: props.onClick,
                onKeyDown: (e) => {
                  if (e.key === 'Enter' && props.onClick) {
                    props.onClick();
                  }
                },
                role: 'button',
                tabIndex: 0,
              }
            : {})}
          className={`nc-ProductCard group relative flex flex-col bg-transparent ${className} ${props.layout ? `layout-${props.layout}` : ''}`}
        >
          <Link className="absolute inset-0" href={productUrl()} />

          <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
            <ErrorBoundary
              fallback={
                <div className="aspect-[11/12] w-full bg-red-100 flex items-center justify-center text-red-500 text-sm">
                  Image Error
                </div>
              }
            >
              <Link className="block" href={productUrl()}>
                {featuredImage?.src ? (
                  <div className="relative aspect-[11/12] w-full">
                    <Image
                      alt={featuredImage.alt || title || 'Product image'}
                      className="object-cover"
                      data-testid={`${testId}-image`}
                      fill
                      loading={props.lazyLoad ? 'lazy' : 'eager'}
                      sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      src={featuredImage.src}
                      onError={() => setInternalError('Failed to load product image')}
                    />
                  </div>
                ) : (
                  <div
                    className="flex aspect-[11/12] w-full bg-gray-200 dark:bg-gray-700"
                    data-testid="placeholder"
                  />
                )}
              </Link>
            </ErrorBoundary>
            <ErrorBoundary fallback={null}>
              <ProductStatus data-testId={`${testId}-status`} status="New in" />
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>{renderGroupButtons()}</ErrorBoundary>
          </div>

          <div className="space-y-4 px-2.5 pt-5 pb-2.5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold text-neutral-900 dark:text-neutral-100"
                  data-testid={`${testId}-title`}
                >
                  <Link href={productUrl()}>{title}</Link>
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <Prices
                  className="text-green-600"
                  contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium"
                  data-testid={`${testId}-price`}
                  price={displayPrice}
                  priceFormatter={props.priceFormatter}
                />

                {(rating || reviewCount) && (
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 pb-[1px] text-amber-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {(rating ?? 0).toFixed(1)} ({reviewCount ?? 0} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full space-x-3">
              <AddToCartButton
                className="flex-1"
                data-testid={`${testId}-add-to-cart`}
                onClick={props.onAddToCart}
              />
            </div>
          </div>
        </div>

        {showQuickView && (
          <Drawer
            opened={quickViewOpened}
            position="right"
            size="md"
            styles={{
              body: { padding: 0 },
              header: { paddingBottom: 0 },
            }}
            title="Product Quick View"
            onClose={closeQuickView}
          >
            <ScrollArea h="100%" ref={scrollAreaRef}>
              <ErrorBoundary
                fallback={
                  <div className="p-6 text-center text-red-500">Failed to load product details</div>
                }
              >
                <ProductQuickView product={productData} onClose={closeQuickView} />
              </ErrorBoundary>
            </ScrollArea>
          </Drawer>
        )}
      </ErrorBoundary>
    );
  },
);

// Add display name for debugging
ProductCard.displayName = 'ProductCard';

export { ProductCard, Prices, AddToCartButton };
export default ProductCard;
