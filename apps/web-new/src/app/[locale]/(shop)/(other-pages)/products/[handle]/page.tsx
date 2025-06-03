import {
  getProductDetailByHandle,
  getProductReviews,
  getProducts,
} from "@/data/data";
import { StarIcon } from "@heroicons/react/24/solid";
import { ShoppingBag03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  AccordionInfo,
  AddToCardButton,
  ButtonPrimary,
  Divider,
  LikeButton,
  NcInputNumber,
  Prices,
  SectionPromo2,
  SectionSliderProductCard,
} from "@repo/design-system/mantine-ciseco";

import Policy from "../Policy";
import ProductOptions from "../ProductOptions";
import ProductReviews from "../ProductReviews";
import ProductSizeOption from "../ProductSizeOption";
import ProductStatus from "../ProductStatus";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);
  const title = product?.title || "product detail";
  const description = product?.description || "product detail page";
  return {
    description,
    title,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);
  const relatedProducts = (await getProducts()).slice(2, 8);
  const reviews = await getProductReviews(handle);

  if (!product.id) {
    return notFound();
  }

  const {
    featuredImage,
    images,
    options,
    price,
    rating,
    reviewNumber,
    selectedOptions,
    status,
    title,
  } = product;
  const sizeSelected = selectedOptions?.find(
    (option) => option.name === "Size",
  )?.value;
  const colorSelected = selectedOptions?.find(
    (option) => option.name === "Color",
  )?.value;

  const renderRightSide = () => {
    return (
      <div className="w-full pt-10 lg:w-[45%] lg:pl-7 lg:pt-0 xl:pl-9 2xl:pl-10">
        <div className="sticky top-28 flex flex-col gap-y-10">
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
                <a
                  href="#reviews"
                  className="flex items-center text-sm font-medium"
                >
                  <StarIcon className="size-5 pb-px text-yellow-400" />
                  <div className="ms-1.5 flex">
                    <span>{rating}</span>
                    <span className="mx-2 block">·</span>
                    <span className="text-neutral-600 underline dark:text-neutral-400">
                      {reviewNumber} reviews
                    </span>
                  </div>
                </a>
                <span>·</span>
                <ProductStatus status={status} />
              </div>
            </div>
          </div>

          {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
          <div className="flex flex-col gap-y-8">
            <ProductOptions options={options} />
            <ProductSizeOption options={options} />
          </div>

          {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
          <div className="flex gap-x-3.5">
            <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
              <NcInputNumber defaultValue={1} />
            </div>
            <AddToCardButton
              color={colorSelected}
              className="flex flex-1 shrink-0"
              as="div"
              imageUrl={featuredImage?.src || ""}
              price={price || 0}
              quantity={1}
              size={sizeSelected}
              title={title || ""}
            >
              <ButtonPrimary className="flex-1">
                <HugeiconsIcon
                  strokeWidth={1.5}
                  color="currentColor"
                  icon={ShoppingBag03Icon}
                  className="hidden sm:inline-block"
                  size={20}
                />
                <span className="ms-4">Add to cart</span>
              </ButtonPrimary>
            </AddToCardButton>
          </div>

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
    );
  };

  const renderDetailSection = () => {
    return (
      <div className="">
        <h2 className="text-2xl font-semibold">Product Details</h2>
        <div className="prose prose-sm sm:prose dark:prose-invert mt-7 sm:max-w-4xl">
          <p>
            The patented eighteen-inch hardwood Arrowhead deck --- finely
            mortised in, makes this the strongest and most rigid canoe ever
            built. You cannot buy a canoe that will afford greater satisfaction.
          </p>
          <p>
            The St. Louis Meramec Canoe Company was founded by Alfred Wickett in
            1922. Wickett had previously worked for the Old Town Canoe Co from
            1900 to 1914. Manufacturing of the classic wooden canoes in Valley
            Park, Missouri ceased in 1978.
          </p>
          <ul>
            <li>Regular fit, mid-weight t-shirt</li>
            <li>Natural color, 100% premium combed organic cotton</li>
            <li>
              Quality cotton grown without the use of herbicides or pesticides -
              GOTS certified
            </li>
            <li>Soft touch water based printed in the USA</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderLeftSide = () => {
    return (
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
          {images?.map((image, index) => {
            if (!image?.src) {
              return null;
            }
            return (
              <div key={index} className="relative aspect-[3/4] w-full">
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
    );
  };

  return (
    <main className="container mt-5 lg:mt-11">
      <div className="lg:flex">
        {renderLeftSide()}
        {renderRightSide()}
      </div>

      {/* DETAIL AND REVIEW */}
      <div className="mt-12 flex flex-col gap-y-10 sm:mt-16 sm:gap-y-16">
        <div className="block xl:hidden">
          <Policy />
        </div>
        {renderDetailSection()}
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
          heading="Customers also purchased"
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
