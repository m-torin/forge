'use client';

import { logger } from '@/lib/logger';
import {
  Accordion,
  Button,
  Modal,
  NumberInput,
  Rating,
  Skeleton,
  Alert,
  Text,
} from '@mantine/core';
import {
  IconClock,
  IconSparkles,
  IconStar,
  IconShoppingBag,
  IconBan,
  IconDiscount2,
  IconAlertTriangle,
  IconPackage,
} from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import { useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import type { TProductItem as Product } from '@/types';
// TODO: Add cart store
// import { useCartStore } from '@/store/cart-store';
import Prices from './Prices';
import LikeFavoriteButton from './LikeFavoriteButton';

export interface ProductQuickViewProps {
  opened: boolean;
  onClose: () => void;
  product: Product;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for ProductQuickView
function ProductQuickViewSkeleton({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      padding={0}
      withCloseButton={false}
      classNames={{
        content: 'overflow-hidden',
      }}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="lg:flex">
          <div className="w-full lg:w-[50%]">
            <Skeleton height={400} radius="xl" />
            <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
              <Skeleton height={200} radius="xl" />
              <Skeleton height={200} radius="xl" />
            </div>
          </div>
          <div className="w-full pt-6 lg:w-[50%] lg:pl-7 lg:pt-0 xl:pl-8">
            <div className="space-y-8">
              <div>
                <Skeleton height={36} width="80%" mb="md" />
                <div className="flex gap-4">
                  <Skeleton height={32} width={80} />
                  <Skeleton height={20} width={120} />
                </div>
              </div>
              <Skeleton height={40} width="60%" />
              <Skeleton height={40} width="60%" />
              <div className="flex gap-4">
                <Skeleton height={48} width={80} />
                <Skeleton height={48} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Error state for ProductQuickView
function ProductQuickViewError({
  error: _error,
  opened,
  onClose,
}: {
  error: string;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      padding={0}
      withCloseButton={false}
      classNames={{
        content: 'overflow-hidden',
      }}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Text size="sm">Product quick view failed to load</Text>
        </Alert>
      </div>
    </Modal>
  );
}

// Zero state for ProductQuickView
function ProductQuickViewEmpty({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      padding={0}
      withCloseButton={false}
      classNames={{
        content: 'overflow-hidden',
      }}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconPackage size={48} stroke={1} color="var(--mantine-color-gray-5)" />
          <Text size="lg" fw={600} c="dimmed" mt="md">
            Product not available
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            The requested product could not be found
          </Text>
        </div>
      </div>
    </Modal>
  );
}

const ProductQuickView: FC<ProductQuickViewProps> = ({
  opened,
  onClose,
  product,
  loading = false,
  error: _error,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [internalError, _setInternalError] = useState<string | null>(null);
  // TODO: Add cart store
  // const addToCart = useCartStore((state) => state.addItem);
  const addToCart = () => logger.info('Add to cart clicked');

  // Show loading state
  if (loading) {
    return <ProductQuickViewSkeleton opened={opened} onClose={onClose} />;
  }

  // Show error state
  const currentError = _error || internalError;
  if (currentError) {
    return <ProductQuickViewError error={currentError} opened={opened} onClose={onClose} />;
  }

  // Show zero state when no product
  if (!product) {
    return <ProductQuickViewEmpty opened={opened} onClose={onClose} />;
  }

  const {
    handle,
    images,
    price,
    compareAtPrice,
    rating,
    reviewCount,
    variants,
    title,
    description,
    availableForSale,
    tags,
  } = product;

  // Extract options from variants
  const sizeOptions = Array.from(
    new Set(
      variants
        ?.map((v) => v.selectedOptions?.find((opt) => opt.name === 'Size')?.value)
        .filter(Boolean),
    ),
  ) as string[];
  const colorOptions = Array.from(
    new Set(
      variants
        ?.map((v) => v.selectedOptions?.find((opt) => opt.name === 'Color')?.value)
        .filter(Boolean),
    ),
  ) as string[];

  const handleAddToCart = () => {
    // Find matching variant
    const variant =
      variants?.find((v) => {
        const variantSize = v.selectedOptions?.find((opt) => opt.name === 'Size')?.value;
        const variantColor = v.selectedOptions?.find((opt) => opt.name === 'Color')?.value;
        return variantSize === selectedSize && variantColor === selectedColor;
      }) || variants?.[0];

    if (variant) {
      addToCart();
      /* TODO: Implement cart functionality */
    }
  };

  const renderStatus = () => {
    if (!availableForSale) {
      return (
        <div className="absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 shadow-lg rounded-full flex items-center justify-center">
          <IconBan className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">Sold Out</span>
        </div>
      );
    }
    if (tags?.includes('new')) {
      return (
        <div className="absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 shadow-lg rounded-full flex items-center justify-center">
          <IconSparkles className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">New In</span>
        </div>
      );
    }
    if (compareAtPrice && price && compareAtPrice > price) {
      const discount = Math.round(((compareAtPrice - (price || 0)) / compareAtPrice) * 100);
      return (
        <div className="absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 shadow-lg rounded-full flex items-center justify-center">
          <IconDiscount2 className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">{discount}% Off</span>
        </div>
      );
    }
    if (tags?.includes('limited')) {
      return (
        <div className="absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 shadow-lg rounded-full flex items-center justify-center">
          <IconClock className="h-3.5 w-3.5" />
          <span className="ml-1 leading-none">Limited Edition</span>
        </div>
      );
    }
    return null;
  };

  const renderColorOptions = () => {
    if (!colorOptions.length) return null;

    return (
      <div>
        <label className="block">
          <span className="text-sm font-medium">Color</span>
        </label>
        <div className="mt-2.5 flex gap-x-2.5">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={clsx(
                'relative size-9 cursor-pointer rounded-full',
                selectedColor === color && 'ring-2 ring-neutral-900 ring-offset-2',
              )}
              title={color}
            >
              <div
                className="absolute inset-0.5 z-0 overflow-hidden rounded-full"
                style={{
                  backgroundColor: color ? color.toLowerCase() : '#ccc',
                }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSizeOptions = () => {
    if (!sizeOptions.length) return null;

    return (
      <div>
        <div className="flex justify-between text-sm font-medium">
          <label>
            <span>Size</span>
          </label>
          <button className="text-primary-600 hover:text-primary-500 cursor-pointer">
            See sizing chart
          </button>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {sizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size || null)}
              className={clsx(
                'relative flex h-10 select-none items-center justify-center overflow-hidden rounded-lg text-sm font-medium uppercase text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:ring-neutral-600 dark:hover:bg-neutral-700',
                selectedSize === size && 'ring-2 ring-neutral-900 dark:ring-neutral-200',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={
        <ProductQuickViewError
          error="Product quick view failed to render"
          opened={opened}
          onClose={onClose}
        />
      }
    >
      <Modal
        opened={opened}
        onClose={onClose}
        size="xl"
        padding={0}
        withCloseButton={false}
        classNames={{
          content: 'overflow-hidden',
        }}
      >
        <ErrorBoundary
          fallback={
            <div className="p-8">
              <Text c="red">Product content failed to load</Text>
            </div>
          }
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="lg:flex">
              {/* Images */}
              <div className="w-full lg:w-[50%]">
                <div className="relative">
                  <div className="relative aspect-square">
                    {images?.[0] && (
                      <Image
                        className="rounded-xl object-cover"
                        alt={images[0].altText || title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={images[0].url || images[0].src}
                      />
                    )}
                  </div>
                  {renderStatus()}
                  <LikeFavoriteButton className="absolute end-3 top-3" productId={product.id} />
                </div>

                {/* Thumbnail images */}
                {images && images.length > 1 && (
                  <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
                    {images.slice(1, 3).map((image, index) => (
                      <div key={index} className="relative aspect-[3/4]">
                        <Image
                          className="rounded-xl object-cover"
                          alt={image.altText || `${title} ${index + 2}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          src={image.url || image.src}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="w-full pt-6 lg:w-[50%] lg:pl-7 lg:pt-0 xl:pl-8">
                <div className="space-y-8">
                  {/* Heading */}
                  <div>
                    <h2 className="text-3xl font-semibold">
                      <Link href={`/products/${handle}`}>{title}</Link>
                    </h2>

                    <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5">
                      <Prices
                        contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
                        price={price || 0}
                        compareAtPrice={compareAtPrice}
                      />
                      <div className="h-6 border-l border-neutral-300 dark:border-neutral-700" />
                      <div className="flex items-center">
                        <Link
                          href={`/products/${handle}`}
                          className="flex items-center text-sm font-medium"
                        >
                          <Rating
                            value={rating || 0}
                            fractions={2}
                            readOnly
                            size="sm"
                            emptySymbol={<IconStar size={20} />}
                          />
                          <div className="ml-1.5 flex">
                            <span>{rating?.toFixed(1)}</span>
                            <span className="mx-2 block">·</span>
                            <span className="text-neutral-600 underline dark:text-neutral-400">
                              {reviewCount} reviews
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  {renderColorOptions()}
                  {renderSizeOptions()}

                  {/* Quantity and Add to Cart */}
                  <div className="flex gap-x-3.5">
                    <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-4 dark:bg-neutral-800/70">
                      <NumberInput
                        value={quantity}
                        onChange={(value) => setQuantity(Number(value) || 1)}
                        min={1}
                        max={10}
                        size="md"
                        styles={{
                          input: {
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'center',
                            width: '60px',
                          },
                        }}
                      />
                    </div>
                    <Button
                      size="lg"
                      fullWidth
                      leftSection={<IconShoppingBag size={20} />}
                      onClick={handleAddToCart}
                      disabled={!availableForSale}
                    >
                      Add to cart
                    </Button>
                  </div>

                  {/* Accordion Info */}
                  <Accordion defaultValue="description">
                    <Accordion.Item value="description">
                      <Accordion.Control>Description</Accordion.Control>
                      <Accordion.Panel>
                        {description ||
                          'Fashion is a form of self-expression and autonomy at a particular period and place.'}
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="features">
                      <Accordion.Control>Features</Accordion.Control>
                      <Accordion.Panel>
                        <ul className="list-disc list-inside leading-7">
                          <li>Material: Premium quality fabric</li>
                          <li>Comfortable fit with stretch technology</li>
                          <li>Machine washable</li>
                          <li>Sustainable production</li>
                        </ul>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="shipping">
                      <Accordion.Control>Shipping & Return</Accordion.Control>
                      <Accordion.Panel>
                        We offer free shipping on all orders over $50. If you are not satisfied with
                        your purchase, you can return it within 30 days for a full refund.
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>

                  {/* Link to product page */}
                  <div className="flex text-sm text-neutral-500">
                    <p className="text-xs">
                      or{' '}
                      <Link
                        href={`/products/${handle}`}
                        className="text-xs font-medium uppercase text-neutral-900 dark:text-neutral-100"
                        onClick={onClose}
                      >
                        Go to product detail page <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </Modal>
    </ErrorBoundary>
  );
};

export default ProductQuickView;
