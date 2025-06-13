'use client';

import { Carousel } from '@mantine/carousel';
import { IconArrowUpRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { type FC } from 'react';

import type { Product } from '@/data/types';
import ProductCardLarge from '@/components/ui/ProductCardLarge';

export interface SectionSliderLargeProductProps {
  className?: string;
  heading?: string;
  headingDim?: string;
  products: Product[];
  showMoreHref?: string;
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = '',
  heading = 'Chosen by experts',
  headingDim = 'Featured of the week',
  products,
  showMoreHref = '/products',
}) => {
  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
            {heading}
          </h2>
          {headingDim && (
            <span className="mt-2 block text-neutral-600 dark:text-neutral-400">
              {headingDim}
            </span>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="container mx-auto px-4">
        <Carousel
          slideSize={{ base: '100%', sm: '66.666%', lg: '50%', xl: '40%', '2xl': '33.333%' }}
          slideGap="md"
          align="start"
          loop
          nextControlIcon={<IconChevronRight size={20} />}
          previousControlIcon={<IconChevronLeft size={20} />}
          classNames={{
            control: 'bg-white shadow-lg border-0 text-neutral-900 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
            controls: 'opacity-0 group-hover:opacity-100 transition-opacity',
            root: 'group',
          }}
        >
          {products.map((product) => (
            <Carousel.Slide key={product.id}>
              <ProductCardLarge product={product} />
            </Carousel.Slide>
          ))}

          {/* Show More Slide */}
          <Carousel.Slide>
            <Link
              href={showMoreHref}
              className="group relative block"
            >
              <div className="relative h-[410px] overflow-hidden rounded-2xl">
                <div className="h-[410px] bg-black/5 dark:bg-neutral-800" />
                <div className="absolute inset-x-10 inset-y-6 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                    <span className="text-xl font-semibold">More items</span>
                    <IconArrowUpRight
                      className="absolute left-full ml-2 group-hover:scale-110 transition-transform"
                      size={24}
                    />
                  </div>
                  <span className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Show me more
                  </span>
                </div>
              </div>
            </Link>
          </Carousel.Slide>
        </Carousel>
      </div>
    </div>
  );
};

export default SectionSliderLargeProduct;