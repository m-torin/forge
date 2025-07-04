import AccordionInfo from '@/components/AccordionInfo'
import AddToCardButton from '@/components/AddToCardButton'
import { Divider } from '@/components/Divider'
import LikeSaveBtns from '@/components/LikeSaveBtns'
import NcInputNumber from '@/components/NcInputNumber'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import NcImage from '@/shared/NcImage/NcImage'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Policy from '../../Policy'
import ProductColorOptions from '../../ProductColorOptions'
import ProductReviews from '../../ProductReviews'
import ProductSizeOptions from '../../ProductSizeOptions'
import ProductStatus from '../../ProductStatus'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const title = product?.title || 'product detail'
  const description = product?.description || 'product detail page'
  return {
    title,
    description,
  }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const relatedProducts = (await getProducts()).slice(2, 8)
  const reviews = await getProductReviews(handle)

  if (!product.id) {
    return notFound()
  }

  const { title, status, featuredImage, rating, reviewNumber, options, price, selectedOptions, images } = product
  const sizeSelected = selectedOptions?.find((option) => option.name === 'Size')?.value || ''
  const colorSelected = selectedOptions?.find((option) => option.name === 'Color')?.value || ''

  const renderSectionSidebar = () => {
    return (
      <div className="listingSectionSidebar__wrap lg:shadow-lg">
        <div className="flex flex-col gap-y-7 lg:gap-y-8">
          {/* PRICE */}
          <div>
            {/* ---------- 1 HEADING ----------  */}
            <div className="flex items-center justify-between gap-x-5">
              <div className="flex text-2xl font-semibold">${price?.toFixed(2)}</div>

              <a href="#reviews" className="flex items-center text-sm font-medium">
                <div>
                  <StarIcon className="size-5 pb-px text-orange-400" />
                </div>
                <span className="ms-1.5 flex">
                  <span>{rating}</span>
                  <span className="mx-1.5">·</span>
                  <span className="text-neutral-700 underline dark:text-neutral-400">{reviewNumber} reviews</span>
                </span>
              </a>
            </div>

            {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
            <div className="mt-6 flex flex-col gap-y-7 lg:gap-y-8">
              <ProductColorOptions options={options} defaultColor={colorSelected} />
              <ProductSizeOptions options={options} defaultSize={sizeSelected} />
            </div>
          </div>
          {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
          <div className="flex gap-x-3.5 pt-4">
            <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
              <NcInputNumber defaultValue={1} />
            </div>
            <AddToCardButton
              as={'div'}
              imageUrl={featuredImage?.src || ''}
              price={price || 0}
              quantity={1}
              title={title || ''}
              color={colorSelected}
              size={sizeSelected}
              className="flex flex-1 shrink-0"
            >
              <ButtonPrimary className="flex-1">
                <HugeiconsIcon
                  icon={ShoppingBag03Icon}
                  size={20}
                  color="currentColor"
                  className="hidden sm:inline-block"
                  strokeWidth={1.5}
                />
                <span className="ms-4">Add to cart</span>
              </ButtonPrimary>
            </AddToCardButton>
          </div>
        </div>
      </div>
    )
  }

  const renderSection1 = () => {
    return (
      <div className="listingSection__wrap gap-y-6!">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
          <div className="mt-4 flex items-center sm:mt-5">
            <a href="#reviews" className="hidden items-center text-sm font-medium sm:flex">
              <div>
                <StarIcon className="h-5 w-5 pb-px text-neutral-800 dark:text-neutral-200" />
              </div>
              <span className="ml-1.5">
                <span>{rating}</span>
                <span className="mx-1.5">·</span>
                <span className="text-neutral-700 underline dark:text-neutral-400">{reviewNumber} reviews</span>
              </span>
            </a>
            <span className="mx-2.5 hidden sm:block">·</span>
            <ProductStatus status={status || ''} />
            <div className="ml-auto">
              <LikeSaveBtns />
            </div>
          </div>
        </div>
        {/*  */}
        <div className="block lg:hidden">{renderSectionSidebar()}</div>

        {/*  */}
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        {/*  */}
        <AccordionInfo panelClassName="p-4 pt-3.5 text-neutral-600 text-base dark:text-neutral-300 leading-7" />
      </div>
    )
  }

  const renderSection2 = () => {
    return (
      <div className="listingSection__wrap border-b-0! pb-0!">
        <h2 className="text-2xl font-semibold">Product details</h2>
        <div className="prose prose-sm sm:prose sm:max-w-4xl dark:prose-invert">
          <p>
            The patented eighteen-inch hardwood Arrowhead deck --- finely mortised in, makes this the strongest and most
            rigid canoe ever built. You cannot buy a canoe that will afford greater satisfaction.
          </p>
          <p>
            The St. Louis Meramec Canoe Company was founded by Alfred Wickett in 1922. Wickett had previously worked for
            the Old Town Canoe Co from 1900 to 1914. Manufacturing of the classic wooden canoes in Valley Park, Missouri
            ceased in 1978.
          </p>
          <ul>
            <li>Regular fit, mid-weight t-shirt</li>
            <li>Natural color, 100% premium combed organic cotton</li>
            <li>Quality cotton grown without the use of herbicides or pesticides - GOTS certified</li>
            <li>Soft touch water based printed in the USA</li>
          </ul>
        </div>
        {/* ---------- 6 ----------  */}
        <Policy />
      </div>
    )
  }

  return (
    <div>
      <header className="container mt-8 sm:mt-10">
        <div className="relative">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-6">
            <div className="relative col-span-2 row-span-2 rounded-md sm:rounded-xl md:col-span-1 md:h-full">
              {featuredImage?.src && (
                <NcImage
                  alt={featuredImage.alt || 'product detail'}
                  containerClassName="aspect-w-3 aspect-h-4 relative md:aspect-none md:absolute md:inset-0"
                  className="rounded-md object-cover sm:rounded-xl"
                  src={featuredImage}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                />
              )}
            </div>

            {/*  */}
            <div className="relative z-0 col-span-1 row-span-2 overflow-hidden rounded-md sm:rounded-xl">
              {images?.[1]?.src && (
                <NcImage
                  alt={images[1].alt || 'product detail'}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  containerClassName="absolute inset-0"
                  className="rounded-md object-cover sm:rounded-xl"
                  src={images[1]}
                />
              )}
            </div>

            {/*  */}
            {images?.slice(2, 4)?.map((image, index) => (
              <div key={index} className="relative z-0 overflow-hidden rounded-md sm:rounded-xl">
                <NcImage
                  alt={image.alt || 'product detail'}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  containerClassName="aspect-w-6 aspect-h-5 lg:aspect-h-4"
                  className="rounded-md object-cover sm:rounded-xl"
                  src={image}
                />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* MAIn */}
      <main className="relative container mt-9 flex sm:mt-11">
        {/* CONTENT */}
        <div className="flex w-full flex-col gap-y-10 lg:w-3/5 lg:gap-y-14 lg:pr-14 xl:w-2/3">
          {renderSection1()}
          {renderSection2()}
        </div>

        {/* SIDEBAR */}
        <div className="grow">
          <div className="sticky top-28 hidden lg:block">{renderSectionSidebar()}</div>
        </div>
      </main>

      {/* OTHER SECTION */}
      <div className="container flex flex-col gap-y-14 pt-14 pb-24 lg:pb-28">
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
  )
}
