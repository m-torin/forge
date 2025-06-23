import { logger } from '@/lib/logger';
import { ProductDetailFavoriteButton } from '@/components/guest/ProductDetailFavoriteButton';
import { SignedProductImage } from '@/components/guest/SignedProductImage';
import { getDictionary } from '@/i18n';
import { getProductByHandle, getProducts } from '@/actions/products';
import { getProductReviews } from '@/actions/reviews';
import {
  transformDatabaseProductToTProductItem,
  transformDatabaseProductToTCardProduct,
  transformDatabaseReviewToTReview,
} from '@/types/database';
import { IconStar, IconShoppingBag } from '@tabler/icons-react';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { metadataTemplates, structuredData } from '@repo/seo/server/next';
import { OptimizedJsonLd } from '@repo/seo/client/next';

import {
  AccordionInfo,
  ButtonPrimary,
  Divider,
  NcInputNumber,
  Prices,
  SectionPromo2,
  SectionSliderProductCard,
} from '@/components/ui';
// Note: Product reviews will need to be implemented when review system is added to database

import Policy from '../Policy';
import ProductOptions from '../ProductOptions';
import ProductReviews from '../ProductReviews';
import ProductSizeOption from '../ProductSizeOption';
import ProductStatus from '../ProductStatus';

// Enable Partial Pre-rendering for this page
export const experimental_ppr = true;

// ISR Configuration - Revalidate every 4 hours for product pages
export const revalidate = 14400; // 4 hours in seconds

