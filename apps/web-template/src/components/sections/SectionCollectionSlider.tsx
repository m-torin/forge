'use client';

import { Carousel } from '@mantine/carousel';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { type FC } from 'react';

import type { Collection } from '@/data/types';
import CollectionCard3 from '@/components/ui/Header/CollectionCard3';

interface SectionCollectionSliderProps {
  className?: string;
  collections: Collection[];
  heading?: string;
  headingDim?: string;
  slideSize?: string;
  slideGap?: string;
}

const SectionCollectionSlider: FC<SectionCollectionSliderProps> = ({
  className = '',
  collections,
  heading = 'Discover more',
  headingDim = 'Good things are waiting for you',
  slideSize = '350px',
  slideGap = 'md',
}) => {
  return (
    <div className={className}>
      {/* Heading */}
      <div className="container mx-auto mb-12 px-4 lg:mb-14">
        <div className="text-center">
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
          slideSize={slideSize}
          slideGap={slideGap}
          align="start"
          loop
          nextControlIcon={<IconChevronRight size={20} />}
          previousControlIcon={<IconChevronLeft size={20} />}
          classNames={{
            control: 'bg-white shadow-lg border-0 text-neutral-900 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
            controls: 'opacity-0 group-hover:opacity-100 transition-opacity',
            root: 'group',
          }}
          breakpoints={[
            { maxWidth: 'md', slideSize: '300px' },
            { maxWidth: 'sm', slideSize: '280px', slideGap: 'sm' },
          ]}
        >
          {collections.map((collection) => (
            <Carousel.Slide key={collection.id}>
              <CollectionCard3 collection={collection} />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default SectionCollectionSlider;