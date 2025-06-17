'use client'

import AccordionInfo from '@/components/AccordionInfo'
import IconDiscount from '@/components/IconDiscount'
import LikeButton from '@/components/LikeButton'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { TProductDetail, getProductDetailByHandle } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import AddToCardButton from './AddToCardButton'
import { Divider } from './Divider'
import { useAside } from './aside'

export interface ProductQuickViewProps {
  className?: string
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className }) => {
  const { productQuickViewHandle: handle } = useAside()

  const [qualitySelected, setQualitySelected] = useState(1)
  const [product, setProduct] = useState<TProductDetail>()

  const [sizeSelected, setSizeSelected] = useState<string>()
  const [colorSelected, setColorSelected] = useState<string>()

  useEffect(() => {
    if (!handle) {
      return
    }

    const fetchProduct = async () => {
      const response = await getProductDetailByHandle(handle)
      if (!response) {
        return
      }
      setProduct(response)
    }
    fetchProduct()
  }, [handle])

  useEffect(() => {
    if (!product || sizeSelected || colorSelected) {
      return
    }
    const defaultSize = product?.selectedOptions?.find((option) => option.name === 'Size')?.value
    const defaultColor = product?.selectedOptions?.find((option) => option.name === 'Color')?.value
    setSizeSelected(defaultSize)
    setColorSelected(defaultColor)
  }, [product, sizeSelected, colorSelected])

  if (!product) {
    return null
  }

  const { title, status, featuredImage, rating, reviewNumber, options, price, selectedOptions, images } = product

  const renderColorOptions = () => {
    const colorOptions = options?.filter((option) => option.name === 'Color')
    if (!colorOptions?.length) {
      return null
    }

    return colorOptions.map((option) => {
      return (
        <div key={option.name}>
          <label className="block rtl:text-right" htmlFor="">
            <span className="text-sm font-medium">{option.name}</span>
          </label>
          <div className="mt-2.5 flex gap-x-2.5">
            {option.optionValues.map((value) => {
              const isActive = value.name === colorSelected

              return (
                <div
                  key={value.name}
                  className={clsx(
                    'relative size-8 cursor-pointer rounded-full',
                    isActive && 'ring-2 ring-neutral-900 ring-offset-1'
                  )}
                  onClick={() => {
                    setColorSelected(value.name)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setColorSelected(value.name)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={value.name}
                >
                  <div
                    className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover"
                    style={{
                      backgroundColor: value.swatch?.color,
                      backgroundImage: value.swatch?.image ? `url(${value.swatch.image})` : undefined,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )
    })
  }

  const renderSizeOptions = () => {
    const sizeOptionValues = options?.find((option) => option.name === 'Size')?.optionValues

    if (!sizeOptionValues?.length) {
      return null
    }

    return (
      <div>
        <div className="flex justify-between text-sm font-medium">
          <label>
            <span>Size</span>
          </label>
          <div className="cursor-pointer text-primary-600 hover:text-primary-500">See sizing chart</div>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-7">
          {sizeOptionValues.map((size) => {
            const isActive = size.name === sizeSelected
            return (
              <div
                key={size.name}
                className={clsx(
                  'relative flex h-10 items-center justify-center overflow-hidden rounded-lg text-sm font-medium text-neutral-900 uppercase ring-1 ring-neutral-200 select-none hover:bg-neutral-50 sm:h-11 dark:text-neutral-200 dark:ring-neutral-600 dark:hover:bg-neutral-700',
                  isActive && 'ring-2 ring-neutral-900 dark:ring-neutral-200'
                )}
                onClick={() => {
                  setSizeSelected(size.name)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSizeSelected(size.name)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={size.name}
              >
                {size.name}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderStatus = () => {
    if (!status) {
      return null
    }
    const CLASSES =
      'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 nc-shadow-lg rounded-full flex items-center justify-center text-neutral-700 text-neutral-900 dark:text-neutral-300'
    if (status === 'New in') {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === '50% Discount') {
      return (
        <div className={CLASSES}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'Sold Out') {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'limited edition') {
      return (
        <div className={CLASSES}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    return null
  }

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        {/* ---------- 1 HEADING ----------  */}
        <div>
          <h2 className="text-3xl font-semibold">
            <Link href={`/products/${handle}`}>{title}</Link>
          </h2>

          <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5 rtl:justify-end">
            <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={price || 1} />
            <div className="h-6 border-s border-neutral-300 dark:border-neutral-700"></div>
            <div className="flex items-center">
              <Link href={'/products/' + handle} className="flex items-center text-sm font-medium">
                <StarIcon className="h-5 w-5 pb-px text-yellow-400" />
                <div className="ms-1.5 flex">
                  <span>{rating}</span>
                  <span className="mx-2 block">·</span>
                  <span className="text-neutral-600 underline dark:text-neutral-400">{reviewNumber} reviews</span>
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
        <div>{renderColorOptions()}</div>
        <div>{renderSizeOptions()}</div>

        {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
        <div className="flex gap-x-3.5">
          <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
            <NcInputNumber defaultValue={qualitySelected} onChange={setQualitySelected} />
          </div>
          <AddToCardButton
            as={ButtonPrimary}
            className="flex-1 shrink-0"
            title={title || ''}
            imageUrl={featuredImage?.src || ''}
            price={price || 1}
            quantity={qualitySelected}
            size={sizeSelected}
            color={colorSelected}
          >
            <HugeiconsIcon
              icon={ShoppingBag03Icon}
              size={20}
              color="currentColor"
              className="hidden sm:inline-block"
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
              name: 'Description',
              content:
                'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
            },
            {
              name: 'Features',
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
            },
            {
              name: 'Shipping & Return',
              content:
                'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
            },
            {
              name: 'Care Instructions',
              content:
                'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron low if needed. Do not dry clean.',
            },
          ]}
        />

        <div className="mt-6 flex text-sm text-neutral-500">
          <p className="text-xs">
            or{' '}
            <Link href={'/products/' + handle} className="text-xs font-medium text-neutral-900 uppercase">
              Go to product detail page <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="lg:flex">
        <div className="w-full lg:w-[50%]">
          <div className="relative">
            <div className="aspect-w-16 aspect-h-16">
              {images?.[0] && (
                <Image
                  src={images[0]}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full rounded-xl object-cover"
                  alt={images[0].alt}
                />
              )}
            </div>

            {renderStatus()}
            <LikeButton className="absolute end-3 top-3" />
          </div>
          <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
            {[images?.[1], images?.[2]].map((image, index) => {
              if (!image?.src) {
                return null
              }
              return (
                <div key={index} className="aspect-w-3 aspect-h-4">
                  <Image
                    fill
                    src={image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full rounded-xl object-cover"
                    alt={image.alt}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">{renderSectionContent()}</div>
      </div>
    </div>
  )
}

export default ProductQuickView
