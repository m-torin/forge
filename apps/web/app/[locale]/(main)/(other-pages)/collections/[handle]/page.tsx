import { getCollectionByHandle } from '@/actions/collections';
import { getProductsByCollection } from '@/actions/products';
import {
  transformDatabaseCollectionToTCollection,
  transformDatabaseProductToTCardProduct,
} from '@/types/database';
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

import { CollectionUi } from './CollectionUi';
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
  const collectionData = await getCollectionByHandle(handle);
  const collection = collectionData
    ? transformDatabaseCollectionToTCollection(collectionData)
    : null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const collectionUrl = `${baseUrl}/${locale}/collections/${handle}`;

  return createMetadata({
    title: `${collection?.title || collectionData?.name || handle} | Collections`,
    description: `Browse our ${collection?.title || collectionData?.name || handle} collection with ${collection?.count || (collectionData as any)?._count?.products || 0} products. Discover quality products in our carefully curated collection.`,
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
      title: `${collection?.title || collectionData?.name || handle} Collection`,
      description: `Explore ${collection?.count || (collectionData as any)?._count?.products || 0} products in our ${collection?.title || collectionData?.name || handle} collection`,
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
  const collectionData = await getCollectionByHandle(handle);
  const collection = collectionData
    ? transformDatabaseCollectionToTCollection(collectionData)
    : null;

  // Get products from this specific collection
  const productsResult = collection
    ? await getProductsByCollection(handle)
    : {
        products: [],
        total: 0,
        hasMore: false,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
  const products = (productsResult.products || []).map((product: any) => {
    const cardProduct = transformDatabaseProductToTCardProduct(product);
    // Convert TCardProduct to TProductItem for CollectionUi
    return {
      ...cardProduct,
      images: [],
      variants: [],
      options: [],
      tags: [],
      availableForSale: true,
      description: '',
    };
  });
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
      name: collection?.title || collectionData?.name || handle,
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
      <CollectionUi products={products} />

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
