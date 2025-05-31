'use client';

import AccordionInfo from '@/components/AccordionInfo';
import NcInputNumber from '@/components/NcInputNumber';
import Prices from '@/components/Prices';
import { type TProductDetail } from '@/data/data';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC, useState } from 'react';
import AddToCardButton from './AddToCardButton';
import { Divider } from './Divider';

export interface ProductQuickViewContentProps {
  product: TProductDetail;
  className?: string;
}

const ProductQuickViewContent: FC<ProductQuickViewContentProps> = ({ product, className }) => {
  const [qualitySelected, setQualitySelected] = useState(1);

  const {
    images,
    rating,
    reviewNumber,
    title,
    status,
    options,
    handle,
    price,
  } = product;

  const renderVariants = () => {
    if (!options || options.length === 0) {
      return null;
    }

    const items = options
      .filter(option => option.name === 'Size' || option.name === 'Color')
      .map((option, index) => (
        <div key={index} className={clsx(['flex items-center space-x-3.5'])}>
          <div className="flex items-center justify-center">
            <div
              className={
                option.name === 'Size'
                  ? 'text-lg leading-none text-primary-500'
                  : 'flex size-7 items-center justify-center rounded-full bg-neutral-100'
              }
            >
              {option.name === 'Size' ? option.optionValues[0]?.name : '●'}
            </div>
          </div>
          <span className="text-sm">{option.name}: {option.optionValues[0]?.name}</span>
        </div>
      ));

    return (
      <div className="mt-2">
        <h4 className="mb-2 text-xs">Variants</h4>
        <div className="space-y-1">{items}</div>
        <Link
          className="mt-3 block text-center text-sm underline"
          href={`/products/${handle}`}
          target="_blank"
          title={'View full details'}
        >
          View full details
        </Link>
      </div>
    );
  };

  return (
    <div className={`nc-ProductQuickView ${className || ''}`}>
      <div className="lg:flex lg:space-x-8">
        {/* CONTENT */}
        <div className="w-full space-y-4 lg:flex-[1.5] lg:space-y-5 xl:flex-[1.3] xl:space-y-7">
          {/* HEADING */}
          <div>
            <h2 className="text-2xl font-semibold">
              <Link href={`/products/${handle}`}>{title}</Link>
            </h2>

            <div className="mt-3.5 flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm">
                <StarIcon className="h-5 w-5 pb-[1px] text-amber-400" />
                <span className="font-medium text-neutral-700 dark:text-neutral-400">
                  {rating || 4.9}
                </span>
              </div>
              <Divider className="!h-4" />
              <div className="flex items-center">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {reviewNumber || 142} reviews
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center space-x-4">
              <Prices
                className="text-lg font-semibold"
                price={price || 0}
              />
            </div>
          </div>

          <Divider />

          {/* VARIANTS */}
          {renderVariants()}

          <Divider />

          {/* SIZE & QUANTITY */}
          <div className="flex space-x-3.5">
            <div className="flex items-center justify-center rounded-xl border-2 border-neutral-300 bg-primary-50/70 px-2 py-1 dark:border-neutral-600">
              <span className="!block text-sm font-medium">Size guide</span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <NcInputNumber
                defaultValue={qualitySelected}
                onChange={(value) => setQualitySelected(value)}
                className="w-full"
              />
            </div>
          </div>

          {/* STATUS */}
          <div className="flex space-x-3.5">
            <div className="flex flex-1 items-center space-x-3">
              <SparklesIcon className="size-6 flex-shrink-0" />
              <span className="text-sm">New in</span>
            </div>
            <div className="flex flex-1 items-center space-x-3">
              <ClockIcon className="size-6 flex-shrink-0" />
              <span className="text-sm">Dispatched in 2-5 days</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex space-x-3.5">
            <AddToCardButton
              className="w-full flex-1"
              imageUrl={typeof images?.[0] === 'string' ? images[0] : images?.[0]?.src || ''}
              price={price || 0}
              quantity={qualitySelected}
              title={title || ''}
            >
              <ShoppingBagIcon className="hidden size-5 sm:inline-block" />
              <span className="ml-3">Add to cart</span>
            </AddToCardButton>

            <ButtonPrimary
              href={`/products/${handle}`}
              className="w-full flex-1"
              targetBlank
            >
              View full details
            </ButtonPrimary>
          </div>

          <Divider />

          {/* ACCORDION */}
          <AccordionInfo />
        </div>

        {/* IMAGE */}
        <div className="hidden w-full flex-1 lg:block">
          <Image
            src={typeof images?.[0] === 'string' ? images[0] : images?.[0]?.src || '/placeholder-image.jpg'}
            width={400}
            height={500}
            alt={title || 'Product'}
            className="w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewContent;