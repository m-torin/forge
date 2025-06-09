import { getProducts } from "@/lib/data-service";
import { seoManager } from "@/lib/seo-config";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  CompletePagination,
  HeaderFilterSection,
  SidebarFilters,
} from "@repo/design-system/mantine-ciseco";
import {
  createStructuredData,
  JsonLd,
  structuredData,
} from "@repo/seo/structured-data";

import { LocationClient } from "./LocationClient";

import type { LocalBusiness } from "schema-dts";

// ISR Configuration - Revalidate every 4 hours for location pages
export const revalidate = 14400; // 4 hours in seconds

// Generate static params for major locations
export async function generateStaticParams() {
  // In production, fetch major locations
  // const majorLocations = await getMajorLocations({ limit: 50 });
  // return majorLocations.map((location) => ({
  //   slug: location.slug,
  // }));
  return [];
}

// Mock data - replace with real API calls
async function getLocationBySlug(slug: string) {
  const locations = {
    london: {
      id: "3",
      name: "London",
      coordinates: { lat: 51.5074, lng: -0.1278 },
      country: "United Kingdom",
      description:
        "Discover London-exclusive items and British designer collections.",
      productCount: 9800,
      slug: "london",
      storeCount: 15,
      stores: [
        { name: "Oxford Street", address: "123 Oxford Street, London W1D 2LN" },
        { name: "Covent Garden", address: "45 Long Acre, London WC2E 9LZ" },
        { name: "Westfield London", address: "Ariel Way, London W12 7GF" },
      ],
    },
    "new-york": {
      id: "1",
      name: "New York",
      coordinates: { lat: 40.7128, lng: -74.006 },
      country: "United States",
      description:
        "Shop exclusive New York collections and products available in NYC stores.",
      productCount: 8500,
      slug: "new-york",
      storeCount: 12,
      stores: [
        {
          name: "Manhattan Flagship",
          address: "123 5th Avenue, New York, NY 10001",
        },
        {
          name: "Brooklyn Store",
          address: "456 Atlantic Ave, Brooklyn, NY 11201",
        },
        { name: "Queens Center", address: "789 Queens Blvd, Queens, NY 11373" },
      ],
    },
    tokyo: {
      id: "5",
      name: "Tokyo",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      country: "Japan",
      description:
        "Explore Tokyo's unique fashion and exclusive Japanese collections.",
      productCount: 11200,
      slug: "tokyo",
      storeCount: 18,
      stores: [
        {
          name: "Shibuya Crossing",
          address: "1-29-1 Dogenzaka, Shibuya City, Tokyo",
        },
        { name: "Ginza", address: "4-6-16 Ginza, Chuo City, Tokyo" },
        { name: "Harajuku", address: "1-14-30 Jingumae, Shibuya City, Tokyo" },
      ],
    },
  };
  return locations[slug as keyof typeof locations];
}

async function getLocationProducts(locationSlug: string, page = 1, limit = 20) {
  // Get all products - in a real implementation, this would filter by location
  const allProducts = await getProducts();

  // Simulate filtering by location and pagination
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
  const { locale: _locale, slug } = await params;
  const location = await getLocationBySlug(slug);

  if (!location) {
    return seoManager.createErrorMetadata(404);
  }

  return seoManager.createMetadata({
    alternates: {
      canonical: `/locations/${location.slug}`,
      languages: {
        de: `/de/locations/${location.slug}`,
        en: `/en/locations/${location.slug}`,
        es: `/es/locations/${location.slug}`,
        fr: `/fr/locations/${location.slug}`,
        pt: `/pt/locations/${location.slug}`,
      },
    },
    description: `${location.description} ${location.storeCount} stores with ${location.productCount.toLocaleString()} products available in ${location.name}, ${location.country}.`,
    keywords: [
      location.name,
      location.country,
      "store",
      "shopping",
      "fashion",
      "local",
    ],
    title: `${location.name} Store | Shop Local Collections`,
  });
}

export default async function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string; store?: string }>;
}) {
  const { locale: _locale, slug } = await params;
  const { page = "1" } = await searchParams;

  const location = await getLocationBySlug(slug);
  if (!location) {
    notFound();
  }

  const { currentPage, products, totalPages } = await getLocationProducts(
    slug,
    parseInt(page),
  );

  // Generate structured data for LocalBusiness
  const localBusinessSchema = createStructuredData<LocalBusiness>(
    "ClothingStore",
    {
      name: `Ciseco ${location.name}`,
      url: `https://ciseco.com/${_locale}/locations/${location.slug}`,
      address: {
        "@type": "PostalAddress",
        addressCountry: location.country,
        addressLocality: location.name,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: 4.5,
        reviewCount: location.storeCount * 50, // Simulated reviews
      },
      description: location.description,
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
      },
      image: `https://ciseco.com/images/stores/${location.slug}.jpg`,
      priceRange: "$$",
      telephone: "+1-555-123-4567", // Replace with actual phone
    },
  );

  // Breadcrumb structured data
  const breadcrumbSchema = structuredData.breadcrumbs([
    { name: "Home", url: `/${_locale}` },
    { name: "Locations", url: `/${_locale}/locations` },
    {
      name: `${location.name}, ${location.country}`,
      url: `/${_locale}/locations/${location.slug}`,
    },
  ]);

  // Organization structured data for stores
  const storesSchema = location.stores.map((store, _index) =>
    createStructuredData<LocalBusiness>("ClothingStore", {
      name: store.name,
      address: {
        "@type": "PostalAddress",
        addressCountry: location.country,
        addressLocality: location.name,
        streetAddress: store.address,
      },
      parentOrganization: {
        name: "Ciseco",
        "@type": "Organization",
      },
    }),
  );

  return (
    <>
      <JsonLd data={[localBusinessSchema, breadcrumbSchema, ...storesSchema]} />
      <div className="container py-16 lg:py-28">
        <div className="space-y-10 lg:space-y-14">
          {/* Header */}
          <div>
            <Breadcrumb
              breadcrumbs={[
                { id: 1, name: "Home", href: `/${_locale}` },
                { id: 2, name: "Locations", href: `/${_locale}/locations` },
              ]}
              currentPage={location.name}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold md:text-4xl">
                  {location.name}, {location.country}
                </h1>
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                  {location.description}
                </p>

                {/* Quick stats */}
                <div className="mt-6 flex flex-wrap gap-6">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {location.storeCount}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Store Locations
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {location.productCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Available Products
                    </div>
                  </div>
                </div>
              </div>

              {/* Store locations */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <h3 className="mb-4 font-semibold">Featured Stores</h3>
                <div className="space-y-4">
                  {location.stores.slice(0, 3).map((store, _index) => (
                    <div key={store.name} className="text-sm">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {store.name}
                      </div>
                      <div className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {store.address}
                      </div>
                    </div>
                  ))}
                  {location.stores.length > 3 && (
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      View all {location.storeCount} stores →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Categories for this location */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Local Designers",
              "Exclusive Items",
              "Limited Edition",
              "Store Pickup",
            ].map((category) => (
              <div
                key={category}
                className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 text-center transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
              >
                <span className="font-medium">{category}</span>
              </div>
            ))}
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
              <LocationClient products={products} />

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <CompletePagination
                  totalPages={totalPages}
                  baseUrl={`/${_locale}/locations/${slug}`}
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
