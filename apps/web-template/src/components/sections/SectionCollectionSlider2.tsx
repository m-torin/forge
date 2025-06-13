'use client';

import { Carousel } from '@mantine/carousel';
import { IconArrowUpRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import clsx from 'clsx';
import Link from 'next/link';
import { type FC } from 'react';

import type { Collection } from '@/data/types';
import CollectionCard2 from '@/components/ui/CollectionCard2';

export interface SectionCollectionSlider2Props {
  className?: string;
  collections: Collection[];
  heading?: string;
  headingDim?: string;
  subHeading?: string;
  showMoreHref?: string;
}

const SectionCollectionSlider2: FC<SectionCollectionSlider2Props> = ({
  className,
  collections,
  heading = 'Shop by department',
  headingDim = 'Explore the absolute',
  subHeading,
  showMoreHref = '/collections',
}) => {
  return (
    <div className={clsx(className)}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
              {heading}
            </h2>
            {headingDim && (
              <span className="mt-2 block text-neutral-600 dark:text-neutral-400">
                {headingDim}
              </span>
            )}
            {subHeading && (
              <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                {subHeading}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="container mx-auto px-4">
        <Carousel
          slideSize={{ base: '86%', md: '50%', lg: '33.333%', xl: '25%' }}
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
          {collections.map((collection) => (
            <Carousel.Slide key={collection.id}>
              <CollectionCard2 collection={collection} />
            </Carousel.Slide>
          ))}

          {/* Show More Slide */}
          <Carousel.Slide>
            <Link
              href={showMoreHref}
              className="group relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
            >
              <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-center items-center">
                <div className="relative flex text-neutral-900 dark:text-neutral-100">
                  <span className="text-lg font-semibold">More collections</span>
                  <IconArrowUpRight
                    className="absolute left-full ml-2 size-5 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                </div>
                <span className="mt-1 text-sm text-neutral-800 dark:text-neutral-300">
                  Show me more
                </span>
              </div>
            </Link>
          </Carousel.Slide>
        </Carousel>
      </div>
    </div>
  );
};

export default SectionCollectionSlider2;