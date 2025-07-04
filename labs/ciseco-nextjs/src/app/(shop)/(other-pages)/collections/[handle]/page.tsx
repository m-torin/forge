import ProductCard from '@/components/ProductCard'
import TabFilters from '@/components/TabFilters'
import TabFiltersPopover from '@/components/TabFiltersPopover'
import { getProducts } from '@/data/data'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const products = await getProducts()

  return (
    <main>
      {/* TABS FILTER */}
      <TabFilters className="hidden lg:block" />
      <TabFiltersPopover className="block lg:hidden" />

      {/* LOOP ITEMS */}
      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((produc) => <ProductCard data={produc} key={produc.id} />)}
      </div>

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
  )
}
