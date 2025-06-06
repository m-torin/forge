"use client";

import Image from "next/image";

import {
  AccordionInfo,
  Divider,
  LikeButton,
  SectionPromo2,
  SectionSliderProductCard,
} from "@repo/design-system/mantine-ciseco";

import Policy from "../../../Policy";
import ProductReviews from "../../../ProductReviews";
import { ProductDetails } from "../product-details";
import { ProductInfo } from "../product-info";

interface StandardLayoutProps {
  dict: any;
  locale: string;
  product: any;
  relatedProducts: any[];
  reviews: any[];
}

export function StandardLayout({
  dict,
  locale,
  product,
  relatedProducts,
  reviews,
}: StandardLayoutProps) {
  const { featuredImage, images, rating, reviewNumber } = product;

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
                  className="rounded-2xl object-cover"
                  alt={featuredImage.alt || "product detail"}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  src={featuredImage}
                />
              )}
            </div>
            <LikeButton className="absolute right-3 top-3" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6">
            {images?.map((image: any) => {
              if (!image?.src) return null;
              return (
                <div key={image.src} className="relative aspect-[3/4] w-full">
                  <Image
                    className="rounded-2xl object-cover"
                    alt={image.alt || "product detail"}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    src={image}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Info - Right Side */}
        <div className="w-full pt-10 lg:w-[45%] lg:pl-7 lg:pt-0 xl:pl-9 2xl:pl-10">
          <div className="sticky top-28 flex flex-col gap-y-10">
            <ProductInfo locale={locale} product={product} dict={dict} />
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
        <ProductReviews
          rating={rating || 1}
          reviewNumber={reviewNumber || 0}
          reviews={reviews}
        />
        <Divider />
        {/* OTHER SECTION */}
        <SectionSliderProductCard
          headingFontClassName="text-3xl font-semibold"
          data={relatedProducts}
          heading={dict.product.customersAlsoPurchased}
          headingClassName="mb-12 text-neutral-900 dark:text-neutral-50"
          subHeading=""
        />
        {/* SECTION */}
        <div className="pb-20 lg:pt-16 xl:pb-28">
          <SectionPromo2 />
        </div>
      </div>
    </main>
  );
}
