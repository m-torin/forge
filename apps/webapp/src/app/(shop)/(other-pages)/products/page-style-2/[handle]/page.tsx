import AccordionInfo from '@/components/AccordionInfo';
import { Divider } from '@/components/Divider';
import LikeButton from '@/components/LikeButton';
import NcInputNumber from '@/components/NcInputNumber';
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions';
import ProductForm from '@/components/ProductForm/ProductForm';
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions';
import SectionSliderProductCard from '@/components/SectionSliderProductCard';
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryImages from '../../GalleryImages';
import Policy from '../../Policy';
import ProductReviews from '../../ProductReviews';
import ProductStatus from '../../ProductStatus';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);
  const title = product?.title || 'product detail';
  const description = product?.description || 'product detail page';
  return {
    title,
    description,
  };
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductDetailByHandle(handle);
  const relatedProducts = (await getProducts()).slice(2, 8);
  const reviews = await getProductReviews(handle);

  if (!product.id) {
    return notFound();
  }

  const {
    title,
    status,
    featuredImage,
    rating,
    reviewNumber,
    options,
    price,
    selectedOptions,
    images,
  } = product;
  const sizeSelected = selectedOptions?.find((option: any) => option.name === 'Size')?.value || '';
  const colorSelected =
    selectedOptions?.find((option: any) => option.name === 'Color')?.value || '';

  const renderSectionSidebar = () => {
    return (
      <div className="listingSectionSidebar__wrap lg:shadow-lg">
        <div className="flex flex-col">
          {/* ----------  HEADING ----------  */}
          <div className="flex items-center justify-between gap-x-5">
            <div className="flex text-2xl font-semibold">${price?.toFixed(2)}</div>

            <a href="#reviews" className="flex items-center text-sm font-medium">
              <div>
                <StarIcon className="size-5 pb-px text-orange-400" />
              </div>
              <span className="ms-1.5 flex">
                <span>{rating}</span>
                <span className="mx-1.5">·</span>
                <span className="text-neutral-700 underline dark:text-neutral-400">
                  {reviewNumber} reviews
                </span>
              </span>
            </a>
          </div>

          <ProductForm product={product} className="mt-6">
            <fieldset>
              {/* ----------  VARIANTS AND SIZE LIST ----------  */}
              <div className="flex flex-col gap-y-7 lg:gap-y-8">
                <ProductColorOptions options={options} defaultColor={colorSelected} />
                <ProductSizeOptions options={options} defaultSize={sizeSelected} />
              </div>

              {/*  ----------  QTY AND ADD TO CART BUTTON */}
              <div className="flex gap-x-3.5 pt-11 lg:pt-12">
                <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                  <NcInputNumber defaultValue={1} />
                </div>

                <ButtonPrimary className="flex-1" type="submit">
                  <HugeiconsIcon
                    icon={ShoppingBag03Icon}
                    size={20}
                    color="currentColor"
                    className="hidden sm:block"
                    strokeWidth={1.5}
                  />
                  <span className="text-base/6 font-normal sm:ml-2">Add to cart</span>
                </ButtonPrimary>
              </div>
            </fieldset>
          </ProductForm>
        </div>
      </div>
    );
  };

  const renderSection1 = () => {
    return (
      <div className="listingSection__wrap gap-y-6!">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          <div className="mt-4 flex items-center sm:mt-5">
            <a href="#reviews" className="hidden items-center text-sm font-medium sm:flex">
              <div>
                <StarIcon className="h-5 w-5 pb-px text-neutral-800 dark:text-neutral-200" />
              </div>
              <span className="ml-1.5">
                <span>{rating}</span>
                <span className="mx-1.5">·</span>
                <span className="text-neutral-700 underline dark:text-neutral-400">
                  {reviewNumber} reviews
                </span>
              </span>
            </a>
            <span className="mx-2.5 hidden sm:block">·</span>
            <ProductStatus status={status || ''} />
          </div>
        </div>
        {/*  */}
        <div className="block lg:hidden">{renderSectionSidebar()}</div>

        {/*  */}
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />
        {/*  */}
        <AccordionInfo panelClassName="p-4 pt-3.5 text-neutral-600 text-base dark:text-neutral-300 leading-7" />
      </div>
    );
  };

  const renderSection2 = () => {
    return (
      <div className="listingSection__wrap border-b-0! pb-0!">
        <h2 className="text-2xl font-semibold">Product details</h2>
        <div className="prose prose-sm sm:prose dark:prose-invert sm:max-w-4xl">
          <p>
            The patented eighteen-inch hardwood Arrowhead deck --- finely mortised in, makes this
            the strongest and most rigid canoe ever built. You cannot buy a canoe that will afford
            greater satisfaction.
          </p>
          <p>
            The St. Louis Meramec Canoe Company was founded by Alfred Wickett in 1922. Wickett had
            previously worked for the Old Town Canoe Co from 1900 to 1914. Manufacturing of the
            classic wooden canoes in Valley Park, Missouri ceased in 1978.
          </p>
          <ul>
            <li>Regular fit, mid-weight t-shirt</li>
            <li>Natural color, 100% premium combed organic cotton</li>
            <li>
              Quality cotton grown without the use of herbicides or pesticides - GOTS certified
            </li>
            <li>Soft touch water based printed in the USA</li>
          </ul>
        </div>
        {/* ---------- 6 ----------  */}
        <Policy />
      </div>
    );
  };

  const galleryImages = [featuredImage, ...(images || [])]
    .map(item => item?.src)
    .filter(Boolean) as string[];

  return (
    <div>
      <div className="container mt-8 sm:mt-10">
        <div className="relative">
          <GalleryImages images={galleryImages} gridType="grid4" />
          <LikeButton className="absolute left-3 top-3" />
        </div>
      </div>

      {/* MAIn */}
      <main className="container relative mt-9 flex sm:mt-11">
        {/* CONTENT */}
        <div className="flex w-full flex-col gap-y-10 lg:w-3/5 lg:gap-y-14 lg:pr-14 xl:w-2/3">
          {renderSection1()}
          {renderSection2()}
        </div>

        {/* SIDEBAR */}
        <div className="grow">
          <div className="sticky top-10 hidden lg:block">{renderSectionSidebar()}</div>
        </div>
      </main>

      {/* OTHER SECTION */}
      <div className="container flex flex-col gap-y-14 pb-24 pt-14 lg:pb-28">
        <Divider />
        <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 1} reviews={reviews} />
        <Divider />
        <SectionSliderProductCard
          heading="Customers also purchased"
          subHeading=""
          data={relatedProducts}
          headingFontClassName="text-2xl font-semibold"
          headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
        />
      </div>
    </div>
  );
}
