import { Divider } from '@/components/Divider';
import HeaderFilterSection from '@/components/HeaderFilterSection';
import ProductCard from '@/components/ProductCard';
import SectionPromo1 from '@/components/SectionPromo1';
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import { getProducts } from '@/data/data';
import ButtonCircle from '@/shared/Button/ButtonCircle';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Metadata } from 'next';
import Form from 'next/form';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search page for products',
};

const PageSearch = async () => {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 4);

  const handleFormSubmit = async (formData: FormData) => {
    'use server';
    const _searchQuery = formData.get('search-input')?.toString() || '';
    // TODO: Implement the search logic, e.g., filter products based on the search query
  };

  return (
    <div>
      <div className="bg-primary-50 h-24 w-full 2xl:h-28 dark:bg-white/10" />
      <div className="container">
        <header className="mx-auto -mt-10 flex max-w-2xl flex-col lg:-mt-7">
          <Form action={handleFormSubmit} className="relative w-full">
            <fieldset className="text-neutral-500 dark:text-neutral-300">
              <label htmlFor="search-input" className="sr-only">
                Search all icons
              </label>
              <HugeiconsIcon
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl sm:left-5"
                icon={Search01Icon}
                size={24}
              />
              <input
                className="focus:border-primary-300 focus:ring-primary-200/50 dark:focus:ring-primary-600/25 focus:ring-3 md:pl-15 block w-full rounded-full border bg-white py-4 pl-12 pr-5 placeholder:text-zinc-500 sm:py-5 sm:text-sm dark:bg-neutral-800 dark:placeholder:text-zinc-400"
                id="search-input"
                type="search"
                placeholder="Type your keywords"
              />
              <ButtonCircle
                className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-2.5"
                size="size-11"
                type="submit"
              >
                <ArrowRightIcon className="size-5 text-white" />
              </ButtonCircle>
            </fieldset>
          </Form>
        </header>
      </div>

      <div className="container flex flex-col gap-y-16 py-16 lg:gap-y-28 lg:pb-28 lg:pt-20">
        <main>
          {/* FILTER */}
          <HeaderFilterSection />

          {/* LOOP ITEMS */}
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(item => (
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
  );
};

export default PageSearch;
