import { getProducts } from "@/data/data";

import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  ProductCard,
  SidebarFilters,
  TabFiltersPopover,
} from "@repo/design-system/mantine-ciseco";

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const products = await getProducts();

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
          <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((item) => (
              <ProductCard key={item.id} data={item} />
            ))}
          </div>

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
