'use client';

import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { type TProductDetail, type TProductItem } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import AccordionInfo from './AccordionInfo';
import AddToCardButton from './AddToCardButton';
import { Divider } from './Divider';
import IconDiscount from './IconDiscount';
import LikeButton from './LikeButton';
import NcInputNumber from './NcInputNumber';
import Prices from './Prices';
import ButtonPrimary from './shared/Button/ButtonPrimary';

export interface ProductQuickViewProps extends Record<string, any> {
  className?: string;
  'data-testid'?: string;
  isOpen?: boolean;
  loading?: boolean;
  onAddToCart?: () => void;
  onClose?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  product: TProductDetail | TProductItem; // Accept either type
}

const ProductQuickView: FC<ProductQuickViewProps> = ({
  className,
  'data-testid': testId = 'quick-view-modal',
  isOpen: isOpen,
  loading: loading,
  onAddToCart: onAddToCart,
  onClose: onClose,
  onLike: onLike,
  onShare: onShare,
  onViewDetails: onViewDetails,
  product,
}) => {
  const localizeHref = useLocalizeHref();

  const [qualitySelected, setQualitySelected] = useState(1);

  // Product is guaranteed to exist when this component is used

  const {
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
  } = product;
  const sizeSelected = selectedOptions?.find((option) => option.name === 'Size')?.value;
  const colorSelected = selectedOptions?.find((option) => option.name === 'Color')?.value;

  const renderOtherOptions = () => {
    const otherOptions = options?.filter((option) => option.name !== 'Size');
    if (!otherOptions?.length) {
      return null;
    }

    return otherOptions.map((option) => {
      return (
        <div key={option.name}>
          <label className="block rtl:text-right" htmlFor="">
            <span className="text-sm font-medium">{option.name}</span>
          </label>
          <div className="mt-2.5 flex gap-x-2.5">
            {option.optionValues?.map((value, index) => {
              // for demo purpose
              const isActive = index === 1;

              return (
                <div
                  key={value.name}
                  className={clsx(
                    'relative size-9 cursor-pointer rounded-full',
                    isActive && 'ring-2 ring-neutral-900 ring-offset-2',
                  )}
                >
                  <div
                    className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover"
                    style={{
                      backgroundColor: value.swatch?.color,
                      backgroundImage: value.swatch?.image
                        ? `url(${value.swatch.image})`
                        : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const renderSizeOptions = () => {
    const sizeOptionValues = options?.find((option) => option.name === 'Size')?.optionValues;

    if (!sizeOptionValues?.length) {
      return null;
    }

    return (
      <div>
        <div className="flex justify-between text-sm font-medium">
          <label>
            <span>Size</span>
          </label>
          <div className="cursor-pointer text-primary-600 hover:text-primary-500">
            See sizing chart
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {sizeOptionValues.map((size, index) => {
            // for demo purpose
            const isActive = index === 0;
            return (
              <div
                key={size.name}
                className={clsx(
                  'relative flex h-10 items-center justify-center overflow-hidden rounded-lg text-sm font-medium text-neutral-900 uppercase ring-1 ring-neutral-200 select-none hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:ring-neutral-600 dark:hover:bg-neutral-700',
                  isActive && 'ring-2 ring-neutral-900 dark:ring-neutral-200',
                )}
              >
                {size.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const CLASSES =
      'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 nc-shadow-lg rounded-full flex items-center justify-center text-neutral-700 text-neutral-900 dark:text-neutral-300';
    if (status === 'New in') {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === '50% Discount') {
      return (
        <div className={CLASSES}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === 'Sold Out') {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === 'limited edition') {
      return (
        <div className={CLASSES}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        {/* ---------- 1 HEADING ----------  */}
        <div>
          <h2 className="text-3xl font-semibold">
            <Link href={localizeHref(`/products/${handle}`)}>{title}</Link>
          </h2>

          <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5 rtl:justify-end">
            <Prices
              contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
              price={price ?? 1}
            />
            <div className="h-6 border-s border-neutral-300 dark:border-neutral-700" />
            <div className="flex items-center">
              <Link
                className="flex items-center text-sm font-medium"
                href={localizeHref(`/products/${handle}`)}
              >
                <StarIcon className="h-5 w-5 pb-px text-yellow-400" />
                <div className="ms-1.5 flex">
                  <span>{rating}</span>
                  <span className="mx-2 block">·</span>
                  <span className="text-neutral-600 underline dark:text-neutral-400">
                    {reviewNumber} reviews
                  </span>
                </div>
              </Link>
              <span className="mx-2.5 hidden sm:block">·</span>
              <div className="hidden items-center text-sm sm:flex">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span className="ms-1 leading-none">{status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
        <div>{renderOtherOptions()}</div>
        <div>{renderSizeOptions()}</div>

        {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
        <div className="flex gap-x-3.5">
          <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
            <NcInputNumber defaultValue={qualitySelected} onChange={setQualitySelected} />
          </div>
          <AddToCardButton
            as={ButtonPrimary}
            className="flex-1 shrink-0"
            color={colorSelected}
            imageUrl={featuredImage?.src ?? ''}
            price={price ?? 1}
            quantity={qualitySelected}
            size={sizeSelected}
            title={title ?? ''}
          >
            <HugeiconsIcon
              className="hidden sm:inline-block"
              color="currentColor"
              icon={ShoppingBag03Icon}
              size={20}
              strokeWidth={1.5}
            />
            <span className="ms-3">Add to cart</span>
          </AddToCardButton>
        </div>

        <Divider />

        {/* ---------- 5 ----------  */}
        <AccordionInfo
          data={[
            {
              content:
                'descriptionHtml' in product && typeof product.descriptionHtml === 'string'
                  ? product.descriptionHtml
                  : 'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
              name: 'Description',
            },
            {
              content: `<ul class="list-disc list-inside leading-7">
                  <li>Material: 43% Sorona Yarn + 57% Stretch Polyester</li>
                  <li>
                  Casual pants waist with elastic elastic inside
                  </li>
                  <li>
                    The pants are a bit tight so you always feel comfortable
                  </li>
                  <li>
                    Excool technology application 4-way stretch
                  </li>
                </ul>`,
              name: 'Features',
            },
            {
              content:
                'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
              name: 'Shipping & Return',
            },
            {
              content:
                'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron low if needed. Do not dry clean.',
              name: 'Care Instructions',
            },
          ]}
        />

        <div className="mt-6 flex text-sm text-neutral-500">
          <p className="text-xs">
            or{' '}
            <Link
              className="text-xs font-medium text-neutral-900 uppercase"
              href={localizeHref(`/products/${handle}`)}
            >
              Go to product detail page <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={className} data-testid={testId}>
      <div className="lg:flex">
        <div className="w-full lg:w-[50%]">
          <div className="relative">
            <div className="aspect-square relative">
              {images?.[0] && (
                <Image
                  alt={images[0].alt ?? ''}
                  className="rounded-xl object-cover"
                  data-testid="product-image"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={images[0].src}
                />
              )}
            </div>

            {renderStatus()}
            <LikeButton className="absolute end-3 top-3" />
          </div>
          <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
            {[images?.[1], images?.[2]].map((image, index) => {
              if (!image?.src) {
                return null;
              }
              return (
                <div key={image.src || `image-${index}`} className="aspect-[3/4] relative">
                  <Image
                    alt={image.alt ?? ''}
                    className="rounded-xl object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={image.src}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <div
          className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8"
          data-testid="product-details"
        >
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export { ProductQuickView };
export default ProductQuickView;
