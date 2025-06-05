"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { Prices } from "@repo/design-system/mantine-ciseco";
import ProductOptions from "../../ProductOptions";
import ProductSizeOption from "../../ProductSizeOption";
import ProductStatus from "../../ProductStatus";
import { type ProductInfoProps } from "./types";
import { SellerOptions } from "./seller-options";
import { getSellerData } from "./seller-data";

interface ProductInfoPropsWithData extends ProductInfoProps {
  product: {
    id: string;
    title?: string;
    price?: number;
    rating?: number;
    reviewNumber?: number;
    status?: string;
    options?: Array<{ name: string; values: string[] }>;
    selectedOptions?: Array<{ name: string; value: string }>;
    featuredImage?: { src: string };
    handle: string;
  };
  dict: any;
  locale: string;
}

export function ProductInfo({
  className = "",
  showAffiliateSellers = true,
  sellerDisplayMode = "buttons",
  product,
  dict,
  locale,
}: ProductInfoPropsWithData) {
  const {
    title,
    price,
    rating,
    reviewNumber,
    status,
    options,
    selectedOptions,
    featuredImage,
    handle,
  } = product;
  const sizeSelected = selectedOptions?.find(
    (option) => option.name === "Size",
  )?.value;
  const colorSelected = selectedOptions?.find(
    (option) => option.name === "Color",
  )?.value;
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
          <div className="hidden h-7 border-l border-neutral-300 sm:block dark:border-neutral-700"></div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href="#reviews"
              className="flex items-center text-sm font-medium"
            >
              <StarIcon className="size-5 pb-px text-yellow-400" />
              <div className="ms-1.5 flex">
                <span>{rating}</span>
                <span className="mx-2 block">·</span>
                <span className="text-neutral-600 underline dark:text-neutral-400">
                  {reviewNumber} {dict.product.reviews}
                </span>
              </div>
            </a>
            <span>·</span>
            <ProductStatus status={status} />
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
        <ProductOptions options={options} />
        <ProductSizeOption options={options} />
      </div>

      {/* ---------- 4 SELLER OPTIONS ----------  */}
      {showAffiliateSellers && (
        <SellerOptions
          displayMode={sellerDisplayMode}
          includeDirectSale={true}
          sellers={sellers}
          productData={{
            id: product.id,
            title: title || "",
            price: price || 0,
            handle,
            featuredImage,
            colorSelected,
            sizeSelected,
            status,
          }}
          dict={dict}
          locale={locale}
        />
      )}
    </div>
  );
}
