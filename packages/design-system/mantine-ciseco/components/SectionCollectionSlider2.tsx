'use client';

import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Carousel } from '@mantine/carousel';
import clsx from 'clsx';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { type TCollection } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import CollectionCard2 from './CollectionCard2';
import Heading from './Heading/Heading';

export interface SectionSliderCategoriesProps extends Record<string, any> {
  className?: string;
  collections: TCollection[];
  heading?: string;
  headingDim?: string;
  subHeading?: string;
}

const SectionCollectionSlider2: FC<SectionSliderCategoriesProps> = ({
  className,
  collections,
  heading = 'Shop by department',
  headingDim = 'Explore the absolute',
  subHeading,
}) => {
  const localizeHref = useLocalizeHref();
  const [embla, setEmbla] = useState<any>(null);
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  // Collections prop is guaranteed to exist and have content
  // This component should not be rendered without collections

  return (
    <div className={clsx(className)}>
      <Heading
        description={subHeading}
        hasNextPrev
        headingDim={headingDim}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
      >
        {heading}
      </Heading>

      <Carousel
        classNames={{
          root: '-mx-5 sm:-mx-8',
          slide: 'px-5 sm:px-8',
        }}
        getEmblaApi={setEmbla}
        slideGap={{ base: 'xs', sm: 'md' }}
        slideSize={{ base: '86%', lg: '33.333333%', md: '50%', xl: '25%' }}
        withControls={false}
      >
        {collections.map((collection) => (
          <Carousel.Slide key={collection.id}>
            <CollectionCard2 collection={collection} />
          </Carousel.Slide>
        ))}

        <Carousel.Slide>
          <div className="group aspect-square relative w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100">
            <div>
              <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-center sm:items-center">
                <div className="relative flex text-neutral-900">
                  <span className="text-lg font-semibold">More collections</span>
                  <HugeiconsIcon
                    className="absolute left-full ms-2 size-5 group-hover:scale-110"
                    color="currentColor"
                    icon={ArrowUpRight01Icon}
                    size={24}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="mt-1 text-sm text-neutral-800">Show me more</span>
              </div>
            </div>
            <Link
              className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
              href={localizeHref('/collections/all')}
            />
          </div>
        </Carousel.Slide>
      </Carousel>
    </div>
  );
};

export default SectionCollectionSlider2;
