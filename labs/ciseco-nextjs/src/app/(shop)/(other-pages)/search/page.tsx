import { Divider } from '@/components/Divider'
import HeaderFilterSection from '@/components/HeaderFilterSection'
import ProductCard from '@/components/ProductCard'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import { getProducts } from '@/data/data'
import ButtonCircle from '@/shared/Button/ButtonCircle'
import Input from '@/shared/Input/Input'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search page for products',
}

const PageSearch = async () => {
  const products = await getProducts()
  const featuredProducts = products.slice(0, 4)

  return (
    <div>
      <div className={'top-0 right-0 left-0 h-24 w-full bg-primary-50 2xl:h-28 dark:bg-neutral-800/20'} />
      <div className="container">
        <header className="mx-auto -mt-10 flex max-w-2xl flex-col lg:-mt-7">
          <form className="relative w-full" method="post">
            <label htmlFor="search-input" className="text-neutral-500 dark:text-neutral-300">
              <span className="sr-only">Search all icons</span>
              <HugeiconsIcon
                className="absolute top-1/2 left-5 -translate-y-1/2 transform text-2xl md:left-6"
                icon={Search01Icon}
                size={24}
                color="currentColor"
                strokeWidth={1.5}
              />
              <Input
                className="border-0 shadow-lg dark:border"
                id="search-input"
                type="search"
                placeholder="Type your keywords"
                sizeClass="pl-14 py-5 pr-5 md:pl-16"
                rounded="rounded-full"
              />
              <ButtonCircle className="absolute top-1/2 right-2.5 -translate-y-1/2" size="size-11" type="submit">
                <ArrowRightIcon className="size-5 text-white" />
              </ButtonCircle>
            </label>
          </form>
        </header>
      </div>

      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:pt-20 lg:pb-28">
        <main>
          {/* FILTER */}
          <HeaderFilterSection />

          {/* LOOP ITEMS */}
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((item) => (
              <ProductCard data={item} key={item.id} />
            ))}
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

        <Divider />
        <SectionSliderLargeProduct products={featuredProducts} />
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageSearch
