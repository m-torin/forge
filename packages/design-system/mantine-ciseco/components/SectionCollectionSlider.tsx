'use client';

import useEmblaCarousel from 'embla-carousel-react';

import { type TCollection } from '../data/data';
import { useCarouselArrowButtons } from '../hooks/use-carousel-arrow-buttons';

import CollectionCard3 from './CollectionCard3';
import Heading from './Heading/Heading';

import type { EmblaOptionsType } from 'embla-carousel';

interface Props {
  className?: string;
  collections: TCollection[];
  emblaOptions?: EmblaOptionsType;
  heading?: string;
  headingDim?: string;
}

const SectionCollectionSlider = ({
  className,
  collections,
  emblaOptions = {
    slidesToScroll: 'auto',
  },
  heading = 'Discover more',
  headingDim = 'Good things are waiting for you',
}: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
  const { nextBtnDisabled, onNextButtonClick, onPrevButtonClick, prevBtnDisabled } =
    useCarouselArrowButtons(emblaApi);

  // Don't render anything if no collections
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Heading
        onClickNext={onNextButtonClick}
        onClickPrev={onPrevButtonClick}
        className="container mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50"
        hasNextPrev
        headingDim={headingDim}
        nextBtnDisabled={nextBtnDisabled}
        prevBtnDisabled={prevBtnDisabled}
      >
        {heading}
      </Heading>

      <div ref={emblaRef} className="embla pl-container">
        <div className="-ms-5 embla__container">
          {collections?.map((collection) => (
            <div
              key={collection.id}
              className="embla__slide basis-11/12 ps-5 sm:basis-2/3 lg:basis-3/7 xl:basis-2/5 2xl:basis-[34%]"
            >
              <CollectionCard3 collection={collection} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionCollectionSlider;
