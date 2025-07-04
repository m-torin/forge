import { getBrandBySlug } from '@/actions/brands';
import { getProductsByBrand } from '@/actions/products';
import { seoManager } from '@/lib/seo-config';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumb, CompletePagination, TabFilters } from '@/components/ui';
import { JsonLd, structuredData } from '@repo/seo/structured-data';
import { transformDatabaseProductToTProductItem } from '@/types/database';

import { BrandUi } from './BrandUi';
import { ClientSidebarFilters } from '@/components/ClientSidebarFilters';

// ISR Configuration - Revalidate every 4 hours for brand pages
export const revalidate = 14400; // 4 hours in seconds

// Generate static params for popular brands
export async function generateStaticParams() {
  // In production, fetch popular brands from database
  // const popularBrands = await getPopularBrands({ limit: 100 });
  // return popularBrands.map((brand) => ({
  //   slug: brand.slug,
  // }));
  return [];
}

async function getBrandProducts(brandSlug: string, page = 1, limit = 20) {
  // Get products filtered by brand using dedicated action
  const result = await getProductsByBrand(brandSlug, {
    page,
    limit,
    sort: 'newest',
  });

  // Transform database products to TProductItem type
  const transformedProducts = (result.data || []).map(transformDatabaseProductToTProductItem);

  return {
    currentPage: page,
    products: transformedProducts,
    totalCount: result.pagination?.total || 0,
    totalPages: result.pagination?.totalPages || 1,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { locale: _locale, slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return seoManager.createErrorMetadata(404);
  }

  return seoManager.createMetadata({
    alternates: {
      canonical: `/brands/${brand.slug}`,
      languages: {
        de: `/de/brands/${brand.slug}`,
        en: `/en/brands/${brand.slug}`,
        es: `/es/brands/${brand.slug}`,
        fr: `/fr/brands/${brand.slug}`,
        pt: `/pt/brands/${brand.slug}`,
      },
    },
    description: `${brand.description}. Browse ${brand.productCount} products from ${brand.name}. Find the latest styles and trends.`,
    keywords: [brand.name, 'fashion', 'clothing', 'accessories', 'brand', 'premium'],
    title: `${brand.name} Products | Shop ${brand.name}`,
  });
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, slug } = await params;
  const { page = '1' } = await searchParams;

  const brand = await getBrandBySlug(slug);
  if (!brand) {
    notFound();
  }

  const { currentPage, products, totalPages } = await getBrandProducts(slug, parseInt(page));

  // Generate structured data
  const brandSchema = structuredData.organization({
    name: brand.name,
    url: `https://ciseco.com/${locale}/brands/${brand.slug}`,
    description: brand.description || `${brand.name} - Premium fashion brand`,
  });

  const breadcrumbSchema = structuredData.breadcrumbs([
    { name: 'Home', url: `/${locale}` },
    { name: 'Brands', url: `/${locale}/brands` },
    { name: brand.name, url: `/${locale}/brands/${brand.slug}` },
  ]);

  const collectionSchema = structuredData.product({
    name: `${brand.name} Collection`,
    brand: brand.name,
    description: `${brand.description}. Browse ${brand.productCount} products.`,
    image: products
      .slice(0, 3)
      .map((p) => p.featuredImage?.src)
      .filter((src): src is string => Boolean(src)),
    offers: {
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  return (
    <>
      <JsonLd data={[brandSchema, breadcrumbSchema, collectionSchema]} />
      <div className="container py-16 lg:py-28">
        <div className="space-y-10 lg:space-y-14">
          {/* Header */}
          <div className="max-w-screen-sm">
            <Breadcrumb
              breadcrumbs={[
                { id: 1, name: 'Home', href: `/${locale}` },
                { id: 2, name: 'Brands', href: `/${locale}/brands` },
              ]}
              currentPage={brand.name}
            />
            <h1 className="mt-4 text-3xl font-semibold md:text-4xl">{brand.name}</h1>
            <span className="mt-4 block text-neutral-500 dark:text-neutral-400">
              {brand.description}
            </span>
          </div>

          {/* Filters and Products */}
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="pr-4 lg:w-1/3 xl:w-1/4">
              <ClientSidebarFilters />
            </div>

            {/* Products Grid */}
            <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 lg:w-2/3 xl:w-3/4">
              <TabFilters />
              <BrandUi products={products} />

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <CompletePagination
                  totalPages={totalPages}
                  baseUrl={`/${locale}/brands/${slug}`}
                  currentPage={currentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
