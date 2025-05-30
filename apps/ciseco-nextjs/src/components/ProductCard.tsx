'use client'

import { TProductItem } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import NcImage from '@/shared/NcImage/NcImage'
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { FC } from 'react'
import AddToCardButton from './AddToCardButton'
import LikeButton from './LikeButton'
import Prices from './Prices'
import ProductStatus from './ProductStatus'
import { useAside } from './aside'

export interface ProductCardProps {
  className?: string
  data: TProductItem
  isLiked?: boolean
}

const ProductCard: FC<ProductCardProps> = ({ className = '', data, isLiked }) => {
  const { title, price, status, rating, options, handle, selectedOptions, reviewNumber, images, featuredImage } = data
  const color = selectedOptions?.find((option) => option.name === 'Color')?.value

  const { open: openAside, setProductQuickViewHandle } = useAside()

  const renderColorOptions = () => {
    const optionColorValues = options?.find((option) => option.name === 'Color')?.optionValues

    if (!optionColorValues?.length) {
      return null
    }

    return (
      <div className="flex gap-1.5">
        {optionColorValues.map((color) => (
          <div key={color.name} className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full">
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
    )
  }

  const renderGroupButtons = () => {
    return (
      <div className="invisible absolute inset-x-1 bottom-0 flex justify-center opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
        <AddToCardButton
          as={ButtonPrimary}
          className="shadow-lg"
          fontSize="text-xs"
          sizeClass="py-2 px-4"
          title={title || ''}
          imageUrl={featuredImage?.src || ''}
          price={price || 0}
          quantity={1}
          size={selectedOptions?.find((option) => option.name === 'Size')?.value}
          color={selectedOptions?.find((option) => option.name === 'Color')?.value}
        >
          <HugeiconsIcon icon={ShoppingBag03Icon} size={12} color="currentColor" strokeWidth={2} className="mb-px" />
          <span className="ms-1">Add to bag</span>
        </AddToCardButton>

        <ButtonSecondary
          className="ms-1.5 bg-white shadow-lg transition-colors hover:bg-gray-100! hover:text-neutral-900"
          fontSize="text-xs"
          sizeClass="py-2 px-4"
          onClick={() => {
            setProductQuickViewHandle(handle || '')
            openAside('product-quick-view')
          }}
        >
          <ArrowsPointingOutIcon className="size-3.5" />
          <span className="ms-1">Quick view</span>
        </ButtonSecondary>
      </div>
    )
  }

  return (
    <>
      <div className={`nc-ProductCard relative flex flex-col bg-transparent ${className}`}>
        <Link href={'/products/' + handle} className="absolute inset-0"></Link>

        <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
          <Link href={'/products/' + handle} className="block">
            {featuredImage?.src && (
              <NcImage
                containerClassName="flex aspect-w-11 aspect-h-12 w-full h-0"
                src={featuredImage}
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
                alt={handle}
              />
            )}
          </Link>
          <ProductStatus status={status} />
          <LikeButton liked={isLiked} className="absolute end-3 top-3 z-10" />
          {renderGroupButtons()}
        </div>

        <div className="space-y-4 px-2.5 pt-5 pb-2.5">
          {renderColorOptions()}
          <div>
            <h2 className="nc-ProductCard__title text-base font-semibold transition-colors">{title}</h2>
            <p className={`mt-1 text-sm text-neutral-500 dark:text-neutral-400`}>{color}</p>
          </div>

          <div className="flex items-end justify-between">
            <Prices price={price ?? 1} />
            <div className="mb-0.5 flex items-center">
              <StarIcon className="h-5 w-5 pb-px text-amber-400" />
              <span className="ms-1 text-sm text-neutral-500 dark:text-neutral-400">
                {rating || ''} ({reviewNumber || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductCard
