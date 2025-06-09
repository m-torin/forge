import { getCollectionByHandle, getProductsByCollection } from "@/lib/data-service";
import { type Metadata } from "next";

import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  SidebarFilters,
  TabFiltersPopover,
} from "@repo/design-system/mantine-ciseco";

import { CollectionStyle2Client } from "./CollectionStyle2Client";

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
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  const products = await getProductsByCollection(handle);

  return (
    <main>
      {/* LOOP ITEMS */}
      <div className="flex flex-col lg:flex-row">
        <div className="pr-4 lg:w-1/3 xl:w-1/4">
          <SidebarFilters className="hidden lg:block" />
          <TabFiltersPopover className="block lg:hidden" />
        </div>

        <div className="mb-10 shrink-0 lg:mx-8 lg:mb-0" />

        <div className="flex-1">
          <CollectionStyle2Client products={products} />

          <div className="mt-20 flex justify-start lg:mt-24">
            <Pagination className="">
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
        </div>
      </div>
    </main>
  );
}
