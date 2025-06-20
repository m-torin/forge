'use client';

import { Carousel } from '@mantine/carousel';
import { useState } from 'react';

import { type TCollection } from '../data/types';

import CollectionCard3 from './CollectionCard3';
import Heading from './Heading/Heading';

interface Props extends Record<string, any> {
  className?: string;
  collections: TCollection[];
  heading?: string;
  headingDim?: string;
}

const SectionCollectionSlider = ({
  className,
  collections,
  heading = 'Discover more',
  headingDim = 'Good things are waiting for you',
}: Props) => {
  const [embla, setEmbla] = useState<any>(null);
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  // Collections prop is guaranteed to exist and have content
  // This component should not be rendered without collections

  return (
    <div className={className}>
      <Heading
        className="container mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50"
        hasNextPrev
        headingDim={headingDim}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
      >
        {heading}
      </Heading>

      <div className="pl-container">
        <Carousel
          classNames={{
            root: '-mx-5',
            slide: 'px-5',
          }}
          getEmblaApi={setEmbla}
          slideGap="xs"
          slideSize={{
            '2xl': '34%',
            base: '91.666667%',
            lg: '42.857143%',
            sm: '66.666667%',
            xl: '40%',
          }}
          withControls={false}
        >
          {collections.map((collection: any) => (
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
