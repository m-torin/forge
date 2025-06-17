import { getCollectionByHandle } from '@/actions/collections';
import { getProductsByCollection } from '@/actions/products';
import { transformDatabaseProductToTProductItem } from '@/types/database';
import { type Metadata } from 'next';

import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/ui';

import { CollectionStyle2Ui } from './CollectionStyle2Ui';
import { ClientSidebarFilters } from '@/components/ClientSidebarFilters';
import { ClientTabFiltersPopover } from '@/components/ClientTabFilters';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  return {
    description: `Browse our ${collection?.name || handle} collection with ${(collection as any)?._count?.products || 0} products`,
    title: `${collection?.name || handle} | Collections`,
  };
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  const productsResult = await getProductsByCollection(handle);
  const products = (productsResult.products || []).map((product: any) =>
    transformDatabaseProductToTProductItem(product),
  );

  return (
    <main>
      {/* LOOP ITEMS */}
      <div className="flex flex-col lg:flex-row">
        <div className="pr-4 lg:w-1/3 xl:w-1/4">
          <ClientSidebarFilters className="hidden lg:block" />
          <ClientTabFiltersPopover className="block lg:hidden" />
        </div>

        <div className="mb-10 shrink-0 lg:mx-8 lg:mb-0" />

        <div className="flex-1">
          <CollectionStyle2Ui products={products} />

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
