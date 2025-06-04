import { type Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getProducts,
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  TabFilters,
  TabFiltersPopover,
} from "@repo/design-system/mantine-ciseco";
import { CollectionClient } from './CollectionClient';

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

// Mock collection data - replace with real API
async function getCollectionByHandle(handle: string) {
  const collections = {
    "all": { name: "All Products", handle: "all", productCount: 1250 },
    "new-arrivals": { name: "New Arrivals", handle: "new-arrivals", productCount: 450 },
    "best-sellers": { name: "Best Sellers", handle: "best-sellers", productCount: 320 },
  };
  return collections[handle as keyof typeof collections] || { name: handle, handle, productCount: 0 };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  
  return {
    title: `${collection.name} | Collections`,
    description: `Browse our ${collection.name} collection with ${collection.productCount} products`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { handle } = await params;
  const { page = "1" } = await searchParams;
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
