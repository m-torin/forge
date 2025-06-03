"use client";

import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { ShoppingBag03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FC } from "react";

import AddToCardButton from "@repo/design-system/ciseco/components/AddToCardButton";
import { useAside } from "@repo/design-system/ciseco/components/aside";
import LikeButton from "@repo/design-system/ciseco/components/LikeButton";
import Prices from "@repo/design-system/ciseco/components/Prices";
import ProductStatus from "@repo/design-system/ciseco/components/ProductStatus";
import ButtonSecondary from "@repo/design-system/ciseco/components/shared/Button/ButtonSecondary";
import NcImage from "@repo/design-system/ciseco/components/shared/NcImage/NcImage";
import { type TProductItem } from "@repo/design-system/ciseco/data/data";

export interface ProductCardProps {
  className?: string;
  data: TProductItem;
  isLiked?: boolean;
}

const LocalizedProductCard: FC<ProductCardProps> = ({
  className = "",
  data,
  isLiked,
}) => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

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
  } = data;
  const color = selectedOptions?.find(
    (option) => option.name === "Color",
  )?.value;

  const { open: openAside, setProductQuickViewHandle } = useAside();

  const renderColorOptions = () => {
    const optionColorValues = options?.find(
      (option) => option.name === "Color",
    )?.optionValues;

    if (!optionColorValues?.length) {
      return null;
    }

    return (
      <div className="flex space-x-1">
        {optionColorValues.map((option, index) => (
          <div
            key={index}
            className="relative flex-1 max-w-4 h-4 rounded-full overflow-hidden cursor-pointer border-2 border-white dark:border-neutral-800"
            style={{
              backgroundColor: option.swatch?.color || "transparent",
            }}
          />
        ))}
      </div>
    );
  };

  const renderGroupButtons = () => {
    return (
      <div className="nc-ProductCard__actionsWrap absolute inset-x-2 bottom-2 z-10 flex transition-all duration-300 group-hover:bottom-4 group-hover:opacity-100 lg:opacity-0">
        <AddToCardButton
          className="flex-1 focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900"
          data={data}
          imageUrl={featuredImage?.src || ""}
          price={price || 0}
          quantity={1}
          size={
            selectedOptions?.find((option) => option.name === "Size")?.value
          }
          sizeClass="py-2 px-4"
          title={title || ""}
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
          fontSize="text-xs"
          onClick={() => {
            setProductQuickViewHandle(handle || "");
            openAside("product-quick-view");
          }}
          className="ms-1.5 bg-white shadow-lg transition-colors hover:bg-gray-100! hover:text-neutral-900"
          sizeClass="py-2 px-4"
        >
          <ArrowsPointingOutIcon className="size-3.5" />
          <span className="ms-1">Quick view</span>
        </ButtonSecondary>
      </div>
    );
  };

  const productUrl = `/${locale}/products/${handle}`;

  return (
    <div
      className={`nc-ProductCard relative flex flex-col bg-transparent ${className}`}
    >
      <Link href={productUrl as any} className="absolute inset-0" />

      <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
        <Link href={productUrl as any} className="block">
          {featuredImage?.src && (
            <NcImage
              containerClassName="flex aspect-[11/12] w-full relative"
              className="object-cover"
              alt={handle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              src={featuredImage}
            />
          )}
        </Link>
        <ProductStatus status={status} />
        <LikeButton className="absolute end-3 top-3 z-10" liked={isLiked} />
        {renderGroupButtons()}
      </div>

      <div className="space-y-4 px-2.5 pt-5 pb-2.5">
        {renderColorOptions()}
        <div>
          <h2 className="nc-ProductCard__title text-base font-semibold transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {color}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <Prices price={price ?? 1} />
          <div className="mb-0.5 flex items-center">
            <StarIcon className="h-5 w-5 pb-px text-amber-400" />
            <span className="ms-1 text-sm text-neutral-500 dark:text-neutral-400">
              {rating || ""} ({reviewNumber || 0} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizedProductCard;
