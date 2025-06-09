import { getCollectionByHandle, getProducts } from "@/lib/data-service";
import { type Metadata } from "next";

import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  TabFilters,
  TabFiltersPopover,
} from "@repo/design-system/mantine-ciseco";

import { CollectionClient } from "./CollectionClient";

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
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  return {
    description: `Browse our ${collection?.title || handle} collection with ${collection?.count || 0} products`,
    title: `${collection?.title || handle} | Collections`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { handle: _handle } = await params;
  const { page: _page = "1" } = await searchParams;
  const products = await getProducts();

  return (
    <main>
      {/* TABS FILTER */}
      <TabFilters className="hidden lg:block" />
      <TabFiltersPopover className="block lg:hidden" />

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
