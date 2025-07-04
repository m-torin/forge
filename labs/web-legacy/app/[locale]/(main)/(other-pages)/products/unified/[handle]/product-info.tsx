'use client';

import { IconStar } from '@tabler/icons-react';

import { Prices } from '@/components/ui';

import ProductOptions from '../../ProductOptions';
import ProductSizeOption from '../../ProductSizeOption';
import ProductStatus from '../../ProductStatus';

import { getSellerData } from './seller-data';
import { SellerOptions } from './seller-options';
import { type ProductInfoProps } from './types';

interface ProductInfoPropsWithData extends ProductInfoProps {
  dict: any;
  locale: string;
  product: {
    id: string;
    title?: string;
    price?: number;
    rating?: number;
    reviewNumber?: number;
    status?: string;
    options?: { name: string; values: string[] }[];
    selectedOptions?: { name: string; value: string }[];
    featuredImage?: { src: string };
    handle: string;
  };
}

export function ProductInfo({
  className = '',
  dict,
  locale,
  product,
  sellerDisplayMode = 'buttons',
  showAffiliateSellers = true,
}: ProductInfoPropsWithData) {
  const {
    featuredImage,
    handle,
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
  const sellers = getSellerData(price || 0, dict);

  return (
    <div className={`flex flex-col gap-y-10 ${className}`}>
      {/* ---------- 1 HEADING ----------  */}
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
          <Prices
            contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold"
            price={price || 0}
          />
          <div className="hidden h-7 border-l border-neutral-300 sm:block dark:border-neutral-700" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a href="#reviews" className="flex items-center text-sm font-medium">
              <IconStar className="size-5 pb-px text-yellow-400" />
              <div className="ms-1.5 flex">
                <span>{rating}</span>
                <span className="mx-2 block">·</span>
                <span className="text-neutral-600 underline dark:text-neutral-400">
                  {reviewNumber} {dict.product.reviews}
                </span>
              </div>
            </a>
            <span>·</span>
            <ProductStatus status={status || 'in_stock'} />
            {showAffiliateSellers && (
              <>
                <span>·</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {sellers.length} {dict.product.sellers}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
      <div className="flex flex-col gap-y-8">
        <ProductOptions
          options={
            options?.map((opt) => ({
              name: opt.name,
              optionValues:
                opt.values?.map((value) => ({
                  name: value,
                  value: value,
                  swatch: null,
                })) || [],
            })) as any
          }
        />
        <ProductSizeOption
          options={
            options?.map((opt) => ({
              name: opt.name,
              optionValues:
                opt.values?.map((value) => ({
                  name: value,
                  value: value,
                  swatch: null,
                })) || [],
            })) as any
          }
        />
      </div>

      {/* ---------- 4 SELLER OPTIONS ----------  */}
      {showAffiliateSellers && (
        <SellerOptions
          displayMode={sellerDisplayMode}
          locale={locale}
          productData={{
            id: product.id,
            colorSelected,
            featuredImage,
            handle,
            price: price || 0,
            sizeSelected,
            status,
            title: title || '',
          }}
          dict={dict}
          includeDirectSale={true}
          sellers={sellers}
        />
      )}
    </div>
  );
}