// Generate static params for popular products (first 1000)
// In production, this would come from your database
export async function generateStaticParams() {
  // For now, return empty array since we have mock data
  // In production:
  // const popularProducts = await getPopularProducts({ limit: 1000 });
  // return popularProducts.map((product: any) => ({
  //   handle: product.handle,
  // }));
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}): Promise<Metadata> {
  const { handle, locale } = await params;
  const dict = await getDictionary(locale);
  const productData = await getProductByHandle(handle);
  const product = productData ? transformDatabaseProductToTProductItem(productData) : null;

  if (!product?.id) {
    return {
      title: dict.product.productDetail,
      description: dict.product.productDetailDescription,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const productUrl = `${baseUrl}/${locale}/products/${handle}`;

  return {
    ...metadataTemplates.product({
      name: product.title || dict.product.productDetail,
      description: (product as any)?.description || dict.product.productDetailDescription,
      price: product.price || 0,
      currency: 'USD',
      image: product.featuredImage?.src || '',
      availability: product.status === 'In Stock' ? 'InStock' : 'OutOfStock',
      brand: 'Web Template', // Replace with actual brand from data
      sku: handle,
    }),
    alternates: {
      canonical: productUrl,
      languages: {
        en: `${baseUrl}/en/products/${handle}`,
        es: `${baseUrl}/es/products/${handle}`,
        fr: `${baseUrl}/fr/products/${handle}`,
        de: `${baseUrl}/de/products/${handle}`,
        pt: `${baseUrl}/pt/products/${handle}`,
      },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}) {
  const { handle, locale } = await params;
  const _dict = await getDictionary(locale);
  const productData = await getProductByHandle(handle);
  const product = productData ? transformDatabaseProductToTProductItem(productData) : null;
  const productsResult = await getProducts({ page: 1, sort: 'newest', limit: 8 });
  const relatedProducts = productsResult.data
    .slice(2, 8)
    .map(transformDatabaseProductToTCardProduct);

  // Fetch reviews for this product
  const reviewsResult = product
    ? await getProductReviews(product.id, { limit: 10 })
    : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  const reviews = reviewsResult.data?.map(transformDatabaseReviewToTReview) || [];

  // Calculate average rating from reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / reviews.length
      : 0;
  const reviewCount = reviewsResult.pagination.total || 0;

  if (!product?.id) {
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
  const sizeSelected = selectedOptions?.find((option: any) => option.name === 'Size')?.value;
  const colorSelected = selectedOptions?.find((option: any) => option.name === 'Color')?.value;

  // Product structured data for rich snippets
  const productStructuredData = structuredData.product({
    name: title || '',
    description: (product as any)?.description || title || '',
    image: [
      featuredImage?.src,
      ...(images?.map((img: any) => img.src).filter(Boolean) || []),
    ].filter(Boolean),
    offers: {
      price: (price || 0).toString(),
      priceCurrency: 'USD',
      availability:
        status === 'In Stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: 'Web Template Store',
    },
    aggregateRating:
      rating && reviewNumber
        ? {
            ratingValue: rating,
            reviewCount: reviewNumber,
          }
        : undefined,
    brand: 'Web Template', // Replace with actual brand
  });

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
                <a href="#reviews" className="flex items-center text-sm font-medium">
                  <IconStar className="size-5 pb-px text-yellow-400" />
                  <div className="ms-1.5 flex">
                    <span>{rating}</span>
                    <span className="mx-2 block">·</span>
                    <span className="text-neutral-600 underline dark:text-neutral-400">
                      {reviewNumber} reviews
                    </span>
                  </div>
                </a>
                <span>·</span>
                <ProductStatus status={status || 'In Stock'} />
              </div>
            </div>
          </div>

          {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
          <div className="flex flex-col gap-y-8">
            <ProductOptions options={(options as any) || []} />
            <ProductSizeOption options={(options as any) || []} />
          </div>

          {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
          <div className="flex gap-x-3.5">
            <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
              <NcInputNumber defaultValue={1} />
            </div>
            <div className="flex flex-1 shrink-0">
              <ButtonPrimary
                className="flex-1"
                onClick={() => {
                  // TODO: Add to cart functionality
                  logger.info('Add to cart', {
                    title,
                    price,
                    quantity: 1,
                    color: colorSelected,
                    size: sizeSelected,
                    imageUrl: featuredImage?.src || '',
                  });
                }}
              >
                <IconShoppingBag stroke={1.5} className="hidden sm:inline-block" size={20} />
                <span className="ms-4">Add to cart</span>
              </ButtonPrimary>
            </div>
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
              <SignedProductImage
                className="rounded-2xl object-cover"
                alt={featuredImage.alt || 'product detail'}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                mediaId={featuredImage.mediaId}
                storageKey={featuredImage.storageKey}
                fallbackSrc={featuredImage.src}
              />
            )}
          </div>

          <ProductDetailFavoriteButton
            productId={product.id || handle}
            productName={title}
            className="absolute right-3 top-3"
            price={price}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6">
          {images?.map((image: any, _index: number) => {
            if (!image?.src) {
              return null;
            }
            return (
              <div key={image.src} className="relative aspect-[3/4] w-full">
                <SignedProductImage
                  className="rounded-2xl object-cover"
                  alt={image.alt || 'product detail'}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  mediaId={image.mediaId}
                  storageKey={image.storageKey}
                  fallbackSrc={image.src}
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
      {/* Product Structured Data for SEO */}
      <OptimizedJsonLd
        data={productStructuredData}
        id={`product-${handle}`}
        strategy="beforeInteractive"
      />

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
          rating={avgRating || rating || 0}
          reviewNumber={reviewCount || reviewNumber || 0}
          reviews={reviews.map((review: any) => ({
            ...review,
            author:
              typeof review.author === 'string'
                ? review.author
                : review.author?.name || 'Anonymous',
            authorAvatar: typeof review.author === 'object' ? review.author?.image : undefined,
          }))}
        />
        <Divider />
        {/* OTHER SECTION */}
        <SectionSliderProductCard
          headingFontClassName="text-3xl font-semibold"
          data={relatedProducts.map((p: any) => ({
            ...p,
            name: p.title || '',
            image: p.featuredImage?.src,
            price: p.price || 0,
          }))}
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
