import { seoManager } from "@/lib/seo-config";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  HeaderFilterSection,
  Pagination,
  SidebarFilters,
  type TProductItem,
} from "@repo/design-system/mantine-ciseco";
import { JsonLd, structuredData } from "@repo/seo/structured-data";

import { BrandClient } from "./BrandClient";

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

// Mock data - replace with real API calls
async function getBrandBySlug(slug: string) {
  const brands = {
    adidas: {
      id: "2",
      name: "Adidas",
      description: "Impossible is Nothing",
      productCount: 980,
      slug: "adidas",
    },
    nike: {
      id: "1",
      name: "Nike",
      description: "Just Do It",
      productCount: 1250,
      slug: "nike",
    },
    puma: {
      id: "3",
      name: "Puma",
      description: "Forever Faster",
      productCount: 650,
      slug: "puma",
    },
  };
  return brands[slug as keyof typeof brands];
}

async function getBrandProducts(
  brandSlug: string,
  page = 1,
  limit = 20,
) {
  // Mock implementation - replace with real API
  const { getProducts } = await import("@repo/design-system/mantine-ciseco");
  const allProducts = await getProducts();

  // Simulate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const products = allProducts.slice(startIndex, endIndex);

  return {
    currentPage: page,
    products,
    totalCount: allProducts.length,
    totalPages: Math.ceil(allProducts.length / limit),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
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
    keywords: [
      brand.name,
      "fashion",
      "clothing",
      "accessories",
      "brand",
      "premium",
    ],
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
  const { page = "1" } = await searchParams;

  const brand = await getBrandBySlug(slug);
  if (!brand) {
    notFound();
  }

  const { currentPage, products, totalPages } = await getBrandProducts(
    slug,
    parseInt(page),
  );

  // Generate structured data
  const brandSchema = structuredData.organization({
    name: brand.name,
    url: `https://ciseco.com/${locale}/brands/${brand.slug}`,
    description: brand.description || `${brand.name} - Premium fashion brand`,
  });

  const breadcrumbSchema = structuredData.breadcrumbs([
    { name: "Home", url: `/${locale}` },
    { name: "Brands", url: `/${locale}/brands` },
    { name: brand.name, url: `/${locale}/brands/${brand.slug}` },
  ]);

  const collectionSchema = structuredData.product({
    name: `${brand.name} Collection`,
    brand: brand.name,
    description: `${brand.description}. Browse ${brand.productCount} products.`,
    image: products
      .slice(0, 3)
      .map((p: TProductItem) => p.featuredImage?.src)
      .filter(Boolean),
    offers: {
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
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
              items={[
                { name: "Home", href: `/${locale}` },
                { name: "Brands", href: `/${locale}/brands` },
                { name: brand.name },
              ]}
            />
            <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
              {brand.name}
            </h1>
            <span className="mt-4 block text-neutral-500 dark:text-neutral-400">
              {brand.description}
            </span>
          </div>

          {/* Filters and Products */}
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="pr-4 lg:w-1/3 xl:w-1/4">
              <SidebarFilters />
            </div>

            {/* Products Grid */}
            <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 lg:w-2/3 xl:w-3/4">
              <HeaderFilterSection />
              <BrandClient products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    totalPages={totalPages}
                    baseUrl={`/${locale}/brands/${slug}`}
                    currentPage={currentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
