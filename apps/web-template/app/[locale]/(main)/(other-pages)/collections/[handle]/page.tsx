import { getCollectionByHandle, getProducts } from '@/data/data-service';
import { type Metadata } from 'next';
import { createMetadata, structuredData } from '@repo/seo/server/next';
import { OptimizedJsonLd } from '@repo/seo/client/next';

import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/ui';

import { CollectionClient } from './CollectionClient';
import { ClientTabFilters, ClientTabFiltersPopover } from '@/components/ClientTabFilters';

// ISR Configuration - Revalidate every 4 hours for collection pages
export const revalidate = 14400; // 4 hours in seconds

// Generate static params for popular collections
export async function generateStaticParams() {
  // In production, fetch popular collections
  // const popularCollections = await getPopularCollections({ limit: 100 });
  // return popularCollections.map((collection) => ({
  //   handle: collection.handle,
  // }));
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>;
}): Promise<Metadata> {
  const { handle, locale } = await params;
  const collection = await getCollectionByHandle(handle);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const collectionUrl = `${baseUrl}/${locale}/collections/${handle}`;

  return createMetadata({
    title: `${collection?.title || handle} | Collections`,
    description: `Browse our ${collection?.title || handle} collection with ${collection?.count || 0} products. Discover quality products in our carefully curated collection.`,
    alternates: {
      canonical: collectionUrl,
      languages: {
        en: `${baseUrl}/en/collections/${handle}`,
        es: `${baseUrl}/es/collections/${handle}`,
        fr: `${baseUrl}/fr/collections/${handle}`,
        de: `${baseUrl}/de/collections/${handle}`,
        pt: `${baseUrl}/pt/collections/${handle}`,
      },
    },
    openGraph: {
      title: `${collection?.title || handle} Collection`,
      description: `Explore ${collection?.count || 0} products in our ${collection?.title || handle} collection`,
      type: 'website',
      images: undefined,
    },
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { handle, locale } = await params;
  const { page: _page = '1' } = await searchParams;
  const products = await getProducts();
  const collection = await getCollectionByHandle(handle);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

  // Create breadcrumb structured data
  const breadcrumbData = structuredData.breadcrumbs([
    {
      name: 'Home',
      url: `${baseUrl}/${locale}`,
    },
    {
      name: 'Collections',
      url: `${baseUrl}/${locale}/collections`,
    },
    {
      name: collection?.title || handle,
      url: `${baseUrl}/${locale}/collections/${handle}`,
    },
  ]);

  return (
    <main>
      <OptimizedJsonLd data={breadcrumbData} id="breadcrumb" strategy="afterInteractive" />
      {/* TABS FILTER */}
      <ClientTabFilters className="hidden lg:block" />
      <ClientTabFiltersPopover className="block lg:hidden" />

      {/* LOOP ITEMS */}
      <CollectionClient products={products} />

      {/* PAGINATION */}
      <div className="mt-20 flex justify-center lg:mt-24">
        <Pagination className="mx-auto">
          <PaginationPrevious href="?page=1" />
          <PaginationList>
            <PaginationPage href="?page=1" current>
              1
            </PaginationPage>
            <PaginationPage href="?page=2">2</PaginationPage>
            <PaginationPage href="?page=3">3</PaginationPage>
            <PaginationPage href="?page=4">4</PaginationPage>
          </PaginationList>
          <PaginationNext href="?page=3" />
        </Pagination>
      </div>
    </main>
  );
}
