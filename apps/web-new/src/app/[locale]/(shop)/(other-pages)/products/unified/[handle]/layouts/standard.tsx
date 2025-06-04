'use client'

import Image from 'next/image'
import { LikeButton, AccordionInfo, Divider, SectionSliderProductCard, SectionPromo2 } from '@repo/design-system/mantine-ciseco'
import { ProductInfo } from '../product-info'
import { ProductDetails } from '../product-details'
import ProductReviews from '../../../ProductReviews'
import Policy from '../../../Policy'

interface StandardLayoutProps {
  product: any
  relatedProducts: any[]
  reviews: any[]
  dict: any
  locale: string
}

export function StandardLayout({ product, relatedProducts, reviews, dict, locale }: StandardLayoutProps) {
  const { featuredImage, images, reviewNumber, rating } = product

  return (
    <main className="container mt-5 lg:mt-11">
      <div className="lg:flex">
        {/* MAIN IMAGE - Left Side */}
        <div className="w-full lg:w-[55%]">
          {/* HEADING */}
          <div className="relative">
            <div className="relative aspect-square w-full">
              {featuredImage?.src && (
                <Image
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  src={featuredImage}
                  className="rounded-2xl object-cover"
                  alt={featuredImage.alt || 'product detail'}
                />
              )}
            </div>
            <LikeButton className="absolute right-3 top-3" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6">
            {images?.map((image: any, index: number) => {
              if (!image?.src) return null
              return (
                <div key={index} className="relative aspect-[3/4] w-full">
                  <Image
                    sizes="(max-width: 640px) 100vw, 33vw"
                    fill
                    src={image}
                    className="rounded-2xl object-cover"
                    alt={image.alt || 'product detail'}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Product Info - Right Side */}
        <div className="w-full pt-10 lg:w-[45%] lg:pl-7 lg:pt-0 xl:pl-9 2xl:pl-10">
          <div className="sticky top-28 flex flex-col gap-y-10">
            <ProductInfo product={product} dict={dict} locale={locale} />
            {/*  */}
            <Divider />
            {/*  */}
            {/* ---------- 5 ----------  */}
            <AccordionInfo />
            {/* ---------- 6 ----------  */}
            <div className="hidden xl:block">
              <Policy />
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL AND REVIEW */}
      <div className="mt-12 flex flex-col gap-y-10 sm:mt-16 sm:gap-y-16">
        <div className="block xl:hidden">
          <Policy />
        </div>
        <ProductDetails dict={dict} />
        <Divider />
        <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 1} reviews={reviews} />
        <Divider />
        {/* OTHER SECTION */}
        <SectionSliderProductCard
          data={relatedProducts}
          heading={dict.product.customersAlsoPurchased}
          subHeading=""
          headingFontClassName="text-3xl font-semibold"
          headingClassName="mb-12 text-neutral-900 dark:text-neutral-50"
        />
        {/* SECTION */}
        <div className="pb-20 lg:pt-16 xl:pb-28">
          <SectionPromo2 />
        </div>
      </div>
    </main>
  )
}